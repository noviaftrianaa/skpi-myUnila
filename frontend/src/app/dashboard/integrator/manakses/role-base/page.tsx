"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function ManaksesRoleBasePage() {
  return (
    <ComingSoonPage
      title="Role Base"
      parentModule="ManAkses"
      description="Halaman untuk mengelola dan sinkronisasi data role base access control dari sistem ManAkses UNILA."
      features={[
        "Sinkronisasi role pengguna",
        "Mapping hak akses aplikasi",
        "Manajemen permission",
        "Audit trail akses",
      ]}
    />
  );
}
