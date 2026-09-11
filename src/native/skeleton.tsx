import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { semantic } from "../tokens/colors";
import { motion } from "../tokens/motion";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";

const EASE_IN_OUT = Easing.bezier(...motion.curve.inOut);
// A loading pulse breathes rather than moves, so it is exempt from the token durations.
const PULSE = 700;

// NativeWind only interops the components it registers (View, Text, Pressable…); a
// className on Animated.View is dropped, so the size/radius classes go on a plain View.
export function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(0.5);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      cancelAnimation(opacity);
      opacity.value = 0.75;
      return;
    }
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE, easing: EASE_IN_OUT }),
        withTiming(0.5, { duration: PULSE, easing: EASE_IN_OUT }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduced]);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View className={cn("overflow-hidden rounded-sm", className)}>
      <Animated.View style={[{ flex: 1, backgroundColor: semantic["surface-sunken"] }, pulse]} />
    </View>
  );
}
