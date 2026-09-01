/** Joins class fragments, dropping falsy values. Later fragments should not repeat earlier properties. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
