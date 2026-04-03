import { dashboardClient } from '@/lib/api/dashboardClient';
export const akademikDataService = {
  async getProdi(p: Record<string,any>) { return (await dashboardClient.get('/data/akademik/prodi', {params:p})).data.data; },
  async getAkreditasi(p: Record<string,any>) { return (await dashboardClient.get('/data/akademik/akreditasi', {params:p})).data.data; },
  async getMatkul(p: Record<string,any>) { return (await dashboardClient.get('/data/akademik/matkul', {params:p})).data.data; },
};
export default akademikDataService;
