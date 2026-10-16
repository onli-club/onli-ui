import { type BadgeRarity, badgeMedalSvg } from "../badge-medal-svg";
import { SvgImage } from "./svg-image";

/**
 * A badge. Every badge in the seeded catalogue has its OWN DRAWING, keyed by `code`; one staff
 * create later falls back to a struck medal carrying its lucide glyph. Both come out of
 * `@onli/ui/badge-medal-svg` as one SVG string, shared with onli-admin — not a bordered box
 * painted by Tailwind classes, because a CSS-painted disc renders with no fill at all whenever
 * the compiled stylesheet is behind the tokens.
 */
export function BadgeMedal({
  code,
  icon,
  ruleType,
  rarity,
  earned = true,
  size = 40,
  accessibilityLabel,
}: {
  /** The badge's permanent code, which its artwork is keyed by. */
  code?: string | null;
  /** Fallback glyph name, used only when the badge has no artwork. */
  icon: string | null | undefined;
  /** Drives the frame shape. An unknown rule type falls back to the seal. */
  ruleType: string | null | undefined;
  rarity: BadgeRarity;
  earned?: boolean;
  size?: number;
  /**
   * What the medal stands for ("First post, uncommon"). Omit when the badge's name is
   * rendered as text beside it — the medal is then hidden from assistive tech, not read twice.
   */
  accessibilityLabel?: string;
}) {
  return (
    <SvgImage
      xml={badgeMedalSvg({ code, icon, ruleType, rarity, earned })}
      size={size}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
