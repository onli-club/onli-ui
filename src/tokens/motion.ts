/** Cubic-bezier control points (x1, y1, x2, y2). */
export type MotionCurve = readonly [number, number, number, number];

/**
 * Durations in ms and the three curves everything moves on. Animate transform and opacity
 * only, never `ease-in`, and never longer than the drawer.
 */
export const motion = {
  duration: {
    /** Press feedback on a control. */
    press: 120,
    /** A colour or label settling. */
    fast: 160,
    /** The default for anything that moves. */
    base: 200,
    /** Screen-to-screen transitions. */
    screen: 240,
    /** Drawers and sheets. */
    drawer: 260,
  },
  curve: {
    /** Entrances and feedback. */
    out: [0.23, 1, 0.32, 1],
    /** Movement from one place on screen to another. */
    inOut: [0.77, 0, 0.175, 1],
    /** Sheets and drawers. */
    drawer: [0.32, 0.72, 0, 1],
  },
} as const satisfies { duration: Record<string, number>; curve: Record<string, MotionCurve> };

/** A curve as a CSS timing function. */
export const cssEasing = (c: MotionCurve) => `cubic-bezier(${c.join(", ")})`;
