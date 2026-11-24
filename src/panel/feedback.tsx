import { AlertCircle, Check, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button, DialogFooter, Field, iconButtonCls, inputCls, LinkButton, Modal } from "./ui";

export interface ConfirmOptions {
  /** The question: "Delete Week 3?" */
  title: string;
  /** The consequence, in one or two sentences. */
  body?: ReactNode;
  /** The verb on the button: "Delete week", "Finish batch". */
  action: string;
  /** `danger` (default) for what cannot be taken back. */
  tone?: "danger" | "primary";
  /** The action stays off until "delete" is typed: for a delete that takes something from people. */
  typeToConfirm?: boolean;
}

type Ask = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Ask | null>(null);

/** Resolves `true` when the action is chosen, `false` on Cancel, Escape or a click outside. */
export function useConfirm() {
  const ask = useContext(ConfirmContext);
  if (!ask) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ask;
}

let askSeq = 0;

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<(ConfirmOptions & { id: number }) | null>(null);
  const resolver = useRef<((ok: boolean) => void) | null>(null);

  const ask = useCallback<Ask>(
    (options) =>
      new Promise((resolve) => {
        // A second question while one is open answers the first with "no".
        resolver.current?.(false);
        resolver.current = resolve;
        setOpen({ ...options, id: ++askSeq });
      }),
    [],
  );
  const settle = (ok: boolean) => {
    resolver.current?.(ok);
    resolver.current = null;
    setOpen(null);
  };

  return (
    <ConfirmContext.Provider value={ask}>
      {children}
      {open && <ConfirmDialog key={open.id} options={open} onSettle={settle} />}
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({
  options,
  onSettle,
}: {
  options: ConfirmOptions;
  onSettle: (ok: boolean) => void;
}) {
  const [typed, setTyped] = useState("");
  // Any case and spaces around it: phones capitalise the first letter.
  const ready = !options.typeToConfirm || typed.trim().toLowerCase() === "delete";
  return (
    <Modal title={options.title} onClose={() => onSettle(false)}>
      {options.body && (
        <div className="mt-2 font-body text-sm text-ink-secondary">{options.body}</div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSettle(true);
        }}
      >
        {options.typeToConfirm && (
          <Field
            className="mt-4"
            label={
              <span>
                Type <span className="font-mono text-ink">delete</span> to confirm
              </span>
            }
          >
            <input
              className={inputCls()}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          </Field>
        )}
        {/* Cancel first in DOM order, so it is where focus lands when there is no field. */}
        <DialogFooter onCancel={() => onSettle(false)}>
          <Button
            type="submit"
            variant={options.tone === "primary" ? "primary" : "danger-solid"}
            disabled={!ready}
          >
            {options.action}
          </Button>
        </DialogFooter>
      </form>
    </Modal>
  );
}

export interface ToastOptions {
  tone?: "success" | "danger" | "neutral";
  action?: { label: string; onClick: () => void };
}

type Toast = (message: string, options?: ToastOptions) => void;
interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

const ToastContext = createContext<Toast | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast must be used inside <ToastProvider>");
  return toast;
}

const MAX_TOASTS = 3;
const TOAST_MS = 4000;
let toastSeq = 0;

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const danger = item.tone === "danger";

  // An error waits for the reader (WCAG 2.2.1); the rest go, but never while being read.
  useEffect(() => {
    if (danger || hovered || focused) return;
    const t = setTimeout(() => onDismiss(item.id), TOAST_MS);
    return () => clearTimeout(t);
  }, [danger, hovered, focused, item.id, onDismiss]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: it is an alert or a status; the rule cannot read a conditional role
    <div
      role={danger ? "alert" : "status"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className="animate-tray-in pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-pop"
    >
      {item.tone === "success" && <Check size={16} className="shrink-0 text-success" aria-hidden />}
      {danger && <AlertCircle size={16} className="shrink-0 text-danger" aria-hidden />}
      <p className="min-w-0 flex-1 font-body text-sm text-ink">{item.message}</p>
      {item.action && (
        <LinkButton
          tone="brand"
          onClick={() => {
            onDismiss(item.id);
            item.action?.onClick();
          }}
        >
          {item.action.label}
        </LinkButton>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(item.id)}
        className={iconButtonCls()}
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

/**
 * Bottom-centre, above dialogs (z-50) and the upload tray (z-40, z-[55] over a dialog). The region is
 * always mounted so a screen reader is already listening when the first message arrives.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const toast = useCallback<Toast>(
    (message, options) =>
      setItems((l) => [...l, { ...options, id: ++toastSeq, message }].slice(-MAX_TOASTS)),
    [],
  );
  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4"
        >
          {items.map((t) => (
            <ToastRow key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
