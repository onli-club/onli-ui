import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { rankInsigniaSvg } from "../rank-insignia-svg";

/**
 * The emblem for a rung of the ladder: a shield in the rung's colour carrying its drawing,
 * from `@onli/ui/rank-art`, composed by `rankInsigniaSvg`. Built the way `BadgeMedal` is, so
 * the two sit together as one kind of object.
 *
 * Takes the rung's permanent `key`, never its name — Admin -> Levels can rename a rung, and a
 * rename must not swap its mark. A rung with no artwork renders nothing, which leaves the
 * rank name standing on its own exactly as it did before insignia existed.
 *
 * `muted` is a rung the member has not reached — the same drawing in the paper's greys, as a
 * locked badge is, which is what makes reaching it read as a gain.
 *
 * Not sized below 20 — the top rungs carry laurel and crown detail. It draws its own frame,
 * so never wrap it in an IconCircle. Bylines stay text-only.
 */
export function RankInsignia({
  rank,
  size = 24,
  muted = false,
  accessibilityLabel,
}: {
  rank: string | null | undefined;
  size?: number;
  muted?: boolean;
  /** The rung's name. Omit when the name is rendered as text beside the emblem. */
  accessibilityLabel?: string;
}) {
  const xml = rankInsigniaSvg({ rank, muted });
  if (!xml) return null;
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel }
    : { "aria-hidden": true };
  // The a11y props live on a View, never on SvgXml: on web react-native-svg forwards every
  // prop to the raw <svg> element, and React rejects RN-only names there.
  return (
    <View {...a11y} style={{ width: size, height: size }}>
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}
