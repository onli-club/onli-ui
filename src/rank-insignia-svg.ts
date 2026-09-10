import { isRankKey, rankArt, rankArtPalette } from "./rank-art";

/**
 * A rank emblem as one SVG string: a shield filled in the rung's own colour, with the rung's
 * drawing on top. The same construction as `badgeMedalSvg`, so a badge and an insignia sit
 * in one row as the same kind of object — and the same reasons it is a string rather than a
 * styled box (a CSS-painted fill can lag the tokens; this cannot).
 *
 * The frame is a shield because that is the one silhouette the badge frames deliberately
 * avoid (badge-medal-svg.ts): standing and badges must not be mistaken for each other, and
 * a shield is what games put a rank in. Every rung wears the same shield, so what changes
 * from rung to rung is the colour and the object, never the plaque.
 *
 * No `<defs>` and no `url(#…)`, ever: the emblem is inline SVG in a page that already holds
 * many others, and the gradient version painted the mark ENTIRELY through such references,
 * so it occupied its box and drew nothing on every screen (Himanshu, 2026-09-08).
 *
 * `muted` is a rung the member has not reached: the same drawing in the paper's greys, the
 * way a locked badge is, which is what makes reaching it read as a gain.
 */

/** Drawn in the same 48-unit box as the badges, so the two systems share one scale. */
const BOX = 48;

/**
 * Flat top with rounded shoulders, sides that fall straight to just below the middle, then
 * sweep to a point. 36 wide and 38 tall: a shield with a straight top reads larger than a
 * circle of the same width, so it comes in a little from the badges' 40.
 */
const SHIELD =
  "M10 5H38Q42 5 42 9V22.5C42 31.8 34.6 39.2 24 43.4C13.4 39.2 6 31.8 6 22.5V9Q6 5 10 5Z";

export function rankInsigniaSvg({
  rank,
  muted = false,
}: {
  rank: string | null | undefined;
  muted?: boolean;
}): string | undefined {
  if (!isRankKey(rank)) return undefined;
  const palette = rankArtPalette(rank, muted);
  const art = rankArt(rank, palette);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">` +
    `<path d="${SHIELD}" fill="${palette.bg}"/>${art}</svg>`
  );
}
