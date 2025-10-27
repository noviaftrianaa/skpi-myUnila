#!/usr/bin/env python3
"""
Update 3 sync methods to handle required parameters by looping
"""

# Read the file
with open('apps/referensi/service.go', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace SyncWilayahFromSister - loop through all 4 levels
old_wilayah = '''func (s *service) SyncWilayahFromSister(syncedBy string) (int, error) {
\tctx := context.Background()
\tstartTime := time.Now()
\tvar totalRecords int
\tvar syncErr error

\tdefer func() {
\t\ts.logSyncResult(ctx, "Wilayah", "wilayah", "manual", syncedBy, totalRecords, startTime, syncErr)
\t}()

\trawData, err := s.sisterAPI.GetReferensiWilayah()
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to fetch from Sister API: %w", err)
\t\treturn 0, syncErr
\t}

\tsisterData, err := UnmarshalSisterResponse[SisterWilayah](rawData)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to parse response: %w", err)
\t\treturn 0, syncErr
\t}

\terr = s.repo.BulkUpsertWilayah(sisterData, syncedBy)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to save to database: %w", err)
\t\treturn 0, syncErr
\t}

\ttotalRecords = len(sisterData)
\treturn totalRecords, nil
}'''

new_wilayah = '''func (s *service) SyncWilayahFromSister(syncedBy string) (int, error) {
\tctx := context.Background()
\tstartTime := time.Now()
\tvar totalRecords int
\tvar syncErr error

\tdefer func() {
\t\ts.logSyncResult(ctx, "Wilayah", "wilayah", "manual", syncedBy, totalRecords, startTime, syncErr)
\t}()

\t// Sync all wilayah levels: 0=Negara, 1=Provinsi, 2=Kota/Kabupaten, 3=Kecamatan
\tvar allWilayah []SisterWilayah
\tfor level := 0; level <= 3; level++ {
\t\trawData, err := s.sisterAPI.GetReferensiWilayah(level)
\t\tif err != nil {
\t\t\tsyncErr = fmt.Errorf("failed to fetch from Sister API (level %d): %w", level, err)
\t\t\treturn 0, syncErr
\t\t}

\t\tsisterData, err := UnmarshalSisterResponse[SisterWilayah](rawData)
\t\tif err != nil {
\t\t\tsyncErr = fmt.Errorf("failed to parse response (level %d): %w", level, err)
\t\t\treturn 0, syncErr
\t\t}

\t\tallWilayah = append(allWilayah, sisterData...)
\t}

\terr := s.repo.BulkUpsertWilayah(allWilayah, syncedBy)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to save to database: %w", err)
\t\treturn 0, syncErr
\t}

\ttotalRecords = len(allWilayah)
\treturn totalRecords, nil
}'''

content = content.replace(old_wilayah, new_wilayah)

# Replace SyncKategoriKegiatanFromSister - default to list/penelitian for now
old_kategori = '''func (s *service) SyncKategoriKegiatanFromSister(syncedBy string) (int, error) {
\tctx := context.Background()
\tstartTime := time.Now()
\tvar totalRecords int
\tvar syncErr error

\tdefer func() {
\t\ts.logSyncResult(ctx, "Kategori Kegiatan", "kategori_kegiatan", "manual", syncedBy, totalRecords, startTime, syncErr)
\t}()

\trawData, err := s.sisterAPI.GetReferensiKategoriKegiatan()
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to fetch from Sister API: %w", err)
\t\treturn 0, syncErr
\t}

\tsisterData, err := UnmarshalSisterResponse[SisterKategoriKegiatan](rawData)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to parse response: %w", err)
\t\treturn 0, syncErr
\t}

\terr = s.repo.BulkUpsertKategoriKegiatan(sisterData, syncedBy)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to save to database: %w", err)
\t\treturn 0, syncErr
\t}

\ttotalRecords = len(sisterData)
\treturn totalRecords, nil
}'''

new_kategori = '''func (s *service) SyncKategoriKegiatanFromSister(syncedBy string) (int, error) {
\tctx := context.Background()
\tstartTime := time.Now()
\tvar totalRecords int
\tvar syncErr error

\tdefer func() {
\t\ts.logSyncResult(ctx, "Kategori Kegiatan", "kategori_kegiatan", "manual", syncedBy, totalRecords, startTime, syncErr)
\t}()

\t// Sync kategori_kegiatan with tree structure for all menus
\tmenus := []string{"anggota_profesi", "bahan_ajar", "detasering", "diklat", "kekayaan_intelektual",
\t\t"jabatan_struktural", "orasi_ilmiah", "penelitian", "pembicara", "pengabdian",
\t\t"pengelola_jurnal", "penghargaan", "penunjang_lain", "publikasi", "tugas_tambahan", "visiting_scientist"}

\tvar allKategori []SisterKategoriKegiatan
\tfor _, menu := range menus {
\t\trawData, err := s.sisterAPI.GetReferensiKategoriKegiatan("tree", menu)
\t\tif err != nil {
\t\t\tsyncErr = fmt.Errorf("failed to fetch from Sister API (menu=%s): %w", menu, err)
\t\t\treturn 0, syncErr
\t\t}

\t\tsisterData, err := UnmarshalSisterResponse[SisterKategoriKegiatan](rawData)
\t\tif err != nil {
\t\t\tsyncErr = fmt.Errorf("failed to parse response (menu=%s): %w", menu, err)
\t\t\treturn 0, syncErr
\t\t}

\t\tallKategori = append(allKategori, sisterData...)
\t}

\terr := s.repo.BulkUpsertKategoriKegiatan(allKategori, syncedBy)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to save to database: %w", err)
\t\treturn 0, syncErr
\t}

\ttotalRecords = len(allKategori)
\treturn totalRecords, nil
}'''

content = content.replace(old_kategori, new_kategori)

# Replace SyncKelompokBidangFromSister - sync both iptek=true and iptek=false
old_kelompok = '''func (s *service) SyncKelompokBidangFromSister(syncedBy string) (int, error) {
\tctx := context.Background()
\tstartTime := time.Now()
\tvar totalRecords int
\tvar syncErr error

\tdefer func() {
\t\ts.logSyncResult(ctx, "Kelompok Bidang", "kelompok_bidang", "manual", syncedBy, totalRecords, startTime, syncErr)
\t}()

\trawData, err := s.sisterAPI.GetReferensiKelompokBidang()
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to fetch from Sister API: %w", err)
\t\treturn 0, syncErr
\t}

\tsisterData, err := UnmarshalSisterResponse[SisterKelompokBidang](rawData)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to parse response: %w", err)
\t\treturn 0, syncErr
\t}

\terr = s.repo.BulkUpsertKelompokBidang(sisterData, syncedBy)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to save to database: %w", err)
\t\treturn 0, syncErr
\t}

\ttotalRecords = len(sisterData)
\treturn totalRecords, nil
}'''

new_kelompok = '''func (s *service) SyncKelompokBidangFromSister(syncedBy string) (int, error) {
\tctx := context.Background()
\tstartTime := time.Now()
\tvar totalRecords int
\tvar syncErr error

\tdefer func() {
\t\ts.logSyncResult(ctx, "Kelompok Bidang", "kelompok_bidang", "manual", syncedBy, totalRecords, startTime, syncErr)
\t}()

\t// Sync kelompok bidang for both iptek=true and iptek=false
\tvar allKelompok []SisterKelompokBidang
\tfor _, iptek := range []bool{true, false} {
\t\trawData, err := s.sisterAPI.GetReferensiKelompokBidang(iptek)
\t\tif err != nil {
\t\t\tsyncErr = fmt.Errorf("failed to fetch from Sister API (iptek=%v): %w", iptek, err)
\t\t\treturn 0, syncErr
\t\t}

\t\tsisterData, err := UnmarshalSisterResponse[SisterKelompokBidang](rawData)
\t\tif err != nil {
\t\t\tsyncErr = fmt.Errorf("failed to parse response (iptek=%v): %w", iptek, err)
\t\t\treturn 0, syncErr
\t\t}

\t\tallKelompok = append(allKelompok, sisterData...)
\t}

\terr := s.repo.BulkUpsertKelompokBidang(allKelompok, syncedBy)
\tif err != nil {
\t\tsyncErr = fmt.Errorf("failed to save to database: %w", err)
\t\treturn 0, syncErr
\t}

\ttotalRecords = len(allKelompok)
\treturn totalRecords, nil
}'''

content = content.replace(old_kelompok, new_kelompok)

# Write back
with open('apps/referensi/service.go', 'w', encoding='utf-8') as f:
    f.write(content)

print("OK Updated 3 sync methods to handle required parameters")
print("   - SyncWilayahFromSister: loops through levels 0-3")
print("   - SyncKategoriKegiatanFromSister: loops through all 16 menus")
print("   - SyncKelompokBidangFromSister: syncs both iptek=true and iptek=false")
