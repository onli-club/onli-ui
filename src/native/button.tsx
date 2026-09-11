import type { LucideIcon } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, type PressableProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { semantic } from "../tokens/colors";
import { motion } from "../tokens/motion";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";
import { Icon } from "./icon";
import { Text, type TextTone } from "./text";

// gap is a number, not a class: the icon and label live inside an Animated.View, and
// NativeWind drops a className there.
const SIZES = {
  sm: { box: "min-h-9 px-4 rounded-full", gap: 6, text: "text-sm", icon: 15 },
  md: { box: "min-h-11 px-5 rounded-full", gap: 8, text: "text-sm", icon: 17 },
  lg: { box: "min-h-12 px-7 rounded-full", gap: 8, text: "text-base", icon: 19 },
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

const EASE_OUT = Easing.bezier(...motion.curve.out);

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
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);
  const shown = useRef(title);
  // A label that changes under the finger (Join -> Leave) dips instead of snapping; never on
  // mount, and never when the reduce-motion setting itself flips.
  useEffect(() => {
    if (shown.current === title) return;
    shown.current = title;
    if (reduced) return;
    opacity.value = withSequence(
      withTiming(0.4, { duration: motion.duration.press, easing: EASE_OUT }),
      withTiming(1, { duration: motion.duration.fast, easing: EASE_OUT }),
    );
  }, [title, reduced, opacity]);
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy: loading }}
      className={cn(
        "flex-row items-center justify-center transition duration-press ease-out active:scale-[0.97]",
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
        <Animated.View
          style={[{ flexDirection: "row", alignItems: "center", flexShrink: 1, gap: s.gap }, fade]}
        >
          {icon ? <Icon icon={icon} size={s.icon} tone={v.iconTone} strokeWidth={2} /> : null}
          <Text variant="label" tone={v.tone} className={s.text}>
            {title}
          </Text>
        </Animated.View>
      )}
    </Pressable>
  );
}
