"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiranduPresensiMahasiswaPage() {
  return (
    <ComingSoonPage
      title="Presensi Mahasiswa"
      parentModule="Sirandu"
      description="Halaman untuk mengelola dan sinkronisasi data presensi mahasiswa dari sistem Sirandu UNILA."
      features={[
        "Sinkronisasi kehadiran mahasiswa",
        "Rekap presensi per kelas",
        "Integrasi dengan Neo Feeder",
        "Notifikasi ketidakhadiran",
      ]}
    />
  );
}
