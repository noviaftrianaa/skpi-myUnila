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
  ModalHeader, ModalBody, ModalFooter, useDisclosure, Autocomplete, AutocompleteItem,
} from "@heroui/react";
import {
  FiSave, FiRefreshCw, FiSearch, FiShield, FiCheck, FiX, FiServer,
  FiChevronDown, FiDownload, FiPrinter, FiUser,
} from "react-icons/fi";
import { authClient } from "@/lib/api/authClient";
import { wsAuthorizationService, type SystemRoute } from "@/lib/services/manakses/wsAuthorizationService";
import toast from "react-hot-toast";

interface Peran {
  id_peran: number;
  nm_peran: string;
}

interface AppOption {
  id_aplikasi: string;
  nm_aplikasi: string;
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
  const [roles, setRoles] = useState<Peran[]>([]);
  // WS Authorization is specifically for ws-service (api-service) only
  const WS_APP_ID = "E3C5A6DF-3543-4C84-8E8E-221B59A53D72";
  const WS_APP_NAME = "WS Service (API)";
  const [apps, setApps] = useState<AppOption[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointItem[]>([]);
  const [authorizedIds, setAuthorizedIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<string>(WS_APP_ID);
  const [searchQuery, setSearchQuery] = useState("");

  // Pengguna search state (for print report)
  const [penggunaSearch, setPenggunaSearch] = useState("");
  const [penggunaList, setPenggunaList] = useState<Array<{id_pengguna: string; username: string; nm_pengguna: string}>>([]);
  const [selectedPengguna, setSelectedPengguna] = useState<{id_pengguna: string; username: string; nm_pengguna: string} | null>(null);
  const [penggunaRoles, setPenggunaRoles] = useState<Array<{id_peran: number; nm_peran: string; authorized_endpoints: EndpointItem[]}>>([]);
  const [loadingPengguna, setLoadingPengguna] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  // UI state
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingEndpoints, setLoadingEndpoints] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate modal
  const { isOpen: isGenOpen, onOpen: onGenOpen, onClose: onGenClose } = useDisclosure();
  const [genRoutes, setGenRoutes] = useState<SystemRoute[]>([]);
  const [genLoading, setGenLoading] = useState(false);

  // Load roles + apps
  useEffect(() => {
    const load = async () => {
      try {
        const rolesRes = await authClient.get("/manakses/peran?limit=100");
        setRoles(
          toArray(rolesRes.data.data).map((r: any) => ({
            id_peran: r.id_peran,
            nm_peran: r.nm_peran,
          }))
        );
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat data");
      } finally {
        setLoadingRoles(false);
      }
    };
    load();
  }, []);

  // Load endpoints + authorization when role+app selected
  useEffect(() => {
    if (!selectedRole || !selectedApp) {
      setEndpoints([]);
      setAuthorizedIds(new Set());
      setCheckedIds(new Set());
      return;
    }

    const load = async () => {
      setLoadingEndpoints(true);
      try {
        // Get all endpoints for this app
        const epsRes = await authClient.get(`/manakses/endpoint?limit=500&id_aplikasi=${selectedApp}`);
        const epList: EndpointItem[] = toArray(epsRes.data.data).map((e: any) => ({
          id_ws_endpoint: e.id_ws_endpoint,
          nm_group: e.nm_group || "uncategorized",
          nm_method: e.nm_method || "GET",
          nm_endpoint: e.nm_endpoint,
          path_url: e.path_url,
          a_active: e.a_active,
        }));
        setEndpoints(epList);

        // Get authorized endpoint IDs for this role
        const authRes = await wsAuthorizationService.getByRole(
          parseInt(selectedRole),
          selectedApp
        );
        const authSet = new Set(authRes.endpoint_ids || []);
        setAuthorizedIds(authSet);
        setCheckedIds(new Set(authSet)); // clone for editing
      } catch (e) {
        console.error(e);
        toastError("Gagal memuat endpoints");
      } finally {
        setLoadingEndpoints(false);
      }
    };
    load();
  }, [selectedRole, selectedApp]);

  // Search pengguna for report
  useEffect(() => {
    if (penggunaSearch.length < 2) { setPenggunaList([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await authClient.get(`/manakses/pengguna?search=${penggunaSearch}&limit=20`);
        const list = toArray(res.data.data).map((p: any) => ({
          id_pengguna: p.id_pengguna, username: p.username, nm_pengguna: p.nm_pengguna || p.nama || p.nm_pd || "",
        }));
        setPenggunaList(list);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [penggunaSearch]);

  // Load pengguna report (all roles + their authorized endpoints)
  const loadPenggunaReport = async (pengguna: {id_pengguna: string; username: string; nm_pengguna: string}) => {
    setSelectedPengguna(pengguna);
    setLoadingReport(true);
    try {
      // Get user's roles
      const rolesRes = await authClient.get(`/manakses/role-pengguna/by-pengguna/${pengguna.id_pengguna}`);
      const userRoles = toArray(rolesRes.data.data);
      
      // For each role, get authorized endpoints
      const roleEndpoints = await Promise.all(
        userRoles.map(async (rp: any) => {
          try {
            const authRes = await wsAuthorizationService.getByRole(rp.id_peran, WS_APP_ID);
            // Get endpoint details
            const epIds = authRes.endpoint_ids || [];
            if (epIds.length === 0) return { id_peran: rp.id_peran, nm_peran: rp.nm_peran, authorized_endpoints: [] };
            
            const epsRes = await authClient.get(`/manakses/endpoint?limit=500&id_aplikasi=${WS_APP_ID}`);
            const allEps = toArray(epsRes.data.data);
            const authorized = allEps.filter((e: any) => epIds.includes(e.id_ws_endpoint));
            return { id_peran: rp.id_peran, nm_peran: rp.nm_peran, authorized_endpoints: authorized };
          } catch { return { id_peran: rp.id_peran, nm_peran: rp.nm_peran, authorized_endpoints: [] }; }
        })
      );
      setPenggunaRoles(roleEndpoints);
    } catch (e) {
      console.error(e);
      toastError("Gagal memuat data pengguna");
    } finally {
      setLoadingReport(false);
    }
  };

  // Print PDF report
  const handlePrintPDF = () => {
    if (!selectedPengguna || penggunaRoles.length === 0) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    
    const totalEndpoints = penggunaRoles.reduce((sum, r) => sum + r.authorized_endpoints.length, 0);
    const now = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Akses WS - ${selectedPengguna.username}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 30px; color: #1a1a1a; font-size: 12px; }
          .header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .header h1 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
          .header h2 { font-size: 13px; font-weight: 600; color: #444; margin-bottom: 8px; }
          .header p { font-size: 11px; color: #666; }
          .info { margin-bottom: 20px; }
          .info table { width: 100%; }
          .info td { padding: 3px 8px; vertical-align: top; }
          .info td:first-child { font-weight: 600; width: 140px; color: #444; }
          .role-section { margin-bottom: 18px; page-break-inside: avoid; }
          .role-title { font-size: 13px; font-weight: 700; padding: 6px 10px; background: #f0f0f0; border-left: 3px solid #4f46e5; margin-bottom: 6px; }
          table.endpoints { width: 100%; border-collapse: collapse; font-size: 11px; }
          table.endpoints th { background: #f8f8f8; padding: 5px 8px; text-align: left; border: 1px solid #ddd; font-weight: 600; }
          table.endpoints td { padding: 4px 8px; border: 1px solid #ddd; }
          table.endpoints tr:nth-child(even) { background: #fafafa; }
          .method { font-family: monospace; font-weight: 700; font-size: 10px; padding: 1px 6px; border-radius: 3px; }
          .method-GET { background: #dcfce7; color: #166534; }
          .method-POST { background: #dbeafe; color: #1e40af; }
          .method-PUT { background: #fef3c7; color: #92400e; }
          .method-DELETE { background: #fce4ec; color: #b71c1c; }
          .method-PATCH { background: #e8eaf6; color: #283593; }
          .footer { margin-top: 25px; text-align: center; font-size: 10px; color: #888; border-top: 1px solid #ddd; padding-top: 8px; }
          .no-data { text-align: center; color: #888; padding: 10px; font-style: italic; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>UNIVERSITAS LAMPUNG</h1>
          <h2>Laporan Otorisasi Endpoint WS API Service</h2>
          <p>Dicetak: ${now}</p>
        </div>
        <div class="info">
          <table>
            <tr><td>Nama</td><td>: ${selectedPengguna.nm_pengguna}</td></tr>
            <tr><td>Username</td><td>: ${selectedPengguna.username}</td></tr>
            <tr><td>Aplikasi</td><td>: ${WS_APP_NAME}</td></tr>
            <tr><td>Total Role</td><td>: ${penggunaRoles.length}</td></tr>
            <tr><td>Total Endpoint</td><td>: ${totalEndpoints}</td></tr>
          </table>
        </div>
        ${penggunaRoles.map(role => `
          <div class="role-section">
            <div class="role-title">${role.nm_peran} (${role.authorized_endpoints.length} endpoint)</div>
            ${role.authorized_endpoints.length > 0 ? `
              <table class="endpoints">
                <thead><tr><th style="width:70px">Method</th><th>Path URL</th><th style="width:100px">Group</th></tr></thead>
                <tbody>
                  ${role.authorized_endpoints.map((ep: any) => `
                    <tr>
                      <td><span class="method method-${ep.nm_method}">${ep.nm_method || '-'}</span></td>
                      <td style="font-family:monospace;font-size:11px">${ep.path_url}</td>
                      <td>${ep.nm_group || '-'}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : '<p class="no-data">Tidak ada endpoint yang diotorisasi untuk role ini</p>'}
          </div>
        `).join("")}
        <div class="footer">
          MyUnila — UPT TIK Universitas Lampung · Dokumen ini digenerate otomatis
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

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

    // Sort groups alphabetically
    const sorted: GroupedEndpoints = {};
    Object.keys(groups)
      .sort()
      .forEach((k) => {
        sorted[k] = groups[k].sort((a, b) => a.path_url.localeCompare(b.path_url));
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

  // Save (sync)
  const handleSave = async () => {
    if (!selectedRole || !selectedApp) return;
    setIsSaving(true);
    try {
      const result = await wsAuthorizationService.sync(
        parseInt(selectedRole),
        selectedApp,
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
    if (!selectedApp || genRoutes.length === 0) return;
    setIsGenerating(true);
    try {
      const formatted = genRoutes.map((r) => ({
        nm_group: r.nm_group,
        nm_method: r.method,
        path_url: r.path,
        nm_endpoint: r.path.split("/").pop()?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || r.path,
      }));
      const result = await wsAuthorizationService.generateEndpoints(selectedApp, formatted);
      toastSuccess(result.message);
      onGenClose();

      // Reload endpoints
      const epsRes = await authClient.get(`/manakses/endpoint?limit=500&id_aplikasi=${selectedApp}`);
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

  if (loadingRoles) {
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
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              aria-label="Pilih Role PJ Aplikasi"
              placeholder="Pilih Role PJ Aplikasi"
              selectedKeys={selectedRole ? [selectedRole] : []}
              onSelectionChange={(keys) => setSelectedRole(Array.from(keys)[0] as string || "")}
              variant="bordered"
              startContent={<FiShield className="w-4 h-4 text-gray-400" />}
              classNames={{ base: "w-full sm:w-[250px]", trigger: "h-11" }}
            >
              {roles.map((r) => (
                <SelectItem key={String(r.id_peran)}>{r.nm_peran}</SelectItem>
              ))}
            </Select>

            <Autocomplete
              aria-label="Cari Pengguna"
              placeholder="Cari PJ Aplikasi untuk cetak laporan..."
              variant="bordered"
              startContent={<FiUser className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              classNames={{ base: "w-full sm:w-[250px]" }}
              inputProps={{ classNames: { inputWrapper: "h-11 border-gray-200 dark:border-gray-600" } }}
              listboxProps={{ emptyContent: penggunaSearch.length < 2 ? "Ketik min 2 karakter..." : "Tidak ditemukan" }}
              onInputChange={(v) => setPenggunaSearch(v)}
              onSelectionChange={(key) => {
                const p = penggunaList.find(u => u.id_pengguna === key);
                if (p) loadPenggunaReport(p);
              }}
              isLoading={loadingPengguna}
            >
              {penggunaList.map((p) => (
                <AutocompleteItem key={p.id_pengguna} textValue={`${p.nm_pengguna} (${p.username})`}>
                  <div><span className="text-sm font-medium">{p.nm_pengguna}</span>
                    <span className="text-xs text-gray-500 ml-2">{p.username}</span></div>
                </AutocompleteItem>
              ))}
            </Autocomplete>

            {selectedPengguna && !loadingReport && penggunaRoles.length > 0 && (
              <Button size="md" startContent={<FiPrinter className="w-4 h-4" />} onPress={handlePrintPDF}
                className="h-11 font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg">
                Cetak PDF
              </Button>
            )}

            <Input
              aria-label="Search"
              placeholder="Cari endpoint..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              variant="bordered"
              startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
              classNames={{ base: "w-full sm:flex-1", inputWrapper: "h-11" }}
              isClearable
              onClear={() => setSearchQuery("")}
            />

            {selectedApp && (
              <Button
                size="md"
                startContent={<FiDownload className="w-4 h-4" />}
                onPress={handleOpenGenerate}
                className="h-11 font-medium bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md hover:shadow-lg transition-all rounded-lg"
              >
                Generate
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Pengguna Report Preview */}
      {loadingReport && (
        <Card className="border-none shadow-lg rounded-xl"><CardBody className="p-8 text-center">
          <Spinner size="lg" color="primary" /><p className="text-sm text-gray-500 mt-3">Memuat data akses pengguna...</p>
        </CardBody></Card>
      )}
      {selectedPengguna && !loadingReport && penggunaRoles.length > 0 && (
        <Card className="border-none shadow-lg rounded-xl">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg"><FiUser className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">{selectedPengguna.nm_pengguna}</h3>
                  <p className="text-xs text-gray-500">@{selectedPengguna.username} · {penggunaRoles.length} role · {penggunaRoles.reduce((s, r) => s + r.authorized_endpoints.length, 0)} endpoint</p>
                </div>
              </div>
              <Button size="sm" startContent={<FiPrinter className="w-3.5 h-3.5" />} onPress={handlePrintPDF}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md hover:shadow-lg transition-all rounded-lg">
                Cetak PDF
              </Button>
            </div>
            <div className="space-y-3">
              {penggunaRoles.map((role) => (
                <div key={role.id_peran} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{role.nm_peran}</span>
                    <Chip size="sm" variant="flat" color={role.authorized_endpoints.length > 0 ? "success" : "default"}>{role.authorized_endpoints.length} endpoint</Chip>
                  </div>
                  {role.authorized_endpoints.length > 0 && (
                    <div className="max-h-[200px] overflow-y-auto">
                      {role.authorized_endpoints.map((ep: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                          <Chip size="sm" variant="flat" color={(METHOD_COLORS[ep.nm_method] || "default") as any} className="font-mono font-semibold min-w-[50px] text-center text-[10px]">{ep.nm_method}</Chip>
                          <span className="font-mono text-gray-700 dark:text-gray-300 truncate">{ep.path_url}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* No selection state */}
      {(!selectedRole || !selectedApp) && (
        <Card className="border-none shadow-lg rounded-xl">
          <CardBody className="p-12 text-center">
            <FiServer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Role PJ Aplikasi
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Pilih role penanggung jawab aplikasi untuk mengatur endpoint WS API mana saja yang boleh diakses oleh aplikasi eksternal
            </p>
          </CardBody>
        </Card>
      )}

      {/* Loading */}
      {loadingEndpoints && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" color="primary" />
        </div>
      )}

      {/* Endpoint Groups */}
      {selectedRole && selectedApp && !loadingEndpoints && (
        <>
          {/* Summary Bar */}
          <Card className="border-none shadow-md rounded-xl">
            <CardBody className="p-4">
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
            </CardBody>
          </Card>

          {/* Grouped Endpoints */}
          {Object.keys(groupedEndpoints).length === 0 ? (
            <Card className="border-none shadow-lg rounded-xl">
              <CardBody className="p-12 text-center">
                <p className="text-gray-500">
                  {searchQuery
                    ? "Tidak ada endpoint yang cocok dengan pencarian"
                    : "Belum ada endpoint WS API terdaftar. Klik Generate untuk mengimpor daftar endpoint dari ws-service."}
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
                              className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded min-w-[52px] text-center ${
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
