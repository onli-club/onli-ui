import { View } from "react-native";
import { cn } from "./cn";
import { Text } from "./text";

/** Big number over a caption label (profile counts, rail progress). */
export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <View className={cn("items-center", className)}>
      <Text variant="heading">{value}</Text>
      <Text variant="caption">{label}</Text>
    </View>
  );
}
