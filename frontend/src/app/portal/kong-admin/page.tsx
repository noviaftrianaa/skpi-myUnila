"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiServer,
  FiGlobe,
  FiRefreshCw,
  FiExternalLink,
  FiBook,
  FiLock,
} from "react-icons/fi";
import {
  MdCheckCircle,
} from "react-icons/md";
import { SiKong, SiSwagger } from "react-icons/si";

interface KongService {
  id: string;
  name: string;
  protocol: string;
  host: string;
  port: number;
  path: string;
  created_at: number;
  updated_at: number;
  enabled: boolean;
}

interface KongRoute {
  id: string;
  name: string;
  protocols: string[];
  methods: string[];
  paths: string[];
  service: {
    id: string;
  };
  created_at: number;
}

interface KongInfo {
  version: string;
  hostname: string;
  node_id: string;
  timers: {
    running: number;
    pending: number;
  };
}

// Mapping service to documentation URL (Direct access to service ports)
// Access is controlled at portal level via useRequireAppAccess
const serviceDocsMap: Record<string, string> = {
  "auth-service": "http://localhost:8081/docs",
  "public-service": "http://localhost:8082/docs",
  "sister-service": "http://localhost:8083/docs",
  "feeder-service": "http://localhost:8084/docs",
  "api-service": "http://localhost:8085/docs",
  "myunila-service": "http://localhost:8086/docs",
  "dashboard-service": "http://localhost:9000/docs",
};

// Service display names for better UX
const serviceDisplayNames: Record<string, string> = {
  "auth-service": "Auth Service",
  "public-service": "Public Service",
  "sister-service": "Sister Service",
  "feeder-service": "Feeder Service",
  "myunila-service": "myUnila Integrator",
  "api-service": "myUnila API Web Service",
  "dashboard-service": "Dashboard Service",
};

// Main services to display (filter out docs/public variants)
const mainServices = [
  "auth-service",
  "public-service",
  "sister-service",
  "feeder-service",
  "myunila-service",
  "api-service",
  "dashboard-service",
];

// Filter function to only show main services
const isMainService = (serviceName: string): boolean => {
  return mainServices.includes(serviceName);
};

export default function KongAdminPage() {
  // Use role-based auth check - Developer role required
  // This page doesn't have a backend service, so we use useRequireAuth instead of useRequireAppAccess
  const { isLoading: authLoading, isAuthenticated, user } = useRequireAuth({
    requireRole: "Developer",
  });
  const router = useRouter();

  // Derive access state from auth
  const hasAccess = isAuthenticated && user?.role === "Developer";
  const accessMessage = !isAuthenticated
    ? "Silakan login terlebih dahulu"
    : !hasAccess
      ? "Halaman ini hanya dapat diakses oleh Developer"
      : "";

  const [services, setServices] = useState<KongService[]>([]);
  const [routes, setRoutes] = useState<KongRoute[]>([]);
  const [kongInfo, setKongInfo] = useState<KongInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch Kong data
  const fetchKongData = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      // Fetch Services
      const servicesRes = await fetch("http://localhost:9801/services");
      if (!servicesRes.ok) throw new Error("Failed to fetch services");
      const servicesData = await servicesRes.json();
      setServices(servicesData.data || []);

      // Fetch Routes
      const routesRes = await fetch("http://localhost:9801/routes");
      if (!routesRes.ok) throw new Error("Failed to fetch routes");
      const routesData = await routesRes.json();
      setRoutes(routesData.data || []);

      // Fetch Kong Info
      const infoRes = await fetch("http://localhost:9801/");
      if (!infoRes.ok) throw new Error("Failed to fetch Kong info");
      const infoData = await infoRes.json();
      setKongInfo(infoData);
    } catch (err) {
      console.error("Error fetching Kong data:", err);
      setError(err instanceof Error ? err.message : "Failed to load Kong data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && hasAccess) {
      fetchKongData();
    }
  }, [authLoading, hasAccess]);

  // Get routes for a service
  const getServiceRoutes = (serviceId: string) => {
    return routes.filter((route) => route.service.id === serviceId);
  };

  // Loading state
  if (authLoading || (hasAccess && isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" color="primary" />
          <p className="text-gray-600">Loading Kong Admin...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (hasAccess === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            startContent={<FiArrowLeft />}
            variant="light"
            onPress={() => router.push("/portal")}
            className="mb-6"
          >
            Back to Portal
          </Button>
          <Card className="bg-amber-50 border border-amber-200">
            <CardBody className="p-8 text-center">
              <div className="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-800 mb-2">
                Akses Tidak Diizinkan
              </h2>
              <p className="text-amber-700 mb-6">
                {accessMessage || "Anda tidak memiliki akses ke halaman ini."}
              </p>
              <Button
                color="warning"
                variant="flat"
                onPress={() => router.push("/portal")}
              >
                Kembali ke Portal
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            startContent={<FiArrowLeft />}
            variant="light"
            onPress={() => router.push("/portal")}
            className="mb-6"
          >
            Back to Portal
          </Button>
          <Card className="bg-red-50 border border-red-200">
            <CardBody className="p-8 text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Failed to Connect to Kong Gateway
              </h2>
              <p className="text-red-600 mb-6">{error}</p>
              <Button
                color="danger"
                startContent={<FiRefreshCw />}
                onPress={fetchKongData}
              >
                Retry Connection
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Stats calculations - only count main services (not docs/public variants)
  const filteredServices = services.filter(s => isMainService(s.name));
  const enabledServices = filteredServices.filter((s) => s.enabled !== false).length;
  const totalRoutes = routes.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                startContent={<FiArrowLeft />}
                variant="light"
                onPress={() => router.push("/portal")}
                className="text-white hover:bg-white/10"
              >
                Portal
              </Button>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                  <SiKong className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Kong API Gateway</h1>
                  <p className="text-slate-300 text-sm">
                    Services & API Documentation
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Chip
                startContent={<MdCheckCircle className="w-4 h-4" />}
                className="bg-green-500/20 text-green-300 border border-green-500/30"
              >
                Connected
              </Chip>
              <Button
                isIconOnly
                variant="light"
                onPress={fetchKongData}
                isLoading={isRefreshing}
                className="text-white hover:bg-white/10"
              >
                <FiRefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Kong Info */}
          {kongInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase mb-1">Version</p>
                <p className="text-white font-semibold text-lg">
                  {kongInfo.version}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase mb-1">Services</p>
                <p className="text-white font-semibold text-lg">
                  {enabledServices} Active
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-slate-400 text-xs uppercase mb-1">Routes</p>
                <p className="text-white font-semibold text-lg">
                  {totalRoutes} Configured
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Services List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            API Services
          </h2>
          <p className="text-gray-600">
            Manage backend services and view API documentation
          </p>
        </div>

        {/* Filter to only show main services (not docs/public variants) */}
        {services.filter(s => isMainService(s.name)).length === 0 ? (
          <Card className="bg-white shadow-lg border border-gray-100">
            <CardBody className="p-12 text-center">
              <FiServer className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Services Configured
              </h3>
              <p className="text-gray-500">
                Configure services in Kong Gateway to get started
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.filter(s => isMainService(s.name)).map((service, index) => {
              const serviceRoutes = getServiceRoutes(service.id);
              const docsUrl = serviceDocsMap[service.name];

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-white to-gray-50/50 shadow-md border border-gray-200/60 hover:shadow-2xl hover:border-blue-300/40 transition-all duration-300 h-full overflow-hidden group">
                    <CardBody className="p-5 flex flex-col h-full relative">
                      {/* Status Badge - Top Right */}
                      <div className="absolute top-3 right-3">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                          service.enabled === false
                            ? "bg-red-100/80 backdrop-blur-sm"
                            : "bg-emerald-100/80 backdrop-blur-sm"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            service.enabled === false ? "bg-red-500" : "bg-emerald-500 animate-pulse"
                          }`}></div>
                          <span className={`text-[10px] font-semibold ${
                            service.enabled === false ? "text-red-700" : "text-emerald-700"
                          }`}>
                            {service.enabled === false ? "Offline" : "Online"}
                          </span>
                        </div>
                      </div>

                      {/* Service Header */}
                      <div className="flex items-start gap-3 mb-4 pr-16">
                        <div className="relative">
                          <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-blue-500/30 transition-shadow">
                            <FiServer className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate mb-0.5 group-hover:text-blue-600 transition-colors">
                            {service.name}
                          </h3>
                          <p className="text-[11px] text-gray-500 font-medium">
                            API Service
                          </p>
                        </div>
                      </div>

                      {/* Service URL */}
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <FiGlobe className="w-3 h-3 text-gray-400" />
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                            Endpoint
                          </p>
                        </div>
                        <div className="relative group/url">
                          <p className="text-xs font-mono text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2 rounded-lg border border-gray-200/50 break-all group-hover/url:border-blue-300/50 transition-colors">
                            {service.protocol}://{service.host}:{service.port}
                            {service.path || "/"}
                          </p>
                        </div>
                      </div>

                      {/* Routes */}
                      {serviceRoutes.length > 0 && (
                        <div className="mb-4 flex-1">
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                              Routes ({serviceRoutes.length})
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {serviceRoutes.slice(0, 4).map((route) => (
                              <div
                                key={route.id}
                                className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-purple-100/50 text-purple-700 rounded-md border border-purple-200/50 text-[11px] font-mono font-medium hover:shadow-sm transition-shadow"
                              >
                                {route.paths && route.paths.length > 0
                                  ? route.paths[0]
                                  : route.name || "No path"}
                              </div>
                            ))}
                            {serviceRoutes.length > 4 && (
                              <div className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[11px] font-semibold">
                                +{serviceRoutes.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {docsUrl && (
                        <div className="mt-auto pt-4 border-t border-gray-200/50">
                          <Button
                            as="a"
                            href={docsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 shadow-md hover:shadow-lg hover:shadow-emerald-500/30 font-semibold transition-all duration-300"
                            size="sm"
                          >
                            <SiSwagger className="w-3.5 h-3.5" />
                            <span className="text-xs">View API Documentation</span>
                            <FiExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {/* Decorative gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none rounded-xl"></div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 p-2 rounded-lg mt-1">
              <FiBook className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                About API Documentation
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                Each service provides Scalar/OpenAPI documentation for developers.
                Click the &quot;API Documentation&quot; button to explore endpoints, parameters,
                and test API calls directly.
              </p>
              <p className="text-xs text-blue-600 mb-2">
                <strong>Protected Access:</strong> All documentation endpoints are protected
                via Kong Gateway with JWT authentication. Only users with &quot;Developer&quot; role
                can access the documentation.
              </p>
              <p className="text-xs text-blue-600">
                <strong>Available Services:</strong> auth-service, public-service,
                sister-service, feeder-service, myunila-service, api-service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
