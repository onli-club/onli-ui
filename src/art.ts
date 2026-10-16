import { semantic } from "./tokens/colors";

/** Badges and rank insignia are drawn in one 48-unit box, so the two systems share a scale. */
export const BOX = 48;

/** A path coordinate: at most two decimals, no trailing zeros. */
export const n = (v: number) => Number(v.toFixed(2)).toString();

export type BadgeArtPalette = {
  /** The frame's fill. */
  bg: string;
  /** The subject. White on every earned badge. */
  ink: string;
  /** Interior detail on the subject — lines on a sheet, a lit facet. */
  soft: string;
  /** The one accent that gives the subject an edge, and glyph detail cut back into the frame. */
  deep: string;
};

/** One drawing's body, painted in the palette it is given. */
export type Art = (p: BadgeArtPalette) => string;

/** The subject on every earned badge and reached rung. */
export const WHITE = "#FFFFFF";

/**
 * Not yet earned or reached: the same drawing in the paper's greys, so it is recognisably what
 * you get.
 */
export const LOCKED_PALETTE: BadgeArtPalette = {
  bg: semantic["line-strong"],
  ink: semantic["ink-inverse"],
  soft: "#C9C4B8",
  deep: "#9A9488",
};
