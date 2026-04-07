"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
  Divider,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { FiGlobe, FiCode, FiGrid, FiHash, FiLayout, FiSearch, FiKey, FiCopy, FiRefreshCw, FiEye, FiEyeOff, FiMenu, FiList, FiBox } from "react-icons/fi";
import { Icon } from "@iconify/react";
import {
  aplikasiService,
  type Aplikasi,
  type AplikasiDetail,
  type AplikasiMenu,
  type CreateAplikasiRequest,
  type KategoriAplikasi,
} from "@/lib/services/manakses/aplikasiService";
import {
  unitOrganisasiService,
  type UnitOrganisasiOption,
} from "@/lib/services/manakses/unitOrganisasiService";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Icon options for aplikasi - Iconify format (comprehensive list)
// Organized by category for easy browsing
const ICON_OPTIONS = [
  // === HEROICONS (Most Popular) ===
  // Education & Academic
  { key: "heroicons:academic-cap", label: "Academic Cap" },
  { key: "heroicons:book-open", label: "Book Open" },
  { key: "heroicons:building-library", label: "Library" },
  { key: "heroicons:clipboard-document-check", label: "Clipboard Check" },
  { key: "heroicons:clipboard-document-list", label: "Clipboard List" },
  { key: "heroicons:document-text", label: "Document Text" },
  { key: "heroicons:pencil-square", label: "Pencil Square" },
  { key: "heroicons:presentation-chart-line", label: "Presentation" },
  { key: "heroicons:trophy", label: "Trophy" },
  { key: "heroicons:light-bulb", label: "Light Bulb" },

  // Business & Office
  { key: "heroicons:briefcase", label: "Briefcase" },
  { key: "heroicons:building-office", label: "Office" },
  { key: "heroicons:building-office-2", label: "Office Building" },
  { key: "heroicons:building-storefront", label: "Storefront" },
  { key: "heroicons:identification", label: "ID Card" },
  { key: "heroicons:user-group", label: "User Group" },
  { key: "heroicons:users", label: "Users" },
  { key: "heroicons:user-circle", label: "User Circle" },

  // Charts & Analytics
  { key: "heroicons:chart-bar", label: "Chart Bar" },
  { key: "heroicons:chart-bar-square", label: "Chart Bar Square" },
  { key: "heroicons:chart-pie", label: "Chart Pie" },
  { key: "heroicons:arrow-trending-up", label: "Trending Up" },
  { key: "heroicons:arrow-trending-down", label: "Trending Down" },
  { key: "heroicons:presentation-chart-bar", label: "Presentation Bar" },
  { key: "heroicons:table-cells", label: "Table Cells" },

  // Finance
  { key: "heroicons:banknotes", label: "Banknotes" },
  { key: "heroicons:credit-card", label: "Credit Card" },
  { key: "heroicons:currency-dollar", label: "Dollar" },
  { key: "heroicons:wallet", label: "Wallet" },
  { key: "heroicons:receipt-percent", label: "Receipt" },
  { key: "heroicons:calculator", label: "Calculator" },

  // Technology
  { key: "heroicons:server", label: "Server" },
  { key: "heroicons:server-stack", label: "Server Stack" },
  { key: "heroicons:computer-desktop", label: "Desktop" },
  { key: "heroicons:cpu-chip", label: "CPU Chip" },
  { key: "heroicons:cloud", label: "Cloud" },
  { key: "heroicons:cloud-arrow-up", label: "Cloud Upload" },
  { key: "heroicons:code-bracket", label: "Code" },
  { key: "heroicons:command-line", label: "Terminal" },
  { key: "heroicons:cube", label: "Cube" },
  { key: "heroicons:cube-transparent", label: "Cube Transparent" },
  { key: "heroicons:link", label: "Link" },
  { key: "heroicons:qr-code", label: "QR Code" },
  { key: "heroicons:signal", label: "Signal" },
  { key: "heroicons:wifi", label: "WiFi" },

  // Security
  { key: "heroicons:key", label: "Key" },
  { key: "heroicons:lock-closed", label: "Lock Closed" },
  { key: "heroicons:lock-open", label: "Lock Open" },
  { key: "heroicons:shield-check", label: "Shield Check" },
  { key: "heroicons:shield-exclamation", label: "Shield Alert" },
  { key: "heroicons:finger-print", label: "Fingerprint" },
  { key: "heroicons:eye", label: "Eye" },

  // Communication
  { key: "heroicons:envelope", label: "Envelope" },
  { key: "heroicons:envelope-open", label: "Envelope Open" },
  { key: "heroicons:chat-bubble-left-right", label: "Chat" },
  { key: "heroicons:phone", label: "Phone" },
  { key: "heroicons:megaphone", label: "Megaphone" },
  { key: "heroicons:bell", label: "Bell" },
  { key: "heroicons:inbox", label: "Inbox" },
  { key: "heroicons:inbox-stack", label: "Inbox Stack" },

  // Navigation & Location
  { key: "heroicons:home", label: "Home" },
  { key: "heroicons:home-modern", label: "Home Modern" },
  { key: "heroicons:globe-alt", label: "Globe" },
  { key: "heroicons:globe-americas", label: "Globe Americas" },
  { key: "heroicons:globe-asia-australia", label: "Globe Asia" },
  { key: "heroicons:map", label: "Map" },
  { key: "heroicons:map-pin", label: "Map Pin" },

  // Files & Documents
  { key: "heroicons:document", label: "Document" },
  { key: "heroicons:document-chart-bar", label: "Document Chart" },
  { key: "heroicons:document-check", label: "Document Check" },
  { key: "heroicons:document-duplicate", label: "Document Duplicate" },
  { key: "heroicons:folder", label: "Folder" },
  { key: "heroicons:folder-open", label: "Folder Open" },
  { key: "heroicons:clipboard", label: "Clipboard" },
  { key: "heroicons:archive-box", label: "Archive Box" },
  { key: "heroicons:newspaper", label: "Newspaper" },

  // Time & Calendar
  { key: "heroicons:calendar", label: "Calendar" },
  { key: "heroicons:calendar-days", label: "Calendar Days" },
  { key: "heroicons:clock", label: "Clock" },

  // Settings & Tools
  { key: "heroicons:cog-6-tooth", label: "Settings" },
  { key: "heroicons:cog-8-tooth", label: "Settings Alt" },
  { key: "heroicons:adjustments-horizontal", label: "Adjustments" },
  { key: "heroicons:wrench", label: "Wrench" },
  { key: "heroicons:wrench-screwdriver", label: "Tools" },
  { key: "heroicons:scissors", label: "Scissors" },
  { key: "heroicons:paint-brush", label: "Paint Brush" },

  // Status & Actions
  { key: "heroicons:check-circle", label: "Check Circle" },
  { key: "heroicons:check-badge", label: "Check Badge" },
  { key: "heroicons:x-circle", label: "X Circle" },
  { key: "heroicons:exclamation-circle", label: "Exclamation" },
  { key: "heroicons:information-circle", label: "Info" },
  { key: "heroicons:magnifying-glass", label: "Search" },
  { key: "heroicons:plus", label: "Plus" },
  { key: "heroicons:plus-circle", label: "Plus Circle" },
  { key: "heroicons:pencil", label: "Pencil" },
  { key: "heroicons:trash", label: "Trash" },
  { key: "heroicons:share", label: "Share" },
  { key: "heroicons:paper-airplane", label: "Paper Airplane" },
  { key: "heroicons:rocket-launch", label: "Rocket" },

  // Media
  { key: "heroicons:camera", label: "Camera" },
  { key: "heroicons:photo", label: "Photo" },
  { key: "heroicons:film", label: "Film" },
  { key: "heroicons:video-camera", label: "Video Camera" },
  { key: "heroicons:microphone", label: "Microphone" },
  { key: "heroicons:musical-note", label: "Music" },
  { key: "heroicons:play", label: "Play" },
  { key: "heroicons:play-circle", label: "Play Circle" },
  { key: "heroicons:speaker-wave", label: "Speaker" },

  // Commerce
  { key: "heroicons:shopping-bag", label: "Shopping Bag" },
  { key: "heroicons:shopping-cart", label: "Shopping Cart" },
  { key: "heroicons:tag", label: "Tag" },
  { key: "heroicons:ticket", label: "Ticket" },
  { key: "heroicons:gift", label: "Gift" },

  // Support
  { key: "heroicons:lifebuoy", label: "Lifebuoy" },
  { key: "heroicons:hand-raised", label: "Hand Raised" },
  { key: "heroicons:hand-thumb-up", label: "Thumb Up" },

  // Social
  { key: "heroicons:heart", label: "Heart" },
  { key: "heroicons:star", label: "Star" },
  { key: "heroicons:sparkles", label: "Sparkles" },
  { key: "heroicons:hashtag", label: "Hashtag" },
  { key: "heroicons:face-smile", label: "Smile" },
  { key: "heroicons:fire", label: "Fire" },
  { key: "heroicons:bolt", label: "Bolt" },

  // Objects
  { key: "heroicons:puzzle-piece", label: "Puzzle" },
  { key: "heroicons:rectangle-stack", label: "Stack" },
  { key: "heroicons:squares-2x2", label: "Grid" },
  { key: "heroicons:squares-plus", label: "Squares Plus" },
  { key: "heroicons:square-3-stack-3d", label: "3D Stack" },
  { key: "heroicons:flag", label: "Flag" },
  { key: "heroicons:bookmark", label: "Bookmark" },
  { key: "heroicons:scale", label: "Scale" },
  { key: "heroicons:beaker", label: "Beaker" },
  { key: "heroicons:cake", label: "Cake" },
  { key: "heroicons:truck", label: "Truck" },
  { key: "heroicons:tv", label: "TV" },
  { key: "heroicons:printer", label: "Printer" },
  { key: "heroicons:sun", label: "Sun" },
  { key: "heroicons:language", label: "Language" },
  { key: "heroicons:rss", label: "RSS" },
  { key: "heroicons:variable", label: "Variable" },
  { key: "heroicons:viewfinder-circle", label: "Viewfinder" },
  { key: "heroicons:window", label: "Window" },
  { key: "heroicons:swatch", label: "Swatch" },
  { key: "heroicons:queue-list", label: "Queue List" },
  { key: "heroicons:paper-clip", label: "Paper Clip" },

  // === PHOSPHOR ICONS ===
  { key: "ph:graduation-cap-fill", label: "Graduation Cap (Ph)" },
  { key: "ph:student-fill", label: "Student (Ph)" },
  { key: "ph:chalkboard-teacher-fill", label: "Teacher (Ph)" },
  { key: "ph:book-fill", label: "Book (Ph)" },
  { key: "ph:books-fill", label: "Books (Ph)" },
  { key: "ph:notebook-fill", label: "Notebook (Ph)" },
  { key: "ph:exam-fill", label: "Exam (Ph)" },
  { key: "ph:certificate-fill", label: "Certificate (Ph)" },
  { key: "ph:medal-fill", label: "Medal (Ph)" },
  { key: "ph:trophy-fill", label: "Trophy (Ph)" },
  { key: "ph:crown-fill", label: "Crown (Ph)" },
  { key: "ph:database-fill", label: "Database (Ph)" },
  { key: "ph:hard-drives-fill", label: "Hard Drives (Ph)" },
  { key: "ph:terminal-fill", label: "Terminal (Ph)" },
  { key: "ph:code-fill", label: "Code (Ph)" },
  { key: "ph:headset-fill", label: "Headset (Ph)" },
  { key: "ph:handshake-fill", label: "Handshake (Ph)" },
  { key: "ph:bank-fill", label: "Bank (Ph)" },
  { key: "ph:money-fill", label: "Money (Ph)" },
  { key: "ph:chart-line-up-fill", label: "Chart Up (Ph)" },
  { key: "ph:chart-bar-fill", label: "Chart Bar (Ph)" },
  { key: "ph:chart-pie-slice-fill", label: "Pie Chart (Ph)" },
  { key: "ph:buildings-fill", label: "Buildings (Ph)" },
  { key: "ph:hospital-fill", label: "Hospital (Ph)" },
  { key: "ph:factory-fill", label: "Factory (Ph)" },
  { key: "ph:users-three-fill", label: "Users Three (Ph)" },
  { key: "ph:users-four-fill", label: "Users Four (Ph)" },
  { key: "ph:user-gear-fill", label: "User Gear (Ph)" },
  { key: "ph:identification-card-fill", label: "ID Card (Ph)" },
  { key: "ph:fingerprint-fill", label: "Fingerprint (Ph)" },
  { key: "ph:shield-check-fill", label: "Shield Check (Ph)" },
  { key: "ph:globe-fill", label: "Globe (Ph)" },
  { key: "ph:translate-fill", label: "Translate (Ph)" },
  { key: "ph:calendar-check-fill", label: "Calendar Check (Ph)" },
  { key: "ph:file-text-fill", label: "File Text (Ph)" },
  { key: "ph:file-pdf-fill", label: "PDF (Ph)" },
  { key: "ph:folder-fill", label: "Folder (Ph)" },
  { key: "ph:cloud-fill", label: "Cloud (Ph)" },
  { key: "ph:lightning-fill", label: "Lightning (Ph)" },
  { key: "ph:star-fill", label: "Star (Ph)" },
  { key: "ph:heart-fill", label: "Heart (Ph)" },
  { key: "ph:chat-circle-fill", label: "Chat (Ph)" },
  { key: "ph:bell-fill", label: "Bell (Ph)" },
  { key: "ph:gear-fill", label: "Gear (Ph)" },
  { key: "ph:sliders-fill", label: "Sliders (Ph)" },

  // === MATERIAL DESIGN ICONS ===
  { key: "mdi:account-school", label: "Account School (MDI)" },
  { key: "mdi:school", label: "School (MDI)" },
  { key: "mdi:book-education", label: "Book Education (MDI)" },
  { key: "mdi:human-male-board", label: "Teacher (MDI)" },
  { key: "mdi:briefcase", label: "Briefcase (MDI)" },
  { key: "mdi:office-building", label: "Office (MDI)" },
  { key: "mdi:domain", label: "Domain (MDI)" },
  { key: "mdi:city", label: "City (MDI)" },
  { key: "mdi:database", label: "Database (MDI)" },
  { key: "mdi:server", label: "Server (MDI)" },
  { key: "mdi:api", label: "API (MDI)" },
  { key: "mdi:cog", label: "Cog (MDI)" },
  { key: "mdi:tools", label: "Tools (MDI)" },
  { key: "mdi:chart-line", label: "Chart Line (MDI)" },
  { key: "mdi:chart-bar", label: "Chart Bar (MDI)" },
  { key: "mdi:chart-pie", label: "Chart Pie (MDI)" },
  { key: "mdi:monitor-dashboard", label: "Dashboard (MDI)" },
  { key: "mdi:view-dashboard", label: "Dashboard View (MDI)" },
  { key: "mdi:finance", label: "Finance (MDI)" },
  { key: "mdi:cash", label: "Cash (MDI)" },
  { key: "mdi:cash-multiple", label: "Cash Multiple (MDI)" },
  { key: "mdi:wallet", label: "Wallet (MDI)" },
  { key: "mdi:credit-card", label: "Credit Card (MDI)" },
  { key: "mdi:account", label: "Account (MDI)" },
  { key: "mdi:account-group", label: "Account Group (MDI)" },
  { key: "mdi:account-multiple", label: "Account Multiple (MDI)" },
  { key: "mdi:badge-account", label: "Badge Account (MDI)" },
  { key: "mdi:card-account-details", label: "Card Account (MDI)" },
  { key: "mdi:shield-check", label: "Shield Check (MDI)" },
  { key: "mdi:shield-lock", label: "Shield Lock (MDI)" },
  { key: "mdi:lock", label: "Lock (MDI)" },
  { key: "mdi:key", label: "Key (MDI)" },
  { key: "mdi:earth", label: "Earth (MDI)" },
  { key: "mdi:web", label: "Web (MDI)" },
  { key: "mdi:calendar", label: "Calendar (MDI)" },
  { key: "mdi:calendar-check", label: "Calendar Check (MDI)" },
  { key: "mdi:file-document", label: "File Document (MDI)" },
  { key: "mdi:folder", label: "Folder (MDI)" },
  { key: "mdi:email", label: "Email (MDI)" },
  { key: "mdi:message", label: "Message (MDI)" },
  { key: "mdi:phone", label: "Phone (MDI)" },
  { key: "mdi:bell", label: "Bell (MDI)" },
  { key: "mdi:home", label: "Home (MDI)" },
  { key: "mdi:magnify", label: "Search (MDI)" },
  { key: "mdi:check-circle", label: "Check Circle (MDI)" },
  { key: "mdi:alert", label: "Alert (MDI)" },
  { key: "mdi:help-circle", label: "Help (MDI)" },
  { key: "mdi:headset", label: "Headset (MDI)" },
  { key: "mdi:lifebuoy", label: "Lifebuoy (MDI)" },
  { key: "mdi:star", label: "Star (MDI)" },
  { key: "mdi:heart", label: "Heart (MDI)" },
  { key: "mdi:share", label: "Share (MDI)" },
  { key: "mdi:link", label: "Link (MDI)" },
  { key: "mdi:cloud", label: "Cloud (MDI)" },
  { key: "mdi:sync", label: "Sync (MDI)" },
  { key: "mdi:rocket", label: "Rocket (MDI)" },
  { key: "mdi:lightbulb", label: "Lightbulb (MDI)" },
  { key: "mdi:puzzle", label: "Puzzle (MDI)" },
  { key: "mdi:cube", label: "Cube (MDI)" },
  { key: "mdi:package", label: "Package (MDI)" },
  { key: "mdi:cart", label: "Cart (MDI)" },
  { key: "mdi:store", label: "Store (MDI)" },
  { key: "mdi:gift", label: "Gift (MDI)" },
  { key: "mdi:trophy", label: "Trophy (MDI)" },
  { key: "mdi:medal", label: "Medal (MDI)" },
  { key: "mdi:certificate", label: "Certificate (MDI)" },
  { key: "mdi:map", label: "Map (MDI)" },
  { key: "mdi:map-marker", label: "Map Marker (MDI)" },
  { key: "mdi:image", label: "Image (MDI)" },
  { key: "mdi:video", label: "Video (MDI)" },
  { key: "mdi:music", label: "Music (MDI)" },
  { key: "mdi:monitor", label: "Monitor (MDI)" },
  { key: "mdi:laptop", label: "Laptop (MDI)" },
  { key: "mdi:cellphone", label: "Cellphone (MDI)" },
  { key: "mdi:printer", label: "Printer (MDI)" },

  // === TABLER ICONS ===
  { key: "tabler:school", label: "School (Tabler)" },
  { key: "tabler:book", label: "Book (Tabler)" },
  { key: "tabler:books", label: "Books (Tabler)" },
  { key: "tabler:certificate", label: "Certificate (Tabler)" },
  { key: "tabler:award", label: "Award (Tabler)" },
  { key: "tabler:trophy", label: "Trophy (Tabler)" },
  { key: "tabler:building", label: "Building (Tabler)" },
  { key: "tabler:building-skyscraper", label: "Skyscraper (Tabler)" },
  { key: "tabler:database", label: "Database (Tabler)" },
  { key: "tabler:server", label: "Server (Tabler)" },
  { key: "tabler:api", label: "API (Tabler)" },
  { key: "tabler:code", label: "Code (Tabler)" },
  { key: "tabler:terminal", label: "Terminal (Tabler)" },
  { key: "tabler:settings", label: "Settings (Tabler)" },
  { key: "tabler:tool", label: "Tool (Tabler)" },
  { key: "tabler:chart-line", label: "Chart Line (Tabler)" },
  { key: "tabler:chart-bar", label: "Chart Bar (Tabler)" },
  { key: "tabler:chart-pie", label: "Chart Pie (Tabler)" },
  { key: "tabler:dashboard", label: "Dashboard (Tabler)" },
  { key: "tabler:report-analytics", label: "Analytics (Tabler)" },
  { key: "tabler:cash", label: "Cash (Tabler)" },
  { key: "tabler:wallet", label: "Wallet (Tabler)" },
  { key: "tabler:credit-card", label: "Credit Card (Tabler)" },
  { key: "tabler:user", label: "User (Tabler)" },
  { key: "tabler:users", label: "Users (Tabler)" },
  { key: "tabler:id", label: "ID (Tabler)" },
  { key: "tabler:id-badge", label: "ID Badge (Tabler)" },
  { key: "tabler:shield-check", label: "Shield Check (Tabler)" },
  { key: "tabler:lock", label: "Lock (Tabler)" },
  { key: "tabler:key", label: "Key (Tabler)" },
  { key: "tabler:world", label: "World (Tabler)" },
  { key: "tabler:calendar", label: "Calendar (Tabler)" },
  { key: "tabler:clock", label: "Clock (Tabler)" },
  { key: "tabler:file", label: "File (Tabler)" },
  { key: "tabler:file-text", label: "File Text (Tabler)" },
  { key: "tabler:folder", label: "Folder (Tabler)" },
  { key: "tabler:mail", label: "Mail (Tabler)" },
  { key: "tabler:message", label: "Message (Tabler)" },
  { key: "tabler:phone", label: "Phone (Tabler)" },
  { key: "tabler:bell", label: "Bell (Tabler)" },
  { key: "tabler:home", label: "Home (Tabler)" },
  { key: "tabler:search", label: "Search (Tabler)" },
  { key: "tabler:check", label: "Check (Tabler)" },
  { key: "tabler:alert-circle", label: "Alert (Tabler)" },
  { key: "tabler:help", label: "Help (Tabler)" },
  { key: "tabler:headset", label: "Headset (Tabler)" },
  { key: "tabler:star", label: "Star (Tabler)" },
  { key: "tabler:heart", label: "Heart (Tabler)" },
  { key: "tabler:share", label: "Share (Tabler)" },
  { key: "tabler:link", label: "Link (Tabler)" },
  { key: "tabler:cloud", label: "Cloud (Tabler)" },
  { key: "tabler:rocket", label: "Rocket (Tabler)" },
  { key: "tabler:bulb", label: "Bulb (Tabler)" },
  { key: "tabler:puzzle", label: "Puzzle (Tabler)" },
  { key: "tabler:cube", label: "Cube (Tabler)" },
  { key: "tabler:package", label: "Package (Tabler)" },
  { key: "tabler:shopping-cart", label: "Cart (Tabler)" },
  { key: "tabler:gift", label: "Gift (Tabler)" },
  { key: "tabler:map", label: "Map (Tabler)" },
  { key: "tabler:map-pin", label: "Map Pin (Tabler)" },
  { key: "tabler:photo", label: "Photo (Tabler)" },
  { key: "tabler:video", label: "Video (Tabler)" },
  { key: "tabler:device-desktop", label: "Desktop (Tabler)" },
  { key: "tabler:device-laptop", label: "Laptop (Tabler)" },
  { key: "tabler:device-mobile", label: "Mobile (Tabler)" },
];

// Color class options (Tailwind colors)
const COLOR_OPTIONS = [
  { key: "text-blue-500", label: "Blue", color: "#3B82F6" },
  { key: "text-indigo-500", label: "Indigo", color: "#6366F1" },
  { key: "text-purple-500", label: "Purple", color: "#A855F7" },
  { key: "text-pink-500", label: "Pink", color: "#EC4899" },
  { key: "text-red-500", label: "Red", color: "#EF4444" },
  { key: "text-orange-500", label: "Orange", color: "#F97316" },
  { key: "text-amber-500", label: "Amber", color: "#F59E0B" },
  { key: "text-yellow-500", label: "Yellow", color: "#EAB308" },
  { key: "text-lime-500", label: "Lime", color: "#84CC16" },
  { key: "text-green-500", label: "Green", color: "#22C55E" },
  { key: "text-emerald-500", label: "Emerald", color: "#10B981" },
  { key: "text-teal-500", label: "Teal", color: "#14B8A6" },
  { key: "text-cyan-500", label: "Cyan", color: "#06B6D4" },
  { key: "text-sky-500", label: "Sky", color: "#0EA5E9" },
  { key: "text-gray-500", label: "Gray", color: "#6B7280" },
  { key: "text-slate-500", label: "Slate", color: "#64748B" },
];

interface AplikasiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (isEdit: boolean, appName: string) => void;
  aplikasi?: (Aplikasi & { app_key?: string | null; menus?: AplikasiMenu[] }) | null; // For edit mode - includes app_key and menus from detail
}

export default function AplikasiFormModal({
  isOpen,
  onClose,
  onSuccess,
  aplikasi,
}: AplikasiFormModalProps) {
  const isEditMode = !!aplikasi;

  const [loading, setLoading] = useState(false);
  const [unitOrganisasiList, setUnitOrganisasiList] = useState<UnitOrganisasiOption[]>([]);
  const [kategoriList, setKategoriList] = useState<KategoriAplikasi[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [unitSearchQuery, setUnitSearchQuery] = useState("");
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const debouncedUnitSearch = useDebounce(unitSearchQuery, 300);
  // Track selected unit for edit mode (to preserve selection even if not in search results)
  const [selectedUnit, setSelectedUnit] = useState<UnitOrganisasiOption | null>(null);

  // App Key management
  const [currentAppKey, setCurrentAppKey] = useState<string | null>(null);
  const [showAppKey, setShowAppKey] = useState(false);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formData, setFormData] = useState<CreateAplikasiRequest & { status?: 'Aktif' | 'Tidak Aktif' }>({
    nm_aplikasi: "",
    ket_aplikasi: "",
    id_organisasi: null,
    id_kategori: null,
    url: "",
    port: "",
    teknologi: "",
    endpoint_ws: "",
    icon_name: null,
    icon_color: null,
    app_slug: null,
    urutan: 0,
    a_generate_menu: false,
    a_integrasi_cas: false,
    a_sistem_internal_pt: false,
    a_tampil_portal: true,
    a_maintenance: false,
    a_coming_soon: false,
    a_terintegrasi: false,
    a_live: false,
    a_filter_organisasi: false,
    status: 'Aktif',
  });

  // Load categories for dropdown
  useEffect(() => {
    const loadKategori = async () => {
      try {
        const kategoriData = await aplikasiService.getCategories();
        setKategoriList(kategoriData);
      } catch (error) {
        console.error("Error loading kategori:", error);
      }
    };
    if (isOpen) {
      loadKategori();
    }
  }, [isOpen]);

  // Load unit organisasi with search
  useEffect(() => {
    const loadUnits = async () => {
      if (!isOpen) return;

      setIsLoadingUnits(true);
      try {
        const unitData = await unitOrganisasiService.getAll({
          search: debouncedUnitSearch || undefined,
          limit: 50,
        });

        // If we have a selected unit (from edit mode), ensure it's in the list
        if (selectedUnit && !unitData.find(u => u.id_organisasi === selectedUnit.id_organisasi)) {
          setUnitOrganisasiList([selectedUnit, ...unitData]);
        } else {
          setUnitOrganisasiList(unitData);
        }
      } catch (error) {
        console.error("Error loading unit organisasi:", error);
      } finally {
        setIsLoadingUnits(false);
      }
    };
    loadUnits();
  }, [isOpen, debouncedUnitSearch, selectedUnit]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (aplikasi) {
      setFormData({
        nm_aplikasi: aplikasi.nm_aplikasi || "",
        ket_aplikasi: aplikasi.ket_aplikasi || "",
        id_organisasi: aplikasi.id_organisasi || null,
        id_kategori: aplikasi.id_kategori || null,
        url: aplikasi.url || "",
        port: aplikasi.port?.toString() || "",
        teknologi: aplikasi.teknologi || "",
        endpoint_ws: aplikasi.endpoint_ws || "",
        icon_name: aplikasi.icon_name || null,
        icon_color: aplikasi.icon_color || null,
        app_slug: aplikasi.app_slug || null,
        urutan: aplikasi.urutan || 0,
        a_generate_menu: aplikasi.a_generate_menu || false,
        a_integrasi_cas: aplikasi.a_integrasi_cas || false,
        a_sistem_internal_pt: aplikasi.a_sistem_internal_pt || false,
        a_tampil_portal: aplikasi.a_tampil_portal ?? true,
        a_maintenance: aplikasi.a_maintenance || false,
        a_coming_soon: aplikasi.a_coming_soon || false,
        a_terintegrasi: aplikasi.a_terintegrasi || false,
        a_live: aplikasi.a_live || false,
        a_filter_organisasi: aplikasi.a_filter_organisasi || false,
        status: aplikasi.status || 'Aktif',
      });
      // Set selected unit for edit mode (to preserve in autocomplete list)
      if (aplikasi.id_organisasi && aplikasi.nm_organisasi) {
        setSelectedUnit({
          id_organisasi: aplikasi.id_organisasi,
          nm_lemb: aplikasi.nm_organisasi,
          display_name: aplikasi.nm_organisasi,
        });
      } else {
        setSelectedUnit(null);
      }
      // Set app key for edit mode
      setCurrentAppKey(aplikasi.app_key || null);
      setShowAppKey(false);
      setCopySuccess(false);
      setActiveTab("basic");
    } else {
      // Reset for create mode
      setFormData({
        nm_aplikasi: "",
        ket_aplikasi: "",
        id_organisasi: null,
        id_kategori: null,
        url: "",
        port: "",
        teknologi: "",
        endpoint_ws: "",
        icon_name: null,
        icon_color: null,
        app_slug: null,
        urutan: 0,
        a_generate_menu: false,
        a_integrasi_cas: false,
        a_sistem_internal_pt: false,
        a_tampil_portal: true,
        a_maintenance: false,
        a_coming_soon: false,
        a_terintegrasi: false,
        a_live: false,
    a_filter_organisasi: false,
        status: 'Aktif',
      });
      setSelectedUnit(null);
      setCurrentAppKey(null);
      setShowAppKey(false);
      setCopySuccess(false);
      setActiveTab("basic");
    }
  }, [aplikasi, isOpen]);

  // Copy app key to clipboard
  const handleCopyAppKey = async () => {
    if (currentAppKey) {
      try {
        await navigator.clipboard.writeText(currentAppKey);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {
        console.error("Failed to copy app key");
      }
    }
  };

  // Regenerate app key
  const handleRegenerateAppKey = async () => {
    if (!aplikasi?.id_aplikasi) return;

    if (!confirm("Apakah Anda yakin ingin regenerate App Key? Key lama tidak akan bisa digunakan lagi.")) {
      return;
    }

    setIsRegeneratingKey(true);
    try {
      const result = await aplikasiService.regenerateAppKey(aplikasi.id_aplikasi);
      setCurrentAppKey(result.app_key);
      setShowAppKey(true); // Show the new key immediately
    } catch (error: unknown) {
      console.error("Error regenerating app key:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(err.response?.data?.message || err.message || "Gagal regenerate app key");
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.nm_aplikasi.trim()) {
      alert("Nama aplikasi harus diisi");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && aplikasi) {
        await aplikasiService.update(aplikasi.id_aplikasi, formData);
      } else {
        await aplikasiService.create(formData);
      }

      onSuccess(isEditMode, formData.nm_aplikasi);
      onClose();
    } catch (error: unknown) {
      console.error("Error saving aplikasi:", error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(
        err.response?.data?.message ||
          err.message ||
          "Gagal menyimpan aplikasi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
        closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        body: "px-0",
        header: "px-3 sm:px-6",
        footer: "px-3 sm:px-6",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Edit Aplikasi" : "Tambah Aplikasi Baru"}
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              {isEditMode
                ? "Perbarui informasi aplikasi yang sudah ada"
                : "Daftarkan aplikasi baru ke sistem Manajemen Akses"}
            </p>
          </ModalHeader>

          <ModalBody className="gap-0 py-0">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              classNames={{
                tabList: "bg-gray-100 dark:bg-slate-700/50 p-1 rounded-lg mx-3 sm:mx-6 mt-4 flex-wrap sm:flex-nowrap",
                cursor: "bg-white dark:bg-slate-600 shadow-sm",
                tab: "px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium",
                tabContent: "group-data-[selected=true]:text-indigo-600 dark:group-data-[selected=true]:text-indigo-400",
                panel: "px-3 sm:px-6 py-4 sm:py-5",
              }}
            >
              {/* Basic Info Tab */}
              <Tab key="basic" title="Info Dasar">
                <div className="space-y-5">
                  {/* Informasi Utama Section */}
                  <div className="bg-gray-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-gray-200/80 dark:border-slate-600/50">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Informasi Utama
                    </h4>
                    <div className="space-y-4">
                      {/* Nama & Kategori */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Nama Aplikasi <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder="Contoh: SIAKAD, SIMPEG"
                            value={formData.nm_aplikasi}
                            onChange={(e) =>
                              setFormData({ ...formData, nm_aplikasi: e.target.value })
                            }
                            isRequired
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Kategori
                          </label>
                          <Select
                            aria-label="Pilih Kategori"
                            placeholder="Pilih kategori"
                            selectedKeys={formData.id_kategori ? [formData.id_kategori] : []}
                            onSelectionChange={(keys) => {
                              const selected = Array.from(keys)[0] as string;
                              setFormData({ ...formData, id_kategori: selected || null });
                            }}
                            variant="bordered"
                            size="sm"
                            startContent={<FiGrid className="text-gray-400 flex-shrink-0" />}
                            classNames={{
                              trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              value: "text-gray-900 dark:text-white",
                              popoverContent: "bg-white dark:bg-slate-800",
                            }}
                          >
                            {kategoriList.map((kat) => (
                              <SelectItem key={kat.id_kategori} textValue={kat.nm_kategori}>
                                {kat.nm_kategori}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                      </div>

                      {/* Keterangan */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Keterangan
                        </label>
                        <Textarea
                          placeholder="Deskripsi singkat aplikasi (opsional)"
                          value={formData.ket_aplikasi || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, ket_aplikasi: e.target.value })
                          }
                          variant="bordered"
                          minRows={2}
                          classNames={{
                            input: "text-gray-900 dark:text-white",
                            inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                          }}
                        />
                      </div>

                      {/* Unit Organisasi with Autocomplete */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Unit Organisasi
                        </label>
                        <Autocomplete
                          aria-label="Pilih Unit Organisasi"
                          placeholder="Ketik untuk mencari unit organisasi..."
                          selectedKey={formData.id_organisasi}
                          onSelectionChange={(key) => {
                            const keyStr = key as string || null;
                            setFormData({ ...formData, id_organisasi: keyStr });
                            // Update selectedUnit to preserve selection
                            if (keyStr) {
                              const unit = unitOrganisasiList.find(u => u.id_organisasi === keyStr);
                              if (unit) {
                                setSelectedUnit(unit);
                              }
                            } else {
                              setSelectedUnit(null);
                            }
                          }}
                          onInputChange={(value) => setUnitSearchQuery(value)}
                          isLoading={isLoadingUnits}
                          variant="bordered"
                          size="sm"
                          startContent={<FiSearch className="text-gray-400 flex-shrink-0" />}
                          classNames={{
                            base: "w-full",
                            listboxWrapper: "max-h-[300px]",
                            popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                          }}
                          inputProps={{
                            classNames: {
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            },
                          }}
                          listboxProps={{
                            emptyContent: isLoadingUnits ? "Memuat..." : "Tidak ada unit ditemukan",
                            className: "bg-white dark:bg-slate-800",
                          }}
                        >
                          {unitOrganisasiList.map((unit) => (
                            <AutocompleteItem
                              key={unit.id_organisasi}
                              textValue={unit.display_name || unit.nm_lemb}
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{unit.nm_lemb}</span>
                                {(unit.nm_jns_lemb || unit.jenjang) && (
                                  <span className="text-xs text-gray-500 dark:text-slate-400">
                                    {unit.nm_jns_lemb}
                                    {unit.nm_jns_lemb && unit.jenjang && " - "}
                                    {unit.jenjang}
                                  </span>
                                )}
                              </div>
                            </AutocompleteItem>
                          ))}
                        </Autocomplete>
                        <p className="text-xs text-gray-500 dark:text-slate-400">Ketik minimal 2 karakter untuk mencari</p>
                      </div>
                    </div>
                  </div>

                  {/* Informasi Teknis Section */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Informasi Teknis
                    </h4>
                    <div className="space-y-4">
                      {/* URL and Port */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-3 space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            URL Aplikasi
                          </label>
                          <Input
                            placeholder="https://aplikasi.unila.ac.id"
                            value={formData.url || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, url: e.target.value })
                            }
                            variant="bordered"
                            size="sm"
                            startContent={<FiGlobe className="text-gray-400 flex-shrink-0" />}
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Port
                          </label>
                          <Input
                            placeholder="8080"
                            value={formData.port || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, port: e.target.value })
                            }
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                        </div>
                      </div>

                      {/* Teknologi and Endpoint WS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Teknologi
                          </label>
                          <Input
                            placeholder="Laravel, React, Go"
                            value={formData.teknologi || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, teknologi: e.target.value })
                            }
                            variant="bordered"
                            size="sm"
                            startContent={<FiCode className="text-gray-400 flex-shrink-0" />}
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Endpoint Web Service
                          </label>
                          <Input
                            placeholder="/api/v1"
                            value={formData.endpoint_ws || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, endpoint_ws: e.target.value })
                            }
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tab>

              {/* Portal Tab */}
              <Tab key="portal" title="Portal">
                <div className="space-y-5">
                  {/* Tampilan Portal Section */}
                  <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      Tampilan Portal
                    </h4>
                    <div className="space-y-4">
                      {/* Icon and Color */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Icon Aplikasi
                          </label>
                          <Autocomplete
                            aria-label="Pilih Icon"
                            placeholder="Cari icon..."
                            allowsCustomValue
                            selectedKey={formData.icon_name}
                            inputValue={formData.icon_name || ""}
                            onInputChange={(value) => {
                              setFormData({ ...formData, icon_name: value || null });
                            }}
                            onSelectionChange={(key) => {
                              if (key) {
                                setFormData({ ...formData, icon_name: key as string });
                              }
                            }}
                            variant="bordered"
                            size="sm"
                            startContent={
                              formData.icon_name ? (
                                <Icon icon={formData.icon_name} className="w-4 h-4 text-gray-600 dark:text-slate-400 flex-shrink-0" />
                              ) : (
                                <FiBox className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )
                            }
                            classNames={{
                              base: "w-full",
                              listboxWrapper: "max-h-[300px]",
                              popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                            }}
                            inputProps={{
                              classNames: {
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              },
                            }}
                            listboxProps={{
                              emptyContent: "Tidak ada icon ditemukan",
                              className: "bg-white dark:bg-slate-800",
                            }}
                          >
                            {ICON_OPTIONS.map((icon) => (
                              <AutocompleteItem key={icon.key} textValue={icon.label}>
                                <div className="flex items-center gap-2">
                                  <Icon icon={icon.key} className="w-5 h-5 text-gray-700 dark:text-slate-300" />
                                  <span className="text-sm">{icon.label}</span>
                                </div>
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Warna Icon
                          </label>
                          <Autocomplete
                            aria-label="Pilih Warna"
                            placeholder="Pilih warna"
                            allowsCustomValue
                            selectedKey={formData.icon_color}
                            inputValue={formData.icon_color || ""}
                            onInputChange={(value) => {
                              setFormData({ ...formData, icon_color: value || null });
                            }}
                            onSelectionChange={(key) => {
                              if (key) {
                                setFormData({ ...formData, icon_color: key as string });
                              }
                            }}
                            variant="bordered"
                            size="sm"
                            startContent={
                              formData.icon_color ? (
                                (() => {
                                  const colorOption = COLOR_OPTIONS.find(c => c.key === formData.icon_color);
                                  return colorOption ? (
                                    <span
                                      className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                                      style={{ backgroundColor: colorOption.color }}
                                    />
                                  ) : (
                                    <span className={`w-4 h-4 rounded-full border border-gray-200 flex-shrink-0 ${formData.icon_color}`} />
                                  );
                                })()
                              ) : null
                            }
                            classNames={{
                              base: "w-full",
                              listboxWrapper: "max-h-[300px]",
                              popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg",
                            }}
                            inputProps={{
                              classNames: {
                                input: "text-gray-900 dark:text-white",
                                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                              },
                            }}
                            listboxProps={{
                              emptyContent: "Tidak ada warna ditemukan",
                              className: "bg-white dark:bg-slate-800",
                            }}
                          >
                            {COLOR_OPTIONS.map((color) => (
                              <AutocompleteItem key={color.key} textValue={color.label}>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-4 h-4 rounded-full border border-gray-200"
                                    style={{ backgroundColor: color.color }}
                                  />
                                  <span>{color.label}</span>
                                </div>
                              </AutocompleteItem>
                            ))}
                          </Autocomplete>
                        </div>
                      </div>

                      {/* App Slug and Urutan */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            App Slug
                          </label>
                          <Input
                            placeholder="siakad, simpeg"
                            value={formData.app_slug || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, app_slug: e.target.value || null })
                            }
                            variant="bordered"
                            size="sm"
                            startContent={<FiLayout className="text-gray-400 flex-shrink-0" />}
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                          <p className="text-xs text-gray-500 dark:text-slate-400">Untuk URL routing</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                            Urutan
                          </label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={formData.urutan?.toString() || "0"}
                            onChange={(e) =>
                              setFormData({ ...formData, urutan: parseInt(e.target.value) || 0 })
                            }
                            variant="bordered"
                            size="sm"
                            startContent={<FiHash className="text-gray-400 flex-shrink-0" />}
                            classNames={{
                              input: "text-gray-900 dark:text-white",
                              inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                            }}
                          />
                          <p className="text-xs text-gray-500 dark:text-slate-400">Kecil = tampil lebih atas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Portal Section */}
                  <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-200/50 dark:border-orange-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      Status Portal
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Tampil di Portal */}
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          formData.a_tampil_portal
                            ? "border-primary-400 bg-white dark:bg-primary-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_tampil_portal}
                          onChange={(e) =>
                            setFormData({ ...formData, a_tampil_portal: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Tampil di Portal</span>
                      </label>

                      {/* Maintenance */}
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          formData.a_maintenance
                            ? "border-warning-400 bg-white dark:bg-warning-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_maintenance}
                          onChange={(e) =>
                            setFormData({ ...formData, a_maintenance: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-warning-600 focus:ring-warning-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Maintenance</span>
                      </label>

                      {/* Coming Soon */}
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          formData.a_coming_soon
                            ? "border-secondary-400 bg-white dark:bg-secondary-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_coming_soon}
                          onChange={(e) =>
                            setFormData({ ...formData, a_coming_soon: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-secondary-600 focus:ring-secondary-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Coming Soon</span>
                      </label>

                      {/* Terintegrasi myUnila */}
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          formData.a_terintegrasi
                            ? "border-purple-400 bg-white dark:bg-purple-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_terintegrasi}
                          onChange={(e) =>
                            setFormData({ ...formData, a_terintegrasi: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Terintegrasi myUnila</span>
                      </label>
                    </div>
                  </div>

                  {/* Akses Organisasi Section */}
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Pembatasan Akses Organisasi
                    </h4>
                    <div className="space-y-3">
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                          formData.a_filter_organisasi
                            ? "border-blue-400 bg-white dark:bg-blue-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_filter_organisasi}
                          onChange={(e) =>
                            setFormData({ ...formData, a_filter_organisasi: e.target.checked })
                          }
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Filter Organisasi</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Jika aktif, hanya organisasi yang di-whitelist yang bisa mengakses aplikasi ini. Role universal (Mahasiswa, Dosen, Tendik, Rektor, dll) tetap bisa akses.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </Tab>

              {/* Settings Tab */}
              <Tab key="settings" title="Pengaturan">
                <div className="space-y-5">
                  {/* Status Aplikasi Section */}
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Status Aplikasi
                    </h4>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30">
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.status === 'Aktif'
                            ? "border-success-500 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="Aktif"
                          checked={formData.status === 'Aktif'}
                          onChange={() => setFormData({ ...formData, status: 'Aktif' })}
                          className="sr-only"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full ${formData.status === 'Aktif' ? 'bg-success-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm font-semibold">Aktif</span>
                      </label>
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.status === 'Tidak Aktif'
                            ? "border-danger-500 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-400 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value="Tidak Aktif"
                          checked={formData.status === 'Tidak Aktif'}
                          onChange={() => setFormData({ ...formData, status: 'Tidak Aktif' })}
                          className="sr-only"
                        />
                        <span className={`w-2.5 h-2.5 rounded-full ${formData.status === 'Tidak Aktif' ? 'bg-danger-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm font-semibold">Tidak Aktif</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-3">
                      Status menentukan apakah aplikasi aktif atau tidak aktif dalam sistem
                    </p>
                  </div>

                  {/* Pengaturan Aplikasi Section */}
                  <div className="bg-slate-50/80 dark:bg-slate-700/20 rounded-xl p-4 border border-slate-200/80 dark:border-slate-600/50">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      Pengaturan Aplikasi
                    </h4>
                    <div className="space-y-3">
                      {/* Generate Menu */}
                      <label
                        className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                          formData.a_generate_menu
                            ? "border-primary-400 bg-white dark:bg-primary-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_generate_menu}
                          onChange={(e) =>
                            setFormData({ ...formData, a_generate_menu: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Generate Menu</span>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            Aktifkan auto-generate menu
                          </p>
                        </div>
                      </label>

                      {/* Integrasi SSO/CAS */}
                      <label
                        className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                          formData.a_integrasi_cas
                            ? "border-teal-400 bg-white dark:bg-teal-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_integrasi_cas}
                          onChange={(e) =>
                            setFormData({ ...formData, a_integrasi_cas: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Integrasi SSO/CAS</span>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            Login menggunakan Single Sign-On (CAS) Unila
                          </p>
                        </div>
                      </label>

                      {/* Sistem Internal PT */}
                      <label
                        className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                          formData.a_sistem_internal_pt
                            ? "border-warning-400 bg-white dark:bg-warning-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_sistem_internal_pt}
                          onChange={(e) =>
                            setFormData({ ...formData, a_sistem_internal_pt: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-warning-600 focus:ring-warning-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Sistem Internal PT</span>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            Sistem internal perguruan tinggi
                          </p>
                        </div>
                      </label>

                      {/* Mode Production/Live */}
                      <label
                        className={`flex items-start gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-all ${
                          formData.a_live
                            ? "border-emerald-400 bg-white dark:bg-emerald-900/20 shadow-sm"
                            : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.a_live}
                          onChange={(e) =>
                            setFormData({ ...formData, a_live: e.target.checked })
                          }
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-white">Mode Production</span>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                            Aplikasi sudah live/production (bukan development)
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* App Key Section - Only show in edit mode */}
                  {isEditMode && (
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <FiKey className="text-amber-600" />
                        App Key
                      </h4>
                      <div className="bg-white dark:bg-slate-700/50 rounded-lg p-4 border border-gray-200 dark:border-slate-600 shadow-sm">
                          {currentAppKey ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <code className="flex-1 text-sm font-mono bg-white dark:bg-slate-800 px-3 py-2 rounded border border-gray-200 dark:border-slate-600 overflow-x-auto">
                                  {showAppKey ? currentAppKey : "••••••••••••••••••••••••••••••••"}
                                </code>
                                <Button
                                  type="button"
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onPress={() => setShowAppKey(!showAppKey)}
                                  className="text-gray-600 dark:text-slate-400"
                                >
                                  {showAppKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </Button>
                                <Button
                                  type="button"
                                  isIconOnly
                                  size="sm"
                                  variant="flat"
                                  onPress={handleCopyAppKey}
                                  className={copySuccess ? "text-green-600" : "text-gray-600 dark:text-slate-400"}
                                >
                                  <FiCopy size={16} />
                                </Button>
                              </div>
                              {copySuccess && (
                                <p className="text-xs text-green-600 dark:text-green-400">App Key berhasil disalin!</p>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="flat"
                                color="warning"
                                startContent={<FiRefreshCw size={14} className={isRegeneratingKey ? "animate-spin" : ""} />}
                                isLoading={isRegeneratingKey}
                                onPress={handleRegenerateAppKey}
                                className="w-full"
                              >
                                Regenerate App Key
                              </Button>
                              <p className="text-xs text-amber-600 dark:text-amber-400">
                                Peringatan: Regenerate akan membuat key lama tidak berlaku lagi.
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                                Aplikasi ini belum memiliki App Key.
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                color="primary"
                                startContent={<FiKey size={14} />}
                                isLoading={isRegeneratingKey}
                                onPress={handleRegenerateAppKey}
                              >
                                Generate App Key
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                  )}
                </div>
              </Tab>

              {/* Menu Tab - Only show in edit mode */}
              {isEditMode && (
                <Tab key="menu" title="Menu Aplikasi">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiList className="text-gray-500" />
                        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                          Daftar Menu Aplikasi
                        </label>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        {aplikasi?.menus?.length || 0} menu
                      </span>
                    </div>

                    {aplikasi?.menus && aplikasi.menus.length > 0 ? (
                      <div className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0 z-10">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                Nama Menu
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                URL
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                Urutan
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                            {aplikasi.menus.map((menu) => (
                              <tr key={menu.id_menu} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                <td className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                                  {menu.nm_menu}
                                </td>
                                <td className="px-3 py-2 text-gray-600 dark:text-slate-400 text-xs font-mono">
                                  {menu.url_menu || "-"}
                                </td>
                                <td className="px-3 py-2 text-center text-gray-600 dark:text-slate-400">
                                  {menu.urutan}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    menu.a_aktif
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                                  }`}>
                                    {menu.a_aktif ? "Aktif" : "Nonaktif"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-gray-300 dark:border-slate-600">
                        <FiMenu className="mx-auto h-10 w-10 text-gray-400 dark:text-slate-500 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          Belum ada menu untuk aplikasi ini
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                          Menu dapat ditambahkan melalui fitur manajemen menu aplikasi
                        </p>
                      </div>
                    )}
                  </div>
                </Tab>
              )}
            </Tabs>
          </ModalBody>

          <ModalFooter className="gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="flat"
              onPress={onClose}
              isDisabled={loading}
              className="font-medium"
              size="lg"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {isEditMode ? "Simpan Perubahan" : "Tambah Aplikasi"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
