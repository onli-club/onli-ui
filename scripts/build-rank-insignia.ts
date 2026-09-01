/**
 * Builds the rank insignia in src/rank-insignia.ts.
 *
 * Original artwork, generated so the shared parts (leaf, branch) are provably identical.
 *
 * **Each rung is a different object, not the same one at a different density.** The first
 * pass made all six a laurel that only grew fuller, and neighbouring rungs were impossible
 * to tell apart in isolation — which is the whole job of an insignia. Games escalate the
 * object itself (a rough chunk, then a gem, then an ornate crest), so these do too: sprout,
 * chevron, shield, star, star in laurel, crowned laurel. Each also carries its own tier
 * colour (`rank-*` in tokens/colors.ts), which is the other half of telling them apart.
 *
 * Nothing here counts. Fullness and ornament escalate, but no rung is "three of something",
 * because that is an ordinal in disguise — see docs/PROGRESSION.md.
 *
 * **Every coordinate is absolute. Nothing emits a `transform` attribute.** A gradient with
 * `gradientUnits="userSpaceOnUse"` resolves against the user space in effect where it is
 * referenced, so a rotated leaf would sample a rotated copy of the ramp and the sprout's
 * stem and leaves would come out different colours. Marks are therefore built twice: once to
 * measure, then again with the fit transform baked into every point (see `XF`).
 *
 * **Every mark is measured and normalised before it is emitted.** Hand-tuned coordinates
 * cannot hold six shapes to one optical size: the first attempt drifted from a 13-unit
 * sprout to a 27-unit wreath that overflowed the viewBox and rendered clipped. Every
 * primitive reports the points it occupies. Add a primitive → make it push its points, or it
 * will be left out of the measurement and the mark will drift again.
 *
 * Solid fills and fat strokes, not lucide's 2px line: an emblem needs mass at 24px.
 * Keyed by the permanent rung key, never the editable name.
 *
 * Run: bun scripts/build-rank-insignia.ts
 */
const C = { x: 12, y: 12.6 };
/** Every mark is scaled to fill this square, centred in the 24-unit box. */
const FIT = 19;
const rad = (deg: number) => (deg * Math.PI) / 180;
const n = (v: number) => Number(v.toFixed(2)).toString();

type Pt = { x: number; y: number };

/** Fit transform for the mark being emitted; identity on the measuring pass. */
let XF = { k: 1, dx: 0, dy: 0 };
/** Points the mark occupies, in pre-fit space. Reset per mark. */
let ink: Pt[] = [];

/** Record a point (pre-fit) and return it mapped into emit space. */
function P(x: number, y: number): Pt {
  ink.push({ x, y });
  return { x: x * XF.k + XF.dx, y: y * XF.k + XF.dy };
}

const xy = (p: Pt) => `${n(p.x)} ${n(p.y)}`;

const cubicPts = (p: Pt[], steps = 10): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push({
      x: u ** 3 * p[0].x + 3 * u * u * t * p[1].x + 3 * u * t * t * p[2].x + t ** 3 * p[3].x,
      y: u ** 3 * p[0].y + 3 * u * u * t * p[1].y + 3 * u * t * t * p[2].y + t ** 3 * p[3].y,
    });
  }
  return out;
};

/** A stroked point occupies half the stroke width in every direction. */
function inkStroke(pts: Pt[], width: number) {
  const r = width / 2;
  for (const p of pts) {
    ink.push({ x: p.x - r, y: p.y - r });
    ink.push({ x: p.x + r, y: p.y + r });
  }
}

/**
 * Almond leaf, rotated and translated into place with the rotation baked into the emitted
 * coordinates rather than applied as a transform attribute.
 */
function leaf(length: number, width: number, x: number, y: number, rotate: number): string {
  const w = width / 2;
  const local: Pt[] = [
    { x: 0, y: 0 },
    { x: w, y: -length * 0.28 },
    { x: w, y: -length * 0.7 },
    { x: 0, y: -length },
    { x: -w, y: -length * 0.7 },
    { x: -w, y: -length * 0.28 },
  ];
  const a = rad(rotate);
  const place = (p: Pt) => ({
    x: x + p.x * Math.cos(a) - p.y * Math.sin(a),
    y: y + p.x * Math.sin(a) + p.y * Math.cos(a),
  });
  const abs = local.map(place);
  // Sample the outline for measurement, in the same absolute space.
  for (const p of [
    ...cubicPts([abs[0], abs[1], abs[2], abs[3]]),
    ...cubicPts([abs[3], abs[4], abs[5], abs[0]]),
  ])
    ink.push(p);
  const e = abs.map((p) => ({ x: p.x * XF.k + XF.dx, y: p.y * XF.k + XF.dy }));
  return (
    `<path d="M${xy(e[0])}C${xy(e[1])} ${xy(e[2])} ${xy(e[3])}` +
    `C${xy(e[4])} ${xy(e[5])} ${xy(e[0])}Z"/>`
  );
}

/** Position on the wreath circle. `deg` is clockwise from straight up. */
const at = (deg: number, r: number) => ({
  x: C.x + r * Math.sin(rad(deg)),
  y: C.y - r * Math.cos(rad(deg)),
});

const emit = (p: Pt) => ({ x: p.x * XF.k + XF.dx, y: p.y * XF.k + XF.dy });

/** One side of a wreath: leaves along an arc, plus the branch they sit on. */
function branch(opts: {
  from: number;
  to: number;
  count: number;
  radius: number;
  length: number;
  width: number;
  tilt: number;
  mirror: boolean;
}): string {
  const { from, to, count, radius, length, width, tilt, mirror } = opts;
  const s = mirror ? -1 : 1;
  const arc: Pt[] = [];
  for (let i = 0; i <= 12; i++) arc.push(at((from + ((to - from) * i) / 12) * s, radius));
  inkStroke(arc, 1.4);
  const start = emit(at(from * s, radius));
  const end = emit(at(to * s, radius));
  const r = radius * XF.k;
  const out = [
    `<path d="M${xy(start)}A${n(r)} ${n(r)} 0 0 ${mirror ? 1 : 0} ${xy(end)}" fill="none" ` +
      `stroke="currentColor" stroke-width="${n(1.4 * XF.k)}" stroke-linecap="round"/>`,
  ];
  for (let i = 0; i < count; i++) {
    const deg = from + ((to - from) * i) / (count - 1);
    const p = at(deg * s, radius);
    out.push(leaf(length, width, p.x, p.y, (deg - tilt) * s));
  }
  return out.join("");
}

/** Five-point star, the distinction mark shared by Specialist upward. */
function star(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const R = i % 2 ? r * 0.42 : r;
    const a = rad(-90 + i * 36);
    pts.push(xy(P(cx + R * Math.cos(a), cy + R * Math.sin(a))));
  }
  return `<path d="M${pts.join("L")}Z"/>`;
}

/** Closed polygon from explicit points. */
function polygon(pts: Pt[]): string {
  return `<path d="M${pts.map((p) => xy(P(p.x, p.y))).join("L")}Z"/>`;
}

/** Polyline stroke (the chevron, the sprout's stem). */
function stroke(pts: Pt[], width: number): string {
  inkStroke(pts, width);
  const d = pts.map((p) => xy(emit(p))).join("L");
  return (
    `<path d="M${d}" fill="none" stroke="currentColor" stroke-width="${n(width * XF.k)}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** The shield: straight shoulders, curved base. */
function shield(): string {
  const top = { x: 12, y: 2.4 };
  const rs = { x: 20.7, y: 5.8 };
  const rw = { x: 20.7, y: 12.5 };
  const rc1 = { x: 20.7, y: 17 };
  const rc2 = { x: 17, y: 20.3 };
  const foot = { x: 12, y: 21.8 };
  const lc1 = { x: 7, y: 20.3 };
  const lc2 = { x: 3.3, y: 17 };
  const lw = { x: 3.3, y: 12.5 };
  const ls = { x: 3.3, y: 5.8 };
  for (const p of [top, rs, rw, foot, lw, ls]) ink.push(p);
  for (const p of cubicPts([rw, rc1, rc2, foot])) ink.push(p);
  for (const p of cubicPts([foot, lc1, lc2, lw])) ink.push(p);
  const e = [top, rs, rw, rc1, rc2, foot, lc1, lc2, lw, ls].map(emit);
  return (
    `<path d="M${xy(e[0])}L${xy(e[1])}L${xy(e[2])}` +
    `C${xy(e[3])} ${xy(e[4])} ${xy(e[5])}C${xy(e[6])} ${xy(e[7])} ${xy(e[8])}` +
    `L${xy(e[9])}Z"/>`
  );
}

/**
 * Six emblems. The story is what standing means at each rung: you started, you are climbing,
 * you can be relied on, you are distinguished, others learn from you, you have mastered it.
 */
const MARKS: Record<string, () => string> = {
  // A seedling.
  beginner: () =>
    stroke(
      [
        { x: 12, y: 21.6 },
        { x: 12, y: 15.4 },
      ],
      2.1,
    ) +
    leaf(7.6, 5.2, 12, 15.8, 44) +
    leaf(7.6, 5.2, 12, 15.8, -44),

  // Climbing.
  enthusiast: () =>
    stroke(
      [
        { x: 4.6, y: 16.4 },
        { x: 12, y: 9 },
        { x: 19.4, y: 16.4 },
      ],
      3.7,
    ),

  // Dependable.
  practitioner: () => shield(),

  // Distinguished.
  specialist: () => star(12, 12.2, 9.4),

  // Others learn from you.
  mentor: () => {
    const o = { from: 150, to: 54, count: 4, radius: 9.1, length: 4.5, width: 2.7, tilt: 30 };
    return branch({ ...o, mirror: false }) + branch({ ...o, mirror: true }) + star(12, 11.9, 6.2);
  },

  // Mastery: the laurel closed, and crowned.
  master: () => {
    const o = { from: 152, to: 44, count: 5, radius: 8.4, length: 4.6, width: 2.8, tilt: 30 };
    return (
      branch({ ...o, mirror: false }) +
      branch({ ...o, mirror: true }) +
      polygon([
        { x: 8.1, y: 10.6 },
        { x: 8.1, y: 4.2 },
        { x: 10.05, y: 6.6 },
        { x: 12, y: 3.2 },
        { x: 13.95, y: 6.6 },
        { x: 15.9, y: 4.2 },
        { x: 15.9, y: 10.6 },
      ])
    );
  },
};

const entries = Object.entries(MARKS).map(([key, build]) => {
  // Pass one measures; pass two emits with the fit baked in.
  XF = { k: 1, dx: 0, dy: 0 };
  ink = [];
  build();
  const xs = ink.map((p) => p.x);
  const ys = ink.map((p) => p.y);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  const k = FIT / Math.max(x1 - x0, y1 - y0);
  XF = { k, dx: 12 - ((x0 + x1) / 2) * k, dy: 12 - ((y0 + y1) / 2) * k };
  ink = [];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">` +
    `${build()}</svg>`;
  return `  ${JSON.stringify(key)}: ${JSON.stringify(svg)},`;
});

await Bun.write(
  "src/rank-insignia.ts",
  `// GENERATED by scripts/build-rank-insignia.ts — do not edit by hand.
// Original artwork for Onli; no third-party licence applies.
//
// Keyed by the PERMANENT rung key from levels.thresholds, never the name: Admin -> Levels
// can rename a rung, and renaming must not silently swap or orphan its insignia. A rung
// staff add later has no mark and renders as text, which is the pre-insignia behaviour.
//
// Every mark is measured and scaled to one optical square by the script, so the six line up
// wherever they are rendered together, and every coordinate is ABSOLUTE — no element carries
// a transform, because a userSpaceOnUse gradient would otherwise resolve differently for a
// rotated leaf than for the stem beside it. Do not hand-edit.

export const rankInsignia = {
${entries.join("\n")}
} satisfies Record<string, string>;

export type RankKey = keyof typeof rankInsignia;

export const rankKeys = Object.keys(rankInsignia) as RankKey[];

/** Own keys only: 'constructor' and the other prototype names are not rungs. */
export function isRankKey(v: string | null | undefined): v is RankKey {
  return !!v && Object.hasOwn(rankInsignia, v);
}

export function getRankInsignia(key: string | null | undefined): string | undefined {
  return isRankKey(key) ? rankInsignia[key] : undefined;
}
`,
);
console.log(`wrote src/rank-insignia.ts — ${entries.length} marks, fitted to ${FIT}/24`);

export {};
