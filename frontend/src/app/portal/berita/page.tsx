"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowLeft, FiSearch, FiCalendar, FiUser, FiTag, FiEye } from "react-icons/fi";
import { MdNewspaper } from "react-icons/md";
import manajemenKontenService, {
  Konten,
  Kategori,
} from "@/lib/services/manajemen-konten/manajemenKontenService";

export default function BeritaListPage() {
  const [items, setItems] = useState<Konten[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      manajemenKontenService.listKonten({ tipe: "berita", status: "published", limit: 50 }),
      manajemenKontenService.listKategori("berita", true),
    ])
      .then(([list, kat]) => {
        if (list.success) setItems(list.data || []);
        if (kat.success) setKategoriList(kat.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((it) => {
    const matchSearch =
      it.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.ringkasan || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = !selectedKategori || it.id_kategori === selectedKategori;
    return matchSearch && matchKategori;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/40 to-indigo-50/30">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/portal" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600">
              <FiArrowLeft className="w-4 h-4" /> Kembali ke Portal
            </Link>
            <div className="flex items-center gap-2 text-gray-800">
              <MdNewspaper className="w-6 h-6 text-blue-600" />
              <span className="font-bold">Berita Unila</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Berita Unila</h1>
          <p className="text-sm text-gray-600">Liputan kegiatan & informasi resmi Universitas Lampung</p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id_kategori} value={k.id_kategori}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="h-3 w-full bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
            <MdNewspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {items.length === 0 ? "Belum ada berita yang dipublikasikan" : "Tidak ada berita yang cocok dengan filter"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b, idx) => {
              const tanggal = b.tgl_terbit
                ? new Date(b.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                : "";
              const isFresh = b.tgl_terbit
                ? new Date(b.tgl_terbit).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                : false;
              const ringkasan = b.ringkasan || (b.isi ? String(b.isi).replace(/<[^>]+>/g, "").substring(0, 150) : "");
              return (
                <motion.div
                  key={b.id_pengumuman}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Link
                    href={b.slug ? `/portal/berita/${b.slug}` : `/portal/berita/${b.id_pengumuman}`}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden h-full"
                  >
                    {b.banner_url ? (
                      <img
                        src={b.banner_url}
                        alt={b.judul}
                        className="w-full h-40 object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                        <MdNewspaper className="w-12 h-12 text-blue-600/40" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {b.nama_kategori && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-semibold">
                            <FiTag className="w-2.5 h-2.5" />
                            {b.nama_kategori}
                          </span>
                        )}
                        {isFresh && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold">
                            Baru
                          </span>
                        )}
                        {b.is_featured && (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-semibold">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-base text-gray-900 mb-1.5 line-clamp-2 leading-tight">
                        {b.judul}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-3 mb-3">{ringkasan}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {tanggal}
                        </div>
                        {b.author && (
                          <div className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            {b.author}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <FiEye className="w-3 h-3" />
                          {b.view_count}
                        </div>
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
