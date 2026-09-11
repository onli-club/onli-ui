import { useEffect, useRef, useState } from "react";
import { type LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { motion, semantic, shadows } from "../tokens";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";
import { Text } from "./text";

const EASE_IN_OUT = Easing.bezier(...motion.curve.inOut);

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
  const x = useSharedValue(0);
  const width = useSharedValue(0);
  const opacity = useSharedValue(0);
  const placed = useRef(false);

  useEffect(() => {
    const rect = rects[value];
    if (!rect) return;
    if (placed.current && !reduced) {
      const config = { duration: motion.duration.base, easing: EASE_IN_OUT };
      x.value = withTiming(rect.x, config);
      width.value = withTiming(rect.width, config);
    } else {
      x.value = rect.x;
      width.value = rect.width;
    }
    placed.current = true;
    opacity.value = 1;
  }, [rects, value, reduced, x, width, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    width: width.value,
    transform: [{ translateX: x.value }],
  }));

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
