import { cn } from "./cn";
import { Text } from "./text";

/**
 * Uppercase 12px section label (sidebar groups, rail headings, in-page sections).
 * Carries no margins — spacing belongs to the layout around it.
 */
export function SectionLabel({ children, className }: { children: string; className?: string }) {
  return (
    <Text variant="label" tone="muted" className={cn("text-xs uppercase tracking-wide", className)}>
      {children}
    </Text>
  );
}
