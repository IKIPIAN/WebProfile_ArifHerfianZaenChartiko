import { site } from "../../data/site";
import { Container } from "../ui/Container";
import { ScrubReveal } from "../core/ScrubReveal";
import { LineMask } from "../core/LineMask";
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
      {/* Pita berjalan berdiri SENDIRI di sini, di luar wadah medan garis.
          Sebelumnya medan garis dipasang `absolute inset-0` sepanjang footer,
          jadi garis-garisnya melintas tepat di belakang tulisan berjalan — dua
          gerak berbeda arah bertumpuk di satu bidang setinggi satu baris, dan
          keduanya jadi sulit dibaca. */}
      <Marquee className="relative z-2 border-y border-line py-6" speed={38}>
        {["Terbuka untuk kolaborasi", "Desain UI/UX", "Pendidikan Informatika"].map((word) => (
          <span key={word} className="-caption flex items-center gap-8 pr-8 text-text-muted">
            {word}
            <span aria-hidden="true" className="text-accent">
              ✦
            </span>
          </span>
        ))}
      </Marquee>

      {/* Medan garis dikurung di ruang DI BAWAH pita. Garis batas bawah pita
          sekaligus jadi tempat medan itu bermula, jadi permulaannya terbaca
          sebagai keputusan, bukan sebagai potongan. */}
      <div className="relative">
        <AmbientLines density={30} />

        <Container wide className="relative z-2 py-24 nav:py-32">
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
            {/* Keterangan, bukan tautan. Satu-satunya jalan menuju WhatsApp dan
                surel adalah formulir di bagian Kontak — termasuk dari sini. */}
            <ScrubReveal>
              <p className="-caption-small mb-4 text-text-muted">Surel</p>
              <p className="-body-small">{site.email}</p>
            </ScrubReveal>

            <ScrubReveal>
              <p className="-caption-small mb-4 text-text-muted">WhatsApp</p>
              <p className="-body-small">{site.phoneDisplay}</p>
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
            {/* Tanpa tahun. Angka tahun di baris hak cipta menua sendiri —
                begitu berganti tahun ia langsung menandai situs ini sebagai
                sesuatu yang sudah lama tidak disentuh. */}
            <p className="-caption-small text-text-muted">© {site.name}</p>
            <p className="-caption-small text-text-muted">{site.location}</p>
          </ScrubReveal>
        </Container>
      </div>
    </footer>
  );
}
