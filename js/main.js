/*
 * ══════════════════════════════════════════════════════════════════════════
 * SELURUH GERAK SITUS INI, DALAM SATU BERKAS.
 *
 * Dijalankan sekali saat halaman siap. Tidak ada kerangka kerja, tidak ada
 * langkah build — `gsap`, `ScrollTrigger`, dan `Lenis` datang dari tiga berkas
 * di js/vendor/ dan tersedia sebagai variabel global.
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
(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger);

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

  /* Mode ringan sudah ditandai di <head> supaya CSS-nya berlaku sebelum
     gambar pertama; di sini tinggal dibaca kembali. */
  function isLite() {
    return document.documentElement.classList.contains("is-lite");
  }

  /* ── 3. BANTU-BANTU ─────────────────────────────────────────────────────*/
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* Acak yang bisa diulang. Nilai acak sungguhan berubah tiap render, sehingga
     pola ledakan ikut berubah setiap kali ScrollTrigger menyegarkan diri — dan
     itu terlihat sebagai huruf yang meloncat sendiri. */
  function noise(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* Kata raksasa panggung keahlian dipecah di sini, bukan ditulis 40 span di
     HTML: yang di HTML cukup katanya, jadi mengganti bidang keahlian tidak
     menuntut menghitung span. */
  function buildStageLetters() {
    $$("[data-stage-word]").forEach(function (row) {
      var kata = row.getAttribute("data-stage-word");
      var html = "";
      for (var i = 0; i < kata.length; i++) {
        html += '<span data-letter class="inline-block will-change-transform">' + kata[i] + "</span>";
      }
      row.innerHTML = html;
    });
  }

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
        track.appendChild(salinan);
      }
    });
  }

  /* ── 4. SCROLL HALUS ────────────────────────────────────────────────────*/
  var lenis = null;

  function initScroller() {
    if (prefersReducedMotion()) return;
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
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

      gsap.ticker.add(function (_t, deltaMs) {
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

      new ResizeObserver(function () { half = track.scrollWidth / 2; }).observe(track);
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
   * PANGGUNG KEAHLIAN — tiga babak dalam satu bentangan scroll yang di-pin.
   *
   *   Babak 1  Kata raksasa bertumpuk di tengah, menindih monolit berputar.
   *   Babak 2  Kata-katanya PECAH, terlempar keluar dari pusat lalu hilang.
   *   Babak 3  Dari ruang yang ditinggalkannya, kartu masuk dan menyusun diri.
   *
   * Ledakan di tengah bukan hiasan — ia yang mengosongkan layar sehingga kartu
   * punya tempat untuk datang. Arah lemparan tiap huruf DIHITUNG DARI
   * POSISINYA, bukan diacak buta: acak murni menghasilkan gumpalan bergetar.
   */
  function initSkillStage() {
    var root = $(".stage");
    if (!root || prefersReducedMotion()) return;

    var CORNER = {
      "top-left": { x: -1, y: -1 }, "top-right": { x: 1, y: -1 },
      "bottom-left": { x: -1, y: 1 }, "bottom-right": { x: 1, y: 1 },
    };
    var EXPLODE_AT = 0.24;
    var SLAB_PEAK = 1.38;

    var slab = $(".slab", root);
    var words = $(".stage-words", root);
    var cardsBox = $(".stage-cards", root);
    var orbit = $(".stage-orbit", root);

    var mm = gsap.matchMedia(root);

    function createAnimation(distFactor) {
      var letters = $$("[data-letter]", root);
      var cards = $$("[data-card]", root);
      var rowEls = $$("[data-row]", root);
      if (!letters.length || !cards.length || !rowEls.length) return;

      /*
       * MEMPERKECIL AGAR MUAT — panggung ini terkunci setinggi satu layar dan
       * `overflow: hidden`, jadi apa pun yang melebihi tingginya tidak sekadar
       * meluber: ia hilang, dan tidak ada cara menggulungnya. Lantainya 0,7 —
       * di bawah itu kartunya berhenti terbaca, dan memaksa muat berhenti jadi
       * keputusan desain.
       */
      function fitOrbit() {
        if (!orbit || !cardsBox) return;
        gsap.set(orbit, { scale: 1 });
        var cs = getComputedStyle(cardsBox);
        var available = cardsBox.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        /* offsetHeight, BUKAN getBoundingClientRect: yang terakhir ikut
           menghitung skala yang baru saja dipasang, jadi tiap pengukuran ulang
           akan mengecil menumpuk. */
        var needed = orbit.offsetHeight;
        if (!available || !needed) return;
        var scale = needed > available ? Math.max(available / needed, 0.7) : 1;
        gsap.set(orbit, { scale: scale, transformOrigin: "center center" });
      }
      fitOrbit();

      /* DITUNDA sampai ukurannya BERHENTI berubah: memasang pin menyisipkan
         spacer dan mengubah tata letak beberapa kali dalam satu rentetan. */
      var fitTimer = 0;
      var ro = new ResizeObserver(function () {
        clearTimeout(fitTimer);
        fitTimer = setTimeout(fitOrbit, 180);
      });
      ro.observe(cardsBox);

      var CARD_START = 0.5, CARD_GAP = 0.08, CARD_DUR = 0.26, SETTLE = 0.79;
      var lastOrder = cards.reduce(function (m, c) { return Math.max(m, Number(c.dataset.order) || 0); }, 0);
      var total = (CARD_START + lastOrder * CARD_GAP + CARD_DUR) / SETTLE;

      var tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: {
          trigger: root, start: "top top",
          end: function () { return "+=" + Math.round(window.innerHeight * 1.6); },
          pin: true, scrub: SCRUB_PIN, anticipatePin: 1,
          invalidateOnRefresh: true, refreshPriority: 1,
        },
      });

      tl.fromTo(slab, { rotate: -14, scale: 0.82 }, { rotate: -8, scale: 0.9, duration: EXPLODE_AT }, 0);
      tl.to(slab, { rotate: 6, scale: SLAB_PEAK, duration: 0.32, ease: "power2.out" }, EXPLODE_AT);
      tl.to(slab, {
        rotate: 12, scale: SLAB_PEAK + 0.04,
        duration: Math.max(total - EXPLODE_AT - 0.32, 0.1),
      }, EXPLODE_AT + 0.32);

      /*
       * DUA CARA MELEDAK, DIPILIH DARI KEKUATAN PERANGKAT.
       *
       * Per huruf: 40 elemen × 5 properti = 200 nilai baru tiap frame, dan 40
       * lapisan komposit. Per kata: 4 elemen, 20 nilai — sepersepuluhnya.
       *
       * Yang hilang sedikit, yang didapat banyak. Pada layar ponsel, huruf
       * setinggi 10vw yang terlempar ke segala arah terbaca sebagai gumpalan
       * bergetar, bukan ledakan — kerapatannya terlalu tinggi untuk ukuran
       * layarnya. Barisnya yang terbang berpencar justru lebih terbaca.
       *
       * INTRO-nya ikut berpindah sasaran, dan itu wajib: kalau jalur ringan
       * memakai elemen yang sama untuk meledak, kedua tween berebut properti
       * yang sama dan yang kalah tersendat.
       */
      var lite = isLite();
      var rowCount = rowEls.length;

      tl.fromTo(
        lite ? words : rowEls,
        { scale: 0.94, opacity: 0.75 },
        lite ? { scale: 1, opacity: 1, duration: 0.22 }
             : { scale: 1, opacity: 1, duration: 0.22, stagger: 0.03 },
        0,
      );

      if (lite) {
        rowEls.forEach(function (el, r) {
          var vy = rowCount > 1 ? (r / (rowCount - 1)) * 2 - 1 : 0;
          var n1 = noise(r + 1), n2 = noise(r + 97);
          tl.to(el, {
            /* Dorongan mendatarnya kecil saja: yang memisahkan baris di sini
               arah tegaknya, dan geseran samping besar hanya membuat keempatnya
               saling menyeberang. */
            x: (n1 - 0.5) * 180,
            y: vy * (220 + n2 * 200),
            rotate: (n1 - 0.5) * 24,
            scale: 0.55 + n2 * 0.3,
            opacity: 0, duration: 0.36, delay: n2 * 0.06,
          }, EXPLODE_AT);
        });
      } else {
        var seed = 0;
        rowEls.forEach(function (row, r) {
          var chars = $$("[data-letter]", row);
          var len = chars.length;
          var vy = rowCount > 1 ? (r / (rowCount - 1)) * 2 - 1 : 0;

          chars.forEach(function (el, c) {
            var hx = len > 1 ? (c / (len - 1)) * 2 - 1 : 0;
            var n1 = noise(seed + 1), n2 = noise(seed + 97), n3 = noise(seed + 613);
            seed += 1;
            tl.to(el, {
              x: hx * (260 + n1 * 460),
              y: vy * (170 + n2 * 300) + (n3 - 0.5) * 160,
              rotate: (n1 - 0.5) * 240,
              scale: 0.35 + n2 * 0.75,
              opacity: 0, duration: 0.36, delay: n3 * 0.08,
            }, EXPLODE_AT);
          });
        });
      }

      cards.forEach(function (card) {
        var offset = CORNER[card.dataset.position] || { x: 0, y: 0 };
        var order = Number(card.dataset.order) || 0;
        /* Jarak berangkat dinyatakan dalam ARAH lalu diubah jadi jarak yang
           proporsional terhadap ukuran kartu — cukup jauh untuk terasa masuk
           dari luar gugus, tanpa keluar dari panggung yang overflow-nya
           disembunyikan. */
        tl.fromTo(card,
          { x: offset.x * card.offsetWidth * distFactor, y: offset.y * card.offsetHeight * distFactor, opacity: 0, scale: 0.88 },
          { x: 0, y: 0, opacity: 1, scale: 1, duration: CARD_DUR, ease: "power2.out" },
          CARD_START + order * CARD_GAP,
        );
      });

      return function () {
        clearTimeout(fitTimer);
        ro.disconnect();
        gsap.set(letters.concat(cards, rowEls, [words, slab, orbit]), { clearProps: "all" });
      };
    }

    mm.add(DEVICE.desktop, function () { return createAnimation(0.9); });
    mm.add(DEVICE.tablet, function () { return createAnimation(0.9); });
    mm.add(DEVICE.mobile, function () { return createAnimation(0.8); });
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
      gsap.ticker.add(tick);
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

      /* Selama masih bisa diperkecil tanpa melewati ambang keterbacaan, ini
         panggung satu layar yang di-pin. Kalau sertifikatnya sudah terlalu
         banyak, panggung melepas pin dan tumbuh mengikuti isi. */
      var flow = neededScale() < FLOOR;
      root.classList.toggle("arrival-stage--flow", flow);

      function applyFit() {
        if (flow) { gsap.set(grid, { scale: 1 }); return; }
        gsap.set(grid, { scale: neededScale(), transformOrigin: "center center" });
      }
      applyFit();

      var settleTimer = 0;
      var ro = new ResizeObserver(function () {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(applyFit, 180);
      });
      ro.observe(fit);
      ro.observe(grid);

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

      cards.forEach(function (card, i) {
        var sudut = CORNERS[i % CORNERS.length];
        var ragam = ((i * 41) % 17) / 16;
        tl.fromTo(card,
          {
            /* Sepertiga layar sudah cukup untuk membuatnya masuk dari luar
               bingkai sambil menyisakan hampir seluruh perjalanan untuk
               dinikmati. Versi 0,55 lebar layar membuat sebagian besar
               perjalanan habis di luar pandangan. */
            x: sudut.x * (window.innerWidth * 0.32 + ragam * 90),
            y: sudut.y * (window.innerHeight * 0.34 + ragam * 80),
            rotate: sudut.x * (1.2 + ragam * 1.3),
            scale: 0.95, opacity: 0,
          },
          {
            x: 0, y: 0,
            /* Mendarat LURUS. Sisa miring menghidupkan bidang yang sedang
               bergerak, tapi begitu semuanya di tempat, kisi yang tiap kartunya
               miring sendiri terbaca tidak rapi — bukan sebagai gaya. */
            rotate: 0, scale: 1, opacity: 1,
            duration: 0.5 + ragam * 0.18,
            /*
             * SATU-SATUNYA TEMPAT ATURAN "easing harus none" DILANGGAR, dan
             * pelanggarannya disengaja. Timeline ini masih 1:1 dengan jarak
             * scroll; yang diubah cuma bentuk gerak DI DALAM satu kedatangan.
             * Dengan `none`, lembaran melaju penuh lalu berhenti mendadak — dan
             * saat di-scroll balik, lompatan kecepatan itulah yang terasa.
             */
            ease: "power2.out",
          },
          /* Jeda antar lembaran sengaja lebih rapat daripada durasinya, jadi
             selalu ada beberapa lembaran melayang bersamaan. */
          0.06 + i * 0.03,
        );
      });

      var wave = createPaperWave(floats);
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
        gsap.set(cards.concat(floats, [grid]), { clearProps: "all" });
      };
    }

    /* Di ponsel hanya dua lembaran pertama yang dianimasikan, dan datangnya
       dari samping — bukan dari sudut. */
    function createArrivalMobile() {
      var cards = $$("[data-arrive]", grid);
      var floats = $$("[data-float]", grid);
      if (!cards.length) return;

      var n = Math.min(cards.length, 2);
      var animated = cards.slice(0, n);
      var animatedFloats = floats.slice(0, n);

      var tl = gsap.timeline({
        defaults: { ease: EASE_SCRUB },
        scrollTrigger: {
          trigger: root, start: "top 90%",
          end: function () { return "+=" + Math.round(window.innerHeight * 0.9); },
          scrub: SCRUB_PIN, invalidateOnRefresh: true,
        },
      });

      animated.forEach(function (card, i) {
        var arah = i % 2 === 0 ? -1 : 1;
        var ragam = ((i * 41) % 17) / 16;
        tl.fromTo(card,
          {
            x: arah * (window.innerWidth * 0.38 + ragam * 90),
            y: (ragam - 0.5) * 40,
            rotate: arah * (1.2 + ragam * 1.3),
            scale: 0.95, opacity: 0,
          },
          { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, duration: 0.5 + ragam * 0.18, ease: "power2.out" },
          0.06 + i * 0.03,
        );
      });

      var wave = createPaperWave(animatedFloats);
      tl.to(wave.wave, { amp: 0, duration: 0.18, ease: "power1.inOut" }, 0.66);
      tl.to({}, { duration: 0.2 }, 0.8);

      return function () {
        wave.stop();
        gsap.set(cards.concat(animatedFloats, [grid]), { clearProps: "all" });
      };
    }

    mm.add(DEVICE.desktop, createArrival);
    mm.add(DEVICE.tablet, createArrival);
    mm.add(DEVICE.mobile, createArrivalMobile);
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
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          if (!running) { running = true; raf = requestAnimationFrame(draw); }
        } else {
          running = false; cancelAnimationFrame(raf);
        }
      }, { threshold: 0 }).observe(canvas);

      new ResizeObserver(build).observe(canvas);

      window.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      }, { passive: true });
      window.addEventListener("pointerleave", function () { pointer.x = -9999; pointer.y = -9999; });
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
      b.addEventListener("click", function () { scrollTo("#" + bab.id); });
      dotsEl.appendChild(b);
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

    jumpBtn.addEventListener("click", function () { scrollTo("#" + CHAPTERS[index].id); });

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
    window.addEventListener("scroll", sync, { passive: true });

    btn.addEventListener("click", function () {
      var jarak = window.scrollY;
      scrollTo(0, { duration: Math.min(Math.max(jarak / SPEED, MIN), MAX), easing: easeInOutCubic });
    });
  }

  /* Lenis yang memegang scroll, jadi lompatan anchor bawaan browser harus
     dicegah — kalau tidak, halaman menyentak lalu Lenis menariknya balik. */
  function initAnchors() {
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
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

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var isian = ambilIsian();
      if (!isian) return;
      var nomor = TELEPON.replace(/\D/g, "");
      if (nomor.indexOf("0") === 0) nomor = "62" + nomor.slice(1);
      window.open("https://wa.me/" + nomor + "?text=" + encodeURIComponent(susunPesan(isian)),
        "_blank", "noopener,noreferrer");
    });

    $("#kirim-email").addEventListener("click", function () {
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
    buildStageLetters();
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
    initSkillStage();
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
