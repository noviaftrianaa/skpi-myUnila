/**
 * Search Service
 * Service untuk pencarian global menggunakan MeiliSearch
 *
 * MeiliSearch Integration:
 * - Typo tolerance
 * - Fast auto-suggestion (<50ms)
 * - Faceted search (advanced filters)
 * - Highlight matched text
 * - Multi-index search
 */

import axios from 'axios';
import type { SearchCategory } from '@/shared/components/search/GlobalSearch';

// Base URL untuk search API (akan menggunakan dashboard-service)
const SEARCH_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL || 'http://localhost:9800/dashboard-service/api/v1';

// ========== Search Request Types ==========

export interface SearchParams {
  q: string;                    // Search query
  category?: SearchCategory;    // Filter by category
  page?: number;                // Page number (default: 1)
  limit?: number;               // Results per page (default: 20)
  sort?: 'relevance' | 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc';

  // Filters
  filters?: {
    fakultas?: string[];
    jenjang?: string[];
    tahun?: [number, number];
    status?: string[];
    jenis?: string[];
    bidang_ilmu?: string[];
  };

  // Faceted search options
  facets?: string[];            // Fields to facet on

  // Highlight options
  highlight?: boolean;          // Enable text highlighting (default: true)
}

export interface SuggestionParams {
  q: string;
  category?: SearchCategory;
  limit?: number;               // Max suggestions (default: 5)
}

// ========== Search Response Types ==========

export interface SearchHighlight {
  title?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface BaseSearchResult {
  id: string;
  title: string;
  description: string;
  category: SearchCategory;
  url: string;
  relevance_score: number;      // MeiliSearch ranking score (0-1)
  highlight?: SearchHighlight;
  [key: string]: any;           // Category-specific fields
}

export interface SearchResponse<T = BaseSearchResult> {
  success: boolean;
  message: string;
  data: {
    results: T[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    processing_time_ms: number; // MeiliSearch query time
    facets?: Record<string, Record<string, number>>;
    query: string;
    category: SearchCategory;
  };
}

export interface SuggestionResult {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  url: string;
  metadata?: {
    imageUrl?: string;
    badge?: string;
    year?: number;
    faculty?: string;
  };
}

export interface SuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    suggestions: SuggestionResult[];
    processing_time_ms: number;
    query: string;
  };
}

// ========== Statistics Types ==========

export interface SearchStatistics {
  total_documents: number;
  by_category: Record<SearchCategory, number>;
  last_indexed: string;
  index_health: 'healthy' | 'degraded' | 'unhealthy';
}

export interface SearchStatsResponse {
  success: boolean;
  message: string;
  data: SearchStatistics;
}

// ========== Search Service ==========

export const searchService = {
  /**
   * Perform global search across all categories or specific category
   */
  async search<T = BaseSearchResult>(params: SearchParams): Promise<SearchResponse<T>> {
    try {
      const response = await axios.get<SearchResponse<T>>(`${SEARCH_API_URL}/search`, {
        params: {
          q: params.q,
          category: params.category || 'all',
          page: params.page || 1,
          limit: params.limit || 20,
          sort: params.sort || 'relevance',
          filters: params.filters ? JSON.stringify(params.filters) : undefined,
          facets: params.facets ? params.facets.join(',') : undefined,
          highlight: params.highlight !== false,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  },

  /**
   * Get auto-suggestions for search input (fast <50ms)
   */
  async getSuggestions(params: SuggestionParams): Promise<SuggestionsResponse> {
    try {
      const response = await axios.get<SuggestionsResponse>(`${SEARCH_API_URL}/search/suggestions`, {
        params: {
          q: params.q,
          category: params.category || 'all',
          limit: params.limit || 5,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Get suggestions failed:', error);
      throw error;
    }
  },

  /**
   * Get search statistics
   */
  async getStatistics(): Promise<SearchStatsResponse> {
    try {
      const response = await axios.get<SearchStatsResponse>(`${SEARCH_API_URL}/search/stats`);
      return response.data;
    } catch (error) {
      console.error('Get search statistics failed:', error);
      throw error;
    }
  },

  /**
   * Get available facets for a category
   */
  async getFacets(category: SearchCategory): Promise<string[]> {
    try {
      const response = await axios.get<{ success: boolean; data: string[] }>(
        `${SEARCH_API_URL}/search/facets/${category}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Get facets failed:', error);
      return [];
    }
  },
};

// ========== MeiliSearch Index Configuration (for reference) ==========

/**
 * Index Configuration yang akan digunakan di backend (Laravel)
 *
 * Indexes:
 * 1. mahasiswa - Data mahasiswa
 * 2. dosen - Data dosen dan SDM
 * 3. prodi - Program studi
 * 4. penelitian - Penelitian dosen
 * 5. pengabdian - Pengabdian masyarakat
 * 6. publikasi - Publikasi (jurnal, buku, prosiding, HaKI)
 * 7. bidang_ilmu - Bidang ilmu/keahlian
 *
 * Searchable Attributes (per index):
 * - mahasiswa: nama, nim, email, prodi, fakultas
 * - dosen: nama, nidn, nip, email, prodi, fakultas, bidang_keahlian
 * - prodi: nama_prodi, fakultas, jenjang
 * - penelitian: judul, peneliti, abstrak, bidang_ilmu
 * - pengabdian: judul, pelaksana, deskripsi, lokasi
 * - publikasi: judul, penulis, abstrak, publisher
 * - bidang_ilmu: nama_bidang, deskripsi, dosen
 *
 * Filterable Attributes:
 * - fakultas, jenjang, status, tahun, jenis, bidang_ilmu
 *
 * Sortable Attributes:
 * - tahun, nama, created_at, updated_at
 *
 * Ranking Rules (MeiliSearch default + custom):
 * 1. words (typo tolerance)
 * 2. typo
 * 3. proximity
 * 4. attribute (position in searchable attributes)
 * 5. sort
 * 6. exactness
 */

export const MEILISEARCH_CONFIG = {
  indexes: [
    'mahasiswa',
    'dosen',
    'prodi',
    'penelitian',
    'pengabdian',
    'publikasi',
    'bidang_ilmu',
  ] as const,

  defaultSearchParams: {
    limit: 20,
    attributesToHighlight: ['*'],
    highlightPreTag: '<mark>',
    highlightPostTag: '</mark>',
    attributesToCrop: ['description'],
    cropLength: 200,
    showMatchesPosition: false,
  },

  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 5,
      twoTypos: 9,
    },
  },
};

export default searchService;
