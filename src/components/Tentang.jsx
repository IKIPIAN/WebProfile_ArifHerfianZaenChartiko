export default function Tentang() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           01 TENTANG — transisi paling tenang di seluruh situs, dan itu disengaja:
           isinya paragraf yang memang ingin dibaca, jadi teksnya ditawarkan lebih
           dulu (redup) dan scroll hanya mengatur temponya.
           ═══════════════════════════════════════════════════════════════════════ */}
      <section id="tentang" data-component="chapter" className="relative scroll-mt-24">
        <div data-component="container"
          className="mx-auto w-full px-4 sm:px-6 nav:px-10 max-w-[1180px] grid grid-cols-1 gap-x-8 gap-y-10 py-24 sm:py-28 nav:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] nav:gap-x-16 nav:gap-y-12 nav:py-40">

          <div>
            <header className="nav:sticky nav:top-28">
              <div data-component="scrub-reveal" className="flex items-center gap-4 mb-7">
                <span className="-mono text-text-muted tabular-nums">01</span>
                <span className="h-px w-12 bg-line"></span>
                <span className="-caption-small text-text-muted">Tentang</span>
              </div>

              <h2 className="-h1" data-line-mask>
                <span data-anim="line-mask" className="last:text-text-muted"><span>Tentang</span></span>
                <span data-anim="line-mask" className="last:text-text-muted"><span>Saya</span></span>
              </h2>

              <p data-component="scrub-reveal" className="-body-small text-text-muted mt-7 max-w-[17rem]">
                Latar belakang, cara saya bekerja, dan apa yang saya kerjakan sekarang
              </p>
            </header>
          </div>

          <div className="min-w-0 nav:min-h-[62vh]">
            <div className="flex flex-col gap-16">
              <p className="-h2 max-w-[38rem]" data-word-scrub>Saya membangun antarmuka web yang mudah diikuti, dengan kebiasaan menjelaskan yang dibawa dari ruang kelas, dan perhatian pada rancangan yang menjaga hasilnya tetap enak dipakai.</p>

              {/* Baris bergaris, bukan kartu. Tiga kartu bertumpuk di kolom sempit
                   terbaca sebagai tiga hal setara yang saling bersaing; baris
                   bernomor terbaca sebagai satu daftar yang bisa dipindai. */}
              <div className="border-t border-line">
                <div data-component="scrub-reveal">
                  <div className="group relative grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line py-8 nav:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)]">
                    <span className="-mono tabular-nums text-text-muted">01</span>
                    <h3 className="-title-3 transition-transform duration-500 ease-brand nav:group-hover:translate-x-1">Web Developer</h3>
                    <p className="-body-small max-w-xl text-text-muted">Membangun antarmuka web yang responsif dengan HTML, CSS, dan JavaScript: struktur yang rapi, gerak yang terukur, dan halaman yang tetap ringan di perangkat kelas menengah. Ditopang pemahaman desain, sehingga hasilnya tidak sekadar berfungsi.</p>
                    <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-text transition-transform duration-700 ease-brand group-hover:scale-x-100"></span>
                  </div>
                </div>

                <div data-component="scrub-reveal">
                  <div className="group relative grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line py-8 nav:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)]">
                    <span className="-mono tabular-nums text-text-muted">02</span>
                    <h3 className="-title-3 transition-transform duration-500 ease-brand nav:group-hover:translate-x-1">Pendidik Informatika</h3>
                    <p className="-body-small max-w-xl text-text-muted">Lulusan S1 Pendidikan Teknik Informatika Universitas Negeri Malang dengan pengalaman mengajar pemrograman dasar, jaringan dasar, dan teknologi layanan jaringan di SMKN 3 Malang. Terbiasa menjelaskan hal teknis kepada orang awam — kebiasaan yang sama terpakai saat mempresentasikan rancangan.</p>
                    <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-text transition-transform duration-700 ease-brand group-hover:scale-x-100"></span>
                  </div>
                </div>

                <div data-component="scrub-reveal">
                  <div className="group relative grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line py-8 nav:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)]">
                    <span className="-mono tabular-nums text-text-muted">03</span>
                    <h3 className="-title-3 transition-transform duration-500 ease-brand nav:group-hover:translate-x-1">Staf Administrasi</h3>
                    <p className="-body-small max-w-xl text-text-muted">Berpengalaman sebagai Staf Administrasi di Dinas Pendidikan Kota Malang: pendataan, pengelolaan disposisi dan surat, serta pelayanan yang menuntut ketelitian dan koordinasi tim.</p>
                    <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-text transition-transform duration-700 ease-brand group-hover:scale-x-100"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
