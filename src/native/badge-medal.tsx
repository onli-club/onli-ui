import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { type BadgeRarity, badgeMedalSvg } from "../badge-medal-svg";

export type { BadgeRarity, BadgeShape } from "../badge-medal-svg";

/**
 * A badge as a struck medal: a frame whose SHAPE says what kind of thing the member did and
 * whose COLOUR says how rare it is, a bevel line inset inside it, and the badge's glyph.
 *
 * The whole thing is one SVG from `@onli/ui/badge-medal-svg`, shared with onli-admin — not a
 * bordered box painted by Tailwind classes. Two reasons: a medal that is only a disc plus an
 * icon makes every badge look like every other, and a CSS-painted disc renders with no fill
 * at all whenever the compiled stylesheet is behind the tokens.
 */
export function BadgeMedal({
  icon,
  ruleType,
  rarity,
  earned = true,
  size = 40,
  accessibilityLabel,
}: {
  /** Glyph name; an unknown or missing one falls back to a generic award glyph. */
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
      <SvgXml xml={badgeMedalSvg({ icon, ruleType, rarity, earned })} width={size} height={size} />
    </View>
  );
}
