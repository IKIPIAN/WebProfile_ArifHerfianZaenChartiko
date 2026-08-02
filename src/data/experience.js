/*
 * Urutannya KRONOLOGIS (yang paling awal di depan), bukan terbalik seperti CV.
 *
 * Bagian ini dirender sebagai rail mendatar yang memetakan waktu ke ruang:
 * makin ke kanan, makin kemudian. Memasang urutan terbalik di sana akan
 * membuat gerak ke kanan berarti mundur ke masa lalu.
 */
export const experienceList = [
  {
    role: "Guru Informatika",
    company: "SMKN 3 Malang",
    companyUrl: "https://smkn3malang.sch.id/",
    period: "Februari - Juni 2024",
    responsibilities: [
      "Mengajar mata pelajaran pemrograman dasar, jaringan dasar, dan teknologi layanan jaringan (TLJ)",
      "Mengawasi dan mengevaluasi siswa, serta memastikan pemahaman dan proyek akhir selesai sesuai timeline dan target",
      "Merencanakan, mengadakan, dan mengoordinasi program kerja SEMAR “Seminar Marketing”",
      "Mendigitalisasi arsip sekolah dan mendukung kegiatan operasional sekolah",
    ],
    tags: ["Pemrograman Dasar", "Jaringan Dasar", "TLJ", "Manajemen Siswa"],
  },
  {
    role: "Staf Administrasi",
    company: "Dinas Pendidikan Kota Malang",
    companyUrl: "https://dikbud.malangkota.go.id/",
    period: "Juni - Agustus 2024",
    responsibilities: [
      "Mendata, mengelola, dan melayani serah terima seragam sekolah serta buku kurikulum",
      "Mendata penulisan disposisi serta pencatatan surat masuk dan keluar",
      "Melayani koreksi kesalahan penulisan ijazah siswa",
      "Mendata dan melayani pengajuan dana BOSDA dan NPHD",
    ],
    tags: ["Administrasi Digital", "Pendataan", "Pelayanan", "Ketelitian"],
  },
];
