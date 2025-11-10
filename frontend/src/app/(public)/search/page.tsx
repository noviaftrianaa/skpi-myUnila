"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Skeleton,
  Button,
  Pagination,
} from "@heroui/react";
import Link from "next/link";
import { SearchCategory } from "@/shared/components/search/GlobalSearch";
import { globalSearch, SearchResult as APISearchResult } from "@/lib/services/searchService";

// Search result types
interface BaseSearchResult {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  url: string;
  relevance_score: number;
}

interface MahasiswaResult extends BaseSearchResult {
  category: "mahasiswa";
  nim: string;
  prodi: string;
  status: string;
}

interface DosenResult extends BaseSearchResult {
  category: "dosen";
  nidn?: string;
  nip: string;
  jabatan_fungsional: string;
  prodi: string;
}

interface ProdiResult extends BaseSearchResult {
  category: "prodi";
  kode_prodi: string;
  jenjang: string;
  total_mahasiswa: number;
}

interface PenelitianResult extends BaseSearchResult {
  category: "penelitian";
  tahun: number;
  peneliti: string[];
  skema: string;
}

interface PengabdianResult extends BaseSearchResult {
  category: "pengabdian";
  tahun: number;
  pelaksana: string[];
  skema: string;
}

interface PublikasiResult extends BaseSearchResult {
  category: "publikasi";
  tahun: number;
  penulis: string[];
  jenis: "Jurnal" | "Buku" | "Prosiding" | "HaKI";
  publisher?: string;
}

interface BidangIlmuResult extends BaseSearchResult {
  category: "bidang-ilmu";
  kode_bidang: string;
  jumlah_dosen: number;
  dosen: string[];
}

type SearchResult =
  | MahasiswaResult
  | DosenResult
  | ProdiResult
  | PenelitianResult
  | PengabdianResult
  | PublikasiResult
  | BidangIlmuResult;

// Category configuration
const CATEGORIES = [
  { key: "all", label: "Semua", icon: "🔍" },
  { key: "mahasiswa", label: "Mahasiswa", icon: "👨‍🎓" },
  { key: "dosen", label: "Dosen", icon: "👨‍🏫" },
  { key: "prodi", label: "Program Studi", icon: "🎓" },
  { key: "penelitian", label: "Penelitian", icon: "🔬" },
  { key: "pengabdian", label: "Pengabdian", icon: "🤝" },
  { key: "publikasi", label: "Publikasi", icon: "📚" },
  { key: "bidang-ilmu", label: "Bidang Ilmu", icon: "🧬" },
] as const;

// Helper function to transform API results to frontend format
const transformAPIResults = (apiResults: any, category: string): SearchResult[] => {
  if (!apiResults || apiResults.length === 0) return [];

  return apiResults.map((item: APISearchResult) => {
    // Use encrypted_id for mahasiswa, dosen, and prodi
    const useEncryptedId = ['mahasiswa', 'dosen', 'prodi'].includes(category);
    const urlId = useEncryptedId && item.encrypted_id
      ? item.encrypted_id
      : item.id;

    const base = {
      id: item.id,
      category: category as SearchCategory,
      relevance_score: 0.95,
      url: `/${category}/${urlId}`,
    };

    if (category === 'mahasiswa') {
      return {
        ...base,
        title: item.nama || '',
        description: `${item.nim} - ${item.prodi}`,
        nim: item.nim || '',
        prodi: item.prodi || '',
        status: item.status || 'Aktif',
      } as MahasiswaResult;
    } else if (category === 'dosen') {
      return {
        ...base,
        title: item.nama || '',
        description: `${item.jabatan_fungsional} - ${item.prodi_homebase}`,
        nidn: item.nidn,
        nip: item.nip || '',
        jabatan_fungsional: item.jabatan_fungsional || '',
        prodi: item.prodi_homebase || '',
      } as DosenResult;
    } else if (category === 'prodi') {
      return {
        ...base,
        title: item.nama_prodi || '',
        description: `${item.jenjang} - ${item.kode_prodi || ''}`,
        kode_prodi: item.kode_prodi || '',
        jenjang: item.jenjang || '',
        total_mahasiswa: item.jumlah_mahasiswa || 0,
        url: `/program-studi/detail/${urlId}`,
      } as ProdiResult;
    } else if (category === 'penelitian') {
      return {
        ...base,
        title: item.judul || '',
        description: `${item.ketua_peneliti} - ${item.skim}`,
        tahun: parseInt(item.tahun || '2024'),
        peneliti: item.ketua_peneliti ? [item.ketua_peneliti] : [],
        skema: item.skim || '',
      } as PenelitianResult;
    } else if (category === 'pengabdian') {
      return {
        ...base,
        title: item.judul || '',
        description: `${item.ketua_pengabdi} - ${item.skim}`,
        tahun: parseInt(item.tahun || '2024'),
        pelaksana: item.ketua_pengabdi ? [item.ketua_pengabdi] : [],
        skema: item.skim || '',
      } as PengabdianResult;
    } else if (category === 'publikasi') {
      return {
        ...base,
        title: item.judul || '',
        description: `${item.penulis_utama} - ${item.jenis_publikasi}`,
        tahun: parseInt(item.tahun || '2024'),
        penulis: item.penulis_utama ? [item.penulis_utama] : [],
        jenis: (item.jenis_publikasi as 'Jurnal' | 'Buku' | 'Prosiding' | 'HaKI') || 'Jurnal',
        publisher: item.penerbit || '',
      } as PublikasiResult;
    } else if (category === 'bidang-ilmu') {
      return {
        ...base,
        title: item.nm_kel_bidang || '',
        description: `${item.total_dosen || 0} Dosen`,
        kode_bidang: item.kode_kel_bidang || '',
        jumlah_dosen: item.total_dosen || 0,
        dosen: [],
        url: `/bidang-ilmu/${item.id_kel_bidang}`,
      } as BidangIlmuResult;
    }

    return base as SearchResult;
  });
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";
  const categoryParam = (searchParams.get("category") as SearchCategory) || "all";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState("relevance");

  // Filter by single category selection
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotal(0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await globalSearch(query, {
          category: categoryParam === "all" ? undefined : categoryParam,
          limit: limit,
        });

        let allResults: SearchResult[] = [];

        if (response.data.results.mahasiswa) {
          allResults = [...allResults, ...transformAPIResults(response.data.results.mahasiswa, 'mahasiswa')];
        }
        if (response.data.results.dosen) {
          allResults = [...allResults, ...transformAPIResults(response.data.results.dosen, 'dosen')];
        }
        if (response.data.results.prodi) {
          allResults = [...allResults, ...transformAPIResults(response.data.results.prodi, 'prodi')];
        }
        if (response.data.results.penelitian) {
          allResults = [...allResults, ...transformAPIResults(response.data.results.penelitian, 'penelitian')];
        }
        if (response.data.results.pengabdian) {
          allResults = [...allResults, ...transformAPIResults(response.data.results.pengabdian, 'pengabdian')];
        }
        if (response.data.results.publikasi) {
          allResults = [...allResults, ...transformAPIResults(response.data.results.publikasi, 'publikasi')];
        }
        if (response.data.results['bidang-ilmu']) {
          allResults = [...allResults, ...transformAPIResults(response.data.results['bidang-ilmu'], 'bidang-ilmu')];
        }

        // Filter by selected category if not "all"
        if (selectedCategory !== 'all') {
          allResults = allResults.filter(r => r.category === selectedCategory);
        }

        setResults(allResults);
        setTotal(response.data.total_results);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.message || 'Terjadi kesalahan saat mencari data');
        setResults([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, categoryParam, limit, selectedCategory]);

  const getCategoryLabel = (cat: SearchCategory) => {
    return CATEGORIES.find((c) => c.key === cat)?.label || cat;
  };

  const getCategoryIcon = (cat: SearchCategory) => {
    return CATEGORIES.find((c) => c.key === cat)?.icon || "📄";
  };

  const renderResultCard = (result: SearchResult) => {
    return (
      <motion.div
        key={result.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={result.url}>
          <Card className="group hover:shadow-lg hover:border-myunila/40 transition-all duration-300 border border-gray-200 bg-white">
            <CardBody className="p-4 sm:p-5 bg-white">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-myunila to-blue-700 flex items-center justify-center text-white text-lg flex-shrink-0">
                  {getCategoryIcon(result.category)}
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                  {getCategoryLabel(result.category)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-myunila transition-colors line-clamp-2">
                {result.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
                {result.description}
              </p>

              <div className="border-t border-gray-100 pt-3.5 mt-1">
                {result.category === "mahasiswa" && (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                      NIM: {result.nim}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${
                      result.status === 'Aktif' ? 'bg-green-50 text-green-700 border-green-200' :
                      result.status === 'Lulus' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                )}

                {result.category === "dosen" && (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
                      {result.jabatan_fungsional}
                    </span>
                  </div>
                )}

                {(result.category === "penelitian" || result.category === "pengabdian") && (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md border border-orange-200">
                      {result.tahun}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                      {result.skema}
                    </span>
                  </div>
                )}

                {result.category === "publikasi" && (
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-200">
                      {result.jenis}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                      {result.tahun}
                    </span>
                  </div>
                )}

                {result.category === "bidang-ilmu" && (
                  <div className="flex flex-wrap gap-2">
                    {result.kode_bidang && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-200">
                        {result.kode_bidang}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
                      {result.jumlah_dosen} Dosen
                    </span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Hasil Pencarian
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <p className="text-base sm:text-lg font-medium opacity-90">
                  Menampilkan hasil untuk: <span className="font-bold">"{query}"</span>
                </p>

                {categoryParam !== "all" && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <span className="text-base">{getCategoryIcon(categoryParam)}</span>
                    <span className="font-semibold">{getCategoryLabel(categoryParam)}</span>
                  </div>
                )}
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-24 h-1 bg-white/50 mx-auto"
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar - Only Category Filter */}
          <aside className="lg:w-72 flex-shrink-0">
            <Card className="sticky top-24 border border-gray-200 shadow-lg bg-white">
              <CardBody className="p-0 bg-white">
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-myunila" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <h2 className="font-bold text-lg text-gray-900">Filter Kategori</h2>
                  </div>
                  {selectedCategory !== 'all' && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onClick={() => {
                        setSelectedCategory('all');
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('category');
                        router.push(`/search?${params.toString()}`);
                      }}
                      className="text-xs h-8 font-semibold"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <div className="p-5 bg-white space-y-2">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.key}
                      onClick={() => {
                        setSelectedCategory(cat.key);
                        const params = new URLSearchParams(searchParams.toString());
                        if (cat.key === 'all') {
                          params.delete('category');
                        } else {
                          params.set('category', cat.key);
                        }
                        router.push(`/search?${params.toString()}`);
                      }}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-myunila border-myunila'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedCategory === cat.key && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 flex-1">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm text-gray-700 font-normal">{cat.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari ulang..."
                  defaultValue={query}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newQuery = e.currentTarget.value;
                      if (newQuery.trim()) {
                        router.push(`/search?q=${encodeURIComponent(newQuery)}&category=${categoryParam}`);
                      }
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myunila focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Top Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{total} hasil ditemukan</p>
                    <p className="text-xs text-gray-500">Menampilkan hasil terbaik</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Urutkan</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myunila focus:border-transparent"
                    >
                      <option value="relevance">Relevansi</option>
                      <option value="date_desc">Terbaru</option>
                      <option value="date_asc">Terlama</option>
                      <option value="name_asc">A-Z</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Per Halaman</label>
                    <select
                      value={limit.toString()}
                      onChange={(e) => setLimit(parseInt(e.target.value))}
                      className="w-full h-10 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myunila focus:border-transparent"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Results List */}
            {isLoading ? (
              <div className="space-y-5">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border border-gray-200 shadow-sm">
                    <CardBody className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                      <Skeleton className="h-7 w-3/4 mb-3" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-5" />
                      <div className="border-t border-gray-100 pt-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-7 w-24 rounded-full" />
                          <Skeleton className="h-7 w-28 rounded-full" />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="space-y-5">
                  {results.map((result) => renderResultCard(result))}
                </div>

                {total > limit && (
                  <div className="flex justify-center mt-10">
                    <Pagination
                      total={Math.ceil(total / limit)}
                      page={page}
                      onChange={setPage}
                      showControls
                      color="primary"
                      size="lg"
                      classNames={{
                        cursor: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg",
                        item: "border border-gray-300",
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <Card className="border border-gray-200 shadow-lg">
                <CardBody className="p-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Tidak Ada Hasil Ditemukan</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Tidak ditemukan hasil untuk <span className="font-semibold text-gray-900">"{query}"</span>. Coba gunakan kata kunci yang berbeda.
                  </p>
                  <Button
                    as={Link}
                    href="/"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    Kembali ke Beranda
                  </Button>
                </CardBody>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-myunila border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Memuat pencarian...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
