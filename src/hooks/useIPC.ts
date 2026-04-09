import { useCallback, useRef, useState } from "react";

interface UseIPCResult<TResponse> {
  data: TResponse | null;
  isLoading: boolean;
  error: string | null;
  execute: () => Promise<TResponse | null>;
  reset: () => void;
}

/**
 * Generic typed IPC wrapper hook.
 *
 * Wraps any async function (typically a Tauri invoke call) with loading,
 * error, and data state management.
 *
 * @param fn - The async function to execute (e.g. a `api.*` call)
 * @returns Stateful wrapper with execute, data, loading, and error
 *
 * @example
 * ```tsx
 * const { data, isLoading, execute } = useIPC(() => api.getAllProjects());
 *
 * useEffect(() => { execute(); }, [execute]);
 * ```
 */
export function useIPC<TResponse>(fn: () => Promise<TResponse>): UseIPCResult<TResponse> {
  const [data, setData] = useState<TResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const execute = useCallback(async (): Promise<TResponse | null> => {
    abortRef.current = false;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fn();
      if (!abortRef.current) {
        setData(result);
        setIsLoading(false);
      }
      return result;
    } catch (err) {
      if (!abortRef.current) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setIsLoading(false);
      }
      return null;
    }
  }, [fn]);

  const reset = useCallback(() => {
    abortRef.current = true;
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
}

/**
 * IPC mutation hook for operations that don't return data you need to store.
 * Useful for create, update, delete operations.
 *
 * @example
 * ```tsx
 * const { mutate, isLoading } = useIPCMutation(
 *   (id: string) => api.deleteProject(id)
 * );
 *
 * const handleDelete = () => mutate(projectId);
 * ```
 */
interface UseIPCMutationResult<TArgs extends unknown[]> {
  isLoading: boolean;
  error: string | null;
  mutate: (...args: TArgs) => Promise<boolean>;
  reset: () => void;
}

export function useIPCMutation<TArgs extends unknown[]>(
  fn: (...args: TArgs) => Promise<unknown>,
): UseIPCMutationResult<TArgs> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (...args: TArgs): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await fn(...args);
        setIsLoading(false);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(message);
        setIsLoading(false);
        return false;
      }
    },
    [fn],
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return { isLoading, error, mutate, reset };
}
