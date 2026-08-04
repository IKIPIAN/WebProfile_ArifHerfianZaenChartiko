import { certificates } from "./certificates";

export const site = {
  name: "Arif Herfian Zaen Chartiko",
  /* Dipecah karena judul hero menampilkannya sebagai dua baris bertopeng yang
     naik bergantian — tiap baris butuh elemennya sendiri untuk ditopengi. */
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
   * Angka-angka ini digulung sebagai odometer di bagian pendidikan, jadi tiap
   * nilainya harus benar-benar bisa dipertanggungjawabkan.
   *
   * Entri pertama sengaja dilewati saat dirender (`stats.slice(1)`): IPK sudah
   * tampil sendiri sebagai angka besar di kartu yang sama, jadi mengulangnya
   * di daftar bawah hanya membuatnya terbaca dua kali.
   */
  stats: [
    { value: "3.62", label: "IPK" },
    /*
     * DIHITUNG DARI DAFTARNYA, BUKAN DITULIS SEBAGAI ANGKA.
     *
     * Sebelumnya "6" — kebetulan benar, dan kebetulan itu persis masalahnya.
     * Angka ini tidak menyimpan informasi apa pun yang belum ada di
     * certificates.js; ia cuma salinan yang harus diingat untuk ikut diubah.
     * Menambah satu sertifikat berarti kartu ketujuh muncul di bagian
     * Sertifikat sementara odometer di bagian Pendidikan tetap menyebut enam —
     * dua bagian yang saling bersebelahan menghitung hal yang sama dengan
     * hasil berbeda, dan yang salah adalah yang lebih dipercaya karena
     * berbentuk angka besar.
     *
     * Kegagalannya juga tidak menimbulkan error apa pun: tidak ada yang
     * memberi tahu, halaman tetap terbit, dan yang terbaca cuma angka yang
     * meleset. Karena itu ia diturunkan dari sumbernya.
     */
    { value: String(certificates.length), label: "Sertifikat" },
  ],
};
