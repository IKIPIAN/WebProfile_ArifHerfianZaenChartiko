import { useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../../animation/gsap";
import { prefersReducedMotion } from "../../animation/motion-tokens";
import { ScrollerContext } from "./scroller-context";
import { useAppReady } from "./ready-context";

export function Scroller({ children }) {
  const [lenis, setLenis] = useState(null);
  const ready = useAppReady();

  /*
   * Hitung ulang semua posisi pemicu setelah tata letak benar-benar final.
   *
   * Ini bukan kehati-hatian berlebih. Rail mendatar menyisipkan pin-spacer
   * setinggi lebih dari seribu piksel, dan itu mendorong turun SEMUA bagian di
   * bawahnya. Pemicu milik bagian-bagian itu sudah menghitung titik start dan
   * end-nya lebih dulu, saat spacer belum ada — hasilnya menunjuk ke posisi
   * yang sudah terlewat, sehingga animasinya diam di keadaan akhir dan penanda
   * bagian tidak pernah berpindah.
   *
   * Dijalankan di rAF supaya berjalan setelah frame tempat preloader dilepas,
   * bukan di tengah-tengahnya.
   */
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [ready]);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ duration: 1.1, smoothWheel: true });

    /* ScrollTrigger membaca posisi scroll dari event, dan Lenis harus
       di-drive oleh ticker GSAP — dua rAF loop terpisah membuat elemen
       ter-pin tertinggal satu frame dari kontennya. */
    instance.on("scroll", ScrollTrigger.update);
    const raf = (time) => instance.raf(time * 1000);
    gsap.ticker.add(raf);

    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  const api = useMemo(
    () => ({
      lenis,
      /* Sisa opsinya diteruskan apa adanya ke Lenis — `duration` dan `easing`
         per panggilan dipakai tombol kembali-ke-atas, yang butuh perjalanan
         jauh lebih lambat daripada lompatan antar bagian. Jalur cadangan tidak
         bisa meniru keduanya; scroll bawaan browser hanya kenal "smooth". */
      scrollTo(target, { immediate = false, ...options } = {}) {
        if (lenis) {
          lenis.scrollTo(target, { immediate, ...options });
        } else {
          const top = typeof target === "number" ? target : 0;
          window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
        }
      },
      stop: () => lenis?.stop(),
      start: () => lenis?.start(),
    }),
    [lenis],
  );

  return (
    <ScrollerContext.Provider value={api}>
      <div data-component="scroller" className="main scroller">
        {children}
      </div>
    </ScrollerContext.Provider>
  );
}
