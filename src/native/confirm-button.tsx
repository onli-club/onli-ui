import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { cn } from "./cn";
import { Text } from "./text";

/** Two-tap destructive action: first tap arms it, second tap within 3s fires. Cross-platform (no Alert). */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
  small = true,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  small?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "self-start rounded-full transition-colors",
        small ? "px-3 py-1" : "px-4 py-2",
        armed
          ? "bg-danger hover:bg-danger-strong active:bg-danger-strong"
          : "bg-danger-subtle hover:bg-danger/20 active:bg-danger/30",
      )}
      onPress={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      <Text
        variant="label"
        className={small ? "text-xs" : "text-sm"}
        tone={armed ? "inverse" : "danger"}
      >
        {armed ? confirmLabel : label}
      </Text>
    </Pressable>
  );
}
