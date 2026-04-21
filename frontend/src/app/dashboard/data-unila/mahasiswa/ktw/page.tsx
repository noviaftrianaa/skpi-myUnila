"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Card, CardBody, Spinner, Button } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiUsers, FiClock, FiAward, FiTrendingUp, FiDownload } from "react-icons/fi";
import { exportToExcel } from "@/lib/utils/exportExcel";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { dataUnilaMenuConfig } from "../../config/menuConfig";
import {
  ktwDataService,
  type KtwMahasiswaFlatRow,
  type KtwRekapFakultasRow,
  type KtwRekapProdiRow,
  type JenjangKode,
} from "@/lib/services/data-unila/ktwDataService";

const APP_KEY = "data-unila";

const JENJANG_OPTIONS: JenjangKode[] = ["D3", "D4", "S1", "S2", "S3"];
const MASA_MAP: Record<JenjangKode, number> = { D3: 3, D4: 4, S1: 4, S2: 2, S3: 3 };

function defaultCohort(j: JenjangKode): number {
  return new Date().getFullYear() - MASA_MAP[j] - 1;
}

interface StatCardProps { icon: React.ReactNode; label: string; value: string | number; color: string; raw?: boolean }
function StatCard({ icon, label, value, color, raw }: StatCardProps) {
  return (
    <Card className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${color}`}>
      <CardBody className="p-4 relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">{icon}</div>
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold text-white">
              {raw ? value : (typeof value === "number" ? value.toLocaleString("id-ID") : parseInt(String(value) || "0").toLocaleString("id-ID"))}
            </h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function KtwRawDataPage() {
  useRequireAuth();

  const [jenjang, setJenjang] = useState<JenjangKode>("S1");
  const [cohort, setCohort] = useState<number>(defaultCohort("S1"));
  const [cutoff, setCutoff] = useState<string>("");
  const [idFakultas, setIdFakultas] = useState<string>("");
  const [idProdi, setIdProdi] = useState<string>("");
  const [statusKeluar, setStatusKeluar] = useState<string>("");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<KtwMahasiswaFlatRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  const [fakultasList, setFakultasList] = useState<KtwRekapFakultasRow[]>([]);
  const [prodiList, setProdiList] = useState<KtwRekapProdiRow[]>([]);
  const [presets, setPresets] = useState<Array<{ group: string; label: string; value: string }>>([]);
  const [exporting, setExporting] = useState(false);

  const cohortOptions = useMemo(() => {
    const max = new Date().getFullYear() - MASA_MAP[jenjang];
    return Array.from({ length: 10 }, (_, i) => max - i);
  }, [jenjang]);

  // Fetch rekap — ambil fakultas & prodi list untuk dropdown + stats agregat
  const fetchRekap = useCallback(async () => {
    try {
      const [fak, prd] = await Promise.all([
        ktwDataService.getFakultasRekap({ cohort, jenjang, cutoff: cutoff || undefined }),
        ktwDataService.getProdiRekap({
          cohort, jenjang,
          cutoff: cutoff || undefined,
          id_fakultas: idFakultas || undefined,
        }),
      ]);
      setFakultasList(fak);
      setProdiList(prd);
    } catch { /* ignore */ }
  }, [cohort, jenjang, cutoff, idFakultas]);

  // Fetch daftar mahasiswa
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const r = await ktwDataService.getMahasiswaFlat({
        cohort, jenjang,
        cutoff: cutoff || undefined,
        id_fakultas: idFakultas || undefined,
        id_prodi: idProdi || undefined,
        status_keluar: statusKeluar || undefined,
        search: search || undefined,
        page, per_page: limit,
      });
      setData(r.data);
      setTotal(r.pagination.total);
    } catch {
      toast.error("Gagal memuat daftar mahasiswa");
    } finally {
      setLoading(false);
    }
  }, [cohort, jenjang, cutoff, idFakultas, idProdi, statusKeluar, search, page, limit]);

  useEffect(() => {
    ktwDataService.getPresets().then(setPresets).catch(() => setPresets([]));
  }, []);

  useEffect(() => { fetchRekap(); }, [fetchRekap]);
  useEffect(() => { fetchList(); }, [fetchList]);

  const stats = useMemo(() => {
    const totalMaba = fakultasList.reduce((a, f) => a + f.maba, 0);
    const totalLulus = fakultasList.reduce((a, f) => a + f.sudah_lulus, 0);
    const totalKtw = fakultasList.reduce((a, f) => a + f.ktw_strict, 0);
    const pctKtw = totalMaba > 0 ? (totalKtw / totalMaba) * 100 : 0;
    return { totalMaba, totalLulus, totalKtw, pctKtw };
  }, [fakultasList]);

  const handleExportAll = async () => {
    setExporting(true);
    try {
      const r = await ktwDataService.getMahasiswaFlat({
        cohort, jenjang,
        cutoff: cutoff || undefined,
        id_fakultas: idFakultas || undefined,
        id_prodi: idProdi || undefined,
        status_keluar: statusKeluar || undefined,
        search: search || undefined,
        page: 1, per_page: 2000,
      });
      if (!r.data.length) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }
      const flat = r.data.map(d => ({
        ...d,
        ipk: d.ipk ?? "",
        masa_mukim_tahun: d.masa_mukim_tahun ?? "",
        ktw: d.is_ktw_strict ? "Ya" : "Tidak",
        ktw_tolerant: d.is_ktw_tolerant ? "Ya" : "Tidak",
      }));
      exportToExcel(
        flat as unknown as Record<string, unknown>[],
        `ktw-mahasiswa-${jenjang}-${cohort}${idFakultas ? "-" + idFakultas.slice(0, 6) : ""}`,
        "KTW Mahasiswa",
        {
          nim: "NIM",
          nama: "Nama",
          jenis_kelamin: "JK",
          angkatan: "Angkatan",
          nm_prodi: "Program Studi",
          kode_dikti: "Kode DIKTI",
          nm_fakultas: "Fakultas",
          nm_jenjang: "Jenjang",
          nm_jalur_daftar: "Jalur Daftar",
          tgl_masuk_sp: "Tgl Masuk",
          tgl_keluar: "Tgl Keluar",
          ipk: "IPK",
          masa_mukim_tahun: "Masa Mukim (th)",
          status_keluar: "Status",
          ktw: "KTW Strict",
          ktw_tolerant: "KTW Tolerant",
        }
      );
      toast.success(`Berhasil ekspor ${flat.length} mahasiswa`);
    } catch {
      toast.error("Gagal ekspor data");
    } finally {
      setExporting(false);
    }
  };

  const handleExportRekapFakultas = () => {
    if (!fakultasList.length) { toast.error("Tidak ada data rekap"); return; }
    exportToExcel(
      fakultasList as unknown as Record<string, unknown>[],
      `ktw-rekap-fakultas-${jenjang}-${cohort}`,
      "Rekap KTW Fakultas",
      {
        nm_fakultas: "Fakultas",
        maba: "Maba",
        sudah_lulus: "Sudah Lulus",
        ktw_strict: "KTW (Strict)",
        ktw_tolerant: "KTW (Tolerant)",
        pct_ktw_strict: "% KTW Strict",
        pct_ktw_tolerant: "% KTW Tolerant",
        pct_survival: "% Survival",
      }
    );
  };

  const handleExportRekapProdi = () => {
    if (!prodiList.length) { toast.error("Tidak ada data prodi"); return; }
    const enriched = prodiList.map(p => ({
      ...p,
      nm_fakultas: fakultasList.find(f => f.id_fakultas === p.id_fakultas)?.nm_fakultas ?? "-",
    }));
    exportToExcel(
      enriched as unknown as Record<string, unknown>[],
      `ktw-rekap-prodi-${jenjang}-${cohort}${idFakultas ? "-filtered" : ""}`,
      "Rekap KTW Prodi",
      {
        nm_prodi: "Program Studi",
        kode_dikti: "Kode DIKTI",
        nm_fakultas: "Fakultas",
        maba: "Maba",
        sudah_lulus: "Sudah Lulus",
        ktw_strict: "KTW (Strict)",
        ktw_tolerant: "KTW (Tolerant)",
        pct_ktw_strict: "% KTW Strict",
        pct_ktw_tolerant: "% KTW Tolerant",
        pct_survival: "% Survival",
      }
    );
  };

  const columns: Column<KtwMahasiswaFlatRow>[] = [
    {
      key: "nm_pd", label: "NAMA", sortable: false, render: (i) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{i.nama}</div>
          <div className="text-xs text-gray-500 mt-0.5 font-mono">{i.nim} · {i.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</div>
        </div>
      ),
    },
    {
      key: "nm_prodi", label: "PRODI", render: (i) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-gray-200">{i.nm_prodi}</div>
          <div className="text-xs text-gray-500">{i.nm_fakultas} · {i.nm_jenjang}</div>
        </div>
      ),
    },
    { key: "nm_jalur_daftar", label: "JALUR", width: "140px", render: (i) => <span className="text-xs text-gray-600">{i.nm_jalur_daftar}</span> },
    { key: "tgl_masuk_sp", label: "TGL MASUK", width: "110px", render: (i) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{i.tgl_masuk_sp}</span> },
    { key: "tgl_keluar", label: "TGL KELUAR", width: "110px", render: (i) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{i.tgl_keluar ?? "-"}</span> },
    {
      key: "ipk", label: "IPK", width: "70px", align: "right" as const, render: (i) => (
        <span className={`font-mono text-sm font-bold ${
          Number(i.ipk ?? 0) >= 3.5 ? "text-green-600" :
          Number(i.ipk ?? 0) >= 3.0 ? "text-blue-600" :
          "text-gray-500"
        }`}>{i.ipk != null ? Number(i.ipk).toFixed(2) : "-"}</span>
      ),
    },
    {
      key: "masa_mukim_tahun", label: "MASA (th)", width: "80px", align: "right" as const, render: (i) => (
        <span className="font-mono text-xs text-gray-700">{i.masa_mukim_tahun != null ? i.masa_mukim_tahun.toFixed(2) : "-"}</span>
      ),
    },
    {
      key: "status_keluar", label: "STATUS", width: "120px", render: (i) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          i.status_keluar === "Lulus" ? "bg-blue-100 text-blue-800" :
          i.status_keluar === "Aktif" ? "bg-emerald-100 text-emerald-800" :
          "bg-slate-100 text-slate-700"
        }`}>{i.status_keluar}</span>
      ),
    },
    {
      key: "is_ktw_strict", label: "KTW?", width: "70px", align: "center" as const, render: (i) => (
        i.is_ktw_strict
          ? <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">✓ TW</span>
          : <span className="text-slate-300">−</span>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Data KTW"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Data KTW — Kelulusan Tepat Waktu</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Raw data per angkatan dengan field pendukung KTW: jalur, IPK, tgl masuk/keluar, masa mukim, status, flag KTW. Download rekap + daftar mahasiswa sebagai Excel.
          </p>
        </div>

        {/* Filter — pure tailwind */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Jenjang</label>
              <select
                value={jenjang}
                onChange={e => { const j = e.target.value as JenjangKode; setJenjang(j); setCohort(defaultCohort(j)); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Angkatan</label>
              <select
                value={cohort}
                onChange={e => { setCohort(Number(e.target.value)); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                {cohortOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Fakultas</label>
              <select
                value={idFakultas}
                onChange={e => { setIdFakultas(e.target.value); setIdProdi(""); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Semua Fakultas</option>
                {fakultasList.filter(f => f.id_fakultas).map(f => (
                  <option key={f.id_fakultas!} value={f.id_fakultas!}>{f.nm_fakultas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Prodi</label>
              <select
                value={idProdi}
                onChange={e => { setIdProdi(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Semua Prodi</option>
                {prodiList.filter(p => p.id_prodi).map(p => (
                  <option key={p.id_prodi!} value={p.id_prodi!}>{p.nm_prodi}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Status</label>
              <select
                value={statusKeluar}
                onChange={e => { setStatusKeluar(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="1">Lulus</option>
                <option value="2">Mutasi</option>
                <option value="3">Dikeluarkan</option>
                <option value="4">Mengundurkan Diri</option>
                <option value="5">Putus Studi</option>
                <option value="6">Wafat</option>
                <option value="7">Hilang</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">Cutoff</label>
              <div className="flex gap-1">
                <input
                  type="date"
                  value={cutoff}
                  onChange={e => { setCutoff(e.target.value); setPage(1); }}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <select
                  value=""
                  onChange={e => { if (e.target.value) { setCutoff(e.target.value); setPage(1); } }}
                  className="w-14 rounded-lg border border-slate-300 bg-white px-1 py-2 text-[10px] text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  title="Preset kalender akademik"
                >
                  <option value="">⚡</option>
                  {Array.from(new Set(presets.map(p => p.group))).map(group => (
                    <optgroup key={group} label={group}>
                      {presets.filter(p => p.group === group).map(p => (
                        <option key={p.value + p.label} value={p.value}>{p.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards agregat */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={<FiUsers className="w-6 h-6" />} label="Maba Angkatan" value={stats.totalMaba} color="from-blue-500 to-cyan-600" />
          <StatCard icon={<FiAward className="w-6 h-6" />} label="Sudah Lulus" value={stats.totalLulus} color="from-violet-500 to-purple-600" />
          <StatCard icon={<FiClock className="w-6 h-6" />} label="KTW (Strict)" value={stats.totalKtw} color="from-emerald-500 to-teal-600" />
          <StatCard icon={<FiTrendingUp className="w-6 h-6" />} label="% KTW" value={`${stats.pctKtw.toFixed(2)}%`} color="from-amber-500 to-orange-500" raw />
        </div>

        {/* Rekap download quick buttons */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Rekap KTW</h2>
              <p className="text-xs text-slate-500">Download ringkasan per Fakultas ({fakultasList.length}) atau per Prodi ({prodiList.length}) — format Excel</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-4 h-4" />} onPress={handleExportRekapFakultas}>
                Rekap Fakultas
              </Button>
              <Button size="sm" variant="flat" color="secondary" startContent={<FiDownload className="w-4 h-4" />} onPress={handleExportRekapProdi}>
                Rekap Prodi
              </Button>
            </div>
          </div>
        </div>

        {/* Tabel mahasiswa */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DataTable
                columns={columns}
                data={data}
                loading={loading}
                serverSide
                totalRecords={total}
                onPageChange={setPage}
                onRowsPerPageChange={n => { setLimit(n); setPage(1); }}
                onSearchChange={q => { setSearch(q); setPage(1); }}
                searchPlaceholder="Cari NIM atau nama..."
                defaultRowsPerPage={20}
                filterSlot={
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      size="sm"
                      variant="flat"
                      color="success"
                      startContent={exporting ? <Spinner size="sm" /> : <FiDownload className="w-4 h-4" />}
                      onPress={handleExportAll}
                      isDisabled={exporting || total === 0}
                      className="h-10 font-medium ml-auto"
                    >
                      Export Daftar Mahasiswa (Excel)
                    </Button>
                  </div>
                }
              />
            </motion.div>
          </CardBody>
        </Card>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          <p><strong>Sumber:</strong> pdut realtime (pdrd.reg_pd + pdrd.peserta_didik + pdrd.sms). Single source of truth, konsisten dgn infografis publik + dashboard pimpinan.</p>
          <p className="mt-1"><strong>Formula KTW Strict:</strong> <code className="rounded bg-white px-1 dark:bg-slate-800">DATEDIFF(DAY, tgl_masuk_sp, tgl_keluar) / 365.25 ≤ masa_normatif</code> (S1=4 th, D3=3 th, S2=2 th, S3=3 th).</p>
          <p className="mt-1">Hanya Peserta Didik Baru (id_jns_daftar=1) angkatan Gasal (MONTH(tgl_masuk_sp) ≥ 7). Transfer / pindahan / alih jenjang tidak dihitung.</p>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
