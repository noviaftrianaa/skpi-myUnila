/**
 * Portal Service
 *
 * Handle portal operations:
 * - Dashboard
 * - Profile
 * - Announcements
 * - Notifications
 */

import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  DashboardStats,
  Announcement,
  Notification,
  ProfileData,
  ActivityLog,
} from '@/lib/types/portal.types';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/api.types';

class PortalService {
  // ==================== DASHBOARD ====================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>(
      ENDPOINTS.PORTAL.DASHBOARD_STATS
    );
    return data.data;
  }

  // ==================== PROFILE ====================

  /**
   * Get user profile
   */
  async getProfile(): Promise<ProfileData> {
    const { data } = await apiClient.get<ApiResponse<ProfileData>>(
      ENDPOINTS.PORTAL.PROFILE
    );
    return data.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<ProfileData>): Promise<ProfileData> {
    const { data } = await apiClient.put<ApiResponse<ProfileData>>(
      ENDPOINTS.PORTAL.UPDATE_PROFILE,
      profileData
    );
    return data.data;
  }

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post(ENDPOINTS.PORTAL.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });
  }

  /**
   * Upload profile photo
   */
  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);

    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      ENDPOINTS.PORTAL.UPLOAD_PHOTO,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data.data.url;
  }

  // ==================== ANNOUNCEMENTS ====================

  /**
   * Get announcements
   */
  async getAnnouncements(page = 1, perPage = 10): Promise<PaginatedResponse<Announcement>> {
    const { data } = await apiClient.get<PaginatedResponse<Announcement>>(
      ENDPOINTS.PORTAL.ANNOUNCEMENTS,
      {
        params: { page, per_page: perPage },
      }
    );
    return data;
  }

  /**
   * Get announcement detail
   */
  async getAnnouncementDetail(id: string): Promise<Announcement> {
    const { data } = await apiClient.get<ApiResponse<Announcement>>(
      ENDPOINTS.PORTAL.ANNOUNCEMENT_DETAIL(id)
    );
    return data.data;
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get notifications
   */
  async getNotifications(page = 1, perPage = 20): Promise<PaginatedResponse<Notification>> {
    const { data } = await apiClient.get<PaginatedResponse<Notification>>(
      ENDPOINTS.PORTAL.NOTIFICATIONS,
      {
        params: { page, per_page: perPage },
      }
    );
    return data;
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string): Promise<void> {
    await apiClient.post(ENDPOINTS.PORTAL.NOTIFICATION_READ(id));
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.post(ENDPOINTS.PORTAL.NOTIFICATION_READ_ALL);
  }

  // ==================== ACTIVITY LOGS ====================

  /**
   * Get activity logs
   */
  async getActivityLogs(page = 1, perPage = 20): Promise<PaginatedResponse<ActivityLog>> {
    const { data } = await apiClient.get<PaginatedResponse<ActivityLog>>(
      ENDPOINTS.PORTAL.ACTIVITY_LOGS,
      {
        params: { page, per_page: perPage },
      }
    );
    return data;
  }
}

// Export singleton instance
export const portalService = new PortalService();
export default portalService;
