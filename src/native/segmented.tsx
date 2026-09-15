import { useEffect, useState } from "react";
import { type LayoutChangeEvent, Pressable, View, type ViewStyle } from "react-native";
import Animated, { type CSSStyle, cubicBezier } from "react-native-reanimated";
import { motion, semantic, shadows } from "../tokens";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";
import { Text } from "./text";

const EASE_IN_OUT = cubicBezier(...motion.curve.inOut);

const INDICATOR = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  borderRadius: 999,
  backgroundColor: semantic.surface,
  boxShadow: shadows.card,
  pointerEvents: "none",
} as const;

/**
 * The padding sits on an outer view and the options on an inner one with none, because Yoga
 * positions an absolute child from its parent's BORDER edge while the web positions it from
 * the padding edge — with no padding in between, the indicator and the measured option x
 * share one origin on both.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [rects, setRects] = useState<Record<string, { x: number; width: number }>>({});
  // Undefined until the option reports its box, so the pill never flashes at x=0.
  const rect = rects[value];
  const measured = rect !== undefined;
  // Turns on after the render that first places the pill, so that placement does not slide.
  const [placed, setPlaced] = useState(false);
  useEffect(() => {
    if (measured) setPlaced(true);
  }, [measured]);
  const slide = placed && !reduced;

  // `transform` moves on the compositor, `width` does not — it is a layout property, so the
  // browser reflows the indicator on every frame of the slide. It stays a width because the
  // pill is ~60px with fully rounded ends, which a non-uniform scaleX would deform.
  const style: CSSStyle<ViewStyle> = {
    opacity: rect ? 1 : 0,
    width: rect?.width ?? 0,
    transform: [{ translateX: rect?.x ?? 0 }],
    transitionProperty: ["transform", "width"],
    transitionDuration: slide ? motion.duration.base : 0,
    transitionTimingFunction: EASE_IN_OUT,
  };

  const measure = (key: T) => (e: LayoutChangeEvent) => {
    const { x: nx, width: nw } = e.nativeEvent.layout;
    setRects((prev) => {
      const cur = prev[key];
      return cur && cur.x === nx && cur.width === nw
        ? prev
        : { ...prev, [key]: { x: nx, width: nw } };
    });
  };

  return (
    <View className={cn("self-start rounded-full bg-surface-sunken p-1", className)}>
      <View accessibilityRole="tablist" className="flex-row gap-1">
        <Animated.View aria-hidden style={[INDICATOR, style]} />
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              hitSlop={6}
              onLayout={measure(o.value)}
              onPress={() => onChange(o.value)}
              // the wash would paint over the indicator, so only an unselected option wears it
              className={cn(
                "rounded-full px-4 py-1.5 transition-colors duration-fast",
                !active && "hover:bg-surface-hover active:bg-surface-press",
              )}
            >
              <Text
                variant="label"
                tone={active ? "default" : "muted"}
                className="transition-colors duration-fast"
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
