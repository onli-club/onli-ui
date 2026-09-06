import { cn } from "./cn";
import { Text } from "./text";

/**
 * 12px sentence-case section label (sidebar groups, rail headings, in-page sections), exposed
 * as a level-2 heading so screen-reader users can jump between sections.
 * Carries no margins — spacing belongs to the layout around it.
 */
export function SectionLabel({ children, className }: { children: string; className?: string }) {
  return (
    <Text
      variant="label"
      tone="muted"
      accessibilityRole="header"
      {...({ "aria-level": 2 } as object)}
      className={cn("text-xs", className)}
    >
      {children}
    </Text>
  );
}
