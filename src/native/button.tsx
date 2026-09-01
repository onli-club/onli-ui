import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import { semantic } from "../tokens/colors";
import { cn } from "./cn";
import { Icon } from "./icon";
import { Text, type TextTone } from "./text";

const SIZES = {
  sm: { box: "h-9 px-4 gap-1.5 rounded-full", text: "text-sm", icon: 15 },
  md: { box: "h-11 px-5 gap-2 rounded-full", text: "text-sm", icon: 17 },
  lg: { box: "h-12 px-7 gap-2 rounded-full", text: "text-base", icon: 19 },
} as const;

const VARIANTS = {
  primary: {
    box: "bg-brand hover:bg-brand-strong active:bg-brand-deep",
    tone: "on-brand",
    iconTone: "on-brand",
    spinner: semantic["on-brand"],
  },
  secondary: {
    box: "bg-surface border border-line-strong hover:bg-surface-solid-hover active:bg-surface-solid-press",
    tone: "default",
    iconTone: "ink",
    spinner: semantic.ink,
  },
  tonal: {
    box: "bg-brand-subtle hover:bg-brand/20 active:bg-brand/30",
    tone: "brand",
    iconTone: "brand",
    spinner: semantic.brand,
  },
  ghost: {
    box: "hover:bg-surface-hover active:bg-surface-press",
    tone: "brand",
    iconTone: "brand",
    spinner: semantic.brand,
  },
  danger: {
    box: "bg-danger-subtle hover:bg-danger/20 active:bg-danger/30",
    tone: "danger",
    iconTone: "danger",
    spinner: semantic.danger,
  },
} satisfies Record<
  string,
  { box: string; tone: TextTone; iconTone: Parameters<typeof Icon>[0]["tone"]; spinner: string }
>;

export type ButtonVariant = keyof typeof VARIANTS;

export function Button({
  title,
  variant = "primary",
  size = "md",
  icon,
  loading,
  disabled,
  className,
  ...props
}: Omit<PressableProps, "children"> & {
  title: string;
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}) {
  const s = SIZES[size];
  const v = VARIANTS[variant];
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "flex-row items-center justify-center transition-colors",
        s.box,
        v.box,
        (disabled || loading) && "opacity-40",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.spinner} />
      ) : (
        <>
          {icon ? <Icon icon={icon} size={s.icon} tone={v.iconTone} strokeWidth={2} /> : null}
          <Text variant="label" tone={v.tone} className={s.text}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
