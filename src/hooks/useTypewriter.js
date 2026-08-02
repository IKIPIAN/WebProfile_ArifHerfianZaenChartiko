import { useEffect, useState } from "react";

export function useTypewriter(words) {
  const [teks, setTeks] = useState("");

  useEffect(() => {
    let indexProfesi = 0;
    let indexHuruf = 0;
    let sedangHapus = false;
    let timeoutId;

    function efekKetik() {
      const kata = words[indexProfesi];
      let jeda = sedangHapus ? 50 : 100;

      indexHuruf += sedangHapus ? -1 : 1;
      setTeks(kata.substring(0, indexHuruf));

      if (!sedangHapus && indexHuruf === kata.length) {
        sedangHapus = true;
        jeda = 1500;
      } else if (sedangHapus && indexHuruf === 0) {
        sedangHapus = false;
        indexProfesi = (indexProfesi + 1) % words.length;
        jeda = 300;
      }

      timeoutId = setTimeout(efekKetik, jeda);
    }

    efekKetik();

    return () => clearTimeout(timeoutId);
  }, [words]);

  return teks;
}
