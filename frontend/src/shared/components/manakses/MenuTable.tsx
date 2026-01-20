"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DataTable, { Column } from "../ui/DataTable";
import {
  Chip,
  Select,
  SelectItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiEyeOff, FiFolder, FiFile } from "react-icons/fi";
import { Icon } from "@iconify/react";
import {
  menuService,
  type Menu,
  type MenuStats,
  type CreateMenuRequest,
  type UpdateMenuRequest,
} from "@/lib/services/manakses/menuService";
import { aplikasiService, type Aplikasi } from "@/lib/services/manakses/aplikasiService";
import { toast } from "react-hot-toast";

// Icon options for menu - Iconify format (same as AplikasiFormModal)
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
  { key: "heroicons:circle-stack", label: "Database" },
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

// Extended Menu type with nm_aplikasi
interface MenuWithAplikasi extends Menu {
  nm_aplikasi?: string;
  parent_menu_name?: string;
}

interface MenuTableProps {
  onStatsLoaded?: (stats: MenuStats) => void;
}

export default function MenuTable({ onStatsLoaded }: MenuTableProps) {
  const [data, setData] = useState<MenuWithAplikasi[]>([]);
  const [stats, setStats] = useState<MenuStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAplikasi, setFilterAplikasi] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState<string>("nm_aplikasi");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown options
  const [aplikasiOptions, setAplikasiOptions] = useState<Aplikasi[]>([]);
  const [parentMenuOptions, setParentMenuOptions] = useState<Menu[]>([]);
  const [loadingParentMenus, setLoadingParentMenus] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuWithAplikasi | null>(null);
  const [formData, setFormData] = useState<CreateMenuRequest>({
    id_aplikasi: "",
    nm_menu: "",
    nm_file: "",
    icon: "",
    urutan_menu: 1,
    a_aktif: true,
    a_tampil: true,
    level_menu: 0,
    id_group_menu: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for callback
  const onStatsLoadedRef = useRef(onStatsLoaded);
  onStatsLoadedRef.current = onStatsLoaded;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Load dropdown options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const aplikasiData = await aplikasiService.getList({ limit: 100 });
        setAplikasiOptions(aplikasiData.data);
      } catch (error) {
        console.error("Error loading options:", error);
      }
    };
    loadOptions();
  }, []);

  // Load stats on mount and when filter changes
  useEffect(() => {
    const loadStats = async () => {
      try {
        const idAplikasi = filterAplikasi !== "all" ? filterAplikasi : undefined;
        const statsData = await menuService.getStats(idAplikasi);
        setStats(statsData);
        if (onStatsLoadedRef.current) {
          onStatsLoadedRef.current(statsData);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
      }
    };
    loadStats();
  }, [filterAplikasi]);

  // Load parent menus when aplikasi changes in form
  useEffect(() => {
    const loadParentMenus = async () => {
      if (!formData.id_aplikasi) {
        setParentMenuOptions([]);
        return;
      }
      setLoadingParentMenus(true);
      try {
        const result = await menuService.getByAplikasi(formData.id_aplikasi, "flat");
        // Filter only level 0 (parent menus) as potential parents for level 1 (child menus)
        // Note: level_menu could be string, number, or null from API
        const parents = (result.menus || []).filter(m => {
          const level = m.level_menu !== null && m.level_menu !== undefined
            ? Number(m.level_menu)
            : 0;
          return level === 0;
        });
        setParentMenuOptions(parents);
      } catch (error) {
        console.error("Error loading parent menus:", error);
        setParentMenuOptions([]);
      } finally {
        setLoadingParentMenus(false);
      }
    };
    loadParentMenus();
  }, [formData.id_aplikasi]);

  // Load data when filters/pagination change
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await menuService.getList({
          page: currentPage,
          limit: rowsPerPage,
          search: searchQuery || undefined,
          id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
          a_aktif: filterStatus !== "all" ? (filterStatus === "aktif" ? "1" : "0") : undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        });

        // Convert string booleans to actual booleans
        const menus = result.data.map(m => ({
          ...m,
          a_aktif: m.a_aktif === true || m.a_aktif === "1" || (m.a_aktif as unknown) === 1,
          a_tampil: m.a_tampil === true || m.a_tampil === "1" || (m.a_tampil as unknown) === 1,
          level_menu: m.level_menu !== null ? Number(m.level_menu) : 0,
          urutan_menu: Number(m.urutan_menu) || 0,
        }));

        setData(menus as MenuWithAplikasi[]);
        setTotalRecords(result.total);
      } catch (error) {
        console.error("Error loading menus:", error);
        toast.error("Gagal memuat data menu", {
          duration: 4000,
          style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage, rowsPerPage, searchQuery, filterAplikasi, filterStatus, sortBy, sortOrder]);

  // Handle sort change
  const handleSortChange = (column: string, direction: "asc" | "desc") => {
    setSortBy(column);
    setSortOrder(direction);
    setCurrentPage(1);
  };

  const columns: Column<MenuWithAplikasi>[] = [
    {
      key: "nm_aplikasi",
      label: "APLIKASI",
      sortable: true,
      width: "180px",
      render: (item) => (
        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {item.nm_aplikasi || "-"}
        </span>
      ),
    },
    {
      key: "nm_menu",
      label: "NAMA MENU",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          {(item.level_menu ?? 0) > 0 ? (
            <FiFile className="w-4 h-4 text-gray-400" />
          ) : (
            <FiFolder className="w-4 h-4 text-indigo-500" />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{item.nm_menu}</div>
            {item.nm_file && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.nm_file}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "level_menu",
      label: "LEVEL",
      sortable: true,
      align: "center",
      width: "100px",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={
            (item.level_menu ?? 0) === 0 ? "primary" :
            (item.level_menu ?? 0) === 1 ? "secondary" : "default"
          }
        >
          Level {item.level_menu ?? 0}
        </Chip>
      ),
    },
    {
      key: "urutan_menu",
      label: "URUTAN",
      sortable: true,
      align: "center",
      width: "90px",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">
          #{item.urutan_menu}
        </span>
      ),
    },
    {
      key: "icon",
      label: "ICON",
      width: "150px",
      render: (item) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate max-w-[140px] block">
          {item.icon || "-"}
        </span>
      ),
    },
    {
      key: "a_aktif",
      label: "STATUS",
      sortable: true,
      align: "center",
      width: "140px",
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Chip
            size="sm"
            variant="flat"
            color={item.a_aktif ? "success" : "danger"}
          >
            {item.a_aktif ? "Aktif" : "Nonaktif"}
          </Chip>
          <Tooltip content={item.a_tampil ? "Tampil di Sidebar" : "Tersembunyi"}>
            {item.a_tampil ? (
              <FiEye className="w-4 h-4 text-blue-500" />
            ) : (
              <FiEyeOff className="w-4 h-4 text-gray-400" />
            )}
          </Tooltip>
        </div>
      ),
    },
    {
      key: "actions",
      label: "AKSI",
      align: "center",
      width: "80px",
      render: (item) => (
        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-500 hover:text-gray-700"
            >
              <FiMoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Aksi"
            className="min-w-[120px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 shadow-lg rounded-lg"
          >
            <DropdownItem
              key="edit"
              startContent={<FiEdit2 className="w-4 h-4" />}
              onPress={() => handleEdit(item)}
              className="text-gray-700 dark:text-gray-300"
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              startContent={<FiTrash2 className="w-4 h-4" />}
              onPress={() => handleDeleteClick(item)}
              className="text-danger"
              color="danger"
            >
              Hapus
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  const handleEdit = (item: MenuWithAplikasi) => {
    setSelectedItem(item);
    setFormData({
      id_aplikasi: item.id_aplikasi,
      nm_menu: item.nm_menu,
      nm_file: item.nm_file || "",
      icon: item.icon || "",
      urutan_menu: item.urutan_menu,
      a_aktif: item.a_aktif,
      a_tampil: item.a_tampil,
      level_menu: item.level_menu ?? 0,
      id_group_menu: item.id_group_menu || null,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item: MenuWithAplikasi) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : "",
      nm_menu: "",
      nm_file: "",
      icon: "",
      urutan_menu: 1,
      a_aktif: true,
      a_tampil: true,
      level_menu: 0,
      id_group_menu: null,
    });
    setIsAddModalOpen(true);
  };

  const reloadData = async () => {
    setLoading(true);
    try {
      const result = await menuService.getList({
        page: currentPage,
        limit: rowsPerPage,
        search: searchQuery || undefined,
        id_aplikasi: filterAplikasi !== "all" ? filterAplikasi : undefined,
        a_aktif: filterStatus !== "all" ? (filterStatus === "aktif" ? "1" : "0") : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      const menus = result.data.map(m => ({
        ...m,
        a_aktif: m.a_aktif === true || m.a_aktif === "1" || (m.a_aktif as unknown) === 1,
        a_tampil: m.a_tampil === true || m.a_tampil === "1" || (m.a_tampil as unknown) === 1,
        level_menu: m.level_menu !== null ? Number(m.level_menu) : 0,
        urutan_menu: Number(m.urutan_menu) || 0,
      }));

      setData(menus as MenuWithAplikasi[]);
      setTotalRecords(result.total);

      // Reload stats
      const idAplikasi = filterAplikasi !== "all" ? filterAplikasi : undefined;
      const statsData = await menuService.getStats(idAplikasi);
      setStats(statsData);
      if (onStatsLoadedRef.current) {
        onStatsLoadedRef.current(statsData);
      }
    } catch (error) {
      console.error("Error reloading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAdd = async () => {
    if (!formData.id_aplikasi) {
      toast.error("Aplikasi harus dipilih", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    if (!formData.nm_menu) {
      toast.error("Nama Menu harus diisi", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    // Validate icon for Level 0 (Parent)
    if (formData.level_menu === 0 && !formData.icon) {
      toast.error("Icon wajib dipilih untuk Menu Utama (Level 0)", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    // Validate parent menu for Level 1 (Child)
    if (formData.level_menu === 1 && !formData.id_group_menu) {
      toast.error("Parent Menu harus dipilih untuk Sub Menu (Level 1)", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await menuService.create(formData);
      toast.success("Menu berhasil ditambahkan", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      setIsAddModalOpen(false);
      await reloadData();
    } catch (error: unknown) {
      console.error("Error creating menu:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menambahkan menu";
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedItem || !formData.nm_menu) {
      toast.error("Nama Menu harus diisi", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    // Validate icon for Level 0 (Parent)
    if (formData.level_menu === 0 && !formData.icon) {
      toast.error("Icon wajib dipilih untuk Menu Utama (Level 0)", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }
    // Validate parent menu for Level 1 (Child)
    if (formData.level_menu === 1 && !formData.id_group_menu) {
      toast.error("Parent Menu harus dipilih untuk Sub Menu (Level 1)", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData: UpdateMenuRequest = {
        nm_menu: formData.nm_menu,
        nm_file: formData.nm_file || null,
        icon: formData.icon || null,
        urutan_menu: formData.urutan_menu,
        a_aktif: formData.a_aktif,
        a_tampil: formData.a_tampil,
        level_menu: formData.level_menu,
        id_group_menu: formData.id_group_menu,
      };
      await menuService.update(selectedItem.id_menu, updateData);
      toast.success("Menu berhasil diperbarui", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      setIsEditModalOpen(false);
      await reloadData();
    } catch (error: unknown) {
      console.error("Error updating menu:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal memperbarui menu";
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await menuService.delete(selectedItem.id_menu);
      toast.success("Menu berhasil dihapus", {
        duration: 3000,
        style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
      });
      setIsDeleteModalOpen(false);
      await reloadData();
    } catch (error: unknown) {
      console.error("Error deleting menu:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus menu";
      toast.error(errorMessage, {
        duration: 4000,
        style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter slot
  const filterSlot = (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        aria-label="Filter Aplikasi"
        placeholder="Semua Aplikasi"
        selectedKeys={[filterAplikasi]}
        onChange={(e) => {
          setFilterAplikasi(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-52",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
        renderValue={(items) => {
          if (!items || items.length === 0) return "Semua Aplikasi";
          const item = items[0];
          if (item.key === "all") return "Semua Aplikasi";
          return item.textValue || "Semua Aplikasi";
        }}
      >
        <SelectItem key="all" value="all" textValue="Semua Aplikasi">
          <span className="text-sm">Semua Aplikasi</span>
        </SelectItem>
        {aplikasiOptions.map((app) => (
          <SelectItem key={app.id_aplikasi} value={app.id_aplikasi} textValue={app.nm_aplikasi}>
            <span className="text-sm">{app.nm_aplikasi}</span>
          </SelectItem>
        ))}
      </Select>
      <Select
        aria-label="Filter Status"
        placeholder="Semua Status"
        selectedKeys={[filterStatus]}
        onChange={(e) => {
          setFilterStatus(e.target.value || "all");
          setCurrentPage(1);
        }}
        classNames={{
          base: "w-36",
          trigger: "h-9 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 focus:border-indigo-500 transition-colors shadow-sm",
          value: "text-sm font-medium text-gray-700 dark:text-gray-300 pr-6",
          innerWrapper: "!bg-white dark:!bg-gray-800",
          popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200",
          listbox: "!bg-white dark:!bg-gray-800",
        }}
        size="sm"
        variant="bordered"
      >
        <SelectItem key="all" value="all">Semua Status</SelectItem>
        <SelectItem key="aktif" value="aktif">Aktif</SelectItem>
        <SelectItem key="nonaktif" value="nonaktif">Nonaktif</SelectItem>
      </Select>
    </div>
  );

  // Action slot with Add button
  const actionSlot = (
    <Button
      color="primary"
      startContent={<FiPlus className="w-4 h-4" />}
      onPress={handleAddNew}
      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg"
      size="sm"
    >
      Tambah Menu
    </Button>
  );

  // Form modal content
  const renderFormContent = () => (
    <div className="space-y-5">
      {/* Aplikasi Selection - only for add */}
      {!selectedItem && (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Pilih Aplikasi
          </h4>
          <Select
            aria-label="Pilih Aplikasi"
            placeholder="Pilih aplikasi"
            selectedKeys={formData.id_aplikasi ? [formData.id_aplikasi] : []}
            onChange={(e) => setFormData({ ...formData, id_aplikasi: e.target.value, id_group_menu: null })}
            variant="bordered"
            size="sm"
            classNames={{
              trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
              value: "text-gray-900 dark:text-white",
              popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
            }}
          >
            {aplikasiOptions.map((app) => (
              <SelectItem key={app.id_aplikasi} value={app.id_aplikasi}>
                {app.nm_aplikasi}
              </SelectItem>
            ))}
          </Select>
        </div>
      )}

      {/* Menu Info Section */}
      <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
          Informasi Menu
        </h4>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Nama Menu <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Masukkan nama menu"
              value={formData.nm_menu}
              onValueChange={(value) => setFormData({ ...formData, nm_menu: value })}
              variant="bordered"
              size="sm"
              classNames={{
                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                input: "text-gray-900 dark:text-white",
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              URL / Path
            </label>
            <Input
              placeholder="/dashboard/example"
              value={formData.nm_file || ""}
              onValueChange={(value) => setFormData({ ...formData, nm_file: value })}
              variant="bordered"
              size="sm"
              classNames={{
                inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                input: "text-gray-900 dark:text-white font-mono",
              }}
            />
          </div>
          {/* Icon Picker - Only show for Level 0 (Parent) menus */}
          {formData.level_menu === 0 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Icon <span className="text-red-500">*</span>
              </label>
              <Autocomplete
                aria-label="Pilih Icon"
                placeholder="Cari icon..."
                allowsCustomValue
                defaultItems={ICON_OPTIONS}
                inputValue={formData.icon || ""}
                onInputChange={(value) => {
                  setFormData({ ...formData, icon: value });
                }}
                onSelectionChange={(key) => {
                  if (key) {
                    setFormData({ ...formData, icon: key as string });
                  }
                }}
                startContent={
                  formData.icon ? (
                    <Icon icon={formData.icon} className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : null
                }
                size="sm"
                variant="bordered"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[300px]",
                  popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                }}
                inputProps={{
                  classNames: {
                    inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                    input: "text-gray-900 dark:text-white",
                  },
                }}
              >
                {(icon) => (
                  <AutocompleteItem
                    key={icon.key}
                    textValue={icon.key}
                    classNames={{
                      base: "data-[hover=true]:bg-gray-100 dark:data-[hover=true]:bg-slate-700",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon icon={icon.key} className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800 dark:text-gray-200">{icon.label}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{icon.key}</span>
                      </div>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Icon wajib untuk menu utama. Pilih dari daftar atau ketik nama icon Iconify.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hierarchy Section */}
      <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Hierarki & Urutan
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Level Menu <span className="text-red-500">*</span>
              </label>
              <Select
                aria-label="Pilih Level Menu"
                placeholder="Pilih level menu"
                selectedKeys={new Set([String(formData.level_menu)])}
                disallowEmptySelection
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  const level = parseInt(selectedKey) || 0;
                  setFormData({
                    ...formData,
                    level_menu: level,
                    // Reset parent menu when switching to Level 0 (parent)
                    // Also clear icon when switching to Level 1
                    id_group_menu: level === 0 ? null : formData.id_group_menu,
                    icon: level === 1 ? "" : formData.icon,
                  });
                }}
                variant="bordered"
                size="sm"
                classNames={{
                  trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                  value: "text-gray-900 dark:text-white",
                  popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                }}
              >
                <SelectItem key="0" textValue="Level 0 - Menu Utama (Parent)">
                  <div className="flex items-center gap-2">
                    <FiFolder className="w-4 h-4 text-indigo-500" />
                    <span>Level 0 - Menu Utama (Parent)</span>
                  </div>
                </SelectItem>
                <SelectItem key="1" textValue="Level 1 - Sub Menu (Child)">
                  <div className="flex items-center gap-2">
                    <FiFile className="w-4 h-4 text-gray-400" />
                    <span>Level 1 - Sub Menu (Child)</span>
                  </div>
                </SelectItem>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formData.level_menu === 0
                  ? "Menu utama yang tampil di sidebar dengan icon"
                  : "Sub menu yang tampil di bawah menu utama"
                }
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Urutan
              </label>
              <Input
                type="number"
                placeholder="1"
                value={String(formData.urutan_menu || 1)}
                onValueChange={(value) => setFormData({ ...formData, urutan_menu: parseInt(value) || 1 })}
                min={1}
                variant="bordered"
                size="sm"
                classNames={{
                  inputWrapper: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm",
                  input: "text-gray-900 dark:text-white",
                }}
              />
            </div>
          </div>

          {/* Parent Menu - only show when Level 1 (child) is selected */}
          {formData.level_menu === 1 && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Parent Menu <span className="text-red-500">*</span>
              </label>
              {!formData.id_aplikasi ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Pilih aplikasi terlebih dahulu untuk melihat daftar menu parent
                  </p>
                </div>
              ) : loadingParentMenus ? (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Memuat daftar menu parent...
                  </p>
                </div>
              ) : parentMenuOptions.length === 0 ? (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Tidak ada menu utama (Level 0) untuk aplikasi ini.
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Untuk menambahkan Sub Menu (Level 1), Anda harus membuat Menu Utama (Level 0) terlebih dahulu.
                    Tutup modal ini, ubah Level Menu ke &quot;Level 0 - Menu Utama&quot;, lalu buat menu utama.
                  </p>
                </div>
              ) : (
                <Select
                  aria-label="Pilih Parent Menu"
                  placeholder="Pilih menu utama (Level 0)"
                  selectedKeys={formData.id_group_menu ? [formData.id_group_menu] : []}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    setFormData({
                      ...formData,
                      id_group_menu: value,
                    });
                  }}
                  variant="bordered"
                  size="sm"
                  classNames={{
                    trigger: "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm",
                    value: "text-gray-900 dark:text-white",
                    popoverContent: "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600",
                  }}
                >
                  {parentMenuOptions.map((menu) => (
                    <SelectItem key={menu.id_menu} value={menu.id_menu}>
                      <div className="flex items-center gap-2">
                        <FiFolder className="w-4 h-4 text-indigo-500" />
                        {menu.nm_menu}
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pilih menu utama sebagai parent dari sub menu ini
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Status Section */}
      <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Status
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
              formData.a_aktif
                ? "border-success-400 bg-white dark:bg-success-900/20 shadow-sm"
                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.a_aktif || false}
              onChange={(e) => setFormData({ ...formData, a_aktif: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-success-600 focus:ring-success-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Menu Aktif</span>
          </label>
          <label
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
              formData.a_tampil
                ? "border-primary-400 bg-white dark:bg-primary-900/20 shadow-sm"
                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/30 hover:border-gray-300 dark:hover:border-slate-500"
            }`}
          >
            <input
              type="checkbox"
              checked={formData.a_tampil || false}
              onChange={(e) => setFormData({ ...formData, a_tampil: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-800 dark:text-white">Tampil di Sidebar</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <DataTable
            data={data}
            columns={columns}
            searchable
            searchKeys={["nm_menu", "nm_file", "nm_aplikasi"]}
            searchPlaceholder="Cari nama menu, path, atau aplikasi..."
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            loading={loading}
            serverSide
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            onSearchChange={(search) => {
              setSearchQuery(search);
              setCurrentPage(1);
            }}
            onSortChange={handleSortChange}
            filterSlot={filterSlot}
            actionSlot={actionSlot}
            className="shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Tambah Menu Baru
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              Isi form untuk menambah menu baru ke aplikasi
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            {renderFormContent()}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitAdd} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-2 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Edit Menu
            </h3>
            <p className="text-sm font-normal text-gray-600 dark:text-slate-400">
              Perbarui informasi menu
            </p>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            {renderFormContent()}
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsEditModalOpen(false)}>
              Batal
            </Button>
            <Button color="primary" onPress={handleSubmitEdit} isLoading={isSubmitting}>
              Simpan
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl",
          closeButton: "hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors",
        }}
      >
        <ModalContent>
          <ModalHeader className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Konfirmasi Hapus</h3>
          </ModalHeader>
          <ModalBody className="px-6 py-5">
            <p className="text-gray-700 dark:text-gray-300">
              Apakah Anda yakin ingin menghapus menu <strong>{selectedItem?.nm_menu}</strong>?
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              Perhatian: Menghapus menu parent akan menghapus semua sub-menu di bawahnya.
            </p>
          </ModalBody>
          <ModalFooter className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <Button variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={isSubmitting}>
              Hapus
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
