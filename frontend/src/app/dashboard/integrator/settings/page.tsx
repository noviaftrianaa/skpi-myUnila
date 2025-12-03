"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@heroui/react";
import { FiSettings, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiRefreshCw, FiKey } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { myunilaIntegratorMenuConfig } from "../config/menuConfig";
import {
  apiConfigService,
  type APIConfig,
  type CreateAPIConfigRequest,
} from "@/lib/services/config/apiConfigService";

export default function APIConfigurationPage() {
  useRequireAuth();

  const [configs, setConfigs] = useState<APIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<APIConfig | null>(null);
  const [testing, setTesting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<Partial<CreateAPIConfigRequest>>({
    api_code: "",
    api_name: "",
    base_url: "",
    auth_type: "token",
    is_active: true,
    use_env_fallback: false,
    timeout_seconds: 30,
    max_retries: 3,
  });
  const [credentials, setCredentials] = useState<Record<string, string>>({
    username: "",
    password: "",
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await apiConfigService.getAll();
      // Filter only SIKEP/MyUnila-related configs (case-insensitive)
      const myunilaConfigs = data.filter(
        (config) =>
          config.api_code?.toUpperCase().includes("SIKEP") ||
          config.api_code?.toUpperCase().includes("MYUNILA") ||
          config.api_code?.toUpperCase().includes("SIAKADU") ||
          config.api_code?.toUpperCase().includes("SIRANDU") ||
          config.api_code?.toUpperCase().includes("MANAKSES") ||
          config.api_name?.toUpperCase().includes("SIKEP") ||
          config.api_name?.toUpperCase().includes("MYUNILA") ||
          config.tags?.toUpperCase().includes("SIKEP") ||
          config.tags?.toUpperCase().includes("MYUNILA")
      );
      setConfigs(myunilaConfigs);
    } catch (error: any) {
      toast.error(`Failed to load API configurations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (config: APIConfig) => {
    setTesting(true);
    try {
      const result = await apiConfigService.testConnection({
        api_code: config.api_code,
        base_url: config.base_url,
      });
      if (result.success) {
        toast.success(`Connection successful! ${result.message}`);
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
      await loadConfigs();
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      const request: CreateAPIConfigRequest = {
        ...formData as CreateAPIConfigRequest,
        credentials: Object.keys(credentials).some(k => credentials[k]) ? credentials : undefined,
      };

      if (selectedConfig) {
        await apiConfigService.update(selectedConfig.id, request);
        toast.success("Configuration updated successfully");
      } else {
        await apiConfigService.create(request);
        toast.success("Configuration created successfully");
      }

      onClose();
      loadConfigs();
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to save configuration: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      await apiConfigService.delete(id);
      toast.success("Configuration deleted successfully");
      loadConfigs();
    } catch (error: any) {
      toast.error(`Failed to delete configuration: ${error.message}`);
    }
  };

  const handleEdit = (config: APIConfig) => {
    setSelectedConfig(config);
    setFormData({
      api_code: config.api_code,
      api_name: config.api_name,
      api_description: config.api_description,
      base_url: config.base_url,
      auth_type: config.auth_type,
      additional_headers: config.additional_headers,
      timeout_seconds: config.timeout_seconds,
      max_retries: config.max_retries,
      retry_delay_ms: config.retry_delay_ms,
      is_active: config.is_active,
      use_env_fallback: config.use_env_fallback,
      tags: config.tags,
      notes: config.notes,
    });
    setCredentials({ username: "", password: "" });
    onOpen();
  };

  const resetForm = () => {
    setSelectedConfig(null);
    setFormData({
      api_code: "",
      api_name: "",
      base_url: "",
      auth_type: "token",
      is_active: true,
      use_env_fallback: false,
      timeout_seconds: 30,
      max_retries: 3,
    });
    setCredentials({ username: "", password: "" });
  };

  const columns: Column<APIConfig>[] = [
    {
      key: "api_code",
      label: "API Code",
      sortable: true,
      render: (item) => (
        <div className="font-semibold text-gray-900 dark:text-white">{item.api_code}</div>
      ),
    },
    {
      key: "api_name",
      label: "Name",
      sortable: true,
      render: (item) => (
        <div className="text-gray-700 dark:text-gray-300">{item.api_name}</div>
      ),
    },
    {
      key: "base_url",
      label: "Base URL",
      render: (item) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
          {item.base_url}
        </div>
      ),
    },
    {
      key: "credential_source",
      label: "Credentials",
      render: (item) => {
        const source = item.credential_source;
        return (
          <Chip
            size="sm"
            variant="flat"
            color={
              source === "database"
                ? "success"
                : source === "environment"
                ? "warning"
                : "default"
            }
            className="rounded-lg"
          >
            {source === "database"
              ? "Database"
              : source === "environment"
              ? "Environment"
              : "Not Set"}
          </Chip>
        );
      },
    },
    {
      key: "last_test_status",
      label: "Status",
      render: (item) => {
        const status = item.last_test_status;
        return status ? (
          <Chip
            size="sm"
            variant="flat"
            color={status === "success" ? "success" : "danger"}
            startContent={status === "success" ? <FiCheck /> : <FiX />}
            className="rounded-lg"
          >
            {status}
          </Chip>
        ) : (
          <Chip size="sm" variant="flat" color="default" className="rounded-lg">
            Not Tested
          </Chip>
        );
      },
    },
    {
      key: "is_active",
      label: "Active",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          color={item.is_active ? "success" : "default"}
          className="rounded-lg"
        >
          {item.is_active ? "Yes" : "No"}
        </Chip>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={() => handleTest(item)}
            isLoading={testing}
            className="rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100"
          >
            <FiRefreshCw className="text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={() => handleEdit(item)}
            className="rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100"
          >
            <FiEdit2 className="text-amber-600" />
          </Button>
          <Button
            size="sm"
            variant="flat"
            isIconOnly
            onPress={() => handleDelete(item.id)}
            className="rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100"
          >
            <FiTrash2 className="text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={myunilaIntegratorMenuConfig}
      pageTitle="API Configuration"
    >
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiSettings className="text-emerald-600" />
              API Configuration Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola konfigurasi API untuk sistem internal UNILA (SIKEP, Siakadu, Sirandu, ManAkses)
            </p>
          </div>
          <Button
            color="primary"
            size="lg"
            startContent={<FiPlus className="w-5 h-5" />}
            onPress={() => {
              resetForm();
              onOpen();
            }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Add Configuration
          </Button>
        </div>

        {/* Main Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardBody className="p-0">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daftar Konfigurasi API
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Konfigurasi endpoint dan credentials untuk integrasi sistem
              </p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <Spinner size="lg" color="primary" />
                  <p className="text-gray-600 dark:text-gray-400 mt-4">Loading configurations...</p>
                </div>
              ) : configs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <FiSettings className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Belum ada konfigurasi API.
                    <br />
                    <span className="text-sm">Klik tombol "Add Configuration" untuk menambahkan.</span>
                  </p>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={configs}
                  searchable
                  searchKeys={["api_code", "api_name", "base_url"]}
                  searchPlaceholder="Search configurations..."
                />
              )}
            </div>
          </CardBody>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="2xl"
          scrollBehavior="inside"
          backdrop="blur"
          classNames={{
            backdrop: "bg-black/50 backdrop-blur-sm",
            base: "bg-white dark:bg-gray-800 rounded-2xl",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                      <FiSettings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedConfig ? "Edit Configuration" : "Add New Configuration"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {selectedConfig ? "Update API configuration details" : "Configure new API connection for internal systems"}
                      </p>
                    </div>
                  </div>
                </ModalHeader>
                <ModalBody className="py-6 px-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="SIKEP, SIAKADU, SIRANDU, MANAKSES"
                        value={formData.api_code}
                        onValueChange={(value) =>
                          setFormData({ ...formData, api_code: value })
                        }
                        isDisabled={!!selectedConfig}
                        isRequired
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-emerald-400 rounded-xl"
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g., SIKEP API - Sistem Kepegawaian UNILA"
                        value={formData.api_name}
                        onValueChange={(value) =>
                          setFormData({ ...formData, api_name: value })
                        }
                        isRequired
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-emerald-400 rounded-xl"
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base URL <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="https://sikep.unila.ac.id/api/v1"
                        value={formData.base_url}
                        onValueChange={(value) =>
                          setFormData({ ...formData, base_url: value })
                        }
                        isRequired
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-emerald-400 rounded-xl"
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <Input
                        placeholder="Deskripsi singkat API"
                        value={formData.api_description || ""}
                        onValueChange={(value) =>
                          setFormData({ ...formData, api_description: value })
                        }
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-emerald-400 rounded-xl"
                        }}
                      />
                    </div>

                    {/* Credentials Section - Collapsible */}
                    <details className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <FiKey className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">API Credentials (Opsional)</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Klik untuk input credentials - akan dienkripsi otomatis</p>
                          </div>
                        </div>
                      </summary>

                      <div className="p-4 space-y-4 bg-white dark:bg-gray-800">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Username
                          </label>
                          <Input
                            type="text"
                            placeholder="Username API sistem internal"
                            value={credentials.username || ""}
                            onValueChange={(value) =>
                              setCredentials({ ...credentials, username: value })
                            }
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "bg-white dark:bg-gray-800",
                              inputWrapper: "border-gray-300 dark:border-gray-600 rounded-xl"
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                          </label>
                          <Input
                            type="password"
                            placeholder="Password API sistem internal"
                            value={credentials.password || ""}
                            onValueChange={(value) =>
                              setCredentials({ ...credentials, password: value })
                            }
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "bg-white dark:bg-gray-800",
                              inputWrapper: "border-gray-300 dark:border-gray-600 rounded-xl"
                            }}
                          />
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                          <FiCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            Kosongkan jika ingin menggunakan credentials dari environment variable (.env file)
                          </p>
                        </div>
                      </div>
                    </details>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Use Environment Fallback</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gunakan credentials dari .env jika tidak ada di database</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.use_env_fallback}
                          onChange={(e) =>
                            setFormData({ ...formData, use_env_fallback: e.target.checked })
                          }
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Active Status</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Aktifkan atau nonaktifkan API configuration ini</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.is_active}
                          onChange={(e) =>
                            setFormData({ ...formData, is_active: e.target.checked })
                          }
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                      </label>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="flat"
                    onPress={onClose}
                    className="font-semibold rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSave}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl"
                    startContent={selectedConfig ? <FiEdit2 /> : <FiPlus />}
                  >
                    {selectedConfig ? "Update Configuration" : "Create Configuration"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
