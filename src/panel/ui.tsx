import { Link, type LinkProps } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ImageOff,
  type LucideIcon,
  MoreHorizontal,
  UserRound,
  X,
} from "lucide-react";
import {
  Children,
  type CSSProperties,
  createContext,
  Fragment,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useConfirm } from "./feedback";

/**
 * Web counterparts of the `@onli/ui` React Native components. Same names, variants and tones
 * as the design system so the two repos read alike; the API takes `children` where the native
 * components take a `title` prop, because that is what JSX on the web expects.
 *
 * Everything here is semantic tokens only — no hex, no stock Tailwind palette, and no
 * font-weight utilities (weight comes from the family: font-display / font-body-bold /
 * font-body-md / font-body).
 */

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * The shell's header bar, rendered once by `PanelShell` rather than per screen. Fixed h-16 with a
 * bottom hairline, matching the sidebar's wordmark block, so the two borders read as one line
 * across the top of the page. Sticky, because the sidebar is — a header that scrolled away
 * would break that line as soon as a long table moved.
 */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 shrink-0 border-b border-line bg-paper">
      <div className="flex h-16 items-center gap-4 px-5 lg:px-8">
        <div className="min-w-0 flex-1">
          <h1
            tabIndex={-1}
            className="truncate font-display text-xl tracking-[-0.4px] text-ink focus:outline-none"
          >
            {title}
          </h1>
          {/* A div, not a p: a detail page's subtitle is a Breadcrumb, which is a <nav>. */}
          {subtitle && (
            <div className="truncate font-body text-sm text-ink-secondary">{subtitle}</div>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/**
 * The shell's header action area for the section route on screen. A section route never renders
 * its own header, so `PageActions` is how it puts a button there: anywhere in its tree, the
 * children are portalled into the header.
 */
export const HeaderSlot = createContext<HTMLDivElement | null>(null);

export function PageActions({ children }: { children: ReactNode }) {
  const el = useContext(HeaderSlot);
  return el ? createPortal(children, el) : null;
}

type Crumb = { label: string } & Pick<LinkProps, "to" | "params">;

/** A detail page's way back up: the records above it, as links. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
      {items.map((c, i) => (
        <Fragment key={c.label}>
          {i > 0 && (
            <span aria-hidden className="text-ink-faint">
              /
            </span>
          )}
          <Link
            to={c.to}
            params={c.params}
            className="truncate text-ink-muted transition-colors hover:text-brand"
          >
            {c.label}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}

/**
 * `padded` (default) wraps the body in `p-5`; `padded={false}` is for a card whose body is a
 * list or a stack of full-width blocks that draw their own `px-5` and hairlines.
 */
export function Card({
  title,
  subtitle,
  children,
  actions,
  padded = true,
}: {
  title?: string;
  /** One caption line under the title: a count, a date range, what the card holds. */
  subtitle?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="font-body-bold text-base text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 font-body text-xs text-ink-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? "p-5" : undefined}>{children}</div>
    </div>
  );
}

/**
 * Reorder pair — two 28px targets named after what they move ("Move Day 1 up"). `row` for a
 * header, `column` beside a two-line list row, where the stack matches the row's height.
 */
export function Reorder({
  index,
  count,
  pending,
  onMove,
  subject,
  direction = "column",
}: {
  index: number;
  count: number;
  pending: boolean;
  onMove: (delta: number) => void;
  subject: string;
  direction?: "row" | "column";
}) {
  // One bordered stepper, not two floating chevrons: the pair reads as a control.
  const cls = cn(
    "flex size-7 items-center justify-center bg-surface text-ink-secondary transition-colors hover:bg-surface-solid-hover hover:text-ink active:bg-surface-solid-press disabled:text-ink-faint disabled:hover:bg-surface",
    FOCUS,
  );
  return (
    <div
      className={cn(
        "flex w-fit shrink-0 overflow-hidden rounded-md border border-line-strong",
        direction === "row"
          ? "flex-row divide-x divide-line-strong"
          : "flex-col divide-y divide-line-strong",
      )}
    >
      <button
        type="button"
        aria-label={`Move ${subject} up`}
        className={cls}
        disabled={index <= 0 || pending}
        onClick={() => onMove(-1)}
      >
        <ChevronUp size={14} strokeWidth={2.5} aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`Move ${subject} down`}
        className={cls}
        disabled={index < 0 || index >= count - 1 || pending}
        onClick={() => onMove(1)}
      >
        <ChevronDown size={14} strokeWidth={2.5} aria-hidden />
      </button>
    </div>
  );
}

/** The ids in their new order once one moves `delta` places: the whole list a reorder route takes. */
export function swapped(ids: readonly string[], index: number, delta: number): string[] {
  const next = [...ids];
  const to = index + delta;
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

/** Sentence case, never uppercase (house rule); a level-3 heading so sections are navigable. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <h3 className="font-body-md text-xs text-ink-muted">{children}</h3>;
}

/** One headed block of a drawer's body. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>{title}</SectionLabel>
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- table */

/**
 * `-mx-5` cancels the enclosing Card's horizontal padding, and the edge cells carry it back
 * (`first:pl-5` / `last:pr-5`). Without that the first column sits 12px inside the card title
 * above it, and row separators stop short of the card edge. Assumes a padded Card, which is
 * where every table in this panel lives.
 */
export function Table({
  head,
  children,
  label,
  empty = "Nothing here yet.",
  loading = false,
  error = null,
  onRetry,
}: {
  head: ReactNode;
  children: ReactNode;
  /** The table's accessible name — usually the Card title it sits under. */
  label: string;
  /**
   * Shown as one full-width row when there are no rows, so a header never stands alone — and
   * only once the query has actually answered, so loading and failure never read as "empty".
   */
  empty?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const rows = Children.toArray(children).filter(Boolean);
  let body: ReactNode = rows;
  if (loading) {
    body = Array.from({ length: 5 }, (_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: placeholders with no identity
      <tr key={i} aria-hidden className="border-b border-line last:border-b-0">
        <td colSpan={99} className="px-5 py-3.5">
          <div className="h-4 animate-pulse rounded bg-surface-sunken motion-reduce:animate-none" />
        </td>
      </tr>
    ));
  } else if (error) {
    body = (
      <tr>
        <td colSpan={99} className="px-5 py-8 text-center">
          <p role="alert" className="font-body text-sm text-danger">
            {error}
          </p>
          {onRetry && (
            <LinkButton tone="brand" className="mt-1" onClick={onRetry}>
              Retry
            </LinkButton>
          )}
        </td>
      </tr>
    );
  } else if (rows.length === 0) {
    body = (
      <tr>
        <td colSpan={99} className="px-5 py-8 text-center font-body text-sm text-ink-muted">
          {empty}
        </td>
      </tr>
    );
  }
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full" aria-label={label} aria-busy={loading || undefined}>
        <thead>
          <tr className="border-b border-line">{head}</tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}

export function Th({ children }: { children?: ReactNode }) {
  return (
    <th
      scope="col"
      className="px-3 py-2 text-left font-body-md text-xs text-ink-muted first:pl-5 last:pr-5"
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("px-3 py-2.5 font-body text-sm text-ink first:pl-5 last:pr-5", className)}>
      {children}
    </td>
  );
}

/**
 * Row hover is the DS's translucent black wash, which reads the same on any background.
 * `onClick` makes the whole row a pointer target; its first cell must still hold a real link or
 * button, because a clickable `<tr>` is not reachable by keyboard.
 */
export function Row({
  children,
  className,
  hover = true,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={
        onClick &&
        ((e) => {
          const target = e.target as Element;
          // Overlays opened from the row bubble here through React although they sit on `body`,
          // and a control inside the row does its own thing.
          if (
            !e.currentTarget.contains(target) ||
            target.closest("a, button, input, select, textarea, label")
          )
            return;
          onClick();
        })
      }
      className={cn(
        "border-b border-line last:border-b-0",
        hover && "transition-colors hover:bg-surface-hover",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </tr>
  );
}

interface RowIdentityProps {
  lead: ReactNode;
  title: string;
  detail: string | null;
}

const rowIdentityCls = "flex max-w-80 items-center gap-3 text-left";

function RowIdentityParts({ lead, title, detail }: RowIdentityProps) {
  return (
    <>
      {lead}
      <span className="min-w-0">
        <span className="block truncate font-body-md text-ink">{title}</span>
        {detail && (
          <span className="block truncate font-body text-xs text-ink-muted">{detail}</span>
        )}
      </span>
    </>
  );
}

/** The first cell of a `Row` that opens nothing: a picture, the name, one line. */
export function RowIdentity(props: RowIdentityProps) {
  return (
    <div className={rowIdentityCls}>
      <RowIdentityParts {...props} />
    </div>
  );
}

/** `RowIdentity` as the real button in the first cell of a `Row` that opens its record. */
export function RowOpener({ onClick, ...identity }: RowIdentityProps & { onClick: () => void }) {
  return (
    <button type="button" className={rowIdentityCls} onClick={onClick}>
      <RowIdentityParts {...identity} />
    </button>
  );
}

/**
 * Prev/next over the server's `limit`/`offset` list routes. `under="table"` (default) sits
 * beneath a `Table` inside its padded Card, so it cancels the padding the same way and draws
 * the hairline the last row omits; `under="cards"` closes a column of Cards. Hidden while
 * everything fits on one page — two disabled buttons under a three-row list would be furniture.
 */
export function Pager({
  offset,
  limit,
  total,
  onChange,
  under = "table",
}: {
  offset: number;
  limit: number;
  total: number;
  onChange: (offset: number) => void;
  under?: "table" | "cards";
}) {
  if (total <= limit && offset === 0) return null;
  const to = Math.min(offset + limit, total);
  const from = Math.min(offset + 1, to);
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2",
        under === "table" ? "-mx-5 border-t border-line px-5 pt-3" : "px-1",
      )}
    >
      <span className="font-body text-xs text-ink-muted">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="xs"
          variant="ghost"
          disabled={offset === 0}
          onClick={() => onChange(Math.max(0, offset - limit))}
        >
          <ChevronLeft size={14} aria-hidden />
          Previous
        </Button>
        <Button size="xs" variant="ghost" disabled={to >= total} onClick={() => onChange(to)}>
          Next
          <ChevronRight size={14} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- segmented */

/** A `tablist`'s arrow keys: they select and focus the neighbour, wrapping at the ends. */
function tablistKeys<T extends string>(
  options: ReadonlyArray<{ value: T }>,
  value: T,
  onChange: (value: T) => void,
) {
  return (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const at = options.findIndex((o) => o.value === value);
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = options[(at + delta + options.length) % options.length];
    if (next) {
      onChange(next.value);
      (e.currentTarget.children[options.indexOf(next)] as HTMLElement | undefined)?.focus();
    }
  };
}

/**
 * Pill switcher on a sunken track, the web twin of the app's `Segmented`: a `tablist` whose
 * tabs move with the arrow keys and hold one Tab stop between them.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={tablistKeys(options, value, onChange)}
      className="inline-flex gap-1 rounded-full bg-surface-sunken p-1"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full px-4 py-1.5 font-body-md text-sm transition-colors",
              active
                ? "bg-surface text-ink shadow-card"
                : "text-ink-muted hover:bg-surface-hover active:bg-surface-press",
              FOCUS,
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * `Segmented`'s behaviour with an underline, for the sections of a page. The route keeps the
 * value in its search params (`?tab=`), so a reload stays on the same tab.
 */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ value: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={tablistKeys(options, value, onChange)}
      className="flex gap-6 border-b border-line"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-1 pt-1 pb-2.5 font-body-md text-sm transition-colors",
              active ? "border-brand text-ink" : "border-transparent text-ink-muted hover:text-ink",
              FOCUS,
            )}
          >
            {o.label}
            {o.count !== undefined && <Pill>{o.count}</Pill>}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- pill */

const PILL_TONES = {
  neutral: "bg-surface-sunken text-ink-muted",
  brand: "bg-brand-subtle text-brand",
  accent: "bg-accent-subtle text-accent-strong",
  danger: "bg-danger-subtle text-danger",
  success: "bg-brand-subtle text-brand",
  // Rarity ramp — grey, green, blue, gold, the ladder games already taught everyone.
  // Must match BadgeMedal exactly: one rarity never wears two colours.
  common: "bg-rarity-common-bg text-rarity-common-ink",
  uncommon: "bg-rarity-uncommon-bg text-rarity-uncommon-ink",
  rare: "bg-rarity-rare-bg text-rarity-rare-ink",
  legendary: "bg-rarity-legendary-bg text-rarity-legendary-ink",
} as const;

export type PillTone = keyof typeof PILL_TONES;

export function Pill({ tone = "neutral", children }: { tone?: PillTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-2 py-0.5 font-body-md text-xs",
        PILL_TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export interface Fact {
  /** Omitted only where the value reads on its own (an amount in rupees). */
  icon?: LucideIcon;
  label: string;
}

/**
 * Facts about a record on one line, each behind its own glyph and set apart by space, never
 * joined by a separator character. Takes the size and colour of the text around it;
 * `children` lead the line (a pill).
 */
export function MetaLine({ facts, children }: { facts: readonly Fact[]; children?: ReactNode }) {
  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-0.5 align-middle">
      {children}
      {facts.map(({ icon: Glyph, label }) => (
        <span key={label} className="inline-flex min-w-0 items-center gap-1">
          {Glyph && <Glyph size={12} aria-hidden className="shrink-0" />}
          <span className="truncate">{label}</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Filter chips over a list: toggle buttons, one pressed, so a screen reader hears which filter
 * is on. Not a `Segmented`, which is a tablist and promises panels.
 */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <fieldset aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded-full border px-3 py-1 font-body-md text-xs transition-colors",
              on
                ? "border-brand bg-brand-subtle text-brand"
                : "border-line-strong text-ink-secondary hover:bg-surface-hover active:bg-surface-press",
              FOCUS,
            )}
          >
            {o.label}
          </button>
        );
      })}
    </fieldset>
  );
}

/* ---------------------------------------------------------------- button */

const BUTTON_VARIANTS = {
  primary: "bg-brand text-on-brand hover:bg-brand-strong active:bg-brand-deep",
  secondary:
    "border border-line-strong bg-surface text-ink hover:bg-surface-solid-hover active:bg-surface-solid-press",
  tonal: "bg-brand-subtle text-brand hover:bg-brand/20 active:bg-brand/30",
  ghost: "text-brand hover:bg-surface-hover active:bg-surface-press",
  danger: "bg-danger-subtle text-danger hover:bg-danger/20 active:bg-danger/30",
  /** Quiet destructive action in a row (delete, detach): red text, tint only on hover. */
  "ghost-danger": "text-danger hover:bg-danger-subtle active:bg-danger/20",
  /** Only the action button of a destructive confirmation. */
  "danger-solid": "bg-danger text-ink-inverse hover:bg-danger-strong active:bg-danger-strong",
} as const;

// `xs` has no counterpart in the app: admin tables put three actions in a 40px row, which the
// DS's smallest control (h-9) cannot sit in without pushing rows apart. It is only for controls
// inside a table row or a card header; page header actions are `sm`.
const BUTTON_SIZES = {
  xs: "h-7 gap-1 px-3 text-xs",
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-11 gap-2 px-5 text-sm",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSize = keyof typeof BUTTON_SIZES;

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "sm",
  disabled,
  type = "button",
  form,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit";
  /** The id of the form a submit button outside it belongs to (a drawer's footer). */
  form?: string;
  className?: string;
  /** For a button whose visible content is an icon. */
  "aria-label"?: string;
}) {
  return (
    <button
      type={type}
      form={form}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full font-body-md transition-colors disabled:pointer-events-none disabled:opacity-40",
        BUTTON_SIZES[size],
        BUTTON_VARIANTS[variant],
        FOCUS,
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Text-only action for dense rows, where even an `xs` pill would be too much furniture. */
export function LinkButton({
  children,
  onClick,
  tone = "default",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "default" | "brand" | "danger";
  className?: string;
}) {
  const tones = {
    default: "text-ink-muted hover:text-ink",
    brand: "text-brand hover:text-brand-strong",
    danger: "text-danger hover:text-danger-strong",
  } as const;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Padded (and pulled back by the same amount) so the target is 24px without moving the text.
        "rounded-sm px-1 py-1 font-body-md text-xs transition-colors",
        tones[tone],
        FOCUS,
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- form */

/**
 * Functions, not strings, because Tailwind resolves conflicting utilities by **stylesheet
 * order, not className order** — so appending `py-1` or `border-danger` to a base input string
 * silently loses to the base and the intended state never renders. Anything that varies a
 * group the base already sets (padding, border colour, font) is therefore an argument here;
 * `className` is for layout only (widths, flex), which conflicts with nothing.
 */
export function inputCls({
  size = "md",
  invalid = false,
  mono = false,
  className,
}: {
  /** `sm` is the dense nested form (course outline), pairing with Button size="xs". */
  size?: "sm" | "md";
  invalid?: boolean;
  mono?: boolean;
  className?: string;
} = {}) {
  return cn(
    "rounded-lg border bg-surface text-sm text-ink placeholder:text-ink-muted focus:outline-none disabled:opacity-40",
    size === "sm" ? "px-3 py-1" : "px-3 py-2",
    invalid ? "border-danger focus:border-danger" : "border-line-input focus:border-focus",
    mono ? "font-mono" : "font-body",
    className,
  );
}

export function Field({
  label,
  hint,
  children,
  className,
  plain = false,
}: {
  label: ReactNode;
  /** One line under the control saying what the value does. Not placeholder text. */
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
  /** For a child that is not a form control (a picker button, a preview): no `<label>` wrap. */
  plain?: boolean;
}) {
  const cls = cn("flex flex-col gap-1 font-body-md text-xs text-ink-muted", className);
  const hintEl = hint && <span className="font-body text-xs text-ink-muted">{hint}</span>;
  if (plain) {
    return (
      <div className={cls}>
        <span>{label}</span>
        {children}
        {hintEl}
      </div>
    );
  }
  return (
    // The control is the child passed in, so wrapping it in the label does associate them —
    // the rule just cannot see through `children` to prove it.
    // biome-ignore lint/a11y/noLabelWithoutControl: implicit association via children
    <label className={cls}>
      {label}
      {children}
      {hintEl}
    </label>
  );
}

/** A control with its unit after it ("hours", "XP"), so the number is never read bare. */
export function WithUnit({ unit, children }: { unit?: string; children: ReactNode }) {
  if (!unit) return children;
  return (
    <span className="flex items-center gap-2">
      {children}
      <span className="shrink-0 font-body text-sm text-ink-muted">{unit}</span>
    </span>
  );
}

/** Sized to match `inputCls()`, so a select and a text box line up in a form. */
export function Select({
  value,
  onChange,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "rounded-lg border border-line-input bg-surface px-3 py-2 font-body text-sm text-ink focus:border-focus focus:outline-none",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: ReactNode;
  /** One line under the box saying what ticking it does, as a `Field` hint. */
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const hintId = useId();
  const box = (
    <label
      className={cn(
        "flex items-center gap-2 whitespace-nowrap font-body text-sm text-ink-secondary",
        disabled ? "cursor-default" : "cursor-pointer",
        !hint && className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={hint ? hintId : undefined}
        className={cn("size-4 shrink-0 accent-brand", FOCUS)}
      />
      {label}
    </label>
  );
  if (!hint) return box;
  return (
    <div className={className}>
      {box}
      {/* Indented past the box and its gap, so it lines up under the label. */}
      <span id={hintId} className="mt-1 block pl-6 font-body text-xs text-ink-muted">
        {hint}
      </span>
    </div>
  );
}

/** An on/off setting that applies at once, where a checkbox would read as part of a form. */
export function Switch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  /** Required when the switch is not inside a `Field`: what it turns on and off. */
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-40",
        checked ? "bg-brand" : "bg-surface-sunken",
        FOCUS,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-4 rounded-full bg-surface shadow-card transition-transform duration-150 ease-out-strong",
          checked ? "translate-x-4.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** A search param that names something (`?user=`, `?class=`): a non-empty string, or absent. */
export const textParam = (v: unknown) => (typeof v === "string" && v ? v : undefined);

/**
 * Archived rows stay out of a list until asked for. `showArchived` lives in the route's search,
 * so Back from an archived record lands on the list as it was left.
 */
export const archivedSearch = (raw: Record<string, unknown>): { showArchived?: true } => ({
  showArchived: raw.showArchived === true ? true : undefined,
});

export function withoutArchived<T extends { status: string }>(all: T[], shown: boolean) {
  return {
    rows: shown ? all : all.filter((r) => r.status !== "archived"),
    archived: all.filter((r) => r.status === "archived").length,
  };
}

/** The list header's way to archived rows; absent while there are none. */
export function ArchivedToggle({
  count,
  shown,
  onChange,
}: {
  count: number;
  shown: boolean;
  onChange: (shown: boolean) => void;
}) {
  if (!count) return null;
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the Switch inside is the labelled button
    <label className="flex items-center gap-2 font-body-md text-xs text-ink-secondary">
      <Switch checked={shown} onChange={onChange} />
      Show archived ({count})
    </label>
  );
}

/* ---------------------------------------------------------------- feedback */

const NOTE_TONES = {
  success: "bg-brand-subtle text-brand",
  danger: "bg-danger-subtle text-danger",
  neutral: "bg-surface-sunken text-ink-secondary",
} as const;

/**
 * Feedback line. A danger note is an alert and a success note a status, so a message that
 * appears after a save is announced without the reader having to hunt for it.
 */
export function Note({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof NOTE_TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "danger" ? "alert" : tone === "success" ? "status" : undefined}
      className={cn("rounded-lg px-4 py-2 font-body text-sm", NOTE_TONES[tone], className)}
    >
      {children}
    </p>
  );
}

/**
 * One number and its label. Used in a grid on the dashboard and on a product page; every value
 * behind one is derived at read time, so a Stat is never a stored counter.
 */
export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <p className="font-display text-2xl tracking-[-0.4px] text-ink">{value}</p>
      <p className="mt-0.5 font-body text-sm text-ink-muted">{label}</p>
      {hint && <p className="mt-0.5 font-body text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

/** A 16:9 picture at list size (64×36). No `src` draws the empty frame, so rows stay aligned. */
export function Thumbnail({ src }: { src: string | null }) {
  const frame = "h-9 w-16 shrink-0 rounded-md bg-surface-sunken";
  if (!src)
    return (
      <span className={cn(frame, "flex items-center justify-center text-ink-faint")}>
        <ImageOff size={14} aria-hidden />
      </span>
    );
  return <img src={src} alt="" width={64} height={36} className={cn(frame, "object-cover")} />;
}

/** A member's photo at list size (32px). No `src` draws the app's "no photo" circle. */
export function Avatar({ src }: { src: string | null }) {
  const frame = "size-8 shrink-0 rounded-full bg-surface-sunken";
  if (!src)
    return (
      <span className={cn(frame, "flex items-center justify-center text-ink-faint")}>
        <UserRound size={16} aria-hidden />
      </span>
    );
  return <img src={src} alt="" width={32} height={32} className={cn(frame, "object-cover")} />;
}

/**
 * SVG markup (an icon set's glyph, a medal, an emblem) as a data-URI `<img>`: an image is a
 * passive context, so nothing in the markup can execute even if a vendored file were tampered with.
 */
export function SvgImage({ svg, size, alt = "" }: { svg: string; size: number; alt?: string }) {
  return (
    <img
      src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
      alt={alt}
      width={size}
      height={size}
      className="inline-block shrink-0"
    />
  );
}

/** A record's read-only facts in a drawer: term on the left, value on the right. */
export function Facts({ items }: { items: [term: string, value: ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 font-body text-sm">
      {items.map(([term, value]) => (
        <Fragment key={term}>
          <dt className="text-ink-muted">{term}</dt>
          <dd className="min-w-0 text-ink">{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

/** A drawer's list of related records, one `Item` a line; `empty` says so when there are none. */
export function ItemList({ empty, children }: { empty: string; children: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  if (!rows.length) return <p className="font-body text-sm text-ink-muted">{empty}</p>;
  return <ul className="flex flex-col divide-y divide-line">{rows}</ul>;
}

export function Item({
  lead,
  title,
  meta,
  trail,
}: {
  /** A medal, a thumbnail: something drawn before the words. */
  lead?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  /** A status, a date: what sits at the line's end. */
  trail?: ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      {lead}
      <div className="min-w-0 flex-1">
        <div className="truncate font-body-md text-sm text-ink">{title}</div>
        {meta && <div className="truncate font-body text-xs text-ink-muted">{meta}</div>}
      </div>
      {trail && <div className="flex shrink-0 items-center gap-2">{trail}</div>}
    </li>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  /** The way out of the empty state, usually the button that creates the first one. */
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-20 text-center">
      <p className="font-body-bold text-lg tracking-[-0.2px] text-ink">{title}</p>
      {message && (
        <p className="mt-2 max-w-80 font-body text-sm leading-[22px] text-ink-secondary">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** A detail route with no record to show: a spinner while it loads, then "not found". */
export function DetailFallback({ loading, title }: { loading: boolean; title: string }) {
  if (loading)
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  return (
    <div className="flex-1 px-5 py-6 lg:px-8">
      <EmptyState title={title} message="It may have been deleted." />
    </div>
  );
}

const PICK_LIST_HEIGHTS = { sm: "max-h-56", md: "max-h-72", lg: "max-h-96" } as const;

/**
 * The results under a search box in a dialog: a bordered, scrolling list of `<li>` rows that
 * says so while it loads, when the search failed, when nothing matches, or (`prompt`) before
 * there is anything to search for.
 */
export function PickList({
  prompt,
  loading,
  error,
  empty,
  height,
  children,
}: {
  prompt?: string | null;
  loading: boolean;
  error?: string | null;
  empty: string;
  height: keyof typeof PICK_LIST_HEIGHTS;
  children: ReactNode;
}) {
  const rows = Children.toArray(children).filter(Boolean);
  const line = (text: string, danger = false) => (
    <p
      role={danger ? "alert" : undefined}
      className={cn("px-3 py-4 font-body text-sm", danger ? "text-danger" : "text-ink-muted")}
    >
      {text}
    </p>
  );
  return (
    <div className={cn("overflow-y-auto rounded-lg border border-line", PICK_LIST_HEIGHTS[height])}>
      {prompt ? (
        line(prompt)
      ) : loading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : error ? (
        line(error, true)
      ) : rows.length === 0 ? (
        line(empty)
      ) : (
        <ul className="divide-y divide-line">{rows}</ul>
      )}
    </div>
  );
}

/**
 * The foot of an edit form: the error, then Discard and Save, shown only while there is
 * something to save or say. Save is the form's submit button.
 */
export function FormFooter({
  dirty,
  pending,
  error,
  onDiscard,
  submitLabel = "Save",
  form,
}: {
  dirty: boolean;
  pending: boolean;
  error: string | null;
  onDiscard: () => void;
  submitLabel?: string;
  /** The form's id, when the footer sits outside it (`Drawer`'s `footer`). */
  form?: string;
}) {
  return (
    <>
      {error && <Note tone="danger">{error}</Note>}
      {(dirty || pending || error) && (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" disabled={pending} onClick={onDiscard}>
            Discard
          </Button>
          <Button type="submit" form={form} disabled={pending}>
            {pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      )}
    </>
  );
}

/**
 * The closing row of a dialog: an optional line on the left ("3 selected"), Cancel, then the
 * dialog's own action buttons as `children`. Without `onCancel` there is only the action.
 */
export function DialogFooter({
  onCancel,
  cancelDisabled,
  lead,
  children,
}: {
  onCancel?: () => void;
  cancelDisabled?: boolean;
  lead?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 flex items-center justify-end gap-2">
      {lead !== undefined && (
        <span className="mr-auto font-body text-xs text-ink-muted">{lead}</span>
      )}
      {onCancel && (
        <Button variant="ghost" disabled={cancelDisabled} onClick={onCancel}>
          Cancel
        </Button>
      )}
      {children}
    </div>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block size-5 animate-spin rounded-full border-2 border-line-strong border-t-brand motion-reduce:[animation-duration:2s]"
    />
  );
}

const PROGRESS_TONES = {
  brand: "bg-brand",
  accent: "bg-accent",
  success: "bg-success",
  danger: "bg-danger",
} as const;

/**
 * A determinate bar, 0–1. The fill is a `scaleX` rather than a width so it stays on the GPU
 * while a 4 GB upload fires progress events, and the transition is `linear` because constant
 * motion should not ease — it only smooths XHR's chunky, uneven `onprogress` steps.
 * `value === null` is the indeterminate case: a slice that sweeps until a real number arrives.
 */
export function ProgressBar({
  value,
  tone = "brand",
  label,
}: {
  value: number | null;
  tone?: keyof typeof PROGRESS_TONES;
  label?: string;
}) {
  const pct = value === null ? null : Math.min(1, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct === null ? undefined : Math.round(pct * 100)}
      className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken"
    >
      <div
        className={cn(
          "h-full w-full rounded-full",
          PROGRESS_TONES[tone],
          pct === null
            ? "animate-progress-sweep origin-left"
            : "origin-left transition-transform duration-150 ease-linear",
        )}
        style={pct === null ? undefined : { transform: `scaleX(${pct})` }}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- modal */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The focus contract every overlay shares (Modal, the icon-picker popover): focus moves in on
 * open and back to the opener on close, Escape closes, Tab wraps inside. Attach the returned
 * ref to the dialog element and give it `tabIndex={-1}` so a click on plain text inside still
 * keeps the keyboard within it. Mount the element only while open — the effect keys on mount.
 */
export function useDialogFocus(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = () => Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
    (focusables()[0] ?? el).focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, []);
  return ref;
}

export function Modal({
  title,
  description,
  children,
  onClose,
  width = "default",
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  /** `wide` is for a dialog holding a list — a file queue needs more than a form's width. */
  width?: "default" | "wide";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const ref = useDialogFocus(onClose);
  // On `body`, not where it was opened: a dialog opened from a table row would otherwise keep
  // that row's `:hover` wash on while the pointer is inside it.
  return createPortal(
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "animate-modal-in relative w-full rounded-xl border border-line bg-surface p-6 shadow-pop focus:outline-none",
          width === "wide" ? "max-w-2xl" : "max-w-modal",
        )}
      >
        <h2 id={titleId} className="font-body-bold text-base text-ink">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-1 font-body text-xs text-ink-muted">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

/**
 * A dialog that is one form: its fields, the error under them, then Cancel and the submit
 * button. `onSubmit` runs from the button and from Enter in a field, never while
 * `submitDisabled`: the button is the form's only submit control, so a disabled one blocks Enter
 * too.
 */
export function FormModal({
  title,
  description,
  onClose,
  onSubmit,
  error,
  submitLabel,
  submitDisabled,
  submitVariant,
  children,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  error: string | null;
  submitLabel: string;
  submitDisabled: boolean;
  submitVariant?: ButtonVariant;
  children: ReactNode;
}) {
  const formId = useId();
  return (
    <Modal title={title} description={description} onClose={onClose}>
      <form
        id={formId}
        className="mt-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {children}
        {error && <Note tone="danger">{error}</Note>}
      </form>
      <DialogFooter onCancel={onClose}>
        <Button type="submit" form={formId} variant={submitVariant} disabled={submitDisabled}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </Modal>
  );
}

/** A 28px icon-only button: a menu trigger, a close X, a row's open or play. */
export const iconButtonCls = (tone: "muted" | "brand" = "muted") =>
  cn(
    "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-surface-hover active:bg-surface-press disabled:opacity-40",
    tone === "brand" ? "text-brand hover:text-brand-strong" : "text-ink-muted hover:text-ink",
    FOCUS,
  );

/** A small round icon-only button beside a line of a list: the upload tray's, a picked file's. */
export const roundIconButtonCls =
  "shrink-0 rounded-full p-1.5 text-ink-muted transition-[color,transform] duration-150 ease-out-strong hover:bg-surface-hover hover:text-ink active:scale-90 active:bg-surface-press";

/**
 * A right-hand sheet for editing one record, so the list it came from stays in view. The route
 * keeps the open record's id in its search params, so a reload or a shared link reopens it.
 * `dirty` makes every way out (Escape, the overlay, the X) ask before dropping the edits.
 */
export function Drawer({
  title,
  description,
  onClose,
  dirty = false,
  footer,
  actions,
  size = "md",
  children,
}: {
  title: string;
  description?: ReactNode;
  onClose: () => void;
  dirty?: boolean;
  footer?: ReactNode;
  /** Beside the close button: the record's own `Menu`, the same one its row carries. */
  actions?: ReactNode;
  size?: "md" | "lg";
  children: ReactNode;
}) {
  const ask = useConfirm();
  const titleId = useId();
  const requestClose = async () => {
    if (
      dirty &&
      !(await ask({
        title: "Discard changes?",
        body: "What you changed here has not been saved.",
        action: "Discard",
      }))
    )
      return;
    onClose();
  };
  const ref = useDialogFocus(requestClose);
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="animate-fade-in absolute inset-0 cursor-default bg-overlay"
        onClick={requestClose}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "animate-drawer-in absolute inset-y-0 right-0 flex w-full flex-col border-line border-l bg-surface shadow-pop focus:outline-none",
          size === "lg" ? "max-w-3xl" : "max-w-xl",
        )}
      >
        <div className="flex items-start gap-4 border-line border-b px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-body-bold text-base text-ink">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 font-body text-xs text-ink-muted">{description}</p>
            )}
          </div>
          {actions}
          <button
            type="button"
            aria-label="Close"
            className={iconButtonCls()}
            onClick={requestClose}
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">{children}</div>
        {/* `empty:hidden`: a FormFooter with nothing to save renders nothing, and so does the bar. */}
        {footer && (
          <div className="flex flex-col gap-3 border-line border-t px-6 py-4 empty:hidden">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Where a popover goes: `position: fixed` from its trigger's box, below it unless there is no
 * room, and kept there on scroll and resize. Fixed rather than absolute so a table's
 * `overflow-x-auto` cannot clip it. Call it from the panel component, which mounts only while
 * open, and attach `panelRef` to the panel.
 */
export function useAnchoredPosition(
  triggerRef: RefObject<HTMLElement | null>,
  align: "start" | "end",
) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Hidden until measured: the flip needs the panel's own height.
  const [style, setStyle] = useState<CSSProperties>({ position: "fixed", visibility: "hidden" });
  useLayoutEffect(() => {
    const place = () => {
      const t = triggerRef.current?.getBoundingClientRect();
      const height = panelRef.current?.offsetHeight ?? 0;
      if (!t) return;
      const gap = 4;
      const below = window.innerHeight - t.bottom - gap >= height || t.top < height + gap;
      setStyle({
        position: "fixed",
        ...(below ? { top: t.bottom + gap } : { bottom: window.innerHeight - t.top + gap }),
        ...(align === "end" ? { right: window.innerWidth - t.right } : { left: t.left }),
      });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [triggerRef, align]);
  return { panelRef, style };
}

export interface MenuItem {
  label: string;
  onSelect: () => void;
  tone?: "danger";
  disabled?: boolean;
  /** Why a disabled item is disabled, shown under it. */
  hint?: string;
}

function MenuPanel({
  label,
  items,
  triggerRef,
  onClose,
}: {
  label: string;
  items: MenuItem[];
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const { panelRef, style } = useAnchoredPosition(triggerRef, "end");
  const itemEls = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: focus once, on open
  useEffect(() => {
    const first = items.findIndex((i) => !i.disabled);
    itemEls()[Math.max(0, first)]?.focus();
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const els = itemEls();
    const at = els.indexOf(document.activeElement as HTMLElement);
    const to =
      e.key === "ArrowDown"
        ? (at + 1) % els.length
        : e.key === "ArrowUp"
          ? (at - 1 + els.length) % els.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? els.length - 1
              : null;
    if (to !== null) {
      e.preventDefault();
      els[to]?.focus();
    } else if (e.key === "Escape" || e.key === "Tab") {
      e.preventDefault();
      onClose();
    }
  };

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        className="fixed inset-0 z-50 cursor-default"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="menu"
        aria-label={label}
        tabIndex={-1}
        style={style}
        onKeyDown={onKeyDown}
        className="z-50 flex min-w-48 flex-col rounded-lg border border-line bg-surface p-1 shadow-pop focus:outline-none"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            aria-disabled={item.disabled || undefined}
            onClick={() => {
              if (item.disabled) return;
              onClose();
              item.onSelect();
            }}
            className={cn(
              "rounded-md px-3 py-2 text-left font-body text-sm transition-colors focus:bg-surface-hover focus:outline-none",
              item.disabled
                ? "cursor-not-allowed text-ink-faint"
                : cn(
                    "hover:bg-surface-hover active:bg-surface-press",
                    item.tone === "danger" ? "text-danger" : "text-ink",
                  ),
            )}
          >
            {item.label}
            {item.disabled && item.hint && (
              <span className="mt-0.5 block text-xs text-ink-muted">{item.hint}</span>
            )}
          </button>
        ))}
      </div>
    </>,
    document.body,
  );
}

/**
 * The overflow menu (⋯) for row and header actions, so each row keeps one visible action.
 * `label` names the trigger for the screen reader: "Actions for Day 4". Closing, by any route,
 * puts focus back on the trigger.
 */
export function Menu({ label, items }: { label: string; items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={iconButtonCls()}
        onClick={() => setOpen((o) => !o)}
      >
        <MoreHorizontal size={16} aria-hidden />
      </button>
      {open && <MenuPanel label={label} items={items} triggerRef={triggerRef} onClose={close} />}
    </>
  );
}
