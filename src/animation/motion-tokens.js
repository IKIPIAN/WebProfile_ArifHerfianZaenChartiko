/*
 * Kosakata gerak situs ini.
 *
 * Ada DUA kurva, bukan satu, dan pembagiannya sengaja:
 *
 *   EASE       — gerak masuk berjarak jauh (judul naik, kartu terbang masuk).
 *                Melambat panjang di ujung, jadi elemen terasa mendarat.
 *   EASE_STATE — perpindahan keadaan kecil (hover, aktif/nonaktif).
 *                Simetris dan pendek; kurva mendarat panjang pada jarak 6px
 *                justru terbaca sebagai lag.
 *
 * Memakai satu kurva untuk keduanya adalah sebab gerakan terasa seragam dan
 * mati — yang berjarak jauh terasa terburu, yang dekat terasa menggantung.
 */
export const EASE = "power4.out";
export const EASE_STATE = "power2.inOut";

/* Untuk apa pun yang digerakkan scroll, easing HARUS "none": kurva di atas
   posisi yang sudah ditentukan scroll membuat animasi terasa menolak jari. */
export const EASE_SCRUB = "none";

export const DURATION = {
  quick: 0.3,
  reveal: 0.7,
  long: 1.1,
  exit: 0.5,
};

/*
 * Kelambatan scrub, dalam detik.
 *
 * Angka (bukan `true`) membuat animasi mengejar posisi scroll selama sekian
 * detik, bukan menempel 1:1. Menempel persis terasa gemetar karena setiap
 * getaran roda mouse langsung tergambar; sedikit kelambatan membuatnya
 * mengalir tanpa kehilangan sifat pokoknya — berhenti men-scroll berarti
 * animasi ikut berhenti di tengah, dan scroll mundur memutarnya balik.
 */
export const SCRUB = 0.6;

/* Scrub untuk elemen ter-pin dibuat lebih rapat: saat halaman diam di tempat,
   kelambatan besar terbaca sebagai kendali yang lepas dari jari. */
export const SCRUB_PIN = 0.35;

export const STAGGER = 0.07;

/* Jeda antar huruf saat hover — diukur dari referensi: kenaikan 0,03 detik. */
export const STAGGER_LETTER = 0.03;

/* Urutan nilai inset() adalah (atas kanan bawah kiri), jadi nama di bawah
   menyebut DI MANA elemen menempel saat tersembunyi — bukan arah geraknya. */
export const CLIP = {
  collapsedTop: "inset(0% 0% 100% 0%)",
  collapsedBottom: "inset(100% 0% 0% 0%)",
  visible: "inset(0% 0% 0% 0%)",
};

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/*
 * Elemen yang sudah terlihat saat halaman dibuka tidak boleh digerakkan
 * scroll: pada scrollY 0 belum ada jarak scroll untuk menggerakkannya, jadi
 * animasinya diam di frame pertama dan isinya tampak terpotong permanen.
 * Yang seperti itu harus digerakkan waktu.
 */
export function isVisibleOnLoad(el, ratio = 0.92) {
  return el.getBoundingClientRect().top < window.innerHeight * ratio;
}
