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
   * BALOK MENDATAR YANG BERPUTAR TURUN.
   *
   * Kartu berdiri sebaris tapi mulanya terlipat RATA ke belakang pada garis
   * engsel di tepi atasnya. Angkanya diukur dari referensi, bukan dikira-kira:
   * perspective 1400px di WADAH (bukan tiap kartu, supaya titik pandangnya
   * satu), engsel di tepi atas, rotateX -92° → 0°, jarak antar kartu 20,83°.
   *
   * -92°, BUKAN -90°: tepat di 90° kartu jadi bidang setebal nol yang bisa
   * berkedip jadi garis rambut seperak-piksel.
   */
  function initHingeCards() {
    var list = $(".hinge-list");
    if (!list || prefersReducedMotion()) return;

    var cards = $$("[data-hinge]", list);
    if (!cards.length) return;

    var LIPAT = -92;
    var JEDA = 0.2264;
    var dari = { rotateX: LIPAT, autoAlpha: 0 };
    var ke = { rotateX: 0, autoAlpha: 1, duration: 1, ease: EASE_SCRUB };

    var mm = gsap.matchMedia();

    /* Sebaris: SATU pemicu untuk semua kartu, karena posisi vertikalnya sama
       dan yang membedakan hanyalah gilirannya. */
    function rowCards() {
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: list, start: "clamp(top 82%)", end: "clamp(top 45%)",
          scrub: SCRUB, invalidateOnRefresh: true,
        },
      });
      cards.forEach(function (card, i) { tl.fromTo(card, dari, ke, i * JEDA); });
      return function () { gsap.set(cards, { clearProps: "all" }); };
    }

    /* Bertumpuk: tiap kartu dapat pemicunya SENDIRI. Satu pemicu bersama akan
       memutar kartu bawah selagi ia masih jauh di luar layar, dan pembaca tiba
       di sana setelah geraknya selesai — tidak ada yang tersisa untuk dilihat. */
    function stackedCards() {
      cards.forEach(function (card) {
        gsap.fromTo(card, dari, Object.assign({}, ke, {
          scrollTrigger: {
            trigger: card, start: "clamp(top 90%)", end: "clamp(top 66%)",
            scrub: SCRUB, invalidateOnRefresh: true,
          },
        }));
      });
      return function () { gsap.set(cards, { clearProps: "all" }); };
    }

    /* Tablet memakai koreografi SEBARIS seperti desktop: sejak kartunya berdiri
       berdampingan, pemicu sendiri-sendiri membuat keduanya berputar bersamaan
       tanpa giliran — dan gelombang yang jadi maksud transisi ini hilang. */
    mm.add(DEVICE.desktop, rowCards);
    mm.add(DEVICE.tablet, rowCards);
    mm.add(DEVICE.mobile, stackedCards);
  }

  /*
   * LEMBARAN YANG MELAYANG MASUK.
   *
   * ATURAN GERAKNYA, dan ini yang membedakannya dari versi yang terlalu liar:
   *   1. LEMBARAN SELALU TEGAK. Miringnya paling jauh 2,5°. Rotasi besar
   *      membuat sertifikat terbaca seperti kartu remi yang dilempar —
   *      sedangkan ini dokumen, dan dokumen berdiri tegak.
   *   2. DATANG DARI BAWAH, BUKAN DARI SUDUT. Jalur diagonal dari pojok jauh
   *      memaksa mata melompat ke empat penjuru.
   *   3. TIAP LEMBARAN PUNYA LAJU SENDIRI, jadi selama penggabungan mereka
   *      tidak pernah sejajar rapi.
   *   4. TIDAK PERNAH BENAR-BENAR DIAM — ada ayunan halus beberapa piksel.
   */
  function initSheetArrival() {
    var root = $(".arrival-stage");
    if (!root || prefersReducedMotion()) return;

    var grid = $(".arrival-grid", root);
    var fit = $(".arrival-fit", root);
    var CORNERS = [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }];

    /*
     * GOYANGAN KERTAS — digerakkan ticker dengan gelombang sinus, bukan tween
     * berulang, karena harus bisa DIMATIKAN: tween yoyo tak berhingga hanya
     * bisa dihentikan mendadak di posisi mana pun ia kebetulan berada, dan itu
     * terlihat sebagai kartu yang tersentak. Dengan sinus dikali satu peredam,
     * mematikannya berarti menyusutkan amplitudonya ke nol.
     *
     * Tiap sumbu punya FREKUENSI SENDIRI yang tidak habis membagi satu sama
     * lain. Kalau seirama, ketiganya kembali ke titik awal bersamaan dan
     * terbaca sebagai bandul mekanis.
     */
    function createPaperWave(floats) {
      var wave = { amp: 1 };
      var TAU = Math.PI * 2;
      var sheets = floats.map(function (el, i) {
        var ragam = ((i * 29) % 13) / 12;
        gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });
        return {
          el: el, arah: i % 2 === 0 ? 1 : -1, fase: ragam * TAU,
          ay: 11 + ragam * 6, ar: 0.9 + ragam * 0.8, at: 3.5 + ragam * 3, ax: 2 + ragam * 2.4,
          fy: 0.19 + ragam * 0.05, fr: 0.13 + ragam * 0.04, ft: 0.1 + ragam * 0.03,
        };
      });

      function tick(waktu) {
        var a = wave.amp;
        sheets.forEach(function (s) {
          gsap.set(s.el, {
            y: Math.sin(waktu * s.fy * TAU + s.fase) * s.ay * s.arah * a,
            rotate: Math.sin(waktu * s.fr * TAU + s.fase * 1.7) * s.ar * s.arah * a,
            rotateY: Math.sin(waktu * s.ft * TAU + s.fase * 0.6) * s.at * s.arah * a,
            rotateX: Math.cos(waktu * s.ft * TAU + s.fase * 0.6) * s.ax * -s.arah * a,
          });
        });
      }
      tambahTicker(tick);
      return { wave: wave, stop: function () { gsap.ticker.remove(tick); } };
    }

    var mm = gsap.matchMedia();

    function createArrival() {
      var cards = $$("[data-arrive]", grid);
      var floats = $$("[data-float]", grid);
      if (!cards.length) return;

      var FLOOR = 0.72;

      function neededScale() {
        gsap.set(grid, { scale: 1 });
        var available = fit.clientHeight;
        /* offsetHeight, BUKAN scrollHeight: scrollHeight ikut menghitung luapan
           dari anak yang sedang di-transform — dan di sini seluruh kartu memang
           sedang melayang. */
        var needed = grid.offsetHeight;
        return needed > available ? available / needed : 1;
      }

      /*
       * DUA SYARAT, BUKAN SATU, sebelum panggung ini boleh di-pin.
       *
       * 1. Panggungnya memang setinggi satu layar. Ini TIDAK selalu benar:
       *    CSS memberi `height: 100vh` hanya di >=900px, dan di bawah itu
       *    menggantinya jadi `height: auto`. Dulu syarat ini tidak diperiksa,
       *    sehingga di tablet 768px panggung setinggi 2171px tetap di-pin
       *    seolah setinggi 1024px — sebagian besar isinya tersemat di luar
       *    pandangan dan tidak pernah benar-benar terlihat berhenti.
       *
       * 2. Kisinya masih bisa diperkecil tanpa melewati ambang keterbacaan.
       *    Memaksa enam sertifikat muat di satu layar ponsel menuntut skala
       *    sekitar 0,2 — tulisannya tidak lagi bisa dibaca, dan menyematkan
       *    sesuatu yang tak terbaca adalah kemunduran, bukan gaya.
       *
       * Kalau salah satu tidak terpenuhi, panggung melepas pin dan tumbuh
       * mengikuti isinya. Animasinya sendiri TIDAK berubah — kartu tetap
       * datang dari sudut, tetap bergelombang, tetap mendarat lurus.
       */
      var satuLayar = root.getBoundingClientRect().height <= window.innerHeight + 1;
      var flow = !satuLayar || neededScale() < FLOOR;
      root.classList.toggle("arrival-stage--flow", flow);

      function applyFit() {
        if (flow) { gsap.set(grid, { scale: 1 }); return; }
        gsap.set(grid, { scale: neededScale(), transformOrigin: "center center" });
      }
      applyFit();

      var settleTimer = 0;
      var ro = amati(fit, function () {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(applyFit, 180);
      });
      ro.observe(grid);
      bersih.push(function () { clearTimeout(settleTimer); });

      /*
       * DUA BENTANGAN, BUKAN SATU — dan pemisahan inilah kuncinya.
       *
       * Kalau pin dan animasi memakai pemicu yang sama, keduanya mulai di titik
       * yang sama juga — artinya SATU LAYAR PENUH scroll dihabiskan hanya untuk
       * mendekat, dengan kisi yang masih kosong. Dengan pin berdiri sendiri,
       * animasinya bebas mulai LEAD layar lebih awal.
       */
      var LEAD = 0.55, PIN = 1;

      if (!flow) {
        ScrollTrigger.create({
          trigger: root, start: "top top",
          end: function () { return "+=" + Math.round(window.innerHeight * PIN); },
          pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          /* Pin menyisipkan spacer dan mendorong turun semua isi di bawahnya,
             jadi ia harus dihitung lebih dulu daripada pemicu mana pun yang
             posisinya bergantung pada tata letak itu. */
          refreshPriority: 1,
        });
      }

      /*
       * DUA CARA MENDATANGKAN, karena dua tata letak yang berbeda.
       *
       * DI-PIN: seluruh kisi terlihat sekaligus dan layarnya ditahan, jadi satu
       * timeline sepanjang jarak pin memang benar — lembaran berdatangan
       * bergantian mengisi kisi yang sama-sama terpandang.
       *
       * MENGALIR: satu kolom ke bawah, dan hanya satu kartu yang benar-benar
       * terpandang pada satu saat. Timeline tunggal salah di sini, dan
       * salahnya terasa: ia direntangkan sepanjang SELURUH bagian — 2182px di
       * ponsel — sehingga tiap kartu masih merayap mendekat padahal kartu
       * berikutnya sudah masuk layar, dan tidak ada satu pun yang pernah
       * terlihat BERHENTI.
       *
       * Jadi di mode mengalir tiap kartu memakai pemicunya sendiri, pendek,
       * dan yang menentukan bukan posisi bagiannya melainkan posisi KARTU ITU:
       * mulai saat tepi atasnya menyentuh 92% tinggi layar, selesai saat
       * menyentuh 48% — kira-kira ketika kartunya duduk di tengah. Lewat titik
       * itu progresnya sudah 1 dan ia diam sampai digulir balik.
       */
      var tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: flow
          ? { trigger: root, start: "clamp(top 88%)", end: "clamp(bottom 92%)", scrub: SCRUB_PIN, invalidateOnRefresh: true }
          : {
              trigger: root, start: "top " + LEAD * 100 + "%",
              end: function () { return "+=" + Math.round(window.innerHeight * (LEAD + PIN)); },
              scrub: SCRUB_PIN, invalidateOnRefresh: true,
            },
      });

      var pemicuKartu = [];

      cards.forEach(function (card, i) {
        var sudut = CORNERS[i % CORNERS.length];
        var ragam = ((i * 41) % 17) / 16;

        /*
         * JARAK BERANGKAT BEDA ANTARA DUA MODE, dan harus beda.
         *
         * Di mode pin, kartu punya lebih dari satu layar penuh scroll untuk
         * menempuh perjalanannya, jadi sepertiga layar terasa lapang.
         * Di mode mengalir jatahnya cuma 44% tinggi layar — sekitar 370px di
         * ponsel. Jarak sejauh itu di ruang sesempit itu terbaca sebagai
         * kartu yang dilempar, bukan diletakkan, dan sebagian besar
         * perjalanannya habis di luar bingkai.
         */
        var dari = flow
          ? {
              x: sudut.x * (window.innerWidth * 0.22 + ragam * 40),
              y: 40 + ragam * 24,
              rotate: sudut.x * (0.8 + ragam * 0.8),
              scale: 0.97, opacity: 0,
            }
          : {
              /* Sepertiga layar sudah cukup untuk membuatnya masuk dari luar
                 bingkai sambil menyisakan hampir seluruh perjalanan untuk
                 dinikmati. Versi 0,55 lebar layar membuat sebagian besar
                 perjalanan habis di luar pandangan. */
              x: sudut.x * (window.innerWidth * 0.32 + ragam * 90),
              y: sudut.y * (window.innerHeight * 0.34 + ragam * 80),
              rotate: sudut.x * (1.2 + ragam * 1.3),
              scale: 0.95, opacity: 0,
            };

        var ke = {
          x: 0, y: 0,
          /* Mendarat LURUS. Sisa miring menghidupkan bidang yang sedang
             bergerak, tapi begitu semuanya di tempat, kisi yang tiap kartunya
             miring sendiri terbaca tidak rapi — bukan sebagai gaya. */
          rotate: 0, scale: 1, opacity: 1,
          /*
           * SATU-SATUNYA TEMPAT ATURAN "easing harus none" DILANGGAR, dan
           * pelanggarannya disengaja. Gerakannya masih 1:1 dengan jarak
           * scroll; yang diubah cuma bentuk gerak DI DALAM satu kedatangan.
           * Dengan `none`, lembaran melaju penuh lalu berhenti mendadak — dan
           * saat di-scroll balik, lompatan kecepatan itulah yang terasa.
           */
          ease: "power2.out",
        };

        if (flow) {
          ke.scrollTrigger = {
            trigger: card, start: "top 92%", end: "top 48%",
            scrub: SCRUB_PIN, invalidateOnRefresh: true,
          };
          var t = gsap.fromTo(card, dari, ke);
          if (t.scrollTrigger) pemicuKartu.push(t.scrollTrigger);
          return;
        }

        ke.duration = 0.5 + ragam * 0.18;
        /* Jeda antar lembaran sengaja lebih rapat daripada durasinya, jadi
           selalu ada beberapa lembaran melayang bersamaan. */
        tl.fromTo(card, dari, ke, 0.06 + i * 0.03);
      });

      /*
       * DUA SEBAB GELOMBANG INI DIMATIKAN, dan keduanya berdiri sendiri.
       *
       * PERTAMA, di mode mengalir ia melawan maksud desainnya sendiri. Tiap
       * kartu sekarang sengaja BERHENTI begitu sampai di tengah layar; kalau
       * setelah itu ia masih bergoyang pelan, "berhenti" tidak pernah benar-
       * benar terjadi. Di mode pin persoalannya tidak muncul, karena di sana
       * gelombangnya diredam ke nol pada 66% timeline saat kisi sudah utuh.
       *
       * KEDUA, di perangkat lemah ia mahal — dan justru INI, bukan jumlah
       * kartunya, yang menentukan kemulusan bagian ini. Kedatangan kartu
       * digerakkan scroll lalu selesai; gelombang ini terpasang di gsap.ticker
       * dan menulis y, rotate, rotateY, rotateX ke setiap lembaran di setiap
       * frame selamanya. Dua di antaranya rotasi 3D pada gambar sertifikat
       * berukuran penuh.
       *
       * Diukur pada CPU dicekik 6x, 390x844, tiga ulangan tiap kondisi:
       *
       *   6 kartu + gelombang        24,2 fps    38 frame >50ms
       *   2 kartu + gelombang        38,9 fps     3 frame >50ms
       *   6 kartu, tanpa gelombang   52,9 fps     1 frame >50ms
       *
       * Jadi memangkas kartu tidak menyentuh sebabnya sama sekali.
       */
      var wave = createPaperWave(flow || perangkatLemah() ? [] : floats);
      tl.to(wave.wave, { amp: 0, duration: 0.18, ease: "power1.inOut" }, 0.66);

      /*
       * JEDA DIAM DI UJUNG. ScrollTrigger merentangkan SELURUH timeline
       * sepanjang jarak scrub; selama timeline habis tepat di lembaran
       * terakhir, "selesai" dan "boleh lanjut" jatuh di titik yang sama — kisi
       * utuh hanya ada satu frame sebelum pin lepas.
       */
      tl.to({}, { duration: 0.2 }, 0.8);

      return function () {
        clearTimeout(settleTimer);
        ro.disconnect();
        wave.stop();
        /* Pemicu per-kartu di mode mengalir tidak ikut mati bersama timeline,
           karena ia memang bukan miliknya. Tanpa ini, berganti lebar layar
           meninggalkan pemicu lama yang masih mengawasi kartu yang sama. */
        pemicuKartu.forEach(function (t) { t.kill(true); });
        gsap.set(cards.concat(floats, [grid]), { clearProps: "all" });
      };
    }

    /*
     * SATU KEDATANGAN UNTUK SEMUA LEBAR.
     *
     * Dulu ponsel punya fungsinya sendiri, dan tiga hal membuatnya berbeda:
     * hanya DUA lembaran pertama yang dianimasikan, datangnya dari samping
     * bukan dari sudut, dan gelombang kertasnya hanya mengenai dua lembaran
     * itu. Akibatnya empat dari enam sertifikat muncul begitu saja tanpa
     * gerak apa pun — dan sertifikat yang muncul tiba-tiba terbaca sebagai
     * halaman yang belum selesai, bukan sebagai pilihan desain.
     *
     * Memangkasnya juga tidak dibayar apa-apa. Diukur pada panggung Keahlian,
     * jumlah elemen bukan yang memakan frame: mematikan empat puluh huruf di
     * sana hanya mengembalikan 3 fps, sementara melepas pin mengembalikan 17.
     * Empat lembaran tambahan di sini jauh lebih murah daripada itu.
     *
     * Yang membedakan antar lebar sekarang hanya SATU hal, dan itu keputusan
     * tata letak bukan animasi: panggung disematkan kalau isinya memang muat
     * satu layar tanpa mengorbankan keterbacaan, dan mengalir kalau tidak.
     * Di ponsel enam sertifikat tidak akan pernah muat, jadi ia mengalir.
     */
    mm.add(DEVICE.desktop, createArrival);
    mm.add(DEVICE.tablet, createArrival);
    mm.add(DEVICE.mobile, createArrival);
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

  /* ── 7. PENYALAAN ───────────────────────────────────────────────────────
   *
   * Urutannya bukan selera. Struktur dibangun lebih dulu (huruf, lambang,
   * odometer, salinan marquee) karena setiap transisi di bawahnya mencari
   * elemen yang baru saja dibuat itu. Baru setelah semuanya ada di DOM,
   * animasi dipasang.
   */
  function start() {
    buildGlyphs();
    buildOdometers();
    buildLetterHover();
    buildWordScrub();
    buildMarquees();

    initScroller();

    initLineMasks();
    initScrubReveals();
    initRevealImages();
    initWordScrub();
    initSplitWords();
    initOdometers();
    initMarquees();
    initHingeCards();
    initSheetArrival();
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
