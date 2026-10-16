import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import type { SemanticColor } from "../tokens/colors";
import { cn } from "./cn";
import { Icon } from "./icon";

const TONES = {
  brand: { box: "bg-brand-subtle", icon: "brand" },
  "brand-faint": { box: "bg-brand-faint", icon: "brand" },
  accent: { box: "bg-accent-subtle", icon: "accent-strong" },
  danger: { box: "bg-danger-subtle", icon: "danger" },
  /** Scrim circle for glyphs over media (e.g. a play button). */
  overlay: { box: "bg-overlay", icon: "ink-inverse" },
} satisfies Record<string, { box: string; icon: SemanticColor }>;

/**
 * Circular tinted holder for a glyph. `size` is the circle's diameter in px; the icon
 * defaults to ~45% of it.
 */
export function IconCircle({
  icon,
  size = 40,
  iconSize,
  tone = "brand",
  strokeWidth,
  fill,
  className,
}: {
  icon: LucideIcon;
  size?: number;
  iconSize?: number;
  tone?: keyof typeof TONES;
  strokeWidth?: number;
  fill?: SemanticColor;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <View
      className={cn("items-center justify-center rounded-full", t.box, className)}
      style={{ width: size, height: size }}
    >
      <Icon
        icon={icon}
        size={iconSize ?? Math.round(size * 0.45)}
        tone={t.icon}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </View>
  );
}
