# Tokens

Source: `src/tokens/`. After any change run `bun run generate` and commit the regenerated
`src/tailwind/preset.js`, `src/css/theme.css`, `src/css/base.css`, and `src/css/fonts-web.css`.

## Visual language

Warm "reading room": cream paper surfaces, white cards with hairline borders, deep green as
the single brand color, amber reserved for gamification (streaks/XP/rewards), terracotta for
likes and destructive actions, plus a rarity/rank ladder (grey→green→blue→gold) confined to
badges and standing. Geist (single grotesque family, four weights) carries all
text: 700 titles, 600 emphasis, 500 labels, 400 body; display sizes use negative tracking.
Buttons and chips are pills; cards use 16px radius. Chosen for long reading/watching
sessions (light, low-glare, high contrast for a 30–45 audience).

## Semantic colors (use these, never primitives, never hex)

| Token | Class examples | Use |
|---|---|---|
| `paper` | `bg-paper` | App/page background |
| `surface` | `bg-surface` | Cards, inputs, bars |
| `surface-sunken` | `bg-surface-sunken` | Wells, segmented track, skeletons |
| `surface-hover` / `surface-press` | `hover:bg-surface-hover` | Interactive states. Hover/press are ONE translucent black wash (5% / 10%) — identical on every background; use this pair on every TRANSPARENT-RESTING pressable (rows, icon buttons, tabs, ghost buttons). A translucent bg REPLACES an opaque fill (the element goes see-through and composites with the PAGE instead — reads darker, like a double hover), so FILLED controls use precomputed fill+wash colors instead: white fills → `surface-solid-hover`/`-press` (#F2F2F2/#E6E6E6), sunken chips → `surface-sunken-hover`/`-press` (sand-300/400), brand fills → `brand-strong`/`brand-deep`, tonal fills → `hover:bg-brand/20 active:bg-brand/30` (same for `danger`). |
| `ink` / `ink-secondary` / `ink-muted` / `ink-faint` | `text-ink-secondary` | Text hierarchy. `muted` is the floor for readable text incl. placeholders; `faint` is decorative only (chevrons, dividers) |
| `ink-inverse` | `text-ink-inverse` | Text on dark/brand fills |
| `line` / `line-strong` | `border-line` | Hairlines; `-strong` for inputs/emphasis |
| `focus` | `focus:border-focus` | Focus rings/borders |
| `brand` / `brand-strong` / `brand-deep` | `bg-brand` | Primary actions; strong/deep = hover/pressed |
| `brand-subtle` / `brand-faint` | `bg-brand-subtle` | Tonal fills, selected states |
| `on-brand` | `text-on-brand` | Text/icons on brand fills |
| `accent` / `accent-strong` / `accent-subtle` | `bg-accent-subtle` | Gamification only. `accent` fails contrast as text — use `accent-strong` for text |
| `heat-1` … `heat-4` | `bg-heat-3` | Activity-grid intensity ramp only (light→dark). Level 0 is `surface-sunken`, not a heat token |

| `danger` / `danger-strong` / `danger-subtle` | `text-danger` | Destructive |
| `like` | `text-like` | Filled like/heart |
| `success` | `text-success` | Confirmations |
| `overlay` | `bg-overlay` | Scrims |
| `rarity-{common,uncommon,rare,legendary}-{bg,line,ink}` | `bg-rarity-rare-bg` | Badge rarity. Grey → green → blue → gold. Legendary is the only FILLED tier (`-bg` is solid amber, `-ink` is near-white) |
| `rarity-{tier}-{top,bottom}` | JS only | The medal's lit face gradient. `-bg` stays the flat value the rarity `Pill` uses; these two are read by `badgeMedalSvg` and never as classes. Kept close together on purpose — a wide ramp turns to mud at 28px |
| `rank-{beginner…master}` | `text-rank-mentor` | One hue per rung of the standing ladder: stone, bronze, green, blue, violet, gold |

Primitive scales (`green`, `sand`, `ink`, `amber`, `clay`, `steel`, `violet`, `bronze`) exist
for the rare case a semantic token genuinely doesn't fit (e.g. avatar duos) — prefer adding a
semantic token instead. `steel`, `violet` and `bronze` exist only to complete the
gamification ladders and have no other use; amber doubles as the gold.

**Why gamification breaks the one-brand-colour rule.** Everywhere else, colour means brand or
status. Rarity and rank are the exception on purpose: grey → green → blue → gold is a ladder
players read without a legend, which is what the PRD's no-tooltip rule needs, and a
brand-green-only ramp made adjacent tiers indistinguishable. Confine these tokens to badges
and rank insignia; nothing else in the product should wear them.

## Typography

Families (weight-specific TTFs — never combine with `font-bold`/`font-semibold` weight
utilities; Android cannot synthesize weights for custom fonts):

| Class | Font |
|---|---|
| `font-display` | Geist 700 |
| `font-body` | Geist 400 |
| `font-body-md` | Geist 500 |
| `font-body-bold` | Geist 600 |

Sizes `text-xs`(12/16) `sm`(14/20) `md`(15/22, dense body copy: feed bodies, list rows,
sidebar) `base`(16/24) `lg`(18/26) `xl`(20/28) `2xl`(24/30) `3xl`(28/34).
Prefer the `Text` component's `variant` (and `size` prop for scale steps) over raw classes.

## Shape, elevation, layout

- Radii: `rounded-sm` 8 · `md` 10 · `lg` 12 (controls/inputs) · `xl` 16 (cards) · `2xl` 20 ·
  `3xl` 28; pills use `rounded-full`.
- Shadows: `shadow-card` (resting cards), `shadow-pop` (menus/overlays). Hairline borders do
  most elevation work; shadows stay soft and warm.
- Widths: `max-w-reading` 760 (the single content column on every screen) · `max-w-modal`
  440 (auth column, picker overlays) · `w-sidebar` 264 · `w-rail` 300 · `max-w-shell` 1384
  (sidebar + main column + right rail as one centered block: 264 + 820 + 300; the desktop
  top bar caps its content at the same width so it sits on that axis). Breakpoint for the
  desktop shell: `lg` (1024px).

## Consuming

- **onli-app** (Tailwind 3 / NativeWind): `presets: [require("@onli/ui/tailwind/preset")]`
  in `tailwind.config.js`; load `fonts` from `@onli/ui` via expo-font before first render.
- **onli-admin / landing** (Tailwind 4): `@import "tailwindcss";` then
  `@import "@onli/ui/css/theme.css";`, `@import "@onli/ui/css/fonts-web.css";`, and
  `@import "@onli/ui/css/base.css";` — in that order.
- **css/fonts-web.css** (GENERATED, web consumers only): the family tokens name
  weight-specific TTF families (`Geist_600SemiBold`) that only expo-font can register, so on
  the web they resolve to nothing and text silently falls back to the system sans. This file
  re-points all four family tokens at the single Google-hosted `Geist` family and applies the
  matching weight to `.font-display` / `.font-body-bold` / `.font-body-md` / `.font-body`
  (Tailwind v4 has no `--font-*--font-weight` modifier, so the weights ship as base-layer
  rules). The class vocabulary is unchanged — weight utilities stay banned in web consumers
  too. The host HTML must load Geist; the file's header comment carries the exact
  `<link>` tags.
- **css/base.css** (GENERATED, all web consumers): shared base styles — currently the
  app-wide thumb-only scrollbar treatment, with token hexes baked in so it works under
  any Tailwind version. onli-app imports it in `app/_layout.tsx` (web no-op on native);
  onli-admin `@import`s it in `src/index.css` after tailwindcss.
