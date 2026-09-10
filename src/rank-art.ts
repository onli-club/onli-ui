import { type BadgeArtPalette, LOCKED_PALETTE } from "./badge-art";
import { semantic } from "./tokens/colors";

/**
 * Bespoke artwork, one drawing per rung of the standing ladder, keyed by the rung's permanent
 * `key`. The same treatment the badges got (badge-art.ts), applied to the six insignia: a
 * subject in white on a frame filled with the rung's own colour, with one lighter and one
 * darker tint for interior detail. Before this the emblems were flat single-colour
 * silhouettes on a grey disc, and beside the drawn badges they read as an older system.
 *
 * Same rules as the badge art, learned at the sizes these ship at (20, 28, 40):
 * - ONE bold subject per rung, and each rung a DIFFERENT object — games escalate the object,
 *   not its density, and neighbouring rungs must be tellable apart in isolation.
 * - Two or three flat fills. `ink` carries the subject, `soft` the lit facet or the wreath
 *   around it, `deep` the one shadow that gives it an edge.
 * - Nothing thinner than ~2 units.
 * - Nothing counts: no rung is "three of something".
 * - No `<defs>` and no `url(#…)` — the hard rule from badge-medal-svg.ts.
 *
 * Author against the shield frame in rank-insignia-svg.ts: it is 36 wide at the top and
 * narrows below y=23, so a subject sits a little above centre in a box roughly 12→36 across
 * and 10→36 down.
 */

/**
 * Each rung's own hue. `bg` is the `rank-*` token so the ladder colour stays in one place;
 * `soft` and `deep` are lighter and darker steps of the same hue, picked by eye against the
 * paper ground the way the badge hues were. Every `bg` carries white at 3:1 or better.
 */
const HUES: Record<RankKey, { bg: string; soft: string; deep: string }> = {
  beginner: { bg: semantic["rank-beginner"], soft: "#A3AEA7", deep: "#3F4843" },
  enthusiast: { bg: semantic["rank-enthusiast"], soft: "#DDB48A", deep: "#7C4D20" },
  practitioner: { bg: semantic["rank-practitioner"], soft: "#93C3B0", deep: "#123A2E" },
  specialist: { bg: semantic["rank-specialist"], soft: "#9DBEE4", deep: "#1C3E68" },
  mentor: { bg: semantic["rank-mentor"], soft: "#C0A9E6", deep: "#4B3277" },
  master: { bg: semantic["rank-master"], soft: "#F0CB8A", deep: "#6B4410" },
};

const WHITE = "#FFFFFF";

/**
 * Offset of the deep shadow under the arrow, bolt and crown. Small on purpose: the shield
 * narrows fast below y=30, and a 1.6-unit offset pushed the arrow's and crown's shadows
 * through the edge.
 */
const SHADOW = "1.2 1.4";

type Art = (p: BadgeArtPalette) => string;

const n = (v: number) => Number(v.toFixed(2)).toString();

/** Points of a five-pointed star, outer tip straight up. */
function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function poly(pts: { x: number; y: number }[], fill: string): string {
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${n(p.x)} ${n(p.y)}`).join("");
  return `<path d="${d}Z" fill="${fill}"/>`;
}

/**
 * A star with its right half lit: the whole star in `ink`, then the right-hand half redrawn
 * in `soft`. The half is the points with x >= cx plus the top tip and the bottom inner
 * vertex, both of which sit on the axis.
 */
function star(cx: number, cy: number, outer: number, inner: number, p: BadgeArtPalette) {
  const pts = starPoints(cx, cy, outer, inner);
  // indices: 0 top tip, 1-4 the right side, 5 bottom inner vertex (on the axis)
  const right = [pts[0], pts[1], pts[2], pts[3], pts[4], pts[5]];
  return poly(pts, p.ink) + poly(right, p.soft);
}

/**
 * A laurel cradle: two short branches curving up from the bottom centre, two leaves each,
 * angled outwards the way laurel grows, with the subject sitting ABOVE them. A full wreath
 * around the subject was tried first and lost at 28px — ring and star fought for the same
 * few pixels and read as a smudge; a cradle leaves the subject whole and still says laurel.
 * One colour, so it frames the subject instead of competing with it.
 */
function laurel(cx: number, cy: number, r: number, fill: string): string {
  const pt = (deg: number, rr: number) => {
    const a = (deg * Math.PI) / 180;
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a) };
  };
  const stem = (from: number, to: number, sweep: 0 | 1) => {
    const s0 = pt(from, r);
    const s1 = pt(to, r);
    return (
      `<path d="M${n(s0.x)} ${n(s0.y)}A${n(r)} ${n(r)} 0 0 ${sweep} ${n(s1.x)} ${n(s1.y)}" ` +
      `fill="none" stroke="${fill}" stroke-width="2.4" stroke-linecap="round"/>`
    );
  };
  const leaf = (deg: number, mirror: boolean) => {
    const c = pt(deg, r + 2);
    // along the tangent, then tilted outwards so the leaf leans away from the stem
    const rot = mirror ? deg + 90 - 32 : deg - 90 + 32;
    return (
      `<path d="M0 -5.4C3 -2.7 3 2.7 0 5.4C-3 2.7 -3 -2.7 0 -5.4Z" fill="${fill}" ` +
      `transform="translate(${n(c.x)} ${n(c.y)}) rotate(${n(rot)})"/>`
    );
  };
  // y grows downwards: 90° is the bottom of the circle, 180° the left
  return (
    stem(92, 170, 1) +
    stem(88, 10, 0) +
    [126, 158].map((d) => leaf(d, true)).join("") +
    [54, 22].map((d) => leaf(d, false)).join("")
  );
}

/* ------------------------------------------------------------------------------------------ */

/** You started: a sprout, one leaf still pale. */
const beginner: Art = (p) =>
  `<rect x="22.4" y="22" width="3.2" height="15" rx="1.6" fill="${p.ink}"/>` +
  `<path d="M24 24C24.4 16.6 19.6 11.2 11.6 11.4C11.4 19.4 16.4 24.4 24 24Z" fill="${p.ink}"/>` +
  `<path d="M24 24C23.6 16.6 28.4 11.2 36.4 11.4C36.6 19.4 31.6 24.4 24 24Z" fill="${p.soft}"/>`;

/** You are climbing: one solid arrow, lifted off the shield by a deep shadow. */
const ARROW = "M24 11.5L35 23H28.6V34.5H19.4V23H13Z";
const enthusiast: Art = (p) =>
  `<path d="${ARROW}" fill="${p.deep}" stroke="${p.deep}" stroke-width="2" stroke-linejoin="round" transform="translate(${SHADOW})"/>` +
  `<path d="${ARROW}" fill="${p.ink}" stroke="${p.ink}" stroke-width="2" stroke-linejoin="round"/>`;

/** You can be relied on: a bolt, with a deep shadow that lifts it off the shield. */
const BOLT = "M27 10L13.5 28H23L21 39L34.5 21H25Z";
const practitioner: Art = (p) =>
  `<path d="${BOLT}" fill="${p.deep}" transform="translate(${SHADOW})"/>` +
  `<path d="${BOLT}" fill="${p.ink}"/>`;

/** You are distinguished: a star. */
const specialist: Art = (p) => star(24, 24, 13.5, 5.8, p);

/** Others learn from you: a star held in a laurel cradle. */
const mentor: Art = (p) => laurel(24, 21.5, 10.4, p.soft) + star(24, 20, 10, 4.3, p);

/** You have mastered it: a crown, filling the shield, its band in the deeper tint. */
const CROWN = "M14.5 29.5V15L20.8 21.4L24 12L27.2 21.4L33.5 15V29.5Z";
const master: Art = (p) =>
  `<path d="${CROWN}" fill="${p.deep}" stroke="${p.deep}" stroke-width="2" stroke-linejoin="round" transform="translate(${SHADOW})"/>` +
  `<path d="${CROWN}" fill="${p.ink}" stroke="${p.ink}" stroke-width="2" stroke-linejoin="round"/>` +
  `<rect x="14.5" y="26.5" width="19" height="3" rx="1" fill="${p.soft}"/>`;

const ART = {
  beginner,
  enthusiast,
  practitioner,
  specialist,
  mentor,
  master,
} satisfies Record<string, Art>;

export type RankKey = keyof typeof ART;

export const rankKeys = Object.keys(ART) as RankKey[];

/** Own keys only: 'constructor' and the other prototype names are not rungs. */
export function isRankKey(v: string | null | undefined): v is RankKey {
  return !!v && Object.hasOwn(ART, v);
}

/**
 * The palette a rung is drawn in, or the paper greys for a rung the member has not reached —
 * the same greys a locked badge wears, so "not yet" looks the same across both systems.
 */
export function rankArtPalette(key: RankKey, muted: boolean): BadgeArtPalette {
  if (muted) return LOCKED_PALETTE;
  return { ...HUES[key], ink: WHITE };
}

/** The drawing's body for a rung, or undefined for a key that is not one of the six. */
export function rankArt(
  key: string | null | undefined,
  palette: BadgeArtPalette,
): string | undefined {
  return isRankKey(key) ? ART[key](palette) : undefined;
}
