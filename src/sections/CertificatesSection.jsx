import { certificates } from "../data/certificates";
import { getChapter, chapterNumber } from "../data/nav";
import { SheetArrival } from "../components/core/SheetArrival";
import { LineMask } from "../components/core/LineMask";
import { CertificateCard } from "../components/ui/CertificateCard";

/*
 * Kisi mulai kosong, lalu sertifikat berdatangan dari empat sudut luar layar
 * dan menyusun diri jadi kisi yang terpusat.
 *
 * JUDULNYA DIOPER KE DALAM PANGGUNG, bukan diletakkan di atasnya. Panggung ini
 * di-pin setinggi satu layar penuh: begitu ia terkunci, apa pun yang berada di
 * luarnya sudah tergulung lewat. Judul yang berdiri di luar berarti seluruh
 * babak kedatangan berlangsung di layar yang benar-benar kosong — tanpa judul,
 * tanpa kartu — dan itu terbaca sebagai halaman gagal memuat, bukan sebagai
 * panggung yang sedang bersiap. Di dalam, ia ikut terkunci dan jadi jangkar
 * selama lembaran berdatangan.
 *
 * Bagian ini tidak memakai <Chapter> karena kartunya harus bisa berangkat dari
 * luar tepi layar, sementara Chapter menahan isinya di dalam kolom terbaca.
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
      <SheetArrival
        header={
          <div className="mx-auto max-w-[1180px] px-6 nav:px-10">
            <div className="mb-5 flex items-center gap-4">
              <span className="-mono tabular-nums text-text-muted">
                {String(number).padStart(2, "0")}
              </span>
              <span className="h-px w-12 bg-line" />
              <span className="-caption-small text-text-muted">{chapter.label}</span>
            </div>

            {/* Jarak antarbaris dirapatkan dari versi sebelumnya: judul ini
                sekarang berbagi satu layar dengan kisinya, jadi tiap piksel
                yang dipakai di sini adalah piksel yang hilang dari kartu. */}
            <div className="flex flex-col gap-4 nav:flex-row nav:items-end nav:justify-between">
              {/* Bab ini judulnya satu baris. `last:text-text-muted` karena itu
                  hanya dipasang kalau baris keduanya benar-benar ada — pada
                  judul satu baris, "yang terakhir" adalah satu-satunya baris
                  yang ada, dan seluruh judul jadi ikut diredupkan. */}
              <LineMask
                as="h2"
                className="-h1"
                lines={[chapter.title, chapter.accent].filter(Boolean)}
                lineClassName={chapter.accent ? "last:text-text-muted" : ""}
              />
              {chapter.subtitle && (
                <p className="-body-small max-w-xs text-text-muted">{chapter.subtitle}</p>
              )}
            </div>
          </div>
        }
      >
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
