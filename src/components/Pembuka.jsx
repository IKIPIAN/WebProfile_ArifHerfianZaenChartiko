export default function Pembuka() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           PEMBUKA — panel yang menutup layar sampai monogramnya selesai tergambar.

           GEOMETRINYA, supaya bisa diubah tanpa menebak. viewBox 176x124, dan
           semua angka di bawah memakai satuan itu:

             kurung sudut   kotak (2,2)-(174,122), panjang lengan 16
             huruf A        kaki (28,104) dan (80,104), puncak (54,20)
             huruf H        tiang di x=96 dan x=148, dari y=20 sampai y=104
             palang         SATU garis M 39 67 L 148 67

           Palangnya sengaja satu garis menembus keduanya, bukan dua palang
           terpisah. Di y=67 garis itu bertemu diagonal kiri A pada x=39,5 dan
           diagonal kanannya pada x=68,5, lalu menyeberang ke H — itu yang
           mengunci dua huruf jadi satu tanda, bukan dua huruf berdampingan.
           Ia digambar paling akhir justru karena itu: sampai palang turun,
           bentuknya belum jadi monogram.

           Semua <path> hanya bergaris, tanpa isi, supaya bisa digambar
           bertahap lewat stroke-dashoffset -- panjang tiap garis diukur
           getTotalLength() di src/lib/animasi.js, tidak ditulis tangan di sini.

           Yang terlihat: garis muncul sepotong-sepotong dari kosong, dan situs
           baru masuk setelah huruf lengkap terbentuk.
           ═══════════════════════════════════════════════════════════════════════ */}
      <div data-component="pembuka" className="pembuka" aria-hidden="true">
        <div className="pembuka-isi" data-pembuka-isi>
          <svg className="pembuka-lambang" viewBox="0 0 176 124" role="img"
            aria-label="Monogram A H, inisial Arif Herfian">
            {/* Kurung sudut: rambut 1px yang tidak ikut menebal saat lambangnya
                diperbesar, karena vector-effect non-scaling-stroke. */}
            <g data-pembuka-bingkai>
              <path d="M 2 18 L 2 2 L 18 2" />
              <path d="M 158 2 L 174 2 L 174 18" />
              <path d="M 174 106 L 174 122 L 158 122" />
              <path d="M 18 122 L 2 122 L 2 106" />
            </g>

            {/* Urutan elemen di sini = urutan tergambarnya. */}
            <g data-pembuka-goresan>
              <path d="M 28 104 L 54 20" />
              <path d="M 54 20 L 80 104" />
              <path d="M 96 20 L 96 104" />
              <path d="M 148 20 L 148 104" />
              <path d="M 39 67 L 148 67" />
            </g>
          </svg>

          <p className="pembuka-teks" data-pembuka-teks>
            <span className="pembuka-titik" aria-hidden="true"></span>
            Arif Herfian Zaen Chartiko
          </p>
        </div>
      </div>
    </>
  );
}
