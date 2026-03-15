"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Button, Chip, Tabs, Tab } from "@heroui/react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiExternalLink,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import { HiChartBar, HiDocumentText } from "react-icons/hi";
import { MdSpeed } from "react-icons/md";
import { FaDocker } from "react-icons/fa";

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || "http://localhost:3001";
const PROMETHEUS_URL = process.env.NEXT_PUBLIC_PROMETHEUS_URL || "http://localhost:9090";
const LOKI_URL = process.env.NEXT_PUBLIC_LOKI_URL || "http://localhost:3100";
const CADVISOR_URL = process.env.NEXT_PUBLIC_CADVISOR_URL || "http://localhost:18080";

interface ToolStatus {
  [key: string]: "up" | "down" | "loading";
}

interface MonitoringTool {
  id: string;
  name: string;
  description: string;
  url: string;
  healthUrl: string;
  icon: React.ReactNode;
  gradient: string;
  features: string[];
  isHero?: boolean;
}

const tools: MonitoringTool[] = [
  {
    id: "grafana",
    name: "Grafana",
    description: "Visualization & Dashboards",
    url: `${GRAFANA_URL}/`,
    healthUrl: `${GRAFANA_URL}/api/health`,
    icon: <HiChartBar className="w-7 h-7" />,
    gradient: "from-orange-500 to-orange-600",
    isHero: true,
    features: ["Real-time dashboards", "Multi-datasource", "Alert management", "Custom panels"],
  },
  {
    id: "prometheus",
    name: "Prometheus",
    description: "Metrics & Time-Series DB",
    url: `${PROMETHEUS_URL}/`,
    healthUrl: `${PROMETHEUS_URL}/-/healthy`,
    icon: <FiActivity className="w-6 h-6" />,
    gradient: "from-red-500 to-red-600",
    features: ["PromQL queries", "6 active targets", "30-day retention", "Alert rules"],
  },
  {
    id: "loki",
    name: "Loki",
    description: "Log Aggregation",
    url: `${LOKI_URL}/`,
    healthUrl: `${LOKI_URL}/ready`,
    icon: <HiDocumentText className="w-6 h-6" />,
    gradient: "from-green-500 to-emerald-600",
    features: ["Docker log collection", "LogQL queries", "31-day retention", "Label filtering"],
  },
  {
    id: "cadvisor",
    name: "cAdvisor",
    description: "Container Metrics",
    url: `${CADVISOR_URL}/`,
    healthUrl: `${CADVISOR_URL}/healthz`,
    icon: <FaDocker className="w-6 h-6" />,
    gradient: "from-blue-500 to-blue-600",
    features: ["Per-container CPU/RAM", "Network stats", "Disk I/O", "Live metrics"],
  },
  {
    id: "node-exporter",
    name: "Node Exporter",
    description: "Host System Metrics",
    url: `${PROMETHEUS_URL}/targets`,
    healthUrl: `${PROMETHEUS_URL}/-/healthy`,
    icon: <MdSpeed className="w-6 h-6" />,
    gradient: "from-purple-500 to-purple-600",
    features: ["CPU, RAM, Disk", "Network interfaces", "1500+ metrics", "Host-level data"],
  },
  {
    id: "redis-exporter",
    name: "Redis Exporter",
    description: "Redis Performance",
    url: `${PROMETHEUS_URL}/targets`,
    healthUrl: `${PROMETHEUS_URL}/-/healthy`,
    icon: <HiChartBar className="w-6 h-6" />,
    gradient: "from-rose-500 to-pink-600",
    features: ["Ops/sec tracking", "Memory usage", "Hit rate", "Connection stats"],
  },
];

const dashboards = [
  {
    id: "node-exporter-full",
    name: "Node Exporter Full",
    description: "CPU, Memory, Disk, Network — host system metrics",
    url: `${GRAFANA_URL}/d/rYdddlPWk/node-exporter-full`,
    icon: <MdSpeed className="w-5 h-5" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "cadvisor",
    name: "Container Metrics",
    description: "Per-container resource usage & performance",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <FaDocker className="w-5 h-5" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "kong",
    name: "Kong API Gateway",
    description: "Request rate, latency, error rate per service",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <FiActivity className="w-5 h-5" />,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "myunila",
    name: "MyUnila Overview",
    description: "All services at a glance — custom dashboard",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <HiChartBar className="w-5 h-5" />,
    color: "from-orange-500 to-orange-600",
  },
];

function StatusDot({ status }: { status: "up" | "down" | "loading" }) {
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
        <span className="text-xs text-gray-400">Checking...</span>
      </span>
    );
  }
  if (status === "up") {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex w-2 h-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-emerald-400 font-medium">Online</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span className="text-xs text-red-400 font-medium">Offline</span>
    </span>
  );
}

export default function MonitoringPage() {
  const { isLoading: authLoading } = useRequireAuth({
    requireRole: ["Developer", "Administrator"],
  });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [statuses, setStatuses] = useState<ToolStatus>(() =>
    Object.fromEntries(tools.map((t) => [t.id, "loading"]))
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatuses = async () => {
    setIsRefreshing(true);
    const results = await Promise.allSettled(
      tools.map(async (tool) => {
        try {
          const res = await fetch(tool.healthUrl, {
            method: "GET",
            signal: AbortSignal.timeout(5000),
            mode: "no-cors",
          });
          return { id: tool.id, status: "up" as const };
        } catch {
          return { id: tool.id, status: "down" as const };
        }
      })
    );

    const newStatuses: ToolStatus = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        // With no-cors we can't read status, but if it doesn't throw = up
        newStatuses[r.value.id] = r.value.status;
      }
    });
    setStatuses(newStatuses);
    setLastChecked(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkStatuses();
    const interval = setInterval(checkStatuses, 30000);
    return () => clearInterval(interval);
  }, []);

  const upCount = Object.values(statuses).filter((s) => s === "up").length;
  const heroTool = tools.find((t) => t.isHero)!;
  const secondaryTools = tools.filter((t) => !t.isHero);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <div className="relative border-b border-white/[0.06] bg-[#0d1220]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                startContent={<FiArrowLeft className="w-4 h-4" />}
                variant="flat"
                size="sm"
                onPress={() => router.push("/portal")}
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 min-w-0 px-3"
              >
                <span className="hidden sm:inline">Portal</span>
              </Button>
              <div className="h-5 w-px bg-white/10" />
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FiActivity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-semibold text-white leading-tight">
                    Monitoring & Observability
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    VM5 Staging · Developer Tools
                  </p>
                </div>
              </div>
            </div>

            {/* Stats + Refresh */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  {upCount}/{tools.length} Online
                </span>
              </div>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onPress={checkStatuses}
                isLoading={isRefreshing}
                className="bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Mobile stats */}
        <div className="flex sm:hidden items-center justify-between mb-5 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
          <span className="text-xs text-gray-400">Status</span>
          <div className="flex items-center gap-1.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
            </span>
            <span className="text-xs text-emerald-400 font-medium">{upCount}/{tools.length} Online</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "bg-white/5 border border-white/10 rounded-xl p-1 mb-6 sm:mb-8",
            cursor: "bg-white/10 rounded-lg",
            tab: "text-gray-400 data-[selected=true]:text-white font-medium text-sm h-8 px-4",
          }}
        >
          <Tab
            key="overview"
            title={
              <div className="flex items-center gap-2">
                <FiActivity className="w-3.5 h-3.5" />
                <span>Tools</span>
              </div>
            }
          >
            {/* Hero Card — Grafana */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 sm:mb-5"
            >
              <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 via-[#0d1220] to-[#0d1220] overflow-hidden p-5 sm:p-6">
                {/* Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 flex-shrink-0">
                      <HiChartBar className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base sm:text-lg font-semibold text-white">Grafana</h2>
                        <Chip size="sm" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs h-5">
                          Primary
                        </Chip>
                        <StatusDot status={statuses["grafana"] || "loading"} />
                      </div>
                      <p className="text-sm text-gray-400">Visualization & Dashboards · Port 3001</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {heroTool.features.map((f) => (
                          <span key={f} className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    as="a"
                    href={heroTool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    endContent={<FiExternalLink className="w-4 h-4" />}
                    className="bg-orange-500 hover:bg-orange-400 text-white font-medium px-5 h-10 rounded-xl shadow-lg shadow-orange-500/20 flex-shrink-0 w-full sm:w-auto"
                  >
                    Open Grafana
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Secondary tools grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {secondaryTools.map((tool, i) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (i + 1) * 0.06 }}
                >
                  <div className="group relative rounded-xl border border-white/10 bg-[#0d1220] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 p-4 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                          {tool.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{tool.name}</p>
                          <p className="text-xs text-gray-500 leading-tight mt-0.5">{tool.description}</p>
                        </div>
                      </div>
                      <StatusDot status={statuses[tool.id] || "loading"} />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3 flex-1">
                      {tool.features.map((f) => (
                        <span key={f} className="text-xs text-gray-500 bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                          {f}
                        </span>
                      ))}
                    </div>
                    <Button
                      as="a"
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      endContent={<FiExternalLink className="w-3 h-3" />}
                      size="sm"
                      variant="flat"
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs h-8 mt-auto"
                    >
                      Open {tool.name}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Last checked */}
            {lastChecked && (
              <p className="text-center text-xs text-gray-600 mt-5">
                Last checked: {lastChecked.toLocaleTimeString("id-ID")}
              </p>
            )}
          </Tab>

          <Tab
            key="dashboards"
            title={
              <div className="flex items-center gap-2">
                <HiChartBar className="w-3.5 h-3.5" />
                <span>Dashboards</span>
              </div>
            }
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-gray-500 mb-5">Quick access to Grafana dashboards</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {dashboards.map((dash, i) => (
                  <motion.div
                    key={dash.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <a
                      href={dash.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#0d1220] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 no-underline"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${dash.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {dash.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white leading-tight group-hover:text-gray-100">
                          {dash.name}
                        </p>
                        <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
                          {dash.description}
                        </p>
                      </div>
                      <FiExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                    </a>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-start gap-3">
                  <HiChartBar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-300 mb-1">Import more dashboards</p>
                    <p className="text-xs text-gray-500">
                      Grafana.com IDs: Node Exporter (1860), cAdvisor (14282), Kong (7424), Redis (763)
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
