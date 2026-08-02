import { site } from "../../data/site";
import { Container } from "../ui/Container";
import { ScrubReveal } from "../core/ScrubReveal";
import { LineMask } from "../core/LineMask";
import { LetterHover } from "../core/LetterHover";
import { AmbientLines } from "../core/AmbientLines";
import { Marquee } from "../core/Marquee";

/*
 * Penutup halaman, dan satu-satunya bidang yang lebih gelap dari latar dasar.
 *
 * Setelah dua bagian terang, turun ke hitam pekat memberi tanda bahwa halaman
 * benar-benar berakhir di sini — bukan sekadar bagian berikutnya yang belum
 * termuat.
 *
 * Marquee-nya berjalan sendiri dan arahnya mengikuti arah scroll. Ia sengaja
 * ditaruh di sini: di dasar halaman, ketika tidak ada lagi yang bisa
 * di-scroll, gerakannya jadi satu-satunya tanda bahwa halaman ini masih hidup.
 */
export function Footer() {
  return (
    <footer data-component="footer" data-band="void" className="relative overflow-hidden">
      <AmbientLines density={30} />

      <div className="relative z-2">
        <Marquee className="border-y border-line py-6" speed={38}>
          {["Terbuka untuk kolaborasi", "UI/UX Design", "Pendidikan Informatika"].map((word) => (
            <span key={word} className="-caption flex items-center gap-8 pr-8 text-text-muted">
              {word}
              <span aria-hidden="true" className="text-accent">
                ✦
              </span>
            </span>
          ))}
        </Marquee>

        <Container wide className="py-24 nav:py-32">
          <ScrubReveal as="p" className="-caption-small mb-8 text-text-muted">
            Mari bekerja sama
          </ScrubReveal>

          <LineMask
            as="p"
            className="-display mb-16"
            lines={[site.firstName, site.lastName]}
            lineClassName="last:text-text-muted"
          />

          <div className="grid grid-cols-1 gap-10 border-t border-line pt-10 nav:grid-cols-3">
            <ScrubReveal>
              <p className="-caption-small mb-4 text-text-muted">Surel</p>
              <a href={`mailto:${site.email}`} className="-body-small hover:text-text">
                <LetterHover text={site.email} />
              </a>
            </ScrubReveal>

            <ScrubReveal>
              <p className="-caption-small mb-4 text-text-muted">WhatsApp</p>
              <a
                href={`https://wa.me/${site.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="-body-small hover:text-text"
              >
                <LetterHover text={site.phoneDisplay} />
              </a>
            </ScrubReveal>

            <ScrubReveal>
              <p className="-caption-small mb-4 text-text-muted">Almamater</p>
              <p className="-body-small text-text-muted">
                S1 Pendidikan Teknik Informatika
                <span className="block">Universitas Negeri Malang</span>
              </p>
            </ScrubReveal>
          </div>

          <ScrubReveal className="mt-16 flex flex-wrap items-baseline justify-between gap-4 border-t border-line pt-8">
            <p className="-caption-small text-text-muted">© 2025 {site.name}</p>
            <p className="-caption-small text-text-muted">{site.location}</p>
          </ScrubReveal>
        </Container>
      </div>
    </footer>
  );
}
