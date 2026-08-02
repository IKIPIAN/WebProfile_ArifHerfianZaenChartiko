import { contactItems } from "../data/contact";
import { site } from "../data/site";
import { Chapter } from "../components/core/Chapter";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { ContactForm } from "../components/ui/ContactForm";

function nilaiKontak(item) {
  switch (item.type) {
    case "email":
      return site.email;
    case "whatsapp":
      return site.phoneDisplay;
    case "location":
      return site.location;
    default:
      return item.value;
  }
}

/*
 * Kembali ke gelap setelah dua bagian terang. Baris kontaknya memakai daftar
 * bergaris, bukan kartu: nilainya pendek-pendek, dan kartu di sekeliling teks
 * sependek itu lebih banyak menampilkan bingkai daripada isi.
 *
 * SELURUH BARIS DI SINI HANYA KETERANGAN, tidak ada yang bisa diklik. Semua
 * jalan menuju WhatsApp dan surel sengaja dikumpulkan ke satu pintu: formulir
 * di bawah. Karena itu efek stagger per huruf saat disentuh juga dicabut dari
 * baris-baris ini — gerak itu di situs ini berarti "bisa ditekan", dan
 * memasangnya pada teks yang tidak menuju ke mana pun hanya menjanjikan
 * sesuatu yang tidak terjadi.
 */
export function ContactSection() {
  return (
    <Chapter id="kontak">
      <div className="flex flex-col gap-16">
        <div className="border-t border-line">
          {contactItems.map((item) => (
            <ScrubReveal key={item.title}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-6">
                <span className="-caption-small text-text-muted">{item.title}</span>
                <span className="-title-4">{nilaiKontak(item)}</span>
              </div>
            </ScrubReveal>
          ))}
        </div>

        <ScrubReveal>
          <ContactForm />
        </ScrubReveal>
      </div>
    </Chapter>
  );
}
