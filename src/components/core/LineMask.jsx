import { useEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import {
  DURATION,
  EASE,
  STAGGER,
  isVisibleOnLoad,
  prefersReducedMotion,
} from "../../animation/motion-tokens";
import { useAppReady } from "./ready-context";

/*
 * TRANSISI 1 — MASK NAIK.
 *
 * Dipakai untuk judul. Tiap baris berdiri di dalam kotak overflow-hidden dan
 * didorong dari bawah kotak itu, sehingga huruf seolah muncul dari balik
 * garis alih-alih memudar di tempat.
 *
 * Sengaja memakai translateY, bukan clip-path: transform hanya menyentuh
 * tahap komposit, sementara clip-path memaksa gambar ulang tiap frame. Pada
 * teks sebesar judul, selisihnya terlihat sebagai getaran tepi huruf.
 *
 * Elemen yang sudah terlihat saat halaman dibuka digerakkan waktu; yang masih
 * di bawah lipatan menunggu scroll. Dua-duanya harus ada — kalau semuanya
 * digerakkan scroll, isi paling atas tidak pernah terbuka.
 */
export function LineMask({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  delay = 0,
  stagger = STAGGER,
}) {
  const ref = useRef(null);
  const ready = useAppReady();

  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el) return;

    const inner = el.querySelectorAll("[data-anim='line-mask'] > span");
    if (!inner.length) return;

    if (prefersReducedMotion()) {
      gsap.set(inner, { yPercent: 0 });
      return;
    }

    const onLoad = isVisibleOnLoad(el);

    /*
     * `y: 0` di kedua ujung itu WAJIB, bukan hiasan.
     *
     * Keadaan awal ditulis di CSS sebagai transform supaya teks tidak sempat
     * berkedip sebelum GSAP mengambil alih. Tapi GSAP membaca transform yang
     * sudah menempel, mengurainya jadi offset piksel, lalu menumpuk yPercent
     * DI ATASNYA — sehingga saat animasi mendarat di yPercent 0, sisa piksel
     * dari CSS masih tertinggal dan barisnya berhenti di bawah topengnya.
     * Menyebut y secara eksplisit menghapus sisa itu.
     */
    const ctx = gsap.context(() => {
      gsap.fromTo(
        inner,
        { yPercent: 105, y: 0 },
        onLoad
          ? {
              yPercent: 0,
              y: 0,
              duration: DURATION.long,
              ease: EASE,
              delay,
              stagger,
            }
          : {
              yPercent: 0,
              y: 0,
              duration: DURATION.long,
              ease: EASE,
              stagger,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
      );
    }, el);

    return () => ctx.revert();
  }, [ready, delay, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} data-anim="line-mask" className={lineClassName}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
