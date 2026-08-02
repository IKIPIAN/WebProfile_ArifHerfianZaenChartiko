import { AnimatePresence, motion } from "motion/react";
import { useScrolled } from "../../hooks/useScrolled";
import { useScroller } from "../core/scroller-context";

/*
 * Perjalanan pulang dihitung dari JARAK, bukan durasi tetap.
 *
 * Lenis memakai satu durasi untuk semua tujuan. Dari bagian atas halaman itu
 * terasa pas, tapi dari dasar halaman — yang di sini panjangnya belasan ribu
 * piksel karena rail mendatar menyisipkan pin-spacer — durasi yang sama berarti
 * kecepatan berlipat-lipat. Semua pemicu scrub dan bagian ter-pin harus
 * melewati seluruh rentangnya dalam waktu itu juga, dan hasilnya patah-patah.
 *
 * Dengan kecepatan yang dijaga tetap, jarak jauh otomatis dapat waktu lebih
 * lama. Batas atas tetap diperlukan supaya halaman yang sangat panjang tidak
 * berubah jadi perjalanan yang membosankan.
 */
const SPEED = 2200; // piksel per detik
const MIN_DURATION = 0.9; // detik — lompatan pendek jangan sampai terasa malas
const MAX_DURATION = 3; // detik — dari dasar halaman, seberapa pun panjangnya

/*
 * easeInOutCubic, menggantikan easing bawaan Lenis.
 *
 * Bawaannya expo-out: melesat sejak frame pertama lalu melambat panjang di
 * ujung. Justru sentakan awal itu yang terbaca sebagai "kecepetan". Kurva
 * in-out berangkat pelan, cepat di tengah saat tak ada yang perlu dibaca, lalu
 * mendarat pelan — perpindahan panjang jadi terasa dikendalikan.
 */
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* Di pojok kanan bawah. Mulai 900px ke atas, deretan penanda bagian milik
   StatusBar menempati sudut yang sama, jadi tombolnya diangkat ke atas deretan
   itu — bukan digeser ke samping, supaya tetap terbaca sebagai satu kolom
   kontrol di tepi kanan. */
export function BackToTopButton() {
  const visible = useScrolled(600);
  const { scrollTo } = useScroller();

  const handleClick = () => {
    const distance = window.scrollY;
    const duration = Math.min(Math.max(distance / SPEED, MIN_DURATION), MAX_DURATION);
    scrollTo(0, { duration, easing: easeInOutCubic });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          data-component="back-to-top"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          onClick={handleClick}
          title="Kembali ke atas"
          className="fixed right-6 bottom-6 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-background/70 text-text-muted backdrop-blur-md transition-colors duration-300 ease-power nav:bottom-18 hover:border-text/50 hover:text-text"
        >
          <i className="fa-solid fa-arrow-up text-sm" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
