# @onli/ui

Onli's design system: design tokens (one TypeScript source generating a Tailwind 3 preset
for the Expo app and a Tailwind 4 `@theme` for web consumers) plus a React Native component
library styled with NativeWind.

- Tokens and visual language: [docs/TOKENS.md](docs/TOKENS.md)
- Components: [docs/COMPONENTS.md](docs/COMPONENTS.md)
- Cross-repo plan: `onli-server/docs/DESIGN-SYSTEM.md`

```
bun install
bun run generate   # regenerate preset.js, theme.css, base.css, and fonts-web.css from src/tokens
bun run typecheck && bun run lint
```
