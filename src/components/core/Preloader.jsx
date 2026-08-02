import { useEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { DURATION, EASE, prefersReducedMotion } from "../../animation/motion-tokens";
import { site } from "../../data/site";

/* Progress bar-nya mengikuti pemuatan aset yang sebenarnya, bukan timer palsu.
   MIN_VISIBLE menahan layar sebentar supaya bar tidak berkedip lewat pada
   koneksi cepat; MAX_WAIT memastikan satu aset yang menggantung tidak pernah
   mengunci seluruh situs. */
const MIN_VISIBLE_MS = 900;
const MAX_WAIT_MS = 5000;

/*
 * TRANSISI 10 — TIRAI YANG MEMBELAH.
 *
 * Preloader tidak menghilang dengan memudar, dan tidak pula terangkat sebagai
 * satu lembar. Ia terbelah di tengah: bilah atas naik, bilah bawah turun,
 * dan halaman terlihat dari celah yang melebar.
 *
 * Alasannya praktis, bukan gaya. Tirai satu arah menyeret mata mengikuti ke
 * mana tirai itu pergi, sehingga isi halaman baru dilihat setelah semuanya
 * hilang. Belahan di tengah menaruh gerak di dua tepi sekaligus dan
 * meninggalkan pusat layar diam — di situlah judul hero berada, jadi ia
 * langsung terbaca alih-alih terlewat.
 *
 * Isi preloader pergi lebih dulu, baru tirainya membuka. Kalau bersamaan,
 * ada momen ketika teks preloader dan judul hero saling bertindih.
 */
export function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const numRef = useRef(null);
  const contentRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      onComplete();
      return;
    }

    const bar = barRef.current;
    const startedAt = performance.now();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const unlock = () => {
      document.body.style.overflow = previousOverflow;
    };

    const jobs = [
      document.fonts?.ready ?? Promise.resolve(),
      ...Array.from(document.images).map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    ];

    /* Angka dan bar digerakkan satu nilai yang sama, jadi keduanya tidak
       mungkin menampilkan kemajuan yang berbeda. */
    const state = { value: 0 };
    const render = () => {
      gsap.set(bar, { scaleX: state.value });
      if (numRef.current) {
        numRef.current.textContent = String(Math.round(state.value * 100)).padStart(3, "0");
      }
    };

    let loaded = 0;
    const paint = () =>
      gsap.to(state, {
        value: loaded / jobs.length,
        duration: 0.4,
        ease: EASE,
        overwrite: true,
        onUpdate: render,
      });

    jobs.forEach((job) =>
      Promise.resolve(job).then(() => {
        loaded += 1;
        paint();
      }),
    );

    let settled = false;
    let exitTl;

    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);

      const heldFor = performance.now() - startedAt;

      exitTl = gsap
        .timeline({
          delay: Math.max(0, MIN_VISIBLE_MS - heldFor) / 1000,
          onComplete: () => {
            unlock();
            onComplete();
          },
        })
        .to(state, { value: 1, duration: 0.35, ease: EASE, onUpdate: render })
        .to(contentRef.current, { opacity: 0, y: -14, duration: 0.4, ease: EASE }, "+=0.15")
        /* Kedua bilah dipisah 0,06 detik: tepi yang berangkat serentak
           terbaca sebagai satu gambar yang retak, bukan dua benda. */
        .to(topRef.current, { yPercent: -100, duration: DURATION.exit + 0.2, ease: EASE }, "-=0.1")
        .to(
          bottomRef.current,
          { yPercent: 100, duration: DURATION.exit + 0.2, ease: EASE },
          "<0.06",
        );
    };

    const timeoutId = setTimeout(finish, MAX_WAIT_MS);
    Promise.all(jobs).then(finish);

    return () => {
      clearTimeout(timeoutId);
      exitTl?.kill();
      unlock();
    };
  }, [onComplete]);

  return (
    <div ref={rootRef} data-component="preloader">
      <div ref={topRef} className="shutter top" />
      <div ref={bottomRef} className="shutter bottom" />

      <div
        ref={contentRef}
        className="relative z-3 flex w-full max-w-[min(280px,62vw)] flex-col items-start gap-4"
      >
        <div className="flex w-full items-baseline justify-between">
          <p className="-caption-small text-text-muted">{site.firstName}</p>
          <p ref={numRef} className="-mono tabular-nums text-text">
            000
          </p>
        </div>
        <span className="progress-track">
          <span ref={barRef} className="progress-bar" />
        </span>
        <p className="-caption-small text-text-muted">Memuat</p>
      </div>
    </div>
  );
}
