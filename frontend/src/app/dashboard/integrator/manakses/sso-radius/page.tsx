"use client";

import ComingSoonPage from "@/shared/components/myunila-integrator/ComingSoonPage";

export default function ManaksesSsoRadiusPage() {
  return (
    <ComingSoonPage
      title="SSO Radius"
      parentModule="ManAkses"
      description="Halaman untuk mengelola dan sinkronisasi data SSO Radius dari sistem ManAkses UNILA."
      features={[
        "Sinkronisasi akun SSO",
        "Integrasi autentikasi radius",
        "Manajemen akses WiFi kampus",
        "Log aktivitas login",
      ]}
    />
  );
}
