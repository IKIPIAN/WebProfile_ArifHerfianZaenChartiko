export default function Pengalaman() {
  return (
    <>
      {/* Pita berjalan sebagai jeda antar bagian. Salinannya digandakan oleh
           src/lib/animasi.js — cukup tulis satu, sisanya diurus di sana. */}
      <div data-anim="marquee" data-speed="30" className="border-y border-line py-5">
        <div className="marquee-track">
          <div className="flex shrink-0" data-marquee-copy>
            <span className="-caption flex items-center gap-8 pr-8 text-text-muted">Web Developer<span aria-hidden="true" className="text-accent">✦</span></span>
            <span className="-caption flex items-center gap-8 pr-8 text-text-muted">Pendidik Informatika<span aria-hidden="true" className="text-accent">✦</span></span>
            <span className="-caption flex items-center gap-8 pr-8 text-text-muted">Universitas Negeri Malang<span aria-hidden="true" className="text-accent">✦</span></span>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════════════════
           02 PENGALAMAN — kartu bertumpuk. Yang terdepan dibaca utuh, yang di
           belakang mengintip di sudut sebagai tanda masih ada lagi. Tiap beberapa
           detik yang depan jatuh turun lalu masuk ke belakang tumpukan.

           TIGA HAL YANG SENGAJA BERBEDA DARI CardSwap ASLINYA:

           1. Kartunya TIDAK berukuran tetap. Aslinya dipatok 500x400 dan isinya
              dipotong; di sini tinggi tumpukan diukur dari kartu tertinggi
              (initTukarKartu di animasi.js), jadi tidak ada satu baris pun yang
              terpotong berapa pun panjang rincian pekerjaannya.

           2. Hanya kartu BELAKANG yang dimiringkan. Aslinya seluruh tumpukan
              di-skew, termasuk yang sedang dibaca. Teks CV yang miring 6 derajat
              melelahkan dibaca dan tidak ada gunanya di sini.

           3. Susunannya dua kolom di >=900px. Kartu selebar 56rem dengan rincian
              satu kolom penuh menghasilkan baris sekitar 120 karakter — mata
              kehilangan tempat saat berpindah baris. Kiri identitas pekerjaan,
              kanan rinciannya.

           Urutannya KRONOLOGIS (yang paling awal di depan), bukan terbalik
           seperti CV.
           ═══════════════════════════════════════════════════════════════════════ */}
      <section id="pengalaman" data-component="chapter" className="relative">
        <div data-component="container" className="mx-auto w-full px-4 sm:px-6 nav:px-10 max-w-[1500px] py-24 sm:py-28 nav:py-40">

          <div data-component="scrub-reveal" className="mb-6 flex items-center gap-4 sm:mb-7">
            <span className="-mono tabular-nums text-text-muted">02</span>
            <span className="h-px w-12 bg-line"></span>
            <span className="-caption-small text-text-muted">Pengalaman</span>
          </div>

          <h2 className="-h1 mb-7" data-line-mask>
            <span data-anim="line-mask" className="last:text-text-muted"><span>Pengalaman</span></span>
            <span data-anim="line-mask" className="last:text-text-muted"><span>Kerja</span></span>
          </h2>

          <p data-component="scrub-reveal" className="-body-small mb-12 max-w-md text-text-muted sm:mb-16">
            Riwayat pekerjaan yang pernah saya jalani
          </p>

          <div className="tukar mx-auto w-full max-w-[56rem]" data-component="tukar">
            <div className="tukar-tumpuk" data-tukar-tumpuk>

              <article data-kartu className="tukar-kartu">
                <div className="tukar-isi">
                  <div className="tukar-kiri">
                    <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-line pb-5">
                      <span className="-mono tabular-nums text-text-muted">01 / 02</span>
                      <span className="-caption-small text-text-muted">Februari – Juni 2024</span>
                    </div>
                    <h3 className="-h2 mb-3">Guru Informatika</h3>
                    <a href="https://smkn3malang.sch.id/" target="_blank" rel="noopener noreferrer" className="link-mono text-text-muted hover:text-text">
                      <span data-letter-hover="SMKN 3 Malang"></span><span className="arrow" aria-hidden="true">↗</span>
                    </a>
                    <div className="mt-8 flex flex-wrap gap-2 nav:mt-auto nav:pt-10">
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Pemrograman Dasar</span>
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Jaringan Dasar</span>
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">TLJ</span>
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Manajemen Siswa</span>
                    </div>
                  </div>

                  <ul className="tukar-rinci">
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Mengajar mata pelajaran pemrograman dasar, jaringan dasar, dan teknologi layanan jaringan (TLJ)</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Membimbing proyek akhir pemrograman dasar kelas 10, dari nol sampai siswa punya web profil sekolah yang berjalan</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Mengawasi dan mengevaluasi siswa, serta memastikan pemahaman dan capaian belajar terpenuhi sesuai timeline dan target</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Merencanakan, mengadakan, dan mengoordinasi program kerja SEMAR “Seminar Marketing”</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Mendigitalisasi arsip sekolah dan mendukung kegiatan operasional sekolah</li>
                  </ul>
                </div>
              </article>

              <article data-kartu className="tukar-kartu">
                <div className="tukar-isi">
                  <div className="tukar-kiri">
                    <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-line pb-5">
                      <span className="-mono tabular-nums text-text-muted">02 / 02</span>
                      <span className="-caption-small text-text-muted">Juni – Agustus 2024</span>
                    </div>
                    <h3 className="-h2 mb-3">Staf Administrasi</h3>
                    <a href="https://dikbud.malangkota.go.id/" target="_blank" rel="noopener noreferrer" className="link-mono text-text-muted hover:text-text">
                      <span data-letter-hover="Dinas Pendidikan Kota Malang"></span><span className="arrow" aria-hidden="true">↗</span>
                    </a>
                    <div className="mt-8 flex flex-wrap gap-2 nav:mt-auto nav:pt-10">
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Administrasi Digital</span>
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Pendataan</span>
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Pelayanan</span>
                      <span className="-caption-small border border-line px-3 py-2 text-text-muted">Ketelitian</span>
                    </div>
                  </div>

                  <ul className="tukar-rinci">
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Mendata, mengelola, dan melayani serah terima seragam sekolah serta buku kurikulum</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Mendata penulisan disposisi serta pencatatan surat masuk dan keluar</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Melayani koreksi kesalahan penulisan ijazah siswa</li>
                    <li className="-body-small flex gap-3 text-text-muted"><span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-line"></span>Mendata dan melayani pengajuan dana BOSDA dan NPHD</li>
                  </ul>
                </div>
              </article>

            </div>

            {/* Titik pemilih dibuat di animasi.js dari JUMLAH kartu, bukan
                ditulis tangan di sini: menambah pengalaman berarti menambah satu
                <article>, dan titiknya ikut sendiri. Ia juga yang memberi jalan
                keyboard ke kartu yang tidak sedang di depan. */}
            <div className="tukar-kendali" data-tukar-kendali role="tablist" aria-label="Pilih pengalaman kerja"></div>
          </div>

        </div>
      </section>
    </>
  );
}
