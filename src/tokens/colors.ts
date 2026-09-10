/**
 * Single source of truth for color. Components and apps use SEMANTIC names only;
 * primitives exist so future themes (dark) remap semantics without touching consumers.
 */

export const primitives = {
  green: {
    50: "#EFF5F1",
    100: "#DFEBE4",
    200: "#BFD7CB",
    300: "#95BAA8",
    400: "#639A80",
    500: "#3B7D62",
    600: "#20614E",
    700: "#1A4F40",
    800: "#143D32",
    900: "#0E2B24",
  },
  // barely-warm neutrals; toned down from the original cream (2026-08-26, too yellow)
  sand: {
    50: "#FDFCFA",
    100: "#F8F7F4",
    200: "#F1EFEA",
    300: "#E8E5DE",
    400: "#D7D3C9",
    500: "#B5B0A2",
    // pewter: the common tier's solid face, dark enough to carry a white glyph
    600: "#8A8578",
  },
  ink: {
    900: "#20281F",
    700: "#232B26",
    500: "#57635C",
    // 400 must stay ≥4.5:1 on sunken (#F1EFEA), not just white — it carries captions,
    // placeholders, inactive tabs and neutral pills on every surface (was #6B776F: 4.07 on sunken)
    400: "#5D6961",
    300: "#A9B2AA",
  },
  amber: {
    100: "#FAEDD4",
    300: "#EFC788",
    500: "#DE9A3D",
    600: "#B87B23",
    700: "#95601A",
    // deep bronze: the gold tier's rim, which amber-700 was too close to the face to be
    800: "#6F4712",
  },
  // gamification hues. The rarity ladder players already read is grey -> green -> blue ->
  // gold, so blue and violet exist purely to complete it; amber doubles as the gold.
  steel: {
    100: "#E4EDF8",
    300: "#93B6E0",
    500: "#4A7CB5",
    600: "#2F6098",
    700: "#264E7C",
  },
  violet: {
    100: "#EDE8F9",
    300: "#B8A0E2",
    500: "#7A56B5",
    600: "#63449A",
    700: "#4F357C",
  },
  bronze: {
    500: "#B4763C",
    600: "#96602F",
  },
  clay: {
    100: "#F9E5DE",
    400: "#D06A52",
    500: "#C9573F",
    600: "#A83F2C",
    700: "#8A3222",
  },
} as const;

export const semantic = {
  // surfaces
  paper: primitives.sand[100],
  surface: "#FFFFFF",
  "surface-sunken": primitives.sand[200],
  // hover/press are one translucent black wash (Himanshu, 2026-08-27) so the step
  // is identical on every background. Only for transparent-resting pressables:
  // on an opaque fill a translucent bg REPLACES the fill (making it lighter), so
  // filled controls darken their own fill instead (sunken → sunken-hover, brand →
  // brand-strong, tonal → bg-brand/20 overlays).
  "surface-hover": "rgba(0, 0, 0, 0.05)",
  "surface-press": "rgba(0, 0, 0, 0.1)",
  // white (surface) fills: white composited with the 5%/10% wash
  "surface-solid-hover": "#F2F2F2",
  "surface-solid-press": "#E6E6E6",
  "surface-sunken-hover": primitives.sand[300],
  "surface-sunken-press": primitives.sand[400],

  // text
  ink: primitives.ink[700],
  "ink-secondary": primitives.ink[500],
  "ink-muted": primitives.ink[400],
  "ink-faint": primitives.ink[300],
  "ink-inverse": primitives.sand[50],

  // borders
  line: primitives.sand[300],
  "line-strong": primitives.sand[400],
  // text-field boundary: ≥3:1 on white/paper (WCAG 1.4.11); line-strong stays for buttons,
  // spinners and emphasis where a heavy border would be wrong
  "line-input": "#858D85",
  focus: primitives.green[500],

  // brand
  brand: primitives.green[600],
  "brand-strong": primitives.green[700],
  "brand-deep": primitives.green[800],
  "brand-subtle": primitives.green[100],
  "brand-faint": primitives.green[50],
  "on-brand": primitives.sand[50],

  // activity heat ramp (contribution grid); level 0 uses surface-sunken. Starts at green-400
  // so a one-action day is ≥3:1 against the white card (green-200 was 1.5:1, invisible)
  "heat-1": primitives.green[400],
  "heat-2": primitives.green[500],
  "heat-3": primitives.green[700],
  "heat-4": primitives.green[900],

  // accent (streaks, XP, highlights)
  accent: primitives.amber[500],
  "accent-strong": primitives.amber[700],
  "accent-subtle": primitives.amber[100],

  // status
  danger: primitives.clay[600],
  "danger-strong": primitives.clay[700],
  "danger-subtle": primitives.clay[100],
  like: primitives.clay[500],
  success: primitives.green[500],

  /**
   * Badge rarity. Deliberately NOT the brand ramp: rarity is read fastest in the colours
   * games already taught everyone — pewter, green, blue, gold — and a badge 90% of members
   * hold must not share a hue with one 1% hold.
   *
   * One triple per tier, and the medal and the Pill spend it the same way: `-bg` is the SOLID
   * face, `-line` the darker rim around it, `-ink` the glyph and the label sitting on that
   * face. Solid, not tinted: an outlined medal on a light face reads as washed out next to the
   * game badges this ladder borrows from (Himanshu, 2026-09-08). Every face is therefore dark
   * enough to carry a white glyph at 3:1 or better — that constraint, not brightness, is what
   * picks each value.
   */
  "rarity-common-bg": primitives.sand[600],
  "rarity-common-line": primitives.ink[400],
  "rarity-common-ink": primitives.sand[50],
  "rarity-uncommon-bg": primitives.green[500],
  "rarity-uncommon-line": primitives.green[700],
  "rarity-uncommon-ink": primitives.sand[50],
  "rarity-rare-bg": primitives.steel[500],
  "rarity-rare-line": primitives.steel[700],
  "rarity-rare-ink": primitives.sand[50],
  "rarity-legendary-bg": primitives.amber[600],
  "rarity-legendary-line": primitives.amber[800],
  "rarity-legendary-ink": primitives.sand[50],

  /**
   * Rank tiers, one hue per rung, so an insignia is identifiable on its own rather than only
   * next to its neighbours. Same ladder logic as rarity, extended: stone, bronze, the
   * community's own green at the rung where bylines start showing standing, then blue,
   * violet and gold.
   */
  "rank-beginner": primitives.ink[400],
  "rank-enthusiast": primitives.bronze[500],
  "rank-practitioner": primitives.green[600],
  "rank-specialist": primitives.steel[600],
  "rank-mentor": primitives.violet[500],
  "rank-master": primitives.amber[600],

  overlay: "rgba(32, 40, 31, 0.45)",
} as const;

export type SemanticColor = keyof typeof semantic;
