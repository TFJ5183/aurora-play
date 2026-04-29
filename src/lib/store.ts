import { atom } from 'nanostores';

export const $authed = atom<boolean>(false);
export const $ready = atom<boolean>(false);
export const $cover = atom<string | undefined>(undefined);
export const $isPlaying = atom<boolean>(false);
