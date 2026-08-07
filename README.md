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

**Jangan hapus `vercel.json`.** Isinya cuma empat baris yang semuanya `null`,
dan kelihatan tidak berguna, tapi ia menyelesaikan masalah nyata. Proyek Vercel
ini dibuat waktu situsnya masih React + Vite, jadi setelan di dasbornya masih
menjalankan `vite build`. Setelah ditulis ulang jadi HTML biasa, perintah itu
gagal terus — `vite: command not found` — dan Vercel diam-diam tetap
menayangkan versi React yang lama selama berminggu-minggu. `vercel.json`
menimpa setelan dasbor dan mengembalikannya ke "tidak usah dibangun, sajikan
saja isi foldernya".

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

Perkakas dibagi jadi lima kelompok berlabel — Riset & Desain, Pengembangan,
Pengajaran, Administrasi, AI — masing-masing satu blok `<div class="tool-row">`.
Isinya **4-3-2-2-3**, dan **jumlah kartu per baris ditentukan oleh Anda, bukan
oleh lebar layar**: sama persis di ponsel, tablet, maupun desktop.

Urutan kelompoknya bukan kebetulan: empat kelompok pertama mengikuti urutan
mesin ketik di halaman sampul — desain → pengembangan → pengajaran →
administrasi — supaya tiga peran yang diklaim di sana punya alasnya di sini.
AI ditaruh terakhir karena ia cara kerja, bukan peran. Kalau urutan mesin ketik
di `index.html` diubah, urutan baris di sini sebaiknya ikut.

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
label dan garis rambutnya, lalu ganti namanya. Kalau nama kelompoknya lebih
panjang dari "Riset & Desain", lebarkan `.tool-label` di CSS — kalau tidak,
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
