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

    // Jenjang data
    jenjangFakultasList,
    isLoadingJenjangFakultas,
    jenjangProdiList,
    isLoadingJenjangProdi,

    // Pangkat golongan data
    panggolFakultasList,
    isLoadingPanggolFakultas,
    panggolProdiList,
    isLoadingPanggolProdi,

    // Ikatan kerja data
    ikatanKerjaFakultasList,
    isLoadingIkatanKerjaFakultas,
    ikatanKerjaProdiList,
    isLoadingIkatanKerjaProdi,

    // Jenis kelamin data
    jenisKelaminFakultasList,
    isLoadingJenisKelaminFakultas,
    jenisKelaminProdiList,
    isLoadingJenisKelaminProdi,

    // Status kepegawaian data
    statusKepegawaianFakultasList,
    isLoadingStatusKepegawaianFakultas,
    statusKepegawaianProdiList,
    isLoadingStatusKepegawaianProdi,

    // Combined loading state for charts
    isLoadingChartData,
  };
};
