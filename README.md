# Web Profil — Arif Herfian Zaen Chartiko

Situs satu halaman: HTML, CSS, dan JavaScript biasa. **Tidak ada langkah build,
tidak ada npm, tidak ada terminal.** Klik dua kali `index.html` dan situsnya
jalan.

## Isi proyek

```
index.html            seluruh isi halaman — teks, gambar, susunan
css/style.css         seluruh tampilan
js/main.js            seluruh gerak
js/vendor/            tiga pustaka, disimpan sendiri (bukan dari CDN)
assets/photo/         foto diri
assets/certificate/   sertifikat — PDF asli dan gambar pratinjaunya
assets/icons/         logo perkakas
```

Hanya 32 berkas. Yang perlu Anda sunting hampir selalu cuma `index.html`.

## Cara menjalankan

**Untuk melihat hasil:** klik dua kali `index.html`.

Satu-satunya yang tidak bekerja lewat cara itu: tidak ada. Semua animasi jalan
penuh dari berkas lokal, karena ketiga pustakanya ada di `js/vendor/` dan bukan
diambil dari internet.

**Untuk menyunting sambil melihat perubahan langsung:** buka folder ini di VS
Code, klik kanan `index.html` → *Open with Live Server*. Tidak wajib, tapi lebih
nyaman karena halaman menyegarkan sendiri tiap kali Anda menyimpan.

## Cara menerbitkan

Situs ini sudah tersambung ke [Vercel](https://vercel.com) lewat GitHub: tiap
`git push` ke `main` otomatis menerbitkan ulang. Tidak ada yang perlu disetel —
tidak ada perintah build, tidak ada folder keluaran.

Kalau suatu saat proyek Vercel-nya dibuat ulang, **Framework Preset harus
`Other` dan Build Command harus kosong.** Kalau diimpor dari repo ini, Vercel
memilih itu sendiri — repo ini tidak punya `package.json`, jadi tidak ada yang
bisa disalahdeteksi. Yang perlu diwaspadai cuma kalau setelan itu diubah
manual.

Alasannya ada riwayatnya. Proyek Vercel yang pertama dibuat waktu situs ini
masih React + Vite, jadi Build Command-nya `vite build`. Setelah ditulis ulang
jadi HTML biasa, perintah itu gagal terus — `vite: command not found`, exit
127 — dan yang berbahaya bukan kegagalannya, melainkan caranya gagal: `git
push` tetap sukses, GitHub tetap terisi, tapi Vercel diam-diam bertahan
menayangkan bangunan React terakhir yang berhasil. Berminggu-minggu perubahan
tidak pernah kelihatan di situs yang tayang, tanpa satu pun tanda peringatan.

Jadi setelah mengubah apa pun yang berhubungan dengan penerbitan, **buka situs
yang tayang dan pastikan perubahannya benar-benar ada di sana.** Jangan percaya
pada `git push` yang sukses.

Kalau suatu saat pindah ke Netlify atau GitHub Pages, cukup seret foldernya —
tidak ada langkah tambahan.

## Cara mengubah isi

### Mengganti teks

Cari kalimatnya di `index.html` dan ketik ulang. Selesai.

### Menambah sertifikat

1. Taruh PDF-nya **dan** gambar pratinjaunya (JPG, lebar sekitar 900px) di
   `assets/certificate/`. **Beri nama dasar yang sama**, misalnya
   `sertifikat-baru.pdf` dan `sertifikat-baru.jpg` — keduanya memang sepasang:
   yang JPG tampil di kartu, yang PDF terbuka saat kartunya diklik.
2. Salin satu blok `<div data-arrive>` di bagian Sertifikat, tempel di bawahnya,
   lalu ganti nama berkas, judul, keterangan, dan ikonnya.

Angka jumlah sertifikat di bagian Pendidikan **ikut sendiri** — ia dihitung dari
jumlah kartu, bukan ditulis manual.

### Menambah perkakas

Perkakas dibagi jadi empat kelompok berlabel — Pengembangan, Pengajaran,
Administrasi, AI — masing-masing satu blok `<div class="tool-row">`. Isinya
**3-2-2-3**, dan **jumlah kartu per baris ditentukan oleh Anda, bukan oleh
lebar layar**: sama persis di ponsel, tablet, maupun desktop.

Urutan kelompoknya bukan kebetulan: tiga kelompok pertama mengikuti urutan
peran di mesin ketik halaman sampul, supaya tiap peran yang diklaim di sana
punya alasnya di sini. AI ditaruh terakhir karena ia cara kerja, bukan peran.
Kalau urutan mesin ketik di `index.html` diubah, urutan baris di sini
sebaiknya ikut.

Kelompok kelima, "Riset & Desain" (Figma, Google Analytics, Maze, Notion),
dibuang bersama keempat berkas ikonnya waktu peran utama berganti dari UI/UX
Designer jadi Web Developer — ia berdiri paling depan padahal tidak lagi
mewakili peran mana pun yang diklaim di sampul.

**Kalau menambah atau menghapus kartu, jeda animasinya harus dihitung ulang.**
Tiap kartu punya `data-delay` yang naik 0,03 detik berurutan dari nol
menembus semua kelompok, dan label beserta garis rambut tiap kelompok memakai
jeda kartu pertamanya. Kalau ada lompatan angka, satu kelompok akan terlihat
menunggu giliran yang tidak pernah datang.

Satu perkakas hanya ditulis di **satu** kelompok, meski dipakai di beberapa
peran. MS Office misalnya dipakai untuk modul ajar dan penilaian, tapi tetap
berdiri di Administrasi saja — begitu juga VS Code yang dipakai mengajar tapi
berdiri di Pengembangan. Yang menjelaskan perkakas mana dipakai untuk peran
mana adalah kartu di bagian Pengalaman, bukan pengulangan ikon.

Untuk menambah perkakas: salin satu blok kartu, tempel ke dalam kelompok yang
sesuai, lalu ganti gambar dan namanya.

Dua hal yang perlu diperhatikan kalau menambah:

- **Kelompok berisi lima kartu akan berisi lima di semua perangkat**, termasuk
  ponsel — di sana tiap kartu cuma kebagian seperlima lebar layar dan namanya
  hampir pasti pecah beberapa baris.
- **Nama perkakas sebaiknya tidak lebih panjang dari "Google Workspace".**
  Lebar kartu di desktop (9,5rem) dipas ke nama itu. Nama yang lebih panjang
  akan pecah dua baris dan membuat tinggi kelompoknya berbeda dari yang lain.

Kedua angka itu ada di bagian "KISI PERKAKAS" paling bawah `css/style.css`,
lengkap dengan alasannya.

Untuk menambah **kelompok baru**, salin satu blok `tool-row` utuh beserta
label dan garis rambutnya, lalu ganti namanya. `.tool-label` di CSS masih
selebar 10,5rem — dulu dipas ke "Riset & Desain" yang sekarang sudah tidak
ada, jadi ada kelonggaran. Kalau nama kelompoknya lebih panjang dari itu,
lebarkan angkanya — kalau tidak,
garis rambut kelompok itu tidak akan lurus sejajar dengan yang lain.

### Mengubah warna

Semua warna ada di `css/style.css`, di blok `:root` paling atas. Ubah satu
nilai di sana dan seluruh situs ikut berubah.

## Yang perlu diketahui sebelum mengutak-atik

**Kelas seperti `mb-4` atau `flex` datang dari Tailwind, tapi Tailwind sudah
tidak ada di sini.** `css/style.css` adalah hasil kompilasinya yang dibekukan —
ia hanya berisi kelas yang memang dipakai halaman ini. Artinya: memakai kelas
BARU yang belum pernah dipakai (misalnya `mt-14` kalau belum ada) tidak akan
berpengaruh apa-apa. Untuk gaya baru, tulis CSS-nya sendiri di bagian bawah
`css/style.css`.

**Semua jarak kelipatan 4px, dan hampir semua ukuran font juga.** Ini datang
gratis dari Tailwind, yang satu satuannya 0,25rem = 4px: `mb-4` jadi 16px,
`gap-6` jadi 24px, `p-7` jadi 28px. Jadi **jangan pakai kelas pecahan** seperti
`py-1.5` atau `gap-2.5` — keduanya meleset dari kisi. Margin tepi halaman
memakai `px-4` (16px).

Ukuran font memakai sepuluh langkah: 12, 14, 16, 18, 20, 24, 28, 40, 52, 68.
Tidak ada angka ganjil. Delapan di antaranya kelipatan 4; **14 dan 18 sengaja
dikecualikan**, karena tanpa keduanya `-body-small` dan `-title-4` runtuh jadi
16px seperti `-body` dan tiga tingkat hierarki hilang sekaligus. Di rentang
11–24px cuma ada empat kelipatan 4 (12, 16, 20, 24) untuk menampung tujuh
tingkat teks — aritmetikanya memang tidak muat.

Dua utilitas, `.py-2` dan `.py-4`, ditulis tangan di bagian bawah
`css/style.css`. Keduanya tidak ikut terkompilasi karena belum pernah dipakai,
padahal dibutuhkan untuk menggantikan `py-1.5` dan `py-3.5`.

**Komentar di dalam berkas menjelaskan KENAPA, bukan apa.** Sebelum mengubah
angka yang terlihat aneh, baca komentar di atasnya — sebagian besar angka di
situs ini hasil pengukuran, bukan selera, dan komentarnya menyebutkan apa yang
rusak kalau diubah.

**Satu tampilan untuk semua perangkat.** Situs ini pernah punya "mode ringan":
di layar ≤899px, ledakan 40 huruf di bagian Keahlian diganti 4 baris kata dan
dua efek buram dimatikan. Semuanya sudah dibuang, dan alasannya perlu diketahui
sebelum ada yang tergoda membuatnya lagi:

- **Memotong jumlah elemen tidak menolong.** Diukur tiga kali, per huruf 20,6
  fps dan per kata 21,6 fps — selisihnya di dalam derau alat ukur.
- **Ambangnya salah kaprah.** Lebar layar bukan ukuran kekuatan perangkat.
  Laptop lemah 1920px justru mendapat jalur terberat, sementara tablet kuat
  mendapat jalur ringan.
- **Yang benar-benar mahal adalah efek buram**, karena dihitung per piksel
  layar, bukan per elemen. Keduanya sudah dibuang untuk semua perangkat, dan
  frame yang tersendat turun lebih dari separuh.

Angka lengkapnya ada di bagian "PANGGUNG KEAHLIAN" paling bawah
`css/style.css`.

## Riwayat

Situs ini sebelumnya dibangun dengan React + Vite + Tailwind. Versi itu masih
tersimpan utuh di riwayat Git dan bisa dikembalikan kapan saja:

```
git checkout 42744df
```
