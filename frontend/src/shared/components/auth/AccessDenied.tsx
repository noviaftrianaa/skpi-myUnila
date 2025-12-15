/**
 * Access Denied Component
 *
 * Displays when user doesn't have access to a specific application
 * Can show option to select role or redirect back to portal
 */

'use client';

import { useState } from 'react';
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { FiAlertCircle, FiUser, FiArrowLeft, FiShield } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContextContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface AccessDeniedProps {
  message?: string;
  requiresContextSelection?: boolean;
  appName?: string;
  onRoleChange?: () => void;
}

export default function AccessDenied({
  message = 'Anda tidak memiliki akses ke aplikasi ini',
  requiresContextSelection = false,
  appName,
  onRoleChange,
}: AccessDeniedProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { roles, activeContext, selectContext, isSelectingContext } = useUserContext();
  const [showRoleModal, setShowRoleModal] = useState(requiresContextSelection);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  const handleRoleChange = async () => {
    if (!selectedRoleId) return;

    const selectedRole = roles.find(r => r.id_role_pengguna === selectedRoleId);
    const success = await selectContext(selectedRoleId);

    if (success) {
      setShowRoleModal(false);
      toast.success(`Peran berhasil diubah ke ${selectedRole?.nm_peran || 'peran baru'}`);
      // Trigger callback to re-check access
      if (onRoleChange) {
        onRoleChange();
      } else {
        // Reload page to re-check access
        window.location.reload();
      }
    } else {
      toast.error('Gagal mengubah peran. Silakan coba lagi.');
    }
  };

  const approvedRoles = roles.filter(r => r.approval_peran);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardBody className="p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <FiShield className="w-10 h-10 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h1>

          {/* App Name */}
          {appName && (
            <p className="text-lg text-gray-600 mb-4">
              {appName}
            </p>
          )}

          {/* Message */}
          <p className="text-gray-500 mb-6">
            {requiresContextSelection
              ? 'Silakan pilih peran terlebih dahulu untuk mengakses aplikasi ini.'
              : message}
          </p>

          {/* Current Context Info */}
          {activeContext && !requiresContextSelection && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-gray-500 mb-1">Peran Aktif Anda:</p>
              <p className="font-semibold text-gray-800">{activeContext.nm_peran}</p>
              <p className="text-sm text-gray-600">{activeContext.nm_organisasi}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Select Role Button */}
            {(requiresContextSelection || approvedRoles.length > 1) && (
              <Button
                className="w-full bg-myunila text-white hover:bg-blue-700"
                startContent={<FiUser className="w-4 h-4" />}
                onPress={() => setShowRoleModal(true)}
              >
                {requiresContextSelection ? 'Pilih Peran' : 'Ganti Peran'}
              </Button>
            )}

            {/* Back to Portal */}
            <Button
              variant="bordered"
              className="w-full border-gray-300"
              startContent={<FiArrowLeft className="w-4 h-4" />}
              onPress={() => router.push('/portal')}
            >
              Kembali ke Portal
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Role Selection Modal */}
      <Modal
        isOpen={showRoleModal}
        onOpenChange={setShowRoleModal}
        size="md"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          backdrop: "bg-black/50 backdrop-blur-sm",
          base: "bg-white mx-4 sm:mx-0",
        }}
      >
        <ModalContent className="bg-white max-h-[85vh] sm:max-h-[90vh]">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-0.5 sm:gap-1 border-b border-gray-200 pb-3 sm:pb-4 sticky top-0 bg-white z-10 px-4 sm:px-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Pilih Peran</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-normal">
                  Pilih peran yang memiliki akses ke aplikasi ini
                </p>
              </ModalHeader>
              <ModalBody className="py-4 sm:py-6 px-4 sm:px-6 overflow-y-auto">
                {approvedRoles.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {approvedRoles.map((role) => (
                      <button
                        key={role.id_role_pengguna}
                        onClick={() => setSelectedRoleId(role.id_role_pengguna)}
                        className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedRoleId === role.id_role_pengguna
                            ? "border-myunila bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                              selectedRoleId === role.id_role_pengguna ? "bg-myunila text-white" : "bg-gray-200 text-gray-600"
                            }`}>
                              <FiUser className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold text-sm sm:text-base ${
                                selectedRoleId === role.id_role_pengguna ? "text-myunila" : "text-gray-800"
                              }`}>
                                {role.nm_peran}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {role.nm_organisasi}
                              </p>
                            </div>
                          </div>
                          {selectedRoleId === role.id_role_pengguna && (
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-myunila text-white flex items-center justify-center flex-shrink-0 ml-2">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <FiAlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">Tidak ada peran yang tersedia</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="border-t border-gray-200 pt-3 sm:pt-4 sticky bottom-0 bg-white z-10 px-4 sm:px-6 gap-2">
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-gray-600 hover:bg-gray-100 font-medium text-xs sm:text-sm"
                  size="sm"
                >
                  Batal
                </Button>
                <Button
                  className="bg-myunila text-white hover:bg-blue-700 font-medium text-xs sm:text-sm"
                  onPress={handleRoleChange}
                  isLoading={isSelectingContext}
                  isDisabled={!selectedRoleId}
                  size="sm"
                >
                  Terapkan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
