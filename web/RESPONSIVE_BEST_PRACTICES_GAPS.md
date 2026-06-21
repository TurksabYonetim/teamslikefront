# TeamsLike Web — İleri Responsive Boşluk Denetimi

**Denetçi:** Lena Marquardt — Kıdemli Responsive & CSS Mimarı (salt-okunur denetim; hiçbir dosya değiştirilmedi)
**Tarih:** 2026-06-20

**Yöntem:** Önce 2025–2026 güncel responsive/WCAG 2.2 en-iyi-pratikleri internetten (WebSearch) toplandı; sonra `index.html`, `src/styles/index.css` ve `src/` ağacı grep + dosya okuma ile bu pratiklere karşı doğrulandı. Her bulgu gerçek `dosya:satır` kanıtına dayanır. Kullanıcının `RESPONSIVE_AUDIT.md`'de zaten raporladığı bilinen sorunlar (yatay taşma, dikey scroll kırpılması, büyük yazı, sabit boyut) **tekrarlanmadı**; odak, akla gelmeyen modern boşluklar.

---

## ✅ Bağımsız Doğrulama (Kontrol)

Bu rapordaki sayısal iddialar, agent'tan bağımsız olarak ana denetçi tarafından grep ile yeniden doğrulandı — hepsi tutuyor:

| İddia | Doğrulama | Sonuç |
|---|---|---|
| viewport `user-scalable=no`/`maximum-scale` yok | `index.html:12` = `width=device-width, initial-scale=1.0` | ✅ |
| `.input` = `text-sm` (14px) | `index.css:160` `@apply ... text-sm` | ✅ |
| `dvh/svh/lvh`: 0 kullanım | grep = 0 | ✅ |
| `env(safe-area)`/`viewport-fit`: 0 | grep = 0 | ✅ |
| `@container`: 0 kullanım | grep'teki 6 eşleşme email/markdown regex'i, CQ değil | ✅ |
| `clamp()`: 0 | grep = 0 | ✅ |
| `<img srcset>`: 0 / toplam 32 img | grep = 0 / 32 | ✅ |
| global `overflow-wrap`/`hyphens`: 0 | grep = 0 | ✅ |
| `h-screen`/`100vh`: yaygın | grep = 20 | ✅ |

Halüsinasyon/uydurma tespit edilmedi; tüm bulgular gerçek koda dayanıyor.

---

## 1. Araştırma özeti — En-iyi-pratik ilkeleri ve kaynaklar

| # | İlke | Özet | Kaynak |
|---|------|------|--------|
| 1 | WCAG 1.4.10 Reflow | İçerik 320 CSS px'te (1280px @ %400 zoom) iki-eksenli scroll olmadan akmalı. | https://www.w3.org/WAI/WCAG21/Understanding/reflow.html |
| 2 | WCAG 1.4.4 Resize Text & viewport meta | Metin %200'e büyütülebilmeli; `user-scalable=no`/`maximum-scale` zoom'u engellememeli. | https://www.w3.org/WAI/standards-guidelines/act/rules/b4f0c3 |
| 3 | WCAG 2.5.8 Target Size (Min) | Tıklanabilir hedefler ≥ 24×24 CSS px veya 24px aralık. | https://silktide.com/accessibility-guide/the-wcag-standard/2-5/input-modalities/2-5-8-target-size-minimum/ |
| 4 | WCAG 2.5.5 / Apple HIG / Material | Önemli hedefler için 44×44 (Apple) / 48×48dp (Material). | https://dequeuniversity.com/rules/axe/4.6/target-size |
| 5 | Akışkan tipografi `clamp()` | Breakpoint sıçraması yerine `clamp()` ile sürekli ölçek. | https://web.dev/blog/viewport-units |
| 6 | `dvh/svh/lvh` vs `100vh` | Mobil tarayıcı çubuğu `100vh`'ı kırpar; `svh`/`dvh` (Baseline, Haz 2025). | https://web.dev/blog/viewport-units |
| 7 | Safe-area insets | `viewport-fit=cover` + `env(safe-area-inset-*)` çentik/home-indicator için. | https://developer.mozilla.org/en-US/docs/Web/CSS/env |
| 8 | Container queries (Tailwind v4) | `@container` ile bileşen-temelli responsive; v4'te yerleşik. | https://www.sitepoint.com/tailwind-css-v4-container-queries-modern-layouts/ |
| 9 | iOS input zoom | Input `font-size < 16px` → odakta otomatik zoom; çözüm ≥16px. | https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/ |
| 10 | `hover`/`pointer` media | Dokunmatikte hover'a bağlı gizli aksiyonlar erişilemez; `pointer:coarse` fallback. | https://github.com/heroui-inc/heroui/issues/5326 |
| 11 | Responsive görseller | `srcset`/`sizes`, `width/height` (CLS), `loading=lazy`. | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img |
| 12 | Uzun metin kırma | `overflow-wrap`/`hyphens`; `truncate` içerik gizleyebilir (1.4.10). | https://www.w3.org/WAI/WCAG21/Understanding/reflow.html |

---

## 2. Boşluk bulguları

### [VIEWPORT_ZOOM] Viewport meta zoom'u engellemiyor — ✅ uygun
- **Durum:** `index.html:12` → `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`. `maximum-scale`/`user-scalable=no` YOK.
- **Olması gereken:** Tam bu hali.
- **Önem:** Yok — WCAG 1.4.4 açısından temiz. (Tek eksik: `viewport-fit=cover` yok; bkz. SAFE_AREA.)

### [IOS_INPUT_ZOOM] Tüm form input'ları iOS'ta odakta otomatik zoom yapar
- **Durum:** `index.css:159-163` `.input` sınıfı `text-sm` (14px); kod tabanında **113 kez** kullanılıyor; ayrıca **183 ham `<input>`** var. `text-base` (16px) input neredeyse yok.
- **Olması gereken:** Input `font-size ≥ 16px` (iOS zoom yalnızca <16px'te tetiklenir). `user-scalable=no` ile susturmak 1.4.4 ihlali olur — doğru çözüm fontu büyütmek.
- **Önem:** **P0** — Her form alanına dokununca iPhone sayfayı zoomlar, layout zıplar. En yaygın mobil hata; 113+ kullanım → sistemik.
- **Öneri:** `.input` → `@apply text-base md:text-sm` (masaüstü 14px korunur, mobil 16px). Ham input'lar için aynı pattern; `.msg-input` vb. de güncelle.

### [DVH_VIEWPORT] Ana kabuk ve tüm drawer/modal'lar `100vh` tabanlı — mobil tarayıcı çubuğu kırpar
- **Durum:** `AppShell.tsx:43` `flex h-screen overflow-hidden`; `index.css:71-75` `html,body,#root{height:100%}`. Drawer'lar `h-screen` (CopilotPage:504, BookingPage:273, RateConversationPage:79, MeetingRoom çoklu); içerik `h-[calc(100vh-Xrem)]` (SupportPage:156, MeetingRoom:366/737, CopilotPage:535); modal gövdeleri `max-h-[70vh]/50vh/40vh`. `dvh/svh/lvh`: **0**. (Toplam `h-screen/100vh` ≈ 20 yer.)
- **Olması gereken:** Mobil tam-yükseklik için `100dvh`/`100svh`.
- **Önem:** **P1** — `overflow-hidden` + `h-screen` ile mobilde adres çubuğu görünürken alt içerik/nav viewport dışına taşar.
- **Öneri:** `h-screen` → `h-[100dvh]`; `calc(100vh-…)` → `calc(100dvh-…)`; modal `max-h-[70vh]` → `max-h-[70dvh]`.

### [SAFE_AREA] Çentik/home-indicator güvenli alanı hiç ele alınmamış; sabit alt çubuklar çakışıyor
- **Durum:** `env(safe-area-inset-*)`/`viewport-fit=cover`: **0**. Kenara yapışan sabit elemanlar: `ActiveCallBar.tsx:124,458` (`fixed inset-x-0 bottom-0`), `MeetingRoomPage.tsx:419` kontrol çubuğu (`fixed bottom-0`), `WrapUpCard.tsx:33`.
- **Olması gereken:** `viewport-fit=cover` + alt-sabit elemanlara `padding-bottom: env(safe-area-inset-bottom)`.
- **Önem:** **P1** — iPhone (notch/Dynamic Island) ve gesture-bar'lı Android'de aktif çağrı çubuğu ve toplantı kontrolleri home-indicator altında kalır; kritik butonlara dokunmak zorlaşır.
- **Öneri:** Viewport meta → `...,viewport-fit=cover`; alt çubuklara `pb-[max(1rem,env(safe-area-inset-bottom))]`; sol drawer'lara landscape için `pl-[env(safe-area-inset-left)]`.

### [HOVER_TOUCH] Hover ile gizlenen aksiyonlar dokunmatikte erişilemez (desen var, tutarsız uygulanmış)
- **Durum:** `opacity-0 … group-hover:opacity-100` deseni 5 dosyada; yalnızca **`MessageBubble.tsx:213`** doğru `[@media(pointer:coarse)]:opacity-100` fallback'ine sahip. Düzeltilmemiş: `CopilotPage.tsx:321` (kopyala), `IntelligencePage.tsx:310` (sil — hiç fallback yok), `BlockCard.tsx:106,115` (`focus-within` var, touch yok), `MessagingSidebar.tsx:162` (`max-sm:opacity-100` viewport fallback — telefonda çalışır, tablet hover'a bağlı).
- **Olması gereken:** Gizli aksiyonlar `@media (pointer:coarse)`/`(hover:none)` altında her zaman görünmeli.
- **Önem:** **P1** — Telefon/tablet kullanıcısı mesaj kopyalayamaz, blok silemez/düzenleyemez.
- **Öneri:** `MessageBubble` desenini diğer 4 yere taşı: `[@media(pointer:coarse)]:opacity-100 [@media(pointer:coarse)]:pointer-events-auto`.

### [TOUCH_TARGET] Çok sayıda ikon hedefi 24px sınırında/altında (WCAG 2.5.8)
- **Durum:** İkon kapsayıcıları: `h-6 w-6` (24px) **37×**, `h-7 w-7` (28px) **10×**, `h-8 w-8` (32px) **39×**. `p-1`/`p-1.5` padding'li butonlar 10+ dosyada (webinar paneller, KanbanBoard, SettingsPage).
- **Olması gereken:** Tıklanabilir hedefler ≥ 24px (zorunlu 2.5.8); birincil aksiyonlar 44px (Apple HIG). Not: `RESPONSIVE_AUDIT.md`'deki "sabit boyut"tan farklı — buradaki odak WCAG dokunmatik ergonomi eşiği.
- **Önem:** **P2** — `h-6 w-6` minimumu geçer ama dokunmatik için sıkışık; `p-1` (4px) ikonlar 24px altına düşebilir.
- **Öneri:** Tıklanabilir ikon-butonlara dokunmatik alan: `p-2.5 + h-6 w-6 ikon = 44px hedef`; en azından `[@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11`.

### [FLUID_TYPE] `clamp()` ile akışkan tipografi hiç yok
- **Durum:** `clamp(`: **0**. Tüm tipografi sabit Tailwind step'leri + breakpoint sıçramaları; `index.css:921-926` `.tl-rte hN` sabit `rem`.
- **Olması gereken:** Başlık/hero için `clamp(min, fluid, max)` ile breakpoint'siz ölçek.
- **Önem:** **P2** — İşlevsel hata değil; orta genişlikte tipografi adımlı görünür.
- **Öneri:** Sayfa başlıkları + `.tl-rte h1/h2` için `clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)`; JSX'te `text-[clamp(...)]`.

### [CONTAINER_QUERY] Container query (`@container`) hiç kullanılmıyor
- **Durum:** `@container`/Tailwind CQ varyantları: **0** (grep'teki eşleşmeler email/markdown regex'i). Tüm responsive global breakpoint'lerle.
- **Olması gereken:** Bileşen-temelli responsive için Tailwind v4 yerleşik `@container`.
- **Önem:** **P2** — Mevcut kod çalışır; sidebar daraldığında/genişlediğinde kartlar viewport yerine container'a tepki verseydi daha sağlam olurdu. Modern boşluk, akut hata değil.
- **Öneri:** Yeniden-kullanılan kart/panelleri sarmalayan kapsayıcıya `@container`, içeriğe `@sm:grid-cols-2 @lg:grid-cols-3`.

### [RESP_IMAGE] `<img>`'lerde `srcset`/boyut/lazy büyük ölçüde eksik (CLS riski)
- **Durum:** **32 `<img>`**; `srcset`/`sizes`: **0**; `loading="lazy"`: yalnızca 1 (`ClipCard.tsx:58`). Çoğu avatarda explicit `width/height` yok; `Notifications.tsx:529` görseli boyutsuz.
- **Olması gereken:** `<img>`'lere intrinsic `width`/`height` (CLS), `loading="lazy"`, uygun olduğunda `srcset`/`sizes`.
- **Önem:** **P2** — Avatar etkisi sınırlı; içerik görselleri (ClipCard, Notifications) boyutsuz yüklenince mobilde layout kayması.
- **Öneri:** Tüm `<img>`'lere `width`/`height`; ekran-dışı olabilecekler için `loading="lazy"`; raster içeriğe `srcset`.

### [TEXT_WRAP] Global `overflow-wrap`/`hyphens` yok; `truncate` aşırı kullanımı içerik gizler
- **Durum:** Global `overflow-wrap`/`hyphens`/`word-break`: **0**. Buna karşılık `truncate` **123×**, `break-all` 3, `break-words` 4. Uzun e-posta/URL/kanal adları için global koruma yok.
- **Olması gereken:** Gövde metninde `overflow-wrap: anywhere` taban; `truncate` yerine yerinde `break-words`.
- **Önem:** **P2** — 320px'te uzun token yatay taşma (1.4.10) veya `truncate` ile bilgi kaybı. (`RESPONSIVE_AUDIT.md`'deki genel taşmadan farklı: kırpılamayan token + `truncate` erişilebilirlik maliyeti.)
- **Öneri:** `body`'ye `overflow-wrap: anywhere;`; sarmalanması gereken yerlerde `truncate` yerine `break-words`/`min-w-0` (zaten `.sp-name`'de doğru, yaygınlaştır).

### [ORIENTATION] Landscape / kısa-yükseklik senaryosu hiç ele alınmamış
- **Durum:** `orientation`/`landscape`/kısa-yükseklik media query: **0**. Modal gövdeleri `max-h-[70vh]/50vh/40vh` + üst/alt sabit çubuklar.
- **Olması gereken:** Kısa-yükseklik için `@media (max-height: …)` veya `dvh` tabanlı esnek yükseklik.
- **Önem:** **P2** — Yatay tutuşta (toplantı/booking modalleri) içerik kesilir; klavye açıkken daha da daralır.
- **Öneri:** Modal gövdeleri `max-h-[70dvh]` + `landscape:max-h-[85dvh] landscape:py-2`.

### [BREAKPOINT_STRATEGY] Mobile-first tutarlı — ✅ büyük ölçüde uygun
- **Durum:** Tutarlı mobile-first (`md:`/`lg:` yukarı genişletme; `max-sm:` yalnızca birkaç bilinçli istisna). Keyfi breakpoint karmaşası yok.
- **Önem:** Yok. Tek not: container query yokluğu breakpoint'lere aşırı bağımlılık yaratıyor.

---

## 3. `RESPONSIVE_AUDIT.md` ile çakışmama notu

Bu rapor, `RESPONSIVE_AUDIT.md`'deki **yatay taşma / dikey scroll kırpılması / büyük yazı / sabit boyut** maddelerini tekrarlamaz. Yeni boyutlara odaklanır: IOS_INPUT_ZOOM, DVH_VIEWPORT, SAFE_AREA, HOVER_TOUCH, FLUID_TYPE, CONTAINER_QUERY, RESP_IMAGE, TEXT_WRAP (uzun-token + `truncate` erişilebilirlik açısı), ORIENTATION ve TOUCH_TARGET (WCAG 2.5.8/2.5.5 dokunmatik ergonomi). TOUCH_TARGET ve TEXT_WRAP yüzeyde eski rapora yakın görünse de farklı sebep + farklı çözümle ele alındı.

---

## 4. Özet tablo

| Boyut | Bulgu | Önem |
|-------|-------|------|
| VIEWPORT_ZOOM | ✅ uygun | — |
| IOS_INPUT_ZOOM | 1 | **P0** |
| DVH_VIEWPORT | 1 | P1 |
| SAFE_AREA | 1 | P1 |
| HOVER_TOUCH | 4 dosya düzeltilmemiş | P1 |
| TOUCH_TARGET | 1 | P2 |
| FLUID_TYPE | 1 | P2 |
| CONTAINER_QUERY | 1 | P2 |
| RESP_IMAGE | 1 | P2 |
| TEXT_WRAP | 1 | P2 |
| ORIENTATION | 1 | P2 |
| BREAKPOINT_STRATEGY | ✅ uygun | — |

**Öncelik:** P0 → IOS_INPUT_ZOOM (113+ kullanım). P1 → DVH_VIEWPORT, SAFE_AREA, HOVER_TOUCH. P2 → kalanlar (kalite/modernizasyon).

**Genel değerlendirme:** Temeller doğru (viewport meta, mobile-first, reduced-motion + `hover:hover` guard'ları örnek nitelikte). Ana modern boşluklar: iOS input zoom (kritik), `dvh`/safe-area mobil viewport disiplini, hover-touch deseninin tutarsız uygulanması, ve `clamp()`/container-query'nin hiç kullanılmaması.
