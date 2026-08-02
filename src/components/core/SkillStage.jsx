import { useEffect, useMemo, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { EASE_SCRUB, SCRUB_PIN, prefersReducedMotion } from "../../animation/motion-tokens";

/*
 * PANGGUNG KEAHLIAN — tiga babak dalam satu bentangan scroll yang di-pin.
 *
 *   Babak 1  Kata-kata raksasa bertumpuk di tengah, menindih monolit
 *            yang berputar pelan.
 *   Babak 2  Kata-katanya PECAH. Tiap huruf terlempar keluar dari pusat
 *            sambil berputar dan mengecil, lalu hilang.
 *   Babak 3  Dari ruang yang ditinggalkan huruf-huruf itu, kartu keahlian
 *            masuk dari sisi kiri dan kanan.
 *
 * Kenapa urutannya begitu: babak 1 memberi kesan tunggal ("inilah bidangnya"),
 * babak 2 membongkarnya, babak 3 menyusunnya kembali sebagai keterangan yang
 * bisa dibaca. Ledakan di tengah bukan hiasan — ia yang mengosongkan layar
 * sehingga kartu punya tempat untuk datang.
 *
 * Arah lemparan tiap huruf DIHITUNG DARI POSISINYA, bukan diacak buta:
 * huruf di baris atas terlempar ke atas, huruf di tepi kanan terlempar ke
 * kanan. Acak murni menghasilkan gumpalan yang bergetar; arah keluar dari
 * pusat-lah yang membuatnya terbaca sebagai sesuatu yang meledak.
 *
 * Seluruhnya ter-scrub: berhenti di tengah, huruf ikut menggantung di udara.
 */

/* Acak yang bisa diulang. Nilai acak sungguhan berubah tiap render, sehingga
   pola ledakan ikut berubah setiap kali ScrollTrigger menyegarkan diri —
   dan itu terlihat sebagai huruf yang meloncat sendiri. */
function noise(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Glyph({ index }) {
  const rings = 4 + (index % 3);
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-12 w-12 shrink-0">
      {Array.from({ length: rings }, (_, i) => (
        <circle
          key={i}
          cx="32"
          cy="32"
          r={5 + i * (26 / rings)}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity={0.25 + i * 0.14}
        />
      ))}
    </svg>
  );
}

function Card({ item, side, order }) {
  return (
    <article data-card data-side={side} data-order={order} className="stage-card">
      <div className="mb-6 flex items-start justify-between gap-6">
        <h3 className="-h2 max-w-[9em]">{item.title}</h3>
        <Glyph index={order} />
      </div>
      <p className="-body-small text-text-muted">{item.description}</p>
    </article>
  );
}

export function SkillStage({ items, label, title, tagline }) {
  const rootRef = useRef(null);
  const slabRef = useRef(null);
  const wordsRef = useRef(null);
  const cardsRef = useRef(null);

  /* Selang-seling kiri/kanan, dengan urutan aslinya dibawa serta supaya jeda
     masuknya tetap mengikuti urutan keahlian, bukan urutan kolom. */
  const leftItems = items.filter((_, i) => i % 2 === 0).map((it, i) => ({ ...it, _order: i }));
  const rightItems = items.filter((_, i) => i % 2 === 1).map((it, i) => ({ ...it, _order: i }));

  /* Huruf dipecah sekali saja lewat useMemo. Memecahnya di dalam render
     membuat React membuang dan membuat ulang setiap <span> pada tiap render,
     dan GSAP kehilangan elemen yang sedang dianimasikannya. */
  const rows = useMemo(
    () =>
      items.map((item) => ({
        word: item.word,
        chars: [...item.word],
      })),
    [items],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 900px)", () => {
      const letters = gsap.utils.toArray(root.querySelectorAll("[data-letter]"));
      const cards = gsap.utils.toArray(root.querySelectorAll("[data-card]"));
      const rowEls = gsap.utils.toArray(root.querySelectorAll("[data-row]"));

      /*
       * KAPAN BABAK 3 SELESAI — dan ini inti dari penyetelan panggung ini.
       *
       * ScrollTrigger merentangkan SELURUH timeline sepanjang bentangan pin.
       * Selama kartu terakhir mendarat tepat di ujung timeline, "kartu lengkap"
       * dan "pin lepas" jatuh di titik yang sama: kisi keahlian yang utuh hanya
       * ada sekejap sebelum halaman berjalan lagi. Berapa pun bentangannya
       * dipanjangkan, rasanya tetap terburu di ujung — karena yang salah bukan
       * panjangnya, melainkan letak titik selesainya di dalam bentangan itu.
       *
       * Jadi titik selesainya yang ditetapkan lebih dulu (SETTLE), lalu panjang
       * timeline dihitung mundur darinya. Sisa 21% terakhir tidak menggerakkan
       * kartu sama sekali — itu jatah untuk membacanya dalam keadaan lengkap.
       *
       * Dihitung dari `order` yang benar-benar ada di DOM, bukan dari angka
       * tetap, supaya menambah atau mengurangi bidang keahlian tidak diam-diam
       * mengembalikan masalah yang sama.
       */
      const CARD_START = 0.5;
      const CARD_GAP = 0.08;
      const CARD_DUR = 0.26;
      const SETTLE = 0.79;

      const lastOrder = cards.reduce((max, c) => Math.max(max, Number(c.dataset.order) || 0), 0);
      const total = (CARD_START + lastOrder * CARD_GAP + CARD_DUR) / SETTLE;

      const tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          /* Dipangkas dari 2,4. Tetap lebih panjang daripada panggung
             sertifikat karena isinya tiga babak berurutan — monolit berputar,
             huruf pecah, kartu datang — dan memampatkannya sependek satu layar
             membuat ketiganya terbaca bertumpuk, bukan berurutan. */
          end: () => "+=" + Math.round(window.innerHeight * 1.6),
          pin: true,
          scrub: SCRUB_PIN,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          /* Pin menyisipkan spacer setinggi jarak pin dan mendorong turun
             semua isi di bawahnya. Tanpa prioritas ini, pemicu bagian-bagian
             berikutnya menghitung posisinya memakai tata letak sebelum spacer
             ada, lalu meleset persis sejauh jarak pin. */
          refreshPriority: 1,
        },
      });

      /* ── Babak 1: monolit berputar sepanjang seluruh bentangan ─────────
         Durasinya sengaja `total`, bukan angka tetap: monolit inilah yang
         mengisi jeda diam di ujung. Kalau ia ikut berhenti bersama kartu,
         21% terakhir terbaca sebagai halaman yang membeku, bukan sebagai
         kesempatan membaca. */
      tl.fromTo(
        slabRef.current,
        { rotate: -14, scale: 0.82 },
        { rotate: 12, scale: 1.04, duration: total },
        0,
      );

      /* Sedikit renggang sebelum pecah, supaya tumpukan katanya sempat
         terbaca sebagai satu kesatuan lebih dulu. */
      tl.fromTo(
        rowEls,
        { scale: 0.94, opacity: 0.75 },
        { scale: 1, opacity: 1, duration: 0.22, stagger: 0.03 },
        0,
      );

      /* ── Babak 2: pecah ──────────────────────────────────────────────── */
      const rowCount = rows.length;
      let seed = 0;

      rows.forEach((row, r) => {
        const len = row.chars.length;
        /* −1 di baris teratas, +1 di baris terbawah. */
        const vy = rowCount > 1 ? (r / (rowCount - 1)) * 2 - 1 : 0;

        row.chars.forEach((_, c) => {
          const el = letters[seed];
          if (!el) return;
          /* −1 di huruf paling kiri, +1 di huruf paling kanan. */
          const hx = len > 1 ? (c / (len - 1)) * 2 - 1 : 0;

          const n1 = noise(seed + 1);
          const n2 = noise(seed + 97);
          const n3 = noise(seed + 613);
          seed += 1;

          tl.to(
            el,
            {
              x: hx * (260 + n1 * 460),
              y: vy * (170 + n2 * 300) + (n3 - 0.5) * 160,
              rotate: (n1 - 0.5) * 240,
              scale: 0.35 + n2 * 0.75,
              opacity: 0,
              duration: 0.36,
              /* Tiap huruf berangkat pada saat sedikit berbeda — serempak
                 terbaca sebagai satu gambar yang memudar, bukan pecahan. */
              delay: n3 * 0.08,
            },
            0.24,
          );
        });
      });

      /* ── Babak 3: kartu masuk ────────────────────────────────────────── */
      cards.forEach((card) => {
        /* Arah masuk dibaca dari sisi tempat kartu itu berdiri, bukan dari
           urutannya di DOM — kartu di kiri harus datang dari kiri. */
        const fromLeft = card.dataset.side === "left";
        const order = Number(card.dataset.order) || 0;
        tl.fromTo(
          card,
          { x: fromLeft ? -190 : 190, y: 44, opacity: 0, scale: 0.94 },
          { x: 0, y: 0, opacity: 1, scale: 1, duration: CARD_DUR },
          CARD_START + order * CARD_GAP,
        );
      });

      return () => {
        gsap.set([...letters, ...cards, ...rowEls, slabRef.current], {
          clearProps: "all",
        });
      };
    });

    return () => mm.revert();
  }, [rows]);

  return (
    <div ref={rootRef} className="stage relative h-screen w-full overflow-hidden">
      <div aria-hidden="true" className="stage-fog" />

      {/* Monolit. Dibangun dari lapisan gradien dan derau SVG, bukan gambar —
          jadi tidak ada aset yang perlu diunduh dan ia tetap tajam di layar
          serapat apa pun. */}
      <div className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center">
        <div ref={slabRef} className="slab">
          <span className="slab-grain" />
          <span className="slab-sheen" />
        </div>
      </div>

      <p className="-caption-small absolute inset-x-0 top-24 z-4 text-center text-text-muted">
        {label}
      </p>

      {/* Tumpukan kata. Tiap huruf berdiri sendiri supaya bisa dilempar
          masing-masing saat pecah. */}
      <div
        ref={wordsRef}
        aria-hidden="true"
        className="stage-words pointer-events-none absolute inset-0 z-3 flex flex-col items-center justify-center"
      >
        {rows.map((row, r) => (
          <span
            key={row.word}
            data-row
            className={`stage-word flex justify-center will-change-transform ${
              r % 2 === 1 ? "stage-word--hollow" : ""
            }`}
          >
            {row.chars.map((char, c) => (
              <span key={c} data-letter className="inline-block will-change-transform">
                {char}
              </span>
            ))}
          </span>
        ))}
      </div>

      {/* Judul sungguhan untuk pembaca layar dan mesin pencari — tumpukan
          huruf di atas sudah ditandai aria-hidden karena ia gambar, bukan teks
          yang bisa dibaca berurutan. */}
      <h2 className="sr-only">{title}</h2>

      {/* Dua kolom yang menempel di tepi kiri dan kanan, menyisakan lorong di
          tengah untuk monolit. Kartu ganjil digeser turun supaya kedua kolom
          tidak sejajar rata — deretan yang sejajar sempurna membuat lorong
          tengahnya terbaca sebagai kolom kosong, bukan sebagai benda. */}
      <div ref={cardsRef} className="stage-cards">
        <div className="stage-col">
          {leftItems.map((item) => (
            <Card key={item.title} item={item} side="left" order={item._order} />
          ))}
        </div>
        <div className="stage-col stage-col-offset">
          {rightItems.map((item) => (
            <Card key={item.title} item={item} side="right" order={item._order} />
          ))}
        </div>
      </div>

      <p className="-caption-small absolute inset-x-0 bottom-16 z-4 text-center">
        <span aria-hidden="true" className="mr-2 text-accent">
          ✦
        </span>
        {tagline}
      </p>
    </div>
  );
}
