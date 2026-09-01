import { cn } from "./cn";
import { Text } from "./text";

// The wordmark is a logo: px metrics are its identity and live here, nowhere else.
const SIZES = {
  sm: "text-[22px] leading-[28px] tracking-[-0.5px]",
  md: "text-[24px] leading-[30px] tracking-[-0.6px]",
  xl: "text-[44px] leading-[52px] tracking-[-1px]",
} as const;

export function Wordmark({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Text className={cn("font-display text-brand-strong", SIZES[size], className)}>
      Onli
      <Text className={cn("font-display text-accent", SIZES[size])}>.</Text>
    </Text>
  );
}
