# TeamsLike — Tasarım Sistemi (DESIGN.md)

Bu doküman frontend'in görsel dilini tanımlar. Temel referans **Flowbite** (React blocks v1.8) tasarım sistemidir; renk paleti **mavi (blue)**, font **Inter**'dir. Yeni her ekran/komponent buradaki kurallara uymalı ki bütün uygulama tutarlı görünsün.

> Altın kural: Yeni bir UI parçası eklerken **önce buradaki token/sınıfları**, sonra Flowbite bloklarını kullan. Yeni renk/hex uydurma.

---

## 1. İlkeler

- **Mavi birincil, gri nötr.** Aksiyon/aktif/seçili = mavi; metin/kenar/zemin = gri ölçeği. Renk az ve amaçlı.
- **Yumuşak ama net.** `rounded-lg` köşeler, `shadow-sm` gölgeler, `border-gray-200` ince kenarlar.
- **Tipografi Inter.** Başlık `font-semibold/bold` + `text-gray-900`; yardımcı metin `text-muted` (gray-600, AAA). `text-gray-500` ve açığı metinde kullanılmaz.
- **Tek kaynak.** Renkler `@theme` token'larında (`src/styles/index.css`). Bileşen sınıfları `@layer components`'te.
- **Tailwind utility öncelikli.** Stili önce JSX `className`'de Tailwind utility'leriyle yaz; varsayılan olarak `index.css`'e özel CSS ekleme. `index.css`'e **yalnızca** utility ile ifade edilemeyen durumlar girer: `@keyframes`, karmaşık `::before/::after`, `:has()`/yapısal seçiciler, paylaşılan `@layer components` sınıfları. (bkz. `CLAUDE.md`)

---

## 2. Renkler

### Birincil (mavi) — `primary-*` ve `blue-*` eşdeğer

| Token / sınıf | Hex | Kullanım |
|---|---|---|
| `primary-50` / `blue-50` | `#eff6ff` | çok açık zemin (aktif satır) |
| `primary-100` / `blue-100` | `#dbeafe` | badge zemini, yumuşak vurgu |
| `primary-600` / `blue-600` | `#2563eb` | tab/aktif çizgi, progress (büyük öğe) |
| `primary-700` / `blue-700` | `#1d4ed8` | **birincil buton zemini, birincil aksiyon** |
| `primary-800` / `blue-800` | `#1e40af` | birincil buton hover · **gövde metni mavisi: link & ghost** (AAA 8.7:1) |

> **AAA notu — mavi metin.** `blue-600`/`blue-700` beyaz üstünde yalnızca ~6.4–6.7:1
> verir (AAA gövde eşiği 7:1'in altında). **Metin** olarak mavi gerektiğinde (link,
> ghost buton, `.btn` hover) `blue-800` (`text-blue-800`) kullanın. `blue-600/700` zemin,
> kenar, ikon ve büyük öğelerde (≥24px) serbest.

Semantik takma adlar (`brand`): `brand` = blue-700, `brand-soft` = blue-100, `brand-softer` = blue-50. (Eski komponentlerle uyum için.)

### Nötrler (gri)

| Token | Hex (Tailwind) | Kullanım |
|---|---|---|
| `ink` | `#111827` gray-900 | birincil metin, başlık |
| `ink-2` | `#374151` gray-700 | gövde metni |
| `ink-3` | `#4b5563` gray-600 | koyu ikincil metin |
| `muted` | `#4b5563` gray-600 | yardımcı/ikincil metin (AAA için gray-500'den koyulaştırıldı) |
| `line` | `#e5e7eb` gray-200 | kenarlık, ayraç |
| `line-2` | `#f3f4f6` gray-100 | açık ayraç |
| `surface` | `#ffffff` | kart/panel zemini |
| `surface-2` | `#f9fafb` gray-50 | sayfa zemini, input zemini |
| `rail` | `#111827` gray-900 | koyu ikon rail |

### Durum renkleri

| Anlam | Sınıf çifti |
|---|---|
| Başarı | `bg-green-100 text-green-800` · buton `bg-green-600` |
| Hata/Tehlike | `bg-red-100 text-red-800` · buton `bg-red-600 hover:bg-red-700` |
| Uyarı | `bg-yellow-100 text-yellow-800` |
| Bilgi (mavi) | `bg-blue-100 text-blue-800` |

### Kontrast — WCAG 2.2 AAA (bağla ve doğrula)

Hedef: **gövde/küçük metin ≥ 7:1**, büyük metin (≥24px ya da ≥18.66px bold) **≥ 4.5:1**.
Metin token'ları beyaz (`#fff`) ve sayfa zemini `surface-2` (`#f9fafb`) üstünde doğrulandı:

| Metin | Hex | beyaz üstünde | surface-2 üstünde | Durum |
|---|---|---|---|---|
| `ink` | `#111827` | 17.7:1 | 17.0:1 | AAA ✓ |
| `ink-2` (gövde) | `#374151` | 10.3:1 | 9.9:1 | AAA ✓ |
| `ink-3` / `muted` | `#4b5563` | 7.6:1 | 7.2:1 | AAA ✓ |
| `blue-800` (link/ghost) | `#1e40af` | 8.7:1 | 8.4:1 | AAA ✓ |
| ~~`gray-500`~~ (eski muted) | `#6b7280` | 4.8:1 | 4.6:1 | ✗ AAA'da kalır — kullanma |
| ~~`gray-400`~~ (eski placeholder) | `#9ca3af` | 2.5:1 | 2.4:1 | ✗ AA'da bile kalır — kullanma |

Kurallar:
- **Gri metin = en açık gray-600 (`muted`/`ink-3`).** `text-gray-500` ve daha açığını
  **metin** için kullanma. gray-400/500 yalnızca metin-dışı dekoratif/ikon/çizgi.
- **Placeholder ≥ 4.6:1 + her zaman görünür `.label`.** `.input` placeholder'ı `gray-500`;
  placeholder asla tek anlam taşıyıcısı değil — gerçek anlamı `.label` taşır (AAA 1.4.6).
- **Renkli zemin üstü metin** (badge, durum, buton): renk çiftleri yukarıdaki durum
  tablosundan; yeni çift eklerken 7:1 (büyük öğede 4.5:1) doğrula.
- **Yeni gri/renkli metin eklemeden önce kontrastı ölç.** Şüphedeyse ink ucuna çek.

---

## 3. Tipografi

Font ailesi: **Inter** (Google Fonts, `index.html`'de yüklü), fallback `Segoe UI, system-ui`.
Product register: **sabit rem ölçeği** (akışkan/clamp değil), tek aile, kibar boyut. Başlıklar
kapaklı; ekranı dolduran font yok.

### Tip ölçeği (semantik roller — bağla ve sapma)

| Rol | Tailwind | px | Ağırlık | Renk |
|---|---|---|---|---|
| Sayfa kahramanı (nadir, landing) | `text-2xl` | 24 | `font-semibold` | `text-ink` |
| Sayfa başlığı (h1) | `text-xl` | 20 | `font-semibold` | `text-ink` |
| Bölüm başlığı (h2) | `text-base` | 16 | `font-semibold` | `text-ink` |
| Kart/alt başlık (h3) | `text-sm` | 14 | `font-semibold` | `text-ink` |
| Gövde | `text-sm` | 14 | `font-normal` | `text-ink-2` |
| Gövde vurgu / buton / etiket | `text-sm` | 14 | `font-medium` | — |
| Yardımcı / ikincil | `text-sm` | 14 | `font-normal` | `text-muted` |
| Açıklama / meta / sayaç | `text-xs` | 12 | `font-normal` | `text-muted` |

### Kurallar
- **Tavan `text-2xl` (24px).** `text-3xl`/`4xl`/`5xl` kullanma — "çok büyük" = yanlış.
  (İstisna yok: landing/hero da `text-2xl` ile kibar durur.)
- **Keyfi px boyut yok.** `text-[10px]/[11px]/[13px]/[17px]` → ölçeğe eşle (`text-xs`/`text-sm`).
- **Taban 12px (`text-xs`).** 10–11px metin okunmuyor → en az `text-xs`.
- **Eyebrow yok.** `uppercase tracking-wide` küçük başlık deseni YASAK → düz `text-xs font-semibold text-muted`.
- **`font-light` kullanma** (özellikle küçük metinde kontrast düşer). En hafif `font-normal`.
- **Aynı rol her yerde aynı.** Başlık bir yerde `font-bold`, başka yerde `font-semibold` olmasın → `font-semibold`.
- Sayısal hizalama gereken yerde (tablo, metrik) `tabular-nums`.

---

## 4. Uzaklık / köşe / gölge

- **Radius:** standart `rounded-lg` (8px); pill/badge `rounded-md` veya `rounded-full`; avatar `rounded-full`.
- **Gölge:** kart `shadow-sm`; açılır menü/popover `shadow-lg`; modal `shadow-xl`.
- **Boşluk:** içerik dolgusu `p-4`/`p-6`; form alanları arası `space-y-4`; liste öğeleri `p-2`.
- **Odak halkası:** birincil `focus:ring-4 focus:ring-blue-300`; nötr `focus:ring-4 focus:ring-gray-100`; input `focus:ring-1 focus:ring-blue-500`.

---

## 5. Bileşen spesifikasyonu

Bunlar `src/styles/index.css` › `@layer components` içindeki hazır sınıflar. Mümkünse class kullan; özel durumda aşağıdaki ham Flowbite dizilerini kopyala.

### Buton
- Sınıf: `.btn` (nötr/gri), `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-danger`, `.btn-sm`.
- Birincil ham: `text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5`
- Nötr ham: `text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:ring-4 focus:ring-gray-100 ...`

### Input / Select / Textarea
- Sınıf: `.input` (+ `.label` etiket).
- Ham: `bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5` (AAA: placeholder gray-500, görünür `.label` zorunlu).

### Checkbox / Radio / Toggle
- Checkbox/Radio: `w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-2 focus:ring-blue-500` (+ `accent-blue-600`).
- Toggle (açık): `bg-blue-700 border-blue-700`.

### Kart
- Sınıf: `.card` → `bg-white border border-gray-200 rounded-lg shadow-sm`. İç dolgu `p-4`/`p-6`.

### Badge / Chip
- Sınıf: `.badge` (mavi/bilgi) + `.badge-gray/green/red/yellow`.
- Ham (sayaç): `inline-flex justify-center items-center w-5 h-5 text-xs font-semibold rounded-full text-primary-800 bg-primary-100`.

### Tablo
- `w-full text-sm text-left text-gray-500`; başlık `text-xs text-gray-700 uppercase bg-gray-50`; satır `border-b hover:bg-gray-50`; hücre `px-6 py-4`.

### Modal / Drawer
- Backdrop `bg-gray-900/50`; panel `bg-white rounded-lg shadow-xl`; başlık `text-lg font-semibold text-gray-900`; kapat butonu `text-gray-400 hover:bg-gray-200 rounded-lg`.

### Sekme (Tabs)
- Underline aktif: `border-b-2 border-blue-600 text-blue-600`; pill aktif: `bg-blue-600 text-white rounded-lg`.

### Pagination
- Aktif sayfa: `bg-blue-50 text-blue-600 hover:bg-blue-100`.

### Avatar
- `rounded-full`, boyutlar xs/sm/md/lg; baş harf zemini marka mavisi.

---

## 6. Düzen — Double Sidebar

- **İkon rail** (`NavRail`, 68px, `bg-rail` gray-900): uygulama anahtarı; üstte logo ikonu, altta kullanıcı avatarı. Aktif öğe beyaz, hover `white/10`.
- **Bağlamsal sidebar** (`ContextSidebar`, 256px, `bg-white border-gray-200`): Flowbite "team switch" deseni —
  - üstte **tenant switch** (logo + ad + plan + chevron),
  - ortada **bölüme özel nav** (list-item: `p-2 rounded-lg hover:bg-gray-100`, aktif `bg-primary-50 text-primary-700`, badge `bg-primary-100 text-primary-800`),
  - altta sabit **kullanıcı menüsü** + Ayarlar/Yardım/Davet.
- **İçerik** (`main`, `flex-1`): üstte `Topbar` (h-14, `border-gray-200`), altında sayfa.

---

## 7. İkonografi

- İnce çizgi (stroke) ikonlar, `currentColor`, ~`w-5 h-5` (nav) / `w-6 h-6` (büyük).
- Kaynak: `src/components/Icon.tsx` (gerekli ikon yoksa buraya ekle). Flowbite blokları kendi inline SVG'lerini getirir — onları olduğu gibi kullanabilirsin.

---

## 8. Flowbite blokları nasıl eklenir

`flowbite-react-blocks` paketindeki bloklar `blue-*` / `gray-*` Tailwind sınıflarını kullanır; bizim tema bunlarla **birebir uyumlu** (primary = blue). Bir blok eklerken:

1. Bloğun JSX'ini kopyala, `dark:` varyantlarını (kullanmıyorsak) temizle.
2. `primary-*` veya `blue-*` ne kullanılmışsa bırak — ikisi de mavi.
3. Tekrarlı parça ise `src/components/ui/`'a bir bileşen olarak çıkar.
4. Form/aksiyon varsa TanStack Query hook'una bağla (`features/<feature>/`).

---

## 9. Yapılmayacaklar

- Mor/indigo veya rastgele hex kullanma — yalnızca mavi `primary/blue` + `gray`.
- Sabit (hardcoded) renk yerine token/Tailwind sınıfı kullan.
- Köşe/gölge/boşluk için keyfi değerler verme; bu dokümandaki ölçeğe uy.
- **Metinde `text-gray-500`/`gray-400` ve açığını kullanma** (AAA 7:1 altında kalır) →
  ikincil metin `text-muted`/`text-ink-3` (gray-600). Mavi **metin** = `text-blue-800`.
- AAA kontrast eşiğini geçmeyen yeni renk çifti ekleme; eklemeden önce ölç (§2 tablosu).
