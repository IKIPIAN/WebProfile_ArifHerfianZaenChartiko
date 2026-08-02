import { useEffect, useState } from "react";

export function useScrolled(threshold) {
  const [scrolled, setScrolled] = useState(() => window.scrollY > threshold);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > threshold);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
