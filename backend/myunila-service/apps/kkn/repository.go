package kkn

import (
	"context"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/jmoiron/sqlx"
)

var htmlTagRe = regexp.MustCompile(`<[^>]*>`)

type Repository interface {
	UpsertPeriode(ctx context.Context, data map[string]interface{}) (bool, error)
	UpsertLokasi(ctx context.Context, desa map[string]interface{}, kecamatan, kabupaten string) (bool, error)
	UpsertRegistrasi(ctx context.Context, data map[string]interface{}, periodeUUID string) (bool, error)
	UpsertDataPemohon(ctx context.Context, biodata map[string]interface{}, registrasiUUID string) (bool, error)
	UpsertKelompok(ctx context.Context, idPeriode string, kelompokNo int, idDesa int, lokasiUUID, periodeUUID string) (string, bool, error)
	UpsertAnggota(ctx context.Context, data map[string]interface{}, kelompokUUID, registrasiUUID string) (bool, error)
	UpsertDPL(ctx context.Context, data map[string]interface{}, kelompokUUID string, peran string) (bool, error)
	UpsertNilai(ctx context.Context, data map[string]interface{}, source string) (bool, error)
	UpsertLaporan(ctx context.Context, data map[string]interface{}) (bool, error)
	UpsertProgramKerja(ctx context.Context, data map[string]interface{}) (bool, error)

	GetPeriodeUUID(ctx context.Context, legacyID int) (string, error)
	GetLokasiUUID(ctx context.Context, legacyIDDesa int) (string, error)
	GetRegistrasiUUID(ctx context.Context, legacyID int) (string, error)
	GetKelompokUUID(ctx context.Context, periodeUUID string, kelompokNo int, legacyIDDesa int) (string, error)
	GetAnggotaUUID(ctx context.Context, legacyID int) (string, error)
	GetMahasiswaUUID(ctx context.Context, npm string) (string, error)
	GetDosenUUID(ctx context.Context, nip string) (string, error)

	GetSQLServerStats(ctx context.Context) ([]SQLTableStat, error)
	EnrichAfterSync(ctx context.Context) error

	// List endpoints
	ListPeriode(ctx context.Context, f ListFilter) ([]PeriodeKKNRow, int, error)
	ListLokasi(ctx context.Context, f ListFilter) ([]LokasiKKNRow, int, error)
	ListRegistrasi(ctx context.Context, f ListFilter) ([]RegistrasiKKNRow, int, error)
	ListKelompok(ctx context.Context, f ListFilter) ([]KelompokKKNRow, int, error)
	ListDPL(ctx context.Context, f ListFilter) ([]DPLKelompokRow, int, error)
	ListNilai(ctx context.Context, f ListFilter) ([]NilaiMahasiswaRow, int, error)
	ListProgramKerja(ctx context.Context, f ListFilter) ([]ProgramKerjaRow, int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func getString(data map[string]interface{}, key string) string {
	if v, ok := data[key]; ok && v != nil {
		return fmt.Sprintf("%v", v)
	}
	return ""
}

func getInt(data map[string]interface{}, key string) int {
	if v, ok := data[key]; ok && v != nil {
		switch n := v.(type) {
		case float64:
			return int(n)
		case int:
			return n
		case string:
			var i int
			fmt.Sscanf(n, "%d", &i)
			return i
		}
	}
	return 0
}

func getFloat(data map[string]interface{}, key string) float64 {
	if v, ok := data[key]; ok && v != nil {
		switch n := v.(type) {
		case float64:
			return n
		case int:
			return float64(n)
		case string:
			var f float64
			fmt.Sscanf(n, "%f", &f)
			return f
		}
	}
	return 0
}

func (r *repository) UpsertPeriode(ctx context.Context, data map[string]interface{}) (bool, error) {
	legacyID := getInt(data, "id_periode")
	periode := getString(data, "periode")
	tahun := getInt(data, "tahun")
	kode := fmt.Sprintf("KKN-%d-%s", tahun, strings.ReplaceAll(periode, " ", "-"))
	nama := fmt.Sprintf("KKN %s %d", periode, tahun)

	var exists int
	err := r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.periode_kkn WHERE legacy_id = @p1", legacyID)
	if err != nil {
		return false, err
	}

	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE kkn.periode_kkn SET nm_periode = @p1, tahun_akademik = @p2, last_update = GETDATE()
			WHERE legacy_id = @p3
		`, nama, fmt.Sprintf("%d", tahun), legacyID)
		return false, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.periode_kkn (kode_periode, nm_periode, tahun_akademik, legacy_id, a_aktif)
		VALUES (@p1, @p2, @p3, @p4, 1)
	`, kode, nama, fmt.Sprintf("%d", tahun), legacyID)
	return true, err
}

func (r *repository) UpsertLokasi(ctx context.Context, desa map[string]interface{}, kecamatan, kabupaten string) (bool, error) {
	legacyIDDesa := getInt(desa, "id_desa")
	legacyIDKec := getInt(desa, "id_kecamatan")
	namaDesa := getString(desa, "nama_desa")
	kode := fmt.Sprintf("LOK-%d", legacyIDDesa)

	var exists int
	err := r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.lokasi_kkn WHERE legacy_id_desa = @p1", legacyIDDesa)
	if err != nil {
		return false, err
	}

	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE kkn.lokasi_kkn SET nm_desa = @p1, nm_kecamatan = @p2, nm_kabupaten = @p3,
				nm_provinsi = 'Lampung', last_update = GETDATE()
			WHERE legacy_id_desa = @p4
		`, namaDesa, kecamatan, kabupaten, legacyIDDesa)
		return false, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.lokasi_kkn (kode_lokasi, nm_desa, nm_kecamatan, nm_kabupaten, nm_provinsi,
			legacy_id_desa, legacy_id_kecamatan, a_aktif)
		VALUES (@p1, @p2, @p3, @p4, 'Lampung', @p5, @p6, 1)
	`, kode, namaDesa, kecamatan, kabupaten, legacyIDDesa, legacyIDKec)
	return true, err
}

func (r *repository) UpsertRegistrasi(ctx context.Context, data map[string]interface{}, periodeUUID string) (bool, error) {
	legacyID := getInt(data, "id_pendaftaran")
	npm := getString(data, "npm")
	noReg := getString(data, "no_register")
	status := getString(data, "status")

	statusMap := map[string]string{"1": "diterima", "0": "ditolak", "2": "mengundurkan_diri"}
	mappedStatus := "draft"
	if s, ok := statusMap[status]; ok {
		mappedStatus = s
	}

	var exists int
	err := r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.registrasi_kkn WHERE legacy_id = @p1", legacyID)
	if err != nil {
		return false, err
	}

	tglDiajukan := getString(data, "created_at")

	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE kkn.registrasi_kkn SET status = @p1, npm = @p2,
				tgl_diajukan = COALESCE(tgl_diajukan, TRY_CAST(@p3 AS DATETIME)),
				last_update = GETDATE()
			WHERE legacy_id = @p4
		`, mappedStatus, npm, nullIfEmpty(tglDiajukan), legacyID)
		return false, err
	}

	if noReg == "" {
		noReg = fmt.Sprintf("REG-%d", legacyID)
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.registrasi_kkn (id_periode_kkn, nomor_registrasi, status, npm, tgl_diajukan, legacy_id)
		VALUES (@p1, @p2, @p3, @p4, TRY_CAST(@p5 AS DATETIME), @p6)
	`, periodeUUID, noReg, mappedStatus, npm, nullIfEmpty(tglDiajukan), legacyID)
	return true, err
}

func (r *repository) UpsertDataPemohon(ctx context.Context, biodata map[string]interface{}, registrasiUUID string) (bool, error) {
	legacyID := getInt(biodata, "id_bio_mahasiswa")
	npm := getString(biodata, "npm")
	nama := getString(biodata, "nama_mahasiswa")
	jk := getString(biodata, "jenis_kelamin")
	tempatLahir := getString(biodata, "tempat_lahir")
	email := getString(biodata, "email")
	telpon := getString(biodata, "telpon")
	ipk := getFloat(biodata, "ipk")
	sks := getInt(biodata, "total_sks")

	jkCode := ""
	if strings.Contains(strings.ToLower(jk), "pria") || strings.Contains(strings.ToLower(jk), "laki") {
		jkCode = "L"
	} else if jk != "" {
		jkCode = "P"
	}

	mahasiswaUUID, _ := r.GetMahasiswaUUID(ctx, npm)

	if registrasiUUID == "" {
		return false, nil
	}

	var exists int
	err := r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.data_pemohon WHERE legacy_id = @p1", legacyID)
	if err != nil {
		return false, err
	}

	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE dp SET dp.nm_mahasiswa = @p1, dp.jenis_kelamin = @p2, dp.ipk = @p3,
				dp.sks_lulus = @p4, dp.no_hp = @p5, dp.email = @p6, dp.last_update = GETDATE(),
				dp.id_prodi = COALESCE(dp.id_prodi, rp.id_sms),
				dp.nm_prodi = COALESCE(NULLIF(dp.nm_prodi,''), sms.nm_lemb),
				dp.id_fakultas = COALESCE(dp.id_fakultas, sms.id_fak_unila),
				dp.nm_fakultas = COALESCE(NULLIF(dp.nm_fakultas,''), fak.nm_lemb),
				dp.angkatan = COALESCE(dp.angkatan, rp.angkatan)
			FROM kkn.data_pemohon dp
			OUTER APPLY (SELECT TOP 1 r2.id_sms, r2.angkatan FROM pdrd.reg_pd r2 WHERE r2.nipd = dp.nim ORDER BY r2.tgl_masuk_sp DESC) rp
			OUTER APPLY (SELECT s2.nm_lemb, s2.id_fak_unila FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
			OUTER APPLY (SELECT f2.nm_lemb FROM man_akses.unit_organisasi f2 WHERE f2.id_organisasi = sms.id_fak_unila) fak
			WHERE dp.legacy_id = @p7
		`, nama, jkCode, ipk, sks, telpon, email, legacyID)
		return false, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.data_pemohon (id_registrasi, id_mahasiswa, nim, nm_mahasiswa,
			tempat_lahir, jenis_kelamin, ipk, sks_lulus, no_hp, email, legacy_id)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11)
	`, registrasiUUID, nullIfEmpty(mahasiswaUUID), npm, nama, tempatLahir, jkCode, ipk, sks, telpon, email, legacyID)
	if err != nil {
		return false, err
	}

	// Enrich newly inserted row with prodi/fakultas/angkatan from pdrd
	r.db.ExecContext(ctx, `
		UPDATE dp SET
			dp.id_prodi = rp.id_sms,
			dp.nm_prodi = sms.nm_lemb,
			dp.id_fakultas = sms.id_fak_unila,
			dp.nm_fakultas = fak.nm_lemb,
			dp.angkatan = rp.angkatan
		FROM kkn.data_pemohon dp
		CROSS APPLY (SELECT TOP 1 r2.id_sms, r2.angkatan FROM pdrd.reg_pd r2 WHERE r2.nipd = dp.nim ORDER BY r2.tgl_masuk_sp DESC) rp
		CROSS APPLY (SELECT s2.nm_lemb, s2.id_fak_unila FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
		CROSS APPLY (SELECT f2.nm_lemb FROM man_akses.unit_organisasi f2 WHERE f2.id_organisasi = sms.id_fak_unila) fak
		WHERE dp.legacy_id = @p1
	`, legacyID)

	return true, nil
}

func (r *repository) UpsertKelompok(ctx context.Context, idPeriode string, kelompokNo int, idDesa int, lokasiUUID, periodeUUID string) (string, bool, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT CAST(id_kelompok AS VARCHAR(36)) FROM kkn.kelompok_kkn WHERE id_periode_kkn = @p1 AND legacy_kelompok_no = @p2 AND legacy_id_desa = @p3",
		periodeUUID, kelompokNo, idDesa)
	if err == nil {
		return uuid, false, nil
	}

	kode := fmt.Sprintf("KLP-%s-%d-%d", idPeriode, idDesa, kelompokNo)
	nama := fmt.Sprintf("Kelompok %d", kelompokNo)

	var newUUID string
	err = r.db.GetContext(ctx, &newUUID, `
		INSERT INTO kkn.kelompok_kkn (id_periode_kkn, id_lokasi, kode_kelompok, nm_kelompok,
			legacy_kelompok_no, legacy_id_desa, status)
		OUTPUT CAST(INSERTED.id_kelompok AS VARCHAR(36))
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, 'aktif')
	`, periodeUUID, nullIfEmpty(lokasiUUID), kode, nama, kelompokNo, idDesa)
	if err != nil {
		return "", false, err
	}
	return newUUID, true, nil
}

func (r *repository) UpsertAnggota(ctx context.Context, data map[string]interface{}, kelompokUUID, registrasiUUID string) (bool, error) {
	legacyID := getInt(data, "id_penempatan")
	npm := getString(data, "npm")

	if kelompokUUID == "" {
		return false, fmt.Errorf("missing kelompok UUID for npm=%s", npm)
	}

	mahasiswaUUID, _ := r.GetMahasiswaUUID(ctx, npm)

	var exists int
	err := r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.anggota_kelompok WHERE legacy_id = @p1", legacyID)
	if err != nil {
		return false, err
	}
	if exists > 0 {
		return false, nil
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.anggota_kelompok (id_kelompok, id_registrasi, id_mahasiswa, npm, legacy_id, status)
		VALUES (@p1, @p2, @p3, @p4, @p5, 'aktif')
	`, kelompokUUID, nullIfEmpty(registrasiUUID), nullIfEmpty(mahasiswaUUID), npm, legacyID)
	return err == nil, err
}

func (r *repository) UpsertDPL(ctx context.Context, data map[string]interface{}, kelompokUUID string, peran string) (bool, error) {
	nip := getString(data, "nip")
	nama := getString(data, "nama_dpl")
	if nama == "" {
		nama = getString(data, "nama_kdpl")
	}
	hp := getString(data, "hp")

	cleanNIP := strings.TrimSuffix(nip, "_x")
	dosenUUID, _ := r.GetDosenUUID(ctx, cleanNIP)

	// If dosen found in pdrd and name from MySQL is empty/suspicious, use pdrd name
	if dosenUUID != "" && (nama == "" || strings.Contains(strings.ToUpper(nama), "HACKED")) {
		var pdrdName string
		r.db.GetContext(ctx, &pdrdName, "SELECT nm_sdm FROM pdrd.sdm WHERE id_sdm = @p1", dosenUUID)
		if pdrdName != "" {
			nama = pdrdName
		}
	}

	// Also try to get NIDN from pdrd.sdm
	nidn := cleanNIP
	if dosenUUID != "" {
		var realNIDN string
		r.db.GetContext(ctx, &realNIDN, "SELECT ISNULL(nidn,'') FROM pdrd.sdm WHERE id_sdm = @p1", dosenUUID)
		if realNIDN != "" {
			nidn = realNIDN
		}
	}

	var exists int
	err := r.db.GetContext(ctx, &exists,
		"SELECT COUNT(1) FROM kkn.dpl_kelompok WHERE id_kelompok = @p1 AND nip = @p2", kelompokUUID, cleanNIP)
	if err != nil {
		return false, err
	}
	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE kkn.dpl_kelompok SET nm_dosen = @p1, no_hp = @p2, id_dosen = @p3, nidn = @p4, last_update = GETDATE()
			WHERE id_kelompok = @p5 AND nip = @p6
		`, nama, hp, nullIfEmpty(dosenUUID), nidn, kelompokUUID, cleanNIP)
		return false, err
	}

	// Also check with original NIP (in case it was stored with _x before)
	if nip != cleanNIP {
		err = r.db.GetContext(ctx, &exists,
			"SELECT COUNT(1) FROM kkn.dpl_kelompok WHERE id_kelompok = @p1 AND nip = @p2", kelompokUUID, nip)
		if err == nil && exists > 0 {
			_, err = r.db.ExecContext(ctx, `
				UPDATE kkn.dpl_kelompok SET nm_dosen = @p1, no_hp = @p2, id_dosen = @p3, nip = @p4, nidn = @p5, last_update = GETDATE()
				WHERE id_kelompok = @p6 AND nip = @p7
			`, nama, hp, nullIfEmpty(dosenUUID), cleanNIP, nidn, kelompokUUID, nip)
			return false, err
		}
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.dpl_kelompok (id_kelompok, id_dosen, nm_dosen, nidn, nip, peran, no_hp)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)
	`, kelompokUUID, nullIfEmpty(dosenUUID), nama, nidn, cleanNIP, peran, hp)
	return err == nil, err
}

func (r *repository) UpsertNilai(ctx context.Context, data map[string]interface{}, source string) (bool, error) {
	legacyID := getInt(data, "id_nilai_dpl")
	if legacyID == 0 {
		legacyID = getInt(data, "id_nilai_kdpl")
	}
	nilai := getFloat(data, "nilai")
	nip := getString(data, "nip")

	var exists int
	err := r.db.GetContext(ctx, &exists,
		"SELECT COUNT(1) FROM kkn.nilai_mahasiswa WHERE legacy_id = @p1 AND legacy_source = @p2", legacyID, source)
	if err != nil {
		return false, err
	}
	if exists > 0 {
		return false, nil
	}

	dosenUUID, _ := r.GetDosenUUID(ctx, nip)

	kompKode := "NILAI-DPL"
	if source == "kdpl" {
		kompKode = "NILAI-KDPL"
	}
	var kompUUID string
	err = r.db.GetContext(ctx, &kompUUID,
		"SELECT CAST(id_komponen AS VARCHAR(36)) FROM kkn.komponen_penilaian WHERE kode_komponen = @p1", kompKode)
	if err != nil {
		return false, nil
	}

	idMhs := getInt(data, "id_mahasiswa")
	var anggotaUUID string
	r.db.GetContext(ctx, &anggotaUUID,
		"SELECT TOP 1 CAST(id_anggota AS VARCHAR(36)) FROM kkn.anggota_kelompok WHERE legacy_id = @p1", idMhs)
	if anggotaUUID == "" {
		return false, nil
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.nilai_mahasiswa (id_anggota, id_komponen, nilai, id_penilai, legacy_id, legacy_source)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6)
	`, anggotaUUID, kompUUID, nilai, nullIfEmpty(dosenUUID), legacyID, source)
	return err == nil, err
}

func (r *repository) UpsertLaporan(ctx context.Context, data map[string]interface{}) (bool, error) {
	legacyID := getInt(data, "id_laporan")
	judul := stripHTML(getString(data, "program_kerja"))
	if len(judul) > 300 {
		judul = judul[:300]
	}
	deskripsi := stripHTML(getString(data, "kegiatan"))

	var exists int
	r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.laporan_kelompok WHERE legacy_id = @p1", legacyID)
	if exists > 0 {
		return false, nil
	}

	idDesa := getInt(data, "id_desa")
	var kelompokUUID string
	r.db.GetContext(ctx, &kelompokUUID,
		"SELECT TOP 1 CAST(id_kelompok AS VARCHAR(36)) FROM kkn.kelompok_kkn WHERE legacy_id_desa = @p1", idDesa)
	if kelompokUUID == "" {
		return false, nil
	}

	pathFile := getString(data, "foto")
	if pathFile == "" {
		pathFile = "legacy-no-file"
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO kkn.laporan_kelompok (id_kelompok, judul, deskripsi, path_file, jenis_laporan, status, legacy_id)
		VALUES (@p1, @p2, @p3, @p4, 'laporan_akhir', 'diajukan', @p5)
	`, kelompokUUID, judul, deskripsi, pathFile, legacyID)
	return err == nil, err
}

func stripHTML(s string) string {
	s = htmlTagRe.ReplaceAllString(s, "")
	s = strings.ReplaceAll(s, "&nbsp;", " ")
	s = strings.ReplaceAll(s, "&amp;", "&")
	s = strings.ReplaceAll(s, "&lt;", "<")
	s = strings.ReplaceAll(s, "&gt;", ">")
	s = strings.TrimSpace(s)
	return s
}

func (r *repository) UpsertProgramKerja(ctx context.Context, data map[string]interface{}) (bool, error) {
	legacyID := getInt(data, "id_laporan_rk")
	judul := stripHTML(getString(data, "pk_rk"))
	if len(judul) > 300 {
		judul = judul[:300]
	}

	var exists int
	r.db.GetContext(ctx, &exists, "SELECT COUNT(1) FROM kkn.program_kerja WHERE legacy_id = @p1", legacyID)
	if exists > 0 {
		return false, nil
	}

	idDesa := getInt(data, "id_desa")
	var kelompokUUID string
	r.db.GetContext(ctx, &kelompokUUID,
		"SELECT TOP 1 CAST(id_kelompok AS VARCHAR(36)) FROM kkn.kelompok_kkn WHERE legacy_id_desa = @p1", idDesa)
	if kelompokUUID == "" {
		return false, nil
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO kkn.program_kerja (id_kelompok, judul, deskripsi, status, legacy_id)
		VALUES (@p1, @p2, @p3, 'selesai', @p4)
	`, kelompokUUID, judul, getString(data, "sasaran"), legacyID)
	return err == nil, err
}

func (r *repository) GetPeriodeUUID(ctx context.Context, legacyID int) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT CAST(id_periode_kkn AS VARCHAR(36)) FROM kkn.periode_kkn WHERE legacy_id = @p1", legacyID)
	return uuid, err
}

func (r *repository) GetLokasiUUID(ctx context.Context, legacyIDDesa int) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT CAST(id_lokasi AS VARCHAR(36)) FROM kkn.lokasi_kkn WHERE legacy_id_desa = @p1", legacyIDDesa)
	return uuid, err
}

func (r *repository) GetRegistrasiUUID(ctx context.Context, legacyID int) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT CAST(id_registrasi AS VARCHAR(36)) FROM kkn.registrasi_kkn WHERE legacy_id = @p1", legacyID)
	return uuid, err
}

func (r *repository) GetKelompokUUID(ctx context.Context, periodeUUID string, kelompokNo int, legacyIDDesa int) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT CAST(id_kelompok AS VARCHAR(36)) FROM kkn.kelompok_kkn WHERE id_periode_kkn = @p1 AND legacy_kelompok_no = @p2 AND legacy_id_desa = @p3",
		periodeUUID, kelompokNo, legacyIDDesa)
	return uuid, err
}

func (r *repository) GetAnggotaUUID(ctx context.Context, legacyID int) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT CAST(id_anggota AS VARCHAR(36)) FROM kkn.anggota_kelompok WHERE legacy_id = @p1", legacyID)
	return uuid, err
}

func (r *repository) GetMahasiswaUUID(ctx context.Context, npm string) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT TOP 1 CAST(id_pd AS VARCHAR(36)) FROM pdrd.reg_pd WHERE nipd = @p1", npm)
	return uuid, err
}

func (r *repository) GetDosenUUID(ctx context.Context, nip string) (string, error) {
	var uuid string
	err := r.db.GetContext(ctx, &uuid,
		"SELECT TOP 1 CAST(id_sdm AS VARCHAR(36)) FROM pdrd.sdm WHERE nip = @p1", nip)
	if err != nil {
		err = r.db.GetContext(ctx, &uuid,
			"SELECT TOP 1 CAST(id_sdm AS VARCHAR(36)) FROM pdrd.sdm WHERE nidn = @p1", nip)
	}
	return uuid, err
}

func (r *repository) GetSQLServerStats(ctx context.Context) ([]SQLTableStat, error) {
	tables := []string{
		"periode_kkn", "lokasi_kkn", "registrasi_kkn", "data_pemohon",
		"kelompok_kkn", "anggota_kelompok", "dpl_kelompok",
		"nilai_mahasiswa", "nilai_akhir", "laporan_kelompok", "program_kerja",
	}
	var stats []SQLTableStat
	for _, t := range tables {
		var count int
		err := r.db.GetContext(ctx, &count, fmt.Sprintf("SELECT COUNT(1) FROM kkn.%s", t))
		if err != nil {
			count = -1
		}
		stats = append(stats, SQLTableStat{Table: "kkn." + t, Count: count})
	}
	return stats, nil
}

func (r *repository) EnsureKomponenPenilaian(ctx context.Context) error {
	komponen := []struct {
		Kode    string
		Nama    string
		Bobot   float64
		Penilai string
	}{
		{"NILAI-DPL", "Nilai DPL", 50, "dpl"},
		{"NILAI-KDPL", "Nilai KDPL", 50, "dpl"},
	}
	for _, k := range komponen {
		_, err := r.db.ExecContext(ctx, `
			IF NOT EXISTS (SELECT 1 FROM kkn.komponen_penilaian WHERE kode_komponen = @p1)
			INSERT INTO kkn.komponen_penilaian (kode_komponen, nm_komponen, bobot, penilai, urutan, a_aktif)
			VALUES (@p1, @p2, @p3, @p4, 1, 1)
		`, k.Kode, k.Nama, k.Bobot, k.Penilai)
		if err != nil {
			log.Printf("⚠️  Failed to seed komponen %s: %v", k.Kode, err)
		}
	}
	return nil
}

func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func (r *repository) EnrichAfterSync(ctx context.Context) error {
	// Enrich data_pemohon: fill nm_prodi, nm_fakultas, angkatan from pdrd.reg_pd → sms → fak
	_, err := r.db.ExecContext(ctx, `
		UPDATE dp SET
			dp.id_prodi = rp.id_sms,
			dp.nm_prodi = sms.nm_lemb,
			dp.id_fakultas = sms.id_fak_unila,
			dp.nm_fakultas = fak.nm_lemb,
			dp.angkatan = rp.angkatan
		FROM kkn.data_pemohon dp
		CROSS APPLY (SELECT TOP 1 r2.id_sms, r2.angkatan FROM pdrd.reg_pd r2 WHERE r2.nipd = dp.nim ORDER BY r2.tgl_masuk_sp DESC) rp
		CROSS APPLY (SELECT s2.nm_lemb, s2.id_fak_unila FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
		CROSS APPLY (SELECT f2.nm_lemb FROM man_akses.unit_organisasi f2 WHERE f2.id_organisasi = sms.id_fak_unila) fak
		WHERE dp.soft_delete = 0 AND (dp.nm_prodi IS NULL OR dp.nm_prodi = '')
	`)
	if err != nil {
		log.Printf("⚠️  EnrichAfterSync data_pemohon: %v", err)
	}

	// Enrich dpl_kelompok: fill nm_dosen and id_dosen from pdrd.sdm
	_, err = r.db.ExecContext(ctx, `
		UPDATE d SET
			d.nm_dosen = COALESCE(NULLIF(d.nm_dosen,''), s.nm_sdm),
			d.id_dosen = COALESCE(d.id_dosen, s.id_sdm)
		FROM kkn.dpl_kelompok d
		INNER JOIN pdrd.sdm s ON d.nip = s.nip
		WHERE d.soft_delete = 0 AND (d.nm_dosen IS NULL OR d.nm_dosen = '' OR d.id_dosen IS NULL)
	`)
	if err != nil {
		log.Printf("⚠️  EnrichAfterSync dpl_kelompok: %v", err)
	}

	return nil
}

// ============================================================================
// LIST ENDPOINTS — paginated queries
// ============================================================================

func (r *repository) ListPeriode(ctx context.Context, f ListFilter) ([]PeriodeKKNRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.periode_kkn WHERE soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (nm_periode LIKE @p%d OR kode_periode LIKE @p%d OR tahun_akademik LIKE @p%d)`, argIdx, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(id_periode_kkn AS VARCHAR(36)) AS id_periode_kkn,
		ISNULL(kode_periode,'') AS kode_periode, ISNULL(nm_periode,'') AS nm_periode,
		ISNULL(tahun_akademik,'') AS tahun_akademik, ISNULL(gelombang,0) AS gelombang,
		FORMAT(tgl_daftar_mulai,'yyyy-MM-dd') AS tgl_daftar_mulai,
		FORMAT(tgl_daftar_selesai,'yyyy-MM-dd') AS tgl_daftar_selesai,
		FORMAT(tgl_pelaksanaan_mulai,'yyyy-MM-dd') AS tgl_pelaksanaan_mulai,
		FORMAT(tgl_pelaksanaan_selesai,'yyyy-MM-dd') AS tgl_pelaksanaan_selesai,
		ISNULL(durasi_hari,0) AS durasi_hari, ISNULL(kuota_total,0) AS kuota_total,
		ISNULL(a_aktif,0) AS a_aktif
		FROM kkn.periode_kkn WHERE soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (nm_periode LIKE @p%d OR kode_periode LIKE @p%d OR tahun_akademik LIKE @p%d)`, listArgIdx, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY tahun_akademik DESC, gelombang DESC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []PeriodeKKNRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *repository) ListLokasi(ctx context.Context, f ListFilter) ([]LokasiKKNRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.lokasi_kkn WHERE soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (nm_desa LIKE @p%d OR nm_kecamatan LIKE @p%d OR nm_kabupaten LIKE @p%d OR nm_provinsi LIKE @p%d)`, argIdx, argIdx, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(id_lokasi AS VARCHAR(36)) AS id_lokasi,
		ISNULL(kode_lokasi,'') AS kode_lokasi, ISNULL(nm_desa,'') AS nm_desa,
		ISNULL(nm_kecamatan,'') AS nm_kecamatan, ISNULL(nm_kabupaten,'') AS nm_kabupaten,
		ISNULL(nm_provinsi,'') AS nm_provinsi, ISNULL(kode_pos,'') AS kode_pos,
		ISNULL(a_aktif,0) AS a_aktif
		FROM kkn.lokasi_kkn WHERE soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (nm_desa LIKE @p%d OR nm_kecamatan LIKE @p%d OR nm_kabupaten LIKE @p%d OR nm_provinsi LIKE @p%d)`, listArgIdx, listArgIdx, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY nm_kabupaten ASC, nm_kecamatan ASC, nm_desa ASC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []LokasiKKNRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *repository) ListRegistrasi(ctx context.Context, f ListFilter) ([]RegistrasiKKNRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.registrasi_kkn r
		LEFT JOIN kkn.data_pemohon dp ON dp.id_registrasi = r.id_registrasi
		WHERE r.soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (r.nomor_registrasi LIKE @p%d OR r.npm LIKE @p%d OR dp.nm_mahasiswa LIKE @p%d OR dp.nm_prodi LIKE @p%d)`, argIdx, argIdx, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(r.id_registrasi AS VARCHAR(36)) AS id_registrasi,
		ISNULL(r.nomor_registrasi,'') AS nomor_registrasi,
		ISNULL(r.npm,'') AS npm,
		ISNULL(dp.nm_mahasiswa,'') AS nm_mahasiswa,
		COALESCE(NULLIF(dp.nm_prodi,''), sms.nm_lemb, '') AS nm_prodi,
		COALESCE(NULLIF(dp.nm_fakultas,''), fak.nm_lemb, '') AS nm_fakultas,
		ISNULL(r.status,'') AS status,
		FORMAT(r.tgl_diajukan,'yyyy-MM-dd') AS tgl_diajukan
		FROM kkn.registrasi_kkn r
		LEFT JOIN kkn.data_pemohon dp ON dp.id_registrasi = r.id_registrasi
		OUTER APPLY (SELECT TOP 1 r2.id_sms FROM pdrd.reg_pd r2 WHERE r2.nipd = r.npm ORDER BY r2.tgl_masuk_sp DESC) rp
		OUTER APPLY (SELECT s2.nm_lemb, s2.id_fak_unila FROM pdrd.sms s2 WHERE s2.id_sms = rp.id_sms) sms
		OUTER APPLY (SELECT f2.nm_lemb FROM man_akses.unit_organisasi f2 WHERE f2.id_organisasi = sms.id_fak_unila) fak
		WHERE r.soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (r.nomor_registrasi LIKE @p%d OR r.npm LIKE @p%d OR dp.nm_mahasiswa LIKE @p%d OR dp.nm_prodi LIKE @p%d)`, listArgIdx, listArgIdx, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY r.create_date DESC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []RegistrasiKKNRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *repository) ListKelompok(ctx context.Context, f ListFilter) ([]KelompokKKNRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.kelompok_kkn k
		JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		LEFT JOIN kkn.lokasi_kkn l ON l.id_lokasi = k.id_lokasi
		WHERE k.soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (k.kode_kelompok LIKE @p%d OR k.nm_kelompok LIKE @p%d OR l.nm_desa LIKE @p%d)`, argIdx, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(k.id_kelompok AS VARCHAR(36)) AS id_kelompok,
		ISNULL(k.kode_kelompok,'') AS kode_kelompok,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(p.nm_periode,'') AS nm_periode,
		ISNULL(l.nm_desa,'') AS nm_desa,
		ISNULL(k.kuota,0) AS kuota,
		(SELECT COUNT(*) FROM kkn.anggota_kelompok a WHERE a.id_kelompok = k.id_kelompok AND a.soft_delete = 0) AS jumlah_anggota,
		ISNULL(k.status,'') AS status
		FROM kkn.kelompok_kkn k
		JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		LEFT JOIN kkn.lokasi_kkn l ON l.id_lokasi = k.id_lokasi
		WHERE k.soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (k.kode_kelompok LIKE @p%d OR k.nm_kelompok LIKE @p%d OR l.nm_desa LIKE @p%d)`, listArgIdx, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY p.tahun_akademik DESC, k.kode_kelompok ASC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []KelompokKKNRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *repository) ListDPL(ctx context.Context, f ListFilter) ([]DPLKelompokRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.dpl_kelompok d
		JOIN kkn.kelompok_kkn k ON k.id_kelompok = d.id_kelompok
		WHERE d.soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (d.nm_dosen LIKE @p%d OR d.nidn LIKE @p%d OR d.nip LIKE @p%d OR k.nm_kelompok LIKE @p%d)`, argIdx, argIdx, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(d.id_dpl AS VARCHAR(36)) AS id_dpl,
		COALESCE(NULLIF(d.nm_dosen,''), s.nm_sdm, '') AS nm_dosen,
		COALESCE(NULLIF(d.nidn,''), s.nidn, '') AS nidn,
		ISNULL(d.nip,'') AS nip,
		ISNULL(d.peran,'') AS peran,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(d.a_aktif,0) AS a_aktif
		FROM kkn.dpl_kelompok d
		JOIN kkn.kelompok_kkn k ON k.id_kelompok = d.id_kelompok
		LEFT JOIN pdrd.sdm s ON d.nip = s.nip
		WHERE d.soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (d.nm_dosen LIKE @p%d OR d.nidn LIKE @p%d OR d.nip LIKE @p%d OR k.nm_kelompok LIKE @p%d)`, listArgIdx, listArgIdx, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY CASE WHEN COALESCE(NULLIF(d.nm_dosen,''), s.nm_sdm) IS NULL THEN 1 ELSE 0 END, COALESCE(NULLIF(d.nm_dosen,''), s.nm_sdm, '') ASC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []DPLKelompokRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *repository) ListNilai(ctx context.Context, f ListFilter) ([]NilaiMahasiswaRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.nilai_mahasiswa n
		JOIN kkn.anggota_kelompok a ON a.id_anggota = n.id_anggota
		LEFT JOIN kkn.kelompok_kkn k ON k.id_kelompok = a.id_kelompok
		WHERE n.soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (a.npm LIKE @p%d OR k.nm_kelompok LIKE @p%d)`, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(n.id_nilai AS VARCHAR(36)) AS id_nilai,
		ISNULL(a.npm,'') AS npm,
		ISNULL((SELECT TOP 1 dp.nm_mahasiswa FROM kkn.data_pemohon dp WHERE dp.nim = a.npm),'') AS nm_mahasiswa,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(n.nilai,0) AS nilai,
		ISNULL(n.catatan,'') AS catatan,
		FORMAT(n.tgl_penilaian,'yyyy-MM-dd') AS tgl_penilaian,
		ISNULL(n.legacy_source,'') AS legacy_source
		FROM kkn.nilai_mahasiswa n
		JOIN kkn.anggota_kelompok a ON a.id_anggota = n.id_anggota
		LEFT JOIN kkn.kelompok_kkn k ON k.id_kelompok = a.id_kelompok
		WHERE n.soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (a.npm LIKE @p%d OR k.nm_kelompok LIKE @p%d)`, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY n.create_date DESC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []NilaiMahasiswaRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	return rows, total, nil
}

func (r *repository) ListProgramKerja(ctx context.Context, f ListFilter) ([]ProgramKerjaRow, int, error) {
	countQuery := `SELECT COUNT(*) FROM kkn.program_kerja pk
		JOIN kkn.kelompok_kkn k ON k.id_kelompok = pk.id_kelompok
		LEFT JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		WHERE pk.soft_delete = 0`
	args := []interface{}{}
	argIdx := 1
	if f.Search != "" {
		countQuery += fmt.Sprintf(` AND (pk.judul LIKE @p%d OR pk.bidang LIKE @p%d OR k.nm_kelompok LIKE @p%d)`, argIdx, argIdx, argIdx)
		args = append(args, "%"+f.Search+"%")
		argIdx++
	}
	var total int
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT CAST(pk.id_proker AS VARCHAR(36)) AS id_proker,
		ISNULL(k.nm_kelompok,'') AS nm_kelompok,
		ISNULL(p.nm_periode,'') AS nm_periode,
		ISNULL(pk.judul,'') AS judul,
		ISNULL(pk.bidang,'') AS bidang,
		ISNULL(pk.status,'') AS status,
		FORMAT(pk.tgl_mulai,'yyyy-MM-dd') AS tgl_mulai,
		FORMAT(pk.tgl_selesai,'yyyy-MM-dd') AS tgl_selesai
		FROM kkn.program_kerja pk
		JOIN kkn.kelompok_kkn k ON k.id_kelompok = pk.id_kelompok
		LEFT JOIN kkn.periode_kkn p ON p.id_periode_kkn = k.id_periode_kkn
		WHERE pk.soft_delete = 0`
	listArgs := []interface{}{}
	listArgIdx := 1
	if f.Search != "" {
		listQuery += fmt.Sprintf(` AND (pk.judul LIKE @p%d OR pk.bidang LIKE @p%d OR k.nm_kelompok LIKE @p%d)`, listArgIdx, listArgIdx, listArgIdx)
		listArgs = append(listArgs, "%"+f.Search+"%")
		listArgIdx++
	}
	listQuery += ` ORDER BY pk.create_date DESC`
	listQuery += fmt.Sprintf(` OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`, listArgIdx, listArgIdx+1)
	listArgs = append(listArgs, (f.Page-1)*f.Limit, f.Limit)

	var rows []ProgramKerjaRow
	err = r.db.SelectContext(ctx, &rows, listQuery, listArgs...)
	if err != nil {
		return nil, 0, err
	}
	for i := range rows {
		rows[i].Judul = stripHTML(rows[i].Judul)
	}
	return rows, total, nil
}
