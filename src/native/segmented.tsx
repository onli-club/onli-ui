import { Pressable, View } from "react-native";
import { cn } from "./cn";
import { Text } from "./text";

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
  return (
    <View className={cn("flex-row gap-1 self-start rounded-full bg-surface-sunken p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            onPress={() => onChange(o.value)}
            className={cn(
              "rounded-full px-4 py-1.5 transition-colors",
              active ? "bg-surface shadow-card" : "hover:bg-surface-hover active:bg-surface-press",
            )}
          >
            <Text variant="label" tone={active ? "default" : "muted"}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
