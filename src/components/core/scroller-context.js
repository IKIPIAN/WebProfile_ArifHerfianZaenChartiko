import { createContext, useContext } from "react";

export const ScrollerContext = createContext(null);

/* Fallback dipakai saat Lenis belum sempat dibuat atau sengaja dimatikan
   (prefers-reduced-motion). Konsumen tidak perlu tahu bedanya. */
const nativeScroller = {
  lenis: null,
  scrollTo(target, { immediate = false } = {}) {
    const top = typeof target === "number" ? target : 0;
    window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  },
  stop() {},
  start() {},
};

export function useScroller() {
  return useContext(ScrollerContext) ?? nativeScroller;
}
