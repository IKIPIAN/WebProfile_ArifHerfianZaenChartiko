/*
 * Satu-satunya sumber kebenaran untuk urutan bagian.
 *
 * Situs ini satu halaman panjang, jadi `id` di sini adalah anchor sekaligus
 * target scroll navbar, dan `tone` menentukan nada latar bagian tersebut.
 * Nada sengaja berselang-seling supaya batas antar bagian terbaca tanpa perlu
 * garis pemisah — kalau dua bagian bersebelahan memakai nada yang sama,
 * keduanya akan menyatu jadi satu bidang panjang.
 */
export const chapters = [
  {
    id: "home",
    label: "Beranda",
    title: "Arif Herfian",
    accent: "Zaen Chartiko",
    tone: "base",
  },
  {
    id: "tentang",
    label: "Tentang",
    title: "Tentang",
    accent: "Saya",
    subtitle: "Latar belakang, cara saya bekerja, dan apa yang saya kerjakan sekarang",
    tone: "warm",
  },
  {
    id: "pengalaman",
    label: "Pengalaman",
    title: "Pengalaman",
    accent: "Kerja",
    subtitle: "Riwayat pekerjaan yang pernah saya jalani",
    tone: "deep",
  },
  {
    id: "keahlian",
    label: "Keahlian",
    title: "Keahlian",
    accent: "Saya",
    subtitle: "Kemampuan desain, teknis, dan non teknis yang saya bawa ke setiap proyek",
    tone: "warm",
  },
  {
    id: "pendidikan",
    label: "Pendidikan",
    title: "Riwayat",
    accent: "Pendidikan",
    subtitle: "Jenjang pendidikan yang telah saya tempuh",
    tone: "sand",
  },
  {
    id: "sertifikat",
    label: "Sertifikat",
    /* Satu-satunya bab tanpa `accent` dan tanpa `subtitle`, dan keduanya
       disengaja. Isinya semua sertifikat — tidak ada prestasi di sana — jadi
       "& Prestasi" menjanjikan sesuatu yang tidak pernah muncul di bawahnya. */
    title: "Sertifikat",
    tone: "warm",
  },
  {
    id: "kontak",
    label: "Kontak",
    title: "Hubungi",
    accent: "Saya",
    subtitle: "Terbuka untuk peluang desain, kolaborasi, atau diskusi seputar produk dan pendidikan",
    tone: "deep",
  },
];

/* Beranda tidak diberi nomor: ia pembuka, bukan salah satu bab. */
export const numberedChapters = chapters.filter((chapter) => chapter.id !== "home");

export const navLinks = chapters;

export function getChapter(id) {
  return chapters.find((chapter) => chapter.id === id) ?? chapters[0];
}

export function chapterNumber(id) {
  const position = numberedChapters.findIndex((chapter) => chapter.id === id);
  return position === -1 ? null : position + 1;
}
