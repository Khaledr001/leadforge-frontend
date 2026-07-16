'use client';

import { useCallback, useEffect, useState } from 'react';

type Meta = { total: number; page?: number; limit?: number } | null;

interface Result<T> {
  key: string;
  data: T | null;
  meta: Meta;
  error: string | null;
}

export interface ApiState<T> {
  data: T | null;
  meta: Meta;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Minimal SWR-style hook around an api-client call. Loading is derived by
 * comparing the current request key with the last resolved one, so no state is
 * set synchronously inside the effect.
 */
export function useApi<T>(
  fetcher: () => Promise<{ data: T; meta?: { total: number; page?: number; limit?: number } }>,
  deps: unknown[] = [],
): ApiState<T> {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const key = `${JSON.stringify(deps)}:${tick}`;

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((res) => {
        if (!cancelled) setResult({ key, data: res.data, meta: res.meta ?? null, error: null });
      })
      .catch((err: Error) => {
        if (!cancelled) setResult({ key, data: null, meta: null, error: err.message });
      });
    return () => {
      cancelled = true;
    };
    // The fetcher closure is recreated per render; the request is keyed by deps + tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  const fresh = result?.key === key;

  return {
    data: result?.data ?? null,
    meta: result?.meta ?? null,
    loading: !fresh,
    error: fresh ? (result?.error ?? null) : null,
    refetch,
  };
}
