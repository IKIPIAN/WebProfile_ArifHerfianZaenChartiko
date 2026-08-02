import { useEffect, useRef } from "react";
import { gsap } from "../../animation/gsap";
import { EASE_SCRUB, SCRUB, prefersReducedMotion } from "../../animation/motion-tokens";

/*
 * TRANSISI 5 — BALOK MENDATAR YANG BERPUTAR TURUN.
 *
 * Kartu-kartu berdiri sebaris, tapi mulanya terlipat RATA ke belakang pada
 * garis engsel di tepi atasnya — jadi yang terlihat pertama cuma sisi tipis
 * balok mendatar. Saat digulir, tiap kartu berputar turun ke arah pembaca
 * sampai tegak menghadap depan.
 *
 * Angka-angkanya diukur langsung dari trionn.com, bukan dikira-kira:
 *
 *   perspective        1400px, dipasang di WADAH — bukan di tiap kartu
 *   transform-origin   50% 0%   (tepi atas: garis engselnya)
 *   rotateX            -92° → 0°
 *   jarak antar kartu  20,83° tetap, sepanjang gerak
 *   opacity            lurus mengikuti rotasi (1 - rotX/92)
 *
 * Tiga hal yang menentukan apakah ini terbaca sebagai balok berputar atau
 * cuma kartu yang muncul:
 *
 * 1. PERSPECTIVE DI WADAH, BUKAN DI KARTU. Kalau tiap kartu punya perspective
 *    sendiri, masing-masing berputar di ruang tiga dimensinya sendiri dan
 *    semuanya tampak identik. Dipasang di wadah, titik pandangnya SATU untuk
 *    semua — kartu di tepi jadi terlihat menyerong ke arah tengah, persis
 *    seperti benda nyata yang dilihat dari satu tempat berdiri.
 *
 * 2. ENGSELNYA DI TEPI ATAS. Titik putar di tengah membuat kartu berputar
 *    seperti kartu remi yang dibalik. Di tepi atas, ia jatuh seperti daun
 *    pintu — dan itu yang membuatnya terasa punya berat.
 *
 * 3. -92°, BUKAN -90°. Dua derajat lebih jauh dari rata sempurna. Tepat di 90°
 *    kartu jadi bidang setebal nol yang bisa berkedip jadi garis rambut
 *    seperak-piksel; melewatinya sedikit membuat sisi belakang yang menghadap
 *    pembaca, dan `backface-visibility: hidden` menyembunyikannya bersih.
 *
 * Jarak antar kartu 20,83° dari total 92° berarti 0,2264 satuan durasi —
 * cukup rapat sehingga selalu ada dua kartu berputar bersamaan, jadi barisnya
 * terbaca sebagai satu gelombang, bukan antrean yang bergiliran.
 */

const LIPAT = -92;
const JEDA = 0.2264;

const dariLipat = () => ({ rotateX: LIPAT, autoAlpha: 0 });
const keTegak = () => ({ rotateX: 0, autoAlpha: 1, duration: 1, ease: EASE_SCRUB });

export function HingeCards({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    if (prefersReducedMotion()) return;

    const cards = gsap.utils.toArray(list.querySelectorAll("[data-hinge]"));
    if (!cards.length) return;

    const mm = gsap.matchMedia();

    /* Sebaris: SATU pemicu untuk semua kartu, karena posisi vertikalnya sama
       dan yang membedakan hanyalah gilirannya. */
    mm.add("(min-width: 900px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: list,
          start: "clamp(top 82%)",
          end: "clamp(top 25%)",
          scrub: SCRUB,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((card, i) => tl.fromTo(card, dariLipat(), keTegak(), i * JEDA));

      return () => gsap.set(cards, { clearProps: "all" });
    });

    /* Bertumpuk: tiap kartu dapat pemicunya SENDIRI. Satu pemicu bersama akan
       memutar kartu bawah selagi ia masih jauh di luar layar, dan pembaca tiba
       di sana setelah geraknya selesai — tidak ada yang tersisa untuk dilihat. */
    mm.add("(max-width: 899px)", () => {
      cards.forEach((card) => {
        gsap.fromTo(card, dariLipat(), {
          ...keTegak(),
          scrollTrigger: {
            trigger: card,
            start: "clamp(top 88%)",
            end: "clamp(top 45%)",
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => gsap.set(cards, { clearProps: "all" });
    });

    return () => mm.revert();
  }, [children]);

  return (
    <div ref={ref} className={`hinge-list ${className}`}>
      {children}
    </div>
  );
}
