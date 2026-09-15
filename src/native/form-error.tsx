import { CircleAlert, Info } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import { announce } from "./a11y";
import { cn } from "./cn";
import { Icon } from "./icon";
import { Text } from "./text";

/**
 * A form's error or status line, announced to assistive tech when it appears: `aria-live`
 * on web and Android, an explicit announcement on iOS. Renders nothing while `message` is
 * empty, so the live region exists only when there is something to say.
 */
export function FormError({
  message,
  tone = "danger",
  size = "sm",
  card,
  className,
}: {
  message: string | null | undefined;
  /** `status` for confirmations ("Copied", "Saved"); `danger` for errors. */
  tone?: "danger" | "status";
  size?: "sm" | "caption";
  /** A notice card beside the content it concerns, rather than a line under a field. */
  card?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (message) announce(message);
  }, [message]);
  if (!message) return null;
  return (
    <View
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn(
        card && "flex-row items-start gap-3 rounded-xl px-4 py-3",
        card && (tone === "danger" ? "bg-danger-subtle" : "bg-surface-sunken"),
        className,
      )}
    >
      {card ? (
        // On the first line's x-height rather than its box top.
        <View style={{ marginTop: 1 }}>
          <Icon
            icon={tone === "danger" ? CircleAlert : Info}
            size={18}
            tone={tone === "danger" ? "danger" : "ink-secondary"}
            strokeWidth={2}
          />
        </View>
      ) : null}
      <Text
        variant={size === "sm" ? "body-sm" : "caption"}
        tone={tone === "danger" ? "danger" : "secondary"}
        className={card ? "flex-1" : undefined}
      >
        {message}
      </Text>
    </View>
  );
}
