// web/src/lib/clone.ts
/**
 * JSON tabanlı derin kopya (mock/plain veri için). Date/Map/fonksiyon KORUNMAZ;
 * yalnızca JSON-serileştirilebilir değerler kopyalanır. Store seed'lerini modül
 * sabitinden izole etmek için kullanılır (in-place mutasyon seed'i bozmasın).
 */
export const jsonClone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
