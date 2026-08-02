import { useScroller } from "../core/scroller-context";

const VARIANTS = {
  primary: "bg-text text-background border-text",
  outline: "border-line text-text hover:border-text/60",
  accent: "bg-accent text-[var(--on-accent)] border-accent",
};

const BASE =
  "group relative inline-flex cursor-pointer items-center justify-center rounded-full border px-8 py-3.5 transition-colors duration-300 ease-power";

/*
 * Label bertumpuk dua: yang terlihat naik keluar, salinannya menyusul dari
 * bawah. Geraknya pendek dan cepat — tombol bukan tempat pertunjukan.
 *
 * Salinannya diletakkan tepat DI BAWAH yang asli lewat `top-full`, bukan
 * ditumpuk lalu digeser. Menumpuknya dengan inset-0 membuat tingginya
 * bergantung pada kotak induk, dan begitu tinggi itu meleset sedikit saja,
 * salinannya mengintip di bawah label yang terlihat.
 */
function SwapLabel({ children }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="-caption-small flex items-center justify-center gap-2 transition-transform duration-500 ease-brand group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="-caption-small absolute inset-x-0 top-full flex items-center justify-center gap-2 transition-transform duration-500 ease-brand group-hover:-translate-y-full"
      >
        {children}
      </span>
    </span>
  );
}

export function Button({
  href,
  onClick,
  type = "button",
  variant = "primary",
  full = false,
  className = "",
  children,
}) {
  const { scrollTo } = useScroller();
  const classes = `${BASE} ${VARIANTS[variant]} ${full ? "w-full" : ""} ${className}`;

  if (href?.startsWith("#")) {
    const handleClick = (event) => {
      const target = document.querySelector(href);
      if (!target) return;
      /* Lenis yang memegang scroll, jadi lompatan anchor bawaan browser harus
         dicegah — kalau tidak, halaman menyentak lalu Lenis menariknya balik. */
      event.preventDefault();
      scrollTo(target);
      onClick?.(event);
    };

    return (
      <a href={href} onClick={handleClick} data-component="button" className={classes}>
        <SwapLabel>{children}</SwapLabel>
      </a>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        data-component="button"
        className={classes}
      >
        <SwapLabel>{children}</SwapLabel>
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} data-component="button" className={classes}>
      <SwapLabel>{children}</SwapLabel>
    </button>
  );
}
