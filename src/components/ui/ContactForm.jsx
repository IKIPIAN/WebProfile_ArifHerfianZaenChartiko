import { useState } from "react";
import { site } from "../../data/site";
import { buildWhatsAppLink } from "../../lib/whatsapp";
import { Button } from "./Button";

/* Input tanpa kotak: hanya garis bawah, dan garis itu menebal saat difokus.
   Pada latar segelap ini, kotak bergaris penuh menambah banyak bingkai yang
   bersaing dengan garis pemisah bagian. */
const inputClass =
  "w-full border-b border-line bg-transparent py-3 -body-small text-text outline-none transition-colors duration-300 ease-power placeholder:text-text-muted/50 focus:border-text";

export function ContactForm() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [pesan, setPesan] = useState("");

  function kirimWA(e) {
    e.preventDefault();

    const namaTrim = nama.trim();
    const pesanTrim = pesan.trim();

    if (namaTrim === "" || pesanTrim === "") {
      alert("Mohon isi nama dan pesan terlebih dahulu!");
      return;
    }

    const link = buildWhatsAppLink({
      phone: site.phone,
      nama: namaTrim,
      email: email.trim(),
      pesan: pesanTrim,
    });

    window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="corner-marks border border-line p-7 nav:p-10">
      <h3 className="-caption-small mb-8 text-text-muted">Kirim Pesan</h3>

      <form onSubmit={kirimWA} className="flex flex-col gap-7">
        <div className="grid grid-cols-1 gap-7 nav:grid-cols-2">
          <div>
            <label htmlFor="namaPengirim" className="-caption-small mb-1 block text-text-muted">
              Nama
            </label>
            <input
              id="namaPengirim"
              type="text"
              placeholder="Nama Anda"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="emailPengirim" className="-caption-small mb-1 block text-text-muted">
              Email
            </label>
            <input
              id="emailPengirim"
              type="email"
              placeholder="email@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="isiPesan" className="-caption-small mb-1 block text-text-muted">
            Pesan
          </label>
          <textarea
            id="isiPesan"
            rows={4}
            placeholder="Tulis pesan Anda di sini..."
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        </div>

        <Button type="submit" className="self-start">
          <i className="fa-brands fa-whatsapp" /> Kirim via WhatsApp
        </Button>
      </form>
    </div>
  );
}
