"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Chip,
  Button,
  Input,
  Skeleton,
} from "@heroui/react";
import {
  FiSearch,
  FiCalendar,
  FiTag,
  FiArrowLeft,
} from "react-icons/fi";
import { MdCampaign } from "react-icons/md";
import Link from "next/link";
import manajemenKontenService, {
  Konten,
  Kategori,
} from "@/lib/services/manajemen-konten/manajemenKontenService";

export default function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Konten[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);

  useEffect(() => {
    // Fetch real published announcements + kategori dari man_konten service.
    const load = async () => {
      try {
        const [list, kat] = await Promise.all([
          manajemenKontenService.listKonten({ tipe: "pengumuman", status: "published", limit: 50 }),
          manajemenKontenService.listKategori("pengumuman", true),
        ]);
        if (list.success) setItems(list.data || []);
        if (kat.success) setKategoriList(kat.data || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Legacy dummy data (unused — diganti dgn announcementsReal dari API)
  const _legacyDummy = [
    {
      id: 1,
      title: "Beasiswa Asih 2025",
      description:
        "Pendaftaran Beasiswa Asih untuk mahasiswa berprestasi tahun 2025 telah dibuka. Segera daftarkan diri Anda dengan melengkapi persyaratan yang telah ditentukan.",
      category: "Kegiatan",
      date: "30 Desember 2024",
      isNew: true,
      author: "Biro Kemahasiswaan",
    },
    {
      id: 2,
      title: "Pengumuman Penghapusan Akun Email Tidak Aktif",
      description:
        "Dalam rangka implementasi kebijakan Universitas Lampung, UPA TIK mengumumkan bahwa akun email yang tidak aktif selama 6 bulan berturut-turut akan dihapus secara otomatis.",
      category: "Lainnya",
      date: "28 Desember 2024",
      isNew: false,
      author: "UPA TIK",
    },
    {
      id: 3,
      title: "Jadwal Ujian Akhir Semester Genap 2024/2025",
      description:
        "Jadwal Ujian Akhir Semester Genap Tahun Akademik 2024/2025 telah ditetapkan. Mahasiswa diharapkan mempersiapkan diri dengan baik dan mengikuti ujian sesuai jadwal yang telah ditentukan.",
      category: "Akademik",
      date: "25 Desember 2024",
      isNew: true,
      author: "Biro Akademik",
    },
    {
      id: 4,
      title: "Workshop Pengembangan Soft Skills",
      description:
        "Pusat Karir mengadakan workshop pengembangan soft skills untuk mahasiswa tingkat akhir. Workshop ini akan membahas tentang komunikasi efektif, leadership, dan public speaking.",
      category: "Kegiatan",
      date: "22 Desember 2024",
      isNew: false,
      author: "Pusat Karir",
    },
    {
      id: 5,
      title: "Maintenance Server myUnila Portal",
      description:
        "Akan dilakukan maintenance server myUnila Portal pada tanggal 15 Januari 2025 pukul 00.00 - 06.00 WIB. Mohon maaf atas ketidaknyamanannya.",
      category: "Teknis",
      date: "20 Desember 2024",
      isNew: false,
      author: "UPA TIK",
    },
    {
      id: 6,
      title: "Kompetisi Karya Tulis Ilmiah Nasional 2025",
      description:
        "Universitas Lampung mengadakan Kompetisi Karya Tulis Ilmiah tingkat nasional. Hadiah total puluhan juta rupiah menanti para pemenang. Segera daftarkan tim Anda!",
      category: "Kegiatan",
      date: "18 Desember 2024",
      isNew: true,
      author: "Kemahasiswaan",
    },
    {
      id: 7,
      title: "Perpanjangan Masa Registrasi Semester Genap",
      description:
        "Batas waktu registrasi semester genap diperpanjang hingga tanggal 5 Januari 2025. Mahasiswa yang belum melakukan registrasi diharapkan segera menyelesaikan.",
      category: "Akademik",
      date: "15 Desember 2024",
      isNew: false,
      author: "Biro Akademik",
    },
    {
      id: 8,
      title: "Lowongan Asisten Laboratorium",
      description:
        "Dibuka lowongan untuk asisten laboratorium di berbagai jurusan. Persyaratan: IPK minimal 3.00, semester 5 ke atas, dan lulus seleksi. Info lengkap di website fakultas masing-masing.",
      category: "Lainnya",
      date: "12 Desember 2024",
      isNew: false,
      author: "Fakultas Teknik",
    },
  ];

  // Override dummy categories list dengan kategori dari API
  const categories = ["Semua", ...kategoriList.map((k) => k.nama)];

  // Map real konten ke shape yang dipakai render block existing (judul/desc/dll)
  const announcementsReal = items.map((it) => ({
    id: it.id_pengumuman,
    title: it.judul,
    description: it.ringkasan || (it.isi ? it.isi.replace(/<[^>]+>/g, "").substring(0, 300) : ""),
    category: it.nama_kategori || "Umum",
    date: it.tgl_terbit
      ? new Date(it.tgl_terbit).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })
      : "",
    isNew:
      it.tgl_terbit
        ? new Date(it.tgl_terbit).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        : false,
    author: it.author || "Admin myUnila",
    color: it.color_kategori,
  }));

  const filteredAnnouncements = announcementsReal.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || announcement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const k = kategoriList.find((kat) => kat.nama === category);
    if (k?.color) {
      const map: Record<string, string> = {
        blue: "bg-blue-100 text-blue-800",
        purple: "bg-purple-100 text-purple-800",
        green: "bg-green-100 text-green-800",
        amber: "bg-amber-100 text-amber-800",
        rose: "bg-rose-100 text-rose-800",
        slate: "bg-slate-100 text-slate-800",
        sky: "bg-sky-100 text-sky-800",
        gray: "bg-gray-100 text-gray-800",
      };
      return map[k.color] || map.gray;
    }
    return "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-6 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          <div className="mb-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="bg-white">
                <CardBody className="p-4 sm:p-6">
                  <div className="flex gap-2 mb-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-3/4 rounded-lg mb-2" />
                  <Skeleton className="h-4 w-full rounded-lg mb-2" />
                  <Skeleton className="h-4 w-2/3 rounded-lg mb-3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24 rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-lg" />
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/portal">
                <Button
                  isIconOnly
                  variant="light"
                  className="hover:bg-gray-100 rounded-lg"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
              <MdCampaign className="w-6 h-6 text-myunila" />
              <h1 className="text-xl font-bold text-gray-800">Pengumuman</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <Input
            placeholder="Cari pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<FiSearch className="text-gray-400" />}
            classNames={{
              input: "bg-white",
              inputWrapper: "bg-white shadow-sm",
            }}
            size="lg"
          />

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Chip
                key={category}
                variant={selectedCategory === category ? "solid" : "bordered"}
                color={selectedCategory === category ? "primary" : "default"}
                className={`cursor-pointer ${
                  selectedCategory === category
                    ? "bg-myunila text-white"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Chip>
            ))}
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length === 0 ? (
            <Card className="bg-white shadow-sm">
              <CardBody className="py-12 text-center">
                <MdCampaign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Tidak ada pengumuman yang sesuai dengan pencarian.
                </p>
              </CardBody>
            </Card>
          ) : (
            filteredAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  isPressable
                  className={`bg-white hover:shadow-lg transition-all duration-300 ${
                    announcement.isNew ? "border-l-4 border-l-myunila" : ""
                  }`}
                >
                  <CardBody className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {announcement.isNew && (
                            <Chip
                              size="sm"
                              className="bg-red-500 text-white"
                            >
                              Baru
                            </Chip>
                          )}
                          <Chip
                            size="sm"
                            variant="flat"
                            className={getCategoryColor(announcement.category)}
                            startContent={<FiTag className="w-3 h-3" />}
                          >
                            {announcement.category}
                          </Chip>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {announcement.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-3.5 h-3.5" />
                            <span>{announcement.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span>{announcement.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
