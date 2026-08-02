import { technicalSkills, professionalSkills, languages } from "../data/skills";
import { getChapter, chapterNumber } from "../data/nav";
import { SkillStage } from "../components/core/SkillStage";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { Container } from "../components/ui/Container";

/*
 * Dua kelompok keahlian, dua perlakuan yang sangat berbeda — dan bedanya
 * bukan sekadar variasi.
 *
 * Kemampuan teknis adalah pusat halaman ini, jadi ia dapat panggung sendiri
 * selebar layar: kata-kata raksasa yang pecah, lalu kartu yang menyusun
 * kembali maknanya. Kemampuan profesional tidak menuntut perhatian sebesar
 * itu — semuanya berlaku sekaligus dan tidak berurutan — jadi ia cukup jadi
 * kisi yang seluruh selnya setara.
 *
 * Bagian ini tidak memakai <Chapter> karena panggungnya harus selebar layar
 * penuh, sementara Chapter menahan isinya di dalam kolom terbaca.
 */
export function SkillsSection() {
  const chapter = getChapter("keahlian");
  const number = chapterNumber("keahlian");

  return (
    <section id="keahlian" data-component="chapter" className="relative scroll-mt-24">
      <SkillStage
        items={technicalSkills}
        label={`${String(number).padStart(2, "0")} — ${chapter.label}`}
        title={`${chapter.title} ${chapter.accent}`}
        tagline="Empat bidang. Satu cara kerja."
      />

      <Container className="flex flex-col gap-24 py-28 nav:py-36">
        <div>
          <ScrubReveal as="h3" className="-caption-small mb-8 text-text-muted">
            Kemampuan Profesional
          </ScrubReveal>

          {/* Flex-wrap, bukan kisi berkolom tetap.
              Jumlah keahlian profesional ganjil (lima), dan kisi tiga kolom
              akan menyisakan satu sel kosong berbingkai di baris terakhir —
              terbaca sebagai isi yang gagal dimuat, bukan sebagai keputusan.
              Dengan flex-1, sisa baris terakhir dibagi rata oleh isinya
              sendiri, berapa pun jumlahnya. */}
          <div className="flex flex-wrap border-t border-l border-line">
            {professionalSkills.map((skill, i) => (
              <ScrubReveal
                key={skill.label}
                delay={i * 0.04}
                className="group flex min-h-36 min-w-52 flex-1 flex-col justify-between border-r border-b border-line p-5 transition-colors duration-500 ease-brand hover:bg-text/4"
              >
                <i className={`${skill.icon} text-text-muted`} />
                {/* Naik sedikit saat disentuh, jadi sel yang aktif terangkat
                    dari kisinya alih-alih hanya berubah warna. */}
                <span className="-body-small font-medium transition-transform duration-500 ease-brand group-hover:-translate-y-0.5">
                  {skill.label}
                </span>
              </ScrubReveal>
            ))}
          </div>
        </div>

        <div>
          <ScrubReveal as="h3" className="-caption-small mb-8 text-text-muted">
            Bahasa
          </ScrubReveal>
          <div className="border-t border-line">
            {languages.map((lang) => (
              <ScrubReveal
                key={lang.code}
                className="flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-line py-6"
              >
                <span className="-mono text-text-muted">{lang.code}</span>
                <span className="h-px w-8 self-center bg-line" />
                <h4 className="-title-4">{lang.name}</h4>
                {lang.note && (
                  <span className="-body-smaller w-full text-text-muted nav:ml-auto nav:w-auto">
                    {lang.note}
                  </span>
                )}
              </ScrubReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
