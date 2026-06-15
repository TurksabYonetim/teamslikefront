# Support Inbox Hızlı Aksiyonlar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Support Inbox'ta gömülü/erişilemez aksiyonları (çözümle, bana ata, sıradakine ata) `ConversationView` başlığında tek tıkla erişilebilir kılmak.

**Architecture:** Yalnız `ConversationView.tsx` başlık aksiyon satırına butonlar eklenir; mevcut `conversationStore` action'ları (`assign`, `assignNext`, `setStatus`) kullanılır. Durum `<select>` korunur. i18n anahtarlarının çoğu zaten mevcut; yalnız `assignToMe` eklenir.

**Tech Stack:** React 18 + TS, custom `createStore`, react-i18next, vitest + @testing-library/react, Tailwind.

**Spec:** `docs/superpowers/specs/2026-06-15-support-inbox-quick-actions-design.md`

Çalışma dizini her komutta: `web/`. Branch: `feat/support-inbox-quick-actions` (mevcut).

---

## Mevcut bağlam (uygulayıcı için)

`src/features/support/components/ConversationView.tsx` başlığı (satır ~77-92):
```tsx
<div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
  <span className="text-base font-semibold text-ink">{contactName(conv.contactId)}</span>
  {assigned ? <Badge tone="neutral">{t("conversation.assignedTo", { name: assigned })}</Badge> : null}
  <select value={conv.status} onChange={...} className="ml-auto h-9 ...">...</select>
</div>
```
- `ME_ID` zaten `../support.data`'tan import edili. `Button`/`IconButton`/`Badge` `@/components/ui`'den, `Icon` `@/components/Icon`'dan import edili.
- Store action'ları: `conversationStore.getState().assign(convId, agentId)`, `.assignNext(convId)`, `.setStatus(convId, status)`.
- i18n (support namespace) MEVCUT: `conversation.resolve` ("Çöz"/"Resolve"), `conversation.reopen` ("Yeniden aç"/"Reopen"), `conversation.assignNext` ("Sıradakine ata"/"Assign next"). EKLENECEK: `conversation.assignToMe`.

---

## Task 1: i18n — `conversation.assignToMe` (tr + en)

**Files:**
- Modify: `src/i18n/locales/tr/support.json`
- Modify: `src/i18n/locales/en/support.json`

- [ ] **Step 1: tr anahtarı ekle**

`tr/support.json` içindeki `"conversation"` nesnesine, mevcut `"assign"` anahtarının yanına ekle:
```json
"assignToMe": "Bana ata",
```

- [ ] **Step 2: en anahtarı ekle**

`en/support.json` içindeki `"conversation"` nesnesine ekle:
```json
"assignToMe": "Assign to me",
```

- [ ] **Step 3: JSON doğrula**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/locales/tr/support.json','utf8')); JSON.parse(require('fs').readFileSync('src/i18n/locales/en/support.json','utf8')); console.log('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**
```bash
git add src/i18n/locales/tr/support.json src/i18n/locales/en/support.json
git commit -m "i18n(support): conversation.assignToMe (tr+en)"
```

---

## Task 2: ConversationView başlık aksiyon butonları (TDD)

**Files:**
- Modify: `src/features/support/components/ConversationView.tsx`
- Test: `src/features/support/components/ConversationView.test.tsx`

- [ ] **Step 1: Failing testler yaz**

`ConversationView.test.tsx`'i önce OKU (mevcut render/store-reset desenine uy). Sonra ekle (test env'de `t()` ham anahtar döndürür → buton adlarını regex ile hem TR metni hem anahtarla eşleştir):
```tsx
import { ME_ID } from "../support.data";
import { conversationStore } from "../conversation.store";

// beforeEach içinde mevcut desenle: conversationStore.getState().reset();

it("Çözümle tek tıkla resolved yapar, Yeniden aç tersine çevirir", () => {
  const id = conversationStore.getState().conversations[0].id;
  conversationStore.getState().setActive(id);
  conversationStore.getState().setStatus(id, "open");
  render(<ConversationView />);
  fireEvent.click(screen.getByRole("button", { name: /çöz|resolve|conversation\.resolve/i }));
  expect(conversationStore.getState().conversations.find((c) => c.id === id)!.status).toBe("resolved");
  fireEvent.click(screen.getByRole("button", { name: /yeniden aç|reopen|conversation\.reopen/i }));
  expect(conversationStore.getState().conversations.find((c) => c.id === id)!.status).toBe("open");
});

it("Bana ata aktif konuşmayı ME_ID'ye atar", () => {
  const id = conversationStore.getState().conversations[0].id;
  conversationStore.getState().setActive(id);
  conversationStore.getState().assign(id, "someone_else");
  render(<ConversationView />);
  fireEvent.click(screen.getByRole("button", { name: /bana ata|assign to me|assignToMe/i }));
  expect(conversationStore.getState().conversations.find((c) => c.id === id)!.assigneeId).toBe(ME_ID);
});

it("Sıradakine ata bir ajana atar", () => {
  const id = conversationStore.getState().conversations[0].id;
  conversationStore.getState().setActive(id);
  render(<ConversationView />);
  fireEvent.click(screen.getByRole("button", { name: /sıradakine|assign next|assignNext/i }));
  expect(conversationStore.getState().conversations.find((c) => c.id === id)!.assigneeId).toBeTruthy();
});
```
> Eğer mevcut testte zaten `render`/`screen`/`fireEvent` import'ları ve bir `beforeEach` reset varsa onları yeniden kullan; yalnız bu 3 `it` bloğunu ekle. Aktif konuşmanın varsayılan `assigneeId`/`status` değerleri fixture'a bağlıysa testler bunu açıkça ayarladığı için sorun olmaz.

- [ ] **Step 2: Testi çalıştır, FAIL gör**

Run: `npm test -- ConversationView.test.tsx`
Expected: FAIL (butonlar yok).

- [ ] **Step 3: Başlık aksiyon grubunu uygula**

`ConversationView.tsx` başlık `<div>`'inde, durum `<select>`'inden ÖNCE (ve `ml-auto`'yu artık select yerine ilk aksiyon butonuna taşıyarak grubu sağa yasla) aksiyon butonlarını ekle. Örnek hedef yapı:
```tsx
<div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
  <span className="text-base font-semibold text-ink">{contactName(conv.contactId)}</span>
  {assigned ? <Badge tone="neutral">{t("conversation.assignedTo", { name: assigned })}</Badge> : null}

  <div className="ml-auto flex flex-wrap items-center gap-2">
    <Button
      size="sm"
      variant="ghost"
      disabled={conv.assigneeId === ME_ID}
      onClick={() => conversationStore.getState().assign(conv.id, ME_ID)}
    >
      <Icon name="user" className="h-4 w-4" aria-hidden /> {t("conversation.assignToMe")}
    </Button>
    <Button
      size="sm"
      variant="ghost"
      onClick={() => conversationStore.getState().assignNext(conv.id)}
    >
      <Icon name="users" className="h-4 w-4" aria-hidden /> {t("conversation.assignNext")}
    </Button>
    {conv.status === "resolved" ? (
      <Button size="sm" variant="ghost" onClick={() => conversationStore.getState().setStatus(conv.id, "open")}>
        <Icon name="refresh" className="h-4 w-4" aria-hidden /> {t("conversation.reopen")}
      </Button>
    ) : (
      <Button size="sm" variant="primary" onClick={() => conversationStore.getState().setStatus(conv.id, "resolved")}>
        <Icon name="check" className="h-4 w-4" aria-hidden /> {t("conversation.resolve")}
      </Button>
    )}
    <select
      value={conv.status}
      onChange={(e) => conversationStore.getState().setStatus(conv.id, e.target.value as ConversationStatus)}
      aria-label={t("conversation.statusLabel")}
      className="h-9 rounded-md border border-line bg-surface px-2 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{t(`status.${s}`)}</option>
      ))}
    </select>
  </div>
</div>
```
ÖNEMLİ:
- Mevcut `<select>`'in `ml-auto` sınıfını KALDIR (artık sarmalayıcı `div.ml-auto` sağa yaslıyor).
- `Icon name="..."` değerleri için mevcut `Icon` setinde geçerli adlar kullan. `ConversationView` zaten `check`, `pencil`, `send`, `sparkles`, `bolt`, `close`, `chat` kullanıyor. `user`/`users`/`refresh` adları `Icon` bileşeninde yoksa, mevcut geçerli adlardan uygun olanları seç (örn. atama için `bolt` yerine anlamlı bir ad; yeniden-aç için `refresh` yoksa `pencil` veya uygun bir ad). Uygulayıcı: `@/components/Icon`'u açıp geçerli `name` birliğini DOĞRULA, geçersizse en yakın geçerli ikonu kullan ve hangi adı seçtiğini raporla. Buton METNİ zaten anlamı taşıdığı için ikon ikincil.
- `Button` bileşeni `size`/`variant`/`disabled` prop'larını destekliyor mu DOĞRULA (dosya zaten `Button size="sm"` kullanıyor — destekliyor).

- [ ] **Step 4: Testi çalıştır, PASS gör**

Run: `npm test -- ConversationView.test.tsx`
Expected: PASS. Ayrıca `npm run typecheck` → ConversationView.tsx'te yeni hata yok (ilgisiz modül hatalarını yok say).

- [ ] **Step 5: Commit**
```bash
git add src/features/support/components/ConversationView.tsx src/features/support/components/ConversationView.test.tsx
git commit -m "feat(support): inbox başlığında çözümle + bana ata + sıradakine ata butonları"
```

---

## Task 3: Doğrulama

- [ ] **Step 1: Typecheck** — Run: `npm run typecheck` → exit 0.
- [ ] **Step 2: Support testleri** — Run: `npm test -- src/features/support` → tüm PASS.
- [ ] **Step 3: Tam paket (regresyon)** — Run: `npm test` → PASS.
- [ ] **Step 4: Build (opsiyonel)** — Run: `npm run build` → başarılı.
- [ ] **Step 5: Kabul kriterleri** — Spec'teki 5 kriteri doğrula.
- [ ] **Step 6:** `superpowers:finishing-a-development-branch` ile merge/PR kararı.

---

## Self-Review notları

- **Spec kapsamı:** P2 (çözümle/yeniden-aç) Task 2; P3 (bana ata + sıradakine) Task 2; i18n Task 1. Karşılandı.
- **Yeniden kullanım:** `resolve`/`reopen`/`assignNext` i18n anahtarları zaten vardı; yalnız `assignToMe` eklendi (DRY).
- **Tip tutarlılığı:** `assign(convId, agentId)`, `assignNext(convId)`, `setStatus(convId, status)` mevcut imzalarla çağrıldı. `ConversationStatus`/`STATUSES` zaten dosyada.
- **Yıkıcı koruma:** Yıkıcı işlem yok; çözümle geri alınabilir.
- **Risk:** Tek bileşen + 1 i18n anahtarı. Düşük. İkon adı doğrulaması uygulayıcıya bırakıldı (geçersizse en yakın geçerli ad).
