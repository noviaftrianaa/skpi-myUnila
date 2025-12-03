"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SiakaduWisudaPage() {
  return (
    <ComingSoonPage
      title="Wisuda"
      parentModule="Data Siakadu"
      description="Halaman untuk mengelola dan sinkronisasi data wisuda dari sistem Siakadu UNILA."
      features={[
        "Sinkronisasi data wisudawan",
        "Periode dan gelombang wisuda",
        "Validasi kelulusan",
        "Rekap wisudawan per fakultas",
      ]}
    />
  );
}
