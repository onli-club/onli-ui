import { badgeArt, badgeArtPalette } from "./badge-art";
import { badgeIcons, getBadgeIcon } from "./badge-icons";
import { semantic } from "./tokens/colors";

/**
 * The whole medal as one SVG string — frame, bevel and glyph — so onli-app and onli-admin
 * draw the identical thing from one source instead of each rebuilding it from CSS.
 *
 * It is a string rather than a styled box on purpose. The first version was a bordered View
 * whose disc colour came from Tailwind classes, which meant a medal could render with no fill
 * at all whenever the compiled CSS was behind the tokens. Nothing here touches CSS.
 */

export type BadgeRarity = "common" | "uncommon" | "rare" | "legendary";
export type BadgeShape = "seal" | "hexagon" | "squircle" | "rosette" | "diamond";

/** Everything is drawn in a 48-unit box; the frame sits on a 21-unit radius. */
const BOX = 48;
const C = BOX / 2;
const n = (v: number) => Number(v.toFixed(2)).toString();
const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Shape says what KIND of thing a member did; colour says how rare it is. Two axes read at a
 * glance beat one — a wall of identical discs made every badge look like every other.
 *
 * Derived from `ruleType` rather than stored: the families in the catalogue already ARE the
 * rule types, so a column would duplicate them, and a badge staff add later gets its shape
 * with no extra decision. Shapes deliberately avoid the shield and star silhouettes, which
 * belong to the rank insignia — the two systems must not be mistaken for each other.
 */
const SHAPES: Record<string, BadgeShape> = {
  // craft: one per topic channel
  channel_post_count: "hexagon",
  // volume: how much you have put in
  post_count: "squircle",
  comment_count: "squircle",
  channels_posted: "squircle",
  // impact: other people found it worth their time
  likes_received_posts: "rosette",
  single_post_comments: "rosette",
  single_comment_likes: "rosette",
  // consistency
  streak_days: "diamond",
  // identity: a fact about the member, not a total
  profile_completed: "seal",
  founding_member: "seal",
  staff: "seal",
  course_completed: "seal",
  manual: "seal",
};

export function shapeForRule(ruleType: string | null | undefined): BadgeShape {
  return ruleType && Object.hasOwn(SHAPES, ruleType) ? SHAPES[ruleType] : "seal";
}

/**
 * Circle, as a path so every frame is the same kind of object. Two half arcs, never one
 * near-complete arc: an arc whose endpoints almost coincide is numerically ill-conditioned
 * and renders as a subtly wrong circle.
 */
function seal(r: number): string {
  return (
    `M${n(C - r)} ${n(C)}A${n(r)} ${n(r)} 0 1 1 ${n(C + r)} ${n(C)}` +
    `A${n(r)} ${n(r)} 0 1 1 ${n(C - r)} ${n(C)}Z`
  );
}

/** Flat-top hexagon. */
function hexagon(r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = rad(i * 60);
    return `${n(C + r * Math.cos(a))} ${n(C + r * Math.sin(a))}`;
  });
  return `M${pts.join("L")}Z`;
}

/** Rounded square. */
function squircle(r: number): string {
  const s = r * 0.94;
  const k = s * 0.42;
  const [a, b] = [C - s, C + s];
  return (
    `M${n(a + k)} ${n(a)}L${n(b - k)} ${n(a)}Q${n(b)} ${n(a)} ${n(b)} ${n(a + k)}` +
    `L${n(b)} ${n(b - k)}Q${n(b)} ${n(b)} ${n(b - k)} ${n(b)}` +
    `L${n(a + k)} ${n(b)}Q${n(a)} ${n(b)} ${n(a)} ${n(b - k)}` +
    `L${n(a)} ${n(a + k)}Q${n(a)} ${n(a)} ${n(a + k)} ${n(a)}Z`
  );
}

/**
 * Scalloped seal, built from real circular arcs rather than a sampled polar curve. Sampling
 * produced a 132-segment polyline whose facets read as noise at 44px, and eleven lobes on a
 * 36px circle put each scallop under two pixels. Eight arcs stay legible and stay smooth.
 */
function rosette(r: number): string {
  const lobes = 8;
  const bulge = 1.153;
  const rb = r / bulge;
  const chord = 2 * rb * Math.sin(Math.PI / lobes);
  const rl = (chord / 2) * 1.45;
  const pt = (i: number) => {
    const a = (i / lobes) * Math.PI * 2 - Math.PI / 2;
    return { x: C + rb * Math.cos(a), y: C + rb * Math.sin(a) };
  };
  const first = pt(0);
  let d = `M${n(first.x)} ${n(first.y)}`;
  for (let i = 1; i <= lobes; i++) {
    const p = pt(i % lobes);
    d += `A${n(rl)} ${n(rl)} 0 0 1 ${n(p.x)} ${n(p.y)}`;
  }
  return `${d}Z`;
}

/** Rhombus with softened corners. */
function diamond(r: number): string {
  const k = r * 0.3;
  const p = [
    { x: C, y: C - r },
    { x: C + r, y: C },
    { x: C, y: C + r },
    { x: C - r, y: C },
  ];
  let d = "";
  for (let i = 0; i < 4; i++) {
    const cur = p[i];
    const next = p[(i + 1) % 4];
    const prev = p[(i + 3) % 4];
    const inFrom = {
      x: cur.x + ((prev.x - cur.x) * k) / r / Math.SQRT2,
      y: cur.y + ((prev.y - cur.y) * k) / r / Math.SQRT2,
    };
    const outTo = {
      x: cur.x + ((next.x - cur.x) * k) / r / Math.SQRT2,
      y: cur.y + ((next.y - cur.y) * k) / r / Math.SQRT2,
    };
    d += `${i === 0 ? "M" : "L"}${n(inFrom.x)} ${n(inFrom.y)}Q${n(cur.x)} ${n(cur.y)} ${n(outTo.x)} ${n(outTo.y)}`;
  }
  return `${d}Z`;
}

const PATH: Record<BadgeShape, (r: number) => string> = {
  seal,
  hexagon,
  squircle,
  rosette,
  diamond,
};

type Tone = { rim: string; face: string; glyph: string };

/**
 * A struck game medal: a SOLID face in the tier's colour, a darker rim around it, and the glyph
 * cut in white on top. Pewter, green, blue, gold — the ladder players already read.
 *
 * Solid is the point. A light face with a coloured outline reads as washed out beside the
 * badges this borrows from, and the first pass at fixing the gold tier went that way and made
 * every tier weaker (Himanshu, 2026-09-08). The face carries the colour; the rim gives the
 * object an edge on a white card; white keeps the glyph legible on all four.
 *
 * No `<defs>` and no `url(#…)` anywhere — a hard rule, not a preference. The medal is drawn
 * inline in the app (many svgs in one document), as a data-URI `<img>` in onli-admin, and
 * natively on a phone. A gradient must be referenced by a document-wide id, and duplicate ids
 * across inline svgs resolve to whichever definition the document saw first: that is how the
 * gradient version rendered filled on one profile screen and hollow on another from the same
 * component with the same props, and how the rank emblem drew nothing at all.
 */
const TONES: Record<BadgeRarity, Tone> = {
  common: {
    rim: semantic["rarity-common-line"],
    face: semantic["rarity-common-bg"],
    glyph: semantic["rarity-common-ink"],
  },
  uncommon: {
    rim: semantic["rarity-uncommon-line"],
    face: semantic["rarity-uncommon-bg"],
    glyph: semantic["rarity-uncommon-ink"],
  },
  rare: {
    rim: semantic["rarity-rare-line"],
    face: semantic["rarity-rare-bg"],
    glyph: semantic["rarity-rare-ink"],
  },
  legendary: {
    rim: semantic["rarity-legendary-line"],
    face: semantic["rarity-legendary-bg"],
    glyph: semantic["rarity-legendary-ink"],
  },
};

/** Not yet earned: the same object struck in the paper's own greys, so it reads as a ghost. */
const LOCKED: Tone = {
  rim: semantic["line-strong"],
  face: semantic["surface-sunken"],
  glyph: semantic["ink-faint"],
};

/**
 * How much of the face a 24-unit glyph box may take, per shape. A circle and a rounded square
 * hold a square almost as wide as the face; a rhombus holds far less, and a flat-top hexagon
 * less than a circle — one shared size made the anchor and the flame touch their own rim.
 * The stroke is scaled back up so every glyph keeps the same weight whatever its box.
 */
const GLYPH: Record<BadgeShape, number> = {
  seal: 21,
  squircle: 21,
  rosette: 19,
  hexagon: 19,
  diamond: 16,
};

/** The glyph's own markup, lifted out of its 24-unit box and re-coloured. */
function glyphLayer(icon: string | null | undefined, color: string, shape: BadgeShape): string {
  const svg = getBadgeIcon(icon) ?? badgeIcons.award;
  const inner = svg.replace(/^<svg[^>]*>/, "").replace("</svg>", "");
  const size = GLYPH[shape];
  const k = size / 24;
  const off = C - size / 2;
  return (
    `<g transform="translate(${n(off)} ${n(off)}) scale(${n(k)})" fill="none" ` +
    `stroke="${color}" stroke-width="${n(2.0 / k)}" stroke-linecap="round" ` +
    `stroke-linejoin="round">${inner}</g>`
  );
}

/** Outer edge of the frame, and the face inside it on a fallback medal. */
const RIM = 20;
const FACE = { normal: 17.4, legendary: 16.6 } as const;

/**
 * How far the artwork has to shrink to sit inside each frame, since every drawing is authored
 * once against the 26-unit box a circle holds. A rhombus of half-diagonal 20 holds only a
 * 20-unit square (|x| + |y| <= 20), which is why the calendar and the crown hung out of their
 * corners on the first pass; a rosette's scallops cut in to about r17. The values sit slightly above the strict inscribed
 * square, because almost no drawing fills its own corners — they are tuned by eye at 40px.
 */
const ART_FIT: Record<BadgeShape, number> = {
  seal: 1,
  squircle: 1,
  hexagon: 0.96,
  rosette: 0.92,
  diamond: 0.82,
};

/**
 * A badge.
 *
 * A badge in the seeded catalogue has its OWN DRAWING (`badge-art.ts`), keyed by `code`: the
 * family frame filled in the badge's own colour, with the artwork on top. That is the badge
 * members actually see.
 *
 * A badge staff create later has no drawing, and falls back to the struck medal this used to
 * be for everyone — frame in the rarity's dark metal, solid face, lucide glyph in white. Both
 * paths share the frame geometry, so a new badge sits in a row of drawn ones without looking
 * like a different kind of object. Neither path emits `<defs>` or `url(#…)`.
 */
export function badgeMedalSvg({
  code,
  icon,
  ruleType,
  rarity,
  earned = true,
}: {
  /** The badge's permanent code; what its artwork is keyed by. */
  code?: string | null;
  icon: string | null | undefined;
  ruleType: string | null | undefined;
  rarity: BadgeRarity;
  earned?: boolean;
}): string {
  const key = shapeForRule(ruleType);
  const shape = PATH[key];
  const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">`;

  const palette = badgeArtPalette(code, rarity, earned);
  const art = badgeArt(code, palette);
  if (art) {
    const k = ART_FIT[key];
    const fitted =
      k === 1
        ? art
        : `<g transform="translate(${C} ${C}) scale(${k}) translate(-${C} -${C})">${art}</g>`;
    return `${open}<path d="${shape(RIM)}" fill="${palette.bg}"/>${fitted}</svg>`;
  }

  const t = earned ? TONES[rarity] : LOCKED;
  const face = earned && rarity === "legendary" ? FACE.legendary : FACE.normal;
  return (
    `${open}<path d="${shape(RIM)}" fill="${t.rim}"/>` +
    `<path d="${shape(face)}" fill="${t.face}"/>` +
    `${glyphLayer(icon, t.glyph, key)}</svg>`
  );
}
