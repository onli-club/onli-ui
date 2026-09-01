import type { ReactNode } from "react";
import { Pressable, type PressableProps, View } from "react-native";
import { cn } from "./cn";

// overflow-hidden so full-bleed children (list rows with hover fills, cover images)
// clip to the rounded corners instead of painting past the border
const BASE = "overflow-hidden rounded-xl border border-line bg-surface";

export function Card({
  children,
  padded = true,
  className,
  onPress,
  ...props
}: Omit<PressableProps, "children"> & {
  children: ReactNode;
  padded?: boolean;
  className?: string;
}) {
  const classes = cn(BASE, padded && "p-5", className);
  if (!onPress) return <View className={classes}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        classes,
        "transition-colors hover:border-line-strong active:bg-surface-solid-press",
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}
