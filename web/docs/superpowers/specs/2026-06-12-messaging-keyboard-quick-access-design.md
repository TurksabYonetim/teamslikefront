# Messaging — Klavye-öncelikli hızlı erişim katmanı (Tasarım Spec)

**Tarih:** 2026-06-12
**Modül:** `web/src/features/messaging`
**Program:** UX "3 tık → 1 tık" — modül-sıralı iyileştirme (1/9: messaging)

## Amaç

Kullanıcının bir hedefe ulaşmak için yaptığı adım sayısını azaltmak. Messaging modülü
hover toolbar, hızlı tepkiler, smart replies, `/slash` ve `@mention` ile kolay kazanımları
zaten yapmış. Bu spec geriye kalan gerçek sürtünme noktalarını klavye-öncelikli bir
erişim katmanıyla kapatır. Yıkıcı işlemlerdeki onay adımları **bilinçli korunur**
("Sil → Emin misin?" ilkesi).

## Audit — kapatılan sürtünme noktaları

| # | Hedef | Bugün | Sonra |
|---|------|-------|-------|
| P1 | Başka kanala/DM'e atlama | Sidebar'da gözle tara + tıkla | ⌘/Ctrl+K → yaz → Enter |
| P2 | Düzenle / sabitle / kaydet / ilet / önemli | hover → ⋯ more → seç (2 tık) | Odaktayken tek tuş |
| P3 | Odaktaki mesaja klavyeyle aksiyon | Yok | `r`/`t`/`e`/`p`/`s`/`f`/`i`/`1-6` |
| P4 | 6 dışında emoji ile tepki | İmkânsız | Hover toolbar'da "+" tam seçici (1 tık) |
| P5 | Keşfedilebilirlik | Yok | `?` ile kısayol yardımı |

## Kapsam dışı (YAGNI)

- Global (uygulama geneli) komut paleti — sonraki modüllerden sonra ayrı ele alınır.
- Kanallar arası klavye gezinme (mesaj listesi ↑/↓ ile mesaj seçme) — bu spec'te yok;
  mesaj odağı tarayıcının doğal Tab'ına bırakılır.
- Yeni backend/persist — tümü mevcut store action'ları üzerinden.

## Bileşenler

4 parça, hepsi mevcut altyapıyı yeniden kullanır.

### 1. Hızlı geçiş paleti (P1)

**Dosya:** `components/GlobalSearchDialog.tsx` (genişlet) + `store.ts` (state) +
`MessagingPage.tsx` (render + hook) + `MessagingSidebar.tsx` (tetikleyici düzelt).

- `GlobalSearchDialog`'a **"Konuşmalar" bölümü** eklenir: sorgu, kanal/DM `name`'iyle
  eşleşince sonuç listesinin **üstünde** ayrı bir bölümde listelenir. Mevcut mesaj
  arama bölümü altında kalır.
- Konuşma satırına tıklama/Enter → `setChannel(id)` + ilgili ana topic'e `setTopic` +
  dialog kapanır (mevcut `jump` mantığının kanal-only varyantı).
- **Klavye navigasyonu**: birleşik sonuç listesinde (konuşmalar + mesajlar) `ArrowDown`/
  `ArrowUp` aktif indeksi gezer, `Enter` aktive eder, `Esc` kapatır (Modal verir).
  Aktif satır `aria-selected` + görsel vurguyla işaretlenir; liste `role="listbox"`,
  satırlar `role="option"`.
- **Açılış state'i**: `store`'a `paletteOpen: boolean` + `togglePalette(open?: boolean)`
  eklenir. Sidebar büyüteç butonu ve ⌘/Ctrl+K bu state'i kullanır (sidebar'daki yerel
  `searchOpen` state'i kaldırılır).
- Dialog **`ChatShell` seviyesinde** render edilir (mobilde sidebar gizliyken de erişilebilir).

### 2. Messaging hotkey hook'u

**Dosya:** yeni `components/useMessagingHotkeys.ts` (veya `lib/`), `ChatShell` içinde mount.

- `document`'a `keydown` dinler:
  - **⌘/Ctrl+K**: `preventDefault()` + `togglePalette(true)`. Composer'da yazarken bile çalışır.
  - **`?` (Shift+/)**: yalnız aktif eleman `input`/`textarea`/`contenteditable` **değilse** →
    `ShortcutsHelpDialog` açar.
- Mesaj-düzeyi tuşlar (r/t/e/p/s/f/i/1-6) burada **değil**; mesaj `<article>` üzerindeki
  yerel `onKeyDown` ile ele alınır (doğal kapsam, global state yok).
- Cleanup: unmount'ta listener kaldırılır.

### 3. Mesaj klavye kısayolları (P2+P3)

**Dosya:** `components/MessageBubble.tsx`.

- Mesaj `<article>` zaten `tabIndex={0}`. Buna `onKeyDown` eklenir. Map:
  - `r` → `setReplyTarget(id)`
  - `t` → `openThread(id)`
  - `e` → düzenleme moduna gir (yalnız `own`)
  - `p` → `togglePin(id)`
  - `s` → `toggleSave(id)`
  - `f` → ilet dialog'unu aç (`setForwardOpen(true)`)
  - `i` → `toggleImportant(id)`
  - `1`–`6` → `QUICK_REACTIONS[n-1]` ile `toggleReaction(id, emoji, ME_ID)`
- **Koruma / guard**:
  - Yalnız `e.target === e.currentTarget` iken çalışır (düzenleme textarea'sı veya iç
    buton odaktayken tuşlar ele geçirilmez; metne normal yazılır).
  - Modifier'lı tuşlar (Ctrl/Meta/Alt) yok sayılır (⌘K vb. ile çakışmasın).
  - **Silme klavyeye bağlanmaz** — yıkıcı, dropdown'da onaylı kalır.
- Erişilebilirlik: `<article>`'a `aria-keyshortcuts` eklenir (örn. `"r t e p s f i"`).

### 4. Tam emoji tepkisi (P4)

**Dosya:** `components/MessageBubble.tsx`.

- Hover toolbar'da 6 hızlı tepkiden sonra `EmojiPicker` eklenir:
  `<EmojiPicker onPick={(e) => toggleReaction(message.id, e, ME_ID)} />`.
- `EmojiPicker` mevcut; `Dropdown` tabanlı, ekstra state gerekmez.

### 5. Kısayol yardımı (P5)

**Dosya:** yeni `components/ShortcutsHelpDialog.tsx`.

- `Modal` tabanlı; başlık + iki sütun (Palet/Gezinme, Mesaj aksiyonları) kısayol listesi.
- `open`/`onClose` props; `?` hotkey'i ve isteğe bağlı bir yardım butonu açar.
- Tüm etiketler i18n.

## Veri akışı

- ⌘K → hook → `store.togglePalette(true)` → `ChatShell` `paletteOpen`'ı okur →
  `GlobalSearchDialog open`.
- Palette Enter → `setChannel`/`setTopic` → store güncellenir → `ChatShell` yeni kanalı
  gösterir → palet kapanır.
- Mesaj tuşu → `<article>.onKeyDown` → ilgili store action'ı → mevcut reaktif akış.
- Hiçbir yeni async/backend yok; tümü senkron store mutasyonu.

## Hata / sınır durumları

- Aktif kanal yokken palet açılır, "Konuşmalar" bölümü tüm kanalları (veya boş) gösterir.
- Boş sorguda mevcut "searchHint" davranışı korunur; konuşma bölümü de gizli kalır.
- Mesaj `deleted`/`system`/`call` türlerinde `onKeyDown` no-op (bu türler erken return
  ediyor; kısayollar yalnız normal balonlarda).
- `prefers-reduced-motion` ve mevcut animasyonlara dokunulmaz.

## Test stratejisi (vitest + @testing-library/react)

- **Palette**: ⌘K/Ctrl+K ile açılır; kanal adıyla yazınca konuşma listelenir; `Enter`
  ile `setChannel` çağrılır; `ArrowDown`+`Enter` ile doğru hedefe atlar.
- **Mesaj kısayolları**: `<article>` odakta `r` → `setReplyTarget`; `p` → pin toggle;
  `1` → ilk quick reaction; düzenleme textarea'sı odakta `r` tuşu **intercept edilmez**
  (metne yazılır); `Delete` hiçbir şey yapmaz.
- **Emoji "+"**: seçiciden emoji → `toggleReaction` çağrılır.
- **Yardım**: `?` → dialog açılır; composer textarea'sında `?` → açmaz.
- **i18n**: yeni anahtarlar `tr` + `en` locale'lerinde simetrik (mevcut enum-simetri
  test desenine uyumlu).

## i18n anahtarları (taslak)

`messaging` namespace'ine eklenir (tr + en simetrik):
`palette.title`, `palette.conversations`, `palette.messages`, `palette.jumpHint`,
`shortcuts.title`, `shortcuts.reply`, `shortcuts.thread`, `shortcuts.edit`,
`shortcuts.pin`, `shortcuts.save`, `shortcuts.forward`, `shortcuts.important`,
`shortcuts.react`, `shortcuts.palette`, `shortcuts.help`, `shortcuts.helpButton`.

## Kabul kriterleri

1. ⌘/Ctrl+K her yerden paleti açar; kanal adıyla yazıp Enter ile o kanala atlanır.
2. Odaktaki mesajda `r/t/e/p/s/f/i/1-6` tek tuşla ilgili aksiyonu yapar; düzenleme/yazma
   sırasında tuşlar metne gider.
3. Hover toolbar'dan herhangi bir emoji ile tek tıkla tepki verilebilir.
4. `?` kısayol yardımını açar; alanlarda yazarken açmaz.
5. Hiçbir yıkıcı işlem (sil) klavyeyle onaysız tetiklenmez.
6. `npm run typecheck` ve `npm run test` temiz geçer; yeni testler dahil.
