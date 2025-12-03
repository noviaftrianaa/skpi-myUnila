"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduMahasiswaPage() {
  return (
    <ComingSoonPage
      title="Mahasiswa"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data mahasiswa dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi data mahasiswa aktif",
        "Integrasi dengan Neo Feeder PDDIKTI",
        "Filter berdasarkan fakultas/prodi",
        "Histori status mahasiswa",
      ]}
    />
  );
}
