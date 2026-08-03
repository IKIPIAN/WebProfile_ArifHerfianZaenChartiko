import { useEffect, useMemo, useRef } from "react";
import { gsap } from "../../animation/gsap";
import {
  EASE_SCRUB,
  SCRUB_PIN,
  prefersReducedMotion,
} from "../../animation/motion-tokens";
import { DEVICE } from "../../animation/device-queries";

/*
 * PANGGUNG KEAHLIAN — tiga babak dalam satu bentangan scroll yang di-pin.
 *
 *   Babak 1  Kata-kata raksasa bertumpuk di tengah, menindih monolit
 *            yang berputar pelan.
 *   Babak 2  Kata-katanya PECAH. Tiap huruf terlempar keluar dari pusat
 *            sambil berputar dan mengecil, lalu hilang.
 *   Babak 3  Dari ruang yang ditinggalkan huruf-huruf itu, kartu keahlian
 *            masuk dan menyusun diri menjadi gugus 2×2 yang berpusat di
 *            tengah layar.
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

/*
 * Titik berangkat kartu, dinyatakan sebagai ARAH (-1/1), bukan piksel.
 *
 * Dulu kartu menempel di luar keempat sudut monolit, jadi offset-nya dihitung
 * dari posisi sudut itu. Kini kartu duduk sebagai gugus 2×2 yang berpusat,
 * jadi keempat kartu berangkat dari arah luarnya sendiri menuju selnya di
 * gugus — kiri-atas mendekat dari kiri atas, dan seterusnya.
 */
const CORNER_OFFSET = {
  "top-left": { x: -1, y: -1 },
  "top-right": { x: 1, y: -1 },
  "bottom-left": { x: -1, y: 1 },
  "bottom-right": { x: 1, y: 1 },
};

const EXPLODE_AT = 0.24;
const SLAB_PEAK = 1.38;

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

function Card({ item, position, order }) {
  return (
    <article
      data-card
      data-position={position}
      data-order={order}
      className={`stage-card stage-card--${position}`}
    >
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

  const positionedItems = useMemo(
    () =>
      items.map((item, idx) => ({
        ...item,
        _order: idx,
        _position:
          ["top-left", "top-right", "bottom-left", "bottom-right"][idx] ||
          (idx % 2 === 0 ? "top-left" : "top-right"),
      })),
    [items],
  );

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

    const mm = gsap.matchMedia(root);

    /*
     * Satu fungsi animasi untuk ketiga breakpoint, dan koreografinya SAMA
     * PERSIS di mana pun: panggung dikunci, kata pecah, kartu menyusun diri.
     *
     * Panggung ini pernah dilepas kuncinya di ponsel supaya tumpukan kartu
     * yang memanjang tetap terjangkau — dan itu keliru. Tanpa kunci, keempat
     * kartu memakai satu pemicu bersama sementara letaknya berjauhan secara
     * vertikal, jadi kartu bawah selesai bergerak jauh sebelum pembaca sampai
     * ke sana. Persis kegagalan yang sudah dicatat di HingeCards.jsx: tidak
     * ada yang tersisa untuk dilihat. Jawabannya bukan melepas kunci,
     * melainkan meringkas kartunya supaya keempatnya muat satu layar.
     *
     * Yang tersisa berbeda hanya `distFactor` — seberapa jauh kartu berangkat,
     * dan itu pun sebanding dengan ukuran kartunya sendiri.
     */
    const createAnimation = (distFactor) => {
      const letters = gsap.utils.toArray(
        root.querySelectorAll("[data-letter]"),
      );
      const cards = gsap.utils.toArray(root.querySelectorAll("[data-card]"));
      const rowEls = gsap.utils.toArray(root.querySelectorAll("[data-row]"));
      if (!letters.length || !cards.length || !rowEls.length) return;

      /*
       * MEMPERKECIL AGAR MUAT — panggung ini terkunci setinggi satu layar dan
       * `overflow: hidden`, jadi apa pun yang melebihi tingginya tidak sekadar
       * meluber: ia hilang, dan tidak ada cara untuk menggulungnya.
       *
       * Pada ponsel pendek gugus 2x2 memang melebihi ruang yang tersisa —
       * kurang 15px di layar 667px, 100px di 568px. Bukan karena tata letaknya
       * salah, melainkan karena empat keterangan sepanjang ±130 karakter
       * memang menuntut ruang segitu. Ambangnya tidak bisa ditulis sebagai
       * media query: ia bergantung pada berapa baris yang diambil keterangan
       * pada lebar kolom saat itu, jadi menambah kartu atau memperpanjang satu
       * kalimat akan menggesernya diam-diam. Maka diukur, bukan ditebak.
       *
       * Lantainya 0,7: di bawah itu kartunya berhenti terbaca, dan memaksa
       * muat berhenti jadi keputusan desain.
       */
      const orbit = root.querySelector(".stage-orbit");
      const cardsBox = cardsRef.current;

      const fitOrbit = () => {
        if (!orbit || !cardsBox) return;
        gsap.set(orbit, { scale: 1 });
        const cs = getComputedStyle(cardsBox);
        const available =
          cardsBox.clientHeight -
          parseFloat(cs.paddingTop) -
          parseFloat(cs.paddingBottom);
        /* offsetHeight, BUKAN getBoundingClientRect: yang terakhir ikut
           menghitung skala yang baru saja dipasang, jadi tiap pengukuran
           ulang akan mengecil menumpuk. */
        const needed = orbit.offsetHeight;
        if (!available || !needed) return;
        const scale = needed > available ? Math.max(available / needed, 0.7) : 1;
        gsap.set(orbit, { scale, transformOrigin: "center center" });
      };

      fitOrbit();

      /*
       * Tinggi kartu berubah setiap teks mengalir ulang — putar layar, atau
       * bilah alamat ponsel yang menyusut saat digulung.
       *
       * DITUNDA sampai ukurannya BERHENTI berubah. Memasang pin menyisipkan
       * spacer dan mengubah tata letak beberapa kali dalam satu rentetan;
       * menghitung pada tiap perubahan berarti nilai yang tersimpan adalah
       * panggilan terakhir — yang bisa saja menangkap ukuran sesaat, dan
       * gugusnya berhenti pada skala yang meleset. Alasan yang sama seperti
       * `applyFitSettled` di SheetArrival.jsx.
       */
      let fitTimer = 0;
      const fitSettled = () => {
        clearTimeout(fitTimer);
        fitTimer = setTimeout(fitOrbit, 180);
      };

      const ro = new ResizeObserver(fitSettled);
      ro.observe(cardsBox);

      const CARD_START = 0.5;
      const CARD_GAP = 0.08;
      const CARD_DUR = 0.26;
      const SETTLE = 0.79;

      const lastOrder = cards.reduce(
        (max, c) => Math.max(max, Number(c.dataset.order) || 0),
        0,
      );
      const total = (CARD_START + lastOrder * CARD_GAP + CARD_DUR) / SETTLE;

      const tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => "+=" + Math.round(window.innerHeight * 1.6),
          pin: true,
          scrub: SCRUB_PIN,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      });

      tl.fromTo(
        slabRef.current,
        { rotate: -14, scale: 0.82 },
        { rotate: -8, scale: 0.9, duration: EXPLODE_AT },
        0,
      );

      tl.to(
        slabRef.current,
        { rotate: 6, scale: SLAB_PEAK, duration: 0.32, ease: "power2.out" },
        EXPLODE_AT,
      );

      tl.to(
        slabRef.current,
        {
          rotate: 12,
          scale: SLAB_PEAK + 0.04,
          duration: Math.max(total - EXPLODE_AT - 0.32, 0.1),
        },
        EXPLODE_AT + 0.32,
      );

      tl.fromTo(
        rowEls,
        { scale: 0.94, opacity: 0.75 },
        { scale: 1, opacity: 1, duration: 0.22, stagger: 0.03 },
        0,
      );

      const rowCount = rows.length;
      let seed = 0;

      rows.forEach((row, r) => {
        const len = row.chars.length;
        const vy = rowCount > 1 ? (r / (rowCount - 1)) * 2 - 1 : 0;

        row.chars.forEach((_, c) => {
          const el = letters[seed];
          if (!el) return;
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
              delay: n3 * 0.08,
            },
            EXPLODE_AT,
          );
        });
      });

      cards.forEach((card) => {
        const offset = CORNER_OFFSET[card.dataset.position] || { x: 0, y: 0 };
        const order = Number(card.dataset.order) || 0;
        /*
         * Jarak berangkat kartu. Dulu piksel tetap; sekarang dinyatakan dalam
         * arah (-1/1) dan diubah menjadi jarak yang proporsional terhadap
         * ukuran kartu — cukup jauh untuk terasa masuk dari luar gugus, tanpa
         * sampai keluar dari panggung (yang terpotong oleh overflow hidden).
         */
        const distX = card.offsetWidth * distFactor;
        const distY = card.offsetHeight * distFactor;
        tl.fromTo(
          card,
          {
            x: offset.x * distX,
            y: offset.y * distY,
            opacity: 0,
            scale: 0.88,
          },
          {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1,
            duration: CARD_DUR,
            ease: "power2.out",
          },
          CARD_START + order * CARD_GAP,
        );
      });

      return () => {
        clearTimeout(fitTimer);
        ro.disconnect();
        gsap.set([...letters, ...cards, ...rowEls, slabRef.current, orbit], {
          clearProps: "all",
        });
      };
    };

    /* Jarak berangkat kartu proporsional terhadap ukurannya sendiri (bukan
       piksel tetap) — layar sempit dapat faktor lebih kecil supaya kartu
       tidak sampai keluar dari panggung yang overflow-nya disembunyikan. */
    mm.add(DEVICE.desktop, () => createAnimation(0.9));
    mm.add(DEVICE.tablet, () => createAnimation(0.9));
    mm.add(DEVICE.mobile, () => createAnimation(0.8));

    return () => mm.revert();
  }, [rows]);

  return (
    <div
      ref={rootRef}
      className="stage relative h-auto sm:h-screen w-full overflow-hidden"
    >
      <div aria-hidden="true" className="stage-fog" />

      {/* Kanvas desain yang melayang. Dibangun dari lapisan gradien, kisi, dan
          derau SVG — bukan gambar. Jadi tidak ada aset yang perlu diunduh, dan
          ia tetap tajam di layar serapat apa pun. */}
      <div className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center">
        {/* Urutannya menentukan: butiran jadi permukaan paling bawah, kisi
            tergambar di atasnya, dan sapuan cahaya menimpa keduanya —
            sebagaimana cahaya jatuh pada kaca, bukan terselip di bawahnya. */}
        <div ref={slabRef} className="slab">
          <span className="slab-grain" />
          <span className="slab-grid" />
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
              <span
                key={c}
                data-letter
                className="inline-block will-change-transform"
              >
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

      {/* Gugus kartu 2×2 yang berpusat di tengah layar. */}
      <div ref={cardsRef} className="stage-cards">
        <div className="stage-orbit">
          {positionedItems.map((item) => (
            <Card
              key={item.title}
              item={item}
              position={item._position}
              order={item._order}
            />
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
