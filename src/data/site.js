export const site = {
  name: "Arif Herfian Zaen Chartiko",
  /* Dipecah karena nama ini dipakai sebagai elemen morph: preloader menampilkan
     versi kecilnya, hero melanjutkannya jadi judul besar. Markupnya harus sama. */
  firstName: "Arif Herfian",
  lastName: "Zaen Chartiko",

  greeting: "Halo, perkenalkan saya",
  roleLead: "Saya seorang",
  typewriterRoles: ["UI/UX Designer", "Perancang Antarmuka", "Pendidik Informatika"],

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
