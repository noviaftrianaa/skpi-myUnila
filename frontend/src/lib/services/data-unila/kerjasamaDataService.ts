import { dashboardClient } from '@/lib/api/dashboardClient';
export const kerjasamaDataService = {
  async getList(p: Record<string,any>) { return (await dashboardClient.get('/data/kerjasama', {params:p})).data.data; },
  async getStats() { return (await dashboardClient.get('/data/kerjasama/stats')).data.data; },
};
export default kerjasamaDataService;
