import { Text as RNText, type TextProps } from "react-native";
import { cn } from "./cn";

const VARIANTS = {
  /** Section titles. */
  title: { font: "font-display", size: "text-2xl", track: "tracking-[-0.4px]" },
  /** Card/post titles. */
  heading: { font: "font-body-bold", size: "text-lg", track: "tracking-[-0.2px]" },
  /** Emphasized UI text. */
  subheading: { font: "font-body-bold", size: "text-base", track: "" },
  body: { font: "font-body", size: "text-base", track: "" },
  "body-sm": { font: "font-body", size: "text-sm", track: "" },
  /** Buttons, form labels, tabs. */
  label: { font: "font-body-md", size: "text-sm", track: "" },
  caption: { font: "font-body", size: "text-xs", track: "" },
} as const;

const TONES = {
  default: "text-ink",
  secondary: "text-ink-secondary",
  muted: "text-ink-muted",
  faint: "text-ink-faint",
  inverse: "text-ink-inverse",
  brand: "text-brand",
  "on-brand": "text-on-brand",
  accent: "text-accent-strong",
  danger: "text-danger",
  "rarity-common": "text-rarity-common-ink",
  "rarity-uncommon": "text-rarity-uncommon-ink",
  "rarity-rare": "text-rarity-rare-ink",
  "rarity-legendary": "text-rarity-legendary-ink",
} as const;

export type TextVariant = keyof typeof VARIANTS;
export type TextTone = keyof typeof TONES;
// Literal class map (not `text-${size}`) so Tailwind's scanner sees every class.
const SIZES = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-md",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
} as const;

export type TextSize = keyof typeof SIZES;

const DEFAULT_TONE: Partial<Record<TextVariant, TextTone>> = { caption: "muted" };

// Tailwind resolves conflicting utilities by stylesheet order, not className order,
// so a variant class is dropped whenever the caller's className overrides its group.
const SIZE_OVERRIDE = /(^|\s)text-(xs|sm|md|base|lg|xl|2xl|3xl|\[)/;
const FONT_OVERRIDE = /(^|\s)font-/;
const COLOR_OVERRIDE = /(^|\s)text-(ink|brand|on-brand|accent|danger|like|success)/;
const TRACK_OVERRIDE = /(^|\s)tracking-/;

/**
 * Non-selectable by default: nearly all Text is UI chrome and must not highlight on
 * click. Pass `selectable` on user content (post bodies, comments, bios) so people
 * can copy it.
 */
export function Text({
  variant = "body",
  tone,
  size,
  className,
  selectable = false,
  ...props
}: Omit<TextProps, "selectable"> & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Type-scale step that replaces the variant's size (e.g. size="md" for 15px dense body). */
  size?: TextSize;
  className?: string;
  selectable?: boolean;
}) {
  const v = VARIANTS[variant];
  const cls = className ?? "";
  return (
    <RNText
      className={cn(
        selectable ? "select-text" : "select-none",
        !FONT_OVERRIDE.test(cls) && v.font,
        !SIZE_OVERRIDE.test(cls) && (size ? SIZES[size] : v.size),
        !COLOR_OVERRIDE.test(cls) && TONES[tone ?? DEFAULT_TONE[variant] ?? "default"],
        !TRACK_OVERRIDE.test(cls) && v.track,
        cls,
      )}
      {...props}
    />
  );
}
