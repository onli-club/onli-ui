import { ApiError, api, apiUrl, toApiError } from "./api";
import { browserCanEncode, UNSUPPORTED_BROWSER_MESSAGE } from "./encode";

export type MediaStatus = "pending" | "uploaded" | "processing" | "ready" | "failed";

/** `GET /api/media/:id`. Public-bucket kinds carry URLs once ready; private ones never do. */
export interface MediaRow {
  id: string;
  kind: string;
  status: MediaStatus;
  url: string | null;
  thumbUrl: string | null;
  mediumUrl: string | null;
  posterUrl: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
}

export type UploadKind = "image" | "video" | "course_video" | "document";

const MB = 1024 * 1024;

/**
 * Extension → MIME, mirroring `EXTENSIONS` in onli-server's media service. Two jobs: the
 * server validates the `mimeType` we send, and browsers hand back an empty `file.type` often
 * enough (ZIP on Windows, MOV from some tools) that trusting it alone uploads a valid file
 * under a wrong content type and fails presign for a reason nobody can read.
 */
const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  pdf: "application/pdf",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  zip: "application/zip",
  csv: "text/csv",
};

const IMAGE = ["image/jpeg", "image/png", "image/webp"];
const VIDEO = ["video/mp4", "video/quicktime"];
const DOCUMENT = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/zip",
];

export interface UploadLimit {
  /** `accept` for the file input, and what the dropzone rejects before any network call. */
  accept: string;
  mimes: string[];
  maxBytes: number;
  /** Both halves of the rejection message, so it names the rule rather than just refusing. */
  what: string;
  maxLabel: string;
  /** Whether the server has more to do after the bytes land (transcode, or copy to private). */
  processes: boolean;
}

/**
 * The client half of the rules in onli-server `modules/media/service.ts`. The server stays the
 * authority — this only spares the operator a 15-minute upload that was always going to be
 * rejected, and lets the dropzone say which rule a file broke.
 */
export const UPLOAD_LIMITS: Record<UploadKind | "spreadsheet", UploadLimit> = {
  image: {
    accept: "image/jpeg,image/png,image/webp",
    mimes: IMAGE,
    maxBytes: 10 * MB,
    what: "a JPEG, PNG or WebP image",
    maxLabel: "10 MB",
    processes: true,
  },
  video: {
    accept: "video/mp4,video/quicktime,.mp4,.mov",
    mimes: VIDEO,
    maxBytes: 300 * MB,
    what: "an MP4 or MOV video",
    maxLabel: "300 MB",
    processes: true,
  },
  course_video: {
    accept: "video/mp4,video/quicktime,.mp4,.mov",
    mimes: VIDEO,
    maxBytes: 4 * 1024 * MB,
    what: "an MP4 or MOV video",
    maxLabel: "4 GB",
    processes: true,
  },
  document: {
    accept: `.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,${DOCUMENT.join(",")}`,
    mimes: DOCUMENT,
    maxBytes: 100 * MB,
    what: "a PDF, PowerPoint, Word, Excel or ZIP file",
    maxLabel: "100 MB",
    processes: true,
  },
  /**
   * Not a media kind: the whitelist import posts multipart straight to the API. It shares the
   * dropzone and the limit table so one place describes what every picker accepts.
   */
  spreadsheet: {
    accept: ".csv,.xlsx,text/csv",
    mimes: ["text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    maxBytes: 10 * MB,
    what: "a CSV or Excel file",
    maxLabel: "10 MB",
    processes: false,
  },
};

const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

/** `file.type` when the browser filled it in and we recognise it, otherwise the extension. */
export const mimeOf = (file: File): string =>
  file.type && Object.values(MIME_BY_EXT).includes(file.type)
    ? file.type
    : (MIME_BY_EXT[extOf(file.name)] ?? file.type);

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * MB) return `${(bytes / MB).toFixed(1)} MB`;
  return `${(bytes / (1024 * MB)).toFixed(2)} GB`;
}

/** The reason this file cannot be uploaded, or `null` when it can. */
export function validateFile(kind: UploadKind | "spreadsheet", file: File): string | null {
  const limit = UPLOAD_LIMITS[kind];
  if (file.size === 0) return "The file is empty.";
  if (!limit.mimes.includes(mimeOf(file))) return `Not ${limit.what}.`;
  // Videos are encoded in the browser before they go up; without WebCodecs there is no upload.
  if ((kind === "video" || kind === "course_video") && !browserCanEncode())
    return UNSUPPORTED_BROWSER_MESSAGE;
  if (file.size > limit.maxBytes)
    return `${fmtBytes(file.size)} is over the ${limit.maxLabel} limit.`;
  return null;
}

/** Thrown when the operator cancels, so callers can tell it apart from a real failure. */
export class UploadAborted extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadAborted";
  }
}

/**
 * `fetch` reports no upload progress in any browser, so the transfer is an XHR: `upload
 * .onprogress` is the only way to know how far a 4 GB recording has got. No credentials —
 * the presigned URL is the credential, and a credentialed cross-origin PUT to R2 fails its
 * CORS preflight.
 */
function putWithProgress(
  url: string,
  headers: Record<string, string>,
  file: File,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new UploadAborted());
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    for (const [key, value] of Object.entries(headers)) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload rejected by storage (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed — the connection dropped"));
    xhr.onabort = () => reject(new UploadAborted());
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });
}

/**
 * Presign → PUT → complete, the three-step upload the media module expects. Returns the media
 * id and the status the server gave it; attaching it to a lesson or a resource is the caller's
 * business, and so is waiting for `processing` to become `ready` (see `pollMediaStatus`).
 */
export async function uploadMedia(
  kind: UploadKind,
  file: File,
  opts: { onProgress?: (fraction: number) => void; signal?: AbortSignal } = {},
): Promise<{ mediaId: string; status: MediaStatus }> {
  const presign = await api.post<{
    mediaId: string;
    uploadUrl: string;
    headers: Record<string, string>;
  }>("/api/media/uploads", { kind, mimeType: mimeOf(file), sizeBytes: file.size });
  await putWithProgress(
    presign.uploadUrl,
    presign.headers,
    file,
    opts.onProgress ?? (() => {}),
    opts.signal,
  );
  if (opts.signal?.aborted) throw new UploadAborted();
  const done = await api.post<{ status: MediaStatus }>(
    `/api/media/uploads/${presign.mediaId}/complete`,
  );
  return { mediaId: presign.mediaId, status: done.status };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * A video transcodes and a document is copied to the private bucket after the bytes land, so
 * "100%" is not "done". Polls until the server settles the row; gives up after ~20 minutes and
 * says so rather than claiming success.
 */
export async function pollMediaStatus(
  mediaId: string,
  signal?: AbortSignal,
): Promise<"ready" | "failed" | "timeout"> {
  const deadline = Date.now() + 20 * 60_000;
  while (Date.now() < deadline) {
    if (signal?.aborted) throw new UploadAborted();
    await sleep(3000);
    const row = await api.get<MediaRow>(`/api/media/${mediaId}`).catch(() => null);
    if (row?.status === "ready" || row?.status === "failed") return row.status;
  }
  return "timeout";
}

/**
 * The whitelist import is not a media upload — it posts multipart to the API and answers with
 * a report — but a 10 MB spreadsheet still deserves a progress bar, and only XHR gives one.
 */
export function postFileWithProgress<T>(
  path: string,
  file: File,
  opts: {
    onProgress?: (fraction: number) => void;
    signal?: AbortSignal;
    /** Plain fields sent beside the file — an import's batch, say. */
    fields?: Record<string, string>;
  } = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (opts.signal?.aborted) return reject(new UploadAborted());
    const form = new FormData();
    form.append("file", file);
    for (const [k, v] of Object.entries(opts.fields ?? {})) form.append(k, v);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl(path), true);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      const body = (() => {
        try {
          return JSON.parse(xhr.responseText);
        } catch {
          return null;
        }
      })();
      if (xhr.status >= 200 && xhr.status < 300) return resolve(body as T);
      reject(toApiError(xhr.status, body));
    };
    xhr.onerror = () =>
      reject(new ApiError(0, "NETWORK", "Import failed — the connection dropped"));
    xhr.onabort = () => reject(new UploadAborted());
    opts.signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(form);
  });
}

export const RESOURCE_ACCEPT = `${UPLOAD_LIMITS.document.accept},${UPLOAD_LIMITS.course_video.accept}`;

/**
 * A resource file is a handout or a bonus video, and the upload kind follows the file: videos
 * go through the same `course_video` pipeline a session recording uses, so they transcode and
 * play in the app rather than being handed to the browser as a download.
 */
export const resourceUploadKind = (file: File): UploadKind =>
  file.type.startsWith("video/") || /\.(mp4|mov)$/i.test(file.name) ? "course_video" : "document";

/** A resource dropzone takes either, so its check is "valid as one of the two". */
export const validateResourceFile = (file: File): string | null =>
  validateFile(resourceUploadKind(file), file);
