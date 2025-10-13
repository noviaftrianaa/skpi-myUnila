"use client";

import { ReactNode } from "react";
import Navbar from "../layout/Navbar";
import BottomNav from "../layout/BottomNav";
import Footer from "../layout/Footer";

interface MainLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showBottomNav?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function MainLayout({
  children,
  showNavbar = true,
  showBottomNav = true,
  showFooter = true,
  className = "",
}: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      {showNavbar && <Navbar />}

      {/* Main Content */}
      <main className={`flex-grow ${className} ${showBottomNav ? 'pb-20 lg:pb-0' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      {showBottomNav && <BottomNav />}

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}
