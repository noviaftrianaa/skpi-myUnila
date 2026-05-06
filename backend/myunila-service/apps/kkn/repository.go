package kkn

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/jmoiron/sqlx"
)

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

	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE kkn.registrasi_kkn SET status = @p1, npm = @p2, last_update = GETDATE()
			WHERE legacy_id = @p3
		`, mappedStatus, npm, legacyID)
		return false, err
	}

	if noReg == "" {
		noReg = fmt.Sprintf("REG-%d", legacyID)
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.registrasi_kkn (id_periode_kkn, nomor_registrasi, status, npm, legacy_id)
		VALUES (@p1, @p2, @p3, @p4, @p5)
	`, periodeUUID, noReg, mappedStatus, npm, legacyID)
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
			UPDATE kkn.data_pemohon SET nm_mahasiswa = @p1, jenis_kelamin = @p2, ipk = @p3,
				sks_lulus = @p4, no_hp = @p5, email = @p6, last_update = GETDATE()
			WHERE legacy_id = @p7
		`, nama, jkCode, ipk, sks, telpon, email, legacyID)
		return false, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.data_pemohon (id_registrasi, id_mahasiswa, nim, nm_mahasiswa,
			tempat_lahir, jenis_kelamin, ipk, sks_lulus, no_hp, email, legacy_id)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11)
	`, registrasiUUID, nullIfEmpty(mahasiswaUUID), npm, nama, tempatLahir, jkCode, ipk, sks, telpon, email, legacyID)
	return true, err
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

	dosenUUID, _ := r.GetDosenUUID(ctx, nip)

	var exists int
	err := r.db.GetContext(ctx, &exists,
		"SELECT COUNT(1) FROM kkn.dpl_kelompok WHERE id_kelompok = @p1 AND nip = @p2", kelompokUUID, nip)
	if err != nil {
		return false, err
	}
	if exists > 0 {
		_, err = r.db.ExecContext(ctx, `
			UPDATE kkn.dpl_kelompok SET nm_dosen = @p1, no_hp = @p2, id_dosen = @p3, last_update = GETDATE()
			WHERE id_kelompok = @p4 AND nip = @p5
		`, nama, hp, nullIfEmpty(dosenUUID), kelompokUUID, nip)
		return false, err
	}

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO kkn.dpl_kelompok (id_kelompok, id_dosen, nm_dosen, nidn, nip, peran, no_hp)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7)
	`, kelompokUUID, nullIfEmpty(dosenUUID), nama, nip, nip, peran, hp)
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
	judul := getString(data, "program_kerja")
	if len(judul) > 300 {
		judul = judul[:300]
	}
	deskripsi := getString(data, "kegiatan")

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

func (r *repository) UpsertProgramKerja(ctx context.Context, data map[string]interface{}) (bool, error) {
	legacyID := getInt(data, "id_laporan_rk")
	judul := getString(data, "pk_rk")
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
