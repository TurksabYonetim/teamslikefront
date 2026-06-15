// web/src/lib/useOnce.ts
import { useCallback, useState } from "react";

/**
 * Bir kez gösterilen akışlar (onboarding) için localStorage tabanlı bayrak.
 * `[hasSeen, markSeen]` döndürür. Erişim güvenli (private mode / SSR).
 */
export function useOnce(key: string): [boolean, () => void] {
  const storageKey = `tl_onboarded_${key}`;
  const read = () => {
    try {
      return typeof localStorage !== "undefined" && localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  };
  const [seen, setSeen] = useState<boolean>(read);
  const markSeen = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setSeen(true);
  }, [storageKey]);
  return [seen, markSeen];
}
