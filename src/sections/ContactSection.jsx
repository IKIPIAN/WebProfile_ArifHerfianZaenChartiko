import { contactItems } from "../data/contact";
import { site } from "../data/site";
import { Chapter } from "../components/core/Chapter";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { LetterHover } from "../components/core/LetterHover";
import { ContactForm } from "../components/ui/ContactForm";

function resolveContactItem(item) {
  switch (item.type) {
    case "email":
      return { value: site.email, href: `mailto:${site.email}` };
    case "whatsapp":
      return { value: site.phoneDisplay, href: `https://wa.me/${site.phone}` };
    case "location":
      return { value: site.location };
    default:
      return { value: item.value };
  }
}

/*
 * Kembali ke gelap setelah dua bagian terang. Baris kontaknya memakai daftar
 * bergaris, bukan kartu: nilainya pendek-pendek, dan kartu di sekeliling teks
 * sependek itu lebih banyak menampilkan bingkai daripada isi.
 *
 * Yang bisa diklik memakai stagger per huruf saat disentuh — satu-satunya
 * tempat efek itu dipakai bersama rail pengalaman, jadi geraknya konsisten
 * berarti "ini bisa ditekan".
 */
export function ContactSection() {
  return (
    <Chapter id="kontak">
      <div className="flex flex-col gap-16">
        <div className="border-t border-line">
          {contactItems.map((item) => {
            const { value, href } = resolveContactItem(item);
            const row = (
              <div className="group flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-b border-line py-6">
                <span className="-caption-small text-text-muted">{item.title}</span>
                <span className="-title-4">
                  {href ? <LetterHover text={value} /> : value}
                </span>
              </div>
            );

            return (
              <ScrubReveal key={item.title}>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="block"
                  >
                    {row}
                  </a>
                ) : (
                  row
                )}
              </ScrubReveal>
            );
          })}
        </div>

        <ScrubReveal>
          <ContactForm />
        </ScrubReveal>
      </div>
    </Chapter>
  );
}
