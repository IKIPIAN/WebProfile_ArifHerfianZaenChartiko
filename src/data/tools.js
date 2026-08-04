import figmaSrc from "../assets/icons/material-icon-theme--figma.svg";
import canvaSrc from "../assets/icons/canva.png";
import vscodeSrc from "../assets/icons/material-icon-theme--vscode.svg";
import officeSrc from "../assets/icons/ms-office-clean.png";
import stitchSrc from "../assets/icons/stitch-wordmark.png";
import workspaceSrc from "../assets/icons/logos--google-workspace.svg";
import claudeSrc from "../assets/icons/material-icon-theme--claude.svg";

/*
 * PERKAKAS — lapisan pendukung, BUKAN keahlian.
 *
 * Ini sengaja dipisah dari `technicalSkills`, dan pemisahannya menegaskan
 * keputusan yang sudah diambil di skills.js: yang dinilai orang adalah apa yang
 * bisa dikerjakan, bukan daftar aplikasi yang pernah dibuka. Empat bidang kerja
 * itu tetap jadi pernyataan utamanya; daftar di bawah ini cuma menjawab
 * pertanyaan lanjutan "dengan apa?".
 *
 * TAPI NAMA PERKAKASNYA HARUS TETAP MUNCUL DI HALAMAN, dan alasannya sama
 * persis dengan alasan jabatan dibiarkan berbahasa Inggris di site.js: penyaring
 * lamaran dan pencarian recruiter mencocokkan teks secara harfiah. Sebelum
 * berkas ini ada, "Figma" tidak tertulis satu kali pun di seluruh situs —
 * padahal peran yang dijual di hero, di kartu Tentang, dan di <title> adalah
 * UI/UX Designer. Situs ini melamar sebagai perancang tanpa pernah menyebut
 * alat perancangnya. Karena itu `name` selalu nama lengkap yang dicari orang,
 * bukan singkatan yang muat di kisi.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * BAHASA TIDAK MASUK KE SINI. HTML, CSS, JavaScript, dan Python pernah berdiri
 * di daftar ini, dan itu keliru karena dua hal sekaligus.
 *
 * Pertama, kategorinya salah: keempatnya bahasa, bukan perkakas. Kedua — dan
 * ini yang lebih penting — petak logo adalah klaim TANPA KUALIFIKASI. Di dalam
 * kisi, Figma dan HTML berdiri sama besar dan sama rata, jadi pembaca
 * menyimpulkan tingkat penguasaan yang sama untuk keduanya. Padahal kemampuan
 * web di sini memang sebatas dasar, dan fungsinya menopang desain: cukup untuk
 * tahu rancangan mana yang menyusahkan developer, bukan untuk membangun
 * produksi. Kalimat sanggup menyampaikan pembedaan itu; petak logo tidak.
 *
 * Keputusan yang sama sudah tercatat di site.js soal "Web Developer" yang
 * sengaja tidak dijadikan sebutan diri. Kisi logo sempat membatalkannya tanpa
 * sengaja — dengan mengangkat keempat bahasa dari "keahlian pendukung yang
 * dijelaskan" menjadi "klaim telanjang sejajar Figma".
 *
 * DAN TIDAK ADA KATA KUNCI YANG HILANG karenanya. HTML, CSS, serta JavaScript
 * tetap tertulis di keterangan "Pengembangan Web" di skills.js, dan Python
 * tetap tertulis di certificates.js sebagai "Python Essentials 1" — nama yang
 * bahkan sudah menyatakan tingkat dasarnya sendiri dengan jujur. Penyaring
 * lamaran membaca seluruh teks halaman, bukan hanya daftar.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * SATU DERET TANPA LABEL KELOMPOK, dan urutannya yang menggantikan label itu.
 * Deretnya mengalir mengikuti urutan `technicalSkills` — desain, pengembangan,
 * administrasi — lalu ditutup AI. Label kelompok menuntut satu baris sendiri
 * untuk tiap kelompok, dan empat baris berlabel mustahil dipadatkan jadi satu
 * bidang yang terbaca sekali pandang. Yang hilang cuma namanya; urutannya tetap
 * mengelompokkannya, dan bidangnya sendiri sudah disebutkan panggung keahlian
 * tepat di atas bagian ini.
 *
 * BIDANG JARINGAN TIDAK PUNYA WAKIL DI SINI, dan itu bukan kelalaian. Cisco
 * Packet Tracer sempat dicantumkan atas dugaan bahwa mengajar jaringan dasar
 * dan TLJ berarti memakainya — dugaan itu keliru dan sudah dikoreksi. Bidang
 * jaringan tetap berdiri utuh di panggung keahlian dan di riwayat kerja; yang
 * tidak ada hanyalah perkakasnya, karena memang tidak ada yang dipakai.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * TIGA CARA MENGGAMBAR LAMBANG, dan tiap perkakas memakai yang paling tepat:
 *
 *   `src`      berkas gambar yang diunduh, ditampilkan apa adanya dengan warna
 *              aslinya. Dipakai untuk merek yang lambangnya memang berwarna.
 *   `brand`    kunci ke brand-paths.js, digambar dengan `currentColor` sehingga
 *              ikut warna teks dan ikut menyala saat disentuh. Dipakai untuk
 *              merek yang lambang resminya MEMANG satu warna — GitHub dan
 *              Claude Code hitam-putih menurut pedoman mereknya sendiri, jadi
 *              ini bukan penambal, melainkan bentuk aslinya.
 *   `monogram` huruf, untuk yang belum punya lambang layak pakai sama sekali.
 *
 * `scale` MENYAMAKAN UKURAN OPTIK, dan angkanya hasil pengukuran — bukan
 * kira-kira. Tiap berkas datang dari koleksi yang berbeda dan menyisakan
 * bantalan kosong yang berbeda pula di dalam kotaknya: lambang Figma hanya
 * mengisi 0,75 dari kotaknya sementara GitHub dan huruf G mengisi penuh. Tanpa
 * koreksi, deretnya terbaca seperti lambang berukuran acak — dan itu cacat yang
 * paling cepat tertangkap mata, jauh sebelum orang membaca namanya.
 *
 * Cara mengukurnya: tiap lambang digambar ke kanvas, lalu dicari kotak
 * terkecil yang memuat seluruh piksel tak-tembus-pandangnya. Angka di bawah
 * adalah pembagi yang mengembalikan semuanya ke ukuran tinta yang sama. Kalau
 * suatu saat ada berkas diganti, angkanya harus diukur ulang — bukan diwarisi.
 * ──────────────────────────────────────────────────────────────────────────
 */
export const tools = [
  /* Desain */
  { name: "Figma", src: figmaSrc, scale: 1.33 },
  /*
   * Stitch memakai wordmark yang DIANGKAT dari spanduknya.
   *
   * Berkas asli `stitch.png` adalah gambar spanduk 1048x476 — tulisan "Stitch"
   * putih di atas latar ungu gelap berpartikel, dan latar itu ikut menempel di
   * berkasnya (0% transparan). Dipasang apa adanya, ia jadi kotak gelap di
   * antara lambang lain.
   *
   * `stitch-wordmark.png` adalah hasil olahannya: dipotong ke kotak tulisannya
   * (270x82), lalu latar gelapnya dibuang dengan menjadikan KECERAHAN sebagai
   * alpha — tulisannya putih pekat, latarnya gelap, jadi ambang di antara
   * keduanya memisahkan dengan bersih sekaligus menyaring garis partikel yang
   * redup. Berkas aslinya tidak ditimpa dan masih ada di folder yang sama.
   */
  /* `scale` di sini justru MENGECILKAN, kebalikan dari yang lain — dan
     alasannya bukan tinggi, melainkan luas. Setinggi pita penuh, wordmark ini
     selebar 119px sementara lambang persegi hanya 36px: tingginya sudah sama,
     tapi luas tintanya tiga kali lipat, dan mata membaca luas. Diturunkan
     sampai bobotnya sepadan tanpa membuat hurufnya sulit dibaca. */
  { name: "Stitch", src: stitchSrc, scale: 0.85 },
  { name: "Canva", src: canvaSrc, scale: 1.23 },

  /* Pengembangan. Keduanya perkakas, bukan bahasa — dan tidak ada yang
     mewawancarai orang soal "bisa memakai VS Code", jadi keduanya tidak
     menanggung risiko klaim berlebih yang membuat bahasa dikeluarkan. */
  { name: "VS Code", src: vscodeSrc, scale: 1.14 },
  { name: "GitHub", brand: "github" },

  /* Administrasi. */
  { name: "MS Office", src: officeSrc },
  /*
   * Google Workspace memakai wordmark penuhnya — dan ini yang paling melebar
   * di seluruh deret: viewBox 512x66, perbandingan 7,76:1.
   *
   * Konsekuensinya harus dicatat supaya tidak dikira bug. Karena lebarnya
   * dibatasi lebar petak (+-145px di desktop), tingginya jatuh ke sekitar 19px
   * sementara lambang persegi berdiri setinggi 36px. Ia memang tampil lebih
   * kecil, dan itu sifat wordmark sepanjang ini — bukan kesalahan ukuran.
   *
   * Kalau suatu saat perbedaan itu mengganggu, gantinya sudah siap: huruf G
   * Google yang persegi masih tersimpan di brand-paths.js dengan kunci
   * `google`, tinggal tukar baris ini jadi `brand: "google"`.
   */
  { name: "Google Workspace", src: workspaceSrc },

  /*
   * DUA TERAKHIR, DAN SENGAJA BUKAN BAGIAN DARI KETIGA BIDANG DI ATAS.
   *
   * Ketiga kelompok di atas adalah bidang kerja. Claude dipakai di semuanya,
   * jadi menaruhnya di dalam salah satunya — dulu ia sempat duduk di antara
   * VS Code dan GitHub — bukan sekadar kurang tepat: penempatannya sendiri
   * sudah menyatakan "ini cuma urusan koding", persis kebalikan dari
   * kenyataannya.
   *
   * Mengulang namanya di tiap kelompok juga bukan jawabannya. Mata langsung
   * menangkap pengulangan itu sebagai daftar yang digelembungkan.
   *
   * Maka ia berdiri di urutan paling akhir. Terakhir bukan berarti paling
   * kecil — di deret yang dibaca dari awal ke akhir, posisi itu yang paling
   * tidak menuntut perhatian sementara namanya tetap tertulis utuh dan tetap
   * bisa dicocokkan penyaring lamaran.
   *
   * Cakupannya tidak dijelaskan di halaman, dan itu disengaja. Bidang ini
   * daftar, bukan uraian: tugasnya menjawab "dengan apa?" dalam sekali pandang.
   */
  { name: "Claude", src: claudeSrc, scale: 1.14 },
  { name: "Claude Code", brand: "claudecode", tint: "#ff7043" },
];
