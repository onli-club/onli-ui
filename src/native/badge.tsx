import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { cn } from "./cn";
import { Icon } from "./icon";
import { Text } from "./text";

/**
 * Small count badge (unread counts). Caps display at 99+. Hidden from assistive tech: the
 * control it decorates carries the count in its own label ("Notifications, 3 unread").
 */
export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <View
      aria-hidden
      className={cn(
        "min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1",
        className,
      )}
    >
      <Text variant="label" tone="inverse" className="text-[11px] leading-[14px]">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
}

const PILL_TONES = {
  neutral: { box: "bg-surface-sunken", text: "muted", glyph: "ink-muted" },
  brand: { box: "bg-brand-subtle", text: "brand", glyph: "brand" },
  accent: { box: "bg-accent-subtle", text: "accent", glyph: "accent-strong" },
  // Rarity ramp for earned badges — grey, green, blue, gold, the ladder games already
  // taught everyone. Matches BadgeMedal exactly: one rarity must never wear two colours.
  common: { box: "bg-rarity-common-bg", text: "rarity-common", glyph: "rarity-common-ink" },
  uncommon: { box: "bg-rarity-uncommon-bg", text: "rarity-uncommon", glyph: "rarity-uncommon-ink" },
  rare: { box: "bg-rarity-rare-bg", text: "rarity-rare", glyph: "rarity-rare-ink" },
  legendary: {
    box: "bg-rarity-legendary-bg",
    text: "rarity-legendary",
    glyph: "rarity-legendary-ink",
  },
} as const;

type PillTone = keyof typeof PILL_TONES;

/**
 * Labelled pill for statuses (Pinned, Only you, processing…) and earned badges. `sm` is the
 * inline metadata size; `md` is for standalone chips (profile badges).
 */
export function Pill({
  label,
  tone = "neutral",
  size = "sm",
  icon,
  className,
}: {
  label: string;
  tone?: PillTone;
  size?: "sm" | "md";
  /** A glyph before the label, in the label's colour. */
  icon?: LucideIcon;
  className?: string;
}) {
  const { box, text, glyph } = PILL_TONES[tone];
  return (
    <View
      className={cn(
        "self-start rounded-full",
        size === "sm" ? "px-2 py-0.5" : "px-3 py-1.5",
        icon && "flex-row items-center gap-1",
        box,
        className,
      )}
    >
      {icon ? <Icon icon={icon} size={size === "sm" ? 12 : 14} tone={glyph} /> : null}
      <Text variant="label" className="text-xs" tone={text}>
        {label}
      </Text>
    </View>
  );
}
