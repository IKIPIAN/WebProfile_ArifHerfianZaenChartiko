import { technicalSkills, professionalSkills, languages } from "../data/skills";
import { tools } from "../data/tools";
import { getChapter, chapterNumber } from "../data/nav";
import { SkillStage } from "../components/core/SkillStage";
import { ScrubReveal } from "../components/core/ScrubReveal";
import { Container } from "../components/ui/Container";
import { ToolMark } from "../components/ui/ToolMark";

/*
 * Dua kelompok keahlian, dua perlakuan yang sangat berbeda — dan bedanya
 * bukan sekadar variasi.
 *
 * Kemampuan teknis adalah pusat halaman ini, jadi ia dapat panggung sendiri
 * selebar layar: kata-kata raksasa yang pecah, lalu kartu yang menyusun
 * kembali maknanya. Kemampuan profesional tidak menuntut perhatian sebesar
 * itu — semuanya berlaku sekaligus dan tidak berurutan — jadi ia cukup jadi
 * kisi yang seluruh selnya setara.
 *
 * Bagian ini tidak memakai <Chapter> karena panggungnya harus selebar layar
 * penuh, sementara Chapter menahan isinya di dalam kolom terbaca.
 */
export function SkillsSection() {
  const chapter = getChapter("keahlian");
  const number = chapterNumber("keahlian");

  return (
    <section
      id="keahlian"
      data-component="chapter"
      className="relative scroll-mt-24"
    >
      <SkillStage
        items={technicalSkills}
        label={`${String(number).padStart(2, "0")} — ${chapter.label}`}
        title={`${chapter.title} ${chapter.accent}`}
        tagline="Empat bidang. Satu cara kerja."
      />

      <Container className="flex flex-col gap-16 py-24 sm:gap-20 sm:py-28 nav:gap-24 nav:py-36">
        <div>
          <ScrubReveal as="h3" className="-caption-small mb-8 text-text-muted">
            Kemampuan Profesional
          </ScrubReveal>

          {/* Flex-wrap, bukan kisi berkolom tetap.
              Jumlah keahlian profesional ganjil (lima), dan kisi tiga kolom
              akan menyisakan satu sel kosong berbingkai di baris terakhir —
              terbaca sebagai isi yang gagal dimuat, bukan sebagai keputusan.
              Dengan flex-1, sisa baris terakhir dibagi rata oleh isinya
              sendiri, berapa pun jumlahnya. */}
          <div className="flex flex-wrap border-t border-l border-line">
            {professionalSkills.map((skill, i) => (
              <ScrubReveal
                key={skill.label}
                delay={i * 0.04}
                className="group flex min-h-36 flex-1 flex-col justify-between border-r border-b border-line p-4 transition-colors duration-500 ease-brand hover:bg-text/4 sm:min-w-52 sm:p-5"
              >
                <i className={`${skill.icon} text-text-muted`} />
                {/* Naik sedikit saat disentuh, jadi sel yang aktif terangkat
                    dari kisinya alih-alih hanya berubah warna. Label dan
                    keterangannya bergerak sebagai satu blok — kalau hanya
                    labelnya yang naik, keduanya terbaca sebagai dua benda
                    terpisah yang kebetulan berdekatan. */}
                {/*
                    TINGGI JUDUL DAN KETERANGAN DIJATAH TETAP.
                    Blok ini ditambatkan ke BAWAH oleh `justify-between`, jadi
                    selama tingginya ikut panjang teks, puncaknya jatuh di
                    tempat berbeda-beda di tiap kartu — "Analisis & Pemecahan
                    Masalah" yang dua baris mendorong judulnya naik sendirian,
                    dan deretan itu terbaca acak.
                    Angkanya diturunkan dari tinggi baris yang sebenarnya:
                    judul `-body-small` 15px x 1,6 = 24px, dijatah 2 baris = 48px
                    (min-h-12); keterangan `-body-smaller` 14px x 1,55 = 21,7px,
                    dijatah 3 baris = 65px (min-h-17).
                */}
                <div className="transition-transform duration-500 ease-brand group-hover:-translate-y-0.5">
                  <span className="-body-small block min-h-12 font-medium">
                    {skill.label}
                  </span>
                  <p className="-body-smaller mt-2 min-h-17 text-text-muted">
                    {skill.note}
                  </p>
                </div>
              </ScrubReveal>
            ))}
          </div>
        </div>

        {/*
            PERKAKAS DILETAKKAN DI SINI, bukan di panggung keahlian di atas.

            Bukan cuma soal tempo. Panggung itu di-pin setinggi satu layar dan
            `overflow: hidden`, dan `fitOrbit()` sudah terpaksa menyusutkan gugus
            kartunya sampai batas bawah 0,7 di ponsel pendek. Menempelkan baris
            perkakas ke keempat kartu langsung memakan sisa ruang itu dan
            mendorong skalanya menembus lantai — kartunya berhenti terbaca.
            Wilayah Container ini tidak punya kendala tinggi sama sekali.

            MELEBAR, BUKAN MEMANJANG KE BAWAH. Versi sebelumnya lima baris
            berlabel kelompok, dan lima baris mustahil dipadatkan jadi satu
            bidang yang terbaca sekali pandang. Kisi tanpa label memuat keempat
            belasnya dalam dua baris di layar lebar — yang menggantikan label
            adalah urutannya, yang tetap mengalir per bidang (lihat tools.js).
        */}
        <div>
          <ScrubReveal as="h3" className="-caption-small mb-8 text-text-muted">
            Perkakas
          </ScrubReveal>

          {/*
              FLEX-WRAP, BUKAN KISI — dan alasannya cuma satu: BARIS TERAKHIR
              HARUS MENENGAHKAN DIRINYA SENDIRI.

              Kisi menempatkan sisa baris terakhir rata kiri dan menyisakan
              lubang di kanan. Jumlah perkakas (14) hanya habis dibagi 1, 2, 7,
              dan 14, jadi sisa itu tidak bisa dihindari dengan memilih jumlah
              kolom yang lain: di tablet 5 kolom sisanya 4, di ponsel 3 kolom
              sisanya 2. Dengan `flex-wrap` dan `justify-center`, baris terakhir
              menengahkan dirinya berapa pun isinya — teknik yang sama persis
              dengan kartu pengalaman, dan ia ikut menjaga susunan ini tetap
              benar kalau nanti ada perkakas ditambah atau dikurangi.

              LEBAR ITEMNYA yang menentukan jumlah kolom: 1/3, 1/5, lalu 1/7.
              Ditulis sebagai pecahan `calc`, bukan lebar tetap, supaya baris
              yang penuh mengisi lebar wadah tepat sampai tepi — sama seperti
              kisi — sementara baris yang tidak penuh tetap bebas terpusat.

              Jaraknya dipasang sebagai padding DI DALAM item, bukan `gap-x` di
              wadah. Gap ikut dihitung saat flex membagi ruang, jadi tujuh item
              selebar 1/7 ditambah enam gap akan melebihi 100% dan item ketujuh
              terlempar ke baris berikutnya.

              Jumlah kolomnya memakai `min-[...]`, BUKAN `sm:` dan `nav:`. Di
              build ini `nav:` diemit lebih dulu daripada `sm:`, jadi pada layar
              ≥900px `sm:` justru menang karena berada lebih akhir di berkas —
              `sm:w-1/5 nav:w-1/7` menghasilkan lima kolom di desktop, bukan
              tujuh. Varian `min-[...]` diurutkan menurut nilainya sendiri.

              Tanpa bingkai per sel: empat belas kotak bergaris mengelilingi
              empat belas lambang menghasilkan lebih banyak garis daripada isi,
              sedangkan bagian ini dimaksudkan sebagai lapisan pendukung yang
              tenang. Bingkai juga akan mengembalikan lubang yang baru saja
              dihilangkan — kotak kosong terlihat, ruang kosong tidak.
          */}
          <div className="flex flex-wrap justify-center gap-y-10 border-t border-line pt-10">
            {tools.map((tool, i) => (
              <ScrubReveal
                key={tool.name}
                delay={i * 0.03}
                className="group flex w-[calc(100%/3)] flex-col items-center justify-start gap-3 px-2 text-center nav:gap-4 min-[640px]:w-[calc(100%/5)] min-[900px]:w-[calc(100%/7)]"
              >
                {/* Lambang satu warna dipasang pada `text-text`, BUKAN
                    `text-text-muted`. Sejak logo berwarna masuk ke deret yang
                    sama, lambang yang diredupkan berdiri di sebelah logo yang
                    penuh warna dan langsung terbaca sebagai yang lebih lemah —
                    seolah tiga di antaranya gagal dimuat sebagian. Yang
                    meredup-menyala saat disentuh tinggal namanya, dan itu cukup
                    untuk menandai bahwa selnya hidup. */}
                <span className="flex w-full justify-center text-text">
                  <ToolMark
                    src={tool.src}
                    brand={tool.brand}
                    monogram={tool.monogram}
                    name={tool.name}
                    scale={tool.scale}
                    tint={tool.tint}
                  />
                </span>

                {/* `-caption-small` sudah huruf besar berspasi — nama sepanjang
                    "Cisco Packet Tracer" akan pecah jadi tiga baris dan menarik
                    tinggi seluruh baris kisi ikut naik. Ukuran badan kecil
                    membuat semua nama muat dalam dua baris. */}
                <span className="-body-smaller leading-tight text-text-muted transition-colors duration-500 ease-brand group-hover:text-text">
                  {tool.name}
                </span>
              </ScrubReveal>
            ))}
          </div>
        </div>

        <div>
          <ScrubReveal as="h3" className="-caption-small mb-8 text-text-muted">
            Bahasa
          </ScrubReveal>
          <div className="border-t border-line">
            {languages.map((lang) => (
              <ScrubReveal
                key={lang.code}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-line py-5 sm:gap-x-5 sm:py-6"
              >
                <span className="-mono text-text-muted">{lang.code}</span>
                <span className="h-px w-8 self-center bg-line" />
                <h4 className="-title-4">{lang.name}</h4>
                {lang.note && (
                  <span className="-body-smaller w-full text-text-muted nav:ml-auto nav:w-auto">
                    {lang.note}
                  </span>
                )}
              </ScrubReveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
