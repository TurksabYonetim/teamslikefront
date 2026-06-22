# Kod Kalitesi ve Tekrar Incelemesi

Kapsam: `src/features`, `src/components/ui`, `src/components/layout`, `src/lib` altindaki gercek dosyalar okundu. Feature klasorleri: `admin`, `appointments`, `auth`, `booking`, `canvas`, `clips`, `copilot`, `dashboard`, `docs`, `intelligence`, `meetings`, `messaging`, `phone`, `portal`, `settings`, `support`, `tasks`, `users`, `webinar`.

Kontrol notu: `npm run typecheck` calistirildi ve `tsc --noEmit` basarili dondu. Bu rapordaki "olu kod" bulgulari derleyici hatasi degil; calissa da davranissiz, ulasilamaz veya kalinti niteligindeki kodlardir.

## Bulgular

### 1. Tekrar / Orta - Ortak `Modal` varken feature icinde dialog kabuklari yeniden yazilmis

**Ilgili dosyalar**

- `src/components/ui/Modal.tsx:31`
- `src/features/meetings/MeetingLobbyPage.tsx:543`
- `src/features/meetings/MeetingLobbyPage.tsx:613`
- `src/features/clips/ClipPlayerModal.tsx:111`
- `src/features/phone/ContactsPanel.tsx:364`

**Kanita dayali alinti**

```tsx
// src/components/ui/Modal.tsx:31
<Overlay open={open} onClose={onClose}>
  <div role="dialog" aria-modal="true" ...>
```

```tsx
// src/features/meetings/MeetingLobbyPage.tsx:543
<Overlay open onClose={() => setReportOpen(false)} className="overflow-y-auto">
  <div role="dialog" aria-modal="true" className="relative max-h-full w-full max-w-lg ...">
```

```tsx
// src/features/clips/ClipPlayerModal.tsx:111
<Overlay open onClose={onClose}>
  <div role="dialog" aria-modal="true" aria-labelledby="clip-player-title" ...>
```

**Aciklama**

`Modal` zaten `Overlay`, `role="dialog"`, `aria-modal`, baslik, kapatma butonu, footer, scroll ve animasyon kabugunu tek yerde topluyor. Buna ragmen `MeetingLobbyPage` iki modal kabugunu, `ClipPlayerModal` video modal kabugunu, `ContactsPanel` detay modal kabugunu yeniden yaziyor. Bu hem stil/a11y farki uretir hem de overlay davranisi degistiginde tek noktadan duzeltmeyi engeller.

**Somut oneri**

`Modal` icin `bodyClassName`, `panelClassName`, `hideHeader`, `ariaLabelledBy`, `size="xl"` gibi kontrollu props eklenmeli. Video/ozel detay modallari bu parametrelerle `Modal` uzerinden kurulup sadece icerik render etmelidir.

### 2. Parametrizasyon Eksikligi / Orta - Messaging dialog formlari ayni footer/form yapisini elle tekrarliyor

**Ilgili dosyalar**

- `src/features/messaging/components/CreateChannelDialog.tsx:33`
- `src/features/messaging/components/NewDmDialog.tsx:25`
- `src/features/messaging/components/CreatePollDialog.tsx:53`
- `src/components/ui/Modal.tsx:54`

**Kanita dayali alinti**

```tsx
// src/features/messaging/components/CreateChannelDialog.tsx:63
<div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
  <Button onClick={submit} disabled={!name.trim()}>{t("create")}</Button>
</div>
```

```tsx
// src/features/messaging/components/NewDmDialog.tsx:55
<div className="flex justify-end gap-2">
  <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
  <Button onClick={submit} disabled={sel.length === 0}>...</Button>
</div>
```

**Aciklama**

Uc dialog da `Modal` kullaniyor ama ortak `footer` prop'unu kullanmak yerine aksiyon satirini body icinde yeniden ciziyor. Form alanlari da `label + input + validation-disabled submit` semasini ayri ayri tasiyor.

**Somut oneri**

`DialogForm` veya `ModalForm` wrapper'i eklenmeli: `title`, `onSubmit`, `onCancel`, `submitLabel`, `submitDisabled`, `children` props. Messaging dialoglari sadece alanlarini saglamali.

### 3. Parametrizasyon Eksikligi / Orta - Canvas ekle/duzenle/yeniden adlandir modallari ayni modal-form kabugunu tekrarliyor

**Ilgili dosyalar**

- `src/features/canvas/CanvasPage.tsx:374`
- `src/features/canvas/CanvasPage.tsx:450`
- `src/features/canvas/CanvasPage.tsx:499`

**Kanita dayali alinti**

```tsx
// src/features/canvas/CanvasPage.tsx:374
<Modal open={addOpen} onClose={() => setAddOpen(false)} title={t("addModal.title")} footer={...}>
```

```tsx
// src/features/canvas/CanvasPage.tsx:450
<Modal open={!!editing} onClose={() => setEditing(null)} title={t("editModal.title")} footer={...}>
```

```tsx
// src/features/canvas/CanvasPage.tsx:499
<Modal open={renameOpen} onClose={() => setRenameOpen(false)} title={t("renameModal.title")} footer={...}>
```

**Aciklama**

Uc modalin iptal/kaydet footer'i ve `label + input/textarea` yapisi ayni paternde. Yeni alan eklendikce `CanvasPage` buyuyor ve modal form davranisi feature icine gomuluyor.

**Somut oneri**

Canvas icinde `CanvasBlockFormModal` ve `RenameBoardModal`, ya da daha genelde `ModalForm` kullanilmali. Footer ve submit state'i ortak wrapper'a tasinmali.

### 4. Tekrar / Orta - Auth form state, bind ve email dogrulama mantigi iki sayfada kopya

**Ilgili dosyalar**

- `src/features/auth/LoginPage.tsx:11`
- `src/features/auth/LoginPage.tsx:23`
- `src/features/auth/LoginPage.tsx:49`
- `src/features/auth/SignupPage.tsx:11`
- `src/features/auth/SignupPage.tsx:41`
- `src/features/auth/SignupPage.tsx:70`

**Kanita dayali alinti**

```tsx
// src/features/auth/LoginPage.tsx:11
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

```tsx
// src/features/auth/SignupPage.tsx:11
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

```tsx
// src/features/auth/LoginPage.tsx:49
const bind = (key: keyof typeof form) => ({ ... onChange: ... error: errors[key] });
```

```tsx
// src/features/auth/SignupPage.tsx:70
const bind = (key: keyof Form) => ({ ... onChange: ... error: errors[key] });
```

**Aciklama**

Email regex, `errors/touched` state'i, `bind` helper'i ve submit-on-validate akisi neredeyse ayni. Yeni auth formu geldikce ayni validation boilerplate'i buyuyecek.

**Somut oneri**

`src/features/auth/auth.validation.ts` icine `EMAIL_RE`, `validateLogin`, `validateSignup`, `slugifyTenant` tasinmali. UI tarafinda `useFormErrors<T>()` gibi kucuk hook ile `bind`, `clearError`, `setTouched` tek yerde toplanmali.

### 5. Tekrar / Orta - Tarih/saat formatlama tum feature'lara dagilmis

**Ilgili dosyalar**

- `src/features/admin/AdminPage.tsx:35`
- `src/features/admin/AuditLogDetail.tsx:7`
- `src/features/appointments/components/BookingsCalendar.tsx:57`
- `src/features/booking/BookingPage.tsx:590`
- `src/features/dashboard/dashboard.derive.ts:65`
- `src/features/intelligence/IntelligencePage.tsx:303`
- `src/features/portal/portal.ui.ts:25`
- `src/features/settings/SettingsPage.tsx:84`
- `src/features/webinar/components/EventBuilder.tsx:88`

**Kanita dayali alinti**

```tsx
// src/features/admin/AdminPage.tsx:35
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
```

```tsx
// src/features/admin/AuditLogDetail.tsx:7
function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}
```

```tsx
// src/features/portal/portal.ui.ts:25
export function fmtTime(iso?: string | null) {
  ...
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
```

**Aciklama**

Formatlama ayni isi farkli locale, fallback ve invalid-date davranislariyla yapiyor. Bu hem tekrar hem de UX tutarsizligi: bazi yerler `"—"`, bazi yerler `""`, bazi yerler `iso`, bazi yerler browser locale kullaniyor.

**Somut oneri**

`src/lib/dateFormat.ts` olusturulup `formatDate`, `formatDateTime`, `formatTime`, `formatRelativeDayTime`, `toDateInput`, `toTimeInput` gibi fonksiyonlar eklenmeli. Feature'lar locale ve fallback'i parametre gecmeli.

### 6. Tekrar / Orta - Store update paternleri her feature'da elle yaziliyor

**Ilgili dosyalar**

- `src/features/messaging/store.ts:115`
- `src/features/messaging/store.ts:258`
- `src/features/phone/pbxStore.ts:36`
- `src/features/docs/workspace.store.ts:107`
- `src/features/docs/workspace.store.ts:196`
- `src/features/appointments/appointments.store.ts:60`
- `src/features/webinar/polls.store.ts:29`
- `src/features/admin/governance.store.ts:112`

**Kanita dayali alinti**

```ts
// src/features/messaging/store.ts:115
const patch = (id: string, fn: (m: Message) => Message) =>
  set((s) => ({ messages: s.messages.map((m) => (m.id === id ? fn(m) : m)) }));
```

```ts
// src/features/phone/pbxStore.ts:36
const patchQueue = (queueId: string, fn: (q: CallQueue) => CallQueue) =>
  set((st) => ({ queues: st.queues.map((q) => (q.id === queueId ? fn(q) : q)) }));
```

```ts
// src/features/appointments/appointments.store.ts:60
updateEventType: (id, patch) =>
  set((s) => ({ eventTypes: s.eventTypes.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
```

**Aciklama**

`map by id`, `filter by id`, `append`, `toggle in array`, `commit + persist` gibi operasyonlar store dosyalarinda surekli elle tekrar ediyor. Bu yapilar hem hata riskini artiriyor hem de store dosyalarini domain davranisindan cok immutable-array mekanigiyle dolduruyor.

**Somut oneri**

`src/lib/storeArray.ts` eklenmeli: `updateById`, `removeById`, `toggleInArray`, `appendUnique`, `patchCollection`. `createStore` icin opsiyonel `withCommit(persist)` yardimcisi dusunulmeli.

### 7. Tekrar / Dusuk - localStorage tabanli mock CRUD iki farkli soyutlamaya bolunmus

**Ilgili dosyalar**

- `src/lib/mockStore.ts:55`
- `src/lib/useLocalCrud.ts:96`
- `src/features/copilot/copilot.api.ts:20`
- `src/features/copilot/copilot.api.ts:50`

**Kanita dayali alinti**

```ts
// src/lib/mockStore.ts:55
export function createMockStore<T extends MockEntity, C, U>(opts: StoreOptions<T, C, U>)
```

```ts
// src/lib/useLocalCrud.ts:96
export function useLocalCrud<T extends WithId>(storageKey: string, seed: T[] = [])
```

```ts
// src/features/copilot/copilot.api.ts:20
const CONV_KEY = "tl_mock_copilot_conversations";
const MSG_KEY = "tl_mock_copilot_messages";
```

**Aciklama**

Mock API CRUD, local hook CRUD ve Copilot'in kendi localStorage API'si ayni persistence alanini farkli sekillerde cozmeye calisiyor. `mockStore` Promise tabanli, `useLocalCrud` hook tabanli, Copilot ise ozel read/write ile ilerliyor.

**Somut oneri**

Tek bir `localRepository` katmani kurulup Promise API ve hook API onun uzerinden uretilmeli. Copilot gibi iliskili entity'ler icin repository transaction/seed desteklemeli.

### 8. Parametrizasyon Eksikligi / Orta - Loading/error/empty state bloklari sayfa sayfa yeniden yazilmis

**Ilgili dosyalar**

- `src/features/canvas/CanvasPage.tsx:301`
- `src/features/users/UsersPage.tsx:148`
- `src/features/portal/PortalChatPage.tsx:141`
- `src/features/portal/PortalChatPage.tsx:267`
- `src/features/meetings/MeetingsPage.tsx:371`
- `src/features/settings/SettingsPage.tsx:95`
- `src/features/dashboard/DashboardPage.tsx:219`

**Kanita dayali alinti**

```tsx
// src/features/canvas/CanvasPage.tsx:301
{isLoading && <div className="space-y-4">{Array.from({ length: 4 }).map(...}</div>}
{isError && !isLoading && <EmptyState ... />}
{!isLoading && !isError && list.length === 0 && <EmptyState ... />}
```

```tsx
// src/features/users/UsersPage.tsx:148
{isLoading && <div className="p-4 flex flex-col gap-3" aria-busy="true">...</div>}
{isError && <EmptyState ... />}
{showList && !hasUsers && <EmptyState ... />}
{showList && hasUsers && filtered.length === 0 && <EmptyState ... />}
```

**Aciklama**

Projede `EmptyState`, `Skeleton`, `SkeletonText` var; fakat query state orchestration her sayfada tekrar yaziliyor. Bu ozellikle retry action, `aria-busy`, empty vs no-result ayrimi ve skeleton adetleri icin tutarsizlik uretiyor.

**Somut oneri**

`QueryState` veya `AsyncListState` component'i eklenmeli: `isLoading`, `isError`, `error`, `isEmpty`, `isFilteredEmpty`, `onRetry`, `skeleton`, `children` props. Sayfalar sadece layout ozel skeleton veya empty metni vermeli.

### 9. Parametrizasyon Eksikligi / Orta - Tablo/liste responsive render'i iki kez yaziliyor

**Ilgili dosyalar**

- `src/features/users/UsersPage.tsx:206`
- `src/features/users/UsersPage.tsx:267`
- `src/features/docs/components/TableGridView.tsx:156`
- `src/features/docs/components/TableGridView.tsx:236`

**Kanita dayali alinti**

```tsx
// src/features/users/UsersPage.tsx:206
{/* Masaustu tablo */}
{showList && filtered.length > 0 && (
  <div className="hidden md:block overflow-x-auto">
```

```tsx
// src/features/docs/components/TableGridView.tsx:156
<div className="md:hidden">
  <ul className="tl-stagger max-h-[24rem] ...">
```

```tsx
// src/features/docs/components/TableGridView.tsx:236
<div className="hidden overflow-x-auto md:block">
  <table className="w-full min-w-[36rem] ...">
```

**Aciklama**

Mobil kart/accordion ve desktop tablo ayni satir verisini iki ayri JSX agacinda render ediyor. Bu durum aksiyonlar, label'lar, delete butonlari ve hucre render mantiginin iki yerde guncellenmesine yol acar.

**Somut oneri**

`ResponsiveDataList<T>` veya `DataTable<T>` component'i tasarlanmalı: `columns`, `rowKey`, `renderCell`, `renderMobileSummary`, `actions` props. `UsersPage` ve `TableGridView` ayni primitive'i kullanmali.

### 10. Performans / Orta - Dashboard turetilmis verileri her render'da yeniden hesaplaniyor

**Ilgili dosyalar**

- `src/features/dashboard/DashboardPage.tsx:86`
- `src/features/dashboard/DashboardPage.tsx:87`
- `src/features/dashboard/DashboardPage.tsx:88`
- `src/features/dashboard/DashboardPage.tsx:89`
- `src/features/dashboard/DashboardPage.tsx:90`
- `src/features/dashboard/DashboardPage.tsx:91`

**Kanita dayali alinti**

```tsx
// src/features/dashboard/DashboardPage.tsx:86
const inputs = { users, appointments, meetings, conversations };
const stats = deriveStats(inputs);
const upcomingMeetings = deriveUpcomingMeetings(meetings);
const team = deriveTeam(users);
const recentBookings = deriveBookings(appointments);
const activity = deriveActivity(inputs);
```

**Aciklama**

`derive*` fonksiyonlari filtre/sort/map islemleri yapiyor (`dashboard.derive.ts:159`, `dashboard.derive.ts:218`, `dashboard.derive.ts:254`). Dashboard'da herhangi bir local state veya parent render'i bu hesaplari tekrar calistirir.

**Somut oneri**

`inputs` ve turevler `useMemo` ile sarilmali veya `useDashboardData` hook'u icinde memoize edilmis selector seklinde donmeli.

### 11. Performans / Orta - `TableGridView` hesaplama ve handlerlari render sirasinda yeniden uretiyor

**Ilgili dosyalar**

- `src/features/docs/components/TableGridView.tsx:61`
- `src/features/docs/components/TableGridView.tsx:63`
- `src/features/docs/components/TableGridView.tsx:67`
- `src/features/docs/components/TableGridView.tsx:158`
- `src/features/docs/components/TableGridView.tsx:264`

**Kanita dayali alinti**

```tsx
// src/features/docs/components/TableGridView.tsx:61
const colMax = numericMaxByColumn(table);
const cell = (row: TableRow, col: TableColumn) => {
  const onChange = (val: string) => editCell(table.id, row.id, col.id, val);
  if (col.type === "formula") {
    const out = computeCell(table, row, col);
```

```tsx
// src/features/docs/components/TableGridView.tsx:264
{table.rows.map((r) => (
  ...
  {table.columns.map((c) => (
    <td ...>{cell(r, c)}</td>
```

**Aciklama**

`numericMaxByColumn(table)` her render'da tum sayisal/formul kolonlari icin tum satirlari geziyor. `cell` fonksiyonu ve hucre `onChange` closure'lari da her render'da her hucre icin yeniden uretiliyor. Formul kolonlarinda `computeCell` hem `numericMaxByColumn` icinde hem hucre render'inda tekrar cagirilabiliyor.

**Somut oneri**

`colMax`, `titleCol`, `metricCol`, totals ve `cellRenderer` `useMemo`/`useCallback` ile baglanmali. Formul sonuclari `Map<rowId:colId, value>` olarak bir kez hesaplanip hem max hem cell icin kullanilmali.

### 12. Performans / Orta - Gantt/Hill gorunumlerinde gruplama O(k*n) filtrelerle render icinde yapiliyor

**Ilgili dosyalar**

- `src/features/docs/components/GanttView.tsx:46`
- `src/features/docs/components/GanttView.tsx:47`
- `src/features/docs/components/GanttView.tsx:52`
- `src/features/docs/components/HillView.tsx:37`
- `src/features/docs/components/HillView.tsx:39`
- `src/features/docs/components/HillView.tsx:41`

**Kanita dayali alinti**

```tsx
// src/features/docs/components/GanttView.tsx:46
for (const opt of order) {
  const rows = table.rows.filter((r) => (r.cells[statusCol.id] ?? "") === opt);
```

```tsx
// src/features/docs/components/HillView.tsx:39
const dist = options.map((opt) => ({
  n: table.rows.filter((r) => (r.cells[statusCol!.id] ?? "") === opt).length,
```

**Aciklama**

Her durum secenegi icin `table.rows.filter` calisiyor. Buyuk tabloda durum sayisi arttikca render maliyeti `options * rows` olur. Ayrica `Map` ve `curve` de her render'da yeniden uretiliyor.

**Somut oneri**

`useMemo` ile tek gecisli `groupRowsByStatus(table.rows, statusCol)` helper'i kullanilmali. Hill dagilimi de ayni map'ten turetilmeli.

### 13. Performans / Orta - Tasks kanban kolonlari icin ayni liste tekrar filtrelenip siralaniyor

**Ilgili dosyalar**

- `src/features/tasks/KanbanBoard.tsx:285`
- `src/features/tasks/KanbanBoard.tsx:286`
- `src/features/tasks/KanbanBoard.tsx:287`
- `src/features/tasks/KanbanBoard.tsx:295`
- `src/features/tasks/KanbanBoard.tsx:391`

**Kanita dayali alinti**

```tsx
// src/features/tasks/KanbanBoard.tsx:286
const visibleTasks = (status: TaskStatus) =>
  tasks
    .filter((tk) => tk.status === status)
    .filter(...)
    .sort((a, b) => a.position - b.position);
```

```tsx
// src/features/tasks/KanbanBoard.tsx:391
{COLUMNS.map((column, colIndex) => {
  const cards = visibleTasks(column.status);
```

**Aciklama**

Her kolon render'inda tum `tasks` dizisi filtrelenip siralaniyor. Kolon sayisi sabit olsa bile arama, modal state'i veya toast kaynakli render'larda ayni is tekrar eder.

**Somut oneri**

`useMemo` ile `Record<TaskStatus, Task[]>` hazirlanmali. Tek geciste status'a gore bucket edip her bucket'i siralamak yeterli.

### 14. Performans / Orta - Messaging composer onerileri ve sayaclari render icinde filtreleniyor

**Ilgili dosyalar**

- `src/features/messaging/components/MessageComposer.tsx:61`
- `src/features/messaging/components/MessageComposer.tsx:65`
- `src/features/messaging/components/MessageComposer.tsx:71`
- `src/features/messaging/components/MessageComposer.tsx:89`
- `src/features/messaging/components/MessageComposer.tsx:90`

**Kanita dayali alinti**

```tsx
// src/features/messaging/components/MessageComposer.tsx:65
const mentionMatches =
  mentionToken !== null
    ? MEMBERS.filter((mm) => mm.name.toLowerCase().includes(mentionToken.toLowerCase())).slice(0, 6)
    : [];
```

```tsx
// src/features/messaging/components/MessageComposer.tsx:90
const scheduledCount = messages.filter((m) => m.topicId === activeTopicId && m.scheduled).length;
```

**Aciklama**

Her tus vurusunda component render olur; mention/slash aramalari, reply target lookup ve scheduled count yeniden hesaplanir. `MEMBERS` kucuk olsa da `messages` buyudukce composer typing maliyeti artar.

**Somut oneri**

`mentionMatches`, `slashMatches`, `replyTarget`, `scheduledCount` `useMemo` ile baglanmali. `messages` icin topic bazli selector veya store tarafinda indeks dusunulmeli.

### 15. Performans / Dusuk - SavedDrawer her kaydedilen mesaj icin channel/topic lineer ariyor

**Ilgili dosyalar**

- `src/features/messaging/components/SavedDrawer.tsx:13`
- `src/features/messaging/components/SavedDrawer.tsx:31`
- `src/features/messaging/components/SavedDrawer.tsx:32`
- `src/features/messaging/components/SavedDrawer.tsx:33`

**Kanita dayali alinti**

```tsx
// src/features/messaging/components/SavedDrawer.tsx:13
const saved = messages.filter((m) => m.saved && !m.deleted);
```

```tsx
// src/features/messaging/components/SavedDrawer.tsx:31
{saved.map((m) => {
  const ch = channels.find((c) => c.id === m.channelId);
  const tp = topics.find((x) => x.id === m.topicId);
```

**Aciklama**

`saved.map` icinde `channels.find` ve `topics.find` calisiyor. Bu `saved * (channels + topics)` maliyeti yaratir ve modal acikken her store update'inde tekrar eder.

**Somut oneri**

`channelById` ve `topicById` map'leri `useMemo` ile hazirlanmali. Daha iyi cozum: store selector'i `savedMessagesWithContext` donmeli.

### 16. Performans / Orta - Support conversation list filtre zinciri render icinde maliyetli arama yapiyor

**Ilgili dosyalar**

- `src/features/support/components/ConversationList.tsx:29`
- `src/features/support/components/ConversationList.tsx:30`
- `src/features/support/components/ConversationList.tsx:34`
- `src/features/support/components/ConversationList.tsx:51`

**Kanita dayali alinti**

```tsx
// src/features/support/components/ConversationList.tsx:30
const list = conversations
  .filter(...)
  .filter(...)
  .filter(...)
  .filter((c) => !q || contactName(c.contactId).toLowerCase().includes(q) || c.messages.some(...));
```

**Aciklama**

Her render'da tum conversation listesi dort kez filtreleniyor; son filtrede her conversation icin `contactName` ve `messages.some` calisiyor. Liste buyudukce arama input'u en hassas yuzey olur.

**Somut oneri**

`useMemo` ile filtre sonucunu `conversations`, filtreler ve `q` degisince hesaplayin. Search icin normalize edilmis `contactName`, son mesaj ve tum metin cache'i store veya selector seviyesinde tutulabilir.

### 17. Performans / Dusuk - Phone voicemail listesi her render'da sort/filter yapiyor

**Ilgili dosyalar**

- `src/features/phone/VoicemailInbox.tsx:33`
- `src/features/phone/VoicemailInbox.tsx:34`
- `src/features/phone/VoicemailInbox.tsx:67`

**Kanita dayali alinti**

```tsx
// src/features/phone/VoicemailInbox.tsx:33
const sorted = [...voicemails].sort((a, b) => b.receivedAt - a.receivedAt);
const unheard = voicemails.filter((v) => !v.heard).length;
```

```tsx
// src/features/phone/VoicemailInbox.tsx:67
{sorted.map((vm) => (
```

**Aciklama**

Open/close state, greeting draft veya saved toast state'i degistiginde voicemail siralama ve unread sayimi yeniden yapiliyor.

**Somut oneri**

`sorted` ve `unheard` `useMemo([voicemails])` icine alinmali.

### 18. Performans / Orta - Public booking takvimi render icinde tarih objeleri uretiyor

**Ilgili dosyalar**

- `src/features/booking/PublicBookingPage.tsx:91`
- `src/features/booking/PublicBookingPage.tsx:94`
- `src/features/booking/PublicBookingPage.tsx:272`
- `src/features/booking/PublicBookingPage.tsx:273`
- `src/features/booking/PublicBookingPage.tsx:275`

**Kanita dayali alinti**

```tsx
// src/features/booking/PublicBookingPage.tsx:272
{Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
  const wd = jsToWeekday(new Date(viewYear, viewMonth, d).getDay());
  const isPast =
    new Date(viewYear, viewMonth, d) <
    new Date(now.getFullYear(), now.getMonth(), now.getDate());
```

**Aciklama**

Her render'da ay gunleri, weekday ve past kontrolu yeniden uretiliyor. Form input state'i (`name`, `email`, `error`) degisse bile takvim hesaplari tekrar calisir.

**Somut oneri**

`calendarDays` `useMemo([viewYear, viewMonth, openWeekdays])` ile `{ day, wd, isPast, has }` olarak hazirlanmali. `todayStart` da render basina degil memo/constant olarak tutulmali.

### 19. Performans / Dusuk - AvailabilityEditor slotlari iki kez filtreliyor ve tarih formatlarini render'da uretiyor

**Ilgili dosyalar**

- `src/features/appointments/components/AvailabilityEditor.tsx:81`
- `src/features/appointments/components/AvailabilityEditor.tsx:82`
- `src/features/appointments/components/AvailabilityEditor.tsx:83`
- `src/features/appointments/components/AvailabilityEditor.tsx:89`

**Kanita dayali alinti**

```tsx
// src/features/appointments/components/AvailabilityEditor.tsx:81
const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
const morningSlots = slots.filter((s) => new Date(s.startMs).getHours() < 12);
const afternoonSlots = slots.filter((s) => new Date(s.startMs).getHours() >= 12);
```

**Aciklama**

Ayni `slots` dizisi sabah/ogleden sonra icin iki kez geziyor; her elemanda `new Date` uretiliyor. `prettyDate` de her render'da hesaplanıyor.

**Somut oneri**

Tek `useMemo` icinde slotlari `{ morning, afternoon }` olarak bucket edin. `Intl.DateTimeFormat` instance'i locale ile memoize edilmeli.

### 20. Performans / Dusuk - Webinar registration field state'i aktif event degisimine bagli degil

**Ilgili dosyalar**

- `src/features/webinar/components/RegistrationBuilder.tsx:18`
- `src/features/webinar/components/RegistrationBuilder.tsx:22`
- `src/features/webinar/components/RegistrationBuilder.tsx:64`
- `src/features/webinar/components/RegistrationBuilder.tsx:185`

**Kanita dayali alinti**

```tsx
// src/features/webinar/components/RegistrationBuilder.tsx:18
const event = useStore(webinarStore, (s) => s.events.find((e) => e.id === s.activeEventId)!);
const [fields, setFields] = useState<RegField[]>(() => [...event.registrationFields]);
```

**Aciklama**

`fields` sadece ilk mount'ta aktif event'ten kopyalaniyor. Aktif event degisirse `event` selector'i yeni deger getirir ama local `fields` eski event'in alanlari olarak kalir. Bu kalite sorunu performanstan cok state tutarliligi riskidir.

**Somut oneri**

Aktif event id degisiminde `fields`, `values`, `errors` resetlenmeli veya component `key={event.id}` ile remount edilmeli. Non-null `!` yerine bos state handle edilmeli.

### 21. Olu Kod / Dusuk - `ContactsPanel` icinde `return` sonrasi ulasilamaz kod var

**Ilgili dosyalar**

- `src/features/phone/ContactsPanel.tsx:450`
- `src/features/phone/ContactsPanel.tsx:460`
- `src/features/phone/ContactsPanel.tsx:463`

**Kanita dayali alinti**

```tsx
// src/features/phone/ContactsPanel.tsx:450
<ConfirmDialog ... />
</div>
);

return renderContacts();
```

**Aciklama**

`return (` ile JSX donulduktan sonra `return renderContacts();` satiri calisamaz. TypeScript typecheck temiz geciyor ama kod okuyucu icin yaniltici ve eski refactor kalintisi izlenimi veriyor.

**Somut oneri**

`return renderContacts();` satiri kaldirilmali. Eger `renderContacts` wrapper olarak kalacaksa komponentin tek return'u o fonksiyona tasinmali.

### 22. Olu Kod / Orta - MailRead/MailReply icinde davranissiz `href="#"` aksiyonlari ve Flowbite kopya toolbar var

**Ilgili dosyalar**

- `src/features/messaging/MailRead.tsx:4`
- `src/features/messaging/MailRead.tsx:20`
- `src/features/messaging/MailRead.tsx:113`
- `src/features/messaging/MailRead.tsx:150`
- `src/features/messaging/MailReply.tsx:4`
- `src/features/messaging/MailReply.tsx:20`
- `src/features/messaging/MailReply.tsx:113`
- `src/features/messaging/MailReply.tsx:329`

**Kanita dayali alinti**

```tsx
// src/features/messaging/MailRead.tsx:4
* Flowbite "read.html" sayfasından birebir çevrildi.
```

```tsx
// src/features/messaging/MailRead.tsx:20
<a href="#" data-tooltip-target="tooltip-archive" ...>
```

```tsx
// src/features/messaging/MailReply.tsx:329
<button type="button" ... href="#">Reply</button>
```

**Aciklama**

Iki dosya buyuk olcude statik Flowbite markup'i. Cok sayida `href="#"` aksiyon navigasyon/handler olmadan duruyor; `MailReply` icinde `button` uzerinde `href` attribute'u bile var. Bu kod kullaniciya calisir aksiyon gibi gorunup davranis uretmiyor.

**Somut oneri**

Mail toolbar icin `MailActionButton` ve `MailToolbar` component'leri cikarilmali. Davranissiz aksiyonlar gercek handler'a baglanana kadar `button disabled` veya `aria-disabled` olarak isaretlenmeli; `href="#"` kaldirilmali.

### 23. Olu Kod / Dusuk - Tasks toolbar dropdown aksiyonlari bos handler ile render ediliyor

**Ilgili dosyalar**

- `src/features/tasks/KanbanBoard.tsx:360`
- `src/features/tasks/KanbanBoard.tsx:361`
- `src/features/tasks/KanbanBoard.tsx:369`

**Kanita dayali alinti**

```tsx
// src/features/tasks/KanbanBoard.tsx:360
{TOOLBAR_ACTIONS.map((a) => (
  <DropdownItem key={a.label} onSelect={() => {}}>
```

```tsx
// src/features/tasks/KanbanBoard.tsx:369
{TOOLBAR_ACTIONS.map((a) => (
  <button key={a.label} type="button" ...>
```

**Aciklama**

Mobil dropdown'da aksiyonlar tamamen bos `onSelect` ile geliyor; desktop butonlarda da handler yok. UI islev varmis gibi gorunuyor ama davranis yok.

**Somut oneri**

`TOOLBAR_ACTIONS` icine `onSelect`/`disabled` metadata eklenmeli. Hazir olmayan aksiyonlar render edilmemeli veya disabled tooltip ile acikca isaretlenmeli.

### 24. Performans / Orta - Uzun mesaj/transkript listelerinde virtualizasyon yok

**Ilgili dosyalar**

- `src/features/phone/MessagesPane.tsx:184`
- `src/features/support/components/ConversationView.tsx:188`
- `src/features/intelligence/TranscriptViewer.tsx:53`
- `src/features/messaging/components/MessageList.tsx:76`

**Kanita dayali alinti**

```tsx
// src/features/phone/MessagesPane.tsx:184
<div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-4">
  {active.messages.map((m, i) => {
```

```tsx
// src/features/support/components/ConversationView.tsx:188
<div className="min-h-0 min-w-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
  {conv.messages.map((m) => {
```

```tsx
// src/features/intelligence/TranscriptViewer.tsx:53
<div className="tl-stagger space-y-3">
  {segments.map((seg, i) => (
```

**Aciklama**

Sohbet, destek thread'i ve transkript segmentleri dogasi geregi buyuyebilen listeler. Su an tum satirlar DOM'a basiliyor. Mesaj sayisi yuzlere/binlere ciktiginda initial render, scroll ve search highlight maliyeti artar.

**Somut oneri**

`@tanstack/react-virtual` gibi hafif virtualizer eklenmeli veya mevcut dependency politikasina gore basit `VirtualList` primitive'i yazilmali. Mesaj/transkript listeleri ayni primitive'i kullanmali.

### 25. Parametrizasyon Eksikligi / Dusuk - Form field bileşenleri ortak `Input`/`Field` yerine yerel label+input tekrarliyor

**Ilgili dosyalar**

- `src/components/ui/Input.tsx:10`
- `src/features/users/UsersPage.tsx:475`
- `src/features/portal/PortalChatPage.tsx:501`
- `src/features/settings/SettingsPage.tsx:153`
- `src/features/webinar/components/RegistrationBuilder.tsx:200`

**Kanita dayali alinti**

```tsx
// src/components/ui/Input.tsx:10
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(...)
```

```tsx
// src/features/users/UsersPage.tsx:475
<label className="label" htmlFor="cu-name">{t("create.fullName")}</label>
<input id="cu-name" className="input" ... />
```

```tsx
// src/features/portal/PortalChatPage.tsx:501
<label className="label" htmlFor="new-thread-message">...</label>
<textarea id="new-thread-message" className="input" ... />
```

**Aciklama**

`Input` sadece raw input wrapper'i; label, hint, error, required ve textarea varyanti icin genel bir form-field primitive'i yok. Bu yuzden her feature `label + input + error` dizilimini tekrar ediyor.

**Somut oneri**

`Field`, `TextField`, `TextareaField` component'leri eklenmeli. `AuthField` bu genel primitive'e yaklastirilmali; users/portal/settings/webinar formlari ayni field API'sine gecmeli.

## Oncelik Sirali Ozet

| Oncelik | Bulgu | Kategori | Onem | Temsil edilen alanlar | Onerilen ilk adim |
|---:|---|---|---|---|---|
| 1 | Uzun mesaj/transkript listelerinde virtualizasyon yok | Performans | Orta | `phone`, `support`, `intelligence`, `messaging` | Ortak `VirtualList` primitive'i |
| 2 | Tarih/saat formatlama daginik | Tekrar | Orta | `admin`, `appointments`, `booking`, `dashboard`, `intelligence`, `portal`, `settings`, `webinar` | `src/lib/dateFormat.ts` |
| 3 | Ortak `Modal` varken dialog kabuklari yeniden yazilmis | Tekrar | Orta | `meetings`, `clips`, `phone` | `Modal` props genisletme |
| 4 | Store update paternleri elle tekrarliyor | Tekrar | Orta | `admin`, `appointments`, `docs`, `messaging`, `phone`, `webinar` | `storeArray` helper'lari |
| 5 | Query loading/error/empty bloklari tekrarliyor | Parametrizasyon Eksikligi | Orta | `canvas`, `users`, `portal`, `meetings`, `settings`, `dashboard` | `AsyncListState` component'i |
| 6 | Dashboard derive islemleri memoize degil | Performans | Orta | `dashboard` | `useMemo` veya hook selector |
| 7 | `TableGridView` hesaplari render'da tekrarliyor | Performans | Orta | `docs` | Formul cache ve memo |
| 8 | Gantt/Hill gruplama O(k*n) | Performans | Orta | `docs` | Tek gecisli grouping |
| 9 | Tasks kolonlari listeyi tekrar filtreliyor | Performans | Orta | `tasks` | Status bucket memo |
| 10 | MailRead/MailReply davranissiz Flowbite kalintilari | Olu Kod | Orta | `messaging` | Toolbar component + handler/disabled |
| 11 | Auth validation/bind tekrari | Tekrar | Orta | `auth` | `auth.validation` + `useFormErrors` |
| 12 | Messaging dialog form footer tekrari | Parametrizasyon Eksikligi | Orta | `messaging` | `ModalForm` |
| 13 | Canvas modal-form tekrari | Parametrizasyon Eksikligi | Orta | `canvas` | `CanvasBlockFormModal` |
| 14 | Support conversation filtreleri memoize degil | Performans | Orta | `support` | Memoized selector |
| 15 | Public booking calendar hesaplari render'da | Performans | Orta | `booking` | `calendarDays` memo |
| 16 | Responsive liste/tablo iki JSX agacinda | Parametrizasyon Eksikligi | Orta | `users`, `docs` | `ResponsiveDataList` |
| 17 | SavedDrawer context lookup O(n*m) | Performans | Dusuk | `messaging` | `Map` memo |
| 18 | Voicemail sort/filter render'da | Performans | Dusuk | `phone` | `useMemo` |
| 19 | Availability slot filtreleri tekrarliyor | Performans | Dusuk | `appointments` | Tek gecisli slot bucket |
| 20 | RegistrationBuilder event degisimine bagli degil | Performans | Dusuk | `webinar` | `key={event.id}` veya reset effect |
| 21 | localStorage CRUD soyutlamalari bolunmus | Tekrar | Dusuk | `lib`, `copilot` | Tek repository katmani |
| 22 | `ContactsPanel` ulasilamaz return | Olu Kod | Dusuk | `phone` | Satiri kaldir |
| 23 | Tasks toolbar bos handler | Olu Kod | Dusuk | `tasks` | Handler veya disabled metadata |
| 24 | Form field primitive'i eksik | Parametrizasyon Eksikligi | Dusuk | `users`, `portal`, `settings`, `webinar`, `ui` | `Field/TextField/TextareaField` |
