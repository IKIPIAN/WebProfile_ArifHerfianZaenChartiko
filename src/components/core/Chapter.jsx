import { getChapter, chapterNumber } from "../../data/nav";
import { LineMask } from "./LineMask";
import { ScrubReveal } from "./ScrubReveal";
import { Container } from "../ui/Container";

/*
 * Satu bab dari halaman panjang.
 *
 * Judulnya memakai `position: sticky` sehingga tetap menempel selama isi bab
 * bergulir melewatinya. Inilah yang menjawab "oh, ini masih bagian yang sama":
 * selama nomor dan judulnya belum berganti, pengunjung tahu ia belum pindah.
 *
 * `band` menentukan nada latar bab. Nilai "panel" membalik bab jadi terang
 * penuh berikut seluruh warna teks di dalamnya — itu ditangani CSS lewat
 * penulisan ulang variabel warna, jadi tidak ada satu pun komponen anak yang
 * perlu tahu ia sedang berdiri di atas latar terang atau gelap.
 */
export function Chapter({
  id,
  band,
  children,
  wide = false,
  headerExtra = null,
}) {
  const chapter = getChapter(id);
  const number = chapterNumber(id);

  return (
    <section
      id={id}
      data-component="chapter"
      data-band={band}
      className="relative scroll-mt-24"
    >
      <Container
        wide={wide}
        className="grid grid-cols-1 gap-x-8 gap-y-10 py-24 sm:py-28 nav:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] nav:gap-x-16 nav:gap-y-12 nav:py-40"
      >
        {/* Pembungkus sengaja dibiarkan polos. Elemen sticky butuh RUANG untuk
            bergerak, yaitu tinggi induknya. Grid item sudah meregang setinggi
            baris berkat `align-self: stretch` bawaan — jadi tidak boleh
            ditimpa: `self-start` mengecilkannya setinggi isi, dan `h-full`
            terhadap baris setinggi otomatis juga jatuh kembali jadi auto.
            Keduanya sama-sama menghabiskan jarak tempuh header. */}
        <div>
          <header className="nav:sticky nav:top-28">
            <ScrubReveal className="flex items-center gap-4 mb-7">
              <span className="-mono text-text-muted tabular-nums">
                {String(number).padStart(2, "0")}
              </span>
              <span className="h-px w-12 bg-line" />
              <span className="-caption-small text-text-muted">
                {chapter.label}
              </span>
            </ScrubReveal>

            <LineMask
              as="h2"
              className="-h1"
              lines={[chapter.title, chapter.accent]}
              lineClassName="last:text-text-muted"
            />

            {chapter.subtitle && (
              <ScrubReveal
                as="p"
                className="-body-small text-text-muted mt-7 max-w-[17rem]"
              >
                {chapter.subtitle}
              </ScrubReveal>
            )}

            {headerExtra}
          </header>
        </div>

        {/* Tinggi minimum menjaga irama: bab berisi satu kartu hanya menyisakan
            jarak tempuh ~90px untuk judul sticky, terlalu pendek untuk terbaca
            sebagai "menempel". */}
        <div className="min-w-0 nav:min-h-[62vh]">{children}</div>
      </Container>
    </section>
  );
}
