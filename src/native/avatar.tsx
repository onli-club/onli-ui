import type { ComponentType } from "react";
import { Image, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { semantic } from "../tokens/colors";

const SIZES = { xs: 24, sm: 32, md: 40, lg: 64, xl: 96 } as const;

export type AvatarImageProps = {
  source: { uri: string };
  style: { width: number; height: number; borderRadius: number };
  accessibilityLabel: string;
};

/**
 * A member with no photo yet. One mark for everyone rather than initials or a generated
 * pattern: a placeholder should read as "no photo", not as an identity, and a feed of
 * coloured monograms competes with the members who did upload one.
 *
 * Drawn with primitives rather than an icon font so it scales cleanly from the 24px byline
 * to the 96px profile, and the geometry is proportional to the box.
 */
function PersonGlyph({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={12} fill={semantic["surface-sunken"]} />
      <Circle cx={12} cy={9.4} r={3.4} fill={semantic["ink-faint"]} />
      <Path d="M6.4 19a5.6 5.6 0 0 1 11.2 0Z" fill={semantic["ink-faint"]} />
    </Svg>
  );
}

export function Avatar({
  name,
  imageUrl,
  size = "md",
  ImageComponent,
}: {
  name: string;
  imageUrl?: string | null;
  size?: keyof typeof SIZES;
  /** Swap in expo-image for caching/transitions; defaults to RN Image. */
  ImageComponent?: ComponentType<AvatarImageProps>;
}) {
  const px = SIZES[size];
  if (imageUrl) {
    const Img = ImageComponent ?? Image;
    return (
      <Img
        source={{ uri: imageUrl }}
        style={{ width: px, height: px, borderRadius: px / 2 }}
        accessibilityLabel={name}
      />
    );
  }
  // The a11y props live on the View, never on Svg: on web react-native-svg forwards every
  // prop to the raw <svg> element, and React rejects RN-only names there.
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={name}>
      <PersonGlyph size={px} />
    </View>
  );
}
