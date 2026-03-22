import { authClient } from '@/lib/api/authClient';

export interface MatrixMenu {
  id_menu: string;
  nm_menu: string;
  nm_file: string;
  urutan_menu: number;
  level_menu: number;
  id_group_menu: string | null;
}

export interface MatrixRole {
  id_peran: number;
  nm_peran: string;
}

export interface MenuPermissions {
  show: number;
  insert: number;
  update: number;
  delete: number;
}

export interface MatrixData {
  menus: MatrixMenu[];
  roles: MatrixRole[];
  all_roles: MatrixRole[];
  assignments: Record<number, Record<string, MenuPermissions>>;
}

export interface MatrixChange {
  id_peran: number;
  id_menu: string;
  show: number;
  insert: number;
  update: number;
  delete: number;
}

const rbacMatrixService = {
  async getMatrix(appId: string): Promise<MatrixData> {
    const res = await authClient.get(`/manakses/menu-role/matrix?app_id=${appId}`);
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  },

  async bulkUpdate(appId: string, changes: MatrixChange[]): Promise<{ updated: number; inserted: number; deleted: number }> {
    const res = await authClient.post('/manakses/menu-role/matrix/bulk', { app_id: appId, changes });
    if (!res.data.success) throw new Error(res.data.message);
    return res.data.data;
  },
};

export default rbacMatrixService;
