"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiranduPresensiDosenPage() {
  return (
    <ComingSoonPage
      title="Presensi Dosen"
      parentModule="Sirandu"
      description="Halaman untuk mengelola dan sinkronisasi data presensi dosen dari sistem Sirandu UNILA."
      features={[
        "Sinkronisasi kehadiran dosen",
        "Rekap mengajar per dosen",
        "Validasi dengan jadwal kuliah",
        "Laporan pengajaran",
      ]}
    />
  );
}
