import type { TipeDataOption, DosenStats } from "./types";
import type { JabfungFakultas, JabfungProdi } from "@/lib/services/executive/jabfungService";
import type { JenjangFakultas, JenjangProdi } from "@/lib/services/executive/jenjangPendidikanService";
import type { PangkatGolonganFakultas, PangkatGolonganProdi } from "@/lib/services/executive/pangkatGolonganService";
import type { IkatanKerjaFakultas, IkatanKerjaProdi } from "@/lib/services/executive/ikatanKerjaService";
import type { JenisKelaminFakultas, JenisKelaminProdi } from "@/lib/services/executive/jenisKelaminService";
import type { StatusKepegawaianFakultas, StatusKepegawaianProdi } from "@/lib/services/executive/statusKepegawaianService";

// ========================================
// Chart Data Types
// ========================================

export type ChartDataItem =
  | { name: string; total: number }
  | {
      name: string;
      belum_jabfung: number;
      asisten_ahli: number;
      lektor: number;
      lektor_kepala: number;
      profesor: number;
    }
  | {
      name: string;
      d3: number;
      d4: number;
      s1: number;
      s2: number;
      s2_terapan: number;
      s3: number;
      profesi: number;
      sp1: number;
      sp2: number;
      belum_jenjang: number;
    }
  | {
      name: string;
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
    }
  | {
      name: string;
      dosen_tetap: number;
      dosen_pns_dpk: number;
      dokter_pendidik_klinis: number;
      dosen_tetap_bh: number;
      dosen_tidak_tetap: number;
      p3k_asn: number;
      dosen_perjanjian_kerja: number;
      instruktur: number;
      tutor: number;
      jft: number;
      pengajar_nondosen: number;
      dosen_tetap_pk_waktu_tertentu: number;
      belum_ikatan_kerja: number;
    }
  | {
      name: string;
      laki_laki: number;
      perempuan: number;
    }
  | {
      name: string;
      pns: number;
      cpns: number;
      pppk: number;
      non_asn: number;
      asn_jf_non_dosen: number;
      dokter_pendidik_klinis: number;
      lainnya: number;
    };

// ========================================
// Utils Functions
// ========================================

/**
 * Get chart data based on selection
 */
export const getChartData = (
  selectedTipeData: string,
  selectedProdi: string,
  selectedFakultas: string,
  jabfungProdiList: JabfungProdi[],
  jabfungFakultasList: JabfungFakultas[],
  jenjangProdiList: JenjangProdi[],
  jenjangFakultasList: JenjangFakultas[],
  panggolProdiList?: PangkatGolonganProdi[],
  panggolFakultasList?: PangkatGolonganFakultas[],
  ikatanKerjaProdiList?: IkatanKerjaProdi[],
  ikatanKerjaFakultasList?: IkatanKerjaFakultas[],
  jenisKelaminProdiList?: JenisKelaminProdi[],
  jenisKelaminFakultasList?: JenisKelaminFakultas[],
  statusKepegawaianProdiList?: StatusKepegawaianProdi[],
  statusKepegawaianFakultasList?: StatusKepegawaianFakultas[],
): ChartDataItem[] => {
  if (selectedTipeData === "jabfung") {
    // For jabfung data
    if (selectedProdi) {
      const prodi = jabfungProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            belum_jabfung: prodi.belum_jabfung,
            asisten_ahli: prodi.asisten_ahli,
            lektor: prodi.lektor,
            lektor_kepala: prodi.lektor_kepala,
            profesor: prodi.profesor,
          },
        ];
      }
    }

    if (selectedFakultas) {
      return jabfungProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        belum_jabfung: p.belum_jabfung,
        asisten_ahli: p.asisten_ahli,
        lektor: p.lektor,
        lektor_kepala: p.lektor_kepala,
        profesor: p.profesor,
      }));
    }

    return jabfungFakultasList.map((f) => ({
      name:
        f.nama_fakultas.substring(0, 20) +
        (f.nama_fakultas.length > 20 ? "..." : ""),
      belum_jabfung: f.belum_jabfung,
      asisten_ahli: f.asisten_ahli,
      lektor: f.lektor,
      lektor_kepala: f.lektor_kepala,
      profesor: f.profesor,
    }));
  }

  if (selectedTipeData === "jenjang_pendidikan") {
    // For jenjang pendidikan data - return bar/line chart format
    if (selectedProdi) {
      const prodi = jenjangProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            d3: prodi.d3,
            d4: prodi.d4,
            s1: prodi.s1,
            s2: prodi.s2,
            s2_terapan: prodi.s2_terapan,
            s3: prodi.s3,
            profesi: prodi.profesi,
            sp1: prodi.sp1,
            sp2: prodi.sp2,
            belum_jenjang: prodi.belum_jenjang,
          },
        ];
      }
    }

    if (selectedFakultas) {
      return jenjangProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        d3: p.d3,
        d4: p.d4,
        s1: p.s1,
        s2: p.s2,
        s2_terapan: p.s2_terapan,
        s3: p.s3,
        profesi: p.profesi,
        sp1: p.sp1,
        sp2: p.sp2,
        belum_jenjang: p.belum_jenjang,
      }));
    }

    return jenjangFakultasList.map((f) => ({
      name:
        f.nama_fakultas.substring(0, 20) +
        (f.nama_fakultas.length > 20 ? "..." : ""),
      d3: f.d3,
      d4: f.d4,
      s1: f.s1,
      s2: f.s2,
      s2_terapan: f.s2_terapan,
      s3: f.s3,
      profesi: f.profesi,
      sp1: f.sp1,
      sp2: f.sp2,
      belum_jenjang: f.belum_jenjang,
    }));
  }

  if (selectedTipeData === "pang_gol") {
    // For pangkat golongan data - return bar/line chart format
    if (selectedProdi && panggolProdiList) {
      const prodi = panggolProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            juru_muda: prodi.juru_muda,
            juru_muda_tk_1: prodi.juru_muda_tk_1,
            juru: prodi.juru,
            juru_tk_1: prodi.juru_tk_1,
            pengatur_muda: prodi.pengatur_muda,
            pengatur_muda_tk_1: prodi.pengatur_muda_tk_1,
            pengatur: prodi.pengatur,
            pengatur_tk_1: prodi.pengatur_tk_1,
            penata_muda: prodi.penata_muda,
            penata_muda_tk_1: prodi.penata_muda_tk_1,
            penata: prodi.penata,
            penata_tk_1: prodi.penata_tk_1,
            pembina: prodi.pembina,
            pembina_tk_1: prodi.pembina_tk_1,
            pembina_utama_muda: prodi.pembina_utama_muda,
            pembina_utama_madya: prodi.pembina_utama_madya,
            pembina_utama: prodi.pembina_utama,
            belum_pangkat_gol: prodi.belum_pangkat_gol,
          },
        ];
      }
    }

    if (selectedFakultas && panggolProdiList) {
      return panggolProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        juru_muda: p.juru_muda,
        juru_muda_tk_1: p.juru_muda_tk_1,
        juru: p.juru,
        juru_tk_1: p.juru_tk_1,
        pengatur_muda: p.pengatur_muda,
        pengatur_muda_tk_1: p.pengatur_muda_tk_1,
        pengatur: p.pengatur,
        pengatur_tk_1: p.pengatur_tk_1,
        penata_muda: p.penata_muda,
        penata_muda_tk_1: p.penata_muda_tk_1,
        penata: p.penata,
        penata_tk_1: p.penata_tk_1,
        pembina: p.pembina,
        pembina_tk_1: p.pembina_tk_1,
        pembina_utama_muda: p.pembina_utama_muda,
        pembina_utama_madya: p.pembina_utama_madya,
        pembina_utama: p.pembina_utama,
        belum_pangkat_gol: p.belum_pangkat_gol,
      }));
    }

    if (panggolFakultasList) {
      return panggolFakultasList.map((f) => ({
        name:
          f.nama_fakultas.substring(0, 20) +
          (f.nama_fakultas.length > 20 ? "..." : ""),
        juru_muda: f.juru_muda,
        juru_muda_tk_1: f.juru_muda_tk_1,
        juru: f.juru,
        juru_tk_1: f.juru_tk_1,
        pengatur_muda: f.pengatur_muda,
        pengatur_muda_tk_1: f.pengatur_muda_tk_1,
        pengatur: f.pengatur,
        pengatur_tk_1: f.pengatur_tk_1,
        penata_muda: f.penata_muda,
        penata_muda_tk_1: f.penata_muda_tk_1,
        penata: f.penata,
        penata_tk_1: f.penata_tk_1,
        pembina: f.pembina,
        pembina_tk_1: f.pembina_tk_1,
        pembina_utama_muda: f.pembina_utama_muda,
        pembina_utama_madya: f.pembina_utama_madya,
        pembina_utama: f.pembina_utama,
        belum_pangkat_gol: f.belum_pangkat_gol,
      }));
    }
  }

  if (selectedTipeData === "ikatan_kerja") {
    if (selectedProdi && ikatanKerjaProdiList) {
      const prodi = ikatanKerjaProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            dosen_tetap: prodi.dosen_tetap,
            dosen_pns_dpk: prodi.dosen_pns_dpk,
            dokter_pendidik_klinis: prodi.dokter_pendidik_klinis,
            dosen_tetap_bh: prodi.dosen_tetap_bh,
            dosen_tidak_tetap: prodi.dosen_tidak_tetap,
            p3k_asn: prodi.p3k_asn,
            dosen_perjanjian_kerja: prodi.dosen_perjanjian_kerja,
            instruktur: prodi.instruktur,
            tutor: prodi.tutor,
            jft: prodi.jft,
            pengajar_nondosen: prodi.pengajar_nondosen,
            dosen_tetap_pk_waktu_tertentu: prodi.dosen_tetap_pk_waktu_tertentu,
            belum_ikatan_kerja: prodi.belum_ikatan_kerja,
          },
        ];
      }
    }

    if (selectedFakultas && ikatanKerjaProdiList) {
      return ikatanKerjaProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        dosen_tetap: p.dosen_tetap,
        dosen_pns_dpk: p.dosen_pns_dpk,
        dokter_pendidik_klinis: p.dokter_pendidik_klinis,
        dosen_tetap_bh: p.dosen_tetap_bh,
        dosen_tidak_tetap: p.dosen_tidak_tetap,
        p3k_asn: p.p3k_asn,
        dosen_perjanjian_kerja: p.dosen_perjanjian_kerja,
        instruktur: p.instruktur,
        tutor: p.tutor,
        jft: p.jft,
        pengajar_nondosen: p.pengajar_nondosen,
        dosen_tetap_pk_waktu_tertentu: p.dosen_tetap_pk_waktu_tertentu,
        belum_ikatan_kerja: p.belum_ikatan_kerja,
      }));
    }

    if (ikatanKerjaFakultasList) {
      return ikatanKerjaFakultasList.map((f) => ({
        name:
          f.nama_fakultas.substring(0, 20) +
          (f.nama_fakultas.length > 20 ? "..." : ""),
        dosen_tetap: f.dosen_tetap,
        dosen_pns_dpk: f.dosen_pns_dpk,
        dokter_pendidik_klinis: f.dokter_pendidik_klinis,
        dosen_tetap_bh: f.dosen_tetap_bh,
        dosen_tidak_tetap: f.dosen_tidak_tetap,
        p3k_asn: f.p3k_asn,
        dosen_perjanjian_kerja: f.dosen_perjanjian_kerja,
        instruktur: f.instruktur,
        tutor: f.tutor,
        jft: f.jft,
        pengajar_nondosen: f.pengajar_nondosen,
        dosen_tetap_pk_waktu_tertentu: f.dosen_tetap_pk_waktu_tertentu,
        belum_ikatan_kerja: f.belum_ikatan_kerja,
      }));
    }
  }

  if (selectedTipeData === "jenis_kelamin") {
    if (selectedProdi && jenisKelaminProdiList) {
      const prodi = jenisKelaminProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            laki_laki: prodi.laki_laki,
            perempuan: prodi.perempuan,
          },
        ];
      }
    }

    if (selectedFakultas && jenisKelaminProdiList) {
      return jenisKelaminProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        laki_laki: p.laki_laki,
        perempuan: p.perempuan,
      }));
    }

    if (jenisKelaminFakultasList) {
      return jenisKelaminFakultasList.map((f) => ({
        name:
          f.nama_fakultas.substring(0, 20) +
          (f.nama_fakultas.length > 20 ? "..." : ""),
        laki_laki: f.laki_laki,
        perempuan: f.perempuan,
      }));
    }
  }

  if (selectedTipeData === "status_pegawai") {
    if (selectedProdi && statusKepegawaianProdiList) {
      const prodi = statusKepegawaianProdiList.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name:
              prodi.nama_prodi.substring(0, 20) +
              (prodi.nama_prodi.length > 20 ? "..." : ""),
            pns: prodi.pns,
            cpns: prodi.cpns,
            pppk: prodi.pppk,
            non_asn: prodi.non_asn,
            asn_jf_non_dosen: prodi.asn_jf_non_dosen,
            dokter_pendidik_klinis: prodi.dokter_pendidik_klinis,
            lainnya: prodi.lainnya,
          },
        ];
      }
    }

    if (selectedFakultas && statusKepegawaianProdiList) {
      return statusKepegawaianProdiList.map((p) => ({
        name:
          p.nama_prodi.substring(0, 20) +
          (p.nama_prodi.length > 20 ? "..." : ""),
        pns: p.pns,
        cpns: p.cpns,
        pppk: p.pppk,
        non_asn: p.non_asn,
        asn_jf_non_dosen: p.asn_jf_non_dosen,
        dokter_pendidik_klinis: p.dokter_pendidik_klinis,
        lainnya: p.lainnya,
      }));
    }

    if (statusKepegawaianFakultasList) {
      return statusKepegawaianFakultasList.map((f) => ({
        name:
          f.nama_fakultas.substring(0, 20) +
          (f.nama_fakultas.length > 20 ? "..." : ""),
        pns: f.pns,
        cpns: f.cpns,
        pppk: f.pppk,
        non_asn: f.non_asn,
        asn_jf_non_dosen: f.asn_jf_non_dosen,
        dokter_pendidik_klinis: f.dokter_pendidik_klinis,
        lainnya: f.lainnya,
      }));
    }
  }

  return [];
};

/**
 * Get stats based on selection
 */
export const getStats = (
  selectedTipeData: string,
  selectedProdi: string,
  selectedFakultas: string,
  jabfungProdiList: JabfungProdi[],
  jabfungFakultasList: JabfungFakultas[],
  jenjangProdiList: JenjangProdi[],
  jenjangFakultasList: JenjangFakultas[],
  panggolProdiList?: PangkatGolonganProdi[],
  panggolFakultasList?: PangkatGolonganFakultas[],
  ikatanKerjaProdiList?: IkatanKerjaProdi[],
  ikatanKerjaFakultasList?: IkatanKerjaFakultas[],
  jenisKelaminProdiList?: JenisKelaminProdi[],
  jenisKelaminFakultasList?: JenisKelaminFakultas[],
  statusKepegawaianProdiList?: StatusKepegawaianProdi[],
  statusKepegawaianFakultasList?: StatusKepegawaianFakultas[],
): DosenStats => {
  if (selectedTipeData === "jabfung") {
    if (selectedProdi) {
      const prodi = jabfungProdiList?.find((p) => p.id === selectedProdi);
      return {
        belumJabfung: prodi?.belum_jabfung || 0,
        asistenAhli: prodi?.asisten_ahli || 0,
        lektor: prodi?.lektor || 0,
        lektorKepala: prodi?.lektor_kepala || 0,
        profesor: prodi?.profesor || 0,
      };
    }

    if (selectedFakultas) {
      return (jabfungProdiList || []).reduce(
        (sum, p) => ({
          belumJabfung: sum.belumJabfung + p.belum_jabfung,
          asistenAhli: sum.asistenAhli + p.asisten_ahli,
          lektor: sum.lektor + p.lektor,
          lektorKepala: sum.lektorKepala + p.lektor_kepala,
          profesor: sum.profesor + p.profesor,
        }),
        {
          belumJabfung: 0,
          asistenAhli: 0,
          lektor: 0,
          lektorKepala: 0,
          profesor: 0,
        },
      );
    }

    return jabfungFakultasList.reduce(
      (sum, f) => ({
        belumJabfung: sum.belumJabfung + f.belum_jabfung,
        asistenAhli: sum.asistenAhli + f.asisten_ahli,
        lektor: sum.lektor + f.lektor,
        lektorKepala: sum.lektorKepala + f.lektor_kepala,
        profesor: sum.profesor + f.profesor,
      }),
      {
        belumJabfung: 0,
        asistenAhli: 0,
        lektor: 0,
        lektorKepala: 0,
        profesor: 0,
      },
    );
  }

  if (selectedTipeData === "jenjang_pendidikan") {
    if (selectedProdi) {
      const prodi = jenjangProdiList?.find((p) => p.id === selectedProdi);
      return {
        d3: prodi?.d3 || 0,
        d4: prodi?.d4 || 0,
        s1: prodi?.s1 || 0,
        s2: prodi?.s2 || 0,
        s2_terapan: prodi?.s2_terapan || 0,
        s3: prodi?.s3 || 0,
        profesi: prodi?.profesi || 0,
        sp1: prodi?.sp1 || 0,
        sp2: prodi?.sp2 || 0,
        belumJenjang: prodi?.belum_jenjang || 0,
      };
    }

    if (selectedFakultas) {
      return (jenjangProdiList || []).reduce(
        (sum, p) => ({
          d3: sum.d3 + p.d3,
          d4: sum.d4 + p.d4,
          s1: sum.s1 + p.s1,
          s2: sum.s2 + p.s2,
          s2_terapan: sum.s2_terapan + p.s2_terapan,
          s3: sum.s3 + p.s3,
          profesi: sum.profesi + p.profesi,
          sp1: sum.sp1 + p.sp1,
          sp2: sum.sp2 + p.sp2,
          belumJenjang: sum.belumJenjang + p.belum_jenjang,
        }),
        {
          d3: 0,
          d4: 0,
          s1: 0,
          s2: 0,
          s2_terapan: 0,
          s3: 0,
          profesi: 0,
          sp1: 0,
          sp2: 0,
          belumJenjang: 0,
        },
      );
    }

    return jenjangFakultasList.reduce(
      (sum, f) => ({
        d3: sum.d3 + f.d3,
        d4: sum.d4 + f.d4,
        s1: sum.s1 + f.s1,
        s2: sum.s2 + f.s2,
        s2_terapan: sum.s2_terapan + f.s2_terapan,
        s3: sum.s3 + f.s3,
        profesi: sum.profesi + f.profesi,
        sp1: sum.sp1 + f.sp1,
        sp2: sum.sp2 + f.sp2,
        belumJenjang: sum.belumJenjang + f.belum_jenjang,
      }),
      {
        d3: 0,
        d4: 0,
        s1: 0,
        s2: 0,
        s2_terapan: 0,
        s3: 0,
        profesi: 0,
        sp1: 0,
        sp2: 0,
        belumJenjang: 0,
      },
    );
  }

  if (selectedTipeData === "pang_gol") {
    if (selectedProdi && panggolProdiList) {
      const prodi = panggolProdiList?.find((p) => p.id === selectedProdi);
      return {
        juruMuda: prodi?.juru_muda || 0,
        juruMudaTk1: prodi?.juru_muda_tk_1 || 0,
        juru: prodi?.juru || 0,
        juruTk1: prodi?.juru_tk_1 || 0,
        pengaturMuda: prodi?.pengatur_muda || 0,
        pengaturMudaTk1: prodi?.pengatur_muda_tk_1 || 0,
        pengatur: prodi?.pengatur || 0,
        pengaturTk1: prodi?.pengatur_tk_1 || 0,
        penataMuda: prodi?.penata_muda || 0,
        penataMudaTk1: prodi?.penata_muda_tk_1 || 0,
        penata: prodi?.penata || 0,
        penataTk1: prodi?.penata_tk_1 || 0,
        pembina: prodi?.pembina || 0,
        pembinaTk1: prodi?.pembina_tk_1 || 0,
        pembinaUtamaMuda: prodi?.pembina_utama_muda || 0,
        pembinaUtamaMadya: prodi?.pembina_utama_madya || 0,
        pembinaUtama: prodi?.pembina_utama || 0,
        belumPangkatGol: prodi?.belum_pangkat_gol || 0,
      };
    }

    if (selectedFakultas && panggolProdiList) {
      return (panggolProdiList || []).reduce(
        (sum, p) => ({
          juruMuda: sum.juruMuda + p.juru_muda,
          juruMudaTk1: sum.juruMudaTk1 + p.juru_muda_tk_1,
          juru: sum.juru + p.juru,
          juruTk1: sum.juruTk1 + p.juru_tk_1,
          pengaturMuda: sum.pengaturMuda + p.pengatur_muda,
          pengaturMudaTk1: sum.pengaturMudaTk1 + p.pengatur_muda_tk_1,
          pengatur: sum.pengatur + p.pengatur,
          pengaturTk1: sum.pengaturTk1 + p.pengatur_tk_1,
          penataMuda: sum.penataMuda + p.penata_muda,
          penataMudaTk1: sum.penataMudaTk1 + p.penata_muda_tk_1,
          penata: sum.penata + p.penata,
          penataTk1: sum.penataTk1 + p.penata_tk_1,
          pembina: sum.pembina + p.pembina,
          pembinaTk1: sum.pembinaTk1 + p.pembina_tk_1,
          pembinaUtamaMuda: sum.pembinaUtamaMuda + p.pembina_utama_muda,
          pembinaUtamaMadya: sum.pembinaUtamaMadya + p.pembina_utama_madya,
          pembinaUtama: sum.pembinaUtama + p.pembina_utama,
          belumPangkatGol: sum.belumPangkatGol + p.belum_pangkat_gol,
        }),
        {
          juruMuda: 0,
          juruMudaTk1: 0,
          juru: 0,
          juruTk1: 0,
          pengaturMuda: 0,
          pengaturMudaTk1: 0,
          pengatur: 0,
          pengaturTk1: 0,
          penataMuda: 0,
          penataMudaTk1: 0,
          penata: 0,
          penataTk1: 0,
          pembina: 0,
          pembinaTk1: 0,
          pembinaUtamaMuda: 0,
          pembinaUtamaMadya: 0,
          pembinaUtama: 0,
          belumPangkatGol: 0,
        },
      );
    }

    if (panggolFakultasList) {
      return panggolFakultasList.reduce(
        (sum, f) => ({
          juruMuda: sum.juruMuda + f.juru_muda,
          juruMudaTk1: sum.juruMudaTk1 + f.juru_muda_tk_1,
          juru: sum.juru + f.juru,
          juruTk1: sum.juruTk1 + f.juru_tk_1,
          pengaturMuda: sum.pengaturMuda + f.pengatur_muda,
          pengaturMudaTk1: sum.pengaturMudaTk1 + f.pengatur_muda_tk_1,
          pengatur: sum.pengatur + f.pengatur,
          pengaturTk1: sum.pengaturTk1 + f.pengatur_tk_1,
          penataMuda: sum.penataMuda + f.penata_muda,
          penataMudaTk1: sum.penataMudaTk1 + f.penata_muda_tk_1,
          penata: sum.penata + f.penata,
          penataTk1: sum.penataTk1 + f.penata_tk_1,
          pembina: sum.pembina + f.pembina,
          pembinaTk1: sum.pembinaTk1 + f.pembina_tk_1,
          pembinaUtamaMuda: sum.pembinaUtamaMuda + f.pembina_utama_muda,
          pembinaUtamaMadya: sum.pembinaUtamaMadya + f.pembina_utama_madya,
          pembinaUtama: sum.pembinaUtama + f.pembina_utama,
          belumPangkatGol: sum.belumPangkatGol + f.belum_pangkat_gol,
        }),
        {
          juruMuda: 0,
          juruMudaTk1: 0,
          juru: 0,
          juruTk1: 0,
          pengaturMuda: 0,
          pengaturMudaTk1: 0,
          pengatur: 0,
          pengaturTk1: 0,
          penataMuda: 0,
          penataMudaTk1: 0,
          penata: 0,
          penataTk1: 0,
          pembina: 0,
          pembinaTk1: 0,
          pembinaUtamaMuda: 0,
          pembinaUtamaMadya: 0,
          pembinaUtama: 0,
          belumPangkatGol: 0,
        },
      );
    }
  }

  if (selectedTipeData === "ikatan_kerja") {
    if (selectedProdi && ikatanKerjaProdiList) {
      const prodi = ikatanKerjaProdiList.find((p) => p.id === selectedProdi);
      return {
        dosenTetap: prodi?.dosen_tetap || 0,
        dosenPnsDpk: prodi?.dosen_pns_dpk || 0,
        dokterPendidikKlinis: prodi?.dokter_pendidik_klinis || 0,
        dosenTetapBh: prodi?.dosen_tetap_bh || 0,
        dosenTidakTetap: prodi?.dosen_tidak_tetap || 0,
        p3kAsn: prodi?.p3k_asn || 0,
        dosenPerjanjianKerja: prodi?.dosen_perjanjian_kerja || 0,
        instruktur: prodi?.instruktur || 0,
        tutor: prodi?.tutor || 0,
        jft: prodi?.jft || 0,
        pengajarNondosen: prodi?.pengajar_nondosen || 0,
        dosenTetapPkWaktuTertentu: prodi?.dosen_tetap_pk_waktu_tertentu || 0,
        belumIkatanKerja: prodi?.belum_ikatan_kerja || 0,
      };
    }

    if (selectedFakultas && ikatanKerjaProdiList) {
      return ikatanKerjaProdiList.reduce(
        (sum, p) => ({
          dosenTetap: sum.dosenTetap + p.dosen_tetap,
          dosenPnsDpk: sum.dosenPnsDpk + p.dosen_pns_dpk,
          dokterPendidikKlinis: sum.dokterPendidikKlinis + p.dokter_pendidik_klinis,
          dosenTetapBh: sum.dosenTetapBh + p.dosen_tetap_bh,
          dosenTidakTetap: sum.dosenTidakTetap + p.dosen_tidak_tetap,
          p3kAsn: sum.p3kAsn + p.p3k_asn,
          dosenPerjanjianKerja: sum.dosenPerjanjianKerja + p.dosen_perjanjian_kerja,
          instruktur: sum.instruktur + p.instruktur,
          tutor: sum.tutor + p.tutor,
          jft: sum.jft + p.jft,
          pengajarNondosen: sum.pengajarNondosen + p.pengajar_nondosen,
          dosenTetapPkWaktuTertentu: sum.dosenTetapPkWaktuTertentu + p.dosen_tetap_pk_waktu_tertentu,
          belumIkatanKerja: sum.belumIkatanKerja + p.belum_ikatan_kerja,
        }),
        {
          dosenTetap: 0,
          dosenPnsDpk: 0,
          dokterPendidikKlinis: 0,
          dosenTetapBh: 0,
          dosenTidakTetap: 0,
          p3kAsn: 0,
          dosenPerjanjianKerja: 0,
          instruktur: 0,
          tutor: 0,
          jft: 0,
          pengajarNondosen: 0,
          dosenTetapPkWaktuTertentu: 0,
          belumIkatanKerja: 0,
        },
      );
    }

    if (ikatanKerjaFakultasList) {
      return ikatanKerjaFakultasList.reduce(
        (sum, f) => ({
          dosenTetap: sum.dosenTetap + f.dosen_tetap,
          dosenPnsDpk: sum.dosenPnsDpk + f.dosen_pns_dpk,
          dokterPendidikKlinis: sum.dokterPendidikKlinis + f.dokter_pendidik_klinis,
          dosenTetapBh: sum.dosenTetapBh + f.dosen_tetap_bh,
          dosenTidakTetap: sum.dosenTidakTetap + f.dosen_tidak_tetap,
          p3kAsn: sum.p3kAsn + f.p3k_asn,
          dosenPerjanjianKerja: sum.dosenPerjanjianKerja + f.dosen_perjanjian_kerja,
          instruktur: sum.instruktur + f.instruktur,
          tutor: sum.tutor + f.tutor,
          jft: sum.jft + f.jft,
          pengajarNondosen: sum.pengajarNondosen + f.pengajar_nondosen,
          dosenTetapPkWaktuTertentu: sum.dosenTetapPkWaktuTertentu + f.dosen_tetap_pk_waktu_tertentu,
          belumIkatanKerja: sum.belumIkatanKerja + f.belum_ikatan_kerja,
        }),
        {
          dosenTetap: 0,
          dosenPnsDpk: 0,
          dokterPendidikKlinis: 0,
          dosenTetapBh: 0,
          dosenTidakTetap: 0,
          p3kAsn: 0,
          dosenPerjanjianKerja: 0,
          instruktur: 0,
          tutor: 0,
          jft: 0,
          pengajarNondosen: 0,
          dosenTetapPkWaktuTertentu: 0,
          belumIkatanKerja: 0,
        },
      );
    }
  }

  if (selectedTipeData === "jenis_kelamin") {
    if (selectedProdi && jenisKelaminProdiList) {
      const prodi = jenisKelaminProdiList.find((p) => p.id === selectedProdi);
      return {
        lakiLaki: prodi?.laki_laki || 0,
        perempuan: prodi?.perempuan || 0,
      };
    }

    if (selectedFakultas && jenisKelaminProdiList) {
      return jenisKelaminProdiList.reduce(
        (sum, p) => ({
          lakiLaki: sum.lakiLaki + p.laki_laki,
          perempuan: sum.perempuan + p.perempuan,
        }),
        {
          lakiLaki: 0,
          perempuan: 0,
        },
      );
    }

    if (jenisKelaminFakultasList) {
      return jenisKelaminFakultasList.reduce(
        (sum, f) => ({
          lakiLaki: sum.lakiLaki + f.laki_laki,
          perempuan: sum.perempuan + f.perempuan,
        }),
        {
          lakiLaki: 0,
          perempuan: 0,
        },
      );
    }
  }

  if (selectedTipeData === "status_pegawai") {
    if (selectedProdi && statusKepegawaianProdiList) {
      const prodi = statusKepegawaianProdiList.find((p) => p.id === selectedProdi);
      return {
        pns: prodi?.pns || 0,
        cpns: prodi?.cpns || 0,
        pppk: prodi?.pppk || 0,
        nonAsn: prodi?.non_asn || 0,
        asnJfNonDosen: prodi?.asn_jf_non_dosen || 0,
        dokterPendidikKlinis: prodi?.dokter_pendidik_klinis || 0,
        lainnya: prodi?.lainnya || 0,
      };
    }

    if (selectedFakultas && statusKepegawaianProdiList) {
      return statusKepegawaianProdiList.reduce(
        (sum, p) => ({
          pns: sum.pns + p.pns,
          cpns: sum.cpns + p.cpns,
          pppk: sum.pppk + p.pppk,
          nonAsn: sum.nonAsn + p.non_asn,
          asnJfNonDosen: sum.asnJfNonDosen + p.asn_jf_non_dosen,
          dokterPendidikKlinis: sum.dokterPendidikKlinis + p.dokter_pendidik_klinis,
          lainnya: sum.lainnya + p.lainnya,
        }),
        {
          pns: 0,
          cpns: 0,
          pppk: 0,
          nonAsn: 0,
          asnJfNonDosen: 0,
          dokterPendidikKlinis: 0,
          lainnya: 0,
        },
      );
    }

    if (statusKepegawaianFakultasList) {
      return statusKepegawaianFakultasList.reduce(
        (sum, f) => ({
          pns: sum.pns + f.pns,
          cpns: sum.cpns + f.cpns,
          pppk: sum.pppk + f.pppk,
          nonAsn: sum.nonAsn + f.non_asn,
          asnJfNonDosen: sum.asnJfNonDosen + f.asn_jf_non_dosen,
          dokterPendidikKlinis: sum.dokterPendidikKlinis + f.dokter_pendidik_klinis,
          lainnya: sum.lainnya + f.lainnya,
        }),
        {
          pns: 0,
          cpns: 0,
          pppk: 0,
          nonAsn: 0,
          asnJfNonDosen: 0,
          dokterPendidikKlinis: 0,
          lainnya: 0,
        },
      );
    }
  }

  // Default stats for jabfung
  return {
    belumJabfung: 0,
    asistenAhli: 0,
    lektor: 0,
    lektorKepala: 0,
    profesor: 0,
  };
};

/**
 * Get current tipe data option from TipeDataOptions
 */
export const getCurrentTipeDataOption = (
  selectedTipeData: string,
  tipeDataOptions: TipeDataOption[],
): TipeDataOption | undefined => {
  return tipeDataOptions.find((opt) => opt.value === selectedTipeData);
};

/**
 * Get chart title based on selection
 */
export const getChartTitle = (
  selectedTipeData: string,
  selectedProdi: string,
  selectedFakultas: string,
  prodiList: Array<{ id: string; nama_prodi: string }>,
  fakultasList: Array<{ id: string; nama_fakultas: string }>,
  tipeDataOptions: TipeDataOption[],
): string => {
  const tipeOption = tipeDataOptions.find((opt) => opt.value === selectedTipeData);
  if (!tipeOption) return "Grafik Data Dosen";

  let title = `Grafik ${tipeOption.label}`;
  if (selectedProdi) {
    const prodi = prodiList.find((p) => p.id === selectedProdi);
    title += ` - ${prodi?.nama_prodi || ""}`;
  } else if (selectedFakultas) {
    const fakultas = fakultasList.find((f) => f.id === selectedFakultas);
    title += ` - ${fakultas?.nama_fakultas || ""}`;
  }
  return title;
};

/**
 * Get chart subtitle based on selection
 */
export const getChartSubtitle = (
  selectedTahunAjaran: string,
  tahunAjaranList: Array<{ id_thn_ajaran: string; nm_thn_ajaran: string }>,
): string => {
  if (selectedTahunAjaran) {
    const tahun = tahunAjaranList.find(
      (t) => t.id_thn_ajaran === selectedTahunAjaran,
    );
    return tahun?.nm_thn_ajaran || "";
  }
  return "";
};
