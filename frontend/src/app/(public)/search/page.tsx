"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Breadcrumbs,
  BreadcrumbItem,
  Card,
  CardBody,
  Skeleton,
  Chip,
  Button,
  Pagination,
  Input,
  Accordion,
  AccordionItem,
  Checkbox,
  CheckboxGroup,
  Slider,
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
  highlight?: {
    title?: string;
    description?: string;
  };
}

interface MahasiswaResult extends BaseSearchResult {
  category: "mahasiswa";
  nim: string;
  prodi: string;
  fakultas: string;
  angkatan: number;
  status: string;
}

interface DosenResult extends BaseSearchResult {
  category: "dosen";
  nidn?: string;
  nip: string;
  jabatan_fungsional: string;
  prodi: string;
  fakultas: string;
  bidang_keahlian: string[];
}

interface ProdiResult extends BaseSearchResult {
  category: "prodi";
  kode_prodi: string;
  jenjang: string;
  fakultas: string;
  akreditasi: string;
  total_mahasiswa: number;
}

interface PenelitianResult extends BaseSearchResult {
  category: "penelitian";
  tahun: number;
  peneliti: string[];
  skema: string;
  status: string;
}

interface PengabdianResult extends BaseSearchResult {
  category: "pengabdian";
  tahun: number;
  pelaksana: string[];
  skema: string;
  status: string;
}

interface PublikasiResult extends BaseSearchResult {
  category: "publikasi";
  tahun: number;
  penulis: string[];
  jenis: "Jurnal" | "Buku" | "Prosiding" | "HaKI";
  publisher?: string;
  quartile?: string;
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

// Filter state
interface FilterState {
  fakultas: string[];
  jenjang: string[];
  tahun: [number, number];
  status: string[];
  jenis: string[];
}

// Helper function to transform API results to frontend format
const transformAPIResults = (apiResults: any, category: string): SearchResult[] => {
  if (!apiResults || apiResults.length === 0) return [];

  return apiResults.map((item: APISearchResult) => {
    // Use encrypted_id for dosen and bidang-ilmu categories, otherwise use regular id
    const urlId = (category === 'dosen' || category === 'bidang-ilmu') && item.encrypted_id
      ? item.encrypted_id
      : item.id;

    // Base properties
    const base = {
      id: item.id,
      category: category as SearchCategory,
      relevance_score: 0.95, // API doesn't return this yet
      url: `/${category === 'bidang-ilmu' ? 'dosen' : category}/${urlId}`,
    };

    // Transform based on category
    if (category === 'mahasiswa') {
      return {
        ...base,
        title: item.nama || '',
        description: `${item.nim} - ${item.prodi}`,
        nim: item.nim || '',
        prodi: item.prodi || '',
        fakultas: '', // Not in API yet
        angkatan: 2020, // Not in API yet
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
        fakultas: '', // Not in API yet
        bidang_keahlian: [], // Not in API yet
      } as DosenResult;
    } else if (category === 'prodi') {
      return {
        ...base,
        title: item.nama_prodi || '',
        description: `${item.jenjang} - ${item.kode_prodi || ''}`,
        kode_prodi: item.kode_prodi || '',
        jenjang: item.jenjang || '',
        fakultas: '', // Not in API yet
        akreditasi: 'A', // Not in API yet
        total_mahasiswa: item.jumlah_mahasiswa || 0,
      } as ProdiResult;
    } else if (category === 'penelitian') {
      return {
        ...base,
        title: item.judul || '',
        description: `${item.ketua_peneliti} - ${item.skim}`,
        tahun: parseInt(item.tahun || '2024'),
        peneliti: item.ketua_peneliti ? [item.ketua_peneliti] : [],
        skema: item.skim || '',
        status: item.status || 'Berjalan',
      } as PenelitianResult;
    } else if (category === 'pengabdian') {
      return {
        ...base,
        title: item.judul || '',
        description: `${item.ketua_pengabdi} - ${item.skim}`,
        tahun: parseInt(item.tahun || '2024'),
        pelaksana: item.ketua_pengabdi ? [item.ketua_pengabdi] : [],
        skema: item.skim || '',
        status: item.status || 'Berjalan',
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
        title: item.bidang_ilmu || '',
        description: `${item.nama} - ${item.jabatan_fungsional}`,
        kode_bidang: item.bidang_ilmu?.match(/\[([^\]]+)\]/)?.[1] || '',
        jumlah_dosen: 1, // Each result is one dosen
        dosen: item.nama ? [item.nama] : [],
      } as BidangIlmuResult;
    }

    return base as SearchResult;
  });
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = (searchParams.get("category") as SearchCategory) || "all";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState("relevance");

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    fakultas: [],
    jenjang: [],
    tahun: [2000, 2025],
    status: [],
    jenis: [],
  });

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
          category: category === "all" ? undefined : category,
          limit: limit,
        });

        // Transform and combine results from all categories
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
  }, [query, category, limit]);

  const getCategoryLabel = (cat: SearchCategory) => {
    const labels: Record<SearchCategory, string> = {
      all: "Semua",
      mahasiswa: "Mahasiswa",
      dosen: "Dosen",
      prodi: "Program Studi",
      penelitian: "Penelitian",
      pengabdian: "Pengabdian",
      publikasi: "Publikasi",
      "bidang-ilmu": "Bidang Ilmu",
    };
    return labels[cat];
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
              {/* Header */}
              <div className="flex flex-col xs:flex-row items-start xs:items-start justify-between gap-3 xs:gap-4 mb-3">
                <div className="flex items-center gap-2 xs:gap-2.5">
                  <div className="w-8 h-8 xs:w-9 xs:h-9 rounded-lg bg-gradient-to-br from-myunila to-blue-700 flex items-center justify-center text-white text-base xs:text-lg flex-shrink-0">
                    {getCategoryIcon(result.category)}
                  </div>
                  <span className="px-2 xs:px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                    {getCategoryLabel(result.category)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 xs:px-2.5 py-1 bg-green-50 rounded-md border border-green-200 self-start xs:self-auto">
                  <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold text-green-700">
                    {(result.relevance_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3
                className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-myunila transition-colors line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: result.highlight?.title || result.title,
                }}
              />

              {/* Description */}
              <p
                className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: result.highlight?.description || result.description,
                }}
              />

              {/* Metadata */}
              <div className="border-t border-gray-100 pt-3 sm:pt-3.5 mt-1">
                {result.category === "dosen" && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {result.jabatan_fungsional}
                    </span>
                    <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-200">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                      </svg>
                      {result.fakultas}
                    </span>
                    {result.bidang_keahlian.slice(0, 2).map((bidang) => (
                      <span
                        key={bidang}
                        className="inline-flex items-center px-2 xs:px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200"
                      >
                        {bidang}
                      </span>
                    ))}
                    {result.bidang_keahlian.length > 2 && (
                      <span className="inline-flex items-center px-2 xs:px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md border border-gray-300">
                        +{result.bidang_keahlian.length - 2} lainnya
                      </span>
                    )}
                  </div>
                )}

                {result.category === "penelitian" && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-md border border-orange-200">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {result.tahun}
                    </span>
                    <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {result.status}
                    </span>
                    <span className="inline-flex items-center px-2 xs:px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                      {result.skema}
                    </span>
                  </div>
                )}

                {result.category === "publikasi" && (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-200">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      {result.jenis}
                    </span>
                    <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                      <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {result.tahun}
                    </span>
                    {result.quartile && (
                      <span className="inline-flex items-center gap-1 xs:gap-1.5 px-2 xs:px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-300">
                        <svg className="w-3 h-3 xs:w-3.5 xs:h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Q{result.quartile}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </Link>
      </motion.div>
    );
  };

  const getCategoryIcon = (cat: SearchCategory) => {
    const icons: Record<SearchCategory, string> = {
      all: "🔍",
      mahasiswa: "👨‍🎓",
      dosen: "👨‍🏫",
      prodi: "🎓",
      penelitian: "🔬",
      pengabdian: "🤝",
      publikasi: "📚",
      "bidang-ilmu": "🧬",
    };
    return icons[cat];
  };

  const resetFilters = () => {
    setFilters({
      fakultas: [],
      jenjang: [],
      tahun: [2000, 2025],
      status: [],
      jenis: [],
    });
  };

  const hasActiveFilters = Object.values(filters).some((f) => f.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header - Gradient Style with Pattern & Particles */}
      <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white"
          >
            {/* Icon & Title */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/20">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Hasil Pencarian
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <p className="text-base sm:text-lg font-medium opacity-90">
                  Menampilkan hasil untuk:{" "}
                  <span className="font-bold">"{query}"</span>
                </p>

                {category !== "all" && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <span className="text-base">{getCategoryIcon(category)}</span>
                    <span className="font-semibold">{getCategoryLabel(category)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Line */}
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
          {/* Filters Sidebar - Marketplace Style */}
          <aside className="lg:w-72 flex-shrink-0">
            <Card className="sticky top-24 border border-gray-200 shadow-lg bg-white">
              <CardBody className="p-0 bg-white">
                {/* Filter Header */}
                <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-myunila" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    <h2 className="font-bold text-lg text-gray-900">Filter</h2>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onClick={resetFilters}
                      className="text-xs h-8 font-semibold"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Filter Options */}
                <div className="divide-y divide-gray-100 bg-white">
                  {/* Fakultas */}
                  <div className="p-5 bg-white">
                    <div className="flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                      <p className="font-bold text-sm text-gray-900">Fakultas</p>
                    </div>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value="ft"
                          checked={filters.fakultas.includes("ft")}
                          onChange={(e) => {
                            const newFakultas = e.target.checked
                              ? [...filters.fakultas, "ft"]
                              : filters.fakultas.filter((f) => f !== "ft");
                            setFilters({ ...filters, fakultas: newFakultas });
                          }}
                          className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                        />
                        <span className="text-xs text-gray-700">Fakultas Teknik</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value="fmipa"
                          checked={filters.fakultas.includes("fmipa")}
                          onChange={(e) => {
                            const newFakultas = e.target.checked
                              ? [...filters.fakultas, "fmipa"]
                              : filters.fakultas.filter((f) => f !== "fmipa");
                            setFilters({ ...filters, fakultas: newFakultas });
                          }}
                          className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                        />
                        <span className="text-xs text-gray-700">FMIPA</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value="feb"
                          checked={filters.fakultas.includes("feb")}
                          onChange={(e) => {
                            const newFakultas = e.target.checked
                              ? [...filters.fakultas, "feb"]
                              : filters.fakultas.filter((f) => f !== "feb");
                            setFilters({ ...filters, fakultas: newFakultas });
                          }}
                          className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                        />
                        <span className="text-xs text-gray-700">Fakultas Ekonomi</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value="fh"
                          checked={filters.fakultas.includes("fh")}
                          onChange={(e) => {
                            const newFakultas = e.target.checked
                              ? [...filters.fakultas, "fh"]
                              : filters.fakultas.filter((f) => f !== "fh");
                            setFilters({ ...filters, fakultas: newFakultas });
                          }}
                          className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                        />
                        <span className="text-xs text-gray-700">Fakultas Hukum</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value="fkip"
                          checked={filters.fakultas.includes("fkip")}
                          onChange={(e) => {
                            const newFakultas = e.target.checked
                              ? [...filters.fakultas, "fkip"]
                              : filters.fakultas.filter((f) => f !== "fkip");
                            setFilters({ ...filters, fakultas: newFakultas });
                          }}
                          className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                        />
                        <span className="text-xs text-gray-700">FKIP</span>
                      </label>
                    </div>
                  </div>

                  {/* Jenjang */}
                  {(category === "prodi" || category === "all") && (
                    <div className="p-5 bg-white">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                        </svg>
                        <p className="font-bold text-sm text-gray-900">Jenjang</p>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value="s1"
                            checked={filters.jenjang.includes("s1")}
                            onChange={(e) => {
                              const newJenjang = e.target.checked
                                ? [...filters.jenjang, "s1"]
                                : filters.jenjang.filter((j) => j !== "s1");
                              setFilters({ ...filters, jenjang: newJenjang });
                            }}
                            className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                          />
                          <span className="text-xs text-gray-700">Sarjana (S1)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value="s2"
                            checked={filters.jenjang.includes("s2")}
                            onChange={(e) => {
                              const newJenjang = e.target.checked
                                ? [...filters.jenjang, "s2"]
                                : filters.jenjang.filter((j) => j !== "s2");
                              setFilters({ ...filters, jenjang: newJenjang });
                            }}
                            className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                          />
                          <span className="text-xs text-gray-700">Magister (S2)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value="s3"
                            checked={filters.jenjang.includes("s3")}
                            onChange={(e) => {
                              const newJenjang = e.target.checked
                                ? [...filters.jenjang, "s3"]
                                : filters.jenjang.filter((j) => j !== "s3");
                              setFilters({ ...filters, jenjang: newJenjang });
                            }}
                            className="w-4 h-4 text-myunila bg-gray-100 border-gray-300 rounded focus:ring-myunila focus:ring-2"
                          />
                          <span className="text-xs text-gray-700">Doktor (S3)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Tahun */}
                  {(category === "penelitian" ||
                    category === "pengabdian" ||
                    category === "publikasi" ||
                    category === "all") && (
                    <div className="p-5 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <p className="font-bold text-sm text-gray-900">Tahun</p>
                        </div>
                      </div>

                      {/* Range Display */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <p className="text-[10px] font-semibold text-purple-600 uppercase mb-1">Dari</p>
                            <p className="text-lg font-bold text-purple-800">{filters.tahun[0]}</p>
                          </div>
                          <div className="px-3">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-semibold text-purple-600 uppercase mb-1">Sampai</p>
                            <p className="text-lg font-bold text-purple-800">{filters.tahun[1]}</p>
                          </div>
                        </div>
                      </div>

                      {/* Slider */}
                      <Slider
                        step={1}
                        minValue={2000}
                        maxValue={2025}
                        value={filters.tahun}
                        onChange={(value) =>
                          setFilters({ ...filters, tahun: value as [number, number] })
                        }
                        className="max-w-full"
                        size="sm"
                        color="secondary"
                        classNames={{
                          track: "bg-purple-100",
                          filler: "bg-gradient-to-r from-purple-500 to-indigo-500",
                          thumb: "bg-white border-2 border-purple-500 shadow-md",
                        }}
                      />

                      {/* Min/Max Labels */}
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] font-medium text-gray-500">2000</span>
                        <span className="text-[10px] font-medium text-gray-500">2025</span>
                      </div>
                    </div>
                  )}
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
                        window.location.href = `/search?q=${encodeURIComponent(newQuery)}&category=${category}`;
                      }
                    }
                  }}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-myunila focus:border-transparent bg-white text-gray-900 placeholder-gray-400"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
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
                    <p className="text-sm font-semibold text-gray-900">
                      {total} hasil ditemukan
                    </p>
                    <p className="text-xs text-gray-500">Menampilkan hasil terbaik</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Sort Select - Native HTML */}
                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Urutkan
                    </label>
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

                  {/* Per Page Select - Native HTML */}
                  <div className="w-full sm:w-32">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Per Halaman
                    </label>
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
                    <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300" />
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

                {/* Pagination */}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Tidak Ada Hasil Ditemukan
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Tidak ditemukan hasil untuk <span className="font-semibold text-gray-900">"{query}"</span>.
                    Coba gunakan kata kunci yang berbeda.
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
