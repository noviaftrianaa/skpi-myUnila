/**
 * useAppMenus Hook
 *
 * Hook untuk mengambil menu aplikasi dari backend RBAC API
 * Menu ditampilkan berdasarkan permissions di menu_role table
 */

import { useState, useEffect, useCallback } from 'react';
import { userContextService, type AppMenu } from '@/lib/services/userContext/userContextService';
import type { MenuItem } from '@/lib/types/dashboardTypes';

// Icon mapping dari string ke React component
// Backend menyimpan icon dalam format:
// - react-icons style: "FiHome", "MdDashboard"
// - heroicons style: "heroicons:home", "heroicons:users"
import * as FiIcons from 'react-icons/fi';
import * as MdIcons from 'react-icons/md';
import * as HiIcons from 'react-icons/hi';
import * as BiIcons from 'react-icons/bi';
import * as AiIcons from 'react-icons/ai';
// Import Heroicons v2 OUTLINE for consistent line-style icons
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import { Squares2X2Icon as FallbackSquaresIcon } from '@heroicons/react/24/outline';
import { FiCircle as FallbackCircleIcon } from 'react-icons/fi';
import React from 'react';

// Map heroicons name to Heroicons v2 Outline component names
// heroicons:name -> NameIcon (e.g., "home" -> "HomeIcon")
const heroiconsMapping: Record<string, string> = {
  'home': 'HomeIcon',
  'users': 'UsersIcon',
  'user-group': 'UserGroupIcon',
  'cog-6-tooth': 'Cog6ToothIcon',
  'cog': 'CogIcon',
  'squares-2x2': 'Squares2X2Icon',
  'folder': 'FolderIcon',
  'bars-3': 'Bars3Icon',
  'shield-check': 'ShieldCheckIcon',
  'building-office': 'BuildingOfficeIcon',
  'identification': 'IdentificationIcon',
  'chart-bar': 'ChartBarIcon',
  'document': 'DocumentIcon',
  'document-text': 'DocumentTextIcon',
  'clipboard-list': 'ClipboardIcon',
  'clipboard-document-list': 'ClipboardDocumentListIcon',
  'key': 'KeyIcon',
  'lock-closed': 'LockClosedIcon',
  'server': 'ServerIcon',
  'database': 'CircleStackIcon',
  'adjustments-horizontal': 'AdjustmentsHorizontalIcon',
  'wrench': 'WrenchIcon',
  'bell': 'BellIcon',
  'envelope': 'EnvelopeIcon',
  'calendar': 'CalendarIcon',
  'clock': 'ClockIcon',
  'academic-cap': 'AcademicCapIcon',
  'book-open': 'BookOpenIcon',
  'globe-alt': 'GlobeAltIcon',
  'arrow-right-on-rectangle': 'ArrowRightOnRectangleIcon',
  'arrow-left-on-rectangle': 'ArrowLeftOnRectangleIcon',
  'user-circle': 'UserCircleIcon',
  'user': 'UserIcon',
  'plus': 'PlusIcon',
  'minus': 'MinusIcon',
  'pencil': 'PencilIcon',
  'trash': 'TrashIcon',
  'eye': 'EyeIcon',
  'eye-slash': 'EyeSlashIcon',
  'magnifying-glass': 'MagnifyingGlassIcon',
  'funnel': 'FunnelIcon',
  'tag': 'TagIcon',
  'hashtag': 'HashtagIcon',
  'check': 'CheckIcon',
  'check-circle': 'CheckCircleIcon',
  'x-mark': 'XMarkIcon',
  'x-circle': 'XCircleIcon',
  'exclamation-triangle': 'ExclamationTriangleIcon',
  'information-circle': 'InformationCircleIcon',
  'question-mark-circle': 'QuestionMarkCircleIcon',
  'arrow-path': 'ArrowPathIcon',
  'arrow-down-tray': 'ArrowDownTrayIcon',
  'arrow-up-tray': 'ArrowUpTrayIcon',
  'paper-clip': 'PaperClipIcon',
  'photo': 'PhotoIcon',
  'link': 'LinkIcon',
  'chart-pie': 'ChartPieIcon',
  'presentation-chart-bar': 'PresentationChartBarIcon',
  'presentation-chart-line': 'PresentationChartLineIcon',
  'table-cells': 'TableCellsIcon',
  'rectangle-group': 'RectangleGroupIcon',
  'queue-list': 'QueueListIcon',
  'list-bullet': 'ListBulletIcon',
  // Additional icons for portal categories and apps
  'chart-bar-square': 'ChartBarSquareIcon',
  'circle-stack': 'CircleStackIcon',
  'phone': 'PhoneIcon',
  'cube': 'CubeIcon',
  'trophy': 'TrophyIcon',
  'light-bulb': 'LightBulbIcon',
  'hand-raised': 'HandRaisedIcon',
  'newspaper': 'NewspaperIcon',
  'building-library': 'BuildingLibraryIcon',
  'banknotes': 'BanknotesIcon',
  'clipboard-document-check': 'ClipboardDocumentCheckIcon',
  'briefcase': 'BriefcaseIcon',
  'plus-circle': 'PlusCircleIcon',
  'document-check': 'DocumentCheckIcon',
  'document-magnifying-glass': 'DocumentMagnifyingGlassIcon',
  'clipboard': 'ClipboardIcon',
  'sparkles': 'SparklesIcon',
  'bookmark-square': 'BookmarkSquareIcon',
  'bookmark': 'BookmarkIcon',
  'star': 'StarIcon',
  'fire': 'FireIcon',
  'rocket-launch': 'RocketLaunchIcon',
  'puzzle-piece': 'PuzzlePieceIcon',
  'megaphone': 'MegaphoneIcon',
  'inbox': 'InboxIcon',
};

// Icon class with proper color inheritance
// Using flex-shrink-0 to prevent icon from shrinking in flex containers
// text-current ensures icon inherits the text color from parent element
const ICON_CLASS = 'w-5 h-5 flex-shrink-0 text-current';

// Dynamic import for Iconify (to support all icon formats)
// We'll lazy-load this only when needed for non-mapped icons
let IconifyIcon: React.ComponentType<{ icon: string; className?: string }> | null = null;

// Map icon string to React component
const getIconComponent = (iconName: string | null): React.ReactNode => {
  if (!iconName) return null;

  // Normalize icon name (trim spaces, handle case variations)
  const normalizedIconName = iconName.trim();

  // HANDLE PLAIN TEXT ICON NAMES (e.g., "Academic Cap", "Key", "Document")
  // Convert to heroicons format for consistency
  const plainTextMapping: Record<string, string> = {
    'academic cap': 'heroicons:academic-cap',
    'key': 'heroicons:key',
    'document': 'heroicons:document',
    'document text': 'heroicons:document-text',
    'home': 'heroicons:home',
    'user': 'heroicons:user',
    'users': 'heroicons:user-group',
    'folder': 'heroicons:folder',
    'chart bar': 'heroicons:chart-bar',
    'clipboard': 'heroicons:clipboard-document-list',
    'server': 'heroicons:server',
    'cog': 'heroicons:cog-6-tooth',
    'settings': 'heroicons:cog-6-tooth',
    'shield': 'heroicons:shield-check',
    'lock': 'heroicons:lock-closed',
  };

  // Check if it's a plain text icon name (no colon)
  if (!normalizedIconName.includes(':')) {
    const lowerIconName = normalizedIconName.toLowerCase();
    const mappedHeroicon = plainTextMapping[lowerIconName];

    if (mappedHeroicon) {
      // Recursively call with the mapped heroicon format
      return getIconComponent(mappedHeroicon);
    }

    // If not in plain text mapping, try to use it as React Icons format
    // (e.g., "FiHome", "MdDashboard") - handled below
  }

  // Check if it's heroicons format (e.g., "heroicons:home")
  // Handle this FIRST before trying Iconify to ensure consistent rendering
  if (normalizedIconName.startsWith('heroicons:')) {
    const heroiconKey = normalizedIconName.replace('heroicons:', '');
    const mappedIcon = heroiconsMapping[heroiconKey];

    if (mappedIcon) {
      // Use Heroicons v2 Outline (line-style icons)
      const OutlineIcon = (HeroiconsOutline as Record<string, React.ComponentType<{ className?: string }>>)[mappedIcon];
      if (OutlineIcon) {
        return React.createElement(OutlineIcon, { className: ICON_CLASS });
      }
    }

    // If not in mapping, try Iconify as fallback
    if (!IconifyIcon) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const IconifyModule = require('@iconify/react');
        IconifyIcon = IconifyModule.Icon;
      } catch (e) {
        console.warn('Iconify not available for heroicons');
      }
    }
    if (IconifyIcon) {
      return React.createElement(IconifyIcon, { icon: normalizedIconName, className: ICON_CLASS });
    }

    // Default for unmapped heroicons
    return React.createElement(FallbackSquaresIcon, { className: ICON_CLASS });
  }

  // Check if it's mdi format (e.g., "mdi:view-dashboard")
  if (normalizedIconName.startsWith('mdi:')) {
    const mdiKey = normalizedIconName.replace('mdi:', '');
    // Map common mdi icons to MdIcons
    const mdiMapping: Record<string, string> = {
      'view-dashboard': 'MdDashboard',
      'dashboard': 'MdDashboard',
      'home': 'MdHome',
      'settings': 'MdSettings',
      'account': 'MdAccountCircle',
      'menu': 'MdMenu',
    };
    const mappedMdi = mdiMapping[mdiKey];
    if (mappedMdi) {
      const MdIcon = (MdIcons as Record<string, React.ComponentType<{ className?: string }>>)[mappedMdi];
      if (MdIcon) {
        return React.createElement(MdIcon, { className: ICON_CLASS });
      }
    }
    // Default MDI icon
    return React.createElement(MdIcons.MdDashboard, { className: ICON_CLASS });
  }

  // For other Iconify format icons (ph:*, tabler:*, etc.), use Iconify directly
  if (normalizedIconName.includes(':')) {
    if (!IconifyIcon) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const IconifyModule = require('@iconify/react');
        IconifyIcon = IconifyModule.Icon;
      } catch (e) {
        console.warn('Iconify not available, falling back to default icon');
      }
    }

    if (IconifyIcon) {
      return React.createElement(IconifyIcon, { icon: normalizedIconName, className: ICON_CLASS });
    }
    // Fallback to default icon if Iconify fails
    return React.createElement(FallbackCircleIcon, { className: ICON_CLASS });
  }

  // React-icons style (e.g., "FiHome", "MdDashboard")
  const iconLibraries: Record<string, Record<string, React.ComponentType<{ className?: string }>>> = {
    'Fi': FiIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>,
    'Md': MdIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>,
    'Hi': HiIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>,
    'Bi': BiIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>,
    'Ai': AiIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>,
  };

  // Extract prefix (e.g., "Fi" from "FiHome")
  const prefix = normalizedIconName.substring(0, 2);
  const library = iconLibraries[prefix];

  if (library && library[normalizedIconName]) {
    const IconComponent = library[normalizedIconName];
    return React.createElement(IconComponent, { className: ICON_CLASS });
  }

  // Default icon if not found - use a visible fallback icon
  console.warn(`Icon not found: "${iconName}". Using fallback icon.`);
  return React.createElement(FallbackSquaresIcon, { className: ICON_CLASS });
};

// Transform API menu to MenuItem format
const transformApiMenuToMenuItem = (apiMenu: AppMenu): MenuItem => {
  // Convert level to number (backend may send as string "0" or "1")
  const level = typeof apiMenu.level === 'string' ? parseInt(apiMenu.level, 10) : apiMenu.level;
  const isRootLevel = level === 0;

  return {
    id: apiMenu.id_menu, // Use id_menu as unique key for React
    title: apiMenu.title,
    // Icon only for root level (level 0 = parent menus)
    // Backend uses level_menu starting from 0 (0 = root, 1 = children)
    // IMPORTANT: Handle both string "0" and number 0 from backend
    icon: isRootLevel ? getIconComponent(apiMenu.icon) : undefined,
    iconName: apiMenu.icon || undefined, // Keep original icon name for maintenance page
    href: apiMenu.href || undefined,
    isMaintenance: apiMenu.is_maintenance || false,
    children: apiMenu.children?.length > 0
      ? apiMenu.children.map(transformApiMenuToMenuItem)
      : undefined,
    // No roles filter needed - backend already filters by RBAC
  };
};

interface UseAppMenusResult {
  menus: MenuItem[];
  isLoading: boolean;
  error: string | null;
  isSuperRole: boolean;
  refetch: () => Promise<void>;
}

interface UseAppMenusOptions {
  appId?: string;
  appKey?: string;
  fallbackMenus?: MenuItem[]; // Fallback menu if API fails
}

/**
 * Hook to fetch dynamic menus from backend RBAC API
 */
export function useAppMenus(options: UseAppMenusOptions): UseAppMenusResult {
  const { appId, appKey, fallbackMenus = [] } = options;

  const [menus, setMenus] = useState<MenuItem[]>(fallbackMenus);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuperRole, setIsSuperRole] = useState(false);

  const fetchMenus = useCallback(async () => {
    if (!appId && !appKey) {
      setError('Either appId or appKey is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await userContextService.getAppMenus(appId, appKey);

      if (result.menus && result.menus.length > 0) {
        // Transform API menus to MenuItem format
        const transformedMenus = result.menus.map(transformApiMenuToMenuItem);
        setMenus(transformedMenus);
        setIsSuperRole(result.is_super_role);
      } else {
        // No menus from API, use fallback
        setMenus(fallbackMenus);
      }
    } catch (err: any) {
      console.error('Failed to fetch app menus:', err);
      setError(err.response?.data?.message || err.message || 'Gagal memuat menu');
      // Use fallback menus on error
      setMenus(fallbackMenus);
    } finally {
      setIsLoading(false);
    }
  }, [appId, appKey, fallbackMenus]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  return {
    menus,
    isLoading,
    error,
    isSuperRole,
    refetch: fetchMenus,
  };
}

export default useAppMenus;
