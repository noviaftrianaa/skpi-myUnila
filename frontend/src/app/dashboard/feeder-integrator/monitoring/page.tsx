"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import { Card, CardBody, Chip, Spinner } from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiActivity, FiCheckCircle, FiClock, FiServer } from "react-icons/fi";

export default function MonitoringPage() {
  useRequireAuth();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Monitoring"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 text-white">
              <FiActivity className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold">Monitoring</h1>
                <p className="text-blue-100">Real-time monitoring sinkronisasi data</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiActivity className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs opacity-90">Active Syncs</p>
                      <h3 className="text-2xl font-bold">0</h3>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600">
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiCheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs opacity-90">Completed Today</p>
                      <h3 className="text-2xl font-bold">0</h3>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiServer className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs opacity-90">API Status</p>
                      <h3 className="text-lg font-bold">Healthy</h3>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600">
                <CardBody className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <FiClock className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs opacity-90">Avg Duration</p>
                      <h3 className="text-2xl font-bold">-</h3>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Active Syncs */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4">Active Sync Operations</h3>
                <div className="text-center py-12 text-gray-500">
                  <FiActivity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No active sync operations</p>
                  <p className="text-sm mt-2">Sync operations will appear here when running</p>
                </div>
              </CardBody>
            </Card>

            {/* System Health */}
            <Card>
              <CardBody className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-medium">Neo Feeder API</span>
                    </div>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-medium">Database Connection</span>
                    </div>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-medium">API Gateway</span>
                    </div>
                    <Chip size="sm" color="success" variant="flat">Healthy</Chip>
                  </div>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
