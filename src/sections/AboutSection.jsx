import { aboutCards } from "../data/about";
import { Chapter } from "../components/core/Chapter";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { WordScrub } from "../components/core/WordScrub";

/*
 * Bagian ini memakai transisi paling tenang di seluruh situs, dan itu
 * disengaja: isinya paragraf yang memang ingin dibaca.
 *
 * Pernyataan pembukanya tidak disembunyikan lalu dimunculkan — ia sudah ada
 * sejak awal, hanya redup, lalu menyala kata demi kata mengikuti scroll.
 * Reveal yang menutupi teks memaksa orang menunggu sebelum boleh membaca;
 * di sini teksnya ditawarkan lebih dulu dan scroll hanya mengatur temponya.
 *
 * Daftar perannya memakai baris bergaris, bukan kartu. Tiga kartu bertumpuk
 * di kolom sempit terbaca sebagai tiga hal setara yang saling bersaing;
 * baris bernomor terbaca sebagai satu daftar yang bisa dipindai.
 */
export function AboutSection() {
  return (
    <Chapter id="tentang">
      <div className="flex flex-col gap-16">
        <WordScrub
          as="p"
          className="-h2 max-w-[38rem]"
          text="Saya merancang antarmuka yang mudah diikuti, dengan kebiasaan menjelaskan yang dibawa dari ruang kelas, dan pemahaman teknis yang menjaga rancangan tetap masuk akal untuk dibangun."
        />

        <div className="border-t border-line">
          {aboutCards.map((card, i) => (
            <ScrubReveal key={card.title}>
              <div className="group relative grid grid-cols-1 gap-x-8 gap-y-3 border-b border-line py-8 nav:grid-cols-[3rem_minmax(0,13rem)_minmax(0,1fr)]">
                <span className="-mono tabular-nums text-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <h3 className="-title-3 transition-transform duration-500 ease-brand nav:group-hover:translate-x-1">
                  {card.title}
                </h3>

                <p className="-body-small max-w-xl text-text-muted">{card.description}</p>

                {/* Garis bawah memanjang dari kiri saat baris disentuh — penanda
                    yang tidak menggeser tata letak sedikit pun. */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-[-1px] left-0 h-px w-full origin-left scale-x-0 bg-text transition-transform duration-700 ease-brand group-hover:scale-x-100"
                />
              </div>
            </ScrubReveal>
          ))}
        </div>
      </div>
    </Chapter>
  );
}
