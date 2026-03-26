USE pdut;
GO
-- 1. INSERT Project Management app
IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE app_slug = 'project-management')
  INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, a_live, a_terintegrasi, icon_name, icon_color, id_kategori, app_slug, urutan, a_tampil_portal, a_maintenance, a_coming_soon, a_aktif, a_filter_organisasi, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, tgl_create, last_update, last_sync)
  VALUES ('432F1D35-9913-4AF1-922A-01C6A0FC3940', 'Project Management', 'Manajemen Proyek & Task Tracking', '/dashboard/project-management', 1, 1, 'heroicons:clipboard-document-list', 'text-violet-600', 'FDF049D7-B6CE-4925-9ADE-FC61433F7364', 'project-management', 10, 1, 0, 0, 1, 0, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
GO
-- 2. UPDATE app flags
UPDATE man_akses.aplikasi SET a_live=1, a_terintegrasi=1, url='/dashboard/pimpinan', a_aktif=1, a_tampil_portal=1, a_maintenance=0, a_coming_soon=0, icon_name='heroicons:chart-bar', icon_color='text-indigo-600', id_kategori='7759AE05-D113-4324-997D-1F3053DE9527', urutan=2, last_update=GETDATE() WHERE app_slug='dashboard-pimpinan';
UPDATE man_akses.aplikasi SET a_live=1, a_terintegrasi=1, url='/dashboard/data-unila', a_aktif=1, a_tampil_portal=1, a_maintenance=0, a_coming_soon=0, icon_name='heroicons:table-cells', icon_color='text-emerald-600', id_kategori='03D443EA-48FA-4281-BDE2-F38CB3846920', urutan=4, last_update=GETDATE() WHERE app_slug='data-unila';
GO
-- 3. INSERT missing menus
-- data-unila: 0 parents + 12 children
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('57B00E15-F1B8-4422-98D6-1F37595A8E9C', 'Mata Kuliah', '/dashboard/data-unila/akademik/matkul', 3, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('B4DF6312-FD4C-4182-BD34-4848638B9E06', 'Jabatan Fungsional', '/dashboard/data-unila/dosen/jabfung', 2, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('01C8256A-6555-4D15-9BB3-57FF5B27F74C', 'Program Studi', '/dashboard/data-unila/akademik/prodi', 1, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('785B44FB-8C02-41CE-9CA4-79FB129B2975', 'Pengabdian', '/dashboard/data-unila/tridarma/pengabdian', 2, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('FB2A9083-1698-49F9-B9F5-7B766DDF94D8', 'Daftar Mahasiswa', '/dashboard/data-unila/mahasiswa', 1, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('9AABCB62-EAA7-4763-B71F-7BDD63F39211', 'Akreditasi', '/dashboard/data-unila/akademik/akreditasi', 2, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('67293314-0C3E-487C-9DD7-8E939A12A986', 'UKT', '/dashboard/data-unila/keuangan/ukt', 1, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', 'SPP', '/dashboard/data-unila/keuangan/spp', 2, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', 'Sertifikasi', '/dashboard/data-unila/dosen/sertifikasi', 3, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('5E622B78-98BE-4EE1-BF71-D56B5414994B', 'Penelitian', '/dashboard/data-unila/tridarma/penelitian', 1, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('73CE4221-AD6A-434B-8B2B-E3922BD2872E', 'Publikasi', '/dashboard/data-unila/tridarma/publikasi', 3, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '306098AB-C01C-4312-847B-F3D20C812CAB', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('86905B47-1626-4B20-B7BB-EC2FDBE067F1', 'Daftar Dosen', '/dashboard/data-unila/dosen', 1, 1, 1, NULL, 1, 'E14530EB-EFE4-4FAE-91D2-5A0396DD362F', '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', GETDATE(), GETDATE(), GETDATE());
GO
-- manajemen-akses: 3 parents + 13 children
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'F9085130-9DCD-4D7A-8DF7-786796C152CB')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('F9085130-9DCD-4D7A-8DF7-786796C152CB', 'Dashboard', '/dashboard/manajemen-akses', 1, 1, 1, 'heroicons:home', 0, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', NULL, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', 'Logger', '#logger', 3, 1, 1, 'heroicons:presentation-chart-line', 0, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', NULL, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'DC80A59F-898C-40E4-B60B-9B4188828566')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('DC80A59F-898C-40E4-B60B-9B4188828566', 'Manajemen', '#manajemen', 2, 1, 1, 'heroicons:cog-6-tooth', 0, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', NULL, GETDATE(), GETDATE(), GETDATE());
GO
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'FBB01D92-4AA2-4414-91AF-185D56294387')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('FBB01D92-4AA2-4414-91AF-185D56294387', 'Log Akses', '/dashboard/manajemen-akses/logger/log-akses', 3, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '25A2481D-CFF7-4F87-AE19-2BA11E28B2A5')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('25A2481D-CFF7-4F87-AE19-2BA11E28B2A5', 'WS Endpoint', '/dashboard/manajemen-akses/manajemen/ws-endpoint', 9, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '9A3A3881-25E5-42CB-A9DE-324E871DC2CD')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('9A3A3881-25E5-42CB-A9DE-324E871DC2CD', 'Peran', '/dashboard/manajemen-akses/manajemen/peran', 7, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '5991E532-2F16-4A1D-8F0E-41551F9B1ED2')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('5991E532-2F16-4A1D-8F0E-41551F9B1ED2', 'PJ Aplikasi', '/dashboard/manajemen-akses/manajemen/pj-aplikasi', 8, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'F0D64D82-6A22-4F21-A7C3-54158C66CC82')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('F0D64D82-6A22-4F21-A7C3-54158C66CC82', 'Daftar Aplikasi', '/dashboard/manajemen-akses/manajemen/aplikasi', 2, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '81428EFB-526B-46EA-A79A-7A039EF44D0C')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('81428EFB-526B-46EA-A79A-7A039EF44D0C', 'Menu Aplikasi', '/dashboard/manajemen-akses/manajemen/menu', 4, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '26E4D4EC-7DD5-4A83-B017-9B353E745664')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('26E4D4EC-7DD5-4A83-B017-9B353E745664', 'Log JWT', '/dashboard/manajemen-akses/logger/log-jwt', 2, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'BA417360-EE22-4F4E-BE96-AA12B56969DC')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('BA417360-EE22-4F4E-BE96-AA12B56969DC', 'WS Authorization', '/dashboard/manajemen-akses/manajemen/ws-authorization', 10, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '101DFB36-35DC-4E94-8D09-B6952C18B43A')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('101DFB36-35DC-4E94-8D09-B6952C18B43A', 'Log Login', '/dashboard/manajemen-akses/logger/log-login', 1, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '664F676A-2725-414D-9F99-BC72C4AAE016')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('664F676A-2725-414D-9F99-BC72C4AAE016', 'Kategori Aplikasi', '/dashboard/manajemen-akses/manajemen/kategori-aplikasi', 5, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '8CFEEBAC-3341-4B5B-9658-BD3D63A6881E')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('8CFEEBAC-3341-4B5B-9658-BD3D63A6881E', 'Daftar Pengguna', '/dashboard/manajemen-akses/manajemen/pengguna', 1, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = '30F216FA-043F-4AEC-87B3-D2566AC6FC08')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('30F216FA-043F-4AEC-87B3-D2566AC6FC08', 'Role Base Access', '/dashboard/manajemen-akses/manajemen/rbac', 3, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE id_menu = 'C3D3515A-F88B-4AFC-9970-DA989339F1B9')
  INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
  VALUES ('C3D3515A-F88B-4AFC-9970-DA989339F1B9', 'Daftar Unit', '/dashboard/manajemen-akses/manajemen/unit', 6, 1, 1, NULL, 1, '5A658A40-FD39-4280-8B3C-FAF52A059D8E', 'DC80A59F-898C-40E4-B60B-9B4188828566', GETDATE(), GETDATE(), GETDATE());
GO
-- 4. INSERT menu_role
-- data-unila (253)
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='9AABCB62-EAA7-4763-B71F-7BDD63F39211')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '9AABCB62-EAA7-4763-B71F-7BDD63F39211', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='57B00E15-F1B8-4422-98D6-1F37595A8E9C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '57B00E15-F1B8-4422-98D6-1F37595A8E9C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='A1C7312A-0E39-4125-965D-9FCA21C7137D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'A1C7312A-0E39-4125-965D-9FCA21C7137D', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='45329BDC-C12D-437B-BB0D-FCF1F5B438D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '45329BDC-C12D-437B-BB0D-FCF1F5B438D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='67293314-0C3E-487C-9DD7-8E939A12A986')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '67293314-0C3E-487C-9DD7-8E939A12A986', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '9A1E4BFB-EBC2-4D6B-83E4-9D0D3A5B6549', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='C784B3D6-7F58-4720-A91A-C4438F178240')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'C784B3D6-7F58-4720-A91A-C4438F178240', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='EF9BA12F-7BDD-4995-8199-20B4A823CE92')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'EF9BA12F-7BDD-4995-8199-20B4A823CE92', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'A2A1688A-4A98-4BFB-AFDA-9E80CBBBAE56', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='F44D2A30-3402-43DD-A050-FB4DB8AC0CA1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'F44D2A30-3402-43DD-A050-FB4DB8AC0CA1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='3925A7BE-FF51-46A9-934B-F469AE2D1B3B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '3925A7BE-FF51-46A9-934B-F469AE2D1B3B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='86905B47-1626-4B20-B7BB-EC2FDBE067F1')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '86905B47-1626-4B20-B7BB-EC2FDBE067F1', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='FB2A9083-1698-49F9-B9F5-7B766DDF94D8')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'FB2A9083-1698-49F9-B9F5-7B766DDF94D8', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='B4DF6312-FD4C-4182-BD34-4848638B9E06')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'B4DF6312-FD4C-4182-BD34-4848638B9E06', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='88871BFE-8B10-46E9-8877-A5CCDD9DB8F5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '88871BFE-8B10-46E9-8877-A5CCDD9DB8F5', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'D54938FB-F2E0-42CE-B5CE-7DFC3CA7E6EE', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='306098AB-C01C-4312-847B-F3D20C812CAB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '306098AB-C01C-4312-847B-F3D20C812CAB', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='5E622B78-98BE-4EE1-BF71-D56B5414994B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '5E622B78-98BE-4EE1-BF71-D56B5414994B', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='785B44FB-8C02-41CE-9CA4-79FB129B2975')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '785B44FB-8C02-41CE-9CA4-79FB129B2975', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='73CE4221-AD6A-434B-8B2B-E3922BD2872E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, '73CE4221-AD6A-434B-8B2B-E3922BD2872E', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='E6F774A8-1129-42E9-952E-3F7C473C39D0')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'E6F774A8-1129-42E9-952E-3F7C473C39D0', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=35 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (35, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=36 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (36, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=37 AND id_menu='DD6793BA-11F8-4C9B-B332-E77D2D5634FC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (37, 'DD6793BA-11F8-4C9B-B332-E77D2D5634FC', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=42 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (42, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=43 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (43, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=46 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (46, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=33 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (33, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=38 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (38, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=34 AND id_menu='01C8256A-6555-4D15-9BB3-57FF5B27F74C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (34, '01C8256A-6555-4D15-9BB3-57FF5B27F74C', full, 0, 1, 0, 0, GETDATE(), GETDATE(), GETDATE());
GO
-- manajemen-akses (32)
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='F9085130-9DCD-4D7A-8DF7-786796C152CB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'F9085130-9DCD-4D7A-8DF7-786796C152CB', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='F9085130-9DCD-4D7A-8DF7-786796C152CB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'F9085130-9DCD-4D7A-8DF7-786796C152CB', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='DC80A59F-898C-40E4-B60B-9B4188828566')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'DC80A59F-898C-40E4-B60B-9B4188828566', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='DC80A59F-898C-40E4-B60B-9B4188828566')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'DC80A59F-898C-40E4-B60B-9B4188828566', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='8CFEEBAC-3341-4B5B-9658-BD3D63A6881E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '8CFEEBAC-3341-4B5B-9658-BD3D63A6881E', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='8CFEEBAC-3341-4B5B-9658-BD3D63A6881E')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '8CFEEBAC-3341-4B5B-9658-BD3D63A6881E', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='F0D64D82-6A22-4F21-A7C3-54158C66CC82')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'F0D64D82-6A22-4F21-A7C3-54158C66CC82', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='F0D64D82-6A22-4F21-A7C3-54158C66CC82')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'F0D64D82-6A22-4F21-A7C3-54158C66CC82', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='30F216FA-043F-4AEC-87B3-D2566AC6FC08')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '30F216FA-043F-4AEC-87B3-D2566AC6FC08', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='30F216FA-043F-4AEC-87B3-D2566AC6FC08')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '30F216FA-043F-4AEC-87B3-D2566AC6FC08', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='81428EFB-526B-46EA-A79A-7A039EF44D0C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '81428EFB-526B-46EA-A79A-7A039EF44D0C', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='81428EFB-526B-46EA-A79A-7A039EF44D0C')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '81428EFB-526B-46EA-A79A-7A039EF44D0C', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='664F676A-2725-414D-9F99-BC72C4AAE016')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '664F676A-2725-414D-9F99-BC72C4AAE016', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='664F676A-2725-414D-9F99-BC72C4AAE016')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '664F676A-2725-414D-9F99-BC72C4AAE016', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='C3D3515A-F88B-4AFC-9970-DA989339F1B9')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'C3D3515A-F88B-4AFC-9970-DA989339F1B9', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='C3D3515A-F88B-4AFC-9970-DA989339F1B9')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'C3D3515A-F88B-4AFC-9970-DA989339F1B9', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='9A3A3881-25E5-42CB-A9DE-324E871DC2CD')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '9A3A3881-25E5-42CB-A9DE-324E871DC2CD', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='9A3A3881-25E5-42CB-A9DE-324E871DC2CD')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '9A3A3881-25E5-42CB-A9DE-324E871DC2CD', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='25A2481D-CFF7-4F87-AE19-2BA11E28B2A5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '25A2481D-CFF7-4F87-AE19-2BA11E28B2A5', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='25A2481D-CFF7-4F87-AE19-2BA11E28B2A5')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '25A2481D-CFF7-4F87-AE19-2BA11E28B2A5', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='5991E532-2F16-4A1D-8F0E-41551F9B1ED2')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '5991E532-2F16-4A1D-8F0E-41551F9B1ED2', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='5991E532-2F16-4A1D-8F0E-41551F9B1ED2')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '5991E532-2F16-4A1D-8F0E-41551F9B1ED2', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='BA417360-EE22-4F4E-BE96-AA12B56969DC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'BA417360-EE22-4F4E-BE96-AA12B56969DC', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='BA417360-EE22-4F4E-BE96-AA12B56969DC')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'BA417360-EE22-4F4E-BE96-AA12B56969DC', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'B935F84A-ED15-4FE2-9FF9-90ED9BB6CCDB', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='101DFB36-35DC-4E94-8D09-B6952C18B43A')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '101DFB36-35DC-4E94-8D09-B6952C18B43A', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='101DFB36-35DC-4E94-8D09-B6952C18B43A')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '101DFB36-35DC-4E94-8D09-B6952C18B43A', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='26E4D4EC-7DD5-4A83-B017-9B353E745664')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '26E4D4EC-7DD5-4A83-B017-9B353E745664', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='26E4D4EC-7DD5-4A83-B017-9B353E745664')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '26E4D4EC-7DD5-4A83-B017-9B353E745664', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='FBB01D92-4AA2-4414-91AF-185D56294387')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'FBB01D92-4AA2-4414-91AF-185D56294387', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='FBB01D92-4AA2-4414-91AF-185D56294387')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'FBB01D92-4AA2-4414-91AF-185D56294387', full, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
GO
-- project-management (6)
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='F12F43CA-58DC-47D9-8663-425AF008AB4B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'F12F43CA-58DC-47D9-8663-425AF008AB4B', 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='F12F43CA-58DC-47D9-8663-425AF008AB4B')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'F12F43CA-58DC-47D9-8663-425AF008AB4B', 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='051FE792-C966-40B9-979A-831181C49000')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, '051FE792-C966-40B9-979A-831181C49000', 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='051FE792-C966-40B9-979A-831181C49000')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, '051FE792-C966-40B9-979A-831181C49000', 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=107 AND id_menu='D0335B4C-B044-4AE1-BD72-C8426A9F812D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (107, 'D0335B4C-B044-4AE1-BD72-C8426A9F812D', 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
IF NOT EXISTS (SELECT 1 FROM man_akses.menu_role WHERE id_peran=1 AND id_menu='D0335B4C-B044-4AE1-BD72-C8426A9F812D')
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  VALUES (1, 'D0335B4C-B044-4AE1-BD72-C8426A9F812D', 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
GO
PRINT '=== SEED COMPLETE ===';
GO

-- ==========================================
-- 5. REORGANIZE CATEGORIES
-- ==========================================

-- 5a. Hide Dashboard Unila dan IKU Dashboard (a_live=0, a_tampil_portal=0)
UPDATE man_akses.aplikasi SET a_live = 0, a_tampil_portal = 0, a_aktif = 0, last_update = GETDATE() WHERE app_slug = 'dashboard-unila';
UPDATE man_akses.aplikasi SET a_live = 0, a_tampil_portal = 0, a_aktif = 0, last_update = GETDATE() WHERE app_slug = 'iku-dashboard';
GO

-- 5b. Move Data Unila from "Data dan Pelaporan" to "Dashboard & Akreditasi"
UPDATE man_akses.aplikasi 
SET id_kategori = '7759AE05-D113-4324-997D-1F3053DE9527',  -- Dashboard & Akreditasi
    last_update = GETDATE()
WHERE app_slug = 'data-unila';
GO

PRINT '=== CATEGORY REORGANIZE DONE ===';
PRINT 'Dashboard & Akreditasi: Dashboard Pimpinan + Data Unila';
PRINT 'Hidden: Dashboard Unila, IKU Dashboard';
GO

-- ==========================================
-- 6. INSERT SIMBAK app + menus + RBAC
-- ==========================================

-- 6a. INSERT SIMBAK app
IF NOT EXISTS (SELECT 1 FROM man_akses.aplikasi WHERE app_slug = 'sim-bak')
  INSERT INTO man_akses.aplikasi (id_aplikasi, nm_aplikasi, ket_aplikasi, url, a_live, a_terintegrasi, icon_name, icon_color, id_kategori, app_slug, urutan, a_tampil_portal, a_maintenance, a_coming_soon, a_aktif, a_filter_organisasi, a_generate_menu, a_integrasi_cas, a_sistem_internal_pt, tgl_create, last_update, last_sync)
  VALUES (NEWID(), 'SIMBAK', 'Sistem Informasi Manajemen BAK — Layanan administrasi kemahasiswaan', '/dashboard/sim-bak', 0, 1, 'heroicons:document-text', 'text-teal-600', 'CB701AB4-FE11-4355-BB01-5FBEEBB0DBD2', 'sim-bak', 15, 1, 0, 1, 1, 0, 1, 1, 1, GETDATE(), GETDATE(), GETDATE());
GO

-- 6b. INSERT SIMBAK menus
DECLARE @simbak_app_id UNIQUEIDENTIFIER;
SELECT @simbak_app_id = id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'sim-bak';

IF @simbak_app_id IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Dashboard', '/dashboard/sim-bak', 1, 1, 1, 'heroicons:squares-2x2', 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/surat-mandiri' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Surat Mandiri', '/dashboard/sim-bak/surat-mandiri', 2, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/permohonan' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Permohonan Akademik', '/dashboard/sim-bak/permohonan', 3, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/admin/verifikasi' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Verifikasi', '/dashboard/sim-bak/admin/verifikasi', 4, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/admin/persetujuan' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Persetujuan', '/dashboard/sim-bak/admin/persetujuan', 5, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/batch' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Batch Administrasi', '/dashboard/sim-bak/batch', 6, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/monitoring' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Monitoring', '/dashboard/sim-bak/monitoring', 7, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  IF NOT EXISTS (SELECT 1 FROM man_akses.menu WHERE nm_file = '/dashboard/sim-bak/master-data' AND id_aplikasi = @simbak_app_id)
    INSERT INTO man_akses.menu (id_menu, nm_menu, nm_file, urutan_menu, a_aktif, a_tampil, icon, level_menu, id_aplikasi, id_group_menu, tgl_create, last_update, last_sync)
    VALUES (NEWID(), 'Master Data', '/dashboard/sim-bak/master-data', 8, 1, 1, NULL, 0, @simbak_app_id, NULL, GETDATE(), GETDATE(), GETDATE());

  -- 6c. RBAC: Admin (1) + Developer (107) access all menus
  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  SELECT 1, id_menu, 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE()
  FROM man_akses.menu WHERE id_aplikasi = @simbak_app_id
  AND id_menu NOT IN (SELECT id_menu FROM man_akses.menu_role WHERE id_peran = 1);

  INSERT INTO man_akses.menu_role (id_peran, id_menu, akses_menu, a_boleh_insert, a_boleh_show, a_boleh_delete, a_boleh_update, tgl_create, last_update, last_sync)
  SELECT 107, id_menu, 1, 1, 1, 1, 1, GETDATE(), GETDATE(), GETDATE()
  FROM man_akses.menu WHERE id_aplikasi = @simbak_app_id
  AND id_menu NOT IN (SELECT id_menu FROM man_akses.menu_role WHERE id_peran = 107);

  PRINT 'SIMBAK: app + 8 menus + RBAC (Admin + Developer) inserted';
END
GO
