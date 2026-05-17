/**
 * Formatter Rupiah konsisten untuk seluruh aplikasi.
 * Decimal pakai koma (id-ID locale), ribuan pakai titik.
 * Compact: T (Triliun) / M (Miliar) / Jt (Juta) / Rb (Ribu).
 *
 * Threshold: >=1 dari unit lebih besar baru di-compact. Di bawah 1 Jt tampil ribu/full.
 * Negatif → prefix "-", tampil sesuai unit.
 *
 * Pakai dari mana saja:
 *   import { fmtRupiah } from "@/lib/utils/formatRupiah";
 *   fmtRupiah(1945675000)         // "Rp 1,95 M"
 *   fmtRupiah(830265000)          // "Rp 830,27 Jt"
 *   fmtRupiah(3809168.871)        // "Rp 3,81 Jt"
 *   fmtRupiah(25000)              // "Rp 25 Rb"
 *   fmtRupiah(-1500000)           // "-Rp 1,50 Jt"
 *   fmtRupiah(0)                  // "Rp 0"
 */
export function fmtRupiah(n: number | string | null | undefined): string {
  const raw = typeof n === "number" ? n : parseFloat(String(n ?? 0));
  if (Number.isNaN(raw) || raw === 0) return "Rp 0";

  const abs = Math.abs(raw);
  const sign = raw < 0 ? "-" : "";
  const fmt2 = (v: number) =>
    v.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt0 = (v: number) =>
    v.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (abs >= 1e12) return `${sign}Rp ${fmt2(abs / 1e12)} T`;
  if (abs >= 1e9) return `${sign}Rp ${fmt2(abs / 1e9)} M`;
  if (abs >= 1e6) return `${sign}Rp ${fmt2(abs / 1e6)} Jt`;
  if (abs >= 1e3) return `${sign}Rp ${fmt0(abs / 1e3)} Rb`;
  return `${sign}Rp ${fmt0(abs)}`;
}

/**
 * Versi full tanpa singkatan (untuk tooltip/export):
 * fmtRupiahFull(1945675000) → "Rp 1.945.675.000"
 */
export function fmtRupiahFull(n: number | string | null | undefined): string {
  const raw = typeof n === "number" ? n : parseFloat(String(n ?? 0));
  if (Number.isNaN(raw)) return "Rp 0";
  const sign = raw < 0 ? "-" : "";
  return `${sign}Rp ${Math.abs(Math.round(raw)).toLocaleString("id-ID")}`;
}

/**
 * Coerce string/number ke number, NaN → 0. Aman untuk decimal string ("3809168.87").
 */
export function num(v?: string | number | null): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isNaN(n) ? 0 : n;
}
