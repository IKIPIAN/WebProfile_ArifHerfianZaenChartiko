import { useLayoutEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { CLIP, DURATION, EASE, SCRUB, prefersReducedMotion } from "../../animation/motion-tokens";
import { useAppReady } from "./ready-context";

/*
 * Reveal yang terikat posisi scroll, bukan dipicu lalu jalan sendiri.
 *
 * Bedanya mendasar. Versi terpicu (`once: true`) hanya menunggu elemen masuk
 * viewport, lalu memutar animasi sampai habis dengan durasinya sendiri —
 * berhenti men-scroll tidak menghentikan apa pun, dan scroll mundur tidak
 * mengembalikan apa pun. Versi ini memetakan kemajuan animasi ke jarak scroll:
 * berhenti di tengah berarti tetap di tengah, mundur berarti terputar balik.
 *
 * Karena kecepatan datang dari gerakan scroll itu sendiri, easing-nya harus
 * "none". Memberi kurva di atas scrub berarti memasang dua sumber pengaturan
 * waktu pada satu gerakan, dan hasilnya terasa melawan tangan.
 */
export function ScrubReveal({
  as: Tag = "div",
  /* Jendelanya sengaja pendek dan rendah. Titik akhir `top 58%` berarti isi
     baru utuh setelah tepi atasnya melewati tengah layar — dan pada bagian
     yang tinggi itu terbaca sebagai halaman yang sudah terpotong separuh
     sementara isinya masih menyusul. `top 72%` menyelesaikannya selagi bagian
     itu masih di sepertiga bawah, jadi sisa scroll-nya membaca isi yang sudah
     lengkap, bukan isi yang sedang dirakit. */
  start = "top 95%",
  end = "top 72%",
  rise = 40,
  delay = 0,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);
  const ready = useAppReady();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { clipPath: CLIP.visible, y: 0 });
      return;
    }

    if (!ready) return;

    /*
     * Elemen yang SUDAH terlihat saat halaman dibuka tidak boleh di-scrub.
     * Scrub mengambil kemajuannya dari jarak scroll, dan di puncak dokumen
     * jarak itu belum ada — jendela pemicunya terjepit jadi nol panjang, lalu
     * progresnya mentok di nol dan isinya tidak pernah terbuka sama sekali.
     * Untuk elemen begini satu-satunya penggerak yang masuk akal adalah waktu.
     */
    const visibleOnLoad = el.getBoundingClientRect().top < window.innerHeight * 0.92;

    const ctx = gsap.context(() => {
      if (visibleOnLoad) {
        gsap.fromTo(
          el,
          { clipPath: CLIP.collapsedTop, y: rise },
          {
            clipPath: CLIP.visible,
            y: 0,
            duration: DURATION.reveal,
            delay,
            ease: EASE,
          },
        );
        return;
      }

      gsap.fromTo(
        el,
        { clipPath: CLIP.collapsedTop, y: rise },
        {
          clipPath: CLIP.visible,
          y: 0,
          ease: "none",
          /* clamp() menahan jendela pemicu tetap di dalam rentang scroll yang
             benar-benar ada. Tanpa itu, elemen di dasar dokumen — isi footer —
             punya titik akhir yang letaknya di luar jangkauan scroll, sehingga
             animasinya tidak pernah bisa selesai dan teksnya tinggal terpotong
             selamanya. */
          scrollTrigger: {
            trigger: el,
            start: `clamp(${start})`,
            end: `clamp(${end})`,
            scrub: SCRUB,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [ready, start, end, rise, delay]);

  return (
    <Tag ref={ref} data-component="scrub-reveal" className={className} {...rest}>
      {children}
    </Tag>
  );
}
