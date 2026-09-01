/** Radii in px: controls 12, cards 16, hero surfaces 20. */
export const radii = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 16,
  "2xl": 20,
  "3xl": 28,
} as const;

/** Soft, warm shadows — hairline borders do most elevation work. */
export const shadows = {
  card: "0 1px 2px rgba(32, 40, 31, 0.05), 0 4px 16px rgba(32, 40, 31, 0.05)",
  pop: "0 4px 12px rgba(32, 40, 31, 0.10), 0 12px 32px rgba(32, 40, 31, 0.10)",
} as const;

/** Content column widths (px) for centered desktop layouts. */
export const layout = {
  reading: 760,
  modal: 440,
  sidebar: 264,
  rail: 300,
  // sidebar + main column + right rail, centered as one block on wide screens
  shell: 1384,
} as const;
