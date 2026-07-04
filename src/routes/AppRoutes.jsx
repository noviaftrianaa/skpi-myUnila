// src/App.jsx

import { Routes, Route, Navigate } from "react-router-dom";

/* =========================
   MAHASISWA
========================= */
import Dashboard from "./pages/mahasiswa/Dashboard";
import TambahKegiatan from "./pages/mahasiswa/TambahKegiatan";
import Pengajuan from "./pages/mahasiswa/Pengajuan";
import Notifikasi from "./pages/mahasiswa/Notifikasi";

/* =========================
   ADMIN
========================= */
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import Validasi from "./pages/admin/Validasi";

/* =========================
   DOSEN
========================= */
import DashboardDosen from "./pages/dosen/DashboardDosen";

export default function App() {
  return (
    <Routes>
      {/* REDIRECT */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" />}
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
        path="/notifikasi"
        element={<Notifikasi />}
      />

      {/* =========================
          ADMIN
      ========================= */}
      <Route
        path="/admin/dashboard"
        element={<DashboardAdmin />}
      />

      <Route
        path="/admin/validasi"
        element={<Validasi />}
      />

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