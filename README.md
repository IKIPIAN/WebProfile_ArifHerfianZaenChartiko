# Web Profil — Arif Herfian Zaen Chartiko

Situs satu halaman: HTML, CSS, dan JavaScript biasa. **Tidak ada langkah build,
tidak ada npm, tidak ada terminal.** Klik dua kali `index.html` dan situsnya
jalan.

## Isi proyek

```
index.html          seluruh isi halaman — teks, gambar, susunan
css/style.css       seluruh tampilan
js/main.js          seluruh gerak
js/vendor/          tiga pustaka, disimpan sendiri (bukan dari CDN)
assets/             foto, ikon, PDF sertifikat, gambar pratinjaunya
```

Hanya 34 berkas. Yang perlu Anda sunting hampir selalu cuma `index.html`.

## Cara menjalankan

**Untuk melihat hasil:** klik dua kali `index.html`.

Satu-satunya yang tidak bekerja lewat cara itu: tidak ada. Semua animasi jalan
penuh dari berkas lokal, karena ketiga pustakanya ada di `js/vendor/` dan bukan
diambil dari internet.

**Untuk menyunting sambil melihat perubahan langsung:** buka folder ini di VS
Code, klik kanan `index.html` → *Open with Live Server*. Tidak wajib, tapi lebih
nyaman karena halaman menyegarkan sendiri tiap kali Anda menyimpan.

## Cara menerbitkan

Seret folder ini ke [vercel.com](https://vercel.com) atau
[netlify.com](https://netlify.com). Tidak ada yang perlu disetel — tidak ada
perintah build, tidak ada folder keluaran. Bisa juga lewat GitHub Pages.

## Cara mengubah isi

### Mengganti teks

Cari kalimatnya di `index.html` dan ketik ulang. Selesai.

### Menambah sertifikat

1. Taruh berkas PDF-nya di `assets/`.
2. Taruh gambar pratinjaunya (JPG, lebar sekitar 900px) di `assets/cert/`.
3. Salin satu blok `<div data-arrive>` di bagian Sertifikat, tempel di bawahnya,
   lalu ganti nama berkas, judul, keterangan, dan ikonnya.

Angka jumlah sertifikat di bagian Pendidikan **ikut sendiri** — ia dihitung dari
jumlah kartu, bukan ditulis manual.

### Menambah perkakas

Salin satu blok di kisi Perkakas, ganti gambar dan namanya. Kisinya menata
ulang sendiri berapa pun jumlahnya; baris terakhir selalu terpusat.

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

**Mode ringan.** Perangkat lemah (prosesor ≤4 inti, RAM ≤4 GB, atau layar
≤899px) otomatis mendapat kelas `is-lite` di elemen `<html>`, yang mematikan dua
efek termahal dan memecah huruf raksasa per kata alih-alih per huruf. Aturannya
ada di `<head>` `index.html`; efeknya di bagian "MODE RINGAN" `css/style.css`.

## Riwayat

Situs ini sebelumnya dibangun dengan React + Vite + Tailwind. Versi itu masih
tersimpan utuh di riwayat Git dan bisa dikembalikan kapan saja:

```
git checkout 42744df
```
