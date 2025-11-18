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
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: "Statistik",
      href: "/statistik",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      name: "Layanan",
      href: "/layanan",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: "Tentang",
      href: "/tentang",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-lg"
    >
      <div className="flex items-center justify-around h-14 sm:h-16 px-1.5 sm:px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const isExternal = item.href.startsWith('http');
          const Component = isExternal ? 'a' : Link;

          return (
            <Component
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full group transition-all duration-300"
            >
              {/* Active/Hover Background */}
              <motion.div
                className={`
                  absolute inset-0 mx-2 rounded-2xl transition-all duration-300
                  ${active
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
                    : 'bg-transparent group-hover:bg-gray-50'
                  }
                `}
                animate={{
                  scale: active ? 1 : 0.95,
                  opacity: active ? 1 : 0,
                }}
                whileHover={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
              />

              {/* Icon */}
              <motion.div
                className="relative z-10"
                animate={{
                  scale: active ? 1.05 : 1,
                  y: active ? -2 : 0,
                }}
                whileHover={{
                  scale: 1.1,
                  y: -3,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    mb-0.5 sm:mb-1 transition-all duration-300
                    ${active
                      ? 'text-myunila filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                      : 'text-gray-400 group-hover:text-myunila group-hover:drop-shadow-[0_2px_4px_rgba(59,130,246,0.2)]'
                    }
                  `}
                >
                  {item.icon}
                </div>

                {/* Active Indicator Dot */}
                {active && (
                  <motion.div
                    layoutId="bottom-nav-dot"
                    className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                className={`
                  text-[9px] sm:text-[10px] font-semibold transition-all duration-300 relative z-10
                  ${active
                    ? 'text-myunila font-bold'
                    : 'text-gray-500 group-hover:text-myunila group-hover:font-semibold'
                  }
                `}
                animate={{
                  y: active ? 0 : 0,
                  scale: active ? 1.05 : 1,
                }}
                whileHover={{
                  scale: 1.05,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.name}
              </motion.span>
            </Component>
          );
        })}
      </div>

      {/* Safe Area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </motion.nav>
  );
}
