# Responsive Master Plan & Orkestrasyon (TeamsLike Web)

**Tarih:** 2026-06-20
**Amaç:** İki denetim raporunu tek plana toplamak, çakışmasız çalışan agent'lar tanımlamak ve bunları yöneten bir orkestrasyon kurmak.
**Kaynak raporlar:** [`RESPONSIVE_AUDIT.md`](./RESPONSIVE_AUDIT.md) (bilinen sorunlar, 46 bulgu) + [`RESPONSIVE_BEST_PRACTICES_GAPS.md`](./RESPONSIVE_BEST_PRACTICES_GAPS.md) (modern boşluklar, ~12 boyut).

> **Altın kural:** Aynı dosyaya iki agent aynı anda dokunmaz. Çakışmasızlık **dosya sahipliği** + **fazlama** ile garanti edilir. Yalnızca responsive className/CSS değişir; iş mantığı/işlevsellik korunur.

---

## 1. Birleştirilmiş Bulgu Özeti

| Kaynak | P0 | P1 | P2 | Toplam |
|---|---:|---:|---:|---:|
| RESPONSIVE_AUDIT.md (taşma/scroll/typo/sizing) | 7 | 15 | 24 | 46 |
| BEST_PRACTICES_GAPS.md (modern boyutlar) | 1 | 3 | 7 | ~11 |
| **TOPLAM** | **8** | **18** | **31** | **~57** |

### P0 — Önce bunlar (kullanılamaz / sistemik)
1. **[IOS_INPUT_ZOOM]** `index.css:159` `.input` = 14px → iOS'ta her form alanı zoom yapar (113+ kullanım). → `@apply text-base md:text-sm`.
2. **[V_CLIP]** `components/ui/Modal.tsx:36-39` — `max-h`/scroll yok; uzun içerik erişilemez (33+ kullanım).
3. **[V_CLIP]** `features/tasks/KanbanBoard.tsx` — sayfa scroll kabı yok; mobilde alta scroll olmuyor.
4. **[V_CLIP]** `features/phone/MessagesPane.tsx:86` — kök `min-h-0`/scroll kabı yok.
5. **[X_OVERFLOW]** `features/phone/MessagesPane.tsx:86-87` — paneller 320px'de yan yana taşıyor.
6. **[X_OVERFLOW]** `features/meetings/MeetingLobbyPage.tsx:300,303` — `w-[512px]` mobilde taşıyor.
7. **[X_OVERFLOW]** `features/messaging/components/MessageComposer.tsx:247` — ~9 buton wrap'siz, 320px'i aşıyor.

### Sistemik kök nedenler (en yüksek kaldıraç — Faz 0)
- `<main overflow-hidden>` + sayfa scroll kabı eksikliği (V_CLIP) → tekrar eden `flex h-full min-h-0 flex-col` + `flex-1 min-h-0 overflow-y-auto` deseni.
- Paylaşılan primitive eksikleri: `Modal`/`Dropdown` (max-h+scroll), `Tabs` (yatay scroll), `Tooltip` (clamp+break-words), `Select` (maxHeight alt sınır).
- `.input` 16px (iOS zoom), global `overflow-wrap`, `.tl-rte` clamp, `viewport-fit=cover`.
- Mobil viewport disiplini: `100vh/h-screen` → `dvh`; `env(safe-area-inset)`; hover→`pointer:coarse` fallback.

---

## 2. Çakışmasız Çalışma Modeli — Dosya Sahipliği

Her dosya **tam olarak bir** agent'a aittir. Sahiplik ayrık olduğu için paralel düzenleme çakışmaz.

### Faz 0 — Foundation (TEK agent, SIRALI, Faz 1'den önce biter)
Paylaşılan/sistemik dosyaların **tek** sahibi:
```
web/index.html
web/src/styles/index.css
web/src/components/ui/Modal.tsx
web/src/components/ui/Overlay.tsx
web/src/components/ui/Dropdown.tsx
web/src/components/ui/Tabs.tsx
web/src/components/ui/Tooltip.tsx
web/src/components/ui/Select.tsx
```

### Faz 1 — Feature alanları (6 agent, PARALEL, ayrık dizinler)
| Agent | Sahip olduğu dizinler |
|---|---|
| **M — Messaging** | `web/src/features/messaging/**` |
| **V — Meetings/Webinar** | `web/src/features/meetings/**`, `web/src/features/webinar/**` |
| **P — Phone/Support** | `web/src/features/phone/**`, `web/src/features/support/**` |
| **S — Scheduling/Docs** | `web/src/features/docs/**`, `admin/**`, `appointments/**`, `booking/**`, `tasks/**` |
| **I — Intelligence** | `web/src/features/intelligence/**`, `copilot/**`, `canvas/**`, `clips/**` |
| **A — Shell/Nav** | `web/src/components/layout/**`, `features/dashboard/**`, `auth/**`, `portal/**`, `settings/**`, `users/**` |

> i18n dosyaları (`src/i18n/locales/**`) yalnızca ilgili feature agent'ı tarafından, kendi anahtarları için düzenlenir; çakışma riski yok (her agent farklı namespace).

### Faz 2 — Doğrulama (orkestratör)
`tsc --noEmit` + `vite build` + yatay-taşma kontrolü. Hata varsa ilgili faz/agent'a geri besle.

---

## 3. Orkestrasyon Tasarımı

Orkestratör (Workflow) deterministik olarak şu akışı yönetir:

```
Faz 0 (foundation, 1 agent)  ──►  Faz 1 (6 feature agent, paralel)  ──►  Faz 2 (doğrulama)
        SIRALI                          ayrık dosya sahipliği                 tsc + build
   primitive'ler önce                   → çakışma imkânsız              hata → rapor
```

- **Bariyer:** Faz 0 tamamen bitmeden Faz 1 başlamaz (feature'lar düzeltilmiş primitive'lere dayanır).
- **Paralellik:** Faz 1'deki 6 agent ayrık dizinlere sahip → eşzamanlı `Edit` güvenli.
- **İzolasyon:** Dizinler ayrık olduğundan worktree gerekmez; tek çalışma ağacında farklı dosyalar düzenlenir.
- **Geri besleme:** Faz 2 `tsc` hatası bulursa, hatalı dosyanın sahibi agent'a düzeltme görevi verilir.

---

## 4. Agent Rolleri (kişilik + uzmanlık)

| Rol | Kişilik / uzmanlık | Görev özeti |
|---|---|---|
| **F0 — Sistem Mimarı** | "Tek doğru kaynak" titizliği; paylaşılan primitive ustası | Modal/Dropdown/Tabs/Tooltip/Select + index.css + index.html sistemik düzeltmeleri |
| **M — Messaging Uzmanı** | Çok-panelli sohbet ergonomisi | Composer wrap, MailInbox/MessageRead scroll kabı, badge truncate, RichText break-words |
| **V — Toplantı/Webinar Uzmanı** | Video/sahne düzenleri, dvh disiplini | Lobby `w-[512px]`, Stage grid, drawer `w-80`, kontrol barı safe-area, EventManager/EventLive yükseklik |
| **P — Telefon/Destek Uzmanı** | Dialer + tablo responsive | MessagesPane yığma+scroll, KeypadPanel scroll, sabit `w-NN` Select'ler, ActiveCallBar safe-area |
| **S — Planlama/Doküman Uzmanı** | Takvim/tablo/kanban | KanbanBoard scroll kabı, AvailabilityEditor flex-wrap, GanttView grid, padding `p-4 md:p-6` |
| **I — Zeka/Üretkenlik Uzmanı** | KPI/kart/kanvas | Copilot drawer max-w + hover-touch, IntelligencePage hover-touch, BlockCard/CanvasPage grid |
| **A — Kabuk/Navigasyon Uzmanı** | Global çatı, dvh, dashboard | Topbar h1 truncate, Portal header, dashboard/auth/settings dvh + safe-area |

Her feature agent'ı, kendi dosyaları için **hem** `RESPONSIVE_AUDIT.md` **hem** `BEST_PRACTICES_GAPS.md` bulgularını uygular (dvh, safe-area, hover-touch, touch-target, text-wrap, w-NN→responsive dahil).

---

## 5. Her Agent İçin Ortak Kurallar (sistemi bozmama)

1. **Yalnızca responsive değişiklik**: className/CSS/responsive varyant. İş mantığı, prop arayüzü, state, i18n anahtar adları DEĞİŞMEZ (yeni anahtar eklenebilir).
2. **CLAUDE.md'ye uy**: Tailwind utility öncelikli; `index.css`'e component-özel CSS yazma (yalnızca F0 sistemik kurallar için dokunur). Animasyon Tailwind ile; `motion-safe`/`prefers-reduced-motion` korunur.
3. **Token kullan**: `text-ink`/`text-muted`/`bg-surface`/`border-line` vb.; yeni hex uydurma. WCAG AAA kontrast korunur.
4. **Desen tutarlılığı**:
   - Scroll kabı: `flex h-full min-h-0 flex-col` (kök) + `flex-1 min-h-0 overflow-y-auto` (içerik).
   - Sabit genişlik: `w-NN` → `w-full sm:w-NN` veya `w-[min(NNrem,100vw)]`.
   - dvh: `h-screen`→`h-[100dvh]`, `calc(100vh-…)`→`calc(100dvh-…)`, `max-h-[70vh]`→`max-h-[70dvh]`.
   - safe-area: sabit alt bar → `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.
   - hover→touch: `group-hover:opacity-100` yanına `[@media(pointer:coarse)]:opacity-100`.
   - Yatay aksiyon satırı: `flex-wrap` veya `overflow-x-auto` + `shrink-0`.
5. **Doğrulama**: Değişiklikten sonra kendi alanında bariz tip/syntax hatası bırakma; nihai `tsc` Faz 2'de.
6. **Rapor**: Her agent, değiştirdiği `dosya:satır` + uyguladığı bulgu özetini döndürür.

---

## 6. Uygulama Sırası (öncelik)

1. **Faz 0** — sistemik primitive'ler + `.input` 16px + viewport-fit + global overflow-wrap (en yüksek kaldıraç).
2. **Faz 1 / P0'lar** — KanbanBoard, MessagesPane, MeetingLobby, MessageComposer.
3. **Faz 1 / P1'ler** — scroll kapları, dvh, safe-area, hover-touch, flex-wrap, truncate.
4. **Faz 1 / P2'ler** — sabit `w-NN`, padding, touch-target, text-wrap, küçük grid önekleri.
5. **Faz 2** — `tsc --noEmit` + `vite build`; 320/375/768/1024px taşma kontrolü.

---

## 7. Doğrulama Ölçütleri

- [ ] `npx tsc --noEmit` temiz.
- [ ] `vite build` başarılı.
- [ ] 320px'de hiçbir sayfada yatay scroll (`scrollWidth <= clientWidth`).
- [ ] Mobilde her sayfa dikey scroll edilebiliyor, içerik kırpılmıyor.
- [ ] iOS'ta form input'una dokununca zoom olmuyor (≥16px).
- [ ] Sabit alt çubuklar home-indicator ile çakışmıyor.
- [ ] Hover-only aksiyonlar dokunmatikte erişilebilir.
- [ ] WCAG AAA kontrast ve reduced-motion korunmuş.
