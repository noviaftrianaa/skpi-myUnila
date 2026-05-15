import { dashboardClient } from '@/lib/api/dashboardClient';

export interface SurveyAtasanItem {
  id: string;
  id_pd: string | null;
  nama_lulusan: string;
  nim: string;
  nm_prodi: string;
  nm_fakultas: string;
  nm_atasan: string | null;
  email_atasan: string | null;
  jabatan_atasan: string | null;
  nm_tmpt_bekerja: string | null;
  bidang_tempat_bekerja: string | null;
  alamat_tmpt_kerja: string | null;
  kepuasan_terhadap_alumni: string | null;
  kompetensi_perusahaan: string | null;
  metode_pembelajaran: string | null;
  saran: string | null;
  harapan: string | null;
  tgl_pengisian: string | null;
}

export interface SurveyAtasanStats {
  total: number;
  total_prodi: number;
  total_employer: number;
  total_tracer: number;
  coverage_pct: number;
}

export const tracerDataService = {
  async getList(p: Record<string,any>) { return (await dashboardClient.get('/data/tracer', {params:p})).data.data; },
  async getStats(p: Record<string,any>={}) { return (await dashboardClient.get('/data/tracer/stats', {params:p})).data.data; },
  async getSurveyAtasanList(p: Record<string,any>={}) { return (await dashboardClient.get('/data/tracer/survey-atasan', {params:p})).data.data; },
  async getSurveyAtasanStats(p: Record<string,any>={}): Promise<SurveyAtasanStats> { return (await dashboardClient.get('/data/tracer/survey-atasan/stats', {params:p})).data.data; },
};
export default tracerDataService;
