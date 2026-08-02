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
      className="relative flex h-auto nav:h-screen items-center sm:items-start nav:items-center overflow-hidden pt-10 pb-10 sm:pt-14 sm:pb-14 nav:pt-56 nav:pb-16"
    >
      <AmbientLines density={52} />

      <Container wide className="relative z-2 w-full text-center sm:text-left">
        <div className="grid grid-cols-1 gap-12 sm:gap-14 nav:grid-cols-[1.35fr_0.65fr] nav:gap-16 nav:items-center nav:justify-center">
          <div>
            <ScrubReveal
              delay={STAGGER}
              className="mb-10 flex items-center justify-center sm:justify-start gap-3"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <p className="-caption-small text-text-muted">{site.greeting}</p>
            </ScrubReveal>

            <LineMask
              as="h1"
              className="-display mb-8 sm:mb-10"
              lines={[site.firstName, site.lastName]}
              lineClassName="last:text-text-muted"
              delay={STAGGER * 2}
              stagger={0.09}
            />
          </div>

          <div className="corner-marks relative mx-auto -mt-8 max-w-[14rem] sm:mt-0 sm:max-w-[20rem] nav:mt-0 nav:max-w-[26rem] nav:col-start-2 nav:row-start-1 nav:row-span-2">
            <div className="relative border border-line p-2.5">
              <RevealImage
                src={foto}
                alt={`Foto ${site.name}`}
                delay={STAGGER * 3}
                className="w-full aspect-[4/5] sm:aspect-[3/4] nav:aspect-[4/5]"
                imgClassName="object-contain"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-line pt-7 sm:border-t-0 sm:pt-0 nav:row-start-2">
            <div className="flex flex-col gap-3 border-t border-line pt-7 sm:border-t-0 sm:pt-0">
              <p className="-body text-text-muted">
                {site.roleLead}{" "}
                <span className="font-medium text-text">{profesi}</span>
                <span className="animate-kedip text-accent">_</span>
              </p>
              <p className="-caption-small text-text-muted">{site.location}</p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
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
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
