"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Input,
  Button,
  Card,
  CardBody,
  Avatar,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import {
  FiSearch,
  FiStar,
  FiBell,
  FiLogOut,
  FiSettings,
  FiUser,
  FiChevronRight,
  FiHome,
  FiInfo,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiFilter,
  FiCheck,
  FiLock,
} from "react-icons/fi";
import { Icon } from "@iconify/react";
import * as HeroIcons from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContextContext";
import { useRouter } from "next/navigation";
import { MdCampaign, MdConstruction } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import type { PortalApp, PortalCategory } from "@/lib/services/userContext/userContextService";

// Extended app type for local state (with favorites)
interface AppWithFavorite extends PortalApp {
  isFavorite: boolean;
  has_access: boolean;
}

interface CategoryWithFavorites extends Omit<PortalCategory, 'apps'> {
  apps: AppWithFavorite[];
}

export default function PortalPage() {
  // Protect this route - require authentication
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useRequireAuth();
  const { logout } = useAuth();
  const {
    roles,
    activeContext,
    portalData,
    isLoadingContext,
    isLoadingPortal,
    isSelectingContext,
    error: contextError,
    loadUserContext,
    loadPortalApps,
    selectContext,
    checkAppAccess,
    clearError,
  } = useUserContext();
  const router = useRouter();

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showComingSoonOnly, setShowComingSoonOnly] = useState(false);
  const [showTerintegrasiOnly, setShowTerintegrasiOnly] = useState(false);
  const [selectedKategoriIds, setSelectedKategoriIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppWithFavorite | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState("");
  const [accessDeniedRequiresRole, setAccessDeniedRequiresRole] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // LocalStorage key for favorites
  const FAVORITES_STORAGE_KEY = 'myunila_favorites';

  // Load favorites from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored) as string[]);
      }
    } catch (error) {
      console.error('Failed to load favorites from LocalStorage:', error);
    }
  }, []);

  // Load portal apps when authenticated
  useEffect(() => {
    if (isAuthenticated && !portalData && !isLoadingPortal) {
      loadPortalApps();
    }
  }, [isAuthenticated, portalData, isLoadingPortal, loadPortalApps]);

  // Set initial selected role when activeContext changes
  useEffect(() => {
    if (activeContext?.id_role_pengguna) {
      setSelectedRoleId(activeContext.id_role_pengguna);
    }
  }, [activeContext]);

  // Merge portal data with favorites
  const categoriesWithFavorites: CategoryWithFavorites[] = useMemo(() => {
    if (!portalData?.categories) return [];

    return portalData.categories.map(category => ({
      ...category,
      apps: (category.apps || []).map(app => ({
        ...app,
        isFavorite: favorites.includes(app.id_aplikasi),
      })),
    }));
  }, [portalData, favorites]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    if (!portalData?.categories) return [];
    return portalData.categories.map(cat => ({
      id_kategori: cat.id_kategori,
      nm_kategori: cat.nm_kategori,
      icon_kategori: cat.icon_kategori,
    }));
  }, [portalData]);

  // Filtered applications based on search and filters
  const filteredCategories = useMemo(() => {
    return categoriesWithFavorites
      .map(category => ({
        ...category,
        apps: category.apps.filter(app => {
          const matchesSearch =
            app.nm_aplikasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.ket_aplikasi || '').toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFavorite = !showFavoritesOnly || app.isFavorite;
          const matchesComingSoon = !showComingSoonOnly || app.a_coming_soon;
          const matchesTerintegrasi = !showTerintegrasiOnly || app.a_terintegrasi;
          return matchesSearch && matchesFavorite && matchesComingSoon && matchesTerintegrasi;
        }),
      }))
      .filter(category => {
        // Filter by kategori if any selected
        if (selectedKategoriIds.length > 0 && !selectedKategoriIds.includes(category.id_kategori)) {
          return false;
        }
        return category.apps.length > 0;
      });
  }, [categoriesWithFavorites, searchQuery, showFavoritesOnly, showComingSoonOnly, showTerintegrasiOnly, selectedKategoriIds]);

  // Count apps by filter type
  const filterCounts = useMemo(() => {
    const allApps = categoriesWithFavorites.flatMap(cat => cat.apps);
    // Count locked only for production apps (a_live AND a_terintegrasi)
    const productionApps = allApps.filter(app => app.a_live && app.a_terintegrasi);
    return {
      favorites: allApps.filter(app => app.isFavorite).length,
      comingSoon: allApps.filter(app => app.a_coming_soon).length,
      terintegrasi: allApps.filter(app => app.a_terintegrasi).length,
      locked: productionApps.filter(app => !app.has_access).length,
      accessible: productionApps.filter(app => app.has_access).length,
    };
  }, [categoriesWithFavorites]);

  // Clear all filters
  const clearFilters = () => {
    setShowFavoritesOnly(false);
    setShowComingSoonOnly(false);
    setShowTerintegrasiOnly(false);
    setSelectedKategoriIds([]);
  };

  // Check if any filter is active
  const hasActiveFilters = showFavoritesOnly || showComingSoonOnly || showTerintegrasiOnly || selectedKategoriIds.length > 0;

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (showFavoritesOnly) count++;
    if (showComingSoonOnly) count++;
    if (showTerintegrasiOnly) count++;
    count += selectedKategoriIds.length;
    return count;
  }, [showFavoritesOnly, showComingSoonOnly, showTerintegrasiOnly, selectedKategoriIds]);

  // Toggle kategori selection
  const toggleKategori = (kategoriId: string) => {
    setSelectedKategoriIds(prev =>
      prev.includes(kategoriId)
        ? prev.filter(id => id !== kategoriId)
        : [...prev, kategoriId]
    );
  };

  // Get all favorite apps (only accessible ones for quick access)
  const favoriteApps = useMemo(() => {
    return categoriesWithFavorites.flatMap(cat => cat.apps.filter(app => app.isFavorite && app.has_access));
  }, [categoriesWithFavorites]);

  // Dummy notifications data
  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem",
      message: "Sistem myUnila akan dilakukan maintenance pada tanggal 15 Januari 2025",
      time: "2 jam yang lalu",
      isRead: false,
      type: "info",
    },
    {
      id: 2,
      title: "Pengumuman Beasiswa",
      message: "Pendaftaran beasiswa semester genap 2024/2025 telah dibuka",
      time: "5 jam yang lalu",
      isRead: false,
      type: "announcement",
    },
  ];

  // Dummy announcements
  const announcements = [
    {
      id: 1,
      title: "Beasiswa Asih",
      description: "Beasiswa Asih",
      category: "Kegiatan",
      date: "30 Desember 2024",
      isNew: true,
    },
    {
      id: 2,
      title: "Pengumuman Penghapusan Akun",
      description: "Dalam rangka implementasi kebijakan TIK, UPA TIK mengumumkan bahwa akun email...",
      category: "Lainnya",
      date: "28 Desember 2024",
      isNew: false,
    },
  ];

  // Function to get user initials
  const getInitials = (fullName: string) => {
    const nameParts = fullName.split(",")[0].trim().split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  // Toggle favorite
  const toggleFavorite = (appId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(appId)
        ? prev.filter(id => id !== appId)
        : [...prev, appId];

      // Save to LocalStorage
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      } catch (error) {
        console.error('Failed to save favorites to LocalStorage:', error);
      }

      return newFavorites;
    });
  };

  // Handle role selection
  const handleRoleChange = async () => {
    if (!selectedRoleId) return;

    const selectedRole = roles.find(r => r.id_role_pengguna === selectedRoleId);
    const success = await selectContext(selectedRoleId);
    if (success) {
      setShowRoleModal(false);
      toast.success(
        `Peran berhasil diubah ke ${selectedRole?.nm_peran || 'peran baru'}`,
        { duration: 3000 }
      );
    } else {
      toast.error('Gagal mengubah peran. Silakan coba lagi.');
    }
  };

  // Handle app click
  const handleAppClick = async (app: AppWithFavorite) => {
    // Determine if app is in production (a_live AND a_terintegrasi)
    const isProduction = app.a_live && app.a_terintegrasi;

    // Check if locked (no access) - only for production apps
    if (isProduction && !app.has_access) {
      setSelectedApp(app);
      // Check if user hasn't selected a role yet
      if (!activeContext) {
        setAccessDeniedMessage(`Anda belum memilih peran untuk mengakses aplikasi ${app.nm_aplikasi}`);
        setAccessDeniedRequiresRole(true);
      } else {
        setAccessDeniedMessage(
          `Role ${activeContext?.nm_peran || 'Anda'} di unit ${activeContext?.nm_organisasi || ''} tidak memiliki akses ke aplikasi ${app.nm_aplikasi}`
        );
        setAccessDeniedRequiresRole(false);
      }
      setShowAccessDeniedModal(true);
      return;
    }

    // Check if coming soon
    if (app.a_coming_soon) {
      setSelectedApp(app);
      setShowComingSoonModal(true);
      return;
    }

    // Check if maintenance
    if (app.a_maintenance) {
      setSelectedApp(app);
      setShowMaintenanceModal(true);
      return;
    }

    // Check if URL exists or not integrated yet
    if (!app.url || app.url === '#' || !isProduction) {
      setSelectedApp(app);
      setShowComingSoonModal(true);
      return;
    }

    // Check access via API for additional menu_role validation (only for production apps)
    if (isProduction) {
      // Show loading modal while checking access
      setSelectedApp(app);
      setIsCheckingAccess(true);
      setShowAccessDeniedModal(true);

      try {
        const accessResult = await checkAppAccess(app.id_aplikasi);

        if (accessResult.requiresSelection) {
          // Need to select a role first
          setShowAccessDeniedModal(false);
          setIsCheckingAccess(false);
          setShowRoleModal(true);
          return;
        }

        if (!accessResult.hasAccess) {
          setAccessDeniedMessage(accessResult.message);
          setAccessDeniedRequiresRole(accessResult.requiresSelection);
          setIsCheckingAccess(false);
          return;
        }

        // Has access - close modal and navigate
        setShowAccessDeniedModal(false);
        setIsCheckingAccess(false);
      } catch (error) {
        setAccessDeniedMessage("Gagal memeriksa akses. Silakan coba lagi.");
        setAccessDeniedRequiresRole(false);
        setIsCheckingAccess(false);
        return;
      }
    }

    // Navigate to the app
    if (app.url.startsWith('http')) {
      window.open(app.url, '_blank');
    } else {
      router.push(app.url);
    }
  };

  /**
   * Convert React Icons format to Iconify format
   * Examples:
   * - FaBlog -> fa:blog
   * - RiGovernmentFill -> ri:government-fill
   * - BsCash -> bi:cash (Bootstrap Icons)
   * - HiUsers -> heroicons-outline:users
   * - FiHome -> feather:home
   * - MdDashboard -> mdi:dashboard
   */
  const convertToIconifyFormat = (reactIconName: string): string => {
    // Already in Iconify format (contains colon)
    if (reactIconName.includes(':')) {
      return reactIconName;
    }

    // Map React Icons prefixes to Iconify prefixes
    const prefixMap: Record<string, string> = {
      'Fa': 'fa6-solid',      // Font Awesome 6
      'FaReg': 'fa6-regular', // Font Awesome 6 Regular
      'Ri': 'ri',             // Remix Icons
      'Bs': 'bi',             // Bootstrap Icons
      'Hi': 'heroicons-outline', // Heroicons
      'Hi2': 'heroicons',     // Heroicons v2
      'Fi': 'feather',        // Feather Icons
      'Md': 'mdi',            // Material Design Icons
      'Ai': 'ant-design',     // Ant Design Icons
      'Io': 'ion',            // Ionicons
      'Io5': 'ion',           // Ionicons 5
      'Bi': 'bi',             // Bootstrap Icons (alternative)
      'Cg': 'cg',             // css.gg
      'Gi': 'game-icons',     // Game Icons
      'Go': 'octicon',        // GitHub Octicons
      'Gr': 'grommet-icons',  // Grommet Icons
      'Im': 'icomoon-free',   // IcoMoon Free
      'Si': 'simple-icons',   // Simple Icons
      'Tb': 'tabler',         // Tabler Icons
      'Ti': 'typcn',          // Typicons
      'Vsc': 'vscode-icons',  // VS Code Icons
      'Wi': 'wi',             // Weather Icons
    };

    // Try to match prefix (longest match first)
    const sortedPrefixes = Object.keys(prefixMap).sort((a, b) => b.length - a.length);

    for (const prefix of sortedPrefixes) {
      if (reactIconName.startsWith(prefix)) {
        const iconName = reactIconName.slice(prefix.length);
        // Convert PascalCase to kebab-case
        const kebabName = iconName
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase();
        return `${prefixMap[prefix]}:${kebabName}`;
      }
    }

    // Fallback: try to parse as generic format
    // e.g., "SomeIcon" -> "some-icon"
    const kebabName = reactIconName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
    return `mdi:${kebabName}`;
  };

  // Get icon component from icon_name
  const getAppIcon = (iconName: string | null, iconColor: string | null) => {
    if (!iconName) {
      return <FiInfo className="w-6 h-6 text-white" />;
    }

    // If icon is in heroicons:icon-name format, use @heroicons/react directly
    if (iconName.startsWith('heroicons:')) {
      const iconKey = iconName.replace('heroicons:', '');
      // Convert kebab-case to PascalCase for React component name
      const componentName = iconKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('') + 'Icon';

      const HeroIcon = (HeroIcons as any)[componentName];

      if (HeroIcon) {
        return <HeroIcon className="w-6 h-6 text-white" />;
      } else {
        // If Heroicon not found, fallback to Iconify
        return (
          <Icon
            icon={iconName}
            style={{ width: 24, height: 24, color: 'white' }}
          />
        );
      }
    }

    // Fallback to Iconify for other icon formats
    const iconifyName = convertToIconifyFormat(iconName);
    return (
      <Icon
        icon={iconifyName}
        style={{ width: 24, height: 24, color: 'white' }}
      />
    );
  };

  // Get background color (returns hex color for inline style)
  const getIconBgColor = (iconColor: string | null): string => {
    if (!iconColor) return '#3b82f6'; // blue-500

    // If already a hex color, return it
    if (iconColor.startsWith('#')) {
      return iconColor;
    }

    // Map Tailwind color classes to hex values
    const colorMap: { [key: string]: string } = {
      'text-green-600': '#16a34a',
      'text-blue-600': '#2563eb',
      'text-teal-600': '#0d9488',
      'text-violet-600': '#7c3aed',
      'text-rose-600': '#e11d48',
      'text-lime-600': '#65a30d',
      'text-purple-600': '#9333ea',
      'text-orange-600': '#ea580c',
      'text-pink-600': '#db2777',
      'text-cyan-600': '#0891b2',
      'text-indigo-600': '#4f46e5',
      'text-red-600': '#dc2626',
      'text-yellow-600': '#ca8a04',
      'text-emerald-600': '#059669',
      'text-sky-600': '#0284c7',
      'text-amber-600': '#d97706',
      'text-fuchsia-600': '#c026d3',
      // Fallback for bg- prefix
      'bg-green-600': '#16a34a',
      'bg-blue-600': '#2563eb',
      'bg-teal-600': '#0d9488',
      'bg-violet-600': '#7c3aed',
      'bg-rose-600': '#e11d48',
      'bg-lime-600': '#65a30d',
      'bg-purple-600': '#9333ea',
      'bg-orange-600': '#ea580c',
      'bg-pink-600': '#db2777',
      'bg-cyan-600': '#0891b2',
      'bg-indigo-600': '#4f46e5',
      'bg-red-600': '#dc2626',
      'bg-yellow-600': '#ca8a04',
      'bg-emerald-600': '#059669',
      'bg-sky-600': '#0284c7',
      'bg-amber-600': '#d97706',
      'bg-fuchsia-600': '#c026d3',
    };

    return colorMap[iconColor] || '#3b82f6'; // Default to blue-500
  };

  // Use authenticated user data
  const user = authUser || {
    name: "Guest User",
    email: "",
    role: "Guest",
    username: "guest",
  };

  // Show loading while checking authentication or loading data
  if (authLoading || (isLoadingContext && !portalData)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Skeleton className="h-8 w-32 rounded-lg" />
              <div className="hidden md:flex flex-1 mx-8">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
            <div className="md:hidden pb-3">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content Skeleton */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>

              {/* Apps Grid Skeleton */}
              <div className="space-y-8">
                {[1, 2, 3].map((category) => (
                  <div key={category}>
                    <Skeleton className="h-6 w-32 rounded-lg mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {[1, 2, 3, 4, 5, 6].map((app) => (
                        <Card key={app} className="bg-white border border-gray-100">
                          <CardBody className="p-3 sm:p-4">
                            <div className="flex flex-col items-center text-center sm:hidden gap-2">
                              <Skeleton className="h-12 w-12 rounded-xl" />
                              <Skeleton className="h-4 w-24 rounded-lg" />
                            </div>
                            <div className="hidden sm:flex items-start gap-3">
                              <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-32 rounded-lg" />
                                <Skeleton className="h-3 w-full rounded-lg" />
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <aside className="lg:w-80 w-full space-y-6 hidden lg:block">
              <Card className="bg-white shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                      <Skeleton className="h-8 w-28 rounded-lg mt-2" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </aside>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (contextError && !portalData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Gagal Memuat Data</h3>
            <p className="text-gray-600 mb-6">{contextError}</p>
            <Button
              color="primary"
              className="bg-myunila text-white"
              startContent={<FiRefreshCw className="w-4 h-4" />}
              onPress={() => {
                clearError();
                loadPortalApps();
              }}
            >
              Coba Lagi
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Toast Container */}
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-bold text-myunila">myUnila Portal</h1>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 mx-8">
              <Input
                placeholder="Cari aplikasi atau layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<FiSearch className="text-gray-400 ml-1" />}
                classNames={{
                  input: "bg-white focus:outline-none pl-3",
                  inputWrapper:
                    "bg-transparent hover:bg-gray-100 border-0 shadow-none focus-within:bg-white data-[hover=true]:bg-gray-100 group-data-[focus=true]:bg-white !outline-none px-3",
                }}
                size="md"
              />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Role Button */}
              {activeContext && (
                <Button
                  onClick={() => setShowRoleModal(true)}
                  variant="flat"
                  size="sm"
                  className="bg-blue-50 text-myunila hover:bg-blue-100 font-medium"
                  startContent={<FiUser className="w-4 h-4" />}
                  isLoading={isSelectingContext}
                >
                  <span className="text-xs hidden sm:inline">
                    {activeContext.nm_peran} - {activeContext.nm_organisasi?.substring(0, 20)}
                    {(activeContext.nm_organisasi?.length || 0) > 20 ? '...' : ''}
                  </span>
                  <span className="text-xs sm:hidden">Ganti Peran</span>
                </Button>
              )}

              {/* Show "Pilih Peran" button if no context */}
              {!activeContext && roles.length > 0 && (
                <Button
                  onClick={() => setShowRoleModal(true)}
                  variant="flat"
                  size="sm"
                  color="warning"
                  className="font-medium"
                  startContent={<FiAlertCircle className="w-4 h-4" />}
                >
                  <span className="text-xs">Pilih Peran</span>
                </Button>
              )}

              {/* Notification Dropdown */}
              <Dropdown placement="bottom-end" isOpen={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    variant="light"
                    className="relative hover:bg-gray-100 rounded-lg"
                    aria-label="Notifikasi"
                  >
                    <FiBell className="w-5 h-5 text-gray-600" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Notifications"
                  className="w-80 max-h-96 overflow-y-auto bg-white shadow-xl border border-gray-200 p-0"
                  style={{ backgroundColor: 'white' }}
                  itemClasses={{
                    base: "p-0",
                  }}
                  items={[
                    { type: 'header', id: 'header' },
                    ...notifications.map(n => ({ ...n, type: 'notification' })),
                    { type: 'footer', id: 'footer' }
                  ]}
                >
                  {(item: any) => {
                    if (item.type === 'header') {
                      return (
                        <DropdownItem
                          key="header"
                          className="h-auto py-3 px-4 opacity-100 border-b border-gray-200"
                          textValue="Notifikasi Header"
                          isReadOnly
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Notifikasi</h3>
                            <Chip size="sm" color="primary" className="bg-myunila text-white">
                              {notifications.filter(n => !n.isRead).length} Baru
                            </Chip>
                          </div>
                        </DropdownItem>
                      );
                    }
                    if (item.type === 'footer') {
                      return (
                        <DropdownItem
                          key="footer"
                          className="h-auto py-3 px-4 opacity-100 bg-gray-50 hover:bg-gray-100 text-center"
                          textValue="Lihat Semua"
                        >
                          <p className="text-sm font-semibold text-myunila">
                            Lihat Semua Notifikasi
                          </p>
                        </DropdownItem>
                      );
                    }
                    return (
                      <DropdownItem
                        key={item.id}
                        className={`h-auto py-3 px-4 border-b border-gray-100 last:border-0 ${
                          !item.isRead ? "bg-blue-50" : "bg-white"
                        } hover:bg-gray-50`}
                        textValue={item.title}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              !item.isRead ? "bg-myunila" : "bg-gray-300"
                            }`}></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 mb-1">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                              {item.message}
                            </p>
                            <p className="text-xs text-gray-400">{item.time}</p>
                          </div>
                        </div>
                      </DropdownItem>
                    );
                  }}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-3">
            <Input
              placeholder="Cari aplikasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<FiSearch className="text-gray-400" />}
              classNames={{
                input: "bg-white",
                inputWrapper: "bg-gray-100 border-0 shadow-none",
              }}
              size="sm"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header & Filters */}
            <div className="mb-6 space-y-3">
              {/* Title & Filter Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Aplikasi dan Layanan
                  </h2>
                  {portalData && (
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredCategories.reduce((acc, cat) => acc + cat.apps.length, 0)} aplikasi
                      {filterCounts.locked > 0 && (
                        <span className="ml-1 text-gray-400">
                          ({filterCounts.accessible} dapat diakses, {filterCounts.locked} akses terbatas)
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isLoadingPortal && (
                    <Spinner size="sm" color="primary" />
                  )}
                  {/* Filter Button with Popover */}
                  <Popover
                  placement="bottom-start"
                  isOpen={isFilterOpen}
                  onOpenChange={setIsFilterOpen}
                  classNames={{
                    content: "p-0 bg-white shadow-xl border border-gray-200 rounded-xl",
                  }}
                >
                  <PopoverTrigger>
                    <Button
                      variant={hasActiveFilters ? "solid" : "bordered"}
                      size="sm"
                      className={
                        hasActiveFilters
                          ? "bg-myunila text-white border-myunila"
                          : "border-gray-300 text-gray-600 hover:border-myunila hover:text-myunila"
                      }
                      startContent={<FiFilter className="w-3.5 h-3.5" />}
                      endContent={
                        activeFilterCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/20">
                            {activeFilterCount}
                          </span>
                        )
                      }
                    >
                      Tampilkan Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="w-72 bg-white rounded-xl">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h4 className="font-semibold text-gray-800">Filter Tampilan</h4>
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            Reset Semua
                          </button>
                        )}
                      </div>

                      {/* Status Section */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</p>
                        <div className="space-y-1">
                          {/* Favorites */}
                          <button
                            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              showFavoritesOnly ? 'bg-yellow-50 text-yellow-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              showFavoritesOnly
                                ? 'bg-yellow-500 border-yellow-500'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {showFavoritesOnly && <FiCheck className="w-3 h-3 text-white" />}
                            </div>
                            <FiStar className={`w-4 h-4 ${showFavoritesOnly ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
                            <span className="flex-1 text-left text-sm">Favorit</span>
                            <span className="text-xs text-gray-400">({filterCounts.favorites})</span>
                          </button>

                          {/* Coming Soon */}
                          <button
                            onClick={() => setShowComingSoonOnly(!showComingSoonOnly)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              showComingSoonOnly ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              showComingSoonOnly
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {showComingSoonOnly && <FiCheck className="w-3 h-3 text-white" />}
                            </div>
                            <Icon icon="heroicons:clock" className={`w-4 h-4 ${showComingSoonOnly ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="flex-1 text-left text-sm">Coming Soon</span>
                            <span className="text-xs text-gray-400">({filterCounts.comingSoon})</span>
                          </button>

                          {/* Terintegrasi */}
                          <button
                            onClick={() => setShowTerintegrasiOnly(!showTerintegrasiOnly)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              showTerintegrasiOnly ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              showTerintegrasiOnly
                                ? 'bg-emerald-500 border-emerald-500'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {showTerintegrasiOnly && <FiCheck className="w-3 h-3 text-white" />}
                            </div>
                            <Icon icon="heroicons:link" className={`w-4 h-4 ${showTerintegrasiOnly ? 'text-emerald-500' : 'text-gray-400'}`} />
                            <span className="flex-1 text-left text-sm">Terintegrasi</span>
                            <span className="text-xs text-gray-400">({filterCounts.terintegrasi})</span>
                          </button>
                        </div>
                      </div>

                      {/* Category Section */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kategori</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {uniqueCategories.map(kategori => {
                            const isSelected = selectedKategoriIds.includes(kategori.id_kategori);
                            return (
                              <button
                                key={kategori.id_kategori}
                                onClick={() => toggleKategori(kategori.id_kategori)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                  isSelected ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-purple-500 border-purple-500'
                                    : 'border-gray-300 bg-white'
                                }`}>
                                  {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                                </div>
                                {kategori.icon_kategori && (
                                  <Icon icon={kategori.icon_kategori} className={`w-4 h-4 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`} />
                                )}
                                <span className="flex-1 text-left text-sm truncate">{kategori.nm_kategori}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                        <Button
                          size="sm"
                          className="w-full bg-myunila text-white"
                          onClick={() => setIsFilterOpen(false)}
                        >
                          Terapkan Filter
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                </div>
              </div>

              {/* Active Filter Tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {showFavoritesOnly && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="bg-yellow-100 text-yellow-700"
                      onClose={() => setShowFavoritesOnly(false)}
                    >
                      <FiStar className="w-3 h-3 mr-1 inline fill-yellow-500" />
                      Favorit
                    </Chip>
                  )}
                  {showComingSoonOnly && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="bg-blue-100 text-blue-700"
                      onClose={() => setShowComingSoonOnly(false)}
                    >
                      <Icon icon="heroicons:clock" className="w-3 h-3 mr-1 inline" />
                      Coming Soon
                    </Chip>
                  )}
                  {showTerintegrasiOnly && (
                    <Chip
                      size="sm"
                      variant="flat"
                      className="bg-emerald-100 text-emerald-700"
                      onClose={() => setShowTerintegrasiOnly(false)}
                    >
                      <Icon icon="heroicons:link" className="w-3 h-3 mr-1 inline" />
                      Terintegrasi
                    </Chip>
                  )}
                  {selectedKategoriIds.map(kategoriId => {
                    const kategori = uniqueCategories.find(k => k.id_kategori === kategoriId);
                    if (!kategori) return null;
                    return (
                      <Chip
                        key={kategoriId}
                        size="sm"
                        variant="flat"
                        className="bg-purple-100 text-purple-700"
                        onClose={() => toggleKategori(kategoriId)}
                      >
                        {kategori.icon_kategori && (
                          <Icon icon={kategori.icon_kategori} className="w-3 h-3 mr-1 inline" />
                        )}
                        {kategori.nm_kategori}
                      </Chip>
                    );
                  })}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-red-500 font-medium ml-1"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Applications Grid */}
            {filteredCategories.length === 0 ? (
              <Card className="bg-white shadow-sm">
                <CardBody className="py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="heroicons:magnifying-glass" className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">
                    {searchQuery
                      ? "Tidak ada aplikasi yang sesuai dengan pencarian"
                      : showFavoritesOnly
                      ? "Belum ada aplikasi favorit"
                      : showComingSoonOnly
                      ? "Tidak ada aplikasi Coming Soon"
                      : showTerintegrasiOnly
                      ? "Tidak ada aplikasi terintegrasi"
                      : selectedKategoriIds.length > 0
                      ? "Tidak ada aplikasi dalam kategori yang dipilih"
                      : "Tidak ada aplikasi tersedia"}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="flat"
                      size="sm"
                      color="primary"
                      className="mt-2"
                      startContent={<FiX className="w-4 h-4" />}
                    >
                      Reset Filter
                    </Button>
                  )}
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredCategories.map((category, catIndex) => (
                  <motion.div
                    key={category.id_kategori}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: catIndex * 0.1 }}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center gap-2">
                      {category.icon_kategori && (
                        <Icon icon={category.icon_kategori} className="w-5 h-5" />
                      )}
                      {category.nm_kategori}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {category.apps.map((app) => {
                        const bgColor = getIconBgColor(app.icon_color);
                        // Show "Akses Terbatas" only for production apps (a_live AND a_terintegrasi)
                        const isProduction = app.a_live && app.a_terintegrasi;
                        const isLocked = !app.has_access && isProduction;

                        return (
                          <motion.div
                            key={app.id_aplikasi}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full"
                          >
                            <Card
                              isPressable
                              onPress={() => handleAppClick(app)}
                              className={`bg-white hover:shadow-lg transition-all duration-300 border h-full w-full relative ${
                                isLocked
                                  ? 'border-gray-200'
                                  : app.a_maintenance || app.a_coming_soon
                                    ? 'opacity-75 border-gray-100'
                                    : 'border-gray-100'
                              }`}
                            >
                              <CardBody className="p-3 sm:p-4 flex flex-col h-full">
                                {/* Mobile Layout */}
                                <div className="flex flex-col items-center text-center sm:hidden gap-2">
                                  <div className="relative">
                                    <div
                                      className="p-2.5 rounded-xl text-white flex-shrink-0"
                                      style={{ backgroundColor: bgColor }}
                                    >
                                      <div className="w-6 h-6 flex items-center justify-center">
                                        {getAppIcon(app.icon_name, app.icon_color)}
                                      </div>
                                    </div>
                                    {/* Lock badge for mobile */}
                                    {isLocked && (
                                      <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 shadow-sm">
                                        <FiLock className="w-2.5 h-2.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="w-full">
                                    <h4 className="font-semibold text-gray-800 text-xs line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                                      {app.nm_aplikasi}
                                    </h4>
                                    {isLocked ? (
                                      <Chip size="sm" variant="flat" className="mt-1 text-[10px] bg-orange-100 text-orange-600" startContent={<FiLock className="w-2.5 h-2.5" />}>
                                        Akses Terbatas
                                      </Chip>
                                    ) : (app.a_maintenance || app.a_coming_soon) && (
                                      <Chip size="sm" color={app.a_maintenance ? "warning" : "primary"} variant="flat" className="mt-1 text-[10px]">
                                        {app.a_maintenance ? "Maintenance" : "Coming Soon"}
                                      </Chip>
                                    )}
                                  </div>
                                </div>

                                {/* Desktop/Tablet Layout */}
                                <div className="hidden sm:flex items-start gap-3">
                                  <div className="relative flex-shrink-0">
                                    <div
                                      className="p-3 rounded-xl text-white"
                                      style={{ backgroundColor: bgColor }}
                                    >
                                      <div className="w-6 h-6">
                                        {getAppIcon(app.icon_name, app.icon_color)}
                                      </div>
                                    </div>
                                    {/* Lock badge for desktop */}
                                    {isLocked && (
                                      <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full p-1 shadow-sm">
                                        <FiLock className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 pr-6">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <h4 className="font-semibold text-sm line-clamp-1 text-gray-800">
                                        {app.nm_aplikasi}
                                      </h4>
                                      {isLocked ? (
                                        <Chip size="sm" variant="flat" className="text-[10px] bg-orange-100 text-orange-600" startContent={<FiLock className="w-2.5 h-2.5" />}>
                                          Akses Terbatas
                                        </Chip>
                                      ) : (app.a_maintenance || app.a_coming_soon) && (
                                        <Chip size="sm" color={app.a_maintenance ? "warning" : "primary"} variant="flat" className="text-[10px]">
                                          {app.a_maintenance ? "Maintenance" : "Soon"}
                                        </Chip>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                      {app.ket_aplikasi || 'Tidak ada deskripsi'}
                                    </p>
                                  </div>
                                </div>
                              </CardBody>
                              {/* Favorite Button - show for all apps */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(app.id_aplikasi);
                                }}
                                className="absolute top-2 right-2 sm:top-4 sm:right-4 cursor-pointer z-10 p-1 hover:bg-white/80 rounded-full transition-colors"
                              >
                                <FiStar
                                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                                    app.isFavorite
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300 hover:text-yellow-400"
                                  }`}
                                />
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - RIGHT */}
          <aside
            className={`
            lg:w-80 w-full lg:block
            ${sidebarOpen ? "block" : "hidden"}
            space-y-6
          `}
          >
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-gradient-to-br from-myunila to-blue-700 text-white shadow-lg">
                <CardBody className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar
                      size="lg"
                      className="w-16 h-16 border-2 border-white"
                      name={getInitials(user.name)}
                      showFallback
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-2">{user.name}</h3>
                      {/* Organization Info */}
                      <div className="space-y-1 mb-3">
                        {activeContext ? (
                          <>
                            <p className="text-xs text-blue-100 leading-relaxed">{activeContext.nm_peran}</p>
                            <p className="text-xs text-blue-100 leading-relaxed">{activeContext.nm_organisasi}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-blue-100 leading-relaxed">{user.role || 'Pengguna'}</p>
                            <p className="text-xs text-blue-100 leading-relaxed">
                              {user.fakultas || user.satuan_pendidikan || 'Universitas Lampung'}
                            </p>
                          </>
                        )}
                      </div>
                      <Dropdown placement="bottom-start">
                        <DropdownTrigger>
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-white/20 text-white hover:bg-white/30 font-semibold text-xs"
                            endContent={<FiChevronRight className="w-4 h-4" />}
                          >
                            Kelola Akun
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="User Actions"
                          className="w-48 bg-white shadow-lg border border-gray-200 p-1"
                          style={{ backgroundColor: 'white' }}
                          itemClasses={{
                            base: [
                              "rounded-lg",
                              "data-[hover=true]:bg-gray-100",
                              "data-[hover=true]:text-gray-900",
                              "transition-colors",
                            ],
                          }}
                        >
                          <DropdownItem
                            key="profile"
                            startContent={<FiUser className="w-4 h-4" />}
                            as={Link}
                            href="/portal/profile"
                          >
                            Profil Saya
                          </DropdownItem>
                          <DropdownItem
                            key="settings"
                            startContent={<FiSettings className="w-4 h-4" />}
                            as={Link}
                            href="/portal/settings"
                          >
                            Pengaturan
                          </DropdownItem>
                          <DropdownItem
                            key="logout"
                            color="danger"
                            className="text-danger"
                            startContent={<FiLogOut className="w-4 h-4" />}
                            onPress={() => logout()}
                          >
                            Keluar
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white shadow-sm">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <MdCampaign className="w-5 h-5 text-myunila" />
                      Pengumuman
                    </h3>
                    <Link href="/portal/announcements">
                      <Button
                        size="sm"
                        variant="light"
                        className="text-myunila text-xs"
                      >
                        Lihat Semua
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <Chip
                            size="sm"
                            className={`text-xs ${
                              announcement.isNew
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {announcement.category}
                          </Chip>
                          {announcement.isNew && (
                            <Chip
                              size="sm"
                              className="bg-myunila text-white text-xs"
                            >
                              Baru
                            </Chip>
                          )}
                        </div>
                        <h4 className="font-semibold text-sm text-gray-800 mb-1">
                          {announcement.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                          {announcement.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {announcement.date}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </motion.div>

            {/* Quick Access - Favorites */}
            {favoriteApps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-white shadow-sm">
                  <CardBody className="p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiStar className="w-5 h-5 text-yellow-500" />
                      Akses Cepat
                    </h3>
                    <div className="space-y-2">
                      {favoriteApps.slice(0, 5).map((app) => {
                        const bgColor = getIconBgColor(app.icon_color);

                        return (
                          <button
                            key={app.id_aplikasi}
                            onClick={() => handleAppClick(app)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                          >
                            <div
                              className="p-2 rounded-lg text-white"
                              style={{ backgroundColor: bgColor }}
                            >
                              {getAppIcon(app.icon_name, app.icon_color)}
                            </div>
                            <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                              {app.nm_aplikasi}
                            </span>
                            <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-myunila transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => {
              setActiveTab("home");
              clearFilters();
              setSidebarOpen(false);
            }}
            className={`h-16 flex flex-col items-center justify-center gap-1 transition-all ${
              activeTab === "home" && !hasActiveFilters
                ? "text-myunila bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiHome className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium">Beranda</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("favorites");
              clearFilters();
              setShowFavoritesOnly(true);
              setSidebarOpen(false);
            }}
            className={`h-16 flex flex-col items-center justify-center gap-1 transition-all relative ${
              showFavoritesOnly
                ? "text-myunila bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FiStar className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-medium">Favorit</span>
            {filterCounts.favorites > 0 && (
              <span className="absolute top-2 right-1/4 w-2 h-2 bg-yellow-500 rounded-full"></span>
            )}
          </button>

          <Link href="/portal/announcements" className="flex-1">
            <button
              className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "announcements"
                  ? "text-myunila bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MdCampaign className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Pengumuman</span>
            </button>
          </Link>

          <Link href="/portal/profile" className="flex-1">
            <button
              className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === "profile"
                  ? "text-myunila bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiUser className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium">Profil</span>
            </button>
          </Link>
        </div>
      </nav>

      {/* Role Switching Modal */}
      <Modal
        isOpen={showRoleModal}
        onOpenChange={setShowRoleModal}
        size="md"
        backdrop="opaque"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          base: "mx-4 sm:mx-0",
        }}
      >
        <ModalContent className="bg-white max-h-[85vh] sm:max-h-[90vh]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 sm:gap-1 border-b border-gray-200 pb-3 sm:pb-4 sticky top-0 bg-white z-10 px-4 sm:px-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pilih Peran</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">
                  Pilih peran dan unit kerja yang ingin Anda gunakan
                </p>
              </ModalHeader>
              <ModalBody className="py-4 sm:py-6 px-4 sm:px-6 overflow-y-auto">
                {roles.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {roles.filter(r => r.approval_peran).map((role) => (
                      <button
                        key={role.id_role_pengguna}
                        onClick={() => setSelectedRoleId(role.id_role_pengguna)}
                        className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedRoleId === role.id_role_pengguna
                            ? "border-myunila bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                              selectedRoleId === role.id_role_pengguna ? "bg-myunila text-white" : "bg-gray-200 text-gray-600"
                            }`}>
                              <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm sm:text-base ${
                                selectedRoleId === role.id_role_pengguna ? "text-myunila" : "text-gray-800"
                              }`}>
                                {role.nm_peran}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {role.nm_organisasi}
                              </p>
                            </div>
                          </div>
                          {selectedRoleId === role.id_role_pengguna && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-myunila text-white flex items-center justify-center flex-shrink-0 ml-2">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Show pending roles */}
                    {roles.filter(r => !r.approval_peran).length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Menunggu Persetujuan:</p>
                        {roles.filter(r => !r.approval_peran).map((role) => (
                          <div
                            key={role.id_role_pengguna}
                            className="w-full p-3 rounded-lg border border-gray-200 bg-gray-50 opacity-60"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-gray-600">{role.nm_peran}</p>
                                <p className="text-xs text-gray-400">{role.nm_organisasi}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <p className="text-gray-500 text-xs sm:text-sm">Tidak ada peran yang tersedia</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 pt-3 sm:pt-4 sticky bottom-0 bg-white z-10 px-4 sm:px-6 gap-2">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-gray-600 hover:bg-gray-100 font-medium text-xs sm:text-sm"
                  size="sm"
                >
                  Batal
                </Button>
                <Button
                  className="bg-myunila text-white hover:bg-blue-700 font-medium text-xs sm:text-sm"
                  onPress={handleRoleChange}
                  isLoading={isSelectingContext}
                  isDisabled={!selectedRoleId}
                  size="sm"
                >
                  Terapkan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoonModal}
        onOpenChange={setShowComingSoonModal}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white",
        }}
      >
        <ModalContent className="bg-white">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FiInfo className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Aplikasi Belum Tersedia
                  </h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  {selectedApp && (
                    <div className="mb-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{
                          backgroundColor: selectedApp.icon_color?.startsWith('#')
                            ? selectedApp.icon_color
                            : '#3b82f6'
                        }}
                      >
                        <div className="text-white">
                          {getAppIcon(selectedApp.icon_name, selectedApp.icon_color)}
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        {selectedApp.nm_aplikasi}
                      </h4>
                    </div>
                  )}
                  <p className="text-gray-600">
                    Mohon maaf, aplikasi ini sedang dalam tahap integrasi sistem.
                    Silakan coba lagi nanti atau hubungi tim TIK untuk informasi
                    lebih lanjut.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200">
                <Button
                  color="primary"
                  onPress={onClose}
                  className="bg-myunila text-white"
                >
                  Mengerti
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onOpenChange={setShowMaintenanceModal}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white",
        }}
      >
        <ModalContent className="bg-white">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <MdConstruction className="w-6 h-6 text-yellow-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Sedang Maintenance
                  </h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  {selectedApp && (
                    <div className="mb-4">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 opacity-50"
                        style={{
                          backgroundColor: selectedApp.icon_color?.startsWith('#')
                            ? selectedApp.icon_color
                            : '#3b82f6'
                        }}
                      >
                        <div className="text-white">
                          {getAppIcon(selectedApp.icon_name, selectedApp.icon_color)}
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        {selectedApp.nm_aplikasi}
                      </h4>
                    </div>
                  )}
                  <p className="text-gray-600">
                    Aplikasi ini sedang dalam pemeliharaan. Silakan coba lagi nanti.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200">
                <Button
                  color="warning"
                  variant="light"
                  onPress={onClose}
                >
                  Tutup
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Access Denied Modal */}
      <Modal
        isOpen={showAccessDeniedModal}
        onOpenChange={(isOpen) => {
          setShowAccessDeniedModal(isOpen);
          if (!isOpen) {
            // Reset state when modal closes
            setAccessDeniedRequiresRole(false);
            setIsCheckingAccess(false);
          }
        }}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white",
        }}
      >
        <ModalContent className="bg-white">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {isCheckingAccess ? (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Spinner size="sm" color="primary" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                      <FiX className="w-4 h-4 text-red-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-800">
                    {isCheckingAccess ? "Memeriksa Akses" : "Akses Ditolak"}
                  </h3>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  {selectedApp && (
                    <div className="mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 ${isCheckingAccess ? '' : 'opacity-50'}`}
                        style={{
                          backgroundColor: selectedApp.icon_color?.startsWith('#')
                            ? selectedApp.icon_color
                            : '#3b82f6'
                        }}
                      >
                        <div className="text-white">
                          {getAppIcon(selectedApp.icon_name, selectedApp.icon_color)}
                        </div>
                      </div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">
                        {selectedApp.nm_aplikasi}
                      </h4>
                    </div>
                  )}
                  {isCheckingAccess ? (
                    <div className="flex flex-col items-center gap-4 py-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                          <Spinner size="lg" color="primary" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-800 font-medium">Memeriksa Akses...</p>
                        <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-3">
                        {accessDeniedMessage || "Maaf, Anda tidak memiliki akses ke aplikasi ini."}
                      </p>
                      {accessDeniedRequiresRole ? (
                        <>
                          <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-sm text-amber-700">
                              <FiAlertCircle className="inline-block mr-1 -mt-0.5" />
                              Silakan pilih peran terlebih dahulu untuk mengakses aplikasi ini.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">
                            Jika Anda merasa seharusnya memiliki akses, silakan hubungi administrator.
                          </p>
                          {activeContext && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-600 font-medium mb-1">
                                Peran Aktif Saat Ini:
                              </p>
                              <p className="text-sm text-gray-800">
                                {activeContext.nm_peran} - {activeContext.nm_organisasi}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-200">
                {isCheckingAccess ? (
                  <Button
                    color="default"
                    variant="light"
                    onPress={onClose}
                    className="text-gray-600"
                  >
                    Batal
                  </Button>
                ) : accessDeniedRequiresRole ? (
                  <>
                    <Button
                      color="default"
                      variant="light"
                      onPress={onClose}
                      className="text-gray-600"
                    >
                      Tutup
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => {
                        onClose();
                        setShowRoleModal(true);
                      }}
                      startContent={<FiUser className="w-4 h-4" />}
                    >
                      Pilih Peran
                    </Button>
                  </>
                ) : (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    className="text-gray-600"
                  >
                    Tutup
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
