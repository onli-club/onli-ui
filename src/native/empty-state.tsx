import type { LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { cn } from "./cn";
import { IconCircle } from "./icon-circle";
import { Text } from "./text";

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <View className={cn("items-center px-8 py-20", className)}>
      {icon ? (
        <IconCircle icon={icon} size={64} iconSize={28} strokeWidth={1.6} className="mb-5" />
      ) : null}
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text
          variant="body-sm"
          tone="secondary"
          className="mt-2 max-w-[320px] text-center leading-[22px]"
        >
          {message}
        </Text>
      ) : null}
      {action ? <View className="mt-6">{action}</View> : null}
    </View>
  );
}
