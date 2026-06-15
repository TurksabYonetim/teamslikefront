// web/src/features/webinar/useUrlSelection.ts
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

interface UrlSelectionOptions {
  /** Query param adı (örn. "event"). */
  param: string;
  /** O an seçili olan değer (store'dan). */
  selected: string;
  /** URL'deki değerin geçerli olup olmadığı (örn. listede var mı?). */
  isValid: (value: string) => boolean;
  /** URL'den okunan geçerli değeri uygulamaya işler. */
  onSelect: (value: string) => void;
}

/**
 * Derin-bağlanabilir seçim senkronizasyonu (`?param=`). Tek yön + tek yön:
 * 1) Mount'ta URL → store (geçerli ve farklıysa).
 * 2) `selected` değiştikçe store → URL (replace; geçmişi kirletmez).
 *
 * `WebinarPage` içindeki satır-içi `useEffect` mantığını adlandırılmış,
 * test edilebilir bir hook'a çıkarır.
 */
export function useUrlSelection({ param, selected, isValid, onSelect }: UrlSelectionOptions): void {
  const [params, setParams] = useSearchParams();

  // 1) URL → store, yalnızca mount'ta (paylaşılabilir + reload-güvenli).
  useEffect(() => {
    const urlValue = params.get(param);
    if (urlValue && urlValue !== selected && isValid(urlValue)) {
      onSelect(urlValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) store → URL, seçim değiştikçe.
  useEffect(() => {
    if (params.get(param) !== selected) {
      const next = new URLSearchParams(params);
      next.set(param, selected);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);
}
