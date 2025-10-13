/**
 * Akademik Hooks
 *
 * Custom React hooks for academic operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { akademikService } from '@/lib/services/akademik.service';
import type { KRS } from '@/lib/types';

/**
 * Hook to fetch KRS for specific semester
 */
export function useKRS(semester: string) {
  return useQuery({
    queryKey: ['akademik', 'krs', semester],
    queryFn: () => akademikService.getKRS(semester),
    enabled: !!semester,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to submit KRS
 */
export function useSubmitKRS(semester: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (krsData: KRS) => akademikService.submitKRS(semester, krsData),
    onSuccess: () => {
      // Invalidate KRS query to refetch
      queryClient.invalidateQueries({ queryKey: ['akademik', 'krs', semester] });
    },
  });
}

/**
 * Hook to fetch KHS for specific semester
 */
export function useKHS(semester: string) {
  return useQuery({
    queryKey: ['akademik', 'khs', semester],
    queryFn: () => akademikService.getKHS(semester),
    enabled: !!semester,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch all KHS
 */
export function useAllKHS() {
  return useQuery({
    queryKey: ['akademik', 'khs', 'all'],
    queryFn: () => akademikService.getAllKHS(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch Nilai for specific semester
 */
export function useNilai(semester: string) {
  return useQuery({
    queryKey: ['akademik', 'nilai', semester],
    queryFn: () => akademikService.getNilai(semester),
    enabled: !!semester,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch all Nilai
 */
export function useAllNilai() {
  return useQuery({
    queryKey: ['akademik', 'nilai', 'all'],
    queryFn: () => akademikService.getAllNilai(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch Transkrip
 */
export function useTranskrip() {
  return useQuery({
    queryKey: ['akademik', 'transkrip'],
    queryFn: () => akademikService.getTranskrip(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to fetch Jadwal for specific semester
 */
export function useJadwal(semester: string) {
  return useQuery({
    queryKey: ['akademik', 'jadwal', semester],
    queryFn: () => akademikService.getJadwal(semester),
    enabled: !!semester,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch Tugas Akhir
 */
export function useTugasAkhir() {
  return useQuery({
    queryKey: ['akademik', 'tugas-akhir'],
    queryFn: () => akademikService.getTugasAkhir(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch Tugas Akhir detail
 */
export function useTugasAkhirDetail(id: string) {
  return useQuery({
    queryKey: ['akademik', 'tugas-akhir', id],
    queryFn: () => akademikService.getTugasAkhirDetail(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch Bimbingan history
 */
export function useBimbingan(idTA: string) {
  return useQuery({
    queryKey: ['akademik', 'bimbingan', idTA],
    queryFn: () => akademikService.getBimbingan(idTA),
    enabled: !!idTA,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch Presensi for specific semester
 */
export function usePresensi(semester: string) {
  return useQuery({
    queryKey: ['akademik', 'presensi', semester],
    queryFn: () => akademikService.getPresensi(semester),
    enabled: !!semester,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch Presensi summary
 */
export function usePresensiSummary() {
  return useQuery({
    queryKey: ['akademik', 'presensi', 'summary'],
    queryFn: () => akademikService.getPresensiSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
