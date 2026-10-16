// Class recipes shared by the pressable components. Each stays one whole literal: consumers'
// Tailwind scans this file as text, so a class assembled from fragments would never compile.

/** A control's press feedback: the 97% dip, over `duration-press`, with its colour change. */
export const PRESS = "transition duration-press ease-out active:scale-[0.97]";

/** A brand-filled control, darkening through its own ramp. */
export const BRAND_FILL = "bg-brand hover:bg-brand-strong active:bg-brand-deep";

/** The hover/press wash for a pressable that rests transparent (docs/TOKENS.md). */
export const WASH = "hover:bg-surface-hover active:bg-surface-press";

/** A destructive control on its subtle fill. */
export const DANGER_FILL = "bg-danger-subtle hover:bg-danger/20 active:bg-danger/30";
