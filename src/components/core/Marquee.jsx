import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../animation/gsap";
import { prefersReducedMotion } from "../../animation/motion-tokens";

/*
 * TRANSISI 2 — MARQUEE TAK BERUJUNG YANG MEMBACA ARAH SCROLL.
 *
 * Ini satu-satunya gerak di situs yang berjalan sendiri tanpa menunggu scroll.
 * Fungsinya sebagai denyut latar: saat halaman diam, ia tetap bergerak, jadi
 * layar tidak pernah benar-benar mati.
 *
 * Dua hal yang membuatnya tidak terasa seperti banner iklan:
 *
 * 1. Arahnya mengikuti arah scroll. Men-scroll ke bawah mempercepatnya,
 *    men-scroll ke atas membalikkannya. Jadi ia terasa terhubung dengan
 *    tangan pengunjung, bukan animasi yang kebetulan menempel di halaman.
 * 2. Posisinya di-modulo separuh lebar track. Isinya digandakan dua kali,
 *    sehingga saat salinan pertama habis, salinan kedua sudah menempati
 *    tempatnya persis — tidak pernah ada ujung yang terlihat, dan tidak ada
 *    lompatan saat ia mengulang.
 */
export function Marquee({ children, speed = 45, className = "", copies = 2 }) {
  const ref = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;

    let half = track.scrollWidth / 2;
    let offset = 0;
    /* Arah dasar 1 = ke kiri. Dibalik saat pengunjung men-scroll ke atas. */
    let direction = 1;

    const measure = () => {
      half = track.scrollWidth / 2;
    };
    measure();

    const setX = gsap.quickSetter(track, "x", "px");

    const tick = (_time, deltaMs) => {
      /* deltaMs dari ticker GSAP, bukan selisih timestamp sendiri — supaya
         kecepatannya tetap sama di layar 60Hz maupun 120Hz. */
      offset += (speed * direction * deltaMs) / 1000;
      /* Modulo dua arah: sisa negatif dikembalikan ke rentang positif, kalau
         tidak marquee akan melompat saat arahnya berbalik. */
      offset = ((offset % half) + half) % half;
      setX(-offset);
    };

    gsap.ticker.add(tick);

    const st = ScrollTrigger.create({
      trigger: document.body,
      start: 0,
      end: "max",
      onUpdate(self) {
        direction = self.direction === -1 ? -1 : 1;
        /* Kecepatan scroll menambah dorongan sesaat, dibatasi supaya lemparan
           scroll yang kencang tidak membuatnya kabur. */
        const boost = Math.min(Math.abs(self.getVelocity()) / 260, 7);
        offset += boost * direction;
      },
    });

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
    };
  }, [speed]);

  return (
    <div ref={ref} data-anim="marquee" className={className}>
      <div ref={trackRef} className="marquee-track">
        {Array.from({ length: copies * 2 }, (_, i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
