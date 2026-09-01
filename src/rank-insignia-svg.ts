import { isRankKey, type RankKey, rankInsignia } from "./rank-insignia";
import { semantic } from "./tokens/colors";

/**
 * A rank emblem, composed at runtime so it can carry the same struck treatment the badge
 * medals do — a lit face gradient plus one emboss overlay.
 *
 * The generated geometry paints itself with `currentColor`, which is a single flat colour by
 * definition. Gradients therefore cannot live in the generated file: this module repaints the
 * body with gradient references instead, twice, once for the face and once for the overlay.
 *
 * Gradients are `userSpaceOnUse`, never the default object bounding box. A wreath is a dozen
 * separate leaves, and per-element bounding boxes would light each leaf individually — the
 * whole mark has to share one light direction or it reads as noise.
 */

/** Keyed by RankKey so a rung with artwork but no colour fails typecheck, not paints flat. */
const TIER: Record<RankKey, { top: string; bottom: string }> = {
  beginner: { top: semantic["rank-beginner-top"], bottom: semantic["rank-beginner-bottom"] },
  enthusiast: {
    top: semantic["rank-enthusiast-top"],
    bottom: semantic["rank-enthusiast-bottom"],
  },
  practitioner: {
    top: semantic["rank-practitioner-top"],
    bottom: semantic["rank-practitioner-bottom"],
  },
  specialist: {
    top: semantic["rank-specialist-top"],
    bottom: semantic["rank-specialist-bottom"],
  },
  mentor: { top: semantic["rank-mentor-top"], bottom: semantic["rank-mentor-bottom"] },
  master: { top: semantic["rank-master-top"], bottom: semantic["rank-master-bottom"] },
};

/** Repaint the generated body, whose fills and strokes are all `currentColor`. */
function paint(body: string, ref: string): string {
  return `<g fill="${ref}">${body.replaceAll("currentColor", ref)}</g>`;
}

/**
 * `muted` is a rung the member has not reached: flat, drained of colour, and deliberately
 * NOT embossed — the struck look is part of what having reached a rung means.
 */
export function rankInsigniaSvg({
  rank,
  muted = false,
}: {
  rank: string | null | undefined;
  muted?: boolean;
}): string | undefined {
  if (!isRankKey(rank)) return undefined;
  const body = rankInsignia[rank].replace(/^<svg[^>]*>/, "").replace("</svg>", "");
  const open = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">';

  if (muted) return `${open}${paint(body, semantic["ink-faint"])}</svg>`;

  const t = TIER[rank];
  const face = `rf-${rank}`;
  const defs =
    `<defs><linearGradient id="${face}" gradientUnits="userSpaceOnUse" ` +
    `x1="4" y1="2.5" x2="20" y2="21.5">` +
    `<stop offset="0" stop-color="${t.top}"/><stop offset="1" stop-color="${t.bottom}"/>` +
    `</linearGradient>` +
    `<linearGradient id="re" gradientUnits="userSpaceOnUse" x1="0" y1="2.5" x2="0" y2="21.5">` +
    // Lighter than the medals'. A medal's overlay sits on a broad face; an emblem is thin
    // forms spread across the box, so the same strength reads as two colours rather than one
    // struck object — the sprout's low stem takes the dark end of BOTH gradients at once.
    `<stop offset="0" stop-color="#FFFFFF" stop-opacity="0.3"/>` +
    `<stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/>` +
    `<stop offset="1" stop-color="#1A2019" stop-opacity="0.08"/>` +
    `</linearGradient></defs>`;

  return `${open}${defs}${paint(body, `url(#${face})`)}${paint(body, "url(#re)")}</svg>`;
}
