/**
 * The "Onli." wordmark's metrics — the logo's identity, shared by the React Native
 * `Wordmark` and the generated `css/wordmark.css` web classes so no consumer hand-builds it.
 */
export const wordmarkSizes = {
  /** Nav bars. */
  sm: { fontSize: 22, lineHeight: 28, letterSpacing: -0.5 },
  /** Default; drawers. */
  md: { fontSize: 24, lineHeight: 30, letterSpacing: -0.6 },
  /** Sign-in hero. */
  xl: { fontSize: 44, lineHeight: 52, letterSpacing: -1 },
} as const;

export type WordmarkSize = keyof typeof wordmarkSizes;
