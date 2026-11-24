/**
 * Every date the business reasons about is an IST day — streak days, financial years, invoice
 * dates. Both the zone and the locale are pinned: without them a staff member's browser decides,
 * so anything logged between 18:30 and midnight IST reads as the previous day on a UTC machine,
 * and "8/31/2026" vs "31/8/2026" depends on the operator's language settings.
 */
const DATE = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const istDate = (iso: string) => DATE.format(new Date(iso));
export const istDateTime = (iso: string) => `${DATE_TIME.format(new Date(iso))} IST`;

const CLASS_TIME = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/**
 * "Thu 13 Aug, 7:00 pm": a class in a schedule, where the year is noise. Built from parts
 * because engines join them differently ("Thu, 13 Aug at 7:00 PM" in Safari and Bun).
 */
export const istClassTime = (iso: string) => {
  const p = Object.fromEntries(
    CLASS_TIME.formatToParts(new Date(iso)).map((part) => [part.type, part.value]),
  );
  return `${p.weekday} ${p.day} ${p.month}, ${p.hour}:${p.minute} ${p.dayPeriod?.toLowerCase()}`;
};

export const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The first few of a long list, then a count: enough to act on without burying the rest. */
export const listFirst = (items: string[], shown = 20) =>
  `${items.slice(0, shown).join(", ")}${items.length > shown ? ` and ${items.length - shown} more` : ""}`;

/** A number box that may be left empty (a seat limit, days until expiry): empty is `null`. */
export const numberOrNull = (raw: string) => (raw.trim() ? Number(raw) : null);

/** IST has no daylight saving, so a fixed offset converts both ways on any machine. */
const IST_OFFSET_MS = 330 * 60_000;

/** The `datetime-local` value (`YYYY-MM-DDTHH:mm`) for an instant, read on an IST wall clock. */
export const istInputValue = (iso: string | null) =>
  iso ? new Date(Date.parse(iso) + IST_OFFSET_MS).toISOString().slice(0, 16) : "";

/** The instant a `datetime-local` value names when it is read as IST. */
export const fromIstInput = (value: string) => new Date(`${value}:00+05:30`).toISOString();
