"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
} from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/modules/auth";
import Logo from "../common/Logo";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { isAuthenticated } = useAuth();

  const menuItems = [
    {
      name: "Beranda",
      href: "/",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: "Statistik",
      href: "/statistik",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      name: "Akademik",
      href: "/akademik",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      name: "Layanan",
      href: "/layanan",
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
    },
  ];

  // Detect scroll for navbar style change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if route is active
  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Top Navbar */}
      <HeroNavbar
        maxWidth="full"
        height="5rem"
        isBordered={false}
        shouldHideOnScroll={false}
        isBlurred={scrolled}
        classNames={{
          base: scrolled ? "bg-white/95 backdrop-blur-xl border-b-0" : "bg-white/[0.02] backdrop-blur-sm border-b-0",
          wrapper: "container mx-auto px-4 sm:px-6 overflow-visible py-2",
          item: "data-[active=true]:text-myunila overflow-visible",
        }}
        className="transition-all duration-700 ease-in-out overflow-visible fixed top-0 left-0 right-0 z-50 shadow-none"
        style={{
          boxShadow: scrolled ? "0 4px 20px -4px rgba(0, 0, 0, 0.08)" : "none",
          transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo (Left side) - Always visible */}
        <NavbarContent justify="start" className="flex-1">
          <NavbarBrand className="gap-2 sm:gap-3 ml-0 sm:ml-8">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={!scrolled && !isHomePage ? "drop-shadow-lg" : ""}
              >
                <Logo
                  size="sm"
                  color={scrolled || isHomePage ? "text-myunila" : "text-white"}
                />
              </motion.div>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        {/* Desktop Menu (Center) - Hidden on mobile */}
        <NavbarContent className="hidden lg:flex gap-6 xl:gap-8" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.name} isActive={isActive(item.href)}>
              <Link
                href={item.href}
                className={`relative font-semibold text-sm xl:text-base transition-all duration-300 py-2.5 px-3 xl:py-3 xl:px-4 rounded-lg inline-flex ${
                  isActive(item.href)
                    ? scrolled
                      ? "text-myunila bg-blue-50"
                      : isHomePage
                        ? "text-blue-700 bg-blue-100/90"
                        : "text-white bg-white/20"
                    : scrolled
                      ? "text-gray-700 hover:text-myunila hover:bg-gray-50"
                      : isHomePage
                        ? "text-blue-700 bg-blue-50/80 hover:bg-blue-100/90"
                        : "text-white hover:bg-white/20"
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  <span className="whitespace-nowrap">{item.name}</span>
                </span>
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* CTA Buttons (Right side) */}
        <NavbarContent justify="end" className="flex-1">
          <NavbarItem className="ml-auto mr-0 sm:mr-6">
            {isAuthenticated ? (
              <Button
                as={Link}
                href="/dashboard"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 sm:px-6 md:px-8 py-1 shadow-md rounded-lg text-xs sm:text-sm"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                as={Link}
                href="/login"
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-4 sm:px-6 md:px-8 py-1 shadow-md rounded-lg text-xs sm:text-sm"
              >
                Login SSO
              </Button>
            )}
          </NavbarItem>
        </NavbarContent>
      </HeroNavbar>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl pb-safe">
        <div className="grid grid-cols-4 h-16">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                isActive(item.href)
                  ? "text-myunila bg-blue-50"
                  : "text-gray-600 hover:text-myunila hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <div className={`${isActive(item.href) ? "scale-110" : ""} transition-transform duration-300`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
