import { useEffect } from "react";
import { View } from "react-native";
import { announce } from "./a11y";
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
  className,
}: {
  message: string | null | undefined;
  /** `status` for confirmations ("Copied", "Saved"); `danger` for errors. */
  tone?: "danger" | "status";
  size?: "sm" | "caption";
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
      className={className}
    >
      <Text
        variant={size === "sm" ? "body-sm" : "caption"}
        tone={tone === "danger" ? "danger" : "secondary"}
      >
        {message}
      </Text>
    </View>
  );
}
