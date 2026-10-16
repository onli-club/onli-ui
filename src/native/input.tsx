import { TextInput, type TextInputProps, View } from "react-native";
import { semantic } from "../tokens/colors";
import { cn } from "./cn";
import { Text } from "./text";

export function Input({
  label,
  helper,
  className,
  multiline,
  accessibilityLabel,
  ...props
}: TextInputProps & { label?: string; helper?: string; className?: string }) {
  return (
    <View className={className}>
      {label ? (
        <Text variant="label" tone="secondary" className="mb-2">
          {label}
        </Text>
      ) : null}
      <TextInput
        accessibilityLabel={accessibilityLabel ?? label}
        className={cn(
          "rounded-lg border border-line-input bg-surface px-4 py-3 font-body text-base text-ink focus:border-focus",
          multiline && "min-h-[120px]",
        )}
        placeholderTextColor={semantic["ink-muted"]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
      {helper ? (
        <Text variant="caption" className="mt-1">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
