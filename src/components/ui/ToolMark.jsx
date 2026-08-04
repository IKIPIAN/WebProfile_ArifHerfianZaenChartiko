import { BRAND_PATHS } from "../../data/brand-paths";

/*
 * Lambang satu perkakas. Tiga wujud, dan semuanya berbagi SATU PITA setinggi
 * sama.
 *
 * PITANYA MEMBATASI TINGGI, BUKAN LEBAR — dan itu yang membuat lambang persegi
 * dan wordmark memanjang bisa berdiri dalam satu deret tanpa saling merusak.
 * Kotak berukuran tetap akan meremas wordmark "Google Workspace" yang
 * perbandingannya 7,76:1 sampai gepeng; pita yang tingginya dipatok sementara
 * lebarnya bebas (sampai selebar petaknya) membiarkan tiap lambang memakai
 * bentuk aslinya.
 *
 * Yang dijaga tetap sama adalah GARIS DASAR DAN GARIS ATASNYA. Karena tinggi
 * pitanya seragam, nama di bawah tiap lambang jatuh di ketinggian yang sama
 * persis di seluruh baris — itulah yang membuat deretnya terbaca rapi, bukan
 * keseragaman ukuran lambangnya.
 *
 *   src        gambar unduhan, tampil dengan warna aslinya.
 *   brand      path dari brand-paths.js, digambar `currentColor` sehingga ikut
 *              warna teks. Ini BUKAN penambal: lambang resmi GitHub dan Claude
 *              Code memang satu warna menurut pedoman mereknya sendiri.
 *   monogram   huruf, untuk yang belum punya lambang layak pakai.
 *
 *   tint       memaksa warna lambang `brand` tertentu. Dipakai Claude Code
 *              supaya sewarna dengan lambang Claude di sebelahnya — keduanya
 *              satu keluarga produk, dan warna yang berbeda membuat keduanya
 *              terbaca sebagai dua hal yang tidak berhubungan.
 *   scale      penyama ukuran optik; angkanya hasil pengukuran, lihat tools.js.
 */
export function ToolMark({ src, brand, monogram, name, scale = 1, tint }) {
  /* `w-full`, bukan lebar tetap: inilah yang memberi ruang bagi wordmark untuk
     memanjang sampai selebar petaknya. Isinya tetap dipusatkan, jadi lambang
     persegi tidak ikut bergeser ke kiri. */
  const pita = "flex h-8 w-full shrink-0 items-center justify-center nav:h-9";

  /* Diperbesar lewat `transform`, BUKAN dengan membesarkan pitanya. Pita yang
     ikut membesar akan mendorong nama di bawahnya turun tidak sejajar dengan
     petak sebelahnya; transform menggambar di luar batas tanpa mengubah ruang
     yang ditempatinya. */
  const perbesar = scale === 1 ? undefined : { transform: `scale(${scale})` };

  if (src) {
    return (
      <span className={pita}>
        {/* `alt` dikosongkan: nama perkakasnya sudah tertulis sebagai teks tepat
            di bawah lambang ini, dan mengisinya membuat pembaca layar
            menyebutkan nama yang sama dua kali berturut-turut.

            `max-h-full max-w-full` (bukan `h-full w-full`) yang menegakkan
            aturan pita: yang lebih dulu mentok — tinggi atau lebar — itu yang
            membatasi, jadi lambang persegi berdiri setinggi penuh sementara
            wordmark berhenti di lebar petaknya. `object-contain` menjaga
            bentuknya tidak teregang. */}
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={perbesar}
          className="max-h-full max-w-full object-contain"
        />
      </span>
    );
  }

  const path = brand ? BRAND_PATHS[brand] : null;

  if (path) {
    return (
      <span className={pita}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          style={{ ...perbesar, color: tint }}
          className="aspect-square h-full"
        >
          <path d={path} />
        </svg>
      </span>
    );
  }

  return (
    <span className={pita}>
      {/* Sedikit lebih kecil dari tinggi pitanya: huruf yang mengisi sampai
          penuh terbaca lebih berat daripada lambang di sebelahnya, yang selalu
          menyisakan ruang kosong di dalam viewBox-nya sendiri. */}
      <span
        aria-hidden="true"
        title={name}
        className="font-mono text-[0.9rem] font-medium tracking-tight nav:text-base"
      >
        {monogram}
      </span>
    </span>
  );
}
