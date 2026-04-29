"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiCalendar,
  FiUser,
  FiArrowLeft,
  FiX,
} from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import manajemenKontenService, {
  Konten,
  Kategori,
} from "@/lib/services/manajemen-konten/manajemenKontenService";

const COLOR_MAP: Record<string, { chip: string; ring: string; dot: string }> = {
  blue: { chip: "bg-blue-100 text-blue-700", ring: "ring-blue-200", dot: "bg-blue-500" },
  purple: { chip: "bg-purple-100 text-purple-700", ring: "ring-purple-200", dot: "bg-purple-500" },
  green: { chip: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  amber: { chip: "bg-amber-100 text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
  rose: { chip: "bg-rose-100 text-rose-700", ring: "ring-rose-200", dot: "bg-rose-500" },
  slate: { chip: "bg-slate-100 text-slate-700", ring: "ring-slate-200", dot: "bg-slate-500" },
  sky: { chip: "bg-sky-100 text-sky-700", ring: "ring-sky-200", dot: "bg-sky-500" },
  gray: { chip: "bg-gray-100 text-gray-700", ring: "ring-gray-200", dot: "bg-gray-500" },
};

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Konten[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);

  useEffect(() => {
    Promise.all([
      manajemenKontenService.listKonten({ tipe: "pengumuman", status: "published", limit: 100 }),
      manajemenKontenService.listKategori("pengumuman", true),
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

  const featured = filtered.find((i) => i.is_pinned || i.is_featured);
  const rest = filtered.filter((i) => i !== featured);

  const colorOf = (it: Konten) => COLOR_MAP[it.color_kategori || "gray"] || COLOR_MAP.gray;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30">
      {/* Sticky header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Portal</span>
              <span className="sm:hidden">Kembali</span>
            </Link>
            <div className="flex items-center gap-2 text-gray-800">
              <MdCampaign className="w-5 h-5 sm:w-6 sm:h-6 text-myunila" />
              <span className="font-bold text-sm sm:text-base">Pengumuman</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero */}
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-myunila/10 text-myunila text-xs font-semibold mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-myunila opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-myunila" />
            </span>
            Informasi Resmi Universitas Lampung
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 tracking-tight">
            Pengumuman
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Pengumuman akademik, kegiatan, dan informasi penting dari Universitas Lampung
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-6 sticky top-14 sm:top-16 z-30 backdrop-blur-md bg-white/95">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari pengumuman..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
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

          {/* Kategori chips horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 -mx-1 px-1 pb-1">
            <button
              onClick={() => setSelectedKategori("")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !selectedKategori
                  ? "bg-myunila text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            {kategoriList.map((k) => {
              const c = COLOR_MAP[k.color || "gray"] || COLOR_MAP.gray;
              const active = selectedKategori === k.id_kategori;
              return (
                <button
                  key={k.id_kategori}
                  onClick={() => setSelectedKategori(active ? "" : k.id_kategori)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    active
                      ? `${c.chip} ring-2 ${c.ring}`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                  {k.nama}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse"
              >
                <div className="flex gap-2 mb-3">
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-gray-200 rounded-lg mb-2" />
                <div className="h-3.5 w-full bg-gray-100 rounded mb-1" />
                <div className="h-3.5 w-2/3 bg-gray-100 rounded mb-3" />
                <div className="flex gap-3">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 sm:p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <MdCampaign className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">
              {items.length === 0 ? "Belum ada pengumuman" : "Tidak ada hasil"}
            </p>
            <p className="text-sm text-gray-500">
              {items.length === 0
                ? "Pengumuman akan tampil di sini setelah dipublikasikan"
                : "Coba ubah kata kunci atau filter kategori"}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Featured card highlight */}
            {featured && (
              <FeaturedCard item={featured} colorOf={colorOf(featured)} />
            )}

            {/* Regular list */}
            {rest.map((it, idx) => {
              const c = colorOf(it);
              const tanggal = it.tgl_terbit
                ? new Date(it.tgl_terbit).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "";
              const isFresh = it.tgl_terbit
                ? new Date(it.tgl_terbit).getTime() >
                  Date.now() - 7 * 24 * 60 * 60 * 1000
                : false;
              const ringkasan =
                it.ringkasan ||
                (it.isi
                  ? String(it.isi).replace(/<[^>]+>/g, "").substring(0, 220)
                  : "");

              return (
                <motion.div
                  key={it.id_pengumuman}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                >
                  <Link
                    href={`/portal/pengumuman/${it.id_pengumuman}`}
                    className={`group block bg-white rounded-2xl shadow-sm hover:shadow-md border ${
                      isFresh ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-100"
                    } overflow-hidden transition-all hover:-translate-y-0.5`}
                  >
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                        {isFresh && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                            BARU
                          </span>
                        )}
                        {it.nama_kategori && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${c.chip}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                            {it.nama_kategori}
                          </span>
                        )}
                        {it.is_pinned && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            📌 Pinned
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {it.judul}
                      </h3>
                      {ringkasan && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                          {ringkasan}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-gray-500">
                        {tanggal && (
                          <span className="inline-flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {tanggal}
                          </span>
                        )}
                        {it.author && (
                          <span className="inline-flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {it.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

function FeaturedCard({
  item,
  colorOf,
}: {
  item: Konten;
  colorOf: { chip: string; ring: string; dot: string };
}) {
  const tanggal = item.tgl_terbit
    ? new Date(item.tgl_terbit).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  const ringkasan =
    item.ringkasan ||
    (item.isi ? String(item.isi).replace(/<[^>]+>/g, "").substring(0, 280) : "");
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Link
        href={`/portal/pengumuman/${item.id_pengumuman}`}
        className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_20%,white_0%,transparent_50%)]" />
        <div className="relative p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white border border-white/30">
              ⭐ Sorotan
            </span>
            {item.nama_kategori && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/15 backdrop-blur-sm text-white border border-white/20">
                {item.nama_kategori}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-2 group-hover:text-blue-50">
            {item.judul}
          </h2>
          {ringkasan && (
            <p className="text-sm sm:text-base text-white/85 leading-relaxed line-clamp-2 mb-4 max-w-3xl">
              {ringkasan}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
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
            <span className="inline-flex items-center gap-1 ml-auto opacity-90 group-hover:translate-x-1 transition-transform">
              Baca selengkapnya →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
