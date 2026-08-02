import { AnimatePresence, motion } from "motion/react";
import { useScrolled } from "../../hooks/useScrolled";
import { useScroller } from "../core/scroller-context";

/* Ditaruh di kanan atas, bukan kanan bawah: sudut kanan bawah sudah dipakai
   deretan penanda bagian, dan dua kontrol melayang yang berdempetan saling
   menutupi di layar sempit. */
export function BackToTopButton() {
  const visible = useScrolled(600);
  const { scrollTo } = useScroller();

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          data-component="back-to-top"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          onClick={() => scrollTo(0)}
          title="Kembali ke atas"
          className="fixed top-6 right-[4.5rem] z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-background/70 text-text-muted backdrop-blur-md transition-colors duration-300 ease-power hover:border-text/50 hover:text-text"
        >
          <i className="fa-solid fa-arrow-up text-xs" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
