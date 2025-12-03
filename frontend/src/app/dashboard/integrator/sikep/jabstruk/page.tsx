"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SikepJabstrukPage() {
  return (
    <ComingSoonPage
      title="Jabatan Struktural"
      parentModule="Data SIKEP"
      description="Halaman untuk mengelola dan sinkronisasi data jabatan struktural dari sistem SIKEP UNILA."
      features={[
        "Sinkronisasi jabatan struktural",
        "Riwayat mutasi jabatan",
        "Struktur pejabat universitas",
        "Masa jabatan dan periode",
      ]}
    />
  );
}
