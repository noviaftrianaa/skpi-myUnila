/**
 * Semester Service
 * Handles API calls for semester reference data from SISTER API
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9800";
const SISTER_API_BASE = `${BASE_URL}/sister-service/api/v1`;

export interface SemesterData {
  id_semester: string; // Format: "20251" = 2025 Semester 1
  nama_semester: string; // Format: "2025/2026 Ganjil"
  tahun_ajaran?: string;
  expired_date?: string | null;
  last_sync?: string | null;
  synced_by?: string | null;
}

export interface SemesterSyncResponse {
  success: boolean;
  message: string;
  data: {
    total_records: number;
    message: string;
  };
}

export const semesterService = {
  /**
   * Get all semester from database
   */
  async getAll(): Promise<SemesterData[]> {
    try {
      const response = await fetch(`${SISTER_API_BASE}/referensi/semester`, {
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
      console.error("Error fetching semester:", error);
      throw error;
    }
  },

  /**
   * Sync semester from SISTER API
   */
  async sync(username: string): Promise<SemesterSyncResponse> {
    try {
      const response = await fetch(
        `${SISTER_API_BASE}/referensi/semester/sync`,
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
      console.error("Error syncing semester:", error);
      throw error;
    }
  },
};
