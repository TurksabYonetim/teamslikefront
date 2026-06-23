# Kod Kalitesi & Tekrar İncelemesi — Birleşik Rapor

> **Kapsam:** `web/src` (554 dosya, ~60K satır) — React 18 + TypeScript + Tailwind v4 + TanStack Query.
> **Yöntem:** İki bağımsız inceleme paralel çalıştırıldı:
> - **Claude paralel-agent workflow'u** — 35 agent (24 dizin/feature derin tarama + 10 tüm-kod-tabanı "tekrar avcısı" + 1 sentez). 256 ham bulgu → ~90 ayrık bulgu.
> - **Codex** — tüm feature'ları okuyup `tsc --noEmit` ile doğrulayarak 25 bulgu (`CODE_QUALITY_CODEX.md`).
>
> Her iki tarafın **bağımsız olarak aynı sorunu bulduğu** maddeler 🟢 ile işaretli — bunlar en yüksek güvenilirlikte. Aşağıdaki birleşik öncelik listesi etki × yaygınlık × kolaylığa göre sıralanmıştır.
>
> Toplam tahmini azaltma potansiyeli: **~4.900+ satır** (~3.000'i ölü kod, geri kalanı primitive birleştirme + util tekleştirme).

---

## Yönetici Özeti

Kod tabanında baskın iki tema öne çıkıyor:

1. **"Aynı kod birden çok kez yazılmış"** — Tasarım sistemi primitive'leri (`Input`, `IconButton`, `Badge`, `Avatar`, `Modal`, `EmptyState`, `Dropdown`, `Card`) mevcut olmasına rağmen feature'larda ham HTML/className ile elle yeniden yazılıyor. Birçok küçük util (`uid`, `initials`, `delay`, tarih formatlama, `channelLabel`) 4–10 yerde kopyalanmış.
2. **"Props ile tek komponentte toplanabilirdi"** — Popover/portal yerleşimi, sağ-drawer kabuğu, collapsible form, arama kutusu, modal-form footer, loading/empty/error orchestration gibi kalıplar 3–9 kez kopyalanmış.

Ayrıca **yüksek hacimli ölü kod** (~1.826 satır import edilmeyen mail dosyaları + 1.074 satır kopuk Jitsi akışı) ve **gereksiz yeniden render** sınıfı performans sorunları (memoization eksikliği, geniş store selector'ları, saniyelik `setInterval`'in devasa ağacı render etmesi) mevcut.

---

## 🔴 Birleşik Öncelik Listesi

### En yüksek değer (önce bunlar)

| # | Bulgu | Kategori | Kaynak | ~Satır |
|---|-------|----------|--------|--------|
| 1 | **Ölü mail dosyalarını sil** — `MailRead.tsx` (339), `MailReply.tsx` (609), `Notifications.tsx` (878) hiçbir yerden import edilmiyor (`grep` ile 0 eşleşme doğrulandı). Flowbite'tan birebir çevrilmiş statik markup; `href="#"` davranışsız aksiyonlar. İşlevleri `MailInbox`/`ComposeModal` karşılıyor. | dead-code | 🟢 İkisi de | **1.826** |
| 2 | **Jitsi `MeetingRoomPage` ikiliğini çöz** (1.074 satır) — `/room-jitsi` rotasına tek referans router tanımı; `MeetingsPage`/`Lobby` `join_url`'i `/room`'a (mock) gönderiyor ve `joinUrl` hiç okunmuyor → **Katıl akışı kırık**. Karar: ya navigate hedeflerini `/room-jitsi` yap, ya da dosyayı+rotayı sil. | dead-code + bug | Claude | **1.074** |
| 3 | **Persisted store boilerplate'ini tek yardımcıya indir** — ~10 store'da `try/catch` + `JSON` localStorage load/save kopyası (`authStore`, `tenantStore`, `governance`, `botflow`, `studio`, `wfo`, `directory`, overlay'ler). `lib/persist.ts` (`loadJson`/`saveJson` + SSR guard) veya `createStore`'a `persist` opsiyonu. | duplication | Claude | ~90 |
| 4 | **Ham `<input>`/icon-button/modal/avatar/empty-state → primitive'ler** — En yoğun: `MailInbox` (~12 icon buton), `MeetingLobbyPage` (2 modal), `support/StudioView`, `phone/ReceptionistBuilder`, `webinar/EventManager`. `IconButton`'a `danger`/`subtle` varyant ekle. | reuse-via-props | 🟢 İkisi de | ~600 |
| 5 | **Tarih/saat formatlamayı `lib/dateFormat.ts`'e topla** — `fmtDate`/`fmtTime`/`toLocaleString` 9+ feature'da kopya, üstelik tutarsız fallback (`"—"` vs `""` vs `iso`) ve locale. `formatDate`/`formatDateTime`/`formatTime`/`toDateInput` API'si. | duplication + consistency | 🟢 İkisi de | ~80 |
| 6 | **Portal/Popover yerleşim mantığını headless hook'a topla** — `Select`, `DateField`, `TimeField` `computeCoords`/scroll-resize/dış-tıklama/ESC/`createPortal` mantığını neredeyse birebir tekrarlıyor (kopyalar zaten sürüklenmeye başlamış). `usePopover({triggerRef,open,side})`. | duplication | Claude | ~130 |
| 7 | **`uid` ve `initials` util'lerini tekle** — `uid`/`genId` 10+ kopya, `initials` 6 kopya. `lib/uid.ts` + `Avatar.toInitials` export'u. | duplication | Claude | ~180 |

### Yüksek değer (sonra)

| # | Bulgu | Kategori | Kaynak | ~Satır |
|---|-------|----------|--------|--------|
| 8 | **`ModalForm`/`DialogForm` wrapper'ı** — messaging dialogları (`CreateChannelDialog`, `NewDmDialog`, `CreatePollDialog`) ve canvas modalları (`CanvasPage` 3 modal) aynı footer (`iptal/kaydet`) + form şemasını elle tekrarlıyor; `Modal`'ın `footer` prop'unu kullanmıyorlar. | reuse-via-props | 🟢 İkisi de | ~120 |
| 9 | **Loading/Error/Empty orchestration'ı `AsyncListState` component'ine indir** — `CanvasPage`, `UsersPage`, `PortalChatPage`, `MeetingsPage`, `SettingsPage`, `DashboardPage` her sayfada `isLoading/isError/isEmpty` üçlüsünü + skeleton'ları elle yazıyor (`aria-busy`/retry tutarsızlığı). | reuse-via-props | 🟢 İkisi de | ~120 |
| 10 | **Store array operasyonlarını `lib/storeArray.ts`'e indir** — `updateById`/`removeById`/`toggleInArray`/`appendUnique` `map by id` kalıbı tüm store'larda elle. Messaging store'da ayrıca `makeMessage()`+`appendAndDeliver()` ile 11 eylemdeki taban-mesaj literalini tekle. | duplication | 🟢 İkisi de | ~45 |
| 11 | **Geniş messages selector'larını daralt + `isEqual`** — `MessageBubble`/`PinnedBar`/`ScheduledTray`/`MessageList` tüm `messages` dizisine abone; tek teslim-tick'i geniş re-render yayıyor. Dar+shallow selector + `React.memo`. | performance | 🟢 İkisi de | — |
| 12 | **Saniyelik `setInterval`'i küçük alt-bileşene izole et** — `MeetingRoomPage` `<RunningTime>`, `MeetParityPanel` `<BreakoutCountdown>` (1.074 satırlık ağaç saniyede bir render olmasın). | performance | Claude | — |
| 13 | **`RoomControlButton` + kontrol-tooltip kalıbını tek bileşene indir** — `MeetingRoomPage`'de 9 buton + 15 tooltip div kopya; `Lobby`'deki `ctrlBtn` üreticilerini `lib/meetingControls.ts`'e taşı. | duplication | Claude | ~160 |
| 14 | **`CollapsibleSection` primitive'i** — `IVRBuilder`/`ReceptionistBuilder`/`RoutingRuleBuilder` + `EventManager` toggle + rotate-chevron + grid-rows animasyon kabuğunu tekrarlıyor. | duplication | Claude | ~75 |
| 15 | **`SearchField` bileşeni** — `phone/ContactsPanel`+`CallHistory`, `intelligence`, `messaging/ChannelHeader` (büyüteç + Input + temizle); inline arama SVG'lerini react-icons ile değiştir. | reuse-via-props | Claude | ~90 |
| 16 | **`ResponsiveDataList`/`DataTable<T>`** — `UsersPage` ve `docs/TableGridView` mobil-kart + desktop-tablo'yu iki ayrı JSX ağacında render ediyor (aksiyon/label iki yerde güncelleniyor). | reuse-via-props | Codex | — |
| 17 | **Uzun listelerde virtualizasyon yok** — `MessagesPane`, `support/ConversationView`, `intelligence/TranscriptViewer`, `messaging/MessageList` tüm satırları DOM'a basıyor. Ortak `VirtualList` (veya `@tanstack/react-virtual`). | performance | Codex | — |

### Orta / düşük değer

| # | Bulgu | Kategori | Kaynak |
|---|-------|----------|--------|
| 18 | **Sidebar okunmamış rozet bug'ı + tek-kaynak nav** — `GROUPS` modül-init'te `unread()` bir kez hesaplanıp donuyor (rozet hiç güncellenmiyor); `nav.ts` ↔ `Sidebar GROUPS` drift'i. Reaktif `useUnreadCount(section)`. | performance + bug (Claude) |
| 19 | **`useToast()` Rules-of-Hooks ihlali** — `HostPanel`/`ControlBar`/`RecordingSummaryDialog`'da `try/catch`'li hook çağrısı; provider yoksa no-op döndürecek `useOptionalToast`. | consistency (Claude) |
| 20 | **Auth validation/bind tekrarı** — `LoginPage`/`SignupPage` `EMAIL_RE`+`errors/touched`+`bind` kopya; `auth.validation.ts` + `useFormErrors<T>()`. | duplication (Codex) |
| 21 | **`SentimentPill`/`SENT_PILL` + `StarRating`** — intelligence'ta 3–5 dosyada birebir renk haritası + CSAT yıldız 3 yer. | duplication (Claude) |
| 22 | **`InlineComposer`** — docs `ClipDetail`/`CanvasEditor`/`KanbanBoard`/`AppsPanel` (input + yuvarlak gönder) 4 kopya. | duplication (Claude) |
| 23 | **`RightDrawer`/`SidePanel` kabuğu** — messaging `ThreadPanel`+`DetailsPanel`, meetings `SidePanel`/`HostPanel`/`EngagePanel`. | reuse-via-props (Claude) |
| 24 | **Paylaşılan `Card` (+`StatCard`)** — `appointments`/`support`/`webinar` kendi `Card.tsx`'ini yazmış + kullanılmayan `StatCard` export'ları. | duplication (Claude) |
| 25 | **Render içi ağır türevleri `useMemo`'la** — `dashboard.derive*`, `TableGridView` (`numericMaxByColumn`), `GanttView`/`HillView` O(k·n), `KanbanBoard` kolon filtreleri, `MessageComposer` mention/scheduled, `SavedDrawer` O(n·m) lookup, `ConversationList` 4'lü filtre, `VoicemailInbox` sort, `PublicBookingPage` takvim, `AvailabilityEditor` slot bucket. | performance (🟢 ikisi de — farklı dosyalar) |
| 26 | **Render gövdesinde tanımlı alt-bileşenler** — `CreatePollDialog`/`CreateRoomDialog` `Toggle`, `ShortcutsHelpDialog` `Group` her render'da remount + focus kaybı; modül seviyesine taşı. | performance (Claude) |
| 27 | **Util tekleştirme (kalan)** — `capArray` (support yerel kopya), `delay` (4), `clone` (2), `escapeRegExp` (intelligence 3), `channelLabel` (messaging 4+), `downloadTextFile` (2). | duplication (Claude) |
| 28 | **Token/ham renk ihlalleri (CLAUDE.md)** — `DateField`/`TimeField` `bg-gray-50`/`text-gray-900` + sabit yükseklik (`CONTROL_HEIGHT` atlanmış, dark mode kırılır); `CONTROL_PAD_X` ölü; press mikro-etkileşimi 7+ yerde tutarsız `motion-safe`. | consistency (Claude) |
| 29 | **mockStore ↔ useLocalCrud ↔ copilot.api üçlü persistence soyutlaması** — tek `localRepository` katmanı. | duplication (Codex) |
| 30 | **Inline SVG → react-icons** — phone telefon-ahizesi SVG'si 3x, `RoutingRuleBuilder` ok, `AvailabilityEditor` chevron/takvim, `ClipDetail` onay-tiki 2x. | duplication (🟢 ikisi de) |
| 31 | **Davranışsız UI / ölü kod kalıntıları** — `ContactsPanel:460` ulaşılamaz `return renderContacts()`; `KanbanBoard` toolbar boş `onSelect`; native `<details>` menü (`ControlBar` ~10x) → `Dropdown`. | dead-code (Codex) |
| 32 | **Kullanılmayan export'lar** — `webinar.api.ts` (sadece testi), `support.api.searchKbRemote`, `directoryStore.isFavorite`, `captionsStore.caption`, `useLocalCrud.replaceAll/clear`, clips `looksLikeImageUrl`/`reactionTotal`/`topClips`, 3× `StatCard`. | dead-code (Claude) |
| 33 | **Tip/sabit tek-kaynağı** — `Permission`'ı `as const` diziden türet; `Section` tipini `types.ts`'e indir (`messaging.mock` kopyasını sil); `statusTone`/`channelKindIcon` eşlemelerini tekle. | consistency (Claude) |
| 34 | **`Field`/`TextField`/`TextareaField` primitive'i** — `Input` yalnız raw wrapper; `users`/`portal`/`settings`/`webinar` `label+input+error` dizilimini tekrarlıyor. | reuse-via-props (Codex) |
| 35 | **`RegistrationBuilder` state bug'ı** — `fields` yalnız mount'ta event'ten kopyalanıyor; event değişince eski kalıyor (`key={event.id}` veya reset). + `CostPanel` slider/maliyet ilişkisiz. | bug (Codex) |
| 36 | **`ReactQueryDevtools`'u yalnız `import.meta.env.DEV`'de yükle.** | performance (Claude) |

---

## İki İncelemenin Karşılaştırması

- **Ortak (🟢, en güvenilir):** Modal/dialog tekrarı, tarih formatlama dağınıklığı, store boilerplate'i, primitive yerine ham HTML, loading/empty/error tekrarı, render-içi memoization eksikliği, inline SVG.
- **Yalnız Claude:** ~1.826 satır ölü mail dosyası + Jitsi ikiliği (en büyük tek kazanç), Popover headless hook, `uid`/`initials` tekleştirme, Sidebar rozet bug'ı, `useToast` hook ihlali, `RoomControlButton`, `CollapsibleSection`, `SentimentPill`/`StarRating`.
- **Yalnız Codex:** `ResponsiveDataList`, virtualizasyon eksikliği, auth validation tekrarı, `mockStore`/`useLocalCrud` ayrışması, `ContactsPanel` ulaşılamaz return, boş toolbar handler'ları, `RegistrationBuilder` state bug'ı.

İki ayrı raporun büyük örtüşmesi bulguların gerçekliğini güçlendiriyor; tamamlayıcı farklar ise tek bir incelemenin kaçırdığı ölü-kod ve mimari sorunları yakaladı.

---

## Uygulama Durumu (`/loop` ile uygulandı)

Aşağıdaki düzeltmeler davranış korunarak uygulandı; **her adımda `tsc --noEmit` temiz** ve test suite'i **baseline'a göre (56 failed / 32 files — önceden mevcut, test-ortamı/localStorage kaynaklı) yeni hata eklemeden** geçti.

### ✅ Uygulandı
- **Ölü kod:** `MailRead`/`MailReply`/`Notifications` silindi (~1.826 satır); `searchKbRemote`, `looksLikeImageUrl`, `webinar.api.ts`(+test) silindi.
- **lib altyapısı (gerçek copy-paste boilerplate):** `lib/uid.ts` (7 kopya), `lib/dateFormat.ts` (Admin×2 `fmtDate` + 3 `fmtTime`), `lib/persist.ts` (5 store load/save try-catch), `lib/storeArray.ts` (+appointments.store), `lib/clone.ts` (phone×2); `conversation.store` `capArray` → `lib/capArray`.
- **`usePopover` headless hook:** DateField + TimeField (~90 satır dedup).
- **Token/CONTROL_HEIGHT tutarlılığı:** DateField/TimeField trigger'ları Select'e hizalandı (dark-mode token); ölü `CONTROL_PAD_X` kaldırıldı.
- **2 gerçek bug:** `useToast` Rules-of-Hooks ihlali (`useOptionalToast` + 3 dosya); Sidebar frozen-badge (render-zamanı `unread`).
- **Performans:** 8 `useMemo` (VoicemailInbox, SavedDrawer Map'leri, ConversationList, KanbanBoard bucket, DashboardPage derive'ler, AvailabilityEditor, MessageComposer, TableGridView); 3 render-içi alt-bileşen → modül seviyesi (remount/focus bug'ı: CreatePollDialog/CreateRoomDialog `Toggle`, ShortcutsHelpDialog `Group`).
- **Paylaşılan komponent:** `ui/Card.tsx` (3 kopya → tek + ölü StatCard silindi); `ui/CollapsibleSection.tsx` (IVRBuilder + RoutingRuleBuilder).

### ⏭️ Bilinçli ertelendi / yapılmadı (gerekçeyle)
- **"Duplikasyon" sanılan idiomlar (gerçek kopya değil):** `initials` (locale `tr`/`lang` + algoritma + fallback farkları), tarih formatlayıcıların çoğu (divergent), `map-by-id` store kalıbı (~95 satır, idiom; util eklendi ama kütle-migrasyon yapılmadı), `escapeRe`/`delay`/`download*` (tek kopya veya farklı imza).
- **Görsel JSX-restructure refactor'lar (kullanıcı kararı: yalnız düşük-riskli):** SearchField (birebir-aynı çift yok — CSS-hook/transition farkları), AsyncListState (sayfa başına çok farklı), ModalForm footer (parametrik), ReceptionistBuilder/EventManager CollapsibleSection (farklı button/varyant), **Görev 13 primitive geçişi** (per-site restructure). Görsel test olmadığından regresyon otomatik yakalanamıyor → insan/branch QA önerilir.
- **Jitsi `MeetingRoomPage` ikiliği (rank #2, ~1.074 satır):** kullanıcı kararı **"şimdilik dokunma"**. İleride ürün kararıyla: ya sil ya `/room-jitsi`'yi gerçek akış yap (`joinUrl` bağla + `createBreakouts` guard).
- **Codex'in `ContactsPanel:463` "ulaşılamaz return" bulgusu: FALSE POSITIVE** (`renderContacts` bir ok-fonksiyonu; return erişilebilir).

---

*Ham veri: Claude bulguları workflow `wf_3f311e15-1f2` çıktısında; Codex tam raporu `CODE_QUALITY_CODEX.md`.*
