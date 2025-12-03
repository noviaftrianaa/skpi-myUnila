"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SikepJabfungPage() {
  return (
    <ComingSoonPage
      title="Jabatan Fungsional"
      parentModule="Data SIKEP"
      description="Halaman untuk mengelola dan sinkronisasi data jabatan fungsional dari sistem SIKEP UNILA."
      features={[
        "Sinkronisasi jabatan fungsional dosen",
        "Riwayat kenaikan jabfung",
        "Integrasi dengan SISTER",
        "Validasi data jabfung",
      ]}
    />
  );
}
