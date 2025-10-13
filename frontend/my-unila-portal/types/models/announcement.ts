/**
 * Announcement Model Types
 * Data model untuk Announcements/Pengumuman
 */

export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: AnnouncementCategory;
  date: string;
  isNew: boolean;
  author: string;
}

export type AnnouncementCategory = 'Akademik' | 'Kegiatan' | 'Teknis' | 'Lainnya';
