"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiAward, FiStar, FiClock, FiArrowRight, FiInbox, FiSend, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { MdEmojiEvents } from "react-icons/md";
import { simPrestasiMenuConfig } from "./config/menuConfig";
import { prestasiMandiriService, sertifikasiService, rekognisiService } from "@/lib/services/si-prestasi/prestasiService";

const APP_KEY = "si-prestasi";

type Totals = { total: number; byStatus: Record<string, number> };

function useCounts() {
  const [prestasi, setPrestasi] = useState<Totals>({ total: 0, byStatus: {} });
  const [sertifikasi, setSertifikasi] = useState<Totals>({ total: 0, byStatus: {} });
  const [rekognisi, setRekognisi] = useState<Totals>({ total: 0, byStatus: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [p, s, r] = await Promise.all([
          prestasiMandiriService.list({ limit: 100 }),
          sertifikasiService.list({ limit: 100 }),
          rekognisiService.list({ limit: 100 }),
        ]);
        const agg = (items: Array<{ status_workflow: string }>) => {
          const by: Record<string, number> = {};
          for (const it of items) by[it.status_workflow] = (by[it.status_workflow] ?? 0) + 1;
          return by;
        };
        setPrestasi({ total: p.pagination.total, byStatus: agg(p.data) });
        setSertifikasi({ total: s.pagination.total, byStatus: agg(s.data) });
        setRekognisi({ total: r.pagination.total, byStatus: agg(r.data) });
      } catch { /* tetap kosong kalau belum auth */ }
      finally { setLoading(false); }
    })();
  }, []);

  return { prestasi, sertifikasi, rekognisi, loading };
}

function StatTile({
  title,
  subtitle,
  total,
  icon,
  gradient,
  href,
  breakdown,
}: {
  title: string;
  subtitle: string;
  total: number;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  breakdown: Record<string, number>;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className={`rounded-t-2xl bg-gradient-to-br ${gradient} px-5 py-4 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">{title}</p>
            <h3 className="mt-1 text-3xl font-bold">{total.toLocaleString("id-ID")}</h3>
            <p className="mt-1 text-xs opacity-90">{subtitle}</p>
          </div>
          <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">{icon}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 px-4 py-3 text-center text-xs">
        {[
          { k: "draft", label: "Draft", cls: "text-slate-600" },
          { k: "review", label: "Review", cls: "text-amber-600" },
          { k: "ready", label: "Ready", cls: "text-blue-600" },
          { k: "sent", label: "Sent", cls: "text-emerald-600" },
        ].map(s => (
          <div key={s.k}>
            <div className={`font-semibold ${s.cls}`}>{breakdown[s.k] ?? 0}</div>
            <div className="text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 border-t border-slate-100 px-4 py-2 text-xs font-medium text-slate-500 group-hover:text-slate-700 dark:border-slate-700">
        Buka <FiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function SimPrestasiDashboardPage() {
  const { prestasi, sertifikasi, rekognisi, loading } = useCounts();

  const totalAll = prestasi.total + sertifikasi.total + rekognisi.total;
  const readyCount =
    (prestasi.byStatus.ready ?? 0) + (sertifikasi.byStatus.ready ?? 0) + (rekognisi.byStatus.ready ?? 0);
  const errorCount =
    (prestasi.byStatus.error ?? 0) + (sertifikasi.byStatus.error ?? 0) + (rekognisi.byStatus.error ?? 0);
  const sentCount =
    (prestasi.byStatus.sent ?? 0) + (sertifikasi.byStatus.sent ?? 0) + (rekognisi.byStatus.sent ?? 0);

  const quickActions = useMemo(
    () => [
      { href: "/dashboard/si-prestasi/prestasi-mandiri?new=1", label: "+ Prestasi Mandiri", color: "bg-amber-500 hover:bg-amber-600" },
      { href: "/dashboard/si-prestasi/sertifikasi?new=1", label: "+ Sertifikasi", color: "bg-blue-500 hover:bg-blue-600" },
      { href: "/dashboard/si-prestasi/rekognisi?new=1", label: "+ Rekognisi", color: "bg-violet-500 hover:bg-violet-600" },
    ],
    []
  );

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<MdEmojiEvents className="h-6 w-6" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
    >
      <div className="space-y-6 p-6">
        {/* Hero tanpa HeroUI — pure tailwind */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 p-6 text-white shadow-md">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10">
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <MdEmojiEvents className="h-7 w-7" /> SI Prestasi — Pelaporan SIMKATMAWA
            </h1>
            <p className="mt-2 max-w-2xl text-sm opacity-95">
              Input prestasi mahasiswa, sertifikasi kompetensi, dan rekognisi dosen — kemudian kirim ke SIMKATMAWA Kemdiktisaintek.
              Saat ini Phase 1 (entry tanpa submit); push ke SIMKATMAWA diaktifkan di Phase 2.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickActions.map(a => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg ${a.color} px-4 py-2 text-sm font-medium shadow transition-colors`}
                >
                  {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiSmall icon={<FiInbox className="h-5 w-5" />} title="Total Entri" value={loading ? "…" : totalAll.toLocaleString("id-ID")} tone="slate" />
          <KpiSmall icon={<FiCheckCircle className="h-5 w-5" />} title="Siap Kirim (ready)" value={loading ? "…" : readyCount.toLocaleString("id-ID")} tone="blue" />
          <KpiSmall icon={<FiSend className="h-5 w-5" />} title="Terkirim" value={loading ? "…" : sentCount.toLocaleString("id-ID")} tone="emerald" />
          <KpiSmall icon={<FiAlertTriangle className="h-5 w-5" />} title="Error" value={loading ? "…" : errorCount.toLocaleString("id-ID")} tone="rose" />
        </div>

        {/* 3 entry cards dengan breakdown status */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <StatTile
            title="Prestasi Mandiri"
            subtitle="Lomba/kompetisi mahasiswa"
            total={prestasi.total}
            icon={<MdEmojiEvents className="h-6 w-6" />}
            gradient="from-amber-500 to-orange-500"
            href="/dashboard/si-prestasi/prestasi-mandiri"
            breakdown={prestasi.byStatus}
          />
          <StatTile
            title="Sertifikasi"
            subtitle="Kompetensi mahasiswa"
            total={sertifikasi.total}
            icon={<FiAward className="h-6 w-6" />}
            gradient="from-blue-500 to-indigo-500"
            href="/dashboard/si-prestasi/sertifikasi"
            breakdown={sertifikasi.byStatus}
          />
          <StatTile
            title="Rekognisi"
            subtitle="Prodi/dosen dikenal"
            total={rekognisi.total}
            icon={<FiStar className="h-6 w-6" />}
            gradient="from-violet-500 to-purple-600"
            href="/dashboard/si-prestasi/rekognisi"
            breakdown={rekognisi.byStatus}
          />
        </div>

        {/* Info panel */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          <p><strong>Sumber data:</strong> PostgreSQL <code>si_prestasi</code> (realtime). Referensi SIMKATMAWA di Master Data.</p>
          <p className="mt-1"><strong>Workflow:</strong> draft → review → ready → (Phase 2: sending → sent/error) → archived.</p>
          <p className="mt-1"><strong>File bukti:</strong> Upload langsung ke storage volume Docker; URL public diexpose via /files/ untuk SIMKATMAWA.</p>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

function KpiSmall({
  icon, title, value, tone,
}: { icon: React.ReactNode; title: string; value: string; tone: "slate" | "blue" | "emerald" | "rose" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  }[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-3">
        <div className={`inline-flex items-center justify-center rounded-xl p-2.5 ${toneMap}`}>{icon}</div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
        </div>
      </div>
    </div>
  );
}
