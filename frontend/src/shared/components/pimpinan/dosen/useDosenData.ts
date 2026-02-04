import { useQuery } from "@tanstack/react-query";
import { executiveJabfungService } from "@/lib/services/executive/jabfungService";
import { executiveJenjangPendidikanService } from "@/lib/services/executive/jenjangPendidikanService";

// ========================================
// Types
// ========================================

export interface UseDosenDataParams {
  selectedTipeData: string;
  selectedTahunAjaran: string;
  selectedFakultas: string;
}

// ========================================
// Hooks
// ========================================

/**
 * Custom hook for fetching dosen data
 * Handles all the data fetching for jabfung and jenjang pendidikan
 */
export const useDosenData = ({
  selectedTipeData,
  selectedTahunAjaran,
  selectedFakultas,
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
    queryKey: ["dosen", "jabfung", "fakultas", selectedTahunAjaran],
    queryFn: () =>
      executiveJabfungService.getJabfungFakultas({
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jabfung",
  });

  // Fetch jabfung prodi data
  const { data: jabfungProdiList = [] } = useQuery({
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
  } = useQuery({
    queryKey: ["dosen", "jenjang", "fakultas", selectedTahunAjaran],
    queryFn: () =>
      executiveJenjangPendidikanService.getJenjangFakultas({
        tahun_ajaran: selectedTahunAjaran,
      }),
    enabled: !!selectedTahunAjaran && selectedTipeData === "jenjang_pendidikan",
  });

  // Fetch jenjang pendidikan prodi data
  const { data: jenjangProdiList = [] } = useQuery({
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
    jabfungProdiList,

    // Jenjang data
    jenjangFakultasList,
    jenjangProdiList,
  };
};
