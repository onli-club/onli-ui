# @onli/ui

Onli's design system: design tokens (one TypeScript source generating a Tailwind 3 preset
for the Expo app and a Tailwind 4 `@theme` for web consumers) plus a React Native component
library styled with NativeWind.

`@onli/ui/panel` (`src/panel/`) is the web panels' kit, plain React DOM and Tailwind 4: the
components, the API and query clients, uploads and `PanelShell`, which onli-admin and
onli-creators both build on, with its CSS in `@onli/ui/css/panel.css` (hand-written). The app
never imports it. `bun run typecheck` checks it with its own `tsconfig.panel.json` (DOM and
`vite/client`).

- Tokens and visual language: [docs/TOKENS.md](docs/TOKENS.md)
- Components: [docs/COMPONENTS.md](docs/COMPONENTS.md) (the panel kit under "Panel kit")
- Cross-repo plan: `onli-server/docs/DESIGN-SYSTEM.md`

```
bun install
bun run generate   # regenerate preset.js, theme.css, base.css, fonts-web.css, and tokens/dist from src/tokens
bun run typecheck && bun run lint
```

The React Native peer dependencies (including `react-native-reanimated` 4, which NativeWind 4 requires at runtime for the components' `transition-*` classes and whose CSS API Button, Segmented and Skeleton animate through) are declared optional so a web consumer (the panels) does not install them; onli-app declares them directly. The panel kit's peers (`react-dom`, `lucide-react`, `@tanstack/react-router`, `@tanstack/react-query`, `mediabunny`) are optional the same way, so onli-app and onli-server never install them; the panels declare them directly.
