// src/pages/mahasiswa/TambahKegiatan.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Upload, Check, X, ChevronDown, Lock, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "../../components/common/SidebarMahasiswa";

const STORAGE_KEY = "skpi_kegiatan";

const KATEGORI  = ["Seminar", "Lomba", "Organisasi", "Kepanitiaan", "Pelatihan", "Publikasi", "Karya", "PKKMB Universitas"];
const TAHUN     = ["2025", "2024", "2023", "2022", "2021"];
const BENTUK_KARYA = ["Aplikasi / Software", "Karya Tulis / Jurnal", "Karya Seni / Desain", "Proyek Multimedia", "Lainnya"];
const TINGKATAN = ["Internasional", "Nasional", "Regional", "Provinsi", "Universitas", "Fakultas", "Jurusan"];
const DOSEN_PEMBIMBING = [
  "Dr. Eng. Admi Syarif",
  "Prof. Dr. Ir. Suharno, M.S.",
  "Ahmad Zakaria, Ph.D.",
  "Dr. Ryan Randy Suryono"
];

const getJabatanOptions = (kategori) => {
  if (kategori === "Lomba") return ["Peserta", "Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Harapan 3"];
  if (kategori === "Organisasi" || kategori === "Kepanitiaan") return ["Ketua", "Wakil Ketua", "Sekretaris", "Wakil Sekretaris", "Bendahara", "Wakil Bendahara", "Anggota", "Ketua Bidang / Koordinator / Departemen"];
  if (kategori === "Pelatihan" || kategori === "Seminar") return ["Narasumber / Pembicara", "Moderator", "Peserta"];
  if (kategori === "Publikasi") return ["Ketua", "Anggota"];
  return ["Peserta", "Ketua", "Anggota", "Panitia", "Pembicara", "Juri"];
};

function SelectField({ label, options, value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] outline-none font-poppins appearance-none cursor-pointer focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text", required = false }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-colors font-poppins"
      />
    </div>
  );
}

const EMPTY_FORM = {
  judul: "",
  kategori: "",
  tahun: "",
  jabatan: "",
  tingkatan: "",
  nomorSertifikat: "",
  tanggalSertifikat: "",
  tautanSertifikat: "",
  pembimbing: "",
  bentukKarya: "",
};

export default function TambahKegiatan() {
  const navigate = useNavigate();
  const [form, setForm]               = useState(EMPTY_FORM);
  const [file, setFile]               = useState(null);
  const [skFile, setSkFile]           = useState(null);
  const [anggotaTim, setAnggotaTim]   = useState([{ nama: "", npm: "" }]);
  const [dragOver, setDragOver]       = useState(false);
  const [skDragOver, setSkDragOver]   = useState(false);
  const [error, setError]             = useState("");
  const [successMsg, setSuccessMsg]   = useState("");
  const fileRef   = useRef();
  const skFileRef = useRef();

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleKategoriChange = (val) => {
    setForm((prev) => ({
      ...prev,
      kategori: val,
      bentukKarya: val === "Karya" ? prev.bentukKarya : "",
      jabatan: val === "Karya" ? "" : prev.jabatan,
      tingkatan: val === "Karya" ? "" : prev.tingkatan,
      pembimbing: val === "Lomba" ? prev.pembimbing : "",
      nomorSertifikat: val === "Karya" ? "" : prev.nomorSertifikat,
    }));
    if (val !== "Lomba") {
      setAnggotaTim([{ nama: "", npm: "" }]);
      setSkFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleSkDrop = (e) => {
    e.preventDefault();
    setSkDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setSkFile(f);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setSkFile(null);
    setAnggotaTim([{ nama: "", npm: "" }]);
    setError("");
  };

  const handleAddAnggota = () => setAnggotaTim([...anggotaTim, { nama: "", npm: "" }]);
  const handleRemoveAnggota = (index) => setAnggotaTim(anggotaTim.filter((_, i) => i !== index));
  const handleChangeAnggota = (index, field, value) => {
    const newAnggota = [...anggotaTim];
    newAnggota[index][field] = value;
    setAnggotaTim(newAnggota);
  };

  const handleSubmit = async () => {
    if (!form.judul.trim()) {
      setError(form.kategori === "Karya" ? "Judul karya wajib diisi." : "Judul kegiatan wajib diisi.");
      return;
    }
    if (!form.kategori) {
      setError("Kategori wajib dipilih.");
      return;
    }
    if (!form.tahun) {
      setError("Tahun wajib dipilih.");
      return;
    }

    // Validasi spesifik per kondisi
    if (form.kategori === "Karya") {
      if (!form.bentukKarya) {
        setError("Bentuk karya wajib dipilih.");
        return;
      }
    } else if (form.kategori === "Lomba") {
      if (!form.jabatan) {
        setError("Prestasi / Pencapaian wajib dipilih.");
        return;
      }
      if (!form.tingkatan) {
        setError("Tingkatan wajib dipilih.");
        return;
      }
    } else {
      if (!form.jabatan) {
        setError("Jabatan / Peran wajib dipilih.");
        return;
      }
      if (!form.tingkatan) {
        setError("Tingkatan wajib dipilih.");
        return;
      }
    }

    setError("");

    let certificateBase64 = null;
    let skBase64 = null;
    if (file) {
      certificateBase64 = "/Sertifikat.png";
    }
    if (skFile && form.kategori === "Lomba") {
      skBase64 = "/Sertifikat.png";
    }

    let existing = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        existing = Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      existing = [];
    }

    const newItem = {
      id: Date.now(),
      title: form.judul.trim(),
      date: form.tanggalSertifikat || `${form.tahun}-01-01`,
      location: "-",
      kategori: form.kategori,
      bentukKarya: form.kategori === "Karya" ? form.bentukKarya : "",
      tingkatan: form.kategori === "Karya" ? "" : form.tingkatan,
      jabatan: form.kategori === "Karya" ? "" : form.jabatan,
      nomorSertifikat: form.kategori === "Karya" ? "" : form.nomorSertifikat,
      tautanSertifikat: form.tautanSertifikat,
      pembimbing: form.kategori === "Lomba" ? form.pembimbing : "",
      anggotaTim: form.kategori === "Lomba" ? anggotaTim.filter((a) => a.nama.trim() || a.npm.trim()) : [],
      skFile: skBase64,
      tags: form.kategori === "Karya"
        ? ["Karya", form.bentukKarya].filter(Boolean)
        : [form.kategori, form.tingkatan].filter(Boolean),
      status: form.kategori === "Karya" ? "Diarsipkan" : "Belum Diperiksa",
      statusColor: form.kategori === "Karya"
        ? "text-slate-600 bg-slate-100 border border-slate-200"
        : "text-[#B45309] bg-[#FEF9C3]",
      dot: form.kategori === "Karya" ? "bg-slate-400" : "bg-[#F59E0B]",
      poin: null,
      certificate: certificateBase64,
      isNew: true,
      createdAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...existing]));
    } catch (err) {
      setError("Gagal menyimpan data. File mungkin terlalu besar.");
      return;
    }

    setSuccessMsg(form.kategori === "Karya" ? "Karya berhasil ditambahkan!" : "Kegiatan berhasil ditambahkan!");

    setTimeout(() => {
      setSuccessMsg("");
      handleReset();
      if (form.kategori === "Karya") {
        navigate("/data-karya");
      } else {
        navigate("/pengajuan");
      }
    }, 1200);
  };

  const isLocked = typeof window !== "undefined" ? localStorage.getItem("skpi_lock_2020021001") === "true" : false;

  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="mx-auto max-w-3xl mb-6">
          <h1 className="text-[26px] font-bold text-[#0F172A] font-poppins">
            Tambah Kegiatan &amp; Karya
          </h1>
          <p className="text-[14px] text-[#94A3B8] mt-1 font-poppins">
            Catat kegiatan atau karya untuk melengkapi lembar SKPI-mu.
          </p>
        </div>

        {isLocked ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 max-w-4xl text-center flex flex-col items-center border border-gray-100 mx-auto">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 shadow-sm border border-red-100">
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] font-poppins">Akses Ditutup: SKPI Terkunci</h2>
            <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto leading-relaxed font-poppins">
              Transkrip SKPI final Anda telah resmi diterbitkan oleh Program Studi. Anda tidak diperkenankan lagi untuk menambahkan data kegiatan baru ke dalam lembar SKPI Anda.
            </p>
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-[#374151] rounded-xl text-sm font-semibold transition active:scale-[0.98] font-poppins"
              >
                Kembali ke Beranda
              </button>
              <button
                onClick={() => navigate("/pengajuan")}
                className="px-6 py-3 bg-[#0B5EA8] hover:bg-[#073864] text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98] font-poppins"
              >
                Lihat Riwayat &amp; Transkrip
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl bg-white rounded-2xl shadow-sm p-8 border border-gray-100">

            {/* Error Message */}
            {error && (
              <div className="mb-5 px-4 py-3 bg-[#FEE2E2] text-[#DC2626] rounded-xl text-[13px] font-medium font-poppins flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-5 px-4 py-3 bg-[#DCFCE7] text-[#16A34A] rounded-xl text-[13px] font-medium font-poppins flex items-center gap-2">
                <CheckCircle size={16} />
                {successMsg}
              </div>
            )}

            {/* 1. INFORMASI DASAR (Judul, Kategori, Tahun) */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <Award size={16} className="text-[#2563EB]" />
                <label className="text-[13px] font-medium text-[#374151] font-poppins">
                  {form.kategori === "Karya" ? "Judul Karya" : "Judul Kegiatan"} <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="text"
                value={form.judul}
                onChange={(e) => set("judul")(e.target.value)}
                placeholder={form.kategori === "Karya" ? "contoh: Sistem Informasi Lab Komputer" : "contoh: National Hackathon 2025"}
                className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] transition-colors font-poppins"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <SelectField
                label="Kategori"
                required={true}
                options={KATEGORI}
                value={form.kategori}
                onChange={handleKategoriChange}
                placeholder="Pilih Kategori"
              />
              <SelectField
                label="Tahun"
                required={true}
                options={TAHUN}
                value={form.tahun}
                onChange={set("tahun")}
                placeholder="Pilih Tahun"
              />
            </div>

            {/* 2. FORM KONDISIONAL BERDASARKAN KATEGORI */}

            {/* --- KONDISI 1: KARYA --- */}
            {form.kategori === "Karya" && (
              <>
                <div className="mb-5">
                  <SelectField
                    label="Bentuk Karya"
                    required={true}
                    options={BENTUK_KARYA}
                    value={form.bentukKarya}
                    onChange={set("bentukKarya")}
                    placeholder="Pilih Bentuk Karya"
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Tanggal Karya / Pembuatan"
                    value={form.tanggalSertifikat}
                    onChange={set("tanggalSertifikat")}
                    type="date"
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Tautan Karya / Portofolio"
                    placeholder="Masukkan tautan portofolio / GitHub / GDrive"
                    value={form.tautanSertifikat}
                    onChange={set("tautanSertifikat")}
                  />
                </div>
              </>
            )}

            {/* --- KONDISI 2: LOMBA --- */}
            {form.kategori === "Lomba" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <SelectField
                    label="Prestasi / Pencapaian"
                    required={true}
                    options={getJabatanOptions("Lomba")}
                    value={form.jabatan}
                    onChange={set("jabatan")}
                    placeholder="Pilih Prestasi"
                  />
                  <SelectField
                    label="Tingkatan"
                    required={true}
                    options={TINGKATAN}
                    value={form.tingkatan}
                    onChange={set("tingkatan")}
                    placeholder="Pilih Tingkatan"
                  />
                </div>

                <div className="mb-5">
                  <SelectField
                    label="Dosen Pembimbing Lomba (Opsional)"
                    options={DOSEN_PEMBIMBING}
                    value={form.pembimbing}
                    onChange={set("pembimbing")}
                    placeholder="Pilih Dosen Pembimbing"
                  />
                </div>

                {/* Anggota Tim */}
                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[#374151] mb-2 font-poppins">
                    Anggota Tim (Opsional)
                  </label>
                  {anggotaTim.map((anggota, index) => (
                    <div key={index} className="flex items-center gap-3 mb-2">
                      <input
                        type="text"
                        placeholder="Nama"
                        value={anggota.nama}
                        onChange={(e) => handleChangeAnggota(index, "nama", e.target.value)}
                        className="w-1/2 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors font-poppins"
                      />
                      <input
                        type="text"
                        placeholder="NPM"
                        value={anggota.npm}
                        onChange={(e) => handleChangeAnggota(index, "npm", e.target.value)}
                        className="w-1/3 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:bg-white transition-colors font-poppins"
                      />
                      {anggotaTim.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAnggota(index)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddAnggota}
                    className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition font-poppins"
                  >
                    <Plus size={16} /> Tambah Anggota
                  </button>
                </div>

                {/* Upload SK Pembimbing / Tim */}
                <div className="mb-5">
                  <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
                    Unggah SK Pembimbing / Tim
                  </label>
                  <div
                    onClick={() => skFileRef.current.click()}
                    onDrop={handleSkDrop}
                    onDragOver={(e) => { e.preventDefault(); setSkDragOver(true); }}
                    onDragLeave={() => setSkDragOver(false)}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      skDragOver ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB]"
                    }`}
                  >
                    <Upload size={20} className="text-[#64748B] mb-2" />
                    {skFile ? (
                      <p className="text-[13px] font-medium text-[#2563EB] font-poppins">{skFile.name}</p>
                    ) : (
                      <p className="text-[13px] text-[#64748B] font-poppins">Klik atau tarik file SK ke sini</p>
                    )}
                  </div>
                  <input
                    ref={skFileRef}
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={(e) => setSkFile(e.target.files[0])}
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Nomor Sertifikat"
                    placeholder="Masukkan nomor sertifikat"
                    value={form.nomorSertifikat}
                    onChange={set("nomorSertifikat")}
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Tanggal Sertifikat"
                    value={form.tanggalSertifikat}
                    onChange={set("tanggalSertifikat")}
                    type="date"
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Tautan Sertifikat"
                    placeholder="Masukkan tautan sertifikat"
                    value={form.tautanSertifikat}
                    onChange={set("tautanSertifikat")}
                  />
                </div>
              </>
            )}

            {/* --- KONDISI 3: NON-KARYA BIASA (Seminar, Organisasi, Kepanitiaan, Pelatihan, Publikasi, PKKMB, dll) --- */}
            {form.kategori !== "Karya" && form.kategori !== "Lomba" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <SelectField
                    label="Jabatan / Peran"
                    required={true}
                    options={getJabatanOptions(form.kategori)}
                    value={form.jabatan}
                    onChange={set("jabatan")}
                    placeholder="Pilih Jabatan"
                  />
                  <SelectField
                    label="Tingkatan"
                    required={true}
                    options={TINGKATAN}
                    value={form.tingkatan}
                    onChange={set("tingkatan")}
                    placeholder="Pilih Tingkatan"
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Nomor Sertifikat"
                    placeholder="Masukkan nomor sertifikat"
                    value={form.nomorSertifikat}
                    onChange={set("nomorSertifikat")}
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Tanggal Sertifikat"
                    value={form.tanggalSertifikat}
                    onChange={set("tanggalSertifikat")}
                    type="date"
                  />
                </div>

                <div className="mb-5">
                  <InputField
                    label="Tautan Sertifikat"
                    placeholder="Masukkan tautan sertifikat"
                    value={form.tautanSertifikat}
                    onChange={set("tautanSertifikat")}
                  />
                </div>
              </>
            )}

            {/* 3. UNGGAH DOKUMEN PENDUKUNG (UNIVERSAL) */}
            <div className="mb-8">
              <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
                {form.kategori === "Karya" ? "Unggah Dokumen Pendukung / File Karya" : "Unggah Dokumen Pendukung (Sertifikat)"}
              </label>
              <div
                onClick={() => fileRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  dragOver ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB]"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-blue-50 text-[#2563EB]"
                >
                  <Upload size={22} />
                </div>
                {file ? (
                  <p className="text-[14px] font-medium text-[#2563EB] font-poppins">{file.name}</p>
                ) : (
                  <>
                    <p className="text-[14px] text-[#64748B] font-poppins">Klik untuk upload atau tarik file ke sini</p>
                    <p className="text-[12px] text-[#94A3B8] mt-1 font-poppins">PNG, JPG, PDF (maks. 5MB)</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 text-white rounded-xl py-3 text-[14px] font-semibold transition-all hover:bg-blue-700 active:scale-[0.98] font-poppins bg-[#2563EB]"
              >
                <Check size={17} /> Simpan
              </button>
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 border border-[#E2E8F0] bg-white text-[#374151] rounded-xl py-3 text-[14px] font-semibold hover:bg-gray-50 transition-colors font-poppins"
              >
                <X size={17} /> Kosongkan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
