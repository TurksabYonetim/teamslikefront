# Proje talimatları (TeamsLike web)

## Stil yazımı — Tailwind utility öncelikli

Stil eklerken **önce Tailwind utility class'larını** kullan; varsayılan olarak
`src/styles/index.css`'e özel CSS **yazma**.

- Düzen, boşluk, renk, tipografi, kenar, gölge, durum (`hover:`/`focus-visible:`/
  `disabled:`/`dark:`) ve hareket-güvenli etkileşim (`motion-safe:active:scale-…`) →
  doğrudan JSX `className`'de Tailwind utility'leriyle yaz.
- Gerektiğinde keyfi değer (`[transform:translateY(-1px)]`, `[box-shadow:…]`) ve
  `motion-safe:` / `motion-reduce:` varyantlarını kullan.
- Mevcut tasarım token'larını (`text-ink`, `text-muted`, `bg-surface`, `border-line`,
  `primary-*`/`blue-*`) ve `@layer components` hazır sınıflarını tercih et; yeni hex uydurma.

`src/styles/index.css`'e **yalnızca** utility ile ifade edilemeyen durumlarda ekle:

- `@keyframes` tanımları,
- karmaşık `::before`/`::after` pseudo-element kurguları,
- `:has()` / kardeş / yapısal seçici gerektiren durum stilleri,
- birden çok ekranda paylaşılan `@layer components` bileşen sınıfları.

Animasyonlar her zaman `@media (prefers-reduced-motion: …)` ile korunur ve kontrast
WCAG 2.2 AAA hedefine (gövde ≥ 7:1) uyar (bkz. DESIGN.md).
