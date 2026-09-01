import type { LucideIcon } from "lucide-react-native";
import { Pressable, type PressableProps } from "react-native";
import type { SemanticColor } from "../tokens/colors";
import { cn } from "./cn";
import { Icon } from "./icon";

const VARIANTS = {
  default: {
    box: "hover:bg-surface-hover active:bg-surface-press",
    iconTone: "ink-secondary" as SemanticColor,
  },
  /** Filled call-to-action (e.g. a send button). */
  primary: {
    box: "bg-brand hover:bg-brand-strong active:bg-brand-deep",
    iconTone: "on-brand" as SemanticColor,
  },
} as const;

export function IconButton({
  icon,
  size = 20,
  tone,
  variant = "default",
  className,
  disabled,
  ...props
}: Omit<PressableProps, "children"> & {
  icon: LucideIcon;
  size?: number;
  tone?: SemanticColor;
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
        "h-10 w-10 items-center justify-center rounded-full transition-colors",
        v.box,
        disabled && "opacity-40",
        className,
      )}
      {...props}
    >
      <Icon icon={icon} size={size} tone={tone ?? v.iconTone} />
    </Pressable>
  );
}
