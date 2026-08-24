// src/pages/mahasiswa/TambahKegiatan.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";
import Navbar from "../../components/common/Navbar";
import {
  Upload,
  Check,
  X,
  Plus,
  Trash2,
  Lock,
  Calendar,
} from "lucide-react";

export default function TambahKegiatan() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocked, setIsLocked] = useState(false);

  // Form State
  const [judul, setJudul] = useState("");
  const [kategori, setKategori] = useState(location.state?.kategori || "");
  const [tahun, setTahun] = useState("");
  const [prestasi, setPrestasi] = useState("");
  const [tingkatan, setTingkatan] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [bentukKarya, setBentukKarya] = useState("");
  const [tanggalPembuatan, setTanggalPembuatan] = useState("");
  const [tautanKarya, setTautanKarya] = useState("");
  const [dosenPembimbing, setDosenPembimbing] = useState("");
  const [nomorSertifikat, setNomorSertifikat] = useState("");
  const [tanggalSertifikat, setTanggalSertifikat] = useState("");
  const [tautanSertifikat, setTautanSertifikat] = useState("");
  const [anggotaTim, setAnggotaTim] = useState([]);

  const handleAddAnggota = () => {
    setAnggotaTim([...anggotaTim, { nama: "", npm: "" }]);
  };

  const handleRemoveAnggota = (index) => {
    setAnggotaTim(anggotaTim.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setJudul("");
    setKategori("");
    setTahun("");
    setPrestasi("");
    setTingkatan("");
    setJabatan("");
    setBentukKarya("");
    setTanggalPembuatan("");
    setTautanKarya("");
    setDosenPembimbing("");
    setNomorSertifikat("");
    setTanggalSertifikat("");
    setTautanSertifikat("");
    setAnggotaTim([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Kegiatan berhasil disimpan!");
    navigate("/pengajuan");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarMahasiswa />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="mahasiswa" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* HEADER (CENTERED) */}
          <div className="max-w-3xl mx-auto w-full">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Tambah Kegiatan
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Catat kegiatan atau karya untuk melengkapi SKPI-mu.
            </p>
          </div>

          {/* LOCKED STATE VIEW (IF TRANSCRIPT IS LOCKED) */}
          {isLocked ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-gray-100 dark:border-slate-800 shadow-xs text-center max-w-lg mx-auto space-y-4 my-12">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto">
                <Lock size={32} />
              </div>

              <h2 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                Akses Ditutup: SKPI Terkunci
              </h2>

              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Transkrip SKPI final Anda telah resmi diterbitkan oleh Program Studi. Anda tidak diperkenankan lagi untuk menambahkan data kegiatan baru ke dalam lembar SKPI Anda.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Kembali ke Beranda
                </button>
                <button
                  onClick={() => navigate("/pengajuan")}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Lihat Riwayat & Transkrip
                </button>
              </div>
            </div>
          ) : (
            /* FORM CARD (CENTERED WITH mx-auto) */
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-xs max-w-3xl mx-auto space-y-6">
              {/* Judul Kegiatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                  Judul Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="contoh: National Hackathon 2025"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Kategori & Tahun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    Kategori *
                  </label>
                  <select
                    required
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Karya">Karya</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Organisasi">Organisasi</option>
                    <option value="Kepanitiaan">Kepanitiaan</option>
                    <option value="Publikasi">Publikasi</option>
                    <option value="PKKMB Universitas">PKKMB Universitas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    Tahun *
                  </label>
                  <select
                    required
                    value={tahun}
                    onChange={(e) => setTahun(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">Pilih Tahun</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>

              {/* ==============================================
                  FORM KARYA (Page 12 Bottom)
                 ============================================== */}
              {kategori === "Karya" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Bentuk Karya
                    </label>
                    <select
                      value={bentukKarya}
                      onChange={(e) => setBentukKarya(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">Pilih Bentuk Karya</option>
                      <option value="Aplikasi / Software">Aplikasi / Software</option>
                      <option value="Karya Seni / Desain">Karya Seni / Desain</option>
                      <option value="Karya Tulis / Jurnal">Karya Tulis / Jurnal</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tanggal Pembuatan
                    </label>
                    <input
                      type="date"
                      value={tanggalPembuatan}
                      onChange={(e) => setTanggalPembuatan(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tautan Karya / Portofolio
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={tautanKarya}
                      onChange={(e) => setTautanKarya(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Unggah Dokumen Pendukung
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Klik untuk unggah atau tarik berkas ke sini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, PDF (maks. 5MB)</p>
                    </div>
                  </div>
                </>
              )}

              {/* ==============================================
                  FORM LOMBA (Page 12 Top)
                 ============================================== */}
              {kategori === "Lomba" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Prestasi / Pencapaian
                      </label>
                      <select
                        value={prestasi}
                        onChange={(e) => setPrestasi(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="">Pilih Prestasi</option>
                        <option value="Juara 1">Juara 1</option>
                        <option value="Juara 2">Juara 2</option>
                        <option value="Juara 3">Juara 3</option>
                        <option value="Peserta">Peserta / Finalis</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Tingkatan
                      </label>
                      <select
                        value={tingkatan}
                        onChange={(e) => setTingkatan(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="">Pilih Tingkatan</option>
                        <option value="Internasional">Internasional</option>
                        <option value="Nasional">Nasional</option>
                        <option value="Regional">Regional</option>
                        <option value="Universitas">Universitas</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Dosen Pembimbing *
                    </label>
                    <select
                      required
                      value={dosenPembimbing}
                      onChange={(e) => setDosenPembimbing(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="">Pilih Dosen Pembimbing</option>
                      <option value="Dr. Eng. Admi Syarif">Dr. Eng. Admi Syarif</option>
                      <option value="Prof. Dr. Ir. Ahmad">Prof. Dr. Ir. Ahmad</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Anggota Tim (opsional)
                    </label>
                    {anggotaTim.map((anggota, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Nama anggota"
                          value={anggota.nama}
                          onChange={(e) => {
                            const updated = [...anggotaTim];
                            updated[index].nama = e.target.value;
                            setAnggotaTim(updated);
                          }}
                          className="flex-1 p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                        <input
                          type="text"
                          placeholder="NPM"
                          value={anggota.npm}
                          onChange={(e) => {
                            const updated = [...anggotaTim];
                            updated[index].npm = e.target.value;
                            setAnggotaTim(updated);
                          }}
                          className="w-36 p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAnggota(index)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddAnggota}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Anggota</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Unggah SK Pembimbing / Tim
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Klik untuk unggah atau tarik berkas ke sini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, atau PDF</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Nomor Sertifikat
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nomor sertifikat"
                      value={nomorSertifikat}
                      onChange={(e) => setNomorSertifikat(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tanggal Sertifikat
                    </label>
                    <input
                      type="date"
                      value={tanggalSertifikat}
                      onChange={(e) => setTanggalSertifikat(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tautan Sertifikat
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={tautanSertifikat}
                      onChange={(e) => setTautanSertifikat(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Unggah Dokumen Pendukung
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Klik untuk unggah atau tarik berkas ke sini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, PDF (maks. 5MB)</p>
                    </div>
                  </div>
                </>
              )}

              {/* ==============================================
                  FORM UMUM (Page 11) - Default / Other categories
                 ============================================== */}
              {kategori !== "Karya" && kategori !== "Lomba" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Jabatan
                      </label>
                      <select
                        value={jabatan}
                        onChange={(e) => setJabatan(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="">Pilih Jabatan</option>
                        <option value="Peserta">Peserta</option>
                        <option value="Ketua">Ketua</option>
                        <option value="Anggota">Anggota</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Tingkatan
                      </label>
                      <select
                        value={tingkatan}
                        onChange={(e) => setTingkatan(e.target.value)}
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="">Pilih Tingkatan</option>
                        <option value="Universitas">Universitas</option>
                        <option value="Fakultas">Fakultas</option>
                        <option value="Nasional">Nasional</option>
                        <option value="Internasional">Internasional</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Nomor Sertifikat
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan nomor sertifikat"
                      value={nomorSertifikat}
                      onChange={(e) => setNomorSertifikat(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tanggal Sertifikat
                    </label>
                    <input
                      type="date"
                      value={tanggalSertifikat}
                      onChange={(e) => setTanggalSertifikat(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tautan Sertifikat
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={tautanSertifikat}
                      onChange={(e) => setTautanSertifikat(e.target.value)}
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Unggah Dokumen Pendukung
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Klik untuk unggah atau tarik berkas ke sini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, PDF (maks. 5MB)</p>
                    </div>
                  </div>
                </>
              )}

              {/* Form Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  <span>Simpan</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <X size={14} />
                  <span>Kosongkan</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
