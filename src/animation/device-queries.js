export const DEVICE = {
  desktop: "(min-width: 900px)",
  tablet: "(min-width: 640px) and (max-width: 899px)",
  mobile: "(max-width: 639px)",
};

export function getDeviceType() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  if (window.matchMedia(DEVICE.mobile).matches) {
    return "mobile";
  }

  if (window.matchMedia(DEVICE.tablet).matches) {
    return "tablet";
  }

  if (window.matchMedia(DEVICE.desktop).matches) {
    return "desktop";
  }

  return "desktop";
}

export function isDesktop() {
  return (
    typeof window !== "undefined" && window.matchMedia(DEVICE.desktop).matches
  );
}

export function isTablet() {
  return (
    typeof window !== "undefined" && window.matchMedia(DEVICE.tablet).matches
  );
}

export function isMobile() {
  return (
    typeof window !== "undefined" && window.matchMedia(DEVICE.mobile).matches
  );
}

/*
 * MODE RINGAN — perangkat yang tidak sanggup membayar efek termahal.
 *
 * Dua yang paling mahal di panggung keahlian bukan jumlah elemennya, melainkan
 * LUAS PIKSEL yang harus digambar ulang tiap frame: kabut ber-`blur(46px)`
 * seukuran layar dan `backdrop-filter` pada empat kartu yang sedang bergerak.
 * Terukur dengan CPU dilambatkan 6x: 40fps di layar 390px, tapi jatuh ke 12fps
 * di 1920px — makin besar layarnya makin parah, justru kebalikan dari yang
 * diduga kalau penyebabnya jumlah elemen.
 *
 * AMBANGNYA GABUNGAN, bukan satu penanda. Tidak ada cara membaca "kekuatan
 * perangkat" langsung dari browser, jadi yang dipakai tiga petunjuk yang
 * masing-masing bisa keliru sendirian:
 *
 *   hardwareConcurrency <= 4   inti prosesor sedikit
 *   deviceMemory <= 4          RAM kecil (hanya ada di Chrome/Android)
 *   layar <= 899px             ponsel dan tablet, tempat anggaran GPU paling
 *                              ketat sekaligus tempat efek ini paling tidak
 *                              kelihatan
 *
 * Petunjuk ketiga itu yang menanggung sisanya: banyak ponsel kelas bawah tetap
 * melaporkan 8 inti, jadi dua penanda pertama saja akan melewatkan mereka.
 *
 * Sengaja TIDAK memakai `(pointer: coarse)`: iPad menyentuh layar tapi sanggup
 * menggambar semuanya, dan menurunkannya ke mode ringan berarti membuang efek
 * pada perangkat yang justru paling bisa menampilkannya.
 */
export function isLite() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator;
  return (
    (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4) ||
    (nav.deviceMemory > 0 && nav.deviceMemory <= 4) ||
    window.matchMedia("(max-width: 899px)").matches
  );
}
