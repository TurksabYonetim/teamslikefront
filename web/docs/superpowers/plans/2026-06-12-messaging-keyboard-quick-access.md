# Messaging Klavye-Öncelikli Hızlı Erişim — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Messaging modülünde sık hedeflere ulaşmak için gereken tık/adım sayısını ⌘K hızlı geçiş paleti, mesaj klavye kısayolları, tam emoji tepkisi ve kısayol yardımı ile azaltmak.

**Architecture:** Tümü mevcut altyapı üzerine kurulur. `GlobalSearchDialog` bir hızlı geçiş paletine genişletilir; açık/kapalı durumu `messagingStore`'a taşınır. Yeni `useMessagingHotkeys` hook'u `ChatShell`'de `document`'a ⌘/Ctrl+K ve `?` dinler. Mesaj `<article>`'ına yerel `onKeyDown` eklenir (doğal kapsam, global state yok). Yıkıcı işlemler (sil) klavyeye bağlanmaz.

**Tech Stack:** React 18 + TypeScript, custom `createStore` (zustand-benzeri), react-i18next, vitest + @testing-library/react, Tailwind.

**Spec:** `docs/superpowers/specs/2026-06-12-messaging-keyboard-quick-access-design.md`

---

## Dosya yapısı

| Dosya | Sorumluluk | İşlem |
|------|-----------|------|
| `src/features/messaging/store.ts` | `paletteOpen` state + `togglePalette` | Modify |
| `src/features/messaging/components/GlobalSearchDialog.tsx` | Konuşma+mesaj paleti, klavye nav | Modify |
| `src/features/messaging/components/MessagingSidebar.tsx` | Büyüteç → `togglePalette`; yerel state kaldır | Modify |
| `src/features/messaging/MessagingPage.tsx` | Hook mount + palet/yardım render | Modify |
| `src/features/messaging/components/useMessagingHotkeys.ts` | ⌘K + `?` global dinleyici | Create |
| `src/features/messaging/components/MessageBubble.tsx` | `onKeyDown` kısayolları + emoji "+" | Modify |
| `src/features/messaging/components/ShortcutsHelpDialog.tsx` | Kısayol yardımı modal | Create |
| `src/i18n/locales/tr/messaging.json` | tr anahtarlar | Modify |
| `src/i18n/locales/en/messaging.json` | en anahtarlar | Modify |

Çalışma dizini her komutta: `web/`. Branch: `feat/messaging-keyboard-quick-access` (zaten oluşturuldu).

---

## Task 1: i18n anahtarları (tr + en)

Önce eklenir ki sonraki bileşenler `t(...)` ile kullanabilsin.

**Files:**
- Modify: `src/i18n/locales/tr/messaging.json`
- Modify: `src/i18n/locales/en/messaging.json`

- [ ] **Step 1: tr anahtarlarını ekle**

`tr/messaging.json` içinde en dıştaki `{ ... }` nesnesinin köküne (örn. `"notifications"` bloğundan hemen önce, geçerli JSON kalacak şekilde virgülle) şu iki nesneyi ekle:

```json
"palette": {
  "title": "Hızlı geçiş",
  "placeholder": "Kanal, kişi veya mesaj ara…",
  "conversations": "Konuşmalar",
  "messages": "Mesajlar",
  "hint": "Atlamak için yazın",
  "noResults": "Sonuç yok"
},
"shortcuts": {
  "title": "Klavye kısayolları",
  "navGroup": "Gezinme",
  "messageGroup": "Mesaj aksiyonları",
  "palette": "Hızlı geçiş paleti",
  "help": "Bu yardım",
  "reply": "Yanıtla",
  "thread": "Konu başlığında yanıtla",
  "edit": "Düzenle (kendi mesajın)",
  "pin": "Sabitle / kaldır",
  "save": "Kaydet / kaldır",
  "forward": "İlet",
  "important": "Önemli işaretle",
  "react": "Hızlı tepki (1–6)",
  "helpButton": "Klavye kısayolları",
  "moreReactions": "Daha fazla tepki"
}
```

- [ ] **Step 2: en anahtarlarını simetrik ekle**

`en/messaging.json` içine aynı yapıyı İngilizce değerlerle ekle:

```json
"palette": {
  "title": "Quick switch",
  "placeholder": "Search channels, people or messages…",
  "conversations": "Conversations",
  "messages": "Messages",
  "hint": "Type to jump",
  "noResults": "No results"
},
"shortcuts": {
  "title": "Keyboard shortcuts",
  "navGroup": "Navigation",
  "messageGroup": "Message actions",
  "palette": "Quick switch palette",
  "help": "This help",
  "reply": "Reply",
  "thread": "Reply in thread",
  "edit": "Edit (your message)",
  "pin": "Pin / unpin",
  "save": "Save / unsave",
  "forward": "Forward",
  "important": "Mark important",
  "react": "Quick react (1–6)",
  "helpButton": "Keyboard shortcuts",
  "moreReactions": "More reactions"
}
```

- [ ] **Step 3: JSON geçerliliğini doğrula**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/tr/messaging.json','utf8')); JSON.parse(require('fs').readFileSync('src/i18n/locales/en/messaging.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add src/i18n/locales/tr/messaging.json src/i18n/locales/en/messaging.json
git commit -m "i18n(messaging): palette + shortcuts anahtarları (tr+en)"
```

---

## Task 2: Store — `paletteOpen` + `togglePalette`

**Files:**
- Modify: `src/features/messaging/store.ts`
- Test: `src/features/messaging/store.test.ts`

- [ ] **Step 1: Failing test yaz**

`store.test.ts` sonuna ekle:

```ts
import { messagingStore } from "./store";

describe("palette state", () => {
  beforeEach(() => messagingStore.getState().resetStore());

  it("defaults to closed", () => {
    expect(messagingStore.getState().paletteOpen).toBe(false);
  });

  it("togglePalette() flips, and accepts explicit value", () => {
    messagingStore.getState().togglePalette();
    expect(messagingStore.getState().paletteOpen).toBe(true);
    messagingStore.getState().togglePalette(false);
    expect(messagingStore.getState().paletteOpen).toBe(false);
    messagingStore.getState().togglePalette(true);
    expect(messagingStore.getState().paletteOpen).toBe(true);
  });
});
```

> Not: Eğer `store.test.ts` zaten `messagingStore` import ediyor veya `resetStore` çağrı deseni farklıysa, mevcut desene uy — yalnız iki `it` bloğunu uygun `describe` içine ekle.

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- store.test.ts`
Expected: FAIL — `paletteOpen` / `togglePalette` tanımsız (type veya runtime hatası).

- [ ] **Step 3: Interface'e alan ekle**

`store.ts` `MessagingState` interface'inde `detailsOpen: boolean;` satırının altına:

```ts
  paletteOpen: boolean;
```

Ve navigasyon action'ları arasında (`toggleDetails: () => void;` yanına):

```ts
  togglePalette: (open?: boolean) => void;
```

- [ ] **Step 4: seed() ve implementasyona ekle**

`seed()` nesnesinde `detailsOpen: false,` altına:

```ts
  paletteOpen: false,
```

Store gövdesinde `toggleDetails: () => set(...)` satırının altına:

```ts
    togglePalette: (open) =>
      set((s) => ({ paletteOpen: typeof open === "boolean" ? open : !s.paletteOpen })),
```

- [ ] **Step 5: Testi çalıştır, geçtiğini gör**

Run: `npm test -- store.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/messaging/store.ts src/features/messaging/store.test.ts
git commit -m "feat(messaging): store'a paletteOpen + togglePalette"
```

---

## Task 3: Hızlı geçiş paleti — konuşmalar + klavye navigasyonu

`GlobalSearchDialog`'u konuşma atlama + birleşik klavye nav ile genişlet.

**Files:**
- Modify: `src/features/messaging/components/GlobalSearchDialog.tsx`
- Test: `src/features/messaging/components/GlobalSearchDialog.test.tsx`

- [ ] **Step 1: Failing test yaz**

`GlobalSearchDialog.test.tsx` içine (mevcut import/setup desenine uyarak) ekle:

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { GlobalSearchDialog } from "./GlobalSearchDialog";
import { messagingStore } from "../store";

beforeEach(() => messagingStore.getState().resetStore());

it("kanal adıyla filtreleyip Enter ile o kanala atlar", () => {
  const channels = messagingStore.getState().channels;
  const target = channels.find((c) => c.kind !== "dm")!;
  render(<GlobalSearchDialog open onClose={() => {}} />);

  const input = screen.getByLabelText(/hızlı geçiş|quick switch/i);
  fireEvent.change(input, { target: { value: target.name.slice(0, 3) } });

  // Konuşma sonucu görünür
  const option = screen.getByText(target.name);
  expect(option).toBeInTheDocument();

  // ArrowDown ilk öğeyi aktif eder, Enter atlar
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });

  expect(messagingStore.getState().activeChannelId).toBe(target.id);
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- GlobalSearchDialog.test.tsx`
Expected: FAIL — label metni / konuşma sonucu / klavye davranışı yok.

- [ ] **Step 3: GlobalSearchDialog'u genişlet**

`GlobalSearchDialog.tsx` tam içeriğini şununla değiştir:

```tsx
import * as React from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineMagnifyingGlass, HiOutlineHashtag, HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { Modal } from "@/components/ui";
import { messagingStore, useMessaging } from "../store";
import { memberName } from "../members";
import { highlightHit } from "../chat";

type Item =
  | { kind: "conv"; channelId: string; label: string; dm: boolean }
  | { kind: "msg"; channelId: string; topicId: string; label: string; meta: string };

/** Hızlı geçiş paleti: konuşmalara atla + konuşmalar arası mesaj araması. */
export function GlobalSearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");
  const messages = useMessaging((s) => s.messages);
  const channels = useMessaging((s) => s.channels);
  const topics = useMessaging((s) => s.topics);
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  const query = q.trim().toLowerCase();

  const convItems: Item[] =
    query.length >= 1
      ? channels
          .filter((c) => c.name.toLowerCase().includes(query))
          .slice(0, 8)
          .map((c) => ({ kind: "conv", channelId: c.id, label: c.name, dm: c.kind === "dm" }))
      : [];

  const msgItems: Item[] =
    query.length >= 2
      ? messages
          .filter((m) => !m.deleted && !m.hiddenForMe && highlightHit(m.body, query))
          .slice(0, 30)
          .map((m) => {
            const ch = channels.find((c) => c.id === m.channelId);
            const tp = topics.find((x) => x.id === m.topicId);
            const meta = `${memberName(m.authorId)} · ${ch?.kind === "dm" ? ch.name : `#${ch?.name ?? ""}`}${
              tp && tp.title !== "main" ? ` / ${tp.title}` : ""
            }`;
            return { kind: "msg", channelId: m.channelId, topicId: m.topicId, label: m.body || t("voiceMessage"), meta };
          })
      : [];

  const items = [...convItems, ...msgItems];

  // Sorgu değişince aktif indeksi sıfırla.
  React.useEffect(() => setActive(0), [q]);

  const activate = (item: Item) => {
    const s = messagingStore.getState();
    s.setChannel(item.channelId);
    if (item.kind === "msg") s.setTopic(item.topicId);
    s.setSearch("");
    setQ("");
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) activate(item);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t("palette.title")}>
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-md border border-line px-3 dark:border-gray-700">
          <HiOutlineMagnifyingGlass className="h-5 w-5 text-muted" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("palette.placeholder")}
            aria-label={t("palette.title")}
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls="palette-list"
            className="h-12 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted dark:text-white"
          />
        </div>

        <ul id="palette-list" role="listbox" className="max-h-[55vh] overflow-y-auto">
          {query.length < 1 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">{t("palette.hint")}</li>
          ) : items.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted">{t("palette.noResults")}</li>
          ) : (
            items.map((item, idx) => {
              const selected = idx === active;
              const Icon = item.kind === "conv" && (item as { dm: boolean }).dm ? HiOutlineChatBubbleOvalLeft : HiOutlineHashtag;
              return (
                <li key={`${item.kind}-${idx}`} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => activate(item)}
                    className={
                      "flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-start " +
                      (selected ? "bg-surface-2 dark:bg-gray-700" : "hover:bg-surface-2 dark:hover:bg-gray-700")
                    }
                  >
                    {item.kind === "conv" ? (
                      <span className="flex items-center gap-2 text-sm font-medium text-ink dark:text-white">
                        <Icon className="h-4 w-4 text-muted" aria-hidden />
                        {item.label}
                        <span className="text-xs text-muted">· {t("palette.conversations")}</span>
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-ink dark:text-white">{item.meta}</span>
                        <span className="truncate text-sm text-ink dark:text-white">{item.label}</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini gör**

Run: `npm test -- GlobalSearchDialog.test.tsx`
Expected: PASS

> Eğer mevcut testlerde eski `globalSearchTitle`/`searchPlaceholder` etiketlerine bağlı assert'ler varsa, onları yeni `palette.*` etiketlerine güncelle.

- [ ] **Step 5: Commit**

```bash
git add src/features/messaging/components/GlobalSearchDialog.tsx src/features/messaging/components/GlobalSearchDialog.test.tsx
git commit -m "feat(messaging): hızlı geçiş paleti — konuşma atlama + klavye nav"
```

---

## Task 4: Palet açma durumunu store'a bağla (sidebar + ChatShell)

**Files:**
- Modify: `src/features/messaging/components/MessagingSidebar.tsx`
- Modify: `src/features/messaging/MessagingPage.tsx`

- [ ] **Step 1: Sidebar'ı store paletine bağla**

`MessagingSidebar.tsx`:

1. `const [searchOpen, setSearchOpen] = React.useState(false);` satırını **sil**.
2. Büyüteç butonunun `onClick={() => setSearchOpen(true)}`'ını şununla değiştir:
   `onClick={() => messagingStore.getState().togglePalette(true)}`
3. Dosyanın altındaki `<GlobalSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />` satırını **sil**.
4. Artık kullanılmıyorsa `GlobalSearchDialog` import'unu **sil**.

- [ ] **Step 2: ChatShell'de paleti render et**

`MessagingPage.tsx` `ChatShell` içinde:

1. Üste import ekle:
   ```tsx
   import { GlobalSearchDialog } from "./components/GlobalSearchDialog";
   ```
2. `ChatShell` gövdesinde store'dan oku (diğer `useMessaging` çağrılarının yanına):
   ```tsx
   const paletteOpen = useMessaging((s) => s.paletteOpen);
   ```
3. En dış `<ErrorBoundary>` içindeki ana `<div ...>`'in hemen sonrasına (kapanış `</div>`'ten önce, `{detailsOpen ? <DetailsPanel /> : null}` satırının altına) ekle:
   ```tsx
   <GlobalSearchDialog
     open={paletteOpen}
     onClose={() => messagingStore.getState().togglePalette(false)}
   />
   ```

- [ ] **Step 2b: Typecheck**

Run: `npm run typecheck`
Expected: temiz (kullanılmayan import / state hatası yok).

- [ ] **Step 3: Sidebar testini çalıştır**

Run: `npm test -- MessagingSidebar.test.tsx`
Expected: PASS. Eğer test eski `searchOpen` davranışına bağlıysa, "büyüteç tıklanınca `togglePalette(true)` çağrılır / `paletteOpen` true olur" şeklinde güncelle:

```tsx
fireEvent.click(screen.getByLabelText(/searchAll|tümünde ara|ara/i));
expect(messagingStore.getState().paletteOpen).toBe(true);
```

- [ ] **Step 4: Commit**

```bash
git add src/features/messaging/components/MessagingSidebar.tsx src/features/messaging/MessagingPage.tsx src/features/messaging/components/MessagingSidebar.test.tsx
git commit -m "feat(messaging): palet açma durumunu store'a taşı (sidebar + shell)"
```

---

## Task 5: `useMessagingHotkeys` — ⌘/Ctrl+K + `?`

**Files:**
- Create: `src/features/messaging/components/useMessagingHotkeys.ts`
- Test: `src/features/messaging/components/useMessagingHotkeys.test.tsx`
- Modify: `src/features/messaging/MessagingPage.tsx`

- [ ] **Step 1: Failing test yaz**

`useMessagingHotkeys.test.tsx`:

```tsx
import { render, fireEvent } from "@testing-library/react";
import { useMessagingHotkeys } from "./useMessagingHotkeys";
import { messagingStore } from "../store";

function Harness({ onHelp }: { onHelp: () => void }) {
  useMessagingHotkeys({ onOpenHelp: onHelp });
  return <textarea aria-label="ta" />;
}

beforeEach(() => messagingStore.getState().resetStore());

it("Ctrl+K paleti açar", () => {
  render(<Harness onHelp={() => {}} />);
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
  expect(messagingStore.getState().paletteOpen).toBe(true);
});

it("? yazma alanı dışındayken yardımı açar", () => {
  const onHelp = vi.fn();
  render(<Harness onHelp={onHelp} />);
  fireEvent.keyDown(document, { key: "?" });
  expect(onHelp).toHaveBeenCalledTimes(1);
});

it("? textarea içinde yardımı AÇMAZ", () => {
  const onHelp = vi.fn();
  const { getByLabelText } = render(<Harness onHelp={onHelp} />);
  fireEvent.keyDown(getByLabelText("ta"), { key: "?" });
  expect(onHelp).not.toHaveBeenCalled();
});
```

> `vi` global değilse dosya başına `import { vi } from "vitest";` ekle (mevcut test desenine bak).

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- useMessagingHotkeys.test.tsx`
Expected: FAIL — modül yok.

- [ ] **Step 3: Hook'u yaz**

`useMessagingHotkeys.ts`:

```ts
import * as React from "react";
import { messagingStore } from "../store";

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable === true;
}

/** Messaging geneli klavye kısayolları: ⌘/Ctrl+K palet, ? yardım. */
export function useMessagingHotkeys({ onOpenHelp }: { onOpenHelp: () => void }) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        messagingStore.getState().togglePalette(true);
        return;
      }
      if (e.key === "?" && !isTyping(e.target)) {
        e.preventDefault();
        onOpenHelp();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenHelp]);
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini gör**

Run: `npm test -- useMessagingHotkeys.test.tsx`
Expected: PASS

- [ ] **Step 5: ChatShell'de mount et (yardım state'i ile)**

`MessagingPage.tsx` `ChatShell` içinde:

1. Import'lar:
   ```tsx
   import { useMessagingHotkeys } from "./components/useMessagingHotkeys";
   import { ShortcutsHelpDialog } from "./components/ShortcutsHelpDialog";
   ```
   > `ShortcutsHelpDialog` Task 6'da oluşturulur; bu import'u Task 6 tamamlanana kadar eklemeyebilirsin — ya da Task 6'yı bu adımdan hemen önce yap. Sıra önerisi: Task 6 → Task 5 Step 5. Plan akışında Step 5'i Task 6'dan sonra tamamla.
2. Yardım state'i ve hook (gövdenin başına):
   ```tsx
   const [helpOpen, setHelpOpen] = React.useState(false);
   const openHelp = React.useCallback(() => setHelpOpen(true), []);
   useMessagingHotkeys({ onOpenHelp: openHelp });
   ```
3. `GlobalSearchDialog`'un yanına render ekle:
   ```tsx
   <ShortcutsHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
   ```

- [ ] **Step 6: Commit**

```bash
git add src/features/messaging/components/useMessagingHotkeys.ts src/features/messaging/components/useMessagingHotkeys.test.tsx src/features/messaging/MessagingPage.tsx
git commit -m "feat(messaging): useMessagingHotkeys — ⌘K palet + ? yardım"
```

---

## Task 6: `ShortcutsHelpDialog`

**Files:**
- Create: `src/features/messaging/components/ShortcutsHelpDialog.tsx`
- Test: `src/features/messaging/components/ShortcutsHelpDialog.test.tsx`

> Bu task'ı Task 5 Step 5'ten **önce** tamamla (import bağımlılığı).

- [ ] **Step 1: Failing test yaz**

`ShortcutsHelpDialog.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ShortcutsHelpDialog } from "./ShortcutsHelpDialog";

it("açıkken kısayolları listeler", () => {
  render(<ShortcutsHelpDialog open onClose={() => {}} />);
  expect(screen.getByText(/klavye kısayolları|keyboard shortcuts/i)).toBeInTheDocument();
  // mesaj aksiyon tuşlarından biri görünür
  expect(screen.getByText("r")).toBeInTheDocument();
});

it("kapalıyken render etmez", () => {
  render(<ShortcutsHelpDialog open={false} onClose={() => {}} />);
  expect(screen.queryByText(/klavye kısayolları|keyboard shortcuts/i)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- ShortcutsHelpDialog.test.tsx`
Expected: FAIL — modül yok.

- [ ] **Step 3: Bileşeni yaz**

`ShortcutsHelpDialog.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui";

type Row = { keys: string; labelKey: string };

const NAV: Row[] = [
  { keys: "⌘K / Ctrl+K", labelKey: "shortcuts.palette" },
  { keys: "?", labelKey: "shortcuts.help" },
];

const MESSAGE: Row[] = [
  { keys: "r", labelKey: "shortcuts.reply" },
  { keys: "t", labelKey: "shortcuts.thread" },
  { keys: "e", labelKey: "shortcuts.edit" },
  { keys: "p", labelKey: "shortcuts.pin" },
  { keys: "s", labelKey: "shortcuts.save" },
  { keys: "f", labelKey: "shortcuts.forward" },
  { keys: "i", labelKey: "shortcuts.important" },
  { keys: "1–6", labelKey: "shortcuts.react" },
];

export function ShortcutsHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation("messaging");

  const Group = ({ title, rows }: { title: string; rows: Row[] }) => (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-muted">{title}</h4>
      <ul className="space-y-1">
        {rows.map((r) => (
          <li key={r.keys} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-ink dark:text-white">{t(r.labelKey)}</span>
            <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-ink dark:border-gray-700 dark:text-white">
              {r.keys}
            </kbd>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title={t("shortcuts.title")}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Group title={t("shortcuts.navGroup")} rows={NAV} />
        <Group title={t("shortcuts.messageGroup")} rows={MESSAGE} />
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini gör**

Run: `npm test -- ShortcutsHelpDialog.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/messaging/components/ShortcutsHelpDialog.tsx src/features/messaging/components/ShortcutsHelpDialog.test.tsx
git commit -m "feat(messaging): ShortcutsHelpDialog — kısayol yardımı modal"
```

> Şimdi Task 5 Step 5 (ChatShell mount) tamamlanabilir; ardından Task 5 Step 6 commit'i bu task'ın import'unu da kapsar (ya da MessagingPage değişikliğini Task 5 commit'ine bırak).

---

## Task 7: Mesaj klavye kısayolları (MessageBubble `onKeyDown`)

**Files:**
- Modify: `src/features/messaging/components/MessageBubble.tsx`
- Test: `src/features/messaging/components/MessageBubble.test.tsx`

- [ ] **Step 1: Failing test yaz**

`MessageBubble.test.tsx` içine (mevcut render helper desenine uyarak; gerekiyorsa kanal düzeni veren bir mesaj kullan):

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";
import { messagingStore } from "../store";

beforeEach(() => messagingStore.getState().resetStore());

function firstChannelTextMessage() {
  const s = messagingStore.getState();
  const ch = s.channels.find((c) => c.kind !== "dm")!;
  return s.messages.find((m) => m.channelId === ch.id && (!m.kind || m.kind === "text") && !m.deleted)!;
}

it("odaktayken 'r' yanıt hedefini ayarlar", () => {
  const msg = firstChannelTextMessage();
  render(<MessageBubble message={msg} />);
  const article = screen.getByRole("article");
  article.focus();
  fireEvent.keyDown(article, { key: "r" });
  expect(messagingStore.getState().replyTargetId).toBe(msg.id);
});

it("odaktayken 'p' sabitlemeyi değiştirir", () => {
  const msg = firstChannelTextMessage();
  const before = !!messagingStore.getState().messages.find((m) => m.id === msg.id)!.pinned;
  render(<MessageBubble message={msg} />);
  const article = screen.getByRole("article");
  fireEvent.keyDown(article, { key: "p", target: article });
  const after = !!messagingStore.getState().messages.find((m) => m.id === msg.id)!.pinned;
  expect(after).toBe(!before);
});

it("'1' ilk hızlı tepkiyi ekler", () => {
  const msg = firstChannelTextMessage();
  render(<MessageBubble message={msg} />);
  const article = screen.getByRole("article");
  fireEvent.keyDown(article, { key: "1", target: article });
  const updated = messagingStore.getState().messages.find((m) => m.id === msg.id)!;
  expect(updated.reactions.some((r) => r.emoji === "👍")).toBe(true);
});
```

> Not: `fireEvent.keyDown(article, { key, target: article })` ile `e.target === e.currentTarget` guard'ı tetiklenir. Eğer testing-library `target` override'ı bu sürümde çalışmıyorsa, `article.focus()` sonrası `fireEvent.keyDown(article, { key })` kullan — event hedefi article olur.

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- MessageBubble.test.tsx`
Expected: FAIL — kısayol davranışı yok.

- [ ] **Step 3: `onKeyDown` handler'ını ekle**

`MessageBubble.tsx` içinde, `toolbar` tanımından önce (state hook'larının altına) handler ekle. `QUICK_REACTIONS` zaten `../types`'tan import ediliyor:

```tsx
  const onArticleKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;          // sadece article odaktayken
    if (e.metaKey || e.ctrlKey || e.altKey) return;    // ⌘K vb. ile çakışma yok
    switch (e.key) {
      case "r": e.preventDefault(); setReplyTarget(message.id); break;
      case "t": e.preventDefault(); openThread(message.id); break;
      case "e": if (own) { e.preventDefault(); setDraft(message.body); setEditing(true); } break;
      case "p": e.preventDefault(); togglePin(message.id); break;
      case "s": e.preventDefault(); toggleSave(message.id); break;
      case "f": e.preventDefault(); setForwardOpen(true); break;
      case "i": e.preventDefault(); toggleImportant(message.id); break;
      default:
        if (e.key >= "1" && e.key <= "6") {
          const emoji = QUICK_REACTIONS[Number(e.key) - 1];
          if (emoji) { e.preventDefault(); toggleReaction(message.id, emoji, ME_ID); }
        }
    }
  };
```

> `setReplyTarget, openThread, togglePin, toggleSave, toggleImportant, toggleReaction` zaten `messagingStore.getState()` destructure'ında mevcut (dosya başı). `setDraft, setEditing, setForwardOpen` yerel React state setter'ları.

- [ ] **Step 4: Handler'ı her iki `<article>`'a bağla**

İki yerde `role="article" tabIndex={0}` olan `<div>` var (DM pill düzeni ve kanal düzeni). Her ikisine de ekle:

```tsx
onKeyDown={onArticleKeyDown}
aria-keyshortcuts="r t e p s f i 1 2 3 4 5 6"
```

DM düzeni: `<div role="article" tabIndex={0} className="group relative max-w-[80%] ...">`
Kanal düzeni: `<div role="article" tabIndex={0} className={clsx("group relative flex gap-3 ...")}>`

- [ ] **Step 5: Testi çalıştır, geçtiğini gör**

Run: `npm test -- MessageBubble.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/messaging/components/MessageBubble.tsx src/features/messaging/components/MessageBubble.test.tsx
git commit -m "feat(messaging): mesaj klavye kısayolları (r/t/e/p/s/f/i/1-6)"
```

---

## Task 8: Hover toolbar'da tam emoji tepkisi ("+")

**Files:**
- Modify: `src/features/messaging/components/MessageBubble.tsx`
- Test: `src/features/messaging/components/MessageBubble.test.tsx`

- [ ] **Step 1: Failing test yaz**

`MessageBubble.test.tsx` sonuna ekle:

```tsx
it("emoji seçiciden tepki ekler", () => {
  const msg = firstChannelTextMessage();
  render(<MessageBubble message={msg} />);
  // EmojiPicker tetikleyicisini aç (label: emoji)
  fireEvent.click(screen.getByLabelText(/emoji/i));
  const palette = messagingStore.getState().messages.find((m) => m.id === msg.id)!;
  // paletten ilk emojiyi seç — EMOJI_PALETTE[0]
  const firstEmoji = screen.getAllByRole("button").find((b) => b.getAttribute("aria-label")?.length === 2);
  // güvenli yol: bilinen bir emoji butonuna tıkla
  void palette;
});
```

> Bu test EmojiPicker'ın iç render'ına bağlı kırılgan olabilir. Daha sağlam alternatif: `toggleReaction` çağrısını doğrula. Aşağıdaki sağlam testi kullan:

```tsx
it("emoji seçici toolbar'da mevcut", () => {
  const msg = firstChannelTextMessage();
  render(<MessageBubble message={msg} />);
  // toolbar'da EmojiPicker tetikleyicisi (aria-label = emoji) bulunur
  expect(screen.getByLabelText(/^emoji$/i)).toBeInTheDocument();
});
```

İlk (kırılgan) testi yazma; yalnız ikinci sağlam testi ekle.

- [ ] **Step 2: Testi çalıştır, başarısız olduğunu gör**

Run: `npm test -- MessageBubble.test.tsx`
Expected: FAIL — toolbar'da emoji seçici yok.

- [ ] **Step 3: EmojiPicker'ı toolbar'a ekle**

`MessageBubble.tsx` başına import ekle:

```tsx
import { EmojiPicker } from "./EmojiPicker";
```

`toolbar` JSX'inde, 6 `QUICK_REACTIONS.slice(0,6).map(...)` butonundan **hemen sonra**, reply butonundan önce ekle:

```tsx
      <EmojiPicker onPick={(emoji) => toggleReaction(message.id, emoji, ME_ID)} />
```

- [ ] **Step 4: Testi çalıştır, geçtiğini gör**

Run: `npm test -- MessageBubble.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/messaging/components/MessageBubble.tsx src/features/messaging/components/MessageBubble.test.tsx
git commit -m "feat(messaging): hover toolbar'a tam emoji tepki seçicisi"
```

---

## Task 9: Yardım butonu (keşfedilebilirlik) + ChannelHeader

İsteğe bağlı ama düşük maliyetli keşfedilebilirlik: başlıkta küçük bir `?` butonu.

**Files:**
- Modify: `src/features/messaging/components/ChannelHeader.tsx`
- Modify: `src/features/messaging/MessagingPage.tsx` (yardımı açan köprü)

> `ShortcutsHelpDialog` açma state'i `ChatShell`'de. ChannelHeader bir alt bileşen; en basit köprü: yardımı da store'dan açmak yerine, ChannelHeader içinde küçük yerel bir `ShortcutsHelpDialog` render etmek. Tek kaynak ilkesi için bunun yerine `?` hotkey'i yeterli kabul edilebilir — bu task **atlanabilir** (YAGNI). Uygulayıcı: yalnız zaman varsa ekle.

- [ ] **Step 1 (opsiyonel): ChannelHeader'a yardım butonu**

`ChannelHeader.tsx` sağ aksiyon grubuna (details IconButton yanına) ekle:

```tsx
const [helpOpen, setHelpOpen] = React.useState(false);
// ...
<IconButton label={t("shortcuts.helpButton")} variant="ghost" onClick={() => setHelpOpen(true)}>
  <HiOutlineQuestionMarkCircle className="h-5 w-5" aria-hidden />
</IconButton>
// header sonunda:
<ShortcutsHelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
```

Import: `import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";` ve `import { ShortcutsHelpDialog } from "./ShortcutsHelpDialog";`

- [ ] **Step 2 (opsiyonel): Test + commit**

Run: `npm test -- ChannelHeader.test.tsx`
Expected: PASS

```bash
git add src/features/messaging/components/ChannelHeader.tsx
git commit -m "feat(messaging): başlıkta kısayol yardımı butonu"
```

---

## Task 10: Tam doğrulama

**Files:** yok (yalnız doğrulama)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: hata yok.

- [ ] **Step 2: Tüm messaging testleri**

Run: `npm test -- src/features/messaging`
Expected: tüm testler PASS.

- [ ] **Step 3: Tüm test paketi (regresyon)**

Run: `npm test`
Expected: PASS (mevcut yeşil suite korunur).

- [ ] **Step 4: Build (opsiyonel ama önerilir)**

Run: `npm run build`
Expected: başarılı build.

- [ ] **Step 5: Kabul kriterleri kontrolü**

Spec'teki 6 kabul kriterini tek tek doğrula (⌘K palet, mesaj kısayolları, tam emoji, `?` yardım, silmenin klavyeye bağlı olmaması, temiz typecheck+test).

- [ ] **Step 6: Branch'i tamamla**

`superpowers:finishing-a-development-branch` skill'ini kullanarak merge/PR kararını ver.

---

## Self-Review notları

- **Spec kapsamı:** P1 (Task 3–4), P2+P3 (Task 7), P4 (Task 8), P5 (Task 5–6). Tümü karşılandı.
- **Yıkıcı koruma:** Sil hiçbir task'ta klavyeye bağlanmadı; dropdown'da onaylı kalıyor. ✓
- **Tip tutarlılığı:** `togglePalette(open?: boolean)` Task 2'de tanımlandı, Task 4–5'te aynı imzayla çağrıldı. `paletteOpen` tutarlı. `onArticleKeyDown`, `useMessagingHotkeys({ onOpenHelp })`, `ShortcutsHelpDialog({ open, onClose })` imzaları task'lar arası tutarlı.
- **Bağımlılık sırası:** Task 6 (ShortcutsHelpDialog), Task 5 Step 5'teki import'tan önce yapılmalı — bu plan içinde not edildi.
- **Kırılgan test uyarısı:** Task 8'de EmojiPicker iç render'ına bağlı kırılgan test yerine sağlam "seçici mevcut" testi seçildi.
