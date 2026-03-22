import { dashboardClient } from '@/lib/api/dashboardClient';
export const tracerDataService = {
  async getList(p: Record<string,any>) { return (await dashboardClient.get('/data/tracer', {params:p})).data.data; },
  async getStats(p: Record<string,any>={}) { return (await dashboardClient.get('/data/tracer/stats', {params:p})).data.data; },
};
export default tracerDataService;
