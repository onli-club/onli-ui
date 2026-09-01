import { Pressable, View } from "react-native";
import { cn } from "./cn";
import { Text } from "./text";

export function Chip({
  label,
  selected = false,
  onPress,
  className,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const classes = cn(
    "self-start rounded-full px-3 py-1.5 transition-colors",
    selected ? "bg-brand" : "bg-surface-sunken",
    onPress &&
      (selected
        ? "hover:bg-brand-strong active:bg-brand-deep"
        : "hover:bg-surface-sunken-hover active:bg-surface-sunken-press"),
    className,
  );
  const text = (
    <Text variant="label" className="text-xs" tone={selected ? "on-brand" : "secondary"}>
      {label}
    </Text>
  );
  if (!onPress) return <View className={classes}>{text}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className={classes}>
      {text}
    </Pressable>
  );
}
