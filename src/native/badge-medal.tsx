import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { type BadgeRarity, badgeMedalSvg } from "../badge-medal-svg";

export type { BadgeRarity, BadgeShape } from "../badge-medal-svg";

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
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel }
    : { "aria-hidden": true };
  // The a11y props live on a View, never on SvgXml: on web react-native-svg forwards every
  // prop to the raw <svg> element, and React rejects RN-only names there.
  return (
    <View {...a11y} style={{ width: size, height: size }}>
      <SvgXml
        xml={badgeMedalSvg({ code, icon, ruleType, rarity, earned })}
        width={size}
        height={size}
      />
    </View>
  );
}
