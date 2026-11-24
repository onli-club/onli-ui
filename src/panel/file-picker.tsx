import { FileUp, X } from "lucide-react";
import { useRef, useState } from "react";
import { plural } from "./format";
import { cn, roundIconButtonCls } from "./ui";
import {
  fmtBytes,
  RESOURCE_ACCEPT,
  UPLOAD_LIMITS,
  type UploadKind,
  validateFile,
  validateResourceFile,
} from "./upload";

/** `resource` is the library's either/or: a handout **or** a bonus video, judged per file. */
export type PickerKind = UploadKind | "spreadsheet" | "resource";

const acceptFor = (kind: PickerKind) =>
  kind === "resource" ? RESOURCE_ACCEPT : UPLOAD_LIMITS[kind].accept;

const validate = (kind: PickerKind, file: File) =>
  kind === "resource" ? validateResourceFile(file) : validateFile(kind, file);

const hintFor = (kind: PickerKind) =>
  kind === "resource"
    ? "PDF, PowerPoint, Word, Excel or ZIP up to 100 MB. MP4 or MOV up to 4 GB."
    : `${UPLOAD_LIMITS[kind].what} up to ${UPLOAD_LIMITS[kind].maxLabel}`;

export interface Picked {
  id: string;
  file: File;
  /** Why it cannot be uploaded, decided at pick time so nothing waits for a network call. */
  problem: string | null;
}

let seq = 0;

/**
 * Drop or browse, see what you picked and how big it is, and learn a file is too large or the
 * wrong type *before* anything is sent. The caller holds `picked`, because its own footer
 * decides what happens to the files that passed.
 */
export function FilePicker({
  kind,
  multiple = false,
  disabled = false,
  picked,
  onChange,
}: {
  kind: PickerKind;
  multiple?: boolean;
  /** While the caller uploads in place: no new files, none removed. */
  disabled?: boolean;
  picked: Picked[];
  onChange: (picked: Picked[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // dragenter/dragleave also fire for children, so a boolean flickers; a depth count does not.
  const depth = useRef(0);
  const [dragging, setDragging] = useState(false);

  function add(files: File[]) {
    if (files.length === 0) return;
    let next = files;
    if (!multiple) {
      next = files.slice(0, 1);
      setNotice(
        files.length > 1
          ? `One file at a time here — kept “${files[0]?.name}” and ignored ${plural(files.length - 1, "other")}.`
          : null,
      );
    } else {
      setNotice(null);
    }
    const mapped = next.map((file) => ({
      id: `p${++seq}`,
      file,
      problem: validate(kind, file),
    }));
    onChange(multiple ? [...picked, ...mapped] : mapped);
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          depth.current += 1;
          if (!disabled) setDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depth.current -= 1;
          if (depth.current <= 0) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          depth.current = 0;
          setDragging(false);
          if (!disabled) add(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "mt-4 flex w-full cursor-pointer flex-col items-center gap-1 rounded-xl border border-dashed px-6 py-10 text-center transition-[background-color,border-color,transform] duration-150 ease-out-strong active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          dragging ? "border-brand bg-brand-subtle" : "border-line-strong bg-surface-sunken",
        )}
      >
        <FileUp size={22} className={dragging ? "text-brand" : "text-ink-muted"} aria-hidden />
        <span className="font-body-md text-sm text-ink">
          {dragging
            ? "Drop to add"
            : `Drop ${multiple ? "files" : "a file"} here, or click to browse`}
        </span>
        <span className="font-body text-xs text-ink-muted">{hintFor(kind)}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={acceptFor(kind)}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          add(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />

      {notice && <p className="mt-2 font-body text-xs text-ink-muted">{notice}</p>}

      {picked.length > 0 && (
        <ul className="mt-3 flex max-h-64 flex-col gap-1 overflow-y-auto">
          {picked.map((p) => (
            <li
              key={p.id}
              className="animate-row-in flex items-center gap-3 rounded-lg bg-surface-sunken px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-body-md text-xs text-ink">{p.file.name}</p>
                <p
                  className={cn(
                    "mt-0.5 truncate font-body text-[11px]",
                    p.problem ? "text-danger" : "text-ink-muted",
                  )}
                >
                  {p.problem ?? fmtBytes(p.file.size)}
                </p>
              </div>
              {!disabled && (
                <button
                  type="button"
                  aria-label={`Remove ${p.file.name}`}
                  className={roundIconButtonCls}
                  onClick={() => onChange(picked.filter((x) => x.id !== p.id))}
                >
                  <X size={13} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
