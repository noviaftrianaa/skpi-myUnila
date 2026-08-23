// src/pages/mahasiswa/CetakSKPI.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";

export default function CetakSKPI() {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-poppins py-8 px-4 sm:px-6 transition-colors duration-200">
      {/* PRINT-HIDE BAR */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-slate-100">
            Unduh Draft / Cetak SKPI
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Silakan unduh atau cetak dokumen form SKPI Anda di sini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Kembali</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* FORMAL PRINTABLE SKPI DOCUMENT */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl border border-gray-200 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 font-sans">
        {/* DOCUMENT HEADER */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 relative">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 shrink-0 bg-blue-600 rounded-full flex items-center justify-center p-1.5">
              <img
                src={`${import.meta.env.BASE_URL}Logo-Website-Unila.png`}
                alt="UNILA"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center flex-1 pr-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Kementerian Pendidikan Tinggi, Sains dan Teknologi
              </h2>
              <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900 mt-0.5">
                UNIVERSITAS LAMPUNG
              </h1>
              <p className="text-[10px] text-slate-600 mt-0.5">
                JL. PROF. DR. SUMANTRI BROJONEGORO NO.1 BANDAR LAMPUNG 35145 TELP : 702767, 703475, 703562, 703600
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300 text-center relative">
            <h3 className="text-xs font-black uppercase tracking-wider underline">
              FORM SURAT KETERANGAN PENDAMPING IJASAH (SKPI) CALON WISUDAWAN
            </h3>
            <span className="absolute right-0 top-3 px-2 py-0.5 bg-yellow-400 font-bold text-[9px] uppercase border border-slate-800">
              FORM SKPI
            </span>
          </div>
        </div>

        {/* STUDENT INFO GRID TABLE */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs mb-6 font-medium">
          <div className="flex">
            <span className="w-32 text-slate-500">Strata Program</span>
            <span className="font-bold">: S1</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-500">NPM</span>
            <span className="font-bold">: 2020021001</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-500">Nama</span>
            <span className="font-bold">: Hanifa Sophia</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-500">Fakultas</span>
            <span className="font-bold">: Teknik</span>
          </div>
          <div className="flex">
            <span className="w-32 text-slate-500">Program Studi</span>
            <span className="font-bold">: S1 - Teknik Elektro</span>
          </div>
        </div>

        {/* SUMMARY CATEGORIES TABLE */}
        <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
          <thead>
            <tr className="bg-slate-100 font-bold text-slate-800">
              <th className="border border-slate-300 p-2 text-center w-12">No</th>
              <th className="border border-slate-300 p-2 text-left">Kegiatan</th>
              <th className="border border-slate-300 p-2 text-center w-20">Nilai</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-bold">
              <td className="border border-slate-300 p-2 text-center">A.</td>
              <td className="border border-slate-300 p-2">Wajib Universitas</td>
              <td className="border border-slate-300 p-2 text-center"></td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 text-center">1.</td>
              <td className="border border-slate-300 p-2 pl-6">Kegiatan Wajib/PKKMB</td>
              <td className="border border-slate-300 p-2 text-center font-bold">0</td>
            </tr>
            <tr className="font-bold">
              <td className="border border-slate-300 p-2 text-center">B.</td>
              <td className="border border-slate-300 p-2">Pilihan</td>
              <td className="border border-slate-300 p-2 text-center"></td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 text-center">1.</td>
              <td className="border border-slate-300 p-2 pl-6">Bidang Organisasi dan Kepemimpinan</td>
              <td className="border border-slate-300 p-2 text-center font-bold">0</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 text-center">2.</td>
              <td className="border border-slate-300 p-2 pl-6">Minat Bakat, Penalaran dan Kewirausahaan</td>
              <td className="border border-slate-300 p-2 text-center font-bold">0</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 text-center">3.</td>
              <td className="border border-slate-300 p-2 pl-6">Sosial, Kerohanian Dan Bidang Lainnya</td>
              <td className="border border-slate-300 p-2 text-center font-bold">0</td>
            </tr>
            <tr className="font-bold bg-slate-50">
              <td colSpan={2} className="border border-slate-300 p-2 text-right">Total Nilai SKPI Mahasiswa</td>
              <td className="border border-slate-300 p-2 text-center text-blue-700">0</td>
            </tr>
            <tr className="font-bold bg-slate-50">
              <td colSpan={2} className="border border-slate-300 p-2 text-right">Predikat SKPI Mahasiswa</td>
              <td className="border border-slate-300 p-2 text-center">CUKUP</td>
            </tr>
          </tbody>
        </table>

        {/* SECTION A TABLE */}
        <div className="mb-6 space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-900">
            DAFTAR PRESTASI MAHASISWA
          </h4>
          <h5 className="text-[11px] font-bold text-slate-800">
            A. Wajib Universitas
          </h5>

          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800">
                <th className="border border-slate-300 p-1.5 text-center w-10">No</th>
                <th className="border border-slate-300 p-1.5 text-left">Nama Kegiatan</th>
                <th className="border border-slate-300 p-1.5 text-left">Jenis Kegiatan</th>
                <th className="border border-slate-300 p-1.5 text-center">Tingkat</th>
                <th className="border border-slate-300 p-1.5 text-center">Struktur/Jabatan</th>
                <th className="border border-slate-300 p-1.5 text-center w-16">Nilai</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-400 italic text-[11px]">
                  Belum ada kegiatan wajib yang divalidasi.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION B TABLE */}
        <div className="mb-10 space-y-2">
          <h5 className="text-[11px] font-bold text-slate-800">
            B. Pilihan
          </h5>

          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-bold text-slate-800">
                <th className="border border-slate-300 p-1.5 text-center w-10">No</th>
                <th className="border border-slate-300 p-1.5 text-left">Nama Kegiatan</th>
                <th className="border border-slate-300 p-1.5 text-left">Jenis Kegiatan</th>
                <th className="border border-slate-300 p-1.5 text-center">Tingkat</th>
                <th className="border border-slate-300 p-1.5 text-center">Struktur/Jabatan</th>
                <th className="border border-slate-300 p-1.5 text-center w-16">Nilai</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="border border-slate-300 p-4 text-center text-slate-400 italic text-[11px]">
                  Belum ada kegiatan pilihan yang divalidasi.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* SIGNATURE FOOTER */}
        <div className="grid grid-cols-3 gap-4 text-center text-[11px] font-medium pt-4">
          <div className="space-y-12">
            <div>
              <p>Mengetahui/Menyetujui</p>
              <p className="font-bold">Wakil Dekan Kemahasiswaan dan Alumni</p>
            </div>
            <div>
              <p className="font-bold underline">Prof. Mahendra Pratama, S.T., M.Eng., Ph.D.</p>
              <p className="text-[10px] text-slate-500">NIP. 197004301997031003</p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p>Telah memeriksa/Memvalidasi</p>
              <p className="font-bold">Kepala Bagian Umum</p>
            </div>
            <div>
              <p className="font-bold underline">Astri Handayani, S.Si.</p>
              <p className="text-[10px] text-slate-500">NIP. 197212222008012001</p>
            </div>
          </div>

          <div className="space-y-12">
            <div>
              <p>Bandar Lampung, 12-08-2026</p>
              <p className="font-bold">Mahasiswa bersangkutan</p>
            </div>
            <div>
              <p className="font-bold underline">Hanifa Sophia</p>
              <p className="text-[10px] text-slate-500">NPM. 2020021001</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
