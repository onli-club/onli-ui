import { TextInput, type TextInputProps, View } from "react-native";
import { semantic } from "../tokens/colors";
import { cn } from "./cn";
import { Text } from "./text";

export function Input({
  label,
  error,
  helper,
  className,
  multiline,
  ...props
}: TextInputProps & { label?: string; error?: string; helper?: string; className?: string }) {
  return (
    <View className={className}>
      {label ? (
        <Text variant="label" tone="secondary" className="mb-2">
          {label}
        </Text>
      ) : null}
      <TextInput
        className={cn(
          "rounded-lg border bg-surface px-4 py-3 font-body text-base text-ink",
          error ? "border-danger" : "border-line-strong focus:border-focus",
          multiline && "min-h-[120px]",
        )}
        placeholderTextColor={semantic["ink-muted"]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
      {error ? (
        <Text variant="caption" tone="danger" className="mt-1">
          {error}
        </Text>
      ) : helper ? (
        <Text variant="caption" className="mt-1">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
