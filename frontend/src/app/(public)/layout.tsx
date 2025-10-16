import { Navbar, Footer, BottomNav } from "@/shared/components/layouts";
import { ScrollToTop } from "@/shared/components/common";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <ScrollToTop />
    </>
  );
}
