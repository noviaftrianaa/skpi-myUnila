"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Divider,
  Avatar,
  Tabs,
  Tab,
  Switch,
} from "@heroui/react";
import {
  FiShield,
  FiUser,
  FiSmartphone,
  FiKey,
  FiArrowLeft,
  FiCheck,
  FiCopy,
  FiAlertCircle,
  FiBell,
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { authService } from "@/services/auth";
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();

  // MFA States
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [showMfaDisable, setShowMfaDisable] = useState(false);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaQrCodeSvg, setMfaQrCodeSvg] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSettingUpMfa, setIsSettingUpMfa] = useState(false);
  const [isEnablingMfa, setIsEnablingMfa] = useState(false);
  const [isDisablingMfa, setIsDisablingMfa] = useState(false);
  const [mfaError, setMfaError] = useState("");

  // Notification Settings (dummy - fitur belum ada)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState("security");

  // Load MFA status on mount
  useEffect(() => {
    loadMfaStatus();
  }, []);

  const loadMfaStatus = async () => {
    try {
      const response = await authService.getMfaStatus();
      if (response.success && response.data) {
        setMfaEnabled(response.data.enabled);
      }
    } catch (error) {
      console.error("Failed to load MFA status:", error);
    }
  };

  // Handle MFA Setup
  const handleMfaSetup = async () => {
    setIsSettingUpMfa(true);
    setMfaError("");
    try {
      const response = await authService.setupMfa();

      if (response.success && response.data) {
        setMfaSecret(response.data.secret);
        setMfaQrCodeSvg(response.data.qr_code_svg);
        setShowMfaSetup(true);
        toast.success("QR Code berhasil di-generate!", {
          duration: 3000,
          position: 'top-right',
        });
      } else {
        const errorMsg = response.message || "Gagal setup MFA";
        setMfaError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-right',
        });
      }
    } catch (error: any) {
      console.error("Failed to setup MFA:", error);
      const errorMsg = error.response?.data?.message || "Gagal setup MFA";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setIsSettingUpMfa(false);
    }
  };

  // Handle MFA Enable
  const handleEnableMfa = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      const errorMsg = "Masukkan kode verifikasi 6 digit";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    setIsEnablingMfa(true);
    setMfaError("");
    try {
      const response = await authService.enableMfa(verificationCode);

      if (response.success) {
        // Set backup codes if provided
        if (response.data?.backup_codes) {
          setBackupCodes(response.data.backup_codes);
        }
        setMfaEnabled(true);
        setShowBackupCodes(true);
        setShowMfaSetup(false);
        setVerificationCode("");

        toast.success("🎉 MFA berhasil diaktifkan! Simpan backup codes Anda.", {
          duration: 5000,
          position: 'top-right',
        });
      } else {
        const errorMsg = response.message || "Kode verifikasi salah";
        setMfaError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-right',
          icon: '🔐',
        });
      }
    } catch (error: any) {
      console.error("Failed to enable MFA:", error);
      const errorMsg = error.response?.data?.message || "Kode verifikasi salah";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        position: 'top-right',
        icon: '🔐',
      });
    } finally {
      setIsEnablingMfa(false);
    }
  };

  // Handle MFA Disable
  const handleDisableMfa = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      const errorMsg = "Masukkan kode verifikasi 6 digit";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }

    setIsDisablingMfa(true);
    setMfaError("");
    try {
      const response = await authService.disableMfa(verificationCode);

      if (response.success) {
        setMfaEnabled(false);
        setShowMfaDisable(false);
        setVerificationCode("");

        toast.success("MFA berhasil dinonaktifkan", {
          duration: 4000,
          position: 'top-right',
        });
      } else {
        const errorMsg = response.message || "Kode verifikasi salah";
        setMfaError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-right',
          icon: '🔐',
        });
      }
    } catch (error: any) {
      console.error("Failed to disable MFA:", error);
      const errorMsg = error.response?.data?.message || "Kode verifikasi salah";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        position: 'top-right',
        icon: '🔐',
      });
    } finally {
      setIsDisablingMfa(false);
    }
  };

  // Copy to Clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Berhasil disalin ke clipboard!", {
      duration: 2000,
      position: 'bottom-center',
      icon: '📋',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/portal">
                <Button
                  isIconOnly
                  variant="light"
                  className="hover:bg-gray-100"
                >
                  <FiArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
                <p className="text-xs text-gray-500">Kelola akun dan keamanan Anda</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          variant="underlined"
          classNames={{
            tabList: "gap-8 w-full relative rounded-none p-0 border-b border-divider bg-white px-6",
            cursor: "w-full bg-primary-500",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary-600 font-medium",
          }}
        >
          <Tab
            key="security"
            title={
              <div className="flex items-center gap-2">
                <FiShield className="w-4 h-4" />
                <span>Keamanan</span>
              </div>
            }
          >
            <div className="mt-6 space-y-6">
              {/* MFA Section */}
              <Card className="border-none shadow-md">
                <CardHeader className="flex gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                    <FiSmartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-base font-semibold">Autentikasi Dua Faktor (2FA)</p>
                    <p className="text-xs text-gray-500">
                      Tingkatkan keamanan akun dengan Google Authenticator
                    </p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={mfaEnabled ? "success" : "default"}
                  >
                    {mfaEnabled ? "Aktif" : "Nonaktif"}
                  </Chip>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <FiAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-blue-900 mb-1">Tentang 2FA</p>
                        <p>
                          Autentikasi dua faktor menambahkan lapisan keamanan ekstra untuk akun Anda.
                          Setiap kali login, Anda akan diminta memasukkan kode 6 digit dari aplikasi
                          Google Authenticator.
                        </p>
                      </div>
                    </div>

                    {!mfaEnabled ? (
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Aktifkan Autentikasi Dua Faktor
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Gunakan Google Authenticator untuk menghasilkan kode
                          </p>
                        </div>
                        <Button
                          color="primary"
                          startContent={<FiShield className="w-4 h-4" />}
                          onClick={handleMfaSetup}
                          isLoading={isSettingUpMfa}
                        >
                          Aktifkan 2FA
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <FiCheck className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-green-800 font-medium">
                            Autentikasi dua faktor telah aktif untuk akun Anda
                          </p>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="flat"
                            color="danger"
                            size="sm"
                            onClick={() => setShowMfaDisable(true)}
                          >
                            Nonaktifkan 2FA
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab
            key="profile"
            title={
              <div className="flex items-center gap-2">
                <FiUser className="w-4 h-4" />
                <span>Profil</span>
              </div>
            }
          >
            <div className="mt-6 space-y-6">
              {/* Profile Info */}
              <Card className="border-none shadow-md">
                <CardHeader className="flex gap-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                    <FiUser className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-base font-semibold">Informasi Profil</p>
                    <p className="text-xs text-gray-500">Data pribadi Anda</p>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar
                        src={user?.avatar}
                        name={user?.name}
                        size="lg"
                        className="w-20 h-20"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email || user?.username}</p>
                      </div>
                    </div>

                    <Divider />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-600">Username</label>
                        <p className="text-sm text-gray-900 mt-1">{user?.username}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Email</label>
                        <p className="text-sm text-gray-900 mt-1">{user?.email || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Role</label>
                        <p className="text-sm text-gray-900 mt-1">{user?.role || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Fakultas</label>
                        <p className="text-sm text-gray-900 mt-1">{user?.fakultas || "Universitas Lampung"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Prodi</label>
                        <p className="text-sm text-gray-900 mt-1">{user?.prodi || "-"}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600">Status</label>
                        <Chip size="sm" color="success" variant="flat" className="mt-1">
                          Aktif
                        </Chip>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>

          <Tab
            key="notifications"
            title={
              <div className="flex items-center gap-2">
                <FiBell className="w-4 h-4" />
                <span>Notifikasi</span>
              </div>
            }
          >
            <div className="mt-6 space-y-6">
              {/* Notification Settings */}
              <Card className="border-none shadow-md">
                <CardHeader className="flex gap-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-white">
                    <FiBell className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-base font-semibold">Preferensi Notifikasi</p>
                    <p className="text-xs text-gray-500">Atur bagaimana Anda menerima notifikasi</p>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Terima notifikasi melalui email
                        </p>
                      </div>
                      <Switch
                        isSelected={emailNotifications}
                        onValueChange={setEmailNotifications}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Terima notifikasi di browser
                        </p>
                      </div>
                      <Switch
                        isSelected={pushNotifications}
                        onValueChange={setPushNotifications}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* MFA Setup Modal */}
      <Modal
        isOpen={showMfaSetup}
        onOpenChange={setShowMfaSetup}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800",
          header: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
          body: "bg-white dark:bg-gray-800",
          footer: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
        }}
      >
        <ModalContent className="bg-white dark:bg-gray-800">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FiShield className="w-5 h-5 text-primary-600" />
                  <span>Setup Autentikasi Dua Faktor</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <h3 className="font-semibold text-gray-900">Download Google Authenticator</h3>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      Install aplikasi Google Authenticator di smartphone Anda dari Play Store atau App Store.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <h3 className="font-semibold text-gray-900">Scan QR Code</h3>
                    </div>
                    <div className="ml-8 space-y-3">
                      <p className="text-sm text-gray-600">
                        Buka aplikasi Google Authenticator dan scan QR code berikut:
                      </p>
                      <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                        {mfaQrCodeSvg ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: mfaQrCodeSvg }}
                            className="w-48 h-48"
                          />
                        ) : (
                          <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <FiSmartphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-xs text-gray-500">Loading QR Code...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Atau masukkan kode manual:
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded text-sm font-mono">
                            {mfaSecret}
                          </code>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onClick={() => copyToClipboard(mfaSecret)}
                          >
                            <FiCopy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <h3 className="font-semibold text-gray-900">Masukkan Kode Verifikasi</h3>
                    </div>
                    <div className="ml-8">
                      <p className="text-sm text-gray-600 mb-3">
                        Masukkan kode 6 digit dari aplikasi Google Authenticator:
                      </p>
                      <Input
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        classNames={{
                          input: "text-center text-2xl tracking-widest font-mono",
                        }}
                        size="lg"
                        isInvalid={!!mfaError}
                        errorMessage={mfaError}
                      />
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleEnableMfa}
                  isDisabled={verificationCode.length !== 6}
                  isLoading={isEnablingMfa}
                >
                  Aktifkan 2FA
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Backup Codes Modal */}
      <Modal
        isOpen={showBackupCodes}
        onOpenChange={setShowBackupCodes}
        size="lg"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800",
          header: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
          body: "bg-white dark:bg-gray-800",
          footer: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
        }}
      >
        <ModalContent className="bg-white dark:bg-gray-800">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FiKey className="w-5 h-5 text-primary-600" />
                  <span>Backup Recovery Codes</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-2">⚠️ PENTING: Simpan kode ini dengan aman!</p>
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold">Apa itu Backup Recovery Codes?</p>
                          <p>
                            Ini adalah kode cadangan untuk login darurat jika Anda:
                          </p>
                          <ul className="list-disc ml-4 space-y-1">
                            <li>Kehilangan akses ke Google Authenticator</li>
                            <li>HP hilang/rusak dan tidak bisa buka app</li>
                            <li>Ganti HP baru dan lupa backup authenticator</li>
                          </ul>
                          <p className="font-semibold mt-2">Catatan:</p>
                          <ul className="list-disc ml-4 space-y-1">
                            <li>Setiap kode hanya dapat digunakan <span className="font-bold">SATU KALI</span></li>
                            <li>Simpan di tempat aman (password manager, notes terenkripsi, dll)</li>
                            <li>Jangan bagikan ke siapapun!</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {backupCodes.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        {backupCodes.map((code, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                          >
                            <code className="flex-1 text-sm font-mono text-gray-900">
                              {code}
                            </code>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => copyToClipboard(code)}
                            >
                              <FiCopy className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full"
                        variant="flat"
                        color="primary"
                        startContent={<FiCopy className="w-4 h-4" />}
                        onClick={() => copyToClipboard(backupCodes.join("\n"))}
                      >
                        Salin Semua Kode
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">Tidak ada backup codes tersedia</p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  Saya Sudah Menyimpan Kode Ini
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Disable MFA Modal */}
      <Modal
        isOpen={showMfaDisable}
        onOpenChange={setShowMfaDisable}
        size="md"
        backdrop="blur"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800",
          header: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
          body: "bg-white dark:bg-gray-800",
          footer: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700",
        }}
      >
        <ModalContent className="bg-white dark:bg-gray-800">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-danger-600" />
                  <span>Nonaktifkan 2FA</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      Menonaktifkan autentikasi dua faktor akan mengurangi keamanan akun Anda.
                      Pastikan Anda memahami risikonya.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Masukkan kode verifikasi dari Google Authenticator:
                    </p>
                    <Input
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      classNames={{
                        input: "text-center text-xl tracking-widest font-mono",
                      }}
                      size="lg"
                      isInvalid={!!mfaError}
                      errorMessage={mfaError}
                    />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="danger"
                  onPress={handleDisableMfa}
                  isDisabled={verificationCode.length !== 6}
                  isLoading={isDisablingMfa}
                >
                  Nonaktifkan 2FA
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
