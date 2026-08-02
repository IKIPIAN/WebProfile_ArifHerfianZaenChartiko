import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "../../hooks/useTheme";

/* Berdiri sendiri di sudut layar, jadi ia butuh latar dan garis tepinya
   sendiri supaya tetap terbaca di atas pita mana pun — termasuk di atas
   panel terang, tempat warna teksnya ikut terbalik. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title="Ganti tema"
      aria-label="Ganti tema"
      data-component="theme-toggle"
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-background/70 text-text-muted backdrop-blur-md transition-colors duration-300 ease-power hover:border-text/50 hover:text-text"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.i
          key={theme}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className={`text-xs ${theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon"}`}
        />
      </AnimatePresence>
    </button>
  );
}
