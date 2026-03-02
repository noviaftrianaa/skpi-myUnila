// ========================================
// Components
// ========================================

export { DosenChart } from "./DosenChart";
export type { ChartType } from "./DosenChart";

export { DosenDataModal } from "./DosenDataModal";

export { DosenStatsCard } from "./DosenStatsCard";

export { JabfungStatsCards, JenjangStatsCards, PangGolStatsCards, IkatanKerjaStatsCards, JenisKelaminStatsCards, StatusKepegawaianStatsCards } from "./DosenStatsCards";

export { DosenTrendChart } from "./DosenTrendChart";
export type { TrendDataItem } from "./DosenTrendChart";

export { DosenPercentageChart } from "./DosenPercentageChart";
export type { PercentageData } from "./DosenPercentageChart";

// ========================================
// Hooks
// ========================================

export { useDosenData } from "./useDosenData";
export type { UseDosenDataParams } from "./useDosenData";

// ========================================
// Types
// ========================================

export type {
  TipeData,
  TipeDataOption,
  JabfungStats,
  JenjangStats,
  PangGolStats,
  IkatanKerjaStats,
  JenisKelaminStats,
  StatusKepegawaianStats,
  DosenStats,
  DosenStatsColor,
} from "./types";

// ========================================
// Constants
// ========================================

export { TipeDataOptions, TipeDataNames, JenjangDataKeys, PangGolDataKeys, IkatanKerjaDataKeys, JenisKelaminDataKeys, StatusKepegawaianDataKeys } from "./constants";

// ========================================
// Utils
// ========================================

export {
  getChartData,
  getStats,
  getCurrentTipeDataOption,
  getChartTitle,
  getChartSubtitle,
} from "./utils";
export type { ChartDataItem } from "./utils";
