const BASE_URL =
  typeof window !== 'undefined'
    ? `${process.env.NEXT_PUBLIC_API_URL}/dashboard-service/api/v1`
    : 'http://localhost:9800/dashboard-service/api/v1';

export interface IkuItem {
  id: number;
  code: string;
  title: string;
  definition?: string;
  value: number;
  target: number;
  color: string;
  description?: string;
  unit?: string;
  perJenjang?: Array<{ jenjang: string; value: number }>;
  trendData?: Array<{ name: string; value: number }>;
  drilldownData?: Array<{ id: string; name: string; value: number; target: number; status: string }>;
  // IKU 2 specific
  statusBreakdown?: { bekerja?: number; studiLanjut?: number; wirausaha?: number };
}

export interface IkuData {
  ikuWajib: number[];
  ikuOpsional: IkuItem[];
  iku1?: IkuItem | null;
  iku2?: IkuItem | null;
  iku3?: IkuItem | null;
  iku5?: IkuItem | null;
  iku7?: IkuItem | null;
  iku9?: IkuItem | null;
}

const ikuDataService = {
  async getData(params?: { tahun?: number; fakultas?: string }): Promise<IkuData> {
    const qp = new URLSearchParams();
    if (params?.tahun) qp.append('tahun', String(params.tahun));
    if (params?.fakultas) qp.append('fakultas', params.fakultas);
    const url = `${BASE_URL}/dashboard/iku?${qp.toString()}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Failed to fetch IKU data');
    return json.data;
  },
};

export default ikuDataService;
