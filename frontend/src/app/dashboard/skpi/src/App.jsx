// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";

/* =========================
   MAHASISWA
========================= */
import Dashboard from "./pages/mahasiswa/Dashboard";
import TambahKegiatan from "./pages/mahasiswa/TambahKegiatan";
import Pengajuan from "./pages/mahasiswa/Pengajuan";
import DataKarya from "./pages/mahasiswa/DataKarya";
import Notifikasi from "./pages/mahasiswa/Notifikasi";

/* =========================
   ADMIN
========================= */
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ValidasiAdmin from "./pages/admin/Validasi";
import ValidasiSertifAdmin from "./pages/admin/ValidasiSertif";
import DataKaryaAdmin from "./pages/admin/DataKaryaAdmin";

/* =========================
   DOSEN
========================= */
import DashboardDosen from "./pages/dosen/DashboardDosen";

function RootRedirect() {
  const bypassRole = typeof window !== "undefined" ? localStorage.getItem("bypass_role") : "mahasiswa";
  
  if (bypassRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (bypassRole === "dosen") {
    return <Navigate to="/dosen/dashboard" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* REDIRECT */}
      <Route
        path="/"
        element={<RootRedirect />}
      />

      {/* =========================
          MAHASISWA
      ========================= */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/tambah-kegiatan"
        element={<TambahKegiatan />}
      />

      <Route
        path="/pengajuan"
        element={<Pengajuan />}
      />

      <Route
        path="/data-karya"
        element={<DataKarya />}
      />

      <Route
        path="/notifikasi"
        element={<Notifikasi />}
      />

      {/* =========================
          ADMIN
      ========================= */}
      <Route path="/admin/dashboard" element={<DashboardAdmin />} />
      <Route path="/admin/validasi" element={<ValidasiAdmin />} />
      <Route path="/admin/validasi/:id" element={<ValidasiSertifAdmin />} />
      <Route path="/admin/data-karya" element={<DataKaryaAdmin />} />

      {/* =========================
          DOSEN
      ========================= */}
      <Route
        path="/dosen/dashboard"
        element={<DashboardDosen />}
      />
    </Routes>
  );
}