import { useLayoutEffect } from "react";
import { pasangAnimasi } from "./lib/animasi.js";

import Hero from "./components/Hero.jsx";
import Tentang from "./components/Tentang.jsx";
import Pengalaman from "./components/Pengalaman.jsx";
import Keahlian from "./components/Keahlian.jsx";
import Pendidikan from "./components/Pendidikan.jsx";
import Sertifikat from "./components/Sertifikat.jsx";
import Kontak from "./components/Kontak.jsx";
import Footer from "./components/Footer.jsx";
import Antarmuka from "./components/Antarmuka.jsx";
import Pembuka from "./components/Pembuka.jsx";

export default function App() {
  /*
   * useLayoutEffect, BUKAN useEffect.
   *
   * Seluruh gerak situs ini dimulai dari keadaan tersembunyi: elemen
   * ber-scrub-reveal punya clip-path yang memotongnya habis, huruf judul
   * menunggu di bawah topengnya. Yang memulihkannya adalah kode di
   * pasangAnimasi(). useEffect berjalan SETELAH frame pertama digambar, jadi
   * akan ada satu frame di mana halaman tampil dengan bagian-bagian yang
   * terpotong. useLayoutEffect berjalan sebelum gambar pertama.
   *
   * Nilai kembaliannya wajib dikembalikan lagi dari sini — itu yang
   * membongkar semua pendengar, ticker, dan pemicu scroll. Lihat komentar
   * di src/lib/animasi.js untuk kenapa itu tidak boleh dilewat.
   */
  useLayoutEffect(() => pasangAnimasi(), []);

  /*
   * <main> membungkus tujuh bagian isi, tapi TIDAK footer dan bilah status.
   * Itu bukan selera: pembaca layar memakai <main> untuk melompat langsung ke
   * isi, melewati navigasi dan hiasan. Kalau footer ikut masuk, lompatannya
   * kehilangan gunanya.
   */
  /*
   * Pembungkus scroller harus tetap ada dan harus membungkus SEMUANYA,
   * termasuk footer dan bilah status. Lenis memakainya sebagai wadah gulir;
   * kalau ada yang berdiri di luar, bagian itu tidak ikut tergulir halus dan
   * terlihat menyentak sendiri saat yang lain mengalir.
   */
  return (
    <div data-component="scroller" className="main scroller">
      <main>
        <Hero />
        <Tentang />
        <Pengalaman />
        <Keahlian />
        <Pendidikan />
        <Sertifikat />
        <Kontak />
      </main>
      <Footer />
      <Antarmuka />

      {/* Ditaruh paling akhir supaya ia berada di atas saudara-saudaranya
          tanpa mengandalkan z-index semata. Ia `position: fixed`, jadi tetap
          menutup seluruh layar meski bersarang di dalam pembungkus scroller. */}
      <Pembuka />
    </div>
  );
}
