import type { ViewStyle } from "react-native";

// RN's own `animationTimingFunction` (a string) collides with reanimated's inside a
// keyframe block, so the block's style type drops it.
export type KeyframeStyle = Omit<ViewStyle, "animationTimingFunction">;
