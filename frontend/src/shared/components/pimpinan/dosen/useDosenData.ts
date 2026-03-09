import { useQuery } from "@tanstack/react-query";
import { executiveJabfungService } from "@/lib/services/executive/jabfungService";
import { executiveJenjangPendidikanService } from "@/lib/services/executive/jenjangPendidikanService";
import { executivePangkatGolonganService } from "@/lib/services/executive/pangkatGolonganService";
import { executiveIkatanKerjaService } from "@/lib/services/executive/ikatanKerjaService";
import { executiveJenisKelaminService } from "@/lib/services/executive/jenisKelaminService";
import { executiveStatusKepegawaianService } from "@/lib/services/executive/statusKepegawaianService";

// ========================================
// Types
// ========================================

export interface UseDosenDataParams {
  selectedTipeData: string;
  selectedTahunAjaran: string;
  selectedFakultas: string;
  selectedProdi: string;
  userContext?: {
    id_organisasi: string;
    level_organisasi: number;
    id_induk_organisasi: string;
  } | null;
}

// ========================================
// Hooks
// ========================================

/**
 * Custom hook for fetching dosen data
 * Handles all the data fetching for jabfung, jenjang pendidikan, and pangkat golongan
 */
export const useDosenData = ({
  selectedTipeData,
  selectedTahunAjaran,
  selectedFakultas,
  selectedProdi,
  userContext,
}: UseDosenDataParams) => {
  // Fetch tahun ajaran list
  const { data: tahunAjaranList = [], isLoading: isLoadingTahunAjaran } =
    useQuery({
      queryKey: ["dosen", "tahun-ajaran"],
      queryFn: () => executiveJabfungService.getTahunAjaranList(),
    });

  // Fetch fakultas list (independent, not dependent on tipe data)
  const { data: fakultasList = [], isLoading: isLoadingFakultas } = useQuery({
    queryKey: ["dosen", "fakultas"],
    queryFn: () => executiveJabfungService.getFakultasList(),
  });

  // Fetch prodi list
  const { data: prodiList = [], isLoading: isLoadingProdi } = useQuery({
    queryKey: ["dosen", "prodi", selectedFakultas],
    queryFn: () =>
      executiveJabfungService.getProdiList({
        fakultas_id: selectedFakultas,
      }),
    enabled: !!selectedFakultas,
  });

  // Fetch jabfung fakultas data
  const {
    data: jabfungFakultasList = [],
    isLoading: isLoadingJabfungFakultas,
  } = useQuery({
    queryKey: ["dosen", "jabfung", "fakultas", selectedTahunAjaran, userContext?.id_organisasi],
    queryFn: () =>
      executiveJabfungService.getJabfungFakultas({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi === 4 ? userContext.id_organisasi : undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jabfung",
  });

  // Fetch jabfung prodi data
  const {
    data: jabfungProdiList = [],
    isLoading: isLoadingJabfungProdi,
  } = useQuery({
    queryKey: [
      "dosen",
      "jabfung",
      "prodi",
      selectedFakultas,
      selectedTahunAjaran,
    ],
    queryFn: () =>
      executiveJabfungService.getJabfungProdi({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled:
      !!selectedFakultas &&
      !!selectedTahunAjaran &&
      selectedTipeData === "jabfung",
  });

  // Fetch jabfung fakultas historical data (5 years)
  const {
    data: jabfungFakultasHistorical = [],
    isLoading: isLoadingJabfungFakultasHistorical,
  } = useQuery({
    queryKey: ["dosen", "jabfung", "fakultas", "historical", selectedTahunAjaran, userContext?.id_organisasi, selectedFakultas],
    queryFn: () =>
      executiveJabfungService.getJabfungFakultasHistorical({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4
          ? userContext.id_organisasi
          : selectedFakultas || undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jabfung",
  });

  // Fetch jabfung prodi historical data (5 years)
  const {
    data: jabfungProdiHistorical = [],
    isLoading: isLoadingJabfungProdiHistorical,
  } = useQuery({
    queryKey: ["dosen", "jabfung", "prodi", "historical", selectedFakultas, selectedTahunAjaran, selectedProdi],
    queryFn: () =>
      executiveJabfungService.getJabfungProdiHistorical({
        fakultas_id: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
        prodi_id: selectedProdi || undefined,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran && selectedTipeData === "jabfung",
  });

  // Fetch jenjang pendidikan fakultas data
  const {
    data: jenjangFakultasList = [],
    isLoading: isLoadingJenjangFakultas,
  } = useQuery({
    queryKey: ["dosen", "jenjang", "fakultas", selectedTahunAjaran, userContext?.id_organisasi],
    queryFn: () =>
      executiveJenjangPendidikanService.getJenjangFakultas({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4 ? userContext.id_organisasi : undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jenjang_pendidikan",
  });

  // Fetch jenjang pendidikan prodi data
  const {
    data: jenjangProdiList = [],
    isLoading: isLoadingJenjangProdi,
  } = useQuery({
    queryKey: [
      "dosen",
      "jenjang",
      "prodi",
      selectedFakultas,
      selectedTahunAjaran,
    ],
    queryFn: () =>
      executiveJenjangPendidikanService.getJenjangProdi({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled:
      !!selectedFakultas &&
      !!selectedTahunAjaran &&
      selectedTipeData === "jenjang_pendidikan",
  });

  // Fetch jenjang pendidikan fakultas historical data (5 years)
  const {
    data: jenjangFakultasHistorical = [],
    isLoading: isLoadingJenjangFakultasHistorical,
  } = useQuery({
    queryKey: ["dosen", "jenjang", "fakultas", "historical", selectedTahunAjaran, userContext?.id_organisasi, selectedFakultas],
    queryFn: () =>
      executiveJenjangPendidikanService.getJenjangFakultasHistorical({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4
          ? userContext.id_organisasi
          : selectedFakultas || undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jenjang_pendidikan",
  });

  // Fetch jenjang pendidikan prodi historical data (5 years)
  const {
    data: jenjangProdiHistorical = [],
    isLoading: isLoadingJenjangProdiHistorical,
  } = useQuery({
    queryKey: ["dosen", "jenjang", "prodi", "historical", selectedFakultas, selectedTahunAjaran, selectedProdi],
    queryFn: () =>
      executiveJenjangPendidikanService.getJenjangProdiHistorical({
        fakultas_id: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
        prodi_id: selectedProdi || undefined,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran && selectedTipeData === "jenjang_pendidikan",
  });

  // Fetch pangkat golongan fakultas data
  const {
    data: panggolFakultasList = [],
    isLoading: isLoadingPanggolFakultas,
  } = useQuery({
    queryKey: ["dosen", "panggol", "fakultas", selectedTahunAjaran, userContext?.id_organisasi],
    queryFn: () =>
      executivePangkatGolonganService.getPangkatGolonganFakultas({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4 ? userContext.id_organisasi : undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "pang_gol",
  });

  // Fetch pangkat golongan prodi data
  const {
    data: panggolProdiList = [],
    isLoading: isLoadingPanggolProdi,
  } = useQuery({
    queryKey: [
      "dosen",
      "panggol",
      "prodi",
      selectedFakultas,
      selectedTahunAjaran,
    ],
    queryFn: () =>
      executivePangkatGolonganService.getPangkatGolonganProdi({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled:
      !!selectedFakultas &&
      !!selectedTahunAjaran &&
      selectedTipeData === "pang_gol",
  });

  // Fetch pangkat golongan fakultas historical data (5 years)
  const {
    data: panggolFakultasHistorical = [],
    isLoading: isLoadingPanggolFakultasHistorical,
  } = useQuery({
    queryKey: ["dosen", "panggol", "fakultas", "historical", selectedTahunAjaran, userContext?.id_organisasi, selectedFakultas],
    queryFn: () =>
      executivePangkatGolonganService.getPangkatGolonganFakultasHistorical({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4
          ? userContext.id_organisasi
          : selectedFakultas || undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "pang_gol",
  });

  // Fetch pangkat golongan prodi historical data (5 years)
  const {
    data: panggolProdiHistorical = [],
    isLoading: isLoadingPanggolProdiHistorical,
  } = useQuery({
    queryKey: ["dosen", "panggol", "prodi", "historical", selectedFakultas, selectedTahunAjaran, selectedProdi],
    queryFn: () =>
      executivePangkatGolonganService.getPangkatGolonganProdiHistorical({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
        prodi_id: selectedProdi || undefined,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran && selectedTipeData === "pang_gol",
  });

  // Fetch ikatan kerja fakultas data
  const {
    data: ikatanKerjaFakultasList = [],
    isLoading: isLoadingIkatanKerjaFakultas,
  } = useQuery({
    queryKey: ["dosen", "ikatan-kerja", "fakultas", selectedTahunAjaran, userContext?.id_organisasi],
    queryFn: () =>
      executiveIkatanKerjaService.getIkatanKerjaFakultas({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4 ? userContext.id_organisasi : undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "ikatan_kerja",
  });

  // Fetch ikatan kerja prodi data
  const {
    data: ikatanKerjaProdiList = [],
    isLoading: isLoadingIkatanKerjaProdi,
  } = useQuery({
    queryKey: [
      "dosen",
      "ikatan-kerja",
      "prodi",
      selectedFakultas,
      selectedTahunAjaran,
    ],
    queryFn: () =>
      executiveIkatanKerjaService.getIkatanKerjaProdi({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled:
      !!selectedFakultas &&
      !!selectedTahunAjaran &&
      selectedTipeData === "ikatan_kerja",
  });

  // Fetch ikatan kerja fakultas historical data (5 years)
  const {
    data: ikatanKerjaFakultasHistorical = [],
    isLoading: isLoadingIkatanKerjaFakultasHistorical,
  } = useQuery({
    queryKey: ["dosen", "ikatan-kerja", "fakultas", "historical", selectedTahunAjaran, userContext?.id_organisasi, selectedFakultas],
    queryFn: () =>
      executiveIkatanKerjaService.getIkatanKerjaFakultasHistorical({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4
          ? userContext.id_organisasi
          : selectedFakultas || undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "ikatan_kerja",
  });

  // Fetch ikatan kerja prodi historical data (5 years)
  const {
    data: ikatanKerjaProdiHistorical = [],
    isLoading: isLoadingIkatanKerjaProdiHistorical,
  } = useQuery({
    queryKey: ["dosen", "ikatan-kerja", "prodi", "historical", selectedFakultas, selectedTahunAjaran, selectedProdi],
    queryFn: () =>
      executiveIkatanKerjaService.getIkatanKerjaProdiHistorical({
        fakultas_id: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
        prodi_id: selectedProdi || undefined,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran && selectedTipeData === "ikatan_kerja",
  });

  // Fetch jenis kelamin fakultas data
  const {
    data: jenisKelaminFakultasList = [],
    isLoading: isLoadingJenisKelaminFakultas,
  } = useQuery({
    queryKey: ["dosen", "jenis-kelamin", "fakultas", selectedTahunAjaran, userContext?.id_organisasi],
    queryFn: () =>
      executiveJenisKelaminService.getJenisKelaminFakultas({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4 ? userContext.id_organisasi : undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jenis_kelamin",
  });

  // Fetch jenis kelamin prodi data
  const {
    data: jenisKelaminProdiList = [],
    isLoading: isLoadingJenisKelaminProdi,
  } = useQuery({
    queryKey: [
      "dosen",
      "jenis-kelamin",
      "prodi",
      selectedFakultas,
      selectedTahunAjaran,
    ],
    queryFn: () =>
      executiveJenisKelaminService.getJenisKelaminProdi({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled:
      !!selectedFakultas &&
      !!selectedTahunAjaran &&
      selectedTipeData === "jenis_kelamin",
  });

  // Fetch jenis kelamin fakultas historical data (5 years)
  const {
    data: jenisKelaminFakultasHistorical = [],
    isLoading: isLoadingJenisKelaminFakultasHistorical,
  } = useQuery({
    queryKey: ["dosen", "jenis-kelamin", "fakultas", "historical", selectedTahunAjaran, userContext?.id_organisasi, selectedFakultas],
    queryFn: () =>
      executiveJenisKelaminService.getJenisKelaminFakultasHistorical({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4
          ? userContext.id_organisasi
          : selectedFakultas || undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jenis_kelamin",
  });

  // Fetch jenis kelamin prodi historical data (5 years)
  const {
    data: jenisKelaminProdiHistorical = [],
    isLoading: isLoadingJenisKelaminProdiHistorical,
  } = useQuery({
    queryKey: ["dosen", "jenis-kelamin", "prodi", "historical", selectedFakultas, selectedTahunAjaran, selectedProdi],
    queryFn: () =>
      executiveJenisKelaminService.getJenisKelaminProdiHistorical({
        fakultas_id: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
        prodi_id: selectedProdi || undefined,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran && selectedTipeData === "jenis_kelamin",
  });

  // Fetch status kepegawaian fakultas data
  const {
    data: statusKepegawaianFakultasList = [],
    isLoading: isLoadingStatusKepegawaianFakultas,
  } = useQuery({
    queryKey: ["dosen", "status-kepegawaian", "fakultas", selectedTahunAjaran, userContext?.id_organisasi],
    queryFn: () =>
      executiveStatusKepegawaianService.getStatusKepegawaianFakultas({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4 ? userContext.id_organisasi : undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "status_pegawai",
  });

  // Fetch status kepegawaian prodi data
  const {
    data: statusKepegawaianProdiList = [],
    isLoading: isLoadingStatusKepegawaianProdi,
  } = useQuery({
    queryKey: [
      "dosen",
      "status-kepegawaian",
      "prodi",
      selectedFakultas,
      selectedTahunAjaran,
    ],
    queryFn: () =>
      executiveStatusKepegawaianService.getStatusKepegawaianProdi({
        idFakultas: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled:
      !!selectedFakultas &&
      !!selectedTahunAjaran &&
      selectedTipeData === "status_pegawai",
  });

  // Fetch status kepegawaian fakultas historical data (5 years)
  const {
    data: statusKepegawaianFakultasHistorical = [],
    isLoading: isLoadingStatusKepegawaianFakultasHistorical,
  } = useQuery({
    queryKey: ["dosen", "status-kepegawaian", "fakultas", "historical", selectedTahunAjaran, userContext?.id_organisasi, selectedFakultas],
    queryFn: () =>
      executiveStatusKepegawaianService.getStatusKepegawaianFakultasHistorical({
        tahun_ajaran: selectedTahunAjaran,
        fakultas_id: userContext?.level_organisasi == 4
          ? userContext.id_organisasi
          : selectedFakultas || undefined,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "status_pegawai",
  });

  // Fetch status kepegawaian prodi historical data (5 years)
  const {
    data: statusKepegawaianProdiHistorical = [],
    isLoading: isLoadingStatusKepegawaianProdiHistorical,
  } = useQuery({
    queryKey: ["dosen", "status-kepegawaian", "prodi", "historical", selectedFakultas, selectedTahunAjaran, selectedProdi],
    queryFn: () =>
      executiveStatusKepegawaianService.getStatusKepegawaianProdiHistorical({
        fakultas_id: selectedFakultas,
        tahun_ajaran: selectedTahunAjaran,
        prodi_id: selectedProdi || undefined,
      }),
    enabled: !!selectedFakultas && !!selectedTahunAjaran && selectedTipeData === "status_pegawai",
  });

  // Combined loading state for chart data
  const isLoadingChartData =
    (selectedTipeData === "jabfung" &&
      (selectedProdi
        ? isLoadingJabfungProdi
        : isLoadingJabfungFakultas)) ||
    (selectedTipeData === "jenjang_pendidikan" &&
      (selectedProdi ? isLoadingJenjangProdi : isLoadingJenjangFakultas)) ||
    (selectedTipeData === "pang_gol" &&
      (selectedProdi ? isLoadingPanggolProdi : isLoadingPanggolFakultas)) ||
    (selectedTipeData === "ikatan_kerja" &&
      (selectedProdi
        ? isLoadingIkatanKerjaProdi
        : isLoadingIkatanKerjaFakultas)) ||
    (selectedTipeData === "jenis_kelamin" &&
      (selectedProdi
        ? isLoadingJenisKelaminProdi
        : isLoadingJenisKelaminFakultas)) ||
    (selectedTipeData === "status_pegawai" &&
      (selectedProdi
        ? isLoadingStatusKepegawaianProdi
        : isLoadingStatusKepegawaianFakultas));

  return {
    // Master data
    tahunAjaranList,
    isLoadingTahunAjaran,
    fakultasList,
    isLoadingFakultas,
    prodiList,
    isLoadingProdi,

    // Jabfung data
    jabfungFakultasList,
    isLoadingJabfungFakultas,
    jabfungProdiList,
    isLoadingJabfungProdi,
    jabfungFakultasHistorical,
    isLoadingJabfungFakultasHistorical,
    jabfungProdiHistorical,
    isLoadingJabfungProdiHistorical,

    // Jenjang data
    jenjangFakultasList,
    isLoadingJenjangFakultas,
    jenjangProdiList,
    isLoadingJenjangProdi,
    jenjangFakultasHistorical,
    isLoadingJenjangFakultasHistorical,
    jenjangProdiHistorical,
    isLoadingJenjangProdiHistorical,

    // Pangkat golongan data
    panggolFakultasList,
    isLoadingPanggolFakultas,
    panggolProdiList,
    isLoadingPanggolProdi,
    panggolFakultasHistorical,
    isLoadingPanggolFakultasHistorical,
    panggolProdiHistorical,
    isLoadingPanggolProdiHistorical,

    // Ikatan kerja data
    ikatanKerjaFakultasList,
    isLoadingIkatanKerjaFakultas,
    ikatanKerjaProdiList,
    isLoadingIkatanKerjaProdi,
    ikatanKerjaFakultasHistorical,
    isLoadingIkatanKerjaFakultasHistorical,
    ikatanKerjaProdiHistorical,
    isLoadingIkatanKerjaProdiHistorical,

    // Jenis kelamin data
    jenisKelaminFakultasList,
    isLoadingJenisKelaminFakultas,
    jenisKelaminProdiList,
    isLoadingJenisKelaminProdi,
    jenisKelaminFakultasHistorical,
    isLoadingJenisKelaminFakultasHistorical,
    jenisKelaminProdiHistorical,
    isLoadingJenisKelaminProdiHistorical,

    // Status kepegawaian data
    statusKepegawaianFakultasList,
    isLoadingStatusKepegawaianFakultas,
    statusKepegawaianProdiList,
    isLoadingStatusKepegawaianProdi,
    statusKepegawaianFakultasHistorical,
    isLoadingStatusKepegawaianFakultasHistorical,
    statusKepegawaianProdiHistorical,
    isLoadingStatusKepegawaianProdiHistorical,

    // Combined loading state for charts
    isLoadingChartData,
  };
};
