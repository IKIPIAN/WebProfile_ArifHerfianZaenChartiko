import { site } from "../data/site";
import { useTypewriter } from "../hooks/useTypewriter";
import { STAGGER } from "../animation/motion-tokens";
import { LineMask } from "../components/core/LineMask";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { RevealImage } from "../components/core/RevealImage";
import { AmbientLines } from "../components/core/AmbientLines";
import { Container } from "../components/ui/Container";
import { Button } from "../components/ui/Button";
import foto from "../assets/foto.jpeg";

/*
 * Pembuka, bukan salah satu bab — karena itu tidak memakai <Chapter> dan tidak
 * diberi nomor urut.
 *
 * Transisi masuknya berbasis WAKTU, bukan scroll: seluruh isinya sudah
 * terlihat saat halaman dibuka, dan pada scrollY 0 belum ada jarak scroll yang
 * bisa menggerakkan apa pun. `delay` yang menaik itulah yang menyusun urutan
 * masuknya — nama lebih dulu, atributnya menyusul, tombol paling akhir.
 *
 * Latarnya diisi medan garis yang bereaksi pada kursor. Bidang segelap ini
 * tanpa apa pun di belakangnya terbaca sebagai halaman gagal muat, bukan
 * sebagai keputusan desain.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * SATU LAYAR PENUH DI SEMUA PERANGKAT — TERISI, BUKAN SEKADAR TIDAK TERPOTONG.
 *
 * Ini pembuka: yang terlihat pada detik pertama menentukan apakah orang
 * menggulung ke bawah sama sekali. Ada DUA cara gagal di sini, berlawanan arah
 * dan sama buruknya — isi yang jatuh di bawah tepi layar, dan isi yang
 * berkumpul jadi gumpalan kecil di tengah dengan bidang kosong lebar di atas
 * serta di bawahnya. Yang kedua terbaca sebagai halaman yang belum selesai
 * dimuat.
 *
 * TABLET DULU GAGAL DENGAN CARA YANG KEDUA, dan angkanya begini. Di 768x1024
 * tinggi yang harus diisi 888px, sementara isinya cuma 473px — sisanya +-200px
 * kosong di atas DAN di bawah. Sebabnya dua, dan keduanya harus dibereskan
 * sekaligus:
 *
 *   1. Tipografi 640-899px masih memakai skala ponsel, jadi nama berhenti di
 *      55px di layar selebar 768px. Diperbaiki di index.css, tingkatan tablet.
 *
 *   2. Fotonya duduk di kolom 0,65fr yang lebarnya cuma 224px, jadi tingginya
 *      mentok 298px — rumus penyerap sisa tinggi yang dulu dipasang padanya
 *      tidak pernah sempat bekerja karena lebar kolom sudah membatasi lebih
 *      dulu.
 *
 * DUA KOLOM TIDAK BISA MEMENUHI LAYAR POTRET, dan itu bukan soal penyetelan.
 * Melebarkan kolom fotonya pun tidak menolong: pada rasio berkas fotonya (2:3),
 * tinggi 888px menuntut lebar 592px dari 688px yang tersedia — tidak menyisakan
 * tempat untuk nama di sebelahnya. Satu-satunya susunan yang sanggup adalah
 * yang bertumpuk, karena di situ foto boleh setinggi apa pun tanpa menuntut
 * lebar.
 *
 * MAKA YANG MEMILIH SUSUNANNYA ADALAH BENTUK LAYAR, BUKAN LEBARNYA — varian
 * `wide` di index.css: mendatar berarti dua kolom, jangkung berarti bertumpuk.
 * Ambang lebar saja pernah dicoba dan bocor di kedua ujungnya sekaligus. Di
 * 900px ke atas, tablet potret 1024x1366 lolos jadi dua kolom dan cuma mengisi
 * 40% layar; di bawahnya, ponsel yang diputar (844x390) dipaksa bertumpuk dan
 * fotonya menyusut jadi 51px. Keduanya hilang begitu yang ditanyakan bukan
 * "selebar apa" melainkan "sejangkung apa".
 *
 * MEKANISMENYA BARIS KISI, BUKAN ANGKA HASIL PENGUKURAN. Kisinya bertingkat
 * `auto / minmax(0,1fr) / auto`: sapaan dan nama di baris pertama, keterangan
 * dan tombol di baris ketiga, foto di baris tengah yang MENYERAP SELURUH SISA
 * TINGGI. Versi sebelumnya menghitung sisa itu sendiri lewat
 * `calc((100svh - 490px) * 0,8)`, dengan 490 sebagai tinggi terukur semua
 * bagian tetap — dan komentarnya sendiri sudah memperingatkan bahwa angka itu
 * "HARUS diukur ulang" begitu ada satu baris teks bertambah. Baris `1fr`
 * mengukur ulang sendiri pada setiap tata letak, jadi tidak ada lagi yang bisa
 * meleset diam-diam.
 *
 * `min-h-svh` memakai `svh`, BUKAN `vh`. Di ponsel `vh` diukur saat bilah
 * alamat browser tersembunyi, jadi 100vh selalu lebih tinggi daripada yang
 * benar-benar terlihat saat halaman baru dibuka — dan selisih itulah yang dulu
 * memotong tombolnya.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * TIGA VARIAN, DAN MASING-MASING MENJAWAB SATU PERTANYAAN:
 *
 *   min-[640px]:  "layarnya sudah cukup lebar?"  — jarak dan perataan dasar
 *   wide:         "bentuknya mendatar?"          — jumlah kolom
 *   roomy:        "tingginya juga lapang?"       — jarak tegak desktop
 *
 * Pemisahan `wide` dari `roomy` itu bukan kerapian: selama keduanya satu, layar
 * mendatar yang pendek mendapat susunan yang benar tapi jarak yang mustahil —
 * lihat catatannya di index.css.
 *
 * DAN TIDAK SATU PUN MEMAKAI `sm:` ATAU `nav:`. Di build ini `nav:` diemit
 * lebih dulu daripada `sm:`, jadi pada layar >=900px `sm:` justru menang karena
 * berada lebih akhir di berkas. Bagian ini dulu memakai enam pasang yang
 * bertabrakan sekaligus — perataan vertikal, lebar foto, rasio foto, gap kisi,
 * dan padding atas-bawah — sehingga di desktop SEMUANYA diam-diam memakai nilai
 * tablet. Varian `min-[...]` diurutkan menurut nilainya sendiri; urutan `wide`
 * dan `roomy` sudah diperiksa dengan mengukur ulang desktop sesudah
 * penggantiannya, dan hasilnya identik sampai ke piksel.
 */
export function HeroSection() {
  const profesi = useTypewriter(site.typewriterRoles);

  return (
    <section
      id="home"
      data-component="chapter"
      /*
       * Padding bawah selalu lebih tebal daripada atas, dan itu bukan selera:
       * bilah status melayang di sekitar 96% tinggi layar, jadi isi yang
       * berhenti tepat di tepi bawah akan tertimpa olehnya.
       *
       * PADDING ATAS IKUT TINGGI LAYAR SAAT BERTUMPUK — `8svh`/`9svh`, bukan
       * 32px/40px tetap — dan ini yang MEMBAGI sisa ruang, bukan sekadar
       * menggeser isi ke bawah.
       *
       * Begitu foto diberi batas, sisa tinggi tidak ikut hilang; ia harus
       * mendarat di suatu tempat. Dengan padding tetap, seluruhnya jatuh ke
       * satu tempat: baris foto, yang membaginya jadi dua bidang kosong di atas
       * dan bawah foto. Terukur di 390x844: 86px kosong di antara nama dan
       * foto, sementara nama sendiri menempel 32px dari tepi atas. Yang terbaca
       * bukan "lapang" melainkan "namanya terlempar ke atas, lalu ada satu
       * enter kejauhan".
       *
       * Padding yang sebanding tinggi layar mengambil bagiannya lebih dulu, dan
       * yang tersisa untuk baris foto tinggal separuhnya. Di 390x844 jadi 68px
       * di atas nama dan 45px di tiap sisi foto — ketiga bidangnya kini sepadan.
       *
       * Di layar pendek ia menyusut sendiri (45px di 320x568) dan foto yang
       * mengalah, karena baris fotonya memang yang paling lentur.
       */
      className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-[8svh] pb-20 min-[640px]:pt-[9svh] min-[640px]:pb-24 roomy:pt-16 roomy:pb-28"
    >
      <AmbientLines density={52} />

      {/* `flex-1` saat bertumpuk: wadah ini harus MEMBENTANG setinggi ruang
          yang tersisa, karena baris `1fr` di dalamnya hanya punya sisa untuk
          dibagi kalau induknya sendiri punya tinggi yang pasti. Di layar
          mendatar ia kembali jadi blok biasa yang tingginya mengikuti isi, dan
          `justify-center` pada section-lah yang menengahkannya — persis
          perilaku `items-center` yang dulu ada di sana. */}
      <Container
        wide
        className="relative z-2 flex w-full flex-1 flex-col text-center wide:block wide:flex-none wide:text-left"
      >
        {/*
            TIGA BARIS DI LAYAR JANGKUNG, DUA KOLOM DI LAYAR MENDATAR.

            Bertingkat `auto / minmax(0,1fr) / auto`, dan urutan anaknya di JSX
            sudah cocok dengan itu apa adanya: sapaan+nama, foto, lalu
            keterangan+tombol. Baris tengah yang `1fr` adalah seluruh mekanisme
            "satu layar penuh" — ia menerima apa pun yang tersisa, berapa pun
            tinggi layarnya.

            `minmax(0,1fr)`, BUKAN `1fr` saja. Bawaan `1fr` adalah
            `minmax(auto,1fr)`, dan batas bawah `auto` itu menolak menyusut di
            bawah tinggi isi barisnya — di layar pendek foto justru akan
            mendorong tombol keluar dari tepi bawah, persis kebalikan dari yang
            diminta. Batas bawah nol yang mengizinkannya mengalah.

            Perbandingan 1,35fr : 0,65fr itu pernyataan hierarki — nama
            menguasai kolom lebar, foto duduk di kolom sempit sebagai pendukung
            — dan itu tetap benar di layar mendatar. Yang keliru adalah
            memberlakukannya pada layar potret: di sana kolom 0,65fr justru
            MENGUNCI foto pada 224px dan membuat layar mustahil terisi (lihat
            catatan pembuka).

            Kekhawatiran yang dulu membuat ambangnya diturunkan ke 640px tetap
            dijawab, cuma dengan cara lain: supaya foto tidak jadi benda terbesar
            di halaman saat bertumpuk, yang dibesarkan adalah NAMANYA — lewat
            tingkatan tablet di index.css. Di 768px nama jadi 84px dan
            membentang +-553px, sementara foto cuma +-327px. Pembaca tetap
            disambut nama.
        */}
        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 min-[640px]:gap-6 wide:grid-cols-[1.35fr_0.65fr] wide:grid-rows-none wide:items-center wide:justify-center roomy:gap-16">
          <div>
            <ScrubReveal
              delay={STAGGER}
              className="mb-4 flex items-center justify-center gap-3 min-[640px]:mb-8 roomy:mb-10 wide:justify-start"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <p className="-caption-small text-text-muted">{site.greeting}</p>
            </ScrubReveal>

            <LineMask
              as="h1"
              className="-display mb-4 min-[640px]:mb-8 roomy:mb-10"
              lines={[site.firstName, site.lastName]}
              lineClassName="last:text-text-muted"
              delay={STAGGER * 2}
              stagger={0.09}
            />
          </div>

          {/*
              FOTO MENYERAP SISA TINGGI — dan sejak baris tengah kisi diberi
              `minmax(0,1fr)`, itu terjadi dengan sendirinya. Tidak ada lagi
              rumus di sini.

              Yang berdiri di tempat ini dulu adalah
              `clamp(6rem, calc((100svh - 490px) * 0,8), 20rem)`, dengan 490
              sebagai hasil pengukuran: 398px tinggi seluruh bagian tetap, 22px
              bingkai foto, 70px zona aman bagi bilah status. Rumus itu benar,
              dan tetap saja rapuh — ia menyimpan salinan tinggi bagian lain di
              tempat yang tidak ikut berubah saat bagian itu berubah, sampai
              komentarnya sendiri harus memperingatkan bahwa angkanya "HARUS
              diukur ulang". Di tablet ia bahkan tidak pernah sempat bekerja:
              lebar kolom 0,65fr membatasi lebih dulu di 224px.

              TINGGI YANG MENENTUKAN LEBAR, bukan sebaliknya. Tinggi bingkainya
              diambil dari sisa baris — dibatasi, lihat catatan di elemennya —
              dan gambarnya memakai `aspect-[853/1280]` sehingga lebarnya
              dihitung dari tinggi itu. Bingkai yang lebarnya mengikuti isi
              (bukan `w-full`) membuat garis tepinya memeluk fotonya di lebar
              berapa pun.

              RASIONYA DIAMBIL DARI BERKASNYA SENDIRI — foto.jpeg 853x1280 —
              bukan dibulatkan ke 4/5 atau 3/4 seperti sebelumnya. Pembulatan
              itu tidak gratis: `object-contain` menyisakan pita kosong di kiri
              dan kanan foto sebesar selisihnya, dan pita kosong di dalam
              bingkai adalah bentuk kecil dari persoalan yang sedang dibereskan
              di sini.

              Di layar mendatar semuanya kembali persis seperti semula — lebar
              yang dipatok `min(26rem, 48svh)`, tinggi yang mengikuti, rasio
              4/5 — karena di sana foto berdiri di kolomnya sendiri dan tidak
              lagi bertugas jadi penyeimbang tinggi.
          */}
          <div className="relative mx-auto min-h-0 w-full wide:col-start-2 wide:row-start-1 wide:row-span-2 wide:max-w-[min(26rem,48svh)]">
            {/*
                FOTO DIANGKAT KELUAR DARI ALIRAN — `absolute inset-0` — dan
                tanpa ini seluruh mekanismenya justru meledak. Terukur di
                768x1024: fotonya membengkak selebar layar dan mendorong
                keterangan serta tombol keluar dari pandangan sama sekali.

                Sebabnya melingkar. Tinggi baris `1fr` adalah sisa, yaitu tinggi
                kisi dikurangi baris-baris `auto` — jadi tinggi kisi harus
                diketahui lebih dulu. Tapi tinggi kisi berasal dari `flex-1` di
                atas `min-h-svh`, yang artinya "setinggi isinya, minimal satu
                layar" — sehingga ia sendiri menunggu isinya diukur. Foto yang
                ikut dalam aliran ada di kedua sisi lingkaran itu sekaligus:
                `h-full`-nya menunggu tinggi baris, sementara rasio bakunya
                menyumbang tinggi ke baris yang sama. Browser memutus
                lingkarannya dengan mengabaikan `h-full` dan memakai lebar yang
                tersedia — 720px, yang pada rasio 2:3 berarti tinggi 1080px.

                Yang absolut tidak menyumbang apa pun ke tinggi induknya. Baris
                `1fr` jadi murni sisa, tingginya pasti, dan barulah `h-full` di
                dalam sini punya sesuatu untuk dijadikan patokan. Arah
                perhitungannya searah: tinggi baris menentukan foto, tidak
                sebaliknya.

                Di layar mendatar ia kembali `static`: di sana foto memang harus
                ikut menentukan tinggi barisnya sendiri.
            */}
            <div className="absolute inset-0 flex items-center justify-center wide:static wide:block">
              {/* `corner-marks` pindah ke bingkainya, dari pembungkus di luar.
                  Pembungkus itu kini selebar barisnya sementara bingkai memeluk
                  foto, jadi tanda sudut yang tetap tinggal di luar akan
                  melayang sendirian di tepi layar, jauh dari kotak yang
                  mestinya ditandainya. Di layar mendatar keduanya sama lebar,
                  jadi letaknya tidak berubah sedikit pun di sana. */}
              {/*
                  TIGA BATAS, DAN YANG PALING SEMPIT YANG BERLAKU. Ini yang
                  memisahkan "memenuhi layar" dari "menguasai layar".

                  Menyerahkan SELURUH sisa tinggi ke foto memang membuat halaman
                  penuh, tapi harganya terlalu mahal: di 390x844 fotonya jadi
                  257px pada layar selebar 390px — 66% lebar layar — dan pembaca
                  disambut pasfoto, bukan nama. Bandingkan dengan desktop, yang
                  sudah benar: di sana fotonya cuma 22% lebar layar. Bukan
                  ukurannya yang membuat sesuatu jadi tokoh utama, melainkan
                  porsinya terhadap layar.

                    100%    sisa tinggi baris — batas yang menjaganya tidak
                            pernah mendorong tombol keluar dari layar.
                    32svh   porsi tegaknya. Foto yang lebih tinggi dari
                            sepertiga layar berhenti jadi pendamping.
                    60vw    porsi mendatarnya, lewat tinggi (60vw tinggi berarti
                            40vw lebar). Diperlukan tersendiri karena layar
                            jangkung dan sempit — 360x1000 — melewati batas
                            lebar jauh sebelum menyentuh batas tinggi.

                  Hasilnya lebar fotonya duduk di 28-40% lebar layar di seluruh
                  rentang bertumpuk, dari 320px sampai 1024px.

                  SISANYA TIDAK HILANG, ia jadi udara di atas dan bawah foto —
                  baris `1fr` tetap selebar sisanya, cuma isinya sekarang
                  dipusatkan di dalamnya. Halaman tetap terisi dari tepi atas
                  sampai tepi bawah; yang berubah cuma siapa yang mengisi.
              */}
              <div className="corner-marks relative h-[min(100%,32svh,60vw)] max-w-full border border-line p-2.5 wide:h-auto wide:w-full">
                {/* `max-w-full` sebagai pengaman terakhir, bukan ukuran biasa —
                    batas `60vw` di atas sudah menjaga lebarnya lebih dulu. */}
                <RevealImage
                  src={foto}
                  alt={`Foto ${site.name}`}
                  delay={STAGGER * 3}
                  className="aspect-[853/1280] h-full w-auto max-w-full wide:aspect-[4/5] wide:h-auto wide:w-full"
                  imgClassName="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Dulu ada DUA `border-t pt-7` bersarang di sini — pembungkus dan
              anaknya sama-sama menggambar garis. Di ponsel keduanya tampil
              sebagai dua garis sejajar berjarak 28px, dan keduanya memakan
              tinggi. Yang tersisa sekarang satu, di pembungkusnya saja. */}
          <div className="flex flex-col gap-4 border-t border-line pt-5 min-[640px]:gap-6 wide:row-start-2 wide:border-t-0 wide:pt-0">
            <div className="flex flex-col gap-2 min-[640px]:gap-3">
              <p className="-body text-text-muted">
                {site.roleLead}{" "}
                <span className="font-medium text-text">{profesi}</span>
                <span className="animate-kedip text-accent">_</span>
              </p>
              <p className="-caption-small text-text-muted">{site.location}</p>
            </div>

            {/* Tetap bertumpuk di ponsel. Label "HUBUNGI SAYA" selebar +-172px
                termasuk padding-nya, jadi dua tombol berdampingan menuntut
                +-344px sementara layar 320px hanya menyisakan 288px setelah
                padding Container — barisnya akan pecah sendiri, dan yang pecah
                terbaca sebagai tata letak yang meleset. */}
            <div className="mt-3 flex flex-col gap-3 min-[640px]:mt-6 min-[640px]:flex-row min-[640px]:flex-wrap min-[640px]:justify-center min-[640px]:gap-4 roomy:mt-10 wide:justify-start">
              <Button
                href="#kontak"
                variant="primary"
                className="w-full min-[640px]:w-auto"
              >
                Hubungi Saya
              </Button>
              <Button
                href="#tentang"
                variant="outline"
                className="w-full min-[640px]:w-auto"
              >
                Lihat Profil
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
