import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { cn } from "./cn";
import { Icon } from "./icon";
import { Text } from "./text";

export function ListRow({
  title,
  subtitle,
  left,
  right,
  chevron = false,
  dense = false,
  onPress,
  className,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
  /** Compact row (rails, secondary lists): tighter padding, label-weight title. */
  dense?: boolean;
  onPress?: () => void;
  className?: string;
}) {
  const body = (
    <>
      {left ? <View className="mr-3">{left}</View> : null}
      <View className="flex-1">
        <Text variant={dense ? "label" : "subheading"} numberOfLines={dense ? 2 : undefined}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant={dense ? "caption" : "body-sm"} tone="secondary" className="mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
      {chevron ? <Icon icon={ChevronRight} size={dense ? 16 : 18} tone="ink-faint" /> : null}
    </>
  );
  const classes = cn("flex-row items-center", dense ? "px-4 py-3.5" : "px-5 py-4", className);
  if (!onPress) return <View className={classes}>{body}</View>;
  return (
    <Pressable
      onPress={onPress}
      className={cn(classes, "transition-colors hover:bg-surface-hover active:bg-surface-press")}
    >
      {body}
    </Pressable>
  );
}
