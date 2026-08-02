import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../animation/gsap";
import { EASE, prefersReducedMotion } from "../../animation/motion-tokens";
import { numberedChapters } from "../../data/nav";
import { useScroller } from "./scroller-context";

/*
 * TRANSISI 9 — KATA YANG BERGANTI DI BILAH BAWAH.
 *
 * Satu kalimat tetap menempel di dasar layar, dan hanya kata terakhirnya yang
 * berganti mengikuti bagian yang sedang dibaca: "Dirancang untuk mengajar." →
 * "...untuk merancang." dan seterusnya.
 *
 * Ini menggantikan navbar. Fungsinya sama — memberi tahu posisi — tapi tanpa
 * meminta perhatian, dan tanpa deretan tautan yang harus dihindari mata.
 *
 * Pergantiannya bukan fade. Kata lama naik keluar dan kata baru menyusul dari
 * bawah, di dalam jendela setinggi satu baris. Fade antar dua kata berbeda
 * menghasilkan momen di mana keduanya terbaca sekaligus dan tak satu pun
 * terbaca jelas; gerak vertikal tidak pernah punya masalah itu.
 */
export function StatusBar() {
  const [index, setIndex] = useState(0);
  const [onPanel, setOnPanel] = useState(false);
  const wordRef = useRef(null);
  const prevIndex = useRef(0);
  const { scrollTo } = useScroller();

  /*
   * WARNA BILAH MENGIKUTI PITA DI BELAKANGNYA.
   *
   * Bilah ini `fixed`, jadi ia melayang DI LUAR pita nada mana pun — dan
   * karena itu ia tidak ikut membalik warna saat bagian terang lewat di
   * belakangnya. Di atas panel putih, teks abu terangnya nyaris hilang.
   *
   * AMBANGNYA BUKAN TEPI BAGIAN, MELAINKAN TENGAH GRADIEN PENGHUBUNG. Antara
   * pita gelap dan pita terang ada jembatan gradien setinggi setengah layar.
   * Kalau warnanya baru berganti saat tepi bagian lewat, bilahnya sudah lebih
   * dulu berdiri di atas latar yang nyaris putih sepanjang jembatan itu —
   * persis keadaan yang mau diperbaiki, cuma bergeser tempatnya.
   *
   * Bilah duduk di sekitar 96% tinggi layar. Supaya pergantian jatuh tepat di
   * tengah gradien pada ketinggian itu: 96% dikurangi 25% (separuh gradien)
   * = 71%, dan tepi atas panel berada setengah layar di bawahnya = 121%.
   */
  useEffect(() => {
    const panels = gsap.utils.toArray('[data-band="panel"]');
    if (!panels.length) return;

    const trigger = ScrollTrigger.create({
      trigger: panels[0],
      endTrigger: panels[panels.length - 1],
      start: "top 121%",
      end: "bottom 71%",
      onToggle: (self) => setOnPanel(self.isActive),
    });

    return () => trigger.kill();
  }, []);

  useEffect(() => {
    const triggers = numberedChapters.map((chapter, i) => {
      const el = document.getElementById(chapter.id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        /* Ambang di tengah layar: bagian dianggap aktif begitu ia melewati
           titik pandang, bukan begitu tepi atasnya menyentuh layar. Tanpa itu
           penanda berkedip bolak-balik di batas antar bagian. */
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && setIndex(i),
      });
    });

    return () => triggers.forEach((t) => t?.kill());
  }, []);

  useEffect(() => {
    const el = wordRef.current;
    if (!el || prefersReducedMotion()) return;
    if (prevIndex.current === index) return;

    const down = index > prevIndex.current;
    prevIndex.current = index;

    /* Arah masuknya mengikuti arah perpindahan bagian: maju berarti kata baru
       datang dari bawah, mundur berarti dari atas. Arah yang tetap akan
       terasa salah begitu pengunjung men-scroll balik. */
    gsap.fromTo(
      el,
      { yPercent: down ? 110 : -110 },
      { yPercent: 0, duration: 0.55, ease: EASE },
    );
  }, [index]);

  const active = numberedChapters[index];
  const total = String(numberedChapters.length).padStart(2, "0");
  const current = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`status-bar pointer-events-none fixed inset-x-0 bottom-5 z-40 px-6 nav:px-10 ${
        onPanel ? "status-bar--panel" : ""
      }`}
    >
      <div className="flex items-end justify-between gap-6">
        <button
          type="button"
          onClick={() => scrollTo(`#${active.id}`)}
          className="pointer-events-auto group flex items-baseline gap-2 text-left"
        >
          <span className="-caption-small text-text-muted transition-colors duration-500 ease-brand">
            {current}/{total}
          </span>
          {/* Jendela setinggi satu baris; kata di dalamnya yang bergerak. */}
          <span className="relative block h-[1.15em] overflow-hidden">
            <span ref={wordRef} className="-caption block whitespace-nowrap will-change-transform">
              {active.label}
            </span>
          </span>
        </button>

        <div className="hidden nav:flex items-center gap-3">
          {numberedChapters.map((chapter, i) => (
            <button
              key={chapter.id}
              type="button"
              aria-label={chapter.label}
              onClick={() => scrollTo(`#${chapter.id}`)}
              className={`chapter-dot group pointer-events-auto relative flex h-6 w-6 cursor-pointer items-center justify-center ${
                i === numberedChapters.length - 1 ? "chapter-dot--last" : ""
              }`}
            >
              {/* Nama bagiannya muncul tepat di atas garis saat disentuh.
                  `aria-hidden` karena tombolnya sudah punya aria-label dengan
                  teks yang sama — tanpa itu pembaca layar menyebutnya dua kali. */}
              <span aria-hidden="true" className="chapter-tip -caption-small">
                {chapter.label}
              </span>

              {/* Titik kecil yang memanjang jadi garis saat aktif — perubahan
                  bentuk terbaca lebih cepat daripada perubahan warna saja.
                  Saat disentuh ia ikut memanjang sedikit, jadi ada tanggapan
                  bahkan sebelum labelnya sempat muncul. */}
              <span
                className={`block h-px transition-all duration-500 ease-brand ${
                  i === index
                    ? "w-6 bg-text"
                    : "w-2 bg-line group-hover:w-4 group-hover:bg-text-muted"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
