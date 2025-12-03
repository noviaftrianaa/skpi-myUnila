"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function SikepUnitOrgaPage() {
  return (
    <ComingSoonPage
      title="Unit Organisasi"
      parentModule="Data SIKEP"
      description="Halaman untuk mengelola dan sinkronisasi data unit organisasi dari sistem SIKEP UNILA."
      features={[
        "Sinkronisasi struktur organisasi UNILA",
        "Hierarki unit kerja",
        "Mapping unit ke sistem lain",
        "Manajemen kode unit",
      ]}
    />
  );
}
