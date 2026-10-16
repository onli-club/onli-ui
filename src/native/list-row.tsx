import { ChevronRight } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { cn } from "./cn";
import { Icon } from "./icon";
import { WASH } from "./recipes";
import { Text } from "./text";

export function ListRow({
  title,
  subtitle,
  left,
  right,
  chevron = false,
  dense = false,
  onPress,
  accessibilityRole = "button",
  className,
}: {
  title: string;
  /** A string, or a node for a line that carries more than text (icon + value facts). */
  subtitle?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
  /** Compact row (rails, secondary lists): tighter padding, label-weight title. */
  dense?: boolean;
  onPress?: () => void;
  /** `link` when the row navigates. */
  accessibilityRole?: "button" | "link";
  className?: string;
}) {
  const body = (
    <>
      {left ? <View className="mr-3">{left}</View> : null}
      <View className="flex-1">
        <Text variant={dense ? "label" : "subheading"} numberOfLines={dense ? 2 : undefined}>
          {title}
        </Text>
        {typeof subtitle === "string" ? (
          <Text variant={dense ? "caption" : "body-sm"} tone="secondary" className="mt-0.5">
            {subtitle}
          </Text>
        ) : subtitle ? (
          <View className="mt-0.5">{subtitle}</View>
        ) : null}
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
      {chevron ? <Icon icon={ChevronRight} size={dense ? 16 : 18} tone="ink-muted" /> : null}
    </>
  );
  const classes = cn("flex-row items-center", dense ? "px-4 py-3.5" : "px-5 py-4", className);
  if (!onPress) return <View className={classes}>{body}</View>;
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      onPress={onPress}
      className={cn(classes, "transition-colors", WASH)}
    >
      {body}
    </Pressable>
  );
}
