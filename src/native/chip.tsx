import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { cn } from "./cn";
import { Icon } from "./icon";
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
    "flex-row items-center gap-1 self-start rounded-full px-3 py-1.5 transition-colors",
    selected ? "bg-brand" : "bg-surface-sunken",
    onPress &&
      (selected
        ? "hover:bg-brand-strong active:bg-brand-deep"
        : "hover:bg-surface-sunken-hover active:bg-surface-sunken-press"),
    className,
  );
  // Selection is shown by a glyph as well as the fill, so colour is never the only cue.
  const text = (
    <>
      {selected && onPress ? (
        <Icon icon={Check} size={12} tone="on-brand" strokeWidth={2.4} />
      ) : null}
      <Text variant="label" className="text-xs" tone={selected ? "on-brand" : "secondary"}>
        {label}
      </Text>
    </>
  );
  if (!onPress) return <View className={classes}>{text}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      hitSlop={8}
      onPress={onPress}
      className={classes}
    >
      {text}
    </Pressable>
  );
}
