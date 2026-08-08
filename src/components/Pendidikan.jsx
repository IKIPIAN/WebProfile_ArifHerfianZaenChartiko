export default function Pendidikan() {
  return (
    <>
      {/* Jembatan gelap → terang. Batas keras antara hitam dan putih terbaca
           sebagai bug render, jadi peralihannya setinggi setengah layar. */}
      <div aria-hidden="true" className="band-fade-to-panel h-[28vh] sm:h-[40vh] nav:h-[50vh]"></div>


      {/* ══════════════════════════════════════════════════════════════════════════
           04 PENDIDIKAN — titik balik halaman, dari gelap ke terang. Karena itu ia
           mendapat transisi paling mencolok: dua baris judul datang dari arah
           berlawanan lalu bertemu di tengah. Dipakai SEKALI saja di seluruh halaman.
           ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pendidikan" data-band="panel" data-component="chapter" className="scroll-mt-24">
        <div data-component="container" className="mx-auto w-full px-4 sm:px-6 nav:px-10 max-w-[1500px] py-28 nav:py-40">

          <div className="mb-16 flex items-center gap-4">
            <span className="-mono tabular-nums text-text-muted">04</span>
            <span className="h-px w-12 bg-line"></span>
            <span className="-caption-small text-text-muted">Pendidikan</span>
          </div>

          <div className="mb-20" data-split-words>
            <div className="overflow-hidden pb-[0.2em] mb-[-0.2em] -display leading-[0.95]">
              <div className="top-word will-change-transform -display leading-[0.95]">Riwayat</div>
              <div className="bottom-word will-change-transform -display leading-[0.95]">Pendidikan</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-16 gap-y-12 border-t border-line pt-14 nav:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
            <div>
              <h3 data-component="scrub-reveal" className="-h2 mb-4">S1 Pendidikan Teknik Informatika</h3>

              <div data-component="scrub-reveal">
                <a href="https://um.ac.id/" target="_blank" rel="noopener noreferrer" className="link-mono mb-9 text-text-muted hover:text-text">
                  Universitas Negeri Malang<span className="arrow" aria-hidden="true">↗</span>
                </a>
              </div>

              <p data-component="scrub-reveal" className="-body mb-10 max-w-2xl text-text-muted">
                Program studi yang memadukan ilmu pendidikan dengan teknologi informatika, berfokus pada kompetensi calon pendidik di bidang pemrograman, jaringan, dan sistem informasi.
              </p>

              <div data-component="scrub-reveal" className="flex flex-wrap gap-2">
                <span className="-caption-small border border-line px-3 py-2 text-text-muted">Pendidikan Teknologi</span>
                <span className="-caption-small border border-line px-3 py-2 text-text-muted">Pemrograman</span>
                <span className="-caption-small border border-line px-3 py-2 text-text-muted">Jaringan Komputer</span>
                <span className="-caption-small border border-line px-3 py-2 text-text-muted">Sistem Informasi</span>
              </div>
            </div>

            <div className="corner-marks border border-line p-8">
              <p className="-caption-small mb-8 text-text-muted">Lulus 2025</p>

              <div className="mb-8">
                <p className="-caption-small mb-2 text-text-muted">IPK</p>
                <div className="flex items-baseline gap-2">
                  <span className="odometer-value -display-stat block shrink-0" data-odometer="3.62"></span>
                  <span className="-caption-small whitespace-nowrap text-text-muted">/ 4.00</span>
                </div>
              </div>

              <div className="flex flex-col gap-5 border-t border-line pt-7">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="-caption-small text-text-muted">Sertifikat</span>
                  {/* Angkanya DIHITUNG dari jumlah kartu di bagian Sertifikat oleh
                       js/main.js, bukan ditulis di sini. Menambah sertifikat berarti
                       angka ini ikut sendiri. */}
                  <span className="odometer-value -h2 leading-none" data-odometer-count="#sertifikat [data-arrive]"></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
