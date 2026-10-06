// Datos guardados en el dispositivo: perfil, preferencias y preguntas ya vistas
import type { PlayerLevel } from '../engine/types';

export interface Profile {
  name: string;
  avatar: string;
  level: PlayerLevel;
}

export const AVATARS = ['🦊', '🐼', '🐸', '🐙', '🦄', '🐯', '🐨', '🐵', '🐧', '🦖', '🐢', '🦉', '🐝', '🐳', '🦁', '🐷', '🐰', '🦕', '🐞', '🦩', '🦔'];

export const LEVELS: { value: PlayerLevel; label: string; hint: string }[] = [
  { value: 1, label: 'Peques', hint: '6 a 8 años · eliges la mentira, sin escribir' },
  { value: 2, label: 'Junior', hint: '9 a 12 años' },
  { value: 3, label: 'Teen', hint: '13 a 16 años' },
  { value: 4, label: 'Adulto', hint: '17 o más' },
];

function read<T>(k: string, def: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* sin almacenamiento disponible */
  }
}

export const getProfile = () => read<Profile | null>('fakeado.profile', null);
export const saveProfile = (p: Profile) => write('fakeado.profile', p);

export interface Prefs {
  sound: boolean;
  music?: boolean;
}
export const getPrefs = () => ({ music: true, ...read<Prefs>('fakeado.prefs', { sound: true, music: true }) });
export const savePrefs = (p: Prefs) => write('fakeado.prefs', p);

export function getSeen(): Set<string> {
  return new Set(read<string[]>('fakeado.seen', []));
}
export function addSeen(ids: string[]) {
  const all = [...read<string[]>('fakeado.seen', []), ...ids];
  write('fakeado.seen', all.slice(-400));
}

/** Última sala a la que se unió este dispositivo (para volver tras cerrar la app) */
export const getLastRoom = () => read<{ code: string; at: number } | null>('fakeado.lastRoom', null);
export const setLastRoom = (code: string | null) => write('fakeado.lastRoom', code ? { code, at: Date.now() } : null);
