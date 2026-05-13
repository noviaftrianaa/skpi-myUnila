'use client';

import React from 'react';
import { Chip } from '@heroui/react';

/** Consistent status badge across all SIMBAK pages */

const statusConfig: Record<string, { label: string; color: 'default' | 'primary' | 'warning' | 'secondary' | 'success' | 'danger' }> = {
  draft: { label: 'Draft', color: 'default' },
  diajukan: { label: 'Diajukan', color: 'primary' },
  perlu_perbaikan: { label: 'Perlu Perbaikan', color: 'warning' },
  diverifikasi: { label: 'Diverifikasi', color: 'secondary' },
  diperiksa_fakultas: { label: 'Diperiksa Fakultas', color: 'secondary' },
  menunggu_persetujuan: { label: 'Menunggu Persetujuan', color: 'warning' },
  disetujui: { label: 'Disetujui', color: 'success' },
  ditolak: { label: 'Ditolak', color: 'danger' },
  terbit: { label: 'Terbit', color: 'success' },
  // Batch statuses
  kandidat_ditarik: { label: 'Kandidat Ditarik', color: 'primary' },
  verifikasi_fakultas: { label: 'Verifikasi Fakultas', color: 'warning' },
  sk_dekan_terbit: { label: 'SK Dekan Terbit', color: 'secondary' },
  finalisasi: { label: 'Finalisasi', color: 'primary' },
  selesai: { label: 'Selesai', color: 'success' },
  // Kandidat statuses
  masuk: { label: 'Masuk', color: 'default' },
  dikonfirmasi: { label: 'Dikonfirmasi', color: 'success' },
  dikeluarkan: { label: 'Dikeluarkan', color: 'danger' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const cfg = statusConfig[status] || { label: status, color: 'default' as const };
  return (
    <Chip size={size} variant="flat" color={cfg.color}>
      {cfg.label}
    </Chip>
  );
}

/** Helper to get label from status string */
export function getStatusLabel(status: string): string {
  return statusConfig[status]?.label || status;
}
