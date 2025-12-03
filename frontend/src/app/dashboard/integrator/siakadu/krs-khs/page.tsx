"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduKrsKhsPage() {
  return (
    <ComingSoonPage
      title="KRS/KHS"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data KRS dan KHS dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi data KRS mahasiswa",
        "Rekap KHS per semester",
        "Integrasi nilai ke Neo Feeder",
        "IPK dan IPS mahasiswa",
      ]}
    />
  );
}
