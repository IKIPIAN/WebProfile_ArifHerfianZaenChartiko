import { STAGGER_LETTER } from "../../animation/motion-tokens";

/*
 * TRANSISI 8 — STAGGER PER HURUF SAAT HOVER.
 *
 * Label naik satu tingkat dan digantikan salinannya. Yang membuatnya hidup
 * bukan gerak naiknya, melainkan bahwa tiap huruf berangkat pada saat yang
 * sedikit berbeda — jeda 0,03 detik per huruf. Kata itu jadi "berjalan"
 * alih-alih pindah sebagai satu blok.
 *
 * Seluruhnya CSS: transisi transform dengan transition-delay per huruf.
 * Tidak ada JS yang jalan saat hover, jadi tidak ada frame yang hilang ketika
 * pengunjung menyapu banyak tautan sekaligus.
 */
export function LetterHover({ text, className = "" }) {
  const chars = [...text];

  return (
    /* `flex-wrap` sebagai jaring pengaman: huruf-huruf ini item flex, dan tanpa
       izin membungkus, label sepanjang apa pun memaksa satu baris yang menjulur
       keluar dari wadahnya. Dalam keadaan normal ia tidak pernah terpakai —
       ukuran labelnya sudah dirapatkan di layar tersempit (lihat .link-mono). */
    <span className={`inline-flex flex-wrap ${className}`}>
      {/* Teks sebenarnya, hanya untuk pembaca layar.
          Huruf-huruf di bawah dipecah dan digandakan demi efek hover, jadi
          semuanya ditandai aria-hidden. Tanpa salinan utuh ini, pembaca layar
          hanya menerima potongan huruf lepas — dan aria-label pada <span>
          biasa tidak diumumkan dengan andal. */}
      <span className="sr-only">{text}</span>

      {chars.map((char, i) => {
        /* inline-block menciutkan spasi kosong, jadi spasi diberi lebar
           eksplisit — tanpa itu kalimatnya menempel jadi satu kata panjang. */
        if (char === " ") {
          return <span key={i} aria-hidden="true" className="inline-block w-[0.32em]" />;
        }
        const delay = { transitionDelay: `${i * STAGGER_LETTER}s` };
        return (
          /* Seluruh huruf yang terlihat dikecualikan dari seleksi, bukan hanya
             salinan hover-nya. Yang boleh tersalin cuma teks utuh di atas —
             kalau huruf-huruf ini ikut terseleksi, hasil salinan tetap dobel. */
          <span key={i} className="letter-hover relative select-none" aria-hidden="true">
            <span style={delay}>
              {char}
              {/* Salinan yang menyusul dari bawah, ditempel absolut supaya
                  tidak menambah tinggi baris. `select-none` penting: tanpa
                  itu, menyalin alamat surel atau nomor telepon menghasilkan
                  setiap hurufnya dobel. */}
              <span className="absolute left-0 top-full select-none" style={delay}>
                {char}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
