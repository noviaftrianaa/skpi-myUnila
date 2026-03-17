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
  FiSave, FiRefreshCw, FiSearch, FiShield, FiCheck, FiX,
  FiChevronDown, FiDownload, FiFilter,
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
  const [apps, setApps] = useState<AppOption[]>([]);
  const [endpoints, setEndpoints] = useState<EndpointItem[]>([]);
  const [authorizedIds, setAuthorizedIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedApp, setSelectedApp] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

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
        const [rolesRes, appsRes] = await Promise.all([
          authClient.get("/manakses/peran?limit=100"),
          authClient.get("/manakses/aplikasi?limit=200"),
        ]);
        setRoles(
          toArray(rolesRes.data.data).map((r: any) => ({
            id_peran: r.id_peran,
            nm_peran: r.nm_peran,
          }))
        );
        setApps(
          toArray(appsRes.data.data).map((a: any) => ({
            id_aplikasi: a.id_aplikasi,
            nm_aplikasi: a.nm_aplikasi,
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
              aria-label="Pilih Role"
              placeholder="Pilih Role"
              selectedKeys={selectedRole ? [selectedRole] : []}
              onSelectionChange={(keys) => setSelectedRole(Array.from(keys)[0] as string || "")}
              variant="bordered"
              startContent={<FiShield className="w-4 h-4 text-gray-400" />}
              classNames={{ base: "w-full sm:w-[220px]", trigger: "h-11" }}
            >
              {roles.map((r) => (
                <SelectItem key={String(r.id_peran)}>{r.nm_peran}</SelectItem>
              ))}
            </Select>

            <Select
              aria-label="Pilih Aplikasi"
              placeholder="Pilih Aplikasi"
              selectedKeys={selectedApp ? [selectedApp] : []}
              onSelectionChange={(keys) => setSelectedApp(Array.from(keys)[0] as string || "")}
              variant="bordered"
              startContent={<FiFilter className="w-4 h-4 text-gray-400" />}
              classNames={{ base: "w-full sm:w-[250px]", trigger: "h-11" }}
            >
              {apps.map((a) => (
                <SelectItem key={a.id_aplikasi}>{a.nm_aplikasi}</SelectItem>
              ))}
            </Select>

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
                variant="flat"
                color="secondary"
                startContent={<FiDownload className="w-4 h-4" />}
                onPress={handleOpenGenerate}
                className="h-11 font-medium"
              >
                Generate
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* No selection state */}
      {(!selectedRole || !selectedApp) && (
        <Card className="border-none shadow-lg rounded-xl">
          <CardBody className="p-12 text-center">
            <FiShield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pilih Role & Aplikasi
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pilih role dan aplikasi untuk mengelola hak akses endpoint
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
                  <Button size="sm" variant="flat" onPress={selectAll} className="font-medium">
                    <FiCheck className="w-3.5 h-3.5" /> Pilih Semua
                  </Button>
                  <Button size="sm" variant="flat" onPress={deselectAll} className="font-medium">
                    <FiX className="w-3.5 h-3.5" /> Hapus Semua
                  </Button>
                  {hasChanges && (
                    <>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={resetChanges}
                        className="font-medium"
                      >
                        <FiRefreshCw className="w-3.5 h-3.5" /> Reset
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        onPress={handleSave}
                        isLoading={isSaving}
                        className="font-medium"
                      >
                        <FiSave className="w-3.5 h-3.5" /> Simpan
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
                    : "Belum ada endpoint terdaftar untuk aplikasi ini. Klik Generate untuk menambahkan."}
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
      <Modal isOpen={isGenOpen} onClose={onGenClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="border-b border-gray-200 dark:border-gray-700">
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
              color="primary"
              onPress={handleConfirmGenerate}
              isLoading={isGenerating}
              isDisabled={genRoutes.length === 0}
              className="font-medium"
            >
              Generate {genRoutes.length} Endpoints
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
}
