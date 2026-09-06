import { type WordmarkSize, wordmarkSizes } from "../wordmark";
import { cn } from "./cn";
import { Text } from "./text";

/** The logo. Its metrics come from `src/wordmark.ts`, shared with the web stylesheet. */
export function Wordmark({ size = "md", className }: { size?: WordmarkSize; className?: string }) {
  const metrics = wordmarkSizes[size];
  return (
    <Text
      accessibilityRole="image"
      accessibilityLabel="Onli"
      maxFontSizeMultiplier={1}
      className={cn("font-display text-brand-strong", className)}
      style={metrics}
    >
      Onli
      <Text className="font-display text-accent" style={metrics} maxFontSizeMultiplier={1}>
        .
      </Text>
    </Text>
  );
}
