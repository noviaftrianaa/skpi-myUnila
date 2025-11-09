"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Button,
  Kbd,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalBody,
} from "@heroui/react";
import { getSearchSuggestions, globalSearch } from "@/lib/services/searchService";

// Search category type
export type SearchCategory =
  | "all"
  | "mahasiswa"
  | "dosen"
  | "prodi"
  | "penelitian"
  | "pengabdian"
  | "publikasi"
  | "bidang-ilmu";

// Search suggestion interface
interface SearchSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  url: string;
  metadata?: {
    imageUrl?: string;
    badge?: string;
    year?: number;
    faculty?: string;
  };
}

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

interface GlobalSearchProps {
  variant?: "navbar" | "hero" | "button";
  className?: string;
}

export default function GlobalSearch({ variant = "button", className = "" }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Keyboard shortcut (Cmd/Ctrl + K) - Open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open modal with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close modal with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }

      // Navigate suggestions with arrow keys (only when modal is open)
      if (isOpen) {
        if (e.key === "ArrowDown" && suggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === "ArrowUp" && suggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === "Enter") {
          e.preventDefault();
          if (suggestions.length > 0 && suggestions[selectedIndex]) {
            handleSelectSuggestion(suggestions[selectedIndex]);
          } else if (query.trim()) {
            handleSearch();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, query]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when modal closes
      setQuery("");
      setSuggestions([]);
      setSelectedIndex(0);
      setCategory("all");
    }
  }, [isOpen]);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchQuery: string, searchCategory: SearchCategory) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // For penelitian, publikasi, pengabdian - use globalSearch API
      if (searchCategory === 'penelitian' || searchCategory === 'publikasi' || searchCategory === 'pengabdian' || searchCategory === 'all' || searchCategory === 'bidang-ilmu') {
        const response = await globalSearch(searchQuery, {
          category: searchCategory === 'all' ? undefined : searchCategory,
          limit: 5
        });

        if (!response.success) {
          setSuggestions([]);
          return;
        }

        // Transform API results to SearchSuggestion format
        const allSuggestions: SearchSuggestion[] = [];

        // Mahasiswa
        if (response.data.results.mahasiswa) {
          response.data.results.mahasiswa.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama || '',
              subtitle: `${item.nim} - ${item.prodi}`,
              category: 'mahasiswa',
              url: `/mahasiswa/${item.encrypted_id || item.id}`,
              metadata: {
                badge: item.status,
              },
            });
          });
        }

        // Dosen
        if (response.data.results.dosen) {
          response.data.results.dosen.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama || '',
              subtitle: `${item.jabatan_fungsional} - ${item.prodi_homebase}`,
              category: 'dosen',
              url: `/dosen/${item.encrypted_id || item.id}`,
              metadata: {
                badge: item.jabatan_fungsional,
              },
            });
          });
        }

        // Prodi
        if (response.data.results.prodi) {
          response.data.results.prodi.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama_prodi || '',
              subtitle: `${item.jenjang} - ${item.kode_prodi}`,
              category: 'prodi',
              url: `/program-studi/detail/${item.encrypted_id || item.id}`,
              metadata: {
                badge: `${item.jumlah_mahasiswa} Mahasiswa`,
              },
            });
          });
        }

        // Penelitian
        if (response.data.results.penelitian) {
          response.data.results.penelitian.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.judul || '',
              subtitle: `${item.skim} - ${item.tahun}`,
              category: 'penelitian',
              url: `/penelitian/${item.id}`,
              metadata: {
                badge: item.skim,
                year: parseInt(item.tahun || '0'),
              },
            });
          });
        }

        // Publikasi
        if (response.data.results.publikasi) {
          response.data.results.publikasi.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.judul || '',
              subtitle: `${item.jenis_publikasi} - ${item.tahun}`,
              category: 'publikasi',
              url: `/publikasi/${item.id}`,
              metadata: {
                badge: item.jenis_publikasi,
                year: parseInt(item.tahun || '0'),
              },
            });
          });
        }

        // Pengabdian
        if (response.data.results.pengabdian) {
          response.data.results.pengabdian.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.judul || '',
              subtitle: `${item.skim} - ${item.tahun}`,
              category: 'pengabdian',
              url: `/pengabdian/${item.id}`,
              metadata: {
                badge: item.skim,
                year: parseInt(item.tahun || '0'),
              },
            });
          });
        }

        // Bidang Ilmu
        if (response.data.results['bidang-ilmu']) {
          response.data.results['bidang-ilmu'].forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama || '',
              subtitle: `${item.jabatan_fungsional} - ${item.prodi_homebase}`,
              category: 'bidang-ilmu',
              url: `/dosen/${item.encrypted_id || item.id}`,
              metadata: {
                badge: item.bidang_ilmu,
              },
            });
          });
        }

        setSuggestions(allSuggestions);
      } else {
        // For mahasiswa, dosen, prodi only - use suggestions API (faster)
        const response = await getSearchSuggestions(searchQuery, 5);

        if (!response.success) {
          setSuggestions([]);
          return;
        }

        const allSuggestions: SearchSuggestion[] = [];

        // Mahasiswa suggestions
        if (response.data.suggestions.mahasiswa) {
          response.data.suggestions.mahasiswa.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama || '',
              subtitle: `${item.nim} - ${item.prodi}`,
              category: 'mahasiswa',
              url: `/mahasiswa/${item.encrypted_id || item.id}`,
              metadata: {
                badge: item.status,
              },
            });
          });
        }

        // Dosen suggestions
        if (response.data.suggestions.dosen) {
          response.data.suggestions.dosen.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama || '',
              subtitle: `${item.jabatan_fungsional} - ${item.prodi_homebase}`,
              category: 'dosen',
              url: `/dosen/${item.encrypted_id || item.id}`,
              metadata: {
                badge: item.jabatan_fungsional,
              },
            });
          });
        }

        // Prodi suggestions
        if (response.data.suggestions.prodi) {
          response.data.suggestions.prodi.forEach((item) => {
            allSuggestions.push({
              id: item.id,
              title: item.nama_prodi || '',
              subtitle: `${item.jenjang} - ${item.kode_prodi}`,
              category: 'prodi',
              url: `/program-studi/detail/${item.encrypted_id || item.id}`,
              metadata: {
                badge: `${item.jumlah_mahasiswa} Mahasiswa`,
              },
            });
          });
        }

        // Filter by category if not "all"
        const filtered = searchCategory === "all"
          ? allSuggestions
          : allSuggestions.filter((s) => s.category === searchCategory);

        setSuggestions(filtered);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim()) {
      debounceTimer.current = setTimeout(() => {
        fetchSuggestions(query, category);
      }, 300);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, category, fetchSuggestions]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  const handleSearch = () => {
    if (query.trim()) {
      const searchUrl = `/search?q=${encodeURIComponent(query)}&category=${category}`;
      router.push(searchUrl);
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    router.push(suggestion.url);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getCategoryIcon = (cat: SearchCategory) => {
    return CATEGORIES.find((c) => c.key === cat)?.icon || "📄";
  };

  const getCategoryLabel = (cat: SearchCategory) => {
    return CATEGORIES.find((c) => c.key === cat)?.label || cat;
  };

  // Render trigger button based on variant
  const renderTrigger = () => {
    if (variant === "hero") {
      return (
        <Button
          size="lg"
          radius="full"
          onClick={() => setIsOpen(true)}
          className="w-full max-w-3xl bg-white text-left justify-start shadow-2xl border-2 border-gray-200 hover:border-myunila hover:shadow-3xl transition-all duration-300 h-16 px-6 font-normal"
          startContent={
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          endContent={
            <div className="flex items-center gap-1.5 ml-auto px-2.5 py-1.5 bg-gray-100 rounded-lg">
              <Kbd className="bg-transparent shadow-none text-gray-600 font-semibold">⌘K</Kbd>
            </div>
          }
        >
          <span className="text-gray-500 text-base">Cari mahasiswa, dosen, penelitian...</span>
        </Button>
      );
    }

    if (variant === "navbar") {
      return (
        <Button
          size="sm"
          variant="flat"
          onClick={() => setIsOpen(true)}
          className="bg-white border border-gray-200 hover:border-gray-300"
          startContent={
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
          endContent={<Kbd keys={["command"]}>K</Kbd>}
        >
          <span className="text-gray-500 text-sm">Cari...</span>
        </Button>
      );
    }

    // Default button variant
    return (
      <Button
        size="md"
        color="primary"
        variant="flat"
        onClick={() => setIsOpen(true)}
        startContent={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      >
        Pencarian
      </Button>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <div className={className}>
        {renderTrigger()}
      </div>

      {/* Command Palette Modal - Modern & Responsive */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="3xl"
        placement="center"
        backdrop="opaque"
        scrollBehavior="inside"
        hideCloseButton
        motionProps={{
          variants: {
            enter: {
              scale: 1,
              opacity: 1,
              transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              },
            },
            exit: {
              scale: 0.95,
              opacity: 0,
              transition: {
                duration: 0.15,
                ease: [0.4, 0, 1, 1],
              },
            },
          },
        }}
        classNames={{
          backdrop: "bg-black/70 backdrop-blur-sm",
          wrapper: "items-start sm:items-center px-2 py-4 sm:p-6",
          base: "bg-white rounded-xl sm:rounded-2xl shadow-2xl max-h-[95vh] sm:max-h-[85vh] mt-2 sm:mt-0 mx-auto w-full",
        }}
      >
        <ModalContent className="bg-white">
          <ModalBody className="p-0">
            {/* Search Input Header */}
            <div className="sticky top-0 bg-white z-10 border-b border-gray-100">
              <div className="flex items-center gap-3 px-4 sm:px-6 py-4 sm:py-5">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-myunila flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ketik untuk mencari..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-sm sm:text-base lg:text-lg outline-none text-gray-900 placeholder-gray-400 font-medium bg-transparent border-0 focus:outline-none focus:ring-0"
                  autoComplete="off"
                />
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <span className="hidden sm:inline">ESC</span>
                  <span className="sm:hidden">✕</span>
                </button>
              </div>

              {/* Category Pills - Wrap on desktop, scroll on mobile */}
              <div className="px-3 sm:px-6 pb-3 sm:pb-4">
                {/* Mobile: Horizontal scroll */}
                <div
                  className="flex sm:hidden items-center gap-2 overflow-x-auto pb-1"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key as SearchCategory)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-200 flex-shrink-0 border ${
                        category === cat.key
                          ? "bg-myunila text-white shadow-md shadow-myunila/30 border-myunila"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border-gray-200"
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>

                {/* Desktop: Flex wrap */}
                <div className="hidden sm:flex items-center gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setCategory(cat.key as SearchCategory)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 border ${
                        category === cat.key
                          ? "bg-myunila text-white shadow-md shadow-myunila/30 border-myunila"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 border-gray-200"
                      }`}
                    >
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>

                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              </div>
            </div>

            {/* Results Container */}
            <div className="max-h-[60vh] sm:max-h-[50vh] overflow-y-auto bg-white">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20">
                  <Spinner size="lg" color="primary" className="w-10 h-10 sm:w-12 sm:h-12" />
                  <span className="mt-4 sm:mt-5 text-sm font-semibold text-gray-600">Mencari...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="p-3 sm:p-4 space-y-2">
                  {/* Results */}
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg transition-all duration-200 border ${
                        index === selectedIndex
                          ? "bg-myunila/5 border-myunila/30 shadow-sm"
                          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar/Icon */}
                        {suggestion.metadata?.imageUrl ? (
                          <Avatar
                            src={suggestion.metadata.imageUrl}
                            size="md"
                            className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10"
                          />
                        ) : (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-myunila to-blue-600 rounded-lg flex items-center justify-center text-white text-base sm:text-lg flex-shrink-0">
                            {getCategoryIcon(suggestion.category)}
                          </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                              {suggestion.title}
                            </p>
                          </div>
                          {suggestion.subtitle && (
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {suggestion.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Category Badge - Hidden on small screens */}
                        <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded-md border border-gray-200 flex-shrink-0">
                          <span>{getCategoryIcon(suggestion.category)}</span>
                          <span>{getCategoryLabel(suggestion.category)}</span>
                        </span>
                      </div>
                    </motion.button>
                  ))}

                  {/* View All Results Button */}
                  <div className="pt-2 sm:pt-3 px-1 sm:px-2">
                    <Button
                      fullWidth
                      size="lg"
                      className="bg-gradient-to-r from-myunila to-blue-600 text-white font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                      onClick={handleSearch}
                      startContent={
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      }
                    >
                      <span className="truncate">Lihat semua hasil "{query.slice(0, 20)}{query.length > 20 ? '...' : ''}"</span>
                    </Button>
                  </div>
                </div>
              ) : query.trim() ? (
                // No results found
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-5">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-gray-900 mb-2">Tidak ada hasil ditemukan</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 text-center max-w-xs">
                    Tidak ada hasil untuk "<span className="font-bold text-gray-700">{query}</span>"
                  </p>
                  <Button
                    size="md"
                    color="primary"
                    variant="flat"
                    onClick={handleSearch}
                    className="font-semibold text-sm"
                  >
                    Cari di semua kategori
                  </Button>
                </div>
              ) : (
                // Empty state - No query yet
                <div className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-myunila/10 to-blue-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-5">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-myunila" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-gray-900 mb-2">Mulai ketik untuk mencari</p>
                  <p className="text-xs sm:text-sm text-gray-500 text-center max-w-xs px-4">
                    Mahasiswa, Dosen, Penelitian, Publikasi, dan lainnya
                  </p>
                </div>
              )}
            </div>

            {/* Footer with Keyboard Hints */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-3 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded font-semibold text-[10px] sm:text-xs">↑↓</kbd>
                    <span className="text-gray-600 font-medium text-[10px] sm:text-xs">Navigasi</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded font-semibold text-[10px] sm:text-xs">Enter</kbd>
                    <span className="text-gray-600 font-medium text-[10px] sm:text-xs">Pilih</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <kbd className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded font-semibold text-[10px] sm:text-xs">ESC</kbd>
                    <span className="text-gray-600 font-medium text-[10px] sm:text-xs">Tutup</span>
                  </div>
                </div>
                <div className="hidden lg:flex items-center gap-1.5 text-gray-500 font-medium text-xs">
                  <span>Tekan</span>
                  <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded font-semibold">⌘K</kbd>
                  <span>untuk membuka</span>
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
