import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { semantic } from "../tokens/colors";
import { useReducedMotion } from "./a11y";
import { cn } from "./cn";

// NativeWind only interops the components it registers (View, Text, Pressable…); a
// className on Animated.View is dropped, so the size/radius classes go on a plain View.
export function Skeleton({ className }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      opacity.setValue(0.75);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reduced]);
  return (
    <View className={cn("overflow-hidden rounded-sm", className)}>
      <Animated.View style={{ flex: 1, opacity, backgroundColor: semantic["surface-sunken"] }} />
    </View>
  );
}
