"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { MenuItem } from "@/lib/types/dashboard.types";

interface BottomNavigationProps {
  menuItems: MenuItem[]; // Max 4-5 items untuk bottom nav
}

export default function BottomNavigation({ menuItems }: BottomNavigationProps) {
  const pathname = usePathname();

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  // Only show max 4 items for bottom nav
  const displayItems = menuItems.slice(0, 4);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 shadow-2xl safe-area-pb">
      {/* Decorative top gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <nav className="flex items-center justify-around px-2 py-2">
        {displayItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.title}
              href={item.href || "#"}
              className="relative flex flex-col items-center justify-center w-full py-2 px-1 group touch-manipulation"
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
              )}

              {/* Icon container */}
              <div
                className={`relative flex items-center justify-center w-12 h-10 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg scale-110"
                    : "bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-700 group-active:scale-95"
                }`}
              >
                <div className={active ? "text-white" : "text-gray-600 dark:text-gray-300"}>
                  {item.icon}
                </div>

                {/* Glow effect */}
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl opacity-20 blur-lg"></div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium mt-1 transition-colors truncate max-w-[70px] ${
                  active
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {item.title}
              </span>

              {/* Animated underline on active */}
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
