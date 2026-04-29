"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { manajemenKontenMenuConfig } from "../config/menuConfig";
import manajemenKontenService, {
  Konten,
  KontenStatus,
  KontenTipe,
  Kategori,
} from "@/lib/services/manajemen-konten/manajemenKontenService";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFileText, FiBell, FiBookOpen } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const APP_KEY = "manajemen-konten";

const TIPE_LABELS: Record<KontenTipe, { label: string; icon: React.ReactNode; color: string }> = {
  pengumuman: { label: "Pengumuman", icon: <FiBell className="w-3.5 h-3.5" />, color: "bg-amber-100 text-amber-800" },
  berita: { label: "Berita", icon: <FiFileText className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-800" },
  artikel: { label: "Artikel", icon: <FiBookOpen className="w-3.5 h-3.5" />, color: "bg-emerald-100 text-emerald-800" },
};

const STATUS_LABELS: Record<KontenStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  published: { label: "Published", color: "bg-emerald-100 text-emerald-700" },
  archived: { label: "Archived", color: "bg-rose-100 text-rose-700" },
};

export default function KontenListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-gray-500">Memuat...</div>}>
      <KontenListContent />
    </Suspense>
  );
}

function KontenListContent() {
  useRequireAuth();
  const sp = useSearchParams();
  const router = useRouter();
  const initialTipe = (sp.get("tipe") as KontenTipe) || "";
  const initialStatus = (sp.get("status") as KontenStatus) || "";

  const [data, setData] = useState<Konten[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState<KontenTipe | "">(initialTipe);
  const [statusFilter, setStatusFilter] = useState<KontenStatus | "">(initialStatus);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [kategoriFilter, setKategoriFilter] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await manajemenKontenService.listKonten({
        page,
        limit,
        search: search || undefined,
        tipe: tipeFilter || undefined,
        status: statusFilter || undefined,
        id_kategori: kategoriFilter || undefined,
      });
      if (r.success) {
        setData(r.data);
        setTotal(r.meta.total);
      }
    } catch (err: any) {
      toast.error("Gagal memuat data: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, tipeFilter, statusFilter, kategoriFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    manajemenKontenService.listKategori().then((r) => r.success && setKategoriList(r.data)).catch(() => {});
  }, []);

  const pageTitle = useMemo(() => {
    if (tipeFilter) return `Kelola ${TIPE_LABELS[tipeFilter].label}`;
    return "Semua Konten";
  }, [tipeFilter]);

  const handleDelete = async (id: string, judul: string) => {
    if (!window.confirm(`Hapus konten "${judul}"?`)) return;
    try {
      await manajemenKontenService.deleteKonten(id);
      toast.success("Konten dihapus");
      fetchData();
    } catch (err: any) {
      toast.error("Gagal hapus: " + (err?.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (id: string, newStatus: KontenStatus) => {
    try {
      await manajemenKontenService.updateStatus(id, newStatus);
      toast.success(`Status diubah ke ${newStatus}`);
      fetchData();
    } catch (err: any) {
      toast.error("Gagal: " + (err?.response?.data?.message || err.message));
    }
  };

  const columns: Column<Konten>[] = [
    {
      key: "tipe",
      label: "Tipe",
      align: "center",
      render: (it) => {
        const cfg = TIPE_LABELS[it.tipe] || TIPE_LABELS.pengumuman;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
        );
      },
    },
    {
      key: "judul",
      label: "Judul",
      render: (it) => (
        <div className="max-w-md">
          <Link
            href={`/dashboard/manajemen-konten/konten/${it.id_pengumuman}`}
            className="font-medium text-gray-900 hover:text-blue-600 truncate block"
          >
            {it.judul}
          </Link>
          {it.ringkasan && (
            <p className="text-xs text-gray-500 truncate">{it.ringkasan}</p>
          )}
        </div>
      ),
    },
    {
      key: "nama_kategori",
      label: "Kategori",
      render: (it) => (
        <span className="text-xs text-gray-700">
          {it.nama_kategori || <span className="text-gray-400 italic">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (it) => {
        const cfg = STATUS_LABELS[it.status] || STATUS_LABELS.draft;
        return (
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "tgl_terbit",
      label: "Tgl Terbit",
      align: "center",
      render: (it) => (
        <span className="text-xs text-gray-600 font-mono">
          {it.tgl_terbit ? new Date(it.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
        </span>
      ),
    },
    {
      key: "view_count",
      label: "Views",
      align: "center",
      render: (it) => <span className="text-xs text-gray-500 font-mono">{it.view_count.toLocaleString("id-ID")}</span>,
    },
    {
      key: "id_pengumuman",
      label: "Aksi",
      align: "center",
      render: (it) => (
        <div className="flex items-center justify-center gap-1">
          <Link
            href={`/dashboard/manajemen-konten/konten/${it.id_pengumuman}`}
            className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <FiEdit2 className="w-4 h-4" />
          </Link>
          {it.status === "draft" && (
            <button
              onClick={() => handleStatusChange(it.id_pengumuman, "published")}
              className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
              title="Publish"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDelete(it.id_pengumuman, it.judul)}
            className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
            title="Hapus"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Konten"
      appIcon={<FiFileText className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenKontenMenuConfig}
      pageTitle={pageTitle}
    >
      <Toaster position="top-right" />

      <div className="space-y-5">
        {/* Header — breadcrumb + title + action */}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/dashboard/manajemen-konten" className="hover:text-blue-600">
              Manajemen Konten
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{pageTitle}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-gray-800">{total.toLocaleString("id-ID")}</span> konten total · menampilkan halaman{" "}
                <span className="font-semibold text-gray-800">{page}</span>
              </p>
            </div>
            <Link
              href={`/dashboard/manajemen-konten/konten/baru${tipeFilter ? `?tipe=${tipeFilter}` : ""}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <FiPlus className="w-4 h-4" /> Tulis Konten
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe</label>
              <select
                value={tipeFilter}
                onChange={(e) => {
                  setTipeFilter(e.target.value as KontenTipe | "");
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua Tipe</option>
                <option value="pengumuman">Pengumuman</option>
                <option value="berita">Berita</option>
                <option value="artikel">Artikel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as KontenStatus | "");
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
              <select
                value={kategoriFilter}
                onChange={(e) => {
                  setKategoriFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Semua Kategori</option>
                {kategoriList.map((k) => (
                  <option key={k.id_kategori} value={k.id_kategori}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Pencarian</label>
              <input
                type="text"
                placeholder="Cari judul..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* DataTable */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <DataTable<Konten>
            data={data}
            columns={columns}
            loading={loading}
            serverSide
            totalRecords={total}
            currentPage={page}
            onPageChange={setPage}
            onRowsPerPageChange={(r) => {
              setLimit(r);
              setPage(1);
            }}
            defaultRowsPerPage={limit}
          />
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
