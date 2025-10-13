/**
 * Site Configuration
 * Konfigurasi global untuk website
 */

export const siteConfig = {
  name: 'myUnila Portal',
  description: 'Portal Satu Data Universitas Lampung - Sistem Informasi Terintegrasi',
  url: 'https://myunila.unila.ac.id',
  ogImage: 'https://myunila.unila.ac.id/og.png',
  links: {
    unila: 'https://www.unila.ac.id',
    helpdesk: 'https://helpdesktik.unila.ac.id',
  },
  keywords: [
    'myUnila',
    'Universitas Lampung',
    'Portal',
    'Sistem Informasi',
    'Akademik',
    'Mahasiswa',
    'Dosen',
  ],
  authors: [
    {
      name: 'DPTSI Unila',
      url: 'https://www.unila.ac.id',
    },
  ],
  creator: 'DPTSI Universitas Lampung',
};

export type SiteConfig = typeof siteConfig;
