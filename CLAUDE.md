# onli-ui — Onli design system

Token-first design system shared by `onli-app` (NativeWind 4 / Tailwind 3.4), the web panels
`onli-admin` and `onli-creators` (Tailwind 4), and the future landing page. Plan and cross-repo decisions:
`onli-server/docs/DESIGN-SYSTEM.md`.

## Structure
- `src/tokens/` — the ONLY place color/type/shape values live. Components and consumer apps
  use semantic Tailwind classes (`bg-surface`, `text-ink-secondary`, `border-line`,
  `bg-brand`…), never raw hex.
- `src/tailwind/preset.js` + `src/css/theme.css` + `src/css/base.css` +
  `src/css/fonts-web.css` + `src/css/wordmark.css` — GENERATED. After editing tokens run `bun run generate` and
  commit the outputs.
- `src/native/` — React Native components (NativeWind classNames), shipped as TypeScript
  source; the consuming app's Metro/babel compiles them.
- `src/panel/` — the web panels' kit, entry `@onli/ui/panel` (plain React DOM + Tailwind 4,
  TypeScript source the panel's Vite compiles): the components, confirm and toasts, the API
  client (`VITE_API_URL`/`VITE_APP_URL` come from the panel's env), the query client with
  `useMe` and `signOut`, formatting, uploads and the video encoder, and `PanelShell` (sidebar,
  header, tab title). onli-admin and onli-creators import it; `onli-app` never does, and
  `src/index.ts` never re-exports it. Docs: `docs/COMPONENTS.md` → Panel kit.
- `src/css/panel.css` — HAND-WRITTEN, not generated (`generate` never touches it): the panels'
  motion tokens, keyframes, `dialog-open` variant and base layer, plus `@source "../panel"` so a
  panel's Tailwind scans `src/panel/` wherever the kit is read from.
- `src/fonts.ts` — expo-font map (Geist 400/500/600/700; one family, weight-specific TTFs).
  Web consumers can't register those per-weight families, so they load Geist from Google
  Fonts and `@import` `src/css/fonts-web.css`, which re-points the family tokens and applies
  the weights.

## Rules specific to this repo
- Fonts are weight-specific families: never use `font-semibold`/`font-bold` weight utilities
  on text — use `font-body-md`/`font-body-bold` (Android can't synthesize bold for custom fonts).
- Light theme only for now, but keep everything semantic so dark mode is a token-map change.
- No new runtime dependencies; anything a component needs must be a peerDependency the app
  already has (react-native-svg, lucide-react-native, react-native-reanimated — NativeWind's
  `transition-*` classes run on it, and `Button`/`Segmented` import it directly,
  @expo-google-fonts/geist). `expo-font` is the app's concern: the kit
  only exports the font map. The panel kit's peers are the panels' own dependencies:
  react-dom, lucide-react, @tanstack/react-router, @tanstack/react-query and mediabunny. Every
  peer but `react` is optional, so onli-app and onli-server, which install this package too,
  never pull in the other side's.
- Consumers install this repo from git (`"@onli/ui": "github:onli-club/onli-ui#main"`), so a
  change is only visible to them once it is pushed and they run `bun update @onli/ui`; onli-app's Metro
  serves the sibling checkout live for local work, and the two web panels read it live in Vite,
  Vitest and `tsc` (their `kit.ts` aliases and `tsconfig.app.json` `paths`). Breaking API changes must be applied to
  `onli-app` (and, in `src/panel`, to both panels) in the same working session.

## Commands
```
bun run generate    # tokens -> preset.js + theme.css
bun run typecheck   # tsconfig.json (everything but src/panel), then tsconfig.panel.json (src/panel: DOM, vite/client)
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
