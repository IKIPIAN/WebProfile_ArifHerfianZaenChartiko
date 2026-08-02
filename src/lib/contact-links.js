/*
 * SATU-SATUNYA TEMPAT TAUTAN KONTAK DIBENTUK.
 *
 * Seluruh jalan menuju WhatsApp dan surel kini melewati formulir "Kirim
 * Pesan" — tidak ada lagi nomor atau alamat yang bisa diklik langsung. Maka
 * dua fungsi di bawah ini adalah satu-satunya pintu keluar situs ini, dan
 * keduanya harus menghasilkan pesan yang bentuknya sama persis.
 *
 * Tautan kontak yang salah tidak melempar galat: ia hanya membuka percakapan
 * kosong, atau aplikasi surel tanpa alamat tujuan. Karena itu perakitannya
 * dikumpulkan di sini, bukan disebar di komponen.
 */

/*
 * wa.me hanya menerima format internasional TANPA "+" dan tanpa nol depan.
 * "085790226536" dan "+62 857-9022-6536" dua-duanya gagal membuka percakapan,
 * dan gagalnya diam — halaman wa.me tetap terbuka, cuma tidak menemukan
 * nomornya. Jadi nomor dinormalkan di sini, bukan dipercayakan pada bentuk apa
 * pun yang kebetulan tersimpan di data.
 */
function normalkanNomor(phone) {
  const angka = String(phone).replace(/\D/g, "");
  return angka.startsWith("0") ? `62${angka.slice(1)}` : angka;
}

/* Contoh redup di kolom pesan. Bukan sekadar hiasan: kolom kosong dengan
   perintah "Tulis pesan Anda" membuat orang harus mengarang pembuka sendiri,
   dan sebagian mengurungkan niat di titik itu. Contoh yang bisa langsung
   ditiru menghilangkan halangan tersebut. */
export const CONTOH_PESAN =
  "Halo Arif! Saya melihat portofolio Anda dan ingin berdiskusi soal peluang kerja sama.";

/* Badan pesan dipakai kedua jalur, jadi yang Anda terima lewat WhatsApp dan
   lewat surel tidak pernah berbeda bentuk. */
function susunPesan({ nama, emailPengirim, pesan }) {
  let isi = `Halo Arif! Saya ${nama}`;
  if (emailPengirim) {
    isi += ` (${emailPengirim})`;
  }
  isi += `\n\n${pesan}`;
  return isi;
}

export function buildWhatsAppLink({ phone, nama, email, pesan }) {
  const isi = susunPesan({ nama, emailPengirim: email, pesan });
  return `https://wa.me/${normalkanNomor(phone)}?text=${encodeURIComponent(isi)}`;
}

export function buildEmailLink({ tujuan, nama, email, pesan }) {
  const subjek = `Pesan dari ${nama} — lewat portofolio`;
  const isi = susunPesan({ nama, emailPengirim: email, pesan });

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    tujuan,
  )}&su=${encodeURIComponent(subjek)}&body=${encodeURIComponent(isi)}`;
}
