import { useLayoutEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { CLIP, EASE, SCRUB, prefersReducedMotion } from "../../animation/motion-tokens";
import { useAppReady } from "./ready-context";

/*
 * Dua lapis, pola image-reveal Floema: sebuah bidang warna mengisi area dari
 * atas ke bawah, lalu meluncur terus ke bawah dan keluar sambil gambarnya
 * terbuka di belakangnya. Yang terbaca mata adalah satu pita warna yang
 * menyapu turun dan meninggalkan gambar — bukan gambar yang memudar masuk.
 *
 * Sama seperti ScrubReveal, seluruh urutannya terikat posisi scroll: berhenti
 * di tengah berarti pita warnanya ikut berhenti di tengah.
 */
export function RevealImage({ src, alt, delay = 0, className = "", imgClassName = "", ...rest }) {
  const ref = useRef(null);
  const ready = useAppReady();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const media = el.querySelector(".media");

    if (prefersReducedMotion()) {
      gsap.set(media, { clipPath: CLIP.visible });
      return;
    }

    if (!ready) return;

    /* Sama seperti ScrubReveal: gambar yang sudah terlihat saat halaman dibuka
       tidak punya jarak scroll untuk menggerakkan animasinya, sehingga pita
       warnanya akan berhenti di tengah dan menutupi separuh gambar. */
    const visibleOnLoad = el.getBoundingClientRect().top < window.innerHeight * 0.9;

    const ctx = gsap.context(() => {
      const bg = el.querySelector(".bg");

      const tl = gsap.timeline(
        visibleOnLoad
          ? { defaults: { ease: EASE }, delay }
          : {
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: el,
                start: "clamp(top 90%)",
                /* Selesai kira-kira saat gambarnya baru saja utuh masuk
                   pandangan. `bottom 55%` menahan penyingkapan sampai gambar
                   nyaris habis dilewati — separuh perjalanannya tidak pernah
                   sempat dilihat sebagai gambar yang lengkap. */
                end: "clamp(bottom 88%)",
                scrub: SCRUB,
              },
            },
      );

      const unit = visibleOnLoad ? 1 : 0.6;
      tl.to(bg, { clipPath: CLIP.visible, duration: unit * 0.7 })
        .to(bg, { clipPath: CLIP.collapsedBottom, duration: unit })
        .to(media, { clipPath: CLIP.visible, duration: unit }, "<");
    }, el);

    return () => ctx.revert();
  }, [ready, delay]);

  return (
    <div ref={ref} data-component="image-reveal" className={className} {...rest}>
      <span className="bg" aria-hidden="true" />
      <img src={src} alt={alt} className={`media ${imgClassName}`} />
    </div>
  );
}
