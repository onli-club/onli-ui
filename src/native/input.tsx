import { TextInput, type TextInputProps, View } from "react-native";
import { semantic } from "../tokens/colors";
import { cn } from "./cn";
import { FormError } from "./form-error";
import { Text } from "./text";

export function Input({
  label,
  error,
  helper,
  className,
  multiline,
  accessibilityLabel,
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
        accessibilityLabel={accessibilityLabel ?? label}
        aria-invalid={!!error}
        className={cn(
          "rounded-lg border bg-surface px-4 py-3 font-body text-base text-ink",
          error ? "border-danger" : "border-line-input focus:border-focus",
          multiline && "min-h-[120px]",
        )}
        placeholderTextColor={semantic["ink-muted"]}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
      {error ? (
        <FormError message={error} size="caption" className="mt-1" />
      ) : helper ? (
        <Text variant="caption" className="mt-1">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
