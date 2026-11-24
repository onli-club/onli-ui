import {
  QueryClient,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRef } from "react";
import { ApiError, api, setUnauthorizedHandler } from "./api";
import { useToast } from "./feedback";

/** What every panel's `GET /api/me` holds; a panel passes its own wider type to `useMe`. */
export interface Me {
  id: string;
  email: string;
  name: string;
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

// `me` becomes null so the shell renders sign-in; everything else is dropped so the next session
// never sees another operator's cached pages.
setUnauthorizedHandler(() => {
  queryClient.setQueryData(["me"], null);
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "me" });
});

const meQuery = {
  queryKey: ["me"],
  queryFn: async (): Promise<Me | null> => {
    try {
      return await api.get<Me>("/api/me");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },
  retry: false,
};

/** The signed-in staff member; the shell has already resolved it, so screens read it for free. */
export function useMe<T extends Me = Me>() {
  return useQuery(meQuery) as UseQueryResult<T | null>;
}

export async function signOut() {
  await api.post("/api/auth/sign-out", {}).catch(() => {});
  queryClient.clear();
  location.reload();
}

export const apiMessage = (e: unknown, fallback = "Something went wrong") =>
  e instanceof ApiError ? e.message : fallback;

interface ApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  /** Awaited before the refresh below, so a caller that navigates away has left first. */
  onSuccess?: (data: TData, variables: TVariables) => unknown;
  /**
   * A form's own error slot: the failure is shown there, beside the fields, and cleared on
   * success. Without it the action is instant (a row button, a menu item, a reorder) and a
   * failure becomes a danger toast with Retry.
   */
  setError?: (message: string | null) => void;
  /** A success toast. */
  success?: string | ((data: TData, variables: TVariables) => string);
  /** The message when the error is not the server's own (`ApiError`). */
  fallback?: string;
}

/**
 * The only way the panel mutates. A bare `useMutation` with no `onError` fails silently, and a
 * failure shown anywhere but where the action happened is one nobody sees.
 *
 * Once a call settles, everything cached is marked stale: a save can change what any screen
 * shows (a seat moves a course's member count and a class its dashboard line), and a list of
 * what each save touches is always missing something. Only what is on screen refetches now;
 * the rest refetches when it is next opened. A failure counts too, because some calls land in
 * part (three attaches where the second is refused).
 */
export function useApiMutation<TData, TVariables = void>({
  mutationFn,
  onSuccess,
  setError,
  success,
  fallback,
}: ApiMutationOptions<TData, TVariables>) {
  const qc = useQueryClient();
  const toast = useToast();
  // A double click must send one request. `disabled={isPending}` cannot promise that: the
  // pending state reaches React a macrotask after `mutate`, so the second click still lands.
  const inFlight = useRef(new Set<string>());
  const keyOf = (variables: TVariables) => JSON.stringify(variables ?? null);
  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn,
    onSettled: (_data, _error, variables) => {
      inFlight.current.delete(keyOf(variables));
      qc.invalidateQueries();
    },
    onSuccess: (data, variables) => {
      setError?.(null);
      if (success)
        toast(typeof success === "string" ? success : success(data, variables), {
          tone: "success",
        });
      return onSuccess?.(data, variables);
    },
    onError: (e, variables) => {
      const message = apiMessage(e, fallback);
      if (setError) setError(message);
      else
        toast(message, {
          tone: "danger",
          action: { label: "Retry", onClick: () => mutate(variables) },
        });
    },
  });
  /** Ignores a call identical to one still in flight; a different one goes ahead. */
  const mutate = (variables: TVariables) => {
    const key = keyOf(variables);
    if (inFlight.current.has(key)) return;
    inFlight.current.add(key);
    mutation.mutate(variables);
  };
  return { ...mutation, mutate };
}
