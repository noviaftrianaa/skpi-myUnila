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
import { FiSettings, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { RiGraduationCapFill } from "react-icons/ri";
import toast, { Toaster } from "react-hot-toast";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import {
  feederConfigService,
  type APIConfig,
  type CreateAPIConfigRequest,
} from "@/lib/services/feederConfigService";

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
    auth_type: "token_based",
    is_active: true,
    use_env_fallback: true,
    timeout_seconds: 120,
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
      const data = await feederConfigService.getAll();
      // Filter only feeder-related configs (case-insensitive)
      const feederConfigs = data.filter(
        (config) =>
          config.api_code?.toUpperCase().includes("FEEDER") ||
          config.api_name?.toUpperCase().includes("FEEDER") ||
          config.tags?.toUpperCase().includes("FEEDER")
      );
      setConfigs(feederConfigs);
    } catch (error: any) {
      toast.error(`Failed to load API configurations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (config: APIConfig) => {
    setTesting(true);
    try {
      const result = await feederConfigService.testConnection({
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
        credentials: Object.keys(credentials).length > 0 ? credentials : undefined,
      };

      if (selectedConfig) {
        await feederConfigService.update(selectedConfig.id, request);
        toast.success("Configuration updated successfully");
      } else {
        await feederConfigService.create(request);
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
      await feederConfigService.delete(id);
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
    setCredentials({});
    onOpen();
  };

  const resetForm = () => {
    setSelectedConfig(null);
    setFormData({
      api_code: "",
      api_name: "",
      base_url: "",
      auth_type: "token_based",
      is_active: true,
      use_env_fallback: true,
      timeout_seconds: 120,
      max_retries: 3,
    });
    setCredentials({
      username: "",
      password: "",
    });
  };

  const columns: Column<APIConfig>[] = [
    {
      key: "api_code",
      label: "API Code",
      sortable: true,
      render: (item) => <div className="font-semibold">{item.api_code}</div>,
    },
    {
      key: "api_name",
      label: "Name",
      sortable: true,
    },
    {
      key: "base_url",
      label: "Base URL",
      render: (item) => (
        <div className="text-sm text-gray-600 truncate max-w-xs">
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
          >
            {status}
          </Chip>
        ) : (
          <Chip size="sm" variant="flat" color="default">
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
            variant="light"
            isIconOnly
            onPress={() => handleTest(item)}
            isLoading={testing}
          >
            <FiRefreshCw />
          </Button>
          <Button
            size="sm"
            variant="light"
            isIconOnly
            onPress={() => handleEdit(item)}
          >
            <FiEdit2 />
          </Button>
          <Button
            size="sm"
            variant="light"
            color="danger"
            isIconOnly
            onPress={() => handleDelete(item.id)}
          >
            <FiTrash2 />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="API Configuration"
    >
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiSettings className="text-blue-600" />
              API Configuration Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola konfigurasi Neo Feeder PDDIKTI API dengan credentials terenkripsi
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
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
          >
            Add Configuration
          </Button>
        </div>

        {/* Main Table */}
        <Card className="border-none shadow-lg">
          <CardBody className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Spinner size="lg" color="primary" />
                <p className="text-gray-600 mt-4">Loading configurations...</p>
              </div>
            ) : configs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <FiSettings className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No API Configuration Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Belum ada konfigurasi API Feeder. Klik tombol "Add Configuration" untuk menambahkan konfigurasi Neo Feeder PDDIKTI API.
                </p>
                <Button
                  color="primary"
                  size="lg"
                  startContent={<FiPlus className="w-5 h-5" />}
                  onPress={() => {
                    resetForm();
                    onOpen();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg"
                >
                  Add First Configuration
                </Button>
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
          </CardBody>
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="3xl"
          scrollBehavior="inside"
          backdrop="opaque"
          classNames={{
            backdrop: "bg-black/50 backdrop-opacity-40",
            base: "bg-white dark:bg-gray-800",
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white shadow-lg">
                      <FiSettings className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedConfig ? "Edit Configuration" : "Add New Configuration"}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {selectedConfig ? "Update API configuration details" : "Configure Neo Feeder PDDIKTI API connection"}
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
                        placeholder="feeder_api"
                        value={formData.api_code}
                        onValueChange={(value) =>
                          setFormData({ ...formData, api_code: value })
                        }
                        isDisabled={!!selectedConfig}
                        isRequired
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        API Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g., Neo Feeder PDDIKTI API"
                        value={formData.api_name}
                        onValueChange={(value) =>
                          setFormData({ ...formData, api_name: value })
                        }
                        isRequired
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base URL <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="https://dapelmikpdpt.unila.ac.id/New/ws/Api.php"
                        value={formData.base_url}
                        onValueChange={(value) =>
                          setFormData({ ...formData, base_url: value })
                        }
                        isRequired
                        variant="bordered"
                        classNames={{
                          input: "bg-white dark:bg-gray-800",
                          inputWrapper: "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                        }}
                      />
                    </div>

                    {/* Credentials Section - Collapsible */}
                    <details className="border rounded-lg overflow-hidden">
                      <summary className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <FiSettings className="w-4 h-4 text-white" />
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
                            placeholder="e.g., one_data"
                            value={credentials.username || ""}
                            onValueChange={(value) =>
                              setCredentials({ ...credentials, username: value })
                            }
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "bg-white dark:bg-gray-800",
                              inputWrapper: "border-gray-300 dark:border-gray-600"
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                          </label>
                          <Input
                            type="password"
                            placeholder="API Password"
                            value={credentials.password || ""}
                            onValueChange={(value) =>
                              setCredentials({ ...credentials, password: value })
                            }
                            variant="bordered"
                            size="sm"
                            classNames={{
                              input: "bg-white dark:bg-gray-800",
                              inputWrapper: "border-gray-300 dark:border-gray-600"
                            }}
                          />
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <FiCheck className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-yellow-800 dark:text-yellow-200">
                            Kosongkan jika ingin pakai .env file. Credentials akan dienkripsi dengan AES-256 sebelum disimpan.
                          </p>
                        </div>
                      </div>
                    </details>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t">
                  <Button
                    variant="flat"
                    onPress={onClose}
                    className="font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSave}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold"
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
