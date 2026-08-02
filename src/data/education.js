export const education = {
  degree: "S1 Pendidikan Teknik Informatika",
  institution: "Universitas Negeri Malang",
  institutionUrl: "https://um.ac.id/",
  gradBadge: "Lulus 2025",

  /* Dipecah jadi tiga bidang, bukan satu string "IPK 3.62".
     Angkanya digulung sebagai odometer, jadi ia harus bisa diambil sendiri
     tanpa memotong-motong teks — dan skalanya (/ 4.00) tidak boleh ikut
     tergulung, karena bukan capaian melainkan keterangan. */
  ipkLabel: "IPK",
  ipkValue: "3.62",
  ipkScale: "/ 4.00",

  description:
    "Program studi yang memadukan ilmu pendidikan dengan teknologi informatika, berfokus pada kompetensi calon pendidik di bidang pemrograman, jaringan, dan sistem informasi.",
  tags: ["Pendidikan Teknologi", "Pemrograman", "Jaringan Komputer", "Sistem Informasi"],
};
