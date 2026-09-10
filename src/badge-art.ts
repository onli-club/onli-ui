/**
 * Bespoke artwork, one drawing per badge, keyed by the badge's permanent `code`.
 *
 * Hand-authored rather than generated: a badge is a small illustration, and the lucide glyph
 * set that `badge-icons.ts` vendors is monoline stroke art — 24 of them in coloured frames read
 * as one icon set wearing hats, which is what Himanshu rejected twice (2026-09-08: "look how
 * lively they are... rather than yours, which is topped with very big borders and an icon in
 * between them").
 *
 * THE RULES THAT MAKE THESE WORK, learned by drawing the first six and looking at them at the
 * size they actually ship at:
 * - ONE bold subject. The first Founding Member was a banner plus a pole plus a mound plus a
 *   star and turned to mush at 40px; it is now a single pennant.
 * - Two or three flat fills, never more. `ink` carries the subject, `soft` its interior detail,
 *   `deep` the one shadow or accent that gives it an edge.
 * - Nothing thinner than ~2 units: at 40px that is 1.7px, and anything under a pixel fuzzes.
 * - The subject sits inside a 26-unit box (11 to 37); on a `diamond` frame it has to come in to
 *   ~20 units wide, because a rhombus holds far less than a circle.
 * - No `<defs>` and no `url(#…)`, the same hard rule the frame follows — see badge-medal-svg.ts.
 *
 * Colour is per badge (identity), not per rarity, EXCEPT legendary, which is always gold so the
 * rarest tier still reads at a glance (Himanshu's call, 2026-09-08).
 */

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

const WHITE = "#FFFFFF";

/**
 * Ten curated hues plus gold. Chosen against the warm paper ground rather than sampled from a
 * wheel: every `bg` carries white at 3:1 or better, and no two adjacent hues collide in a grid.
 */
const HUES = {
  orange: { bg: "#EE8034", soft: "#F6B27E", deep: "#B95C18" },
  violet: { bg: "#7A5AF8", soft: "#C0AEFB", deep: "#5334C4" },
  rose: { bg: "#E4483F", soft: "#F3A6A1", deep: "#AE2C25" },
  teal: { bg: "#12A0A0", soft: "#8FD6D6", deep: "#0A7373" },
  blue: { bg: "#3B82D9", soft: "#A7C8EE", deep: "#2560A6" },
  indigo: { bg: "#5B62E8", soft: "#B3B7F4", deep: "#3B41B8" },
  green: { bg: "#22A06B", soft: "#9BDCC0", deep: "#15734B" },
  pink: { bg: "#E14B8A", soft: "#F4A8C6", deep: "#AC2C63" },
  cyan: { bg: "#0E9BC4", soft: "#96D7E9", deep: "#0A7093" },
  plum: { bg: "#8B5CF6", soft: "#C8AEFB", deep: "#6435CE" },
  gold: { bg: "#DFA22B", soft: "#F2CE85", deep: "#9A6A12" },
} as const;

/** Not yet earned: the same drawing in the paper's greys, so it is recognisably what you get. */
export const LOCKED_PALETTE: BadgeArtPalette = {
  bg: "#D7D3C9",
  ink: "#FDFCFA",
  soft: "#C9C4B8",
  deep: "#9A9488",
};

type Art = (p: BadgeArtPalette) => string;

/* ---------------------------------------------------------------- volume: sheets and posts */

const firstPost: Art = (p) =>
  `<path d="M14.6 14.4C14.6 13.1 15.7 12 17 12H27.4L33.4 18V33.6C33.4 34.9 32.3 36 31 36H17C15.7 36 14.6 34.9 14.6 33.6Z" fill="${p.ink}"/>` +
  `<path d="M27.4 12L33.4 18H28.6C27.9 18 27.4 17.5 27.4 16.8Z" fill="${p.deep}"/>` +
  `<rect x="18.4" y="22" width="11.2" height="2.2" rx="1.1" fill="${p.soft}"/>` +
  `<rect x="18.4" y="27" width="11.2" height="2.2" rx="1.1" fill="${p.soft}"/>`;

const tenPosts: Art = (p) =>
  `<rect x="12.6" y="16.4" width="15.6" height="19.6" rx="2.4" fill="${p.soft}" transform="rotate(-10 20.4 26.2)"/>` +
  `<rect x="17" y="13.4" width="16.4" height="20.6" rx="2.4" fill="${p.ink}"/>` +
  `<rect x="20.2" y="18.4" width="10" height="2.2" rx="1.1" fill="${p.soft}"/>` +
  `<rect x="20.2" y="23" width="10" height="2.2" rx="1.1" fill="${p.soft}"/>` +
  `<rect x="20.2" y="27.6" width="6.2" height="2.2" rx="1.1" fill="${p.soft}"/>`;

/* ------------------------------------------------------------------ comments: speech bubbles */

const firstComment: Art = (p) =>
  `<path d="M12.6 17.4C12.6 15.4 14.2 13.8 16.2 13.8H31.8C33.8 13.8 35.4 15.4 35.4 17.4V26.6C35.4 28.6 33.8 30.2 31.8 30.2H22.6L16.4 35V30.2H16.2C14.2 30.2 12.6 28.6 12.6 26.6Z" fill="${p.ink}"/>` +
  `<rect x="17.4" y="18.4" width="13.2" height="2.4" rx="1.2" fill="${p.soft}"/>` +
  `<rect x="17.4" y="23.2" width="8.6" height="2.4" rx="1.2" fill="${p.soft}"/>`;

const fiftyComments: Art = (p) =>
  `<path d="M10.6 15.4C10.6 13.7 12 12.4 13.6 12.4H26.4C28.1 12.4 29.4 13.7 29.4 15.4V22.6C29.4 24.3 28.1 25.6 26.4 25.6H13.6C12 25.6 10.6 24.3 10.6 22.6Z" fill="${p.soft}"/>` +
  `<path d="M18.6 22.4C18.6 20.7 20 19.4 21.6 19.4H34.4C36.1 19.4 37.4 20.7 37.4 22.4V30.6C37.4 32.3 36.1 33.6 34.4 33.6H27.4L21.8 37.6V33.6C20.1 33.6 18.6 32.3 18.6 30.6Z" fill="${p.ink}"/>` +
  `<rect x="22.6" y="24.4" width="10.4" height="2.3" rx="1.15" fill="${p.soft}"/>` +
  `<rect x="22.6" y="28.4" width="6.6" height="2.3" rx="1.15" fill="${p.soft}"/>`;

const conversationStarter: Art = (p) =>
  `<path d="M11.6 18C11.6 15.6 13.6 13.6 16 13.6H32C34.4 13.6 36.4 15.6 36.4 18V27.4C36.4 29.8 34.4 31.8 32 31.8H23L16.2 36.8V31.8H16C13.6 31.8 11.6 29.8 11.6 27.4Z" fill="${p.ink}"/>` +
  `<circle cx="17.8" cy="22.7" r="2.5" fill="${p.bg}"/>` +
  `<circle cx="24" cy="22.7" r="2.5" fill="${p.bg}"/>` +
  `<circle cx="30.2" cy="22.7" r="2.5" fill="${p.soft}"/>`;

/* --------------------------------------------------------------------- streaks: diamond room */

const warmingUp: Art = (p) =>
  `<path d="M24 9.6C28.6 15.4 33.4 19 33.4 25.8C33.4 31.4 29.2 35.6 24 35.6C18.8 35.6 14.6 31.4 14.6 25.8C14.6 20.8 17.4 18.4 19.8 14.8C20.8 17.6 22 18.8 23.2 19.6C22.6 16 22.9 12.6 24 9.6Z" fill="${p.ink}"/>` +
  `<path d="M24 35.6C21 35.6 18.6 33.2 18.6 30.2C18.6 26.8 21.4 25.2 24 21.6C26.6 25.2 29.4 26.8 29.4 30.2C29.4 33.2 27 35.6 24 35.6Z" fill="${p.soft}"/>`;

const consistent: Art = (p) =>
  `<rect x="14" y="14" width="20" height="19.6" rx="2.6" fill="${p.ink}"/>` +
  `<path d="M14 16.6C14 15.2 15.2 14 16.6 14H31.4C32.8 14 34 15.2 34 16.6V19H14Z" fill="${p.deep}"/>` +
  `<path d="M19.4 25.6L22.6 28.8L28.8 22.6" fill="none" stroke="${p.bg}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;

const committed: Art = (p) =>
  `<circle cx="24" cy="14.6" r="4.4" fill="none" stroke="${p.ink}" stroke-width="2.8"/>` +
  `<rect x="22.4" y="17.6" width="3.2" height="17.4" rx="1.6" fill="${p.ink}"/>` +
  `<rect x="17.6" y="21.4" width="12.8" height="3" rx="1.5" fill="${p.ink}"/>` +
  `<path d="M14.4 27.4C14.4 31.8 18.6 35.2 24 35.2C29.4 35.2 33.6 31.8 33.6 27.4" fill="none" stroke="${p.soft}" stroke-width="3" stroke-linecap="round"/>`;

const relentless: Art = (p) =>
  `<path d="M24 12.6L36.6 34.4H11.4Z" fill="${p.ink}"/>` +
  `<path d="M24 12.6L29.4 21.9L26.6 24.1L24 21.3L21.4 24.1L18.6 21.9Z" fill="${p.soft}"/>`;

const yearOne: Art = (p) =>
  `<path d="M13.4 31.6L11.4 16.6L18.4 21.4L24 13.4L29.6 21.4L36.6 16.6L34.6 31.6Z" fill="${p.ink}"/>` +
  `<rect x="13.4" y="32.2" width="21.2" height="3.6" rx="1.4" fill="${p.soft}"/>`;

/* --------------------------------------------------------------------------- impact: rosette */

const useful: Art = (p) =>
  `<path d="M24 34.6C16.2 29.4 13.2 25.7 13.2 21.6C13.2 18.1 15.9 15.5 19.2 15.5C21.4 15.5 23 16.5 24 18.1C25 16.5 26.6 15.5 28.8 15.5C32.1 15.5 34.8 18.1 34.8 21.6C34.8 25.7 31.8 29.4 24 34.6Z" fill="${p.ink}"/>` +
  `<path d="M19.8 18.9C18.1 18.9 16.8 20.2 16.8 21.8" fill="none" stroke="${p.soft}" stroke-width="2.4" stroke-linecap="round"/>`;

const helpful: Art = (p) =>
  `<path d="M24 25.8C18.6 22.2 16.6 19.7 16.6 17C16.6 14.6 18.5 12.8 20.8 12.8C22.1 12.8 23.2 13.4 24 14.5C24.8 13.4 25.9 12.8 27.2 12.8C29.5 12.8 31.4 14.6 31.4 17C31.4 19.7 29.4 22.2 24 25.8Z" fill="${p.ink}"/>` +
  `<path d="M12.6 29.2C16 32.9 19.8 34.8 24 34.8C28.2 34.8 32 32.9 35.4 29.2" fill="none" stroke="${p.ink}" stroke-width="3.2" stroke-linecap="round"/>` +
  `<path d="M17.4 31.8C19.6 33.4 21.8 34.2 24 34.2" fill="none" stroke="${p.soft}" stroke-width="2.2" stroke-linecap="round"/>`;

const theAnswer: Art = (p) =>
  `<path d="M24 12.4C29 12.4 33 16.3 33 21.1C33 24.3 31.4 26.4 29.6 28.2V30.6C29.6 31.6 28.8 32.4 27.8 32.4H20.2C19.2 32.4 18.4 31.6 18.4 30.6V28.2C16.6 26.4 15 24.3 15 21.1C15 16.3 19 12.4 24 12.4Z" fill="${p.ink}"/>` +
  `<rect x="20.2" y="33.8" width="7.6" height="3" rx="1.5" fill="${p.soft}"/>` +
  `<path d="M21.4 20.4C21.4 19 22.6 17.9 24 17.9" fill="none" stroke="${p.soft}" stroke-width="2.2" stroke-linecap="round"/>`;

const indispensable: Art = (p) =>
  `<path d="M17.2 14.2H30.8L36.4 21.4L24 35.6L11.6 21.4Z" fill="${p.ink}"/>` +
  `<path d="M17.2 14.2H30.8L34 21.4H14Z" fill="${p.soft}"/>` +
  `<path d="M24 35.6L14 21.4H20.4Z" fill="${p.soft}"/>`;

/* -------------------------------------------------------------------------- identity: seals */

const profileComplete: Art = (p) =>
  `<circle cx="24" cy="18.6" r="5.6" fill="${p.ink}"/>` +
  `<path d="M13.8 33.4C14.6 28.4 18.8 25 24 25C29.2 25 33.4 28.4 34.2 33.4Z" fill="${p.ink}"/>` +
  `<circle cx="31.8" cy="31.4" r="6.2" fill="${p.deep}"/>` +
  `<path d="M29 31.4L31 33.4L34.6 29.6" fill="none" stroke="${p.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;

const staff: Art = (p) =>
  `<path d="M24 11.6L34 15.6V25C34 31.2 29.8 35.2 24 37C18.2 35.2 14 31.2 14 25V15.6Z" fill="${p.ink}"/>` +
  `<path d="M24 14.4L31.2 17.3V25C31.2 29.6 28.2 32.7 24 34.2Z" fill="${p.soft}"/>` +
  `<path d="M19.8 24.2L22.9 27.3L28.6 20.6" fill="none" stroke="${p.deep}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>`;

const foundingMember: Art = (p) =>
  `<rect x="16.4" y="10.6" width="3.2" height="27" rx="1.6" fill="${p.ink}"/>` +
  `<path d="M19.6 12.4H36.4L30.8 19.6L36.4 26.8H19.6Z" fill="${p.ink}"/>` +
  `<path d="M19.6 12.4H36.4L30.8 19.6H19.6Z" fill="${p.soft}"/>`;

/* ----------------------------------------------------------------------------- craft: hexes */

const channelExplorer: Art = (p) =>
  `<circle cx="24" cy="24" r="11.4" fill="${p.ink}"/>` +
  `<circle cx="24" cy="24" r="8.2" fill="${p.soft}"/>` +
  `<path d="M29.6 18.4L26.4 26.4L18.4 29.6L21.6 21.6Z" fill="${p.bg}"/>` +
  `<path d="M29.6 18.4L26.4 26.4L24 24Z" fill="${p.deep}"/>`;

const craftFilm: Art = (p) =>
  `<rect x="12.6" y="20.4" width="22.8" height="15.2" rx="2.4" fill="${p.ink}"/>` +
  `<path d="M13.4 13.6L34.2 11.4L35.4 18.4L14.6 20.6Z" fill="${p.soft}"/>` +
  `<path d="M20.4 12.9L23.4 17.9L19.2 18.4L16.2 13.3Z" fill="${p.bg}"/>` +
  `<path d="M28.4 12.1L31.4 17.1L27.2 17.6L24.2 12.5Z" fill="${p.bg}"/>`;

const craftBusiness: Art = (p) =>
  `<path d="M19.4 15.4C19.4 14.1 20.5 13 21.8 13H26.2C27.5 13 28.6 14.1 28.6 15.4V17.4H25.6V16H22.4V17.4H19.4Z" fill="${p.ink}"/>` +
  `<rect x="12.6" y="17.4" width="22.8" height="18.2" rx="2.6" fill="${p.ink}"/>` +
  `<rect x="12.6" y="23.4" width="22.8" height="4.4" fill="${p.soft}"/>` +
  `<rect x="21.6" y="22.4" width="4.8" height="6.4" rx="1.4" fill="${p.deep}"/>`;

const craftImage: Art = (p) =>
  `<rect x="12.4" y="14.4" width="23.2" height="19.2" rx="2.6" fill="${p.ink}"/>` +
  `<circle cx="19.4" cy="20.6" r="3" fill="${p.soft}"/>` +
  `<path d="M14.6 33.6L22 24.6L27.2 31.2L30.4 27.4L35.4 33.6Z" fill="${p.deep}"/>`;

const craftAgents: Art = (p) =>
  `<rect x="22.4" y="10.6" width="3.2" height="5.4" rx="1.6" fill="${p.ink}"/>` +
  `<circle cx="24" cy="10.6" r="2.6" fill="${p.soft}"/>` +
  `<rect x="13.4" y="16" width="21.2" height="18.4" rx="4.4" fill="${p.ink}"/>` +
  `<circle cx="19.4" cy="23.4" r="2.6" fill="${p.bg}"/>` +
  `<circle cx="28.6" cy="23.4" r="2.6" fill="${p.bg}"/>` +
  `<rect x="19.4" y="28.4" width="9.2" height="2.6" rx="1.3" fill="${p.soft}"/>`;

const craftPrompt: Art = (p) =>
  `<path d="M14.6 31.4L27.4 18.6L30.6 21.8L17.8 34.6C16.9 35.5 15.5 35.5 14.6 34.6C13.7 33.7 13.7 32.3 14.6 31.4Z" fill="${p.ink}"/>` +
  `<path d="M27.4 18.6L30.6 21.8L33.4 19C34.3 18.1 34.3 16.7 33.4 15.8C32.5 14.9 31.1 14.9 30.2 15.8Z" fill="${p.soft}"/>` +
  `<path d="M20.6 11.4L21.8 14.4L24.8 15.6L21.8 16.8L20.6 19.8L19.4 16.8L16.4 15.6L19.4 14.4Z" fill="${p.ink}"/>` +
  `<path d="M33 25.4L33.9 27.5L36 28.4L33.9 29.3L33 31.4L32.1 29.3L30 28.4L32.1 27.5Z" fill="${p.soft}"/>`;

const craftCode: Art = (p) =>
  `<path d="M17.6 16.6L9.8 24L17.6 31.4" fill="none" stroke="${p.ink}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M30.4 16.6L38.2 24L30.4 31.4" fill="none" stroke="${p.ink}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M26.4 14.6L21.6 33.4" fill="none" stroke="${p.soft}" stroke-width="3.2" stroke-linecap="round"/>`;

/** Drawing + hue for every badge in the seeded catalogue. */
const ART: Record<string, { art: Art; hue: keyof typeof HUES }> = {
  first_post: { art: firstPost, hue: "orange" },
  ten_posts: { art: tenPosts, hue: "violet" },
  first_comment: { art: firstComment, hue: "blue" },
  fifty_comments: { art: fiftyComments, hue: "indigo" },
  conversation_starter: { art: conversationStarter, hue: "orange" },
  warming_up: { art: warmingUp, hue: "orange" },
  consistent: { art: consistent, hue: "green" },
  committed: { art: committed, hue: "blue" },
  relentless: { art: relentless, hue: "gold" },
  year_one: { art: yearOne, hue: "gold" },
  useful: { art: useful, hue: "rose" },
  helpful: { art: helpful, hue: "pink" },
  the_answer: { art: theAnswer, hue: "cyan" },
  indispensable: { art: indispensable, hue: "gold" },
  profile_complete: { art: profileComplete, hue: "cyan" },
  staff: { art: staff, hue: "teal" },
  founding_member: { art: foundingMember, hue: "gold" },
  channel_explorer: { art: channelExplorer, hue: "teal" },
  craft_ai_film_making: { art: craftFilm, hue: "plum" },
  craft_ai_for_business: { art: craftBusiness, hue: "blue" },
  craft_ai_image_generation: { art: craftImage, hue: "pink" },
  craft_automation_agents: { art: craftAgents, hue: "indigo" },
  craft_prompt_engineering: { art: craftPrompt, hue: "violet" },
  craft_vibe_coding: { art: craftCode, hue: "green" },
};

export function hasBadgeArt(code: string | null | undefined): boolean {
  return !!code && Object.hasOwn(ART, code);
}

/**
 * The palette a badge's artwork is drawn in, or the greys when it is not yet earned. Legendary
 * is forced to gold whatever the badge's own hue says — a badge staff promote to legendary
 * should not keep a pink drawing.
 */
export function badgeArtPalette(
  code: string | null | undefined,
  rarity: string,
  earned: boolean,
): BadgeArtPalette {
  if (!earned) return LOCKED_PALETTE;
  const hue = rarity === "legendary" ? HUES.gold : HUES[ART[code as string]?.hue ?? "blue"];
  return { ...hue, ink: WHITE };
}

/** The drawing's body, or undefined for a badge with no artwork yet (staff add one at runtime). */
export function badgeArt(
  code: string | null | undefined,
  palette: BadgeArtPalette,
): string | undefined {
  return code && Object.hasOwn(ART, code) ? ART[code].art(palette) : undefined;
}
