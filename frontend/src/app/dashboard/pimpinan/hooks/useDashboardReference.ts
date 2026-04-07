"use client";

import { useState, useEffect } from "react";
import { dashboardClient } from "@/lib/api/dashboardClient";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { FilterOption } from "../components/FilterPanel";
import type { ApiResponse, ReferenceItem, SemesterItem } from "../types";

export interface ProdiOption extends FilterOption {
  id_fakultas: string;
}

interface UseDashboardReferenceResult {
  fakultas: FilterOption[];
  semester: FilterOption[];
  activeSemesters: string[];
  allProdi: ProdiOption[];
  getProdiByFakultas: (fakultasId: string) => FilterOption[];
  loading: boolean;
}

export function useDashboardReference(): UseDashboardReferenceResult {
  const [fakultas, setFakultas] = useState<FilterOption[]>([]);
  const [semester, setSemester] = useState<FilterOption[]>([]);
  const [activeSemesters, setActiveSemesters] = useState<string[]>([]);
  const [allProdi, setAllProdi] = useState<ProdiOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchReference = async () => {
      try {
        const [fakRes, semRes, prodiRes] = await Promise.all([
          dashboardClient.get<ApiResponse<ReferenceItem[]>>(ENDPOINTS.REFERENCE.FAKULTAS),
          dashboardClient.get<ApiResponse<SemesterItem[]>>(ENDPOINTS.REFERENCE.SEMESTER),
          dashboardClient.get<ApiResponse<(ReferenceItem & { id_fakultas: string })[]>>(ENDPOINTS.REFERENCE.PRODI),
        ]);

        if (cancelled) return;

        // Transform fakultas: [{id, nama}] → [{key, label}]
        if (fakRes.data.success && fakRes.data.data) {
          const fakOptions: FilterOption[] = fakRes.data.data.map((item) => ({
            key: item.id,
            label: item.nama,
          }));
          setFakultas(fakOptions);
        }

        // Transform semester: [{id_smt, label, tahun, aktif}] → [{key, label}]
        if (semRes.data.success && semRes.data.data) {
          const semOptions: FilterOption[] = semRes.data.data.map((item) => ({
            key: item.id_smt,
            label: item.label,
          }));
          setSemester(semOptions);

          // Extract active semester IDs for default selection
          const active = semRes.data.data
            .filter((item) => item.aktif)
            .map((item) => item.id_smt);
          setActiveSemesters(active);
        }

        // Transform prodi: [{id, nama, id_fakultas}] → [{key, label, id_fakultas}]
        if (prodiRes.data.success && prodiRes.data.data) {
          const prodiOptions: ProdiOption[] = prodiRes.data.data.map((item) => ({
            key: item.id,
            label: item.nama,
            id_fakultas: item.id_fakultas,
          }));
          setAllProdi(prodiOptions);
        }
      } catch {
        // Silently fail — filters will be empty, page still works
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReference();

    return () => {
      cancelled = true;
    };
  }, []);

  const getProdiByFakultas = (fakultasId: string): FilterOption[] => {
    if (!fakultasId) return [];
    return allProdi
      .filter((p) => p.id_fakultas === fakultasId)
      .map(({ key, label }) => ({ key, label }));
  };

  return { fakultas, semester, activeSemesters, allProdi, getProdiByFakultas, loading };
}

export default useDashboardReference;
