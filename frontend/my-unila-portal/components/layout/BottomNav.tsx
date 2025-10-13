"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Beranda",
      href: "/",
      icon: (
        <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: "Statistik",
      href: "/statistik",
      icon: (
        <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      name: "Akademik",
      href: "/akademik",
      icon: (
        <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      name: "Layanan",
      href: "/layanan",
      icon: (
        <svg className="w-7 h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg"
    >
      <div className="flex items-center justify-around h-20 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group"
            >
              {/* Active Background */}
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 mx-2 rounded-2xl bg-gradient-blue-modern/10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon */}
              <motion.div
                className="relative"
                animate={{
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    mb-1 transition-all duration-200
                    ${active ? 'text-myunila drop-shadow-lg' : 'text-gray-400 group-hover:text-myunila'}
                  `}
                >
                  {item.icon}
                </div>

                {/* Active Dot */}
                {active && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-blue-modern rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                className={`
                  text-xs font-semibold transition-colors duration-200 relative z-10
                  ${active ? 'text-myunila' : 'text-gray-500 group-hover:text-myunila'}
                `}
                animate={{
                  y: active ? -2 : 0,
                }}
              >
                {item.name}
              </motion.span>

              {/* Ripple Effect on Tap */}
              <motion.div
                className="absolute inset-0"
                whileTap={{ scale: 0.95 }}
              />
            </Link>
          );
        })}
      </div>

      {/* Safe Area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </motion.nav>
  );
}
