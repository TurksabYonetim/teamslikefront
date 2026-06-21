// Tek kaynak — tüm form kontrollerinin (Input, Select, Button "md") responsive
// yüksekliği. Breakpoint başına farklı: mobil 36 → tablet 40 → laptop 44 → monitor 48.
//
// ÖNEMLİ: `.input` (src/styles/index.css) bunun min-height aynasıdır
// (min-h-9 md:min-h-10 lg:min-h-11 2xl:min-h-12). Birini değiştirirsen diğerini
// de güncelle ki ham <input className="input"> ile bileşenler aynı boyda kalsın.
export const CONTROL_HEIGHT = "h-9 md:h-10 lg:h-11 2xl:h-12";

// İnce kontrollerde (input/select/button) breakpoint'e göre yatay padding.
export const CONTROL_PAD_X = "px-3 lg:px-3.5";
