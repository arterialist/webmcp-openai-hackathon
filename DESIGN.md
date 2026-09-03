# DESIGN.md - Commonplace

## Context (from discovery)

- Artifact type: SaaS app, combined with blog/editorial publication, profile, social feed, AI/conversational interface, and settings studio
- Positioning: technical and creative, with a human-first agent-native point of view
- Audience: people who read, save, write, and shape their own web spaces | Primary action: ask Commonplace to reshape the page or surface a useful story
- Adjectives: personal, editorial, tactile, clear, quietly playful
- Visual word translations: personal -> user-owned controls stay visible and immediate; editorial -> strong type contrast, ruled gutters, and readable measures; tactile -> shaped controls with perceptible press states; clear -> explicit tool labels and grouped settings; quietly playful -> one coral accent, small irregular offsets, and restrained motion
- Aesthetic essence (3 words): calm, precise, agent-native
- Single-minded proposition: your reading space should understand your taste and let you change the rules
- Archetype (optional): Creator with a Sage streak
- References: use shadcn/ui source-owned primitives for accessible interaction states, Origin UI for compact control density, Kibo UI for composable status/form patterns, editorial reading products for measure and rhythm, and the WebMCP showcase for direct agent actions; avoid anonymous dashboard kits and ornamental AI gradients
- Mode: both | Density: balanced
- Constraints: React 19, TypeScript 6, Vite 8, Bun, Vercel-ready server route, WebMCP draft API, accessible keyboard and reduced-motion behavior, no exposed API secrets
- Customization contract: the `ThemeSettings` model is serializable and shared by React rendering, the shadcn studio, browser WebMCP, and the Realtime voice agent. It includes 13 semantic color overrides, body/display fonts, type scale, independent weights, line-height, tracking, content measure, sidebar/rail widths, page/topbar/sidebar/section/feed/rail/group/card/reader/sheet/control spacing, control/surface radii, border width, shadow, grid, post layout, artwork position, visibility flags, editable surface copy, and home/navigation ordering. Article drafts use the same action contract as the composer and expose open/read, bulk field, per-field, publish, discard, and direct CRUD tools.

## Aesthetic

- Direction: a quiet shadcn command center for reading, writing, and agent-guided customization
- Defining trait: a structured product shell makes the feed, personal surface, and agent capabilities legible at a glance. The modern projection uses neutral shadcn-style surfaces, compact controls, ruled groups, and a strong reading column rather than a marketing-card stack. Spacing is contextual and token-driven; the default canvas stays calm until the user opts into a grid.
- Signature move: the living surface card. The hero shows the current palette, density, voice readiness, and live page-tool count beside the user's welcome, making personalization visible without opening settings.
- Presentation seam: `src/presentation.ts` selects the scoped `modern` projection. The original editorial projection remains available as `editorial`; both consume the same React state, shadcn primitives, WebMCP actions, and Realtime agent.

## Typography

- Display: Geist Variable | source: local `@fontsource-variable/geist` package
- Body: Geist Variable | source: local `@fontsource-variable/geist` package
- Mono: Geist Mono / system monospace fallback
- Scale: ratio 1.2 Minor Third, base 16px
  | step | size | line-height | use |
  | --- | ---: | ---: | --- |
  | display | clamp(2.85rem, 5vw, 4.65rem) | 0.94 | hero statement |
  | h1 | clamp(2.4rem, 5vw, 4.7rem) | 0.98 | page title |
  | h2 | clamp(1.8rem, 3vw, 2.8rem) | 1.05 | section title |
  | h3 | 1.35rem | 1.18 | post title |
  | body | 1rem | 1.62 | reading text |
  | small | 0.875rem | 1.45 | metadata |
- Weights: 400/500/600/700 | Measure: 65 to 75ch | Tracking notes: display type uses tight tracking, labels use 0.08em, body stays open

## Color

- Strategy: a near-neutral off-white and deep pine create a focused reading base; coral is reserved for action and state. The palette leaves the indigo and violet AI default behind and keeps color useful for hierarchy.
- Distribution: 60 neutral / 30 brand / 10 accent
- Palette (role -> OKLCH | hex):
  - bg: oklch(0.978 0.006 90) | #f8f8f5
  - surface: oklch(0.998 0.002 90) | #fffefd
  - surface-raised: oklch(0.95 0.009 90) | #efefeb
  - fg: oklch(0.21 0.014 80) | #302f2b
  - muted: oklch(0.49 0.022 80) | #77746e
  - border: oklch(0.875 0.012 90) | #d8d8d1
  - brand: oklch(0.405 0.095 168) | #176c5b
  - brand-soft: oklch(0.9 0.038 165) | #d2e9df
  - accent: oklch(0.625 0.18 42) | #d56535
  - accent-fg: oklch(0.98 0.012 92) | #fffdfa
  - success / warning / error: oklch(0.52 0.12 150) / oklch(0.73 0.14 83) / oklch(0.56 0.17 26) | #3d8a62 / #b98224 / #bd4c3a
- Dark mode overrides: bg oklch(0.185 0.022 76), surface oklch(0.235 0.025 76), surface-raised oklch(0.285 0.034 78), fg oklch(0.93 0.018 92), muted oklch(0.7 0.032 82), border oklch(0.38 0.035 80), brand oklch(0.72 0.1 166), accent oklch(0.73 0.14 42)

## Spacing, radius, shadow

- Spacing base: 4px, scale: 1, 2, 3, 4, 6, 8, 10, 14, 18 | default product spacing favors 8 to 20px groups
- Radius: independent control/surface radii (crisp, soft, or round presets), 999px only for status/progress tracks
- Shadow approach: a restrained none/soft/strong elevation scale is used only for primary surfaces and overlays; controls use borders and state fills. Do not stack diffuse shadows on every element.
- Runtime spacing: the studio and `commonplace.set_spacing` tool edit the page, top bar, sidebar, section, feed, rail, group, hero, quote, reader, sheet, control, button, card, column, and artwork measures.
- The base shadcn primitives do not receive blanket app padding; each surface adds only the inset its content needs. Article rows use a compact contextual inset on desktop and return to edge-aligned separators on mobile.

## Layout and composition

- Grid: 12-column adaptive layout with an editorial content measure and a persistent agent rail; the modern projection is a plain neutral canvas by default, with blueprint/ruled grids remaining opt-in tools
- Spacing rhythm: 8 to 16px inside a control group, 20 to 32px between related surfaces, 32 to 48px between sections
- Signature layout move: the hero pairs the primary welcome with a live personal-surface sidecar, while the agent rail keeps tool affordances in the page margin
- Density: balanced, tightening into dense for task-focused mood adaptations | Scanning: F-shaped feed scan with a compact rail scan
- Responsive: desktop-first composition that collapses to a stacked reading flow on narrow screens; breakpoints at 1160px, 860px, and 640px

## Components and states

- Button hierarchy: primary filled coral, secondary outlined pine, tertiary quiet text; all have hover, active, focus, disabled, and loading states
- Inputs: visible label or labelled placeholder, immediate local validation, errors keep the entered value and explain the next action
- Tables: not used in the main reading surface; tool list aligns names left and counts right with tabular numerals
- Overlays: right-side studio, tool inspector, and voice sheets plus a centered full-article editor and reader; focus returns to the trigger and Escape closes them. Article deletion is explicit and visually marked as destructive.
- Empty / loading / error: teach the user what action creates value, use skeleton rules for loading, and give a retry plus plain-language failure copy
- Focus ring: 3px brand-soft outline with 2px offset, never removed

## Motion

- Interaction model: immediate state changes; the modern surface does not use easing, delayed movement, or decorative AI motion
- Reduced motion: the same instant behavior is preserved, with the studio preference and operating-system preference still honored
- What moves: nothing by default; focus rings and status changes remain legible through color, borders, labels, and layout changes rather than animation

## Iconography

- Set: Lucide React line icons | grid: 24px | stroke: 1.8px | caps/joins: round | radius match: yes

## Imagery and illustration

- Mode: CSS-built editorial fragments and small abstract thumbnails made from paper textures, rules, and color blocks. No stock imagery is required for the product proof.
- Rules: images should feel like pages, not marketing hero art. Keep visual noise low and use repeated motifs for recognition.
- Avoid: stock people, glowing AI orbs, gradient blobs, and decorative illustrations that compete with the reading column
- Text-over-image contrast: captions sit in a solid surface band or use a high-contrast ink treatment

## Dark mode (if in scope)

- Base bg: near-black with warm hue at L 0.185 | fg: soft paper at L 0.93 | elevation ramp: +0.05 lightness per raised level
- Accent (dark): lighter, lower-chroma coral | border: warm lightness step above the surface

## Accessibility

- Contrast: AA target for all text and controls in both modes, verified with browser inspection and a contrast audit before release
- Focus: visible, managed, and returned after overlays close
- Keyboard: navigation, tabs, toggles, sliders, dialogs, and tool inspection are operable without a pointer | Targets: at least 24px, 44px preferred for icon buttons
- Color independence: labels and icons accompany status color | Reduced motion: supported through prefers-reduced-motion and a studio toggle
- Notes: text remains readable at 200% zoom; voice is an enhancement, not the only route to any action

## Tokens (source of truth)

```css
:root {
  --font-display: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-14: 3.5rem;
  --space-18: 4.5rem;
  --radius-control: 6px;
  --radius-pill: 999px;
  --color-bg: oklch(0.975 0.018 92);
  --color-surface: oklch(0.995 0.009 92);
  --color-fg: oklch(0.255 0.025 76);
  --color-muted: oklch(0.53 0.038 76);
  --color-border: oklch(0.84 0.038 80);
  --color-brand: oklch(0.42 0.095 168);
  --color-accent: oklch(0.66 0.16 42);
  --color-accent-fg: oklch(0.98 0.012 92);
  --radius-control: 6px;
  --radius-surface: 18px;
  --border-width: 1px;
  --page-padding: 34px;
  --section-gap: 30px;
  --feed-gap: 12px;
  --card-padding: 20px;
  --grid-size: 32px;
  --grid-opacity: 18%;
}
```

- Adapter: plain CSS custom properties with React state projecting the editable variables; safe custom CSS color values are accepted through the WebMCP sanitizer and the studio fields. The `Layout`, `Spacing`, `Type`, `Shape`, `Color`, and `Content` tabs deliberately map to the same serializable tool schema.

## Cards and surfaces

- Cards/surfaces: semantic border width, independently tunable surface radius, 12 to 42px contextual card padding, restrained soft elevation on primary groups | nesting: avoid cards inside cards; use rule groups and spacing instead. Article cards support standard, compact, and magazine layouts plus left/right artwork.

## Slop audit

- Date: 2026-08-29 | Result: pass after web-guided anti-pattern review and live browser screenshots
- Notes: reviewed the shell against Microsoft's Human-AI Interaction guidelines, Google's People + AI guidance, and NN/G's AI UX anti-patterns. Removed vague capability copy, exposed the page-local scope of personalization, made voice capabilities and confirmation boundaries visible, added a manual-control fallback message, removed decorative topbar translucency and hover lift, raised core reading/action copy to a readable size, and replaced the stale hard-coded homepage date with the current date. The surface still keeps a visible reset path, explicit tool registration, retryable voice errors, and a normal non-voice route for every task. Responsive screenshots also caught and fixed clipped studio tabs, overlapping tool rows, a too-small mobile article affordance, desktop navigation centering drift, clipped tool-preview data, and a two-column editor field mismatch. No purple AI gradient, decorative orb, nested card grid, opaque AI persona, or color-only status signal remains in the modern projection.

## Changelog

- 2026-08-26: Created the Commonplace visual system for a warm, editable, WebMCP-first reading workspace.
- 2026-08-27: Replaced the initial component layer with shadcn/ui source-owned primitives and Lucide React icons.
- 2026-08-27: Refined default card insets, removed redundant sidebar status copy, widened Radix surfaces, and tuned motion after browser review.
- 2026-08-27: Expanded the shared customization model and WebMCP contract so layout blocks, ordering, typography, spacing, surfaces, visibility, feed view, and exact colors are agent-addressable.
- 2026-08-27: Added the scoped modern presentation adapter and live personal-surface sidecar after Chrome research of Geist and Linear patterns; tool and voice layers remain unchanged.
- 2026-08-27: Expanded the studio into six control families, normalized spacing through live CSS tokens, added editable surface copy and post layout controls, and exposed 44 WebMCP/Realtime actions including fully tool-controlled article editing and CRUD.
- 2026-08-29: Refreshed the modern projection around shadcn registry patterns and Origin/Kibo-style composable controls: neutralized the default canvas, tightened hierarchy and motion, reduced rail card stacking, widened overlays, and made the article editor use its extra width.
- 2026-08-29: Applied an AI interaction anti-pattern pass: clarified agent scope and limits, surfaced confirmation boundaries and local persistence, improved fallback language, removed decorative translucency/hover motion, increased readable UI text, and made the homepage date current.
- 2026-08-29: Completed the screenshot-led responsive pass: made tool rows wrap, changed mobile studio tabs to a visible grid, enlarged the mobile article hit area, made modern interactions immediate with no animation or transition easing, and returned overlay focus to the invoking control.
- 2026-08-29: Completed the close-crop layout pass: aligned desktop navigation content, made tool previews readable and copyable, removed backdrop blur, normalized the article editor field grid, differentiated tool icons, and clarified mobile Tools/Write actions.
- 2026-08-29: Closed the final responsive crop gaps: made post titles and metadata respect narrow card columns, contained the medium-width sidebar tagline, kept mobile studio tabs at intrinsic height, removed mobile topbar overlap during feed scrolling, and collapsed the agent rail before the main column becomes too narrow.
