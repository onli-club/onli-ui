import type { LucideIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, type PressableProps, type ViewStyle } from "react-native";
import Animated, { type CSSStyle, css, cubicBezier } from "react-native-reanimated";
import { semantic } from "../tokens/colors";
import { motion } from "../tokens/motion";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";
import { Icon } from "./icon";
import type { KeyframeStyle } from "./keyframes";
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

const EASE_OUT = cubicBezier(...motion.curve.out);

// A two-step dip needs two style commits as a transition, so the crossfade is one keyframe
// animation instead: down over `press`, back up over `fast`.
const DIP_MS = motion.duration.press + motion.duration.fast;
const DIP = css.keyframes<KeyframeStyle>({
  from: { opacity: 1, animationTimingFunction: EASE_OUT },
  [`${((motion.duration.press / DIP_MS) * 100).toFixed(4)}%`]: {
    opacity: 0.4,
    animationTimingFunction: EASE_OUT,
  },
  to: { opacity: 1 },
});

export function Button({
  title,
  variant = "primary",
  size = "md",
  icon,
  loading,
  progress,
  disabled,
  className,
  ...props
}: Omit<PressableProps, "children"> & {
  title: string;
  variant?: ButtonVariant;
  size?: keyof typeof SIZES;
  icon?: LucideIcon;
  loading?: boolean;
  /** 0–1: the button becomes its own progress indicator, busy but not dimmed. */
  progress?: number;
  className?: string;
}) {
  const s = SIZES[size];
  const v = VARIANTS[variant];
  const reduced = useReducedMotion();
  const shown = useRef(title);
  // Counts the dips rather than flagging one: it keys the animated view, and remounting is
  // what replays a CSS animation whose name has not changed.
  const [dip, setDip] = useState(0);
  // A label that changes under the finger (Join -> Leave) dips instead of snapping; never on
  // mount, and never when the reduce-motion setting itself flips.
  useEffect(() => {
    if (shown.current === title) return;
    shown.current = title;
    // A counting label is a stream, not a change of state, so it never dips.
    if (reduced || progress !== undefined) return;
    setDip((n) => n + 1);
  }, [title, reduced, progress]);
  const fade: CSSStyle<ViewStyle> =
    dip === 0 ? {} : { animationName: DIP, animationDuration: DIP_MS };
  const busy = progress !== undefined;
  // The fill is a style, not a class: NativeWind drops a className on an animated view.
  const fill: CSSStyle<ViewStyle> | null = busy
    ? {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: `${Math.min(1, Math.max(0, progress)) * 100}%`,
        backgroundColor: semantic["brand-subtle"],
        ...(reduced
          ? {}
          : {
              transitionProperty: "width",
              transitionDuration: motion.duration.fast,
              transitionTimingFunction: EASE_OUT,
            }),
      }
    : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ busy: loading || busy }}
      className={cn(
        "flex-row items-center justify-center transition duration-press ease-out active:scale-[0.97]",
        s.box,
        v.box,
        busy && "overflow-hidden",
        (disabled || loading) && !busy && "opacity-40",
        className,
      )}
      disabled={disabled || loading || busy}
      {...props}
    >
      {fill ? <Animated.View aria-hidden style={fill} /> : null}
      {loading ? (
        <ActivityIndicator size="small" color={v.spinner} />
      ) : (
        <Animated.View
          key={dip}
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
