"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiSearch,
  FiCalendar,
  FiUser,
  FiTag,
  FiEye,
  FiX,
  FiBookOpen,
} from "react-icons/fi";
import manajemenKontenService, {
  Konten,
  Kategori,
} from "@/lib/services/manajemen-konten/manajemenKontenService";

const COLOR_DOT: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-500",
  sky: "bg-sky-500",
  gray: "bg-gray-500",
};

export default function ArtikelListPage() {
  const [items, setItems] = useState<Konten[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      manajemenKontenService.listKonten({ tipe: "artikel", status: "published", limit: 60 }),
      manajemenKontenService.listKategori("artikel", true),
    ])
      .then(([list, kat]) => {
        if (list.success) setItems(list.data || []);
        if (kat.success) setKategoriList(kat.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const q = searchQuery.toLowerCase();
      const matchQ =
        !q ||
        it.judul.toLowerCase().includes(q) ||
        (it.ringkasan || "").toLowerCase().includes(q);
      const matchK = !selectedKategori || it.id_kategori === selectedKategori;
      return matchQ && matchK;
    });
  }, [items, searchQuery, selectedKategori]);

  const featured = filtered.find((i) => i.is_featured || i.is_pinned);
  const rest = filtered.filter((i) => i !== featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/40 to-indigo-50/30">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Portal</span>
              <span className="sm:hidden">Kembali</span>
            </Link>
            <div className="flex items-center gap-2 text-gray-800">
              <FiBookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              <span className="font-bold text-sm sm:text-base">Artikel & Wawasan</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
            <FiBookOpen className="w-3.5 h-3.5" />
            Artikel & Wawasan
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 tracking-tight">
            Artikel Universitas Lampung
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Wawasan, opini, dan pengetahuan dari sivitas akademika Unila
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6 sticky top-14 sm:top-16 z-30 backdrop-blur-md bg-white/95">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiX className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
            <button
              onClick={() => setSelectedKategori("")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !selectedKategori
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            {kategoriList.map((k) => {
              const active = selectedKategori === k.id_kategori;
              return (
                <button
                  key={k.id_kategori}
                  onClick={() => setSelectedKategori(active ? "" : k.id_kategori)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? "bg-purple-100 text-purple-700 ring-2 ring-purple-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${COLOR_DOT[k.color || "gray"]}`} />
                  {k.nama}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-gradient-to-br from-purple-100 to-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-16 bg-gray-100 rounded-full" />
                  <div className="h-5 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 sm:p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
              <FiBookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">
              {items.length === 0 ? "Belum ada artikel" : "Tidak ada hasil"}
            </p>
            <p className="text-sm text-gray-500">
              {items.length === 0
                ? "Artikel akan tampil di sini setelah dipublikasikan"
                : "Coba ubah kata kunci atau filter kategori"}
            </p>
          </div>
        ) : (
          <>
            {featured && <FeaturedArtikel item={featured} />}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {rest.map((b, idx) => (
                <ArtikelCard key={b.id_pengumuman} item={b} idx={idx} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function FeaturedArtikel({ item }: { item: Konten }) {
  const tanggal = item.tgl_terbit
    ? new Date(item.tgl_terbit).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const ringkasan =
    item.ringkasan ||
    (item.isi ? String(item.isi).replace(/<[^>]+>/g, "").substring(0, 240) : "");
  const href = item.slug
    ? `/portal/artikel/${item.slug}`
    : `/portal/artikel/${item.id_pengumuman}`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <Link
        href={href}
        className="group block relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all bg-gradient-to-br from-purple-700 via-indigo-700 to-blue-800"
      >
        {item.banner_url && (
          <img
            src={item.banner_url}
            alt={item.judul}
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="relative aspect-[16/9] sm:aspect-[21/9] flex flex-col justify-end p-5 sm:p-8 text-white">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500 text-white shadow-sm">
              ⭐ Pilihan Editor
            </span>
            {item.nama_kategori && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-sm text-white border border-white/30">
                {item.nama_kategori}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-2 max-w-4xl line-clamp-2 group-hover:text-purple-100 transition-colors">
            {item.judul}
          </h2>
          {ringkasan && (
            <p className="hidden sm:block text-sm sm:text-base text-white/85 max-w-3xl line-clamp-2 mb-3">
              {ringkasan}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
            {tanggal && (
              <span className="inline-flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {tanggal}
              </span>
            )}
            {item.author && (
              <span className="inline-flex items-center gap-1">
                <FiUser className="w-3 h-3" />
                {item.author}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <FiEye className="w-3 h-3" />
              {item.view_count.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ArtikelCard({ item, idx }: { item: Konten; idx: number }) {
  const tanggal = item.tgl_terbit
    ? new Date(item.tgl_terbit).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const isFresh = item.tgl_terbit
    ? new Date(item.tgl_terbit).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    : false;
  const ringkasan =
    item.ringkasan ||
    (item.isi ? String(item.isi).replace(/<[^>]+>/g, "").substring(0, 150) : "");
  const href = item.slug
    ? `/portal/artikel/${item.slug}`
    : `/portal/artikel/${item.id_pengumuman}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
    >
      <Link
        href={href}
        className="group block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden h-full hover:-translate-y-0.5"
      >
        <div className="relative overflow-hidden">
          {item.banner_url ? (
            <img
              src={item.banner_url}
              alt={item.judul}
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 flex items-center justify-center">
              <FiBookOpen className="w-12 h-12 text-purple-500/40" />
            </div>
          )}
          {isFresh && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white shadow-sm">
              BARU
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {item.nama_kategori && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-semibold">
                <FiTag className="w-2.5 h-2.5" />
                {item.nama_kategori}
              </span>
            )}
            {item.is_pinned && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-semibold">
                📌 Pinned
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base text-gray-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors">
            {item.judul}
          </h3>
          {ringkasan && (
            <p className="text-xs text-gray-500 line-clamp-3 mb-3">{ringkasan}</p>
          )}
          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {tanggal}
            </div>
            {item.author && (
              <div className="flex items-center gap-1">
                <FiUser className="w-3 h-3" />
                <span className="truncate max-w-[80px]">{item.author}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <FiEye className="w-3 h-3" />
              {item.view_count}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
