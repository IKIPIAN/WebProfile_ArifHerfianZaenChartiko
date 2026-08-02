/*
 * Empat keahlian teknis, mengikuti pengelompokan di CV terbaru.
 *
 * Versi sebelumnya mendaftar perkakas (Python, Cisco Packet Tracer, MS Office)
 * sebagai keahlian tersendiri. CV terbaru menggantinya dengan empat bidang
 * kerja — dan itu pengelompokan yang lebih tepat untuk seorang perancang:
 * yang dinilai orang adalah apa yang bisa dikerjakan, bukan daftar aplikasi
 * yang pernah dibuka. Perkakasnya tetap muncul, tapi di dalam uraian dan di
 * bagian sertifikat, tempat yang memang menjelaskan asal usulnya.
 */
/* `word` adalah versi satu-kata dari judulnya, dipakai sebagai huruf raksasa
   yang bertumpuk lalu pecah di panggung keahlian. Diambil dari kata pertama
   judul masing-masing — bukan istilah baru — supaya yang terbaca saat pecah
   dan yang terbaca di kartunya tetap satu hal yang sama. */
export const technicalSkills = [
  {
    icon: "fa-solid fa-pen-ruler",
    word: "DESAIN",
    title: "Desain UI/UX",
    description:
      "Penyusunan layout, hierarki visual, sistem tipografi dan warna, serta alur pengalaman pengguna yang mudah diikuti.",
  },
  {
    icon: "fa-solid fa-code",
    word: "PENGEMBANGAN",
    title: "Pengembangan Web",
    description:
      "Membangun tampilan web yang responsif dengan HTML, CSS, dan JavaScript — sehingga rancangan tetap terhubung dengan cara membangunnya.",
  },
  {
    icon: "fa-solid fa-chalkboard-user",
    word: "PENGAJARAN",
    title: "Pengajaran Teknis",
    description:
      "Mengajar pemrograman dasar, jaringan dasar, dan teknologi layanan jaringan, termasuk mengawasi dan mengevaluasi proyek akhir siswa.",
  },
  {
    icon: "fa-solid fa-folder-open",
    word: "ADMINISTRASI",
    title: "Administrasi Digital",
    description:
      "Pendataan, pencatatan surat masuk dan keluar, pengelolaan disposisi, serta digitalisasi arsip.",
  },
];

/*
 * Tiap keahlian dibarengi SATU BARIS BUKTI, bukan dibiarkan berdiri sendiri.
 *
 * Kata "Ketelitian" saja tidak membuktikan apa pun — semua orang menuliskannya.
 * Yang membedakan daftar sifat dari daftar yang meyakinkan adalah dari mana
 * sifat itu datang. Karena itu keterangannya sedapat mungkin menunjuk
 * pengalaman yang memang sudah tercatat di bagian lain situs ini: ruang kelas,
 * meja administrasi dinas, dan kepanitiaan lomba.
 *
 * Panjangnya dijaga tidak lebih dari sekitar 55 karakter. Kartunya berjajar
 * lima di layar lebar, dan kalimat yang melewati dua baris memaksa satu kartu
 * tumbuh lebih tinggi daripada tetangganya — kisinya berhenti terbaca rata.
 * Lebih pendek dari itu tidak masalah; yang merusak hanya yang kepanjangan.
 */
export const professionalSkills = [
  {
    icon: "fa-solid fa-comments",
    label: "Komunikasi Teknis",
    note: "Menjelaskan hal teknis ke orang awam.",
  },
  {
    icon: "fa-solid fa-magnifying-glass-chart",
    label: "Analisis & Pemecahan Masalah",
    note: "Menelusuri akar masalah sebelum memilih solusinya.",
  },
  {
    icon: "fa-solid fa-lightbulb",
    label: "Kreativitas",
    note: "Menyiapkan beberapa alternatif, bukan satu ide saja.",
  },
  {
    icon: "fa-solid fa-list-check",
    label: "Ketelitian",
    note: "Terlatih dari pendataan dan pengelolaan surat dinas.",
  },
  {
    icon: "fa-solid fa-people-group",
    label: "Koordinasi Tim",
    note: "Kepanitiaan proker dan pengarahan tim service center.",
  },
];

export const languages = [
  /* Diberi keterangan juga supaya sejajar dengan baris di bawahnya — satu
     baris berketerangan di sebelah baris kosong membuat yang kosong terbaca
     seperti data yang gagal dimuat. "Aktif" sengaja dipasangkan dengan
     "Pasif" di baris Inggris. */
  { code: "ID", name: "Bahasa Indonesia", note: "Aktif — lisan dan tulisan, penutur asli" },
  {
    code: "EN",
    name: "Bahasa Inggris",
    note: "Pasif — membaca dan mendengarkan, tersertifikasi UKBING 444",
  },
];
