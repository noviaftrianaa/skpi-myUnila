"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
    );
  }

  const currentTheme = theme === "system" ? systemTheme : theme;

  const getThemeIcon = () => {
    if (theme === "system") {
      return <FiMonitor className="w-5 h-5" />;
    }
    return currentTheme === "dark" ? (
      <FiMoon className="w-5 h-5" />
    ) : (
      <FiSun className="w-5 h-5" />
    );
  };

  const themes = [
    {
      key: "light",
      label: "Light",
      icon: <FiSun className="w-4 h-4" />,
      description: "Tema terang",
    },
    {
      key: "dark",
      label: "Dark",
      icon: <FiMoon className="w-4 h-4" />,
      description: "Tema gelap",
    },
    {
      key: "system",
      label: "System",
      icon: <FiMonitor className="w-4 h-4" />,
      description: "Mengikuti sistem",
    },
  ];

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <button
          className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Theme switcher"
        >
          {getThemeIcon()}
        </button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Theme selection"
        selectedKeys={new Set([theme || "system"])}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          setTheme(selected);
        }}
        className="w-48"
        classNames={{
          base: "bg-white dark:bg-gray-800",
          list: "bg-white dark:bg-gray-800",
        }}
        itemClasses={{
          base: [
            "rounded-lg",
            "bg-white",
            "dark:bg-gray-800",
            "data-[hover=true]:bg-gray-100",
            "data-[hover=true]:dark:bg-gray-700",
            "data-[selected=true]:bg-blue-50",
            "data-[selected=true]:dark:bg-blue-900/20",
            "data-[selected=true]:text-blue-600",
            "data-[selected=true]:dark:text-blue-400",
            "transition-colors",
          ],
        }}
      >
        {themes.map((themeOption) => (
          <DropdownItem
            key={themeOption.key}
            startContent={themeOption.icon}
            textValue={themeOption.label}
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{themeOption.label}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {themeOption.description}
              </span>
            </div>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
