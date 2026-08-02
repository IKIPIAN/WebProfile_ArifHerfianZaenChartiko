export function buildWhatsAppLink({ phone, nama, email, pesan }) {
  let isiTeks = `Halo Arif! Saya ${nama}`;
  if (email) {
    isiTeks += ` (${email})`;
  }
  isiTeks += `\n\n${pesan}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(isiTeks)}`;
}
