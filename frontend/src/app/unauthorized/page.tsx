"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { FiArrowLeft, FiLock, FiHome } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContextContext";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { activeContext } = useUserContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-xl border border-gray-100">
        <CardBody className="p-8 text-center">
          {/* Icon */}
          <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLock className="w-10 h-10 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Akses Tidak Diizinkan
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>

          {/* Current Role Info */}
          {isAuthenticated && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-500 mb-1">Informasi Akun:</p>
              <p className="text-sm font-medium text-gray-800">
                {user?.nama_lengkap || user?.username}
              </p>
              {activeContext && (
                <p className="text-xs text-gray-500 mt-1">
                  {activeContext.nm_peran} - {activeContext.nm_organisasi}
                </p>
              )}
              {!activeContext && user?.role && (
                <p className="text-xs text-gray-500 mt-1">
                  Role: {user.role}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="light"
              startContent={<FiArrowLeft className="w-4 h-4" />}
              onPress={() => router.back()}
              className="text-gray-600 hover:bg-gray-100"
            >
              Kembali
            </Button>
            <Button
              color="primary"
              startContent={<FiHome className="w-4 h-4" />}
              onPress={() => router.push("/portal")}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Ke Portal
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
