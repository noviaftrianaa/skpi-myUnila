/**
 * Portal Hooks
 *
 * Custom React hooks for portal operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalService } from '@/lib/services/portal.service';
import type { ProfileData } from '@/lib/types';

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['portal', 'dashboard', 'stats'],
    queryFn: () => portalService.getDashboardStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: () => portalService.getProfile(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileData: Partial<ProfileData>) =>
      portalService.updateProfile(profileData),
    onSuccess: () => {
      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: ['portal', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      portalService.changePassword(oldPassword, newPassword),
  });
}

/**
 * Hook to upload profile photo
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => portalService.uploadPhoto(file),
    onSuccess: () => {
      // Invalidate profile query to show new photo
      queryClient.invalidateQueries({ queryKey: ['portal', 'profile'] });
    },
  });
}

/**
 * Hook to fetch announcements with pagination
 */
export function useAnnouncements(page = 1, perPage = 10) {
  return useQuery({
    queryKey: ['portal', 'announcements', page, perPage],
    queryFn: () => portalService.getAnnouncements(page, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch announcement detail
 */
export function useAnnouncementDetail(id: string) {
  return useQuery({
    queryKey: ['portal', 'announcements', id],
    queryFn: () => portalService.getAnnouncementDetail(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch notifications with pagination
 */
export function useNotifications(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['portal', 'notifications', page, perPage],
    queryFn: () => portalService.getNotifications(page, perPage),
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent for notifications)
  });
}

/**
 * Hook to mark notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => portalService.markNotificationAsRead(id),
    onSuccess: () => {
      // Invalidate notifications query to update list
      queryClient.invalidateQueries({ queryKey: ['portal', 'notifications'] });
    },
  });
}

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => portalService.markAllNotificationsAsRead(),
    onSuccess: () => {
      // Invalidate notifications query to update list
      queryClient.invalidateQueries({ queryKey: ['portal', 'notifications'] });
    },
  });
}

/**
 * Hook to fetch activity logs with pagination
 */
export function useActivityLogs(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['portal', 'activity-logs', page, perPage],
    queryFn: () => portalService.getActivityLogs(page, perPage),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
