import { useEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { EASE_SCRUB, SCRUB, prefersReducedMotion } from "../../animation/motion-tokens";

/*
 * TRANSISI 6 — DUA BARIS YANG SALING MENUTUP.
 *
 * Baris atas datang dari kiri, baris bawah dari kanan, dan keduanya bertemu
 * di tengah. Ini transisi pembuka bagian yang paling mencolok, jadi hanya
 * dipakai sekali — di titik ketika halaman berbalik dari gelap ke terang.
 *
 * Terikat scroll, bukan waktu: berhenti di tengah scroll dan kedua baris
 * ikut berhenti setengah jalan, masih terpisah. Scroll balik memisahkannya
 * lagi. Itu sebabnya ia terasa seperti sesuatu yang dikendalikan, bukan
 * ditonton.
 *
 * Jarak awalnya dinyatakan dalam persen lebar elemen sendiri, jadi kata
 * sepanjang apa pun selalu keluar penuh dari tepi layar.
 */
export function SplitWords({
  top,
  bottom,
  className = "",
  lineClassName = "",
  distance = 70,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const topEl = el.querySelector(".top-word");
    const bottomEl = el.querySelector(".bottom-word");
    if (!topEl || !bottomEl) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: {
          trigger: el,
          start: "clamp(top 95%)",
          end: "clamp(center 80%)",
          scrub: SCRUB,
        },
      });

      tl.fromTo(topEl, { xPercent: -distance }, { xPercent: 0, duration: 1 }, 0);
      tl.fromTo(bottomEl, { xPercent: distance }, { xPercent: 0, duration: 1 }, 0);
    }, el);

    return () => ctx.revert();
  }, [top, bottom, distance]);

  return (
    /* `overflow-hidden` di sini menahan kedua kata selama mereka masih di luar
       bingkai — itu inti transisinya. Tapi ia memotong ke SEGALA arah, termasuk
       ke bawah, sehingga ekor huruf kata terakhir ikut terpangkas. Padding
       menambah ruang potongnya, margin negatif mengembalikan tata letaknya. */
    <div ref={ref} className={`overflow-hidden pb-[0.2em] mb-[-0.2em] ${className}`}>
      <div className={`top-word will-change-transform ${lineClassName}`}>{top}</div>
      <div className={`bottom-word will-change-transform ${lineClassName}`}>{bottom}</div>
    </div>
  );
}
