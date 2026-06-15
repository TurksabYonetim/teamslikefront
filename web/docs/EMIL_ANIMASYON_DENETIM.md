# emil-design-eng Animasyon Denetim Raporu

Tarih: 2026-06-15 · 91 dosya tarandı · 79 dosyada bulgu · 230 bulgu


## src/components/CommandPalette.tsx  (2)

The CommandPalette is mostly compliant with the project animation system: it correctly uses motion-safe guards, the tl-modal-in keyframe with origin-top and the --dur-modal/--ease-out tokens for the panel, and transition-colors (not transition-all) on list items. Two findings: (1) the backdrop animates with tl-fade-in (the list-stagger keyframe) instead of the dedicated tl-fade backdrop opacity keyframe and uses a raw 140ms instead of a duration token; (2) the result menu items are pressable but lack any :active press feedback, unlike the compliant Button primitive. The keyboard-open flow is correctly instant/animation-light, so no keyboard finding applies.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L77 | open | low | ✓ | The backdrop should use the dedicated tl-fade opacity keyframe (and the --dur-modal token to match its panel) rather than tl-fade-in, which is the list-stagger entrance keyframe meant for list items, not overlays. |
| 2 | L119 (menu item button className) | click | medium | ✓ | A clickable menu item is a pressable element and should give tactile :active press feedback (subtle scale) to feel responsive, matching the compliant Button primitive's active:scale-[0.97]. |

## src/components/LanguageSwitcher.tsx  (1)

LanguageSwitcher renders a small TR/EN segmented control. The buttons use transition-colors (good for hover) but have no :active press feedback, deviating from the project's compliant Button primitive (active:scale-[0.97], --ease-out). Adding a motion-safe-guarded active scale and the project's --ease-out curve brings them in line. No other animation deviations: no transition-all, no bad easing, no oversized durations, and there is no popover/modal/keyboard surface in this file.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L22-L27 | click | medium | ✓ | These pressable segmented-control buttons give no tactile press feedback, unlike the project's compliant Button primitive which uses active:scale-[0.97] with the --ease-out curve, so taps feel dead. |

## src/components/layout/AppShell.tsx  (3)

AppShell renders a mobile slide-in Sidebar drawer plus its backdrop. The drawer uses transition-transform with duration-200 ease-out (correctly scoped to transform, not transition-all), but has two real issues: the transform lacks a motion-safe guard for prefers-reduced-motion, and it uses the generic built-in ease-out instead of the project's --ease-drawer token designed for slide-from-edge motion. The backdrop has no transition at all, so it hard-cuts in/out while the drawer animates — the existing tl-fade keyframe should fade it in sync. Hardcoded duration-200 should map to the --dur-modal token. The CommandPalette (keyboard-triggered) and ActiveCallBar are delegated to their own components, so no keyboard-animation findings apply here.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L57 | transition | medium | ✓ | A drawer that translates needs a motion-safe guard so it does not move under prefers-reduced-motion, and the project's --ease-drawer curve is the designed token for slide-from-edge motion instead of the generic built-in ease-out. |
| 2 | L47-L52 (backdrop div) | open | medium | ✓ | The backdrop pops in instantly while the drawer slides over 200ms, so fading it via the existing tl-fade keyframe makes the two surfaces animate together instead of a jarring hard cut. |
| 3 | L57 (duration-200 on drawer slide) | open | low | ✓ | Hardcoded duration-200 should map to the project's --dur-modal (240ms) drawer token so timing stays consistent with the established animation system rather than an arbitrary value. |

## src/components/layout/Sidebar.tsx  (6)

Sidebar.tsx is mostly compliant: it correctly uses active:scale feedback on pressables, scopes transitions to explicit properties (no transition-all), and uses sensible 150-200ms durations and the ease-drawer token on the collapse width animation. The findings are consistency deviations from the established system rather than broken motion: several transitions use the built-in ease-out and hardcoded duration-150/200 instead of the project's custom ease-[var(--ease-out)] curve and --dur-press/--dur-pop tokens (L50, L68, L117, L121, accordion L128/L136). The chevron rotate and accordion height/opacity reveal are real transforms that should also carry a motion-safe: guard. The one genuine UX gap is the logout icon (L207), which is the only nav icon lacking a transition-colors, so its hover color snaps instantly while every sibling eases. All findings are localized className swaps and safely auto-fixable.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L50 | transition | low | ✓ | The project defines a custom --ease-out curve and --dur-press token; the built-in ease-out and hardcoded duration-150 deviate from the system source of truth. |
| 2 | L68 | transition | low | ✓ | Built-in ease-out and hardcoded duration-150 should map to the project's custom --ease-out curve and --dur-press token for a consistent feel. |
| 3 | L117 | transition | low | ✓ | Same deviation as the leaf icon: use the system's custom curve and duration token instead of built-in ease-out and a raw 150ms value. |
| 4 | L121 | transition | low | ✓ | The chevron rotation is a meaningful transform that should use the custom --ease-out curve and --dur-pop token, and be motion-safe guarded since it moves an element. |
| 5 | L128 / L136 (Group accordion) | open | medium | ✓ | The accordion grid-rows reveal is real motion that should ride the project's --ease-out curve and --dur-pop token and be motion-safe guarded since the row height physically moves. |
| 6 | L207 | transition | medium | ✓ | Unlike every other nav icon, the logout icon color snaps instantly on hover with no transition, making it feel inconsistent and jarring next to its animated siblings. |

## src/components/ui/Button.tsx  (1)

Button.tsx is essentially a compliant animation primitive: it correctly uses transition-transform (not transition-all), the custom var(--ease-out) curve, a press duration matching --dur-press, and active:scale-[0.97] for tactile click feedback. The only nit is that the 140ms duration is hardcoded as duration-[140ms] rather than referencing the --dur-press token, which risks drift from the source of truth. The press transform is scale-only and stays inside the element, so no motion-safe guard is required.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L42 | click | low | ✓ | Emil: encode timing in named tokens so press feedback stays consistent across the system instead of a magic 140ms literal that can drift from --dur-press. |

## src/components/ui/Dropdown.tsx  (2)

Dropdown.tsx is largely compliant: the popover correctly uses tl-pop-in with --dur-pop, var(--ease-out), origin-aware classes (origin-top-right/left), and a motion-safe guard. No transition-all, no bad easing, no oversized durations, no scale-0 entrances, no keyboard-action animation issues. The only gaps are missing :active press feedback on the two pressable elements: the DropdownItem menu items and the trigger button, both of which should match the Button primitive's active:scale-[0.97] (guarded by motion-safe and using --dur-press / --ease-out). The trigger finding requires wrapping the passed triggerClassName with clsx, which is a localized and safe change.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L66-L73 (DropdownItem button) | click | medium | ✓ | A pressable menu item should give tactile confirmation on press; per Emil, every clickable surface deserves subtle active feedback so the tap feels physical. |
| 2 | L36-L43 (Dropdown trigger button) | click | low | ✓ | The trigger is a bare button with no press feedback, deviating from the compliant Button primitive (active:scale-[0.97]) so the open interaction feels unresponsive. |

## src/components/ui/ErrorBoundary.tsx  (1)

The ErrorBoundary fallback renders a "Tekrar dene" reset button styled as a text link with only hover:underline and no :active press feedback. Per the project's compliant Button primitive (active:scale-[0.97] + transition-transform + --ease-out), this pressable element should gain a motion-safe press response. No other animation issues: the static fallback layout has no transforms, transition-all, or non-token durations, and the entrance is intentionally instant (acceptable for an error state).

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L36-L39 (button onClick={this.handleReset}) | click | low | ✓ | A pressable control should confirm the touch with a subtle scale-down press, matching the compliant Button primitive, so the action feels physical rather than dead. |

## src/components/ui/IconButton.tsx  (1)

IconButton renders a pressable button that correctly scopes its transition to colors, but it lacks the active:scale press feedback used by the compliant Button primitive. Adding motion-safe:active:scale-[0.97] (with transform included in the transition and the project --ease-out curve) makes presses feel tactile and keeps it consistent with the rest of the system. No transition-all, no bad easing, no oversized durations otherwise.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L17 | click | medium | ✓ | A pressable icon-button gives no tactile press feedback; the compliant Button primitive uses active:scale-[0.97] so taps feel physical and responsive (Emil: pressable elements should acknowledge the press). |

## src/components/ui/Modal.tsx  (1)

Modal.tsx is largely compliant: the backdrop uses tl-fade with --ease-out and a motion-safe guard, and the modal container correctly uses tl-modal-in with --dur-modal, --ease-out, origin-center, and a motion-safe guard. No transition-all, no ease-in, no over-300ms durations, no scale-0 entrances, and no hardcoded non-token durations. The only defensible finding is the close icon-button lacking :active press feedback (should match the Button primitive's active:scale-[0.97]).

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L35-L38 (close button) | click | low | ✓ | Every pressable control should confirm the touch with a subtle active scale; the close icon-button currently gives no tactile feedback, matching the compliant Button primitive's active:scale-[0.97]. |

## src/components/ui/ProductTour.tsx  (6)

ProductTour has real animation surface but is largely uncompliant. The spotlight ring uses transition-all (L113) instead of named props + project easing. The popover (L127) and backdrop (L123) appear with no entrance animation, hard-cutting in rather than using the project's tl-pop-in / tl-fade keyframes; the popover is also origin-unaware. All four interactive buttons (close X L133, Skip L147, Back L155, Next/Finish L163) lack the active:scale-[0.97] press feedback the compliant Button primitive establishes. The Back button (L155) shares the identical missing-active-feedback issue and should get the same transition-transform active:scale-[0.97] fix. No duration-300/500 or scale-0 entrances were found, and prefers-reduced-motion is guarded globally, but the component-level transforms/animations above still carry motion-safe: guards as shown.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L113 | transition | medium | ✓ | transition-all is unscoped and animates with the browser default curve; Emil says name the exact properties and use the project's custom easing so the spotlight glides between targets predictably. |
| 2 | L127 (Popover div) | popup | high | ✓ | The tour popover appears instantly with no entrance, which feels jarring; matching the compliant Dropdown primitive's tl-pop-in (scale .96->1) with an origin gives it a calm, intentional entrance. |
| 3 | L123 (backdrop div) | open | medium | ✓ | The dimming backdrop hard-cuts in with no fade; the project's tl-fade keyframe gives the overlay a soft entrance consistent with the Modal primitive. |
| 4 | L133 (close X button) | click | medium | ✓ | Pressable icon buttons need tactile :active feedback; matching the Button primitive's active:scale-[0.97] makes the press feel physical. |
| 5 | L147 (Skip button) | click | low | ✓ | The Skip control is pressable but has no press feedback; adding active:scale-[0.97] aligns it with the compliant Button primitive. |
| 6 | L163 (Next/Finish button) | click | medium | ✓ | The primary tour action lacks any press response; the Button primitive's active:scale-[0.97] gives the most-clicked control the tactile confirmation Emil prizes. |

## src/components/ui/Tabs.tsx  (2)

Tabs.tsx has a real animation surface (selectable/pressable tab buttons). The transition-colors on hover/selected text is compliant. Two findings: (1) the role=\"tab\" buttons are pressable but lack any active:scale press feedback that the project's Button primitive establishes - add motion-safe:active:scale-[0.97] with transition-transform and var(--ease-out); (2) the active-tab underline (border-b-2 border-brand) swaps instantly between tabs while only colors transition, so the selection jump is abrupt - an animated/sliding indicator using transition-transform with --dur-pop would make state changes feel continuous (not auto-fixable, needs a small refactor). No transition-all, no scale-0, no over-long durations, and no keyboard-action animation issues were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L43-L62 (the role="tab" <button>) | click | medium | ✓ | A tab is a pressable control but gives no touch/press feedback; matching the Button primitive's active:scale-[0.97] makes the press feel physical and responsive (Emil: every pressable element should acknowledge the press). |
| 2 | L54 (selected indicator: border-b-2 border-brand) | transition | low | �— manuel | The active underline jumps abruptly between tabs because only transition-colors is set while the border position changes instantly; a transformed sliding indicator makes the selection change feel continuous (Emil: motion should connect states, not cut between them). |

## src/features/admin/AdminPage.tsx  (4)

AdminPage.tsx is largely compliant with the project's animation system: inputs and interactive surfaces use transition-colors + duration-150 + ease-out (no transition-all), the INPUT_CLASS comment explicitly avoids transition:all, the overview stat cards use .tl-stagger, and all action buttons reuse the compliant Button primitive (which already carries active:scale press feedback). Real findings are minor: (1) the clickable audit-log table row that opens a modal has hover/focus states but no :active press feedback (motion-safe guarded); (2) the loaded policy list renders all rows at once and should use .tl-stagger like the overview cards do; (3) the overview chart cards appear with no entrance where a fade/stagger would match the pattern. The strongest, safely-autofixable item is adding .tl-stagger to the policy list.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L320-L330 (audit log <tr>) | click | low | ✓ | This clickable row (opens a detail modal) has hover and focus feedback but no :active press state, so a tap/click gives no tactile confirmation the press registered — Emil treats press feedback as the cheapest way to make an interaction feel responsive. |
| 2 | L264-L272 (Export button) / DownloadIcon usage | general | low | �— manuel | Confirmed compliant: the export/edit/add/clear buttons all use the shared Button primitive which carries active:scale-[0.97] and transition-transform, so no per-button press state is missing here. |
| 3 | L122-L137 (OverviewSection stat cards) & L139-L171 (chart cards) | transition | low | �— manuel | The stat-card grid correctly uses .tl-stagger, but the three chart cards below appear all at once on load with no entrance — an staggered/fade entrance here would match the established list-entrance pattern; minor since they are content-heavy panels, not a list. |
| 4 | L522-L526 (PolicySection policy rows) | transition | medium | ✓ | This is a freshly-loaded list of policy rows that pops in all at once; the project provides .tl-stagger for exactly this staggered list-entrance, and the Overview cards already use it, so applying it here is consistent and makes the load feel intentional. |

## src/features/admin/AuditLogDetail.tsx  (2)

The file is a Modal-based detail view that correctly delegates entrance/exit animation to the compliant Modal primitive. The only direct animation surface is the copy icon-button's hover transition, which is already correct on props (transition-colors) and duration (150ms). Two findings: (1) the copy button is a pressable element with no :active press feedback, and (2) it uses Tailwind's built-in ease-out instead of the project's var(--ease-out) custom curve. The active:scale fix is guarded with motion-safe: since it introduces a transform.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L81-88 | click | medium | ✓ | Per the Button primitive, a pressable icon-button should give immediate tactile press feedback (active:scale-[0.97]) so the click feels acknowledged. |
| 2 | L85 className | transition | low | ✓ | Meaningful UI motion should ride the project's custom --ease-out curve rather than Tailwind's weaker built-in ease-out to stay consistent with the established system. |

## src/features/admin/components/ConfirmAction.tsx  (2)

ConfirmAction has one animation surface: the inline entrance on the reveal panel (L46). It correctly uses --ease-out and a token-equivalent 180ms duration, but two issues stand out. First, it uses the tl-fade-in keyframe (translateY, intended for list stagger) for what is actually an origin-anchored popover-style reveal toggled from a trigger Button; this should use the origin-aware tl-pop-in keyframe plus an origin-top-left class to scale from the trigger. Second, the animation applies a transform with no component-level motion-safe guard, bypassing the global prefers-reduced-motion handling. The duration should also be expressed as var(--dur-pop) instead of the hardcoded 180ms when migrating to a className. The input transition on L7 (transition-colors duration-150 ease-out) and both Button presses are already compliant.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L46 | popup | medium | ✓ | This panel is an origin-anchored popover toggled open from a trigger button, so it should scale up from its origin via tl-pop-in rather than the translateY tl-fade-in keyframe meant for list stagger; the in-place reveal feels grounded only when it grows from where it was summoned. |
| 2 | L46 | transition | medium | ✓ | The entrance transforms (translate/scale) the element but has no component-level motion-safe guard, so it overrides the global prefers-reduced-motion handling and still moves for users who asked for less motion; movement must be opt-in. |

## src/features/admin/components/FederationSettings.tsx  (1)

FederationSettings is almost fully compliant with the project animation system: it uses .tl-stagger for the list entrance, the compliant Button primitive (which carries active:scale + transition-transform), and transition-colors with the duration-150 token on the input. The only deviation is the input's transition easing using Tailwind's built-in ease-out rather than the project token ease-[var(--ease-out)]. No transition-all, no scale-0 entrances, no popovers/dropdowns, no over-long durations, and no keyboard-triggered animations are present.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L8 (INPUT_CLASS) | input | low | ✓ | The input's focus/border transition uses Tailwind's built-in ease-out (cubic-bezier(0,0,0.2,1)) instead of the project's custom --ease-out curve, so the motion feel diverges from the rest of the system. |

## src/features/admin/components/GovAuditLogViewer.tsx  (1)

This file is almost entirely a data-table/filter component with very little animation surface. The only transition present is on the shared INPUT_CLASS focus/color state, which is already well-constructed: it correctly scopes to transition-colors (no transition-all), uses an appropriate 150ms duration, and pairs sensibly with a focus-visible ring. The single defensible finding is that it uses Tailwind's built-in ease-out rather than the project's custom ease-[var(--ease-out)] token, a low-severity consistency deviation. Native form controls (select, range slider, text input) do not require active:scale feedback per the brief, and there are no popovers, modals, dropdowns, or entrance/stagger surfaces here to flag.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L9 (INPUT_CLASS) | transition | low | ✓ | The project defines a custom --ease-out curve as its source of truth; using Tailwind's built-in ease-out on a meaningful UI transition is a weak/default easing that should match the token for consistent feel. |

## src/features/admin/components/GovOverviewDashboard.tsx  (1)

The component is largely compliant: the stagger grid correctly uses .tl-stagger, and the progress-bar transition correctly scopes to transition-[width] with the var(--ease-out) curve (no transition-all, no ease-in, no transform that needs a motion guard). The only deviation is the hardcoded duration-300 on the bar width, which should map to a --dur-* token (--dur-modal/240ms) per the project's animation system.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L46 | transition | low | ✓ | The bar uses a hardcoded duration-300 instead of the project's duration tokens; mapping it to --dur-modal (240ms) keeps quota-fill motion within the system's 150-250ms UI range and consistent with other surfaces. |

## src/features/admin/components/PolicyTester.tsx  (2)

PolicyTester is mostly compliant: both inputs and the label buttons already use transition-colors duration-150 ease-out matching project tokens. Two findings: (1) the four sensitivity-label buttons (L76-90) are pressable but lack any :active press feedback (active:scale-[0.97]) found in the compliant Button primitive; (2) the textarea (L41-46) has no transition on its focus ring while its sibling text inputs (INPUT_CLASS, L19) do, causing an inconsistent instant focus snap. Both are safe, localized className swaps. Note ease-out built-in could optionally be mapped to ease-[var(--ease-out)] for the custom curve, folded into the fixes above.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L82 | click | medium | ✓ | These label-selector buttons are pressable but give no tactile press feedback; Emil's compliant Button primitive uses active:scale-[0.97] so taps feel physically acknowledged. |
| 2 | L45 | transition | low | ✓ | The sibling inputs animate their focus ring with transition-colors but this textarea snaps instantly, an inconsistent and jarring focus transition that should match the established input treatment. |

## src/features/appointments/AppointmentsPage.tsx  (4)

The file is mostly compliant but has real gaps. The surface selector buttons (L112) declare active:scale-[0.98] yet omit transform from their transition list and use no custom ease or motion-safe guard, so the press feedback snaps. The console tab buttons (L133-136) are pressable role=tab elements with no :active feedback and no transition at all, so their active-border/color and hover changes jump instantly — inconsistent with the sibling surface tabs and the compliant Button primitive. Panel/surface swaps (L143-158) hard-cut with no transition. Recommend adding transition-transform + ease-[var(--ease-out)] + motion-safe:active:scale on both tab groups and a keyed tl-fade on the panel content.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L112 | click | medium | ✓ | The element has active:scale-[0.98] but transform is not in the transition list, so the press release snaps back instantly with no spring of the custom ease — the tactile feedback Emil prizes is lost. |
| 2 | L112 | transition | low | ✓ | Meaningful UI motion uses the browser default easing instead of the project's --ease-out curve, so the transition feels generic rather than considered. |
| 3 | L133-L136 | click | medium | ✓ | These pressable tab buttons have no :active feedback and no transition, so the border/color swap and hover change jump instantly — unlike the sibling surface tabs and the compliant Button primitive. |
| 4 | L143-L152 | transition | low | �— manuel | Swapping tab panels (and the surface switch) hard-cuts the content with no transition, which feels jarring; a keyed fade gives the panel change continuity without delaying interaction. |

## src/features/appointments/components/PublicBookingPreview.tsx  (3)

The file has a small animation surface centered on the event-type selection button (L83-99). That button is mostly compliant (scoped transition, duration-150 = --dur-press, active:scale feedback) but has two real issues: its transition list omits `transform`, so the active:scale-[0.99] press snaps with no easing, and it uses Tailwind's default easing instead of the --ease-out token used by the compliant Button primitive. Adding a motion-safe guard on the scale is also warranted. A low-severity opportunity exists to stagger the slot grid (L115-123) via .tl-stagger when slots appear. No transition-all, no scale-0 entrances, no bad origins, and no keyboard-triggered animations were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L87 | click | medium | ✓ | The active:scale-[0.99] press feedback is animated by a transition list that omits transform, so the scale snaps instantly instead of easing like the compliant Button primitive; adding transform (and motion-safe guard) makes the press tactile and respectful of reduced-motion. |
| 2 | L87 | transition | low | ✓ | Meaningful UI motion here uses Tailwind's default easing instead of the project's --ease-out token that every compliant primitive (Button) applies, so the press/color transition lacks the established curve. |
| 3 | L115-123 | open | low | ✓ | The slot list materializes all at once when a type is selected; a staggered entrance via .tl-stagger gives the freshly-generated slots a sense of sequence and life, matching the project's list-entrance convention. |

## src/features/auth/AuthField.tsx  (2)

The input's focus transition (L47) is already compliant: it scopes exact properties (border-color, box-shadow), uses the --ease-out custom curve, and a 140ms press-token duration. The only gaps are on the password reveal toggle button: it is a pressable icon-button with no :active feedback (unlike the Button primitive's active:scale-[0.97]) and its hover text-color change has no transition, so it snaps instantly. Both are localized className swaps. No other animation surface exists in the file.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L59-L68 (reveal toggle button) | click | medium | ✓ | A pressable icon-button should confirm the tap with a subtle active scale (matching the Button primitive) so the show/hide toggle feels responsive rather than dead. |
| 2 | L66 (reveal button hover color) | transition | low | ✓ | The hover color change snaps instantly with no transition; a short color transition with the project ease makes the hover state feel intentional and consistent with the input's focus transition. |

## src/features/auth/AuthShell.tsx  (2)

AuthShell is largely compliant: the left feature list correctly uses .tl-stagger, prefers-reduced-motion is handled on the card, and the nav uses color-only hover (no transform/active concerns). The only issues are around the right card's bespoke inline keyframe: it hardcodes a 280ms duration instead of the --dur-modal token (L38), and the whole tl-auth-card-in keyframe duplicates the existing shared tl-modal-in (scale .95->1) primitive rather than reusing it. Both are low severity polish items; the duration swap is safely auto-fixable, the keyframe consolidation needs a small manual refactor to adopt the shared class.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L38 | open | low | ✓ | Emil: motion durations should come from one shared scale so the app feels cohesive; the hardcoded 280ms should map to the existing --dur-modal (240ms) token rather than inventing a one-off value. |
| 2 | L32-L43 (inline <style> tl-auth-card-in) | open | low | �— manuel | Emil: a card scale/fade entrance is exactly what the existing tl-modal-in keyframe does, so duplicating it inline with a bespoke curve fragments the motion system and risks drift from the canonical primitive. |

## src/features/booking/BookingPage.tsx  (5)

BookingPage's animation surface is the hand-rolled create/edit drawer (L269-381), which is the main deviation from the project system: both the backdrop and the right-side panel mount with no transition at all, when the project already ships tl-fade and tl-drawer-in-end (with --ease-drawer) for precisely this. These are the two high-severity findings. Three pressable icon-buttons (row edit, row delete, drawer close) lack any active:scale press feedback that the compliant Button primitive establishes as the convention. The drawer should also ideally animate its exit, but since it unmounts on a boolean toggle there is no exit transition to tune without a refactor, so only the entrance is flagged. The data tables, tabs, skeletons, EmptyState, ConfirmDialog, and Toast usage all defer to already-compliant shared primitives and need no changes.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L271-275 | open | high | ✓ | The backdrop pops in instantly with no fade; the project's tl-fade keyframe exists precisely to dim backdrops smoothly so the drawer doesn't snap onscreen. |
| 2 | L276 | open | high | ✓ | A right-side drawer that appears with zero transition is jarring; the project already ships tl-drawer-in-end with --ease-drawer for exactly this slide-from-right entrance. |
| 3 | L243-250 (edit icon button) | click | medium | ✓ | This pressable icon button has no active feedback, so taps feel dead; a subtle active:scale-[0.97] gives the tactile press the compliant Button primitive already has. |
| 4 | L251-256 (delete icon button) | click | medium | ✓ | This destructive icon button has no active state; a press scale confirms the tap landed, matching the project's pressable-element convention. |
| 5 | L281-287 (drawer close button) | click | low | ✓ | The drawer's close button is pressable but gives no active feedback; a subtle press scale matches the compliant Button and the other interactive controls. |

## src/features/booking/PublicBookingPage.tsx  (5)

PublicBookingPage has a real animation surface (hover/press states on cards, calendar days, time slots, and step transitions) but is largely uninstrumented against the project's animation tokens. Highest-priority issue is the event-type card using transition-all with an unguarded hover translate and no press feedback (L215). The calendar day cells (L280) and slot buttons (L310) are pressable tap targets that change appearance instantly or with default easing and lack any active:scale feedback. Back buttons (L242/L335) are inert on press. Finally, every step swaps content with no entrance, where the existing .tl-stagger / tl-fade-in helpers would smooth the transition. All findings are localized className swaps mapping to --ease-out, --dur-press, and the existing tl-* helpers.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L215 | transition | high | ✓ | transition-all animates every property (a perf and surprise risk) and defaults the curve/duration away from the project tokens; specifying transform/box-shadow with --ease-out and --dur-press matches the system, and a subtle active:scale gives the press the tactile feedback Emil insists clickable elements need. |
| 2 | L280-297 (calendar day button) | click | medium | ✓ | The day cell is a pressable element whose background color jumps instantly on hover/selection with no transition and no active feedback; adding transition-colors with the project curve and an enabled-only active:scale makes selection feel responsive instead of abrupt. |
| 3 | L310-316 (slot button) | click | medium | ✓ | transition-colors is correct but relies on Tailwind's default easing/duration rather than the project tokens, and this primary tap target advances a step with no press feedback; the --ease-out / --dur-press tokens plus active:scale align it with the compliant Button primitive. |
| 4 | L242-247 / L335-340 (back buttons) | click | low | ✓ | These back triggers are pressable but have no transition on the hover color change and no active state, so they feel inert; the project tokens plus a subtle active:scale give them the same tactile, snappy feel as the other controls. |
| 5 | L207-233 (event-type grid) and step containers L193/239/333/385 | open | low | ✓ | The event-type cards and each step's content swap in instantly with no entrance, reading as a hard cut; applying the existing .tl-stagger helper to the card list (and tl-fade-in/tl-pop-in on step containers) gives the staggered entrance the design system already defines for lists. |

## src/features/canvas/BlockBody.tsx  (5)

The file's two explicit inline transitions are compliant: the progress bar uses transition: width 240ms var(--ease-out) (exact prop, custom curve, within token range) and the checkbox uses background-color/border-color 160ms var(--ease-out) (exact props, ease-out) - neither moves an element, so no motion-safe guard is needed. No transition-all, ease-in, scale-0 entrances, or popover origin issues exist. The real gap is interaction feedback: every BlockBody variant renders as a pressable button (empty-content, default text body, checklist item, table, metric) yet none provide the project's standard active:scale-[0.97] press response defined by the Button primitive. All five findings are low-severity, auto-fixable className additions (using --dur-press + --ease-out, with a gentler 0.99 scale for the large table/checklist-row targets).

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L28-L34 empty-content button | click | low | ✓ | A pressable element needs tactile press feedback; the project's Button primitive standardizes active:scale-[0.97] so taps feel grounded. |
| 2 | L49-L53 default text-body button | click | low | ✓ | This clickable block body opens the editor on press but gives no active feedback, unlike the compliant Button primitive's active:scale-[0.97]. |
| 3 | L91-L100 checklist item button | click | low | ✓ | Toggling a checklist item is a primary tap target and should confirm the press with a subtle active scale per the Button standard. |
| 4 | L144-L147 table button | click | low | ✓ | The whole table is a clickable open-affordance with no press feedback; a subtle active scale grounds the interaction like other Button primitives. |
| 5 | L191-L194 metric button | click | low | ✓ | This metric card opens the editor on click but lacks the active:scale-[0.97] press feedback the project standardizes on pressable elements. |

## src/features/canvas/BlockCard.tsx  (7)

BlockCard's drag-driven card motion is already compliant (explicit transform/box-shadow props, --ease-out, JS-managed transform while dragging, willChange), and the pin button correctly uses active:scale with a motion-reduce guard and tokenized transition. The real gaps are the toolbar icon-buttons: the drag handle and the four action buttons (moveUp, moveDown, edit, delete) plus the clickable title are all pressable but have no :active feedback and their hover color/background changes snap with no transition. Adding subtle active:scale-[0.97/0.98] with motion-reduce guards and tokenized transition-[transform,color,background-color] at ~160ms/var(--ease-out) brings them in line with the compliant Button primitive. The action-group reveal also uses Tailwind's default easing/duration instead of the --ease-out token. All findings are localized className swaps and safe to auto-apply.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L81 | click | low | ✓ | The drag handle's hover color/background change snaps instantly; a short tokenized color transition makes the state change feel intentional rather than jarring. |
| 2 | L116-124 (moveUp button) | click | medium | ✓ | This pressable icon-button has no :active feedback and its hover colors snap; press scale plus a tokenized color transition gives tactile, responsive feedback like the compliant Button primitive. |
| 3 | L125-133 (moveDown button) | click | medium | ✓ | Pressable icon-button lacks :active feedback and instant hover color change; press scale plus tokenized transition matches the established Button feel. |
| 4 | L134-141 (edit button) | click | medium | ✓ | This clickable icon-button gives no press feedback and snaps its hover colors; a subtle active scale and tokenized color transition make it feel responsive. |
| 5 | L142-149 (delete button) | click | medium | ✓ | Pressable destructive icon-button lacks :active feedback and snaps its hover color; press scale plus a tokenized color transition gives consistent tactile feedback. |
| 6 | L153-161 (title button) | click | low | ✓ | The title is a real clickable target that opens the editor but gives zero press feedback; a subtle active scale confirms the tap, per Emil's tactility principle. |
| 7 | L115 | transition | low | ✓ | The action-group reveal uses Tailwind's default duration and built-in easing instead of the project's --ease-out curve, so the fade lacks the system's consistent motion character. |

## src/features/canvas/CanvasPage.tsx  (3)

CanvasPage.tsx is largely animation-compliant: it correctly reuses Button (with active:scale), Modal (tl-modal-in + tl-fade), Toast, var(--ease-out), and guards transforms with motion-reduce. The drag block uses an intentionally untransitioned inline translateY during drag (correct). Three minor findings: the inline type-selector button transition (L406) and the rename icon-button press transition (L267) hardcode 160ms/120ms instead of the --dur-press token, and the type-selector button (L396-411) is a pressable element missing active:scale press feedback. No transition-all, no ease-in-on-enter, no scale-0 entrances, no over-300ms UI motion, and modals/dropdowns are handled by compliant primitives. The block list renders without .tl-stagger but stagger is optional and the list is reorderable, so it was not flagged as a defect.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L406 | click | low | ✓ | This selectable type button uses a hardcoded 160ms instead of the project's --dur-press token, breaking the single source of truth for timing. |
| 2 | L396-411 (type-selector button) | click | medium | ✓ | This pressable type-picker button has no :active feedback; Emil's principle is that every tappable element should acknowledge the press with a subtle scale to feel responsive. |
| 3 | L267 (rename icon-button inline transition) | click | low | ✓ | The press transform duration is hardcoded at 120ms instead of the --dur-press token, diverging from the project's centralized timing scale. |

## src/features/canvas/PromptBar.tsx  (1)

PromptBar.tsx is almost fully compliant with the project animation system. The suggestion chips correctly use active:scale-[0.97] with a motion-reduce:active:scale-100 guard, and the inline transition specifies exact properties (color, background-color, border-color, transform) using var(--ease-out) rather than transition-all. The only defensible deviation is that the inline transition uses hardcoded 160ms/120ms values instead of the project's --dur-* tokens (--dur-press 140ms / --dur-pop 180ms). The hover styles only affect color/border (no transform), so there is no touch-stick concern, and the persistent bar correctly has no entrance animation. No popup, keyboard-action, scale-0, or transform-origin issues found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L76-79 | transition | low | ✓ | Hardcoded 160ms/120ms durations bypass the project's --dur-* timing tokens, so chip motion drifts out of sync with the rest of the system's press/pop rhythm; mapping to --dur-press (140ms) keeps timing consistent and tunable from one source of truth. |

## src/features/clips/ClipCard.tsx  (3)

ClipCard is mostly compliant: it uses the project tokens (--dur-pop, --dur-press, --ease-out) and scopes every transition to exact properties via [transition-property:...] rather than transition-all, and the hover preview correctly animates opacity only. No bad easing, no oversized durations, no scale-0 entrances, no popover/origin issues. The only gap is missing :active press feedback on the three pressable buttons (the large play target and the two icon-buttons), which currently animate hover state but give no tactile confirmation on click. Recommended fix is adding motion-safe:active:scale-[0.97/0.98] (and including transform in the transition-property list for the icon-buttons), matching the compliant Button primitive.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L48-L53 (play <button>) | click | medium | ✓ | The primary play target is a clickable area with no press feedback; a subtle active:scale gives the tactile confirmation Emil wants on every pressable surface. |
| 2 | L108-L114 (edit icon-button) | click | medium | ✓ | This icon-button animates color/background on hover but has no :active response, so pressing it feels dead; active:scale-[0.97] matches the compliant Button primitive. |
| 3 | L115-L121 (delete icon-button) | click | medium | ✓ | Same as the edit button: a pressable icon-button with hover transitions but no active feedback should get active:scale-[0.97] to confirm the press tactilely. |

## src/features/clips/ClipForm.tsx  (2)

The form inputs already use a compliant transition pattern in `fieldClass` (L85-86): token duration `var(--dur-press)`, custom `var(--ease-out)` curve, and scoped `[transition-property:border-color,box-shadow]` instead of transition-all — no findings there. Two conditionally-rendered elements appear with no entrance transition: the thumbnail preview block (L136) and the inline video-URL validation error (L114). Both jar in instantly and should reuse existing project keyframes (tl-pop-in / tl-fade-in) with motion-safe guards since they introduce/move content. No other animation surface (the static labels, no pressable/popup/keyboard elements) requires changes.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L136 | open | medium | ✓ | The thumbnail preview block appears instantly when a URL is entered; a scale+opacity pop-in (tl-pop-in) makes the new element feel placed rather than flashed in, per Emil's principle that meaningful entrances need transition. |
| 2 | L114 | open | low | ✓ | The inline validation error snaps in with no transition; a quick token-driven fade-in softens the appearance so the error feels intentional rather than jarring. |

## src/features/clips/ClipPlayerModal.tsx  (3)

The modal is mostly compliant: it uses tl-modal-in with origin-center for the panel, motion-safe guards, and project --dur-press/--ease-out tokens with explicit transition-property on most buttons (no transition-all, no scale-0 entrances, no overlong durations, and the keyboard-driven open correctly uses a short entrance rather than animating shortcut actions). Three real findings: (1) the backdrop animates with tl-fade-in (the list-stagger keyframe) instead of the dedicated tl-fade backdrop keyframe and a hardcoded 180ms instead of --dur-modal; (2) the close icon-button has no transition tokens and no active press feedback; (3) the speed/share/nav buttons animate color but lack the subtle active:scale-[0.97] press feedback used by the compliant Button primitive.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L114 | open | low | ✓ | The backdrop should use the dedicated tl-fade opacity keyframe (the established backdrop primitive) rather than tl-fade-in, which is the list-stagger entrance, and should share the --dur-modal token so backdrop and panel rise together. |
| 2 | L129-L135 (close button) | click | medium | ✓ | This pressable icon-button has no transition tokens (color/background jump instantly) and no active press feedback, unlike every other button in the file; matching the compliant Button primitive's active:scale-[0.97] makes the press feel tactile. |
| 3 | L184-L194 (speed buttons) and L202-L206 (share) and L150-L154/L160-L164 (nav) | click | low | ✓ | These pressable controls (speed pills, share, prev/next nav) animate color but give no :active scale feedback, so a tap reads as inert; adding the subtle active:scale-[0.97] from the Button primitive confirms the press. |

## src/features/copilot/CopilotPage.tsx  (9)

CopilotPage.tsx is a large, mostly Flowbite-driven view. The message-stream entrances already correctly use motion-safe tl-fade-in with the project tokens, and the hover transitions on history items and copy buttons use the --dur-press / --ease-out tokens, so the React-rendered animation surface is largely compliant. The defensible findings cluster in the static Flowbite markup and pressable elements: the right-side history drawer slides with browser-default easing instead of the available --ease-drawer/--dur-modal tokens; the three header tooltips and both settings toggle knobs use hardcoded duration-300 / transition-all instead of project tokens and scoped transition-transform; and several genuinely pressable controls (sample-prompt cards, the send button, the assistant copy/like/dislike icon buttons) lack any active:scale press feedback to match the compliant Button primitive. No scale-0 entrances, ease-in enters, or keyboard-action animations were found. Note: the model/theme/language dropdowns and the settings modal are toggled by Flowbite JS (hidden class), so their entrance animation is outside this file's control and was not flagged.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L505 (#drawer-chat-history) | open | medium | ✓ | The drawer slides with the browser default easing/duration; the project's --ease-drawer curve and --dur-modal token exist precisely to give panel slide-ins a deliberate, weighted feel. |
| 2 | L276 (#tooltip-chat-settings) | transition | low | ✓ | A 300ms tooltip fade with no custom curve feels sluggish for a hover hint; mapping to the --dur-pop token and --ease-out matches the project's popover timing. |
| 3 | L289 (#tooltip-chat-share) | transition | low | ✓ | Same hardcoded duration-300 tooltip fade should use the --dur-pop token and the project ease-out curve for a snappier hover hint. |
| 4 | L333 (#tooltip-chat-history) | transition | low | ✓ | Hardcoded duration-300 with default easing on the history tooltip should map to the --dur-pop token and ease-out curve like the other compliant popovers. |
| 5 | L739 (theme toggle switch knob) | input | medium | ✓ | transition-all animates every property (incl. color/border) and uses default easing; the knob only translates, so scope it to transition-transform with the press token and ease-out, guarded by motion-safe. |
| 6 | L786 (archive toggle switch knob) | input | medium | ✓ | Same toggle knob uses transition-all where only the transform moves; scope to transition-transform with the press token and ease-out, motion-safe guarded. |
| 7 | L380-390 (sample prompt buttons) | click | medium | ✓ | These large clickable prompt cards immediately fire a send but give no press feedback; an active:scale-[0.97] confirms the tap and matches the compliant Button primitive. |
| 8 | L493 (send submit button) | click | medium | ✓ | The primary send action has no press feedback; a subtle active:scale-[0.97] makes the most-used button in the view feel responsive, matching the project Button. |
| 9 | L432-455 (assistant copy/like/dislike icon buttons) | click | low | ✓ | The message action icon buttons (copy, like, dislike) are pressable but give only a hover color change; adding active:scale-[0.97] gives tactile press feedback consistent with the Button primitive. |

## src/features/copilot/MessageContent.tsx  (1)

The file is mostly a markdown renderer with one interactive animation surface: the per-code-block copy button. Its opacity reveal already correctly uses project tokens (transition-opacity, --dur-press, --ease-out) and is compliant. The single defensible finding is that this pressable icon-button lacks any :active press feedback; adding a motion-safe active:scale-[0.97] (and extending the transition to include transform) brings it in line with the compliant Button primitive. No transition-all, no scale-0 entrances, no bad easing, no over-long durations, and no popover/origin issues are present.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L104-L109 (copy code button) | click | medium | ✓ | A pressable icon-button needs tactile press feedback (active:scale-[0.97]) to feel responsive and confirm the tap, matching the project's compliant Button primitive. |

## src/features/dashboard/DashboardPage.tsx  (2)

DashboardPage is mostly compliant with the project's animation system: it correctly uses .tl-stagger for staggered list/stat entrances, the Button/Modal/Toast primitives, and the join-button anchors faithfully replicate the Button motion contract (transition-transform, --dur-press, --ease-out, active:scale-[0.97]). Skeletons use animate-pulse appropriately and reduced-motion is handled globally. The only deviations are two hover background transitions (table rows L357, team cards L415) that use Tailwind's built-in transition-colors easing/duration instead of the project's --ease-out / --dur-press tokens. Both are low severity, purely cosmetic consistency nits, and trivially auto-fixable className swaps. These hover targets are not pressable links/buttons (no onClick/href), so no active: feedback is required.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L357 | transition | low | ✓ | A hover color transition on a table row is meaningful UI motion that should ride the project's custom ease-out curve and press token rather than Tailwind's default easing/duration so it feels consistent with the rest of the app. |
| 2 | L415 | transition | low | ✓ | The team card hover uses Tailwind's default easing/duration instead of the project's --ease-out and --dur-press tokens, so its background fade subtly deviates from the established interaction feel. |

## src/features/docs/components/AppsPanel.tsx  (1)

AppsPanel is mostly compliant: it reuses the compliant Button/IconButton/Badge primitives, and the form progress bar correctly animates only width with duration-200 ease-[var(--ease-out)] plus a motion-reduce guard. The only animation finding is the custom poll-option <button> (L121-L137), which has hover:bg-surface-2 color feedback but no :active press feedback that the project's Button primitive provides. The approval (L61) and shift (L91) list items are non-pressable rows, so no active state is needed there.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L121-L125 | click | low | ✓ | This pressable poll-option button gives no tactile press feedback, unlike the project's compliant Button primitive (active:scale-[0.97]); a subtle active scale confirms the tap and makes voting feel responsive. |

## src/features/docs/components/CanvasEditor.tsx  (2)

CanvasEditor is largely compliant: the progress bar (transition-[width] + ease-out token + motion-reduce guard), the todo toggle button (transition-colors + motion-reduce), and the add button (active:scale-[0.97] + 140ms + ease-out token) all correctly use the project animation system. The only findings are the two editable block inputs (heading at L73, text at L100), which change background on focus (focus:bg-surface-2) with no transition, causing an abrupt snap. Adding a short transition-colors keyed to the press duration and ease-out token (with a motion-reduce guard) brings them in line with the established system. No popover/dropdown/modal motion to flag; the native selects are not animation surfaces.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L73 | input | low | ✓ | The focus background snaps in instantly; a short colors transition with the project's ease-out makes the focus state feel intentional rather than a jarring flash. |
| 2 | L100 | input | low | ✓ | Same abrupt focus-background change on the text block input; a brief transition-colors keyed to the press token smooths the focus feedback consistently with the rest of the editor. |

## src/features/docs/components/ClipDetail.tsx  (1)

ClipDetail.tsx is largely compliant: the completion progress bar correctly uses transition-[width] with --ease-out, --dur tokens, and a motion-reduce guard, and all primary actions use the compliant Button primitive (which already provides active:scale feedback). There are no modals, dropdowns, or popovers here (sharing/privacy use native select elements), and the content lists are data sections rather than entering surfaces, so no stagger is warranted. The single defensible finding is the raw emoji-reaction <button> elements (L152-163): they are genuinely pressable but only animate transition-colors and have no :active press feedback, deviating from the Button primitive's active:scale-[0.97] convention. Adding a subtle active:scale (with a motion-reduce guard) brings them in line with the established interaction system.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L152-L163 (emoji reaction button) | click | medium | ✓ | This raw pressable emoji-reaction button has no tactile press response, unlike the project's compliant Button primitive; a subtle active:scale-[0.97] gives the immediate physical feedback Emil considers essential for any clickable element. |

## src/features/docs/components/ClipsList.tsx  (2)

ClipsList.tsx is mostly compliant: the search-result list button already uses transition-colors with the project's duration-150 ease-[var(--ease-out)] token and a motion-reduce guard, and the record action uses the compliant Button primitive. Two real findings: (1) the clip list-row button is pressable but lacks any :active feedback, unlike the Button primitive that uses active:scale-[0.97]; adding motion-safe:active:scale-[0.98] (and widening the transition to include transform) gives a tactile press. (2) The clip list renders all rows simultaneously where the project's .tl-stagger helper would provide a polished staggered entrance.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L67-L75 | click | medium | ✓ | This clickable list-row is a pressable element but gives no tactile :active feedback; a subtle active:scale-[0.98] (matching the Button primitive) confirms the press and makes selection feel responsive. |
| 2 | L64 (<ul className="space-y-2">) | transition | low | ✓ | The filtered clip list renders all rows at once, so applying the project's .tl-stagger helper gives a polished staggered entrance instead of an abrupt simultaneous appearance, especially after search/archive filtering. |

## src/features/docs/components/CommentSidebar.tsx  (2)

The file is largely compliant: both Button instances reuse the compliant primitive, and the comment list items already use transition-opacity with duration-200, ease-[var(--ease-out)], and a motion-reduce guard. Two real findings: the inline 'resolve' button (L79) is a pressable element lacking any :active press feedback (should gain motion-safe:active:scale-[0.97] with --dur-press/--ease-out), and the comment <ul> (L63-92) renders all items at once where the project's .tl-stagger entrance fits.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L79-L85 | click | medium | ✓ | A pressable control needs tactile press feedback so the tap registers physically, matching the project's Button active:scale-[0.97] primitive. |
| 2 | L65-L91 (ul > li.map) | transition | low | ✓ | Comments populate as a list and should enter with a staggered cascade rather than appearing all at once, the same entrance pattern used elsewhere in the app. |

## src/features/docs/components/KanbanBoard.tsx  (2)

KanbanBoard.tsx is mostly compliant: the card hover (L39) correctly uses transition-shadow + duration-150 + ease-[var(--ease-out)] + motion-reduce guard. Two real findings remain. (1) Pressable IconButtons (move-left/right, add-card) have no :active feedback — the shared IconButton primitive only has transition-colors, so a localized active:scale-[0.97] + transition-transform + motion-reduce guard restores the tactile press the compliant Button primitive provides (ideally fixed in IconButton.tsx itself, but a per-instance className swap works). (2) The card list renders all at once where the project's .tl-stagger entrance fits, and newly added cards pop in with no transition. No transition-all, no bad easing, no over-long durations, and no transform-origin issues were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L35-L36 (the <ul>/<li> card list) | open | low | ✓ | The card list renders all at once with no entrance; Emil favors a staggered reveal so the eye can follow content appearing in sequence, and the project ships .tl-stagger for exactly this. |
| 2 | L49-L64 (move-left/right IconButtons) and L81-L83 (add-card IconButton) | click | medium | ✓ | These pressable icon buttons give no tactile press feedback (the IconButton primitive only has transition-colors), so taps feel dead; a subtle active:scale-[0.97] confirms the press the way the compliant Button primitive does. |

## src/features/docs/components/TableGridView.tsx  (3)

The file has limited animation surface and is mostly compliant: interactive elements use transition-colors with proper motion-reduce:transition-none guards, and no transition-all, bad easing, oversized durations, or scale-0 entrances are present. The only real findings are pressable controls lacking :active press feedback. The three view-switcher tabs and two delete icon-buttons are clickable but give no tactile press response (the compliant Button primitive uses active:scale-[0.97]). Additionally, the delete-column icon button snaps its hover color instantly because it is missing transition-colors that its delete-row sibling already has. All fixes are localized className swaps adding motion-safe:active:scale-[0.97] (transform must be motion-safe-guarded). Native select/input form controls are not flagged as they are not animation surface.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L91-L100 (view-switcher button) | click | medium | ✓ | This view-switcher tab is a pressable control but gives no tactile press response; a subtle active:scale matches the compliant Button primitive and makes the tap feel physical. |
| 2 | L127-L132 (delete-column icon button) | click | medium | ✓ | The hover color snaps instantly (no transition-colors) and there is no press feedback, unlike its sibling delete-row button; adding transition-colors and active:scale makes the icon button feel consistent and responsive. |
| 3 | L150-L154 (delete-row icon button) | click | low | ✓ | This pressable icon button animates its color but offers no on-press scale feedback, so the click feels flat; a subtle active:scale matches the project's Button primitive. |

## src/features/docs/components/WorkflowBuilder.tsx  (2)

WorkflowBuilder.tsx is largely compliant and low on animation surface: it correctly uses scoped transition-colors with a motion-reduce guard on the list buttons, and delegates press/modal motion to the compliant Button primitive. Two defensible findings: (1) the workflow-selector list buttons are pressable menu items but lack any active feedback — they should add motion-safe:active:scale-[0.97] with the --dur-press/--ease-out tokens to match the Button primitive; (2) the steps list and run-log list render all at once on selection/run and would read better with the project's .tl-stagger helper. No transition-all, scale-0 entrances, bad easing, over-long durations, or origin-center popovers were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L30-L40 (workflow list <button>) | click | medium | ✓ | This is a pressable list/menu item but gives no tactile press confirmation; a subtle active:scale-[0.97] matches the Button primitive and makes selection feel physical (Emil: presses should feel pressed). |
| 2 | L87-L96 (steps <ol>) and L101-L107 (run-log <ul>) | transition | low | ✓ | Workflow steps and the run-log entries pop in all at once when a workflow is selected/run; a staggered entrance via the project's .tl-stagger helper gives the list a deliberate, readable cadence (Emil: lists should reveal, not snap). |

## src/features/docs/DocsPage.tsx  (1)

The file's two animation surfaces are already compliant: the tabpanel uses the tl-fade-in keyframe with var(--ease-out) at 180ms (matching --dur-pop) plus motion-reduce:animate-none, and the tabs use the explicit transition-colors with motion-reduce:transition-none. No transition-all, ease-in, oversized durations, scale-0 entrances, or origin issues were found. The one defensible finding is that the role=tab buttons are pressable but lack any :active feedback, unlike the project's Button primitive which uses active:scale-[0.97]; adding it (and changing transition-colors to transition-[color,transform] so the press animates) brings them in line with the established system.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L79-L80 (tab button className) | click | low | ✓ | Tabs are pressable controls but give no press feedback; matching the project's Button primitive (active:scale-[0.97]) makes the tap feel physical and responsive, per Emil's principle that interactive elements should acknowledge the press. |

## src/features/intelligence/IntelligenceDashboard.tsx  (5)

The file is a dashboard with several pressable controls and a tab bar. Two primitives (Summarize/Action buttons, and the translate Dub/Redact toggles at L368-395) already correctly use transition-transform + active:scale-[0.97] on the project curve. Findings center on inconsistency: the TabBtn tabs, the Export button, and the Live toggle are pressable elements lacking active:scale press feedback, and several buttons animate transform but let their hover/active background color swaps snap with no transition. The Modal/Dropdown/Toast/ProductTour entrance animations are delegated to compliant shared components and are not defined here. Fixes are localized className swaps mapping to --dur-press and --ease-out tokens.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L55-L68 (TabBtn button) | click | medium | ✓ | A tab is a pressable element and its hover border/text color change has no transition, so the active state and hover snap instantly; adding active:scale-[0.97] and transition-colors gives the tactile press feedback Emil insists pressables earn. |
| 2 | L247-L253 (Summarize button hover) | transition | low | ✓ | transition-transform animates the press but the hover:bg-surface-3 background swap snaps with no easing; transitioning both properties on the project curve keeps hover and press consistent. |
| 3 | L254-L260 (Action items button hover) | transition | low | ✓ | Same as the Summarize button: the press scales smoothly but the hover background change is abrupt because only transform is transitioned. |
| 4 | L261-L267 (Export button) | click | medium | ✓ | This Export button is identical in role to the adjacent Summarize/Action buttons yet has no active:scale press feedback and no hover transition, so it feels dead compared to its compliant siblings. |
| 5 | L269-L282 (Live toggle button) | click | medium | ✓ | The Live toggle is the most important state-changing control here yet has no press feedback and its background flips between red and surface instantly; a subtle active scale plus a color transition makes the toggle feel deliberate. |

## src/features/intelligence/TranscriptAnalyticsPanel.tsx  (1)

The file has a single animation surface: the speaker-share progress bar (L122-128) which fills via an inline `transition: "width 280ms var(--ease-out)"`. It correctly uses the project's --ease-out token and a sensible 280ms duration, so easing/duration are compliant. The one defensible finding is that this inline-style transition animates a moving/growing element but has no component-level reduced-motion guard; the global prefers-reduced-motion handling does not reach inline-style transitions, so a motion-reduce:transition-none (or motion-safe wrapping) should be added. Animating `width` here is acceptable since it is a data-driven bar fill, not a high-frequency UI gesture, so I did not flag it as a transform swap. All other rendered nodes (stat cards, chart container) are static with no entrance/press/hover motion to audit.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L122-L128 | transition | low | ✓ | This is the only motion in the file and it moves/grows an element, so per Emil reduced-motion should disable it at the component level (the global guard does not cover inline-style transitions), even though the easing token and 280ms duration are otherwise tasteful for a data-bar fill. |

## src/features/meetings/components/ControlBar.tsx  (2)

ControlBar renders meeting controls via a local RoundBtn button plus inline reaction buttons. Both are pressable elements but lack any :active press feedback (the compliant Button primitive uses active:scale-[0.97] with --ease-out). RoundBtn only has transition-colors; the reaction buttons have no transition at all on their hover color. Two medium, auto-fixable findings — add motion-safe active scale and proper transition props/tokens. No transition-all, no excessive durations, no popover/origin issues, no keyframe duplication in this file.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L50-L51 (RoundBtn className) | click | medium | ✓ | Every meeting control is a pressable button but the shared RoundBtn has no :active feedback, so taps feel dead; the compliant Button primitive uses active:scale-[0.97] with --ease-out to confirm the press tactilely. |
| 2 | L158 (reaction button className) | click | medium | ✓ | Reaction emoji buttons are single-tap pressables with no transition on the hover color and no active feedback, so they snap and feel unresponsive; adding active:scale-[0.97] and a transition matches the project's press feel. |

## src/features/meetings/components/PreJoin.tsx  (3)

PreJoin has three small interaction gaps versus the project's animation system. The two pressable controls (the circular mic/cam/blur Toggle buttons and the full-width AI Companion toggle) lack the active:scale-[0.97] press feedback and token-eased transitions that the compliant Button primitive uses, so taps feel dead and state changes snap instantly. Additionally, the camera-preview gradient mounts/unmounts with no fade, making the camera on/off toggle jarring. All three are localized className swaps that map cleanly onto the existing --dur-press/--dur-pop and --ease-out tokens. The Avatar, Button, and select/structural elements are already compliant or have no meaningful motion surface.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L33 (Toggle button className) | click | medium | ✓ | These circular mic/cam/blur controls are primary pressable targets but give no tactile press feedback; matching the Button primitive's active:scale-[0.97] makes the tap feel physically responsive. |
| 2 | L131-136 (AI Companion toggle button className) | click | medium | ✓ | This full-width toggle has neither a transition nor active feedback, so its on/off color and border state snap instantly and the press feels dead; a token-eased color transition plus a subtle active scale make the state change read as deliberate motion. |
| 3 | L61-65 (camera gradient conditional render) | transition | low | ✓ | Toggling the camera abruptly mounts/unmounts the preview gradient with no fade, so the on/off switch feels jarring; rendering it persistently and crossfading opacity with a pop token smooths the transition. |

## src/features/meetings/MeetingLobbyPage.tsx  (7)

The page has real animation surface and several defensible findings. The two highest-impact issues are the report and diagnostics modals (L541-L610, L613-L651): both are conditionally rendered and appear instantly with no enter transition for either the dialog or the bg-gray-900/50 backdrop, which feels jarring — they should reuse the project's tl-modal-in + tl-fade keyframes (motion-safe guarded, --dur-modal/--ease-out) like the compliant Modal primitive. Next, most pressables lack tactile feedback: the round mic/camera/effects/more-options controls (ctrlBtn helper, L342), the primary 'Ask to join' CTA (L384), and the present/companion toggles (L387/L394) have no active:scale-[0.97] or transition-transform, unlike the project Button. Finally, the three Flowbite tooltips (L317/L327/L338) use transition-opacity duration-300 with no project token — these should map to --dur-pop (180ms) + var(--ease-out). The device-selector dropdowns and their menu items are Flowbite-driven and left as-is. All findings are localized className/helper swaps an agent can apply safely.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L542-L543 | open | high | ✓ | The report modal and its backdrop snap into existence with no transition, which feels jarring; matching the compliant Modal primitive (tl-modal-in + tl-fade) gives a calm scale/fade entrance. |
| 2 | L614-L615 | open | high | ✓ | The diagnostics modal appears instantly with no enter transition; reusing the project's tl-modal-in + tl-fade keyframes makes the open feel intentional and consistent with other modals. |
| 3 | ctrlBtn() L275-L279 | click | medium | ✓ | These round mic/camera/effects toggle buttons are primary pressables yet give no active-press feedback; a subtle active:scale-[0.97] makes the tap feel physical like the compliant Button primitive. |
| 4 | L342 moreOptionsDropdownButton | click | medium | ✓ | This icon-button opens a dropdown but has no press feedback; adding active:scale-[0.97] matches the other round controls and the Button primitive. |
| 5 | L384 askToJoin button | click | medium | ✓ | The primary 'Ask to join' CTA is the most important pressable on the page yet has no tactile active response; active:scale-[0.97] gives it the same press affordance as the compliant Button. |
| 6 | L387 present toggle (apply identically to companion toggle L394) | click | low | ✓ | The present/companion toggles flip aria-pressed state on click but give no motion feedback; the same active:scale-[0.97] confirms the toggle the moment it is pressed. |
| 7 | L317 / L327 / L338 tooltip transition-opacity duration-300 | transition | low | ✓ | 300ms is sluggish for a hover tooltip and uses no project token/curve; mapping to --dur-pop (180ms) with var(--ease-out) makes the reveal snappy and on-system. |

## src/features/meetings/MeetingRoomPage.tsx  (8)

This Flowbite-derived meeting room has a large interaction surface (round control buttons, two dropdown popovers, four right-side drawers, a details modal, tooltips, emoji reactions, and a star rating) but almost none of it uses the project's animation tokens. The dominant issues: (1) every pressable control button, menu item, reaction, invite CTA, and star lacks any active:scale press feedback that the compliant Button primitive establishes; (2) the reactions/background dropdowns appear with no entrance animation and no transform-origin instead of tl-pop-in; (3) all four drawers use a bare transition-transform that ignores the dedicated --ease-drawer curve and --dur-modal token; and (4) the 15 tooltips use transition-opacity duration-300 with default easing rather than the --dur-pop / --ease-out tokens. All findings are localized className swaps that map directly onto existing CSS vars/keyframes; transform-based press/pop additions include a motion-safe: guard. Nothing in the file is anti-pattern severe (no scale-0 entrances, no transition-all, no ease-in on enter, no keyboard-action animations), so all findings are low-to-medium severity polish that brings the page in line with the established system.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L437 (and all identical tooltip divs: L447, L457, L468, L528, L539, L549, L628, L639, L649, L661, L673, L712, L870, L921) | transition | low | ✓ | Emil: tooltips are a quick reveal; 300ms is too slow and the built-in default ease lacks intent — map to the 180ms pop token with the project's ease-out curve so the hint snaps in. |
| 2 | L430 microphone control button (pattern repeats on every round control button: L441, L451, L462, L473, L495, L522, L533, L543, L553, L622, L632, L643, L655, L667) | click | medium | ✓ | Emil: every pressable control needs a physical press response; these toggle buttons only animate hover/focus, so add the compliant active:scale-[0.97] press feedback to match the project's Button primitive. |
| 3 | L482-491 reaction emoji buttons in reactionsDropdown | click | low | ✓ | Emil: these emoji reactions are tap-to-fire actions and deserve a tactile press; only a hover color change is present, so add active:scale to confirm the tap. |
| 4 | L479 reactionsDropdown popover (and L501 backgroundDropdown) | popup | medium | ✓ | Emil: a dropdown should grow from its trigger; these popovers appear with no entrance animation and no transform-origin, so reuse tl-pop-in with an origin matching the placement="top" anchor. |
| 5 | L727 messages drawer (also L800 participants drawer, L852 settings drawer, L983 feedback drawer) | open | medium | ✓ | Emil: a sliding drawer is the project's signature surface and the dedicated --ease-drawer curve exists for it; bare transition-transform falls back to the default ease and unspecified duration, so pin the drawer token and easing for a consistent slide. |
| 6 | L839 invite-others button in participants drawer | click | low | ✓ | Emil: a primary CTA must feel pressable; this invite button only changes background on hover, so add the compliant active:scale press feedback used by the Button primitive. |
| 7 | L1016-1035 star rating buttons in feedback drawer | click | low | ✓ | Emil: star rating is the most delightful interaction in this drawer yet the stars snap color with zero motion; a small active:scale on tap makes the rating feel responsive and intentional. |
| 8 | L562-616 moreOptions dropdown menu items, and L718/L1004/L1007/L1060/L1063 modal/drawer action buttons | click | low | ✓ | Emil: menu-item hover currently swaps background instantly with no transition; adding a short transition-colors on the project's ease-out makes the menu feel smooth rather than flickering between rows. |

## src/features/meetings/MeetingsPage.tsx  (1)

MeetingsPage.tsx is largely compliant with the established animation system: card hover uses transition-shadow with the --ease-out var and a 200ms duration, lists use the tl-stagger helper for entrance, modals go through the compliant Modal primitive (tl-modal-in + tl-fade), and the guest-link reveal correctly uses tl-fade-in with var(--ease-out) under a motion-safe guard. Pressable elements all route through the Button primitive, which already carries active:scale feedback. Only one minor deviation: the guest-link reveal hardcodes 180ms (L182) instead of referencing the --dur-pop token. No transition-all, no ease-in entrances, no scale-0, no center-origin popovers, no over-long durations found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L182 | transition | low | ✓ | The reveal hardcodes 180ms instead of the project's --dur-pop token, so the curve stays consistent but the duration drifts from the single source of truth. |

## src/features/meetings/RateConversationPage.tsx  (5)

The page's animation surface is the right-side Flowbite feedback drawer plus its interactive controls. The drawer slides with transition-transform but uses Flowbite's default easing/duration instead of the project's --ease-drawer/--dur-modal tokens (the tl-drawer-in-end system). The primary tactile control, the 1-5 star rating, has no active press feedback, and neither do the page's raw outline/primary buttons (they don't use the compliant Button primitive). The saved-state confirmation replaces the form with a hard cut and no entrance, and the file-dropzone hover changes background color with no transition-colors. All findings are localized className swaps that map cleanly onto existing project tokens.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L79 | open | medium | ✓ | The right-slide drawer uses Flowbite's default easing with no token; the project ships --ease-drawer + --dur-modal specifically for this gesture so the panel decelerates naturally instead of feeling mechanical. |
| 2 | L112-L118 (star rating buttons) | click | medium | ✓ | Star selection is the primary tactile action on this page yet has no press feedback; a subtle active:scale confirms the tap the instant the finger lands, per Emil's tactility principle. |
| 3 | L88-L108 (saved-state swap) | transition | low | ✓ | The success confirmation replaces the form instantly with no entrance, making a meaningful state change feel like a hard cut; a fade/stagger entrance softens the swap and draws the eye to the new content. |
| 4 | L58/L100/L159 (secondary outline buttons) | click | low | ✓ | These raw <button> elements never adopt the compliant Button primitive's active:scale-[0.97], so they lack the press feedback every other pressable in the app has. |
| 5 | L143 (dropzone label) / L61/L103/L156 (primary buttons) | click | low | ✓ | The clickable dropzone changes background on hover with no transition, so the color jumps abruptly; transition-colors with the project ease-out makes the affordance feel intentional. |

## src/features/messaging/components/ChannelHeader.tsx  (3)

ChannelHeader has a real animation surface centered on the ongoing-meeting bar (L97-118), which uses a self-contained inline keyframe. The two main findings are token drift (hardcoded 200ms + cubic-bezier(0.23,1,0.32,1) on L101 that exactly duplicate --dur-pop and --ease-out) and an inline per-component <style> keyframe (L116-117) that re-implements a fade+translate entrance and its own reduced-motion guard instead of reusing a shared tl-* keyframe from src/styles/index.css. A minor finding: the custom status Dropdown trigger (L143-159) is pressable but lacks the active:scale-[0.97] press feedback present in the compliant Button/IconButton primitives. The search input toggle, badges, and standard Button/IconButton/Dropdown usages are otherwise compliant and correctly delegate motion to the established primitives.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L101 | transition | low | ✓ | The duration and easing are hardcoded literals that exactly duplicate the --dur-pop (180ms) and --ease-out tokens, so they should reference the design-system variables to stay in sync with the established motion language. |
| 2 | L116-117 (inline <style> tl-ongoing-in) | open | medium | �— manuel | Emil: motion vocabulary should live in one place; an inline per-component keyframe that re-implements a small fade+translate entrance fragments the system and bypasses the shared tl-* keyframes and global prefers-reduced-motion handling. |
| 3 | L143-159 (status Dropdown trigger) | click | low | ✓ | Emil: every pressable control should confirm the tap; this custom Dropdown trigger is a clickable element with no :active feedback, unlike the compliant Button/IconButton primitives that use active:scale-[0.97]. |

## src/features/messaging/components/DetailsPanel.tsx  (3)

The drawer panel and backdrop are fully compliant: backdrop uses tl-fade with motion-safe and --ease-out, and the aside uses tl-drawer-in-end with --dur-modal/--ease-drawer behind a motion-safe guard. The imported IconButton is a compliant primitive. The real findings are the three sets of in-panel pressable buttons (priority toggles, disappearing-timer segments, and CSAT stars), which provide no :active feedback and apply instant, un-eased hover background changes. Each should adopt the Button primitive's active:scale-[0.97] with a transition on the exact animated props (transform/background-color/color) using the --dur-press and --ease-out tokens. All three are localized className swaps and safely auto-fixable.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L90-L104 (priority buttons) | click | medium | ✓ | A pressable toggle button gives no tactile confirmation on press; Emil's Button primitive uses active:scale-[0.97] so taps feel physical, and the hover color change should ease rather than snap. |
| 2 | L115-L128 (disappearing timer buttons) | click | medium | ✓ | Same selectable segmented control with no press feedback; matching the Button primitive's active:scale and easing the hover transition makes the selection feel responsive instead of instant. |
| 3 | L159-L166 (CSAT star buttons) | click | medium | ✓ | Rating stars are a primary interaction with no press feedback and an un-eased instant hover; a subtle active:scale-[0.97] plus eased transition rewards the tap and aligns with the project's press token. |

## src/features/messaging/components/MessageBubble.tsx  (8)

MessageBubble has real animation surface but is only partially compliant. The hover toolbar (L210) and grouped-timestamp reveal (L344) use transition-opacity without the project's --ease-out / --dur-pop tokens (the timestamp has no transition at all, causing a flicker). The bigger pattern gap is missing press feedback: the quick-reaction buttons, reply/thread/translate icon buttons, reaction pills, the Join call CTA, and the edit save/cancel buttons are all pressable but lack the active:scale-[0.97] that the app's compliant Button primitive uses. Lower-priority: incoming stickers pop in with no entrance and could reuse tl-pop-in. The Dropdown, Modal-based dialogs (ForwardDialog/MessageInfoDialog), and the keyboard-shortcut handler are correctly delegated to compliant primitives and need no changes. All findings are localized className swaps and safely auto-fixable.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L210 | transition | medium | ✓ | The hover toolbar fades with the browser-default linear timing and no token duration; binding it to --ease-out / --dur-pop makes the reveal feel intentional and consistent with the project's popover motion. |
| 2 | L344 | transition | medium | ✓ | The grouped-message timestamp snaps from invisible to visible with no transition, which reads as a jarring flicker on hover; a short opacity fade smooths the reveal. |
| 3 | L212-221 | click | medium | ✓ | These quick-reaction buttons are primary tap targets but give no press feedback; a subtle active:scale-[0.97] matches the project's Button primitive and confirms the tap. |
| 4 | L223-246 | click | medium | ✓ | The reply/thread/translate icon buttons are pressable but lack the active:scale press feedback used across the app's compliant Button, so taps feel dead. |
| 5 | L166-182 | click | low | ✓ | Reaction pills toggle on click but have no press feedback; adding active:scale-[0.97] gives the toggle a tactile confirmation consistent with other pressables. |
| 6 | L95-101 | click | medium | ✓ | The Join call CTA is a meaningful action button with no active state; a subtle press scale matches the project's Button feedback convention. |
| 7 | L118-131 | click | low | ✓ | The edit save/cancel buttons lack press feedback while the rest of the app's buttons scale on active, so the edit affordance feels inconsistent. |
| 8 | L141 | general | low | ✓ | A sticker arriving with no entrance pops in abruptly; reusing the existing tl-pop-in keyframe gives it a subtle scale-in consistent with other appearing content. |

## src/features/messaging/components/MessageComposer.tsx  (4)

The mention and slash popovers correctly use the established tl-pop-in keyframe with motion-safe guards, origin-bottom-left, and the --dur-pop/--ease-out tokens, so the entrance animation surface is compliant. The real gaps are tactile press feedback: the custom FmtBtn formatting buttons and the reply/note role=tab buttons are pressable but lack any active:scale feedback that the compliant Button primitive provides. Secondarily, the mention/slash menu-item hover background changes snap instantly with no transition-colors easing. The composer's IconButton, Button, and Dropdown usages already inherit compliant behavior from the UI primitives and were not flagged.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L373-L379 (FmtBtn button) | click | medium | ✓ | This formatting icon button is a primary pressable control yet gives no tactile press feedback, which Emil treats as essential acknowledgment that a tap registered. |
| 2 | L181-L198 (mode tab button) | click | medium | ✓ | These reply/note tabs are pressable role=tab elements with no :active feedback, so a press feels inert compared to the compliant Button primitive. |
| 3 | L252-L256 (mention listbox button) | click | low | ✓ | The hover background change on this menu item snaps instantly with no transition, making the popover feel less responsive than the token-driven hover elsewhere. |
| 4 | L270-L273 (slash listbox button) | click | low | ✓ | The slash-command menu item changes its hover background instantly without easing, an abrupt transition inconsistent with the project's animated hover states. |

## src/features/messaging/components/MessageList.tsx  (3)

MessageList.tsx has a small animation surface: an inline skeleton entrance keyframe. The skeleton uses a hardcoded bezier (cubic-bezier(0.23,1,0.32,1)) and raw 220ms/45ms timing instead of the project's --ease-out and --dur-* tokens, and defines an inline @keyframes (tl-msg-skeleton-in) that duplicates the existing tl-fade-in list-stagger keyframe plus its own redundant prefers-reduced-motion guard. The real message list (topLevel.map) renders all bubbles at once with no entrance, so the animated loading state snaps to static content. Recommend reusing --ease-out/--dur-* tokens and the .tl-stagger / tl-fade-in shared primitives rather than the in-component keyframe.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L21 | general | medium | ✓ | Hardcoding the easing curve and a raw 220ms duplicates project tokens that exist precisely so motion stays consistent; reference --ease-out and a --dur-* token instead of re-typing the bezier. |
| 2 | L34 (inline <style> @keyframes tl-msg-skeleton-in) | general | medium | �— manuel | The inline keyframe re-implements the project's tl-fade-in list-stagger keyframe (and its global prefers-reduced-motion handling), so duplicating it in-component fragments the animation system instead of using the shared source of truth. |
| 3 | L102 topLevel.map(...) message bubbles | transition | low | �— manuel | The skeleton animates rows in with a stagger but the real list snaps in statically, so the transition from loading to loaded feels jarring; matching the entrance with .tl-stagger keeps the motion continuous (Emil: loading state should hand off smoothly to content). |

## src/features/messaging/components/ThreadPanel.tsx  (1)

ThreadPanel's core motion is compliant: the mobile backdrop uses tl-fade (180ms, --ease-out) with a motion-safe guard, and the drawer uses tl-drawer-in-end with --dur-modal and --ease-drawer, also motion-safe guarded and origin-correct. IconButton is a compliant primitive, so press feedback is already handled. The one defensible finding is that the replies list renders via .map() with no entrance, where the purpose-built .tl-stagger helper would fit. No transition-all, no scale-0 enters, no ease-in, no over-long durations, and no keyboard-triggered animations were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L49-L51 (replies .map container) | transition | low | ✓ | A list of reply items popping in all at once feels abrupt; the project's .tl-stagger helper gives a staggered entrance that guides the eye down the thread, exactly the case Emil reserves staggering for. |

## src/features/messaging/MailInbox.tsx  (7)

MailInbox.tsx is a Flowbite-to-JSX-generated mail view with a meaningful animation surface that largely ignores the project's token system. Highest-impact issue: the compose modal (L239-242) and all toolbar/header dropdowns (L113, L361, L395, L452, L547) are toggled purely by Flowbite JS with no entrance animation, no opacity/scale, and no transform-origin, deviating from the compliant Modal (tl-modal-in) and Dropdown (tl-pop-in + origin-aware) primitives. ~30 tooltips use transition-opacity duration-300, which both exceeds the 150-250ms ceiling for ephemeral hints and bypasses the --dur-pop/--ease-out tokens. Numerous pressable elements (Compose/Send/Cancel buttons, modal close, the inbox rows, the star icon, and the entire WYSIWYG toolbar of icon-buttons) lack the active:scale-[0.97] + transition feedback of the project Button, and their hover color changes snap without transition-colors. The inbox row list (L187) appears all at once and is a good candidate for .tl-stagger. None require logic refactors; all are localized className/animation-utility swaps, though they are mechanically repetitive across many duplicated tooltip/button instances.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L29 (and all tooltip divs: L39, L49, L63, L73, L84, L94, L104, L165, L175, L198, L277, L287, L297, L307, L317, L327, L337, L347, L357, L391, L448, L510, L520, L530, L628, L638, L648, L658, L668, L679) | transition | low | ✓ | A 300ms tooltip fade exceeds the 150-250ms ceiling for transient UI hints and ignores the project's --dur-pop/--ease-out tokens, so the hint feels laggy and off-system; Emil: small ephemeral feedback should be fast and use one consistent curve. |
| 2 | L188 (inbox row <tr>) | click | medium | ✓ | A clickable row gives no press acknowledgement and its hover background snaps with no transition; Emil: every pressable surface should confirm the tap and color changes should ease rather than jump. |
| 3 | L187 (inboxMessages.map over <tbody>) | open | low | ✓ | The full list of inbox rows materializes at once with no entrance; Emil: a staggered reveal (the project's .tl-stagger helper) gives the list rhythm and signals freshly loaded content. |
| 4 | L239 (#composeModal container) and L242 (modal content panel) | open | high | ✓ | The compose modal appears instantly with no scale/opacity entrance, unlike the compliant Modal primitive (tl-modal-in + tl-fade); Emil: a modal popping in with no transition is jarring and breaks the spatial model of where it came from. |
| 5 | L113 (#mail-dropdown) and L361/L395/L452/L547 (toolbar dropdowns) | popup | medium | ✓ | These dropdowns toggle visibility with no entrance and no transform-origin, so they appear flat and center-scaled instead of growing from their trigger; Emil: popovers should animate origin-aware (tl-pop-in + origin-top-right) to feel anchored to the button that spawned them. |
| 6 | L195 (star icon in row) | click | low | ✓ | The star toggle is an actionable icon-button whose color change snaps and which gives no press feedback; Emil: a star tap is a delightful micro-moment that deserves an eased color transition and a subtle active squeeze. |
| 7 | L149 (Compose button), L246 (modal close X), L271 et al. (editor toolbar icon-buttons), L693 (Send), L697 (Cancel) | click | medium | ✓ | These raw <button>/<a> controls lack the active:scale-[0.97]+transition-transform feedback of the project's compliant Button primitive, so presses feel dead; Emil: every button should physically respond to a press with a small scale. |

## src/features/messaging/MailRead.tsx  (5)

MailRead.tsx is a Flowbite-generated mail view with a real animation surface: ~14 tooltips, many pressable icon-button links, a dropdown-toggle, three action buttons, and two Flowbite dropdown panels. Findings: (1) all tooltips use transition-opacity duration-300, which exceeds the UI-motion budget and ignores the --dur-* tokens — map to --dur-pop with var(--ease-out); (2) every pressable icon-button link has hover styling but no active:scale press feedback; (3) the mail-dropdown toggle button lacks press feedback; (4) the Reply/Reply all/Forward buttons lack press feedback — all should match the compliant Button primitive's motion-safe active:scale-[0.97] with transition-transform + --dur-press + --ease-out; (5) the two dropdown panels appear instantly with transform-origin center and no entrance — they should use origin-top-right + tl-pop-in, though Flowbite controls their visibility so this needs verification rather than a blind swap. The hover state changes are color-only and acceptable; the duration and missing-press-feedback issues are the substantive ones.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L26 (and L36, L46, L60, L70, L81, L91, L101, L156, L166, L185, L196, L247, L257 — every tooltip div) | transition | medium | ✓ | Emil: tooltips are quick acknowledgements — a 300ms fade reads as sluggish; map to the 180ms pop token with the project's custom out-curve so it matches the established system. |
| 2 | L20 (and all other icon-button `<a data-tooltip-target>` links: L30, L40, L53, L64, L74, L85, L95, L150, L160, L179, L189, L241, L251) | click | medium | ✓ | Emil: every pressable target should confirm the press — these icon-buttons have hover but no :active feedback, so a tap feels dead; matches the compliant Button primitive's active:scale-[0.97]. |
| 3 | L105 (mail-dropdown trigger button) | click | medium | ✓ | Emil: the dropdown-toggle is a button with no press feedback; a subtle active:scale gives tactile confirmation consistent with the project's Button. |
| 4 | L317, L323, L329 (Reply / Reply all / Forward action buttons) | click | medium | ✓ | Emil: primary actions deserve a press confirmation — these prominent buttons animate nothing on click, so they feel inert compared to the compliant Button primitive. |
| 5 | L110 / L213 (mail-dropdown and mailDetailsDropdown popover panels) | popup | low | �— manuel | Emil: dropdowns should grow from their trigger — these panels appear instantly with no origin-aware scale/fade, so they pop in jarringly; the project's tl-pop-in + origin-top-right is the compliant primitive (Flowbite toggles visibility, so verify it doesn't fight the keyframe). |

## src/features/messaging/MailReply.tsx  (5)

This is an auto-generated Flowbite "reply" page (markup not hand-edited per the file header), so animation is driven by Flowbite's runtime (tooltips, dropdowns) plus static Tailwind classes. Real findings: (1) every tooltip uses a hardcoded transition-opacity duration-300 instead of a project --dur-* token + ease-out; (2) the ~25 clickable icon action links have hover color changes but no active:scale press feedback, deviating from the compliant Button primitive; (3) the dropdown trigger buttons, menu items, and the primary Send message button likewise lack active feedback; (4) the four Flowbite dropdowns (mail, mail-details, message, filter font) toggle hidden->visible with no entrance animation and default center transform-origin, where tl-pop-in + origin-top-left/right is expected; (5) the reply composer form appears with no transition while auto-focusing. No transition-all, scale-0, or ease-in-on-enter misuse was present. Because the markup is machine-generated, fixes should ideally land at the generator/template level, but each is a localized className swap an agent can apply safely.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L26 (and all ~30 tooltip divs: L36, L46, L60, L70, L81, L91, L101, L156, L166, L185, L196, L247, L257, L350, L368, L378, L417, L427, L437, L447, L457, L467, L479, L489, L499, L509, L519, L529, L548, L558, L568, L578, L589, L599) | transition | low | ✓ | Tooltips fade at a hardcoded 300ms which sits at the upper edge for fleeting hints; mapping to the --dur-pop (180ms) token plus the project ease-out keeps them snappy and consistent with the design system. |
| 2 | L20/L30/L40 and all icon action links (archive, spam, delete, unread, snooze, prev/next page, favorites, reply, toolbar icons, attach/emoji/etc.) | click | medium | ✓ | These clickable icon buttons give only a hover color change and no press feedback; Emil's compliant Button primitive uses active:scale-[0.97] so taps feel physically acknowledged. |
| 3 | L319 (messageDropdownButton), L382 (filterDropdownButton), L207 (mailDetailsDropdownButton), L105 (mail-dropdown-button), L536 (Send message button), and dropdown menu <li> buttons L329-L338, L392-L407 | click | medium | ✓ | The dropdown trigger buttons, menu items and the primary Send message button are pressable but lack any active-state transform, so clicks feel inert compared to the project's Button primitive. |
| 4 | L110 (mail-dropdown), L213 (mailDetailsDropdown), L326 (messageDropdown), L389 (filterDropdown) | popup | medium | ✓ | These Flowbite dropdowns toggle from hidden to visible with no entrance animation and a default center transform-origin; tl-pop-in with an origin-aware origin gives popovers a polished, directionally-correct scale-in. |
| 5 | L315 (<form> reply composer) / L357 (autoFocus textarea) | open | low | ✓ | The reply composer appears with no transition while immediately stealing focus via autoFocus; a subtle tl-fade-in entrance makes the panel's appearance feel intentional rather than a jarring snap. |

## src/features/messaging/Notifications.tsx  (5)

Flowbite-generated notifications page driven by data-* attributes (popovers, dropdowns, a delete modal). Real animation gaps: all 12 hover popovers use transition-opacity duration-300 on the built-in ease curve (should be ~180ms / --ease-out); all 10 kebab dropdown menus toggle via `hidden` with no transition and no origin-aware tl-pop-in; the kebab trigger buttons plus View/Delete menu items and Follow/Cancel/Delete buttons have no active:scale press feedback; the two notification lists render all at once where tl-stagger fits; and the delete modal appears via `hidden` with no tl-modal-in/tl-fade entrance. Findings cite a representative line with a note that each pattern repeats across the 10 notification blocks.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L57 (data-popover popover-jese-profile), pattern repeats at L129, L214, L295, L374, L454, L528, L539, L618, L698, L778 | popup | medium | ✓ | A 300ms tween on the built-in ease curve is sluggish for a hover popover; Emil wants quick, custom-eased reveals so the popover snaps in around the --dur-pop token instead of drifting. |
| 2 | L100 (notification-1-dropdown menu), pattern repeats for dropdowns 2-10 at L179, L258, L338, L418, L498, L583, L662, L742, L822 | open | high | ✓ | The dropdown is toggled purely via `hidden`, so it pops in instantly with no scale/opacity transition; Emil treats menu entrances as needing an origin-aware tl-pop-in so the menu grows from the trigger corner instead of snapping. |
| 3 | L95 (notification-1-dropdown-button), same kebab trigger repeats for all 10 notifications (L174, L253, L333, L413, L493, L578, L657, L737, L817) | click | medium | ✓ | This icon button (and the View/Delete menu items and Follow/Cancel/Delete buttons throughout) is pressable but gives no tactile press feedback; the compliant Button primitive uses active:scale-[0.97] so taps feel physically acknowledged. |
| 4 | L44 (Today list container) and L441 (Yesterday list container) | transition | low | ✓ | The notification cards all render at once with no entrance; Emil uses a staggered list reveal (tl-stagger) so a feed of items cascades in and reads as a sequence rather than a single hard cut. |
| 5 | L851 (deleteNotificationModal content) | open | medium | ✓ | The delete-confirmation modal is shown by toggling `hidden` with no scale/opacity transition, so it appears jarringly; the compliant Modal primitive uses tl-modal-in (scale .95->1) with a faded backdrop for a soft, centered entrance. |

## src/features/phone/ActiveCallBar.tsx  (4)

ActiveCallBar is mostly compliant: it correctly uses tl-stagger, ease-[var(--ease-out)], duration-150, and active:scale-95 across most buttons. Four real findings: (1) the consult popover uses tl-modal-in but it is an origin-aware bottom-right popover that should use tl-pop-in; (2) that same animation hardcodes 180ms instead of --dur-pop; (3) BarButton uses an invalid transition-[transform,colors] value (`colors` is not a CSS property) so color transitions never run; (4) the prominent accept/decline/cancel/hangup call-control buttons (L146, L160, L170, L237) lack any active:scale press feedback that the rest of the file and the Button primitive provide.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L250-L251 | popup | medium | ✓ | This is an origin-aware dropdown/popover, so it should use the tl-pop-in keyframe (scale .96, origin-aware) rather than tl-modal-in (scale .95, origin center, meant for centered modals); the origin-bottom-right class confirms pop-in semantics. |
| 2 | L250 | popup | low | ✓ | The hardcoded 180ms duplicates the --dur-pop token (180ms) and should reference it so popover timing stays centrally tunable. |
| 3 | L461 | transition | medium | ✓ | transition-[transform,colors] is invalid CSS — `colors` is not a real CSS property, so only transform actually transitions; the color/background/border changes on active toggle snap instead of easing. |
| 4 | L146-L166 | click | medium | ✓ | These high-stakes pressable buttons (accept, decline, cancel-outgoing, hangup at L146/160/170/237) have no :active feedback, unlike the compliant Button primitive and every other button in this file, so taps feel unresponsive. |

## src/features/phone/CallHistory.tsx  (2)

CallHistory.tsx is mostly compliant with the project animation system: it correctly uses tl-stagger for the grouped list, transition-colors with var(--ease-out) and duration-150 on filter tabs, and transition-transform with active:scale-95 plus var(--ease-out) on the call-back button. Two findings, both minor: the filter tabs are pressable but lack any :active press feedback, and the clear-search icon button changes hover color with no transition and no press feedback. Both are localized className swaps. No transition-all, no bad easing, no over-long durations, no scale-0 entrances, and reduced-motion is respected via the global handler (transforms added should still carry motion-safe guards).

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L156-L160 (filter tab button className) | click | medium | ✓ | Tabs are pressable controls but give no tactile press feedback; a subtle active:scale matches the compliant Button primitive and makes the tap feel physical. |
| 2 | L131-L135 (clear-search button) | click | low | ✓ | The hover color change snaps instantly with no easing and the button has no press feedback; a short transition-colors plus active:scale make the interaction feel intentional and responsive. |

## src/features/phone/ContactsPanel.tsx  (2)

ContactsPanel is mostly compliant with the project's animation system: pressable elements (favorite chips, call buttons, FavoriteToggle) correctly use active:scale + transition-transform with ease-[var(--ease-out)] and duration-150, and lists use .tl-stagger. The only findings are on the contact-detail dialog: the backdrop appears with no transition (jarring snap) and should fade via tl-fade, and the dialog card uses an inline style animation with a hardcoded 200ms duration that duplicates tl-modal-in and bypasses both the --dur-modal token and the motion-safe guard for its transform entrance.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L355-356 | open | medium | ✓ | The backdrop appears instantly while the dialog scales in, which reads as a hard snap; fading the scrim with tl-fade makes the overlay feel like one coordinated surface entering. |
| 2 | L361-363 | open | medium | ✓ | The inline 200ms hardcodes a value that should come from the --dur-modal token (240ms) used by the compliant Modal primitive, and the raw style bypasses the motion-safe guard for a transform-based entrance. |

## src/features/phone/Dialer.tsx  (1)

The file is almost fully compliant with the project animation system: dial-pad keys, call button, backspace, and recent-call quick-access buttons all correctly use transition-transform duration-150 ease-[var(--ease-out)] active:scale-95, and the recent list correctly applies tl-stagger. One finding: the 'simulate incoming' text-link button (L132-138) is the only pressable element lacking any :active feedback, deviating from the compliant Button primitive (active:scale + transition-transform). No transition-all, no bad easing, no over-long durations, no scale-0 entrances, no transform-origin issues, and no keyboard-triggered animations were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L132-L138 | click | medium | ✓ | Every other pressable in this file gives tactile active feedback; this trigger button has none, so the tap feels dead and inconsistent with the established Button primitive. |

## src/features/phone/MessagesPane.tsx  (5)

MessagesPane has a real interaction surface (thread rows, three icon-buttons, a Dropdown trigger, a Modal). The Modal and Button primitives are already compliant. The main gaps are pressable elements with no :active press feedback: the thread-list rows and the attach/schedule/template-dropdown icon-buttons. The icon-buttons also change their hover background with no transition-colors, so the color snaps instantly. None use transition-all, bad easing, scale-0 entrances, or over-long durations. One low-severity opportunity: the thread <ul> renders its items all at once where the project's .tl-stagger entrance helper would fit. All findings are localized className swaps and safely auto-fixable; component-level scale additions are guarded with motion-safe: per the project's reduced-motion convention.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L74-L92 (thread list <button>) | click | medium | ✓ | A pressable thread row gives no tactile press feedback; a subtle active scale confirms the tap like the compliant Button primitive does. |
| 2 | L69-L96 (<ul> thread list) | transition | low | ✓ | A whole list of threads pops in at once; the project's .tl-stagger gives a staggered entrance that reads as intentional rather than a flash. |
| 3 | L156-L163 (attach icon-button) | click | medium | ✓ | This icon-button has no press feedback and its hover background snaps instantly with no transition-colors, so it feels less responsive than the compliant Button. |
| 4 | L174-L182 (schedule icon-button) | click | medium | ✓ | Pressable icon-button lacks active feedback and its hover background change is instant; a transition-colors plus subtle active scale matches the established press language. |
| 5 | L144-L147 (Dropdown triggerClassName) | click | low | ✓ | The dropdown trigger's hover background snaps with no transition-colors and gives no press feedback, breaking consistency with the other compliant pressable controls. |

## src/features/phone/PhoneLayout.tsx  (1)

PhoneLayout is a 10-tab roving-tabindex tab bar. Its only animated surface is the tab buttons, which correctly use transition-colors (not transition-all) with no hardcoded durations, custom easing misuse, popups, or dropdowns. The one defensible finding: the tab buttons are pressable elements lacking any :active feedback. Adding motion-safe active:scale-[0.97] (matching the project Button primitive) gives them the expected tactile press response. No other deviations from the established tl-* / token system.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L112 | click | medium | ✓ | Each tab is a pressable role=tab button but gives no tactile press response; the compliant Button primitive uses active:scale-[0.97], and tabs should feel equally responsive on press. |

## src/features/portal/PortalChatPage.tsx  (3)

The file is largely compliant: it correctly uses --dur-press, --ease-out, transition-colors, scroll-smooth with motion-reduce guard, and delegates modal/Button/Toast motion to the established primitives. The real gaps are pressable elements lacking :active feedback: the new-chat icon-button (L129), the thread-row select button (L189), and especially the mobile back button (L241) which also has no transition at all. No transition-all, no scale-0 entrances, no ease-in, no over-300ms UI motion, and no keyboard-action animations were found. The message list rendering all at once (L305) was considered for .tl-stagger but deliberately not flagged: chat messages append in realtime and the view auto-scrolls on every messages.data change, so a stagger would re-fire and feel jarring rather than polished.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L129-L137 | click | medium | ✓ | This new-chat icon-button is pressable but has no :active feedback, so a tap feels dead — Emil's compliant Button primitive uses active:scale-[0.97] to confirm the press. |
| 2 | L189-L200 (thread row button) | click | low | ✓ | This clickable thread row selects a conversation but gives no tactile press response; a subtle active:scale confirms the tap, matching the Button primitive's interaction language. |
| 3 | L241-L248 (mobile back button) | click | medium | ✓ | This mobile-only back icon-button has neither a transition nor :active feedback, so the hover/press state snaps instantly and feels unresponsive on touch — the press most important here since it is a touch-primary control. |

## src/features/portal/PortalPage.tsx  (3)

PortalPage.tsx is mostly animation-compliant: it correctly uses tl-stagger for the seller grid, the token-based transition-shadow with --dur-pop/--ease-out on SellerCard hover, the compliant Modal primitive, and the compliant Button primitive throughout. The main defensible gap is that the two raw <Link> elements styled with the .btn/.btn-primary classes (the SellerCard chat link and the \"go to chats\" CTA) are pressable but inherit only transition-colors from .btn, so they lack the active:scale-[0.97] tactile press feedback that the Button primitive provides — a deviation worth adding at these call sites. The SellerCard hover-shadow is already correct and is flagged only as a low-severity note (no real change needed).

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L194-L201 (SellerCard chat Link, className="btn btn-primary btn-sm shrink-0") | click | medium | ✓ | This raw .btn Link is a pressable element but the .btn class only transitions colors, so unlike the compliant Button primitive it gives no tactile active:scale-[0.97] press feedback. |
| 2 | L237-L243 ("go to chats" Link, className="btn btn-primary shrink-0 w-full sm:w-auto") | click | medium | ✓ | Primary call-to-action Link has no :active press feedback, breaking parity with the Button primitive's active:scale-[0.97] and making the tap feel dead. |
| 3 | L176 (SellerCard root, className includes "transition-shadow ... hover:shadow-md") | transition | low | �— manuel | The hover shadow is a hover-only color/elevation change (no transform) and is already token-compliant, so this is a low-priority note only — shadow-on-hover does not stick on touch and needs no motion guard. |

## src/features/support/components/ChannelsPanel.tsx  (1)

The file is almost entirely compliant. Its single real animation surface, the progress bar (L60-63), correctly uses transition-[width] with duration-200, ease-[var(--ease-out)], and a motion-reduce guard — it specifies an exact property, a token duration, the custom curve, and respects reduced motion. The Button primitives (L67, L85) inherit compliant press feedback. The only optional improvement is applying the existing .tl-stagger helper to the channel list (L45) so the rows enter with an ordered stagger rather than appearing simultaneously; this is low severity and optional since it is a settings list rather than a primary entrance surface.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L45 (<ul className="space-y-1.5">) | open | low | ✓ | A list of channel rows that materializes all at once reads as a hard cut; a subtle staggered entrance via the project's .tl-stagger helper gives the eye a sense of order without slowing the user down. |

## src/features/support/components/ContactPanel.tsx  (2)

The only animation surface is the CSAT star-rating row (L122-129), which is largely compliant: it uses transition-transform (scoped, not transition-all), has active:scale-95 press feedback, and correctly guards with motion-reduce. Two low-severity deviations from the project system: (1) the star button uses Tailwind's built-in ease-out and a hardcoded duration-150 instead of var(--ease-out) and the --dur-press token; (2) the label-remove icon button (L85-89) is pressable but only animates color on hover with no active press feedback. All other elements (input, IconButton, Card) defer to already-compliant primitives.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L126 | transition | low | ✓ | Meaningful press/hover motion should use the project's custom --ease-out curve and the --dur-press token rather than Tailwind's weak built-in ease-out and a hardcoded 150ms, so the rating interaction matches the established system. |
| 2 | L85-L89 (label remove button) | click | low | ✓ | This pressable icon button has color feedback but no tactile press response; Emil's principle is that every interactive control should acknowledge the press with a subtle active scale. |

## src/features/support/components/ConversationView.tsx  (1)

ConversationView is mostly compliant: pressable macro and canned-reply buttons correctly use active:scale-[0.97] with transition-colors and motion-reduce guards, and Button/IconButton primitives are reused. The only finding is the AI-suggestion panel (L174), which animates in with tl-fade-in (the list-stagger keyframe) at a raw 200ms instead of the popover-designated tl-pop-in keyframe with the --dur-pop token and an origin. Low severity, safe single-className swap.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L174 | popup | low | ✓ | This AI-draft callout is a transient popover-style panel that appears above the reply box; tl-pop-in (scale .96->1, origin-aware) is the system's designated keyframe for such surfaces, whereas tl-fade-in is the list-stagger entrance and the raw 200ms should use the --dur-pop token. |

## src/features/support/components/InboxNav.tsx  (3)

InboxNav renders three groups of pressable buttons (inbox rows, status chips, assignee chips) driven by two clsx helpers, inboxBtn() and chip(). All use hover:bg-surface-2 color changes but have no transition (so the hover snaps instantly) and no active-press feedback, deviating from the compliant Button primitive which uses active:scale-[0.97] + transition-transform with --ease-out. Fix is localized to the two helper functions: add transition-[transform,background-color,color] with duration-[var(--dur-press)] ease-[var(--ease-out)] and a motion-safe active:scale. No transition-all, no overlong durations, no scale-0 entrances, and no keyboard/popover motion issues were present.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L12-L13 chip() | click | medium | ✓ | These filter chips are pressable toggles but have no press feedback or transition, so the hover background snaps instantly and a tap feels dead; matching Button's active:scale-[0.97] and an --ease-out color transition gives tactile confirmation. |
| 2 | L23-L24 inboxBtn() | click | medium | ✓ | Each inbox row is a clickable nav button whose hover background appears with no easing and no active state, so selection feels abrupt; adding a transition-colors with --ease-out and a subtle active:scale-[0.98] matches the project's compliant Button primitive. |
| 3 | L49-L53 status buttons | click | low | ✓ | The status/assignee chip groups are interactive toggle buttons sharing chip(); once chip() carries the active-press and eased color transition they get the same tactile feedback, so no separate change is needed beyond the helper. |

## src/features/support/components/KbPanel.tsx  (1)

KbPanel is largely animation-compliant: the chevron rotation correctly uses transition-transform with duration-150 ease-out and a motion-reduce guard (L47), the expanded article body reuses the tl-fade-in keyframe with --ease-out (L55), and the toggle button uses transition-colors (not transition-all) for its hover. The only finding is the accordion toggle button (L42) lacking any :active press feedback. Note: mixing transition-colors and a transform transition on the same element technically needs transition-[transform,colors] if both are desired, but the proposed motion-safe:transition-transform additive approach is acceptable for a low-severity localized fix.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L42 | click | low | ✓ | This accordion header is a pressable button but has no active-press feedback; a subtle active:scale gives the tactile confirmation Emil wants on every clickable element. |

## src/features/support/components/StudioView.tsx  (1)

StudioView is largely compliant: it uses tl-stagger on the grid container, transition-colors (not transition-all) on the only custom-animated element, and delegates all other interactions to compliant primitives (Button, IconButton). The single defensible finding is the raw agent-list <button> at L66-73 which has hover and color transitions but no active-press feedback, deviating from the Button primitive's active:scale-[0.97] convention. No transition-all, no bad easing, no over-long durations, no transform-origin or scale-0 entrances, and the Enter-key sandbox send is logic only (no animation). Reduced-motion is handled globally and the suggested fix guards the transform with motion-safe.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L70 | click | medium | ✓ | This raw agent-select button is a primary pressable element but lacks the active:scale feedback that the project's Button primitive establishes, so taps feel dead compared to the rest of the app. |

## src/features/support/SupportPage.tsx  (2)

SupportPage.tsx is largely compliant: tab buttons correctly use transition-[background-color,transform], duration-150, ease-[var(--ease-out)], active:scale-[0.97] with motion-reduce guards, and view transitions use the tl-fade-in keyframe. Two findings: (1) the mobile back button (L135) applies an active:scale transform but only declares transition-colors, leaving the press without a duration/easing token and inconsistent with the sibling tab buttons — autofixable swap to transition-[background-color,transform] with the duration-150/ease-out tokens. (2) the view-body container (L164) uses tl-fade-in for a panel that swaps a whole set of items; tl-stagger may better match the system's staggered-list entrance intent, but this is a judgment call and not safely auto-applicable. No transition-all, no ease-in-on-enter, no scale-0 entrances, no origin-center popovers, and no over-long durations were found.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L135 | transition | medium | ✓ | The back button animates an active:scale transform but only declares transition-colors, so the press has no easing/duration token and the scale snaps inconsistently versus the sibling tab buttons. |
| 2 | L164 | transition | low | �— manuel | The view body swaps an entire panel of items on tab change; a single tl-fade-in fades the whole block at once whereas tl-stagger gives the list-like content a sequenced entrance matching the system's intended feel. |

## src/features/tasks/KanbanBoard.tsx  (6)

KanbanBoard has real animation surface (draggable card list, hover tooltips, modals, many pressable buttons) but deviates from the project's established system in several spots. The strongest findings: task cards render as a mapped list that pops in all at once where the project's .tl-stagger helper fits, and the raw buttons (card edit icon, the prominent dashed "Add new task" CTA, and modal submit buttons) lack the active:scale-[0.97] press feedback the compliant Button primitive standardizes. Lower-severity: the 13 filter-dropdown tooltips all use transition-opacity duration-300 (over the 250ms ceiling for incidental UI motion, should map to --dur-pop/180ms with --ease-out), and the SortableJS drag easing uses a one-off bezier duplicating --ease-out. Modals are Flowbite-driven so their enter/exit is outside this file's control and not flagged. All findings are localized className/option swaps a coding agent can apply safely.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L401 (and identical tooltips L406, L411, L416, L421, L426, L431, L436, L441, L446, L451, L456, L466) | transition | low | ✓ | A 300ms fade on a small hover tooltip feels sluggish; Emil favors snappy 150-250ms with the project's --ease-out for incidental UI motion (use --dur-pop = 180ms). |
| 2 | L744 (task card div, data-task-id) | general | medium | ✓ | Cards in a column render as a mapped list that pops in all at once; the project's .tl-stagger helper gives a staggered entrance so the column reads sequentially instead of snapping in. |
| 3 | L747 (card edit/pencil icon-button) | click | medium | ✓ | Pressable icon-buttons should give tactile press feedback; the project's Button primitive uses active:scale-[0.97], and this raw button deviates by having none. |
| 4 | L775 ("Add new task" dashed button) | click | medium | ✓ | This primary call-to-action button has no press feedback, breaking consistency with the compliant Button primitive's active:scale-[0.97]. |
| 5 | L820 / L873 (modal submit "Create" / "Edit task" buttons) | click | low | ✓ | These primary form-submit buttons lack the active:scale-[0.97] press feedback the project's Button primitive standardizes on, so they feel dead compared to the rest of the app. |
| 6 | L131 (SortableJS easing option) | transition | low | ✓ | The drag-reorder uses a one-off bezier that duplicates the role of the project's --ease-out token; matching the established curve keeps motion character consistent across the app. |

## src/features/users/UsersPage.tsx  (3)

UsersPage is largely compliant: row/card/tab/icon-button hover transitions all correctly use transition-colors with var(--ease-out) and short (120-140ms) durations, and all modals/dialogs delegate to the compliant Modal/ConfirmDialog primitives (tl-modal-in + tl-fade) and Button (active:scale). No transition-all, no scale-0 entrances, no ease-in, no over-long durations, no origin-center popovers. The only real findings are missing :active press feedback on three classes of pressable controls — the role-filter tabs and the row-action icon-buttons (edit/toggle/delete) — none of which give a tactile pressed state. Suggested fix adds active:scale-[0.97] and widens the transition prop list to include transform so the scale animates with the same --ease-out curve as the Button primitive. One could optionally add .tl-stagger to the user list/table rows for a staggered entrance, but the rows render in a virtualized-friendly table and stagger is not clearly warranted, so it is not flagged.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L127-L142 (role filter tab button) | click | medium | ✓ | This pressable tab is a primary interactive control yet has no :active feedback, so a tap feels dead — a subtle active:scale-[0.97] matches the project's Button primitive and confirms the press. |
| 2 | L377-L379 (edit icon button) / iconBtn class L371-L374 | click | medium | ✓ | These edit/toggle icon-buttons are pressable but give no tactile press feedback; an active:scale-[0.97] (matching Button) makes the click feel physical and intentional. |
| 3 | L389-L398 (delete icon button) | click | low | ✓ | The destructive delete icon-button has no press feedback; a subtle active:scale-[0.97] confirms the tap and matches the compliant Button primitive's pressed state. |

## src/styles/index.css  (1)

index.css is the project's animation source-of-truth and is overwhelmingly compliant: it defines the easing curves (--ease-out/in-out/drawer), duration tokens (--dur-press/pop/modal/toast), all tl-* keyframes (tl-fade-in, tl-modal-in scale .95->1, tl-pop-in scale .96->1 origin-aware, tl-fade backdrop, tl-drawer-in-end), the .tl-stagger helper, and a global prefers-reduced-motion guard. The .btn component class correctly uses transition-colors rather than transition-all. The only defensible deviation is the hardcoded 300ms in .tl-stagger's animation shorthand (L231), which duplicates and slightly exceeds the system's own --dur-modal token; it should reuse the token. Note: tl-fade-in and tl-stagger move elements via translateY but are not motion-safe guarded at the component level — this is acceptable here because the global prefers-reduced-motion block already neutralizes animation-duration site-wide, so it is not flagged.

| # | Konum | Kategori | Önem | Auto | Neden |
|---|---|---|---|---|---|
| 1 | L231 (.tl-stagger > *) | transition | low | ✓ | The list-entrance stagger uses a hardcoded 300ms that sits at the upper edge of acceptable UI motion and duplicates a value the system already tokenizes; mapping it to --dur-modal (240ms) keeps entrances snappy and consistent with the rest of the system. |
