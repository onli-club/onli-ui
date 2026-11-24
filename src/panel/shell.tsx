import { Link } from "@tanstack/react-router";
import { LogOut, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { signOut } from "./query-client";
import { cn, HeaderSlot, LinkButton, PageHeader, Pill, SectionLabel } from "./ui";

export interface PanelNavRow {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown as the pill beside the label and the dot on the icon rail; 0 or absent shows neither. */
  count?: number;
}

export interface PanelNavGroup {
  /** The heading over the rows; a group without one shows none. */
  label?: string;
  rows: PanelNavRow[];
}

/**
 * The wordmark comes from `@onli/ui/css/wordmark.css`, the same metrics the app renders.
 * Two nested rows on purpose: the outer centers the pair in the h-16 block, the inner sits them
 * on a shared baseline. `items-baseline` alone cannot do both — in a fixed-height flex container
 * it pins the group to the top of the line box. `px-7` puts the wordmark on the same left edge
 * as the nav icons below (nav `px-4` + row `px-3`). Below `lg` the sidebar is an icon rail and
 * only the initial and its dot remain, centred.
 */
function Wordmark({ product }: { product: string }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-center border-b border-line lg:justify-start lg:px-7">
      <div className="flex items-baseline gap-2">
        <span className="wordmark wordmark-sm" role="img" aria-label="Onli">
          <span className="hidden lg:inline">Onli</span>
          <span className="lg:hidden" aria-hidden>
            O
          </span>
          <span className="wordmark-dot">.</span>
        </span>
        <span className="hidden font-body-md text-sm text-ink-muted lg:inline">{product}</span>
      </div>
    </div>
  );
}

export function PanelShell({
  product,
  groups,
  activeTo,
  header,
  email,
  navTop,
  children,
}: {
  /** The word beside the wordmark and in the tab title: "Admin", "Creators". */
  product: string;
  /** Already filtered to what this person may see. A group with no rows must not be passed. */
  groups: PanelNavGroup[];
  /** The `to` of the row to light up. */
  activeTo?: string;
  /** A section route's header. Absent on a detail route, which renders its own. */
  header?: { title: string; subtitle?: string };
  email: string;
  /** Rendered between the wordmark and the nav (the creators panel's creator switcher). */
  navTop?: ReactNode;
  children: ReactNode;
}) {
  // The section route's header actions render here, through `PageActions`.
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  // A route change in a SPA moves nothing on its own: name the page and put focus on its
  // heading, so the tab title and the screen reader both say where you landed.
  const firstRender = useRef(true);
  const title = header?.title;
  useEffect(() => {
    document.title = title ? `${title} | Onli ${product}` : `Onli ${product}`;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
  }, [title, product]);

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* Below `lg` the sidebar is a 64px icon rail: labels move into `title`/`aria-label`, the
          row's count becomes a dot on its icon, and group headings become hairlines. */}
      <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-line bg-surface lg:w-sidebar">
        <Wordmark product={product} />
        {navTop}
        <nav
          aria-label="Sections"
          className="flex flex-1 flex-col overflow-y-auto px-3 py-4 lg:px-4"
        >
          {groups.map((group, gi) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: the groups are a fixed list per render
              key={gi}
              className={cn(
                "flex flex-col gap-0.5",
                gi > 0 && "mt-3 border-line border-t pt-3 lg:mt-5 lg:border-t-0 lg:pt-0",
              )}
            >
              {group.label && (
                <div className="mb-1.5 hidden px-3 lg:block">
                  <SectionLabel>{group.label}</SectionLabel>
                </div>
              )}
              {group.rows.map((n) => {
                const active = n.to === activeTo;
                const count = n.count ?? 0;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    // The router marks every link whose address starts this one's (Home on every
                    // page) as current; only `activeTo` is.
                    activeOptions={{ exact: true, includeSearch: false }}
                    aria-current={active ? "page" : undefined}
                    aria-label={count > 0 ? `${n.label}, ${count} open` : n.label}
                    title={n.label}
                    className={cn(
                      "relative flex items-center justify-center gap-3 rounded-lg px-0 py-2.5 text-sm transition-colors lg:justify-start lg:px-3 lg:py-2",
                      active
                        ? "bg-brand font-body-md text-on-brand"
                        : "font-body text-ink-secondary hover:bg-surface-hover active:bg-surface-press",
                    )}
                  >
                    <n.icon size={18} strokeWidth={2} className="shrink-0" aria-hidden />
                    <span className="hidden min-w-0 flex-1 truncate lg:block">{n.label}</span>
                    {count > 0 && (
                      <>
                        <span className="hidden lg:block">
                          <Pill tone={active ? "neutral" : "danger"}>{count}</Pill>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            "absolute top-1.5 right-2.5 size-2 rounded-full lg:hidden",
                            active ? "bg-on-brand" : "bg-danger",
                          )}
                        />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t border-line px-3 py-3 font-body text-xs text-ink-muted lg:px-7 lg:py-4">
          <span className="hidden truncate lg:block" title={email}>
            {email}
          </span>
          <LinkButton tone="brand" className="mt-1 hidden lg:block" onClick={signOut}>
            Sign out
          </LinkButton>
          <button
            type="button"
            aria-label={`Sign out ${email}`}
            title="Sign out"
            onClick={signOut}
            className="flex w-full items-center justify-center rounded-lg py-2 text-ink-secondary transition-colors hover:bg-surface-hover hover:text-ink lg:hidden"
          >
            <LogOut size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        {header && (
          <PageHeader
            title={header.title}
            subtitle={header.subtitle}
            actions={<div ref={setSlot} className="flex items-center gap-2" />}
          />
        )}
        {header ? (
          <div className="flex-1 px-5 py-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
              <HeaderSlot.Provider value={slot}>{children}</HeaderSlot.Provider>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
