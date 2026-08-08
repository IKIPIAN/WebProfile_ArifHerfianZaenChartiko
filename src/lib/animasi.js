/*
 * ══════════════════════════════════════════════════════════════════════════
 * SELURUH GERAK SITUS INI, DALAM SATU BERKAS.
 *
 * Dipanggil sekali dari useLayoutEffect di src/App.jsx, dan MENGEMBALIKAN
 * fungsi pembongkar. Itu bukan kerapian belaka: React StrictMode sengaja
 * memasang lalu melepas lalu memasang lagi tiap efek waktu pengembangan,
 * dan simpul DOM-nya TIDAK dibuat ulang. Tanpa pembongkaran, tiap pendengar
 * peristiwa, ticker, dan pemicu scroll akan terpasang dua kali — gejalanya
 * animasi jadi dua kali lebih cepat dan scroll terasa berat, hanya di mode
 * pengembangan, jadi mudah disalahartikan sebagai masalah performa.
 *
 * Karena itu SETIAP efek samping di berkas ini didaftarkan lewat empat
 * pembantu di bawah: dengar(), tambahTicker(), amati(), dan tambahSimpul().
 * Kalau menambah efek samping baru, pakai keempatnya — jangan panggil
 * addEventListener, gsap.ticker.add, new ResizeObserver, atau appendChild
 * secara langsung.
 *
 * URUTAN ISI BERKAS INI:
 *   1. Token gerak        kosakata bersama: kurva, durasi, jeda
 *   2. Deteksi perangkat  ambang layar dan mode ringan
 *   3. Bantu-bantu        pemecah huruf, pembangun lambang
 *   4. Scroll halus       Lenis, dan satu-satunya pintu untuk melompat
 *   5. Transisi           satu fungsi per jenis gerak
 *   6. Perilaku           mesin ketik, formulir, bilah status, tombol
 *   7. Penyalaan          urutan pemanggilan, dan kenapa urutannya begitu
 * ══════════════════════════════════════════════════════════════════════════
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function pasangAnimasi() {
  "use strict";

  /* Daftar pembongkar. Diisi oleh ketiga pembantu di bawah, dijalankan
     terbalik saat bongkar() dipanggil. */
  var bersih = [];

  function dengar(sasaran, jenis, fn, opsi) {
    sasaran.addEventListener(jenis, fn, opsi);
    bersih.push(function () { sasaran.removeEventListener(jenis, fn, opsi); });
  }
  function tambahTicker(fn) {
    gsap.ticker.add(fn);
    bersih.push(function () { gsap.ticker.remove(fn); });
  }
  function amati(simpul, fn) {
    var ro = new ResizeObserver(fn);
    ro.observe(simpul);
    bersih.push(function () { ro.disconnect(); });
    return ro;
  }

  /*
   * appendChild() tidak bisa dibatalkan lewat removeEventListener(): melepas
   * pendengar tidak mengeluarkan simpulnya dari pohon DOM. Jadi ia efek
   * samping tersendiri dan butuh pendaftarnya sendiri.
   *
   * Kenapa itu jadi masalah di sini: StrictMode menjalankan efek dengan
   * urutan mount -> unmount -> mount pada simpul host yang SAMA — React tidak
   * membuat ulang DOM-nya di antara keduanya. Setiap appendChild yang tidak
   * terdaftar karena itu berjalan dua kali dan hasilnya menumpuk, bukan
   * menimpa.
   *
   * Terukur sebelum diperbaiki: .chapter-dot berjumlah 12 (seharusnya 6),
   * anak .marquee-track 7 (seharusnya 4). Tidak ada satu pun galat yang
   * terlempar. Yang tersisa dari mount pertama sudah kehilangan
   * pendengarnya, jadi bilah babnya tampil utuh tapi separuh titiknya diam
   * saat diklik — dan marquee ikut salah karena `half = scrollWidth / 2`
   * dihitung dari lebar yang sudah telanjur berlipat.
   *
   * Khusus appendChild. Penetapan innerHTML tidak perlu lewat sini: ia
   * mengganti isi, bukan menambah, jadi sudah idempoten.
   */
  function tambahSimpul(induk, simpul) {
    induk.appendChild(simpul);
    bersih.push(function () {
      if (simpul.parentNode === induk) induk.removeChild(simpul);
    });
    return simpul;
  }



  /* Lenis yang menggerakkan scroll, jadi ticker GSAP yang harus memanggil rAF —
     dua loop rAF terpisah membuat scroll dan animasi beda satu frame. */
  gsap.ticker.lagSmoothing(0);

  /* ── 1. TOKEN GERAK ─────────────────────────────────────────────────────
   *
   * Ada DUA kurva, bukan satu, dan pembagiannya sengaja:
   *
   *   EASE       gerak masuk berjarak jauh (judul naik, kartu terbang masuk).
   *              Melambat panjang di ujung, jadi elemen terasa mendarat.
   *   EASE_STATE perpindahan keadaan kecil (hover, aktif/nonaktif). Simetris
   *              dan pendek; kurva mendarat panjang pada jarak 6px justru
   *              terbaca sebagai lag.
   *
   * Untuk apa pun yang digerakkan scroll, easing HARUS "none": kurva di atas
   * posisi yang sudah ditentukan scroll membuat animasi terasa menolak jari.
   */
  var EASE = "power4.out";
  var EASE_SCRUB = "none";
  var DURATION = { quick: 0.3, reveal: 0.7, long: 1.1 };

  /*
   * Kelambatan scrub, dalam detik. Angka (bukan `true`) membuat animasi
   * mengejar posisi scroll selama sekian detik, bukan menempel 1:1. Menempel
   * persis terasa gemetar karena tiap getaran roda mouse langsung tergambar.
   * Yang ter-pin dibuat lebih rapat: saat halaman diam di tempat, kelambatan
   * besar terbaca sebagai kendali yang lepas dari jari.
   */
  var SCRUB = 0.35;
  var SCRUB_PIN = 0.3;
  var STAGGER = 0.07;
  var STAGGER_LETTER = 0.03;

  /* Urutan nilai inset() adalah (atas kanan bawah kiri), jadi nama di bawah
     menyebut DI MANA elemen menempel saat tersembunyi — bukan arah geraknya. */
  var CLIP = {
    collapsedTop: "inset(0% 0% 100% 0%)",
    collapsedBottom: "inset(100% 0% 0% 0%)",
    visible: "inset(0% 0% 0% 0%)",
  };

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /*
   * PERANGKAT LEMAH — diukur dari KEMAMPUANNYA, bukan dari lebar layarnya.
   *
   * Ini bukan "mode ringan" lama yang dibuang. Yang itu memakai lebar layar
   * sebagai ambang, dan itu memang salah: lebar layar bukan ukuran kekuatan,
   * sehingga laptop lemah 1920px justru mendapat jalur terberat sementara
   * tablet kuat mendapat jalur ringan. Yang ini menanyakan langsung.
   *
   * navigator.deviceMemory melaporkan RAM dalam GiB, DIBULATKAN KE BAWAH ke
   * pangkat dua dan dibatasi maksimal 8 — sengaja dibuat kasar supaya tidak
   * bisa dipakai melacak orang. Nilai yang mungkin hanya 0,25 / 0,5 / 1 / 2 /
   * 4 / 8. Jadi ponsel 6 GB melaporkan 4, dan laptop 16 GB melaporkan 8:
   * keduanya jatuh di sisi ambang yang berbeda, persis yang dibutuhkan.
   *
   * hardwareConcurrency hanya dipakai kalau deviceMemory tidak tersedia
   * (Safari belum punya). Ia tidak dipakai bersamaan, karena banyak laptop
   * yang sepenuhnya mampu cuma punya 4 inti — memakainya sebagai syarat
   * tambahan akan memangkas animasi dari perangkat yang sebenarnya sanggup.
   *
   * Kalau kedua-duanya diam, perangkat dianggap KUAT. Lebih baik keliru
   * memberi animasi penuh kepada satu perangkat lemah daripada mencabutnya
   * dari semua orang karena satu peramban tidak mau menjawab.
   */
  function perangkatLemah() {
    var ram = navigator.deviceMemory;
    if (typeof ram === "number" && ram > 0) return ram <= 4;
    var inti = navigator.hardwareConcurrency;
    if (typeof inti === "number" && inti > 0) return inti <= 4;
    return false;
  }

  /*
   * Elemen yang sudah terlihat saat halaman dibuka tidak boleh digerakkan
   * scroll: pada scrollY 0 belum ada jarak scroll untuk menggerakkannya, jadi
   * animasinya diam di frame pertama dan isinya tampak terpotong permanen.
   * Yang seperti itu harus digerakkan waktu.
   */
  function visibleOnLoad(el, ratio) {
    return el.getBoundingClientRect().top < window.innerHeight * (ratio || 0.92);
  }

  /* ── 2. DETEKSI PERANGKAT ───────────────────────────────────────────────*/
  var DEVICE = {
    desktop: "(min-width: 900px)",
    tablet: "(min-width: 640px) and (max-width: 899px)",
    mobile: "(max-width: 639px)",
  };

  /* ── 3. BANTU-BANTU ─────────────────────────────────────────────────────*/
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* Lambang cincin di kartu keahlian. Jumlah cincinnya berbeda-beda supaya
     keempat kartu tidak terbaca sebagai satu ikon yang diulang. */
  function buildGlyphs() {
    $$("[data-glyph]").forEach(function (slot) {
      var index = Number(slot.getAttribute("data-glyph")) || 0;
      var rings = 4 + (index % 3);
      var svg = '<svg viewBox="0 0 64 64" aria-hidden="true" class="h-12 w-12 shrink-0">';
      for (var i = 0; i < rings; i++) {
        svg += '<circle cx="32" cy="32" r="' + (5 + i * (26 / rings)) +
          '" fill="none" stroke="currentColor" stroke-width="1" opacity="' + (0.25 + i * 0.14) + '"/>';
      }
      slot.innerHTML = svg + "</svg>";
    });
  }

  /*
   * Odometer: tiap digit adalah kolom 0-9 yang digulung di dalam jendela
   * setinggi satu baris, seperti argo taksi. Karakter non-digit (titik desimal)
   * dibiarkan diam di tempat.
   *
   * Salinan utuh ber-`sr-only` wajib ada: tiap kolom memuat SELURUH digit dan
   * hanya satu yang terlihat lewat overflow — tanpa salinan itu, menyalin
   * "3.62" menghasilkan deretan angka penuh dan pembaca layar membacakan
   * sepuluh digit per angka.
   */
  function buildOdometer(el, nilai) {
    var html = '<span class="sr-only">' + nilai + "</span>";
    for (var i = 0; i < nilai.length; i++) {
      var c = nilai[i];
      if (!/\d/.test(c)) {
        html += '<span aria-hidden="true" class="select-none">' + c + "</span>";
        continue;
      }
      html += '<span class="odometer select-none" aria-hidden="true"><span class="odometer-col" data-target="' + c + '">';
      for (var d = 0; d < 10; d++) html += "<span>" + d + "</span>";
      html += "</span></span>";
    }
    el.innerHTML = html;
  }

  function buildOdometers() {
    $$("[data-odometer]").forEach(function (el) {
      buildOdometer(el, el.getAttribute("data-odometer"));
    });
    /* Yang satu ini MENGHITUNG, bukan membaca angka yang ditulis tangan —
       jumlah sertifikat diambil dari jumlah kartunya sendiri, jadi menambah
       sertifikat tidak menyisakan angka yang meleset di bagian lain. */
    $$("[data-odometer-count]").forEach(function (el) {
      buildOdometer(el, String($$(el.getAttribute("data-odometer-count")).length));
    });
  }

  /*
   * Stagger per huruf saat hover. Yang membuatnya hidup bukan gerak naiknya,
   * melainkan bahwa tiap huruf berangkat pada saat yang sedikit berbeda.
   * Seluruhnya CSS — yang dikerjakan di sini cuma menyiapkan strukturnya.
   */
  function buildLetterHover() {
    $$("[data-letter-hover]").forEach(function (el) {
      var teks = el.getAttribute("data-letter-hover");
      el.className = "inline-flex flex-wrap " + el.className;
      var html = '<span class="sr-only">' + teks + "</span>";
      for (var i = 0; i < teks.length; i++) {
        var c = teks[i];
        if (c === " ") {
          html += '<span aria-hidden="true" class="inline-block w-[0.32em]"></span>';
          continue;
        }
        var delay = "transition-delay:" + i * STAGGER_LETTER + "s";
        html += '<span class="letter-hover relative select-none" aria-hidden="true">' +
          '<span style="' + delay + '">' + c +
          '<span class="absolute left-0 top-full select-none" style="' + delay + '">' + c + "</span>" +
          "</span></span>";
      }
      el.innerHTML = html;
    });
  }

  /*
   * Paragraf dipecah per kata di sini supaya HTML-nya tetap satu kalimat utuh
   * yang bisa dibaca dan disunting.
   *
   * SPASINYA DI ANTARA SPAN, BUKAN DI DALAMNYA — dan ini bukan selera penulisan.
   * Tiap kata adalah `inline-block`, dan CSS membuang spasi yang jatuh di akhir
   * baris sebuah kotak. Spasi yang ditaruh di dalam span karena itu lenyap, dan
   * seluruh kalimat menempel jadi satu kata panjang: "Sayamerancangantarmuka…".
   * Terukur, paragrafnya jadi 118px alih-alih 147px — satu baris lebih pendek,
   * karena tidak ada lagi tempat untuk memutus baris.
   *
   * Di antara span, spasi itu milik aliran teks induknya, bukan milik kotaknya
   * — jadi ia tetap tergambar DAN tetap jadi titik putus baris yang sah.
   */
  function buildWordScrub() {
    $$("[data-word-scrub]").forEach(function (el) {
      el.innerHTML = el.textContent
        .trim()
        .split(" ")
        .map(function (w) {
          return '<span data-word class="inline-block opacity-[0.16]">' + w + "</span>";
        })
        .join(" ");
    });
  }

  /* Isi marquee digandakan empat kali: saat salinan pertama habis, salinan
     kedua sudah menempati tempatnya persis — tidak pernah ada ujung yang
     terlihat, dan tidak ada lompatan saat ia mengulang. */
  function buildMarquees() {
    $$('[data-anim="marquee"]').forEach(function (root) {
      var track = $(".marquee-track", root);
      var asli = $("[data-marquee-copy]", track);
      for (var i = 1; i < 4; i++) {
        var salinan = asli.cloneNode(true);
        salinan.setAttribute("aria-hidden", "true");
        tambahSimpul(track, salinan);
      }
    });
  }

  /* ── 4. SCROLL HALUS ────────────────────────────────────────────────────*/
  var lenis = null;

  function initScroller() {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    tambahTicker(function (time) { lenis.raf(time * 1000); });
  }

  /* Satu-satunya pintu untuk melompat antar bagian. Jalur cadangan dipakai
     kalau Lenis tidak menyala (gerak dikurangi); ia tidak bisa meniru durasi
     dan kurva per panggilan — scroll bawaan browser hanya kenal "smooth". */
  function scrollTo(target, opts) {
    if (lenis) {
      lenis.scrollTo(target, opts || {});
      return;
    }
    var top = typeof target === "number" ? target : ($(target) || {}).offsetTop || 0;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  /* ── 5. TRANSISI ────────────────────────────────────────────────────────*/

  /*
   * MASK NAIK — dipakai untuk judul. Tiap baris berdiri di dalam kotak
   * overflow-hidden dan didorong dari bawah kotak itu, sehingga huruf seolah
   * muncul dari balik garis alih-alih memudar di tempat.
   *
   * `y: 0` di kedua ujung itu WAJIB, bukan hiasan. Keadaan awal ditulis di CSS
   * sebagai transform supaya teks tidak sempat berkedip sebelum GSAP mengambil
   * alih. Tapi GSAP membaca transform yang sudah menempel, mengurainya jadi
   * offset piksel, lalu menumpuk yPercent DI ATASNYA — sehingga saat animasi
   * mendarat di yPercent 0, sisa piksel dari CSS masih tertinggal dan barisnya
   * berhenti di bawah topengnya.
   */
  function initLineMasks() {
    $$("[data-line-mask]").forEach(function (el) {
      var inner = $$('[data-anim="line-mask"] > span', el);
      if (!inner.length) return;

      if (prefersReducedMotion()) {
        gsap.set(inner, { yPercent: 0 });
        return;
      }

      var delay = Number(el.getAttribute("data-delay")) || 0;
      var stagger = Number(el.getAttribute("data-stagger")) || STAGGER;
      var onLoad = visibleOnLoad(el);

      gsap.fromTo(
        inner,
        { yPercent: 125, y: 0 },
        onLoad
          ? { yPercent: 0, y: 0, duration: DURATION.long, ease: EASE, delay: delay, stagger: stagger }
          : {
              yPercent: 0, y: 0, duration: DURATION.long, ease: EASE, stagger: stagger,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
      );
    });
  }

  /*
   * REVEAL TER-SCRUB — bukan dipicu lalu jalan sendiri.
   *
   * Bedanya mendasar. Versi terpicu hanya menunggu elemen masuk viewport lalu
   * memutar animasi sampai habis; berhenti men-scroll tidak menghentikan apa
   * pun, dan scroll mundur tidak mengembalikan apa pun. Versi ini memetakan
   * kemajuan animasi ke jarak scroll.
   */
  function initScrubReveals() {
    $$('[data-component="scrub-reveal"]').forEach(function (el) {
      if (prefersReducedMotion()) {
        gsap.set(el, { clipPath: CLIP.visible, y: 0 });
        return;
      }

      var delay = Number(el.getAttribute("data-delay")) || 0;

      if (visibleOnLoad(el)) {
        gsap.fromTo(
          el,
          { clipPath: CLIP.collapsedTop, y: 40 },
          { clipPath: CLIP.visible, y: 0, duration: DURATION.reveal, delay: delay, ease: EASE },
        );
        return;
      }

      /* Jendelanya sengaja PENDEK dan RENDAH: penyingkapan selesai tak lama
         setelah elemennya masuk dari tepi bawah layar. Pada bagian yang isinya
         bertumpuk, tiap blok menunggu gilirannya sendiri — jadi keterlambatan
         kecil di satu elemen berlipat jadi bagian yang tak pernah terlihat
         utuh meski sudah di-scroll jauh. */
      var desktop = window.matchMedia(DEVICE.desktop).matches;
      gsap.fromTo(
        el,
        { clipPath: CLIP.collapsedTop, y: 40 },
        {
          clipPath: CLIP.visible, y: 0, ease: EASE_SCRUB,
          /* clamp() menahan jendela pemicu tetap di dalam rentang scroll yang
             benar-benar ada. Tanpa itu, elemen di dasar dokumen punya titik
             akhir di luar jangkauan scroll — animasinya tidak pernah selesai
             dan teksnya tinggal terpotong selamanya. */
          scrollTrigger: {
            trigger: el,
            start: desktop ? "clamp(top 95%)" : "clamp(top 100%)",
            end: desktop ? "clamp(top 80%)" : "clamp(top 76%)",
            scrub: SCRUB,
          },
        },
      );
    });
  }

  /*
   * GAMBAR DENGAN PITA SAPUAN — sebuah bidang warna mengisi area dari atas ke
   * bawah, lalu meluncur terus ke bawah dan keluar sambil gambarnya terbuka di
   * belakangnya. Yang terbaca mata adalah satu pita warna yang menyapu turun
   * dan meninggalkan gambar — bukan gambar yang memudar masuk.
   */
  function initRevealImages() {
    $$('[data-component="image-reveal"]').forEach(function (el) {
      var bg = $(".bg", el);
      var media = $(".media", el);
      if (!media) return;

      if (prefersReducedMotion()) {
        gsap.set(media, { clipPath: CLIP.visible });
        return;
      }

      var delay = Number(el.getAttribute("data-delay")) || 0;
      var onLoad = el.getBoundingClientRect().top < window.innerHeight * 0.9;

      var tl = gsap.timeline(
        onLoad
          ? { defaults: { ease: EASE }, delay: delay }
          : {
              defaults: { ease: "none" },
              scrollTrigger: { trigger: el, start: "clamp(top 90%)", end: "clamp(bottom 88%)", scrub: SCRUB },
            },
      );

      var unit = onLoad ? 1 : 0.6;
      tl.to(bg, { clipPath: CLIP.visible, duration: unit * 0.7 })
        .to(bg, { clipPath: CLIP.collapsedBottom, duration: unit })
        .to(media, { clipPath: CLIP.visible, duration: unit }, "<");
    });
  }

  /*
   * PARAGRAF YANG MENYALA KATA DEMI KATA — kebalikan dari reveal biasa. Reveal
   * yang menyembunyikan teks memaksa pengunjung menunggu sebelum boleh
   * membaca; di sini teksnya justru ditawarkan lebih dulu, dan scroll hanya
   * mengatur temponya.
   */
  function initWordScrub() {
    $$("[data-word-scrub]").forEach(function (el) {
      var spans = $$("[data-word]", el);
      if (!spans.length) return;

      if (prefersReducedMotion()) {
        gsap.set(spans, { opacity: 1 });
        return;
      }

      gsap.fromTo(
        spans,
        { opacity: 0.16 },
        {
          opacity: 1, ease: EASE_SCRUB,
          /* Jaraknya pendek supaya selalu ada beberapa kata setengah menyala
             sekaligus — kalau tiap kata menunggu kata sebelumnya selesai,
             hasilnya terbaca patah-patah seperti mesin tik. */
          stagger: { each: 0.25 / spans.length, from: "start" },
          scrollTrigger: { trigger: el, start: "clamp(top 82%)", end: "clamp(bottom 80%)", scrub: 0.4 },
        },
      );
    });
  }

  /*
   * DUA BARIS YANG SALING MENUTUP — baris atas datang dari kiri, baris bawah
   * dari kanan, bertemu di tengah. Transisi paling mencolok di situs ini, jadi
   * hanya dipakai sekali: di titik halaman berbalik dari gelap ke terang.
   */
  function initSplitWords() {
    $$("[data-split-words]").forEach(function (el) {
      if (prefersReducedMotion()) return;
      var atas = $(".top-word", el);
      var bawah = $(".bottom-word", el);
      if (!atas || !bawah) return;

      var tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: { trigger: el, start: "clamp(top 95%)", end: "clamp(center 80%)", scrub: SCRUB },
      });
      tl.fromTo(atas, { xPercent: -70 }, { xPercent: 0, duration: 1 }, 0);
      tl.fromTo(bawah, { xPercent: 70 }, { xPercent: 0, duration: 1 }, 0);
    });
  }

  /*
   * ODOMETER — tiap kolom punya durasi yang sedikit berbeda (semakin ke kanan
   * semakin lama). Kalau semua kolom mendarat bersamaan, hasilnya terbaca
   * sebagai satu gambar yang digeser; perbedaan kecil itulah yang membuatnya
   * terbaca sebagai mesin dengan beberapa roda.
   */
  function initOdometers() {
    $$(".odometer-value").forEach(function (el) {
      var cols = $$(".odometer-col", el);
      if (!cols.length) return;

      if (prefersReducedMotion()) {
        cols.forEach(function (col) {
          gsap.set(col, { yPercent: -10 * Number(col.dataset.target) });
        });
        return;
      }

      cols.forEach(function (col, i) {
        gsap.fromTo(
          col,
          { yPercent: 0 },
          {
            yPercent: -10 * Number(col.dataset.target),
            duration: 1.5 + i * 0.16,
            ease: EASE,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          },
        );
      });
    });
  }

  /*
   * MARQUEE TAK BERUJUNG YANG MEMBACA ARAH SCROLL.
   *
   * Satu-satunya gerak yang berjalan sendiri tanpa menunggu scroll — denyut
   * latar, supaya layar tidak pernah benar-benar mati. Arahnya mengikuti arah
   * scroll, jadi ia terasa terhubung dengan tangan pengunjung.
   */
  function initMarquees() {
    if (prefersReducedMotion()) return;

    $$('[data-anim="marquee"]').forEach(function (root) {
      var track = $(".marquee-track", root);
      var speed = Number(root.getAttribute("data-speed")) || 45;
      var half = track.scrollWidth / 2;
      var offset = 0;
      var direction = 1;

      var setX = gsap.quickSetter(track, "x", "px");

      tambahTicker(function (_t, deltaMs) {
        /* deltaMs dari ticker GSAP, bukan selisih timestamp sendiri — supaya
           kecepatannya sama di layar 60Hz maupun 120Hz. */
        offset += (speed * direction * deltaMs) / 1000;
        /* Modulo dua arah: sisa negatif dikembalikan ke rentang positif, kalau
           tidak marquee melompat saat arahnya berbalik. */
        offset = ((offset % half) + half) % half;
        setX(-offset);
      });

      ScrollTrigger.create({
        trigger: document.body, start: 0, end: "max",
        onUpdate: function (self) {
          direction = self.direction === -1 ? -1 : 1;
          offset += Math.min(Math.abs(self.getVelocity()) / 260, 7) * direction;
        },
      });

      amati(track, function () { half = track.scrollWidth / 2; });
    });
  }

  /*
   * TUMPUKAN KARTU PENGALAMAN — yang depan dibaca utuh, yang belakang
   * mengintip di sudut, dan tiap beberapa detik yang depan jatuh lalu masuk
   * ke belakang tumpukan. Polanya CardSwap dari reactbits.dev.
   *
   * SLOT. Kartu di slot ke-i digeser x +i*dx, y -i*dy, z -i*dz, diperkecil,
   * dan zIndex-nya menurun. Posisinya diturunkan dari NOMOR SLOT, bukan
   * disimpan per kartu; berputar cuma berarti memutar isi array `urutan` lalu
   * menata ulang. Tidak ada keadaan yang bisa menyimpang sendiri.
   *
   * TINGGINYA DIUKUR, TIDAK DIPATOK. CardSwap aslinya memakai ukuran tetap
   * 500x400 dan isi yang lebih panjang terpotong begitu saja. Di sini tinggi
   * tumpukan = kartu TERTINGGI + ruang untuk kartu belakang mengintip,
   * dihitung ulang lewat ResizeObserver di tiap kartu. Rincian pekerjaan
   * boleh sepanjang apa pun tanpa satu baris pun hilang.
   *
   * HANYA KARTU BELAKANG YANG DIMIRINGKAN. Aslinya seluruh tumpukan di-skew,
   * termasuk yang sedang dibaca. Teks CV yang miring melelahkan dibaca, dan
   * kartu depan di sini justru satu-satunya yang memang untuk dibaca.
   *
   * TANPA JAVASCRIPT KARTUNYA TETAP TERBACA. Posisi absolut baru dipasang
   * setelah kelas .tukar-siap ditambahkan dari sini; sebelum itu kartunya
   * mengalir ke bawah sebagai daftar biasa. Kalau skripnya gagal dimuat, yang
   * tersisa daftar pengalaman yang utuh, bukan tumpukan yang saling menimpa.
   */
  function initTukarKartu() {
    var akar = $('[data-component="tukar"]');
    if (!akar) return;

    var tumpuk = $("[data-tukar-tumpuk]", akar);
    var kartu = $$("[data-kartu]", tumpuk || akar);
    if (!tumpuk || kartu.length < 2) return;

    var kendali = $("[data-tukar-kendali]", akar);
    var JEDA_AUTO = 5200;
    var kecilQ = window.matchMedia("(max-width: 639px)");

    var urutan = kartu.map(function (_, i) { return i; });
    var otomatis = null;
    var diambilAlih = false;

    function ukuran() {
      return kecilQ.matches
        ? { dx: 12, dy: 12, dz: 40, susut: 0.045, miring: 0, jatuh: 90 }
        : { dx: 26, dy: 22, dz: 60, susut: 0.04, miring: 4, jatuh: 150 };
    }

    function slot(i) {
      var u = ukuran();
      return {
        x: i * u.dx, y: -i * u.dy, z: -i * u.dz,
        scale: 1 - i * u.susut,
        skewY: i === 0 ? 0 : u.miring,
        /* 0,8 bukan 0,55: kartu belakang berlatar --surface (#101218) di atas
           --background (#040508), jadi meredupkannya terlalu jauh membuatnya
           lenyap dan tumpukan terbaca sebagai satu kartu biasa. */
        autoAlpha: i === 0 ? 1 : 0.8,
        zIndex: kartu.length - i,
      };
    }

    /* Kartu belakang dikeluarkan dari urutan tab DAN dari pembaca layar.
       aria-hidden saja tidak cukup: tautan di dalamnya tetap bisa difokus
       keyboard, dan fokus yang mendarat di sesuatu yang tidak terlihat adalah
       cara tercepat membuat halaman terasa rusak. */
    function tandai() {
      urutan.forEach(function (idx, i) {
        kartu[idx].inert = i !== 0;
        kartu[idx].setAttribute("aria-hidden", i === 0 ? "false" : "true");
      });
      if (!kendali) return;
      $$("[data-titik]", kendali).forEach(function (b, i) {
        var aktif = urutan[0] === i;
        b.setAttribute("aria-selected", aktif ? "true" : "false");
        b.tabIndex = aktif ? 0 : -1;
      });
    }

    /*
     * SATU timeline hidup pada satu waktu, dan yang lama DIBUNUH lebih dulu.
     *
     * Ini memperbaiki cacat yang terlihat sebagai kartu belakang menembus
     * kartu depan. Penyebabnya bukan z-index atau latar tembus pandang --
     * keduanya terukur benar (z 2 lawan 1, opacity 1, latar rgb(16,18,24)
     * opak). Penyebabnya balapan: putar() menjadwalkan tl.set(zIndex) pada
     * detik 0,4 dan tl.to(autoAlpha) pada 0,42. Kalau pengguna menekan titik
     * pemilih sebelum itu, tata() memasang nilai yang benar, lalu penjadwalan
     * lama menimpanya sepersekian detik kemudian.
     *
     * zIndex disetel langsung ke style, bukan lewat GSAP, supaya ia berpindah
     * SEKETIKA -- kartu yang naik harus sudah berada di atas sebelum satu
     * frame pun digambar.
     */
    var tlAktif = null;
    function bunuhTl() {
      if (tlAktif) { tlAktif.kill(); tlAktif = null; }
    }
    bersih.push(bunuhTl);

    function tata(beranimasi) {
      bunuhTl();
      var d = beranimasi && !prefersReducedMotion() ? 0.55 : 0;
      var tl = gsap.timeline();
      urutan.forEach(function (idx, i) {
        var s = slot(i);
        kartu[idx].style.zIndex = s.zIndex;
        tl.to(kartu[idx], {
          x: s.x, y: s.y, z: s.z, scale: s.scale, skewY: s.skewY,
          autoAlpha: s.autoAlpha, duration: d, ease: EASE,
        }, 0);
      });
      tlAktif = tl;
      tandai();
    }

    function putar() {
      bunuhTl();
      var keluarIdx = urutan[0];
      var keluar = kartu[keluarIdx];
      urutan.push(urutan.shift());

      var u = ukuran();
      var akhir = slot(urutan.indexOf(keluarIdx));
      var tl = gsap.timeline();

      /* Jatuh sampai hilang DULU, baru dipindahkan ke slot belakang. Kalau
         langsung ditweenkan ke sana, ia terlihat menyelinap menembus kartu
         yang sedang naik. */
      tl.to(keluar, { y: "+=" + u.jatuh, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, 0);
      tl.call(function () { keluar.style.zIndex = akhir.zIndex; }, null, 0.4);
      tl.set(keluar, {
        x: akhir.x, y: akhir.y, z: akhir.z, scale: akhir.scale,
        skewY: akhir.skewY,
      }, 0.4);
      tl.to(keluar, { autoAlpha: akhir.autoAlpha, duration: 0.45, ease: EASE }, 0.42);

      urutan.forEach(function (idx, i) {
        if (idx === keluarIdx) return;
        var s = slot(i);
        tl.call(function () { kartu[idx].style.zIndex = s.zIndex; }, null, 0.1);
        tl.to(kartu[idx], {
          x: s.x, y: s.y, z: s.z, scale: s.scale, skewY: s.skewY,
          autoAlpha: s.autoAlpha, duration: 0.55, ease: EASE,
        }, 0.1);
      });

      tlAktif = tl;
      tandai();
    }

    function pilih(idx) {
      if (urutan[0] === idx) return;
      var pos = urutan.indexOf(idx);
      urutan = urutan.slice(pos).concat(urutan.slice(0, pos));
      tata(true);
    }

    function mulaiOtomatis() {
      if (otomatis || diambilAlih || prefersReducedMotion()) return;
      otomatis = setInterval(putar, JEDA_AUTO);
    }
    function jedaOtomatis() {
      if (otomatis) { clearInterval(otomatis); otomatis = null; }
    }
    bersih.push(jedaOtomatis);

    /* Titik pemilih dibuat dari JUMLAH kartu, lewat tambahSimpul() supaya ikut
       dibongkar. Ia juga satu-satunya jalan keyboard ke kartu yang sedang
       tidak di depan, karena kartu belakang sengaja di-inert. */
    if (kendali) {
      kartu.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "tukar-titik";
        b.setAttribute("data-titik", "");
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "Pengalaman ke-" + (i + 1));
        dengar(b, "click", function () {
          /* Sekali pengguna memilih sendiri, perputaran otomatis berhenti
             untuk seterusnya. Kartu yang bergeser sendiri saat sedang dibaca
             adalah gangguan, bukan animasi. */
          diambilAlih = true;
          jedaOtomatis();
          pilih(i);
        });
        dengar(b, "keydown", function (e) {
          var maju = e.key === "ArrowRight" || e.key === "ArrowDown";
          var mundur = e.key === "ArrowLeft" || e.key === "ArrowUp";
          if (!maju && !mundur) return;
          e.preventDefault();
          diambilAlih = true;
          jedaOtomatis();
          var tujuan = (i + (maju ? 1 : -1) + kartu.length) % kartu.length;
          pilih(tujuan);
          $$("[data-titik]", kendali)[tujuan].focus();
        });
        tambahSimpul(kendali, b);
      });
    }

    /*
     * SEMUA KARTU DISAMAKAN SETINGGI YANG TERTINGGI, bukan cuma wadahnya.
     *
     * Ini bukan kerapian. Terukur di 390x844: kartu Guru Informatika 761px
     * (lima butir rincian) dan Staf Administrasi 615px (empat butir). Saat
     * yang pendek berada di depan, yang tinggi di belakangnya menyembul 146px
     * di bawah dan isinya terbaca di samping kartu depan -- tumpukannya
     * terlihat seperti dua kartu yang salah tumpuk, bukan satu tumpukan.
     * Skala 0,955 tidak menolong karena 761 x 0,955 masih lebih besar dari
     * 615.
     *
     * Tinggi dilepas ke auto DULU sebelum diukur: tanpa itu yang terbaca
     * adalah tinggi yang dipasang putaran sebelumnya, dan kartunya tidak akan
     * pernah bisa mengecil lagi saat layar melebar.
     *
     * Penjaga `sedangUkur` memutus umpan balik: menyetel tinggi kartu memicu
     * ResizeObserver yang mengamati kartu itu sendiri.
     */
    var sedangUkur = false;
    function ukur() {
      if (sedangUkur) return;
      sedangUkur = true;

      var u = ukuran();
      var ruang = (kartu.length - 1) * u.dy;

      kartu.forEach(function (k) { k.style.height = "auto"; });
      var tinggi = 0;
      kartu.forEach(function (k) { tinggi = Math.max(tinggi, k.offsetHeight); });
      kartu.forEach(function (k) { k.style.height = tinggi + "px"; });

      tumpuk.style.setProperty("--tukar-atas", ruang + "px");
      tumpuk.style.height = tinggi + ruang + "px";

      requestAnimationFrame(function () { sedangUkur = false; });
    }

    akar.classList.add("tukar-siap");
    bersih.push(function () { akar.classList.remove("tukar-siap"); });

    kartu.forEach(function (k) { amati(k, ukur); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ukur);

    dengar(akar, "pointerenter", jedaOtomatis);
    dengar(akar, "pointerleave", mulaiOtomatis);
    dengar(akar, "focusin", jedaOtomatis);
    dengar(akar, "focusout", mulaiOtomatis);
    dengar(document, "visibilitychange", function () {
      if (document.hidden) jedaOtomatis(); else mulaiOtomatis();
    });
    dengar(kecilQ, "change", function () { ukur(); tata(false); });

    ukur();
    tata(false);
    mulaiOtomatis();
  }


  /*
   * GALERI AKORDEON — satu panel terbuka, sisanya menyempit jadi bilah.
   *
   * Menggantikan panggung kedatangan sertifikat yang lama (kisi yang di-pin
   * setinggi satu layar, kartu hanyut dari empat sudut, gelombang kertas di
   * ticker). Yang itu animasi SEKALI JALAN saat digulir; ini interaksi yang
   * bisa dijelajahi, dan enam sertifikat memang lebih masuk akal ditelusuri
   * satu per satu daripada ditabur sekaligus.
   *
   * CARA MEMBAGI RUANGNYA. Semua panel flex item. Yang aktif diberi flexGrow
   * `tumbuh`, sisanya 1, jadi pembagiannya proporsional dan tidak pernah
   * dihitung dalam piksel -- lebar wadah boleh berubah tanpa satu angka pun
   * ikut disesuaikan. `tumbuh` diturunkan dari RASIO, porsi layar yang ingin
   * ditempati panel aktif:
   *
   *     tumbuh = RASIO * (n - 1) / (1 - RASIO)
   *
   * Dengan RASIO 0,52 dan n 6: tumbuh = 0,52*5/0,48 = 5,42. Panel aktif jadi
   * 5,42 bagian dari total 10,42 bagian, yaitu 52%. Sisanya 9,6% seorang.
   *
   * KENAPA TIDAK ADA grayscale. Komponen aslinya meredupkan panel non-aktif
   * dengan filter: grayscale(). Filter dihitung ulang oleh peramban tiap
   * frame untuk seluruh piksel gambar, dan di sini gambarnya enam pindaian
   * sertifikat berukuran penuh. Repo ini sudah pernah membuang dua filter
   * karena alasan yang sama (blur kabut dan backdrop-filter kartu, +6 fps di
   * ponsel). Peredupnya di sini <span> hitam ber-opacity: compositor cuma
   * menyusun ulang lapisan, tidak menghitung ulang piksel.
   *
   * KETUK PERTAMA MEMILIH, KETUK KEDUA MEMBUKA. Di perangkat sentuh tidak ada
   * hover, jadi tanpa aturan ini panel pertama yang disentuh langsung membuka
   * PDF dan galeri ini tidak akan pernah bisa ditelusuri.
   */
  function initGaleriAkordeon() {
    var akar = $('[data-component="galeri"]');
    if (!akar) return;

    var panel = $$("[data-panel]", akar);
    if (!panel.length) return;

    var RASIO = 0.52;
    var MIRING = 6;
    var DURASI = 0.55;
    var tumbuh = panel.length > 1 ? (RASIO * (panel.length - 1)) / (1 - RASIO) : 1;

    var mendatarQ = window.matchMedia("(min-width: 900px)");
    var aktif = 0;
    var tl = null;
    var pertama = true;

    function terapkan() {
      var mendatar = mendatarQ.matches;
      var durasi = pertama || prefersReducedMotion() ? 0 : DURASI;

      if (tl) tl.kill();
      tl = gsap.timeline();

      panel.forEach(function (p, i) {
        var ini = i === aktif;
        var media = $("[data-panel-media]", p);
        var tirai = $("[data-panel-tirai]", p);
        var teks = $("[data-panel-teks]", p);

        /* Panel sebelum yang aktif miring ke satu arah, sesudahnya ke arah
           sebaliknya, jadi keduanya seolah membuka jalan ke tengah. */
        var derajat = ini ? 0 : i < aktif ? MIRING : -MIRING;
        var ubah = { flexGrow: ini ? tumbuh : 1, duration: durasi, ease: EASE };
        if (mendatar) ubah.rotationY = derajat;
        else ubah.rotationX = -derajat;
        tl.to(p, ubah, 0);

        p.setAttribute("aria-current", ini ? "true" : "false");

        if (media) {
          /* Paralaks: media panel yang jauh dari yang aktif digeser lebih
             banyak, dibatasi 1,5 langkah supaya panel di ujung tidak melompat
             sejauh jaraknya dari yang aktif. */
          var jarak = Math.max(-1.5, Math.min(1.5, aktif - i));
          var geser = jarak * 26;
          tl.to(media, {
            x: mendatar ? (ini ? 0 : geser) : 0,
            y: mendatar ? 0 : ini ? 0 : geser,
            scale: ini ? 1 : 1.06,
            duration: durasi, ease: EASE,
          }, 0);
        }

        if (tirai) tl.to(tirai, { opacity: ini ? 0 : 0.55, duration: durasi, ease: EASE }, 0);
        if (teks) {
          tl.to(teks, {
            opacity: ini ? 1 : 0,
            x: ini ? 0 : -12,
            duration: ini ? durasi : durasi * 0.6,
            ease: EASE,
          }, 0);
        }
      });

      pertama = false;
    }

    function pilih(i) {
      if (i === aktif) return;
      aktif = (i + panel.length) % panel.length;
      terapkan();
    }

    /* Hover hanya dipasang di penunjuk yang benar-benar bisa melayang. Di
       layar sentuh pointerenter tetap terkirim saat jari menyentuh, dan itu
       membuat panel berganti tepat sebelum klik diproses. */
    var bisaHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    panel.forEach(function (p, i) {
      dengar(p, "pointerenter", function () { if (bisaHover.matches) pilih(i); });
      dengar(p, "focus", function () { pilih(i); });
      dengar(p, "click", function (e) {
        if (i !== aktif) { e.preventDefault(); pilih(i); }
      });
      dengar(p, "keydown", function (e) {
        var maju = e.key === "ArrowRight" || e.key === "ArrowDown";
        var mundur = e.key === "ArrowLeft" || e.key === "ArrowUp";
        if (!maju && !mundur) return;
        e.preventDefault();
        var tujuan = (i + (maju ? 1 : -1) + panel.length) % panel.length;
        pilih(tujuan);
        panel[tujuan].focus();
      });
    });

    /* Berganti orientasi menukar sumbu miring DAN sumbu tumbuh, jadi tata
       letaknya harus dihitung ulang, bukan cuma digambar ulang. */
    dengar(mendatarQ, "change", function () { pertama = true; terapkan(); });
    amati(akar, function () { terapkan(); });

    terapkan();
  }


  /*
   * LATAR HIDUP — MEDAN GARIS.
   *
   * Bidang gelap sebesar layar penuh tanpa apa-apa di belakangnya terbaca
   * sebagai halaman gagal muat, bukan keputusan desain. Kontrasnya sangat
   * rendah; yang dirasakan pengunjung adalah ruangnya "bernafas". Kursor
   * menariknya — satu-satunya hal di situs yang menanggapi gerak mouse tanpa
   * harus diklik. Berhenti sendiri saat di luar layar.
   */
  function initAmbientLines() {
    $$('canvas[data-component="ambient-lines"]').forEach(function (canvas) {
      if (prefersReducedMotion()) return;

      var density = Number(canvas.getAttribute("data-density")) || 46;
      var ctx = canvas.getContext("2d");
      var raf = 0, running = false, w = 0, h = 0;
      var pointer = { x: -9999, y: -9999 };
      var lines = [];

      function build() {
        var rect = canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = rect.width; h = rect.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        lines = [];
        for (var i = 0; i < density; i++) {
          lines.push({
            x: Math.random() * w, y: Math.random() * h,
            len: 40 + Math.random() * 190,
            angle: (Math.random() - 0.5) * 1.5 + Math.PI / 2.6,
            speed: 0.04 + Math.random() * 0.16,
            alpha: 0.05 + Math.random() * 0.16,
          });
        }
      }

      function draw() {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          /* Hanyut pelan ke bawah; yang keluar dari bawah dikembalikan ke atas
             supaya medannya tidak pernah habis. */
          line.y += line.speed;
          if (line.y - line.len > h) { line.y = -line.len; line.x = Math.random() * w; }

          var angle = line.angle, alpha = line.alpha;
          var dx = pointer.x - line.x, dy = pointer.y - line.y;
          var dist = Math.hypot(dx, dy);
          var REACH = 190;
          if (dist < REACH) {
            /* Makin dekat kursor, makin kuat garis ikut menghadap ke arahnya. */
            var pull = 1 - dist / REACH;
            angle += (Math.atan2(dy, dx) - angle) * pull * 0.55;
            alpha += pull * 0.5;
          }

          ctx.beginPath();
          ctx.strokeStyle = "rgba(216, 216, 216, " + Math.min(alpha, 0.7) + ")";
          ctx.lineWidth = 1;
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + Math.cos(angle) * line.len, line.y + Math.sin(angle) * line.len);
          ctx.stroke();
        }
        raf = requestAnimationFrame(draw);
      }

      build();

      /* Canvas di luar layar tidak perlu menggambar apa pun. */
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!running) { running = true; raf = requestAnimationFrame(draw); }
        } else {
          running = false; cancelAnimationFrame(raf);
        }
      }, { threshold: 0 });
      io.observe(canvas);
      bersih.push(function () { io.disconnect(); running = false; cancelAnimationFrame(raf); });

      amati(canvas, build);

      dengar(window, "pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      }, { passive: true });
      dengar(window, "pointerleave", function () { pointer.x = -9999; pointer.y = -9999; });
    });
  }

  /* ── 6. PERILAKU ────────────────────────────────────────────────────────*/

  function initTypewriter() {
    var el = $("[data-typewriter]");
    if (!el) return;
    var words = JSON.parse(el.getAttribute("data-typewriter"));
    var indexKata = 0, indexHuruf = 0, sedangHapus = false;

    (function ketik() {
      var kata = words[indexKata];
      var jeda = sedangHapus ? 50 : 100;
      indexHuruf += sedangHapus ? -1 : 1;
      el.textContent = kata.substring(0, indexHuruf);

      if (!sedangHapus && indexHuruf === kata.length) {
        sedangHapus = true; jeda = 1500;
      } else if (sedangHapus && indexHuruf === 0) {
        sedangHapus = false;
        indexKata = (indexKata + 1) % words.length;
        jeda = 300;
      }
      setTimeout(ketik, jeda);
    })();
  }

  /*
   * BILAH STATUS — pengganti navbar. Fungsinya sama, memberi tahu posisi, tapi
   * tanpa meminta perhatian.
   *
   * Pergantiannya bukan fade. Kata lama naik keluar dan kata baru menyusul dari
   * bawah, di dalam jendela setinggi satu baris. Fade antar dua kata berbeda
   * menghasilkan momen di mana keduanya terbaca sekaligus dan tak satu pun
   * terbaca jelas; gerak vertikal tidak pernah punya masalah itu.
   */
  var CHAPTERS = [
    { id: "tentang", label: "Tentang" },
    { id: "pengalaman", label: "Pengalaman" },
    { id: "keahlian", label: "Keahlian" },
    { id: "pendidikan", label: "Pendidikan" },
    { id: "sertifikat", label: "Sertifikat" },
    { id: "kontak", label: "Kontak" },
  ];

  function initStatusBar() {
    var bar = $(".status-bar");
    if (!bar) return;

    var labelEl = $("[data-status-label]", bar);
    var countEl = $("[data-status-count]", bar);
    var dotsEl = $("[data-status-dots]", bar);
    var jumpBtn = $("[data-status-jump]", bar);
    var index = 0, prevIndex = 0;
    var total = String(CHAPTERS.length).padStart(2, "0");

    CHAPTERS.forEach(function (bab, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", bab.label);
      b.className = "chapter-dot group pointer-events-auto relative flex h-6 w-6 cursor-pointer items-center justify-center" +
        (i === CHAPTERS.length - 1 ? " chapter-dot--last" : "");
      /* Nama bagiannya muncul tepat di atas garis saat disentuh. `aria-hidden`
         karena tombolnya sudah punya aria-label dengan teks yang sama. */
      b.innerHTML = '<span aria-hidden="true" class="chapter-tip -caption-small">' + bab.label + "</span>" +
        '<span data-dot class="block h-px transition-all duration-500 ease-brand w-2 bg-line group-hover:w-4 group-hover:bg-text-muted"></span>';
      dengar(b, "click", function () { scrollTo("#" + bab.id); });
      tambahSimpul(dotsEl, b);
    });
    var dots = $$("[data-dot]", dotsEl);

    function render() {
      labelEl.textContent = CHAPTERS[index].label;
      countEl.textContent = String(index + 1).padStart(2, "0") + "/" + total;
      dots.forEach(function (d, i) {
        /* Titik kecil yang memanjang jadi garis saat aktif — perubahan bentuk
           terbaca lebih cepat daripada perubahan warna saja. */
        d.className = "block h-px transition-all duration-500 ease-brand " +
          (i === index ? "w-6 bg-text" : "w-2 bg-line group-hover:w-4 group-hover:bg-text-muted");
      });

      if (prefersReducedMotion() || prevIndex === index) { prevIndex = index; return; }
      /* Arah masuknya mengikuti arah perpindahan bagian: maju berarti kata baru
         datang dari bawah, mundur berarti dari atas. */
      var down = index > prevIndex;
      prevIndex = index;
      gsap.fromTo(labelEl, { yPercent: down ? 110 : -110 }, { yPercent: 0, duration: 0.55, ease: EASE });
    }
    render();

    CHAPTERS.forEach(function (bab, i) {
      var el = document.getElementById(bab.id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        /* Ambang di tengah layar: bagian dianggap aktif begitu ia melewati
           titik pandang, bukan begitu tepi atasnya menyentuh layar. Tanpa itu
           penanda berkedip bolak-balik di batas antar bagian. */
        start: "top 50%", end: "bottom 50%",
        onToggle: function (self) { if (self.isActive) { index = i; render(); } },
      });
    });

    dengar(jumpBtn, "click", function () { scrollTo("#" + CHAPTERS[index].id); });

    /*
     * WARNA BILAH MENGIKUTI PITA DI BELAKANGNYA.
     *
     * Bilah ini `fixed`, jadi ia melayang DI LUAR pita nada mana pun — dan
     * karena itu tidak ikut membalik warna saat bagian terang lewat di
     * belakangnya. AMBANGNYA BUKAN TEPI BAGIAN, MELAINKAN TENGAH GRADIEN
     * PENGHUBUNG: bilah duduk di sekitar 96% tinggi layar, jadi 96% dikurangi
     * separuh gradien (25%) = 71%, dan tepi atas panel setengah layar di
     * bawahnya = 121%.
     */
    var panels = $$('[data-band="panel"]');
    if (panels.length) {
      ScrollTrigger.create({
        trigger: panels[0], endTrigger: panels[panels.length - 1],
        start: "top 121%", end: "bottom 71%",
        onToggle: function (self) { bar.classList.toggle("status-bar--panel", self.isActive); },
      });
    }
  }

  /*
   * Perjalanan pulang dihitung dari JARAK, bukan durasi tetap. Lenis memakai
   * satu durasi untuk semua tujuan; dari dasar halaman yang panjangnya belasan
   * ribu piksel, durasi yang sama berarti kecepatan berlipat — semua pemicu
   * scrub dan bagian ter-pin harus melewati seluruh rentangnya dalam waktu itu
   * juga, dan hasilnya patah-patah.
   */
  function initBackToTop() {
    var btn = $('[data-component="back-to-top"]');
    if (!btn) return;

    var SPEED = 2200, MIN = 0.9, MAX = 3;
    /* easeInOutCubic menggantikan bawaan Lenis (expo-out): sentakan awal
       expo-out itulah yang terbaca sebagai "kecepetan". */
    var easeInOutCubic = function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    btn.style.transition = "opacity .25s ease, transform .25s ease";
    var terlihat = null;
    function sync() {
      var next = window.scrollY > 600;
      if (next === terlihat) return;
      terlihat = next;
      btn.style.opacity = next ? "1" : "0";
      btn.style.transform = next ? "translateY(0)" : "translateY(8px)";
      btn.style.pointerEvents = next ? "auto" : "none";
    }
    sync();
    dengar(window, "scroll", sync, { passive: true });

    dengar(btn, "click", function () {
      var jarak = window.scrollY;
      scrollTo(0, { duration: Math.min(Math.max(jarak / SPEED, MIN), MAX), easing: easeInOutCubic });
    });
  }

  /* Lenis yang memegang scroll, jadi lompatan anchor bawaan browser harus
     dicegah — kalau tidak, halaman menyentak lalu Lenis menariknya balik. */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      dengar(a, "click", function (e) {
        var target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        scrollTo(target);
      });
    });
  }

  /*
   * FORMULIR KONTAK — dua jalur, satu isian. Keduanya mengirim pesan yang
   * bentuknya sama; yang berbeda hanya aplikasi yang membukanya.
   *
   * wa.me hanya menerima format internasional TANPA "+" dan tanpa nol depan,
   * dan gagalnya DIAM: halaman wa.me tetap terbuka, cuma tidak menemukan
   * nomornya. Jadi nomor dinormalkan di sini.
   */
  function initContactForm() {
    var form = $("#form-kontak");
    if (!form) return;

    var TELEPON = "6285790226536";
    var SUREL = "arif.herfian@gmail.com";

    function ambilIsian() {
      var nama = $("#namaPengirim").value.trim();
      var email = $("#emailPengirim").value.trim();
      var pesan = $("#isiPesan").value.trim();
      /* Pemeriksaan yang sama dipakai kedua tombol. Kalau masing-masing
         memeriksa sendiri, cepat atau lambat salah satunya ketinggalan saat
         aturannya berubah — dan yang lolos adalah pesan kosong. */
      if (nama === "" || pesan === "") {
        alert("Mohon isi nama dan pesan terlebih dahulu!");
        return null;
      }
      return { nama: nama, email: email, pesan: pesan };
    }

    function susunPesan(isian) {
      var teks = "Halo Arif! Saya " + isian.nama;
      if (isian.email) teks += " (" + isian.email + ")";
      return teks + "\n\n" + isian.pesan;
    }

    dengar(form, "submit", function (e) {
      e.preventDefault();
      var isian = ambilIsian();
      if (!isian) return;
      var nomor = TELEPON.replace(/\D/g, "");
      if (nomor.indexOf("0") === 0) nomor = "62" + nomor.slice(1);
      window.open("https://wa.me/" + nomor + "?text=" + encodeURIComponent(susunPesan(isian)),
        "_blank", "noopener,noreferrer");
    });

    dengar($("#kirim-email"), "click", function () {
      var isian = ambilIsian();
      if (!isian) return;
      window.location.href = "https://mail.google.com/mail/?view=cm&fs=1&to=" +
        encodeURIComponent(SUREL) +
        "&su=" + encodeURIComponent("Pesan dari " + isian.nama + " — lewat portofolio") +
        "&body=" + encodeURIComponent(susunPesan(isian));
    });
  }

  /*
   * PEMBUKA — monogram AH digambar bertahap, lalu situsnya masuk.
   *
   * MEKANISMENYA. Tiap <path> di Pembuka.jsx digambar dengan trik
   * stroke-dasharray: panjang garisnya diukur getTotalLength(), lalu
   * strokeDasharray DAN strokeDashoffset disetel sebesar panjang itu --
   * garisnya jadi satu strip putus-putus yang seluruhnya digeser keluar,
   * sehingga tidak ada yang terlihat. Menganimasikan offset-nya kembali ke 0
   * menariknya masuk dari pangkal ke ujung, jadi garisnya seolah ditulis.
   *
   * Panjangnya DIUKUR, bukan ditulis tangan, supaya mengubah koordinat di
   * Pembuka.jsx tidak menuntut angka di berkas ini ikut diperbarui.
   *
   * KENAPA `lanjut` DIPANGGIL SEBAGAI CALLBACK, BUKAN SETELAH initPembuka.
   *
   * Seluruh animasi situs dipasang lewat parameter itu, dan pemasangannya
   * ditunda sampai panelnya mulai terangkat. Alasannya: gerak masuk Beranda
   * -- topeng judul, clip foto, mesin ketik -- berjalan begitu dipasang. Kalau
   * dipasang bersamaan dengan pembuka, semuanya sudah selesai di balik panel
   * dan yang terlihat saat panel naik cuma halaman diam. Ini persis jenis
   * cacat yang tidak akan pernah muncul sebagai galat.
   *
   * BEDANYA DENGAN PRELOADER YANG DIBUANG PADA 2 AGUSTUS 2026. Yang itu
   * menahan halaman sampai skripnya jalan. Panel ini sudah tergambar sejak
   * frame pertama lewat CSS biasa, jadi tidak ada yang ditunda; ia hanya
   * menutupi. Ia juga punya batas keras 3,5 detik dan dilewati sama sekali
   * kalau pengguna minta gerak dikurangi.
   */
  function initPembuka(lanjut) {
    var panel = $('[data-component="pembuka"]');
    if (!panel) { lanjut(); return; }

    var isi = $("[data-pembuka-isi]", panel);

    /* Batas keras dipasang PALING AWAL, sebelum satu baris pun yang bisa
       melempar. Kalau ada yang gagal di bawah, panelnya tetap terbuka dan
       situs tidak tertutup selamanya. */
    var sudah = false;
    var pemaksa = setTimeout(function () { keluar(); }, 3000);
    bersih.push(function () { clearTimeout(pemaksa); });
    bersih.push(function () {
      document.documentElement.classList.remove("pembuka-aktif");
    });

    /* StrictMode memasang ulang efek ini pada simpul DOM yang SAMA, jadi
       panelnya bisa mewarisi display:none dan opacity 0 dari putaran
       sebelumnya. Dikembalikan dulu ke keadaan berangkat. */
    gsap.set([panel, isi], { clearProps: "all" });
    panel.style.display = "";

    function bereskan() {
      panel.style.display = "none";
      document.documentElement.classList.remove("pembuka-aktif");
      if (lenis) lenis.start();
    }

    function keluar() {
      if (sudah) return;
      sudah = true;
      clearTimeout(pemaksa);

      if (prefersReducedMotion()) { lanjut(); bereskan(); return; }

      /*
       * ANGKA 0,45 ITU HASIL UKUR, BUKAN SELERA.
       *
       * Percobaan pertama memanggil lanjut() di awal fungsi ini. Terukur:
       * panel pergi pada 2180ms, dan sesudah itu baris judul bergeser 0px --
       * seluruh gerak masuk Beranda sudah habis di balik panel, jadi yang
       * terlihat saat halaman terbuka justru halaman diam.
       *
       * Sapuan membuka dari bawah ke atas (inset bawah 0% -> 100%). Memanggil
       * lanjut() pada 0,45 detik menaruh awal gerak Beranda di saat sapuan
       * sudah membuka sebagian: ekornya tersembunyi di balik sisa panel, dan
       * bagian terbesarnya berjalan di halaman yang sudah terbuka penuh.
       */
      gsap.timeline({ onComplete: bereskan })
        .to(isi, { autoAlpha: 0, duration: 0.25, ease: "power2.in" })
        .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.6, ease: EASE }, "-=0.1")
        .call(lanjut, null, 0.45);
    }

    if (prefersReducedMotion()) { keluar(); return; }

    document.documentElement.classList.add("pembuka-aktif");
    if (lenis) lenis.stop();
    /* Peramban memulihkan posisi gulir kunjungan sebelumnya; tanpa ini situs
       terbuka di tengah halaman begitu panelnya naik. */
    window.scrollTo(0, 0);

    var bingkai = $$("[data-pembuka-bingkai] path", panel);
    var goresan = $$("[data-pembuka-goresan] path", panel);
    var kunci = $$("[data-pembuka-kunci] path", panel);

    bingkai.concat(goresan, kunci).forEach(function (p) {
      var panjang = p.getTotalLength();
      p.style.strokeDasharray = panjang;
      p.style.strokeDashoffset = panjang;
    });

    var tl = gsap.timeline({
      onComplete: function () {
        /*
         * Font ditunggu supaya nama di bawah monogram tidak berganti bentuk
         * tepat saat panelnya terangkat -- TAPI dengan batas.
         *
         * Terukur: pada muat dingin document.fonts.ready baru selesai sekitar
         * 2,9 detik, dan pembukanya jadi 3,6 detik; pada muat panas ia selesai
         * seketika dan pembukanya 2,0 detik. Selisih 1,6 detik itu terlalu
         * besar untuk sesuatu yang menghalangi situs, dan yang paling parah
         * justru dialami pengunjung pertama kali.
         *
         * Jadi yang duluan selesai, itu yang dipakai: font atau 500ms.
         */
        var siapFont = (document.fonts && document.fonts.ready) || Promise.resolve();
        var batasFont = new Promise(function (lepas) {
          var id = setTimeout(lepas, 500);
          bersih.push(function () { clearTimeout(id); });
        });
        Promise.race([siapFont, batasFont]).then(keluar);
      },
    });

    /*
     * Urutannya menceritakan bentuknya terbentuk, bukan sekadar muncul:
     * heksagon menggariskan wilayahnya, satu goresan menyusur naik dari kaki
     * kiri melewati puncak lalu turun ke kaki kanan, baru palangnya mengunci
     * keduanya jadi satu tanda. Palang itu sengaja paling akhir DAN sendirian
     * di ujung timeline -- sampai ia turun, bentuknya masih terbaca sebagai
     * gerbang kosong. Seluruh lambang satu warna, jadi urutan inilah
     * satu-satunya yang membedakan perannya.
     */
    tl.to(bingkai, { strokeDashoffset: 0, duration: 0.45, stagger: 0.07, ease: "power2.out" }, 0);
    tl.to(goresan, { strokeDashoffset: 0, duration: 0.8, ease: "power1.inOut" }, 0.22);
    tl.to(kunci, { strokeDashoffset: 0, duration: 0.38, ease: "power2.out" }, 0.98);
  }

  /* ── 7. PENYALAAN ───────────────────────────────────────────────────────
   *
   * Urutannya bukan selera. Struktur dibangun lebih dulu (huruf, lambang,
   * odometer, salinan marquee) karena setiap transisi di bawahnya mencari
   * elemen yang baru saja dibuat itu. Baru setelah semuanya ada di DOM,
   * animasi dipasang.
   *
   * Lenis dinyalakan sebelum pembuka supaya ada yang bisa dihentikan selama
   * panelnya menutup; sisanya menunggu panggilan balik dari initPembuka().
   */
  function start() {
    buildGlyphs();
    buildOdometers();
    buildLetterHover();
    buildWordScrub();
    buildMarquees();

    initScroller();
    initPembuka(pasangSisanya);
  }

  function pasangSisanya() {
    initLineMasks();
    initScrubReveals();
    initRevealImages();
    initWordScrub();
    initSplitWords();
    initOdometers();
    initMarquees();
    initTukarKartu();
    initGaleriAkordeon();
    initAmbientLines();

    initTypewriter();
    initStatusBar();
    initBackToTop();
    initAnchors();
    initContactForm();

    /*
     * Hitung ulang semua posisi pemicu setelah tata letak benar-benar final.
     *
     * Ini bukan kehati-hatian berlebih. Panggung yang di-pin menyisipkan
     * spacer setinggi lebih dari seribu piksel, dan itu mendorong turun SEMUA
     * bagian di bawahnya. Pemicu milik bagian-bagian itu sudah menghitung titik
     * start dan end-nya lebih dulu, saat spacer belum ada.
     *
     * Dijalankan di rAF supaya jatuh setelah frame pertama selesai digambar.
     */
    requestAnimationFrame(function () { ScrollTrigger.refresh(); });

    /* SEKALI LAGI setelah font khusus benar-benar terpasang: tata letak sudah
       tergambar memakai font cadangan, dan begitu Inter menggantikannya, tinggi
       tiap blok teks berubah dan SEMUA titik pemicu di bawahnya ikut bergeser. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  start();

  /*
   * PEMBONGKAR. Urutannya penting: Lenis dimatikan lebih dulu supaya ia tidak
   * lagi memanggil ScrollTrigger.update saat pemicunya sedang dibunuh.
   */
  return function bongkar() {
    if (lenis) { lenis.destroy(); lenis = null; }
    ScrollTrigger.getAll().forEach(function (t) { t.kill(true); });
    gsap.globalTimeline.clear();
    for (var i = bersih.length - 1; i >= 0; i--) bersih[i]();
    bersih = [];
  };
}
