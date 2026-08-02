import { createContext, useContext } from "react";

/* Halaman sudah dirender di balik preloader supaya asetnya bisa dihitung, tapi
   reveal-nya belum boleh jalan — kalau tidak, animasi hero sudah selesai duluan
   di balik layar preloader dan pengunjung tidak pernah melihatnya. */
export const ReadyContext = createContext(true);

export function useAppReady() {
  return useContext(ReadyContext);
}
