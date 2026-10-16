import { View, type ViewStyle } from "react-native";
import Animated, { type CSSStyle, css } from "react-native-reanimated";
import { semantic } from "../tokens/colors";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";
import { EASE_IN_OUT } from "./easing";
import type { KeyframeStyle } from "./keyframes";

// A loading pulse breathes rather than moves, so it is exempt from the token durations.
const PULSE_MS = 1400;
const PULSE = css.keyframes<KeyframeStyle>({
  from: { opacity: 0.5, animationTimingFunction: EASE_IN_OUT },
  "50%": { opacity: 1, animationTimingFunction: EASE_IN_OUT },
  to: { opacity: 0.5 },
});

// NativeWind only interops the components it registers (View, Text, Pressable…); a
// className on Animated.View is dropped, so the size/radius classes go on a plain View.
export function Skeleton({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const pulse: CSSStyle<ViewStyle> = reduced
    ? { opacity: 0.75 }
    : {
        animationName: PULSE,
        animationDuration: PULSE_MS,
        animationIterationCount: "infinite",
      };
  return (
    <View className={cn("overflow-hidden rounded-sm", className)}>
      <Animated.View style={[{ flex: 1, backgroundColor: semantic["surface-sunken"] }, pulse]} />
    </View>
  );
}
