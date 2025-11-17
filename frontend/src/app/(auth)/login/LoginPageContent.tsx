"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import Link from "next/link";
import { Logo } from "@/shared/components";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/lib/services/authService";
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // MFA States
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaUserId, setMfaUserId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaLoading, setIsMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState("");

  // Redirect to portal if already authenticated
  useEffect(() => {
    if (isAuthenticated && !searchParams?.get('session_expired')) {
      router.replace('/portal');
    }
  }, [isAuthenticated, searchParams, router]);

  // Check for session expired
  useEffect(() => {
    if (searchParams?.get('session_expired') === 'true') {
      setLocalError('Sesi Anda telah berakhir. Silakan login kembali.');
    }
  }, [searchParams]);

  // Clear errors when inputs change
  useEffect(() => {
    if (localError || error) {
      setLocalError(null);
      clearError();
    }
  }, [username, password, clearError, error, localError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!username || !password) {
      const errorMsg = "Username dan password harus diisi";
      setLocalError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    try {
      const response = await authService.login({ username, password });

      // Check if MFA is required
      if (response.success && response.data.mfa_required) {
        setMfaUserId(response.data.user_id || "");
        setShowMfaModal(true);
        return;
      }

      // If no MFA required, login is complete
      await login({ username, password });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login gagal. Periksa username dan password Anda.";
      setLocalError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
        icon: '🔒',
      });
    }
  };

  const handleMfaSubmit = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      const errorMsg = "Masukkan kode verifikasi 6 digit";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setIsMfaLoading(true);
    setMfaError("");

    try {
      const response = await authService.loginWithMfa(mfaUserId, mfaCode);

      if (response.success) {
        toast.success("Login berhasil! Mengalihkan...", {
          duration: 2000,
          position: 'top-center',
          icon: '🎉',
        });

        // Set user and redirect
        setTimeout(() => {
          router.push('/portal');
          window.location.reload(); // Reload to update auth state
        }, 1000);
      } else {
        const errorMsg = response.message || "Kode verifikasi salah";
        setMfaError(errorMsg);
        toast.error(errorMsg, {
          duration: 4000,
          position: 'top-center',
          icon: '🔐',
        });
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error && 'response' in error
        ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || "Kode verifikasi salah")
        : "Kode verifikasi salah";
      setMfaError(errorMsg);
      toast.error(errorMsg, {
        duration: 4000,
        position: 'top-center',
        icon: '🔐',
      });
    } finally {
      setIsMfaLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  const displayError = localError || error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '12px 16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontWeight: '500',
            fontSize: '14px',
            maxWidth: '90vw',
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

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 -right-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 10}%`,
              top: `${20 + (i * 15) % 60}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-blue-400' : 'bg-indigo-400'} opacity-40`} />
          </motion.div>
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8"
      >
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div variants={itemVariants} className="hidden lg:flex lg:items-center">
            <div className="relative w-full">
              {/* Logo and Title */}
              <div className="mb-10">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-4"
                >
                  <Logo size="lg" className="mb-2" />
                  <p className="text-gray-600 font-medium text-sm xl:text-base">Portal Satu Data Universitas Lampung</p>
                </motion.div>

                <h2 className="text-2xl xl:text-3xl font-bold text-gray-800 mb-3 leading-tight">
                  <span className="bg-gradient-to-r from-myunila to-blue-700 bg-clip-text text-transparent">
                    Selamat Datang di Sistem Terintegrasi Unila
                  </span>
                </h2>
                <p className="text-gray-600 text-sm xl:text-base leading-relaxed">
                  Akses seluruh layanan kampus dalam satu platform terpadu. Login dengan akun SSO Unila Anda untuk melanjutkan.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[
                  {
                    icon: "🔐",
                    title: "SSO & Autentikasi Berlapis",
                    desc: "Satu akun terpusat untuk semua layanan Unila dengan keamanan berlapis Google Authenticator",
                    active: true
                  },
                  {
                    icon: "⚡",
                    title: "Platform Terintegrasi",
                    desc: "Akses cepat ke 20+ aplikasi kampus dengan sinkronisasi data real-time",
                    active: false
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    className={`flex items-start gap-3 xl:gap-4 p-3 xl:p-4 bg-white/60 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:shadow-lg hover:border-myunila/30 ${
                      feature.active ? 'border-myunila/20 shadow-md' : 'border-gray-100/50'
                    }`}
                  >
                    <div className="text-2xl xl:text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1 text-sm xl:text-base">{feature.title}</h3>
                      <p className="text-xs xl:text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100/50 p-5 sm:p-6 md:p-8 lg:p-10 xl:p-12">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-6 sm:mb-8 text-center">
                <div className="mb-3 sm:mb-4">
                  <Logo size="sm" />
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Portal Satu Data</p>
                </div>
              </div>

              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1.5 sm:mb-2">Login ke Akun Anda</h2>
                <p className="text-gray-600 text-sm sm:text-base">Gunakan akun SSO Unila untuk masuk</p>
              </div>

              {/* Error Alert */}
              {displayError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3 shadow-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-red-800">Login Gagal</h4>
                    <p className="text-xs sm:text-sm text-red-700">{displayError}</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 md:space-y-6">
                {/* Username Input */}
                <div>
                  <label htmlFor="username" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Masukkan username Anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    size="lg"
                    radius="lg"
                    classNames={{
                      input: "text-gray-800 text-sm sm:text-base",
                      inputWrapper: "bg-gray-50 border border-gray-200 hover:border-myunila focus-within:border-myunila transition-all duration-300 shadow-sm hover:shadow-md !outline-none min-h-[44px] sm:min-h-[48px]",
                      base: "!outline-none",
                    }}
                    startContent={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    size="lg"
                    radius="lg"
                    classNames={{
                      input: "text-gray-800 text-sm sm:text-base",
                      inputWrapper: "bg-gray-50 border border-gray-200 hover:border-myunila focus-within:border-myunila transition-all duration-300 shadow-sm hover:shadow-md !outline-none min-h-[44px] sm:min-h-[48px]",
                      base: "!outline-none",
                    }}
                    startContent={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-1 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    }
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="focus:outline-none p-1"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        )}
                      </button>
                    }
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-end">
                  <a
                    href="https://helpdesktik.unila.ac.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm text-myunila hover:text-blue-700 font-semibold transition-colors"
                  >
                    Lupa Password?
                  </a>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  size="lg"
                  radius="full"
                  className="w-full bg-gradient-to-r from-myunila to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all min-h-[44px] sm:min-h-[48px] text-sm sm:text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">Memproses...</span>
                    </div>
                  ) : (
                    "Login dengan SSO Unila"
                  )}
                </Button>
              </form>

              {/* Help */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm">
                  <button
                    type="button"
                    onClick={() => window.open('/panduan-login.pdf', '_blank')}
                    className="text-gray-600 hover:text-myunila transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Panduan Login
                  </button>
                  <Link href="/" className="text-gray-600 hover:text-myunila transition-colors flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    Kembali ke Beranda
                  </Link>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6">
              © 2025 Universitas Lampung. All rights reserved.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* MFA Verification Modal */}
      <Modal
        isOpen={showMfaModal}
        onOpenChange={setShowMfaModal}
        size="md"
        backdrop="blur"
        isDismissable={false}
        hideCloseButton
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white dark:bg-gray-800 mx-4",
          header: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6",
          body: "bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 sm:py-6",
          footer: "bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-base sm:text-lg">Verifikasi Dua Faktor</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800">
                      Buka aplikasi Google Authenticator di smartphone Anda dan masukkan kode 6 digit yang ditampilkan.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                      Kode Verifikasi
                    </label>
                    <Input
                      placeholder="000000"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      size="lg"
                      classNames={{
                        input: "text-center text-xl sm:text-2xl tracking-widest font-mono",
                        inputWrapper: "min-h-[48px] sm:min-h-[56px]",
                      }}
                      isInvalid={!!mfaError}
                      errorMessage={mfaError}
                      autoFocus
                    />
                  </div>

                  {/* Help Link */}
                  <div className="flex items-center justify-center pt-1 sm:pt-2">
                    <a
                      href="https://helpdesktik.unila.ac.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      <span className="text-center">Tidak bisa akses MFA? Hubungi Helpdesk TIK</span>
                    </a>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button
                  variant="flat"
                  onPress={() => {
                    setShowMfaModal(false);
                    setMfaCode("");
                    setMfaError("");
                  }}
                  disabled={isMfaLoading}
                  className="text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                >
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={handleMfaSubmit}
                  isDisabled={mfaCode.length !== 6}
                  isLoading={isMfaLoading}
                  className="text-sm sm:text-base min-h-[40px] sm:min-h-[44px]"
                >
                  Verifikasi
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
