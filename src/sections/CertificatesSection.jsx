import { certificates } from "../data/certificates";
import { getChapter, chapterNumber } from "../data/nav";
import { SheetArrival } from "../components/core/SheetArrival";
import { LineMask } from "../components/core/LineMask";
import { CertificateCard } from "../components/ui/CertificateCard";

/*
 * Layar mulai kosong, lalu sertifikat berdatangan dari empat sudut luar layar
 * dan menyusun diri jadi kisi yang terpusat.
 *
 * Bagian ini tidak memakai <Chapter> karena kartunya harus bisa berangkat dari
 * luar tepi layar, sementara Chapter menahan isinya di dalam kolom terbaca.
 * Judulnya karena itu ditaruh menempel di atas panggung.
 *
 * Susunannya sengaja dibuat tidak bergantung pada jumlah: menambah sertifikat
 * nanti tidak menuntut penyesuaian apa pun di sini. Lihat CornerArrival untuk
 * dua hal yang menjaganya — baris terakhir yang selalu terpusat, dan kisi yang
 * mengecil sendiri kalau sudah melebihi tinggi layar.
 */
export function CertificatesSection() {
  const chapter = getChapter("sertifikat");
  const number = chapterNumber("sertifikat");

  return (
    <section id="sertifikat" data-band="panel" data-component="chapter" className="scroll-mt-24">
      <div className="pt-28 nav:pt-36">
        <div className="mx-auto max-w-[1180px] px-6 nav:px-10">
          <div className="mb-7 flex items-center gap-4">
            <span className="-mono tabular-nums text-text-muted">
              {String(number).padStart(2, "0")}
            </span>
            <span className="h-px w-12 bg-line" />
            <span className="-caption-small text-text-muted">{chapter.label}</span>
          </div>

          <div className="flex flex-col gap-6 nav:flex-row nav:items-end nav:justify-between">
            <LineMask
              as="h2"
              className="-h1"
              lines={[chapter.title, chapter.accent]}
              lineClassName="last:text-text-muted"
            />
            <p className="-body-small max-w-xs text-text-muted">{chapter.subtitle}</p>
          </div>
        </div>
      </div>

      <SheetArrival>
        {certificates.map((cert) => (
          /* Dua lapis: yang luar digerakkan scroll, yang dalam mengayun
             sendiri. Menumpuk dua tween pada satu elemen membuat keduanya
             saling menimpa dan gerakannya tersendat. */
          <div key={cert.id} data-arrive>
            <div data-float>
              <CertificateCard {...cert} />
            </div>
          </div>
        ))}
      </SheetArrival>
    </section>
  );
}
