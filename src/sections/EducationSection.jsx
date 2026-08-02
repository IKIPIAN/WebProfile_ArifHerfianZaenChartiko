import { education } from "../data/education";
import { site } from "../data/site";
import { getChapter, chapterNumber } from "../data/nav";
import { SplitWords } from "../components/core/SplitWords";
import { Odometer } from "../components/core/Odometer";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { Container } from "../components/ui/Container";

/*
 * TITIK BALIK HALAMAN.
 *
 * Di sinilah situs berbalik dari gelap ke terang, dan itu sebabnya bagian ini
 * mendapat transisi paling mencolok: dua baris judul yang datang dari arah
 * berlawanan lalu bertemu di tengah.
 *
 * Transisi itu hanya dipakai SEKALI di seluruh halaman. Gerak sebesar itu
 * bekerja justru karena langka — kalau tiap bagian memakainya, ia berhenti
 * menandai apa pun dan tinggal jadi kebisingan.
 *
 * Angka IPK memakai odometer: tiap digitnya kolom yang digulung, dengan durasi
 * sedikit berbeda per kolom supaya terbaca sebagai mesin berputar, bukan
 * gambar yang digeser.
 */
export function EducationSection() {
  const chapter = getChapter("pendidikan");
  const number = chapterNumber("pendidikan");

  return (
    <section id="pendidikan" data-band="panel" data-component="chapter" className="scroll-mt-24">
      <Container wide className="py-28 nav:py-40">
        <div className="mb-16 flex items-center gap-4">
          <span className="-mono tabular-nums text-text-muted">
            {String(number).padStart(2, "0")}
          </span>
          <span className="h-px w-12 bg-line" />
          <span className="-caption-small text-text-muted">{chapter.label}</span>
        </div>

        <SplitWords
          className="mb-20"
          top={chapter.title}
          bottom={chapter.accent}
          lineClassName="-display leading-[0.85]"
        />

        <div className="grid grid-cols-1 gap-x-16 gap-y-12 border-t border-line pt-14 nav:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div>
            <ScrubReveal as="h3" className="-h2 mb-4">
              {education.degree}
            </ScrubReveal>

            <ScrubReveal>
              <a
                href={education.institutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-mono mb-9 text-text-muted hover:text-text"
              >
                {education.institution}
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </a>
            </ScrubReveal>

            <ScrubReveal as="p" className="-body mb-10 max-w-2xl text-text-muted">
              {education.description}
            </ScrubReveal>

            <ScrubReveal className="flex flex-wrap gap-2">
              {education.tags.map((tag) => (
                <span
                  key={tag}
                  className="-caption-small border border-line px-3 py-1.5 text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </ScrubReveal>
          </div>

          {/* Kolom angka. Statistik yang sudah ada di data dipakai ulang di
              sini sebagai penutup bagian, bukan diulang di tempat lain. */}
          <div className="corner-marks border border-line p-8">
            <p className="-caption-small mb-8 text-text-muted">{education.gradBadge}</p>

            <div className="mb-8">
              <p className="-caption-small mb-2 text-text-muted">{education.ipkLabel}</p>
              <div className="flex items-baseline gap-2">
                <Odometer value={education.ipkValue} className="-display block leading-none" />
                {/* Skalanya sengaja tidak ikut digulung: ia keterangan, bukan
                    capaian, dan angka yang berputar menariknya jadi setara. */}
                <span className="-caption-small text-text-muted">{education.ipkScale}</span>
              </div>
            </div>

            <div className="flex flex-col gap-5 border-t border-line pt-7">
              {site.stats.slice(1).map((stat) => (
                <div key={stat.label} className="flex items-baseline justify-between gap-4">
                  <span className="-caption-small text-text-muted">{stat.label}</span>
                  <Odometer value={stat.value} className="-h2 leading-none" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
