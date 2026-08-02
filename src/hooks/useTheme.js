import { useCallback, useState } from "react";

/* Kunci penyimpanan dinaikkan lagi versinya. Situs ini sudah dua kali berganti
   default — mula-mula gelap, lalu terang, kini gelap lagi — dan tiap kali,
   nilai yang tersimpan di browser lama akan menimpa default yang baru. Dengan
   kunci baru, preferensi lama diabaikan sekali, lalu tersimpan seperti biasa. */
export const THEME_KEY = "theme-v3";

/* Gelap adalah default, jadi kelas yang ditempel di <html> justru penanda
   TERANG. Menempelkan kelas untuk keadaan default berarti halaman sempat
   tampil salah warna sebelum React sempat jalan. */
export const LIGHT_CLASS = "light-mode";

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains(LIGHT_CLASS) ? "light" : "dark",
  );

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle(LIGHT_CLASS, next === "light");
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
