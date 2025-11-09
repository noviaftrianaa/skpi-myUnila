/**
 * Search Service
 * Service untuk search functionality
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

// Types
export interface SearchResult {
  id: string;
  encrypted_id?: string; // For dosen and bidang-ilmu categories
  nama?: string;
  nim?: string;
  nidn?: string;
  nip?: string;
  nama_prodi?: string;
  judul?: string;
  prodi?: string;
  jenjang?: string;
  status?: string;
  jenis_kelamin?: string;
  jabatan_fungsional?: string;
  prodi_homebase?: string;
  jenjang_prodi?: string;
  kode_prodi?: string;
  jumlah_mahasiswa?: number;
  tahun?: string;
  skim?: string;
  ketua_peneliti?: string;
  ketua_pengabdi?: string;
  bidang_ilmu?: string;
  jenis_publikasi?: string;
  penerbit?: string;
  penulis_utama?: string;
  category: string;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    category?: string | null;
    total_results: number;
    results: {
      mahasiswa?: SearchResult[];
      dosen?: SearchResult[];
      prodi?: SearchResult[];
      penelitian?: SearchResult[];
      publikasi?: SearchResult[];
      pengabdian?: SearchResult[];
      'bidang-ilmu'?: SearchResult[];
    };
  };
}

export interface CategorySearchResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    total_results: number;
    results: SearchResult[];
  };
}

export interface SuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    query: string;
    suggestions: {
      mahasiswa: SearchResult[];
      dosen: SearchResult[];
      prodi: SearchResult[];
    };
  };
}

/**
 * Global search across all categories
 */
export async function globalSearch(
  query: string,
  options?: {
    category?: string;
    limit?: number;
  }
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    q: query,
  });

  if (options?.category) {
    params.append('category', options.category);
  }

  if (options?.limit) {
    params.append('limit', options.limit.toString());
  }

  const response = await axios.get<SearchResponse>(`${API_URL}/search?${params.toString()}`);
  return response.data;
}

/**
 * Search mahasiswa by name, NIM, or prodi
 */
export async function searchMahasiswa(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/mahasiswa?${params.toString()}`);
  return response.data;
}

/**
 * Search dosen by name, NIDN, NIP, or prodi
 */
export async function searchDosen(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/dosen?${params.toString()}`);
  return response.data;
}

/**
 * Search program studi
 */
export async function searchProdi(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/prodi?${params.toString()}`);
  return response.data;
}

/**
 * Search penelitian
 */
export async function searchPenelitian(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/penelitian?${params.toString()}`);
  return response.data;
}

/**
 * Search publikasi
 */
export async function searchPublikasi(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/publikasi?${params.toString()}`);
  return response.data;
}

/**
 * Search pengabdian
 */
export async function searchPengabdian(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/pengabdian?${params.toString()}`);
  return response.data;
}

/**
 * Search bidang ilmu - returns dosen who have that expertise
 */
export async function searchBidangIlmu(query: string, limit: number = 20): Promise<CategorySearchResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<CategorySearchResponse>(`${API_URL}/search/bidang-ilmu?${params.toString()}`);
  return response.data;
}

/**
 * Get search suggestions for autocomplete
 */
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<SuggestionsResponse> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
  });

  const response = await axios.get<SuggestionsResponse>(`${API_URL}/search/suggestions?${params.toString()}`);
  return response.data;
}
