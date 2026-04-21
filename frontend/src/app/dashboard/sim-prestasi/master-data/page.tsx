"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiBookmark, FiRefreshCw, FiInfo } from "react-icons/fi";
import { simPrestasiMenuConfig } from "../config/menuConfig";
import { refService } from "@/lib/services/sim-prestasi/prestasiService";
import type { RefBentuk, RefJenisRekognisi, RefKategori, RefKelompok, RefLevel, RefPeringkat } from "@/lib/services/sim-prestasi/types";

const APP_KEY = "si-prestasi";

type TabId = "level" | "kategori" | "peringkat" | "kelompok" | "bentuk" | "jenis_rekognisi";

const TABS: Array<{ id: TabId; label: string; desc: string }> = [
  { id: "level", label: "Level Prestasi", desc: "Internasional, Nasional, Wilayah, PT" },
  { id: "kategori", label: "Kategori", desc: "Sains, Seni, Olahraga, Keagamaan, Lain" },
  { id: "peringkat", label: "Peringkat", desc: "Juara 1/2/3 Finalis Harapan Partisipan" },
  { id: "kelompok", label: "Kelompok", desc: "Individu / Grup" },
  { id: "bentuk", label: "Bentuk", desc: "Daring / Luring" },
  { id: "jenis_rekognisi", label: "Jenis Rekognisi", desc: "14 kategori rekognisi dosen/prodi" },
];

export default function MasterDataPage() {
  const [tab, setTab] = useState<TabId>("level");
  const [loading, setLoading] = useState(true);

  const [level, setLevel] = useState<RefLevel[]>([]);
  const [kategori, setKategori] = useState<RefKategori[]>([]);
  const [peringkat, setPeringkat] = useState<RefPeringkat[]>([]);
  const [kelompok, setKelompok] = useState<RefKelompok[]>([]);
  const [bentuk, setBentuk] = useState<RefBentuk[]>([]);
  const [jenisRekognisi, setJenisRekognisi] = useState<RefJenisRekognisi[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [l, k, p, kl, b, jr] = await Promise.all([
        refService.levels(), refService.kategori(), refService.peringkat(),
        refService.kelompok(), refService.bentuk(), refService.jenisRekognisi(),
      ]);
      setLevel(l); setKategori(k); setPeringkat(p); setKelompok(kl); setBentuk(b); setJenisRekognisi(jr);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    level: level.length, kategori: kategori.length, peringkat: peringkat.length,
    kelompok: kelompok.length, bentuk: bentuk.length, jenis_rekognisi: jenisRekognisi.length,
  }), [level, kategori, peringkat, kelompok, bentuk, jenisRekognisi]);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI Prestasi"
      appIcon={<FiBookmark className="h-6 w-6" />}
      appKey={APP_KEY}
      fallbackMenus={simPrestasiMenuConfig}
    >
      <div className="space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
              <FiBookmark className="h-7 w-7 text-amber-500" /> Master Data Referensi
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Referensi SIMKATMAWA yang dipakai di form prestasi mandiri, sertifikasi, dan rekognisi.
            </p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <FiRefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
          <div className="flex items-start gap-2">
            <FiInfo className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p><strong>Read-only.</strong> Referensi di-seed dari dokumentasi SIMKATMAWA (file <code>si_prestasi_v1.0_seed.sql</code>).</p>
              <p className="mt-1 text-xs opacity-90">Update referensi dilakukan via migration SQL — tidak boleh diubah sembarangan agar mapping ke SIMKATMAWA konsisten.</p>
            </div>
          </div>
        </div>

        {/* Tabs — tailwind pill style, responsive */}
        <div className="flex flex-wrap gap-2">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
              }`}
            >
              {t.label} <span className={`ml-1 rounded px-1.5 py-0.5 text-[10px] ${tab === t.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700"}`}>{counts[t.id]}</span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {TABS.find(t => t.id === tab)?.label}
            </h3>
            <p className="text-xs text-slate-500">{TABS.find(t => t.id === tab)?.desc}</p>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Memuat…</div>
            ) : (
              <RefTable tab={tab} level={level} kategori={kategori} peringkat={peringkat} kelompok={kelompok} bentuk={bentuk} jenis={jenisRekognisi} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

function RefTable({
  tab, level, kategori, peringkat, kelompok, bentuk, jenis,
}: {
  tab: TabId;
  level: RefLevel[]; kategori: RefKategori[]; peringkat: RefPeringkat[];
  kelompok: RefKelompok[]; bentuk: RefBentuk[]; jenis: RefJenisRekognisi[];
}) {
  const Row = ({ kode, nama, urutan, badge }: { kode: string; nama: string; urutan: number; badge?: React.ReactNode }) => (
    <tr className="hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
      <td className="px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-300">{kode}</td>
      <td className="px-4 py-2.5 text-sm text-slate-800 dark:text-slate-100">{nama}</td>
      <td className="px-4 py-2.5 text-right text-xs text-slate-500">{urutan}</td>
      <td className="px-4 py-2.5 text-right">{badge}</td>
    </tr>
  );

  const Head = () => (
    <thead className="bg-slate-50 dark:bg-slate-900/50">
      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
        <th className="px-4 py-3">Kode SIMKATMAWA</th>
        <th className="px-4 py-3">Nama</th>
        <th className="px-4 py-3 text-right">Urutan</th>
        <th className="px-4 py-3 text-right">Status</th>
      </tr>
    </thead>
  );

  const Active = <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">Active</span>;
  const Inactive = <span className="inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Inactive</span>;

  switch (tab) {
    case "level":
      return (
        <table className="w-full">
          <Head />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {level.map(l => <Row key={l.id_level_prestasi} kode={l.kode_simkatmawa} nama={l.nm_level} urutan={l.urutan} badge={l.a_active ? Active : Inactive} />)}
          </tbody>
        </table>
      );
    case "kategori":
      return (
        <table className="w-full">
          <Head />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {kategori.map(k => <Row key={k.id_kategori_prestasi} kode={k.kode_simkatmawa} nama={k.nm_kategori} urutan={k.urutan} />)}
          </tbody>
        </table>
      );
    case "peringkat":
      return (
        <table className="w-full">
          <Head />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {peringkat.map(p => <Row key={p.id_peringkat} kode={p.kode_simkatmawa} nama={p.nm_peringkat} urutan={p.urutan} />)}
          </tbody>
        </table>
      );
    case "kelompok":
      return (
        <table className="w-full">
          <Head />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {kelompok.map(k => <Row key={k.id_kelompok_prestasi} kode={k.kode_simkatmawa} nama={k.nm_kelompok} urutan={k.urutan} />)}
          </tbody>
        </table>
      );
    case "bentuk":
      return (
        <table className="w-full">
          <Head />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {bentuk.map(b => <Row key={b.id_bentuk_pelaksanaan} kode={b.kode_simkatmawa} nama={b.nm_bentuk} urutan={b.urutan} />)}
          </tbody>
        </table>
      );
    case "jenis_rekognisi":
      return (
        <table className="w-full">
          <Head />
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {jenis.map(j => <Row key={j.id_jenis_rekognisi} kode={j.kode_simkatmawa} nama={j.nm_jenis} urutan={j.urutan} badge={j.a_active ? Active : Inactive} />)}
          </tbody>
        </table>
      );
  }
}
