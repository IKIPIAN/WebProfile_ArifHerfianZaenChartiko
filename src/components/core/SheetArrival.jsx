import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../animation/gsap";
import {
  EASE_SCRUB,
  SCRUB_PIN,
  prefersReducedMotion,
} from "../../animation/motion-tokens";
import { DEVICE } from "../../animation/device-queries";

/*
 * LEMBARAN YANG MELAYANG MASUK.
 *
 * Layar mulai kosong, lalu sertifikat hanyut naik ke tempatnya dan menyusun
 * diri jadi kisi terpusat.
 *
 * ATURAN GERAKNYA — dan ini yang membedakannya dari versi sebelumnya yang
 * terlalu liar:
 *
 * 1. LEMBARAN SELALU TEGAK. Miringnya paling jauh 2,5°, dan mendarat menyisakan
 *    kurang dari 1°. Rotasi besar membuat sertifikat terbaca seperti kartu
 *    remi yang dilempar — sedangkan ini dokumen, dan dokumen berdiri tegak.
 *    Sisa miring yang tidak persis nol itu disengaja: bidang yang semuanya
 *    lurus sempurna terbaca kaku seperti tabel.
 *
 * 2. DATANG DARI BAWAH, BUKAN DARI SUDUT. Jalur diagonal dari pojok jauh
 *    memaksa mata melompat-lompat ke empat penjuru. Hanyut naik dengan sedikit
 *    geser samping terbaca sebagai lembaran yang diangkat ke tempatnya.
 *
 * 3. TIAP LEMBARAN PUNYA LAJU SENDIRI. Jarak tempuh dan saat berangkatnya
 *    berbeda-beda, jadi selama proses penggabungan mereka tidak pernah sejajar
 *    rapi — itulah yang membuatnya terasa seperti lembaran, bukan satu blok
 *    yang digeser.
 *
 * 4. TIDAK PERNAH BENAR-BENAR DIAM. Ada ayunan halus beberapa piksel yang
 *    terus berjalan, dengan fase berbeda tiap lembaran. Kecil sekali, tapi
 *    itulah beda antara "melayang" dan "ditempel".
 *
 * Ayunan dipasang pada elemen DI DALAM yang di-scrub, bukan pada elemen yang
 * sama. Dua tween pada properti yang sama akan saling menimpa, dan yang
 * kalah akan tersendat.
 */

/* Searah jarum jam dari kiri atas. Dinyatakan sebagai ARAH (-1/1), bukan
   piksel, supaya jaraknya bisa dihitung dari ukuran layar saat itu juga —
   dengan begitu lembaran selalu benar-benar mulai di luar pandangan, di
   viewport seukuran apa pun. */
const CORNERS = [
  { x: -1, y: -1 },
  { x: 1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
];

/*
 * GOYANGAN KERTAS — dipakai sama persis oleh versi desktop/tablet dan mobile,
 * cuma diberi daftar lembaran (`floats`) yang berbeda. Digerakkan ticker
 * dengan gelombang sinus, bukan tween berulang, karena harus bisa DIMATIKAN:
 * tween yoyo tak berhingga hanya bisa dihentikan mendadak di posisi mana pun
 * ia kebetulan berada, dan itu terlihat sebagai kartu yang tersentak. Dengan
 * sinus dikali satu nilai peredam (`wave.amp`), mematikannya berarti
 * menyusutkan amplitudonya ke nol — kartu melandai sendiri ke posisi rata.
 *
 * Tiap sumbu punya FREKUENSI SENDIRI yang tidak habis membagi satu sama lain.
 * Kalau naik-turun, miring, dan condongnya seirama, ketiganya kembali ke
 * titik awal bersamaan dan terbaca sebagai bandul mekanis — kesan kaku yang
 * mau dihindari.
 */
function createPaperWave(floats) {
  const wave = { amp: 1 };

  const sheets = floats.map((el, i) => {
    const ragam = ((i * 29) % 13) / 12;
    const arah = i % 2 === 0 ? 1 : -1;
    gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });
    return {
      el,
      arah,
      fase: ragam * Math.PI * 2,
      ay: 11 + ragam * 6,
      ar: 0.9 + ragam * 0.8,
      at: 3.5 + ragam * 3,
      ax: 2 + ragam * 2.4,
      /* Frekuensi dalam putaran per detik. */
      fy: 0.19 + ragam * 0.05,
      fr: 0.13 + ragam * 0.04,
      ft: 0.1 + ragam * 0.03,
    };
  });

  const TAU = Math.PI * 2;
  const tick = (waktu) => {
    const a = wave.amp;
    for (const s of sheets) {
      gsap.set(s.el, {
        y: Math.sin(waktu * s.fy * TAU + s.fase) * s.ay * s.arah * a,
        rotate:
          Math.sin(waktu * s.fr * TAU + s.fase * 1.7) * s.ar * s.arah * a,
        rotateY:
          Math.sin(waktu * s.ft * TAU + s.fase * 0.6) * s.at * s.arah * a,
        rotateX:
          Math.cos(waktu * s.ft * TAU + s.fase * 0.6) * s.ax * -s.arah * a,
      });
    }
  };
  gsap.ticker.add(tick);

  return { wave, stop: () => gsap.ticker.remove(tick) };
}

export function SheetArrival({ children, header = null, className = "" }) {
  const rootRef = useRef(null);
  const gridRef = useRef(null);
  const fitRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const grid = gridRef.current;
    const fit = fitRef.current;
    if (!root || !grid || !fit) return;
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    const createArrival = () => {
      const cards = gsap.utils.toArray(grid.querySelectorAll("[data-arrive]"));
      const floats = gsap.utils.toArray(grid.querySelectorAll("[data-float]"));
      if (!cards.length) return;

      /* Ambang keterbacaan: di bawah ini kartu terlalu kecil untuk dibaca, dan
         memaksakannya muat satu layar berhenti jadi keputusan desain. */
      const FLOOR = 0.72;

      const neededScale = () => {
        gsap.set(grid, { scale: 1 });
        const available = fit.clientHeight;
        /* offsetHeight, BUKAN scrollHeight: scrollHeight ikut menghitung
           luapan dari anak yang sedang di-transform — dan di sini seluruh
           kartu memang sedang melayang. Kisi 658px pernah terbaca 1307px
           karenanya, lalu diperkecil dua kali lipat dari yang perlu. */
        const needed = grid.offsetHeight;
        return needed > available ? available / needed : 1;
      };

      /* Selama masih bisa diperkecil tanpa melewati ambang keterbacaan, ini
         panggung satu layar yang di-pin. Kalau sertifikatnya sudah terlalu
         banyak untuk itu, panggung melepas pin dan tumbuh mengikuti isi. */
      const flow = neededScale() < FLOOR;
      root.classList.toggle("arrival-stage--flow", flow);

      const applyFit = () => {
        if (flow) {
          gsap.set(grid, { scale: 1 });
          return;
        }
        gsap.set(grid, {
          scale: neededScale(),
          transformOrigin: "center center",
        });
      };
      applyFit();

      /* Ditunda sampai ukurannya BERHENTI berubah: kartu memuat pratinjau PDF
         secara malas, dan selama itu tinggi kisi sempat melonjak. Menghitung
         pada tiap perubahan berarti nilai tersimpan adalah panggilan terakhir
         — yang bisa saja menangkap lonjakan itu. */
      let settleTimer = 0;
      const applyFitSettled = () => {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(applyFit, 180);
      };

      const ro = new ResizeObserver(applyFitSettled);
      ro.observe(fit);
      ro.observe(grid);

      /*
       * DUA BENTANGAN, BUKAN SATU — dan pemisahan inilah kuncinya.
       *
       * Panggung ini setinggi satu layar dan dikunci saat tepi atasnya
       * menyentuh tepi atas layar. Kalau pin dan animasi memakai pemicu yang
       * sama, keduanya terpaksa mulai di titik yang sama juga — artinya SATU
       * LAYAR PENUH scroll dihabiskan hanya untuk mendekat, dengan judul di
       * atas dan kisi yang masih kosong di bawahnya. Itu yang terbaca sebagai
       * "halaman putih dulu, baru sertifikatnya datang".
       *
       * Dengan pin berdiri sendiri, animasinya bebas mulai LEAD layar lebih
       * awal — saat panggung baru separuh masuk — sehingga lembaran sudah
       * berdatangan selagi halaman masih mendekat, dan tidak ada lagi jeda
       * kosong sebelum pertunjukannya dimulai.
       *
       * Bentangan animasi = LEAD + PIN, karena ia harus menempuh ancang-ancang
       * DAN seluruh masa terkunci.
       */
      const LEAD = 0.55; // layar, sebelum panggung terkunci
      const PIN = 1; // layar, selama panggung terkunci

      if (!flow) {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => "+=" + Math.round(window.innerHeight * PIN),
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          /* Pin menyisipkan spacer setinggi jarak pin dan mendorong turun semua
             isi di bawahnya, jadi ia harus dihitung lebih dulu daripada pemicu
             mana pun yang posisinya bergantung pada tata letak itu. */
          refreshPriority: 1,
        });
      }

      const tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: flow
          ? {
              trigger: root,
              start: "clamp(top 88%)",
              /* `bottom 65%` menuntut panggung nyaris habis dilewati sebelum
                 lembaran terakhir mendarat — kisinya baru utuh justru ketika
                 sudah keluar layar. */
              end: "clamp(bottom 92%)",
              scrub: SCRUB_PIN,
              invalidateOnRefresh: true,
            }
          : {
              trigger: root,
              start: `top ${LEAD * 100}%`,
              end: () => "+=" + Math.round(window.innerHeight * (LEAD + PIN)),
              scrub: SCRUB_PIN,
              invalidateOnRefresh: true,
            },
      });

      cards.forEach((card, i) => {
        /* Tiap lembaran berangkat dari sudut yang berbeda, berputar bergiliran
           searah jarum jam. Dengan begitu keempat penjuru selalu terpakai
           merata berapa pun jumlah sertifikatnya. */
        const sudut = CORNERS[i % CORNERS.length];
        const ragam = ((i * 41) % 17) / 16;

        tl.fromTo(
          card,
          {
            /*
             * Jarak ini disetel dari apa yang TERLIHAT, bukan dari seberapa
             * jauh terasa dramatis. Versi 0,55 lebar layar membuat lembaran
             * berangkat dari ~930px, dan akibatnya sebagian besar perjalanan
             * habis di luar pandangan — bagian tengah penggabungan tampak
             * nyaris kosong. Sepertiga layar sudah cukup untuk membuatnya
             * masuk dari luar bingkai, sambil menyisakan hampir seluruh
             * perjalanan untuk dinikmati.
             *
             * ROTASINYA tetap kecil: yang datang dari sudut adalah posisinya,
             * bukan kemiringannya. Sertifikat itu dokumen — ia tetap tegak
             * walau sedang melayang.
             */
            x: sudut.x * (window.innerWidth * 0.32 + ragam * 90),
            y: sudut.y * (window.innerHeight * 0.34 + ragam * 80),
            rotate: sudut.x * (1.2 + ragam * 1.3),
            scale: 0.95,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            /* Mendarat LURUS. Sisa miring memang menghidupkan bidang yang
               sedang bergerak, tapi begitu semuanya sudah di tempat, kisi yang
               tiap kartunya miring sendiri-sendiri terbaca sebagai tidak
               rapi — bukan sebagai gaya. */
            rotate: 0,
            scale: 1,
            opacity: 1,
            duration: 0.5 + ragam * 0.18,
            /*
             * SATU-SATUNYA TEMPAT ATURAN "easing harus none" DILANGGAR, dan
             * pelanggarannya disengaja.
             *
             * Aturan itu berlaku untuk pemetaan scroll secara keseluruhan, dan
             * itu tetap dipatuhi — timeline ini masih 1:1 dengan jarak scroll.
             * Yang diubah cuma bentuk gerak DI DALAM satu kedatangan.
             *
             * Alasannya ada di zona diam seperlima terakhir. Dengan `none`,
             * lembaran melaju pada kecepatan penuh lalu berhenti mendadak
             * begitu tweennya habis — nol ke penuh dalam satu titik. Saat
             * halaman di-scroll balik ke atas, lompatan kecepatan itulah yang
             * terasa: diam sama sekali, lalu tiba-tiba bergerak penuh.
             * `power2.out` membuatnya melambat sampai nol, jadi batas antara
             * "bergerak" dan "diam" tidak lagi punya sudut tajam.
             */
            ease: "power2.out",
          },
          /* Jeda antar lembaran sengaja lebih rapat daripada durasinya, jadi
             selalu ada beberapa lembaran melayang bersamaan. Kalau jedanya
             selebar durasi, mereka masuk satu-satu dan layar terasa sepi di
             antara kedatangan. */
          0.06 + i * 0.03,
        );
      });

      /* Goyangan kertas berjalan hanya selama lembaran masih berdatangan;
         peredamnya ikut scroll lewat tween `wave.amp` di bawah. */
      const { wave, stop } = createPaperWave(floats);

      /* Sedikit tumpang tindih dengan kedatangan lembaran terakhir, jadi
         goyangannya melandai persis saat kisi rapi. Diberi kurva karena alasan
         yang sama seperti kedatangan lembaran: peredaman linear berhenti
         mendadak di nol, dan saat di-scroll balik goyangannya menyala kembali
         pada amplitudo penuh dalam sekejap. */
      tl.to(wave, { amp: 0, duration: 0.18, ease: "power1.inOut" }, 0.66);

      /*
       * JEDA DIAM DI UJUNG — dan ini yang sebenarnya menjawab "kisinya baru
       * lengkap setelah halaman terpotong separuh".
       *
       * ScrollTrigger merentangkan SELURUH timeline sepanjang jarak scrub.
       * Selama timeline habis tepat di lembaran terakhir, "selesai" dan "boleh
       * lanjut" jatuh di titik yang sama — kisi utuh hanya ada satu frame
       * sebelum pin lepas. Tween kosong ini memakan seperlima terakhir rentang
       * tanpa menggerakkan apa pun, jadi lembaran mendarat di sekitar 80%
       * perjalanan dan sisanya dipakai untuk melihatnya lengkap.
       */
      tl.to({}, { duration: 0.2 }, 0.8);

      return () => {
        clearTimeout(settleTimer);
        ro.disconnect();
        stop();
        gsap.set([...cards, ...floats, grid], { clearProps: "all" });
      };
    };

    mm.add(DEVICE.desktop, createArrival);
    mm.add(DEVICE.tablet, createArrival);

    mm.add(DEVICE.mobile, () => {
      const cards = gsap.utils.toArray(grid.querySelectorAll("[data-arrive]"));
      const floats = gsap.utils.toArray(grid.querySelectorAll("[data-float]"));
      if (!cards.length) return;

      const animatedCount = Math.min(cards.length, 2);
      const animatedCards = cards.slice(0, animatedCount);
      const animatedFloats = floats.slice(0, animatedCount);

      const tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: {
          trigger: root,
          start: "top 90%",
          end: () => "+=" + Math.round(window.innerHeight * 0.9),
          scrub: SCRUB_PIN,
          invalidateOnRefresh: true,
        },
      });

      animatedCards.forEach((card, i) => {
        const arah = i % 2 === 0 ? -1 : 1;
        const ragam = ((i * 41) % 17) / 16;
        const offsetY = (ragam - 0.5) * 40;

        tl.fromTo(
          card,
          {
            x: arah * (window.innerWidth * 0.38 + ragam * 90),
            y: offsetY,
            rotate: arah * (1.2 + ragam * 1.3),
            scale: 0.95,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            duration: 0.5 + ragam * 0.18,
            ease: "power2.out",
          },
          0.06 + i * 0.03,
        );
      });

      const { wave, stop } = createPaperWave(animatedFloats);

      tl.to(wave, { amp: 0, duration: 0.18, ease: "power1.inOut" }, 0.66);
      tl.to({}, { duration: 0.2 }, 0.8);

      return () => {
        stop();
        gsap.set([...cards, ...animatedFloats, grid], { clearProps: "all" });
      };
    });

    return () => mm.revert();
  }, [children]);

  return (
    <div ref={rootRef} className={`arrival-stage ${className}`}>
      {/* Judul bab tinggal DI DALAM panggung, bukan di atasnya. Panggung ini
          di-pin setinggi satu layar penuh; kalau judulnya berada di luar, ia
          sudah tergulung ke luar layar tepat sebelum pin dimulai — dan yang
          tersisa selama lembaran berdatangan cuma layar kosong tanpa
          keterangan apa pun. Di dalam, ia ikut terkunci dan jadi jangkar. */}
      {header && <div className="arrival-head">{header}</div>}
      <div ref={fitRef} className="arrival-fit">
        <div ref={gridRef} className="arrival-grid">
          {children}
        </div>
      </div>
    </div>
  );
}
