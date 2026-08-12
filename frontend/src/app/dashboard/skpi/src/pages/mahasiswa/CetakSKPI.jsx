import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoUnila from "../../assets/logo-unila.png";

const STORAGE_KEY = "skpi_kegiatan";

export default function CetakSKPI() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  
  // Identitas mahasiswa default (Hanifa Sophia)
  const studentInfo = {
    nama: "Hanifa Sophia",
    npm: "2020021001",
    fakultas: "Teknik",
    prodi: "Teknik Elektro",
    strata: "S1",
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Filter Kegiatan Wajib (PKKMB)
  const kegiatanWajib = data.filter(
    (item) =>
      item.status === "Divalidasi" &&
      (item.kategori === "PKKMB Universitas" || item.kategori === "PKKMB Fakultas" || item.kategori === "PKKMB Jurusan")
  );

  // Filter Kegiatan Pilihan (Divalidasi saja)
  const kegiatanPilihan = data.filter(
    (item) =>
      item.status === "Divalidasi" &&
      !(item.kategori === "PKKMB Universitas" || item.kategori === "PKKMB Fakultas" || item.kategori === "PKKMB Jurusan")
  );

  // Hitung poin kategori Pilihan
  const getPoinKategori = (kategoriName) => {
    return kegiatanPilihan
      .filter((item) => item.kategori === kategoriName)
      .reduce((sum, item) => sum + (item.poin || 0), 0);
  };

  // Nilai Bidang Organisasi Dan Kepemimpinan (Organisasi / Kepanitiaan)
  const poinOrganisasi = getPoinKategori("Organisasi") + getPoinKategori("Kepanitiaan");
  // Nilai Minat Bakat, Penalaran Dan Kewirausahaan (Lomba)
  const poinLomba = getPoinKategori("Lomba");
  // Nilai Sosial, Kerohanian Dan Bidang Lainnya (Pelatihan / Seminar / Publikasi / dll)
  const poinLainnya =
    getPoinKategori("Pelatihan") +
    getPoinKategori("Seminar") +
    getPoinKategori("Publikasi");

  // Nilai Wajib/PKKMB
  const poinWajib = kegiatanWajib.reduce((sum, item) => sum + (item.poin || 0), 0);

  const totalNilai = poinWajib + poinOrganisasi + poinLomba + poinLainnya;

  // Predikat
  let predikat = "Cukup";
  if (totalNilai >= 150) predikat = "Unggul";
  else if (totalNilai >= 80) predikat = "Sangat Baik";
  else if (totalNilai >= 30) predikat = "Baik";

  // Tanggal Hari Ini
  const today = new Date();
  const formatToday = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 no-print-bg">
      {/* Control Panel (Hidden during printing) */}
      <div className="max-w-4xl mx-auto mb-6 px-6 py-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center no-print">
        <div>
          <h2 className="text-lg font-bold text-gray-800 font-poppins">Unduh Draft / Cetak SKPI</h2>
          <p className="text-xs text-gray-500 font-poppins">Silakan unduh atau cetak dokumen form SKPI Anda di sini.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/pengajuan")}
            className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 font-poppins transition active:scale-[0.98]"
          >
            Kembali
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold font-poppins transition active:scale-[0.98] shadow-md shadow-blue-500/20"
          >
            Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg p-10 print:p-0 print:shadow-none print:w-full min-h-[297mm]">
        {/* Header KOP */}
        <div className="flex items-center border-b-[3px] border-black pb-4 mb-6">
          <img src={logoUnila} alt="Logo Unila" className="w-[85px] h-[85px] object-contain mr-6" />
          <div className="flex-1 text-center pr-[85px]">
            <h1 className="text-xl font-bold tracking-wide text-black font-serif uppercase">
              KEMENTERIAN PENDIDIKAN TINGGI, SAINS DAN TEKNOLOGI
            </h1>
            <h2 className="text-2xl font-black text-black font-serif uppercase mt-0.5">
              UNIVERSITAS LAMPUNG
            </h2>
            <p className="text-[11px] text-gray-800 font-serif leading-tight mt-1">
              JL. PROF. DR. SUMANTRI BROJONEGORO NO.1 BANDAR LAMPUNG 35345
            </p>
            <p className="text-[10px] text-gray-800 font-serif leading-tight">
              TELP. : 702767, 702971, 703475, 702673, 701252, 701609
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="relative text-center mb-8">
          <h3 className="text-[14px] font-bold text-black font-serif underline uppercase">
            FORM SURAT KETERANGAN PENDAMPING IJASAH (SKPI) CALON WISUDAWAN
          </h3>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-yellow-400 border border-yellow-600 px-3 py-1 font-bold text-xs text-black font-serif tracking-wide">
            FORM SKPI
          </div>
        </div>

        {/* Biodata */}
        <table className="w-full text-[13px] font-serif mb-6 text-black border-collapse">
          <tbody>
            <tr>
              <td className="w-[180px] py-1">Strata Program</td>
              <td className="w-[15px] py-1">:</td>
              <td className="py-1 font-semibold">{studentInfo.strata}</td>
            </tr>
            <tr>
              <td className="py-1">Npm</td>
              <td className="py-1">:</td>
              <td className="py-1 font-semibold">{studentInfo.npm}</td>
            </tr>
            <tr>
              <td className="py-1">Nama</td>
              <td className="py-1">:</td>
              <td className="py-1 font-semibold">{studentInfo.nama}</td>
            </tr>
            <tr>
              <td className="py-1">Fakultas</td>
              <td className="py-1">:</td>
              <td className="py-1 font-semibold">{studentInfo.fakultas}</td>
            </tr>
            <tr>
              <td className="py-1">Program Studi</td>
              <td className="py-1">:</td>
              <td className="py-1 font-semibold">{studentInfo.strata} - {studentInfo.prodi}</td>
            </tr>
          </tbody>
        </table>

        {/* Summary Table */}
        <table className="w-full border-collapse border border-gray-300 text-[12px] font-serif mb-8 text-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left w-[60px]">No</th>
              <th className="border border-gray-300 p-2 text-left">Kegiatan</th>
              <th className="border border-gray-300 p-2 text-right w-[120px]">Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-semibold bg-gray-50">
              <td className="border border-gray-300 p-2">A.</td>
              <td className="border border-gray-300 p-2">Wajib Universitas</td>
              <td className="border border-gray-300 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-center">1.</td>
              <td className="border border-gray-300 p-2 pl-6">Kegiatan Wajib/Pkkmb</td>
              <td className="border border-gray-300 p-2 text-right">{poinWajib}</td>
            </tr>
            <tr className="font-semibold bg-gray-50">
              <td className="border border-gray-300 p-2">B.</td>
              <td className="border border-gray-300 p-2">Pilihan</td>
              <td className="border border-gray-300 p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-center">1.</td>
              <td className="border border-gray-300 p-2 pl-6">Bidang Organisasi Dan Kepemimpinan</td>
              <td className="border border-gray-300 p-2 text-right">{poinOrganisasi}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-center">2.</td>
              <td className="border border-gray-300 p-2 pl-6">Minat Bakat, Penalaran Dan Kewirausahaan</td>
              <td className="border border-gray-300 p-2 text-right">{poinLomba}</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-center">3.</td>
              <td className="border border-gray-300 p-2 pl-6">Sosial, Kerohanian Dan Bidang Lainnya</td>
              <td className="border border-gray-300 p-2 text-right">{poinLainnya}</td>
            </tr>
            <tr className="font-bold bg-gray-100">
              <td colSpan={2} className="border border-gray-300 p-2 text-right">Total Nilai SKPI Mahasiswa</td>
              <td className="border border-gray-300 p-2 text-right">{totalNilai}</td>
            </tr>
            <tr className="font-bold bg-gray-100">
              <td colSpan={2} className="border border-gray-300 p-2 text-right">Predikat SKPI Mahasiswa</td>
              <td className="border border-gray-300 p-2 text-right uppercase tracking-wider">{predikat}</td>
            </tr>
          </tbody>
        </table>

        {/* Section Detail Prestasi */}
        <h4 className="text-[13px] font-bold text-black font-serif border border-black p-2 bg-gray-100 mb-4 uppercase">
          Daftar Prestasi Mahasiswa
        </h4>

        {/* Wajib Universitas Details */}
        <div className="mb-6">
          <h5 className="text-[12px] font-bold text-black font-serif mb-2">A. Wajib Universitas</h5>
          <table className="w-full border-collapse border border-black text-[11px] font-serif text-black">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 text-center w-[40px]">No</th>
                <th className="border border-black p-2 text-left">Nama Kegiatan</th>
                <th className="border border-black p-2 text-left w-[180px]">Jenis Kegiatan</th>
                <th className="border border-black p-2 text-center w-[80px]">Tingkat</th>
                <th className="border border-black p-2 text-center w-[120px]">Struktur/Jabatan</th>
                <th className="border border-black p-2 text-right w-[60px]">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanWajib.length > 0 ? (
                kegiatanWajib.map((keg, idx) => (
                  <tr key={keg.id}>
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2">{keg.title}</td>
                    <td className="border border-black p-2">{keg.kategori}</td>
                    <td className="border border-black p-2 text-center">{keg.tingkatan || "-"}</td>
                    <td className="border border-black p-2 text-center">{keg.jabatan || "-"}</td>
                    <td className="border border-black p-2 text-right">{keg.poin || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-black p-3 text-center text-gray-500 italic">
                    Belum ada kegiatan wajib yang divalidasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pilihan Details */}
        <div className="mb-10 page-break">
          <h5 className="text-[12px] font-bold text-black font-serif mb-2">B. Pilihan</h5>
          <table className="w-full border-collapse border border-black text-[11px] font-serif text-black">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-black p-2 text-center w-[40px]">No</th>
                <th className="border border-black p-2 text-left">Nama Kegiatan</th>
                <th className="border border-black p-2 text-left w-[180px]">Jenis Kegiatan</th>
                <th className="border border-black p-2 text-center w-[80px]">Tingkat</th>
                <th className="border border-black p-2 text-center w-[120px]">Struktur/Jabatan</th>
                <th className="border border-black p-2 text-right w-[60px]">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {kegiatanPilihan.length > 0 ? (
                kegiatanPilihan.map((keg, idx) => (
                  <tr key={keg.id}>
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2">{keg.title}</td>
                    <td className="border border-black p-2">{keg.kategori}</td>
                    <td className="border border-black p-2 text-center">{keg.tingkatan || "-"}</td>
                    <td className="border border-black p-2 text-center">{keg.jabatan || "-"}</td>
                    <td className="border border-black p-2 text-right">{keg.poin || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border border-black p-3 text-center text-gray-500 italic">
                    Belum ada kegiatan pilihan yang divalidasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures Section */}
        <div className="text-[12px] font-serif text-black font-normal mt-12 grid grid-cols-3 gap-6">
          <div className="text-center">
            <p>Mengetahui/Menyetujui</p>
            <p>Wakil Dekan Kemahasiswaan dan</p>
            <p className="mb-20">Alumni</p>
            <p className="font-bold underline">Prof. Masdar Helmi, S.T., D.E.A., Ph.D.</p>
            <p>NIP. 197004301997031003</p>
          </div>
          <div className="text-center">
            <p>Telah memeriksa/Memvalidasi</p>
            <p className="mb-[40px]">Kepala Bagian Umum</p>
            <p className="mb-20"></p>
            <p className="font-bold underline">Astiti Handayani, S.Si.</p>
            <p>NIP. 197211222008102001</p>
          </div>
          <div className="text-center">
            <p>Bandar Lampung, {formatToday}</p>
            <p className="mb-[40px]">Mahasiswa bersangkutan</p>
            <p className="mb-20"></p>
            <p className="font-bold underline">{studentInfo.nama}</p>
            <p>NPM. {studentInfo.npm}</p>
          </div>
        </div>
      </div>
      
      {/* Styles for print media */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .no-print-bg {
            background-color: transparent !important;
            padding: 0 !important;
          }
          .page-break {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
        }
      `}</style>
    </div>
  );
}
