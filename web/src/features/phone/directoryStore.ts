import { createStore, useStore } from "@/lib/createStore";

const STORAGE_KEY = "tl.phone.directory.favorites.v1";

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function persist(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* SSR/test ortamı — yoksay */
  }
}

export interface DirectoryState {
  /** Favori kişi id'leri (ekleme sırasını korur). */
  favorites: string[];
  /** Bir kişinin favori olup olmadığını döner. */
  isFavorite: (contactId: string) => boolean;
  /** Favori durumunu çevirir (ekle/çıkar). */
  toggleFavorite: (contactId: string) => void;
  resetStore: () => void;
}

/**
 * Rehber yardımcı store'u: kişi favorileri. Canlı çağrı/CRUD gerçek API'de;
 * favoriler yalnızca yerel bir görünüm tercihi olduğundan hafif store + localStorage.
 */
export const directoryStore = createStore<DirectoryState>((set, get) => ({
  favorites: load(),

  isFavorite: (contactId) => get().favorites.includes(contactId),

  toggleFavorite: (contactId) =>
    set((s) => {
      const next = s.favorites.includes(contactId)
        ? s.favorites.filter((id) => id !== contactId)
        : [...s.favorites, contactId];
      persist(next);
      return { favorites: next };
    }),

  resetStore: () => {
    persist([]);
    return set({ favorites: [] });
  },
}));

export const useDirectory = <U,>(selector: (s: DirectoryState) => U): U =>
  useStore(directoryStore, selector);
