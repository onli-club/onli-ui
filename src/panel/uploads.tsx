import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Check,
  ChevronDown,
  FolderInput,
  HardDrive,
  RotateCcw,
  X,
} from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { EncodeAborted, encodeVideo, releaseEncoded } from "./encode";
import { plural } from "./format";
import { cn, LinkButton, MetaLine, ProgressBar, roundIconButtonCls } from "./ui";
import {
  fmtBytes,
  pollMediaStatus,
  UPLOAD_LIMITS,
  UploadAborted,
  type UploadKind,
  uploadMedia,
} from "./upload";

/** One thing to upload: the bytes, and what to do with the media id once they are up. */
export interface UploadTask {
  file: File;
  kind: UploadKind;
  /** The record it becomes or attaches to — the tray's second line, so a queue of five files is readable. */
  target: string;
  /**
   * Attaches the finished media id to that record. Failure here fails the job, retryably.
   * Everything cached is refreshed after it lands and again when processing settles, as after
   * any save (`useApiMutation`).
   */
  attach: (mediaId: string) => Promise<void>;
}

type JobStatus =
  | "queued"
  | "encoding"
  | "uploading"
  | "attaching"
  | "processing"
  | "done"
  | "failed";

interface Job {
  id: string;
  task: UploadTask;
  status: JobStatus;
  /** 0–1 for the byte transfer; `null` once the bytes are up and the wait is server-side. */
  progress: number | null;
  /** What actually goes over the wire: the encoded size once a video has been prepared. */
  bytes: number;
  message?: string;
}

const isActive = (j: Job) => j.status !== "done" && j.status !== "failed";

const UploadsContext = createContext<((tasks: UploadTask[]) => void) | null>(null);

/**
 * Queue files for upload. The tray takes over from here: the caller can close its dialog,
 * navigate away, and the transfer keeps running because the queue lives in the shell.
 */
export function useUploads() {
  const enqueue = useContext(UploadsContext);
  if (!enqueue) throw new Error("useUploads must be used inside <UploadProvider>");
  return enqueue;
}

let seq = 0;

/**
 * The panel's one upload queue, mounted once by the shell. Uploads run **one at a time**: a
 * 4 GB recording and a 2 MB handout sharing an uplink would make both percentages lie, and a
 * serial queue is the only way a number on screen means what it says.
 */
export function UploadProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [jobs, setJobs] = useState<Job[]>([]);
  const aborters = useRef(new Map<string, AbortController>());
  const running = useRef<string | null>(null);

  const patch = useCallback((id: string, next: Partial<Job>) => {
    setJobs((list) => list.map((j) => (j.id === id ? { ...j, ...next } : j)));
  }, []);

  const enqueue = useCallback((tasks: UploadTask[]) => {
    setJobs((list) => [
      ...list,
      ...tasks.map((task) => ({
        id: `u${++seq}`,
        task,
        status: "queued" as const,
        progress: 0,
        bytes: task.file.size,
      })),
    ]);
  }, []);

  const run = useCallback(
    async (job: Job) => {
      const controller = new AbortController();
      aborters.current.set(job.id, controller);
      const { kind, attach } = job.task;
      let file = job.task.file;
      try {
        // A video not already at spec is encoded here first (H.264 720p, AAC) so the server only
        // has to check it and copy it into place; one at spec goes up as it is. The tray shows
        // the encode as its own stage, and the row's size switches to the bytes that go up.
        if (kind === "video" || kind === "course_video") {
          patch(job.id, { status: "encoding", progress: 0, message: undefined });
          const encoded = await encodeVideo(file, kind, {
            signal: controller.signal,
            onProgress: (p) => patch(job.id, { progress: p }),
          });
          file = encoded.file;
          patch(job.id, { bytes: file.size });
        }
        patch(job.id, { status: "uploading", progress: 0, message: undefined });
        const { mediaId, status } = await uploadMedia(kind, file, {
          signal: controller.signal,
          onProgress: (p) => patch(job.id, { progress: p }),
        });
        patch(job.id, { status: "attaching", progress: null });
        await attach(mediaId);
        qc.invalidateQueries();

        if (!UPLOAD_LIMITS[kind].processes || status === "ready") {
          patch(job.id, { status: "done", progress: 1 });
          return;
        }
        // A video transcodes and a document is copied to the private bucket, so 100% of the
        // bytes is not yet a file anyone can open. Say so instead of claiming success.
        patch(job.id, { status: "processing" });
        const settled = await pollMediaStatus(mediaId, controller.signal);
        qc.invalidateQueries();
        if (settled === "failed")
          patch(job.id, { status: "failed", message: "The server could not process this file." });
        else if (settled === "timeout")
          patch(job.id, {
            status: "done",
            progress: 1,
            message: "Still processing on the server.",
          });
        else patch(job.id, { status: "done", progress: 1 });
      } catch (e) {
        if (e instanceof UploadAborted || e instanceof EncodeAborted) {
          setJobs((list) => list.filter((j) => j.id !== job.id));
          return;
        }
        patch(job.id, {
          status: "failed",
          message: e instanceof Error ? e.message : "Upload failed",
        });
      } finally {
        if (file !== job.task.file) void releaseEncoded(file);
        aborters.current.delete(job.id);
        running.current = null;
      }
    },
    [patch, qc],
  );

  useEffect(() => {
    if (running.current) return;
    const next = jobs.find((j) => j.status === "queued");
    if (!next) return;
    running.current = next.id;
    void run(next);
  }, [jobs, run]);

  // A transfer cannot survive a reload, and losing a 4 GB upload to a stray ⌘R is not a
  // mistake anyone should be able to make silently.
  useEffect(() => {
    if (!jobs.some(isActive)) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [jobs]);

  const cancel = (id: string) => {
    const controller = aborters.current.get(id);
    if (controller) controller.abort();
    else setJobs((list) => list.filter((j) => j.id !== id));
  };
  const retry = (id: string) =>
    setJobs((list) =>
      list.map((j) =>
        j.id === id
          ? { ...j, status: "queued", progress: 0, bytes: j.task.file.size, message: undefined }
          : j,
      ),
    );
  const dismiss = (id: string) => setJobs((list) => list.filter((j) => j.id !== id));
  const clearFinished = () => setJobs((list) => list.filter(isActive));

  return (
    <UploadsContext.Provider value={enqueue}>
      {children}
      <UploadTray
        jobs={jobs}
        onCancel={cancel}
        onRetry={retry}
        onDismiss={dismiss}
        onClearFinished={clearFinished}
      />
    </UploadsContext.Provider>
  );
}

const STATUS_LABEL: Record<JobStatus, string> = {
  queued: "Waiting",
  encoding: "Encoding",
  uploading: "Uploading",
  attaching: "Saving",
  processing: "Processing",
  done: "Done",
  failed: "Failed",
};

function JobRow({
  job,
  onCancel,
  onRetry,
  onDismiss,
}: {
  job: Job;
  onCancel: () => void;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  const failed = job.status === "failed";
  const done = job.status === "done";
  const pct = job.progress === null ? null : Math.round(job.progress * 100);
  return (
    <li className="animate-row-in px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className="min-w-0 flex-1 truncate font-body-md text-xs text-ink"
          title={job.task.file.name}
        >
          {job.task.file.name}
        </span>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 font-body text-xs tabular-nums",
            failed ? "text-danger" : done ? "text-ink-muted" : "text-ink-secondary",
          )}
        >
          {failed ? (
            <AlertCircle size={13} aria-hidden />
          ) : done ? (
            <Check size={13} className="text-success" aria-hidden />
          ) : null}
          {(job.status === "uploading" || job.status === "encoding") && pct !== null
            ? `${STATUS_LABEL[job.status]} ${pct}%`
            : STATUS_LABEL[job.status]}
        </span>
        {failed ? (
          <button
            type="button"
            aria-label={`Retry ${job.task.file.name}`}
            title="Retry"
            className={roundIconButtonCls}
            onClick={onRetry}
          >
            <RotateCcw size={13} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          aria-label={`${done || failed ? "Dismiss" : "Cancel"} ${job.task.file.name}`}
          title={done || failed ? "Dismiss" : "Cancel"}
          className={roundIconButtonCls}
          onClick={done || failed ? onDismiss : onCancel}
        >
          <X size={13} aria-hidden />
        </button>
      </div>
      <p className="mt-0.5 truncate pr-6 font-body text-[11px] leading-4 text-ink-muted">
        {job.message ?? (
          <MetaLine
            facts={[
              { icon: FolderInput, label: job.task.target },
              { icon: HardDrive, label: fmtBytes(job.bytes) },
            ]}
          />
        )}
      </p>
      {!done && (
        <div className="mt-2">
          <ProgressBar
            value={job.status === "queued" ? 0 : job.progress}
            tone={failed ? "danger" : job.status === "processing" ? "accent" : "brand"}
            label={`${STATUS_LABEL[job.status]} ${job.task.file.name}`}
          />
        </div>
      )}
    </li>
  );
}

/**
 * Docked bottom-right, above the page. While a dialog or drawer is open it rises above it and
 * moves bottom-left, onto the dimmed page: an upload started from a drawer stays visible without
 * covering the drawer's Save. It exists only while there is something to say.
 */
function UploadTray({
  jobs,
  onCancel,
  onRetry,
  onDismiss,
  onClearFinished,
}: {
  jobs: Job[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onDismiss: (id: string) => void;
  onClearFinished: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (jobs.length === 0) return null;

  const active = jobs.filter(isActive);
  const failed = jobs.filter((j) => j.status === "failed");
  const finished = jobs.length - active.length;
  const transferring = active.filter((j) => j.progress !== null);
  const overall = transferring.length
    ? transferring.reduce((sum, j) => sum + (j.progress ?? 0), 0) / transferring.length
    : null;

  const heading = active.length
    ? `Uploading ${plural(active.length, "file")}`
    : failed.length
      ? `${plural(failed.length, "upload")} failed`
      : `${plural(finished, "upload")} finished`;

  return (
    <section
      aria-label="Uploads"
      className="animate-tray-in fixed right-6 bottom-6 z-40 w-88 overflow-hidden rounded-xl border border-line bg-surface shadow-pop dialog-open:right-auto dialog-open:left-6 dialog-open:z-[55]"
    >
      <div className="flex items-center gap-2 border-line border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-body-bold text-xs text-ink">{heading}</p>
          {active.length > 0 && (
            <p className="mt-0.5 font-body text-[11px] text-ink-muted">
              Safe to keep working — closing this tab cancels them.
            </p>
          )}
        </div>
        {finished > 0 && active.length === 0 && (
          <LinkButton onClick={onClearFinished}>Clear</LinkButton>
        )}
        <button
          type="button"
          aria-label={collapsed ? "Show uploads" : "Hide uploads"}
          aria-expanded={!collapsed}
          className={roundIconButtonCls}
          onClick={() => setCollapsed((c) => !c)}
        >
          <ChevronDown
            size={16}
            aria-hidden
            className={cn(
              "transition-transform duration-200 ease-out-strong",
              collapsed && "-rotate-180",
            )}
          />
        </button>
      </div>
      {collapsed ? (
        active.length > 0 && <ProgressBar value={overall} label={heading} />
      ) : (
        <ul className="max-h-80 divide-y divide-line overflow-y-auto">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onCancel={() => onCancel(job.id)}
              onRetry={() => onRetry(job.id)}
              onDismiss={() => onDismiss(job.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
