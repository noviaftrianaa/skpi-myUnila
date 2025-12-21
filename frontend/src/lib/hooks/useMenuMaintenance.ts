/**
 * useMenuMaintenance Hook
 *
 * Check if current route is under maintenance (a_tampil = 0)
 * based on the menu data from RBAC API
 */

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { MenuItem } from '@/lib/types/dashboardTypes';

interface MaintenanceInfo {
  isMaintenance: boolean;
  menuName: string | null;
  menuIcon: string | null;
}

/**
 * Recursively find menu item by href
 */
const findMenuByHref = (menus: MenuItem[], href: string): MenuItem | null => {
  for (const menu of menus) {
    // Check if this menu matches
    if (menu.href && menu.href === href) {
      return menu;
    }
    // Check children recursively
    if (menu.children && menu.children.length > 0) {
      const found = findMenuByHref(menu.children, href);
      if (found) {
        // If child is under maintenance, return the child
        // Otherwise check if parent is under maintenance
        if (found.isMaintenance) {
          return found;
        }
        // Also check parent's maintenance status
        if (menu.isMaintenance) {
          return menu;
        }
        return found;
      }
    }
  }
  return null;
};

/**
 * Find parent menu by child href
 */
const findParentMenu = (menus: MenuItem[], childHref: string): MenuItem | null => {
  for (const menu of menus) {
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (child.href === childHref) {
          return menu;
        }
      }
      // Check deeper levels
      const found = findParentMenu(menu.children, childHref);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Hook to check if current route is under maintenance
 */
export function useMenuMaintenance(menus: MenuItem[]): MaintenanceInfo {
  const pathname = usePathname();

  return useMemo(() => {
    if (!pathname || menus.length === 0) {
      return {
        isMaintenance: false,
        menuName: null,
        menuIcon: null,
      };
    }

    // Find menu by current path
    const currentMenu = findMenuByHref(menus, pathname);

    if (currentMenu) {
      // Check if current menu is under maintenance
      if (currentMenu.isMaintenance) {
        return {
          isMaintenance: true,
          menuName: currentMenu.title,
          menuIcon: currentMenu.iconName || null,
        };
      }

      // Check if parent menu is under maintenance (for child routes)
      const parentMenu = findParentMenu(menus, pathname);
      if (parentMenu && parentMenu.isMaintenance) {
        return {
          isMaintenance: true,
          menuName: parentMenu.title,
          menuIcon: parentMenu.iconName || null,
        };
      }
    }

    return {
      isMaintenance: false,
      menuName: null,
      menuIcon: null,
    };
  }, [pathname, menus]);
}

export default useMenuMaintenance;
