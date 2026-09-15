# @onli/ui

Onli's design system: design tokens (one TypeScript source generating a Tailwind 3 preset
for the Expo app and a Tailwind 4 `@theme` for web consumers) plus a React Native component
library styled with NativeWind.

- Tokens and visual language: [docs/TOKENS.md](docs/TOKENS.md)
- Components: [docs/COMPONENTS.md](docs/COMPONENTS.md)
- Cross-repo plan: `onli-server/docs/DESIGN-SYSTEM.md`

```
bun install
bun run generate   # regenerate preset.js, theme.css, base.css, fonts-web.css, and tokens/dist from src/tokens
bun run typecheck && bun run lint
```

The React Native peer dependencies (including `react-native-reanimated` 4, which NativeWind 4 requires at runtime for the components' `transition-*` classes and whose CSS API Button, Segmented and Skeleton animate through) are declared optional so a web consumer (onli-admin, which only imports the CSS and icon maps) does not install them; onli-app declares them directly.
