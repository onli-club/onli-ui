import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform } from "react-native";

/**
 * Speak a message to the screen reader. `aria-live` regions cover web and Android, but iOS
 * VoiceOver only reacts to an explicit announcement, so live-region components call this too.
 */
export function announce(message: string) {
  if (Platform.OS === "ios" && message) AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Whether the person asked the OS (or, on web, the browser) to reduce motion. Starts `false`
 * and settles once the async query answers, then follows changes.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let live = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => live && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  return reduced;
}
