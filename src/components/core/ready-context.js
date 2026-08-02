import { createContext, useContext } from "react";

/*
 * Dulu ini menahan reveal selama preloader masih menutupi layar: tanpa
 * penahan itu, animasi hero sudah selesai di balik tirai dan pengunjung tidak
 * pernah melihatnya.
 *
 * Preloader sudah dihapus, jadi tidak ada lagi yang memberi nilai selain
 * bawaan `true` di bawah ini — tidak ada Provider di mana pun. Seam-nya
 * sengaja ditinggal utuh: kalau suatu saat ada lagi yang perlu menunda reveal
 * (layar sambutan, penantian aset), cukup pasang Provider di App tanpa
 * menyentuh satu pun komponen yang memanggil `useAppReady`.
 */
export const ReadyContext = createContext(true);

export function useAppReady() {
  return useContext(ReadyContext);
}
