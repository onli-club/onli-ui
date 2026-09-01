# onli-ui — Onli design system

Token-first design system shared by `onli-app` (NativeWind 4 / Tailwind 3.4), `onli-admin`
(Tailwind 4), and the future landing page. Plan and cross-repo decisions:
`onli-server/docs/DESIGN-SYSTEM.md`.

## Structure
- `src/tokens/` — the ONLY place color/type/shape values live. Components and consumer apps
  use semantic Tailwind classes (`bg-surface`, `text-ink-secondary`, `border-line`,
  `bg-brand`…), never raw hex.
- `src/tailwind/preset.js` + `src/css/theme.css` + `src/css/base.css` +
  `src/css/fonts-web.css` — GENERATED. After editing tokens run `bun run generate` and
  commit the outputs.
- `src/native/` — React Native components (NativeWind classNames), shipped as TypeScript
  source; the consuming app's Metro/babel compiles them.
- `src/fonts.ts` — expo-font map (Geist 400/500/600/700; one family, weight-specific TTFs).
  Web consumers can't register those per-weight families, so they load Geist from Google
  Fonts and `@import` `src/css/fonts-web.css`, which re-points the family tokens and applies
  the weights.

## Rules specific to this repo
- Fonts are weight-specific families: never use `font-semibold`/`font-bold` weight utilities
  on text — use `font-body-md`/`font-body-bold` (Android can't synthesize bold for custom fonts).
- Light theme only for now, but keep everything semantic so dark mode is a token-map change.
- No new runtime dependencies; anything a component needs must be a peerDependency the app
  already has (react-native-svg, lucide-react-native, expo-font, the two font packages).
- Consumers install this repo from git (`"@onli/ui": "github:onli-club/onli-ui#main"`), so a
  change is only visible to them once it is pushed and they run `bun update @onli/ui`; onli-app's Metro
  serves the sibling checkout live for local work. Breaking API changes must be applied to
  `onli-app` in the same working session.

## Commands
```
bun run generate    # tokens -> preset.js + theme.css
bun run typecheck
bun run lint
bun run format
```
Run lint and typecheck before declaring a task done.

## Working rules (Himanshu, 2026-08-24)
- **Never run servers** (dev or otherwise). Himanshu runs them manually; if one is needed for verification, ask and wait.
- **No production builds for testing** when they disrupt the local workflow.
- **Minimal comments**: only where code does not explain itself or something is non-obvious.
- **docs/ stays current**: every change updates the relevant doc in `docs/` in the same commit.
- **.env.example is committed and always up to date** with every env var the repo reads (this repo currently reads none).
- **Plans**: repo-specific plans go in this repo's `docs/`; inter-repo plans go in `onli-server/docs/`.
- **No assumptions**: when anything is ambiguous or underspecified, ask Himanshu instead of deciding on your own.
- **Never `git add` or `git commit`**: leave all changes unstaged; Himanshu stages and commits himself.
