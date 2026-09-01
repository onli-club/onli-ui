import { View } from "react-native";
import { cn } from "./cn";
import { Text } from "./text";

/** Small count badge (unread counts). Caps display at 99+. */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <View
      className={cn(
        "h-[18px] min-w-[18px] items-center justify-center rounded-full bg-like px-1",
        className,
      )}
    >
      <Text variant="label" tone="inverse" className="text-[10px] leading-[13px]">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}

const PILL_TONES = {
  neutral: { box: "bg-surface-sunken", text: "muted" },
  brand: { box: "bg-brand-subtle", text: "brand" },
  accent: { box: "bg-accent-subtle", text: "accent" },
  danger: { box: "bg-danger-subtle", text: "danger" },
  // Rarity ramp for earned badges — grey, green, blue, gold, the ladder games already
  // taught everyone. Matches BadgeMedal exactly: one rarity must never wear two colours.
  common: { box: "bg-rarity-common-bg", text: "rarity-common" },
  uncommon: { box: "bg-rarity-uncommon-bg", text: "rarity-uncommon" },
  rare: { box: "bg-rarity-rare-bg", text: "rarity-rare" },
  legendary: { box: "bg-rarity-legendary-bg", text: "rarity-legendary" },
} as const;

export type PillTone = keyof typeof PILL_TONES;

/**
 * Labelled pill for statuses (Pinned, Only you, processing…) and earned badges. `sm` is the
 * inline metadata size; `md` is for standalone chips (profile badges).
 */
export function Pill({
  label,
  tone = "neutral",
  size = "sm",
  className,
}: {
  label: string;
  tone?: PillTone;
  size?: "sm" | "md";
  className?: string;
}) {
  const { box, text } = PILL_TONES[tone];
  return (
    <View
      className={cn(
        "self-start rounded-full",
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1.5",
        box,
        className,
      )}
    >
      <Text
        variant="label"
        className={size === "sm" ? "text-[11px] leading-[15px]" : "text-xs"}
        tone={text}
      >
        {label}
      </Text>
    </View>
  );
}
