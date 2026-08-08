export default function Pembuka() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           PEMBUKA — panel yang menutup layar sampai monogramnya selesai terbentuk.

           BUKAN "A di sebelah H". Keduanya berbagi bagian yang sama sehingga
           jadi SATU bentuk: gerbang bersegi di dalam heksagon.

             dua tiang tegak   -> batang kiri dan kanan huruf H
             puncak lancip     -> huruf A, memakai kedua tiang itu sebagai kaki
             palang jingga     -> palang A DAN palang H sekaligus

           Jadi tiap goresan dipakai dua kali. Palangnya digambar paling akhir
           dan satu-satunya yang berwarna aksen, karena sampai ia turun
           bentuknya masih terbaca sebagai gerbang kosong -- ia yang mengunci
           dua huruf jadi satu tanda.

           GEOMETRI, viewBox 176x168, semua angka dalam satuan itu:

             heksagon   puncak (88,6), bahu (158,46) dan (18,46),
                        pinggang (158,122) dan (18,122), dasar (88,162)
             gerbang    M 48 132 L 48 84 L 88 40 L 128 84 L 128 132
                        kaki di y=132, bahu di y=84, puncak di (88,40)
             palang     M 48 106 L 128 106

           Digambar TEBAL (stroke-width 12 dari 176 satuan lebar) supaya ia
           bertubuh, bukan garis rambut. Ujungnya butt dan sikunya miter --
           sudut lancip di puncak itu hasil miter join pada sudut 84,6 derajat,
           bukan bentuk yang digambar terpisah.

           Semua <path> hanya bergaris tanpa isi supaya bisa digambar bertahap
           lewat stroke-dashoffset; panjangnya diukur getTotalLength() di
           src/lib/animasi.js, tidak ditulis tangan di sini.
           ═══════════════════════════════════════════════════════════════════════ */}
      <div data-component="pembuka" className="pembuka" aria-hidden="true">
        <div className="pembuka-isi" data-pembuka-isi>
          <svg className="pembuka-lambang" viewBox="0 0 176 168" role="img"
            aria-label="Monogram A H">
            {/* Heksagon dibelah dua supaya bisa tumbuh dari puncak ke bawah di
                kiri dan kanan sekaligus, bukan melingkar satu arah. */}
            <g data-pembuka-bingkai>
              <path d="M 88 6 L 158 46 L 158 122 L 88 162" />
              <path d="M 88 6 L 18 46 L 18 122 L 88 162" />
            </g>

            {/* SATU garis menerus, bukan tiga potong.

                Versi pertama memakai tiga <path> terpisah: tiang kiri, tiang
                kanan, lalu diagonal puncaknya. Hasilnya bertakik di kedua
                bahu -- ujung diagonal yang dipotong rata (linecap butt)
                bertemu sisi tiang pada sudut 42 derajat, dan selisihnya
                menganga sebagai coakan kecil. Digambar sebagai satu path,
                keempat sikunya jadi miter join yang menyambung rapat, dan
                puncaknya jadi sudut lancip tanpa sambungan sama sekali.

                Efek sampingnya justru yang diinginkan: goresannya menyusur
                naik dari kaki kiri, melewati puncak, lalu turun ke kaki
                kanan -- satu tarikan, bukan tiga bagian yang muncul
                bergantian. */}
            <g data-pembuka-goresan>
              <path d="M 48 132 L 48 84 L 88 40 L 128 84 L 128 132" />
            </g>

            <g data-pembuka-kunci>
              <path d="M 48 106 L 128 106" />
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
