import { useEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { EASE, prefersReducedMotion } from "../../animation/motion-tokens";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/*
 * TRANSISI 3 — ODOMETER.
 *
 * Angka tidak muncul begitu saja: tiap digitnya adalah kolom 0–9 yang
 * digulung di dalam jendela setinggi satu baris, seperti argo taksi.
 *
 * Detail yang menentukan: tiap kolom punya durasi yang sedikit berbeda
 * (semakin ke kanan semakin lama). Kalau semua kolom mendarat bersamaan,
 * hasilnya terbaca sebagai satu gambar yang digeser. Perbedaan kecil itulah
 * yang membuatnya terbaca sebagai mesin dengan beberapa roda.
 *
 * Karakter non-digit (titik desimal, tanda +) dibiarkan diam di tempat.
 */
export function Odometer({ value, className = "", delay = 0 }) {
  const ref = useRef(null);
  const chars = String(value).split("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cols = el.querySelectorAll(".odometer-col");
    if (!cols.length) return;

    if (prefersReducedMotion()) {
      cols.forEach((col) => {
        gsap.set(col, { yPercent: -10 * Number(col.dataset.target) });
      });
      return;
    }

    const ctx = gsap.context(() => {
      cols.forEach((col, i) => {
        const target = Number(col.dataset.target);
        gsap.fromTo(
          col,
          { yPercent: 0 },
          {
            yPercent: -10 * target,
            duration: 1.5 + i * 0.16,
            ease: EASE,
            delay,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [value, delay]);

  return (
    <span ref={ref} className={`odometer-value ${className}`}>
      {/* Nilai sebenarnya, hanya untuk pembaca layar dan penyalinan teks.
          Tiap kolom di bawah memuat SELURUH digit 0–9 dan hanya satu yang
          terlihat lewat overflow — jadi tanpa salinan utuh ini, menyalin
          "3.62" menghasilkan deretan angka penuh, dan pembaca layar
          membacakan sepuluh digit per angka. */}
      <span className="sr-only">{String(value)}</span>

      {chars.map((char, i) => {
        if (!/\d/.test(char)) {
          return (
            <span key={i} aria-hidden="true" className="select-none">
              {char}
            </span>
          );
        }
        return (
          /* Kolomnya memuat sepuluh digit dan hanya satu yang terlihat, jadi
             ia harus dikecualikan dari seleksi — kalau tidak, menyalin angka
             ini menghasilkan seluruh deret 0–9. Yang tersalin cukup nilai
             utuh di atas. */
          <span key={i} className="odometer select-none" aria-hidden="true">
            {/* Tinggi jendela dikunci 1em lewat CSS dan tiap digit ber-
                line-height 1, jadi satu langkah tepat = 10% tinggi kolom.
                Tidak ada tinggi baris yang perlu ditebak dari JS. */}
            <span className="odometer-col" data-target={char}>
              {DIGITS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
