const BASE_URL = import.meta.env.VITE_API_URL || "";
/** The member app's origin, for "Open in app" links; unset means no links are shown. */
export const APP_URL = (import.meta.env.VITE_APP_URL || "").replace(/\/$/, "");

/**
 * For hrefs the browser follows itself (a PDF opened in a new tab). A bare `/api/...` only
 * works behind the Vite proxy; on Cloudflare it hits the SPA fallback and returns index.html.
 */
export const apiUrl = (path: string) => `${BASE_URL}${path}`;

/** Rows per page on the list routes; the server's own default, well under every route's cap. */
export const PAGE_SIZE = 50;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let onUnauthorized: (() => void) | null = null;

/**
 * Registered once by `query-client.ts`. Any 401 means the session is gone, so the whole panel
 * drops back to sign-in instead of every button failing quietly.
 */
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers:
      body !== undefined && !(body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : undefined,
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) throw toApiError(res.status, json);
  return json as T;
}

type ErrorBody = { error?: { code?: string; message?: string }; message?: string; code?: string };

/** How every failed response is read, by `request` and by the XHR upload alike. */
export function toApiError(status: number, body: ErrorBody | null): ApiError {
  if (status === 401) onUnauthorized?.();
  return new ApiError(
    status,
    body?.error?.code ?? body?.code ?? "ERROR",
    body?.error?.message ?? body?.message ?? `Request failed (${status})`,
  );
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
