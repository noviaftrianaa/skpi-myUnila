"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dashboardClient } from "@/lib/api/dashboardClient";
import type { ApiResponse } from "../types";

interface UseDashboardDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData<T>(
  endpoint: string,
  params?: Record<string, string>
): UseDashboardDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Serialize params to stable string for useEffect dependency
  const paramsKey = params ? JSON.stringify(params) : "";

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      // Filter out empty params
      const cleanParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) cleanParams[key] = value;
        });
      }

      const response = await dashboardClient.get<ApiResponse<T>>(endpoint, {
        params: cleanParams,
        signal: controller.signal,
      });

      if (!controller.signal.aborted) {
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message || "Gagal mengambil data");
        }
      }
    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        if (err instanceof Error) {
          if (err.name === "CanceledError" || err.name === "AbortError") return;
          setError(err.message || "Terjadi kesalahan saat mengambil data");
        } else {
          setError("Terjadi kesalahan saat mengambil data");
        }
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useDashboardData;
