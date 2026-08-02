/* Titik masuk tunggal untuk GSAP. Semua modul lain mengimpor dari sini supaya
   registerPlugin hanya terjadi sekali dan tidak ada file yang diam-diam
   memakai ScrollTrigger tanpa mendaftarkannya lebih dulu. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Lenis yang menggerakkan scroll, jadi GSAP ticker yang harus memanggil rAF —
 * dua rAF loop terpisah bikin scroll dan animasi beda satu frame. */
gsap.ticker.lagSmoothing(0);

/* Hanya di mode pengembangan: memicu masalah scroll nyaris mustahil ditelusuri
   dari luar tanpa bisa membaca daftar pemicu beserta titik start/end-nya. */
if (import.meta.env.DEV) {
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
}

export { gsap, ScrollTrigger };
