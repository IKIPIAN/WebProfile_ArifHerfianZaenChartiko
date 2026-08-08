export default function Antarmuka() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════════
           BILAH STATUS — pengganti navbar. Fungsinya sama, memberi tahu posisi, tapi
           tanpa meminta perhatian dan tanpa deretan tautan yang harus dihindari mata.
           Hanya kata terakhirnya yang berganti mengikuti bagian yang sedang dibaca.
           ═══════════════════════════════════════════════════════════════════════ */}
      <div className="status-bar pointer-events-none fixed inset-x-0 bottom-5 z-40 px-6 nav:px-10">
        <div className="flex items-end justify-between gap-6">
          <button type="button" data-status-jump className="pointer-events-auto group flex items-baseline gap-2 text-left">
            <span className="-caption-small text-text-muted transition-colors duration-500 ease-brand" data-status-count>01/06</span>
            <span className="relative block h-[1.15em] overflow-hidden">
              <span className="-caption block whitespace-nowrap will-change-transform" data-status-label>Tentang</span>
            </span>
          </button>

          <div className="hidden nav:flex items-center gap-3" data-status-dots></div>
        </div>
      </div>

      <button type="button" data-component="back-to-top" title="Kembali ke atas"
        className="fixed right-6 bottom-6 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-background/70 text-text-muted backdrop-blur-md transition-colors duration-300 ease-power nav:bottom-24 hover:border-text/50 hover:text-text">
        <i className="fa-solid fa-arrow-up text-sm"></i>
      </button>
    </>
  );
}
