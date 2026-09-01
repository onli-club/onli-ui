import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { primitives, semantic } from "../src/tokens/colors";
import { layout, radii, shadows } from "../src/tokens/shape";
import { fontFamilies, fontSizes, fontWeights, webFontFamily } from "../src/tokens/typography";

const root = join(import.meta.dir, "..");
const banner = "GENERATED from src/tokens — edit tokens, then `bun run generate`.";

const colors: Record<string, string | Record<string, string>> = { ...semantic };
for (const [name, scale] of Object.entries(primitives)) {
  const entries = Object.fromEntries(Object.entries(scale).map(([k, v]) => [k, v]));
  const existing = colors[name];
  colors[name] = typeof existing === "string" ? { DEFAULT: existing, ...entries } : entries;
}

const preset = {
  theme: {
    extend: {
      colors,
      fontFamily: Object.fromEntries(Object.entries(fontFamilies).map(([k, v]) => [k, [v]])),
      fontSize: Object.fromEntries(
        Object.entries(fontSizes).map(([k, [size, line]]) => [k, [`${size}px`, `${line}px`]]),
      ),
      borderRadius: Object.fromEntries(Object.entries(radii).map(([k, v]) => [k, `${v}px`])),
      boxShadow: shadows,
      maxWidth: Object.fromEntries(Object.entries(layout).map(([k, v]) => [k, `${v}px`])),
      // fixed shell columns (w-sidebar / w-rail); content columns stay max-widths
      width: { sidebar: `${layout.sidebar}px`, rail: `${layout.rail}px` },
    },
  },
};

writeFileSync(
  join(root, "src/tailwind/preset.js"),
  `// ${banner}\nmodule.exports = ${JSON.stringify(preset, null, 2)};\n`,
);

const cssVars: string[] = [];
for (const [name, value] of Object.entries(semantic)) cssVars.push(`  --color-${name}: ${value};`);
for (const [name, scale] of Object.entries(primitives))
  for (const [step, value] of Object.entries(scale))
    cssVars.push(`  --color-${name}-${step}: ${value};`);
for (const [name, family] of Object.entries(fontFamilies))
  cssVars.push(`  --font-${name}: "${family}", ui-sans-serif, system-ui, sans-serif;`);
for (const [name, [size, line]] of Object.entries(fontSizes)) {
  cssVars.push(`  --text-${name}: ${size}px;`);
  cssVars.push(`  --text-${name}--line-height: ${line}px;`);
}
for (const [name, value] of Object.entries(radii)) cssVars.push(`  --radius-${name}: ${value}px;`);
for (const [name, value] of Object.entries(shadows)) cssVars.push(`  --shadow-${name}: ${value};`);
for (const [name, value] of Object.entries(layout))
  cssVars.push(`  --container-${name}: ${value}px;`);

writeFileSync(
  join(root, "src/css/theme.css"),
  `/* ${banner} Tailwind v4 consumers: @import this after tailwindcss. */\n@theme {\n${cssVars.join("\n")}\n}\n`,
);

// biome formats css hex lowercase
const thumb = semantic["line-strong"].toLowerCase();
const thumbHover = semantic["ink-faint"].toLowerCase();
const baseCss = `/* ${banner} Shared web base styles; import after the Tailwind entry. */

/* All scrollbars: pill thumb only, no track. */
* {
  scrollbar-width: thin;
  scrollbar-color: ${thumb} transparent;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: ${thumb};
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: ${thumbHover};
}
::-webkit-scrollbar-corner {
  background: transparent;
}
`;
writeFileSync(join(root, "src/css/base.css"), baseCss);

// Native registers one TTF per weight, so `font-body-bold` names a family. The web has a
// single `Geist` family, so the family tokens are re-pointed at it and the weight is applied
// separately — Tailwind v4 has no `--font-*--font-weight` modifier, hence the base rules.
const webStack = `"${webFontFamily}", ui-sans-serif, system-ui, sans-serif`;
const webFamilyVars = Object.keys(fontFamilies)
  .map((name) => `  --font-${name}: ${webStack};`)
  .join("\n");
const webWeightRules = Object.entries(fontWeights)
  .map(([name, weight]) => `  .font-${name} {\n    font-weight: ${weight};\n  }`)
  .join("\n");
const fontsWebCss = `/* ${banner} Web consumers only; @import after theme.css.
   Requires ${webFontFamily} from Google Fonts — add to the host HTML <head>:
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${webFontFamily}:wght@${Object.values(
     fontWeights,
   )
     .slice()
     .sort((a, b) => a - b)
     .join(";")}&display=swap"> */
@theme {
${webFamilyVars}
}

@layer base {
${webWeightRules}
}
`;
writeFileSync(join(root, "src/css/fonts-web.css"), fontsWebCss);

console.log(
  "wrote src/tailwind/preset.js, src/css/theme.css, src/css/base.css, and src/css/fonts-web.css",
);
