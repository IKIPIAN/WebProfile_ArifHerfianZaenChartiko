import { useEffect, useRef } from "react";
import { pdfjsLib } from "../../lib/pdfWorker";

export function CertificatePreviewCanvas({ pdfUrl, className = "" }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfUrl) return;

    let cancelled = false;

    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((dokumen) => dokumen.getPage(1))
      .then((halaman) => {
        if (cancelled) return;

        /*
         * Skala render dihitung dari lebar kotak yang sebenarnya DIKALI
         * kerapatan layar — bukan dipatok 1.
         *
         * Pada scale 1, satu titik PDF jadi satu piksel kanvas, lalu CSS
         * meregangkannya sampai selebar kartu. Di layar biasa saja itu sudah
         * lembek, dan di layar retina jadi dua kali lebih lembek lagi. Karena
         * sertifikat ini memang untuk DIBACA, ketajamannya menentukan apakah
         * kartunya berguna atau cuma tempelan.
         *
         * Dibatasi 2,5 supaya berkas PDF berukuran besar tidak menghasilkan
         * kanvas raksasa yang membebani memori.
         */
        const kotak = canvas.parentElement?.getBoundingClientRect();
        const lebarTampil = Math.max(kotak?.width || 320, 320);
        const dasar = halaman.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const skala = Math.min((lebarTampil * dpr) / dasar.width, 2.5);

        const viewport = halaman.getViewport({ scale: skala });
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);

        const renderTask = halaman.render({
          canvasContext: canvas.getContext("2d"),
          viewport,
        });
        renderTaskRef.current = renderTask;

        return renderTask.promise;
      })
      .catch(() => {
        // kalau gagal dirender, kartu tetap bisa dibuka lewat link aslinya
      });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdfUrl]);

  return (
    <canvas
      ref={canvasRef}
      data-component="pdf-preview"
      /* Tidak lagi diburamkan. Zoom pelan saat disentuh tetap ada supaya
         pratinjau terasa bisa dibuka, bukan gambar mati. */
      className={`h-full w-full object-cover object-top transition-transform duration-700 ease-brand group-hover:scale-[1.04] ${className}`}
    />
  );
}
