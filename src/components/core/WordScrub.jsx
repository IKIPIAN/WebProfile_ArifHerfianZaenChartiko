import { useEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { EASE_SCRUB, prefersReducedMotion } from "../../animation/motion-tokens";

/*
 * TRANSISI 7 — PARAGRAF YANG MENYALA KATA DEMI KATA.
 *
 * Seluruh kalimat sudah terbaca sejak awal, tapi redup. Saat di-scroll,
 * katanya menyala satu per satu dari kiri ke kanan mengikuti arah baca.
 *
 * Ini kebalikan dari reveal biasa, dan dipakai persis di bagian pernyataan
 * diri. Reveal yang menyembunyikan teks memaksa pengunjung menunggu sebelum
 * boleh membaca; di sini teksnya justru ditawarkan lebih dulu, dan scroll
 * hanya mengatur temponya. Untuk satu paragraf yang memang ingin dibaca,
 * itu jauh lebih ramah.
 *
 * Jarak antar kata dibuat pendek (0,25 dari total) sehingga selalu ada
 * beberapa kata yang setengah menyala sekaligus — kalau tiap kata menunggu
 * kata sebelumnya selesai, hasilnya terbaca patah-patah seperti mesin tik.
 */
export function WordScrub({ text, as: Tag = "p", className = "" }) {
  const ref = useRef(null);
  const words = text.split(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const spans = el.querySelectorAll("[data-word]");
    if (!spans.length) return;

    if (prefersReducedMotion()) {
      gsap.set(spans, { opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        spans,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: EASE_SCRUB,
          stagger: { each: 0.25 / spans.length, from: "start" },
          scrollTrigger: {
            trigger: el,
            start: "clamp(top 82%)",
            end: "clamp(bottom 80%)",
            scrub: 0.4,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [text]);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={i} data-word className="inline-block opacity-[0.16]">
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
