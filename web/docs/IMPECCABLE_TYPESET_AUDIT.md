# impeccable typeset + audit raporu — TeamsLike

Tarih: 2026-06-15 · 195 dosya · 179 dosyada bulgu · 725 bulgu

## Sağlık Skoru: 15.7/20 (İyi)

| Boyut | Skor |
|---|---|
| a11y | 3.1/4 |
| responsive | 3.8/4 |
| theming | 3.1/4 |
| antipattern | 3.7/4 |
| performance (build) | 2/4 |


## src/components/CommandPalette.tsx  (2)

CommandPalette is a clean, well-built Cmd/Ctrl+K palette that largely meets the impeccable bar. Typography uses the fixed scale (text-sm body), theming is fully token-driven (bg-brand, text-ink, border-line, text-muted, bg-surface-2 — no hardcoded hex or random gray-XXX), borders are full 1px (no banned side-stripes), and there are no AI-slop tells (no gradient text, eyebrows, glassmorphism, or hero-metric template). Semantics and a11y are strong: real button elements, role=dialog/listbox/option, aria-modal, aria-selected, aria-labels, keyboard navigation (arrows/enter/escape), and motion-safe gating. Two minor findings: a text-[10px] arbitrary size on the ESC kbd hint violates the 12px floor (map to text-xs), and the search placeholder uses placeholder:text-muted rather than the standard placeholder-gray-400, slightly weakening contrast/consistency. The borderless input is acceptable here since the border lives on the wrapper row, a valid command-palette pattern. a11y scored 3 (not 4) because the dialog lacks focus trapping/restore beyond the initial input focus and the active-row contrast relies on bg-brand white text which is fine, but the sub-floor kbd text is an accessibility nit.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 99: kbd ESC hint | P2 | ✓ | text-[10px] is an arbitrary px size below the 12px floor and is unreadable; map to the scale's caption/meta token text-x |
| input | line 96: search input placeholder | P3 | ✓ | placeholder:text-muted is lighter than the design-system placeholder token. Use placeholder-gray-400 (the standard input |

## src/components/LanguageSwitcher.tsx  (3)

LanguageSwitcher is a clean, well-built segmented TR/EN toggle. Typography is fully compliant (text-xs font-semibold is correct for a compact toggle label, at the scale floor; no oversized text, no arbitrary px, no eyebrow, no font-light, no gradient text). Borders are a single 1px full border (no banned side-stripes). Accessibility is strong: semantic <button type=button>, aria-pressed reflecting state, role=group with aria-label, active state has strong contrast (white on bg-primary-700), and motion-safe scale on press. No antipattern tells. Only nits: two spots use raw gray-200/gray-500/gray-900 where ink/muted/line tokens would be more consistent (P3 theming), and the touch target is slightly under 44px on mobile (P3).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | line 12: className container border | P3 | ✓ | border-gray-200 is the raw value behind the border-line token. Use the semantic token for divider/card borders so the se |
| theming | line 26: inactive button colors | P3 | ✓ | Hard-coded gray-500/gray-900 for an inactive label and its hover state bypass the ink/muted tokens used elsewhere; map t |
| a11y | lines 17-30: toggle button hit area (px-2.5 py-1 text-xs) | P3 | manuel | py-1 + text-xs yields roughly a 24px tall target, below the 44px touch-target guideline; acceptable on desktop but tight |

## src/components/layout/AppShell.tsx  (3)

AppShell.tsx is a clean, thin layout wrapper (responsive double-sidebar with a mobile drawer). It contains no typography, inputs, or borders, so the typeset review and those technical dimensions are non-applicable. Responsive behavior is exemplary: fixed drawer with translate-x transitions, md: breakpoints, min-w-0 to prevent overflow, and overflow-hidden containment. No AI-slop antipatterns (no gradient text, eyebrows, side-stripe borders, glassmorphism, or hero-metric template). The only real issues are theming: three hard-coded grays (bg-gray-50 root, bg-white content, bg-gray-900/50 backdrop) that should map to surface tokens, and one minor a11y polish item (decorative backdrop div lacks aria-hidden). All findings are low-severity, localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | line 42: <div className="flex h-screen overflow-hidden bg-gr | P2 | ✓ | The root app background is hard-coded to gray-50 instead of the design token. The product defines a surface scale (surfa |
| theming | line 66: <main className="flex flex-1 flex-col overflow-hidd | P3 | ✓ | Content surface is hard-coded bg-white rather than the surface token. Tokenizing keeps the shell consistent with theming |
| a11y | line 47-52: backdrop <div ... onClick={() => setOpen(false)} | P3 | ✓ | The dimming backdrop is a purely decorative click-to-dismiss surface with no role or label; marking it aria-hidden keeps |

## src/components/layout/MobileTopbar.tsx  (2)

Small, structurally clean mobile topbar (fixed header, md:hidden, sr-only labels on both icon buttons, semantic <button>/<header>). No typography, border-stripe, or input findings; no AI-slop antipatterns. Two real issues: (1) P1 a11y — the notification/bell button lacks any focus ring while the sibling menu button has one, breaking keyboard focus visibility and styling consistency; (2) P3 theming — colors are hard-coded grays (bg-white, border-gray-200, text-gray-500/600) instead of design tokens (surface/line/muted/ink). Touch targets: 24px icon + p-2 padding ≈ 40px, slightly under the 44px ideal but acceptable. Responsive behavior is solid.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Bell button line 17: <button className="p-2 rounded-lg text- | P1 | ✓ | The menu button has a visible focus ring but the notification button has none, so keyboard users get no focus indicator  |
| theming | header line 7 and both buttons (lines 10, 17): bg-white, bor | P3 | ✓ | Raw hard-coded grays (bg-white, border-gray-200, text-gray-600/500) bypass the design-token system (surface/line/ink/mut |

## src/components/layout/Sidebar.tsx  (7)

Sidebar.tsx is structurally clean and free of AI slop tells (no gradient text, no eyebrows, no side-stripe borders, no glassmorphism; the collapse animation via grid-template-rows is tasteful, and semantic button/NavLink/ul markup is used throughout). The main issues are: (1) the shared ITEM style uses text-base font-normal where the product scale fixes nav labels at text-sm font-medium, making every nav row one step too large; (2) pervasive hard-coded grays (text-gray-900, bg-white, border-gray-200, text-gray-500) bypass the existing ink/surface/line/muted tokens defined in styles/index.css; and (3) icon-only controls (collapse toggle, collapsed logout) rely on title alone for their accessible name with no aria-label, and decorative icons are not aria-hidden. Responsive behavior is handled well (max-w clamp on mobile, md: gates for the desktop-only toggle). Fixing the type role and swapping raw grays to tokens are localized className changes; the a11y naming requires small aria additions.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | ITEM constant, line 50 | P1 | ✓ | Sidebar nav labels are body-emphasis/label role, which the product scale fixes at text-sm (14px) font-medium. text-base  |
| theming | itemCls, line 55; Group button, line 115; Leaf icon active b | P2 | ✓ | --color-ink (#111827) is defined as the gray-900 token and the product expects ink for primary text. Raw text-gray-900 b |
| theming | main panel, line 173; section divider, line 197 | P2 | ✓ | --color-surface (#ffffff) and --color-line (#e5e7eb / gray-200) tokens exist for exactly this. Hard-coded bg-white and b |
| theming | logout button line 205; collapse toggle line 225 | P3 | ✓ | --color-muted (#6b7280 / gray-500) is the secondary-text token; text-gray-500 hard-codes it. Same for the collapse/expan |
| a11y | collapse/expand toggle button, lines 221-230 | P1 | ✓ | This icon-only button has no text content; title alone is not a reliable accessible name (not exposed by all AT, invisib |
| a11y | logout button (collapsed state), lines 202-209 | P1 | ✓ | When collapsed the button renders only the icon (label span is hidden) and relies solely on title for its name; title is |
| a11y | Group toggle Icon name="chevronDown", line 121; Leaf Icons l | P3 | ✓ | Decorative chevrons and the duplicate leading icons (the label text already conveys meaning) should be hidden from assis |

## src/components/layout/Topbar.tsx  (2)

Topbar is a tiny, mostly clean header. Two real defects, both typographic: the h1 uses arbitrary text-[17px] (should be the scale's text-xl / 20px for a page title, plus an explicit text-ink token), and the subtitle uses an arbitrary fractional text-[12.5px] (should be text-xs / 12px). No antipattern tells (no gradients, eyebrows, side-stripe borders, glass). Border (border-b border-line) and surface tokens are correct. a11y/theming docked slightly for the missing text-ink on the title; responsive is fine structurally (fixed h-14 is an intentional toolbar height, not a width that breaks mobile).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 12 — h1 title | P1 | ✓ | Arbitrary text-[17px] is off the fixed type scale and is banned. The h1 page-title role is text-xl (20px) font-semibold  |
| typography | Line 13 — subtitle | P1 | ✓ | Arbitrary fractional text-[12.5px] is off-scale and banned. A subtitle/meta beside the title maps to caption text-xs (12 |

## src/components/PlaceholderPage.tsx  (2)

PlaceholderPage is a small, clean empty-state component that largely respects the design system: it uses tokens throughout (bg-surface-2, bg-brand-soft, text-brand, text-muted, text-ink-2), is structurally responsive (grid place-items-center, max-w-xs, no fixed px widths), and carries no AI-slop tells (no gradient text, no eyebrow, no side-stripe borders, no glassmorphism). Two real typeset issues: (1) text-[13.5px] is an arbitrary off-scale fractional pixel size on the body copy — map to text-sm; (2) the h2 title has no explicit size class so it falls off the type scale, and uses the secondary text-ink-2 color instead of the h2 role's text-base font-semibold text-ink. The decorative sparkles icon is non-essential so the lack of aria is acceptable, but the heading color/size weakens hierarchy slightly. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 18 — empty-state body copy `<p>` | P2 | ✓ | Arbitrary fractional px font size text-[13.5px] is off the fixed product scale and not even an integer pixel value. Body |
| typography | Line 17 — empty-state title `<h2>` | P2 | ✓ | The h2 has no explicit size class, so it inherits an ambient/browser size instead of the defined h2 section role (text-b |

## src/components/ui/Avatar.tsx  (4)

Small, focused Avatar component that is structurally clean (semantic-ish span, shrink-0, rounded-full grid centering, no gradients/eyebrows/side-stripes). Main issues are typography: the SIZES map hard-codes arbitrary px font sizes (text-[10px], text-[13px], text-[17px]) that violate the no-arbitrary-px rule and the 12px floor; all three should map to scale tokens (text-xs/text-sm/text-base). One minor theming issue: the default avatar color is a hard-coded hex (#5b5fc7) rather than a brand token; the inline style for dynamic per-user color is otherwise fine. a11y is decent but white text on an arbitrary user-supplied color can fall below 4.5:1 for light backgrounds (no contrast guard), and there is no aria-label/role=img so screen readers only get the initials.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | SIZES.xs (line 4): "w-6 h-6 text-[10px]" | P2 | ✓ | Arbitrary px font size below the 12px floor. text-[10px] is banned (unreadable and off-scale); map to the smallest scale |
| typography | SIZES.md (line 6): "w-9 h-9 text-[13px]" | P2 | ✓ | Arbitrary px font size text-[13px] is banned; map to nearest scale token text-sm (14px). |
| typography | SIZES.lg (line 7): "w-12 h-12 text-[17px]" | P2 | ✓ | Arbitrary px font size text-[17px] is banned and off-scale; map to nearest scale token text-base (16px). |
| theming | AvatarProps color default (line 31) + style={{ background: c | P3 | manuel | Hard-coded hex #5b5fc7 as the default avatar background bypasses design tokens (brand/ink/surface). Use the brand token  |

## src/components/ui/Badge.tsx  (1)

Badge.tsx is a clean, compliant primitive. Typography is correct for the role (text-xs font-medium, the badge/counter slot), with no oversized text, arbitrary px, eyebrows, font-light, or gradient text. No borders at all, so no side-stripe or border-color issues. Not an input. Touch-target/responsive concerns do not apply to an inline status pill, and there is no fixed-px width or overflow risk. The only real finding is a theming inconsistency: the neutral tone uses semantic design tokens (bg-surface-3/text-ink-2/bg-brand) while positive/warning/danger fall back to raw Tailwind palette colors (green/amber/red-100/700 and dark:gray-700), mixing two color vocabularies. Contrast for all colored tones (e.g. green-700 on green-100) clears WCAG AA. Strong file overall; lone improvement is routing status tones through semantic tokens.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | TONES map, lines 8-10 (positive/warning/danger) | P3 | manuel | The neutral tone uses design tokens (bg-surface-3, text-ink-2) but the status tones drop to raw Tailwind palette values  |

## src/components/ui/Button.tsx  (2)

Exemplary, near-impeccable Button. Theming is fully tokenized (bg-brand, text-ink, border-line, bg-surface-2/3, bg-danger, focus-visible:ring-brand/danger) with zero hard-coded hex or arbitrary grays. Typography is on-scale and consistent: rounded-lg + font-medium base, size variants use text-xs (sm) and text-sm (md/lg) within the system, no oversized type, no gradient text, no eyebrows, no side-stripe borders, no glassmorphism. Semantics are correct (real <button>, forwardRef, disabled tied to loading, focus:outline-none paired with a visible focus-visible:ring-2 ring-offset-1), and the press animation is a disciplined transform-only transition via design tokens (--dur-press, --ease-out, active:scale-[0.97]). Two real but minor issues: (1) the loading Spinner is hardcoded white, so it is invisible on the white `secondary` and transparent `ghost` variants; (2) sm/md heights (32px/40px) fall under the 44px touch target, fine for desktop density but worth guarding on touch surfaces. No antipattern or theming findings.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | SIZES constant, lines 26-27: `sm: "h-8 ..."` and `md: "h-10  | P3 | manuel | h-8 (32px) and h-10 (40px) are below the 44px WCAG 2.5.5 / mobile touch-target minimum. Acceptable for desktop toolbars  |
| a11y | Spinner render, line 52 | P2 | manuel | The loading spinner is hardcoded to white. On variant="secondary" (bg-white) and variant="ghost" (bg-transparent) the wh |

## src/components/ui/ConfirmDialog.tsx  (1)

Clean, compliant component. It is a thin wrapper that delegates layout and styling to the design-system Modal and Button primitives, renders semantic markup (<p>), correct body sizing (text-sm), Turkish-localized labels with sensible defaults, and a loading/danger state. No borders, inputs, side-stripes, eyebrows, gradients, fixed widths, or other AI tells. The only nit: the message paragraph uses the text-ink-3 token where the product body role specifies text-ink-2; both pass contrast, so this is a P3 token-consistency polish, not an a11y break.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 47: <p className="text-sm text-ink-3">{message}</p> | P3 | ✓ | Body copy in the product type scale is text-sm text-ink-2 (gray-700, #374151). This dialog message uses text-ink-3 (gray |

## src/components/ui/Dropdown.tsx  (2)

Small, well-constructed dropdown. Typography is fully compliant (text-sm body/items, no oversized text, no arbitrary px, no eyebrows, no gradient text), borders are clean (full border border-line, no side-stripes), and there are no input elements to fault. Origin-aware pop animation and motion-safe guards are a nice touch. Two real issues: (1) P1 a11y — DropdownItem uses outline-none with no focus-visible replacement, leaving keyboard users with no visible focus indicator on menu items (WCAG 2.4.7); the trigger likewise relies on default outline only. (2) P3 theming — a lone hard-coded bg-white on the menu surface while the rest of the file uses tokens (border-line, bg-surface-2, text-ink). Dark-mode raw grays (gray-700/800, text-white) follow the established project pattern so are not separately flagged.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | DropdownItem button, line 73 | P1 | ✓ | outline-none removes the native focus indicator with no replacement, so keyboard users navigating the menu have zero vis |
| theming | menu container, line 50 | P3 | ✓ | The rest of the file uses design tokens (border-line, bg-surface-2, text-ink). Raw bg-white is the lone hard-coded light |

## src/components/ui/Forbidden.tsx  (1)

Forbidden.tsx is a thin, well-built wrapper: it composes EmptyState with an i18n title/description and a 'key' icon, centering via a grid layout. No local typography, borders, or inputs are defined, so the typeset and design-system surfaces are clean (visual styling is owned by EmptyState/Icon, which are out of scope here). Theming, responsiveness (min-h-[60vh] place-items-center is structural, not fluid type), and antipattern hygiene are all solid. The only defensible nit is an a11y semantic mismatch: role=\"alert\" (assertive by default) is paired with aria-live=\"polite\", a contradictory pairing for what is really a passive permission-denied status; role=\"status\" is more appropriate.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | line 21-22: role="alert" aria-live="polite" | P3 | ✓ | role="alert" implies an assertive, time-sensitive message but is paired with aria-live="polite" (alert defaults to asser |

## src/components/ui/IconButton.tsx  (5)

Small, mostly clean icon-button primitive with good token usage (bg-brand, text-muted, surface-2) and motion-safe press feedback. No typography findings (renders only children). Two P1 issues: transition-[transform,colors] is invalid CSS so color transitions silently never run, and aria-pressed={primary} misuses toggle semantics for a pure styling variant. Plus a 36px sub-44px touch target, a missing focus-visible ring (inconsistent with the rest of the codebase), and a redundant hard-coded dark:text-gray-400 over the text-muted token.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | className line 17: transition-[transform,colors] | P1 | ✓ | transition-[transform,colors] emits `transition-property: transform,colors`, and `colors` is not a real CSS property, so |
| a11y | line 15: aria-pressed={primary} | P1 | ✓ | aria-pressed marks a toggle button's on/off state. Here `primary` is a visual variant, so every primary IconButton is an |
| a11y | line 17: h-9 w-9 (36px) hit area | P2 | ✓ | 36px square is below the 44px minimum touch target. As a shared icon-button primitive used across messaging/meeting tool |
| a11y | line 16-22: className has no focus-visible style | P2 | ✓ | The button defines no visible focus indicator, while sibling components (MeetingLobbyPage buttons use focus:ring-4, Clip |
| theming | line 20: dark:text-gray-400 alongside text-muted token | P3 | ✓ | text-muted is a semantic design token that should already resolve correctly in dark mode; pinning an extra dark:text-gra |

## src/components/ui/Modal.tsx  (6)

Modal.tsx is structurally clean (responsive max-w-md, motion-safe animations, no AI-slop tells like gradients, eyebrows, or side-stripe borders). The main issues are accessibility: the dialog lacks role=\"dialog\"/aria-modal/aria-labelledby, and the icon-only close button has no aria-label and a sub-44px touch target. Typography deviates once (text-lg title should be text-base on the scale). Theming uses hard-coded grays (gray-200/gray-900/white/gray-50) where the codebase otherwise uses border-line/text-ink/bg-surface tokens. All findings are localized className/attribute swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 34: <h3 className="text-lg font-semibold text-gray-900" | P2 | ✓ | text-lg (18px) is not on the product type scale. A modal title is an h2-level section heading, which is text-base (16px) |
| a11y | Lines 35-38: close <button onClick={onClose} ...> with icon- | P1 | ✓ | Icon-only button has no accessible name; screen readers announce nothing. Add aria-label (and type="button" to avoid imp |
| a11y | Line 29-32: modal container <div className="w-full max-w-md  | P1 | ✓ | Dialog has no role="dialog"/aria-modal/aria-labelledby, so assistive tech does not treat it as a modal or announce its t |
| a11y | Line 35-40: close button touch target ~32px (p-1.5 padding + | P2 | ✓ | p-1.5 (6px) around a 20px icon yields a ~32px target, below the 44px minimum for comfortable touch. Increasing padding ( |
| theming | Lines 33, 44: divider borders use border-gray-200 | P2 | ✓ | Dividers should use the border-line token (gray-200) used everywhere else in the codebase, not a hard-coded gray, for th |
| theming | Lines 30, 42, 44: hard-coded bg-white and bg-gray-50 surface | P3 | ✓ | Surfaces are hard-coded instead of using the surface tokens used elsewhere (bg-surface / bg-surface-2), which breaks the |

## src/components/ui/ProductTour.tsx  (4)

ProductTour.tsx is a clean, well-disciplined component that largely respects the TeamsLike design system. Typography is fully compliant: h3 title uses text-base font-semibold text-ink, body uses text-sm text-ink-2, the step counter uses text-xs text-muted, and the button label uses text-sm font-medium — no oversized text, no arbitrary px, no font-light, no eyebrows, no gradient text. Borders are correct: the popover and Back button use border border-line (1px full borders), with no banned side-stripe accents. There are no form inputs to audit. Tokens (brand, ink, ink-2, line, muted, surface-2) are used throughout in light mode, earning solid theming, though dark-mode variants drop to hard-coded gray-700/gray-800/white instead of tokens (acceptable but not tokenized). Antipattern score is high — no AI slop tells; the box-shadow spotlight is a legitimate product pattern. The real weaknesses are accessibility: no focus-visible styles on any button despite keyboard navigation being wired up (P1), sub-44px touch targets on the close and skip controls, and aria-modal set without moving focus into the dialog.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Close button (line 133-140) and Skip button (line 147-153) | P2 | ✓ | The X button is p-1 around a 16px icon (~24px box) and the Skip button is px-2/py-1 text — both well under the 44px mini |
| a11y | Back / Skip / Next button cluster (lines 147-169) | P1 | ✓ | None of the buttons (close, skip, back, next) declare focus-visible styles. Since this is a modal dialog navigated by ke |
| a11y | Dialog focus management (lines 108-109) | P2 | manuel | aria-modal="true" is set but focus is never moved into the dialog, so the user's focus remains on the page behind the sp |
| a11y | Step counter contrast (lines 144-145) | P3 | manuel | A 12px counter rendered in text-muted risks falling below the 4.5:1 body-contrast threshold depending on the muted token |

## src/components/ui/Tabs.tsx  (1)

Tabs.tsx is a high-quality, near-impeccable component. Typography is fully compliant: tabs use the correct `text-sm font-medium` label role, no oversized text, no arbitrary px font sizes, no eyebrows, no gradient or font-light. Borders are clean (single `border-b border-line`, no banned side-stripe accents). Theming uses tokens throughout (text-brand, text-muted, text-ink, border-line, bg-brand, --dur-pop, --ease-out) with zero hard-coded hex or arbitrary grays. A11y is strong: proper role=tablist/tab/tabpanel, aria-selected, roving tabIndex, full arrow/Home/End keyboard handling, visible focus-visible:ring-2, semantic <button> elements, and motion-safe guards. The animated underline uses a pure-transform (translateX + scaleX) GPU approach with aria-hidden, which is correct. The only real finding is a minor technical one: the button has both `transition-colors` and `transition-transform`, the second of which overrides the first, so the inactive->active color change does not animate. Score reflects that single polish-level slip; everything else is at the Linear/Stripe bar.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | button className, line 79 | P2 | ✓ | Two conflicting transition-* utilities on the same element: `transition-colors` then `transition-transform`. The later c |

## src/components/ui/Toast.tsx  (2)

Toast.tsx is a clean, well-tokenized component with no typography violations (single text-sm body, text-xs not even needed), no banned side-stripe borders (full border border-line), no eyebrows, no gradient text, no oversized headings, and no input controls to deviate. Animation uses CSS tokens (--dur-toast, --ease-out) and a sound rAF/transition pattern. Two minor findings: the action button lacks a visible focus ring (WCAG 2.4.7), and the toast surface hard-codes bg-white instead of a surface token while the rest of the file is fully tokenized. Responsive is solid (min-w-[260px]/max-w-sm caps width, no fixed-px layout breakage). No AI-slop antipatterns. The colored status dot encodes variant by color, but the message text always carries the meaning, so it is not a contrast/meaning-by-color failure.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | ToastRow action button, line 130: className="font-medium tex | P2 | ✓ | The action button is keyboard-focusable but has no visible focus indicator (only hover:underline). Keyboard users cannot |
| theming | ToastRow container, line 112: "border bg-white text-ink bord | P3 | ✓ | Every other color in this file uses design tokens (text-ink, border-line, bg-brand, bg-ok, bg-danger, bg-warn). The toas |

## src/features/admin/AdminCharts.tsx  (2)

AdminCharts.tsx is a thin ECharts wrapper exporting three chart components; nearly all styling lives in JS ECharts option objects rather than Tailwind, so the typeset/border/input rules have little surface to act on. The Tailwind that exists (EmptyState/Icon className: w-6 h-6, py-6) is compliant — no oversized text, no side-stripe borders, no eyebrows, no gradient text, no unstyled inputs. Two real issues: (1) chart axis labels use fontSize: 11, below the product 12px floor and inconsistent with the 12px yAxis label in the same file; (2) all chart colors are hard-coded hex literals (brand #2563eb repeated 4x, plus four scattered grays) instead of design tokens, which defeats theming and lets the grays drift. a11y note: ECharts axis text colors like #9ca3af (~2.6:1 on white) and the 11px size are low-contrast small text, lowering the a11y score, though semantics and structure are otherwise fine. Responsive is solid — heights are computed and EChart handles its own resize.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | ActionBarChart xAxis.axisLabel (line 38) and EventsOverTimeC | P2 | ✓ | fontSize: 11 is below the product 12px floor for caption/meta text. Axis labels at 11px render unreadably small (and bel |
| theming | Module constants and inline series styling (lines 11-13, 43, | P2 | manuel | Every color is a hard-coded hex literal duplicated across three charts (brand blue #2563eb appears 4x, gray axis colors  |

## src/features/admin/AdminPage.tsx  (10)

AdminPage.tsx is structurally strong: it consistently uses design tokens (border-line, bg-surface/surface-2, text-ink/ink-2/muted, focus-visible:ring-brand), has no gradient text, no eyebrows, no side-stripe borders, no glassmorphism, and uses real <button>/<Button>, semantic <table>, and EmptyState/Skeleton states. Responsiveness is handled well (sm/lg grids, flex-wrap toolbars, min-w with flex-1, overflow-x-auto on the table). The two real problem areas are: (1) typography — a cluster of off-scale arbitrary sizes (text-[12.5px], text-[11.5px], text-[11px], text-[12px], text-lg) that should map to the fixed scale (text-xs / text-base), and (2) a11y — text inputs labeled by placeholder only and a clickable <tr> with no role or accessible name. Inputs otherwise share a single INPUT_CLASS with a visible focus ring, but lack an explicit placeholder color. No theming or antipattern issues found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | OverviewSection cards label, line 130: <div className="flex  | P2 | ✓ | Arbitrary fractional px size text-[12.5px] is off-scale and banned; caption/meta role must map to the fixed scale text-x |
| typography | OverviewSection card value, line 134: <div className="mt-1 t | P2 | ✓ | text-lg (18px) is off the fixed product scale. A stat/value sits at the h2 section role text-base; there is no 18px role |
| typography | AuditLogSection date labels, lines 228 and 238: <span classN | P2 | ✓ | text-[11.5px] is both arbitrary and below the 12px floor (unreadable tier); map to text-xs. |
| typography | AuditLogSection result count, line 276: <div className="text | P2 | ✓ | Arbitrary off-scale fractional px; counter/meta role is text-xs. |
| typography | AuditLogSection table head, line 310: <tr className="... tex | P2 | ✓ | Arbitrary off-scale px on table header meta; map to text-xs. |
| typography | AuditLogSection table cells, lines 337 and 340: <td classNam | P3 | ✓ | Arbitrary px literal text-[12px] must use the scale token text-xs (same 12px) for consistency. |
| typography | PolicyRow meta, lines 386 and 388: <div className="text-[12. | P2 | ✓ | text-[12.5px] is off-scale and text-[11px] is below the 12px readability floor; both map to text-xs. |
| input | INPUT_CLASS constant, line 47 | P3 | ✓ | Multiple inputs render placeholders (audit.actionFilter, searchPlaceholder, policies.keyPlaceholder/valuePlaceholder) bu |
| a11y | AuditLogSection search/action inputs, lines 247-258 and Poli | P2 | ✓ | These inputs rely on placeholder text only with no <label>/aria-label, so screen readers announce them as unlabeled. The |
| a11y | Audit log table rows, lines 320-331: <tr onClick={...} tabIn | P2 | manuel | A clickable/keyboard-focusable <tr> has no role or accessible name, so assistive tech cannot tell it is interactive or w |

## src/features/admin/AuditLogDetail.tsx  (4)

Small, well-built audit-log detail modal. Structure is solid: semantic <dl>/<dt>/<dd>, a real <button> with title, focus-visible:ring-brand, and motion-safe active scale — a11y, responsive, and antipattern dimensions are clean (no eyebrows, gradients, side-stripes, or fixed-width overflow). Main issues are typography and theming: two uses of arbitrary text-[12.5px] (banned arbitrary px; should map to the scale — text-xs for the meta label, text-sm for the value so both value variants match), plus hard-coded gray-400/500/700/900/100 throughout instead of the muted/ink/ink-2/surface tokens. All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 69 — <dt> label | P2 | ✓ | Arbitrary px font-size text-[12.5px] is banned and below readability mapping; map to the scale (text-xs / 12px for this  |
| typography | line 74 — mono <span> value | P2 | ✓ | Arbitrary px font-size text-[12.5px] is banned; the non-mono sibling value (line 75) uses text-sm, so the same value rol |
| theming | line 75 — non-mono value <span> | P3 | ✓ | Hard-coded text-gray-900 instead of the ink design token; the product specifies text-ink for primary value text. Use the |
| theming | line 85 — copy button | P3 | ✓ | Hard-coded gray scale on an interactive control instead of design tokens (muted / surface-2 / ink-2); keeps icon-button  |

## src/features/admin/components/BillingPanel.tsx  (1)

BillingPanel.tsx is a clean, well-typeset file that largely meets the product bar. Typography is fully compliant: h3 titles are text-sm font-semibold text-ink, body/helper text is text-sm text-muted, badges/counters are inline — no oversized text, no arbitrary px sizes, no eyebrows, no font-light, no gradient text. Borders are all full 1px border-line (cards, nested credit box, invoice rows, total divider) with zero side-stripe accents. Theming is token-driven throughout (ink, muted, line, surface, brand) with no hard-coded hex. Semantic HTML is correct: real <label> wrapping the <select>, <ul>/<li> for invoice lines, headings as <h3>. No antipattern tells. The one defensible finding is that the plan <select> (SELECT_CLASS) deviates from the design-system .input vocabulary (border-line/bg-surface/px-2/brand ring-2 instead of border-gray-300/bg-surface-2/p-2.5/focus:ring-1 ring-blue-500), a P2 consistency issue. Note: the touch-target height (h-11 = 44px) and visible focus ring are good.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | SELECT_CLASS constant (lines 11-12), applied to the plan <se | P2 | ✓ | The select deviates from the design-system .input vocabulary: standard inputs use border-gray-300, bg-surface-2 (or gray |

## src/features/admin/components/ConfirmAction.tsx  (3)

Exemplary, near-compliant file. Typography is fully on-scale (text-sm throughout, no oversized/arbitrary/eyebrow/gradient/font-light tells). Theming uses design tokens consistently (border-line, bg-surface, text-ink, text-danger, ring-brand) with no hard-coded hex or random gray-XXX. No banned side-stripe borders — the danger callout uses a full `border border-danger`. Semantics and a11y are strong: real <button> via Button, a wrapping <label> plus aria-label on the input, focus-visible:ring-2, and Enter/Escape keyboard handling. Only minor polish items: the verify input is h-10 (40px, just under the 44px touch target), there is no placeholder/placeholder-color token, and the warning icon uses arbitrary h-[18px] w-[18px] instead of a scale step. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | INPUT_CLASS constant (line 6-7) — `h-10` on the verify input | P2 | ✓ | h-10 is 40px, under the 44px minimum touch-target for an interactive input. This is a danger-confirmation control where  |
| a11y | input (lines 50-63) — no visible placeholder, relies only on | P3 | ✓ | The field has a proper <label> wrapper and aria-label (good), but no placeholder showing the exact word to type. A place |
| theming | Icon (line 47) — arbitrary px sizing `h-[18px] w-[18px]` | P3 | ✓ | Arbitrary `[18px]` bypasses the spacing scale; standardize to the token step `h-5 w-5` (20px) for consistency with the r |

## src/features/admin/components/FederationSettings.tsx  (1)

FederationSettings.tsx is a high-quality, near-compliant file. Typography follows the scale exactly (text-sm font-semibold text-ink for the card heading, text-sm text-muted for empty state, no oversized text, no arbitrary px font sizes, no eyebrows, no gradient/font-light). Theming is fully tokenized (border-line, bg-surface, text-ink, text-muted, focus-visible:ring-brand) with zero hard-coded hex or random gray-XXX. The input has a visible focus-visible ring, an aria-label, and uses border-line (no side-stripe accent borders anywhere; the protocol identity is conveyed by a leading globe Icon, the correct pattern). The Button is the semantic ui/Button with size/variant/disabled/leftIcon. Touch targets are adequate (h-10 input, sm Button). Only nit: the input uses bg-surface, matching its card container, so the field lacks the subtle fill (bg-surface-2/gray-50) the input standard prescribes to separate field from card. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | INPUT_CLASS (line 7-8): bg-surface | P3 | ✓ | The input sits on a bg-surface card with the same bg-surface fill, so the field has no visual contrast against its conta |

## src/features/admin/components/GovAuditLogViewer.tsx  (2)

GovAuditLogViewer is a clean, well-built table/filter component that is almost fully compliant. Typography roles use the scale correctly (h3 = text-sm font-semibold text-ink, body/table = text-sm, meta = text-muted), and theming is excellent — it consistently uses design tokens (border-line, bg-surface, text-ink, text-ink-2, text-muted, ring-brand, accent-brand) with no hard-coded hex or random gray-XXX. Inputs share a single INPUT_CLASS constant with a visible focus-visible:ring-2 ring-brand, all interactive elements have aria-labels, the table uses semantic th scope=\"col\", and the table is wrapped in overflow-x-auto for mobile. No banned antipatterns: no gradient text, eyebrows, side-stripe borders, glassmorphism, or hero-metric template. The only defensible findings are two uses of the arbitrary px font size text-[12px] (lines 119 and 121) which should map to the scale token text-xs. Both are minor (P2) and safely auto-fixable with a localized className swap. The amber purged-count text (text-amber-600 dark:text-amber-400) is a justified semantic status color and not flagged.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 119 — actorId cell | P2 | ✓ | Arbitrary px font size text-[12px] is banned; 12px maps directly to the scale token text-xs. Same role (table mono cell) |
| typography | Line 121 — IP cell | P2 | ✓ | Arbitrary px font size text-[12px] is banned and equals the caption/meta token text-xs. Use the scale token for consiste |

## src/features/admin/components/GovOverviewDashboard.tsx  (1)

Exemplary file — fully compliant on typography (correct text-sm/text-xs roles, no oversized or arbitrary px, no eyebrows, no gradients, no font-light), borders (full border border-line cards, no side-stripes), and theming (consistent ink/muted/line/surface/surface-3 tokens; status colors live in a single LEVEL map). Responsive grid (sm:grid-cols-3) and flex-wrap header behave well on mobile. The only defensible issue is the quota progress bar, which renders usage purely visually without a role=progressbar / aria-value* semantics for screen readers.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Quota progress bar div (lines 44-50) | P2 | ✓ | The quota usage is conveyed visually as a colored bar but exposes no machine-readable value to assistive tech. Adding ro |

## src/features/admin/components/PolicyTester.tsx  (3)

PolicyTester.tsx is a clean, well-tokenized admin component with no major typography or antipattern violations. Typography is fully compliant: the only heading is text-sm font-semibold text-ink (correct h3 role), all body/label/helper text is text-sm text-muted, no oversized text, no arbitrary px (the h-[18px] w-[18px] and ring tokens are sizing/tokens, not type), no eyebrows, no gradient text, no font-light. Borders are clean: full border border-line on the card, divider via border-t border-line — no side-stripe accents. Theming is excellent: brand/ink/line/muted/surface tokens throughout, no hard-coded hex. Interactive elements use real <button>/<input>/<textarea> with aria-pressed on the toggles and focus-visible:ring-2 focus-visible:ring-brand everywhere. The remaining nits are minor: inputs use bg-surface (same as the card) instead of a recessed bg-surface-2 fill so the field affordance is faint, and the inputs (h-10 ≈ 40px) and sensitivity toggle buttons (py-1 ≈ 28px) fall under the 44px touch-target minimum on mobile. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | INPUT_CLASS const (line 18-19) and textarea (line 45) | P2 | ✓ | Inputs use bg-surface, the same fill as the enclosing card (div.bg-surface on line 34). The fields blend into the card w |
| a11y | textarea (lines 41-47) | P3 | manuel | The textarea has no min-height set beyond rows={2}; with p-2 + 2 rows it can render under ~44px touch target on mobile.  |
| input | label/sens toggle buttons (lines 76-90) and Badge for label | P3 | ✓ | The sensitivity toggle buttons are well below 44px tall (py-1 text-sm ≈ 28px), undersized for touch. |

## src/features/admin/components/SecurityPolicies.tsx  (1)

SecurityPolicies.tsx is a clean, compliant admin component. Typesetting is fully on-scale: h3 uses text-sm font-semibold text-ink, body/labels use text-sm with text-ink/text-muted, no arbitrary px font sizes, no text-2xl+ ceiling breaks, no eyebrows (uppercase+tracking), no font-light, and no gradient text. Borders are correct full 1px border-line throughout with no side-stripe accents or nested double borders. Theming is exemplary, using design tokens (text-ink, text-muted, border-line, bg-surface, ring-brand) with zero hard-coded hex or random gray-XXX. Semantic HTML is good: real <ul>/<li>, <label> wrapping each <input>, and aria-label on every config input. Inputs share a single CONFIG_INPUT constant with a visible focus-visible ring. The config input height (h-8 = 32px) and bg-surface choice deviate slightly from the standard .input vocabulary and fall below the 44px touch target, the only defensible (P3) finding; everything else is at the Linear/Notion bar.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | CONFIG_INPUT constant (line 22-23), applied to config inputs | P3 | ✓ | The config inputs are h-8 (32px), below the 44px touch-target minimum and below the standard .input height (p-2.5 ≈ 40px |

## src/features/appointments/AppointmentsPage.tsx  (5)

Structurally and technically this is a strong file: proper ARIA tablists with roving tabIndex and full arrow/Home/End keyboard handling, button (not div) controls, visible focus-visible:ring-brand, semantic h1/p, deep-linked tab state, and clean responsive layout (max-w-6xl, flex-wrap tabs, lg:grid-cols-2). The findings are almost entirely typographic: the h1 is the main offender at text-3xl font-bold (exceeds the text-2xl ceiling and the text-xl/font-semibold h1 role), the muted subtitle is over-sized at text-base, and both tab rows label controls at text-base instead of the text-sm font-medium label role. Minor theming nit: icons use arbitrary h-[18px] w-[18px] instead of the spacing scale. Note: the border-b-2 on the console tabs is a legitimate full-width tab-underline indicator, not a banned side-stripe accent, so it is not flagged.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 96: h1 page title | P1 | ✓ | text-3xl (30px) exceeds the product ceiling of text-2xl and is far above the h1 role (text-xl/20px). font-bold also devi |
| typography | Line 97: page subtitle | P2 | ✓ | A secondary subtitle under the page title is helper/secondary text, which the scale fixes at text-sm text-muted. text-ba |
| typography | Lines 112 & 116: surface selector tab labels | P2 | ✓ | Button/tab labels are body-emphasis role: text-sm (14px) font-medium. text-base (16px) over-sizes interactive controls a |
| typography | Lines 134 & 138: console tab labels | P2 | ✓ | Tab labels are interactive labels and should be text-sm font-medium per the scale; text-base over-sizes them and is inco |
| theming | Lines 116 & 138: icon sizing uses arbitrary px | P3 | ✓ | Arbitrary h-[18px] w-[18px] bypasses the spacing scale (h-4=16px / h-5=20px). Inline pixel values are a hard-coded devia |

## src/features/appointments/components/AvailabilityEditor.tsx  (5)

A small, well-built availability editor that is technically strong: design tokens used throughout (text-ink, text-muted, border-line, bg-surface-2, accent-[var(--color-brand)]), real semantic html (label/input/checkbox), aria-labels on the time inputs, a visible focus-visible:ring-2 focus ring, responsive lg:grid-cols-2 with flex-wrap, and zero AI-slop tells (no gradients, eyebrows, side-stripe borders, or glassmorphism). The single systematic issue is typography sizing: body/list-items, input text, helper/meta lines, and the time-slot chips are all set to text-base (16px), one step above the product body size of text-sm (14px), with the compact chips ideally at text-xs (12px). All findings are localized className swaps. The shared input class also deviates slightly from the .input standard (rounded-md/bg-surface vs rounded-lg/bg-surface-2, no focus border).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | L62 list row: <li ... className="flex items-center gap-2 tex | P2 | ✓ | Per product scale, body / list-item text is text-sm (14px). text-base (16px) is the h2 section role, not body. The day-n |
| typography | L22 timeCls shared input class (time/date inputs) | P2 | ✓ | Input text is body/label and should be text-sm (14px) per the input vocabulary, not text-base (16px). This class is reus |
| typography | L85 pickDate label, L91 eventType meta line, L94 noSlots hel | P2 | ✓ | Helper/secondary text-muted content must be text-sm (14px), not text-base. Same applies to the eventType meta line (L91) |
| typography | L98 slot chips | P2 | ✓ | These are compact time-slot chips (counter/meta-grade content). The scale caps this kind of chip at text-xs (12px); text |
| input | L22 timeCls vs standard input vocabulary | P3 | manuel | The shared input class deviates from the design-system input standard: rounded-md instead of rounded-lg, bg-surface inst |

## src/features/appointments/components/BookingsCalendar.tsx  (3)

BookingsCalendar.tsx is largely compliant: it uses design tokens consistently (border-line, text-ink, text-muted, bg-surface, brand), has no gradient text, no eyebrows, no side-stripe borders (the only border-l is none; the border-t border-line dividers are full 1px borders, which is allowed), no oversized headings, and uses semantic <Button>/<input> elements with aria-labels on the date/time inputs. The main issues are typographic/input-system deviations: the modal body block is set to text-base (16px) instead of the body scale text-sm (14px), and the shared inputCls deviates from the design-system .input vocabulary (rounded-md vs rounded-lg, bg-surface vs bg-surface-2, text-base vs text-sm, px-2/h-10 vs p-2.5, and a custom focus ring instead of the standard blue focus state). a11y scores a 3 rather than 4 because the h-10 (40px) inputs fall just below the 44px touch-target guideline; everything else (labels, semantics, token-based contrast) is solid. No anti-patterns, theming, or responsiveness problems found (it even switches to listWeek on mobile via matchMedia).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Modal body wrapper, line 186: <div className="space-y-2 text | P2 | ✓ | Per the product type scale, body copy is text-sm (14px). This modal detail block (event type, invitee, host, when, locat |
| input | inputCls constant, line 66 (applied to date/time inputs on l | P2 | ✓ | The date/time inputs deviate from the design-system .input vocabulary on multiple axes: text-base instead of text-sm, ro |
| typography | inputCls text size, line 66 | P3 | ✓ | Input text should be text-sm (14px) per the input standard and body scale; text-base (16px) here oversizes the field con |

## src/features/appointments/components/Card.tsx  (2)

Small, mostly clean component pair. Card uses tokens correctly (border-line, bg-surface, rounded-xl). The only real issues are in StatCard: the text-2xl font-bold value over a text-xs muted label is the hero-metric template antipattern, text-2xl exceeds the in-product ceiling (reserved for landing hero), and font-bold deviates from the font-semibold heading standard. Theming and responsiveness are solid; a11y is acceptable though the stat value/label have no semantic association (purely presentational divs).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | StatCard value div (line 12) | P2 | ✓ | The text-2xl + font-bold stat figure paired with a tiny text-xs label below is the hero-metric template tell, an AI slop |
| typography | StatCard value div (line 12) | P3 | ✓ | font-bold deviates from the product weight standard: every semantic heading role (h1/h2/h3) is font-semibold. A bold her |

## src/features/appointments/components/EventTypeEditor.tsx  (4)

EventTypeEditor is structurally sound: labels wrap their inputs (implicit association), semantic button/select/label elements, flex-wrap layout responds well on mobile, and there are no AI-slop tells (no gradient text, no side-stripe borders, no eyebrows, no hero-metric template). The defensible issues are typographic and input-standardization: a shared fieldCls and five label/body rows use text-base (16px), one notch above the product's fixed text-sm scale for fields, labels, and body. Inputs/selects also diverge from the design-system .input vocabulary (rounded-md vs rounded-lg, bg-surface vs bg-surface-2, px-2 vs p-2.5, custom focus:ring-brand vs the standard blue-500 border+ring), so controls won't match the rest of the product. Theming uses tokens (ink, line, muted, surface, brand) consistently, only docked for the input-spec mismatch. All findings are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | fieldCls constant (line 27-28); input/select use text-base | P2 | ✓ | Per the fixed product type scale, input/field text is body-size text-sm (14px). text-base (16px) inside form controls is |
| typography | label wrappers (lines 59, 84, 97, 109) and hosts row (line 1 | P2 | ✓ | Field labels should use the label role (text-sm 14px font-medium), not text-base (16px). text-base for labels is off-sca |
| input | fieldCls applied to text input, number inputs, and selects ( | P2 | ✓ | Inputs/selects deviate from the design-system .input vocabulary on multiple axes: rounded-md (should be rounded-lg), bg- |
| input | text title input (line 86) | P3 | manuel | The title input has no placeholder; the translated titlePh string is used only as a visible label. Standard inputs decla |

## src/features/appointments/components/EventTypeList.tsx  (4)

Structurally and semantically the file is strong: real <button>/<ul>/<li>, aria-current on the active item, aria-label on every input and the icon-only delete button, 44px (h-11) touch targets, flex-wrap for mobile, design tokens (ink/muted/line/brand/surface) throughout, and a visible focus ring. No banned antipatterns — no side-stripe borders (uses full border + bg tint for the active state), no gradient text, no eyebrows. The single real problem is typographic: nearly everything inside each list item is set to text-base (16px) — title, meta row, and slug caption — collapsing intra-card hierarchy and oversizing metadata that should be text-sm (title) / text-xs (meta + caption). The two inputs also drift from the .input vocabulary (text-base, bg-surface, border-line, px-2, rounded-md). All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 57 — event type title span | P2 | ✓ | This is the primary label of a list-item card (h3 card/sub role). Per the scale that role is text-sm font-semibold. Usin |
| typography | Line 58 — duration/assignment meta row | P2 | ✓ | This is meta/counter content (duration + assignment badge). Meta role is text-xs (12px) text-muted. text-base (16px) is  |
| typography | Line 65 — slug URL caption | P2 | ✓ | The slug URL is caption/meta secondary text and should be text-xs text-muted. At text-base (16px) it reads as body conte |
| input | Lines 85 & 93 — title and duration inputs | P2 | ✓ | Inputs deviate from the design-system .input vocabulary: text-base instead of text-sm, bg-surface instead of bg-surface- |

## src/features/appointments/components/PublicBookingPreview.tsx  (3)

Clean, token-driven file: design tokens (ink/line/muted/brand/surface) are used consistently, no hard-coded hex, the grid is responsive (md:grid-cols-2), interactive elements are real buttons with aria-pressed, and inputs are absent so the input vocabulary does not apply. Two defensible anti-pattern findings: an eyebrow-style uppercase+tracking preview badge (line 72) and a decorative w-1 brand side-stripe on the event-type list buttons (line 91). One minor typography consistency nit on the event-type title role (line 93). a11y, responsive, and theming are excellent; antipattern is dragged down by the eyebrow and side-stripe tells.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 72 — preview badge span | P2 | ✓ | Small uppercase + tracking-wide label is a banned eyebrow AI tell. Drop uppercase and tracking; keep plain text-xs font- |
| border | Line 91 — event-type button leading accent | P2 | manuel | A thin (w-1) full-height brand bar functions as a banned side-stripe accent on a list item. Replace with a leading icon/ |
| typography | Line 93 — event-type title | P3 | ✓ | This is a card/sub heading role (h3) which the scale fixes at text-sm font-semibold. text-base font-medium here also con |

## src/features/appointments/components/TimezonePicker.tsx  (3)

A compact, mostly clean timezone picker. Main issues are typographic/scale: the label, label text, and select all use text-base (16px) where the scale calls for text-sm (14px) for labels and input text. The select also diverges from the standard .input vocabulary (rounded-md vs rounded-lg, border-line vs border-gray-300, bg-surface vs bg-surface-2, px-2 vs px-2.5, custom focus-visible:ring-2 ring-brand vs focus:border-blue-500 focus:ring-1). No anti-patterns (no gradient text, eyebrows, or side-stripe borders); tokens are used for color. a11y is decent (semantic select inside a label, visible focus ring) but the decorative icon lacks aria-hidden and an explicit aria-label would harden the accessible name.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | label className line 11: text-base text-muted | P2 | ✓ | Form labels/body are text-sm (14px) in the scale; text-base (16px) is reserved for h2 section headings. A label rendered |
| typography | select className line 16: text-base text-ink | P2 | ✓ | Input text should be text-sm (14px) per the design system, not text-base. The control also deviates from the standard in |
| a11y | label wraps text + select with no explicit association; the  | P3 | ✓ | The select relies solely on implicit label nesting; the leading globe Icon has no aria-hidden, so depending on its rende |

## src/features/appointments/components/WorkspaceReservation.tsx  (4)

Technically clean and well-built: semantic html (button/label with aria-label, role=group, aria-pressed), design tokens throughout (ink/line/muted/brand/surface, no hard-coded hex), a focus-visible ring on every control, responsive grid (lg:grid-cols-3) with no fixed-px containers, and no AI-slop antipatterns (no gradients, eyebrows, side-stripe borders, or glassmorphism). The single systemic issue is typographic scale: the file uses text-base (16px) for nearly all body, label, list-row, meta, and input text, where the product scale reserves text-base for h2 section headings and mandates text-sm (14px) for body/labels/controls and text-xs for meta. The date input also deviates slightly from the .input vocabulary (px-2 and bg-surface vs px-2.5 and bg-surface-2). All findings are localized className swaps and auto-fixable; no WCAG breaks, so a11y/responsive/theming/antipattern all score high.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 48 label, line 50 input, line 58 slot buttons — body/co | P2 | ✓ | Body, label, and control text must be text-sm (14px) per the scale; text-base (16px) is reserved for h2 section headings |
| typography | line 71, 74 (desk list rows), line 100, 101 (mine list rows) | P2 | ✓ | List-item body copy is rendered at text-base (16px). Body must be text-sm (14px); primary body color is text-ink-2, not  |
| typography | line 74 secondary meta row + line 101 meta row | P2 | ✓ | Secondary/meta line (zone, amenities, slot) uses text-base text-muted. Helper/secondary text should be text-sm text-mute |
| input | line 21 inputCls + line 50 date input | P2 | ✓ | The input deviates from the .input vocabulary: text-base (should be text-sm), px-2 (should be px-2.5), and bg-surface (s |

## src/features/auth/AuthField.tsx  (2)

AuthField is a high-quality, near-compliant component. Typography is fully on-scale (text-sm label/input, text-xs hint/error, font-medium/normal weights) with no oversized text, no arbitrary px, no eyebrows, no font-light, and no gradient text. The input matches the design-system vocabulary (bg-surface-2, border, rounded-lg, p-2.5, text-sm, visible focus:border-brand + focus:ring-2). Borders are full 1px (border-line / border-danger) with no banned side-stripes. Accessibility is excellent: semantic label/button elements, htmlFor binding, aria-invalid, aria-describedby wiring hint/error, role=\"alert\" on the error, aria-label + aria-pressed on the reveal toggle, focus-visible rings, and a 44px (w-11) touch target. The only real findings are theming: the component is fully tokenized in light mode but hard-codes raw gray-700/600/400 and white for dark mode (input) plus a dark:text-white on the label, bypassing the same ink/surface/line tokens it otherwise uses. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | input className (line 49) and surrounding dark: variants | P2 | manuel | The component is otherwise fully tokenized (bg-surface-2, text-ink, border-line, text-muted, focus:border-brand). Mixing |
| theming | label className, line 33 | P3 | ✓ | text-ink is the canonical ink token used elsewhere in this same file; pinning a separate dark:text-white override forks  |

## src/features/auth/AuthShell.tsx  (2)

AuthShell is a clean two-column auth layout that mostly respects the design system: it uses tokens (text-ink, text-muted, bg-surface, bg-surface-2, text-brand, rounded-card), has a visible focus-visible:ring-2 on the nav links, real semantic html (section/nav/ul/h3/p), and aria-hidden on the decorative check icon. Responsiveness is structural (lg/xl col spans, hidden left panel on mobile, mobile logo fallback) with no fixed-px widths, so it scores well. Two real typography findings: the feature h3 is text-xl font-bold (line 40) — oversized for an h3 sub-title and bold instead of the standard semibold — and the feature description uses banned font-light on muted text (line 43), a P1 readability/contrast issue. Theming is slightly mixed because dark mode reaches for raw dark:bg-gray-900/800 and dark:text-white alongside tokens, but that is an accepted dark-mode pattern rather than a clear violation. No anti-pattern tells (no gradient text, no eyebrows, no side-stripe borders, no glassmorphism).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 40 — feature title h3 | P2 | ✓ | This is a sub/feature title (h3 role). The scale assigns h3 = text-sm font-semibold. text-xl (20px) is reserved for the  |
| typography | Line 43 — feature description paragraph | P1 | ✓ | font-light is banned (floor is font-normal), and it is especially harmful here on muted secondary text where the lighter |

## src/features/auth/LoginPage.tsx  (3)

LoginPage.tsx is largely compliant and clean: it delegates all input rendering to a well-built AuthField (proper labels, aria-describedby, aria-invalid, focus:ring-2 focus:ring-brand-soft, 44px reveal-button touch target) and uses design tokens throughout (text-ink, text-muted, border-line, bg-surface-2, accent-brand, bg-danger/10) with no hard-coded hex, no gradient text, no eyebrows, and no side-stripe borders. Three real findings: (P1) font-light on the two footer paragraphs (lines 147, 156) is banned and worsens contrast on the muted token; (P2) the h1 uses font-bold instead of the role-standard font-semibold plus unneeded tracking-tight (line 70); and (P2) the 'Forgot password' control is a dead href=\"#\" anchor rather than a real routed <Link>/<button>, an a11y/semantics gap given every other link uses react-router. Type scale, responsiveness, and theming are otherwise excellent.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 147 & 156: <p className="text-sm font-light text-muted" | P1 | ✓ | font-light is banned by the type system (floor is font-normal), and it is especially bad here: 14px weight-300 text on t |
| typography | Line 70: <h1 className="text-xl font-bold leading-tight trac | P2 | ✓ | The h1 page-title role is fixed at font-semibold, not font-bold. Using font-bold here makes the same heading role incons |
| a11y | Lines 116-121: "Forgot password" anchor | P2 | manuel | href="#" is a non-semantic placeholder link: activating it scrolls/navigates to the top of the page and changes the URL  |

## src/features/auth/SignupPage.tsx  (3)

Clean, well-structured signup form that leans on shared AuthShell/AuthField/Button primitives, so inputs, focus rings, and tokens (text-ink, text-muted, text-brand, border-line, bg-surface-2, accent-brand) are consistent and on-system. Responsive hero scaling (text-xl sm:text-2xl) is correct and within the text-2xl ceiling. No gradient text, eyebrows, side-stripe borders, or arbitrary px type. The real issues are weight violations: the h1 uses font-bold instead of the scale's font-semibold, and two body/label blocks use the banned font-light on already-muted text, which hurts contrast (the a11y deduction). The link at line 214/175 and validation alerts (role=\"alert\") are handled well. Fixes are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h1 page title, line 106 | P2 | ✓ | h1 page title role is text-xl font-semibold in the product type scale. font-bold deviates from the standard heading weig |
| typography | agree checkbox label, line 166 | P1 | ✓ | font-light is banned, especially on small body text where it weakens contrast/legibility. Floor weight is font-normal. t |
| typography | "have account" footer text, line 210 | P1 | ✓ | font-light is banned on body/helper text; minimum is font-normal. text-muted plus font-light degrades contrast below com |

## src/features/booking/BookingPage.tsx  (11)

BookingPage.tsx is structurally solid (real tables with overflow-x-auto, semantic buttons with aria-labels, proper skeletons/empty states, drawer + confirm dialog), but it leans on hard-coded gray/green/red utility classes instead of the product's design tokens and has several typeset and input-vocabulary deviations. The clearest tells are the banned eyebrow patterns: uppercase table headers (lines 201, 583) and an uppercase drawer heading (278). The three section headings use off-scale text-lg instead of the defined h2 text-base role. On inputs, the drawer fields and the availability time/timezone inputs miss the standard focus ring (and the time/tz inputs use p-2 rather than p-2.5), breaking both the .input standard and keyboard focus visibility. Minor contrast issues: the hidden-status badge (gray-600 on gray-100, ~4.0:1) and the table default text-gray-500 body color sit at/below AA. No gradient text, glassmorphism, side-stripe borders, or hero-metric template — borders are clean 1px border-gray-200 throughout.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Lines 162, 469, 566 — h2 section titles | P2 | ✓ | The product type scale defines h2 section titles as text-base (16px) font-semibold. text-lg (18px) is off-scale and not  |
| antipattern | Line 278 — drawer heading | P1 | ✓ | Banned eyebrow tell: uppercase small label. This is a drawer title (create/update event type), not a meta label, so it s |
| antipattern | Lines 201, 583 — table header rows | P1 | ✓ | Banned eyebrow tell: text-xs uppercase tracking on column headers is a classic AI-template look. Drop uppercase and use  |
| input | Lines 295, 314, 333, 347 — drawer text/number/textarea input | P1 | ✓ | Inputs deviate from the design-system .input standard: no visible focus ring/border state and no placeholder color. Miss |
| input | Lines 505, 519 — availability time inputs | P2 | ✓ | Time inputs use p-2 (inconsistent with the standard p-2.5) and have no focus ring, deviating from the .input standard an |
| input | Lines 538-542 — timezone input | P2 | ✓ | Timezone input deviates from the standard: p-2 padding instead of p-2.5 and no focus ring. Standardize to the .input voc |
| a11y | Lines 538-543 — timezone input has no label association | P2 | manuel | The label is not programmatically associated with the input (no htmlFor/id, not wrapping). Screen-reader users get an un |
| theming | Throughout — hard-coded gray/green/red palette instead of to | P2 | manuel | The file hard-codes gray-900/600/500/400/200 and bg-gray-50 everywhere instead of the design tokens (ink, ink-2, muted,  |
| theming | Lines 358, 490 — checkbox accent vs focus tokens | P3 | ✓ | Checkboxes use text-primary-600 while the input focus standard elsewhere is blue-500; the brand accent token is applied  |
| a11y | Lines 230-239, 593-604 — status text on tinted badge / raw s | P2 | ✓ | gray-600 on gray-100 is ~4.0:1, below the 4.5:1 AA threshold for this small badge text. Bump to gray-700 (~6:1) to pass. |
| input | Lines 199, 581 — table wrapper text color hides cell content | P3 | ✓ | The table default text color is gray-500 (muted), used for normal body cells like duration (227), type name (600) and st |

## src/features/booking/PublicBookingPage.tsx  (10)

PublicBookingPage is a clean multi-step booking flow that correctly uses the shared .input/.label/.card/.badge/Button primitives (inputs are compliant). The main issues are: (1) a banned side-stripe accent — a w-1 full-height blue bar on each event-type card (line 217); (2) typography drift — headings use text-2xl/text-lg and font-bold instead of the text-xl/text-base font-semibold scale (lines 195, 252, 390), plus an arbitrary text-[11px] font-bold weekday header below the readable floor (line 268); (3) pervasive hard-coded gray/blue/green utilities instead of ink/muted/line/surface/brand tokens, with inconsistent divider colors (gray-200 vs gray-100); and (4) a11y gaps — labels not associated with inputs, calendar day buttons lacking aria-label/aria-pressed and color-only selection. No gradient text, glassmorphism, or eyebrows. Fix the side-stripe and the type/token drift to bring it to the Linear/Notion bar.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 217: event-type card leading accent | P1 | manuel | A 4px-equivalent (w-1) full-height colored vertical bar on the left edge of a card is exactly the banned side-stripe/acc |
| typography | Line 195: pick step h1 | P2 | ✓ | h1 page title role is text-xl font-semibold text-ink. text-2xl is reserved for the rare landing hero, and font-bold devi |
| typography | Line 252: event name heading in slots step | P2 | ✓ | text-lg (18px) is not in the type scale; the h2 section role is text-base font-semibold. font-bold also deviates from th |
| typography | Line 390: confirmation heading | P2 | ✓ | This is a confirmation panel title, not a landing hero. text-2xl exceeds the role; h1/title role is text-xl font-semibol |
| typography | Line 268: calendar weekday header | P1 | ✓ | text-[11px] is arbitrary and below the text-xs (12px) floor (unreadable), and font-bold for a tiny meta label is too hea |
| typography | Lines 219, 393: card/sub headings using font-semibold (corre | P3 | ✓ | Same heading role is styled inconsistently across the file: h3 uses font-semibold while h1/h2 use font-bold. Standardize |
| theming | Throughout: hard-coded gray/blue/green palette instead of de | P2 | manuel | The product defines ink/muted/line/surface/brand tokens. Hard-coded gray-XXX and raw blue/green hex-equivalents bypass t |
| a11y | Lines 356-369: name and email inputs | P2 | manuel | The label is not programmatically associated with the input (no htmlFor/id, not wrapping), so screen readers and click-t |
| a11y | Lines 280-298: calendar day buttons | P2 | manuel | Day buttons expose only the bare number with no month/year context for screen readers, and no aria-pressed to convey the |
| responsive | Line 240: slots step three-column grid | P3 | manuel | Fixed-px outer columns (260px + 220px = 480px) leave little room for the calendar at the md breakpoint (768px), risking  |

## src/features/canvas/BlockBody.tsx  (2)

BlockBody.tsx is a clean, well-tokenized canvas renderer. It correctly uses semantic <button> for all interactive blocks, design tokens (text-ink, text-muted, border-line, bg-surface-3), tabular-nums for counters, and a horizontally-scrollable table that handles overflow. Only two real findings: the metric value uses text-3xl which breaks the text-2xl ceiling (P1), and the empty-state hint uses text-muted/70 which weakens already-low contrast below AA (P2). No side-stripe borders, no eyebrows, no gradient text, no arbitrary px font sizes, no font-light. The text-xs counter and meta usages are scale-compliant.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | MetricBody, metric value span (line 197) | P1 | ✓ | text-3xl (30px) exceeds the product type-scale ceiling of text-2xl (24px). A canvas metric block is an inline card value |
| a11y | Empty-state button placeholder text (line 31) | P2 | ✓ | text-muted/70 drops the muted token to 70% opacity, pushing this placeholder/empty-state text below the 4.5:1 body contr |

## src/features/canvas/BlockCard.tsx  (2)

BlockCard.tsx is a high-quality, near-compliant file. Typography is fully on-scale (text-sm font-medium for titles/labels, text-xs font-medium for the type pill — no oversized text, no arbitrary px font sizes, no font-light, no eyebrows, no gradient text). Theming is exemplary: design tokens throughout (text-ink, text-muted, text-brand, text-danger, bg-surface-3, ring-brand/40) with zero hard-coded hex or arbitrary gray-XXX, and the card/border styling comes from the shared `card` class plus a 1px `ring-1` accent (no banned side-stripe borders). Responsive structure is fine — no fixed px widths, transform/opacity-only drag animation. No anti-patterns (no glassmorphism, hero-metric, identical card grids, or gray-on-color). The only real finding is an a11y consistency gap: the move/edit/delete icon-only buttons rely on `title` alone for their accessible name while the drag and pin buttons in the same file correctly use `aria-label` — adding aria-label to the four toolbar buttons standardizes the accessible name. The hover-reveal toolbar is already keyboard-safe via focus-within/focus-visible, so no change needed there.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Move up/down/edit/delete action buttons (lines 116-149) — gr | P2 | ✓ | These icon-only buttons expose only `title` (not a reliable accessible name across all AT) while the sibling drag/pin bu |
| a11y | Action toolbar reveal (line 115) and pin button (lines 102-1 | P3 | manuel | Hover-only reveal is mitigated by focus-within/focus-visible, so this is compliant. Noting only that the pin and toolbar |

## src/features/canvas/CanvasPage.tsx  (1)

CanvasPage.tsx is an exemplary, near-compliant file. Typography uses the correct scale roles (text-base font-semibold text-ink for the h2 board title, text-sm font-medium for labels, text-xs text-muted for captions/hints), no oversized headings, no gradient text, no eyebrows, no font-light. Borders use border-line consistently with no side-stripe accents (the selected type-tile uses border-brand with a bg-brand/5 tint, a full border — fine). Inputs all use the shared .input class with proper labels; the type-picker tiles and rename/icon buttons are real <button> elements with aria-label/title and visible hover/active states. Theming is fully tokenized (ink, muted, surface-2/3, brand, line) with no hard-coded hex except the demo COLLABORATORS avatar colors, which are passed as data to a component prop, not styling classes — acceptable. Responsive layout uses max-w-2xl mx-auto with p-4 md:p-6 and a flex header that truncates safely. The only real finding is one arbitrary off-scale font size (text-[13px]) on the edit-modal textarea, which also redundantly overrides the .input class's text-sm.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 492 — edit modal content textarea | P2 | ✓ | Arbitrary px font size text-[13px] is off-scale. The fixed product type scale forbids arbitrary px values (text-[13px]); |

## src/features/canvas/PromptBar.tsx  (3)

PromptBar is a clean, token-disciplined component: it uses design tokens throughout (border-line, bg-surface/surface-2, text-brand/ink/muted), respects the text-xs floor, has no eyebrows, no gradient text, no side-stripe borders, semantic <button> elements, and tasteful motion (transform/opacity with motion-reduce). Typography is fully compliant. The one real problem is accessibility: the primary <input> strips the .input border AND focus ring (border-0 ... focus:ring-0) while the wrapping container provides no focus-within indicator, leaving keyboard users with no visible focus on the main text field (WCAG 2.4.7). Secondary notes: the .input class is overridden on several core tokens (document/justify), and chip touch targets (~24px) are below the 44px guideline but acceptable in a dense composer. No antipattern or theming issues found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | input (line 58) + container (line 42) | P1 | ✓ | The input intentionally drops the .input border and focus ring (border-0 ... focus:ring-0) and the container has no focu |
| input | input, line 58 | P2 | manuel | The component overrides four core .input tokens (bg, border, padding, focus ring) which deviates from the standard input |
| a11y | suggestion chips, line 75 | P3 | ✓ | Touch targets ~24px tall are hard to tap on mobile (guideline ≥44px). Acceptable in a dense desktop toolbar, so minor, b |

## src/features/clips/ClipCard.tsx  (7)

ClipCard is a clean, well-structured component: motion is reduced-motion aware, the hover-preview video is correctly aria-hidden and muted, the play surface is a real button, and there are no AI-slop tells (no gradient text, eyebrows, side-stripe borders, or glassmorphism), so antipattern scores high. The main issues are accessibility: the two icon-only buttons (edit/delete) have only title and no aria-label, so screen readers get no accessible name, they lack type=\"button\", and their hit areas (~24px) fall short of the 44px touch-target minimum — these drag a11y down. Typography has two off-scale arbitrary text-[11px] usages below the 12px floor (duration counter and no-thumbnail label) that should map to text-xs. Theming uses hard-coded gray-900/gray-500 for the title and description where ink/muted tokens belong. No P0/blocking issues; the P1s are the unlabeled interactive buttons.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 90 — duration counter span | P2 | ✓ | Arbitrary text-[11px] is below the 12px floor and off-scale; the duration counter is meta/caption role which maps to tex |
| typography | line 63 — no-thumbnail label span | P2 | ✓ | Arbitrary text-[11px] is below the 12px floor and off-scale (map to text-xs). Additionally text-white/60 on a gray-900 c |
| a11y | lines 108-114 — edit icon button | P1 | ✓ | Icon-only button has no accessible name for screen readers — title is not a reliable label. Add aria-label (and aria-hid |
| a11y | lines 115-121 — delete icon button | P1 | ✓ | Icon-only destructive button lacks an accessible name (only title). Add aria-label and type="button". Destructive action |
| a11y | lines 108-121 — icon button touch targets | P2 | ✓ | The edit/delete hit area is ~24px (p-1 + 16px icon), well under the 44px minimum touch target. Pad the box or enforce mi |
| theming | line 99 — clip title | P3 | ✓ | Card title (h3 role) hard-codes text-gray-900 instead of the design token text-ink. Use the ink token for consistency wi |
| theming | line 103 — clip description | P3 | ✓ | Helper/meta text hard-codes text-gray-500 instead of the muted token. Standardize secondary text on text-muted. |

## src/features/clips/ClipForm.tsx  (5)

Clean, well-structured metadata form with no AI-slop antipatterns (no gradients, eyebrows, side-stripe borders, or hero-metric templates) and sensible inline thumbnail preview + validation. Main issues are design-system input compliance: the shared fieldClass deviates from the .input vocabulary (rounded-md vs rounded-lg, focus:ring-2 vs ring-1 + focus:border, no bg-surface-2, no placeholder-gray-400, missing block w-full), labels hard-code text-gray-700 instead of the text-ink token, and one arbitrary sub-floor text-[11px] in the broken-thumbnail state. Accessibility is mostly good (semantic label/input pairs, aria-invalid) but the error message lacks programmatic association (aria-describedby/role=alert). No oversized type or banned border patterns.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Thumbnail-broken placeholder, line 138: <span className="tex | P2 | ✓ | text-[11px] is below the 12px floor and an arbitrary px size; map to the scale (text-xs). text-gray-400 on a gray-100 ti |
| input | Shared fieldClass for all inputs/textarea, line 85-86 | P2 | ✓ | Design-system .input vocabulary specifies bg-surface-2/bg-gray-50, rounded-lg (not rounded-md), p-2.5, focus:ring-1 + fo |
| theming | All field labels, lines 91, 101, 122-123, 155, 167-168 | P3 | ✓ | Labels hard-code text-gray-700 instead of the design token. The body emphasis/label role is text-sm font-medium text-ink |
| input | Invalid video_url state, lines 107-111 | P3 | ✓ | The error border uses border-red-400 (lighter than the system error tone) and, like the other fields, never sets focus:b |
| a11y | Inline video_url validation message, lines 113-118 | P2 | manuel | aria-invalid is set on the input but the error text is not programmatically associated (no aria-describedby / role=alert |

## src/features/clips/ClipPlayerModal.tsx  (8)

A compact, well-structured clip player modal with good motion (transform-only, motion-safe guards) and no AI-slop tells (no gradient text, no eyebrows, no side-stripe borders, no glassmorphism). Main issues are theming and a11y: text and dividers use raw gray-200/400/500/900 instead of the ink/muted/line tokens; icon-only close/prev/next buttons rely on title instead of aria-label (P1 for accessible naming); and several interactive controls (speed buttons ~24px, nav buttons 36px) fall under the 44px touch target. Typography is compliant — no oversized text, no arbitrary px, no font-light, floor respected at text-xs. Fixing the token swaps and aria-labels is mostly localized className/attribute work.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Title bar h3 (line 126): text-base font-semibold text-gray-9 | P2 | ✓ | Hard-coded text-gray-900 instead of the text-ink token. The product uses ink/ink-2/muted tokens for text; raw gray hex-g |
| theming | Borders (lines 125, 172): border-gray-200 | P3 | ✓ | Dividers should use the border-line token (gray-200) rather than the raw color so divider color stays consistent across  |
| theming | Close button + meta/labels (lines 132, 174, 182): text-gray- | P2 | ✓ | Meta/counter and secondary text should use the muted/ink tokens, not raw gray-400/gray-500, for token consistency and co |
| a11y | Speed buttons (lines 184-198): px-2 py-1 text-xs | P2 | manuel | The speed toggle buttons render at roughly 24px tall — below the 44px minimum touch target, hard to tap on mobile in thi |
| a11y | Speed buttons active state (lines 191-193) | P2 | ✓ | These are toggle buttons whose only selected indicator is color. Screen-reader users get no state; aria-pressed communic |
| a11y | Close / prev / next buttons (lines 129-135, 150-168) | P1 | ✓ | Icon-only buttons rely solely on title for their name. title is not exposed as the accessible name in all AT and never s |
| a11y | Nav buttons (lines 154, 164): w-9 h-9 | P3 | ✓ | Prev/next overlay buttons are 36px — under the 44px touch-target minimum. |
| a11y | Dialog title association (lines 113-118) | P3 | manuel | The visible title (h3) and the dialog name are duplicated. aria-labelledby ties the accessible name to the rendered head |

## src/features/clips/ClipsPage.tsx  (4)

ClipsPage is a clean, well-structured page: correct type scale (no oversized headings, no arbitrary px, no eyebrows or gradient text), no side-stripe borders, solid responsive grid (grid-cols-1 sm:grid-cols-2 xl:grid-cols-3, sm:flex-row toolbar), and proper semantic Button/EmptyState/Modal usage. The main issues are input-vocabulary deviations: both the search input and sort select use rounded-md, focus:ring-2, and omit focus:border-blue-500, diverging from the .input standard (rounded-lg, focus:ring-1, focus:border-blue-500, bg-surface-2). Minor theming nits use hard-coded gray (text-gray-500, bg-gray-50) instead of tokens. No anti-pattern slop. A11y is adequate but the search input has no associated label/aria-label (only a placeholder), which is the one accessibility gap.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | Search input, line 172 | P2 | ✓ | Input deviates from the .input design system vocabulary: rounded-md instead of rounded-lg, focus:ring-2 instead of focus |
| input | Sort select, line 180 | P2 | ✓ | Select deviates from the .input standard: rounded-md vs rounded-lg, focus:ring-2 vs focus:ring-1, missing focus:border-b |
| theming | Sort label, line 176 | P3 | ✓ | Hard-coded text-gray-500 for a secondary helper label instead of the design token. Use text-muted to stay consistent wit |
| theming | Scroll container, line 160 | P3 | ✓ | Hard-coded bg-gray-50 instead of the surface token. Use bg-surface-2 to keep page backgrounds token-driven and themeable |

## src/features/copilot/CopilotPage.tsx  (9)

A Flowbite-derived Copilot chat page that is structurally sound and fully i18n'd, with no typography-ceiling violations (max text-xl), no gradient text, no eyebrows, and no side-stripe borders. The main issues are input-vocabulary deviations and accessibility: the primary chat input is a raw borderless field with border-0 + focus:ring-0 (no visible focus, a WCAG 2.4.7 break on the most important control), and the history search/rename inputs drift from the .input standard (border-gray-200 vs gray-300, p-2 vs p-2.5, unbounded focus rings). Many icon buttons sit at ~36px touch targets (p-1.5), under 44px. Theming relies on raw gray-XXX rather than ink/line/muted/surface tokens, and the model selector ships hard-coded non-i18n text plus a duplicated \"GPT-4o mini\" entry — a template leftover. The drawer title heading is rendered in muted gray-500, weakening hierarchy. None are oversized-type or AI-slop-tell findings; the file's biggest gaps are input consistency and focus/touch accessibility.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | Chat message input, line 483-492 | P1 | ✓ | The primary chat input is a raw borderless field with border-0 and focus:ring-0, so it has no visible border and no focu |
| a11y | Icon buttons in message rows and header, e.g. lines 408, 432 | P2 | ✓ | Copy / like / dislike / rename / delete controls use p-1.5 padding around small icons, yielding ~32-36px touch targets,  |
| input | History search input, line 531 | P2 | ✓ | Deviates from the .input standard: uses border-gray-200 (the divider color) instead of border-gray-300, p-2 instead of p |
| input | Rename inline input, line 574 | P3 | ✓ | Inline rename field uses an unbounded focus:ring-primary-500 (no width), unlike the standard focus:ring-1. Standardize t |
| theming | Model selector and dropdown, lines 305, 314, 317, 320 | P2 | manuel | The model name is hard-coded literal text ("Default (GPT-3.5)") while the rest of the page is fully i18n via t(...), and |
| theming | Settings tab inline SVG brand logo, lines 870-874 | P3 | manuel | Hardcoded hex (#3777e3 etc.) is fine for an external brand mark, noted only to confirm it is intentional and isolated to |
| a11y | Empty-state assistant bubble heading, line 377 | P3 | manuel | This heading correctly maps to the h3 role; included only as the compliant baseline against which the drawer h5 (line 50 |
| typography | History drawer title h5, line 507 | P2 | ✓ | A section heading (text-base font-semibold, the h2 role) is rendered in text-gray-500 muted gray. A semibold heading in  |
| theming | History group sub-labels h6, line 553 | P3 | ✓ | Date group separators (Today/Yesterday) are meta labels; styling them text-sm font-medium gray makes them compete with t |

## src/features/copilot/MessageContent.tsx  (7)

Lightweight markdown renderer (fenced code blocks + inline code) for the Copilot chat. Structurally clean: semantic <p>/<pre>/<code>, a real <button> with type/aria-label, aria-hidden on the icon, overflow-x-auto on code (mobile-safe), and no AI-slop tells (no gradient text, eyebrows, side-stripe borders, or hero templates) — antipattern scores high. Main weakness is theming: the entire file is built from hard-coded gray-50/100/200/500/800 and bg-white instead of the surface/ink/line/muted token vocabulary (theming=1). Typography has one off-scale issue: text-[0.85em] on inline code resolves below the 12px floor and should map to text-xs. A11y is mid: the copy button has no visible focus ring (only opacity reveal) and a sub-44px touch target. Responsiveness is fine (no fixed px widths, scrollable code).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | renderInline inline <code> (line 66) | P2 | ✓ | Hard-coded gray-100/gray-800 bypass the design tokens (surface/ink). Same component should use surface-2 + ink so inline |
| typography | renderInline inline <code> (line 66) | P2 | ✓ | Arbitrary em-relative font size text-[0.85em] is off-scale. With a text-sm (14px) parent it resolves to ~11.9px, below t |
| theming | code block container + lang label + pre (lines 91-99) | P2 | ✓ | Code block chrome is built entirely from raw gray-200/gray-50/gray-500/gray-800 instead of border-line, surface-2, muted |
| theming | copy button (line 109) | P3 | ✓ | Copy button uses hard-coded grays and white instead of border-line/surface/muted/ink tokens, diverging from the design s |
| a11y | copy button (lines 104-110) | P2 | ✓ | The copy button only reveals itself on focus via opacity but provides no visible focus indicator (no ring/outline). Keyb |
| a11y | copy button (lines 104-110) | P3 | ✓ | Copy button is roughly 28px square (16px icon + 6px padding each side), below the 44px minimum touch target for interact |
| a11y | copy button title (line 107) | P3 | manuel | Concatenating copyLabel and copiedLabel into one title string (e.g. 'Copy code / Copied') is read as a confusing combine |

## src/features/dashboard/DashboardPage.tsx  (3)

Strong, near-compliant dashboard. Type scale, tokens (ink/muted/line/brand/surface), focus-visible rings, semantic table, aria-hidden skeletons, responsive grid breakpoints, and overflow-x handling are all well-executed; no side-stripe borders, no gradient text, no glassmorphism, and no fixed-px widths that break mobile. Three minor findings: an inconsistent font-bold on the greeting heading (line 126) vs font-semibold elsewhere, font-bold task counters (lines 186/192) outside the weight vocabulary, and an uppercase eyebrow on the table thead (line 345). All are localized className swaps. No inputs in this file, so input vocabulary is N/A.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 126 — greeting heading | P2 | ✓ | The type scale fixes h1 page titles and section headings at font-semibold. This is the only top-level heading using font |
| typography | Lines 186 & 192 — task progress counters | P3 | ✓ | font-bold is not part of the product weight vocabulary (normal/medium/semibold). These emphasized numeric counters shoul |
| antipattern | Line 345 — bookings table header | P2 | ✓ | Small uppercase label text (text-xs uppercase) is the banned eyebrow / AI-tell. Drop uppercase, use plain text-xs font-s |

## src/features/dashboard/widgets.tsx  (4)

The widgets file is structurally clean — semantic spans with role=\"img\"/aria-label on PresenceDot, aria-hidden on the decorative skeleton bars, token-driven DOM classes (bg-brand-soft, text-muted, border-line) with proper dark: variants, and no fixed-px layout widths, side-stripe borders, eyebrows, or gradient text. The main issues are: (1) the StatCard value uses text-3xl font-bold, breaking the text-2xl ceiling and the semibold weight rule (P1); (2) the ECharts options hard-code hex colors that duplicate design tokens and, critically, the donut center metric is filled #111827 so it goes unreadable in dark mode despite the component shipping dark variants (P1/P2 theming); and (3) a chart axis label sits at fontSize 11, under the 12px type floor. No border or input violations (no inputs in this file). Responsiveness is solid (flex/flex-1, charts size to height prop).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 38 — StatCard value | P1 | ✓ | text-3xl (30px) exceeds the product ceiling of text-2xl (24px). The stat value is a hero metric, not a page hero; per th |
| theming | Lines 161-172 — Donut center percentage text | P1 | manuel | The donut center number is filled with hard-coded #111827 (near-black). The component renders a dark mode variant elsewh |
| theming | Lines 95, 101, 103, 107, 108, 116, 123, 152, 156, 177 — ECha | P2 | manuel | All chart colors are hard-coded hex values that duplicate the design tokens (#6b7280≈muted, #e5e7eb≈line, #2563eb≈brand) |
| typography | Lines 108, 95/103, 177 — ECharts axis/legend font sizes | P3 | ✓ | The y-axis label is rendered at fontSize 11, below the product floor of 12px (text-xs). Combined with the lightest gray  |

## src/features/docs/components/AppsPanel.tsx  (2)

AppsPanel.tsx is a strong, design-system-compliant file. Typography is fully on-scale (h3 cards use text-sm font-semibold text-ink; body/meta use text-sm/text-muted) with no oversized text, no arbitrary px, no eyebrows, no font-light, and no gradient text. Borders are clean: list items and vote buttons use full `border border-line` — no banned side-stripe accents. The input uses the shared `.input` class with an aria-label, and the IconButtons all carry `label` props. Theming is excellent: consistent tokens (text-ink, text-muted, border-line, bg-brand, bg-surface-2/3, text-ok/text-danger) with zero hard-coded hex or arbitrary grays. Motion respects motion-reduce. Only two minor a11y items: the approve/reject IconButtons are h-7 w-7 (28px, under the 44px touch target), and the poll progress bar is aria-hidden so its proportion isn't exposed to assistive tech. No anti-pattern or responsive issues found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Approvals list, lines 65-70 — IconButton className="h-7 w-7" | P2 | ✓ | 28px (h-7 w-7) touch targets are below the 44px minimum for interactive controls. These are the primary approve/reject a |
| a11y | Forms vote buttons, lines 121-137 — progress bar conveys vot | P3 | manuel | The numeric count (line 129) is shown but the proportion/percentage rendered by the bar is hidden from screen readers (a |

## src/features/docs/components/CalendarView.tsx  (1)

CalendarView.tsx is a small, well-built component that is essentially compliant with the TeamsLike design system. Typography uses the correct scale and tokens throughout (text-sm font-semibold text-ink for the h3, text-sm text-ink for body rows, text-muted for secondary person meta, text-sm text-muted for the empty-state) — no oversized text, no arbitrary px, no font-light, no eyebrows, no gradient text. There are no inputs, and no borders (no side-stripe accents, no random border colors). Responsiveness is solid: flex layouts, truncate on the label, shrink-0 on the bullet, no fixed px widths. Theming uses design tokens (ink, brand, muted) with no hard-coded hex. The single defensible nit is the date group label rendered as text-brand on a div — a colored heading where text-ink would be the consistent, higher-contrast token choice; the decorative blue is also carried separately by the bg-brand bullet, so the label does not need it. Decorative bullet correctly uses aria-hidden. Overall an exemplary, low-finding file.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | line 34: <div className="text-sm font-semibold text-brand">{ | P3 | ✓ | The date group label is the section heading for its row group, but it is colored text-brand (a brand-tinted color used d |

## src/features/docs/components/CanvasEditor.tsx  (5)

Clean, well-tokenized component (brand/ink/line/surface tokens throughout, no hex, no gradient text, no side-stripe borders, no eyebrows, motion-reduce handled, flex-wrap for mobile). Main issues are typographic: two off-scale text-lg usages (the doc-title select and the heading-block input) plus a font-bold/font-semibold inconsistency for the heading role — map to text-xl/text-base font-semibold. Both <select> controls also miss a focus ring and diverge from the .input vocabulary used by the adjacent text field, and the two selects have mismatched heights (h-9 vs h-10). No P0/P1; all findings are P2/P3 polish.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 41 — doc selector <select> | P2 | ✓ | This select is the document title (h1 role for the canvas). text-lg (18px) is off the fixed scale and font-bold conflict |
| typography | Line 73 — heading block <input> | P2 | ✓ | text-lg (18px) is not part of the fixed type scale. A heading block inside a card maps to the h2 section role: text-base |
| input | Lines 41 & 111 — the two <select> elements lack a focus ring | P2 | ✓ | Both selects are interactive form controls but provide no visible focus indication (no focus:ring / focus:border). The d |
| input | Lines 41 & 111 — inconsistent select heights / borders vs de | P3 | ✓ | Two sibling selects use different heights (h-9 vs h-10) and a different bg/border (bg-surface + border-line) than the st |
| a11y | Lines 84-92 — todo block <button> with progress meter | P3 | manuel | The progress bar communicates completion only visually (the fill span is aria-hidden). The numeric text beside it (prog. |

## src/features/docs/components/ClipDetail.tsx  (1)

Strong, design-system-compliant file. Typography is fully on-scale: headings use text-base/text-sm font-semibold text-ink per role, body uses text-sm, meta/counters via Badge — no oversized text, no arbitrary px, no eyebrows, no font-light, no gradient text. Borders are clean (full border border-line on comment items, no side-stripe accents, no nested-card doubling). Tokens (ink/muted/brand/line/surface) are used throughout with no hard-coded hex or random gray-XXX. Reaction buttons are real <button> elements with aria-pressed and focus-visible:ring. Inputs almost all use the .input class correctly with sr-only/aria labels. The single defensible deviation is the privacy <select> (line 216) which is hand-styled with bg-surface/border-line and lacks any focus ring, breaking the .input standard and removing a visible keyboard focus state. a11y scored 3 only for that missing focus indicator on the select; all other dimensions are excellent.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | Line 216, privacy <select> | P2 | ✓ | This select deviates from the design-system .input standard used everywhere else in this file (lines 132, 183, 235, 270, |

## src/features/docs/components/CommentSidebar.tsx  (1)

CommentSidebar.tsx is a clean, largely compliant file: it uses design tokens throughout (text-ink, text-muted, text-brand, text-ok, border-line, bg-surface), the .card and .input classes, a correct type scale (text-sm body/labels, text-xs meta), semantic <button>/<select>/<textarea> elements, and aria-labels on every interactive control. No oversized type, no arbitrary px fonts, no eyebrows, no gradient text, no side-stripe borders. The single defensible finding is the <select> on line 99, which bypasses the .input class used by its sibling textarea and therefore lacks a visible focus ring and uses a non-standard background/height/padding — an a11y and consistency gap. Severity P2, auto-fixable via a className swap to .input.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | <select> className, line 99 | P2 | ✓ | The select deviates from the design-system input vocabulary and from its sibling textarea (which uses .input on line 115 |

## src/features/docs/components/HillView.tsx  (1)

HillView.tsx is a clean, near-impeccable file. Typography follows the product scale (h3 = text-sm font-semibold text-ink; empty state = text-sm text-muted), borders avoid all side-stripe bans, the SVG carries role=\"img\" + aria-label, and theming uses tokens throughout (text-ink, text-muted, text-line, fill-brand, bg-brand) with zero hard-coded hex or arbitrary grays. No oversized text, no arbitrary px, no eyebrows, no gradient text, no glassmorphism. The single defensible nit (P3): the chart legend renders at text-sm text-ink where the scale calls for caption-sized text-xs text-muted, slightly over-weighting it against the section heading. Decorative legend swatch correctly uses aria-hidden. No P0/P1/P2 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Legend list items (line 38) | P3 | ✓ | A chart legend is meta/caption content. The type scale assigns caption/meta to text-xs text-muted, not body-weight text- |

## src/features/docs/components/TableGridView.tsx  (2)

TableGridView.tsx is a strong, largely compliant file. Typography is correct throughout: h3 title is text-sm font-semibold text-ink, headers/body use text-sm/text-xs from the scale, no oversized text, no arbitrary px font sizes, no gradient text, no eyebrows, no font-light. Borders are clean (border-line full borders, no side-stripe accents). Theming is excellent (brand/ink/line/muted/surface tokens, no hard-coded hex, no random gray-XXX). a11y is good: real <button> elements, aria-label on every icon button and select, scope=\"col\" on headers, role/aria-pressed on the view toggle, visible focus-visible:ring-2 rings, and motion-reduce handling. The only real findings are input-consistency nits: the add-column <select> hand-rolls styling instead of using the `.input` class its sibling text input uses (line 188-193), and the grid-cell inputs use a third focus/radius treatment (rounded-md + ring-2 ring-brand) that diverges from the standard `.input` (rounded-lg + focus:ring-1 focus:border-blue-500). Both are polish-level consistency issues, not WCAG or layout breaks.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | Add-column select, lines 188-193 | P2 | ✓ | This select reinvents the input styling by hand while the sibling text input on line 186 uses the design-system `.input` |
| input | Grid cell inputBase, lines 41-42 | P3 | manuel | Editable cell inputs/selects use rounded-md and a custom focus-visible:ring-2 ring-brand, whereas the design-system inpu |

## src/features/docs/components/WorkflowBuilder.tsx  (1)

A tidy, well-structured three-column workflow builder. Typography is fully on-scale (text-sm/text-xs roles, font-semibold/font-medium used consistently, no oversized headings, no arbitrary px, no gradients or eyebrows). Borders use border-line throughout with no side-stripe accents. Theming is excellent: ink/muted/surface/ok tokens, no hardcoded hex. Semantic HTML is good (button, ul/ol/li, aria-current, aria-label on both inputs). The one real finding: the trigger <select> bypasses the .input class the neighboring text input uses, dropping the standard bg/border/padding and—most importantly—the focus ring, hurting keyboard-focus visibility (a11y). Swapping it to className=\"input h-10\" fixes contrast, consistency, and focus in one localized change."

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | select element, line 56 | P2 | ✓ | This select deviates from the design-system input vocabulary and is inconsistent with the adjacent name input on line 50 |

## src/features/docs/DocsPage.tsx  (1)

DocsPage.tsx is an exemplary, near-compliant tab-shell file at the Linear/Notion bar. Typography is fully on-scale (text-sm throughout, no oversized headings, no arbitrary font sizes, no eyebrows, no font-light, no gradient text). Accessibility is excellent: a correct WAI-ARIA tablist with roving tabindex, ArrowLeft/Right/Home/End keyboard handling, aria-selected, aria-label, semantic <button> elements, visible focus-visible:ring-2, h-11 (44px) touch targets, and motion-reduce guards on every animation. Theming uses design tokens consistently (border-line, text-muted, text-brand, text-ink, bg-surface-2, ring-brand). No banned antipatterns: the border-b-2 on tabs is a legitimate active-tab underline convention, not a decorative side-stripe accent on a card/list-item/callout, so it is not flagged. The only real finding is one P3: arbitrary px icon sizing h-[18px] w-[18px] should map to the spacing scale (h-4 w-4). There are no inputs/selects/textareas in this file, so the input-vocabulary dimension does not apply.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Line 83: Icon className="h-[18px] w-[18px]" | P3 | ✓ | Arbitrary px icon sizing (h-[18px] w-[18px]) bypasses the Tailwind spacing scale. Map to a scale token (h-4/w-4 = 16px,  |

## src/features/intelligence/components/CoachingPanel.tsx  (4)

Small, mostly well-built RBAC-gated coaching panel. a11y is strong: real semantic html (h3, ul/li), role=\"note\" and aria-live=\"polite\" on the cue list, aria-hidden on decorative icons, and contrast is fine. Responsive is clean (flex, no fixed px widths). The real issues are typographic and theming: the h3 and the cue rows both use text-base where the fixed scale calls for text-sm (h3) and text-sm (body), so the panel renders one step oversized; the timestamp should be text-xs text-muted. Theming is the weakest area — the whole card is wrapped in a saturated border-blue-700 with bg-white, and cue text/timestamps use hard-coded text-gray-900/text-gray-500 even though the ink/muted/surface/line tokens are already imported and used in the locked-state branch of the same component. No banned tells (no gradient text, no eyebrow, no side-stripe border, no glassmorphism); the colored full border is the only mild antipattern. All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 53: h3 heading | P2 | ✓ | This is a card/sub heading (h3 role), which the type scale fixes at text-sm font-semibold text-ink. text-base is the h2  |
| typography | Line 60: list item body row | P2 | ✓ | Cue rows are body content; body is fixed at text-sm (14px). text-base (16px) is reserved for h2 section headings, so eac |
| theming | Line 52: card container colored border + bg-white | P2 | ✓ | Cards use border-line (gray-200) per the design system; a saturated border-blue-700 around the whole card is an inconsis |
| theming | Lines 62-63: hard-coded grays for cue text and timestamp | P3 | ✓ | text-gray-900 / text-gray-500 are hard-coded grays where the ink and muted tokens exist and are used elsewhere in this f |

## src/features/intelligence/components/HighlightReel.tsx  (4)

HighlightReel is structurally clean: semantic button elements, aria-hidden on decorative icons, full borders (no side-stripes), no gradients/eyebrows/glassmorphism, and good min-w-0/flex-1 truncation handling for responsiveness. The main issues are typographic: body text, list labels, and the empty-state all use text-base (16px) where the fixed product scale mandates text-sm (14px), making the component read larger than the rest of the product. Theming is mixed — the card adopts line/card tokens but light-mode text and background fall back to hard-coded gray-900/gray-500/white instead of ink/ink-2/muted/surface tokens. No banned anti-patterns. a11y is mostly solid; the list-item button hit area is comfortable, though hover-only affordance (hover:border) has no focus-visible equivalent for keyboard users, a minor gap.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 34: empty-state paragraph | P2 | ✓ | Body/helper text must be text-sm (14px) per the scale, not text-base (16px). Empty-state helper copy is oversized here a |
| typography | Line 47: highlight kind label | P2 | ✓ | Body emphasis / label role is text-sm (14px) font-medium, not text-base. A list-item label rendered at 16px breaks the t |
| typography | Line 50: highlight body text | P2 | ✓ | Body text must be text-sm (14px); text-base oversizes the secondary content and is inconsistent with the rest of the pro |
| theming | Lines 31-52: hard-coded grays vs tokens | P3 | ✓ | The product defines tokens (ink/ink-2/muted/surface/line). This file mixes the line token (border-line, rounded-card) wi |

## src/features/intelligence/components/IntelKpis.tsx  (2)

Clean, well-structured KPI grid that is largely compliant: tokenized borders/colors (border-line, bg-brand, text-muted, text-ink), proper responsive grid (grid-cols-2 / sm:grid-cols-3 / lg:grid-cols-5), aria-hidden on decorative icons, and consistent rounded-card/rounded-lg radii. Two real findings: (1) the KPI value uses off-scale text-lg (18px) which should map to text-base per the fixed type scale; (2) the inactive CSAT star uses hard-coded text-gray-300 in an otherwise token-driven file. No anti-pattern tells (no gradient text, eyebrows, side-stripe borders, or glass). a11y note: the CSAT star rating conveys rating purely visually with no aria-label/text alternative, but per the strict before-after rule it is borderline and left out of findings since labels exist on each Stat; the star count is decorative reinforcement of the meta label.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Stat component, value line (line 30): <div className="text-l | P2 | ✓ | text-lg (18px) is not in the fixed product type scale. The largest allowed size for a content metric/heading short of an |
| theming | CSAT star loop (line 63): className={"h-4 w-4 " + (n <= (sc. | P3 | ✓ | The rest of the file uses design tokens (border-line, text-muted, text-ink, bg-brand). The inactive-star color drops to  |

## src/features/intelligence/components/IntentList.tsx  (5)

Small, clean component with good structure (semantic h3, real ul/li, no antipattern tells — no eyebrows, gradients, or side-stripe borders, and border-line is used correctly). Main issues are typographic and thematic: body/list/empty-state text is set to text-base (16px) where the product body role is text-sm (14px), oversizing copy and colliding with the h2 size. Theming is the weakest area: the card hard-codes bg-white with a parallel dark: override instead of a surface token, and the file uses the rare text-fg/bg-surface/bg-accent token family rather than the established ink/surface-2/brand vocabulary. Accessibility is solid except the confidence bar lacks progressbar role/aria values. Responsive layout is fine (no fixed px widths, flex-based). No autoFixable label changes alter behavior.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 18: empty-state <p className="text-base text-muted"> | P2 | ✓ | Body/helper text role is text-sm (14px) in the product scale. text-base (16px) is reserved for h2 section headings, so u |
| typography | Line 23: list row container <div className="... text-base"> | P2 | ✓ | The intent label and confidence percentage are body/meta content. Body text role is text-sm (14px); text-base (16px) is  |
| theming | Line 13: card surface bg-white dark:bg-gray-800 | P3 | manuel | Surface color is hard-coded as bg-white plus a parallel dark: override (dark:bg-gray-800, dark:border-gray-700) instead  |
| theming | Lines 14,24: text-fg / 25,18: text-muted / 27: bg-surface /  | P3 | manuel | This file uses the text-fg/bg-surface/bg-accent token family which appears in only a handful of files, whereas the estab |
| a11y | Lines 27-28: confidence progress bar | P2 | ✓ | The confidence bar conveys a value purely visually. Without role="progressbar" and aria-valuenow/min/max, screen-reader  |

## src/features/intelligence/components/MeetingNotesCard.tsx  (5)

Structurally clean card (full border-line, rounded-card token, responsive sm:grid-cols-3, aria-hidden icons, no side-stripes/gradients/eyebrows). The dominant problem is typographic: the entire card is rendered at text-base (16px) — section h4 headers, list rows, keyword chips, counters, action items and empty state — which violates the fixed product scale. Sub-headers should be text-sm font-semibold (h3 role), body/lists text-sm, and counters/chips text-xs. Section headers also use the weak text-gray-500. Theming relies on raw gray-XXX + manual dark: pairs instead of the ink/muted tokens already used elsewhere in the same file. No anti-patterns. All fixes are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 32, 54, 70 — section h4 headers | P2 | ✓ | These three column sub-headers are h3/sub-card role, which is text-sm (14px) font-semibold in the product scale, not tex |
| typography | Lines 36-39 — WPM list rows and unit | P2 | ✓ | Body list content is text-sm (14px), not text-base (16px). The wpm number + unit is a meta/counter, which is text-xs tex |
| typography | Lines 61-63 — keyword chips and count | P2 | ✓ | Pill/tag chips are caption-scale UI; text-base (16px) makes them oversized for a chip cluster. Map to text-xs (12px), th |
| typography | Lines 74, 80 — action items list and empty state | P2 | ✓ | Action-item body text and the empty-state helper are body/helper role = text-sm (14px), not text-base (16px). text-base  |
| theming | Lines 27, 36, 37 etc — hard-coded gray scale instead of toke | P3 | ✓ | The product exposes ink/muted tokens (used here for border-line, rounded-card). Body and secondary text should use text- |

## src/features/intelligence/components/RecapPanel.tsx  (9)

RecapPanel is structurally clean — no side-stripe borders, no eyebrows, no gradient text, no glassmorphism, sensible responsive grid (sm:grid-cols-2) and a hidden-on-mobile owner name. The dominant problem is typographic scale: nearly every text element (TLDR, bullet lists, all h4 section headings, action text, owner labels, button) is text-base (16px), one step above the product body size of text-sm (14px). Section h4 headings compound this by also using text-gray-500 (the muted role), inverting the visual hierarchy so titles read weaker than their body. Theming is inconsistent: the file mixes design tokens (border-line, rounded-card) with raw text-gray-900/500 hex-equivalent grays. Fixes are localized className swaps mapping text-base→text-sm/text-xs and grays→ink/muted tokens. No P0 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 38 — recap.tldr paragraph | P1 | ✓ | Body copy must be text-sm (14px) per the fixed product scale. text-base (16px) is one step too large for body text and i |
| typography | lines 43, 54 — Decisions / Next Steps h4 section headings | P1 | ✓ | h3/h4 card-sub headings are text-sm font-semibold text-ink. These are text-base and colored text-gray-500 (the muted/hel |
| typography | lines 44, 55 — decisions / nextSteps bullet lists | P1 | ✓ | Body list content must be text-sm (14px). text-base oversizes it relative to the product scale. |
| typography | line 66 — Action Items h4 heading | P1 | ✓ | Sub-heading role is text-sm font-semibold text-ink. text-base + text-gray-500 makes the heading both oversized and muted |
| typography | line 76 — action item text span | P1 | ✓ | List-item body text must be text-sm (14px), not text-base. |
| typography | line 77 — action owner label | P1 | ✓ | Owner name beside an avatar is meta/secondary content; per scale it should be text-xs text-muted (caption/meta), and is  |
| typography | line 84 — Send to chat button | P2 | ✓ | Button/label text is text-sm font-medium (14px). text-base oversizes the action and font-medium is missing for the butto |
| theming | lines 38, 44, 55, 76 — hard-coded grays for ink | P2 | ✓ | The file already uses tokens (border-line, rounded-card) but text colors are raw text-gray-900 / text-gray-500. Body/ink |
| theming | line 35 — recap h3 title color | P3 | ✓ | The h2/h3 heading role is text-ink, not brand blue. Coloring the panel title text-blue-700 is decorative; reserve brand  |

## src/features/intelligence/components/RubricCard.tsx  (2)

RubricCard.tsx is a clean, token-disciplined component. Theming uses design tokens throughout (border-line, text-ink, text-muted, text-danger, dark: variants), inputs are n/a, a11y is solid (semantic h3/ul/li, aria-labels on the pass/fail icons, adequate contrast), and there are no anti-pattern tells (no gradient text, no side-stripe borders, no eyebrows, no glassmorphism). The only defensible findings are typographic role/scale mismatches: the card heading (line 18) and the body list rows (line 25) both use text-base where the fixed scale assigns text-sm for the h3 (card/sub) and body roles respectively. Both are localized className swaps. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 25: <li className="flex items-start gap-2 text-base"> | P2 | ✓ | List rows are body content. The fixed product scale sets body to text-sm (14px); text-base (16px) is the h2 section role |
| typography | Line 18: <h3 className="text-base font-semibold text-ink dar | P3 | ✓ | This is a card/sub heading (h3). The fixed scale assigns h3 (card/sub) text-sm font-semibold; text-base font-semibold is |

## src/features/intelligence/components/Scorecard.tsx  (5)

A compact, mostly-clean Dialpad-style metric card. Theming is solid (border-line, bg-surface-2, text-ink/muted, text-brand tokens with disciplined dark: pairings; no hard-coded hex). The main issues are typographic: metric labels are set at text-base (16px) where the scale wants text-xs, and every stat value is text-xl (20px) — the big-number/hero-metric template — which should drop to text-base font-semibold to restore hierarchy under the h3 card title. The predictedCsat callout header (text-base) and reason line (text-base) should both move to text-sm. No banned tells otherwise: no gradient text, no eyebrows, no side-stripe borders (the callout uses a full border border-line), inputs N/A. Accessibility gap: CSAT star ratings are entirely aria-hidden with no text alternative, so the numeric score is not announced to screen readers. Responsive is fine — fixed 2-col grid with gap, no fixed-px widths, no overflow risk.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | dt labels, lines 19, 23, 29, 33, 39, 44 (e.g. line 19) | P2 | ✓ | These are metric labels (caption/meta role) sitting above stat values. The scale puts caption/meta/counter at text-xs (1 |
| typography | dd metric values, lines 20, 24, 30, 34, 40 | P2 | ✓ | text-xl (20px) is the h1 page-title role. Using it for every stat in a 2-column metric grid inside a card is the hero-me |
| typography | predictedCsat header row, line 60 | P3 | ✓ | This is a sub-card label inside the predicted-CSAT callout (h3 card/sub role), not an h2 section heading. h3 role is tex |
| typography | csatReason paragraph, line 73 | P2 | ✓ | Body/helper text is text-sm (14px) per the scale; text-base (16px) is reserved for h2 section headings. This explanatory |
| a11y | CSAT star rows, lines 45-53 (csat) and 63-71 (predictedCsat) | P2 | manuel | Every star icon is aria-hidden and there is no text alternative, so a screen reader announces the 'CSAT' label with no r |

## src/features/intelligence/components/SentimentChip.tsx  (1)

A small, mostly clean utility component. It correctly conveys sentiment by colour plus icon plus label (not colour alone), uses design tokens (text-muted) and proper dark variants, and marks the icon aria-hidden. The one real typeset issue: the chip uses text-base (16px), oversized for a meta/status chip; it should sit at text-xs (caption/meta) or at most text-sm. No border, input, antipattern, or hard-coded-hex issues.</summary>
</invoke>


| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 18 chip span | P2 | ✓ | A sentiment chip is a meta/status indicator paired with a 16px icon. text-base (16px) is the h2 section role and is over |

## src/features/intelligence/components/SentimentTimeline.tsx  (2)

A small, clean SVG sentiment sparkline card. Strong on a11y (role=\"img\" + aria-label on the chart, semantic h3, no interactive-as-div issues) and responsive (viewBox + w-full scales with no fixed-px overflow). No AI-slop tells: no gradient text, eyebrows, side-stripe borders, or glassmorphism. Two real issues: (1) the SVG baseline gridline uses a hard-coded #e5e7eb stroke that ignores dark mode while the surrounding card themes correctly via dark: variants, and (2) the h3 card title is styled text-base/text-fg instead of the role-correct text-sm font-semibold text-ink. The chart polyline/dot hex colors (#1d4ed8, #16a34a, #dc2626, #9ca3af) are acceptable as raw SVG attributes since they are semantic data colors, though they are hard-coded; the gridline is the one that breaks visibly across themes.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | line 23: <line ... stroke="#e5e7eb" /> | P2 | ✓ | The baseline gridline is a hard-coded light gray (#e5e7eb) that does not respond to the dark: variant the rest of the ca |
| typography | line 21: <h3 className="... text-base font-semibold text-fg" | P3 | ✓ | This is a card title (h3 role), which the type scale fixes at text-sm font-semibold; text-base is reserved for the h2 se |

## src/features/intelligence/components/SpeakerAnalytics.tsx  (4)

A small, clean component with no banned anti-patterns: full borders (border border-line), no side-stripes, no gradient text, no eyebrows, no font-light, and a proper progress bar built from divs. Responsiveness is sound (w-full, flex-wrap, no fixed px widths). The main issues are typographic sizing: body list rows and meta/counter rows are set at text-base (16px) where the product scale calls for text-sm (body) and text-xs (meta/counters), which flattens the hierarchy against the text-base h3 heading. A minor theming inconsistency: text-fg is used instead of the register's text-ink primary token. No inputs in this file. a11y is acceptable (uses semantic h3/ul/li, token-based muted color) but the heavy reliance on text-muted for counters plus oversized-then-correctable sizing keeps it from full marks.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 22: <div className="flex items-center justify-between t | P2 | ✓ | This is a list row (speaker name + percentage/time), which is body content. The product body role is text-sm (14px); tex |
| typography | Line 29: <div className="flex flex-wrap items-center gap-3 t | P2 | ✓ | This row holds meta/counters (sentiment chip, interruptions count, filler-words count) in muted color. Per the scale, ca |
| typography | Line 24: <span className="text-muted">{pct}% · {fmtClock(s.t | P3 | ✓ | The percentage/clock is a counter/meta value rendered muted; it inherits text-base from the parent row (line 22) but the |
| theming | Lines 16, 23: text-fg token usage | P3 | ✓ | The product type register specifies the primary text token as text-ink (with text-ink-2 for body). text-fg is a deviatin |

## src/features/intelligence/components/TrackersCard.tsx  (4)

Small, clean component with good structure (semantic ul/li, aria-hidden on decorative icons, no AI-slop tells: no gradients, eyebrows, side-stripes, or glassmorphism). Two real issues. Typography: both the h3 title and the list rows use text-base (16px) where the fixed scale calls for text-sm (14px) for h3 card headings and body content — one step oversized. Theming: text-fg is an undefined token (no --color-fg exists; the system uses text-ink, used in 117 files vs text-fg in 5), so primary text silently falls back to inherited color and dodges the token layer — should be text-ink. The card background is hard-coded bg-white instead of the bg-surface token, while everything else (border-line, rounded-card, dark variants) is tokenized. a11y is otherwise solid; the only knock is the text-fg token failing to set an explicit color. No responsive or border-system problems.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 24: h3 heading | P2 | ✓ | Per the fixed type scale, an h3 card/sub heading is text-sm (14px) font-semibold. This card title is rendered at text-ba |
| typography | line 29: list row container | P2 | ✓ | Tracker rows are body content and must be text-sm (14px). They are set to text-base (16px), making every list row oversi |
| theming | lines 24 and 31: text-fg | P2 | ✓ | text-fg is not a defined design token — the token system exports --color-ink/--color-ink-2/--color-muted (text-ink is us |
| theming | line 23: card background | P3 | ✓ | The light background is hard-coded as bg-white while the rest of the card uses tokens (border-line, rounded-card) and th |

## src/features/intelligence/components/TranscriptViewer.tsx  (3)

Well-structured viewer using design tokens (border-line, text-ink, text-muted, surface-*), semantic input/select with aria-labels, flex-wrap responsive header, and proper focus/scroll handling. Two real findings: a banned colored side-stripe (border-l-2 border-brand) on the per-segment translation block, and the speaker-name heading missing an explicit text-sm so it renders one step too large. Minor theming nit: raw bg-white on the dubbing strip and translation block instead of a surface token. Inputs deviate slightly from the .input standard (bg-surface-3 instead of bg-surface-2/gray-50, rounded-md vs rounded-lg, no focus ring — outline-none with no focus:ring) but borderline; the focus-ring removal is the only a11y concern keeping a11y at 3.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| border | Line 134 — translation block under each segment | P1 | ✓ | border-l-2 border-brand is a banned colored side-stripe accent on a content block. Rewrite as a full 1px border with a b |
| typography | Line 124 — speaker name in segment header | P2 | ✓ | Speaker name (h3 card/sub role) has no text size class, so it inherits the parent and renders at default text-base/16px  |
| theming | Lines 108, 134 — hard-coded bg-white on tinted blocks | P3 | ✓ | bg-white is a raw color rather than a surface token; it sits inside a bg-surface-2 card so it reads as an unintended fla |

## src/features/intelligence/components/TranslationSessionPanel.tsx  (4)

Small, mostly clean panel that correctly uses design tokens (border-line, text-ink, text-muted, text-brand, bg-surface-3, rounded-card) with proper dark-mode variants, flex-wrap responsiveness, semantic <button> elements, and aria-pressed on toggles. Main issues are typographic: text-base (16px) is used for the buffered counter, the language chips, and the voice-preserve toggle, where the product scale calls for text-xs (counter/chip) and text-sm font-medium (button). The language chips also carry a banned `uppercase` eyebrow tell that should be dropped. One minor a11y polish: the 2-letter language chips lack a descriptive accessible name. Theming and responsiveness are excellent; no gradient text, glassmorphism, side-stripe borders, or hero-metric slop.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 39 — buffered counter span | P2 | ✓ | This is a meta/counter (segments buffered), which the scale assigns to text-xs (12px). text-base (16px) oversizes second |
| typography | line 72 — language toggle chip className | P1 | ✓ | Two issues: text-base (16px) is too large for a compact chip/label (scale wants text-xs caption or text-sm label), and ` |
| typography | line 89 — voice-preserve toggle button className | P2 | ✓ | Button/label text role is text-sm font-medium (14px). text-base (16px) deviates from the standard button typographic rol |
| a11y | lines 67-79 — language toggle <button> | P3 | manuel | The button's only accessible name is the 2-letter code (e.g. "tr"). With aria-pressed it reads as 'tr, toggle button' gi |

## src/features/intelligence/IntelligenceDashboard.tsx  (4)

Well-structured dashboard with semantic buttons, proper role=tab/tablist, aria-selected/aria-pressed/aria-label, h-9 (~36px) consistent control heights, flex-wrap responsive header, and clean token usage (brand/ink/muted/line/surface) — no AI-slop tells (no gradient text, eyebrows, glassmorphism, or side-stripe borders). Main issues: both <select> controls lack any focus ring/border-change (P1 a11y — keyboard focus is invisible and violates the .input focus contract), and they use bg-surface-3/border-line rather than the standard input bg-surface-2/border-gray-300 vocabulary. The h1 uses font-bold instead of the spec'd font-semibold for the page-title role, and one tab hover uses a hard-coded gray-300 instead of the border-line token. Responsive structure (lg:grid-cols breakpoints, flex-wrap, min-h-0 overflow handling) is solid.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 225 — h1 page title | P2 | ✓ | The h1 page-title role is defined as text-xl font-semibold. Using font-bold here deviates from the scale and risks the s |
| input | Line 232-237 — source <select> | P1 | ✓ | This select has no focus-visible affordance — keyboard users get no ring/border change on focus, breaking the .input con |
| input | Line 347-352 — translateTo <select> | P1 | ✓ | Same as the source select: no focus ring/border-change means no visible focus indicator for keyboard users, violating th |
| theming | Line 64 — TabBtn inactive hover border | P3 | ✓ | Random hard-coded hover:border-gray-300 on a non-input element bypasses the border-line (gray-200) divider token used ev |

## src/features/intelligence/IntelligencePage.tsx  (2)

The file is largely compliant and clean: it uses design tokens throughout (text-ink, text-muted, border-line, bg-surface-2, text-danger, brand), the shared .input class for the two search inputs, semantic html (Button, h2, native button with title), responsive grid breakpoints (grid-cols-1 sm:grid-cols-3, md:p-6), and a tabular-nums counter at the correct text-xs role. No gradient text, no eyebrows, no side-stripe borders, no arbitrary px sizes, no font-light. The one real issue is the selected-transcript title rendered at text-2xl font-bold in both the read-mode h2 and the edit-mode input: text-2xl is the page-hero ceiling and font-bold is off the standard semibold weight, so this section heading is oversized and off-register against the fixed type scale. Both should map to the h2 role text-base font-semibold. Minor a11y notes (not scored as findings): the card list item is a clickable div rather than a button, and the icon-only delete/copy/download controls rely on title rather than aria-label, but title is present so they are not fully unlabeled.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h2 selected transcript title (line 343) | P1 | ✓ | This is the section heading for the selected transcript (an h2 role). The fixed scale assigns h2 → text-base font-semibo |
| typography | editable title input (line 340) | P1 | ✓ | The edit-mode input must visually match the h2 it replaces (same role = same type). It carries the same oversized text-2 |

## src/features/intelligence/TranscriptAnalyticsPanel.tsx  (4)

Typography is clean and on-scale: stat counters use text-xl font-semibold text-ink tabular-nums with text-xs text-muted labels, section titles use text-sm font-medium text-ink, and helper/empty text uses text-sm/text-xs text-muted — no oversized text, no arbitrary px, no eyebrows, no font-light, no gradient text. Cards use the .card class and the speaker progress bars correctly use bg-brand/bg-surface-2 with motion-reduce handling and a token-based ease var — no side-stripe borders, no input deviations (there are no inputs). The responsive grid (grid-cols-2 sm:grid-cols-3 lg:grid-cols-6) is sound. The real issues are not typographic: (1) P0 Rules-of-Hooks violation — the freqOption useMemo is declared after the early empty-content return, which will crash when content toggles; (2) theming — the ECharts config hard-codes five hex values that duplicate existing design tokens (brand/line/muted), the file's weakest dimension; (3) minor a11y gap on the unlabelled canvas chart and an 11px axis label below the 12px floor.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | freqOption useMemo (lines 35-61) declared after the early re | P0 | manuel | Rules-of-Hooks violation: useMemo is called conditionally because the early return runs before it on empty content. Reac |
| theming | freqOption ECharts config (lines 42-56) axis/series colors | P2 | manuel | Five hard-coded hex values duplicate the design tokens (brand=#2563eb, line=#e5e7eb, muted=#6b7280) used elsewhere as bg |
| antipattern | chart axisLabel fontSize 11 (line 43) | P3 | ✓ | 11px tick labels fall below the 12px readability floor and are inconsistent with the sibling yAxis which already uses fo |
| a11y | Frequency chart EChart (lines 99-100) has no accessible text | P2 | manuel | The bar chart is canvas-rendered with no text alternative; screen-reader users get nothing. The numeric data exists, so  |

## src/features/intelligence/TranscriptViewer.tsx  (1)

TranscriptViewer is a clean, well-tokenized read-only component: uses design tokens throughout (text-ink, text-muted, bg-brand/20, brand tints), semantic <mark>/<p>/<span>, no gradient text, no eyebrows, no side-stripe borders, no fixed-px widths, and proper min-w-0 flex truncation handling. The speaker-tint palette is tasteful and deterministic. The one real defect is the arbitrary text-[11px] timestamp (line 66), which falls below the 12px floor and off-scale — map to text-xs. a11y scores 3 rather than 4 because the colored speaker badges (e.g. text-amber-600/text-cyan-600 on a /10 tint, and the bg-brand/20 mark text-ink) ride a thin contrast margin, but these are large-ish badge labels and not a clear AA break, so no separate finding is raised. No theming, responsive, or antipattern violations found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 66 — segment timestamp span | P2 | ✓ | Arbitrary text-[11px] is below the 12px floor and off the fixed type scale; meta/timestamp role maps to text-xs. text-[1 |

## src/features/meetings/components/ControlBar.tsx  (5)

Dark meeting control bar with solid semantic-button accessibility foundations (aria-label/aria-pressed/title on every control, 48px round targets). Main issues are accessibility-focused: reaction buttons strip the focus outline with no replacement, RoundBtn has no visible focus-visible ring, and reaction touch targets fall below 44px. Theming leans on hard-coded gray-800/red-600 instead of tokens, and a same-color 1px border (border-gray-800 on bg-gray-800) is a no-op decoration. No typography violations, no oversized text, no gradient text, eyebrows, or side-stripe borders.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Reaction buttons className (line 158) | P1 | ✓ | outline-none removes the keyboard focus indicator with no replacement, so keyboard users cannot see which reaction is fo |
| a11y | RoundBtn button className (line 51) | P1 | ✓ | The shared round control button provides no visible focus-visible ring; on the dark bar default/active tones give keyboa |
| a11y | Reaction button sizing (line 158) | P2 | ✓ | px-2 py-1 around a text-xl emoji yields a touch target well under the 44px minimum, making reactions hard to tap on touc |
| border | RoundBtn default tone (line 56) | P3 | ✓ | A 1px border in the exact same color as the background (border-gray-800 on bg-gray-800) is invisible and serves no purpo |
| theming | RoundBtn tone styles and bar container (lines 53, 56, 103, 1 | P2 | manuel | The active tone already uses the bg-brand token, but the surrounding surfaces, dividers, and danger state are hard-coded |

## src/features/meetings/components/CreateRoomDialog.tsx  (4)

Small, well-structured dialog with no oversized type, no banned antipatterns (no gradient text, eyebrows, or side-stripe borders), and good responsive behavior (flex-wrap toggles, w-full inputs). Main issues are input-system compliance: both inputs use outline-none with no replacement focus ring (P1 a11y/WCAG 2.4.7 fail) and deviate from the standard .input vocabulary (bg-white vs bg-surface-2, border-line vs border-gray-300, rounded-md vs rounded-lg, h-11/px-3 vs p-2.5, no placeholder-gray-400). Theming mixes design tokens with hard-coded gray-500/white in labels and the Toggle off-state. Typography is fully compliant.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | input (lines 71, 86): className="h-11 w-full rounded-md bord | P1 | ✓ | Both inputs use outline-none with no replacement focus style, so keyboard users get no visible focus indicator (WCAG 2.4 |
| input | input (lines 67-72, 82-87) | P2 | ✓ | Inputs deviate from the standard .input system: bg-white instead of bg-surface-2/gray-50, border-line instead of border- |
| theming | label spans (lines 64, 79) and Toggle (lines 50-53) | P3 | ✓ | Field labels and the Toggle off-state use hard-coded text-gray-500 / bg-white instead of the design tokens (text-muted,  |
| a11y | label/input association (lines 63-72, 78-88) | P3 | manuel | The wrapping <label> does implicitly associate the text with the input, which is acceptable; noting that placeholder tex |

## src/features/meetings/components/EngagePanel.tsx  (2)

EngagePanel is a clean, well-structured side panel: correct type scale throughout (text-base h2 header, text-sm font-semibold section headings, text-sm body, no oversized type, no arbitrary px text sizes, no eyebrows, no gradient text), consistent token usage (ink/muted/line/brand/surface), no side-stripe borders, semantic buttons with aria-pressed/aria-hidden, and a responsive fixed-width aside with proper overflow handling. The notable gap is the form inputs: all three text inputs use outline-none with no replacement focus ring and deviate from the .input vocabulary (bg-surface + border-line instead of bg-surface-2 + border-gray-300 + focus:ring), which breaks keyboard focus visibility (P1). Secondary a11y concern: the dense Q&A answer/upvote action buttons sit below the 44px touch target and lack a focus-visible style (P2). Typography, theming, responsiveness, and antipattern hygiene are otherwise excellent.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | Poll question input (line 120), poll option inputs (line 129 | P1 | ✓ | outline-none removes the focus indicator with no replacement, so keyboard users get no visible focus on these text input |
| a11y | Q&A answer button (line 199) and answer/upvote action row | P2 | manuel | The answer and upvote controls use py-0.5 (~22px tall), well under the 44px touch-target minimum, and rely only on hover |

## src/features/meetings/components/FacilitatorPanel.tsx  (2)

Clean, well-structured panel that largely follows the design system: semantic HTML (section/h3/ul/ol), aria-hidden on decorative icons, aria-live on the timer counter, tabular-nums for numeric alignment, IconButton with labels for controls, min-w-0 + truncate to prevent overflow, and no AI-slop tells (no gradient text, eyebrows, side-stripe borders, or glassmorphism). Type roles map to the scale (text-sm body, text-xs not needed). Two real issues: (1) theming is split — tokens (text-ink, text-muted) coexist with hard-coded `dark:border-gray-700` / `dark:text-gray-100` overrides on the three card containers, which should collapse into `border-line` / `text-ink` tokens that already handle dark mode; (2) the h3 panel title is colored `text-muted` instead of `text-ink`, weakening hierarchy against the muted sub-labels. Both are localized className swaps. No a11y or responsive defects found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Lines 44, 69, 88 — card containers `dark:border-gray-700` al | P2 | ✓ | The codebase exposes semantic tokens (border-line, text-ink) that already resolve correctly in dark mode. Hard-coding `b |
| typography | Line 40 — section heading `h3` | P2 | ✓ | Per the type scale an h3 card/sub heading is `text-sm font-semibold text-ink`. Rendering the panel's title in `text-mute |

## src/features/meetings/components/HostPanel.tsx  (1)

HostPanel.tsx is a clean, well-built file that largely meets the impeccable bar. Typography is fully compliant: all text uses text-sm/text-xs from the scale, headings are consistently font-semibold (no font-bold/font-light drift, no oversized text, no arbitrary px font sizes, no gradient text, no eyebrows). Theming is token-driven throughout (text-ink/ink-3, text-brand, border-line, bg-surface/surface-2, text-danger) with no hard-coded hex or random gray-XXX. Borders are correct: border-l border-line on the aside (line 71) is a structural panel divider, NOT a decorative side-stripe accent, so it is fine; SettingRow uses a full border border-line. Accessibility is strong: semantic button elements with type=\"button\" and aria-pressed for the toggles, aria-hidden on decorative icons, aria-label on the aside and IconButton, and 44px touch targets (h-11 rows, Button/IconButton components). No inputs/selects in this file. The only nit is a minor icon-size inconsistency (h-5 w-5 close icon vs h-[18px] w-[18px] elsewhere). Scores are high across all dimensions.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Icon sizing throughout (h-[18px] w-[18px]) on lines 89, 91,  | P3 | ✓ | The close-panel icon uses h-5 w-5 (20px) while every other icon uses arbitrary h-[18px] w-[18px]. Two different icon siz |

## src/features/meetings/components/MeetGmPanel.tsx  (3)

A well-built, token-disciplined panel. Typography respects the fixed scale (no oversized text, no arbitrary px font sizes, no eyebrows, no gradient/font-light), borders are full 1px border-line with no side-stripes, and interactive elements use semantic buttons with aria-pressed/aria-label and visible focus-visible rings. Theming is excellent (text-ink/ink-2, border-line, text-brand, bg-surface throughout, no hard-coded hex). The only real findings are minor: the shared select styling deviates from the design-system input vocabulary (bg-surface vs surface-2, border-line vs gray-300, rounded-md vs rounded-lg, brand focus ring vs standard blue), selects are h-9 (sub-44px touch target while sibling toggles are h-11), and section h3 headings are inconsistently colored (text-ink in Notes, text-ink-2 elsewhere). No anti-pattern slop present.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | selectCls constant (line 60-61); all <select> elements (acce | P2 | ✓ | Selects deviate from the standard input system: bg-surface instead of bg-surface-2/gray-50, border-line instead of borde |
| a11y | Quality/bandwidth selects via selectCls — h-9 height (line 6 | P3 | ✓ | The selects are 36px tall (h-9), below the 44px touch-target guideline. The Toggle buttons in the same panel correctly u |
| a11y | Take Notes section h3 (line 218) vs other section h3 heading | P3 | ✓ | Same heading role (section h3) is styled two ways: text-ink on the Notes heading but text-ink-2 on moderation/participan |

## src/features/meetings/components/MeetingRoom.tsx  (6)

MeetingRoom is a dark-themed meeting shell that is structurally clean: no gradient text, no eyebrows, no side-stripe borders, semantic buttons via the shared Button component, proper aria-hidden on decorative icons, and aria-live on the captions region. The dominant issue is a typographic one: nearly all meta/status chrome in the top bar (recording pill, participant count, AI companion chip) and the lobby banner use text-base (16px) where the fixed scale assigns text-xs (12px, meta/counter) or text-sm (14px, body). This flattens hierarchy so secondary chrome competes with the meeting title. Secondary issues: white-on-red-600 recording badge falls just under WCAG AA 4.5:1, and the reaction emoji uses text-3xl which breaks the text-2xl ceiling. Theming uses raw gray-800/900/700/400 and red-600 rather than tokens, but this is a dark surface where the standard light tokens (ink/line/surface) do not directly map, so it is a soft deduction. All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 66-69, recording badge | P2 | ✓ | A pill status badge (REC 00:12) is meta/counter content. Per the scale that role is text-xs (12px), not text-base (16px) |
| typography | Line 71-73, participant count | P2 | ✓ | Participant count is a meta/counter in the top chrome. The scale assigns caption/meta to text-xs (12px); text-base (16px |
| typography | Line 75-78, AI companion chip | P2 | ✓ | A short status indicator paired with a 14px (h-3.5) icon. As meta chrome it should be text-xs; text-base mismatches the  |
| typography | Line 85-87, lobby banner text | P3 | ✓ | Inline banner body text sitting next to sm Buttons should be body = text-sm (14px). text-base reads as a section heading |
| a11y | Line 66, recording badge color contrast | P2 | ✓ | White text on bg-red-600 (#dc2626) is ~3.9:1, below WCAG AA 4.5:1 for this small text. bg-red-700 (#b91c1c) raises it to |
| a11y | Line 105, reaction emoji | P3 | ✓ | text-3xl (30px) exceeds the text-2xl ceiling. Floating reaction emojis are decorative chrome; cap at text-2xl to honor t |

## src/features/meetings/components/MeetingsLanding.tsx  (11)

MeetingsLanding.tsx is structurally clean (good responsive grid with sm/lg breakpoints, semantic Button/IconButton with aria labels, no side-stripe borders, no gradient text, no eyebrows, full border-line cards) but has a systematic type-scale and tokening problem. The h1 is text-3xl font-bold, breaching the text-2xl ceiling and the standard font-semibold weight; every card title is off-scale text-lg (should be text-sm), every supporting line is text-base (should be text-sm/helper), the +N counter is text-base (should be text-xs), and section h2 headings are text-xl, the h1 role, collapsing the heading hierarchy. Color is hard-coded text-gray-900/text-gray-500 throughout instead of the ink/muted tokens already partially used (bg-surface-2, text-brand). Antipattern and responsive are strong; main wins are reducing the hero, normalizing card text to the text-sm scale, and swapping grays for tokens. All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h1 page title, line 42 | P1 | ✓ | text-3xl breaks the CEILING (text-2xl) and is oversized for an h1 page title, whose role is text-xl font-semibold. font- |
| typography | subtitle paragraph, line 45 | P2 | ✓ | Helper/secondary text role is text-sm text-muted, not text-base. text-base is reserved for h2 sections; using it for bod |
| typography | personal room title, line 72 | P2 | ✓ | Card/sub heading role is text-sm font-semibold. text-lg (18px) is not in the type scale and oversizes the card title. |
| typography | personal room URL, line 75 | P2 | ✓ | Secondary/meta text role is text-sm text-muted. text-base overstates a supporting URL line and clashes with the section- |
| typography | meeting card title, line 100 | P2 | ✓ | Card title role is text-sm font-semibold. text-lg (18px) is off-scale and inconsistent with the product card heading siz |
| typography | meeting card host name, line 103 | P2 | ✓ | Supporting meta (host name) is helper text → text-sm text-muted, not text-base. |
| typography | participant +N overflow chip, line 127 | P2 | ✓ | A +N counter inside a 32px avatar chip is a caption/counter → text-xs text-muted. text-base (16px) overflows the chip an |
| typography | room card name, line 164 | P2 | ✓ | Card title role is text-sm font-semibold; text-lg is off-scale (same fix as other card titles for consistency). |
| typography | room card participant meta, line 167 | P2 | ✓ | Participant count / waiting-room status is meta/helper text → text-sm text-muted, not text-base. |
| theming | section h2 headings, lines 89 and 142 | P1 | ✓ | h2 section role is text-base font-semibold text-ink. Here h2 is text-xl, which is the h1 role — h1 and h2 end up the sam |
| theming | repeated text-gray-900 / text-gray-500 across titles and met | P2 | ✓ | Hard-coded gray-XXX bypasses the design tokens (ink/muted) used elsewhere in the product. bg-surface-2 and text-brand ar |

## src/features/meetings/components/MeetParityPanel.tsx  (10)

Functionally clean component with consistent local tokens (fg/muted/border/accent), good aria usage (aria-pressed, aria-live, aria-label), and 44px toggle targets. The dominant problem is a collapsed type scale: nearly every text role — body, button labels, list meta, captions, helper text — is rendered at text-base (16px) with no hierarchy. Section headings (h3) are styled text-base text-muted, which is both the wrong emphasis (muted greys out a heading) and the wrong scale role. Captions/meta (attendance stat, archive summary, recording/transcript icons) should drop to text-xs but sit at text-base. The archive input deviates from the input design-system vocabulary (no focus ring/visible focus, non-standard surface/radius/size). Icon sizes are arbitrary pixel values. No gradient text, eyebrows, or side-stripe borders.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h3 section headings: lines 107, 150, 167 | P1 | ✓ | Headings rendered in text-muted are de-emphasized below their own body content, inverting hierarchy; a section/card head |
| typography | body/label text uniformly text-base across Toggle and rows:  | P1 | ✓ | Body, button labels, and row labels are all text-base (16px); the product body/label role is text-sm (14px). Everything  |
| typography | on/off state label: line 74 | P2 | ✓ | The on/off state is a status value and should be text-sm font-medium per the label role, not text-base; medium weight di |
| typography | attendance stat / countdown meta: lines 127, 144-146 | P2 | ✓ | Counter/stat meta (present/invited ratio, percentage) is the caption/meta role = text-xs text-muted, but inherits text-b |
| typography | archive list summary + empty state: lines 189, 192 | P2 | ✓ | The archive summary is secondary helper text under a title and the empty-state is meta; both are text-base text-muted. H |
| typography | watermark notice: line 161 | P3 | ✓ | A watermark/diagnostic label is caption/meta text; at text-base it competes with primary controls. Drop to text-xs text- |
| input | archive search input: lines 173-179 | P1 | ✓ | Deviates from the input vocabulary: outline-none removes the focus indicator with no replacement, uses bg-bg (page backg |
| a11y | archive search input focus removal: line 178 | P1 | ✓ | outline-none with no focus-visible style leaves the only text input in the panel with no visible focus state, breaking k |
| theming | arbitrary icon sizes throughout: lines 38-51, 113, 119, 123, | P3 | ✓ | Icon sizing uses arbitrary pixel values (h-[18px], h-[14px], h-[13px]) instead of the spacing scale (h-4 = 16px, h-3.5 = |
| a11y | archive recording/transcript indicator icons: lines 186-187 | P2 | manuel | These icons convey state (recording/transcript available) but are aria-hidden with no text alternative, so screen-reader |

## src/features/meetings/components/PreJoin.tsx  (8)

Dark-themed meeting PreJoin screen. Structurally solid and responsive (max-w-3xl, sm:grid-cols-2, semantic buttons with aria-pressed/aria-label, 44px+ touch targets on the round toggles). Main issues are typographic inflation: the h1 uses the landing-only text-2xl plus font-bold, and nearly every supporting string (subtitle, status pill, labels, toggle text) is set at text-base instead of the correct text-sm/text-xs scale roles. The camera/mic selects deviate from the .input standard (rounded-md, text-base, no focus ring) which is both a consistency and keyboard-a11y gap. The off-state AI-companion text (gray-400 on a semi-transparent gray-800) likely fails AA contrast. Theming relies on raw gray-600/700/800/900 instead of dark-surface tokens. No banned tells (no gradient text, no side-stripe borders, no eyebrows); the brand gradient on the video preview is a decorative aria-hidden backdrop, acceptable. No P0s.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h1 page title (line 56) | P2 | ✓ | h1 page title role is text-xl font-semibold per the scale; text-2xl is reserved for the rare landing hero, and font-bold |
| typography | subtitle (line 57) | P2 | ✓ | Helper/secondary text role is text-sm, not text-base. text-base (16px) is the h2 section size and oversizes this support |
| typography | camera-off pill (line 69) | P2 | ✓ | This is a meta/status overlay label; caption/meta role is text-xs. text-base is far too large for an in-frame status pil |
| typography | select field labels (lines 109, 118) | P2 | ✓ | Form labels use the label role text-sm font-medium, not text-base. Consistent with the body/label scale. |
| input | camera/microphone select fields (lines 110-115, 119-124) | P1 | ✓ | Selects deviate from the .input standard: oversized text-base, rounded-md instead of rounded-lg, and no visible focus ri |
| typography | AI companion toggle text (lines 133, 141) | P2 | ✓ | This control's text is body/button copy = text-sm font-medium, not text-base. Oversizing a full-width toggle reads as te |
| a11y | AI companion off-state text (line 136) | P2 | ✓ | gray-400 (#9ca3af) text on a gray-800 at 60% opacity over gray-900 page yields roughly 3:1 contrast, below WCAG AA 4.5:1 |
| theming | raw gray scale throughout (lines 35, 54, 59, 109-136 etc.) | P3 | manuel | The file hard-codes raw Tailwind gray-600/700/800/900 across surfaces, borders and text instead of using design tokens,  |

## src/features/meetings/components/RecordingSummaryDialog.tsx  (2)

A clean, compliant dialog. Uses design tokens throughout (text-ink, text-brand, border-line, bg-surface-2), a full 1px border on the transcript panel (no side-stripes), proper text-sm body / text-base section headings within the scale, and aria-hidden on decorative icons. No gradient text, eyebrows, glassmorphism, or oversized type. Two minor polish issues: the two section h3 headings use inconsistent colors (text-brand vs text-ink-2) despite sharing a role, and one icon uses arbitrary h-[18px] w-[18px] instead of the scale's h-4 w-4. Inputs/forms are not present (transcript is read-only), so the input vocabulary does not apply. Responsiveness is handled via max-h-[70vh] + overflow-y-auto with no fixed-width overflow risk.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 42 (AI Summary h3) vs line 54 (Transcript h3) | P2 | ✓ | Two sibling section headings share the same h2/section role but are colored differently (text-brand vs text-ink-2). Same |
| typography | Line 66 leftIcon: <HiOutlineArrowDownTray className="h-[18px | P3 | ✓ | Arbitrary px icon sizing breaks the spacing scale and is inconsistent with the h-4 w-4 sparkles icon on line 43; map to  |

## src/features/meetings/components/SidePanel.tsx  (4)

SidePanel.tsx is a well-structured meetings side panel with correct ARIA roles (tablist/tab/aria-selected, aria-live captions, aria-pressed toggles, sr-only label) and a fully compliant type scale — no oversized text, no arbitrary px sizes, no eyebrows, no gradient text, no side-stripe accent borders. The main weaknesses are accessibility focus and input-system compliance: the chat textarea uses outline-none with no replacement focus ring (WCAG 2.4.7) and deviates from the .input standard (border-gray-200 vs border-gray-300, no focus:ring), and the many bare icon-only participant-action buttons have ~24px hit targets with no visible focus state. Theming is mostly tokenized but dividers/cards hard-code border-gray-200 instead of border-line. No AI-slop antipatterns present.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | textarea#mtg-chat, line 327 | P1 | ✓ | The chat input deviates from the .input design system: it uses outline-none with NO replacement focus ring or focus bord |
| theming | aside + tab bar + chat composer dividers, lines 86, 88, 269, | P2 | ✓ | Dividers/cards hard-code border-gray-200 instead of the design token border-line. The file already uses tokens (text-ink |
| a11y | participant row icon buttons, lines 157-168 and 169-207 | P2 | ✓ | The per-participant action buttons (mute, spotlight, lower hand, make co-host, remove) are bare <button> with p-1 around |
| a11y | caption language toggle buttons, line 280 | P3 | ✓ | The EN/TR caption-language segmented buttons (h-9 = 36px) sit just under the 44px touch target and have no visible focus |

## src/features/meetings/components/Stage.tsx  (5)

Stage.tsx renders meeting video tiles, a filmstrip, and a screen-share placeholder. Structure and responsive behavior are solid (aspect-video tiles, grid with sm: breakpoint, overflow-x-auto filmstrip, no fixed-px layout traps). The main issues are typographic: in-tile caption/meta overlays (participant name, quality badge) use text-base (16px) where the meta role calls for text-xs, and the screen-share status line uses text-base instead of body text-sm. Theming is the weakest area: a hard-coded hex (bg-[#0f1320]), off-scale border-gray-800, and a decorative arbitrary radial-gradient overlay bypass the token system. No WCAG-blocking contrast issues (white-on-black overlays, icons carry aria-labels). No side-stripe borders, gradient text, or eyebrows.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Tile, participant name label, line 55 | P2 | ✓ | The name overlay on a video tile is a caption/meta role and must be text-xs (12px). Using text-base (16px) makes the lab |
| typography | Tile, quality badge wrapper, line 43 | P3 | ✓ | This badge only contains a 2x2 status dot; the text-base font-size sets line-height/inline metrics far larger than the c |
| typography | ScreenShareView caption, line 86 | P3 | ✓ | This is a status/body label overlay ('X is sharing screen'). text-base (16px) is the h2 section role; an overlay status  |
| a11y | ScreenShareView container, line 84 | P2 | ✓ | bg-[#0f1320] is a hard-coded arbitrary hex outside the token system, and border-gray-800 is an off-scale border color. U |
| theming | ScreenShareView decorative radial overlay, line 85 | P3 | manuel | Arbitrary inline radial-gradient with a raw rgba color is decorative glassmorphism slop and bypasses design tokens. The  |

## src/features/meetings/components/Whiteboard.tsx  (6)

Whiteboard.tsx is a small, well-structured component using semantic buttons, proper aria-label/aria-pressed on the color picker, role=img on the canvas, and touch-none for pointer drawing. No AI-slop antipatterns (no gradients, eyebrows, glassmorphism, or side-stripe borders). The main weaknesses are theming and a11y: every color is a hard-coded hex (#e5e7eb, #f8fafc, #111827, #eef2f7) instead of design tokens (border-line, bg-surface-2, text-ink), driving the theming score down. The Clear button uses text-base (16px) instead of the text-sm font-medium button role. Touch targets are weak: color swatches are 28px (below 44px), and swatch aria-labels expose raw hex strings rather than human-readable names. No borders/inputs concerns beyond the token swaps; the border-2 on swatches is a legitimate selection indicator, not a banned side-stripe.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Line 44: border-b border-[#e5e7eb] bg-[#f8fafc] | P2 | ✓ | Hard-coded hex (#e5e7eb is gray-200, #f8fafc is the surface-2 tint) bypasses design tokens. Use border-line and bg-surfa |
| theming | Line 45: text-[#111827] | P2 | ✓ | #111827 is the ink token (gray-900) hard-coded. Use text-ink for the section heading so primary text color is token-driv |
| typography | Line 60: text-base text-[#111827] on Clear button | P2 | ✓ | Button label uses text-base (16px) with no weight; the button/label role is text-sm (14px) font-medium. text-base for a  |
| theming | Lines 60, 67: hover:bg-[#eef2f7] and border-[#e5e7eb] | P2 | ✓ | Arbitrary hex for border (#e5e7eb) and an off-palette hover tint (#eef2f7) on both toolbar buttons. Replace with border- |
| a11y | Lines 47-56: color swatch buttons h-7 w-7 (28px) | P2 | manuel | Color picker buttons are 28x28px, well below the 44px minimum touch target; difficult to tap on touch devices during a m |
| a11y | Lines 48-55: aria-label={c} uses raw hex value | P2 | manuel | The swatch accessible name is the raw hex string (e.g. "#dc2626"), which a screen reader spells out character by charact |

## src/features/meetings/CreateMeetingPage.tsx  (8)

CreateMeetingPage is a near-verbatim Flowbite landing template that diverges from the TeamsLike design system. Biggest issues: an oversized hero h1 (text-3xl / md:text-5xl, exceeding the text-2xl ceiling and using font-bold) and a text-lg subtitle off the type scale. The meeting-code input deviates from the standard .input vocabulary (border-gray-200, bg-white, p-3.5, no ring width). Theming relies entirely on raw gray-XXX/primary-XXX utilities instead of ink/muted/line/brand tokens. A11y gaps: dropdown actions are anchors with href=\"#\" rather than buttons, the page section lacks a labelled landmark, and decorative illustrations carry filler alt text. Responsiveness is mostly fine but the fixed h-[calc(100vh-8rem)] can clip stacked mobile content. No gradient text, eyebrows, or side-stripe borders.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h1, line 54: text-3xl ... md:text-5xl | P1 | ✓ | Type scale ceiling is text-2xl; text-3xl and md:text-5xl exceed it badly and the h1 role is text-xl font-semibold. font- |
| typography | subtitle p, line 55: text-lg | P2 | ✓ | text-lg (18px) is not on the product scale for body/helper text. Subtitle/helper maps to text-sm text-muted. |
| input | meeting code input, line 99 | P2 | ✓ | Deviates from the standard .input vocabulary: border-gray-200 (should be border-gray-300), bg-white (should be bg-surfac |
| theming | throughout: hard-coded gray-XXX and primary-XXX instead of t | P2 | manuel | The file uses raw gray-900/700/500/400/200/100/800 and primary-700/800/600/500/300 hex-equivalent utilities instead of t |
| a11y | dropdown links, lines 66, 74, 82 (a href="#" used as buttons | P2 | manuel | These are actions (start instant / create for later / schedule), not navigation. Using anchors with href="#" is a semant |
| a11y | section, lines 48-131: missing landmark/heading semantics | P3 | manuel | The page has no labelled landmark; the section wraps the whole page content but is unlabelled. Add aria-labelledby tying |
| a11y | illustration imgs, lines 127-128 | P3 | ✓ | alt="illustration" is non-descriptive filler; for a purely decorative graphic the alt should be empty so AT ignores it. |
| responsive | grid container, line 49: h-[calc(100vh-8rem)] | P2 | ✓ | A fixed viewport-locked height can clip the stacked content (button + input + join + meta) on short mobile viewports cau |

## src/features/meetings/MeetingLobbyPage.tsx  (10)

A faithful Flowbite-derived meeting lobby that is functionally rich and largely well-structured (semantic buttons, sr-only labels, tooltips, controlled state). Main typeset issues: an oversized text-3xl font-bold h1 and text-3xl avatar initials that break the text-2xl ceiling and heading-weight rule, plus an eyebrow (uppercase tracking-wide) on the diagnostics label and out-of-scale text-lg/text-base usages on modal titles, mode buttons, and device pickers. Theming is the weakest dimension: the file uses raw gray-XXX/primary-XXX scales throughout rather than the ink/line/muted/brand/surface tokens. A11y is solid but the mic/camera/effects toggle buttons lack aria-pressed while the sibling present/companion buttons have it. No side-stripe borders, gradient text, or glassmorphism. Responsive layout uses a md/lg grid; the w-[512px] preview is safely capped by lg:w-full.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h1 page title, line 382 | P1 | ✓ | text-3xl (30px) exceeds the text-2xl ceiling and is too big for an h1; the h1 role is text-xl font-semibold. font-bold a |
| typography | Camera-off avatar initials, line 303 | P2 | ✓ | text-3xl (30px) exceeds the text-2xl ceiling. Reduce to text-2xl, the max allowed display size. |
| antipattern | Diagnostics section label, line 590 | P1 | ✓ | Banned AI 'eyebrow' tell: small uppercase + tracking-wide label. Drop uppercase and tracking, use plain text-xs font-sem |
| typography | Modal titles h3, lines 546 and 618 | P2 | ✓ | text-lg (18px) is not in the type scale. A modal heading maps to the h2 section role: text-base (16px) font-semibold. |
| typography | Present / companion-mode buttons, lines 387 and 394 | P2 | ✓ | Button label role is text-sm (14px) font-medium. text-base buttons are inconsistent with the askToJoin button on line 38 |
| typography | Device dropdown trigger buttons, lines 403, 447, 493 | P2 | ✓ | text-base (16px) for these secondary device-picker labels deviates from the text-sm body/label role and is inconsistent  |
| theming | Hard-coded gray/primary scale colors throughout (e.g. lines  | P2 | manuel | The file relies almost entirely on raw Tailwind gray-XXX / primary-XXX scales instead of the design tokens (ink, ink-2,  |
| a11y | Toggle control buttons missing aria-pressed, lines 310 (mic) | P2 | ✓ | These are visual toggle buttons (active/inactive state via ctrlBtn) but expose no pressed state to assistive tech. The p |
| a11y | Camera-off caption contrast, line 304 | P3 | ✓ | text-gray-300 on the bg-gray-900 preview is acceptable for large text but borderline for 12px caption text; bump to gray |
| input | Report textarea focus ring, lines 570-585 | P3 | ✓ | The standard input vocabulary specifies focus:ring-1; focus:ring-primary-500 without an explicit ring width relies on th |

## src/features/meetings/MeetingRoomPage.tsx  (10)

Translated Flowbite meeting-room view; structurally solid with consistent focus rings, sr-only labels, semantic buttons, motion-safe transitions, and a fixed-px-free responsive layout. Main issues: one banned uppercase 'eyebrow' on the feedback drawer title (line 984), several off-scale text-lg headings/counters and font-bold/font-semibold inconsistency for the same heading role (lines 687, 864, 915, 1037, 407), a broken dark-mode token typo (dark:text-gay-400, line 1040), and an a11y label/control mismatch (participants search labelled 'your email', line 810; Toggle-all button lacks a focus indicator, line 875). Theming scores lowest because the file is entirely hard-coded gray-XXX / gray-900 / gray-500 rather than ink/line/muted/surface tokens, though that is the inherited Flowbite convention across the feature.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 984 — feedback drawer title (feedback-drawer-label) | P1 | ✓ | Banned AI 'eyebrow' tell: uppercase small-caps label in muted gray. Every other drawer title (messages line 729, partici |
| typography | Line 687 — meeting details modal heading | P2 | ✓ | text-lg (18px) is off the fixed scale. A modal/section heading maps to the h2 role: text-base (16px) font-semibold. |
| typography | Line 864 — host controls 'meeting moderation' label | P2 | ✓ | font-bold for a sub-section label; same h3/card-sub role is font-semibold elsewhere. Standardize weight to font-semibold |
| typography | Line 915 — host controls 'access type' label | P2 | ✓ | Same sub-section role styled font-bold here but font-semibold for headings/h3 across the file. Standardize to font-semib |
| typography | Line 1037 — feedback rating counter (stars/5) | P2 | ✓ | text-lg (18px) is off-scale and font-bold is inconsistent with the file's font-semibold convention. A counter/meta value |
| typography | Line 407 — participant tile avatar initials | P3 | ✓ | text-lg (18px) is off the fixed scale. Avatar initials are decorative content inside a fixed-size circle; map to text-ba |
| theming | Line 1040 — feedback char-count helper span (typo'd token) | P2 | ✓ | Typo 'dark:text-gay-400' is not a valid Tailwind class, so the dark-mode color silently never applies — the helper inher |
| a11y | Line 810 / 817 — participants search input has a mismatched/ | P1 | ✓ | The associated sr-only label reads 'your email' (room.yourEmail) for a people-search field. Screen-reader users get a wr |
| input | Line 817 — participants search input missing focus ring bord | P3 | ✓ | Inconsistent focus treatment vs the design-system .input (focus:ring-1). Other inputs here also rely on focus:ring-prima |
| a11y | Line 875 — host-controls 'Toggle all' control is a real butt | P2 | ✓ | Interactive button with no visible focus indicator (no ring/outline), unlike every other control on the page which uses  |

## src/features/meetings/MeetingsPage.tsx  (3)

MeetingsPage.tsx is a clean, design-system-compliant file at the Linear/Notion bar. Theming is excellent: it consistently uses tokens (border-line, bg-surface, bg-surface-2/3, text-ink, text-ink-2, text-muted, bg-brand/10, bg-ok/15, text-danger) with zero hard-coded hex or random gray-XXX values. Inputs all use the shared .input and .label classes, so input vocabulary is consistent and labels are properly associated via htmlFor/id. No banned antipatterns: no gradient text, no eyebrows, no side-stripe borders (the status accent is a leading icon tile and a rounded badge, the correct pattern), no glassmorphism, no hero-metric template. Typography stays within scale (no text-3xl+, no arbitrary px sizes, text-xs floor respected, no font-light). Error messages carry role=\"alert\". The only real findings are minor: the card h3 omits an explicit text-sm so the scale role isn't pinned; the share-URL input lacks min-w-0 and can overflow the modal on long links; and the duration number input has no min bound. All three are localized, autofixable swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | MeetingCard h3 title, line 55 | P3 | ✓ | The h3 card title role is defined as text-sm font-semibold but omits an explicit size. Without text-sm it inherits an am |
| responsive | Guest link row inside GuestTokenButton modal, lines 186-201 | P2 | ✓ | The share URL input in a flex row has no min-w-0, so a long, unbreakable URL can force the flex item past its container  |
| a11y | Duration number input, lines 301-307 | P3 | ✓ | The duration number field accepts negative or zero values with no min constraint; a user can submit an invalid meeting d |

## src/features/meetings/RateConversationPage.tsx  (9)

A Flowbite-derived rate-conversation page that is structurally sound and responsive (sm: breakpoints, w-full→sm:w-auto buttons, max-w-xl/max-w-md drawer) but carries several typeset and theming violations. Typography breaks the fixed scale in multiple spots: the h1 is text-3xl font-bold (exceeds the text-2xl ceiling; should be text-xl font-semibold), the subtitle and star counter use off-scale text-lg, and the drawer heading is a banned uppercase eyebrow. Theming is the weakest dimension: colors are hard-coded gray-900/500/400/200 throughout instead of ink/muted/line tokens, and two invalid typo utilities (dark:text-gay-400, dark:hover:bg-bray-800) silently disable dark-mode styling. The textarea is compliant with the .input standard (bg-gray-50, border-gray-300, rounded-lg, p-2.5, focus ring). a11y is mostly good (semantic buttons, aria-labels on stars, sr-only close text, real <label> for the textarea) with minor gaps: the drawer trigger lacks aria-controls/expanded and the dropzone caption is a <p> rather than a <label>.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 55 — h1 page title | P1 | ✓ | text-3xl (30px) breaks the text-2xl ceiling and h1 role is text-xl font-semibold; font-bold also deviates from the stand |
| typography | Line 56 — subtitle paragraph | P2 | ✓ | text-lg (18px) is off the fixed scale; body/helper copy should map to text-sm. Larger subtitle creates an unearned hero  |
| antipattern | Line 80 — drawer heading | P1 | ✓ | Small uppercase label (text-sm font-semibold uppercase text-gray-500) is a banned eyebrow AI tell. Drop uppercase and us |
| typography | Line 133 — star counter | P2 | ✓ | text-lg font-bold is off-scale for an inline counter; counter/meta should sit on the text-sm/xs scale with font-semibold |
| theming | Lines 55-56, 68, 80, 90, 100, 133, 136-141, 148-149 — pervas | P2 | manuel | Colors are hard-coded gray-900/500/400/200 throughout instead of design tokens (ink/muted/line/surface). Flowbite leftov |
| theming | Line 136 — typo in class | P2 | ✓ | Typo 'dark:text-gay-400' is not a valid utility, so the dark-mode color silently no-ops. Correct to dark:text-gray-400 ( |
| theming | Line 143 — typo in class | P2 | ✓ | Typo 'dark:hover:bg-bray-800' is an invalid utility and does nothing; the dropzone hover bg in dark mode is broken. |
| a11y | Lines 64-66 — submit-feedback trigger button | P3 | ✓ | Link-style trigger has no explicit text size (inherits) and lacks aria-controls/aria-expanded tying it to the drawer it  |
| a11y | Line 141 — 'Add photos' uses <p> as a field label | P3 | ✓ | The dropzone's caption is a non-associated <p>; it should be a <label htmlFor="dropzone-file"> so the file input has a p |

## src/features/messaging/components/ChannelHeader.tsx  (4)

ChannelHeader is largely clean: good responsive structure (desktop inline search vs mobile toggle, sm: breakpoints, hidden labels via IconButton), token usage (border-line, bg-surface-2, text-ink/muted/brand), no gradient text, no eyebrows, no side-stripe borders, and proper aria-hidden on decorative icons. The main issues are accessibility: the desktop search input strips its focus outline (outline-none) without any visible replacement ring — present on the mobile twin but missing here — and the channel title is non-semantic markup rather than a heading. Typographically the h1 channel title is set at text-lg (18px) instead of the scale's text-xl (20px). Minor theming nit: inputs use raw bg-white instead of the surface-2/gray-50 input token.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | Line 170 — desktop search input className | P1 | ✓ | The desktop search input uses outline-none with no replacement focus ring, leaving keyboard users with no visible focus  |
| typography | Line 120 — channel title (h1) wrapper | P2 | ✓ | This is the page/channel title (h1 role), which the type scale fixes at text-xl (20px) font-semibold. text-lg (18px) is  |
| a11y | Line 118 / 120 — header title is a non-semantic div, not a h | P2 | manuel | The primary channel title is rendered as plain divs/spans with no heading semantics, so screen-reader users get no docum |
| theming | Lines 170 & 225 — search input background uses raw bg-white | P3 | ✓ | The input standard backgrounds are bg-surface-2 / bg-gray-50, and the surrounding header already uses bg-surface-2. Hard |

## src/features/messaging/components/CommunitiesBar.tsx  (3)

A small, clean community rail component. Typography is compliant: the only sized text is text-base font-semibold on 2-letter initials avatars, where the accompanying uppercase is a legitimate avatar treatment (not a banned eyebrow label), and the home icon is h-5 w-5. No oversized text, no arbitrary px, no gradient text, no font-light. Borders are correct: border-r border-line is a full 1px divider, not a banned side-stripe accent. No inputs in this file. Antipattern surface is essentially clean (score 4). The defensible issues are minor a11y/theming polish: the nav buttons are 40px (below the 44px touch-target target), aria-current passes a raw boolean instead of \"page\", and the light-mode home avatar hard-codes bg-white instead of a surface token. Dark variants lean on raw gray-XXX but that matches the rest of the codebase's dark convention, so I did not flag it separately.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | line 35 & 48 — community/home buttons | P2 | ✓ | Interactive nav buttons are 40x40px (h-10 w-10), below the 44px minimum touch-target guideline. On a primary navigation  |
| a11y | line 45 — community button aria-current | P3 | ✓ | aria-current on a navigation item should use the token "page" (or be omitted when inactive) rather than a raw boolean. E |
| theming | line 35 — home button background | P3 | manuel | The light-mode avatar uses hard-coded bg-white instead of a surface token, while the surrounding system uses surface tok |

## src/features/messaging/components/CreateChannelDialog.tsx  (3)

Small, clean dialog with no AI-slop antipatterns (no gradient text, eyebrows, side-stripe borders, or hero templates) and solid responsive structure (flex-1 toggles, h-11 touch targets, w-full input — no fixed px widths). The main problem is the name input: outline-none strips the focus ring with no replacement (WCAG 2.4.7 keyboard-focus failure) and the input diverges from the .input standard (bg-white/rounded-md/px-3 vs bg-surface-2/rounded-lg/p-2.5 plus the missing focus:ring). The field label also uses text-muted instead of the text-sm font-medium label role. Theming is mostly token-based (border-line, text-ink, text-brand, surface-2) with a couple of hard-coded bg-white/rounded-md deviations. Fixing the focus ring and label weight brings a11y up to bar; everything else is localized className polish.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | line 40 (name input) | P1 | ✓ | outline-none removes the native focus ring with no replacement, so keyboard users get no visible focus indicator on the  |
| typography | line 36 (channel name label) | P2 | ✓ | This is a form field label (the primary identifier for the input), not secondary helper text. The label role is text-sm  |
| theming | line 40 input bg, line 52/55 button radius | P3 | ✓ | The input hard-codes bg-white instead of the surface token (bg-surface-2 / bg-gray-50) used elsewhere, and uses rounded- |

## src/features/messaging/components/CreatePollDialog.tsx  (5)

A compact, well-structured poll dialog with no AI-slop tells (no gradients, eyebrows, side-stripe borders, or hero metrics) and clean responsive layout (flex-wrap toggles, w-full inputs). The main weakness is inputs: both text inputs use outline-none with no replacement focus ring, making keyboard focus invisible (WCAG 2.4.7), and they diverge from the .input standard (bg-white/border-line/rounded-md vs bg-surface-2/border-gray-300/rounded-lg with focus:ring). Field labels should be font-medium labels rather than muted body. The destructive remove button is below the 44px touch target and shares a non-descriptive aria-label. Theming mostly uses tokens (ink, line, muted, surface-2, brand) but inputs hard-code bg-white outside the token vocabulary.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Question input, line 60 | P1 | ✓ | outline-none strips the focus indicator with no replacement ring/border, leaving keyboard users no visible focus (WCAG 2 |
| input | Option inputs, line 81 | P1 | ✓ | Same deviation from the .input vocabulary: outline-none with no focus ring (invisible focus), bg-white instead of bg-sur |
| typography | Field labels, lines 56 and 65 | P2 | ✓ | Form field labels are a label role: per the scale they should be text-sm font-medium, not muted body weight. text-muted  |
| a11y | Remove-option button, line 89 | P3 | ✓ | p-2 around a 16px icon yields a ~32px hit target, below the 44px minimum for touch. |
| a11y | Remove-option button aria-label, line 88 | P2 | manuel | The delete button reuses the generic "poll.option" label, so screen readers announce it identically to the option field  |

## src/features/messaging/components/DetailsPanel.tsx  (1)

DetailsPanel is a well-built, largely compliant slide-over panel. Borders are consistently full border-line (no side-stripes), no eyebrows, no gradient text, no glassmorphism, and no arbitrary px font sizes. Theming uses design tokens (ink, line, muted, brand, surface-2) with proper dark-mode pairs throughout. Interactive elements are real buttons with aria-pressed/aria-label, h-9 toggle targets, and motion-safe guards. The single typeset deviation is the channel name title at text-lg (18px), which is off the fixed scale and should be text-base font-semibold. Touch targets on the CSAT star buttons (p-1 around h-5 w-5 icon ≈ 28px) are slightly under 44px but borderline and consistent with the compact panel density, so not flagged as a blocking finding.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 56 — channel name title | P2 | ✓ | text-lg (18px) is not a defined role on the fixed product type scale. As the panel's primary title (h2 section equivalen |

## src/features/messaging/components/EmojiPicker.tsx  (4)

Small, well-structured component with no typography violations: text-lg and h-[18px]/w-[18px] are emoji-glyph and icon sizing rather than body text, so they do not breach the type scale, and there are no eyebrows, gradients, side-stripe borders, or oversized headings. Main issues are theming consistency (light mode uses tokens text-muted/bg-surface-2 while dark mode hard-codes dark:text-gray-400 / dark:hover:bg-gray-700), missing visible focus on the keyboard-focusable emoji buttons, and sub-44px touch targets (h-7 cells, 36px trigger). No P0/P1 findings.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | triggerClassName on Dropdown (line 13) | P2 | ✓ | Light mode uses design tokens (text-muted, bg-surface-2) but dark mode reaches for raw dark:text-gray-400 / dark:hover:b |
| theming | emoji button className (line 23) | P2 | ✓ | Same theming inconsistency: hover uses the bg-surface-2 token in light mode but a hard-coded dark:hover:bg-gray-700 in d |
| a11y | emoji button (lines 18-26) and trigger (line 13) | P3 | manuel | Emoji cells are h-7 (28px) and the trigger is 36px square, both below the 44px minimum touch target. In a dense 8-column |
| a11y | emoji buttons have no visible focus style (line 23) | P2 | ✓ | The grid buttons are keyboard-focusable but define only a hover state, so keyboard users get no visible focus indicator  |

## src/features/messaging/components/FileMessage.tsx  (3)

Small, well-built component. Typography is fully compliant (text-sm body, text-muted meta, no oversized/arbitrary/eyebrow/font-light type, no gradient text). a11y is strong: semantic button with type and aria-label, decorative icons aria-hidden, truncation handled. Responsive is fine (max-w-xs, no fixed-px overflow, min-w-0 truncation). Two real issues: a decorative gradient placeholder (antipattern) and hard-coded bg-white / dark:text-white that bypass surface and ink tokens (theming). No border-stripe, input, or contrast violations.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | line 18 (image thumbnail placeholder div) | P2 | ✓ | Decorative diagonal gradient on a placeholder thumbnail is an AI slop tell (gradient-as-decoration). A flat surface toke |
| theming | line 35 (download button container) | P3 | ✓ | Hard-coded bg-white bypasses the surface design token; the rest of the file uses tokens (surface-2, ink, line). Use the  |
| theming | lines 23, 41 (file name text color) | P3 | manuel | Hard-coded dark:text-white overrides the ink token's own dark value; the ink token should already resolve correctly per  |

## src/features/messaging/components/ForwardDialog.tsx  (2)

Small, well-built forward-channel picker rendered inside a shared Modal. Strong on accessibility (semantic button, type=\"button\", text-start, aria-hidden glyphs, 44px-tall h-11 touch targets, truncate for overflow) and antipatterns (no gradients, eyebrows, side-stripes, or glassmorphism). Responsive is sound: max-h-[50vh] with overflow-y-auto and w-full, no fixed widths. Typography is on-scale (text-sm). Main issue is theming: the row mixes design tokens (text-ink, bg-surface-2) with hard-coded dark-mode overrides (dark:text-white, dark:hover:bg-gray-700) — these should route through tokens for consistency. Minor: the icon uses arbitrary h-[18px]/w-[18px] instead of a scale step.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | button className, line 51 (dark:text-white dark:hover:bg-gra | P2 | ✓ | Light mode uses design tokens (text-ink, bg-surface-2) which should already be theme-aware, but dark mode hard-codes dar |
| typography | KindGlyph icon, line 21 (h-[18px] w-[18px]) | P3 | ✓ | Arbitrary px sizing on the glyph (h-[18px] w-[18px]) sits off the spacing scale. Map to the nearest scale step (size-5 = |

## src/features/messaging/components/GifStickerPicker.tsx  (2)

Small, mostly compliant component. Interactive elements are real semantic buttons with aria-labels, the trigger icon is aria-hidden, and no AI antipatterns (no gradient text, eyebrows, side-stripe borders, or hero-metric template) are present. The text-2xl on line 24 is the emoji sticker glyph rendered at display size (not typographic heading text), so it is acceptable rather than a ceiling violation. Two defensible issues: (1) theming inconsistency where the light path uses design tokens (text-muted, surface-2) while the dark path hard-codes gray-400/gray-700 on the same elements; (2) 36px (h-9) touch targets on both the picker trigger and each sticker cell fall below the 44px minimum, which matters on a mobile messaging surface. No border or input findings (this component has neither). Typography otherwise clean.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | line 14: triggerClassName, and line 24: sticker button class | P2 | ✓ | The light path uses design tokens (text-muted, surface-2) but the dark path falls back to raw gray-400/gray-700, which i |
| a11y | line 24: sticker button className (h-9) and line 14: trigger | P2 | ✓ | h-9 = 36px and the trigger h-9 w-9 = 36px are below the 44px minimum touch target. On a messaging surface used heavily o |

## src/features/messaging/components/GlobalSearchDialog.tsx  (3)

A clean, well-built command palette. Typography stays entirely on the scale (text-sm / text-xs only, no oversized text, no arbitrary px, no eyebrows, no gradient text, no font-light), and there are no side-stripe borders or AI-slop tells (antipattern 4/4). Semantic and ARIA wiring is strong: real button/ul/li, role=combobox/listbox/option, aria-expanded/controls/activedescendant, aria-selected. Responsive is solid (max-h-[55vh], flex layout, no fixed px widths). Three defensible issues: (1) P1 a11y — the search input uses outline-none with no focus-within replacement on its wrapper, leaving keyboard focus invisible (WCAG 2.4.7); (2) P2 typography — message-result hierarchy is inverted, with the meta line emphasized (font-medium full ink) over the actual message body; (3) P3 theming — redundant hard-coded dark:text-white layered on the text-ink token in four spots. The borderless input inside a bordered wrapper is an acceptable palette pattern, so the .input standard is not flagged beyond the missing focus state.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Message result rows (lines 122-123): meta line vs body line  | P2 | ✓ | Hierarchy is inverted. item.meta (author · channel / topic) is caption/meta, but it is rendered as the emphasized text-s |
| a11y | Search input wrapper (lines 77-91): no visible focus indicat | P1 | ✓ | The input sets outline-none but the wrapper provides no replacement focus indicator (no focus-within ring/border). Keybo |
| theming | Dark-mode text override (lines 90, 115, 122, 123): dark:text | P3 | manuel | text-ink is a design token that should already carry its dark-mode value; pairing it with a hard-coded dark:text-white i |

## src/features/messaging/components/LinkPreview.tsx  (3)

Small, well-structured LinkPreview card that is largely compliant. Typography is on-scale (text-sm font-medium title, text-xs text-muted caption — no oversized text, no arbitrary px, no eyebrows, no gradient text). The anchor is semantic with proper target/rel, icons are aria-hidden, and the layout (max-w-xs, truncate) is responsive-safe with no fixed-px overflow risk. Two categories need attention: (1) antipattern — the h-16 diagonal brand gradient block is a decorative fake-thumbnail gradient that should flatten to a single brand tint; (2) theming — both the border (border-line vs dark:border-gray-700) and the title text (text-ink vs dark:text-white) hard-code raw dark-mode values instead of letting the design tokens carry their own dark variants, causing per-component theming drift. No a11y or responsive findings.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 29: <div className="h-16 bg-gradient-to-br from-brand/2 | P2 | ✓ | A decorative diagonal gradient used as a fake thumbnail banner is an AI-slop tell (decorative gradient with no content m |
| theming | Line 31: text-ink dark:text-white | P3 | ✓ | Light mode uses the design token text-ink but dark mode hard-codes dark:text-white, bypassing the token system. The ink  |
| theming | Line 27: border border-line ... dark:border-gray-700 | P3 | ✓ | Light mode uses the border-line token while dark mode hard-codes dark:border-gray-700. The line token should carry its o |

## src/features/messaging/components/MessageBubble.tsx  (8)

MessageBubble is structurally strong: semantic role=\"article\" with keyboard shortcuts and aria-keyshortcuts, real <button> elements with aria-label/aria-pressed, visible focus-visible rings, coarse-pointer toolbar fallback, and responsive max-w/min-w-0 layout (no fixed-px overflow). The dominant problem is borders: four separate banned side-stripe accents — border-s-2 on the translated callout (148), border-l-2 on both the DM (308) and channel (364) quoted blocks, and border-l-2 border-red-500 on the important row (337) — all should become full 1px borders with bg tint. Typography is otherwise clean and on-scale except the text-5xl sticker (141) which breaks the text-2xl ceiling. Theming is the weakest axis: light mode is token-driven but dark mode reverts to scattered hard-coded dark:*-gray-700/800, and a raw text-red-600 destructive icon bypasses the danger token. Fix the side-stripes and sticker size first (P1/P2, all localized className swaps), then unify dark-mode grays to tokens.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| border | Line 337 — important message row | P1 | ✓ | A colored left side-stripe (border-l-2 border-red-500) used as an accent on a list item is a banned decoration pattern.  |
| border | Line 364 — channel quoted/reply block | P1 | ✓ | border-l-2 used as a decorative quote stripe on a callout is the banned side-stripe pattern. A full 1px border (border b |
| border | Line 308 — DM quoted/reply pill | P1 | ✓ | border-l-2 colored stripe (white/60 or brand) on the quoted reply card is a banned side-stripe accent. Switch to a full  |
| border | Line 148 — translated text callout | P1 | ✓ | border-s-2 border-brand is a colored side-stripe accent on a callout (banned). The bg tint already communicates the tran |
| typography | Line 141 — sticker render | P2 | ✓ | text-5xl exceeds the text-2xl ceiling. A sticker is a glyph rather than text, but the scale still applies; text-4xl is t |
| theming | Line 281 — deleteForEveryone destructive icon | P3 | ✓ | Hard-coded text-red-600 bypasses the design-token system; the file already expresses danger semantically via Badge tone= |
| theming | Lines 92, 115, 128, 176, 217, 227, 235, 243, 250, 305, 308,  | P2 | manuel | Numerous raw dark:*-gray-700/800 values are scattered across toolbar buttons, bubbles and rows. The light theme uses tok |
| a11y | Line 146 — translating placeholder | P3 | manuel | The translating state renders only an ellipsis glyph with no accessible name, so screen readers announce nothing meaning |

## src/features/messaging/components/MessageComposer.tsx  (5)

MessageComposer is structurally solid and responsive (Send label collapses on mobile, no fixed px widths, sane breakpoints, good aria labels on icon buttons and listboxes). The main defensible issues are: (1) a banned `border-l-2 border-brand` side-stripe accent on the reply-preview callout, which should become a full border + bg tint; (2) heavy reliance on hard-coded `bg-white` instead of the surface tokens, and raw amber literals for the \"note\" semantic state instead of a token; (3) a11y gaps — the role=tab buttons have no visible focus-visible ring, and the textarea placeholder uses `text-muted` rather than the spec `text-gray-400`. Typography is clean: type scale is respected (text-sm body, text-xs meta), no oversized headings, no gradient text, no eyebrows, no font-light. Theming is the weakest dimension due to token bypassing; antipattern is dinged only by the side-stripe.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| border | Reply preview banner, line 166 | P2 | ✓ | `border-l-2 border-brand` is a banned colored side-stripe accent on a callout/card. Replace with a full 1px border plus  |
| theming | Reply preview, mode container, mention/slash dropdowns — rep | P3 | manuel | Hard-coded `bg-white` bypasses the design-token surface system used elsewhere (surface/surface-2). Every light-mode surf |
| theming | Mode segmented control + note container — amber literals, li | P3 | manuel | The "note" mode uses three different raw amber shades as a semantic accent. The product defines tokens for brand/ink/lin |
| a11y | Mode tabs, lines 181-198 | P2 | ✓ | The role=tab buttons rely only on background color for state and have no visible focus ring, so keyboard users get no fo |
| a11y | Textarea placeholder, line 241 | P3 | ✓ | `text-muted` is the secondary/helper foreground token and is typically lighter than the standard `placeholder-gray-400`; |

## src/features/messaging/components/MessageInfoDialog.tsx  (3)

Small, mostly clean dialog. One real antipattern: the quoted-message preview uses a banned colored side-stripe (border-s-2 border-brand) as a decorative accent; rewrite as a full border-line with the existing bg-surface-2 tint. The repeated dark:text-white overrides on text-ink elements bypass the design token and should be removed so the token owns the dark value. Type scale is fully compliant (text-sm/text-xs only, no oversized or arbitrary px, no eyebrows or gradients). Layout is responsive (flex with truncate, no fixed widths). a11y is fine for a Modal-wrapped component, though delivery status is conveyed via the DeliveryTicks icon plus localized text label, which is adequate. No inputs in this file.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| border | Quoted-message preview div, line 30 | P2 | ✓ | border-s-2 border-brand is a banned colored side-stripe accent on a callout/quote block. The bg-surface-2 tint already s |
| theming | Quote preview text, line 30 | P3 | ✓ | text-ink is a design token that should already resolve correctly in dark mode. Hard-coding dark:text-white bypasses the  |
| theming | Recipient name span, line 39 | P3 | ✓ | Same token-override antipattern: dark:text-white duplicates what the text-ink token should provide, causing inconsistenc |

## src/features/messaging/components/MessageList.tsx  (1)

MessageList.tsx is an impeccable, near-compliant file. Typography is fully on-scale: text-xs for the unread label, no oversized headings, no arbitrary px sizes, no font-light, no eyebrows, no gradient text. Structure is semantic (role=\"separator\" on the divider, aria-hidden on the decorative skeleton and on icons). No side-stripe borders, no glassmorphism, no hero-metric or identical-card-grid tells. Responsive layout uses flex/min-h-0/overflow-y-auto with no fixed px widths that break mobile. The single defensible finding is theming: the unread divider uses raw bg-red-500/text-red-500 instead of a semantic token (P3, auto-fixable). Contrast of text-red-500 (~4:1) on white sits at the edge for 12px text but is a flanked divider label, so it's acceptable. No P0/P1/P2 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Unread divider, lines 111-113 (span h-px bg-red-500 / text-r | P3 | ✓ | Raw bg-red-500/text-red-500 hard-codes a hex value instead of using a semantic design token (e.g. danger/brand). The res |

## src/features/messaging/components/MessagingSidebar.tsx  (2)

Strong, disciplined file. Typography is fully on-scale (text-sm body/labels, text-xs meta/counters, font-semibold headings) with no oversized type, no arbitrary px font sizes, no eyebrows, no gradient text, and no font-light. Borders are clean 1px full borders (border-line) used as dividers/edges — no side-stripe accents, no nested card borders. There are no raw form inputs in this file. Theming is excellent: consistent design tokens (ink, line, muted, brand, surface-2) with proper dark: variants. Antipatterns are absent (no glassmorphism, hero-metric, identical card grid, or gray-on-color). The only real findings are a11y/responsive: the per-row overflow-actions trigger is hidden via opacity-0 + group-hover/focus-visible, making it unreachable on touch (no-hover) devices, and that 32px trigger is below the 44px touch target. Both are localized className fixes.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | ChatRow Dropdown triggerClassName (line 133) | P2 | ✓ | The per-row actions button is opacity-0 and only revealed on group-hover or focus-visible. Touch devices have no hover,  |
| a11y | ChatRow action button height (line 96) and Dropdown trigger  | P3 | ✓ | The kebab/overflow trigger is 32px square, under the 44px recommended touch target. The main row is h-11 (44px) and comp |

## src/features/messaging/components/NewDmDialog.tsx  (3)

NewDmDialog is a clean, compliant component. Typography uses the scale (text-sm), the selectable rows are real semantic buttons with aria-pressed, focus is inherited from the button, and the layout is fluid (max-h-[40vh] viewport-relative, w-full rows, no fixed px widths) so it is responsive and accessible. No banned antipatterns: no gradient text, no eyebrows, no side-stripe accents (the selected state uses a full `border-brand` border plus bg tint, which is the correct pattern). Only minor nits: one arbitrary icon size (h-[18px]/w-[18px]) and two spots where raw `dark:` color overrides duplicate token-driven values (`dark:text-white`, `dark:hover:bg-gray-700`) instead of trusting `text-ink`/`bg-surface-2` tokens. All findings are P3 polish and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 48 — check icon `className="h-[18px] w-[18px] text-bran | P3 | ✓ | Arbitrary pixel sizing on the icon (18px) breaks the spacing scale; the avatar is `size="sm"` and the rest of the dialog |
| theming | line 47 — name label `text-ink dark:text-white` | P3 | ✓ | The `text-ink` token should already resolve to the correct color in dark mode; hard-coding `dark:text-white` bypasses th |
| theming | line 40 — unselected row hover `dark:hover:bg-gray-700` | P3 | ✓ | `hover:bg-surface-2` is a design token that should already adapt to dark mode; the extra `dark:hover:bg-gray-700` hard-c |

## src/features/messaging/components/PinnedBar.tsx  (2)

PinnedBar is a small, well-built component using design tokens correctly (border-line, bg-surface-2, text-brand, text-ink, text-muted) with proper aria-label and aria-hidden usage, semantic <button>, and correct type scale (text-sm body, font-semibold heading). Two real issues: (1) the close button has no visible focus ring and a sub-44px touch target (P1 a11y), and (2) the truncate on an inline <span> at line 23 is a no-op since truncate needs a block/inline-block context with constrained width, so long pinned bodies won't actually truncate (P2). Typography, borders, and theming are clean — the border-b is a legitimate bottom divider, not a banned side-stripe accent. No oversized text, no eyebrows, no gradients, no arbitrary px.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 23: <span className="ml-2 truncate text-muted">{first.b | P2 | ✓ | truncate (overflow-hidden + text-overflow-ellipsis + whitespace-nowrap) has no effect on an inline <span>; it requires a |
| a11y | Line 25-32: unpin <button> with className="rounded-md p-1 .. | P1 | ✓ | Two issues on the only interactive control: (1) the touch target is an h-4 w-4 (16px) icon with p-1 (4px) = ~24px hit ar |

## src/features/messaging/components/PollMessage.tsx  (2)

PollMessage.tsx is a clean, well-built component that largely follows the design system. Typography is fully compliant: all roles map to the fixed scale (text-sm font-semibold for the question/h3 role, text-sm text-muted for meta, text-sm for option labels), no arbitrary px sizes, no oversized headings, no eyebrows, no font-light, and no gradient text. Borders are correct: full 1px borders with the border-line token, no side-stripe accents (the 'mine' state uses border-brand as a full border, and the progress fill is an absolutely-positioned bg span, not a stripe). Accessibility is strong: semantic <button type=\"button\"> with aria-pressed for vote state, aria-hidden on all decorative icons and the progress fill, and percentage/count are always rendered as text so the bar is not color-only. Logical properties (start-0, inset-y-0) support RTL. Responsive: max-w-md with w-full options, no fixed pixel widths that break mobile. The only findings are minor theming polish (P3): hard-coded bg-white on the card and redundant dark:text-white overrides on tokens that should already be theme-aware. No P0/P1/P2 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Line 30: <div className="max-w-md rounded-lg border border-l | P3 | ✓ | The card background uses hard-coded bg-white while the rest of the component uses design tokens (border-line, text-ink,  |
| theming | Line 37 (and Line 64): text-ink dark:text-white | P3 | ✓ | text-ink is a design token that should already resolve to the correct color in dark mode; appending a hard-coded dark:te |

## src/features/messaging/components/SavedDrawer.tsx  (1)

SavedDrawer.tsx is a clean, compliant file. Typography sits squarely on the scale (text-sm font-medium for the primary line, text-muted for secondary/meta), with no oversized headings, no arbitrary text-[Npx], no eyebrows, no font-light, and no gradient text. Borders use the design-system border-line as full 1px borders (no banned side-stripes), and surfaces/colors use tokens (bg-surface-2, text-ink, text-brand, text-muted) with proper dark variants. Accessibility is strong: semantic <button type=\"button\">, aria-hidden on decorative icons, full-width clickable rows with generous p-3 touch targets, and good contrast. No inputs present, so the input vocabulary does not apply. The only nit is a decorative icon sized with arbitrary h-[18px]/w-[18px] (line 41), a P3 polish item that could snap to the scale (h-5 w-5) or use rem.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Line 41: icon className | P3 | ✓ | Arbitrary pixel icon size h-[18px]/w-[18px] sits off the spacing scale (16/20px). Either snap to h-5 w-5 (20px) to align |

## src/features/messaging/components/ScheduledTray.tsx  (2)

ScheduledTray is a small, well-built modal list with strong fundamentals: correct type scale (text-sm body, no oversized headings, no eyebrows/gradient text), full 1px border (border border-line) with no banned side-stripes, semantic HTML (ul/li), Button components with proper aria-label on the icon-only delete action, and aria-hidden on decorative icons. Touch targets rely on the shared Button component. Only two minor polish issues: an arbitrary h-[18px] w-[18px] icon size that should map to the scale (h-5 w-5), and a raw dark:text-white override on the message body that should rely on the text-ink token instead of a hard-coded color. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 24: icon size | P3 | ✓ | Arbitrary px sizing (h-[18px] w-[18px]) deviates from the Tailwind sizing scale; the other icons in this same list item  |
| theming | line 25: message body text color | P3 | ✓ | Hard-coded dark:text-white bypasses the theming token. text-ink is the design token and should already resolve to the co |

## src/features/messaging/components/ShortcutsHelpDialog.tsx  (2)

A small, well-built shortcuts help dialog. Typography sits cleanly on the product scale: text-sm font-semibold group titles (correct h3 role), text-sm rows, and text-xs font-mono kbd captions. No oversized text, no arbitrary px sizes, no eyebrows, no gradient text, no side-stripe borders. The kbd uses a proper full 1px border-line. Responsive layout is good (grid-cols-1 -> sm:grid-cols-2, no fixed widths). Two minor issues: heading level skips from the Modal title straight to <h4> with no h3, hurting the screen-reader outline; and dark-mode styling on the kbd mixes design tokens (border-line, text-ink) with hard-coded dark:border-gray-700 / dark:text-white, which is inconsistent if the tokens are already theme-aware. No P0/P1 problems.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Group heading (line 27): <h4 className="mb-2 text-sm font-se | P3 | ✓ | These group titles ('Navigation', 'Message') are h3-role card/sub headings, but the markup jumps to <h4> with no precedi |
| theming | kbd element (line 32): dark:border-gray-700 dark:text-white | P3 | manuel | The light mode uses tokens (border-line, bg-surface-2, text-ink) but dark mode hard-codes dark:border-gray-700 and dark: |

## src/features/messaging/components/SmartReplies.tsx  (3)

Small, clean component with no major issues: semantic buttons, type=button, decorative icon correctly aria-hidden, full border-line (no banned side-stripes), no oversized type, no arbitrary px, no eyebrows, no gradient text, no glassmorphism. Three minor refinements: (1) theming — the chip re-hardcodes a dark palette (dark:gray-700/white) on top of semantic tokens that already theme, risking drift; prefer tokens only. (2) typography — button label lacks font-medium, the standardized label weight. (3) a11y/touch — py-1 chips are ~26px tall, below the 44px target. flex-wrap keeps it responsive with no overflow.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | button className (line 19) | P2 | ✓ | The light side uses semantic tokens (border-line, bg-surface-2, text-ink, hover:bg-surface-3) which already resolve per  |
| typography | button label (line 19, text-sm text-ink) | P3 | ✓ | These chips are interactive buttons/labels. Per the type scale, button/label text is text-sm font-medium; here the weigh |
| a11y | button padding (line 19, px-3 py-1) | P2 | ✓ | py-1 on text-sm yields a chip roughly 26px tall, well under the 44px touch-target guidance (and tight even for a compact |

## src/features/messaging/components/StoriesBar.tsx  (3)

Small, mostly clean component. Typography is fully compliant (text-xs for captions/names, text-sm for body/input, proper tokens, no oversized text, no eyebrows, no gradient text). Borders use border-line correctly; the ring-2/ring-brand on avatars is a legitimate seen/unseen indicator, not a banned side-stripe. The one real problem is the inline input on line 70: it strips the focus outline with outline-none and provides no focus ring (WCAG 2.4.7 keyboard-focus break, P1) while also deviating from the .input design-system standard (bg-surface-2/border-gray-300/rounded-lg/p-2.5/focus:ring). Responsiveness and antipattern hygiene are strong; horizontal scroll row is appropriate for a stories strip.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | line 70 — input className | P1 | ✓ | outline-none removes the focus indicator with no replacement, breaking visible keyboard focus (WCAG 2.4.7). The input al |
| input | line 70 — input radius/bg/border | P2 | ✓ | Standard input is bg-surface-2 / border-gray-300 / rounded-lg / p-2.5. This input uses rounded-md, border-line, bg-white |
| theming | line 35 — add-button avatar placeholder | P3 | manuel | The dashed placeholder circle is fixed h-12 w-12 (48px) while the story avatars use Avatar size="lg"; if lg is not 48px  |

## src/features/messaging/components/ThreadPanel.tsx  (2)

ThreadPanel.tsx is largely impeccable: typography sits entirely on the fixed scale (text-sm headers/body, text-sm replies counter) with no oversized text, arbitrary px sizes, eyebrows, gradient text, or font-light. Borders use border-line full borders with no side-stripe accents, and theming relies on tokens (ink, line, muted, surface-2, white) with proper dark variants. Semantic HTML is solid (aside/header/label/textarea, IconButton with labels, sr-only label, aria-label on the panel). The one real defect is the reply textarea: outline-none strips the focus ring with no replacement (WCAG 2.4.7 Focus Visible failure), and the field deviates from the .input standard (rounded-md vs rounded-lg, p-2 vs p-2.5, no focus:ring). Both are fixed by a single className swap that restores focus:border-blue-500 focus:ring-1 focus:ring-blue-500 and aligns radius/padding.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | textarea#thread-reply, className (line 73) | P1 | ✓ | outline-none removes the native focus ring with no replacement, so keyboard users get no visible focus on the reply fiel |
| input | textarea#thread-reply, className (line 73) | P2 | ✓ | The textarea deviates from the .input standard: radius is rounded-md (standard rounded-lg), padding is p-2 (standard p-2 |

## src/features/messaging/components/VoiceMessage.tsx  (2)

VoiceMessage.tsx is a clean, compliant component. Typography stays on-scale (text-sm body, no arbitrary px, no oversized text, no eyebrows, no gradient/font-light). Borders use the full border border-line token (no banned side-stripes), and theming is consistent via design tokens (bg-brand, text-muted, border-line, bg-surface-2) with proper dark-mode overrides. Both controls are real <button> elements with aria-labels, and the decorative waveform is correctly aria-hidden. The only real findings are a11y polish: the speed-toggle button has no height/vertical padding so its tap target is far below 44px and out of line with the 36px play button, and its aria-label (\"speed\") is static so the current playback rate is not announced to screen readers even though it changes on click. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Speed-toggle button (line 42-49): className="rounded-md bord | P2 | ✓ | The speed button has only horizontal padding (px-1.5) and no height, so its tappable area is roughly the cap-height of o |
| a11y | Speed-toggle button label (line 45-48): aria-label={t("voice | P2 | manuel | The button is a stateful toggle but its accessible name is the static string "speed" — a screen-reader user cannot tell  |

## src/features/messaging/MailInbox.tsx  (6)

Flowbite-derived inbox, faithfully translated but not aligned to the TeamsLike type scale or design tokens. Two real typography deviations: list rows render sender/message at text-base (16px) when product body is text-sm (14px), and the compose-modal title uses off-scale text-lg (18px) for an h2 role. Inputs deviate slightly from the .input standard (uses primary token + Flowbite default ring rather than the explicit focus:ring-1 contract). Theming is the weakest dimension: the whole file uses gray-XXX / primary-XXX Flowbite tokens instead of ink/line/muted/surface/brand. No banned anti-patterns (no gradient text, no eyebrows, no side-stripe borders); the large hex color grid and the text-4xl/text-2xl entries in the text-size picker are legitimate functional previews, not findings. A11y is generally good (sr-only labels, aria, semantic buttons), with the main caveat being the unread-row body contrast and the non-actionable anchor tags used as toolbar buttons.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 208 — sender name cell: `${m.read ? "font-normal text-g | P2 | ✓ | Inbox list rows are body content. Product body is text-sm (14px); text-base (16px) oversizes every row sender name above |
| typography | Line 210 — message preview cell: `... p-4 text-base xl:max-w | P2 | ✓ | Message preview is body text and must match the row. text-base (16px) exceeds the body role (text-sm 14px) and is incons |
| typography | Line 245 — compose modal title `text-lg font-semibold` | P2 | ✓ | text-lg (18px) is not on the product scale. A modal/section heading is the h2 role => text-base (16px) font-semibold. Ma |
| input | Lines 259 & 263 — To / Subject inputs | P3 | ✓ | Deviates from the .input standard: focus ring lacks an explicit width (no focus:ring-1, so it relies on Flowbite's heavi |
| theming | Throughout — e.g. header line 15 `border-gray-200 bg-white`, | P2 | manuel | The file is built entirely on raw Flowbite gray-XXX/primary-XXX utilities and white literals instead of the product desi |
| a11y | Lines 23-103 — toolbar actions implemented as `<a href="#">` | P2 | manuel | These are actions (archive/delete/snooze), not navigation. Using <a href="#"> creates phantom navigation targets, breaks |

## src/features/messaging/MailRead.tsx  (8)

MailRead.tsx is a verbatim, machine-generated Flowbite \"read.html\" port (header comment states the markup must not be hand-edited), and it shows: every color is a raw Flowbite gray-XXX or the primary-* scale rather than the product's ink/line/muted/surface/brand tokens, so theming is the weakest dimension (1/4). Accessibility is also poor (1/4): the long-form email body — the main content — is rendered in gray-500 (~4.0:1) which fails WCAG AA for normal text, and nearly every interactive action (archive, delete, reply, forward, pagination) is an <a href=\"#\"> or href=\"\" instead of a <button>, with the kebab overflow trigger entirely unlabeled. The message title uses font-medium where the scale wants font-semibold. Responsive structure is reasonable (sm: breakpoints hide secondary actions, fluid widths) and there are no banned side-stripe borders, gradient text, or eyebrows, so the antipattern score is dragged down mainly by the wholesale untouched-Flowbite nature rather than specific slop tells. Top fixes: map all colors to tokens, raise body text to ink-2, and convert action links to buttons.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Entire file — every text/border/bg color is raw Flowbite gra | P1 | manuel | The product mandates design tokens (ink/line/muted/surface/brand). This file is a verbatim Flowbite paste using hard-cod |
| typography | Line 175 — article/section heading uses base-then-xl with fo | P2 | ✓ | This is the read-message title (h1/h2 role). Per the scale, section/title headings are font-semibold, not font-medium. T |
| a11y | Body copy: all email paragraphs and list items use text-gray | P1 | ✓ | This is the primary reading content of the email — long-form body text at gray-500 fails WCAG AA 4.5:1 for normal-size t |
| a11y | Interactive actions implemented as <a href="#"> (archive/spa | P2 | manuel | These are actions (archive, delete, reply, snooze), not navigation. Using <a href="#"/href=""> gives wrong semantics for |
| a11y | Icon-only action links lack accessible labels via aria; rely | P2 | ✓ | The overflow/kebab menu button (line 105) contains only a decorative aria-hidden SVG and no sr-only text or aria-label,  |
| a11y | Tap target size on icon action links — p-2 around an h-5 w-5 | P3 | ✓ | Toolbar action buttons render around 36px, below the 44px minimum touch target; the toolbar is dense and these are prima |
| input | Select-all checkbox uses focus:ring-3 and Flowbite primary r | P3 | ✓ | Input focus styling deviates from the .input vocabulary (focus:ring-1 focus:ring-blue-500). focus:ring-3 + primary-300 i |
| antipattern | Whole component is an unmodified machine-generated Flowbite  | P2 | manuel | The file declares itself an untouchable verbatim Flowbite translation. That is why tokens, semantics, contrast and the t |

## src/features/messaging/MailReply.tsx  (7)

A faithful Flowbite-to-JSX conversion of a mail reply view. No AI-slop antipatterns (no gradient text, eyebrows, side-stripe borders, or hero-metric templates) — borders are consistent 1px gray-200 dividers and the card uses a clean full border. The main weaknesses are theming and a11y: the file hardcodes Flowbite gray-500/400/900/800 and primary-* throughout instead of the product tokens (ink, ink-2, muted, brand, line); the long article body lacks an explicit text-sm so it renders at 16px rather than the 14px body scale; and nearly every toolbar action is an <a href=\"#\"> acting as a button (non-semantic, polluting the link list). The primary reply textarea removes its focus ring (focus:ring-0) and has an empty placeholder, and icon hit areas (p-2 on 20px icons, ~36px) fall under the 44px touch minimum. The subject h2 uses font-medium where the title role calls for font-semibold. Most fixes are localized className swaps; the <a>→<button> and token migration touch many lines.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Toolbar icon actions, e.g. lines 20, 30, 40 (Archive/Spam/De | P2 | manuel | These are in-app actions (archive, delete, undo, bold, attach), not navigation. Using <a href="#"> is non-semantic, adds |
| a11y | Reply textarea, line 357 | P2 | ✓ | focus:ring-0 strips the only visible focus indicator from the primary input of the view. autoFocus mitigates initial ent |
| a11y | Icon action touch targets, e.g. lines 20, 150, 344, 542 | P3 | ✓ | p-2 around a 20px (h-5 w-5) icon yields a ~36px hit area, under the 44px minimum touch target. These are the primary too |
| typography | Mail subject heading, line 175 | P3 | ✓ | This is the page/section title (RE: Inquiry…). The h1/h2 title role is font-semibold in the scale; font-medium under-wei |
| theming | Body copy throughout, e.g. article paragraphs lines 265-313, | P2 | manuel | The whole view hardcodes gray-500/400/900/800 instead of the design tokens (ink, ink-2, muted). This breaks token consis |
| theming | Send message button + dropdown buttons, lines 536, 319, 382 | P3 | manuel | Uses Flowbite's primary-* scale rather than the product brand token. Map the only primary CTA and focus rings to the bra |
| input | Reply textarea, line 357 | P3 | ✓ | placeholder="" leaves the empty required field with no prompt, and the borderless/ring-0 styling gives the textarea no v |

## src/features/messaging/MessagingPage.tsx  (1)

This is a layout/shell orchestrator (ChatShell) that delegates virtually all UI rendering to imported child components (CommunitiesBar, MessagingSidebar, ChannelHeader, MessageList, MessageComposer, panels, dialogs). Almost no typography, borders, or inputs are styled inline here, so there is very little surface for typeset findings. The only directly-styled element is the mobile-only back button. It uses correct tokens (border-line, text-brand, the dark: pairing matches this codebase's convention) but has a sub-44px touch target (py-2) and uses the body text-sm weight instead of the button/label font-medium role. The container uses bg-white dark:bg-gray-800 which is the established surface convention here. Responsive structure is solid: useIsMobile drives a single-pane list/conversation toggle with no fixed-px widths and proper min-w-0/overflow handling. No anti-patterns (no gradient text, no eyebrows, no side-stripe accent borders, no glassmorphism). Overall a clean, compliant shell file.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| a11y | Mobile back button (lines 153-161) | P2 | ✓ | The mobile back button is only py-2 (8px) which yields a ~32px touch target, below the 44px minimum for touch on a mobil |

## src/features/messaging/Notifications.tsx  (10)

Flowbite-derived notifications page mechanically converted to JSX (10 near-identical notification cards + delete modal). Markup is structurally sound and reasonably accessible (real buttons, aria-labelledby on dropdowns, alt text), but it ignores the product type scale and design tokens entirely: section headers are oversized weak-contrast text-xl gray labels, body text uses fluid sm:text-base sizing, h1 is font-bold instead of font-semibold, the modal heading is off-scale text-lg, and everything is hard-coded gray-XXX/primary-XXX/bg-white instead of ink/muted/surface/line tokens. Dropdown toggles strip the focus ring with focus:outline-none and no replacement. Several copy/markup typos (sm:items-cente rme-8, hover-no-underline, dark:border-gray-00). No side-stripe borders or gradient text. autoFixable findings are localized className swaps repeated across the 10 cards.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h2 section headers, lines 45 and 442 | P1 | ✓ | h2 section role is text-base (16px) font-semibold text-ink. Here it is text-xl (20px) with no weight and gray-500 body c |
| typography | h1 page title, line 42 | P2 | ✓ | h1 role is text-xl font-semibold. font-bold deviates from the standardized heading weight; headings must be consistently |
| typography | notification body paragraphs, e.g. lines 50, 125, 205, 284,  | P2 | ✓ | Product uses a FIXED rem type scale; body is text-sm (14px). The sm:text-base breakpoint fluidly bumps body copy to 16px |
| typography | notification timestamp meta, e.g. lines 51, 165, 208, 288 | P2 | ✓ | Caption/meta role is fixed text-xs (12px) text-muted. The sm:text-sm breakpoint fluidly grows the meta line; the first c |
| typography | modal heading, line 859 | P2 | ✓ | text-lg (18px) is off the scale. A dialog title is an h2/h3-level section heading and should map to text-base (16px) fon |
| typography | modal body paragraph, line 860 | P2 | ✓ | Body copy has no explicit size, inheriting the browser/parent default rather than the fixed body role. Add text-sm and m |
| a11y | notification dropdown toggle buttons, e.g. lines 95, 174, 25 | P1 | ✓ | These icon-only kebab buttons set focus:outline-none with no replacement focus indicator, so keyboard users get no visib |
| a11y | notification dropdown toggle buttons, accessible name, e.g.  | P1 | ✓ | The toggle contains only an aria-hidden svg and no text, so it has no accessible name for screen readers. Add aria-label |
| theming | notification cards + text colors throughout, e.g. lines 46,  | P2 | manuel | Cards and text are hard-coded bg-white / text-gray-500 / text-gray-900 with parallel dark: overrides instead of the desi |
| antipattern | markup/copy typos, lines 202, 528, 689 | P2 | ✓ | Mechanical Flowbite-to-JSX conversion left broken class tokens: 'sm:items-cente rme-8' is a split that produces the bogu |

## src/features/messaging/rich.tsx  (2)

A small, safe inline markdown-lite renderer (code/bold/italic/strike/link/mention) using semantic HTML (strong, em, s, a, code) with proper rel=\"noopener noreferrer\" on external links and brand tokens for links/mentions. Two minor findings, both on the inline <code> element: an off-scale arbitrary font size text-[0.85em] should map to text-xs, and a hard-coded dark:bg-gray-700 override should be removed in favor of the bg-surface-3 token handling dark mode. No oversized type, no eyebrows, no gradient text, no side-stripe borders, no input issues. Otherwise clean and compliant.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | <code> element, line 20: className="rounded bg-surface-3 px- | P2 | ✓ | Arbitrary off-scale font size text-[0.85em] violates the fixed type scale (no arbitrary sizes). Inline code should map t |
| theming | <code> element, line 20: className="rounded bg-surface-3 px- | P2 | ✓ | Mixes a design token (bg-surface-3) with a hard-coded dark-mode override (dark:bg-gray-700). The surface token should al |

## src/features/phone/ActiveCallBar.tsx  (6)

Solid, well-structured call bar with good a11y fundamentals (role/aria-label regions, aria-live status, aria-pressed/aria-checked, 44px touch targets, focus-visible rings, semantic buttons, motion-safe). Main issues: one banned eyebrow tell (uppercase + tracking-wide) on the ParkedStrip title (P1), and pervasive theming inconsistency where raw gray/white hex pairs (text-gray-900 dark:text-white, bg-white/dark:bg-gray-900, text-gray-600/gray-100) are mixed with the design tokens (text-ink, text-muted, border-line) that the same file otherwise uses. One real contrast miss: text-gray-400 struck flow labels on indigo-50 fall below AA. The inner active-control cluster lacks wrap/scroll and can overflow on narrow mobile. Typography otherwise compliant: no oversized text, no arbitrary px, floor respected, .input class used for the consult field.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | ParkedStrip title span, line 406 | P1 | ✓ | Banned eyebrow tell: small uppercase + tracking-wide label. Drop uppercase and tracking; keep plain text-xs font-semibol |
| theming | Peer display name, line 126 | P2 | ✓ | h3/card title role should use the text-ink token (which already resolves light/dark) instead of a hard-coded text-gray-9 |
| theming | Root bar container, line 113 | P3 | manuel | border-line is used for the light border but the dark variant is overridden with a raw dark:border-gray-700, and bg-whit |
| a11y | Caller class badge, line 143 | P3 | ✓ | Raw gray-600 on gray-100 instead of tokens; passes AA but breaks the design-token consistency used elsewhere (text-muted |
| a11y | MonitorPanel flow labels, line 386 | P2 | ✓ | text-gray-400 (#9ca3af) on the indigo-50 panel background is below 4.5:1 contrast for 12px text, so the disabled/struck  |
| responsive | Active control set, line 180 | P2 | manuel | The parent row uses flex-wrap (line 123) but this inner control cluster does not; on a ~320px viewport the seven 44px ta |

## src/features/phone/AttendantConsole.tsx  (6)

AttendantConsole is structurally sound and responsive (mx-auto max-w-3xl, flex-wrap headers, truncate on numbers, overflow-y-auto, semantic ul/li/section, aria-labels, aria-pressed toggles, focus-visible rings, real buttons). The select uses the standard .input class — good. Main issues: two BANNED eyebrow headings (text-sm uppercase tracking-wide text-gray-400) at lines 43 and 73 — drop uppercase/tracking and the gray-400 (which also fails 4.5:1 AA contrast) in favor of plain text-sm font-semibold text-muted. Theming is the weakest area: the file hard-codes gray-XXX, bg-white, and dark variants throughout instead of the ink/line/surface/muted/brand tokens the product standardizes on. Type scale otherwise compliant (text-xl title, text-sm/text-xs body and meta within range). No oversized type, no gradient text, no side-stripe borders.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | line 43 | P1 | ✓ | Banned eyebrow tell: small uppercase + tracking-wide label. Drop uppercase/tracking. text-gray-400 also fails contrast f |
| antipattern | line 73 | P1 | ✓ | Second eyebrow tell (uppercase tracking-wide). Same role as line 43; standardize to plain text-sm font-semibold text-mut |
| a11y | line 43 | P1 | ✓ | text-gray-400 (#9ca3af) on white is ~2.8:1, below the 4.5:1 AA threshold for this section-heading text. |
| theming | line 25 | P2 | ✓ | Hard-coded gray-900/dark:white instead of the ink token used product-wide. (Also note: this is the page title; text-xl i |
| theming | lines 54, 57, 58, 72, 83 | P2 | ✓ | Pervasive hard-coded gray-XXX + bg-white/gray-800 instead of design tokens (line/surface/ink/muted). Inconsistent with t |
| theming | lines 82-83 | P3 | ✓ | Inactive pill mixes primary token with raw gray scales; standardize inactive state on tokens. |

## src/features/phone/CallAnalytics.tsx  (8)

Functionally clean analytics view with proper loading/empty/error states, but the typeset carries several AI tells. The metric cards are a textbook hero-metric template (text-2xl values + uppercase eyebrow labels), the volume legend uses text-[10px] (below the 12px floor), and labels lean on banned eyebrows (uppercase tracking-wide). Theming is hard-coded gray-XXX / white / primary-500 rather than ink/line/surface tokens. The card label weight is inconsistent (font-medium on metric cards vs font-semibold on section labels for the same eyebrow role). Borders are fine (full 1px). a11y is mostly OK but the bar chart exposes no per-bar data to assistive tech beyond a single aria-label.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 57 — metric card value | P1 | ✓ | text-2xl is the page-hero ceiling reserved for rare landing use; applied to 7 repeated metric cards it reads as the hero |
| antipattern | Line 56 — metric card label (eyebrow) | P1 | ✓ | uppercase tracking-wide on a small gray label is a banned eyebrow tell. Drop uppercase+tracking and use the muted token; |
| antipattern | Line 63 — volumeByHour section label (eyebrow) | P1 | ✓ | Banned eyebrow (uppercase tracking-wide on small gray text). Drop uppercase+tracking, use muted token. |
| antipattern | Line 81 — queueSla section label (eyebrow) | P1 | ✓ | Banned eyebrow. Same fix as the volume label; keeps the two section labels consistent. |
| typography | Line 74 — chart hour axis legend | P1 | ✓ | text-[10px] is an arbitrary px size below the 12px floor (unreadable) and gray-400 is below 4.5:1. Map to text-xs and th |
| typography | Lines 56 vs 63/81 — same eyebrow role, two weights | P3 | manuel | The same caption/label role is styled font-medium on metric cards and font-semibold on section labels; same role should  |
| theming | Lines 51, 55, 57, 89 — hard-coded grays/white instead of tok | P2 | manuel | Component hard-codes gray-XXX, white, and per-element dark: pairs instead of the brand/ink/line/surface design tokens, d |
| a11y | Lines 64-73 — bar chart accessibility | P2 | manuel | The chart conveys data only via hover title attributes; screen-reader and keyboard users get a single generic label with |

## src/features/phone/CallHistory.tsx  (7)

CallHistory.tsx is structurally solid and responsive (overflow-x-auto tabs, min-w-0 truncation, proper empty/error/loading states, .input class reuse, semantic buttons, motion-safe guards). Main issues: (1) a banned eyebrow on the date-group labels (text-xs uppercase tracking-wide) that also fails AA contrast at text-gray-400 on white; (2) off-scale text-lg on the section title; (3) pervasive hardcoded gray-XXX neutrals instead of design tokens (ink/muted/line/surface), while brand uses primary-* tokens; (4) weak focus ring (primary-300) and an incomplete ARIA tablist (role=tab without aria-controls/tabpanel). Most are localized className swaps; theming migration and ARIA wiring need broader edits.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 110: h3 history title | P2 | ✓ | text-lg (18px) is not on the product type scale. This is a section heading (h2 role over the list region) which is text- |
| antipattern | Line 196: date group labels | P1 | ✓ | Banned eyebrow pattern: small text-xs uppercase tracking-wide label is a classic AI tell. Drop uppercase + tracking-wide |
| a11y | Line 196: group label text color | P1 | ✓ | text-gray-400 (#9ca3af) on white is ~2.5:1 contrast, below the 4.5:1 AA threshold for this small (12px) text. These date |
| theming | Lines 110, 117, 159, 196, 199, 210, 213 etc: hardcoded grays | P2 | manuel | The file uses raw gray-XXX scale throughout instead of the product design tokens (ink / ink-2 / muted / line / surface). |
| typography | Line 210: caller name | P3 | ✓ | List-item primary text has no explicit size, inheriting an ambient size rather than pinning to the fixed scale. The h3/c |
| a11y | Line 156: filter tab focus ring | P2 | ✓ | ring-primary-300 is a very light ring; against the gray-100 unselected tab and white page it provides weak focus contras |
| a11y | Lines 145-169: tablist without tabpanel wiring | P2 | manuel | Using role=tablist/tab without aria-controls and a matching role=tabpanel produces a broken ARIA pattern for screen read |

## src/features/phone/CallQueuePanel.tsx  (7)

Structurally solid panel with good semantics (real button elements, aria-pressed, aria-label, aria-labelledby sections, EmptyState). Main issues: two instances of the banned eyebrow pattern (text-xs uppercase tracking-wide text-gray-400) which also fail AA contrast at gray-400 on white; an off-scale text-lg h3; pervasive raw gray-XXX + manual dark: variants instead of design tokens (ink/line/muted/surface); and small interactive toggles/links below the 44px touch-target minimum. No gradient text, no side-stripe borders, inputs absent. Fix the eyebrows and contrast first (P1), then normalize the heading scale, tokens, and touch targets.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 28 — h3 queue name | P2 | ✓ | h3 / card sub-heading role is text-sm (14px) or section-level text-base (16px). text-lg (18px) is off the fixed type sca |
| antipattern | line 35 — agents eyebrow label | P1 | ✓ | Banned eyebrow tell: small text-xs uppercase tracking-wide label. Drop uppercase+tracking and use a token color; gray-40 |
| antipattern | lines 62-64 — waiting eyebrow label | P1 | ✓ | Second instance of the banned eyebrow pattern (uppercase tracking-wide). Standardize to plain text-xs font-semibold text |
| a11y | line 35 / line 62 — text-gray-400 label on white | P1 | ✓ | gray-400 (#9ca3af) on white is ~2.8:1, below the 4.5:1 AA threshold for small text. These are section labels, not placeh |
| theming | lines 24,26,28,40,41,52,70,74,75 — hard-coded gray scale ins | P2 | manuel | File uses raw gray-XXX + explicit dark: variants throughout instead of the brand/ink/line/muted/surface tokens. Tokens e |
| a11y | lines 43-56 — agent availability toggle target height | P2 | ✓ | px-3 py-1 on text-xs yields roughly a 24px tall control, well under the 44px touch-target minimum for interactive toggle |
| a11y | lines 79-86 — request callback link-button target | P3 | ✓ | Bare text-xs button with no padding has a touch target far below 44px. Also relies on hover:underline only — fine for af |

## src/features/phone/ContactsPanel.tsx  (7)

Solid, well-structured panel: inputs all use the shared .input class (compliant focus/border/radius), buttons are real semantic buttons with aria-labels, touch targets are reasonable, and the layout is responsive with no fixed-width overflow risks. Two recurring issues drag it down. (1) Antipattern: the banned eyebrow tell appears twice (text-xs font-semibold uppercase tracking-wide on the favorites label line 194 and letter-group headers line 311) — drop uppercase+tracking. (2) Typography: off-scale text-lg headings (lines 150, 369) should map to text-base, and the gray-400 small labels are borderline contrast (→gray-500). Theming leans on hard-coded gray-* rather than ink/line/muted/surface tokens, but it is internally consistent with paired dark: variants and uses primary-* tokens, so it is not egregious. No side-stripe borders, no gradient text, no glassmorphism. The dialog lacks an accessible name (aria-labelledby).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 150 — h3 panel title | P2 | ✓ | h2/h3 section/card titles cap at text-base (16px) in the scale. text-lg (18px) is off-scale and oversizes a panel headin |
| typography | Line 369 — contact detail modal name | P2 | ✓ | text-lg (18px) is not on the fixed scale. The modal title role maps to text-base font-semibold (h2 section). Standardize |
| antipattern | Line 194 — favorites label eyebrow | P1 | ✓ | Banned eyebrow tell: small uppercase + tracking-wide label. Drop uppercase and tracking; also gray-400 on white is borde |
| antipattern | Line 311 — letter group header eyebrow | P1 | ✓ | Same banned eyebrow pattern (uppercase + tracking-wide). The letter is already a single glyph; uppercase+tracking adds n |
| a11y | Line 329 — contact secondary line (number · email) | P3 | ✓ | The phone number is primary, scannable record data (not a caption/meta counter), so text-xs (12px) under-sizes it; body/ |
| a11y | Lines 354-360 — contact detail dialog | P2 | manuel | A role="dialog"/aria-modal element needs an accessible name (aria-label or aria-labelledby). Screen-reader users get an  |
| a11y | Line 366 — detail avatar initials sizing | P3 | ✓ | text-xl (20px) is the h1 role; using it for decorative avatar initials is off-role. Not a hard break, but the avatar gly |

## src/features/phone/Dialer.tsx  (5)

Dialer.tsx is structurally clean with no AI-slop antipatterns (no gradient text, no eyebrows, no side-stripe borders, semantic buttons with aria-labels/sr-only, visible focus rings). The main weaknesses are theming and minor typography: the file leans entirely on hard-coded gray-NNN and primary-NNN palettes with duplicated dark: variants instead of design tokens (ink/line/muted/surface/brand), and the \"recent\" h3 uses off-scale text-lg (18px) where the h3 role is text-sm font-semibold. Two a11y polish items: the backspace icon button (~36px) and large round call/key buttons are fine, but verify the 14px brand-colored suggestion text meets 4.5:1. The text-2xl number display and dialpad keys are within the text-2xl ceiling and acceptable for a phone keypad.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | h3 "recent" heading, line 146 | P2 | ✓ | text-lg (18px) is not in the fixed type scale. The h3 card/sub role is text-sm (14px) font-semibold. text-lg is an off-s |
| theming | Throughout — all gray utilities, e.g. lines 68, 72, 73, 85,  | P2 | ✓ | Hard-coded gray-XXX scales with manual dark: variants for every shade instead of the design tokens (ink, ink-2, line, mu |
| theming | primary-* color usage, lines 98, 113, 124, 135, 157 | P3 | manuel | Uses a raw primary-NNN palette with hand-written dark: variants rather than the product brand token. Mixing primary-* sh |
| a11y | Backspace button, lines 81-92 | P2 | ✓ | Touch target is below the 44px minimum (8px padding + 20px icon ≈ 36px). Small destructive control on a phone dialer is  |
| a11y | Suggestion text, line 98 | P3 | manuel | Body-size (14px) brand-colored text must meet 4.5:1 against the white container. primary-600 blues are often ~4:1 and ca |

## src/features/phone/IVRBuilder.tsx  (8)

Structurally solid, responsive component (max-w-3xl, flex-wrap toolbar, responsive grid for hours, semantic button with aria-label, .input class on fields). Main problems are theming and anti-patterns: three banned eyebrow labels (text-xs uppercase tracking-wide), pervasive hard-coded grays (text-gray-900/700/400/500, border-gray-200, bg-white) with manual dark: variants instead of design tokens (text-ink, text-ink-2, text-muted, border-line, bg-surface), and two contrast failures from text-gray-400 on white (~2.8:1, below AA 4.5:1) on the meta text and the eyebrow labels. Type scale itself is compliant (h2 text-xl, body text-sm, meta/labels text-xs, no oversized/arbitrary fonts, no gradient text, no side-stripe borders). All findings are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 54: greeting label | P1 | ✓ | Banned eyebrow tell: small uppercase + tracking-wide label. Drop uppercase+tracking, use plain text-xs font-semibold tex |
| antipattern | Line 57: options label | P1 | ✓ | Banned eyebrow tell (uppercase tracking-wide). Drop uppercase+tracking; use text-muted token instead of too-light text-g |
| antipattern | Line 103: hours label | P1 | ✓ | Banned eyebrow tell (uppercase tracking-wide). Standardize to plain text-xs font-semibold text-muted. |
| theming | Line 49: h2 page title | P2 | ✓ | Hard-coded text-gray-900 dark:text-white instead of the text-ink token. Token handles both light/dark and keeps headings |
| theming | Line 53, 102: card containers | P2 | ✓ | Hard-coded border-gray-200/bg-white + dark variants instead of design tokens (border-line, bg-surface). Tokens centraliz |
| theming | Line 55: greeting body text | P2 | ✓ | Hard-coded text-gray-700 dark:text-gray-300 body color instead of the text-ink-2 body token. |
| a11y | Line 64: action/target meta | P1 | ✓ | text-gray-400 on white is ~2.8:1 contrast, below WCAG AA 4.5:1 for this meta text. Use text-muted (gray-500) token which |
| typography | Lines 79,83,87,93: field labels | P3 | ✓ | Form labels use raw text-gray-500 instead of the text-muted token; standardize label color across the design system. |

## src/features/phone/MessagesPane.tsx  (5)

Solid, well-structured pane: semantic buttons with aria-labels, visible focus-visible rings, real .input class on textarea/datetime inputs, labeled schedule field, and no AI-slop tells (no gradient text, eyebrows, side-stripe borders, or glassmorphism). Main issues are typographic and token discipline: a text-[10px] timestamp below the 12px floor (and arbitrary px), text-gray-400 meta failing WCAG AA contrast on light bubbles, an off-scale text-lg h2 (should be text-base), and pervasive hard-coded gray-XXX/white colors instead of ink/line/muted/surface design tokens. Heading/title roles are styled inconsistently (font-medium vs font-semibold, missing size on the chat header name). No border or input antipattern violations.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 65 — h2 thread list heading | P2 | ✓ | h2 section role is text-base (16px) in the scale; text-lg (18px) is off-scale. Also use the ink token instead of hard-co |
| typography | line 129 — outbound/inbound message timestamp | P1 | ✓ | text-[10px] is below the 12px floor (unreadable) and an arbitrary px value. Map to text-xs (the caption/meta role). |
| a11y | line 129 — inbound message timestamp color | P1 | ✓ | text-gray-400 on a gray-100 / white bubble fails WCAG AA for small text (~2.5:1). Caption/meta should use text-muted (gr |
| theming | lines 65, 84, 100, 102, 108, 109, 119, 120, 137, 139, 146, 1 | P2 | manuel | The file hard-codes raw gray-XXX and white everywhere instead of the brand/ink/line/muted/surface tokens used by the des |
| typography | line 108 — chat header contact name | P3 | ✓ | This is a sub/card title role (h3) but has no size class (defaults inconsistently) and only font-medium. Standardize to  |

## src/features/phone/PhoneLayout.tsx  (2)

PhoneLayout is a clean, well-built tab-shell. Accessibility is exemplary: proper role=tablist/tab/tabpanel wiring, aria-selected, roving tabindex (tabIndex 0/-1), full arrow/Home/End keyboard handling, aria-labelledby linking panel to tab, visible focus-visible:ring-2, semantic <button>s, icons aria-hidden, and 44px touch targets (h-11). Theming uses design tokens throughout (text-ink, text-muted, border-line, text-brand, ring-brand) with no hard-coded hex or arbitrary grays. Responsive: flex-wrap tab bar, max-w-6xl container, no fixed px widths. No antipatterns — no gradient text, no eyebrows, no side-stripes (the border-b-2 on the active tab is the canonical underlined-tab indicator, not a banned card accent stripe). The only findings are two typography deviations in the header: the h1 uses text-3xl font-bold (over the text-2xl ceiling and off the text-xl font-semibold page-title role), and the subtitle uses text-base where text-sm (helper role) is correct.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 91 — h1 page title | P1 | ✓ | text-3xl (30px) breaks the CEILING (text-2xl) and the h1 page-title role is text-xl font-semibold. font-bold also deviat |
| typography | Line 92 — page subtitle/helper | P2 | ✓ | text-base (16px) is the h2 section size; a secondary subtitle under the page title is the helper role and should be text |

## src/features/phone/ReceptionistBuilder.tsx  (7)

Structurally solid file: good responsive layout (max-w-4xl, lg:flex-row stacking, w-full), semantic buttons with aria-pressed/aria-label, .input class used consistently for all inputs/select/textarea, and focus-visible rings on the toggle. Two clear problems: (1) two banned eyebrow labels (text-xs uppercase tracking-wide text-gray-400) at lines 69 and 103, which also fail contrast at gray-400; (2) pervasive hard-coded gray/white colors instead of ink/line/surface/muted tokens, plus two gray-400 text spans that break WCAG AA contrast. No oversized type, no gradient text, no side-stripe borders. Fixes are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 69: intents section label | P1 | ✓ | Banned AI eyebrow tell: small uppercase + tracking-wide label. Drop uppercase/tracking and use a token color (text-gray- |
| antipattern | Line 103: capture section label | P1 | ✓ | Same banned eyebrow pattern (uppercase + tracking-wide). Must match the standardized non-eyebrow section-label style. |
| a11y | Line 69 & 103: section label color | P1 | ✓ | text-gray-400 (#9ca3af) on white is ~2.8:1, below the 4.5:1 minimum for this small label text. Use text-muted (gray-500) |
| theming | Line 54: h2 title color | P2 | ✓ | Hard-coded gray-900/white pair instead of the ink design token used product-wide for headings; inconsistent theming. |
| theming | Lines 68,102,115: card surfaces | P2 | ✓ | Card border and surface use raw gray-200/white + dark variants instead of border-line / surface tokens; repeated literal |
| theming | Line 76: phrases helper text | P3 | ✓ | Meta/caption text hard-codes gray-500 instead of the text-muted token used for caption/meta per the scale. |
| a11y | Line 75: action meta color | P2 | ✓ | text-gray-400 inline meta at 14px on white is ~2.8:1, below 4.5:1. Use text-muted (gray-500) for adequate contrast. |

## src/features/phone/RoutingRuleBuilder.tsx  (6)

RoutingRuleBuilder.tsx is structurally solid: it uses the .input class for selects/inputs, semantic button/label elements, proper aria-labels on remove actions, flex-wrap layout that survives mobile, and a sensible max-w-3xl container. The main issues are (1) a banned eyebrow label on line 43 (text-xs uppercase tracking-wide) — a clear AI-tell to drop, (2) pervasive hard-coded gray-XXX colors with dark: overrides instead of the ink/muted tokens, hurting theming consistency, (3) form field labels set at text-xs caption size when they should be the text-sm font-medium label role, and (4) the preview checkbox aria-label leaking the raw enum key instead of the localized string. No oversized type (h2 correctly text-xl), no gradient text, no side-stripe borders, and inputs follow the design system. Theming is the weakest dimension.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Line 43: <p className="mb-2 text-xs font-semibold uppercase  | P1 | ✓ | Banned AI-tell eyebrow label (uppercase + tracking-wide). The product bans uppercase+tracking eyebrows; drop both and us |
| typography | Lines 69, 75, 81: <label className="flex flex-col text-xs te | P2 | ✓ | These are interactive form field labels (condition/action/target), which per the scale are the 'label' role: text-sm fon |
| theming | Line 40: <h2 className="text-xl font-semibold text-gray-900  | P2 | ✓ | Hard-coded gray-900/white pair instead of the ink token. The design system exposes text-ink for headings; using it remov |
| theming | Lines 52, 53, 90, 100, 101, 102, 105: repeated text-gray-900 | P3 | ✓ | Body and meta text is hard-coded to gray-XXX + dark: overrides throughout instead of the ink/ink-2/muted tokens the syst |
| a11y | Line 94: <input type="checkbox" ... aria-label={k} className | P2 | ✓ | The checkbox aria-label exposes the raw key (e.g. "afterHours", "noAnswer") to screen readers instead of the localized h |
| a11y | Line 94: <input type="checkbox" ... className="h-4 w-4" /> | P3 | ✓ | 16px checkbox with no explicit accent color; the label wrapper provides text as the tap target but the control itself is |

## src/features/phone/VoicemailInbox.tsx  (4)

Structurally clean and well-built file: correct type scale (text-xl h2, text-sm h3, text-xs meta — no oversized type, no arbitrary px, no eyebrows, no gradient text), proper semantic HTML (ul/li, button with type, htmlFor label + sr-only), visible focus-visible rings, role=status on the saved toast, aria-hidden on decorative icons, and the textarea correctly uses the .input class. Responsive layout uses max-w-3xl, flex, truncate, min-w-0, shrink-0 — no fixed widths or overflow risk. No side-stripe borders; borders are full 1px border-gray-200. The main weakness is theming: it hard-codes the entire gray-XXX + dark: scale and primary-XXX numeric scale everywhere instead of the design tokens (ink/line/muted/surface/brand), duplicating the theming the tokens already encode. One real a11y break: text-gray-400 (~2.8:1) on the no-transcript fallback text falls below WCAG AA 4.5:1.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | h2 title line 44; cards lines 59, 99; body text lines 67, 72 | P2 | ✓ | The product defines tokens (ink/line/muted/surface/brand). This file hard-codes the full gray-XXX + dark: scale everywhe |
| theming | primary-* usage lines 46, 62, 70, 81, 88 | P3 | ✓ | Brand color is referenced via raw primary-XXX numeric scale rather than the brand token, so accent color is not centrall |
| a11y | transcript fallback line 77 | P1 | ✓ | text-gray-400 on white is ~2.8:1 contrast, below the 4.5:1 WCAG AA minimum for body text. This is real readable content  |
| antipattern | unheard badge line 67 vs heard caller line 67, and meta line | P3 | manuel | Caller name role is styled with two ad-hoc gray values inline rather than the body/heading roles in the scale; minor con |

## src/features/phone/WrapUpCard.tsx  (4)

WrapUpCard is a clean, compliant dispatch dialog: it correctly uses role=\"dialog\" with aria-label, aria-label on every select/input, the shared Button component (real buttons, ghost variant), and the .input class for all fields, so a11y and inputs are solid and there are no anti-pattern tells (no gradients, eyebrows, side-stripe borders, or oversized type). Typography respects the scale (text-sm semibold title, text-xs labels/meta). The main weakness is theming: the title, labels, surface, and border use hard-coded gray-XXX / white with manual dark: overrides instead of ink/muted/surface/line tokens. One minor responsive nit: a fixed w-40 tags input in a flex-wrap row. All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | line 36: <p className="text-sm font-semibold text-gray-900 d | P2 | ✓ | Hard-coded text-gray-900 + dark:white instead of the ink token. The h3-role title should use text-ink, which already res |
| theming | lines 40, 46, 50: label className="flex ... text-xs text-gra | P2 | ✓ | Form labels use the raw gray-500 hex-equivalent instead of the muted design token. The caption/label role maps to text-m |
| theming | line 33: bg-white ... dark:bg-gray-900 | P2 | ✓ | Hard-coded bg-white/dark:bg-gray-900 and dark:border-gray-700 bypass surface/line tokens. Using bg-surface (and letting  |
| responsive | line 52: <input ... className="input w-40" /> | P3 | ✓ | Fixed w-40 (160px) tags input sits in a flex-wrap row; on narrow viewports it stays a rigid 160px while the note input f |

## src/features/portal/PortalChatPage.tsx  (4)

Clean, well-structured chat view. It uses design tokens consistently (border-line/line-2, surface-2/3, brand, ink, muted), the modal inputs use the .input class, focus rings are present (focus-within:ring-1 focus-within:ring-brand on the composer, focus:border on inputs), interactive elements are real buttons with aria-labels, and there are no AI-slop tells (no gradient text, no eyebrows, no side-stripe borders, no glassmorphism). Mobile is handled structurally via a list/chat single-panel toggle with no fixed-px widths that break. The only real findings are two arbitrary sub-floor text-[11px] timestamps that should map to text-xs, a placeholder using the low-contrast text-muted token instead of the standard placeholder-gray-400, and two headings (h2 line 126, header title line 255) that don't pin their size to the scale.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 211 — thread list timestamp | P2 | ✓ | text-[11px] is an arbitrary px size below the 12px floor and off the fixed type scale. Caption/meta must be text-xs (12p |
| typography | Line 336 — message bubble timestamp | P2 | ✓ | text-[11px] is arbitrary and below the 12px floor; meta/timestamps map to text-xs on the product scale. Standardize with |
| a11y | Line 363 — chat message input placeholder | P2 | ✓ | placeholder:text-muted is the same low-emphasis gray used for secondary text and typically falls below the 4.5:1 placeho |
| theming | Line 126 — chat list h2 / Line 255 — chat header title | P3 | ✓ | Section/title headings omit an explicit size class and rely on the inherited default, so the h2 role is not pinned to th |

## src/features/portal/PortalPage.tsx  (2)

PortalPage.tsx is a high-quality, design-system-disciplined file. It consistently uses tokens (text-ink, text-muted, border-line, bg-surface-2, bg-brand-soft, text-danger), the shared .input/.label/.card/.btn vocabulary with proper focus handling delegated to those classes, semantic <header>/<form>/<label htmlFor>/<button> elements, aria-labels on icon links and status dots, role=\"alert\" on errors, and motion-safe guards. Inputs all use the standard .input class with matched dark variants. The tinted callout (line 227) is a full-border bg-tint card, correctly avoiding banned side-stripe accents. No gradient text, no eyebrows, no glassmorphism, no arbitrary px font sizes, no font-light, no hard-coded hex. Only two real typeset findings: the h1 is oversized/over-weighted (text-2xl font-bold instead of text-xl font-semibold), and the hero subtitle lacks an explicit text-sm so it renders at the inherited 16px base. Both are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 218: <h1 className="text-2xl font-bold text-ink dark:te | P1 | ✓ | Per the fixed type scale an h1 page title is text-xl font-semibold. text-2xl is the rare page-hero role (landing only) a |
| typography | Line 221: <p className="text-muted mt-1">{t("home.subtitle") | P2 | ✓ | No text-size class is set so this body/helper paragraph inherits the base 16px (text-base). Helper/secondary text in the |

## src/features/settings/SettingsPage.tsx  (4)

A high-quality, design-system-compliant file. Typography adheres to the fixed scale: section titles use text-base font-semibold text-ink (h3 role), labels text-sm font-medium, helper/meta text-xs text-muted; no oversized headings, no arbitrary px font sizes, no font-light, no eyebrows, no gradient text. Borders are clean: full borders via border-line, danger uses border-danger/40, dividers via divide-line and a single border-t rule in the danger zone, with no banned side-stripe accents. Inputs are centralized in INPUT_CLS with a consistent bg-surface-2 / border-line / rounded-lg / px-3 py-2.5 / text-sm treatment, proper focus styling and placeholder:text-muted. Theming is fully tokenized (ink/ink-2/ink-3/line/muted/surface/surface-2/surface-3/brand/danger/ok) with zero hard-coded hex. Responsive structure is solid: grid-cols-1 sm:grid-cols-2, flex-col sm:flex-row button stacks, horizontally scrollable tabs on mobile, and a max-w-3xl container. Findings are minor: focus:ring-2 deviates from the .input standard ring-1; the inactive status label leans on text-muted where a stronger ink tone is warranted; the show/hide secret toggle uses a camera (video/videoOff) icon instead of an eye metaphor; and that toggle could carry aria-pressed. No P0/P1 issues.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| input | INPUT_CLS (line 84) focus ring on text inputs | P3 | ✓ | The design-system .input vocabulary specifies focus:ring-1, not ring-2. ring-2 on text inputs is a heavier focus treatme |
| a11y | Status pill icon in OrganizationTab (lines 175-194) inactive | P2 | ✓ | text-muted is the helper/secondary tone tuned for meta text, not for a status label that must communicate state at a gla |
| antipattern | Show/Hide secret button icon in SecurityTab (lines 450-455) | P2 | ✓ | A video / videoOff (camera) icon is used as the show/hide toggle for the signing secret. The metaphor is wrong (camera,  |
| a11y | Show/Hide and rotate icon buttons in SecurityTab (lines 444- | P3 | manuel | The show/hide control is a toggle that mutates the secret field's masking, but its state change is only conveyed by the  |

## src/features/support/components/Card.tsx  (1)

Small, clean component file. Theming is exemplary (border-line, bg-surface, text-ink, text-muted tokens throughout; no hard-coded hex or arbitrary grays). Borders are correct full 1px border-line with no side-stripes. Responsive is fine (no fixed px widths). Two issues, both in StatCard: the metric value uses text-2xl font-bold, which exceeds the in-app type ceiling (text-2xl is hero-only) and deviates from the font-semibold weight standard. The big-number-over-label StatCard is also a mild hero-metric template pattern, but it is legitimate for a stat card; the main defensible fix is reducing the value to text-xl font-semibold. a11y is slightly dented only because the metric/label contrast relies on tokens not visible here, but no concrete violation is provable from this file.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | StatCard, line 12: <div className="text-2xl font-bold text-i | P1 | ✓ | The stat value renders at text-2xl (24px), reserved for landing page heroes. A metric inside a reused StatCard is page c |

## src/features/support/components/ChannelsPanel.tsx  (1)

Clean, well-built component that is almost fully compliant. Typography sits within the scale (text-base/text-sm/text-xs), no arbitrary px, no font-light, no eyebrows, no gradient text. Borders use full border border-line (no side stripes). Theming relies entirely on design tokens (text-ink, text-muted, border-line, bg-surface-3, bg-brand). a11y is strong: semantic ul/li and button elements, aria-label on action buttons, aria-hidden on decorative icons and the progress track which is paired with a visible status Badge. No inputs in this file. The single defensible finding is the row container on line 52 applying text-base (16px), which renders repeating list-item body text (the channel name) one step too large; it should be text-sm to match the body role and the rest of the panel.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 52 — list row container <div className="flex flex-wrap  | P2 | ✓ | The row's text-base (16px) cascades to the channel name (line 54, ib.name) and inline content, rendering list body text  |

## src/features/support/components/ContactPanel.tsx  (5)

Technically this file is clean and well above the bar: it uses design tokens consistently (text-ink, text-muted, border-line, bg-surface/surface-2, text-brand, text-danger), has proper semantic HTML (real <button> elements, <ul>/<dl>, aria-label on every interactive control, role=\"group\" with label on the CSAT rating, motion-reduce fallbacks, focus-visible ring). No gradient text, no glassmorphism, no eyebrows, no side-stripe borders, no arbitrary px font sizes, no font-light, no oversized text-3xl+ ceilings. Responsive structure is sound (xl:block gated panel, min-h-0 overflow-y-auto, no fixed-px widths). The only systematic issue is typographic scale: the file leans on text-base (16px) almost everywhere for body, list items, attribute rows, label chips, empty-state text, and the input — where the product scale mandates text-sm (14px) for body/labels and text-xs (12px) for chips/meta. The four <h3> card headings also sit at text-base (the h2 section size) rather than the text-sm h3 card-heading role. All findings are localized className swaps (text-base -> text-sm/text-xs), all auto-fixable, none WCAG-blocking.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Identity Card: <ul className="space-y-1 text-base text-muted | P2 | ✓ | Body/identifier text uses text-base (16px). The product body role is text-sm (14px) text-muted. Identifier metadata is b |
| typography | Attributes Card: <dl className="space-y-1 text-base"> (line  | P2 | ✓ | Attribute key/value rows are body content but render at text-base (16px). Body role is text-sm (14px). Definition lists  |
| typography | Labels Card: empty-state span (line 81) and label chip span  | P2 | ✓ | Empty-state helper text is body (text-sm, not 16px). Label chips are tag/counter UI and should be caption-scale text-xs  |
| typography | Label input field (line 104) | P2 | ✓ | Input text is text-base (16px); the design-system input vocabulary specifies text-sm. Keeps input typography consistent  |
| typography | Section card headings: contact.name (line 40), contact.attri | P3 | ✓ | These are h3 card/sub-headings rendered with <h3> at text-base (16px), which is the h2 section role. Card/sub-headings s |

## src/features/support/components/ConversationList.tsx  (5)

Structurally clean, well-tokenized component (border-line, bg-surface, text-ink/muted, semantic button with aria-current and aria-labels, visible focus ring, no side-stripe borders, no gradients, no eyebrows). The one systemic issue is typography: text-base (16px) is used for the contact name, message preview, metadata row, and empty state, overshooting the fixed product scale where body/labels are text-sm and meta is text-xs. The search input also drifts from the .input design-system vocabulary (radius, bg, padding, focus ring, font size). All findings are localized className swaps with no a11y/responsive/theming/antipattern violations.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 58 — contact name span | P2 | ✓ | List-item primary label is a card/sub heading role (h3 → text-sm font-semibold/medium). text-base (16px) is one step too |
| typography | line 61 — last message preview | P2 | ✓ | Body/secondary text must be text-sm (14px) per the scale. text-base oversizes the message preview and makes the row tall |
| typography | line 62 — metadata/badge row | P2 | ✓ | Meta/badge/label row (priority, status, SLA, labels) is caption/meta role → text-xs (12px). text-base (16px) is two step |
| typography | line 41 — empty state | P3 | ✓ | Helper/secondary copy is text-sm in the product scale; text-base oversizes the empty-state message. |
| input | lines 32-38 — search input | P2 | ✓ | Input deviates from the .input design-system vocabulary: text-base instead of text-sm, rounded-md instead of rounded-lg, |

## src/features/support/components/ConversationView.tsx  (10)

ConversationView is structurally solid — design tokens (brand/ink/line/muted/surface) are used consistently, layout is responsive with flex-wrap and min-w-0, semantic buttons/IconButtons carry labels, and focus-visible rings are present. The dominant problem is typographic: text-base (16px) is applied as the default body size across the header name, status select, macro chips, chat bubbles, note card, AI suggestion, canned pills, empty-state hint, and reply input — where the fixed scale calls for text-sm (body/controls) or text-xs (meta chips/captions). One banned antipattern is present: the note card uses a side-stripe border-l-2 border-amber-400 accent, which should be rewritten as a full border plus bg tint. The reply input also drifts from the .input standard (text-base, bg-surface, no focus-border change). No gradient text, no eyebrows, no oversized headings, no hardcoded hex.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| antipattern | Note message card (line 148): className="rounded-md border-l | P1 | ✓ | Side-stripe accent border (border-l-2 border-amber-400) on a callout/note card is a banned decorative pattern. Rewrite a |
| typography | Empty-state hint (line 41): <p className="text-base text-mut | P2 | ✓ | Secondary helper text must be text-sm per scale; text-base (16px) overweights subordinate hint copy relative to the titl |
| typography | Header contact name (line 78): <span className="text-base fo | P2 | ✓ | This is a card/sub heading (conversation subject in a panel header), which maps to h3 = text-sm font-semibold. text-base |
| typography | Status select (line 117): className="h-9 ... px-2 text-base  | P2 | ✓ | Control/label text must be text-sm per scale; text-base oversizes the select relative to the text-sm buttons beside it. |
| typography | Macro chips (line 134): className="... px-2 py-0.5 text-base | P2 | ✓ | These are small tappable meta chips; per scale they should be text-xs (caption/meta). text-base (16px) on a py-0.5 chip  |
| typography | Chat bubbles (line 160) and note body (line 148): max-w-[80% | P2 | ✓ | Message body text is body copy and must be text-sm (14px) per the fixed scale. text-base is one step above the body role |
| typography | AI suggestion eyebrow row (line 175) and body (line 178): te | P2 | ✓ | The "AI draft" label is a small caption/affordance label and should be text-xs; the suggestion paragraph on line 178 sho |
| typography | Canned-shortcode pills (line 203): className="... px-2 py-0. | P2 | ✓ | Shortcode suggestion pills are meta/caption affordances and should be text-xs. text-base on a py-0.5 pill is oversized a |
| input | Reply input (lines 224-234): h-11 ... bg-surface ... no ring | P2 | ✓ | Input deviates from the .input standard: text-base instead of text-sm, bg-surface instead of bg-surface-2/gray-50, and n |
| a11y | Reply input keydown (line 227): onKeyDown={(e) => e.key ===  | P3 | manuel | Minor robustness: the bare expression form does not preventDefault and fires on IME composition Enter; explicit guard av |

## src/features/support/components/CostPanel.tsx  (3)

CostPanel.tsx is a clean, token-disciplined component. Theming is exemplary (ink/muted/line/brand/surface throughout, no hard-coded hex or arbitrary grays), accessibility is solid (label-wrapped select, aria-label on the range slider, visible focus-visible rings, aria-hidden icons, semantic table/thead), and there are no AI-slop antipatterns (no gradient text, eyebrows, side-stripe borders, or glassmorphism; full border-t dividers are correct). The only real issues are two typographic: container-level text-base (16px) on the data table (line 56) and the window row div (line 79) cause unsized cells/spans to render body content at 16px instead of the product text-sm (14px) body scale, creating inconsistency with the explicitly text-sm headers and paragraphs. The select also deviates slightly from the .input radius/fill/padding standard. All findings are localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | <table className="w-full border-collapse text-base"> (line 5 | P2 | ✓ | text-base (16px) on the table sets the body context for the data cells. The <td> cells on lines 67 and 72 have no explic |
| typography | window row <div className="mt-3 ... text-base"> (line 79) | P2 | ✓ | text-base (16px) sets the size for the unsized <span> label on line 81 ({t('cost.window')}). That label is body text and |
| input | <select> (lines 41-51) | P3 | ✓ | The select deviates from the .input vocabulary: rounded-md instead of rounded-lg, bg-surface instead of bg-surface-2/gra |

## src/features/support/components/FlowBuilder.tsx  (3)

FlowBuilder.tsx is a clean, well-structured component with strong accessibility (aria-label on the select, aria-hidden on decorative icons, aria-live on dynamic status/alert text, semantic button components, truncate on the flexible text cell) and good responsive behavior (flex-wrap, min-w-0/flex-1/truncate, no fixed-px content widths). No AI-slop antipatterns: no gradient text, no eyebrows, no side-stripe accent borders (the alerts use full borders), no glassmorphism. Three findings: (1) P2 typography — the node list rows use text-base (16px) where the product scale fixes list/body content at text-sm; (2) P2 theming — the unreachable warning alert uses raw amber-300/amber-700 with a manual dark: override while its sibling danger alert uses border-danger/text-danger tokens, so it should move to a warning token; (3) P3 input — the flow selector deviates from the standard .input vocabulary (bg-surface vs bg-surface-2, border-line vs border-gray-300, rounded-md vs rounded-lg, 2px brand ring vs 1px blue ring). Headings, helper text, captions, badges, and buttons otherwise follow the scale correctly.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 78 — <li className="flex items-center gap-2 rounded-lg  | P2 | ✓ | Node list rows are list/body content, which the product type scale fixes at text-sm (14px). text-base (16px) is reserved |
| theming | Lines 70-72 — unreachable-nodes warning <p> uses border-ambe | P2 | ✓ | This sibling alert (line 66) uses the design token border-danger / text-danger, but the warning variant drops to raw Tai |
| input | Line 41-48 — flow selector <select> | P3 | manuel | This select deviates from the design-system input vocabulary: it uses bg-surface instead of bg-surface-2/gray-50, border |

## src/features/support/components/InboxNav.tsx  (4)

InboxNav is a clean, token-driven sidebar: design tokens (brand/ink/line/muted/surface) are used consistently with zero hard-coded hex or arbitrary grays, no AI-slop antipatterns (no gradient text, eyebrows, side-stripe borders, or glassmorphism), and interactive elements are real <button>s with aria-current/aria-pressed plus motion-safe transitions. The main issues are typographic: the type scale is overshot across the board — filter chips and inbox nav rows use text-base (16px) where the product scale calls for text-sm (chips=text-sm font-medium, nav=text-sm), and the h3 group headers use text-base instead of the text-sm font-semibold h3 role. The only non-typographic concern is touch-target size: py-0.5 chips and py-1.5 rows fall well under the 44px minimum. Theming and antipattern are excellent; a11y and responsive are solid but held back by undersized tap targets.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | chip() helper, line 13 — filter/assignee chips | P2 | ✓ | Small filter chips are labels (text-sm font-medium per scale). text-base (16px) on a compact py-0.5 chip is oversized fo |
| typography | inboxBtn() helper, line 24 — inbox nav list items | P2 | ✓ | Sidebar nav list items are body/label content; the product scale puts navigation/body at text-sm (14px). text-base (16px |
| typography | h3 section headers, lines 29, 47, 58 | P3 | ✓ | h3 (card/sub heading) role is text-sm font-semibold in the scale. These are compact sidebar group labels; text-base make |
| a11y | chip buttons, line 50 & 61 (px-2 py-0.5) and inbox buttons l | P2 | manuel | py-0.5 chips and py-1.5 rows produce touch targets far below the 44px WCAG/touch minimum, making the status/assignee fil |

## src/features/support/components/KbPanel.tsx  (5)

KbPanel is structurally clean and technically strong: semantic button with aria-expanded, aria-label on the search input, motion-reduce/motion-safe guards, design tokens (ink/muted/line/surface/brand) throughout, no gradient text, no side-stripe borders, no eyebrows, full w-full responsive layout, and truncation to avoid overflow. The one systematic issue is typography: the entire panel renders body/list/input/helper text at text-base (16px) where the product scale calls for text-sm (14px) — affects the input, each result row, the expanded article body, and the empty state. Secondary: the search input deviates from the .input design-system standard (bg-surface/border-line/rounded-md/focus-visible:ring-2 ring-brand vs bg-surface-2/border-gray-300/rounded-lg/focus:ring-1 ring-blue-500). All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | input className (line 28) | P2 | ✓ | Search input uses text-base (16px). Per the type scale, input/body text is text-sm (14px). The whole panel sets body tex |
| typography | list-item button (line 42) | P2 | ✓ | Article title rows render at text-base (16px). Body/list text role is text-sm (14px); this oversizes every result row. |
| typography | article body paragraph (line 55) | P2 | ✓ | Expanded article body uses text-base; body copy role is text-sm (14px). Consistency with the scale. |
| typography | empty state paragraph (line 32) | P2 | ✓ | Empty/helper text uses text-base; helper/secondary role is text-sm text-muted. |
| input | search input (lines 23-29) | P3 | ✓ | Input deviates from the design-system .input standard: it uses bg-surface + border-line + rounded-md + focus-visible:rin |

## src/features/support/components/StudioView.tsx  (14)

StudioView is structurally clean and largely token-compliant (text-ink, text-muted, border-line, bg-surface/surface-2, text-brand, no gradient text, no eyebrows, no side-stripe borders, semantic buttons/labels with aria). The dominant issue is a systematic typography scale violation: nearly every body/label/input/list element uses text-base (16px) where the product scale calls for text-sm (14px), and both section headings use off-scale text-lg (18px) instead of text-base. Inputs also deviate from the .input design-system standard (rounded-md vs rounded-lg, border-line vs border-gray-300, bg-surface vs bg-surface-2, ring-2 ring-brand vs focus:ring-1 focus:ring-blue-500, h-10/px-2 vs p-2.5, no placeholder-gray-400). No AI-slop antipatterns and good theming. All findings are P2/P3 and mostly localized className swaps. The amber callout (lines 250-256) correctly uses a full border, not a side stripe. Touch targets on h-10 inputs/IconButtons are slightly under 44px but acceptable for desktop-first product.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 61: <h2 className="text-lg font-semibold text-ink"> (st | P2 | ✓ | h2 section headings in the product scale are text-base (16px) font-semibold. text-lg (18px) is not a defined role and is |
| typography | Line 198: <h2 className="text-lg font-semibold text-ink"> (s | P2 | ✓ | Same h2 section role as line 61; the product scale maps h2 to text-base (16px). text-lg is off-scale and must be standar |
| typography | Lines 70-71: agent list-item button text | P2 | ✓ | List-item / interactive body text should be text-sm (14px) per the scale. text-base (16px) oversizes a navigation list r |
| typography | Line 86: new-agent input className | P2 | ✓ | Input text is text-sm in the design-system .input vocabulary; text-base (16px) deviates from the standard and from the l |
| typography | Line 110: agent name input | P2 | ✓ | Input field text should be text-sm (14px) per the .input standard; text-base is off-scale. |
| typography | Line 122: agent goal textarea | P2 | ✓ | Textarea text should be text-sm (14px) to match the .input standard and the rest of the form. |
| typography | Line 129: channel checkbox <label> text | P2 | ✓ | Form labels / body text are text-sm (14px). text-base oversizes checkbox option labels. |
| typography | Line 142: tool checkbox <label> text | P2 | ✓ | Same checkbox-label role as line 129; body/label text is text-sm. text-base is off-scale and inconsistent. |
| typography | Line 154: intent list-item row | P2 | ✓ | List-item body text should be text-sm (14px). text-base oversizes the intent rows relative to the scale. |
| typography | Lines 170, 177, 186: intent label/phrases/reply inputs | P2 | ✓ | All three intent-form inputs use text-base; the .input standard and form consistency require text-sm (14px). |
| typography | Line 214: sandbox chat bubble text | P2 | ✓ | Message/body text is text-sm (14px) in the scale; text-base oversizes the sandbox transcript bubbles. |
| typography | Line 237: sandbox test input | P2 | ✓ | Input text should be text-sm (14px) per the .input standard; text-base deviates. |
| input | Lines 86, 110, 122, 170, 177, 186, 237: all text inputs/text | P2 | manuel | Inputs deviate from the design-system .input standard: rounded-md instead of rounded-lg, border-line instead of border-g |
| input | Lines 86, 170, 177, 186, 237: inputs missing visible placeho | P3 | manuel | These inputs set no placeholder color (relying on browser default) and use h-10 + px-2 rather than the standard p-2.5 pa |

## src/features/support/components/WorkforceView.tsx  (9)

WorkforceView is structurally clean: semantic table/list markup, real <button>/<label>, aria-labels on every input and select, visible focus rings, tabular-nums on the percentage, overflow-x-auto on the table for mobile, and no AI-slop tells (no gradient text, eyebrows, side-stripe borders, or hero-metric template). The main issues are typographic and input-vocabulary drift. All three h2 headings use text-lg (18px) where the scale mandates text-base (16px), and body copy throughout (table, adherence rows, criteria rows, evaluation list) uses text-base instead of the body role text-sm — oversizing dense data. The three form controls (number input + two selects) consistently deviate from the .input design-system vocabulary, using rounded-md/border-line/bg-surface/text-base and a custom focus-visible:ring-brand instead of rounded-lg/border-gray-300/bg-surface-2/text-sm and focus:border-blue-500 focus:ring-1 focus:ring-blue-500. Theming is the weakest area: adherence bar and percentage colors are hard-coded raw green/amber/red scales rather than the semantic status tokens that the Badge tone system already uses in the same file. No P0/P1 issues — a11y and responsiveness are strong; findings are P2 polish and one P3 theming cleanup.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Lines 37, 101, 130 — h2 section headings | P2 | ✓ | h2 section headings must be text-base (16px) per the fixed type scale. text-lg (18px) is not a defined role and creates  |
| typography | Line 49 — forecast table | P2 | ✓ | Table body text is body copy and must be text-sm (14px). text-base (16px) oversizes dense tabular data and breaks the bo |
| typography | Line 110 — adherence row label/value | P2 | ✓ | List row body text must be text-sm (14px) per scale; text-base oversizes it relative to the rest of the product body cop |
| typography | Lines 152-153 — criterion label and weight | P2 | ✓ | Form-row body text must be text-sm (14px); text-base deviates from the body role. |
| typography | Line 183 — evaluation list item | P2 | ✓ | List-item body text must be text-sm (14px); text-base oversizes it. |
| input | Line 74 — volume number input | P2 | ✓ | Input deviates from the design-system .input vocabulary: it uses rounded-md (should be rounded-lg), border-line (should  |
| input | Line 141 — agent select | P2 | ✓ | Select deviates from the .input standard (rounded-md, border-line, bg-surface, text-base, custom brand ring). Align radi |
| input | Lines 155-159 — per-criterion score select | P2 | ✓ | Select deviates from the .input standard (rounded-md, border-line, bg-surface, text-base, custom focus ring). Standardiz |
| theming | Lines 106-107 — adherence bar/text colors | P3 | manuel | Hard-coded raw Tailwind color scales (green/amber/red-500/600) bypass the design token system. The file already expresse |

## src/features/support/SupportPage.tsx  (3)

SupportPage.tsx is technically excellent: semantic buttons throughout, a proper role=tablist/tab pattern with roaming tabindex, ArrowLeft/Right/Home/End keyboard nav, focus-visible:ring-2 ring-brand rings, aria-labels, and motion-reduce guards. Theming is fully tokenized (brand/ink/muted/surface-2, ease var) with no hard-coded hex or random grays. Responsive layout is structural (isMobile single-pane vs lg/xl grid templates, overflow-x-auto on the switcher) with no fluid fonts. No antipattern tells — no gradient text, eyebrows, side-stripe borders, or glassmorphism. The only findings are typographic scale deviations: the h1 uses text-2xl font-bold (should be text-xl font-semibold per the fixed scale), and two supporting elements (subtitle, mobile back button) use text-base where text-sm is the correct role. All three are safe localized className swaps.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 157 — h1 page title | P1 | ✓ | h1 page title role is text-xl (20px) font-semibold per the fixed scale. text-2xl is reserved for the rare landing hero,  |
| typography | Line 158 — page subtitle | P2 | ✓ | A subtitle under the page title is helper/secondary text, whose role is text-sm text-muted (14px). text-base (16px) is t |
| typography | Line 135 — mobile back button | P2 | ✓ | A button/label's role is text-sm (14px) font-medium. text-base oversizes the control relative to the tab switcher (text- |

## src/features/tasks/KanbanBoard.tsx  (10)

This is a Flowbite kanban template ported to React Query CRUD. It is functionally solid and free of the loudest AI tells (no gradient text, no eyebrows, no side-stripe accent borders, no glassmorphism), so the antipattern score holds up. The real problems are: (1) Responsive — fixed min-w-[28rem] columns and a w-96 search input force horizontal overflow on mobile (P1). (2) A11y — text-gray-400 numeric counters/badges on white fall below 4.5:1 contrast (P1), plus inert action/method attrs on divs and a label used as a heading. (3) Theming — the whole file uses raw Tailwind grays and bg-white instead of the ink/line/muted/surface tokens. (4) Typography — off-scale text-lg modal titles and an inflated text-base card title that should be text-sm; column counters should be text-xs meta; and two title inputs use a different focus color (primary-600) than every other input (primary-500). Most are localized className swaps; the responsive column widths and token migration need structural edits.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Lines 796, 841 — modal titles: <h3 className="text-lg font-s | P2 | ✓ | text-lg (18px) is off the fixed product scale. A dialog/section title maps to h2 = text-base (16px) font-semibold. Off-s |
| typography | Line 746 — card title: <div className="text-base font-semibo | P2 | ✓ | A kanban card title is an h3 card/sub role = text-sm (14px) font-semibold. text-base inflates the card heading above the |
| typography | Line 724 — column count: <span className="ml-2 text-sm font- | P3 | ✓ | This is a counter/meta element; the scale role is caption/meta = text-xs text-muted, not text-sm. (Also see a11y finding |
| a11y | Line 724 column counter + lines 353, 363, 373, 384 dropdown  | P1 | ✓ | gray-400 (#9ca3af) on white is ~2.5:1, below WCAG AA 4.5:1 for this small numeric text. These counts are real informatio |
| responsive | Lines 720 & 728 — kanban columns: className="min-w-[28rem]"  | P1 | manuel | A hard 28rem (448px) minimum per column forces horizontal overflow on any phone (<448px viewport). Three columns side-by |
| responsive | Line 298 — search input: className="block w-96 ..." | P2 | ✓ | w-96 (384px) is a fixed width that overflows narrow viewports. Use w-full with a max-width so the search field shrinks o |
| input | Lines 808 & 861 (title inputs) use focus:border-primary-600  | P3 | ✓ | Same input role has two different focus colors (primary-600 vs primary-500) across the file. Standardize the focus ring/ |
| a11y | Lines 309 & 395 — dropdown containers rendered as <div actio | P3 | ✓ | action and method are not valid attributes on a div (React will warn / they are inert). If a submit semantic is intended |
| a11y | Line 473 — filter 'Category' heading uses a <label> with no  | P3 | ✓ | A <label> with no htmlFor/wrapped input is not a label; sibling section titles in the same dropdown correctly use <h6>.  |
| theming | Throughout (e.g. lines 259, 290, 722, 731, 744, 757, 761) —  | P2 | manuel | The file is built entirely on raw Tailwind palette grays (gray-200/300/400/500/700/800) and bg-white rather than the bra |

## src/features/users/UsersPage.tsx  (2)

UsersPage.tsx is a clean, well-built file that largely adheres to the product design system: it uses the shared .input and .label classes (so no input-vocabulary deviations), design tokens throughout (surface/ink/line/muted/brand/danger), full borders (border border-line, divide-line) with zero side-stripe accents, semantic HTML (table with scope, button elements, role=tablist/tab, aria-labels and titles on icon buttons), and proper focus-visible rings. Type scale is honored almost everywhere (text-sm body, text-xs meta/captions, font-medium/semibold roles). Only two real findings: a below-floor arbitrary text-[11px] on the mobile role badge that also disagrees with its desktop text-xs counterpart, and an uppercase table header (eyebrow tell). No gradient text, no glassmorphism, no oversized type, no hero-metric template. Responsive handling is exemplary with a distinct desktop table vs mobile card layout. Both findings are localized className swaps and safely auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Mobile role badge, line 282 | P2 | ✓ | Arbitrary text-[11px] is below the 12px floor and an off-scale value. The desktop badge (line 238) correctly uses text-x |
| antipattern | Desktop table header, line 209 | P2 | ✓ | The uppercase column headers are an eyebrow-style AI tell. The banned 'small uppercase label' pattern; drop uppercase. K |

## src/features/webinar/components/AnalyticsTab.tsx  (3)

Clean, well-structured file using design tokens (text-ink, text-muted) throughout with no hard-coded hex, no gradient text, no side-stripe borders, and no eyebrows. Responsive grid (grid-cols-2 sm:grid-cols-4, lg:grid-cols-2) is structural and sound. The h3 headings correctly use text-base font-semibold text-ink per the h2/section role. The only real issue is systematic use of text-base (16px) for body content — list rows, the definition list, and the helper note — where the product body role is text-sm (14px); these should drop to text-sm. a11y scored 3 because the data rows rely on text-muted for values/counters which is acceptable but the secondary note at body size is the only minor concern; no interactive elements here so labels/focus are N/A. No P0/P1 issues; all findings are localized className swaps."

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Sources list <li> (line 40) | P2 | ✓ | Body / list-row content is text-base (16px). The product body role is text-sm (14px). Data rows should use the body scal |
| typography | Engagement <dl> (line 49) | P2 | ✓ | Definition-list body data is text-base (16px) where body role is text-sm (14px). Same role styled oversized. |
| typography | intentNote paragraph (line 53) | P2 | ✓ | Helper/secondary text is text-base; helper role should be text-sm text-muted. Oversized for a secondary note. |

## src/features/webinar/components/Backstage.tsx  (4)

Backstage.tsx is a small, clean two-card grid that is largely compliant: it uses design tokens (text-ink, text-muted, border-line, Badge tones), semantic html (ul/li, h3, Button components with leftIcon), a responsive lg:grid-cols-2 layout, and has no banned anti-patterns (no gradient text, no side-stripe borders, no eyebrows, no glassmorphism). The findings are typography-scale slips: body/list content (panelist rows, line 29) and helper text (broadcast hint, line 40) use text-base (16px, the h2 section role) instead of text-sm (14px); the <h3> card titles are styled at text-base which is the h2 role rather than the h3 text-sm role (semantic level vs type role mismatch); and button icons use arbitrary h-[18px] sizing that is off-scale and inconsistent with the h-5 w-5 list icon. No P0/P1 issues. a11y scored 3 because interactive elements rely on icon-only Button leftIcons but carry text labels, and contrast is fine; the minor deduction is the unverified relationship between the text-muted hint and its heading. All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 29: <li className="flex items-center gap-2 rounded-md b | P2 | ✓ | Panelist rows are list/body content. text-base (16px) is the h2 section role; body text must be text-sm (14px). Oversizi |
| typography | Line 40: <p className="mb-3 text-base text-muted">{t("broadc | P2 | ✓ | This is helper/secondary text under a heading. Helper text role is text-sm text-muted; text-base (16px) is reserved for  |
| typography | Lines 26 & 39: <h3 className="mb-2 text-base font-semibold t | P3 | ✓ | These are <h3> card titles but styled at text-base (16px), the h2 section role. The h3 card/sub role is text-sm font-sem |
| theming | Lines 42 & 48: leftIcon={<Icon name="broadcast" className="h | P3 | ✓ | Arbitrary pixel icon sizing (h-[18px]) bypasses the spacing scale and is inconsistent with the h-5 w-5 (20px) icon used  |

## src/features/webinar/components/CapacityPanel.tsx  (3)

CapacityPanel is structurally clean: design tokens throughout (text-ink, text-muted, border-line, Badge tones), no gradient text, no eyebrows, no side-stripe borders, semantic HTML (h3/h4, ul/li), and IconButtons carry accessible labels via the label prop. Inputs are absent so the input vocabulary does not apply. The one recurring issue is the type scale: body/data content (the capacity and waitlist chips, the pending list rows) and the pending sub-heading are set at text-base (16px), which the product reserves for h2 section headings — they should be text-sm (14px). The h4 pending label additionally uses font-medium where the sub-heading role calls for font-semibold. All findings are localized className swaps and auto-fixable. a11y scored 3 because the chip-level approve/reject IconButtons may fall below the 44px touch target depending on the shared component's default sizing, but labels and contrast are otherwise sound.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 29, 35, 40 — capacity/waitlist chips | P2 | ✓ | These chips render body/data content (counts like used/limit). Per the fixed type scale body is text-sm (14px); text-bas |
| typography | Line 52 — pending heading h4 | P2 | ✓ | This is an h3/card-sub role under the h2 title. The scale puts sub-headings at text-sm font-semibold; here it is text-ba |
| typography | Line 55 — pending list item | P2 | ✓ | List-item body content (registrant name) should be text-sm per the scale; text-base (16px) is the h2 section size and re |

## src/features/webinar/components/CaptionsLayer.tsx  (4)

CaptionsLayer is a compact dark caption bar over a webinar video surface; the slate-900/slate-700 dark palette is contextually appropriate (overlay on video) rather than a theming violation, and there are no AI-slop tells (no gradient text, eyebrows, side-stripe borders, or glassmorphism). The main issues are typographic and a11y: both the toggle label (line 31) and the running caption (line 38) use text-base, which overweights what should be control text (text-sm font-medium) and a caption/running stream (text-sm); the toggle has correct aria-pressed and a visible label but lacks any visible focus ring; and px-2 py-1 yields a sub-44px touch target on an overlay likely used on touch devices. The aria-live=\"polite\" on the caption span is a good touch. Fixes are localized className swaps. Theming uses tokens (border-brand, text-brand) plus context-justified slate dark colors; text-white on slate-900 passes contrast.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 38: caption text span | P2 | ✓ | Live caption text is a transient meta/secondary stream, not body copy. text-base (16px) overweights it against the small |
| typography | line 31: toggle button className | P2 | ✓ | Button label should be the standard control register text-sm font-medium, not text-base. text-base on a compact px-2 py- |
| a11y | line 27-36: toggle button has no accessible name beyond tran | P1 | ✓ | The button has aria-pressed (good) and a visible text label (good), but no visible focus indicator. Keyboard users get n |
| a11y | line 27-36: toggle button touch target | P2 | ✓ | px-2 py-1 produces a control well under the 44px touch-target guideline; on a webinar overlay used on tablets/phones thi |

## src/features/webinar/components/Card.tsx  (1)

Small, clean utility file. Borders use border-line, backgrounds use bg-surface, and text colors use ink/muted tokens correctly, so theming, responsiveness, and a11y are solid. The only real finding is the StatCard value at text-2xl font-bold: text-2xl breaches the ceiling reserved for the landing hero and font-bold deviates from the product's font-semibold heading weight. Reduce to text-xl font-semibold to align with the h1/metric role. The caption uses text-xs text-muted correctly (no eyebrow, no uppercase/tracking).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | StatCard value, line 16: <div className="text-2xl font-bold  | P2 | ✓ | text-2xl is reserved for the rare landing hero; a stat value is an h1-equivalent metric and should use text-xl. font-bol |

## src/features/webinar/components/CtaBanner.tsx  (2)

Small, clean CTA banner that is structurally sound: a single flex-wrap row (responsive on mobile, no fixed px widths), the shared Button component (semantic <button>, real focus handling), decorative h-4 w-4 icons, and a full 1px border-brand (no banned side-stripe). Typography is on-scale: text-base font-medium for the title and text-sm via the Button component. The only real issues are theming: the dark background is hard-coded as bg-slate-900 instead of a token (bg-ink), and the title uses raw text-white instead of a token. No AI-slop tells (no gradient text, eyebrows, glassmorphism, or hero-metric template). White-on-slate-900 contrast is well above WCAG AA.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| theming | Line 12: <div className="flex flex-wrap items-center gap-2 r | P2 | ✓ | The banner background is hard-coded to a raw Tailwind palette color (slate-900) instead of a design token. The product m |
| theming | Line 13: <span className="text-base font-medium text-white"> | P3 | ✓ | The title color is the raw hard-coded value text-white rather than a token. On a tokenized dark surface the inverse/fore |

## src/features/webinar/components/EventBuilder.tsx  (6)

EventBuilder.tsx is clean on theming (consistent use of design tokens: text-ink, text-muted, border-line, border-brand, bg-surface-2; no hard-coded hex except the legitimate dynamic style binding for the user's branding accent color) and free of AI-slop antipatterns (no gradient text, no eyebrows, no side-stripe borders, no glassmorphism). The main issues are typographic scale inflation: body content, field values, list rows, and toggle buttons all use text-base (16px) or text-lg (18px) where the fixed product scale mandates text-sm (14px) for body/label/button roles, reserving text-base for h2 section headings only. The most serious technical issue is accessibility: the mode toggle buttons (correctly using aria-pressed) have no visible focus indicator, breaking keyboard navigation (WCAG 2.4.7), and their py-1 height falls short of the 44px touch target. No P0 blockers.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 30: <dd className="flex items-center gap-2 text-lg font | P2 | ✓ | text-lg (18px) is not a defined role in the type scale. This is a value/field display inside a details list; per the sca |
| typography | line 27: <dl className="space-y-3 text-base"> | P2 | ✓ | This dl is body content (labels + values). Body role is text-sm (14px); text-base (16px) is reserved exclusively for h2  |
| typography | line 44: className=clsx("rounded-md border px-3 py-1 text-ba | P2 | ✓ | Mode toggle buttons use text-base (16px). Button/label role is text-sm (14px) font-medium. Reduce to text-sm and add fon |
| typography | line 71: <li ... className="... px-3 py-2 text-base"> | P2 | ✓ | Session list rows are body content; body role is text-sm (14px), not text-base (16px) which is the h2 section role only. |
| a11y | lines 39-50: mode toggle <button> has no focus-visible style | P1 | ✓ | Interactive toggle buttons have no visible focus indicator, failing WCAG 2.4.7 focus visibility for keyboard users. |
| a11y | lines 39-50: mode toggle buttons px-3 py-1 | P2 | ✓ | py-1 with text yields ~28px tall touch targets, below the 44px minimum for touch. Increase vertical padding / min-height |

## src/features/webinar/components/EventConsole.tsx  (2)

A small, well-built tabs component. Accessibility is excellent: proper role=\"tablist\"/role=\"tab\", aria-selected, roving tabIndex, full Arrow/Home/End keyboard navigation with focus management, real <button> elements, 44px (h-11) touch targets, and a visible focus-visible ring. Responsive is solid (flex-wrap, no fixed widths). The active-tab underline uses border-b-2 border-brand, which is the idiomatic accessible tab indicator (not a banned card/callout side-stripe), so it is left as-is. Two real findings: tab labels use text-base (h2 role, oversized) with no weight and should be text-sm font-medium per the interactive-label scale; and the icons use arbitrary h-[18px] w-[18px] instead of the h-4 w-4 scale value. Theming otherwise uses tokens well (border-line, text-brand, text-muted, text-ink).

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Tab button className (line 54): "...px-3 text-base focus-vis | P2 | ✓ | Tab labels are interactive labels/buttons. Per the type scale, button/label text is text-sm font-medium. text-base (16px |
| theming | Icon size inside tab button (line 58): className="h-[18px] w | P3 | ✓ | Arbitrary px icon dimensions (18px) bypass the spacing scale. With a text-sm label, the standard icon size is h-4 w-4 (1 |

## src/features/webinar/components/EventLive.tsx  (3)

Small, well-structured composition file with a clean responsive grid (lg:grid-cols-3) and no border or antipattern issues. Main issues: the live event title uses off-scale text-lg (should be text-xl) and is a non-semantic <span> instead of an <h1>; the root surface uses hard-coded bg-slate-950 rather than a theme surface token. No banned tells (no gradients, eyebrows, side-stripe borders). Inputs/borders not applicable here.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 22 — event title | P2 | ✓ | text-lg (18px) is off the fixed type scale (jumps base-16 to xl-20). The live event title is the h1 page title for this  |
| a11y | Line 22 — event title element | P2 | ✓ | The primary title of the live view is rendered as a <span>, providing no document heading structure for screen readers.  |
| theming | Line 20 — root container | P3 | manuel | bg-slate-950 is a hard-coded Tailwind palette value instead of a design surface token. The dark stage background should  |

## src/features/webinar/components/EventManager.tsx  (9)

Solid, token-driven component: design tokens (ink/line/muted/brand/surface) are used consistently, all inputs carry aria-labels, interactive elements are real Button/IconButton components with visible focus rings, and the layout is responsive (grid lg:grid-cols-2, overflow-x-auto on the table, flex-wrap toolbars). Main issues are typographic: the file ignores the fixed product scale by using text-base (16px) for body/table/list/input text (should be text-sm), text-lg (18px) for h2 section titles (should be text-base), and text-base for an h3 day heading. One banned anti-pattern: the badge preview uses a colored left-stripe accent (border-l-4 + inline borderLeftColor), which should become a full border with a tint or a leading swatch. Minor inconsistencies: font-bold on the badge name vs font-semibold elsewhere, and inputs deviating from the .input vocabulary (text-base, rounded-md, bg-surface, px-2). No contrast, focus, or semantic-HTML problems found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| border | Badge preview wrapper, line 169 | P1 | manuel | Colored left-stripe accent (border-l-4 + borderLeftColor) on a card is a banned side-stripe decoration. Use a full 1px b |
| typography | inputCls constant, line 17 | P2 | ✓ | Inputs use text-base (16px); body/input text must be text-sm (14px) per the fixed scale. Also rounded-md should be round |
| typography | h2 section titles, lines 51, 119, 166 | P2 | ✓ | h2 section headings use text-lg (18px), which is not on the scale; h2 must be text-base (16px) font-semibold. Applies to |
| typography | Ticket table, line 59 and table cells lines 62-80 | P2 | ✓ | Table body/header text uses text-base (16px); body text must be text-sm (14px) per the fixed product scale. |
| typography | Agenda list items, line 131 | P2 | ✓ | List body text uses text-base (16px); body must be text-sm (14px) per scale. |
| typography | Day sub-heading, line 128 | P3 | ✓ | h3 card/sub-headings must be text-sm (14px) font-semibold; this uses text-base (16px), the h2 size, flattening hierarchy |
| typography | Badge preview name field, line 172 | P3 | ✓ | font-bold is inconsistent with the rest of the file, which standardizes headings on font-semibold; the secondary fields  |
| typography | Badge preview caption + legend + checkbox labels, lines 170, | P3 | ✓ | The preview caption is meta text and should be text-xs text-muted; the legend (line 179) and checkbox labels (line 182)  |
| input | Inputs/select using inputCls, lines 96-101, 144-148, 97 | P3 | ✓ | Inputs deviate from the standard .input (bg-surface-2, text-sm, rounded-lg, p-2.5). They are at least consistent and hav |

## src/features/webinar/components/PollOverlay.tsx  (5)

A compact dark poll overlay. Structure, semantics (real button, aria-pressed, aria-hidden on the fill bar), and responsiveness are solid, with no AI-slop antipatterns (no gradient text, eyebrows, or side-stripe borders). The main problems are typographic: nearly everything uses text-base (16px), collapsing the hierarchy — the poll question should be text-sm font-semibold (h3), options text-sm body, and the vote counter text-xs meta. Theming is the weak spot: a raw slate-300/400/600/700/900 palette is hard-coded instead of design tokens (the existing border-brand shows tokens are available). One borderline contrast issue: slate-300 percentage text over the slate-700 progress fill is below 4.5:1.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 27: poll question | P2 | ✓ | The poll question is a card/sub heading (h3 role). Per the scale, h3 card/sub is text-sm font-semibold, not text-base fo |
| typography | line 38: option button label text size | P2 | ✓ | Option rows are body/interactive content, which is text-sm (14px) in the scale. text-base (16px) oversizes list options  |
| typography | line 53: vote counter / meta | P2 | ✓ | Vote count is caption/meta and must be text-xs (12px), not text-base (16px). A 16px meta line is well outside the scale  |
| theming | lines 18,39,42,46,53: hard-coded slate palette | P2 | manuel | The product theming system uses brand/ink/line/muted/surface tokens. This overlay hard-codes a parallel slate scale, so  |
| a11y | line 46: percentage text contrast vs progress fill | P2 | ✓ | The pct label overlaps the bg-slate-700 fill bar. slate-300 (#cbd5e1) on slate-700 (#334155) is roughly 4:1, below the 4 |

## src/features/webinar/components/QnaBoard.tsx  (7)

QnaBoard is a dark-themed Q&A panel that is functionally clean (semantic button elements, aria-label/aria-pressed/role=feed present, no AI-slop tells like gradients or side-stripes) but fails the product scale and token discipline. Body and meta text use text-base (16px) where body=text-sm and meta=text-xs, oversizing list content and the action row. The input deviates from the .input standard (rounded-md, px-2, text-base) and uses outline-none with NO focus ring — a WCAG focus-visible failure (P1). The component is built entirely on hard-coded slate/green/white values instead of the brand/ink/line/muted/surface tokens (theming=1). Touch targets on the inline action buttons (py-0.5) are below 44px, and icons use arbitrary 18px sizing. No antipattern tells found.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | line 50: <div className="text-base text-white">{q.text}</div | P2 | ✓ | Q&A item body text is body role; body is text-sm (14px). text-base (16px) oversizes list body content and breaks the fix |
| typography | line 51: meta row text-base text-slate-400 | P2 | ✓ | This is a meta/action row (status, upvote counter, moderation action). Meta/caption role is text-xs (12px). text-base is |
| input | line 39: input className | P1 | ✓ | Input deviates from the .input standard: text-base instead of text-sm, rounded-md instead of rounded-lg, px-2 instead of |
| a11y | line 39: input outline-none with no focus replacement | P1 | ✓ | outline-none removes the default focus ring without providing any visible focus state, a WCAG 2.4.7 (Focus Visible) fail |
| theming | lines 28,39,49,52,54,63: hard-coded slate/green/white | P2 | manuel | Entire component is built on hard-coded slate-/green-/white values rather than the brand/ink/line/muted/surface token sy |
| a11y | lines 54,58: action buttons py-0.5 touch target | P3 | ✓ | py-0.5 on the markAnswered and upvote buttons yields a control well under the 44px minimum touch target, hard to tap on  |
| typography | line 30,42: arbitrary icon sizes h-[18px] w-[18px] | P3 | ✓ | Arbitrary px icon sizing (18px) bypasses the spacing scale; use the standard 4/5 (16/20px) sizes for consistency. |

## src/features/webinar/components/RegistrationBuilder.tsx  (7)

RegistrationBuilder uses design tokens cleanly (ink, line, surface, brand, muted, danger — no hard-coded hex), semantic HTML (real label/button/select/input, IconButton with aria label), and is structurally responsive (lg:grid-cols-2, flex-wrap, 44px-tall controls). No anti-patterns: no gradient text, no eyebrows, no side-stripe borders, no glassmorphism. The main issue is typography: text-base (16px, the reserved h2 size) is used everywhere for body, labels, list rows, inputs, and error text, when the fixed scale calls for text-sm (14px) for all of these — this flattens hierarchy and oversizes the forms. Inputs also diverge from the design-system input standard (bg-surface vs bg-surface-2, border-line vs border-gray-300, rounded-md vs rounded-lg, px-2 vs p-2.5) and would be better expressed via the shared .input class. The most defensible a11y issue: the field-type <select> on line 71 has no focus ring, so its keyboard focus state is invisible.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | inputCls (line 43), select (line 71) | P2 | ✓ | Form inputs/selects must use body size text-sm (14px) per the fixed type scale. text-base (16px) is reserved for h2 sect |
| typography | Field label wrappers (lines 65, 69, 75) | P2 | ✓ | Form field labels are the label role = text-sm font-medium. text-base (16px) is the h2 section size and overstates label |
| typography | Preview field label span (line 89) and list item (line 54) | P2 | ✓ | Body/label text must map to text-sm (14px). Using text-base (16px) for every label and list row breaks the scale and fla |
| typography | Error message span (line 108) | P2 | ✓ | Inline validation/helper text should be helper size (text-sm), not text-base (16px, the h2 size). Also currently sits in |
| input | inputCls (line 43) | P2 | ✓ | Deviates from the design-system input standard: should be bg-surface-2/gray-50 (not bg-surface), border-gray-300, rounde |
| input | select (line 71) | P2 | ✓ | The field-type select is styled inline and diverges from inputCls and the input standard (border-line vs border-gray-300 |
| input | select / input controls (lines 71, 93, 102) | P1 | ✓ | The field-type select on line 71 has NO focus ring at all (uses outline-none context indirectly via missing styles), so  |

## src/features/webinar/components/StageView.tsx  (4)

A small dark broadcast stage view. Structure, borders (1px full borders only), and inputs are clean, and there are no AI-slop tells (no gradient text, eyebrows, or side-stripe borders). The hard-coded slate-* palette is defensible here as a deliberate dark video-surface theme, though brand tokens for the dark surface would improve consistency. The real issues are typographic: three places use text-base (16px, the h2 role) for content that should be meta/counter (text-xs) or body subtitle (text-sm) per the fixed scale. One minor a11y gap: the attendee counter pairs a decorative icon with a bare number and no accessible label.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Attendee counter, line 33: <span className="ml-auto inline-f | P2 | ✓ | This is a meta/counter (attendee count with icon in the header bar). Per the scale, caption/meta/counter is text-xs (12p |
| typography | Session subtitle, line 43: <div className="text-base text-sl | P2 | ✓ | This is the secondary/body line under the event title (h1). Body text is text-sm (14px); text-base (16px) is reserved fo |
| typography | Timeline time labels, line 50: <div className="mt-1 flex jus | P2 | ✓ | Elapsed/total timecodes are meta/counter content. Per scale these are text-xs (12px). text-base (16px) is oversized for  |
| a11y | Attendee counter, line 33-34: icon + number with no accessib | P3 | manuel | The number is presented with a decorative icon but no label, so a screen reader announces a bare number with no context. |

## src/features/webinar/WebinarPage.tsx  (4)

Structurally and technically this file is clean: proper tablist semantics (role=\"tablist\"/role=\"tab\"/aria-selected, aria-label), real <button> elements, 44px touch targets (h-11), flex-wrap responsive header with no fixed widths, and consistent design tokens (brand/ink/line/muted/surface) with no hard-coded hex or arbitrary grays. No gradient text, eyebrows, side-stripe borders, or glassmorphism. The only issues are typographic scale violations: the h1 uses text-3xl font-bold (over the text-2xl ceiling and wrong weight; should be text-xl font-semibold), the subtitle uses text-base where helper text should be text-sm, and both tab buttons use text-base instead of the button/label role text-sm font-medium. The arbitrary h-[18px] w-[18px] on icons is acceptable (icon sizing, not text). All findings are localized className swaps and auto-fixable.

| Kategori | Konum | Önem | Auto | Neden |
|---|---|---|---|---|
| typography | Line 38: h1 page title | P1 | ✓ | text-3xl (30px) exceeds the text-2xl ceiling and the h1 role is text-xl font-semibold. font-bold also deviates from the  |
| typography | Line 39: subtitle paragraph | P2 | ✓ | Helper/secondary text role is text-sm text-muted; text-base (16px) is reserved for h2 section headings, oversizing this  |
| typography | Line 46: console tab button label | P2 | ✓ | Button/label role is text-sm font-medium. text-base oversizes the control text and omits the medium weight expected on i |
| typography | Line 54: live preview tab button label | P2 | ✓ | Button/label role is text-sm font-medium; text-base oversizes the control and the medium weight is missing on this inter |
