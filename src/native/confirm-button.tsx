import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { announce } from "./a11y";
import { cn } from "./cn";
import { DANGER_FILL } from "./recipes";
import { Text } from "./text";

/** Long enough for a switch or screen-reader user to find the control a second time. */
const ARMED_MS = 8000;

/** Two-tap destructive action: first tap arms it, second tap within 8s fires. Cross-platform (no Alert). */
export function ConfirmButton({
  label,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
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
      // the pill is small, so the slop is what brings the target up to 44px
      hitSlop={10}
      className={cn(
        "self-start rounded-full px-3 py-1 transition-colors",
        armed ? "bg-danger hover:bg-danger-strong active:bg-danger-strong" : DANGER_FILL,
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
      <Text variant="label" className="text-xs" tone={armed ? "inverse" : "danger"}>
        {armed ? confirmLabel : label}
      </Text>
    </Pressable>
  );
}
