/**
 * Overview Data Service — total Universitas Lampung (universal, NOT scoped).
 *
 * Khusus untuk beranda Data Unila — pintu masuk navigasi. Endpoint backend
 * `/data/overview/totals` di-LUAR `scope` middleware → selalu return totals
 * skala universitas, terlepas dari peran user yg sedang aktif.
 */

import { dashboardClient } from "@/lib/api/dashboardClient";

export interface OverviewTotals {
  mahasiswa: { total: number; aktif: number };
  dosen: { total: number; aktif: number };
  tendik: { total: number };
  kerjasama: { total: number; aktif: number };
  tracer: { total: number };
  tridarma: {
    total: number;
    pengajaran: number;
    penelitian: number;
    pengabdian: number;
    publikasi: number;
  };
  prodi: { total: number };
  keuangan: { total: number };
}

export default {
  async getTotals(): Promise<OverviewTotals> {
    const res = await dashboardClient.get("/data/overview/totals");
    return res.data.data;
  },
};
