/**
 * One family (Geist), four weights: 700 display, 600 emphasis, 500 labels, 400 body.
 * Families are weight-specific TTF names (Android has no synthetic bolding for custom
 * fonts), so never combine a `font-*` family with font-weight utilities — pick the
 * weighted family instead.
 */

export const fontFamilies = {
  display: "Geist_700Bold",
  body: "Geist_400Regular",
  "body-md": "Geist_500Medium",
  "body-bold": "Geist_600SemiBold",
} as const;

/**
 * The weight each family stands for. Native loads one TTF per weight, so the family name
 * carries the weight; the web has a single `Geist` family, so web consumers re-point the
 * family tokens at it and apply these weights instead (see src/css/fonts-web.css).
 */
export const fontWeights = {
  display: 700,
  body: 400,
  "body-md": 500,
  "body-bold": 600,
} as const;

/** Family name web consumers load from Google Fonts. */
export const webFontFamily = "Geist";

/** [fontSize, lineHeight] in px. */
export const fontSizes = {
  xs: [12, 16],
  sm: [14, 20],
  // between sm and base: dense body copy (feed bodies, list rows, sidebar)
  md: [15, 22],
  base: [16, 24],
  lg: [18, 26],
  xl: [20, 28],
  "2xl": [24, 30],
  "3xl": [28, 34],
} as const;
