import Sidebar from "../../components/common/SidebarMahasiswa";

export default function ValidasiSertif() {
  return (
    <div className="flex bg-[#F4F6FB] min-h-screen">
      <Sidebar admin />

      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h1 className="text-[28px] font-bold mb-8">
            Validasi Sertifikat
          </h1>

          <div className="border rounded-2xl p-10 text-center">
            Preview Sertifikat
          </div>

          <div className="flex gap-4 mt-6">
            <button className="bg-green-500 text-white px-6 py-3 rounded-xl">
              Validasi
            </button>

            <button className="bg-red-500 text-white px-6 py-3 rounded-xl">
              Tolak
            </button>
          </div>
                </div>
      </main>
    </div>
  );
}