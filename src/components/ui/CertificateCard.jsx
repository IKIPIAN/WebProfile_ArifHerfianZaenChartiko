import { Suspense, lazy, useEffect, useRef, useState } from "react";

/*
 * pdf.js besarnya kira-kira sama dengan sisa aplikasi digabung, dan hanya
 * dipakai untuk pratinjau di kartu ini. Impornya baru berjalan setelah kartu
 * mendekati viewport — memasang <Suspense> saja tidak cukup, karena komponen
 * lazy tetap ikut termuat begitu dirender, dan di halaman tunggal semua kartu
 * dirender sejak awal.
 */
const CertificatePreviewCanvas = lazy(() =>
  import("./CertificatePreviewCanvas").then((module) => ({
    default: module.CertificatePreviewCanvas,
  })),
);

function useNearViewport(ref, margin = "600px") {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin, near]);

  return near;
}

/*
 * Kartu sertifikat: GAMBARNYA yang jadi isi utama, bukan keterangannya.
 *
 * Versi sebelumnya membalik urutan itu — pratinjaunya kecil dan sengaja
 * diburamkan, sementara judul dan subjudul memakan ruang besar di bawahnya.
 * Padahal yang ingin dilihat orang dari sebuah sertifikat adalah sertifikatnya.
 *
 * Karena itu di sini: pratinjau mengisi hampir seluruh kartu, tajam, dan
 * keterangannya menyusut jadi satu baris tipis di bawah. Sudutnya dibulatkan
 * dan garis tepinya nyaris hilang, jadi kartu menyatu dengan latar alih-alih
 * terbaca sebagai kotak berbingkai.
 */
export function CertificateCard({ title, subtitle, label, icon, pdfUrl }) {
  const ref = useRef(null);
  const near = useNearViewport(ref);

  return (
    <a
      ref={ref}
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={`Buka ${title}`}
      className="group block overflow-hidden rounded-2xl bg-surface shadow-[0_18px_40px_-28px_rgb(0_0_0/0.5)] transition-shadow duration-500 ease-brand hover:shadow-[0_24px_54px_-26px_rgb(0_0_0/0.6)]"
    >
      {/* Rasio tetap menjaga tinggi seluruh kartu seragam tanpa perlu memaksa
          tinggi lewat JS — dan itu yang membuat barisnya rata. */}
      <div className="relative aspect-4/3 overflow-hidden bg-white">
        {near && (
          <Suspense fallback={null}>
            <CertificatePreviewCanvas pdfUrl={pdfUrl} />
          </Suspense>
        )}

        {/* Ajakan buka muncul dari bawah saat disentuh. Ditaruh di atas gambar,
            bukan menggantikannya, supaya sertifikatnya tetap terlihat. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between gap-3 bg-black/70 px-4 py-3 text-white transition-transform duration-500 ease-brand group-hover:translate-y-0">
          <span className="-caption-small">Buka sertifikat</span>
          <span aria-hidden="true">↗</span>
        </div>
      </div>

      {/* Keterangan sengaja setipis mungkin: satu baris judul, satu penanda. */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <i className={`${icon} shrink-0 text-text-muted`} />
          <span className="-title-4 truncate" title={title}>
            {title}
          </span>
        </span>
        <span className="-caption-small shrink-0 text-text-muted">{label}</span>
      </div>

      {/* Subjudul tetap ada untuk pembaca layar dan mesin pencari, tapi tidak
          lagi memakan ruang di kartu. */}
      <span className="sr-only">{subtitle}</span>
    </a>
  );
}
