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

/**
 * Pangkat Golongan Stats Cards Component
 * Displays stats cards for pangkat golongan data
 */
export const PangGolStatsCards = ({ stats }: PangGolStatsCardsProps) => {
  const panggolStats = stats as {
    juruMuda: number;
    juruMudaTk1: number;
    juru: number;
    juruTk1: number;
    pengaturMuda: number;
    pengaturMudaTk1: number;
    pengatur: number;
    pengaturTk1: number;
    penataMuda: number;
    penataMudaTk1: number;
    penata: number;
    penataTk1: number;
    pembina: number;
    pembinaTk1: number;
    pembinaUtamaMuda: number;
    pembinaUtamaMadya: number;
    pembinaUtama: number;
    belumPangkatGol: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-5 lg:grid-cols-9">
      <DosenStatsCard title="Juru Muda" value={panggolStats.juruMuda || 0} color="cyan" />
      <DosenStatsCard title="Juru Muda Tk. I" value={panggolStats.juruMudaTk1 || 0} color="blue" />
      <DosenStatsCard title="Juru" value={panggolStats.juru || 0} color="indigo" />
      <DosenStatsCard title="Juru Tk. I" value={panggolStats.juruTk1 || 0} color="violet" />
      <DosenStatsCard title="Pengatur Muda" value={panggolStats.pengaturMuda || 0} color="purple" />
      <DosenStatsCard title="Pengatur Muda Tk. I" value={panggolStats.pengaturMudaTk1 || 0} color="fuchsia" />
      <DosenStatsCard title="Pengatur" value={panggolStats.pengatur || 0} color="pink" />
      <DosenStatsCard title="Pengatur Tk. I" value={panggolStats.pengaturTk1 || 0} color="rose" />
      <DosenStatsCard title="Penata Muda" value={panggolStats.penataMuda || 0} color="green" />
      <DosenStatsCard title="Penata Muda Tk. I" value={panggolStats.penataMudaTk1 || 0} color="emerald" />
      <DosenStatsCard title="Penata" value={panggolStats.penata || 0} color="teal" />
      <DosenStatsCard title="Penata Tk. I" value={panggolStats.penataTk1 || 0} color="orange" />
      <DosenStatsCard title="Pembina" value={panggolStats.pembina || 0} color="amber" />
      <DosenStatsCard title="Pembina Tk. I" value={panggolStats.pembinaTk1 || 0} color="yellow" />
      <DosenStatsCard title="Pembina Utama Muda" value={panggolStats.pembinaUtamaMuda || 0} color="red" />
      <DosenStatsCard title="Pembina Utama Madya" value={panggolStats.pembinaUtamaMadya || 0} color="destructive" />
      <DosenStatsCard title="Pembina Utama" value={panggolStats.pembinaUtama || 0} color="slate" />
      <DosenStatsCard title="Belum Pangkat" value={panggolStats.belumPangkatGol || 0} color="gray" />
    </div>
  );
};

/**
 * Ikatan Kerja Stats Cards Component
 * Displays stats cards for ikatan kerja data
 */
export const IkatanKerjaStatsCards = ({ stats }: IkatanKerjaStatsCardsProps) => {
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
      <DosenStatsCard title="Dosen Tetap" value={ikatanKerjaStats.dosenTetap || 0} color="blue" />
      <DosenStatsCard title="PNS DPK" value={ikatanKerjaStats.dosenPnsDpk || 0} color="indigo" />
      <DosenStatsCard title="Dokter Pendidik Klinis" value={ikatanKerjaStats.dokterPendidikKlinis || 0} color="purple" />
      <DosenStatsCard title="Dosen Tetap BH" value={ikatanKerjaStats.dosenTetapBh || 0} color="teal" />
      <DosenStatsCard title="Dosen Tidak Tetap" value={ikatanKerjaStats.dosenTidakTetap || 0} color="green" />
      <DosenStatsCard title="P3K ASN" value={ikatanKerjaStats.p3kAsn || 0} color="cyan" />
      <DosenStatsCard title="Perjanjian Kerja" value={ikatanKerjaStats.dosenPerjanjianKerja || 0} color="pink" />
      <DosenStatsCard title="Instruktur" value={ikatanKerjaStats.instruktur || 0} color="amber" />
      <DosenStatsCard title="Tutor" value={ikatanKerjaStats.tutor || 0} color="orange" />
      <DosenStatsCard title="JFT" value={ikatanKerjaStats.jft || 0} color="red" />
      <DosenStatsCard title="Pengajar Nondosen" value={ikatanKerjaStats.pengajarNondosen || 0} color="blue" />
      <DosenStatsCard title="Tetap PKWTT" value={ikatanKerjaStats.dosenTetapPkWaktuTertentu || 0} color="purple" />
      <DosenStatsCard title="Belum Ikatan Kerja" value={ikatanKerjaStats.belumIkatanKerja || 0} color="orange" />
    </div>
  );
};

/**
 * Jenis Kelamin Stats Cards Component
 * Displays stats cards for jenis kelamin data
 */
export const JenisKelaminStatsCards = ({ stats }: JenisKelaminStatsCardsProps) => {
  const jenisKelaminStats = stats as {
    lakiLaki: number;
    perempuan: number;
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-2">
      <DosenStatsCard title="Laki-laki" value={jenisKelaminStats.lakiLaki || 0} color="blue" />
      <DosenStatsCard title="Perempuan" value={jenisKelaminStats.perempuan || 0} color="pink" />
    </div>
  );
};

/**
 * Status Kepegawaian Stats Cards Component
 * Displays stats cards for status kepegawaian data
 */
export const StatusKepegawaianStatsCards = ({ stats }: StatusKepegawaianStatsCardsProps) => {
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
      <DosenStatsCard title="PNS" value={statusKepegawaianStats.pns || 0} color="blue" />
      <DosenStatsCard title="CPNS" value={statusKepegawaianStats.cpns || 0} color="indigo" />
      <DosenStatsCard title="PPPK" value={statusKepegawaianStats.pppk || 0} color="purple" />
      <DosenStatsCard title="Non ASN" value={statusKepegawaianStats.nonAsn || 0} color="fuchsia" />
      <DosenStatsCard title="ASN JF Non Dosen" value={statusKepegawaianStats.asnJfNonDosen || 0} color="green" />
      <DosenStatsCard title="Dokter Pendidik Klinis" value={statusKepegawaianStats.dokterPendidikKlinis || 0} color="teal" />
      <DosenStatsCard title="Lainnya" value={statusKepegawaianStats.lainnya || 0} color="gray" />
    </div>
  );
};
