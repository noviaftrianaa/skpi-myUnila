"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Beranda",
      href: "/",
      icon: (
        <svg className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      )
    },
    {
      name: "Statistik",
      href: "/statistik",
      icon: (
        <svg className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    {
      name: "Layanan",
      href: "/layanan",
      icon: (
        <svg className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: "Tentang",
      href: "/tentang",
      icon: (
        <svg className="w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
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
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4"
      style={{
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      <style jsx>{`
        nav * {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          outline: none !important;
          tap-highlight-color: transparent !important;
        }
        nav *:focus,
        nav *:active {
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
        }

        /* Disable hover effects on mobile/touch devices */
        @media (max-width: 640px) {
          nav *:hover,
          nav *:focus,
          nav *:active,
          nav *:focus-visible {
            background: none !important;
            background-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          nav a:hover,
          nav a:focus,
          nav a:active,
          nav a:focus-visible,
          nav button:hover,
          nav button:focus,
          nav button:active,
          nav button:focus-visible {
            background: none !important;
            background-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Force hide any pseudo elements that might create boxes */
          nav *::before,
          nav *::after {
            display: none !important;
          }
        }

        /* Also disable hover on touch-capable devices */
        @media (hover: none) and (pointer: coarse) {
          nav *:hover,
          nav *:focus,
          nav *:active,
          nav *:focus-visible {
            background: none !important;
            background-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          nav a:hover,
          nav a:focus,
          nav a:active,
          nav a:focus-visible,
          nav button:hover,
          nav button:focus,
          nav button:active,
          nav button:focus-visible {
            background: none !important;
            background-color: transparent !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Force hide any pseudo elements that might create boxes */
          nav *::before,
          nav *::after {
            display: none !important;
          }
        }
      `}</style>
      <div className="flex items-center justify-around h-16 px-1 max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group px-2"
              style={{
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
                userSelect: 'none',
                touchAction: 'manipulation',
                border: 'none',
                background: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              onFocus={(e) => e.currentTarget.blur()}
            >
              {/* Background Box - Shows on active or tap */}
              <motion.div
                className={`absolute inset-y-2 inset-x-0.5 rounded-xl ${
                  active
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50'
                    : ''
                }`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: active ? 1 : 0.9,
                  opacity: active ? 1 : 0
                }}
                whileTap={{
                  scale: 1,
                  opacity: 1,
                  backgroundColor: 'rgba(239, 246, 255, 0.5)' // blue-50 with opacity
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
                  y: active ? -1 : 0,
                }}
                whileTap={{
                  scale: 0.95,
                }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    mb-0.5 transition-all duration-300
                    ${active
                      ? 'text-myunila filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                      : 'text-gray-400'
                    }
                  `}
                >
                  {item.icon}
                </div>
              </motion.div>

              {/* Label */}
              <motion.span
                className={`
                  text-[9px] sm:text-[10px] font-semibold transition-all duration-300 relative z-10
                  ${active
                    ? 'text-myunila font-bold'
                    : 'text-gray-500'
                  }
                `}
                animate={{
                  y: active ? 0 : 0,
                  scale: active ? 1.05 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {item.name}
              </motion.span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
