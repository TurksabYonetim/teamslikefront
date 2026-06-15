# Meetings — Inline tepki (Tasarım Spec)

**Tarih:** 2026-06-15
**Modül:** `web/src/features/meetings`
**Program:** UX "3 tık → 1 tık" — modül-sıralı (3/9: meetings)
**Yaklaşım:** B — tepkiyi düzelt (klavye yok)

## Amaç

Toplantı sırasında tepki göndermeyi 2 tıktan 1 tıka indirmek. Bugün ControlBar'da
tepkiler bir Flowbite dropdown arkasında: smiley'e tıkla → açılır → emoji seç (2 tık).
İnline yapıldığında tek tık olur.

## Kapsam

- **Yalnız** `src/features/meetings/components/ControlBar.tsx` reactions bloğu (~satır 147-170)
  ve testi `ControlBar.test.tsx`.
- Klavye kısayolu YOK (yaklaşım B). Yeni i18n YOK. Store değişmez.

### Kapsam dışı (YAGNI)
- Klavye kısayolları (yaklaşım A — ileride).
- Diğer ControlBar butonları.

## Mevcut durum

`ControlBar.tsx` (~147-170): `RoundBtn` smiley'i `data-dropdown-toggle="reactions-dd"`
ile gizli `#reactions-dd` div'ini açar; içinde `MEETING_REACTIONS` emoji butonları
`onClick={() => act().sendReaction(e)}`.

Sabitler/aksiyonlar: `MEETING_REACTIONS = ["👍","👏","🎉","❤️","😂","✋"]`
(`meetings.store.types`); `meetingStore.getState().sendReaction(emoji)` →
`reactions: FloatingReaction[]` dizisine `{id, emoji}` ekler (2.6s sonra otomatik düşer).

## Tasarım

Dropdown bloğunu **inline kompakt tepki grubuyla** değiştir:
- Kapsayıcı: `<div role="group" aria-label={t("react")} className="inline-flex items-center gap-1 rounded-full border border-gray-800 bg-gray-800 px-1">`.
- İçinde 6 `MEETING_REACTIONS` emoji butonu; her biri:
  `<button type="button" aria-label={e} onClick={() => act().sendReaction(e)}
   className="cursor-pointer rounded-full px-2 py-1 text-xl outline-none hover:bg-gray-700">`
  (mevcut dropdown emoji buton stiliyle aynı).
- `data-dropdown-toggle` smiley butonu ve gizli `#reactions-dd` kaldırılır.
- `t("react")` grup `aria-label`'ı için yeniden kullanılır → yeni i18n yok.

### Yerleşim
ControlBar zaten `flex flex-wrap items-center justify-center gap-2`; grup tek flex çocuğu
olarak akar, dar ekranda sarar. Sustur/kamera ilk sırada kalır.

## Hata / sınır durumları

- Yıkıcı işlem yok; tepki zararsız ve geçici.
- `prefers-reduced-motion` ve mevcut floating-reaction animasyonlarına dokunulmaz.
- `HiOutlineFaceSmile` import'u artık kullanılmıyorsa kaldırılır (lint temizliği).

## Test stratejisi (vitest + @testing-library/react)

`ControlBar.test.tsx` (mevcut desen):
- Emoji butonuna (`getByLabelText("👍")`) tıkla → `meetingStore.getState().reactions`
  içinde `r.emoji === "👍"` bir kayıt bulunur.
- 6 tepki butonunun da (`MEETING_REACTIONS`) render edildiğini doğrula.

## Kabul kriterleri

1. Toplantı tepkileri ControlBar'da inline görünür; tek tıkla gönderilir (dropdown yok).
2. `sendReaction` doğru emoji ile çağrılır; `reactions` state'i güncellenir.
3. Kullanılmayan dropdown işaretlemesi/elemanları kaldırılır.
4. `npm run typecheck` ve `npm test` temiz geçer.
