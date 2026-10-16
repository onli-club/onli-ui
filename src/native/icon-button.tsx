import type { LucideIcon } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";
import type { SemanticColor } from "../tokens/colors";
import { cn } from "./cn";
import { Icon } from "./icon";
import { BRAND_FILL, PRESS, WASH } from "./recipes";

const VARIANTS = {
  default: { box: WASH, iconTone: "ink-secondary" },
  /** Filled call-to-action (e.g. a send button). */
  primary: { box: BRAND_FILL, iconTone: "on-brand" },
} satisfies Record<string, { box: string; iconTone: SemanticColor }>;

export function IconButton({
  icon,
  size = 20,
  variant = "default",
  className,
  disabled,
  ...props
}: Omit<PressableProps, "children" | "accessibilityLabel"> & {
  icon: LucideIcon;
  /** Required: the glyph is the only visible content, so this is the button's whole name. */
  accessibilityLabel: string;
  size?: number;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      disabled={disabled}
      className={cn(
        "h-10 w-10 items-center justify-center rounded-full",
        PRESS,
        v.box,
        disabled && "opacity-40",
        className,
      )}
      {...props}
    >
      <Icon icon={icon} size={size} tone={v.iconTone} />
    </Pressable>
  );
}
