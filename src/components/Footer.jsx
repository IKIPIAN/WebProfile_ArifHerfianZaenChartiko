export default function Footer() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           PENUTUP — satu-satunya bidang yang lebih gelap dari latar dasar. Setelah
           dua bagian terang, turun ke hitam pekat menandai bahwa halaman memang
           berakhir di sini, bukan sekadar bagian berikutnya yang belum termuat.
           ═══════════════════════════════════════════════════════════════════════ */}
      <footer data-component="footer" data-band="void" className="relative overflow-hidden">

        <div data-anim="marquee" data-speed="38" className="relative z-2 border-y border-line py-6">
          <div className="marquee-track">
            <div className="flex shrink-0" data-marquee-copy>
              <span className="-caption flex items-center gap-8 pr-8 text-text-muted">Terbuka untuk kolaborasi<span aria-hidden="true" className="text-accent">✦</span></span>
              <span className="-caption flex items-center gap-8 pr-8 text-text-muted">Pengembangan Web<span aria-hidden="true" className="text-accent">✦</span></span>
              <span className="-caption flex items-center gap-8 pr-8 text-text-muted">Pendidikan Informatika<span aria-hidden="true" className="text-accent">✦</span></span>
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas data-component="ambient-lines" data-density="30" aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"></canvas>

          <div data-component="container" className="mx-auto w-full px-4 sm:px-6 nav:px-10 max-w-[1500px] relative z-2 py-24 nav:py-32">
            <p data-component="scrub-reveal" className="-caption-small mb-8 text-text-muted">Mari bekerja sama</p>

            <p className="-display mb-16" data-line-mask>
              <span data-anim="line-mask" className="last:text-text-muted"><span>Arif Herfian</span></span>
              <span data-anim="line-mask" className="last:text-text-muted"><span>Zaen Chartiko</span></span>
            </p>

            <div className="grid grid-cols-1 gap-10 border-t border-line pt-10 nav:grid-cols-3">
              <div data-component="scrub-reveal">
                <p className="-caption-small mb-4 text-text-muted">Surel</p>
                <p className="-body-small">arif.herfian@gmail.com</p>
              </div>
              <div data-component="scrub-reveal">
                <p className="-caption-small mb-4 text-text-muted">WhatsApp</p>
                <p className="-body-small">+62 857-9022-6536</p>
              </div>
              <div data-component="scrub-reveal">
                <p className="-caption-small mb-4 text-text-muted">Almamater</p>
                <p className="-body-small text-text-muted">S1 Pendidikan Teknik Informatika<span className="block">Universitas Negeri Malang</span></p>
              </div>
            </div>

            {/* Tanpa tahun. Angka tahun di baris hak cipta menua sendiri — begitu
                 berganti tahun ia langsung menandai situs ini sebagai sesuatu yang
                 sudah lama tidak disentuh. */}
            <div data-component="scrub-reveal" className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-8">
              <p className="-caption-small text-text-muted">© Arif Herfian Zaen Chartiko</p>
              <p className="-caption-small text-text-muted">Kab. Blitar, Jawa Timur</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
