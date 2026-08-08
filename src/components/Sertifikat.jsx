/*
 * Daftar sertifikat ditulis sebagai data, bukan enam blok markup kembar.
 * Keenam panelnya hanya berbeda pada lima nilai ini, dan menyalin markup
 * berarti lima tempat yang bisa lupa diganti. Menambah sertifikat = menambah
 * satu baris di sini; angka di bagian Pendidikan ikut sendiri karena ia
 * menghitung [data-panel].
 *
 * `berkas` dipakai dua kali: .pdf yang dibuka, dan .jpg pratinjaunya. Itu
 * sebabnya nama dasar keduanya WAJIB sama di public/assets/certificate/.
 */
const SERTIFIKAT = [
  {
    berkas: "python-essentials-1-cisco",
    judul: "Python Essentials 1",
    sumber: "Cisco",
    ikon: "fa-brands fa-python",
    rinci: "Cisco Networking Academy & Python Institute",
  },
  {
    berkas: "ukbing-arif-herfian",
    judul: "UKBIng",
    sumber: "Bahasa Inggris",
    ikon: "fa-solid fa-language",
    rinci: "Pre-Advanced — Skor 444",
  },
  {
    berkas: "sertifikat-keorganisasian-wse",
    judul: "PJ Service Center",
    sumber: "WSE",
    ikon: "fa-solid fa-screwdriver-wrench",
    rinci: "Koordinasi Perawatan Hardware & Software",
  },
  {
    berkas: "sertifikat-keorganisasian-wats",
    judul: "Pemateri IoT",
    sumber: "WSE",
    ikon: "fa-solid fa-microchip",
    rinci: "Instruktur Internet of Things",
  },
  {
    berkas: "sertifikat-keorganisasian-lktin",
    judul: "Panitia LKTIN PESC",
    sumber: "WSE",
    ikon: "fa-solid fa-pen-nib",
    rinci: "Lomba Karya Tulis Ilmiah Nasional",
  },
  {
    berkas: "sertifikat-keorganisasian-ltdc",
    judul: "Panitia LTDC",
    sumber: "WSE",
    ikon: "fa-solid fa-robot",
    rinci: "Line Tracer Design and Contest Nasional",
  },
];

export default function Sertifikat() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           05 SERTIFIKAT — galeri akordeon. Satu panel terbuka, sisanya menyempit
           jadi bilah dan miring menjauh. Yang terbuka mengikuti kursor di
           penunjuk halus, POSISI GULIR di perangkat sentuh, dan fokus keyboard
           di keduanya — sebab hover tidak punya padanan di layar sentuh, dan
           galeri yang cuma bisa ditelusuri dengan mengetuk berulang kali sama
           saja dengan galeri yang tidak bisa ditelusuri.

           Panelnya <a> ke PDF, bukan <div> yang dibuat bisa diklik. Konsekuensinya
           disengaja: ia dapat fokus keyboard, bisa dibuka di tab baru lewat klik
           tengah, dan pembaca layar mengumumkannya sebagai tautan. Perilaku
           ketuk-pertama-memilih diurus di animasi.js dengan preventDefault, jadi
           tanpa JavaScript keenam tautannya tetap berfungsi apa adanya.

           Pratinjaunya gambar statis, bukan PDF yang dirender di browser — hasilnya
           sama, tanpa 1,7 MB JavaScript. Berkas PDF aslinya tetap yang dibuka.
           ═══════════════════════════════════════════════════════════════════════ */}
      <section id="sertifikat" data-band="panel" data-component="chapter">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 nav:px-10 py-24 sm:py-28 nav:py-36">
          <div className="mb-5 flex items-center gap-4">
            <span className="-mono tabular-nums text-text-muted">05</span>
            <span className="h-px w-12 bg-line"></span>
            <span className="-caption-small text-text-muted">Sertifikat</span>
          </div>

          <div className="mb-8 flex flex-col gap-4 nav:mb-12 nav:flex-row nav:items-end nav:justify-between">
            <h2 className="-h1" data-line-mask>
              <span data-anim="line-mask"><span>Sertifikat</span></span>
            </h2>
            {/* Dua kalimat, satu ditampilkan CSS lewat @media (hover: hover),
                bukan satu kalimat kompromi. Cara menelusurinya memang berbeda
                per perangkat: di penunjuk halus cukup diarahkan, di sentuh
                gulirlah yang memilih. Kalimat sebelumnya berbunyi "ketuk untuk
                membuka berkasnya" di keduanya, padahal di sentuh ketukan
                pertama pada panel yang tertutup hanya memilih — petunjuk yang
                menjanjikan sesuatu yang tidak terjadi lebih buruk daripada
                tidak ada petunjuk sama sekali. */}
            <p className="-body-small max-w-[22rem] text-text-muted" data-component="scrub-reveal">
              <span className="petunjuk-tunjuk">
                Arahkan kursor untuk melihat, klik untuk membuka berkasnya.
              </span>
              <span className="petunjuk-sentuh">
                Gulir untuk menelusuri, ketuk panel yang terbuka untuk membuka berkasnya.
              </span>
            </p>
          </div>

          <div data-component="galeri" className="galeri" role="list" aria-label="Galeri sertifikat">
            {SERTIFIKAT.map(function (s) {
              return (
                <a key={s.berkas} data-panel role="listitem" className="galeri-panel"
                  href={"assets/certificate/" + s.berkas + ".pdf"}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={"Buka " + s.judul + " — " + s.rinci}>
                  <span className="galeri-media" data-panel-media>
                    <img src={"assets/certificate/" + s.berkas + ".jpg"} alt="" loading="lazy" decoding="async" />
                  </span>
                  {/* Tirai peredup: <span> ber-opacity, BUKAN filter grayscale
                      seperti komponen aslinya. Alasannya di komentar
                      initGaleriAkordeon() -- filter dihitung ulang tiap frame,
                      opacity cuma disusun ulang oleh compositor. */}
                  <span className="galeri-tirai" data-panel-tirai aria-hidden="true"></span>

                  <span className="galeri-label">
                    <i className={s.ikon + " galeri-ikon"} aria-hidden="true"></i>
                    <span className="galeri-teks" data-panel-teks>
                      <span className="galeri-judul">{s.judul}</span>
                      <span className="galeri-sumber">{s.sumber}</span>
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
