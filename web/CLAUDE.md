# Proje talimatları (TeamsLike web)

## Stil yazımı — Tailwind utility öncelikli

Stil eklerken **önce Tailwind utility class'larını** kullan; varsayılan olarak
`src/styles/index.css`'e özel CSS **yazma**.

- Düzen, boşluk, renk, tipografi, kenar, gölge, durum (`hover:`/`focus-visible:`/
  `disabled:`/`dark:`) ve hareket-güvenli etkileşim (`motion-safe:active:scale-…`) →
  doğrudan JSX `className`'de Tailwind utility'leriyle yaz.
- Gerektiğinde keyfi değer (`[transform:translateY(-1px)]`, `[box-shadow:…]`) ve
  `motion-safe:` / `motion-reduce:` varyantlarını kullan.
- **Animasyon/geçiş/mikro-etkileşim de Tailwind utility ile yazılır** — `index.css`'e
  bileşene özgü animasyon CSS'i **ekleme**. Kullan: `transition` + `duration-*`/`ease-*`
  (veya `[transition:…]`), `hover:`/`active:`/`focus-visible:`/`group-hover:`,
  `before:`/`after:` pseudo varyantları, `animate-*` (arbitrary `animate-[…]` dahil),
  hep `motion-safe:`/`motion-reduce:` ile. Reveal/giriş animasyonları görünür tabanı
  geliştirir (içeriği class'a bağlı görünürlükle gizleme).
- Mevcut tasarım token'larını (`text-ink`, `text-muted`, `bg-surface`, `border-line`,
  `primary-*`/`blue-*`) ve `@layer components` hazır sınıflarını tercih et; yeni hex uydurma.

`src/styles/index.css`'e **yalnızca** utility ile gerçekten ifade edilemeyen durumlarda ekle:

- `:has()` / kardeş / yapısal seçici gerektiren durum stilleri,
- birden çok ekranda paylaşılan `@layer components` bileşen sınıfları.

`@keyframes` zorunlu olduğunda (saf utility yetmiyorsa) onu Tailwind v4 `@theme`
içinde `--animate-…` token'ı olarak tanımla ve `animate-…` utility'siyle kullan;
gevşek `.bileşen-sınıfı { animation: … }` kuralı yazma. Tek seferlik `::before`/`::after`
kurguları için index.css yerine Tailwind `before:`/`after:` varyantlarını tercih et.

Animasyonlar her zaman `@media (prefers-reduced-motion: …)` ile korunur ve kontrast
WCAG 2.2 AAA hedefine (gövde ≥ 7:1) uyar (bkz. DESIGN.md).
