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

export const professionalSkills = [
  { icon: "fa-solid fa-comments", label: "Komunikasi Teknis" },
  { icon: "fa-solid fa-magnifying-glass-chart", label: "Analisis & Pemecahan Masalah" },
  { icon: "fa-solid fa-lightbulb", label: "Kreativitas" },
  { icon: "fa-solid fa-list-check", label: "Ketelitian" },
  { icon: "fa-solid fa-people-group", label: "Koordinasi Tim" },
];

export const languages = [
  { code: "ID", name: "Bahasa Indonesia" },
  {
    code: "EN",
    name: "Bahasa Inggris",
    note: "Pasif — membaca & menyimak, tersertifikasi UKBING 444",
  },
];
