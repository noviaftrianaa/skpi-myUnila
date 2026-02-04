import { DosenStatsCard } from "./DosenStatsCard";
import type { DosenStats } from "./types";

// ========================================
// Types
// ========================================

interface JabfungStatsCardsProps {
  stats: DosenStats;
}

interface JenjangStatsCardsProps {
  stats: DosenStats;
}

// ========================================
// Components
// ========================================

/**
 * Jabfung Stats Cards Component
 * Displays stats cards for jabfung data
 */
export const JabfungStatsCards = ({ stats }: JabfungStatsCardsProps) => {
  const jabfungStats = stats as {
    belumJabfung: number;
    asistenAhli: number;
    lektor: number;
    lektorKepala: number;
    profesor: number;
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-5">
      <DosenStatsCard
        title="Belum Jabfung"
        value={jabfungStats.belumJabfung ?? 0}
        color="blue"
      />
      <DosenStatsCard
        title="Asisten Ahli"
        value={jabfungStats.asistenAhli ?? 0}
        color="green"
      />
      <DosenStatsCard
        title="Lektor"
        value={jabfungStats.lektor ?? 0}
        color="purple"
      />
      <DosenStatsCard
        title="Lektor Kepala"
        value={jabfungStats.lektorKepala ?? 0}
        color="amber"
      />
      <DosenStatsCard
        title="Profesor"
        value={jabfungStats.profesor ?? 0}
        color="red"
      />
    </div>
  );
};

/**
 * Jenjang Stats Cards Component
 * Displays stats cards for jenjang pendidikan data
 */
export const JenjangStatsCards = ({ stats }: JenjangStatsCardsProps) => {
  const jenjangStats = stats as {
    d3: number;
    d4: number;
    s1: number;
    s2: number;
    s2_terapan: number;
    s3: number;
    profesi: number;
    sp1: number;
    sp2: number;
    belumJenjang: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5 lg:grid-cols-10">
      <DosenStatsCard title="D3" value={jenjangStats.d3 || 0} color="cyan" />
      <DosenStatsCard title="D4" value={jenjangStats.d4 || 0} color="blue" />
      <DosenStatsCard title="S1" value={jenjangStats.s1 || 0} color="green" />
      <DosenStatsCard title="S2" value={jenjangStats.s2 || 0} color="purple" />
      <DosenStatsCard
        title="S2 Terapan"
        value={jenjangStats.s2_terapan || 0}
        color="indigo"
      />
      <DosenStatsCard title="S3" value={jenjangStats.s3 || 0} color="red" />
      <DosenStatsCard
        title="Profesi"
        value={jenjangStats.profesi || 0}
        color="teal"
      />
      <DosenStatsCard title="Sp1" value={jenjangStats.sp1 || 0} color="amber" />
      <DosenStatsCard title="Sp2" value={jenjangStats.sp2 || 0} color="pink" />
      <DosenStatsCard
        title="Belum Jenjang"
        value={jenjangStats.belumJenjang || 0}
        color="orange"
      />
    </div>
  );
};
