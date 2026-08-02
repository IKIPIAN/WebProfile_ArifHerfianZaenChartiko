import { experienceList } from "../data/experience";
import { getChapter, chapterNumber } from "../data/nav";
import { HingeCards } from "../components/core/HingeCards";
import { LineMask } from "../components/core/LineMask";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { LetterHover } from "../components/core/LetterHover";
import { Container } from "../components/ui/Container";

/*
 * Riwayat kerja, dibuka seperti daun pintu.
 *
 * Sebelumnya bagian ini menahan halaman lalu menukar scroll jadi gerak
 * mendatar. Sekarang kartunya berdiri sebaris dan berputar turun pada engsel
 * di tepi atasnya, satu demi satu dari kiri ke kanan.
 *
 * Urutan waktunya TETAP terpetakan ke ruang — yang berubah cuma caranya. Dulu
 * lewat geser mendatar, sekarang lewat giliran: kartu paling kiri berputar
 * lebih dulu, dan yang di kanannya menyusul 20,83° di belakangnya. Makin ke
 * kanan, makin kemudian, sama seperti sebelumnya. Karena itu urutan data di
 * `experience.js` tetap harus kronologis, bukan terbalik seperti CV.
 *
 * Yang hilang bersama rail adalah pin-nya, dan itu memang keuntungan: halaman
 * tidak lagi menahan pengunjung di satu tempat untuk membaca dua kartu saja.
 */
export function ExperienceSection() {
  const chapter = getChapter("pengalaman");
  const number = chapterNumber("pengalaman");

  return (
    <section
      id="pengalaman"
      data-component="chapter"
      className="relative scroll-mt-24"
    >
      <Container wide className="py-24 sm:py-28 nav:py-40">
        <ScrubReveal className="mb-6 flex items-center gap-4 sm:mb-7">
          <span className="-mono tabular-nums text-text-muted">
            {String(number).padStart(2, "0")}
          </span>
          <span className="h-px w-12 bg-line" />
          <span className="-caption-small text-text-muted">
            {chapter.label}
          </span>
        </ScrubReveal>

        <LineMask
          as="h2"
          className="-h1 mb-7"
          lines={[chapter.title, chapter.accent]}
          lineClassName="last:text-text-muted"
        />

        <ScrubReveal
          as="p"
          className="-body-small mb-12 max-w-md text-text-muted sm:mb-20"
        >
          {chapter.subtitle}
        </ScrubReveal>

        {/* Lebar kartu dipatok, bukan dibagi rata. Dengan `flex-wrap` dan
            `justify-content: center`, baris terakhir menengahkan dirinya
            sendiri berapa pun jumlah kartunya — jadi menambah pekerjaan
            ketiga nanti tidak menuntut penyesuaian tata letak apa pun. */}
        <HingeCards className="gap-4 sm:gap-6 nav:gap-8">
          {experienceList.map((entry, i) => (
            <article
              key={entry.company}
              data-hinge
              className="flex w-full max-w-[30rem] shrink-0 flex-col rounded-lg bg-surface p-6 sm:p-8 nav:p-10"
            >
              <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-line pb-5">
                <span className="-mono tabular-nums text-text-muted">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(experienceList.length).padStart(2, "0")}
                </span>
                <span className="-caption-small text-text-muted">
                  {entry.period}
                </span>
              </div>

              <h3 className="-h2 mb-3">{entry.role}</h3>

              <a
                href={entry.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="link-mono mb-9 text-text-muted hover:text-text"
              >
                <LetterHover text={entry.company} />
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </a>

              <ul className="mb-10 flex flex-col gap-3">
                {entry.responsibilities.map((task) => (
                  <li
                    key={task}
                    className="-body-small flex gap-3 text-text-muted"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 h-px w-3 shrink-0 bg-line"
                    />
                    {task}
                  </li>
                ))}
              </ul>

              {/* Didorong ke dasar kartu. Kartu sebaris otomatis sama tinggi,
                  dan tanpa ini penandanya berhenti di ketinggian berbeda-beda
                  — terbaca sebagai tata letak yang meleset, bukan sengaja. */}
              <div className="mt-auto flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="-caption-small border border-line px-3 py-1.5 text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </HingeCards>
      </Container>
    </section>
  );
}
