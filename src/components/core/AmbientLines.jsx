import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../../animation/motion-tokens";

/*
 * LATAR HIDUP — MEDAN GARIS.
 *
 * Bidang gelap sebesar layar penuh tanpa apa-apa di belakangnya terbaca
 * sebagai halaman yang gagal memuat, bukan sebagai keputusan desain. Inilah
 * yang mengisi ruang itu: sekumpulan garis tipis yang hanyut perlahan.
 *
 * Aturan yang menjaganya tetap jadi latar dan bukan pengganggu:
 *
 * - Kontrasnya sangat rendah. Garisnya nyaris tak kentara sampai kursor
 *   mendekat; yang dirasakan pengunjung adalah ruangnya "bernafas", bukan
 *   ada animasi yang berjalan.
 * - Kursor menariknya. Garis dalam radius tertentu memutar mendekati arah
 *   kursor dan menyala sedikit. Ini satu-satunya hal di situs yang menanggapi
 *   gerak mouse tanpa harus diklik.
 * - Berhenti sendiri saat di luar layar. IntersectionObserver mematikan
 *   loop-nya, jadi canvas ini tidak membakar baterai selama pengunjung
 *   membaca bagian lain.
 */
export function AmbientLines({ density = 46, className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;

    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = false;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const pointer = { x: -9999, y: -9999 };
    let lines = [];

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      lines = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 40 + Math.random() * 190,
        angle: (Math.random() - 0.5) * 1.5 + Math.PI / 2.6,
        speed: 0.04 + Math.random() * 0.16,
        alpha: 0.05 + Math.random() * 0.16,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const line of lines) {
        /* Hanyut pelan ke bawah; yang keluar dari bawah dikembalikan ke atas
           supaya medannya tidak pernah habis. */
        line.y += line.speed;
        if (line.y - line.len > h) {
          line.y = -line.len;
          line.x = Math.random() * w;
        }

        let angle = line.angle;
        let alpha = line.alpha;

        const dx = pointer.x - line.x;
        const dy = pointer.y - line.y;
        const dist = Math.hypot(dx, dy);
        const REACH = 190;
        if (dist < REACH) {
          /* Makin dekat kursor, makin kuat garis ikut menghadap ke arahnya. */
          const pull = 1 - dist / REACH;
          const toPointer = Math.atan2(dy, dx);
          angle += (toPointer - angle) * pull * 0.55;
          alpha += pull * 0.5;
        }

        ctx.beginPath();
        ctx.strokeStyle = `rgba(216, 216, 216, ${Math.min(alpha, 0.7)})`;
        ctx.lineWidth = 1;
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + Math.cos(angle) * line.len, line.y + Math.sin(angle) * line.len);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    build();

    /* Canvas di luar layar tidak perlu menggambar apa pun. */
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(build);
    ro.observe(canvas);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      data-component="ambient-lines"
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
