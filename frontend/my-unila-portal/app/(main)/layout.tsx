import { Navbar, Footer, BottomNav, ScrollToTop } from "@/components";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
      <BottomNav />
      <ScrollToTop />
    </>
  );
}
