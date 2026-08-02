import { useCallback, useState } from "react";
import { ReadyContext } from "./components/core/ready-context";
import { Scroller } from "./components/core/Scroller";
import { Preloader } from "./components/core/Preloader";
import { StatusBar } from "./components/core/StatusBar";
import { Marquee } from "./components/core/Marquee";
import { Footer } from "./components/layout/Footer";
import { BackToTopButton } from "./components/layout/BackToTopButton";
import { HeroSection } from "./sections/HeroSection";
import { AboutSection } from "./sections/AboutSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { SkillsSection } from "./sections/SkillsSection";
import { EducationSection } from "./sections/EducationSection";
import { CertificatesSection } from "./sections/CertificatesSection";
import { ContactSection } from "./sections/ContactSection";

/*
 * Satu halaman panjang, tanpa router dan tanpa navbar.
 *
 * URUTAN PITA NADA — dan ini keputusan tata letak yang paling menentukan:
 *
 *   hero .. tentang .. pengalaman .. keahlian   gelap
 *   [gradien setinggi setengah layar]
 *   pendidikan .. sertifikat                    TERANG
 *   [gradien setinggi setengah layar]
 *   kontak                                      gelap
 *   footer                                      hitam pekat
 *
 * Pembalikan terang hanya terjadi SEKALI. Kalau tiap bagian berganti nada,
 * pergantian itu berhenti menandai apa pun dan halaman terbaca belang. Dengan
 * satu pembalikan, ia jadi titik tengah yang jelas: ada "sebelum" dan ada
 * "sesudah".
 *
 * Peralihannya dijembatani gradien setinggi setengah layar, bukan potongan
 * langsung. Batas keras antara hitam dan putih terbaca sebagai bug render —
 * seolah ada bagian yang gagal memuat warnanya.
 */
function App() {
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  return (
    <ReadyContext.Provider value={ready}>
      <Scroller>
        <main>
          <HeroSection />
          <AboutSection />

          {/* Marquee jadi jeda antar bagian: ia memberi napas sebelum rail
              mendatar mengambil alih kendali scroll. */}
          <Marquee className="border-y border-line py-5" speed={30}>
            {["UI/UX Designer", "Pendidik Informatika", "Universitas Negeri Malang"].map(
              (word) => (
                <span key={word} className="-caption flex items-center gap-8 pr-8 text-text-muted">
                  {word}
                  <span aria-hidden="true" className="text-accent">
                    ✦
                  </span>
                </span>
              ),
            )}
          </Marquee>

          <ExperienceSection />
          <SkillsSection />

          <div aria-hidden="true" className="band-fade-to-panel h-[50vh]" />
          <EducationSection />
          <CertificatesSection />
          <div aria-hidden="true" className="band-fade-to-dark h-[50vh]" />

          <ContactSection />
        </main>

        <Footer />
        <StatusBar />
        <BackToTopButton />
      </Scroller>

      {!ready && <Preloader onComplete={handleReady} />}
    </ReadyContext.Provider>
  );
}

export default App;
