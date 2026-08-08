# Web Profil — Arif Herfian Zaen Chartiko

Situs satu halaman: **React + Vite + Tailwind CSS v4**, gerak dengan GSAP dan
Lenis.

## Cara menjalankan

```
npm install     # sekali saja
npm run dev     # buka alamat yang muncul, biasanya http://localhost:5173
```

`npm run build` menghasilkan folder `dist/`, dan `npm run preview` menayangkan
hasil build itu untuk diperiksa sebelum diterbitkan.

**Klik dua kali `index.html` TIDAK lagi bekerja.** Berkas itu sekarang cuma
kerangka; isinya dipasang React saat dijalankan. Ini konsekuensi yang disengaja
dari pindah ke React — sebelumnya situs ini memang bisa dibuka langsung tanpa
perkakas apa pun.

## Isi proyek

```
index.html            kerangka: meta, font, dan satu <div id="root">
src/main.jsx          titik masuk React
src/App.jsx           susunan bagian halaman
src/index.css         tema Tailwind + seluruh CSS milik situs
src/components/       satu berkas per bagian halaman
src/lib/animasi.js    seluruh gerak situs
public/assets/        foto, sertifikat, dan lambang perkakas
```

Yang perlu Anda sunting hampir selalu ada di `src/components/`.

## Kenapa React, dan apa yang berubah

Situs ini pernah ditulis React + Vite, lalu dipindah ke HTML/CSS/JS biasa
tanpa langkah build, lalu **dikembalikan ke React pada 8 Agustus 2026**.
Riwayat itu bukan sekadar berputar-putar — ada satu hal yang ikut terbawa
pulang, dan itu yang paling penting untuk diketahui:

**Tailwind sekarang berjalan sungguhan.** Versi HTML biasa memakai `style.css`
yang merupakan HASIL KOMPILASI yang dibekukan: ia hanya berisi kelas yang
kebetulan sudah dipakai, dan **kelas baru tidak berefek apa-apa — diam-diam,
tanpa pesan galat**. Itu memakan korban berkali-kali: `p-3` di bingkai foto
tidak pernah bekerja sejak berkas itu dibuat, dan `mt-10` juga mati waktu
dipasang. Sekarang kelas apa pun hidup.

### Satu perbedaan tampilan yang perlu Anda tahu

Di build beku yang lama, varian `sm:` MENIMPA `nav:` untuk properti yang sama.
Akibatnya di layar ≥900px semua nilai `nav:` diabaikan tanpa tanda. Tailwind
sungguhan menerapkannya dengan benar, jadi di desktop:

| di ≥900px | dulu (keliru) | sekarang | kelas yang memang ditulis |
|---|---|---|---|
| padding samping | 24px | 40px | `nav:px-10` |
| jarak antar blok | 80px | 96px | `nav:gap-24` |
| padding atas-bawah | 112px | 144px | `nav:py-36` |

Halaman jadi sekitar 650px lebih tinggi di 1440px. Kalau tampilan lama yang
diinginkan, ubah nilai `nav:`-nya — jangan mengembalikan build beku.

## Cara mengubah isi

### Mengganti teks

Cari kalimatnya di `src/components/`, ketik ulang. Halaman menyegarkan sendiri.

### Mengganti foto

Timpa `public/assets/photo/foto.jpeg`, lalu **sesuaikan rasio bingkainya** di
`src/components/Hero.jsx`: kelas `aspect-[853/1280]` adalah rasio berkas yang
sekarang. Kalau lupa disesuaikan, akan muncul pita kosong di satu sisi dan
jarak foto ke garis bingkai tidak lagi sama di keempat sisinya.

### Menambah sertifikat

1. Taruh PDF **dan** gambar pratinjaunya (JPG, lebar sekitar 900px) di
   `public/assets/certificate/`, dengan **nama dasar yang sama**.
2. Salin satu blok `<div data-arrive>` di `src/components/Sertifikat.jsx`,
   lalu ganti nama berkas, judul, dan keterangannya.

Angka jumlah sertifikat di bagian Pendidikan ikut sendiri — ia dihitung dari
jumlah kartu.

### Mengubah kemampuan profesional

Lima kartu berikon di `src/components/Keahlian.jsx`. Dua hal kalau menambah
atau menghapus:

- **Ikon, judul, dan keterangan harus jadi anak langsung `.skill-card`.**
  Ketiganya menempati barisnya masing-masing lewat `grid-template-rows:
  subgrid`, dan itulah yang membuatnya lurus sejajar dengan kartu sebelahnya.
- **Jumlah kolomnya terikat ke jumlah kartu.** Sekarang kisinya enam kolom:
  tiga kartu pertama merentang dua kolom, dua terakhir merentang tiga.

### Menambah perkakas

Empat kelompok berlabel — Pengembangan, Pengajaran, Administrasi, AI — dengan
isi **4-2-2-3**. Jumlah kartu per baris ditentukan oleh Anda, bukan lebar
layar: sama persis di ponsel, tablet, maupun desktop.

**Kalau menambah atau menghapus kartu, `data-delay`-nya harus dihitung ulang.**
Tiap kartu naik 0,03 detik berurutan dari nol menembus semua kelompok, dan
label tiap kelompok memakai jeda kartu pertamanya.

Untuk lambangnya, **buka situs resmi perkakasnya, bukan kumpulan lambang pihak
ketiga.** Tiga jebakan yang sudah pernah kena:

- **Warna di halaman belum tentu warna mereknya.** Lambang Wayground tampil
  krem di situs mereka semata karena latar halamannya merah tua; warna
  mereknya merah muda. Kalau ragu, buka favicon-nya.
- **Sebagian merek tidak punya berkas lambang sama sekali.** Wordmark Stitch
  adalah teks hidup, bukan gambar. SVG-nya di sini dibuat dengan mengurai font
  yang dimuat halaman itu.
- **Rona lama masih banyak beredar.** Figma sudah berganti palet.

### Mengubah warna

Semua di blok `@theme` paling atas `src/index.css`. Ubah satu nilai dan
seluruh situs ikut — termasuk kelas seperti `bg-accent` dan `text-text-muted`,
karena keduanya dihasilkan dari token yang sama.

## Yang perlu diketahui sebelum mengutak-atik

**Semua jarak kelipatan 4px, dan hampir semua ukuran font juga.** Satu satuan
Tailwind 0,25rem = 4px: `mb-4` jadi 16px, `gap-6` jadi 24px. Jangan pakai
kelas pecahan seperti `py-1.5`. Margin tepi halaman `px-4` (16px).

Ukuran font memakai sepuluh langkah: 12, 14, 16, 18, 20, 24, 28, 40, 52, 68.
Delapan di antaranya kelipatan 4; **14 dan 18 sengaja dikecualikan**, karena
tanpa keduanya `-body-small` dan `-title-4` runtuh jadi 16px dan tiga tingkat
hierarki hilang sekaligus.

**`wide:` dan `roomy:` bukan sekadar lebar layar.** Keduanya juga menanyakan
orientasi, dan `roomy:` menanyakan tinggi — supaya tablet potret tidak dipaksa
tata letak dua kolom. Definisinya `@custom-variant` di `src/index.css`.

**Gerak dipasang lewat `useLayoutEffect` dan WAJIB membongkar diri.** React
StrictMode memasang lalu melepas lalu memasang lagi tiap efek waktu
pengembangan, dan simpul DOM-nya tidak dibuat ulang. Tanpa pembongkaran, tiap
pendengar peristiwa dan pemicu scroll terpasang dua kali. Karena itu setiap
efek samping di `src/lib/animasi.js` didaftarkan lewat `dengar()`,
`tambahTicker()`, `amati()`, dan `tambahSimpul()` — jangan panggil
`addEventListener`, `gsap.ticker.add`, `new ResizeObserver`, atau
`appendChild` langsung.

`tambahSimpul()` yang paling mudah terlupa, karena `removeEventListener()`
tidak mengeluarkan simpul dari pohon DOM — jadi `appendChild()` adalah efek
samping tersendiri. StrictMode menjalankan efek mount → unmount → mount pada
simpul host yang sama, sehingga `appendChild` yang tidak terdaftar berjalan
dua kali dan **menumpuk, bukan menimpa**: `.chapter-dot` pernah jadi 12
(seharusnya 6) dan anak `.marquee-track` jadi 7 (seharusnya 4), tanpa satu pun
galat terlempar. Akibatnya bilah bab tampil utuh tapi separuh titiknya diam
saat diklik.

### Lompatan antar bagian harus mendarat di 0

Semua lompatan bermuara ke satu `scrollTo()` di `animasi.js`, dan tepi atas
bagian tujuan harus berhenti **persis** di tepi atas viewport.

**Jangan memasang `scroll-mt-*` pada `<section id>`.** Kelas itu menghasilkan
`scroll-margin-top`, yang dibaca Lenis (juga `scrollIntoView()` bawaan) sebagai
cadangan ruang, sehingga titik berhentinya jadi `offsetTop - nilai` — dulu
`scroll-mt-24` membuat setiap lompatan meleset tetap 96px di semua lebar.
Cadangan itu gunanya menghindari header `position: fixed`; halaman ini tidak
punya, bilah babnya di bawah. Jarak di atas judul sudah dari padding section.

**Komentar di dalam berkas menjelaskan KENAPA, bukan apa.** Sebagian besar
angka di situs ini hasil pengukuran, bukan selera.

## Cara menerbitkan

Butuh build, jadi tidak bisa lagi sekadar menyeret folder.

Di Vercel: Framework Preset **Vite**, Build Command `npm run build`, Output
Directory `dist`. Kalau diimpor dari repo ini, Vercel memilih itu sendiri.

Setelah mengubah apa pun yang berhubungan dengan penerbitan, **buka situs yang
tayang dan pastikan perubahannya benar-benar ada di sana.** Pernah terjadi
`git push` sukses berminggu-minggu sementara Vercel diam-diam terus
menayangkan bangunan lama yang berhasil, karena setiap build baru gagal.
Jangan percaya pada `git push` yang sukses.
