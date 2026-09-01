import { ActivityIndicator } from "react-native";
import { type SemanticColor, semantic } from "../tokens/colors";

/** Brand-colored ActivityIndicator so screens never reach into tokens for it. */
export function Spinner({
  size = "large",
  tone = "brand",
  className,
}: {
  size?: "small" | "large";
  tone?: SemanticColor;
  className?: string;
}) {
  return <ActivityIndicator className={className} size={size} color={semantic[tone]} />;
}
