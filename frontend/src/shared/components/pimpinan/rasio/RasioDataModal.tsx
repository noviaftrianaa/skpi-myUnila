import { Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import Modal from "../Modal";
import { dummyFakultas, dummyProdi } from "./dummyData";
import type { Mahasiswa, Dosen } from "./dummyData";

interface RasioDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFakultas: string;
  selectedProdi: string;
  mahasiswaData: Mahasiswa[];
  dosenData: Dosen[];
}

export const RasioDataModal = ({
  isOpen,
  onClose,
  selectedFakultas,
  selectedProdi,
  mahasiswaData,
  dosenData,
}: RasioDataModalProps) => {
  // Get title based on selection
  const getTitle = () => {
    if (selectedProdi) {
      const prodi = dummyProdi.find((p) => p.id === selectedProdi);
      return prodi?.nama_prodi || "Program Studi";
    }

    if (selectedFakultas) {
      const fakultas = dummyFakultas.find((f) => f.id === selectedFakultas);
      return fakultas?.nama_fakultas || "Fakultas";
    }

    return "Semua Fakultas";
  };

  const title = getTitle();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      title="Data Detail"
      titleIcon={<FiUsers className="w-5 h-5" />}
      subtitle={title}
    >
      <Tabs
        color="primary"
        variant="underlined"
        classNames={{
          panel: "pt-6",
        }}
      >
        <Tab
          key="mahasiswa"
          title={
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4" />
              <span>Mahasiswa</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {mahasiswaData.length}
              </span>
            </div>
          }
        >
          <Table aria-label="Tabel Mahasiswa">
            <TableHeader>
              <TableColumn>NIM</TableColumn>
              <TableColumn>Nama</TableColumn>
              <TableColumn>Program Studi</TableColumn>
              <TableColumn>Fakultas</TableColumn>
              <TableColumn>Angkatan</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Tidak ada data mahasiswa">
              {mahasiswaData.slice(0, 100).map((mhs) => (
                <TableRow key={mhs.id}>
                  <TableCell>{mhs.nim}</TableCell>
                  <TableCell>{mhs.nama}</TableCell>
                  <TableCell>{mhs.prodi}</TableCell>
                  <TableCell>{mhs.fakultas}</TableCell>
                  <TableCell>{mhs.angkatan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Tab>

        <Tab
          key="dosen"
          title={
            <div className="flex items-center gap-2">
              <FiUserPlus className="w-4 h-4" />
              <span>Dosen</span>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {dosenData.length}
              </span>
            </div>
          }
        >
          <Table aria-label="Tabel Dosen">
            <TableHeader>
              <TableColumn>NIDN</TableColumn>
              <TableColumn>Nama</TableColumn>
              <TableColumn>Program Studi</TableColumn>
              <TableColumn>Fakultas</TableColumn>
              <TableColumn>Status</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Tidak ada data dosen">
              {dosenData.slice(0, 100).map((dsn) => (
                <TableRow key={dsn.id}>
                  <TableCell>{dsn.nidn}</TableCell>
                  <TableCell>{dsn.nama}</TableCell>
                  <TableCell>{dsn.prodi}</TableCell>
                  <TableCell>{dsn.fakultas}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        dsn.status === "PNS"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {dsn.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Tab>
      </Tabs>
    </Modal>
  );
};
