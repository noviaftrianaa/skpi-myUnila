"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduPegawaiPage() {
  return (
    <ComingSoonPage
      title="Pegawai"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data pegawai/dosen dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi data dosen pengajar",
        "Integrasi dengan SIKEP",
        "Data homebase dan unit kerja",
        "Status kepegawaian",
      ]}
    />
  );
}
