import { site } from "../data/site";
import { useTypewriter } from "../hooks/useTypewriter";
import { STAGGER } from "../animation/motion-tokens";
import { LineMask } from "../components/core/LineMask";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { RevealImage } from "../components/core/RevealImage";
import { AmbientLines } from "../components/core/AmbientLines";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import foto from "../assets/foto.jpeg";

/*
 * Pembuka, bukan salah satu bab — karena itu tidak memakai <Chapter> dan tidak
 * diberi nomor urut.
 *
 * Transisi masuknya berbasis WAKTU, bukan scroll: seluruh isinya sudah
 * terlihat saat halaman dibuka, dan pada scrollY 0 belum ada jarak scroll yang
 * bisa menggerakkan apa pun. `delay` yang menaik itulah yang menyusun urutan
 * masuknya — nama lebih dulu, atributnya menyusul, tombol paling akhir.
 *
 * Latarnya diisi medan garis yang bereaksi pada kursor. Bidang segelap ini
 * tanpa apa pun di belakangnya terbaca sebagai halaman gagal muat, bukan
 * sebagai keputusan desain.
 */
export function HeroSection() {
  const profesi = useTypewriter(site.typewriterRoles);

  return (
    <section
      id="home"
      data-component="chapter"
      className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-24 sm:pt-28 sm:pb-28 nav:pt-32 nav:pb-36"
    >
      <AmbientLines density={52} />

      <Container wide className="relative z-2 w-full">
        <div className="grid grid-cols-1 items-end gap-12 sm:gap-14 nav:grid-cols-[1.35fr_0.65fr] nav:gap-16">
          <div>
            <ScrubReveal
              delay={STAGGER}
              className="mb-10 flex items-center gap-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <p className="-caption-small text-text-muted">{site.greeting}</p>
            </ScrubReveal>

            {/* Nama dipecah jadi dua baris bertopeng. Dibiarkan mengalir, teks
                sepanjang ini patah di tempat yang salah untuk sebuah nama. */}
            <LineMask
              as="h1"
              className="-display mb-10"
              lines={[site.firstName, site.lastName]}
              lineClassName="last:text-text-muted"
              delay={STAGGER * 2}
              stagger={0.09}
            />

            <ScrubReveal
              delay={STAGGER * 5}
              className="flex flex-col gap-6 border-t border-line pt-7 nav:flex-row nav:items-center nav:justify-between"
            >
              <p className="-body text-text-muted">
                {site.roleLead}{" "}
                <span className="font-medium text-text">{profesi}</span>
                <span className="animate-kedip text-accent">_</span>
              </p>
              <p className="-caption-small text-text-muted">{site.location}</p>
            </ScrubReveal>

            <ScrubReveal
              delay={STAGGER * 6}
              className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-4"
            >
              <Button
                href="#kontak"
                variant="primary"
                className="w-full sm:w-auto"
              >
                Hubungi Saya
              </Button>
              <Button
                href="#tentang"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Lihat Profil
              </Button>
            </ScrubReveal>
          </div>

          {/* Foto diberi bingkai bertanda sudut supaya terbaca sebagai satu
              lempeng di dalam ruang gelap, bukan gambar yang mengambang. */}
          <div className="corner-marks relative border border-line p-2.5">
            <RevealImage
              src={foto}
              alt={`Foto ${site.name}`}
              delay={STAGGER * 3}
              className="h-[280px] w-full sm:h-[330px] nav:h-[400px]"
              imgClassName="object-top"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
