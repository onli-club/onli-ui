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
  },
  ink: {
    900: "#20281F",
    700: "#232B26",
    500: "#57635C",
    // 400 must stay ≥4.5:1 on white — it carries captions and metadata
    400: "#6B776F",
    300: "#A9B2AA",
  },
  amber: {
    100: "#FAEDD4",
    300: "#EFC788",
    500: "#DE9A3D",
    600: "#B87B23",
    700: "#95601A",
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
  line: "#E8E5DC",
  "line-strong": primitives.sand[400],
  focus: primitives.green[500],

  // brand
  brand: primitives.green[600],
  "brand-strong": primitives.green[700],
  "brand-deep": primitives.green[800],
  "brand-subtle": primitives.green[100],
  "brand-faint": primitives.green[50],
  "on-brand": primitives.sand[50],

  // activity heat ramp (contribution grid); level 0 uses surface-sunken
  "heat-1": primitives.green[200],
  "heat-2": primitives.green[400],
  "heat-3": primitives.green[600],
  "heat-4": primitives.green[800],

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
   * games already taught everyone — grey, green, blue, gold — and a badge 90% of members
   * hold must not share a hue with one 1% hold. Legendary is the only filled tier.
   */
  "rarity-common-bg": primitives.sand[200],
  "rarity-common-line": primitives.sand[400],
  "rarity-common-ink": primitives.ink[400],
  "rarity-uncommon-bg": primitives.green[100],
  "rarity-uncommon-line": primitives.green[300],
  "rarity-uncommon-ink": primitives.green[600],
  "rarity-rare-bg": primitives.steel[100],
  "rarity-rare-line": primitives.steel[300],
  "rarity-rare-ink": primitives.steel[600],
  "rarity-legendary-bg": primitives.amber[500],
  "rarity-legendary-line": primitives.amber[700],
  "rarity-legendary-ink": primitives.sand[50],

  /**
   * Medal gradient stops. `-bg` stays the flat value the rarity Pill uses; these two are the
   * lit top and the shaded bottom of the struck face, so a medal reads as an object with a
   * light source rather than a coloured chip. Kept deliberately close together — a wide ramp
   * turns to mud at the 28px the medal is smallest at.
   */
  "rarity-common-top": "#FAF8F5",
  "rarity-common-bottom": "#DFDBD1",
  "rarity-uncommon-top": "#EFF8F2",
  "rarity-uncommon-bottom": "#B9D4C6",
  "rarity-rare-top": "#F1F6FD",
  "rarity-rare-bottom": "#B9D2EE",
  "rarity-legendary-top": "#F0B75F",
  "rarity-legendary-bottom": "#B8781A",

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

  /**
   * Rank emblem gradient stops, same job as `rarity-*-{top,bottom}`: the lit top and shaded
   * bottom of a struck mark. The flat `rank-*` value above stays the base the pair is built
   * around, and is what a future flat use would take.
   */
  "rank-beginner-top": "#7C8781",
  "rank-beginner-bottom": "#646F68",
  "rank-enthusiast-top": "#C08349",
  "rank-enthusiast-bottom": "#9C6733",
  "rank-practitioner-top": "#2E7A62",
  "rank-practitioner-bottom": primitives.green[700],
  "rank-specialist-top": "#4179B5",
  "rank-specialist-bottom": primitives.steel[700],
  "rank-mentor-top": "#9270C9",
  "rank-mentor-bottom": primitives.violet[600],
  "rank-master-top": "#D49A3A",
  "rank-master-bottom": primitives.amber[700],

  overlay: "rgba(32, 40, 31, 0.45)",
} as const;

export type SemanticColor = keyof typeof semantic;
