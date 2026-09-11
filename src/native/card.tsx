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
      accessibilityRole="button"
      onPress={onPress}
      className={cn(
        classes,
        // 0.99, not the controls' 0.97: a 760px-wide card at 0.97 shifts its edge 23px
        "transition duration-press ease-out hover:border-line-strong active:bg-surface-solid-press active:scale-[0.99]",
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}
