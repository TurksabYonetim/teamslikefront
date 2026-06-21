# Responsive Denetim Raporu (TeamsLike Web)

**Tarih:** 2026-06-20
**Kapsam:** `web/src` tüm feature'lar, layout, paylaşılan UI primitive'leri ve global stiller
**Hedef:** 320px'e kadar yatay scroll patlaması olmadan, içerik kırpılmadan, dikey scroll çalışır ve tipografi responsive olacak şekilde çalışmak.
**Yöntem:** 7 paralel uzman agent kod tabanını alana göre böldü ve salt-okunur denetledi. Bulgular gerçek satır numaralarıyla, kategori + önem (P0/P1/P2) etiketli.

> ⚠️ Bu rapor yalnızca **tespit** içerir. Hiçbir kod değiştirilmedi. Düzeltmeler ayrı bir adımda, sistemi bozmadan uygulanmalı.

---

## Kategori Açıklamaları

| Kategori | Anlamı |
|---|---|
| **X_OVERFLOW** | Yatay scroll patlaması — içerik viewport'tan taşıyor (sabit genişlik, wrap'siz flex, nowrap, sabit grid sütunu, kırılmayan string). |
| **V_CLIP** | Dikey scroll yok / component kırpılıyor — `<main overflow-hidden>` içinde sayfa kendi `overflow-y-auto`+`min-h-0` kabını sağlamıyor; içerik aşağı kayamıyor (kullanıcının ana şikâyeti). |
| **TYPO** | Responsive olmayan tipografi — mobilde küçülmeyen büyük yazı boyutları, sabit px font-size. |
| **SIZING** | 320px'de bozulan sabit boyut — sabit genişlikli panel/modal/component, mobile uyarlanmamış. |

**Önem:** **P0** = bozuk/kullanılamaz (mutlaka düzelt) · **P1** = ciddi · **P2** = küçük/parlatma.

---

## Yönetici Özeti

| Alan | P0 | P1 | P2 | Toplam |
|---|---:|---:|---:|---:|
| Shared UI & Tasarım Token'ları (sistemik) | 1 | 4 | 3 | 8 |
| Messaging | 1 | 4 | 4 | 9 |
| Meetings & Webinar | 2 | 3 | 4 | 9 |
| Phone & Support | 2 | 2 | 4 | 8 |
| Docs / Admin / Appointments / Booking / Tasks | 1 | 1 | 3 | 5 |
| Intelligence / Copilot / Canvas / Clips | 0 | 0 | 4 | 4 |
| App Shell & Navigation | 0 | 1 | 2 | 3 |
| **TOPLAM** | **7** | **15** | **24** | **46** |

**Genel değerlendirme:** Kod tabanı responsive açıdan büyük ölçüde sağlam — grid'lerin çoğu `grid-cols-1` tabanlı, çoğu sayfa kendi scroll kabını sağlıyor, tablolar `overflow-x-auto` ile sarılı, başlıklar `truncate` kullanıyor. Sorunlar belirli noktalarda yoğunlaşıyor ve çoğu **birkaç sistemik kök nedenden** kaynaklanıyor (aşağıya bak).

---

## Sistemik Kök Nedenler (Önce Bunları Düzelt — En Yüksek Kaldıraç)

Bu 4 desen, raporun büyük kısmını açıklıyor. Bunları düzeltmek onlarca yüzeyi aynı anda iyileştirir:

1. **`<main overflow-hidden>` + scroll kabı eksik sayfalar (V_CLIP).**
   `AppShell.tsx:64` → `<main className="flex flex-1 flex-col overflow-hidden ...">`. Bu yüzden HER sayfa kendi `flex-1 overflow-y-auto min-h-0` dikey scroll kabını sağlamak ZORUNDA. Sağlamayan sayfalarda mobilde **alta scroll olmuyor, içerik kırpılıyor** (kullanıcının birincil şikâyeti). İhlal eden sayfalar: **Tasks** (KanbanBoard), **Phone/MessagesPane**, **Phone/KeypadPanel**, **Messaging/MailInbox** (MailInbox + MessageRead). Çözüm deseni her seferinde aynı: kök `flex h-full min-h-0 flex-col` + içerik bölümü `flex-1 min-h-0 overflow-y-auto`.

2. **`Modal` / `Dropdown` `max-h` + scroll yok (V_CLIP, sistemik).**
   Paylaşılan `Modal.tsx` (33+ kullanım) ve `Dropdown.tsx` (14 kullanım) uzun içerikte taşıyor ve body scroll kilitli olduğu için içeriğe erişilemiyor. Tek bir primitive düzeltmesi tüm uygulamayı kurtarır.

3. **Wrap'siz yatay aksiyon satırları (X_OVERFLOW).**
   Çok butonlu satırlar `flex-wrap`/`min-w-0`/yatay-scroll olmadan 320px'i aşıyor: Messaging composer (~9 buton), `Tabs` tablist, ControlBar reaction grubu.

4. **Sabit genişlikli yan panel/preview'lar (SIZING/X_OVERFLOW).**
   `w-80`/`w-56`/`w-[512px]` gibi sabit genişlikler dar viewport'ta taşıyor veya nefes payı bırakmıyor. Çözüm: `w-full max-w-[...]` veya `w-[min(20rem,100vw)]`.

---

## P0 Bulguları (Kullanılamaz — Önce Bunlar)

1. **[V_CLIP]** `components/ui/Modal.tsx:36-39` — Modal'da `max-h`/`overflow-y-auto` yok; uzun içerik kırpılır ve body scroll kilitli olduğundan erişilemez. **33+ dosyada kullanılıyor → sistemik.**
2. **[V_CLIP]** `features/tasks/KanbanBoard.tsx:247-451` (TasksPage:9) — Sayfa kendi dikey scroll kabını sağlamıyor; mobilde board'da alta scroll olmaz, içerik kırpılır.
3. **[V_CLIP]** `features/phone/MessagesPane.tsx:86` — Kök kapsayıcı `min-h-0`/scroll kabı sağlamıyor; thread/composer mobilde kayamıyor.
4. **[X_OVERFLOW]** `features/phone/MessagesPane.tsx:86-87` — Thread listesi (`max-w-xs`) + sohbet 320px'de yan yana sığmıyor; responsive yığma yok.
5. **[X_OVERFLOW]** `features/meetings/MeetingLobbyPage.tsx:300` — `w-[512px]` sabit video önizleme; `lg:w-full` ancak 1024px'te devreye girer, 320–1023px'te taşar.
6. **[X_OVERFLOW]** `features/meetings/MeetingLobbyPage.tsx:303` — Aynı: `w-[512px]` sabit avatar kutusu mobilde taşar.
7. **[X_OVERFLOW]** `features/messaging/components/MessageComposer.tsx:247` — ~9 aksiyon butonu tek satırda wrap'siz, 320px'i aşar.

---

## Shared UI Components & Design Tokens

> Sistemik alan — buradaki bulgular onlarca sayfayı etkiler.

- **[V_CLIP] [P0]** `components/ui/Modal.tsx:36-39` — Sorunlu kod: panel `"w-full bg-surface rounded-lg ..."` + `SIZE[size]`, `max-h`/`overflow-y-auto` yok. Etki: Modal 33+ dosyada (ConfirmDialog dahil). Neden: içerik viewport'tan uzunsa üstten/alttan kırpılır, `Overlay` body scroll'u kilitlediğinden erişilemez. Öneri: panele `max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col`; içerik sarmalı (`<div className="p-5">`) `flex-1 overflow-y-auto overscroll-contain`; header/footer `shrink-0`.
- **[V_CLIP] [P1]** `components/ui/Dropdown.tsx:51-66` — Sorunlu kod: menü `"absolute z-50 ... p-1 shadow-xl"`, `max-h`/scroll yok. Etki: 14 dosya. Neden: çok öğeli menü viewport'u aşar; `overflow:hidden` ataya sahip kapsayıcılarda kırpılır (portal yok). Öneri: `max-h-[min(20rem,calc(100dvh-5rem))] overflow-y-auto overscroll-contain`.
- **[X_OVERFLOW] [P1]** `components/ui/Tabs.tsx:53-56` — Sorunlu kod: tablist `"relative flex gap-1 border-b border-line"`, `flex-wrap`/yatay scroll yok. Etki: 6 sayfa. Neden: çok sekme/uzun etikette 320px'de taşar; alt-çizgi göstergesi ölçümü bozulur. Öneri: tablist'e `overflow-x-auto no-scrollbar`, butonlara `shrink-0 whitespace-nowrap` (kaydırılabilir şerit; `flex-wrap` indikatör matematiğini bozar).
- **[X_OVERFLOW] [P1]** `components/ui/Tooltip.tsx:35-37` — Sorunlu kod: `"... absolute left-1/2 ... whitespace-nowrap ..."`. Etki: 5+ yer. Neden: uzun etiket + `left-1/2`, viewport kenarındaki tetikleyicilerde ekranı yatay taşırır (clamp yok). Öneri: `max-w-[min(16rem,calc(100vw-1rem))] whitespace-normal break-words text-balance`.
- **[SIZING] [P1]** `components/ui/Tabs.tsx:79` — Sorunlu kod: sekme butonu `"... px-4 py-2.5 ..."`. Etki: 6 sayfa. Neden: sabit `px-4` dar ekranda taşmayı garantiler (yukarıdaki Tabs X_OVERFLOW'un kökü). Öneri: scroll çözümüyle birlikte `px-3 sm:px-4`.
- **[V_CLIP] [P2]** `components/ui/Select.tsx:131` — Sorunlu kod: `const maxHeight = Math.min(320, Math.max(160, ...))`. Etki: Select 44 dosya (en yaygın primitive). Neden: alt sınır 160px'e zorlanıyor; çok kısa viewport'ta (yatay mobil) panel taşabilir. Öneri: alt sınırı gerçek boşluğa göre düşür (`Math.max(120, ...)`).
- **[TYPO] [P2]** `styles/index.css:921-926` — Sorunlu kod: `.tl-rte h1 { font-size: 1.75rem; }` (h2 1.5rem, h3 1.25rem ...) sabit, responsive değil. Etki: zengin metin editörü içeriği (MessageComposer önizleme/mesaj). Neden: 28px h1 dar baloncukta/320px'de taşar; CLAUDE.md "index.css'e sabit tipografi yazma" ilkesine de aykırı. Öneri: `clamp(1.375rem, 1.2rem + 1vw, 1.75rem)` veya Tailwind responsive `text-*`.
- **[SIZING] [P2]** `components/ui/Modal.tsx:13` + `Overlay.tsx:125` — Sorunlu kod: `xl: "max-w-3xl"`, Overlay `"fixed inset-0 flex p-4"`. Neden: 320px'de güvenli (panel `w-full` + `p-4` kenar payı), büyük boyutlar `w-full`'a düşer. Opsiyonel: dar ekranda `p-3` yeterli. (Doğrulama notu.)

**Özet:** P0=1, P1=4, P2=3 (toplam 8 bulgu)

---

## Messaging

- **[X_OVERFLOW] [P0]** `features/messaging/components/MessageComposer.tsx:247` — Sorunlu kod: `<div className="flex items-end gap-1">` (textarea + ~9 aksiyon). Neden: her buton `h-9 w-9`; wrap yok → 9 buton ≈ 324px zaten 320px'i aşar, textarea sıkışır. Öneri: aksiyon kümesini `flex-wrap` yap veya ikincil aksiyonları `max-sm:hidden` ile "daha fazla" menüsüne taşı; satırı `flex-col sm:flex-row`.
- **[X_OVERFLOW] [P1]** `features/messaging/components/MessageComposer.tsx:200` — Sorunlu kod: `<div className="mb-1.5 flex items-center gap-1">` (tab grubu + ayraç + 5 FmtBtn + EmojiPicker), wrap yok. Neden: dar ekranda biçim butonları taşar/kesilir. Öneri: `flex-wrap` veya FmtBtn grubunu `overflow-x-auto` sarmalayıcıya al.
- **[X_OVERFLOW] [P1]** `features/messaging/components/ChannelHeader.tsx:123-128` — Sorunlu kod: `{channel.externalOrgs.join(", ")}` Badge'de, `truncate`/`min-w-0` yok. Neden: çok org adı başlık kimlik bloğunu iterek taşma yapar. Öneri: Badge içeriğine `max-w-[12ch] truncate inline-block` veya rozeti `hidden md:flex`.
- **[V_CLIP] [P1]** `features/messaging/MailInbox.tsx:251-468` — Sorunlu kod: MailInbox kökü kendi `overflow-y-auto`+`min-h-0` kabını sağlamıyor; toolbar+tablar+tablo+footer doğrudan `<main overflow-hidden>` içine düşüyor. Neden: mobilde alta scroll olmaz, footer/son satırlar kırpılır. Öneri: en dış sarmalayıcı `flex h-full min-h-0 flex-col`, tablo bölümü `flex-1 min-h-0 overflow-y-auto`.
- **[V_CLIP] [P1]** `features/messaging/MailInbox.tsx:505` — Sorunlu kod: `MessageRead` kökü `<div className="flex flex-col ...">`, `h-full`/`overflow-y-auto`/`min-h-0` yok. Neden: uzun e-posta gövdesi taşınca scroll edilemez, alt aksiyonlar erişilemez. Öneri: kök `flex h-full min-h-0 flex-col`, gövde (satır 568) `flex-1 min-h-0 overflow-y-auto`.
- **[SIZING] [P2]** `features/messaging/components/MessagingSidebar.tsx:208` — Sorunlu kod: `<nav className="flex w-64 shrink-0 ...">`. Neden: CommunitiesBar (`w-14`=56px) + sidebar (`w-64`=256px) = 312px; 320px'de konuşma paneline ~8px kalır. `useIsMobile` mobilde tek panele geçiriyor (kurtarıyor) ama eşik <320px'i kapsamazsa risk sürer. Öneri: `w-64 max-[360px]:w-56` veya eşiği doğrula.
- **[X_OVERFLOW] [P2]** `features/messaging/components/MessageBubble.tsx:144` & `rich.tsx:10` — Sorunlu kod: `RichText` `<span>`'inde uzun URL için `break-words` yok; baloncuk `max-w-[80%]`. Neden: boşluksuz uzun URL baloncuğu genişletip taşırır. Öneri: RichText `<span>`'ine `break-words`.
- **[X_OVERFLOW] [P2]** `features/messaging/MailRead.tsx:213` & `MailReply.tsx:213` — Sorunlu kod: `w-[360px]` sabit detay dropdown'u. Neden: 320px'de viewport'u aşar. (Not: bu iki dosya import edilmiyor — ölü kod, bu yüzden P2.) Öneri: `w-[min(360px,90vw)]`.
- **[TYPO] [P2]** `features/messaging/MailInbox.tsx:570` — Sorunlu kod: `<h1 className="text-2xl ...">{subject}`, responsive küçültme/`break-words` yok. Neden: mobilde uzun konu çok büyük, yanındaki yıldız butonuyla sıkışır. Öneri: `text-lg sm:text-2xl break-words`.

**Özet:** P0=1, P1=4, P2=4 (toplam 9 bulgu)

---

## Meetings & Webinar

- **[X_OVERFLOW] [P0]** `features/meetings/MeetingLobbyPage.tsx:300` — Sorunlu kod: `mx-auto h-auto w-[512px] ... lg:w-full`. Neden: sabit 512px video önizleme; `lg:w-full` ancak 1024px'te, 320–1023px taşar. Öneri: `w-full md:w-[512px]` (veya `w-full max-w-[512px]`).
- **[X_OVERFLOW] [P0]** `features/meetings/MeetingLobbyPage.tsx:303` — Sorunlu kod: `relative mx-auto flex aspect-video w-[512px] ... lg:w-full`. Neden: aynı sorun, fallback avatar kutusu. Öneri: `w-full md:w-[512px]`.
- **[X_OVERFLOW] [P1]** `features/meetings/components/Stage.tsx:130` — Sorunlu kod: `grid h-full grid-cols-2 ... sm:grid-cols-3`. Neden: mobil-öncelik yok; 320px'de 2 sütun, tile'lar çok darlaşır. Öneri: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`.
- **[V_CLIP] [P1]** `features/webinar/components/EventManager.tsx:142` — Sorunlu kod: `h-[13rem] overflow-y-auto ... lg:h-[6.25rem]`. Neden: sabit yükseklik; `lg:h-[6.25rem]` masaüstünde içeriği agresif kırpar. Öneri: `max-h-[13rem] lg:max-h-[6.25rem]` veya flex + `min-h-0`.
- **[SIZING] [P1]** `features/webinar/components/EventLive.tsx:32` — Sorunlu kod: `h-[58vh]`. Neden: sabit vh; 320px'de altındaki CaptionsLayer/QnaBoard'a yer bırakmayabilir. Öneri: `min-h-[20rem] lg:h-[58vh]` veya `flex-1 min-h-0`.
- **[SIZING] [P2]** `features/meetings/MeetingRoomPage.tsx:727,800,852` — Sorunlu kod: `w-80 h-[calc(100vh-4rem)] overflow-y-auto` (3 drawer). Neden: 320px'de `w-80` tüm genişliği kaplar; tam-ekran davranışı doğrulanmalı. Öneri: `w-full max-w-xs` veya `w-[min(20rem,100vw)]`.
- **[X_OVERFLOW] [P2]** `features/meetings/components/ControlBar.tsx:109` — Sorunlu kod: reaction grubu `inline-flex ... gap-1 ... px-1` (butonlar `min-w-11`), grup wrap'siz. Neden: kök bar `flex-wrap` olsa da emoji grubu kendi içinde sarılmaz; 320px'de taşırabilir. Öneri: gruba `flex-wrap` veya fazla emojilere `hidden sm:inline-flex`.
- **[X_OVERFLOW] [P2]** `features/webinar/components/RegistrationBuilder.tsx:79` — Sorunlu kod: `className="w-44"` (flex içi Select). Neden: sabit 176px, responsive önek yok. Öneri: `w-full sm:w-44`.
- **[TYPO] [P2]** `features/webinar/components/EventManager.tsx:156` — Sorunlu kod: `text-[0.9375rem] font-semibold` (oturum başlığı). Neden: sabit 15px; uzun başlıklar 320px'de taşma/sarma. Öneri: `text-sm sm:text-[0.9375rem]` + `line-clamp-2`/`truncate`.

> **Elenen false-positive:** `AnalyticsTab.tsx:28` `grid ... sm:grid-cols-[auto_1fr]` temizdir — varsayılan `grid-cols` olmadığı için mobilde tek sütuna yığılır.

**Özet:** P0=2, P1=3, P2=4 (toplam 9 bulgu)

---

## Phone & Support

- **[V_CLIP] [P0]** `features/phone/MessagesPane.tsx:86` — Sorunlu kod: `messages-pane mx-auto flex h-full w-full max-w-5xl gap-4 p-4`. Neden: kök `overflow-y-auto`+`min-h-0` sağlamıyor; `<main overflow-hidden>` içinde thread/composer mobilde kayamıyor. Öneri: köke `min-h-0` + `flex flex-col gap-4 md:flex-row`.
- **[X_OVERFLOW] [P0]** `features/phone/MessagesPane.tsx:86-87` — Sorunlu kod: kök `flex ... gap-4` + `aside` `flex w-full max-w-xs shrink-0`. Neden: thread listesi (`max-w-xs`=320px) + sohbet 320px'de yan yana sığmaz, `shrink-0`. Öneri: `md:flex-row` ile yığ; mobilde aktif thread varken sohbeti, yoksa listeyi göster (Support'taki `mobilePane` deseni gibi).
- **[V_CLIP] [P1]** `features/phone/KeypadPanel.tsx:30` — Sorunlu kod: `mx-auto flex h-full w-full max-w-5xl flex-col gap-6 p-4 lg:flex-row`. Neden: `h-full` + `overflow-y-auto`/`min-h-0` yok; dialer + uzun geçmiş mobilde taşınca scroll olmaz (diğer telefon panellerinde var, keypad'de eksik). Öneri: `overflow-y-auto min-h-0` ekle.
- **[X_OVERFLOW] [P1]** `features/phone/AttendantConsole.tsx:44` — Sorunlu kod: `<Select ... className="w-56" />`. Neden: sabit 14rem; 320px'de dar alanda kırpılma/taşma. Öneri: `w-full max-w-[14rem]` veya `min-w-0 flex-1`.
- **[X_OVERFLOW] [P2]** `features/phone/WrapUpCard.tsx:46` — Sorunlu kod: `<Select ... className="w-44" />` (`flex flex-wrap` satırında). Neden: `flex-wrap` taşmayı önler ama fixed-bottom kartta 320px'de sıkışık. Öneri: `w-full sm:w-44`.
- **[X_OVERFLOW] [P2]** `features/phone/ReceptionistBuilder.tsx:142` — Sorunlu kod: `<input ... className="input w-28" />` (Select `flex-1` ile aynı satırda). Neden: 320px'de sınırda. Öneri: input'a `min-w-0` veya `w-24`.
- **[X_OVERFLOW] [P2]** `features/support/components/ConversationView.tsx:123` — Sorunlu kod: `<Select ... className="w-40" />` (`flex flex-wrap` header). Neden: orta sütunda sabit `w-40` + 3 buton dar kalır (Inbox masaüstü-only, düşük öncelik). Öneri: `w-full sm:w-40`.
- **[X_OVERFLOW] [P2]** `features/support/components/FlowBuilder.tsx:54` & `CostPanel.tsx:51` & `WorkforceView.tsx:160` — Sorunlu kod: sabit `w-48`/`w-28`/`w-20` Select'ler (`flex-wrap` satırlarda). Neden: sarılır, taşma değil ama 320px'de sıkışma. (WorkforceView tablosu `overflow-x-auto` ile doğru sarılı.) Öneri: gerekirse `max-w-full`.

**Özet:** P0=2, P1=2, P2=4 (toplam 8 bulgu)

---

## Docs / Admin / Appointments / Booking / Tasks

- **[V_CLIP] [P0]** `features/tasks/KanbanBoard.tsx:247-451` (TasksPage.tsx:9) — Sorunlu kod: KanbanBoard kökü Fragment (`<>…</>`), hiç `overflow-y-auto`+`min-h-0` yok. Neden: `<main overflow-hidden>` içinde uzun board'da mobilde alta scroll OLMAZ, içerik kırpılır. (Diğer sayfalar — DocsPage:64, AdminPage:544, AppointmentsPage:94, BookingPage:611 — `flex-1 overflow-y-auto` sağlıyor; Tasks sağlamıyor.) Öneri: en dış sarmalayıcı `flex h-full flex-col`, board `flex-1 overflow-y-auto min-h-0`.
- **[X_OVERFLOW] [P1]** `features/appointments/components/AvailabilityEditor.tsx:61` — Sorunlu kod: `<li className="flex items-center gap-2 text-sm">` (flex-wrap YOK). Neden: `w-28` etiket + iki `type="time"` input (native kontroller ~110-130px altına sıkışmaz) + tire; 320px'de (mobilde tek sütun Card içi ~256-288px) satır taşar ve sarmaz. (Karşı örnek `BookingPage.tsx:480` aynı düzeni `flex-wrap` + `w-full sm:w-44` ile doğru yapıyor.) Öneri: `flex flex-wrap`, etiket `w-full sm:w-28`.
- **[X_OVERFLOW] [P2]** `features/appointments/components/AvailabilityEditor.tsx:67` — Sorunlu kod: `<span className="flex items-center gap-1.5">` içinde iki `input h-10` (`w-full`). Neden: üst satır sarsa bile iki time input yan yana kalır; çok dar ekranda intrinsic min-width taşırır. Öneri: iç gruba `min-w-0 flex-1`, her input'a `min-w-0`.
- **[SIZING] [P2]** `features/appointments/AppointmentsPage.tsx:95` — Sorunlu kod: `<div className="mx-auto max-w-6xl space-y-4 p-6">`. Neden: 320px'de sabit `p-6` içeriği gereksiz kısar (diğer sayfalar `p-4 md:p-6`). Öneri: `p-4 md:p-6`.
- **[X_OVERFLOW] [P2]** `features/docs/components/GanttView.tsx:71` — Sorunlu kod: `grid grid-cols-[7rem_1fr]`. Neden: 320px'de sabit `7rem` etiket sütunu + absolute bar etiketleri (`whitespace-nowrap`) yüksek `frac`'ta kulvardan taşabilir. Öneri: `grid-cols-[5rem_1fr] sm:grid-cols-[7rem_1fr]`; bar etiketine `max-w-[40%] truncate` veya lane'e `overflow-hidden`.

**Özet:** P0=1, P1=1, P2=3 (toplam 5 bulgu)

---

## Intelligence / Copilot / Canvas / Clips

> Bu alan çok temiz çıktı (grid'ler responsive, scroll kapları doğru, KPI sayıları `text-xl`). Yalnızca küçük bulgular.

- **[SIZING] [P2]** `features/copilot/CopilotPage.tsx:504` — Sorunlu kod: `fixed top-0 right-0 ... w-80 ...` (sohbet geçmişi drawer'ı). Neden: `w-80`=320px sabit; tam 320px viewport'ta kenar payı kalmaz, `p-4` ile sıkışır. Öneri: `w-80 max-w-[calc(100vw-2rem)]`.
- **[X_OVERFLOW] [P2]** `features/copilot/CopilotPage.tsx:724,755,767,804,...` — Sorunlu kod: ayar satırları `flex items-center gap-4 justify-between` (flex-wrap yok). Neden: dar modalda metin sütunu aşırı daralır, `<h6>` `truncate` taşımaz. Öneri: `flex-wrap` veya `flex-col sm:flex-row items-start sm:items-center`.
- **[X_OVERFLOW] [P2]** `features/canvas/BlockCard.tsx:73-155` — Sorunlu kod: başlık satırı `flex items-center gap-2` (tutamac + tip-pill + pin + 4 aksiyon, wrap yok). Neden: 320px'de uzun `types.*` etiketinde sığmayabilir. Öneri: tip-pill'e `min-w-0 truncate`, aksiyon grubuna `shrink-0`, gerekirse `flex-wrap`.
- **[X_OVERFLOW] [P2]** `features/canvas/CanvasPage.tsx:394` — Sorunlu kod: `grid grid-cols-3 gap-2` (Ekle modalında 6 blok-tipi, responsive önek yok). Neden: 320px'de 3 sütun dar, uzun çevirilerde sıkışır. Öneri: `grid-cols-2 sm:grid-cols-3`.

**Özet:** P0=0, P1=0, P2=4 (toplam 4 bulgu)

---

## App Shell & Navigation

> Çatı sağlam. Denetlenen sayfalar (Dashboard:123, Users:103, Settings:558) kendi `flex-1 overflow-y-auto` kabını doğru sağlıyor; Sidebar mobil drawer `w-64 max-w-[calc(86vw-4rem)]` ile 320px'de taşmıyor.

- **[X_OVERFLOW] [P1]** `components/layout/Topbar.tsx:11-15` — Sorunlu kod: `<header className="h-14 ... flex items-center gap-3 px-5 ...">` + `<h1 className="text-xl font-semibold text-ink">` (truncate yok). Neden: başlıkta `truncate`/`min-w-0` yok; uzun başlık + actions dar viewport'ta satırı taşırabilir. Öneri: `<h1>`'e `truncate min-w-0`, başlığı `<div className="min-w-0 flex-1">` ile sar, `text-lg sm:text-xl`.
- **[X_OVERFLOW] [P2]** `features/portal/PortalPage.tsx:29` — Sorunlu kod: PortalTopbar `flex items-center gap-3 px-4 md:px-6` (logo + badge + buton + ad + avatar), `flex-wrap`/`min-w-0` yok. Neden: 320px'de sıkışıp taşabilir (ad `hidden sm:inline` korunmuş, iyi). Öneri: badge'i `hidden sm:inline-flex` veya header'a `min-w-0` + butona `shrink-0`. (Not: `h-15` standart token değil.)
- **[V_CLIP] [P2]** `features/portal/PortalPage.tsx:214` — Sorunlu kod: `<div className="min-h-screen ...">` + akış içi topbar (sticky değil). Neden: gerçek kırpma yok (sayfa scroll'u çalışır), yalnızca UX notu — scroll'da topbar kaybolur. Öneri (opsiyonel): topbar'ı `sticky top-0 z-10`.

**Özet:** P0=0, P1=1, P2=2 (toplam 3 bulgu)

---

## Önerilen Düzeltme Sırası

1. **Sistemik primitive'ler (tek dokunuş, geniş etki):** `Modal.tsx` (max-h+scroll), `Dropdown.tsx` (max-h+scroll), `Tabs.tsx` (yatay scroll + `px-3 sm:px-4`), `Tooltip.tsx` (clamp + break-words).
2. **P0 scroll-kabı eksikleri (V_CLIP):** Tasks/KanbanBoard, Phone/MessagesPane, Phone/KeypadPanel, Messaging/MailInbox + MessageRead. Hepsinde aynı `flex h-full min-h-0 flex-col` + `flex-1 min-h-0 overflow-y-auto` deseni.
3. **P0 yatay taşmalar (X_OVERFLOW):** MeetingLobbyPage `w-[512px]`, MessageComposer aksiyon satırı, Phone/MessagesPane yan-yana yığma.
4. **P1'ler:** Stage grid, AvailabilityEditor flex-wrap, ChannelHeader badge, Topbar h1 truncate, EventManager/EventLive yükseklikler, AttendantConsole Select.
5. **P2'ler:** sabit `w-NN` Select/input'lar (`w-full sm:w-NN`), padding (`p-4 md:p-6`), TYPO clamp'leri, küçük grid responsive önekleri.

> **Doğrulama:** Düzeltmelerden sonra her sayfayı 320px / 375px / 768px / 1024px'te test et; `document.documentElement.scrollWidth > clientWidth` kontrolüyle yatay taşmayı tara. Sistemi bozmamak için önce primitive'leri düzelt, sonra her sayfayı tek tek doğrula.
