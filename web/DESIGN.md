# TeamsLike — Tasarım Sistemi (DESIGN.md)

Bu doküman frontend'in görsel dilini tanımlar. Temel referans **Flowbite** (React blocks v1.8) tasarım sistemidir; renk paleti **mavi (blue)**, font **Inter**'dir. Yeni her ekran/komponent buradaki kurallara uymalı ki bütün uygulama tutarlı görünsün.

> Altın kural: Yeni bir UI parçası eklerken **önce buradaki token/sınıfları**, sonra Flowbite bloklarını kullan. Yeni renk/hex uydurma.

---

## 1. İlkeler

- **Mavi birincil, gri nötr.** Aksiyon/aktif/seçili = mavi; metin/kenar/zemin = gri ölçeği. Renk az ve amaçlı.
- **Yumuşak ama net.** `rounded-lg` köşeler, `shadow-sm` gölgeler, `border-gray-200` ince kenarlar.
- **Tipografi Inter.** Başlık `font-semibold/bold` + `text-gray-900`; yardımcı metin `text-gray-500`.
- **Tek kaynak.** Renkler `@theme` token'larında (`src/styles/index.css`). Bileşen sınıfları `@layer components`'te.

---

## 2. Renkler

### Birincil (mavi) — `primary-*` ve `blue-*` eşdeğer

| Token / sınıf | Hex | Kullanım |
|---|---|---|
| `primary-50` / `blue-50` | `#eff6ff` | çok açık zemin (aktif satır) |
| `primary-100` / `blue-100` | `#dbeafe` | badge zemini, yumuşak vurgu |
| `primary-600` / `blue-600` | `#2563eb` | link, tab/aktif çizgi, progress |
| `primary-700` / `blue-700` | `#1d4ed8` | **birincil buton, birincil aksiyon** |
| `primary-800` / `blue-800` | `#1e40af` | birincil buton hover |

Semantik takma adlar (`brand`): `brand` = blue-700, `brand-soft` = blue-100, `brand-softer` = blue-50. (Eski komponentlerle uyum için.)

### Nötrler (gri)

| Token | Hex (Tailwind) | Kullanım |
|---|---|---|
| `ink` | `#111827` gray-900 | birincil metin, başlık |
| `ink-2` | `#374151` gray-700 | gövde metni |
| `muted` | `#6b7280` gray-500 | yardımcı/ikincil metin |
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

---

## 3. Tipografi

- Font ailesi: **Inter** (Google Fonts, `index.html`'de yüklü), fallback `Segoe UI, system-ui`.
- Başlıklar: `text-2xl/xl font-bold text-gray-900 tracking-tight`.
- Bölüm başlığı: `text-sm font-semibold uppercase tracking-wide text-gray-500`.
- Gövde: `text-sm text-gray-700` · yardımcı: `text-sm text-gray-500` · küçük: `text-xs`.
- Buton metni: `text-sm font-medium`.

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
- Ham: `bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`

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
