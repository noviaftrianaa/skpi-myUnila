"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

interface MaintenancePageProps {
  menuName?: string;
  menuIcon?: string;
  appName?: string;
  message?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function MaintenancePage({
  menuName = "Fitur",
  menuIcon = "heroicons:wrench-screwdriver",
  appName,
  message = "Fitur ini sedang dalam pengembangan dan akan segera tersedia.",
  showBackButton = true,
  onBack,
}: MaintenancePageProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 shadow-xl border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <CardBody className="relative p-8 sm:p-12 text-center">
            {/* Main Icon Animation */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative mx-auto mb-8"
            >
              {/* Animated rings */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ margin: "-16px" }}
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ margin: "-32px" }}
              />

              {/* Main icon container */}
              <div className="relative w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 shadow-lg shadow-orange-500/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon icon={menuIcon} className="w-12 h-12 text-white" />
                </motion.div>
              </div>

              {/* Status badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2"
              >
                <Chip
                  color="warning"
                  variant="solid"
                  size="sm"
                  className="shadow-lg"
                  startContent={
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Icon icon="heroicons:cog-6-tooth" className="w-3.5 h-3.5" />
                    </motion.div>
                  }
                >
                  Dalam Pengembangan
                </Chip>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {menuName}
                </h1>
                {appName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appName}
                  </p>
                )}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center">
                    <Icon icon="heroicons:information-circle" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Sedang Dalam Pengembangan
                    </h3>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="pt-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 rounded-full bg-amber-500"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 rounded-full bg-amber-500"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 rounded-full bg-amber-500"
                  />
                  <span className="ml-2">Tim kami sedang bekerja keras</span>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            {showBackButton && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Button
                  color="primary"
                  variant="flat"
                  onPress={handleBack}
                  startContent={<Icon icon="heroicons:arrow-left" className="w-4 h-4" />}
                  className="font-medium"
                >
                  Kembali
                </Button>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={() => router.push("/dashboard/portal")}
                  startContent={<Icon icon="heroicons:squares-2x2" className="w-4 h-4" />}
                  className="font-medium"
                >
                  Portal Aplikasi
                </Button>
              </motion.div>
            )}

            {/* Footer note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-xs text-gray-400 dark:text-gray-500"
            >
              Hubungi administrator jika Anda memerlukan akses segera ke fitur ini.
            </motion.p>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
