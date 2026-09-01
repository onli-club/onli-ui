import type { ComponentType } from "react";
import { Image, Text as RNText, View } from "react-native";
import { primitives } from "../tokens/colors";
import { fontFamilies } from "../tokens/typography";

const SIZES = { xs: 24, sm: 32, md: 40, lg: 64, xl: 96 } as const;

/** Deterministic warm duos for initials fallbacks. */
const DUOS = [
  { bg: primitives.green[100], fg: primitives.green[700] },
  { bg: primitives.amber[100], fg: primitives.amber[700] },
  { bg: primitives.clay[100], fg: primitives.clay[600] },
  { bg: primitives.sand[300], fg: primitives.ink[500] },
  { bg: primitives.green[200], fg: primitives.green[800] },
] as const;

export type AvatarImageProps = {
  source: { uri: string };
  style: { width: number; height: number; borderRadius: number };
};

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
      <Img source={{ uri: imageUrl }} style={{ width: px, height: px, borderRadius: px / 2 }} />
    );
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const duo = DUOS[Math.abs(hash) % DUOS.length];
  return (
    <View
      className="items-center justify-center"
      style={{ width: px, height: px, borderRadius: px / 2, backgroundColor: duo.bg }}
    >
      <RNText
        style={{
          fontFamily: fontFamilies["body-bold"],
          fontSize: px * 0.36,
          color: duo.fg,
          userSelect: "none",
        }}
      >
        {initials || "?"}
      </RNText>
    </View>
  );
}
