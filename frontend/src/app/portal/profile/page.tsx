"use client";

import { useState, useEffect } from "react";
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
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiShield,
} from "react-icons/fi";
import { HiIdentification } from "react-icons/hi";
import Link from "next/link";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("informasi");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Dummy user data
  const userData = {
    name: "Mizar Zulmi Ramadhan, S.Kom.",
    email: "mizar.zulmi@staff.unila.ac.id",
    phone: "+62 812-3456-7890",
    address: "Bandar Lampung, Lampung",
    birthDate: "15 Januari 1990",
    position: "Staff IT",
    department: "UPA TIK",
    nip: "198001152005011001",
    employeeType: "PNS",
    joinDate: "1 Januari 2005",
  };

  const getInitials = (fullName: string) => {
    const nameParts = fullName.split(",")[0].trim().split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return nameParts[0].substring(0, 2).toUpperCase();
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
                      <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
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
                    <p className="text-sm text-gray-500 mt-1">{userData.department}</p>

                    <Divider className="my-5" />

                    <div className="w-full space-y-4">
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <FiMail className="w-4 h-4 text-myunila" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-xs text-gray-500 mb-1">Email</p>
                            <p className="text-sm text-gray-800 font-medium break-all">
                              {userData.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <FiPhone className="w-4 h-4 text-myunila" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs text-gray-500 mb-1">Telepon</p>
                            <p className="text-sm text-gray-800 font-medium">
                              {userData.phone}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <FiMapPin className="w-4 h-4 text-myunila" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-xs text-gray-500 mb-1">Alamat</p>
                            <p className="text-sm text-gray-800 font-medium">
                              {userData.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
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
                <CardHeader className="px-6 pt-6 pb-0">
                  <Tabs
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                    color="primary"
                    variant="underlined"
                    classNames={{
                      cursor: "bg-myunila",
                      tabContent: "group-data-[selected=true]:text-myunila font-semibold",
                      tab: "px-6 py-3",
                    }}
                  >
                    <Tab
                      key="informasi"
                      title={
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span className="hidden sm:inline">Informasi Pribadi</span>
                          <span className="sm:hidden">Pribadi</span>
                        </div>
                      }
                    />
                    <Tab
                      key="kepegawaian"
                      title={
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="w-4 h-4" />
                          <span>Kepegawaian</span>
                        </div>
                      }
                    />
                  </Tabs>
                </CardHeader>
                <Divider className="mt-0" />
                <CardBody className="p-6">
                  {activeTab === "informasi" && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiUser className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Nama Lengkap
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.name}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiMail className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Email
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium break-all">
                          {userData.email}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiPhone className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Nomor Telepon
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.phone}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiMapPin className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Alamat
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.address}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Tanggal Lahir
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.birthDate}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "kepegawaian" && (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <HiIdentification className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            NIP
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium font-mono">
                          {userData.nip}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiBriefcase className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Jabatan
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.position}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiBriefcase className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Unit Kerja
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.department}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiShield className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Status Kepegawaian
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Chip
                            size="sm"
                            className="bg-green-100 text-green-700 font-semibold"
                          >
                            {userData.employeeType}
                          </Chip>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCalendar className="w-4 h-4 text-myunila" />
                          <label className="text-xs font-semibold text-myunila uppercase tracking-wide">
                            Tanggal Bergabung
                          </label>
                        </div>
                        <p className="text-base text-gray-800 font-medium">
                          {userData.joinDate}
                        </p>
                      </div>
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
