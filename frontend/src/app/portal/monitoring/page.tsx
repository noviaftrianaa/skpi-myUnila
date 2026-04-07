"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button, Chip, Tabs, Tab } from "@heroui/react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiExternalLink,
  FiActivity,
  FiRefreshCw,
  FiServer,
  FiDatabase,
  FiBox,
} from "react-icons/fi";
import { HiChartBar, HiDocumentText, HiStatusOnline } from "react-icons/hi";
import { MdSpeed, MdNotifications } from "react-icons/md";
import { FaDocker } from "react-icons/fa";

const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL || "http://192.168.120.44:3001";
const PROMETHEUS_URL = process.env.NEXT_PUBLIC_PROMETHEUS_URL || "http://192.168.120.44:9090";
const LOKI_URL = process.env.NEXT_PUBLIC_LOKI_URL || "http://192.168.120.44:3100";
const CADVISOR_URL = process.env.NEXT_PUBLIC_CADVISOR_URL || "http://192.168.120.44:18080";
const ALERTMANAGER_URL = `${PROMETHEUS_URL.replace(':9090', ':9093')}`;

type ToolStatus = "up" | "down" | "loading";

interface Tool {
  id: string;
  name: string;
  desc: string;
  url: string;
  healthUrl: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  features: string[];
  isHero?: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  desc: string;
  url: string;
  icon: React.ReactNode;
  color: string;
}

const tools: Tool[] = [
  {
    id: "grafana",
    name: "Grafana",
    desc: "Dashboard & Visualisasi Metrics",
    url: `${GRAFANA_URL}/`,
    healthUrl: `${GRAFANA_URL}/api/health`,
    icon: <HiChartBar className="w-6 h-6" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    isHero: true,
    features: ["Real-time dashboards", "Alert management", "Multi-datasource", "Custom panels"],
  },
  {
    id: "prometheus",
    name: "Prometheus",
    desc: "Metrics Collection & Time-Series DB",
    url: `${PROMETHEUS_URL}/`,
    healthUrl: `${PROMETHEUS_URL}/-/healthy`,
    icon: <FiActivity className="w-5 h-5" />,
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
    features: ["PromQL queries", "Scrape targets", "30-day retention", "Alert rules"],
  },
  {
    id: "alertmanager",
    name: "Alertmanager",
    desc: "Alert Routing & Notifikasi Telegram",
    url: `${ALERTMANAGER_URL}/`,
    healthUrl: `${ALERTMANAGER_URL}/-/healthy`,
    icon: <MdNotifications className="w-5 h-5" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
    features: ["Telegram alerts", "Critical & warning", "Auto resolve", "Grouping"],
  },
  {
    id: "loki",
    name: "Loki",
    desc: "Log Aggregation dari Semua VM",
    url: `${LOKI_URL}/`,
    healthUrl: `${LOKI_URL}/ready`,
    icon: <HiDocumentText className="w-5 h-5" />,
    color: "text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
    features: ["Docker log collection", "LogQL queries", "31-day retention", "Label filtering"],
  },
  {
    id: "cadvisor",
    name: "cAdvisor",
    desc: "Container Metrics per VM",
    url: `${CADVISOR_URL}/`,
    healthUrl: `${CADVISOR_URL}/healthz`,
    icon: <FaDocker className="w-5 h-5" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    features: ["Per-container CPU/RAM", "Network stats", "Disk I/O", "Live metrics"],
  },
  {
    id: "node-exporter",
    name: "Node Exporter",
    desc: "Host System Metrics VM1-VM5",
    url: `${PROMETHEUS_URL}/targets`,
    healthUrl: `${PROMETHEUS_URL}/-/healthy`,
    icon: <FiServer className="w-5 h-5" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    features: ["CPU, RAM, Disk", "Network interfaces", "1500+ metrics", "5 VM monitored"],
  },
];

const dashboards: Dashboard[] = [
  {
    id: "node-exporter",
    name: "Node Exporter Full",
    desc: "CPU, Memory, Disk, Network per VM",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <FiServer className="w-4 h-4" />,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: "cadvisor",
    name: "Docker Container Metrics",
    desc: "Resource usage per container",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <FaDocker className="w-4 h-4" />,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "kong",
    name: "Kong API Gateway",
    desc: "Request rate, latency, error rate",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <FiActivity className="w-4 h-4" />,
    color: "from-green-500 to-emerald-600",
  },
  {
    id: "redis",
    name: "Redis Performance",
    desc: "Cache hit rate, memory, ops/sec",
    url: `${GRAFANA_URL}/dashboards`,
    icon: <FiDatabase className="w-4 h-4" />,
    color: "from-rose-500 to-pink-600",
  },
];

const vms = [
  { name: "VM1", role: "Frontend + Kong", ip: "192.168.120.41" },
  { name: "VM2", role: "Backend PHP", ip: "192.168.120.42" },
  { name: "VM3", role: "Backend Go", ip: "192.168.120.43" },
  { name: "VM4", role: "Monitoring", ip: "192.168.120.44" },
  { name: "VM5", role: "Staging", ip: "192.168.120.45" },
];

function StatusBadge({ status }: { status: ToolStatus }) {
  if (status === "loading") return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse" />
      Checking...
    </span>
  );
  if (status === "up") return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
      </span>
      Online
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Offline
    </span>
  );
}

export default function MonitoringPage() {
  const { isLoading: authLoading } = useRequireAuth({
    requireRole: ["Developer", "Administrator"],
  });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [statuses, setStatuses] = useState<Record<string, ToolStatus>>(
    Object.fromEntries(tools.map((t) => [t.id, "loading"]))
  );
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkStatuses = useCallback(async () => {
    setIsRefreshing(true);
    const results = await Promise.allSettled(
      tools.map(async (tool) => {
        try {
          await fetch(tool.healthUrl, {
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
    const newStatuses: Record<string, ToolStatus> = {};
    results.forEach((r) => {
      if (r.status === "fulfilled") newStatuses[r.value.id] = r.value.status;
    });
    setStatuses(newStatuses);
    setLastChecked(new Date());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    checkStatuses();
    const interval = setInterval(checkStatuses, 30000);
    return () => clearInterval(interval);
  }, [checkStatuses]);

  const upCount = Object.values(statuses).filter((s) => s === "up").length;
  const heroTool = tools.find((t) => t.isHero)!;
  const secondaryTools = tools.filter((t) => !t.isHero);

  if (authLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Dot grid background */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`, backgroundSize: "32px 32px" }}
      />

      {/* Header */}
      <div className="relative border-b border-white/[0.06] bg-[#0d1220]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                startContent={<FiArrowLeft className="w-4 h-4" />}
                variant="flat" size="sm"
                onPress={() => router.push("/portal")}
                className="text-gray-400 bg-white/5 border border-white/10 px-3"
              >
                <span className="hidden sm:inline">Portal</span>
              </Button>
              <div className="h-5 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <FiActivity className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-semibold text-white">Monitoring & Observability</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">VM4 Production · Developer Tools</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-emerald-500" />
                </span>
                <span className="text-xs text-gray-300">{upCount}/{tools.length} Online</span>
              </div>
              <Button isIconOnly variant="flat" size="sm"
                onPress={checkStatuses} isLoading={isRefreshing}
                className="bg-white/5 border border-white/10 text-gray-400"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* VM Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {vms.map((vm) => (
            <div key={vm.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <FiServer className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{vm.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{vm.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs
          selectedKey={activeTab}
          onSelectionChange={(key) => setActiveTab(key as string)}
          classNames={{
            tabList: "bg-white/5 border border-white/10 rounded-xl p-1 mb-6",
            cursor: "bg-white/10 rounded-lg",
            tab: "text-gray-400 data-[selected=true]:text-white font-medium text-sm h-8 px-4",
          }}
        >
          <Tab key="overview" title={<div className="flex items-center gap-2"><FiActivity className="w-3.5 h-3.5" /><span>Tools</span></div>}>

            {/* Hero — Grafana */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-4">
              <div className={`relative rounded-2xl border ${heroTool.bgColor} bg-[#0d1220] overflow-hidden p-5`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
                      <HiChartBar className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-base font-semibold text-white">Grafana</h2>
                        <Chip size="sm" className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs h-5">Primary</Chip>
                        <StatusBadge status={statuses["grafana"] || "loading"} />
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Dashboard & Visualisasi — VM4 ({GRAFANA_URL})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {heroTool.features.map((f) => (
                          <span key={f} className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button
                    as="a" href={heroTool.url} target="_blank" rel="noopener noreferrer"
                    endContent={<FiExternalLink className="w-4 h-4" />}
                    className="bg-orange-500 hover:bg-orange-400 text-white font-medium px-5 h-10 rounded-xl w-full sm:w-auto flex-shrink-0"
                  >
                    Buka Grafana
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Secondary tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {secondaryTools.map((tool, i) => (
                <motion.div key={tool.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: (i + 1) * 0.06 }}>
                  <div className={`group rounded-xl border ${tool.bgColor} bg-[#0d1220] hover:bg-white/[0.03] transition-all duration-200 p-4 h-full flex flex-col`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${tool.color} flex-shrink-0`}>
                          {tool.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{tool.name}</p>
                          <p className="text-xs text-gray-500 leading-tight mt-0.5">{tool.desc}</p>
                        </div>
                      </div>
                      <StatusBadge status={statuses[tool.id] || "loading"} />
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3 flex-1">
                      {tool.features.map((f) => (
                        <span key={f} className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                    <Button
                      as="a" href={tool.url} target="_blank" rel="noopener noreferrer"
                      endContent={<FiExternalLink className="w-3 h-3" />}
                      size="sm" variant="flat"
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs h-8 mt-auto"
                    >
                      Buka {tool.name}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {lastChecked && (
              <p className="text-center text-xs text-gray-600 mt-4">
                Last checked: {lastChecked.toLocaleTimeString("id-ID")}
              </p>
            )}
          </Tab>

          <Tab key="dashboards" title={<div className="flex items-center gap-2"><HiChartBar className="w-3.5 h-3.5" /><span>Dashboards</span></div>}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm text-gray-500 mb-4">Quick access ke Grafana dashboards production</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dashboards.map((dash, i) => (
                  <motion.a
                    key={dash.id}
                    href={dash.url} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-[#0d1220] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 no-underline"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${dash.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {dash.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white leading-tight">{dash.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{dash.desc}</p>
                    </div>
                    <FiExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
                  </motion.a>
                ))}
              </div>

              {/* Info */}
              <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-start gap-3">
                  <FiBox className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-300 mb-1">VM4 Monitoring Server</p>
                    <p className="text-xs text-gray-500">Grafana: {GRAFANA_URL} · Prometheus: {PROMETHEUS_URL}</p>
                    <p className="text-xs text-gray-500 mt-1">Import dashboard ID: 1860 (Node), 14282 (cAdvisor), 7424 (Kong), 763 (Redis)</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </Tab>

          <Tab key="targets" title={<div className="flex items-center gap-2"><HiStatusOnline className="w-3.5 h-3.5" /><span>Targets</span></div>}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm text-gray-500 mb-4">Prometheus scrape targets — semua VM</p>
              <div className="space-y-2">
                {vms.map((vm, i) => (
                  <motion.div key={vm.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-[#0d1220]"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <FiServer className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{vm.name}</p>
                        <span className="text-xs text-gray-500">{vm.role}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">{vm.ip}</p>
                    </div>
                    <div className="flex gap-2 text-xs text-gray-500">
                      <a href={`${PROMETHEUS_URL}/targets`} target="_blank" rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1">
                        <FiExternalLink className="w-3 h-3" /> Targets
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                <a href={`${PROMETHEUS_URL}/targets`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                  <FiActivity className="w-4 h-4 text-red-400" />
                  Semua Targets di Prometheus
                  <FiExternalLink className="w-3.5 h-3.5" />
                </a>
                <a href={`${GRAFANA_URL}/alerting/list`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                  <MdNotifications className="w-4 h-4 text-yellow-400" />
                  Active Alerts di Grafana
                  <FiExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
