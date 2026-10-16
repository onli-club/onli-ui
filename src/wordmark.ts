/**
 * The "Onli." wordmark's metrics — the logo's identity, shared by the React Native
 * `Wordmark`, the generated `css/wordmark.css` web classes and `@onli/ui/tokens` (the
 * server's emails) so no consumer hand-builds it.
 */
export const wordmarkSizes = {
  /** Nav bars. */
  sm: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  /** Default; drawers. */
  md: { fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
} as const;

export type WordmarkSize = keyof typeof wordmarkSizes;
