// src/pages/mahasiswa/TambahKegiatan.jsx
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Upload, Check, X, ChevronDown } from "lucide-react";
import Sidebar from "../../components/common/SidebarMahasiswa";

const STORAGE_KEY = "skpi_kegiatan";

const KATEGORI  = ["Seminar", "Lomba", "Organisasi", "Kepanitiaan", "Pelatihan", "Publikasi"];
const TAHUN     = ["2025", "2024", "2023", "2022", "2021"];
const JABATAN   = ["Peserta", "Ketua", "Anggota", "Panitia", "Pembicara", "Juri"];
const TINGKATAN = ["Internasional", "Nasional", "Regional", "Provinsi", "Fakultas", "Jurusan"];

function SelectField({ label, options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-left hover:border-[#1D4ED8] transition-colors font-poppins"
        >
          <span className={value ? "text-[#0F172A]" : "text-[#94A3B8]"}>
            {value || placeholder}
          </span>
          <ChevronDown
            size={16}
            className={`text-[#94A3B8] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full px-4 py-2.5 text-left text-[14px] text-[#374151] hover:bg-[#EEF4FF] hover:text-[#1D4ED8] transition-colors font-poppins"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins"
      />
    </div>
  );
}

const EMPTY_FORM = {
  judul: "", kategori: "", tahun: "", jabatan: "",
  tingkatan: "", nomorSertifikat: "", tanggalSertifikat: "", tautanSertifikat: "",
};

export default function TambahKegiatan() {
  const navigate = useNavigate();
  const [form, setForm]       = useState(EMPTY_FORM);
  const [file, setFile]       = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError]     = useState("");
  const fileRef = useRef();

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setFile(null);
    setError("");
  };

  // Konversi File ke base64 string
  const fileToBase64 = (f) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result); // hasil: "data:image/png;base64,..."
      reader.onerror = () => reject(new Error("Gagal membaca file"));
      reader.readAsDataURL(f);
    });

  const handleSubmit = async () => {
    if (!form.judul.trim()) { setError("Judul kegiatan wajib diisi."); return; }
    if (!form.kategori)     { setError("Kategori wajib dipilih."); return; }
    if (!form.tahun)        { setError("Tahun wajib dipilih."); return; }
    setError("");

    // Konversi file sertifikat ke base64 jika ada
    let certificateBase64 = null;
    if (file) {
      try {
        certificateBase64 = await fileToBase64(file);
      } catch {
        setError("Gagal membaca file. Coba lagi.");
        return;
      }
    }

    // Baca data yang sudah ada dari localStorage
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    const newItem = {
      id:         Date.now(),
      title:      form.judul.trim(),
      date:       form.tanggalSertifikat || `${form.tahun}-01-01`,
      location:   "-",
      kategori:   form.kategori,
      tingkatan:  form.tingkatan,
      jabatan:    form.jabatan,
      nomorSertifikat:  form.nomorSertifikat,
      tautanSertifikat: form.tautanSertifikat,
      tags:        [form.kategori, form.tingkatan].filter(Boolean),
      status:     "Menunggu",
      statusColor: "text-[#B45309] bg-[#FEF9C3]",
      dot:        "bg-[#F59E0B]",
      poin:       null,
      certificate: certificateBase64, // null jika tidak ada file
      isNew:      true,
    };

    // Simpan ke localStorage — item terbaru di depan
    localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...existing]));

    handleReset();

    // Langsung arahkan ke halaman riwayat pengajuan
    navigate("/pengajuan");
  };

  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-[26px] font-bold text-[#0F172A] mb-6 font-poppins">
          Tambahkan Kegiatan
        </h1>

        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl">

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 bg-[#FEE2E2] text-[#DC2626] rounded-xl text-[13px] font-medium font-poppins">
              {error}
            </div>
          )}

          {/* Judul */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <Award size={16} className="text-[#6D28D9]" />
              <label className="text-[13px] font-medium text-[#374151] font-poppins">
                Judul Kegiatan
              </label>
            </div>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => set("judul")(e.target.value)}
              placeholder="contoh: National Hackathon 2025"
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1D4ED8] focus:bg-white transition-colors font-poppins"
            />
          </div>

          {/* Kategori + Tahun */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <SelectField label="Kategori"  options={KATEGORI} value={form.kategori}  onChange={set("kategori")}  placeholder="Pilih Kategori" />
            <SelectField label="Tahun"     options={TAHUN}    value={form.tahun}     onChange={set("tahun")}     placeholder="Pilih Tahun" />
          </div>

          {/* Jabatan + Tingkatan */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <SelectField label="Jabatan"   options={JABATAN}   value={form.jabatan}   onChange={set("jabatan")}   placeholder="Pilih Jabatan" />
            <SelectField label="Tingkatan" options={TINGKATAN} value={form.tingkatan} onChange={set("tingkatan")} placeholder="Pilih Tingkatan" />
          </div>

          {/* Nomor Sertifikat */}
          <div className="mb-5">
            <InputField label="Nomor Sertifikat" placeholder="Masukkan nomor sertifikat" value={form.nomorSertifikat} onChange={set("nomorSertifikat")} />
          </div>

          {/* Tanggal Sertifikat */}
          <div className="mb-5">
            <InputField label="Tanggal Sertifikat" placeholder="" value={form.tanggalSertifikat} onChange={set("tanggalSertifikat")} type="date" />
          </div>

          {/* Tautan Sertifikat */}
          <div className="mb-5">
            <InputField label="Tautan Sertifikat" placeholder="Masukkan tautan sertifikat" value={form.tautanSertifikat} onChange={set("tautanSertifikat")} />
          </div>

          {/* Upload */}
          <div className="mb-8">
            <label className="block text-[13px] font-medium text-[#374151] mb-1.5 font-poppins">
              Unggah Dokumen Pendukung
            </label>
            <div
              onClick={() => fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragOver ? "border-[#1D4ED8] bg-[#EEF4FF]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#1D4ED8]"
              }`}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.1) 0%, rgba(58,184,186,0.1) 100%)" }}
              >
                <Upload size={22} className="text-[#0B5EA8]" />
              </div>
              {file ? (
                <p className="text-[14px] font-medium text-[#1D4ED8] font-poppins">{file.name}</p>
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

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 bg-[#0B5EA8] text-white rounded-xl py-3 text-[14px] font-semibold transition-all hover:opacity-90 active:scale-[0.98] font-poppins"
              style={{ boxShadow: "0px 4px 6px -4px #6D28D933, 0px 10px 15px -3px #6D28D933" }}
            >
              <Check size={17} /> Submit Activity
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 border border-[#E2E8F0] text-[#64748B] rounded-xl py-3 text-[14px] font-semibold hover:bg-[#F8FAFC] transition-colors font-poppins"
            >
              <X size={17} /> Reset Form
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}