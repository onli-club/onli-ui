/**
 * The fields of `next` that differ from `was`: an edit form's PATCH body, and its dirty flag.
 * Compared as JSON, so an object field (a reward's payload) counts as changed only when its
 * contents do.
 */
export function changedFields<T extends Record<string, unknown>>(next: T, was: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(next).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(was[k])),
  ) as Partial<T>;
}
