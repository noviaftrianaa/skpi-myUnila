-- =============================================
-- Seed: New Menus for pdut (production)
-- Generated: 2026-03-17
-- Source: pdut_staging
-- Total: 39 menus
-- =============================================

USE [pdut];
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'FBB01D92-4AA2-4414-91AF-185D56294387')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('FBB01D92-4AA2-4414-91AF-185D56294387', N'Log Akses', '/dashboard/manajemen-akses/logger/log-akses', NULL, 1, 3, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', N'Mata Kuliah', '/dashboard/data-unila/akademik/matkul', NULL, 1, 3, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', N'Dashboard', '/dashboard/data-unila', 'heroicons:chart-bar-square', 0, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '25A2481D-CFF7-4F87-AE19-2BA11E28B2A5')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('25A2481D-CFF7-4F87-AE19-2BA11E28B2A5', N'WS Endpoint', '/dashboard/manajemen-akses/manajemen/ws-endpoint', NULL, 1, 8, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '9A3A3881-25E5-42CB-A9DE-324E871DC2CD')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('9A3A3881-25E5-42CB-A9DE-324E871DC2CD', N'Peran', '/dashboard/manajemen-akses/manajemen/peran', NULL, 1, 7, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', N'Prestasi', '/dashboard/data-unila/tridarma/prestasi', NULL, 1, 4, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '5991E532-2F16-4A1D-8F0E-41551F9B1ED2')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('5991E532-2F16-4A1D-8F0E-41551F9B1ED2', N'PJ Aplikasi', '/dashboard/manajemen-akses/manajemen/pj-aplikasi', NULL, 1, 9, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', N'Jabatan Fungsional', '/dashboard/data-unila/dosen/jabfung', NULL, 1, 2, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'F0D64D82-6A22-4F21-A7C3-54158C66CC82')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('F0D64D82-6A22-4F21-A7C3-54158C66CC82', N'Daftar Aplikasi', '/dashboard/manajemen-akses/manajemen/aplikasi', NULL, 1, 2, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', N'Program Studi', '/dashboard/data-unila/akademik/prodi', NULL, 1, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'F9085130-9DCD-4D7A-8DF7-786796C152CB')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('F9085130-9DCD-4D7A-8DF7-786796C152CB', N'Dashboard', '/dashboard/manajemen-akses', 'heroicons:home', 0, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', N'Pengabdian', '/dashboard/data-unila/tridarma/pengabdian', NULL, 1, 2, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '81428EFB-526B-46EA-A79A-7A039EF44D0C')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('81428EFB-526B-46EA-A79A-7A039EF44D0C', N'Menu Aplikasi', '/dashboard/manajemen-akses/manajemen/menu', NULL, 1, 4, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', N'Daftar Mahasiswa', '/dashboard/data-unila/mahasiswa', NULL, 1, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', N'Akreditasi', '/dashboard/data-unila/akademik/akreditasi', NULL, 1, 2, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', N'Lulusan', '/dashboard/data-unila/mahasiswa/lulusan', NULL, 1, 2, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', N'UKT', '/dashboard/data-unila/keuangan/ukt', NULL, 1, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', N'Logger', '#logger', 'heroicons:presentation-chart-line', 0, 3, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '26E4D4EC-7DD5-4A83-B017-9B353E745664')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('26E4D4EC-7DD5-4A83-B017-9B353E745664', N'Log JWT', '/dashboard/manajemen-akses/logger/log-jwt', NULL, 1, 2, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'DC80A59F-898C-40E4-B60B-9B4188828566')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('DC80A59F-898C-40E4-B60B-9B4188828566', N'Manajemen', '#manajemen', 'heroicons:cog-6-tooth', 0, 2, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', N'SPP', '/dashboard/data-unila/keuangan/spp', NULL, 1, 2, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', N'Data Mahasiswa', '#data-mahasiswa', 'heroicons:academic-cap', 0, 2, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', N'Data Kerjasama', '/dashboard/data-unila/kerjasama', 'heroicons:globe-alt', 0, 6, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', N'Sertifikasi', '/dashboard/data-unila/dosen/sertifikasi', NULL, 1, 3, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'BA417360-EE22-4F4E-BE96-AA12B56969DC')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('BA417360-EE22-4F4E-BE96-AA12B56969DC', N'WS Authorization', '/dashboard/manajemen-akses/manajemen/ws-authorization', NULL, 1, 10, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '101DFB36-35DC-4E94-8D09-B6952C18B43A')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('101DFB36-35DC-4E94-8D09-B6952C18B43A', N'Log Login', '/dashboard/manajemen-akses/logger/log-login', NULL, 1, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '664F676A-2725-414D-9F99-BC72C4AAE016')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('664F676A-2725-414D-9F99-BC72C4AAE016', N'Kategori Aplikasi', '/dashboard/manajemen-akses/manajemen/kategori-aplikasi', NULL, 1, 5, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '8CFEEBAC-3341-4B5B-9658-BD3D63A6881E')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('8CFEEBAC-3341-4B5B-9658-BD3D63A6881E', N'Daftar Pengguna', '/dashboard/manajemen-akses/manajemen/pengguna', NULL, 1, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', N'Tracer Study', '/dashboard/data-unila/tracer', 'heroicons:arrow-trending-up', 0, 8, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '30F216FA-043F-4AEC-87B3-D2566AC6FC08')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('30F216FA-043F-4AEC-87B3-D2566AC6FC08', N'Role Base Access', '/dashboard/manajemen-akses/manajemen/rbac', NULL, 1, 3, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', N'Penelitian', '/dashboard/data-unila/tridarma/penelitian', NULL, 1, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'C3D3515A-F88B-4AFC-9970-DA989339F1B9')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('C3D3515A-F88B-4AFC-9970-DA989339F1B9', N'Daftar Unit', '/dashboard/manajemen-akses/manajemen/unit', NULL, 1, 6, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', N'Publikasi', '/dashboard/data-unila/tridarma/publikasi', NULL, 1, 3, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', N'Data Akademik', '#data-akademik', 'heroicons:building-library', 0, 5, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', N'Daftar Dosen', '/dashboard/data-unila/dosen', NULL, 1, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', N'Data Tridarma', '#data-tridarma', 'heroicons:beaker', 0, 4, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', N'Data Dosen & SDM', '#data-dosen', 'heroicons:user-group', 0, 3, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', N'Aktivitas Mahasiswa', '/dashboard/data-unila/mahasiswa/aktivitas', NULL, 1, 3, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 1, 1, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, icon, level_menu, urutan_menu, id_aplikasi, id_group_menu, a_aktif, a_tampil, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', N'Data Keuangan', '#data-keuangan', 'heroicons:currency-dollar', 0, 7, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', NULL, 1, 1, GETDATE(), GETDATE());
GO


-- =============================================
-- Seed: Menu Role Assignments for pdut (production)
-- Generated: 2026-03-17
-- Total: 285 assignments
-- =============================================

USE [pdut];
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F9085130-9DCD-4D7A-8DF7-786796C152CB' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F9085130-9DCD-4D7A-8DF7-786796C152CB', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F9085130-9DCD-4D7A-8DF7-786796C152CB' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F9085130-9DCD-4D7A-8DF7-786796C152CB', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DC80A59F-898C-40E4-B60B-9B4188828566' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DC80A59F-898C-40E4-B60B-9B4188828566', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DC80A59F-898C-40E4-B60B-9B4188828566' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DC80A59F-898C-40E4-B60B-9B4188828566', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '8CFEEBAC-3341-4B5B-9658-BD3D63A6881E' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('8CFEEBAC-3341-4B5B-9658-BD3D63A6881E', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '8CFEEBAC-3341-4B5B-9658-BD3D63A6881E' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('8CFEEBAC-3341-4B5B-9658-BD3D63A6881E', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F0D64D82-6A22-4F21-A7C3-54158C66CC82' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F0D64D82-6A22-4F21-A7C3-54158C66CC82', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F0D64D82-6A22-4F21-A7C3-54158C66CC82' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F0D64D82-6A22-4F21-A7C3-54158C66CC82', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '30F216FA-043F-4AEC-87B3-D2566AC6FC08' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('30F216FA-043F-4AEC-87B3-D2566AC6FC08', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '30F216FA-043F-4AEC-87B3-D2566AC6FC08' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('30F216FA-043F-4AEC-87B3-D2566AC6FC08', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '81428EFB-526B-46EA-A79A-7A039EF44D0C' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('81428EFB-526B-46EA-A79A-7A039EF44D0C', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '81428EFB-526B-46EA-A79A-7A039EF44D0C' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('81428EFB-526B-46EA-A79A-7A039EF44D0C', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '664F676A-2725-414D-9F99-BC72C4AAE016' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('664F676A-2725-414D-9F99-BC72C4AAE016', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '664F676A-2725-414D-9F99-BC72C4AAE016' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('664F676A-2725-414D-9F99-BC72C4AAE016', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C3D3515A-F88B-4AFC-9970-DA989339F1B9' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C3D3515A-F88B-4AFC-9970-DA989339F1B9', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C3D3515A-F88B-4AFC-9970-DA989339F1B9' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C3D3515A-F88B-4AFC-9970-DA989339F1B9', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A3A3881-25E5-42CB-A9DE-324E871DC2CD' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A3A3881-25E5-42CB-A9DE-324E871DC2CD', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A3A3881-25E5-42CB-A9DE-324E871DC2CD' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A3A3881-25E5-42CB-A9DE-324E871DC2CD', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '25A2481D-CFF7-4F87-AE19-2BA11E28B2A5' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('25A2481D-CFF7-4F87-AE19-2BA11E28B2A5', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '25A2481D-CFF7-4F87-AE19-2BA11E28B2A5' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('25A2481D-CFF7-4F87-AE19-2BA11E28B2A5', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5991E532-2F16-4A1D-8F0E-41551F9B1ED2' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5991E532-2F16-4A1D-8F0E-41551F9B1ED2', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5991E532-2F16-4A1D-8F0E-41551F9B1ED2' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5991E532-2F16-4A1D-8F0E-41551F9B1ED2', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'BA417360-EE22-4F4E-BE96-AA12B56969DC' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('BA417360-EE22-4F4E-BE96-AA12B56969DC', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'BA417360-EE22-4F4E-BE96-AA12B56969DC' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('BA417360-EE22-4F4E-BE96-AA12B56969DC', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '101DFB36-35DC-4E94-8D09-B6952C18B43A' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('101DFB36-35DC-4E94-8D09-B6952C18B43A', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '101DFB36-35DC-4E94-8D09-B6952C18B43A' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('101DFB36-35DC-4E94-8D09-B6952C18B43A', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '26E4D4EC-7DD5-4A83-B017-9B353E745664' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('26E4D4EC-7DD5-4A83-B017-9B353E745664', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '26E4D4EC-7DD5-4A83-B017-9B353E745664' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('26E4D4EC-7DD5-4A83-B017-9B353E745664', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FBB01D92-4AA2-4414-91AF-185D56294387' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FBB01D92-4AA2-4414-91AF-185D56294387', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FBB01D92-4AA2-4414-91AF-185D56294387' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FBB01D92-4AA2-4414-91AF-185D56294387', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A1C7312A-0E39-4125-965D-9FCA21C7137D' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A1C7312A-0E39-4125-965D-9FCA21C7137D', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '45329BDC-C12D-437B-BB0D-FCF1F5B438D8' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('45329BDC-C12D-437B-BB0D-FCF1F5B438D8', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'C784B3D6-7F58-4720-A91A-C4438F178240' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('C784B3D6-7F58-4720-A91A-C4438F178240', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'EF9BA12F-7BDD-4995-8199-20B4A823CE92' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('EF9BA12F-7BDD-4995-8199-20B4A823CE92', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '3925A7BE-FF51-46A9-934B-F469AE2D1B3B' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('3925A7BE-FF51-46A9-934B-F469AE2D1B3B', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '306098AB-C01C-4312-847B-F3D20C812CAB' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('306098AB-C01C-4312-847B-F3D20C812CAB', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'E6F774A8-1129-42E9-952E-3F7C473C39D0' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('E6F774A8-1129-42E9-952E-3F7C473C39D0', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 35)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 35, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 36)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 36, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC' AND id_peran = 37)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('DD6793BA-11F8-4C9B-B332-E77D2D5634FC', 37, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 1)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 1, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 107)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 107, 'full', 1, 1, 1, 1, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 42)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 42, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 43)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 43, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 46)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 46, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 33)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 33, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 38)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 38, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C' AND id_peran = 34)
INSERT INTO man_akses.menu_role (id_menu, id_peran, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update, a_boleh_delete, a_boleh_sanggah, approval_menu, soft_delete, tgl_create, last_update)
VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 34, 'full', 1, 0, 0, 0, 0, 1, 0, GETDATE(), GETDATE());
GO

