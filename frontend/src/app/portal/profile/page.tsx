"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Chip,
  Skeleton,
} from "@heroui/react";
import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiUser,
  FiBriefcase,
  FiShield,
  FiBook,
  FiUsers,
  FiHome,
} from "react-icons/fi";
import { HiIdentification } from "react-icons/hi";
import { FaUserGraduate, FaUserTie, FaGraduationCap } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContextContext";
import {
  profileService,
  ProfileResponse,
  DosenProfileData,
  MahasiswaProfileData,
  TendikProfileData,
  MahasiswaHomebase,
  DosenHomebase,
} from "@/lib/services/profile/profileService";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("informasi");
  const { user, isLoading: isAuthLoading } = useAuth();
  const { activeContext, isLoadingContext } = useUserContext();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfileError(
        error instanceof Error ? error.message : "Gagal memuat profil"
      );
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchProfile();
    }
  }, [isAuthLoading, user, fetchProfile]);

  const isLoading = isAuthLoading || isLoadingContext || isLoadingProfile;

  // Get profile data
  const profileData = profile?.profile_data;
  const isDosenProfile = profile?.profile_type === "dosen";
  const isMahasiswaProfile = profile?.profile_type === "mahasiswa";
  const isTendikProfile = profile?.profile_type === "tendik";

  // Helper to get dosen/mahasiswa/tendik specific data
  const dosenData = isDosenProfile ? (profileData as DosenProfileData) : null;
  const mahasiswaData = isMahasiswaProfile
    ? (profileData as MahasiswaProfileData)
    : null;
  const tendikData = isTendikProfile ? (profileData as TendikProfileData) : null;

  // Helper to get active homebase for mahasiswa
  const getActiveHomebase = (): MahasiswaHomebase | null => {
    if (!mahasiswaData?.homebases || mahasiswaData.homebases.length === 0) return null;
    // First try to find active homebase
    const active = mahasiswaData.homebases.find(h => h.is_active);
    // If no active, return first one (most recent by date)
    return active || mahasiswaData.homebases[0];
  };

  // Helper to get active homebase for dosen
  const getActiveDosenHomebase = (): DosenHomebase | null => {
    if (!dosenData?.homebases || dosenData.homebases.length === 0) return null;
    const active = dosenData.homebases.find(h => h.is_active);
    return active || dosenData.homebases[0];
  };

  const activeHomebase = getActiveHomebase();
  const activeDosenHomebase = getActiveDosenHomebase();

  // Get user display data with fallback to auth context
  const userData = {
    name: profile?.nama || user?.name || "-",
    email:
      profile?.email ||
      dosenData?.kontak?.email ||
      mahasiswaData?.kontak?.email ||
      user?.email ||
      "-",
    phone:
      profile?.no_hp ||
      dosenData?.kontak?.no_hp ||
      mahasiswaData?.kontak?.no_hp ||
      "-",
    teleponRumah: dosenData?.kontak?.telepon_rumah || mahasiswaData?.kontak?.telepon_rumah || "-",
    address: profile?.alamat
      ? profile.alamat
      : dosenData?.alamat
        ? profileService.formatAlamat(dosenData.alamat)
        : mahasiswaData?.alamat
          ? profileService.formatAlamat(mahasiswaData.alamat)
          : tendikData?.alamat || "-",
    birthDate: dosenData
      ? profileService.formatTanggalLahir(
          dosenData.tempat_lahir,
          dosenData.tanggal_lahir
        )
      : mahasiswaData
        ? profileService.formatTanggalLahir(
            mahasiswaData.tempat_lahir,
            mahasiswaData.tanggal_lahir
          )
        : tendikData
          ? profileService.formatTanggalLahir(
              tendikData.tempat_lahir,
              tendikData.tanggal_lahir
            )
          : profile?.tempat_lahir && profile?.tgl_lahir
            ? profileService.formatTanggalLahir(
                profile.tempat_lahir,
                profile.tgl_lahir
              )
            : "-",
    jenisKelamin:
      dosenData?.jenis_kelamin ||
      mahasiswaData?.jenis_kelamin ||
      tendikData?.jenis_kelamin ||
      profile?.jenis_kelamin ||
      "-",
    agama: dosenData?.agama || mahasiswaData?.agama || "-",
    kewarganegaraan:
      dosenData?.kewarganegaraan || "-",
    // Position chip di bawah nama: WAJIB primary role / identitas user
    // (Mahasiswa / Dosen / Tenaga Kependidikan), BUKAN active_role yang
    // di-switch di navbar atas. Active role ditampilkan terpisah di
    // section "Peran Anda" dengan badge "Aktif".
    position:
      isMahasiswaProfile ? "Mahasiswa" :
      isDosenProfile ? "Dosen" :
      isTendikProfile ? "Tenaga Kependidikan" :
      "-",
    department: activeDosenHomebase?.nama_unit || tendikData?.unit_kerja?.unit_1 || tendikData?.unit_kerja?.unit_2 || tendikData?.unit_kerja?.unit_3 || profile?.active_role?.nama_unit || activeContext?.nama_unit || "-",
    nik: dosenData?.nik || mahasiswaData?.nik || "-",
    // Dosen specific
    nip: dosenData?.nip || tendikData?.nip || "-",
    nidn: dosenData?.nidn || tendikData?.nidn || "-",
    nuptk: dosenData?.nuptk || "-",
    jenisSDM: dosenData?.kepegawaian?.jenis_sdm || "-",
    statusAktif: dosenData?.kepegawaian?.status_aktif || tendikData?.status || "-",
    tmtPNS: dosenData?.kepegawaian?.tmt_pns || tendikData?.kepegawaian?.tmt_pns || "-",
    npwp: dosenData?.pajak?.npwp || "-",
    // Mahasiswa specific - use active homebase
    nisn: mahasiswaData?.nisn || "-",
    nim: activeHomebase?.nim || "-",
    prodi: activeHomebase?.program_studi || "-",
    kodeProdi: activeHomebase?.kode_prodi || "-",
    jenjang: activeHomebase?.jenjang || "-",
    statusMahasiswa: mahasiswaData?.status_mahasiswa || "-",
    tanggalMasuk: activeHomebase?.tanggal_masuk || "-",
    tanggalKeluar: activeHomebase?.tanggal_keluar || null,
    keteranganKeluar: activeHomebase?.keterangan_keluar || null,
    ipk: activeHomebase?.ipk || "-",
    sksDiakui: activeHomebase?.sks_diakui || "-",
    ptAsal: activeHomebase?.pt_asal?.nama_pt_asal || null,
    prodiAsal: activeHomebase?.pt_asal?.nama_prodi_asal || null,
    // Tendik specific
    jenisPegawai: tendikData?.jenis_pegawai || "-",
    jenisTenaga: tendikData?.jenis_tenaga || "-",
    statusTendik: tendikData?.status || "-",
  };

  const getInitials = (fullName: string) => {
    if (!fullName || fullName === "-") return "U";
    const nameParts = fullName.split(",")[0].trim().split(" ");
    if (nameParts.length >= 2) {
      return (
        nameParts[0][0] + nameParts[nameParts.length - 1][0]
      ).toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
  };

  const formatJenisKelamin = (jk: string | null) => {
    if (!jk) return "-";
    if (jk === "L" || jk === "l") return "Laki-laki";
    if (jk === "P" || jk === "p") return "Perempuan";
    return jk;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-6 rounded-lg" />
                <Skeleton className="h-6 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1">
              <Card className="bg-white shadow-md border border-gray-100">
                <CardBody className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Skeleton className="w-28 h-28 rounded-full" />
                    <Skeleton className="h-6 w-48 rounded-lg mt-5" />
                    <Skeleton className="h-5 w-24 rounded-full mt-2" />
                    <Skeleton className="h-4 w-32 rounded-lg mt-1" />

                    <Divider className="my-5" />

                    <div className="w-full space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-3 w-16 rounded-lg" />
                              <Skeleton className="h-4 w-full rounded-lg" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-2">
              <Card className="bg-white shadow-md border border-gray-100">
                <CardHeader className="px-6 pt-6 pb-4">
                  <div className="flex gap-6">
                    <Skeleton className="h-10 w-40 rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="p-6">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-100"
                      >
                        <Skeleton className="h-4 w-32 rounded-lg mb-2" />
                        <Skeleton className="h-5 w-full rounded-lg" />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link href="/portal">
                  <Button
                    isIconOnly
                    variant="light"
                    className="hover:bg-gray-100 rounded-lg"
                  >
                    <FiArrowLeft className="w-5 h-5 text-gray-600" />
                  </Button>
                </Link>
                <FiUser className="w-6 h-6 text-myunila" />
                <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card className="bg-white shadow-md border border-red-100">
            <CardBody className="p-8 text-center">
              <p className="text-red-600 mb-4">{profileError}</p>
              <Button color="primary" onPress={fetchProfile}>
                Coba Lagi
              </Button>
            </CardBody>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/portal">
                <Button
                  isIconOnly
                  variant="light"
                  className="hover:bg-gray-100 rounded-lg"
                >
                  <FiArrowLeft className="w-5 h-5 text-gray-600" />
                </Button>
              </Link>
              <FiUser className="w-6 h-6 text-myunila" />
              <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-white shadow-md border border-gray-100">
                <CardBody className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative">
                      <Avatar
                        className="w-28 h-28 text-3xl bg-gradient-to-br from-myunila to-blue-700 text-white shadow-lg ring-4 ring-blue-50"
                        name={getInitials(userData.name)}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-7 h-7 rounded-full border-4 border-white"></div>
                    </div>
                    <h2 className="mt-5 text-xl font-bold text-gray-800">
                      {userData.name}
                    </h2>
                    <Chip
                      size="sm"
                      className="mt-2 bg-myunila text-white"
                      startContent={<FiBriefcase className="w-3 h-3" />}
                    >
                      {userData.position}
                    </Chip>

                    <Divider className="my-5" />

                    {/* Homebase Info Section */}
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3">
                        {isTendikProfile ? (
                          <FiBriefcase className="w-4 h-4 text-myunila" />
                        ) : (
                          <FaGraduationCap className="w-4 h-4 text-myunila" />
                        )}
                        <span className="text-xs font-semibold text-myunila uppercase tracking-wide">
                          {isTendikProfile ? "Kepegawaian" : "Homebase"}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {/* NIM/NIP */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <HiIdentification className="w-4 h-4 text-myunila" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-xs text-gray-500 mb-1">
                                {isMahasiswaProfile ? "NIM" : "NIP/NIDN"}
                              </p>
                              <p className="text-sm text-gray-800 font-medium font-mono">
                                {isMahasiswaProfile ? userData.nim : (userData.nip !== "-" ? userData.nip : userData.nidn)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Program Studi / Unit Kerja */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <FiBook className="w-4 h-4 text-myunila" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-xs text-gray-500 mb-1">
                                {isMahasiswaProfile ? "Program Studi" : "Unit Kerja"}
                              </p>
                              <p className="text-sm text-gray-800 font-medium">
                                {isMahasiswaProfile ? userData.prodi : userData.department}
                              </p>
                              {isMahasiswaProfile && userData.jenjang !== "-" && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Jenjang: {userData.jenjang}
                                </p>
                              )}
                              {isTendikProfile && tendikData?.jenis_tenaga && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {tendikData.jenis_tenaga}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                              <FiShield className="w-4 h-4 text-myunila" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-xs text-gray-500 mb-1">Status</p>
                              <Chip
                                size="sm"
                                className={`font-semibold ${
                                  (isMahasiswaProfile ? userData.statusMahasiswa : isTendikProfile ? userData.statusTendik : userData.statusAktif)?.toLowerCase().includes('aktif')
                                    ? 'bg-green-100 text-green-700'
                                    : (isMahasiswaProfile ? userData.statusMahasiswa : isTendikProfile ? userData.statusTendik : userData.statusAktif)?.toLowerCase().includes('lulus')
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {isMahasiswaProfile ? userData.statusMahasiswa : isTendikProfile ? userData.statusTendik : userData.statusAktif}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Roles Section */}
                    {profile?.roles && profile.roles.length > 0 && (
                      <>
                        <Divider className="my-5" />
                        <div className="w-full">
                          <div className="flex items-center gap-2 mb-3">
                            <FiUsers className="w-4 h-4 text-myunila" />
                            <span className="text-xs font-semibold text-myunila uppercase tracking-wide">
                              Peran Anda
                            </span>
                          </div>
                          <div className="space-y-2">
                            {profile.roles.map((role) => {
                              // Cek apakah peran ini sedang aktif (sesuai context navbar atas)
                              const isActive =
                                activeContext?.id_role_pengguna === role.id_role_pengguna;
                              return (
                                <div
                                  key={role.id_role_pengguna}
                                  className={`p-2 rounded-lg text-left text-sm ${
                                    isActive
                                      ? "bg-blue-50 border-2 border-blue-400 ring-1 ring-blue-200"
                                      : role.approval_peran
                                      ? "bg-green-50 border border-green-200"
                                      : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-800">
                                        {role.nama_peran}
                                      </p>
                                      {role.nama_unit && (
                                        <p className="text-xs text-gray-500 truncate">
                                          {role.nama_unit}
                                        </p>
                                      )}
                                    </div>
                                    {isActive && (
                                      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600 text-white">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                        Aktif
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-white shadow-md border border-gray-100">
                <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-0">
                  <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    color="primary"
                    variant="underlined"
                    fullWidth
                    classNames={{
                      base: "w-full",
                      tabList: "gap-2 sm:gap-6 w-full relative flex",
                      cursor: "bg-myunila",
                      tabContent:
                        "group-data-[selected=true]:text-myunila font-medium sm:font-semibold text-xs sm:text-sm whitespace-nowrap",
                      tab: "px-2 sm:px-4 py-2 sm:py-3 data-[hover=true]:opacity-100",
                    }}
                  >
                    <Tab
                      key="informasi"
                      title={
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Informasi Pribadi</span>
                        </div>
                      }
                    />
                    {isMahasiswaProfile && (
                      <Tab
                        key="keluarga"
                        title={
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <FiHome className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Keluarga</span>
                          </div>
                        }
                      />
                    )}
                    <Tab
                      key="kepegawaian"
                      title={
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {isDosenProfile || isTendikProfile ? (
                            <FiBriefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          ) : (
                            <FiBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          )}
                          <span>
                            {isDosenProfile || isTendikProfile ? "Kepegawaian" : "Akademik"}
                          </span>
                        </div>
                      }
                    />
                  </Tabs>
                </CardHeader>
                <Divider className="mt-0" />
                <CardBody className="p-3 sm:p-6">
                  {activeTab === "informasi" && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Section: Identitas */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <HiIdentification className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Data Identitas
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Nama Lengkap</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.name}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NIK</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{userData.nik}</p>
                            </div>
                            {isMahasiswaProfile && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">NISN</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{userData.nisn}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Jenis Kelamin</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{formatJenisKelamin(userData.jenisKelamin)}</p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="text-[10px] sm:text-xs text-gray-500">Tempat, Tanggal Lahir</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.birthDate}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Agama</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.agama}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Kewarganegaraan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{isDosenProfile ? userData.kewarganegaraan : (mahasiswaData?.kewarganegaraan || '-')}</p>
                            </div>
                            {isDosenProfile && dosenData?.status_kawin && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Status Perkawinan</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.status_kawin}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section: Kontak */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <FiPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Kontak
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div className="sm:col-span-2 lg:col-span-1">
                              <label className="text-[10px] sm:text-xs text-gray-500">Email</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium break-all">{userData.email}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">No. HP</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.phone}</p>
                            </div>
                            {userData.teleponRumah && userData.teleponRumah !== "-" && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Telepon Rumah</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.teleponRumah}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section: Alamat */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <FiMapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Alamat
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.address}</p>
                          {(mahasiswaData?.alamat?.wilayah || dosenData?.alamat?.wilayah) && (
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                              Wilayah: {mahasiswaData?.alamat?.wilayah || dosenData?.alamat?.wilayah}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Section: Data Tambahan Mahasiswa */}
                      {isMahasiswaProfile && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiShield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            Informasi Tambahan
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Jenis Tinggal</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData?.jenis_tinggal || '-'}</p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Kebutuhan Khusus</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData?.kebutuhan_khusus || 'Tidak Ada'}</p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Beasiswa/Bantuan</label>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                  {mahasiswaData?.beasiswa?.terima_kps && (
                                    <Chip size="sm" className="bg-green-100 text-green-700 text-[10px] sm:text-xs">KPS</Chip>
                                  )}
                                  {mahasiswaData?.beasiswa?.bidikmisi && (
                                    <Chip size="sm" className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs">Bidikmisi</Chip>
                                  )}
                                  {mahasiswaData?.beasiswa?.pmpap && (
                                    <Chip size="sm" className="bg-purple-100 text-purple-700 text-[10px] sm:text-xs">PMP-AP</Chip>
                                  )}
                                  {!mahasiswaData?.beasiswa?.terima_kps && !mahasiswaData?.beasiswa?.bidikmisi && !mahasiswaData?.beasiswa?.pmpap && (
                                    <span className="text-xs sm:text-sm text-gray-900 font-medium">Tidak Ada</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "kepegawaian" && isDosenProfile && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Section: Identitas Kepegawaian */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <HiIdentification className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Identitas Kepegawaian
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NIP</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{userData.nip}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NIDN</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{userData.nidn}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NUPTK</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{userData.nuptk}</p>
                            </div>
                            {dosenData?.niy_nigk && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">NIY/NIGK</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{dosenData.niy_nigk}</p>
                              </div>
                            )}
                            {dosenData?.nsdmi && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">NSDMI</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{dosenData.nsdmi}</p>
                              </div>
                            )}
                            {dosenData?.nira && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">NIRA</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{dosenData.nira}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section: Status Kepegawaian */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <FiBriefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Status Kepegawaian
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Jenis SDM</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.jenisSDM}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Status</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.statusAktif}</p>
                            </div>
                            {dosenData?.kepegawaian?.lembaga_pengangkat && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Lembaga Pengangkat</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.kepegawaian.lembaga_pengangkat}</p>
                              </div>
                            )}
                            {dosenData?.kepegawaian?.sumber_gaji && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Sumber Gaji</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.kepegawaian.sumber_gaji}</p>
                              </div>
                            )}
                            {userData.tmtPNS && userData.tmtPNS !== "-" && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">TMT PNS</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{userData.tmtPNS}</p>
                              </div>
                            )}
                            {dosenData?.kepegawaian?.keahlian_lab && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Keahlian Lab</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.kepegawaian.keahlian_lab}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section: SK & Dokumen */}
                      {(dosenData?.kepegawaian?.sk_cpns || dosenData?.kepegawaian?.sk_angkat || (userData.npwp && userData.npwp !== "-")) && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            SK & Dokumen
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              {dosenData?.kepegawaian?.sk_cpns && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">SK CPNS</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.kepegawaian.sk_cpns}</p>
                                  {dosenData.kepegawaian.tanggal_sk_cpns && (
                                    <p className="text-[10px] sm:text-xs text-gray-500">Tanggal: {dosenData.kepegawaian.tanggal_sk_cpns}</p>
                                  )}
                                </div>
                              )}
                              {dosenData?.kepegawaian?.sk_angkat && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">SK Angkat</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.kepegawaian.sk_angkat}</p>
                                  {dosenData.kepegawaian.tmt_sk_angkat && (
                                    <p className="text-[10px] sm:text-xs text-gray-500">TMT: {dosenData.kepegawaian.tmt_sk_angkat}</p>
                                  )}
                                </div>
                              )}
                              {userData.npwp && userData.npwp !== "-" && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">NPWP</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{userData.npwp}</p>
                                  {dosenData?.pajak?.nama_wp && (
                                    <p className="text-[10px] sm:text-xs text-gray-500">Nama WP: {dosenData.pajak.nama_wp}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section: Data Pasangan */}
                      {dosenData?.pasangan?.nama && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            Data Suami/Istri
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Nama</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.pasangan.nama}</p>
                              </div>
                              {dosenData.pasangan.nip && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">NIP</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{dosenData.pasangan.nip}</p>
                                </div>
                              )}
                              {dosenData.pasangan.pekerjaan && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">Pekerjaan</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{dosenData.pasangan.pekerjaan}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Multiple Homebases for Dosen */}
                      {dosenData?.homebases && dosenData.homebases.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center gap-2 mb-4">
                            <FiBook className="w-5 h-5 text-myunila" />
                            <h4 className="text-lg font-bold text-gray-800">Riwayat Unit Kerja</h4>
                            <span className="ml-auto px-2 py-1 bg-myunila text-white rounded-full text-xs font-bold">
                              {dosenData.homebases.length} Unit
                            </span>
                          </div>
                          <div className="space-y-3">
                            {dosenData.homebases.map((homebase) => (
                              <div
                                key={homebase.id_reg_ptk}
                                className={`rounded-xl border-2 overflow-hidden ${homebase.is_active ? 'border-myunila bg-gradient-to-br from-blue-50 to-indigo-50' : 'border-gray-200 bg-gray-50'}`}
                              >
                                {/* Homebase Header */}
                                <div className={`px-4 py-3 ${homebase.is_active ? 'bg-myunila text-white' : 'bg-gray-200 text-gray-700'}`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <FiBriefcase className="w-5 h-5" />
                                      <span className="font-bold">{homebase.nama_unit || 'Unit Kerja'}</span>
                                      {homebase.jenjang && (
                                        <span className="text-sm opacity-80">({homebase.jenjang})</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {homebase.is_active && (
                                        <Chip size="sm" className="bg-white text-myunila font-bold">Aktif</Chip>
                                      )}
                                      {homebase.keterangan_keluar && (
                                        <Chip size="sm" className="bg-orange-100 text-orange-700 font-semibold">{homebase.keterangan_keluar}</Chip>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {/* Status Pegawai */}
                                    {homebase.status_pegawai && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status Pegawai</label>
                                        <p className="text-sm text-gray-800 font-medium mt-1">{homebase.status_pegawai}</p>
                                      </div>
                                    )}
                                    {/* Ikatan Kerja */}
                                    {homebase.ikatan_kerja && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ikatan Kerja</label>
                                        <p className="text-sm text-gray-800 font-medium mt-1">{homebase.ikatan_kerja}</p>
                                      </div>
                                    )}
                                    {/* NIDN di unit ini */}
                                    {homebase.nidn && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">NIDN</label>
                                        <p className="text-sm text-gray-800 font-medium font-mono mt-1">{homebase.nidn}</p>
                                      </div>
                                    )}
                                    {/* TMT Surat Tugas */}
                                    {homebase.tmt_surat_tugas && (
                                      <div className="bg-white rounded-lg p-3 border border-gray-100">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">TMT Surat Tugas</label>
                                        <p className="text-sm text-gray-800 font-medium mt-1">{homebase.tmt_surat_tugas}</p>
                                      </div>
                                    )}
                                    {/* Tanggal Keluar */}
                                    {homebase.tanggal_keluar && (
                                      <div className="bg-white rounded-lg p-3 border border-orange-100">
                                        <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Tanggal Keluar</label>
                                        <p className="text-sm text-gray-800 font-medium mt-1">{homebase.tanggal_keluar}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No homebases for dosen */}
                      {(!dosenData?.homebases || dosenData.homebases.length === 0) && (
                        <div className="mt-4 text-center py-6 bg-gray-50 rounded-lg text-gray-500">
                          Data unit kerja tidak tersedia
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "kepegawaian" && isMahasiswaProfile && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Multiple Homebases */}
                      {mahasiswaData?.homebases && mahasiswaData.homebases.length > 0 && (
                        <>
                          {mahasiswaData.homebases.map((homebase, hbIdx) => (
                            <div key={homebase.id_reg_pd} className="space-y-4 sm:space-y-6">
                              {/* Section: Program Studi Header */}
                              <div>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sm:mb-3">
                                  <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                    <FaGraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                                    <span className="line-clamp-2 sm:line-clamp-1">{homebase.jenjang} - {homebase.program_studi}</span>
                                  </h4>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {homebase.is_active && (
                                      <Chip size="sm" className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium">Aktif</Chip>
                                    )}
                                    {homebase.keterangan_keluar && (
                                      <Chip size="sm" className="bg-orange-100 text-orange-700 text-[10px] sm:text-xs font-medium">{homebase.keterangan_keluar}</Chip>
                                    )}
                                  </div>
                                </div>

                                {/* Homebase Content */}
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                    <div>
                                      <label className="text-[10px] sm:text-xs text-gray-500">NIM</label>
                                      <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{homebase.nim || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-[10px] sm:text-xs text-gray-500">Kode Prodi</label>
                                      <p className="text-xs sm:text-sm text-gray-900 font-medium">{homebase.kode_prodi || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-[10px] sm:text-xs text-gray-500">Tanggal Masuk</label>
                                      <p className="text-xs sm:text-sm text-gray-900 font-medium">{homebase.tanggal_masuk || '-'}</p>
                                    </div>
                                    {homebase.tanggal_keluar ? (
                                      <div>
                                        <label className="text-[10px] sm:text-xs text-gray-500">Tanggal Keluar</label>
                                        <p className="text-xs sm:text-sm text-gray-900 font-medium">{homebase.tanggal_keluar}</p>
                                      </div>
                                    ) : (
                                      <div>
                                        <label className="text-[10px] sm:text-xs text-gray-500">Status</label>
                                        <p className="text-xs sm:text-sm text-green-600 font-medium">Masih Terdaftar</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* IPK & SKS in same section */}
                                  {(homebase.ipk !== null || homebase.sks_diakui !== null) && (
                                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                                      {homebase.ipk !== null && (
                                        <div>
                                          <label className="text-[10px] sm:text-xs text-gray-500">IPK</label>
                                          <p className="text-lg sm:text-xl text-myunila font-bold">
                                            {typeof homebase.ipk === 'number' ? homebase.ipk.toFixed(2) : homebase.ipk}
                                          </p>
                                        </div>
                                      )}
                                      {homebase.sks_diakui !== null && (
                                        <div>
                                          <label className="text-[10px] sm:text-xs text-gray-500">SKS Diakui</label>
                                          <p className="text-lg sm:text-xl text-myunila font-bold">
                                            {homebase.sks_diakui} <span className="text-xs sm:text-sm font-normal text-gray-500">SKS</span>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* PT Asal (jika pindahan) */}
                                  {homebase.pt_asal?.nama_pt_asal && (
                                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                                      <label className="text-[10px] sm:text-xs text-gray-500">Perguruan Tinggi Asal</label>
                                      <p className="text-xs sm:text-sm text-gray-900 font-medium">{homebase.pt_asal.nama_pt_asal}</p>
                                      {homebase.pt_asal.nama_prodi_asal && (
                                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Program Studi: {homebase.pt_asal.nama_prodi_asal}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Section: Status Per Semester */}
                              {homebase.status_semester && homebase.status_semester.length > 0 && (
                                <div>
                                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                      <FiBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                                      Status Per Semester
                                    </h4>
                                    <span className="text-[10px] sm:text-xs text-gray-500">
                                      {homebase.status_semester.length} Semester
                                    </span>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-xs sm:text-sm min-w-[500px]">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                          <tr>
                                            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left font-medium text-gray-600 text-[10px] sm:text-xs">Semester</th>
                                            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-600 text-[10px] sm:text-xs">Status</th>
                                            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-600 text-[10px] sm:text-xs">SKS</th>
                                            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-600 text-[10px] sm:text-xs">Total</th>
                                            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-600 text-[10px] sm:text-xs">IPS</th>
                                            <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-center font-medium text-gray-600 text-[10px] sm:text-xs">IPK</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {homebase.status_semester.map((smt, idx) => (
                                            <tr key={smt.id_smt} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 font-medium text-gray-900 text-[10px] sm:text-xs whitespace-nowrap">{smt.semester}</td>
                                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                                                <Chip
                                                  size="sm"
                                                  className={`font-medium text-[10px] sm:text-xs ${
                                                    smt.status?.toLowerCase().includes('aktif')
                                                      ? 'bg-green-100 text-green-700'
                                                      : 'bg-gray-100 text-gray-700'
                                                  }`}
                                                >
                                                  {smt.status || '-'}
                                                </Chip>
                                              </td>
                                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-blue-600">{smt.sks_diambil ?? '-'}</td>
                                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium text-green-600">{smt.total_sks ?? '-'}</td>
                                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-medium">{smt.ips ? Number(smt.ips).toFixed(2) : '-'}</td>
                                              <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center text-[10px] sm:text-xs font-bold text-myunila">{smt.ipk ? Number(smt.ipk).toFixed(2) : '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Divider between homebases */}
                              {hbIdx < mahasiswaData.homebases.length - 1 && (
                                <Divider className="my-4 sm:my-6" />
                              )}
                            </div>
                          ))}
                        </>
                      )}

                      {/* No homebases */}
                      {(!mahasiswaData?.homebases || mahasiswaData.homebases.length === 0) && (
                        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
                          Data homebase tidak tersedia
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "kepegawaian" && isTendikProfile && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Section: Identitas Kepegawaian Tendik */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <HiIdentification className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Identitas Kepegawaian
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NIP</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{tendikData?.nip || "-"}</p>
                            </div>
                            {tendikData?.nidn && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">NIDN</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{tendikData.nidn}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Jenis Pegawai</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData?.jenis_pegawai || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Jenis Tenaga</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData?.jenis_tenaga || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Status</label>
                              <Chip
                                size="sm"
                                className={`font-semibold ${
                                  tendikData?.status?.toLowerCase().includes('aktif')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {tendikData?.status || "-"}
                              </Chip>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section: Status Kepegawaian */}
                      {(tendikData?.kepegawaian?.golongan || tendikData?.kepegawaian?.pangkat ||
                        tendikData?.kepegawaian?.tmt_golongan || tendikData?.kepegawaian?.tmt_cpns ||
                        tendikData?.kepegawaian?.tmt_pns || tendikData?.kepegawaian?.tmt_pensiun ||
                        tendikData?.kepegawaian?.pendidikan) && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiBriefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            Status Kepegawaian
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              {tendikData?.kepegawaian?.golongan && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">Golongan</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.golongan}</p>
                                </div>
                              )}
                              {tendikData?.kepegawaian?.pangkat && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">Pangkat</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.pangkat}</p>
                                </div>
                              )}
                              {tendikData?.kepegawaian?.tmt_golongan && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">TMT Golongan</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.tmt_golongan}</p>
                                </div>
                              )}
                              {tendikData?.kepegawaian?.tmt_cpns && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">TMT CPNS</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.tmt_cpns}</p>
                                </div>
                              )}
                              {tendikData?.kepegawaian?.tmt_pns && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">TMT PNS</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.tmt_pns}</p>
                                </div>
                              )}
                              {tendikData?.kepegawaian?.tmt_pensiun && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">TMT Pensiun</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.tmt_pensiun}</p>
                                </div>
                              )}
                              {tendikData?.kepegawaian?.pendidikan && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">Pendidikan</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.pendidikan}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section: Jabatan */}
                      {(tendikData?.kepegawaian?.jabatan_fungsional || tendikData?.kepegawaian?.jabatan_struktural) && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiBook className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            Jabatan
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              {tendikData?.kepegawaian?.jabatan_fungsional && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">Jabatan Fungsional</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.jabatan_fungsional}</p>
                                  {tendikData.kepegawaian.tmt_fungsional && (
                                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">TMT: {tendikData.kepegawaian.tmt_fungsional}</p>
                                  )}
                                </div>
                              )}
                              {tendikData?.kepegawaian?.jabatan_struktural && (
                                <div>
                                  <label className="text-[10px] sm:text-xs text-gray-500">Jabatan Struktural</label>
                                  <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.kepegawaian.jabatan_struktural}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Section: Unit Kerja - ordered by organizational level */}
                      {(tendikData?.unit_kerja?.unit_1 || tendikData?.unit_kerja?.unit_2 || tendikData?.unit_kerja?.unit_3) && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            Unit Kerja
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="space-y-3">
                              {/* Unit 1 - Level tertinggi (Universitas/Fakultas) */}
                              {tendikData?.unit_kerja?.unit_1 && (
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full bg-myunila/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-semibold text-myunila">1</span>
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] sm:text-xs text-gray-500">
                                      {/^\d+$/.test(tendikData.unit_kerja.unit_1) ? "Kode Unit" : "Unit Kerja"}
                                    </label>
                                    <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.unit_kerja.unit_1}</p>
                                  </div>
                                </div>
                              )}
                              {/* Unit 2 - Level menengah (Jurusan/Bagian) */}
                              {tendikData?.unit_kerja?.unit_2 && (
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full bg-myunila/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-semibold text-myunila">2</span>
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] sm:text-xs text-gray-500">
                                      {/^\d+$/.test(tendikData.unit_kerja.unit_2) ? "Kode Unit" : "Unit Kerja"}
                                    </label>
                                    <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.unit_kerja.unit_2}</p>
                                  </div>
                                </div>
                              )}
                              {/* Unit 3 - Level terendah (Program Studi/Sub-bagian) */}
                              {tendikData?.unit_kerja?.unit_3 && (
                                <div className="flex items-start gap-2">
                                  <div className="w-6 h-6 rounded-full bg-myunila/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-[10px] font-semibold text-myunila">3</span>
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-[10px] sm:text-xs text-gray-500">
                                      {/^\d+$/.test(tendikData.unit_kerja.unit_3) ? "Kode Unit" : "Unit Kerja"}
                                    </label>
                                    <p className="text-xs sm:text-sm text-gray-900 font-medium">{tendikData.unit_kerja.unit_3}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "kepegawaian" &&
                    !isDosenProfile &&
                    !isMahasiswaProfile &&
                    !isTendikProfile && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          Data kepegawaian/akademik tidak tersedia
                        </p>
                      </div>
                    )}

                  {activeTab === "keluarga" && isMahasiswaProfile && mahasiswaData?.keluarga && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Section: Data Ayah */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <FaUserTie className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Data Ayah
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Nama Lengkap</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ayah.nama || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NIK</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{mahasiswaData.keluarga.ayah.nik || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Tanggal Lahir</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">
                                {mahasiswaData.keluarga.ayah.tanggal_lahir
                                  ? new Date(mahasiswaData.keluarga.ayah.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Pendidikan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ayah.pendidikan || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Pekerjaan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ayah.pekerjaan || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Penghasilan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ayah.penghasilan || "-"}</p>
                            </div>
                            {mahasiswaData.keluarga.ayah.kebutuhan_khusus && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Kebutuhan Khusus</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ayah.kebutuhan_khusus}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section: Data Ibu Kandung */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                          <FaUserGraduate className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                          Data Ibu Kandung
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Nama Lengkap</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ibu.nama || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">NIK</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium font-mono">{mahasiswaData.keluarga.ibu.nik || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Tanggal Lahir</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">
                                {mahasiswaData.keluarga.ibu.tanggal_lahir
                                  ? new Date(mahasiswaData.keluarga.ibu.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                  : "-"}
                              </p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Pendidikan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ibu.pendidikan || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Pekerjaan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ibu.pekerjaan || "-"}</p>
                            </div>
                            <div>
                              <label className="text-[10px] sm:text-xs text-gray-500">Penghasilan</label>
                              <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ibu.penghasilan || "-"}</p>
                            </div>
                            {mahasiswaData.keluarga.ibu.kebutuhan_khusus && (
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Kebutuhan Khusus</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.ibu.kebutuhan_khusus}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section: Data Wali (jika ada) */}
                      {mahasiswaData.keluarga.wali.nama && (
                        <div>
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2 sm:mb-3 flex items-center gap-2">
                            <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-myunila flex-shrink-0" />
                            Data Wali
                          </h4>
                          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Nama Lengkap</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.wali.nama || "-"}</p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Tanggal Lahir</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">
                                  {mahasiswaData.keluarga.wali.tanggal_lahir
                                    ? new Date(mahasiswaData.keluarga.wali.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Pendidikan</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.wali.pendidikan || "-"}</p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Pekerjaan</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.wali.pekerjaan || "-"}</p>
                              </div>
                              <div>
                                <label className="text-[10px] sm:text-xs text-gray-500">Penghasilan</label>
                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{mahasiswaData.keluarga.wali.penghasilan || "-"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
