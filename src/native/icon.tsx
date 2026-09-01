import type { LucideIcon } from "lucide-react-native";
import { type SemanticColor, semantic } from "../tokens/colors";

export function Icon({
  icon: Glyph,
  size = 20,
  tone = "ink-secondary",
  strokeWidth = 1.8,
  fill,
}: {
  icon: LucideIcon;
  size?: number;
  tone?: SemanticColor;
  strokeWidth?: number;
  /** Fills the glyph (filled heart, flame); omit for the default outline. */
  fill?: SemanticColor;
}) {
  return (
    <Glyph
      size={size}
      color={semantic[tone]}
      strokeWidth={strokeWidth}
      {...(fill ? { fill: semantic[fill] } : {})}
    />
  );
}
