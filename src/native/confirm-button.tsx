import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { announce } from "./a11y";
import { cn } from "./cn";
import { Text } from "./text";

/** Long enough for a switch or screen-reader user to find the control a second time. */
const ARMED_MS = 8000;

/** Two-tap destructive action: first tap arms it, second tap within 8s fires. Cross-platform (no Alert). */
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
    const t = setTimeout(() => setArmed(false), ARMED_MS);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={armed ? confirmLabel : label}
      accessibilityState={{ expanded: armed }}
      hitSlop={small ? 10 : 4}
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
        } else {
          setArmed(true);
          announce(confirmLabel);
        }
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
