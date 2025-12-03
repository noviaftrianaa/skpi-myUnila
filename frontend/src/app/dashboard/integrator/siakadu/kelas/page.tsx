"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduKelasPage() {
  return (
    <ComingSoonPage
      title="Kelas"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data kelas perkuliahan dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi data kelas kuliah",
        "Jadwal dan ruang kelas",
        "Dosen pengampu kelas",
        "Kapasitas dan kuota",
      ]}
    />
  );
}
