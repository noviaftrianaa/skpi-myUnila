import { useMemo } from 'react';

interface MenuPermission {
  show: number;
  insert: number;
  update: number;
  delete: number;
}

interface PermissionData {
  is_super_role?: boolean;
  apps?: Record<string, Record<string, MenuPermission>>;
}

interface UsePermissionResult {
  canShow: boolean;
  canInsert: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isReadOnly: boolean;
  isSuperRole: boolean;
  loaded: boolean;
}

/**
 * Hook to check CRUD permissions for a menu path
 * Uses permissions from user context (cached in Redis)
 *
 * @param menuPath - The menu path to check (e.g. "/dashboard/pimpinan/mahasiswa")
 * @param permissions - The permissions data from user context API
 */
export function usePermission(menuPath: string, permissions?: PermissionData | null): UsePermissionResult {
  return useMemo(() => {
    if (!permissions) {
      return { canShow: true, canInsert: true, canUpdate: true, canDelete: true, isReadOnly: false, isSuperRole: false, loaded: false };
    }

    if (permissions.is_super_role) {
      return { canShow: true, canInsert: true, canUpdate: true, canDelete: true, isReadOnly: false, isSuperRole: true, loaded: true };
    }

    // Find matching menu across all apps
    const apps = permissions.apps || {};
    for (const appId of Object.keys(apps)) {
      const menus = apps[appId];

      // Exact match first
      if (menus[menuPath]) {
        const p = menus[menuPath];
        return {
          canShow: !!p.show,
          canInsert: !!p.insert,
          canUpdate: !!p.update,
          canDelete: !!p.delete,
          isReadOnly: !!p.show && !p.insert && !p.update && !p.delete,
          isSuperRole: false,
          loaded: true,
        };
      }

      // Longest prefix match
      let bestMatch: MenuPermission | null = null;
      let bestLen = 0;
      for (const path of Object.keys(menus)) {
        if (menuPath.startsWith(path) && path.length > bestLen) {
          bestMatch = menus[path];
          bestLen = path.length;
        }
      }
      if (bestMatch) {
        return {
          canShow: !!bestMatch.show,
          canInsert: !!bestMatch.insert,
          canUpdate: !!bestMatch.update,
          canDelete: !!bestMatch.delete,
          isReadOnly: !!bestMatch.show && !bestMatch.insert && !bestMatch.update && !bestMatch.delete,
          isSuperRole: false,
          loaded: true,
        };
      }
    }

    // No match = allow (permissive mode)
    return { canShow: true, canInsert: true, canUpdate: true, canDelete: true, isReadOnly: false, isSuperRole: false, loaded: true };
  }, [menuPath, permissions]);
}
