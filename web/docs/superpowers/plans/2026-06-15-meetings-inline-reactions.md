# Meetings Inline Tepki — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Toplantı tepkilerini ControlBar'da dropdown arkasından (2 tık) inline butonlara (1 tık) taşımak.

**Architecture:** Yalnız `ControlBar.tsx` reactions bloğu değişir; Flowbite dropdown yerine inline emoji buton grubu. Mevcut `sendReaction` store action'ı ve `MEETING_REACTIONS` sabiti kullanılır. Yeni i18n/store yok.

**Tech Stack:** React 18 + TS, custom `createStore`, react-i18next, vitest + @testing-library/react, Tailwind.

**Spec:** `docs/superpowers/specs/2026-06-15-meetings-inline-reactions-design.md`

Çalışma dizini: `web/`. Branch: `feat/meetings-inline-reactions` (mevcut).

---

## Mevcut bağlam (uygulayıcı için)

`src/features/meetings/components/ControlBar.tsx` satır ~147-170, reactions dropdown bloğu:
```tsx
{/* Reactions — Flowbite dropdown */}
<div className="relative">
  <RoundBtn label={t("react")} data-dropdown-toggle="reactions-dd" data-dropdown-placement="top">
    <HiOutlineFaceSmile className="h-5 w-5" aria-hidden />
  </RoundBtn>
  <div id="reactions-dd" className="z-50 hidden gap-1 rounded-full border border-gray-800 bg-gray-800 p-1 shadow-xl">
    <div className="flex gap-1">
      {MEETING_REACTIONS.map((e) => (
        <button key={e} type="button" aria-label={e} onClick={() => act().sendReaction(e)}
          className="cursor-pointer rounded-full px-2 py-1 text-xl outline-none hover:bg-gray-700">
          <span aria-hidden>{e}</span>
        </button>
      ))}
    </div>
  </div>
</div>
```
- `MEETING_REACTIONS = ["👍","👏","🎉","❤️","😂","✋"]` (import'lu).
- `act()` = `() => meetingStore.getState()`; `act().sendReaction(emoji)` → `reactions` dizisine `{id, emoji}` ekler.
- `t("react")` mevcut i18n anahtarı.
- `HiOutlineFaceSmile` `react-icons/hi2`'den import edili (yalnız bu blokta kullanılıyorsa kaldırılacak).

---

## Task 1: Inline tepki grubu (TDD)

**Files:**
- Modify: `src/features/meetings/components/ControlBar.tsx`
- Test: `src/features/meetings/components/ControlBar.test.tsx`

- [ ] **Step 1: Failing test yaz**

`ControlBar.test.tsx`'i önce OKU (mevcut render + store reset desenine uy; toplantının `phase: "in"` olduğundan emin ol — store varsayılanı zaten `"in"`). Ekle:
```tsx
import { meetingStore } from "../meetings.store";
import { MEETING_REACTIONS } from "../meetings.store.types";

it("tepki emojisine tıklamak tek tıkla sendReaction çağırır", () => {
  // reset mevcut beforeEach ile; değilse: meetingStore.getState().reset?.()
  render(<ControlBar />);
  const before = meetingStore.getState().reactions.length;
  fireEvent.click(screen.getByLabelText("👍"));
  const after = meetingStore.getState().reactions;
  expect(after.length).toBe(before + 1);
  expect(after.some((r) => r.emoji === "👍")).toBe(true);
});

it("tüm tepki emojileri inline render edilir", () => {
  render(<ControlBar />);
  for (const e of MEETING_REACTIONS) {
    expect(screen.getByLabelText(e)).toBeInTheDocument();
  }
});
```
> Not: mevcut testte `👍` zaten dropdown içindeyken DOM'da olabilir (gizli ama render'lı). O yüzden ilk test davranışı (sendReaction çağrısı) ayırt edicidir. Eğer mevcut bir reaction testi dropdown toggle'a bağlıysa, onu inline davranışa güncelle.

- [ ] **Step 2: Testi çalıştır, durumu gör**

Run: `npm test -- ControlBar.test.tsx`
Expected: İlk test PASS olabilir (emoji zaten DOM'da) ama bu kabul edilebilir; asıl amaç inline'a geçiş. Yine de Step 3 sonrası ikisi de PASS olmalı. (Eğer mevcut testte `getByLabelText("👍")` çoklu eşleşme veriyorsa Step 3 bunu tekilleştirir.)

- [ ] **Step 3: Dropdown'ı inline grupla değiştir**

Yukarıdaki reactions bloğunu (`{/* Reactions — Flowbite dropdown */}` ... kapanış `</div>`) tamamen şununla değiştir:
```tsx
{/* Reactions — inline (tek tık) */}
<div
  role="group"
  aria-label={t("react")}
  className="inline-flex items-center gap-1 rounded-full border border-gray-800 bg-gray-800 px-1"
>
  {MEETING_REACTIONS.map((e) => (
    <button
      key={e}
      type="button"
      aria-label={e}
      onClick={() => act().sendReaction(e)}
      className="cursor-pointer rounded-full px-2 py-1 text-xl outline-none hover:bg-gray-700"
    >
      <span aria-hidden>{e}</span>
    </button>
  ))}
</div>
```
Sonra: `HiOutlineFaceSmile` import'u başka yerde kullanılmıyorsa import listesinden kaldır (grep ile doğrula: `grep -n HiOutlineFaceSmile src/features/meetings/components/ControlBar.tsx`).

- [ ] **Step 4: Testi çalıştır, PASS gör**

Run: `npm test -- ControlBar.test.tsx`
Expected: PASS (her iki test). Ayrıca `npm run typecheck` → ControlBar.tsx'te yeni hata yok (kullanılmayan import bırakılmadı).

- [ ] **Step 5: Commit**
```bash
git add src/features/meetings/components/ControlBar.tsx src/features/meetings/components/ControlBar.test.tsx
git commit -m "feat(meetings): toplantı tepkilerini inline yap (2 tık→1 tık)"
```

---

## Task 2: Doğrulama

- [ ] **Step 1: Typecheck** — Run: `npm run typecheck` → exit 0.
- [ ] **Step 2: Meetings testleri** — Run: `npm test -- src/features/meetings` → tüm PASS.
- [ ] **Step 3: Tam paket** — Run: `npm test` → PASS.
- [ ] **Step 4: Build (opsiyonel)** — Run: `npm run build` → başarılı.
- [ ] **Step 5: Kabul kriterleri** — Spec'teki 4 kriteri doğrula.
- [ ] **Step 6:** `superpowers:finishing-a-development-branch` ile merge/PR kararı.

---

## Self-Review notları

- **Spec kapsamı:** P3 (inline tepki) Task 1. Karşılandı.
- **Yeniden kullanım:** `sendReaction`, `MEETING_REACTIONS`, `t("react")` mevcut — yeni i18n/store yok (DRY).
- **Tip tutarlılığı:** `sendReaction(emoji)` mevcut imzayla; `reactions` FloatingReaction[].
- **Temizlik:** Kullanılmayan `HiOutlineFaceSmile` import'u kaldırılır.
- **Yıkıcı koruma:** Yıkıcı işlem yok.
- **Risk:** Tek bileşen, tek blok. Çok düşük.
