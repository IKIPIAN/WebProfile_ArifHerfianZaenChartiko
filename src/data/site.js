export const site = {
  name: "Arif Herfian Zaen Chartiko",
  /* Dipecah karena nama ini dipakai sebagai elemen morph: preloader menampilkan
     versi kecilnya, hero melanjutkannya jadi judul besar. Markupnya harus sama. */
  firstName: "Arif Herfian",
  lastName: "Zaen Chartiko",

  greeting: "Halo, perkenalkan saya",
  roleLead: "Saya seorang",
  /*
   * Tiga peran ini adalah tiga sasaran lamaran yang sebenarnya, dan sengaja
   * sama persis dengan tiga kartu di bagian Tentang — hero dan Tentang harus
   * menceritakan hal yang sama, bukan dua daftar yang berbeda.
   *
   * BAHASANYA IKUT NAMA ASLI TIAP PERAN, bukan diseragamkan. Jabatan industri
   * teknologi memang beredar dalam bahasa Inggris — lowongan dan pencarian
   * recruiter mengetik "UI/UX Designer", dan penyaring lamaran mencocokkan
   * teks secara harfiah, jadi terjemahan Indonesia justru berisiko tidak
   * tercocokkan. Sebaliknya "Staf Administrasi" memang begitu diiklankan di
   * PT/CV maupun bimbel, dan itu pula jabatan aslinya di Dinas Pendidikan.
   *
   * "Web Developer" SENGAJA TIDAK DI SINI. Kemampuan web-nya sebatas dasar dan
   * fungsinya menopang desain, jadi tempatnya di daftar keahlian
   * (src/data/skills.js), bukan di sebutan diri. Sebagai jabatan ia mengundang
   * perbandingan dengan web developer sungguhan; sebagai keahlian pendukung ia
   * justru jadi pembeda diantara sesama pelamar UI/UX.
   */
  typewriterRoles: ["UI/UX Designer", "Pendidik Informatika", "Staf Administrasi"],

  location: "Kab. Blitar, Jawa Timur",
  email: "arif.herfian@gmail.com",
  phone: "6285790226536",
  phoneDisplay: "+62 857-9022-6536",

  /*
   * Tiga angka ini digulung sebagai odometer di bagian pendidikan, jadi tiap
   * nilainya harus benar-benar bisa dipertanggungjawabkan.
   *
   * "7 Bulan Pengalaman" mengukur rentang Februari–Agustus 2024, yaitu dari
   * hari pertama mengajar sampai hari terakhir di dinas. Angka sebelumnya
   * ("6 Bulan Mengajar") ikut hitungan lama yang menganggap masa mengajar
   * dimulai Januari; CV terbaru menyebut Februari, jadi angka itu tidak lagi
   * benar. Menghitung rentang total juga lebih jujur daripada menjumlahkan
   * kedua peran, karena Juni terhitung di dua-duanya.
   */
  stats: [
    { value: "3.62", label: "IPK" },
    { value: "7", label: "Bulan Pengalaman" },
    { value: "6", label: "Sertifikat" },
  ],
};
