/**
 * Gelar Akademik Service
 * Handles API calls for gelar akademik (academic title) reference data from SISTER API
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9800";
const SISTER_API_BASE = `${BASE_URL}/sister-service/api/v1`;

export interface GelarAkademikData {
  id_gelar_akademik: number;
  nama_gelar: string;
  expired_date?: string | null;
  last_sync?: string | null;
  synced_by?: string | null;
}

export interface GelarAkademikSyncResponse {
  success: boolean;
  message: string;
  data: {
    total_records: number;
    message: string;
  };
}

export const gelarAkademikService = {
  /**
   * Get all gelar akademik from database
   */
  async getAll(): Promise<GelarAkademikData[]> {
    try {
      const response = await fetch(`${SISTER_API_BASE}/referensi/gelar-akademik`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error fetching gelar akademik:", error);
      throw error;
    }
  },

  /**
   * Sync gelar akademik from SISTER API
   */
  async sync(username: string): Promise<GelarAkademikSyncResponse> {
    try {
      const response = await fetch(
        `${SISTER_API_BASE}/referensi/gelar-akademik/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            synced_by: username,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error syncing gelar akademik:", error);
      throw error;
    }
  },
};
