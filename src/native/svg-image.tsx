import { View } from "react-native";
import { SvgXml } from "react-native-svg";

/**
 * A square SVG string: an `image` named `accessibilityLabel`, or hidden from assistive tech
 * without one. The a11y props live on a View, never on SvgXml: on web react-native-svg
 * forwards every prop to the raw <svg> element, and React rejects RN-only names there.
 */
export function SvgImage({
  xml,
  size,
  accessibilityLabel,
}: {
  xml: string;
  size: number;
  accessibilityLabel?: string;
}) {
  const a11y = accessibilityLabel
    ? { accessible: true, accessibilityRole: "image" as const, accessibilityLabel }
    : { "aria-hidden": true };
  return (
    <View {...a11y} style={{ width: size, height: size }}>
      <SvgXml xml={xml} width={size} height={size} />
    </View>
  );
}
