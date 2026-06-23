// web/src/lib/uid.ts
/**
 * Çakışmasız kimlik üretici. `crypto.randomUUID` varsa onu, yoksa base36
 * rastgele dizgeyi kullanır (SSR/eski ortam güvenli). Mock store'lar ve
 * geçici istemci-tarafı varlık kimlikleri için tek kaynak.
 */
export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
