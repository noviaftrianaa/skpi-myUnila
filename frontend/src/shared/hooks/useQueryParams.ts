/**
 * useQueryParams Hook
 * 
 * Easy access to URL query parameters
 */

import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParams() {
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const getAll = useCallback(
    (key: string): string[] => {
      return searchParams.getAll(key);
    },
    [searchParams]
  );

  const has = useCallback(
    (key: string): boolean => {
      return searchParams.has(key);
    },
    [searchParams]
  );

  const toString = useCallback((): string => {
    return searchParams.toString();
  }, [searchParams]);

  return {
    get,
    getAll,
    has,
    toString,
    searchParams,
  };
}
