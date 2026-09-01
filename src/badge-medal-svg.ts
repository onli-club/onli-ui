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

type Tone = { top: string; bottom: string; edge: string; glyph: string };

/**
 * A lit face, a rim, and a specular gloss — all of them FILLED areas, never inset hairlines.
 *
 * The emboss is done with gradients rather than an SVG `<filter>`: react-native-svg's parser
 * maps `feDropShadow`/`feGaussianBlur`, but filter *rendering* is newer there and uneven
 * across platforms, while gradients are long-supported and rasterise identically in RN, on
 * the web and inside onli-admin's data-URI. Geometry also stays crisp at any size.
 *
 * Two earlier attempts at interior detail failed at the sizes the medal is actually used at
 * (28-44px). A 0.9-unit hairline bevel is under a pixel there, so it rendered as a fuzzy
 * second outline; a filled inner medallion was crisp but swallowed the frame, leaving a ring
 * too thin for a rosette's scallops to read. Hence: no concentric bands. Depth comes from the
 * face gradient and the gloss, which cost no extra edges.
 */
const TONES: Record<BadgeRarity, Tone> = {
  common: {
    top: semantic["rarity-common-top"],
    bottom: semantic["rarity-common-bottom"],
    edge: semantic["rarity-common-line"],
    glyph: semantic["rarity-common-ink"],
  },
  uncommon: {
    top: semantic["rarity-uncommon-top"],
    bottom: semantic["rarity-uncommon-bottom"],
    edge: semantic["rarity-uncommon-line"],
    glyph: semantic["rarity-uncommon-ink"],
  },
  rare: {
    top: semantic["rarity-rare-top"],
    bottom: semantic["rarity-rare-bottom"],
    edge: semantic["rarity-rare-line"],
    glyph: semantic["rarity-rare-ink"],
  },
  legendary: {
    top: semantic["rarity-legendary-top"],
    bottom: semantic["rarity-legendary-bottom"],
    edge: semantic["rarity-legendary-line"],
    glyph: semantic["rarity-legendary-ink"],
  },
};

const LOCKED: Tone = {
  top: semantic["surface-sunken"],
  bottom: semantic["surface-sunken"],
  edge: semantic["line-strong"],
  glyph: semantic["ink-faint"],
};

/** The glyph's own markup, lifted out of its 24-unit box and re-coloured. */
function glyphLayer(icon: string | null | undefined, color: string): string {
  const svg = getBadgeIcon(icon) ?? badgeIcons.award;
  const inner = svg.replace(/^<svg[^>]*>/, "").replace("</svg>", "");
  const size = 20;
  const k = size / 24;
  const off = C - size / 2;
  return (
    `<g transform="translate(${n(off)} ${n(off)}) scale(${n(k)})" fill="none" ` +
    `stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">` +
    `${inner}</g>`
  );
}

/**
 * A struck medal: the frame in the rarity's fill, a bevel line inset inside it, and the
 * glyph. Legendary alone gets an outer rim, so the rarest tier is the only one wearing extra
 * metal. A locked badge keeps its shape in a dashed outline — what a member is working toward
 * is recognisably what they will get.
 */
export function badgeMedalSvg({
  icon,
  ruleType,
  rarity,
  earned = true,
}: {
  icon: string | null | undefined;
  ruleType: string | null | undefined;
  rarity: BadgeRarity;
  earned?: boolean;
}): string {
  const shape = PATH[shapeForRule(ruleType)];
  const t = earned ? TONES[rarity] : LOCKED;
  const legendary = earned && rarity === "legendary";
  const d = shape(19);
  // Ids are keyed by tier, so two medals of the same rarity on one page share one identical
  // definition rather than colliding on different ones.
  const face = `of-${earned ? rarity : "locked"}`;

  const defs =
    `<defs><linearGradient id="${face}" x1="0.15" y1="0" x2="0.85" y2="1">` +
    `<stop offset="0" stop-color="${t.top}"/><stop offset="1" stop-color="${t.bottom}"/>` +
    `</linearGradient>` +
    // One overlay does the whole emboss: specular highlight at the top, nothing through the
    // middle, contact shadow at the bottom. Cheaper and crisper than a second ring of geometry.
    `<linearGradient id="od" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/>` +
    `<stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#1A2019" stop-opacity="0.12"/>` +
    `</linearGradient></defs>`;

  const layers = [
    `<path d="${d}" fill="url(#${face})" stroke="${t.edge}" stroke-width="${
      legendary ? 2.4 : 2
    }"${earned ? "" : ' stroke-dasharray="3 2.4"'} stroke-linejoin="round"/>`,
    earned ? `<path d="${d}" fill="url(#od)"/>` : "",
    glyphLayer(icon, t.glyph),
  ];

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}">` +
    `${defs}${layers.join("")}</svg>`
  );
}
