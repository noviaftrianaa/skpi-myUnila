import { Button, Chip } from "@heroui/react";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import DataTable, { type Column } from "@/shared/components/ui/DataTable";
import { type Fakultas, type Prodi } from "@/lib/services/executive";
import { JenjangListDisplay } from "./JenjangListDisplay";

export const getFakultasColumns = (
  handleFakultasClick: (fakultas: Fakultas) => void,
): Column<Fakultas>[] => [
  {
    key: "no",
    label: "No",
    align: "center",
    width: "60px",
    render: (_fakultas, index = 0) => index + 1,
  },
  {
    key: "nama_fakultas",
    label: "Fakultas",
    render: (item) => (
      <button
        onClick={() => handleFakultasClick(item)}
        className="font-semibold text-left text-blue-600 transition-colors hover:text-blue-800 hover:underline"
      >
        {item.nama_lembaga}
      </button>
    ),
  },
  {
    key: "jenjang_list",
    label: "Jenjang Prodi",
    render: (item) => <JenjangListDisplay jenjangList={item.jenjang_list} />,
  },
  {
    key: "prodi_aktif",
    label: "Jumlah Prodi Aktif",
    align: "center",
    render: (item) => (
      <Chip
        size="sm"
        variant="flat"
        className="text-xs"
        color="success"
        startContent={<FiCheckCircle className="w-3 h-3" />}
      >
        {item.prodi_aktif}
      </Chip>
    ),
  },
  {
    key: "prodi_akan_kadaluarsa",
    label: "Prodi Akan Kadaluarsa",
    align: "center",
    render: (item) => (
      <Chip
        size="sm"
        variant="flat"
        className="text-xs"
        color="warning"
        startContent={<FiClock className="w-3 h-3" />}
      >
        {item.prodi_akan_kadaluarsa}
      </Chip>
    ),
  },
];

export const getProdiColumns = (
  handleShowHistory: (prodi: Prodi) => void,
  formatDate: (dateString: string | null) => string,
): Column<Prodi>[] => [
  {
    key: "no",
    label: "No",
    align: "center",
    width: "60px",
    render: (_prodi, index = 0) => index + 1,
  },
  {
    key: "nama_prodi",
    label: "Program Studi",
    render: (item) => (
      <div>
        <p className="font-semibold">{item.nama_prodi}</p>
        <p className="text-xs text-gray-500">{item.jenjang}</p>
      </div>
    ),
  },
  {
    key: "akreditasi_terakhir",
    label: "Akreditasi Terakhir",
    align: "center",
    render: (item) => (
      <Chip
        size="sm"
        variant="flat"
        className="text-xs"
        color={item.status_akreditasi === "Proses" ? "default" : "success"}
      >
        {item.akreditasi_terakhir || "-"}
      </Chip>
    ),
  },
  {
    key: "tahun_akreditasi",
    label: "Tahun",
    align: "center",
    render: (item) => item.tahun_akreditasi || "-",
  },
  {
    key: "tanggal_kadaluarsa",
    label: "Masa Berlaku Hingga",
    align: "center",
    render: (item) => formatDate(item.tanggal_kadaluarsa),
  },
  {
    key: "reakreditasi",
    label: "Status",
    align: "center",
    render: (item) =>
      item.is_reakreditasi ? (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">
          Reakreditasi
        </span>
      ) : (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
          Aktif
        </span>
      ),
  },
  {
    key: "history",
    label: "History",
    align: "center",
    render: (item) => (
      <Button
        size="sm"
        isIconOnly
        variant="flat"
        color="primary"
        onPress={() => handleShowHistory(item)}
        startContent={<FiClock className="w-4 h-4" />}
      />
    ),
  },
];
