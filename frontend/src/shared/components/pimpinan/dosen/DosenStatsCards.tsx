import { DosenStatsCard } from "./DosenStatsCard";
import type { DosenStats } from "./types";

// ========================================
// Types
// ========================================

interface JabfungStatsCardsProps {
  stats: DosenStats;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

interface JenjangStatsCardsProps {
  stats: DosenStats;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

interface PangGolStatsCardsProps {
  stats: DosenStats;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

interface IkatanKerjaStatsCardsProps {
  stats: DosenStats;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

interface JenisKelaminStatsCardsProps {
  stats: DosenStats;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

interface StatusKepegawaianStatsCardsProps {
  stats: DosenStats;
  onCategoryClick?: (category: string) => void;
  selectedCategory?: string | null;
}

interface PangGolStatsCardsProps {
  stats: DosenStats;
}

interface IkatanKerjaStatsCardsProps {
  stats: DosenStats;
}

interface JenisKelaminStatsCardsProps {
  stats: DosenStats;
}

interface StatusKepegawaianStatsCardsProps {
  stats: DosenStats;
}

// ========================================
// Components
// ========================================

/**
 * Jabfung Stats Cards Component
 * Displays stats cards for jabfung data
 */
export const JabfungStatsCards = ({
  stats,
  onCategoryClick,
  selectedCategory
}: JabfungStatsCardsProps) => {
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
        customColor="#94a3b8"
        onClick={() => onCategoryClick?.("belum_jabfung")}
        isSelected={selectedCategory === "belum_jabfung"}
      />
      <DosenStatsCard
        title="Asisten Ahli"
        value={jabfungStats.asistenAhli ?? 0}
        customColor="#3b82f6"
        onClick={() => onCategoryClick?.("asisten_ahli")}
        isSelected={selectedCategory === "asisten_ahli"}
      />
      <DosenStatsCard
        title="Lektor"
        value={jabfungStats.lektor ?? 0}
        customColor="#22c55e"
        onClick={() => onCategoryClick?.("lektor")}
        isSelected={selectedCategory === "lektor"}
      />
      <DosenStatsCard
        title="Lektor Kepala"
        value={jabfungStats.lektorKepala ?? 0}
        customColor="#f59e0b"
        onClick={() => onCategoryClick?.("lektor_kepala")}
        isSelected={selectedCategory === "lektor_kepala"}
      />
      <DosenStatsCard
        title="Profesor"
        value={jabfungStats.profesor ?? 0}
        customColor="#ef4444"
        onClick={() => onCategoryClick?.("profesor")}
        isSelected={selectedCategory === "profesor"}
      />
    </div>
  );
};

/**
 * Jenjang Stats Cards Component
 * Displays stats cards for jenjang pendidikan data
 */
export const JenjangStatsCards = ({
  stats,
  onCategoryClick,
  selectedCategory
}: JenjangStatsCardsProps) => {
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
      <DosenStatsCard
        title="D3"
        value={jenjangStats.d3 || 0}
        color="cyan"
        onClick={() => onCategoryClick?.("d3")}
        isSelected={selectedCategory === "d3"}
      />
      <DosenStatsCard
        title="D4"
        value={jenjangStats.d4 || 0}
        color="blue"
        onClick={() => onCategoryClick?.("d4")}
        isSelected={selectedCategory === "d4"}
      />
      <DosenStatsCard
        title="S1"
        value={jenjangStats.s1 || 0}
        color="green"
        onClick={() => onCategoryClick?.("s1")}
        isSelected={selectedCategory === "s1"}
      />
      <DosenStatsCard
        title="S2"
        value={jenjangStats.s2 || 0}
        color="purple"
        onClick={() => onCategoryClick?.("s2")}
        isSelected={selectedCategory === "s2"}
      />
      <DosenStatsCard
        title="S2 Terapan"
        value={jenjangStats.s2_terapan || 0}
        color="indigo"
        onClick={() => onCategoryClick?.("s2_terapan")}
        isSelected={selectedCategory === "s2_terapan"}
      />
      <DosenStatsCard
        title="S3"
        value={jenjangStats.s3 || 0}
        color="red"
        onClick={() => onCategoryClick?.("s3")}
        isSelected={selectedCategory === "s3"}
      />
      <DosenStatsCard
        title="Profesi"
        value={jenjangStats.profesi || 0}
        color="teal"
        onClick={() => onCategoryClick?.("profesi")}
        isSelected={selectedCategory === "profesi"}
      />
      <DosenStatsCard
        title="Sp1"
        value={jenjangStats.sp1 || 0}
        color="amber"
        onClick={() => onCategoryClick?.("sp1")}
        isSelected={selectedCategory === "sp1"}
      />
      <DosenStatsCard
        title="Sp2"
        value={jenjangStats.sp2 || 0}
        color="pink"
        onClick={() => onCategoryClick?.("sp2")}
        isSelected={selectedCategory === "sp2"}
      />
      <DosenStatsCard
        title="Belum Jenjang"
        value={jenjangStats.belumJenjang || 0}
        color="orange"
        onClick={() => onCategoryClick?.("belum_jenjang")}
        isSelected={selectedCategory === "belum_jenjang"}
      />
    </div>
  );
};

/**
 * Pangkat Golongan Stats Cards Component
 * Displays stats cards for pangkat golongan data
 */
export const PangGolStatsCards = ({
  stats,
  onCategoryClick,
  selectedCategory
}: PangGolStatsCardsProps) => {
  const panggolStats = stats as {
    juru_muda: number;
    juru_muda_tk_1: number;
    juru: number;
    juru_tk_1: number;
    pengatur_muda: number;
    pengatur_muda_tk_1: number;
    pengatur: number;
    pengatur_tk_1: number;
    penata_muda: number;
    penata_muda_tk_1: number;
    penata: number;
    penata_tk_1: number;
    pembina: number;
    pembina_tk_1: number;
    pembina_utama_muda: number;
    pembina_utama_madya: number;
    pembina_utama: number;
    belum_pangkat_gol: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5 lg:grid-cols-9">
      <DosenStatsCard
        title="I/a - Juru Muda"
        value={panggolStats.juru_muda || 0}
        color="cyan"
        onClick={() => onCategoryClick?.("juru_muda")}
        isSelected={selectedCategory === "juru_muda"}
      />
      <DosenStatsCard
        title="I/b - Juru Muda Tk. I"
        value={panggolStats.juru_muda_tk_1 || 0}
        color="blue"
        onClick={() => onCategoryClick?.("juru_muda_tk_1")}
        isSelected={selectedCategory === "juru_muda_tk_1"}
      />
      <DosenStatsCard
        title="I/c - Juru"
        value={panggolStats.juru || 0}
        color="indigo"
        onClick={() => onCategoryClick?.("juru")}
        isSelected={selectedCategory === "juru"}
      />
      <DosenStatsCard
        title="I/d - Juru Tk. I"
        value={panggolStats.juru_tk_1 || 0}
        color="violet"
        onClick={() => onCategoryClick?.("juru_tk_1")}
        isSelected={selectedCategory === "juru_tk_1"}
      />
      <DosenStatsCard
        title="II/a - Pengatur Muda"
        value={panggolStats.pengatur_muda || 0}
        color="purple"
        onClick={() => onCategoryClick?.("pengatur_muda")}
        isSelected={selectedCategory === "pengatur_muda"}
      />
      <DosenStatsCard
        title="II/b - Pengatur Muda Tk. I"
        value={panggolStats.pengatur_muda_tk_1 || 0}
        color="fuchsia"
        onClick={() => onCategoryClick?.("pengatur_muda_tk_1")}
        isSelected={selectedCategory === "pengatur_muda_tk_1"}
      />
      <DosenStatsCard
        title="II/c - Pengatur"
        value={panggolStats.pengatur || 0}
        color="pink"
        onClick={() => onCategoryClick?.("pengatur")}
        isSelected={selectedCategory === "pengatur"}
      />
      <DosenStatsCard
        title="II/d - Pengatur Tk. I"
        value={panggolStats.pengatur_tk_1 || 0}
        color="rose"
        onClick={() => onCategoryClick?.("pengatur_tk_1")}
        isSelected={selectedCategory === "pengatur_tk_1"}
      />
      <DosenStatsCard
        title="III/a - Penata Muda"
        value={panggolStats.penata_muda || 0}
        color="green"
        onClick={() => onCategoryClick?.("penata_muda")}
        isSelected={selectedCategory === "penata_muda"}
      />
      <DosenStatsCard
        title="III/b - Penata Muda Tk. I"
        value={panggolStats.penata_muda_tk_1 || 0}
        color="emerald"
        onClick={() => onCategoryClick?.("penata_muda_tk_1")}
        isSelected={selectedCategory === "penata_muda_tk_1"}
      />
      <DosenStatsCard
        title="III/c - Penata"
        value={panggolStats.penata || 0}
        color="teal"
        onClick={() => onCategoryClick?.("penata")}
        isSelected={selectedCategory === "penata"}
      />
      <DosenStatsCard
        title="III/d - Penata Tk. I"
        value={panggolStats.penata_tk_1 || 0}
        color="orange"
        onClick={() => onCategoryClick?.("penata_tk_1")}
        isSelected={selectedCategory === "penata_tk_1"}
      />
      <DosenStatsCard
        title="IV/a - Pembina"
        value={panggolStats.pembina || 0}
        color="amber"
        onClick={() => onCategoryClick?.("pembina")}
        isSelected={selectedCategory === "pembina"}
      />
      <DosenStatsCard
        title="IV/b - Pembina Tk. I"
        value={panggolStats.pembina_tk_1 || 0}
        color="yellow"
        onClick={() => onCategoryClick?.("pembina_tk_1")}
        isSelected={selectedCategory === "pembina_tk_1"}
      />
      <DosenStatsCard
        title="IV/c - Pembina Utama Muda"
        value={panggolStats.pembina_utama_muda || 0}
        color="red"
        onClick={() => onCategoryClick?.("pembina_utama_muda")}
        isSelected={selectedCategory === "pembina_utama_muda"}
      />
      <DosenStatsCard
        title="IV/d - Pembina Utama Madya"
        value={panggolStats.pembina_utama_madya || 0}
        color="destructive"
        onClick={() => onCategoryClick?.("pembina_utama_madya")}
        isSelected={selectedCategory === "pembina_utama_madya"}
      />
      <DosenStatsCard
        title="IV/e - Pembina Utama"
        value={panggolStats.pembina_utama || 0}
        color="slate"
        onClick={() => onCategoryClick?.("pembina_utama")}
        isSelected={selectedCategory === "pembina_utama"}
      />
      <DosenStatsCard
        title="- - Belum Pangkat"
        value={panggolStats.belum_pangkat_gol || 0}
        color="gray"
        onClick={() => onCategoryClick?.("belum_pangkat_gol")}
        isSelected={selectedCategory === "belum_pangkat_gol"}
      />
    </div>
  );
};

/**
 * Ikatan Kerja Stats Cards Component
 * Displays stats cards for ikatan kerja data
 */
export const IkatanKerjaStatsCards = ({
  stats,
  onCategoryClick,
  selectedCategory
}: IkatanKerjaStatsCardsProps) => {
  const ikatanKerjaStats = stats as {
    dosenTetap: number;
    dosenPnsDpk: number;
    dokterPendidikKlinis: number;
    dosenTetapBh: number;
    dosenTidakTetap: number;
    p3kAsn: number;
    dosenPerjanjianKerja: number;
    instruktur: number;
    tutor: number;
    jft: number;
    pengajarNondosen: number;
    dosenTetapPkWaktuTertentu: number;
    belumIkatanKerja: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4 lg:grid-cols-7">
      <DosenStatsCard
        title="Dosen Tetap"
        value={ikatanKerjaStats.dosenTetap || 0}
        customColor="#3b82f6"
        onClick={() => onCategoryClick?.("dosen_tetap")}
        isSelected={selectedCategory === "dosen_tetap"}
      />
      <DosenStatsCard
        title="PNS DPK"
        value={ikatanKerjaStats.dosenPnsDpk || 0}
        customColor="#6366f1"
        onClick={() => onCategoryClick?.("dosen_pns_dpk")}
        isSelected={selectedCategory === "dosen_pns_dpk"}
      />
      <DosenStatsCard
        title="Dokter Pendidik Klinis"
        value={ikatanKerjaStats.dokterPendidikKlinis || 0}
        customColor="#8b5cf6"
        onClick={() => onCategoryClick?.("dokter_pendidik_klinis")}
        isSelected={selectedCategory === "dokter_pendidik_klinis"}
      />
      <DosenStatsCard
        title="Dosen Tetap BH"
        value={ikatanKerjaStats.dosenTetapBh || 0}
        customColor="#a855f7"
        onClick={() => onCategoryClick?.("dosen_tetap_bh")}
        isSelected={selectedCategory === "dosen_tetap_bh"}
      />
      <DosenStatsCard
        title="Dosen Tidak Tetap"
        value={ikatanKerjaStats.dosenTidakTetap || 0}
        customColor="#22c55e"
        onClick={() => onCategoryClick?.("dosen_tidak_tetap")}
        isSelected={selectedCategory === "dosen_tidak_tetap"}
      />
      <DosenStatsCard
        title="P3K ASN"
        value={ikatanKerjaStats.p3kAsn || 0}
        customColor="#14b8a6"
        onClick={() => onCategoryClick?.("p3k_asn")}
        isSelected={selectedCategory === "p3k_asn"}
      />
      <DosenStatsCard
        title="Perjanjian Kerja"
        value={ikatanKerjaStats.dosenPerjanjianKerja || 0}
        customColor="#06b6d4"
        onClick={() => onCategoryClick?.("dosen_perjanjian_kerja")}
        isSelected={selectedCategory === "dosen_perjanjian_kerja"}
      />
      <DosenStatsCard
        title="Instruktur"
        value={ikatanKerjaStats.instruktur || 0}
        customColor="#f59e0b"
        onClick={() => onCategoryClick?.("instruktur")}
        isSelected={selectedCategory === "instruktur"}
      />
      <DosenStatsCard
        title="Tutor"
        value={ikatanKerjaStats.tutor || 0}
        customColor="#f97316"
        onClick={() => onCategoryClick?.("tutor")}
        isSelected={selectedCategory === "tutor"}
      />
      <DosenStatsCard
        title="JFT"
        value={ikatanKerjaStats.jft || 0}
        customColor="#ef4444"
        onClick={() => onCategoryClick?.("jft")}
        isSelected={selectedCategory === "jft"}
      />
      <DosenStatsCard
        title="Pengajar Nondosen"
        value={ikatanKerjaStats.pengajarNondosen || 0}
        customColor="#dc2626"
        onClick={() => onCategoryClick?.("pengajar_nondosen")}
        isSelected={selectedCategory === "pengajar_nondosen"}
      />
      <DosenStatsCard
        title="Tetap PKWTT"
        value={ikatanKerjaStats.dosenTetapPkWaktuTertentu || 0}
        customColor="#b91c1c"
        onClick={() => onCategoryClick?.("dosen_tetap_pk_waktu_tertentu")}
        isSelected={selectedCategory === "dosen_tetap_pk_waktu_tertentu"}
      />
      <DosenStatsCard
        title="Belum Ikatan Kerja"
        value={ikatanKerjaStats.belumIkatanKerja || 0}
        customColor="#cbd5e1"
        onClick={() => onCategoryClick?.("belum_ikatan_kerja")}
        isSelected={selectedCategory === "belum_ikatan_kerja"}
      />
    </div>
  );
};

/**
 * Jenis Kelamin Stats Cards Component
 * Displays stats cards for jenis kelamin data
 */
export const JenisKelaminStatsCards = ({
  stats,
  onCategoryClick,
  selectedCategory
}: JenisKelaminStatsCardsProps) => {
  const jenisKelaminStats = stats as {
    lakiLaki: number;
    perempuan: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-2">
      <DosenStatsCard
        title="Laki-laki"
        value={jenisKelaminStats.lakiLaki || 0}
        color="blue"
        onClick={() => onCategoryClick?.("laki_laki")}
        isSelected={selectedCategory === "laki_laki"}
      />
      <DosenStatsCard
        title="Perempuan"
        value={jenisKelaminStats.perempuan || 0}
        color="pink"
        onClick={() => onCategoryClick?.("perempuan")}
        isSelected={selectedCategory === "perempuan"}
      />
    </div>
  );
};

/**
 * Status Kepegawaian Stats Cards Component
 * Displays stats cards for status kepegawaian data
 */
export const StatusKepegawaianStatsCards = ({
  stats,
  onCategoryClick,
  selectedCategory
}: StatusKepegawaianStatsCardsProps) => {
  const statusKepegawaianStats = stats as {
    pns: number;
    cpns: number;
    pppk: number;
    nonAsn: number;
    asnJfNonDosen: number;
    dokterPendidikKlinis: number;
    lainnya: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4 lg:grid-cols-7">
      <DosenStatsCard
        title="PNS"
        value={statusKepegawaianStats.pns || 0}
        customColor="#3b82f6"
        onClick={() => onCategoryClick?.("pns")}
        isSelected={selectedCategory === "pns"}
      />
      <DosenStatsCard
        title="CPNS"
        value={statusKepegawaianStats.cpns || 0}
        customColor="#22c55e"
        onClick={() => onCategoryClick?.("cpns")}
        isSelected={selectedCategory === "cpns"}
      />
      <DosenStatsCard
        title="PPPK"
        value={statusKepegawaianStats.pppk || 0}
        customColor="#f59e0b"
        onClick={() => onCategoryClick?.("pppk")}
        isSelected={selectedCategory === "pppk"}
      />
      <DosenStatsCard
        title="Non-ASN"
        value={statusKepegawaianStats.nonAsn || 0}
        customColor="#ef4444"
        onClick={() => onCategoryClick?.("non_asn")}
        isSelected={selectedCategory === "non_asn"}
      />
      <DosenStatsCard
        title="ASN JF Non Dosen"
        value={statusKepegawaianStats.asnJfNonDosen || 0}
        customColor="#8b5cf6"
        onClick={() => onCategoryClick?.("asn_jf_non_dosen")}
        isSelected={selectedCategory === "asn_jf_non_dosen"}
      />
      <DosenStatsCard
        title="Dokter Pendidik Klinis"
        value={statusKepegawaianStats.dokterPendidikKlinis || 0}
        customColor="#06b6d4"
        onClick={() => onCategoryClick?.("dokter_pendidik_klinis")}
        isSelected={selectedCategory === "dokter_pendidik_klinis"}
      />
      <DosenStatsCard
        title="Lainnya"
        value={statusKepegawaianStats.lainnya || 0}
        customColor="#94a3b8"
        onClick={() => onCategoryClick?.("lainnya")}
        isSelected={selectedCategory === "lainnya"}
      />
    </div>
  );
};
