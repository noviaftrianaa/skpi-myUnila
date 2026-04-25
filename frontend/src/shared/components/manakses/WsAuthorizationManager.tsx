"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

// Helper: safely extract array from paginated or direct response
const toArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

import {
  Card, CardBody, Button, Select, SelectItem, Input, Chip,
  Spinner, Accordion, AccordionItem, Modal, ModalContent,
  ModalHeader, ModalBody, ModalFooter, useDisclosure,
} from "@heroui/react";
import {
  FiSave, FiRefreshCw, FiSearch, FiShield, FiCheck, FiX, FiServer,
  FiDownload, FiPrinter, FiUser, FiBox,
} from "react-icons/fi";
import { authClient } from "@/lib/api/authClient";
import { wsAuthorizationService, type SystemRoute } from "@/lib/services/manakses/wsAuthorizationService";
import toast from "react-hot-toast";

interface AppOption {
  id_aplikasi: string;
  nm_aplikasi: string;
}

interface PjAplikasi {
  id_pj_aplikasi: string;
  id_pengguna: string;
  id_aplikasi: string;
  nm_pengguna: string;
  username: string;
  nm_aplikasi?: string;
}

interface EndpointItem {
  id_ws_endpoint: string;
  nm_group: string;
  nm_method: string;
  nm_endpoint: string | null;
  path_url: string;
  a_active: boolean;
}

interface GroupedEndpoints {
  [group: string]: EndpointItem[];
}

const toastSuccess = (msg: string) =>
  toast.success(msg, {
    duration: 3000,
    style: { borderRadius: "12px", background: "#10B981", color: "#fff", fontWeight: "500" },
    iconTheme: { primary: "#fff", secondary: "#10B981" },
  });

const toastError = (msg: string) =>
  toast.error(msg, {
    duration: 4000,
    style: { borderRadius: "12px", background: "#EF4444", color: "#fff", fontWeight: "500" },
    iconTheme: { primary: "#fff", secondary: "#EF4444" },
  });

const METHOD_COLORS: Record<string, string> = {
  GET: "success",
  POST: "primary",
  PUT: "warning",
  DELETE: "danger",
  PATCH: "secondary",
};

export default function WsAuthorizationManager() {
  // Data state
  //   providerApps = aplikasi yang PUNYA endpoint (service provider, e.g. WS API MyUnila v2)
  //   apps         = aplikasi CLIENT (consumer) yang minta akses ke endpoint provider
  const [providerApps, setProviderApps] = useState<AppOption[]>([]);
  const [apps, setApps] = useState<AppOption[]>([]);
  const [pjList, setPjList] = useState<PjAplikasi[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointItem[]>([]);
  const [authorizedIds, setAuthorizedIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Filter state
  //   selectedProvider = ID aplikasi provider (sumber endpoint — default WS API MyUnila v2)
  //   selectedApp      = ID aplikasi client (consumer) yang PJ-nya mau di-beri akses
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [selectedPj, setSelectedPj] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // UI state
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingPj, setLoadingPj] = useState(false);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate modal
  const { isOpen: isGenOpen, onOpen: onGenOpen, onClose: onGenClose } = useDisclosure();
  const [genRoutes, setGenRoutes] = useState<SystemRoute[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  // Get selected PJ data
  const selectedPjData = useMemo(() => pjList.find((p) => p.id_pengguna === selectedPj), [pjList, selectedPj]);
  const selectedAppData = useMemo(() => apps.find((a) => a.id_aplikasi === selectedApp), [apps, selectedApp]);
  const selectedProviderData = useMemo(() => providerApps.find((a) => a.id_aplikasi === selectedProvider), [providerApps, selectedProvider]);

  // Load provider apps (yang punya endpoint ter-register) + all client apps paralel.
  // Provider list: dari /endpoint/apps (sudah filter yang punya endpoint).
  // Client list: dari /aplikasi (semua aplikasi aktif).
  useEffect(() => {
    const loadData = async () => {
      try {
        const [providerRes, clientRes] = await Promise.all([
          authClient.get("/manakses/endpoint/apps"),
          authClient.get("/manakses/aplikasi?limit=500"),
        ]);
        const allProviders = toArray(providerRes.data.data).map((a: any) => ({
          id_aplikasi: a.id_aplikasi,
          nm_aplikasi: a.nm_aplikasi,
        }));
        const clients = toArray(clientRes.data.data).map((a: any) => ({
          id_aplikasi: a.id_aplikasi,
          nm_aplikasi: a.nm_aplikasi,
        }));
        // Provider dikunci ke "WS API MyUnila v2" — satu service provider standar.
        // Kalau ada beberapa app yang punya endpoint, filter cuma yang v2.
        const v2Only = allProviders.filter((p) =>
          p.nm_aplikasi.toLowerCase().includes("myunila v2")
        );
        const providers = v2Only.length > 0 ? v2Only : allProviders;
        setProviderApps(providers);
        setApps(clients);
        if (providers[0]) setSelectedProvider(providers[0].id_aplikasi);
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat data aplikasi");
      } finally {
        setLoadingApps(false);
      }
    };
    loadData();
  }, []);

  // Load PJ Aplikasi when app selected
  useEffect(() => {
    if (!selectedApp) {
      setPjList([]);
      setSelectedPj("");
      setEndpoints([]);
      setAuthorizedIds(new Set());
      setCheckedIds(new Set());
      return;
    }

    const loadPj = async () => {
      setLoadingPj(true);
      setSelectedPj("");
      setEndpoints([]);
      setAuthorizedIds(new Set());
      setCheckedIds(new Set());
      try {
        const res = await authClient.get(`/manakses/pj-aplikasi?id_aplikasi=${selectedApp}&limit=100`);
        const data = toArray(res.data.data);
        const list: PjAplikasi[] = data.map((p: any) => ({
          id_pj_aplikasi: p.id_pj_aplikasi,
          id_pengguna: p.id_pengguna,
          id_aplikasi: p.id_aplikasi,
          nm_pengguna: p.nm_pengguna || p.nama || p.nm_pd || "",
          username: p.username || "",
          nm_aplikasi: p.nm_aplikasi,
        }));
        setPjList(list);
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat data PJ Aplikasi");
      } finally {
        setLoadingPj(false);
      }
    };
    loadPj();
  }, [selectedApp]);

  // Load endpoints (dari PROVIDER) + existing authorization untuk PJ yang dipilih.
  // Logika:
  //   • Endpoint list selalu dari Provider (sumber service).
  //   • Authorized set di-filter untuk pengguna = PJ + id_aplikasi = provider.
  useEffect(() => {
    if (!selectedProvider || !selectedPj) {
      setEndpoints([]);
      setAuthorizedIds(new Set());
      setCheckedIds(new Set());
      return;
    }

    const load = async () => {
      setLoadingEndpoints(true);
      try {
        // Endpoints = dari aplikasi PROVIDER (sumber service)
        const epsRes = await authClient.get(`/manakses/endpoint?limit=500&id_aplikasi=${selectedProvider}`);
        const epList: EndpointItem[] = toArray(epsRes.data.data).map((e: any) => ({
          id_ws_endpoint: e.id_ws_endpoint,
          nm_group: e.nm_group || "uncategorized",
          nm_method: e.nm_method || "GET",
          nm_endpoint: e.nm_endpoint,
          path_url: e.path_url,
          a_active: e.a_active,
        }));
        setEndpoints(epList);

        // Existing authorization untuk pengguna PJ ini, dalam scope provider.
        const authRes = await wsAuthorizationService.getByPengguna(selectedPj, selectedProvider);
        const authSet = new Set(authRes.endpoint_ids || []);
        setAuthorizedIds(authSet);
        setCheckedIds(new Set(authSet));
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat endpoints");
      } finally {
        setLoadingEndpoints(false);
      }
    };
    load();
  }, [selectedProvider, selectedPj]);

  // Group + filter endpoints
  const groupedEndpoints = useMemo(() => {
    const filtered = endpoints.filter((ep) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        ep.path_url.toLowerCase().includes(q) ||
        (ep.nm_endpoint || "").toLowerCase().includes(q) ||
        ep.nm_group.toLowerCase().includes(q)
      );
    });

    const groups: GroupedEndpoints = {};
    for (const ep of filtered) {
      const g = ep.nm_group || "uncategorized";
      if (!groups[g]) groups[g] = [];
      groups[g].push(ep);
    }

    // Sort: GET → POST → PUT → PATCH → DELETE, lalu alphabet path.
    // Mempermudah scan endpoint per-method dalam tiap grup.
    const methodOrder: Record<string, number> = { GET: 1, POST: 2, PUT: 3, PATCH: 4, DELETE: 5 };
    const sorted: GroupedEndpoints = {};
    Object.keys(groups)
      .sort()
      .forEach((k) => {
        sorted[k] = groups[k].sort((a, b) => {
          const ma = methodOrder[a.nm_method] ?? 99;
          const mb = methodOrder[b.nm_method] ?? 99;
          if (ma !== mb) return ma - mb;
          return a.path_url.localeCompare(b.path_url);
        });
      });
    return sorted;
  }, [endpoints, searchQuery]);

  // Has changes?
  const hasChanges = useMemo(() => {
    if (authorizedIds.size !== checkedIds.size) return true;
    for (const id of authorizedIds) {
      if (!checkedIds.has(id)) return true;
    }
    return false;
  }, [authorizedIds, checkedIds]);

  // Stats
  const totalEndpoints = endpoints.length;
  const totalChecked = checkedIds.size;
  const totalGroups = Object.keys(groupedEndpoints).length;

  // Handlers
  const toggleEndpoint = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleGroup = useCallback(
    (group: string, checked: boolean) => {
      const groupEps = groupedEndpoints[group] || [];
      setCheckedIds((prev) => {
        const next = new Set(prev);
        for (const ep of groupEps) {
          if (checked) next.add(ep.id_ws_endpoint);
          else next.delete(ep.id_ws_endpoint);
        }
        return next;
      });
    },
    [groupedEndpoints]
  );

  const selectAll = useCallback(() => {
    setCheckedIds(new Set(endpoints.map((ep) => ep.id_ws_endpoint)));
  }, [endpoints]);

  const deselectAll = useCallback(() => {
    setCheckedIds(new Set());
  }, []);

  const resetChanges = useCallback(() => {
    setCheckedIds(new Set(authorizedIds));
  }, [authorizedIds]);

  // Save (sync by pengguna).
  // id_aplikasi yang di-simpan di ws_authorization = PROVIDER (bukan consumer),
  // supaya middleware ws-auth (yg cek e.id_aplikasi = provider) bisa match.
  const handleSave = async () => {
    if (!selectedPj || !selectedProvider) return;
    setIsSaving(true);
    try {
      const result = await wsAuthorizationService.syncByPengguna(
        selectedPj,
        selectedProvider,
        Array.from(checkedIds)
      );
      toastSuccess(result.message);
      setAuthorizedIds(new Set(checkedIds));
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  // Print PDF
  const handlePrintPDF = () => {
    if (!selectedPjData || !selectedAppData) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const nowDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const nowTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }) + " WIB";
    const checkedEndpoints = endpoints.filter((ep) => checkedIds.has(ep.id_ws_endpoint));
    // Watermark text — disisipkan ke setiap halaman (transparent overlay).
    const wmText = `RAHASIA · PJ ${selectedPjData.nm_pengguna} · ${nowDate}`;
    // SVG data URL untuk background tile watermark (rotate -28°, opacity 0.05).
    const wmSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='320'>
      <text x='50%' y='50%' fill='%231a1a2e' fill-opacity='0.06' font-family='Poppins,Segoe UI,sans-serif'
        font-size='32' font-weight='700' text-anchor='middle' transform='rotate(-28 300 160)'>${wmText.replace(/'/g, "%27").replace(/&/g, "%26").replace(/</g, "%3C").replace(/>/g, "%3E")}</text>
    </svg>`;
    const wmDataUrl = `url("data:image/svg+xml;utf8,${wmSvg.replace(/\n\s*/g, " ").replace(/"/g, "'")}")`;

    // Method order untuk sort: GET → POST → PUT → PATCH → DELETE
    const methodOrder: Record<string, number> = { GET: 1, POST: 2, PUT: 3, PATCH: 4, DELETE: 5 };

    // Group checked endpoints
    const grouped: Record<string, EndpointItem[]> = {};
    for (const ep of checkedEndpoints) {
      const g = ep.nm_group || "uncategorized";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(ep);
    }
    const sortedGroups = Object.keys(grouped).sort();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Laporan Otorisasi WS API - ${selectedPjData.nm_pengguna}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          body {
            padding: 28px 32px;
            color: #1a1a2e;
            font-size: 11px;
            line-height: 1.5;
            background-image: ${wmDataUrl};
            background-repeat: repeat;
            background-position: center top;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Header */
          .header {
            text-align: center;
            margin-bottom: 22px;
            padding-bottom: 14px;
            border-bottom: 2px solid #1a1a2e;
            position: relative;
          }
          .header::after {
            content: '';
            position: absolute;
            left: 0; right: 0; bottom: -5px;
            height: 1px;
            background: #1a1a2e;
          }
          .header-flex {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18px;
            margin-bottom: 6px;
          }
          .header img {
            width: 64px;
            height: 64px;
            object-fit: contain;
          }
          .header-text { text-align: left; }
          .header h1 {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #1a1a2e;
            line-height: 1.2;
          }
          .header h2 {
            font-size: 12px;
            font-weight: 500;
            color: #444;
            letter-spacing: 0.5px;
            margin-top: 3px;
            line-height: 1.3;
          }
          .doc-title {
            font-size: 14px;
            font-weight: 600;
            color: #4f46e5;
            margin-top: 10px;
            letter-spacing: 0.3px;
          }
          .header .subtitle {
            font-size: 10px;
            color: #6b7280;
            margin-top: 6px;
            letter-spacing: 0.2px;
          }
          /* Info card */
          .info {
            margin-bottom: 16px;
            background: rgba(248, 249, 250, 0.92);
            border-radius: 8px;
            padding: 14px 18px;
            border: 1px solid #e5e7eb;
            backdrop-filter: blur(2px);
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 7px 24px;
          }
          .info-item { display: flex; gap: 8px; }
          .info-label { font-weight: 600; color: #4b5563; min-width: 110px; font-size: 10.5px; }
          .info-value { color: #1a1a2e; font-size: 10.5px; }
          .info-value.mono { font-family: 'JetBrains Mono', 'Consolas', monospace; font-size: 9.5px; }
          /* Credential note */
          .cred-note {
            margin-bottom: 16px;
            padding: 10px 14px;
            background: rgba(255, 248, 225, 0.92);
            border-left: 3px solid #f59e0b;
            font-size: 10px;
            color: #78350f;
            border-radius: 0 6px 6px 0;
            line-height: 1.5;
          }
          .cred-note code {
            background: #fef3c7;
            padding: 1px 5px;
            border-radius: 3px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9.5px;
          }
          /* Endpoint groups */
          .group-section { margin-bottom: 14px; page-break-inside: avoid; }
          .group-title {
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            background: linear-gradient(90deg, #eef2ff, #f5f3ff);
            border-left: 3px solid #4f46e5;
            margin-bottom: 5px;
            border-radius: 0 5px 5px 0;
            color: #312e81;
            text-transform: capitalize;
            letter-spacing: 0.3px;
          }
          table.endpoints {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            background: rgba(255,255,255,0.92);
          }
          table.endpoints th {
            background: #f1f3f5;
            padding: 5px 8px;
            text-align: left;
            border: 1px solid #dee2e6;
            font-weight: 600;
            font-size: 9.5px;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          table.endpoints td {
            padding: 4px 8px;
            border: 1px solid #dee2e6;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          table.endpoints td.path {
            font-family: 'JetBrains Mono', 'Consolas', monospace;
            font-size: 9.5px;
            max-width: 350px;
            word-break: break-all;
            color: #1f2937;
          }
          table.endpoints tr:nth-child(even) { background: rgba(248,249,250,0.85); }
          .method {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            display: inline-block;
            min-width: 46px;
            text-align: center;
            letter-spacing: 0.3px;
          }
          .method-GET    { background: #d4edda; color: #155724; }
          .method-POST   { background: #cce5ff; color: #004085; }
          .method-PUT    { background: #fff3cd; color: #856404; }
          .method-DELETE { background: #f8d7da; color: #721c24; }
          .method-PATCH  { background: #e2e3f1; color: #383d6e; }
          /* Footer */
          .footer {
            margin-top: 22px;
            text-align: center;
            font-size: 9px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            line-height: 1.5;
          }
          .footer strong { color: #4b5563; }
          @media print {
            body {
              padding: 18px 22px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .group-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-flex">
            <img src="/assets/images/logo-unila.png" alt="Logo Unila" onerror="this.style.display='none'" />
            <div class="header-text">
              <h1>Universitas Lampung</h1>
              <h2>UPT Teknologi Informasi dan Komunikasi</h2>
            </div>
          </div>
          <div class="doc-title">Laporan Otorisasi Endpoint Web Service API</div>
          <div class="subtitle">Dicetak pada ${nowDate} pukul ${nowTime}</div>
        </div>

        <div class="info">
          <div class="info-grid">
            <div class="info-item"><span class="info-label">Aplikasi Client</span><span class="info-value">: ${selectedAppData.nm_aplikasi}</span></div>
            <div class="info-item"><span class="info-label">Service Provider</span><span class="info-value">: ${selectedProviderData?.nm_aplikasi ?? "-"}</span></div>
            <div class="info-item"><span class="info-label">ID Aplikasi</span><span class="info-value mono">: ${selectedAppData.id_aplikasi}</span></div>
            <div class="info-item"><span class="info-label">Total Endpoint</span><span class="info-value">: ${checkedEndpoints.length} dari ${totalEndpoints}</span></div>
            <div class="info-item"><span class="info-label">PJ Aplikasi</span><span class="info-value">: ${selectedPjData.nm_pengguna}</span></div>
            <div class="info-item"><span class="info-label">Total Group</span><span class="info-value">: ${sortedGroups.length}</span></div>
            <div class="info-item"><span class="info-label">Username</span><span class="info-value mono">: ${selectedPjData.username}</span></div>
            <div class="info-item"><span class="info-label">Password</span><span class="info-value" style="color:#9ca3af;font-style:italic">: (rahasia — diketahui PJ aplikasi)</span></div>
          </div>
        </div>

        <div class="cred-note">
          <strong>Catatan kredensial:</strong> Gunakan <strong>Username</strong> + <strong>ID Aplikasi</strong>
          di atas beserta password yang sudah diserahterimakan ke PJ untuk otentikasi via
          <code>POST /v1/auth/login</code>. Password tidak ditampilkan di dokumen ini demi keamanan.
          Watermark "RAHASIA" pada halaman menunjukkan dokumen ini bersifat terbatas — tidak untuk disebarluaskan.
        </div>

        ${sortedGroups.map((group) => `
          <div class="group-section">
            <div class="group-title">${group} <span style="font-weight:400;font-size:10px;opacity:0.7">(${grouped[group].length} endpoint)</span></div>
            <table class="endpoints">
              <thead><tr><th style="width:38px">No</th><th style="width:60px">Method</th><th>Path URL</th><th style="width:140px">Nama</th></tr></thead>
              <tbody>
                ${grouped[group].sort((a, b) => {
                  const ma = methodOrder[a.nm_method] ?? 99;
                  const mb = methodOrder[b.nm_method] ?? 99;
                  if (ma !== mb) return ma - mb;
                  return a.path_url.localeCompare(b.path_url);
                }).map((ep, i) => `
                  <tr>
                    <td style="text-align:center">${i + 1}</td>
                    <td><span class="method method-${ep.nm_method}">${ep.nm_method || "-"}</span></td>
                    <td class="path">${ep.path_url}</td>
                    <td>${ep.nm_endpoint || "-"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `).join("")}

        <div class="footer">
          <strong>MyUnila</strong> — UPT TIK Universitas Lampung<br/>
          Dokumen ini di-generate otomatis oleh sistem Manajemen Akses · ${nowDate} ${nowTime}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  // Generate endpoints
  const handleOpenGenerate = async () => {
    setGenLoading(true);
    onGenOpen();
    try {
      const data = await wsAuthorizationService.fetchWsRoutes();
      setGenRoutes(data.routes || []);
    } catch (e) {
      toastError("Gagal mengambil routes dari ws-service");
      onGenClose();
    } finally {
      setGenLoading(false);
    }
  };

  const handleConfirmGenerate = async () => {
    if (!selectedProvider || genRoutes.length === 0) return;
    setIsGenerating(true);
    try {
      const formatted = genRoutes.map((r) => ({
        nm_group: r.nm_group,
        nm_method: r.method,
        path_url: r.path,
        nm_endpoint: r.path.split("/").pop()?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || r.path,
      }));
      // Generate always applies to PROVIDER (sumber endpoint), bukan consumer.
      const result = await wsAuthorizationService.generateEndpoints(selectedProvider, formatted);
      toastSuccess(result.message);
      onGenClose();

      // Reload endpoints dari provider
      const epsRes = await authClient.get(`/manakses/endpoint?limit=500&id_aplikasi=${selectedProvider}`);
      const epList = toArray(epsRes.data.data).map((e: any) => ({
        id_ws_endpoint: e.id_ws_endpoint,
        nm_group: e.nm_group || "uncategorized",
        nm_method: e.nm_method || "GET",
        nm_endpoint: e.nm_endpoint,
        path_url: e.path_url,
        a_active: e.a_active,
      }));
      setEndpoints(epList);
    } catch (e: any) {
      toastError(e.response?.data?.message || "Gagal generate");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loadingApps) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Filter Bar */}
      <Card className="border-none shadow-lg rounded-xl">
        <CardBody className="p-4 space-y-3">
          {/* Row 1: Service Provider (dropdown) */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap min-w-[120px]">
              🎯 Service Provider
            </span>
            <Select
              aria-label="Service Provider"
              placeholder="Pilih service provider (sumber endpoint)"
              selectedKeys={selectedProvider ? [selectedProvider] : []}
              onSelectionChange={(keys) => setSelectedProvider(Array.from(keys)[0] as string || "")}
              variant="bordered"
              isLoading={loadingApps}
              startContent={<FiServer className="w-4 h-4 text-indigo-500 flex-shrink-0" />}
              classNames={{
                base: "w-full",
                trigger: "h-11 !bg-indigo-50 dark:!bg-indigo-900/20 border-indigo-200 hover:border-indigo-400 transition-colors shadow-sm",
                value: "text-sm font-medium text-gray-700 dark:text-gray-300",
                popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
              }}
            >
              {providerApps.map((a) => (
                <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>
              ))}
            </Select>
          </div>

          {/* Row 2: Client App + PJ + Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                aria-label="Aplikasi Client"
                placeholder="Pilih Aplikasi Client"
                selectedKeys={selectedApp ? [selectedApp] : []}
                onSelectionChange={(keys) => setSelectedApp(Array.from(keys)[0] as string || "")}
                variant="bordered"
                isLoading={loadingApps}
                startContent={<FiBox className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                classNames={{
                  base: "w-full",
                  trigger: "h-11 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 transition-colors shadow-sm",
                  value: "text-sm font-medium text-gray-700 dark:text-gray-300",
                  popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[280px]",
                }}
              >
                {apps.map((a) => (
                  <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>
                ))}
              </Select>

              <Select
                aria-label="Pilih PJ Aplikasi"
                placeholder={loadingPj ? "Memuat PJ..." : (selectedApp ? "Pilih PJ Aplikasi" : "Pilih aplikasi client dulu")}
                selectedKeys={selectedPj ? [selectedPj] : []}
                onSelectionChange={(keys) => setSelectedPj(Array.from(keys)[0] as string || "")}
                variant="bordered"
                isDisabled={!selectedApp || loadingPj}
                isLoading={loadingPj}
                startContent={<FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                classNames={{
                  base: "w-full",
                  trigger: "h-11 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 transition-colors shadow-sm",
                  value: "text-sm font-medium text-gray-700 dark:text-gray-300",
                  popoverContent: "!bg-white dark:!bg-gray-800 rounded-lg shadow-xl border border-gray-200 min-w-[300px]",
                }}
              >
                {pjList.map((p) => (
                  <SelectItem key={p.id_pengguna} textValue={`${p.nm_pengguna} (${p.username})`}>
                    <div>
                      <span className="text-sm font-medium">{p.nm_pengguna}</span>
                      <span className="text-xs text-gray-500 ml-2">@{p.username}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
              <Input
                aria-label="Search"
                placeholder="Cari endpoint..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                variant="bordered"
                startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
                classNames={{
                  base: "w-full",
                  inputWrapper: "h-11 !bg-white dark:!bg-gray-800 border-gray-200 hover:border-indigo-400 transition-colors shadow-sm",
                }}
                isClearable
                onClear={() => setSearchQuery("")}
                isDisabled={!selectedPj}
              />

              <div className="flex items-center gap-2">
                {selectedProvider && (
                  <Button
                    size="md"
                    startContent={<FiDownload className="w-4 h-4" />}
                    onPress={handleOpenGenerate}
                    className="h-11 font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg whitespace-nowrap"
                    title="Re-sync endpoint dari ws-api provider (manual trigger; ws-api startup sudah auto-sync)"
                  >
                    Generate
                  </Button>
                )}

                {selectedPjData && selectedAppData && checkedIds.size > 0 && (
                  <Button
                    size="md"
                    startContent={<FiPrinter className="w-4 h-4" />}
                    onPress={handlePrintPDF}
                    className="h-11 font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg whitespace-nowrap"
                  >
                    Cetak PDF
                  </Button>
                )}
              </div>
          </div>
        </CardBody>
      </Card>

      {/* No selection states */}
      {!selectedProvider && (
        <Card className="border-none shadow-lg rounded-xl">
          <CardBody className="p-12 text-center">
            <FiServer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Service Provider
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Pilih service provider (misal WS API MyUnila v2) terlebih dahulu — ini adalah sumber endpoint yang akan di-grant ke aplikasi client.
            </p>
          </CardBody>
        </Card>
      )}

      {selectedProvider && !selectedApp && (
        <Card className="border-none shadow-lg rounded-xl">
          <CardBody className="p-12 text-center">
            <FiBox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Aplikasi Client
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Pilih aplikasi client yang butuh akses ke endpoint provider di atas. PJ dari aplikasi client inilah yang akan di-beri otorisasi endpoint.
            </p>
          </CardBody>
        </Card>
      )}

      {selectedApp && !selectedPj && !loadingPj && (
        <Card className="border-none shadow-lg rounded-xl">
          <CardBody className="p-12 text-center">
            <FiUser className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih PJ Aplikasi
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {pjList.length === 0
                ? "Belum ada PJ Aplikasi terdaftar untuk aplikasi ini. Tambahkan PJ di menu Penanggung Jawab Aplikasi."
                : "Pilih Penanggung Jawab Aplikasi untuk mengatur endpoint WS API mana saja yang boleh diakses"}
            </p>
          </CardBody>
        </Card>
      )}

      {/* Loading PJ */}
      {loadingPj && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Loading Endpoints */}
      {loadingEndpoints && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Endpoint Groups */}
      {selectedApp && selectedPj && !loadingEndpoints && (
        <>
          {/* PJ Info + Summary Bar */}
          <Card className="border-none shadow-md rounded-xl">
            <CardBody className="p-4">
              <div className="flex flex-col gap-3">
                {/* PJ Info */}
                {selectedPjData && (
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <FiUser className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {selectedPjData.nm_pengguna}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        @{selectedPjData.username} · PJ <strong>{selectedAppData?.nm_aplikasi}</strong>
                        {selectedProviderData ? ` → akses service ${selectedProviderData.nm_aplikasi}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                {/* Stats + Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Chip size="sm" variant="flat" color="primary">
                      {totalGroups} grup
                    </Chip>
                    <Chip size="sm" variant="flat" color="success">
                      {totalChecked}/{totalEndpoints} endpoint dipilih
                    </Chip>
                    {hasChanges && (
                      <Chip size="sm" variant="flat" color="warning" className="animate-pulse">
                        Belum disimpan
                      </Chip>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="bordered" onPress={selectAll} className="font-medium rounded-lg border-gray-300 dark:border-gray-600" startContent={<FiCheck className="w-3.5 h-3.5" />}>
                      Pilih Semua
                    </Button>
                    <Button size="sm" variant="bordered" onPress={deselectAll} className="font-medium rounded-lg border-gray-300 dark:border-gray-600" startContent={<FiX className="w-3.5 h-3.5" />}>
                      Hapus Semua
                    </Button>
                    {hasChanges && (
                      <>
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={resetChanges}
                          className="font-medium rounded-lg border-gray-300 dark:border-gray-600"
                          startContent={<FiRefreshCw className="w-3.5 h-3.5" />}
                        >
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          onPress={handleSave}
                          isLoading={isSaving}
                          className="font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg"
                          startContent={<FiSave className="w-3.5 h-3.5" />}
                        >
                          Simpan
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Grouped Endpoints */}
          {Object.keys(groupedEndpoints).length === 0 ? (
            <Card className="border-none shadow-lg rounded-xl">
              <CardBody className="p-12 text-center">
                <FiServer className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">
                  {searchQuery
                    ? "Tidak ada endpoint yang cocok dengan pencarian"
                    : "Belum ada endpoint WS API terdaftar untuk aplikasi ini. Klik Generate untuk mengimpor daftar endpoint."}
                </p>
              </CardBody>
            </Card>
          ) : (
            <Accordion
              selectionMode="multiple"
              defaultExpandedKeys={Object.keys(groupedEndpoints)}
              variant="splitted"
              className="gap-3"
            >
              {Object.entries(groupedEndpoints).map(([group, eps]) => {
                const groupChecked = eps.filter((ep) => checkedIds.has(ep.id_ws_endpoint)).length;
                const allChecked = groupChecked === eps.length;
                const someChecked = groupChecked > 0 && !allChecked;

                return (
                  <AccordionItem
                    key={group}
                    aria-label={group}
                    classNames={{
                      base: "shadow-md rounded-xl border-none",
                      title: "text-base font-semibold",
                      trigger: "px-4 py-3",
                      content: "px-4 pb-4",
                    }}
                    startContent={
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleGroup(group, !allChecked); }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 ${
                          allChecked
                            ? "bg-primary border-primary text-white"
                            : someChecked
                              ? "bg-primary/30 border-primary text-white"
                              : "border-gray-300 dark:border-gray-600 hover:border-primary"
                        }`}
                      >
                        {(allChecked || someChecked) && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            {allChecked
                              ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            }
                          </svg>
                        )}
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2.5">
                        <span className="capitalize font-semibold text-gray-800 dark:text-gray-200">{group}</span>
                        <Chip
                          size="sm"
                          variant="flat"
                          color={allChecked ? "success" : someChecked ? "warning" : "default"}
                          className="font-mono text-xs"
                        >
                          {groupChecked}/{eps.length}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-1.5">
                      {eps.map((ep) => {
                        const isChecked = checkedIds.has(ep.id_ws_endpoint);
                        return (
                          <div
                            key={ep.id_ws_endpoint}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                              ${
                                isChecked
                                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm"
                                  : "bg-gray-50/80 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:border-gray-200 dark:hover:border-gray-600"
                              }`}
                            onClick={() => toggleEndpoint(ep.id_ws_endpoint)}
                          >
                            {/* Custom Checkbox */}
                            <div
                              className={`w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded border-2 flex items-center justify-center transition-all ${
                                isChecked
                                  ? "bg-blue-500 border-blue-500 text-white"
                                  : "border-gray-300 dark:border-gray-500"
                              }`}
                            >
                              {isChecked && (
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {/* Method Badge */}
                            <span
                              className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded min-w-[52px] text-center flex-shrink-0 ${
                                ep.nm_method === "GET"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                  : ep.nm_method === "POST"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                    : ep.nm_method === "PUT"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                      : ep.nm_method === "DELETE"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                              }`}
                            >
                              {ep.nm_method}
                            </span>
                            {/* Path + Name */}
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate block leading-tight">
                                {ep.path_url}
                              </span>
                              {ep.nm_endpoint && (
                                <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate block leading-tight mt-0.5">
                                  {ep.nm_endpoint}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {/* Floating Save Button */}
          {hasChanges && (
            <motion.div
              className="fixed bottom-6 right-6 z-50"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              <Button
                color="primary"
                size="lg"
                onPress={handleSave}
                isLoading={isSaving}
                className="shadow-2xl font-semibold px-6"
                startContent={<FiSave className="w-5 h-5" />}
              >
                Simpan Perubahan
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Generate Modal */}
      <Modal isOpen={isGenOpen} onClose={onGenClose} size="2xl" scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-slate-800 rounded-2xl shadow-2xl mx-2 sm:mx-4",
        }}>
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                <FiDownload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Generate Endpoints
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  Import routes dari ws-service ke database
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            {genLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" color="primary" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ditemukan <strong>{genRoutes.length}</strong> routes dari ws-service.
                  Endpoint yang sudah ada akan diperbarui, yang baru akan ditambahkan.
                </p>
                <div className="max-h-[400px] overflow-y-auto space-y-1 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                  {genRoutes.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-sm bg-gray-50 dark:bg-gray-800"
                    >
                      <Chip
                        size="sm"
                        variant="flat"
                        color={(METHOD_COLORS[r.method] || "default") as any}
                        className="font-mono font-semibold min-w-[60px] text-center"
                      >
                        {r.method}
                      </Chip>
                      <span className="font-mono text-gray-700 dark:text-gray-300 truncate">
                        {r.path}
                      </span>
                      <Chip size="sm" variant="flat" className="ml-auto shrink-0">
                        {r.nm_group}
                      </Chip>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
            <Button variant="flat" onPress={onGenClose} className="font-medium">
              Batal
            </Button>
            <Button
              onPress={handleConfirmGenerate}
              isLoading={isGenerating}
              isDisabled={genRoutes.length === 0}
              className="font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg"
            >
              Generate {genRoutes.length} Endpoints
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
