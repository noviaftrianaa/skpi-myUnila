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
  Select,
  SelectItem,
  Input,
  Accordion,
  AccordionItem,
  Checkbox,
  CheckboxGroup,
  Slider,
} from "@heroui/react";
import Link from "next/link";
import { SearchCategory } from "@/shared/components/search/GlobalSearch";

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

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = (searchParams.get("category") as SearchCategory) || "all";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
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
      setIsLoading(true);
      try {
        // TODO: Replace with actual MeiliSearch API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock data
        const mockResults: SearchResult[] = [
          {
            id: "1",
            title: "Dr. Budi Santoso, S.T., M.T.",
            description: "Dosen Teknik Informatika dengan keahlian Machine Learning dan AI",
            category: "dosen",
            url: "/dosen/1",
            relevance_score: 0.95,
            nidn: "0012345678",
            nip: "198001012005011001",
            jabatan_fungsional: "Lektor Kepala",
            prodi: "Teknik Informatika",
            fakultas: "Fakultas Teknik",
            bidang_keahlian: ["Machine Learning", "Artificial Intelligence", "Data Science"],
          },
          {
            id: "2",
            title: "Analisis Kualitas Air Sungai Way Kuripan Lampung",
            description: "Penelitian tentang pencemaran air sungai dan dampaknya terhadap ekosistem",
            category: "penelitian",
            url: "/penelitian/2",
            relevance_score: 0.88,
            tahun: 2024,
            peneliti: ["Dr. Ahmad Hidayat", "Prof. Siti Nurjanah"],
            skema: "Penelitian Unggulan Perguruan Tinggi",
            status: "Berjalan",
          },
        ];

        setResults(mockResults);
        setTotal(mockResults.length);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query, category, page, limit, sortBy, filters]);

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
          <Card className="hover:shadow-xl hover:border-myunila/20 transition-all duration-200 border border-transparent">
            <CardBody className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCategoryIcon(result.category)}</span>
                  <Chip size="sm" color="primary" variant="flat" className="font-semibold">
                    {getCategoryLabel(result.category)}
                  </Chip>
                </div>
                <Chip size="sm" variant="flat" className="bg-green-50 text-green-700 font-semibold">
                  {(result.relevance_score * 100).toFixed(0)}% match
                </Chip>
              </div>

              {/* Title */}
              <h3
                className="text-lg font-bold text-gray-900 mb-2 hover:text-myunila transition-colors"
                dangerouslySetInnerHTML={{
                  __html: result.highlight?.title || result.title,
                }}
              />

              {/* Description */}
              <p
                className="text-sm text-gray-600 mb-4 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: result.highlight?.description || result.description,
                }}
              />

              {/* Metadata */}
              {result.category === "dosen" && (
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-700">
                    {result.jabatan_fungsional}
                  </Chip>
                  <Chip size="sm" variant="flat" className="bg-purple-50 text-purple-700">
                    {result.fakultas}
                  </Chip>
                  {result.bidang_keahlian.slice(0, 2).map((bidang) => (
                    <Chip key={bidang} size="sm" variant="dot" className="text-xs">
                      {bidang}
                    </Chip>
                  ))}
                  {result.bidang_keahlian.length > 2 && (
                    <Chip size="sm" variant="flat" className="text-xs bg-gray-100">
                      +{result.bidang_keahlian.length - 2} lainnya
                    </Chip>
                  )}
                </div>
              )}

              {result.category === "penelitian" && (
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" className="bg-orange-50 text-orange-700">
                    📅 {result.tahun}
                  </Chip>
                  <Chip size="sm" variant="flat" className="bg-green-50 text-green-700">
                    {result.status}
                  </Chip>
                  <Chip size="sm" variant="dot" className="text-xs">
                    {result.skema}
                  </Chip>
                </div>
              )}

              {result.category === "publikasi" && (
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" className="bg-indigo-50 text-indigo-700">
                    {result.jenis}
                  </Chip>
                  <Chip size="sm" variant="flat" className="bg-gray-100 text-gray-700">
                    {result.tahun}
                  </Chip>
                  {result.quartile && (
                    <Chip size="sm" variant="flat" className="bg-green-50 text-green-700 font-bold">
                      Q{result.quartile}
                    </Chip>
                  )}
                </div>
              )}
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
      {/* Minimalist Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <Breadcrumbs size="sm" className="mb-4">
            <BreadcrumbItem>
              <Link href="/" className="text-gray-600 hover:text-myunila transition-colors">
                Beranda
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem className="text-gray-900 font-medium">Pencarian</BreadcrumbItem>
          </Breadcrumbs>

          <div className="flex flex-col gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Hasil Pencarian
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm sm:text-base text-gray-600">
                Menampilkan hasil untuk: <span className="font-semibold text-gray-900">"{query}"</span>
              </p>
              {category !== "all" && (
                <Chip size="sm" color="primary" variant="flat" className="font-semibold">
                  {getCategoryIcon(category)} {getCategoryLabel(category)}
                </Chip>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Marketplace Style */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card className="sticky top-24 border border-gray-200">
              <CardBody className="p-0">
                {/* Filter Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-bold text-base text-gray-900">Filter</h2>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      variant="light"
                      color="danger"
                      onClick={resetFilters}
                      className="text-xs h-7"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Filter Options */}
                <div className="divide-y divide-gray-100">
                  {/* Fakultas */}
                  <div className="p-4">
                    <p className="font-semibold text-sm mb-3 text-gray-900">Fakultas</p>
                    <CheckboxGroup
                      value={filters.fakultas}
                      onValueChange={(value) =>
                        setFilters({ ...filters, fakultas: value as string[] })
                      }
                      classNames={{ wrapper: "gap-2" }}
                    >
                      <Checkbox value="ft" size="sm">
                        <span className="text-sm">Fakultas Teknik</span>
                      </Checkbox>
                      <Checkbox value="fmipa" size="sm">
                        <span className="text-sm">FMIPA</span>
                      </Checkbox>
                      <Checkbox value="feb" size="sm">
                        <span className="text-sm">Fakultas Ekonomi</span>
                      </Checkbox>
                      <Checkbox value="fh" size="sm">
                        <span className="text-sm">Fakultas Hukum</span>
                      </Checkbox>
                      <Checkbox value="fkip" size="sm">
                        <span className="text-sm">FKIP</span>
                      </Checkbox>
                    </CheckboxGroup>
                  </div>

                  {/* Jenjang */}
                  {(category === "prodi" || category === "all") && (
                    <div className="p-4">
                      <p className="font-semibold text-sm mb-3 text-gray-900">Jenjang</p>
                      <CheckboxGroup
                        value={filters.jenjang}
                        onValueChange={(value) =>
                          setFilters({ ...filters, jenjang: value as string[] })
                        }
                        classNames={{ wrapper: "gap-2" }}
                      >
                        <Checkbox value="s1" size="sm">
                          <span className="text-sm">Sarjana (S1)</span>
                        </Checkbox>
                        <Checkbox value="s2" size="sm">
                          <span className="text-sm">Magister (S2)</span>
                        </Checkbox>
                        <Checkbox value="s3" size="sm">
                          <span className="text-sm">Doktor (S3)</span>
                        </Checkbox>
                      </CheckboxGroup>
                    </div>
                  )}

                  {/* Tahun */}
                  {(category === "penelitian" ||
                    category === "pengabdian" ||
                    category === "publikasi" ||
                    category === "all") && (
                    <div className="p-4">
                      <p className="font-semibold text-sm mb-3 text-gray-900">Tahun</p>
                      <Slider
                        label="Rentang Tahun"
                        step={1}
                        minValue={2000}
                        maxValue={2025}
                        value={filters.tahun}
                        onChange={(value) =>
                          setFilters({ ...filters, tahun: value as [number, number] })
                        }
                        className="max-w-full"
                        size="sm"
                      />
                      <div className="flex justify-between mt-2 text-xs text-gray-600">
                        <span>{filters.tahun[0]}</span>
                        <span>{filters.tahun[1]}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{total}</span> hasil ditemukan
              </p>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  size="sm"
                  label="Urutkan"
                  selectedKeys={[sortBy]}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-40"
                  classNames={{ trigger: "h-10" }}
                >
                  <SelectItem key="relevance" value="relevance">
                    Relevansi
                  </SelectItem>
                  <SelectItem key="date_desc" value="date_desc">
                    Terbaru
                  </SelectItem>
                  <SelectItem key="date_asc" value="date_asc">
                    Terlama
                  </SelectItem>
                  <SelectItem key="name_asc" value="name_asc">
                    A-Z
                  </SelectItem>
                </Select>

                <Select
                  size="sm"
                  label="Per Halaman"
                  selectedKeys={[limit.toString()]}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full sm:w-28"
                  classNames={{ trigger: "h-10" }}
                >
                  <SelectItem key="10" value="10">
                    10
                  </SelectItem>
                  <SelectItem key="20" value="20">
                    20
                  </SelectItem>
                  <SelectItem key="50" value="50">
                    50
                  </SelectItem>
                </Select>
              </div>
            </div>

            {/* Results List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border border-gray-200">
                    <CardBody className="p-5">
                      <Skeleton className="h-4 w-32 mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="space-y-4">
                  {results.map((result) => renderResultCard(result))}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="flex justify-center mt-8">
                    <Pagination
                      total={Math.ceil(total / limit)}
                      page={page}
                      onChange={setPage}
                      showControls
                      color="primary"
                      size="lg"
                      classNames={{
                        cursor: "bg-myunila text-white",
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <Card className="border border-gray-200">
                <CardBody className="p-12 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Tidak Ada Hasil Ditemukan
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tidak ditemukan hasil untuk "{query}"
                  </p>
                  <Button
                    as={Link}
                    href="/"
                    color="primary"
                    variant="flat"
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
