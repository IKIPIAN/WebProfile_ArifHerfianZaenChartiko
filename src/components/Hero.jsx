export default function Hero() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           BERANDA — pembuka, bukan salah satu bab, jadi tidak diberi nomor urut.

           Susunannya dipilih dari BENTUK layar, bukan lebarnya: kelas `wide:` hanya
           berlaku di layar mendatar (lihat @custom-variant di css/style.css), jadi
           tablet potret selebar apa pun tetap bertumpuk. Baris tengah kisi yang
           `minmax(0,1fr)` itulah yang membuat halaman selalu terisi penuh — foto
           menerima sisa tingginya, dibatasi `min(100%, 32svh, 60vw)` supaya ia tetap
           pendamping dan bukan tokoh utama.
           ═══════════════════════════════════════════════════════════════════════ */}
      <section id="home" data-component="chapter"
        className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-[8svh] pb-20 min-[640px]:pt-[9svh] min-[640px]:pb-24 roomy:pt-16 roomy:pb-28">

        <canvas data-component="ambient-lines" data-density="52" aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"></canvas>

        <div data-component="container"
          className="mx-auto w-full px-4 sm:px-6 nav:px-10 max-w-[1500px] relative z-2 flex w-full flex-1 flex-col text-center wide:block wide:flex-none wide:text-left">

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-4 min-[640px]:gap-6 wide:grid-cols-[1.35fr_0.65fr] wide:grid-rows-none wide:items-center wide:justify-center roomy:gap-16">

            {/* BARIS 1 — sapaan dan nama */}
            <div>
              <div data-component="scrub-reveal" data-delay="0.07"
                className="mb-4 flex items-center justify-center gap-3 min-[640px]:mb-8 roomy:mb-10 wide:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
                <p className="-caption-small text-text-muted">Halo, perkenalkan saya</p>
              </div>

              <h1 className="-display mb-4 min-[640px]:mb-8 roomy:mb-10" data-line-mask data-delay="0.14" data-stagger="0.09">
                <span data-anim="line-mask" className="last:text-text-muted"><span>Arif Herfian</span></span>
                <span data-anim="line-mask" className="last:text-text-muted"><span>Zaen Chartiko</span></span>
              </h1>
            </div>

            {/* BARIS 2 — foto, menyerap sisa tinggi.
                 Diangkat keluar dari aliran (`absolute inset-0`) supaya ia tidak ikut
                 menentukan tinggi baris yang justru jadi patokannya sendiri. */}
            <div className="relative mx-auto min-h-0 w-full wide:col-start-2 wide:row-start-1 wide:row-span-2 wide:max-w-[min(26rem,48svh)]">
              <div className="absolute inset-0 flex items-center justify-center wide:static wide:block">
                <div className="corner-marks relative h-[min(100%,32svh,60vw)] max-w-full border border-line p-3 wide:h-auto wide:w-full">
                  <div data-component="image-reveal" data-delay="0.21"
                    className="aspect-[853/1280] h-full w-auto max-w-full wide:h-auto wide:w-full">
                    <span className="bg" aria-hidden="true"></span>
                    {/* `object-fit` ditulis SEBARIS, bukan sebagai kelas: `.media` di
                         style.css sudah menyetel `cover` dan ia CSS tak-berlapis, jadi
                         ia mengalahkan kelas utilitas apa pun. Yang sebaris menang
                         atas keduanya.

                         `contain` berarti foto DIPASKAN utuh ke dalam bingkai. Karena
                         rasio bingkainya sekarang persis rasio berkasnya (853/1280)
                         di SEMUA lebar, `contain` dan `cover` menghasilkan hal yang
                         sama — tidak ada pita kosong dan tidak ada yang terpotong.
                         `contain` yang dipilih karena ia yang aman kalau suatu saat
                         fotonya diganti dengan rasio lain: yang muncul foto utuh
                         dengan sedikit pita, bukan wajah yang terpotong diam-diam.

                         Sampai 7 Agustus 2026 baris ini memakai `wide:aspect-[4/5]`
                         khusus desktop. Itu yang membuat bingkainya lebih gemuk dari
                         fotonya dan menyisakan 34,6px pita gelap di kiri dan kanan
                         SAJA — atas-bawah tetap menempel. Jadi di desktop bingkainya
                         terlihat renggang sebelah, di ponsel dan tablet menempel
                         rapat. Jangan dipatok ulang ke rasio yang berbeda dari
                         berkasnya. */}
                    <img src="assets/photo/foto.jpeg" alt="Foto Arif Herfian Zaen Chartiko" className="media" style={{ objectFit: "contain" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* BARIS 3 — peran, lokasi, tombol */}
            <div className="flex flex-col gap-4 border-t border-line pt-5 min-[640px]:gap-6 wide:row-start-2 wide:border-t-0 wide:pt-0">
              <div className="flex flex-col gap-2 min-[640px]:gap-3">
                <p className="-body text-text-muted">
                  Saya seorang
                  <span className="font-medium text-text" data-typewriter='["Web Developer","Pendidik Informatika","Staf Administrasi"]'></span><span className="animate-kedip text-accent">_</span>
                </p>
                <p className="-caption-small text-text-muted">Kab. Blitar, Jawa Timur</p>
              </div>

              <div className="mt-3 flex flex-col gap-3 min-[640px]:mt-6 min-[640px]:flex-row min-[640px]:flex-wrap min-[640px]:justify-center min-[640px]:gap-4 roomy:mt-10 wide:justify-start">
                <a href="#kontak" data-component="button"
                  className="group relative inline-flex cursor-pointer items-center justify-center rounded-full border px-8 py-4 transition-colors duration-300 ease-power bg-text text-background border-text w-full min-[640px]:w-auto">
                  <span className="relative block overflow-hidden">
                    <span className="-caption-small flex items-center justify-center gap-2 transition-transform duration-500 ease-brand group-hover:-translate-y-full">Hubungi Saya</span>
                    <span aria-hidden="true" className="-caption-small absolute inset-x-0 top-full flex items-center justify-center gap-2 transition-transform duration-500 ease-brand group-hover:-translate-y-full">Hubungi Saya</span>
                  </span>
                </a>
                <a href="#tentang" data-component="button"
                  className="group relative inline-flex cursor-pointer items-center justify-center rounded-full border px-8 py-4 transition-colors duration-300 ease-power border-line text-text hover:border-text/60 w-full min-[640px]:w-auto">
                  <span className="relative block overflow-hidden">
                    <span className="-caption-small flex items-center justify-center gap-2 transition-transform duration-500 ease-brand group-hover:-translate-y-full">Lihat Profil</span>
                    <span aria-hidden="true" className="-caption-small absolute inset-x-0 top-full flex items-center justify-center gap-2 transition-transform duration-500 ease-brand group-hover:-translate-y-full">Lihat Profil</span>
                  </span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
