"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduStatusKuliahPage() {
  return (
    <ComingSoonPage
      title="Status Kuliah"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data status kuliah mahasiswa dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi status kuliah",
        "Histori perubahan status",
        "Integrasi dengan Neo Feeder",
        "Rekap mahasiswa per status",
      ]}
    />
  );
}
