import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { semantic } from "../tokens/colors";
import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View
      className={cn("rounded-sm", className)}
      style={{ opacity, backgroundColor: semantic["surface-sunken"] }}
    />
  );
}
