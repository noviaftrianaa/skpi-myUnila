package siakadu

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"

	"github.com/myunila/api-service/apps/pdrd/helper"
)

var ErrNotFound = errors.New("siakadu: record not found")

type Repository interface {
	// 11a — mahasiswa + sdm + wisuda
	ListMahasiswa(ctx context.Context, p MahasiswaParams) ([]Mahasiswa, int64, error)
	DetailMahasiswa(ctx context.Context, nim string) (*MahasiswaDetail, error)
	ListKeluargaMhs(ctx context.Context, p KeluargaMhsParams) ([]KeluargaMhs, int64, error)
	ListSdm(ctx context.Context, p SdmParams) ([]Sdm, int64, error)
	DetailSdm(ctx context.Context, idSdm string) (*Sdm, error)
	ListRegPtk(ctx context.Context, p RegPtkParams) ([]RegPtk, int64, error)
	ListWisuda(ctx context.Context, p WisudaParams) ([]WisudaMahasiswa, int64, error)
	ListPeriodeWisuda(ctx context.Context, p PeriodeWisudaParams) ([]PeriodeWisuda, int64, error)

	// 11b — nilai + kehadiran + kinerja
	ListNilaiSmt(ctx context.Context, p NilaiSmtParams) ([]NilaiSmtMhs, int64, error)
	ListNilaiTranskrip(ctx context.Context, p NilaiTranskripParams) ([]NilaiTranskrip, int64, error)
	ListKehadiranMhs(ctx context.Context, p KehadiranMhsParams) ([]KehadiranMhs, int64, error)
	ListKehadiranSdm(ctx context.Context, p KehadiranSdmParams) ([]KehadiranSdm, int64, error)
	ListKinerjaDosen(ctx context.Context, p KinerjaDosenParams) ([]KinerjaDosen, int64, error)

	// 11c — keuangan + status + unit
	ListSppMhs(ctx context.Context, p SppMhsParams) ([]SppMhs, int64, error)
	ListDaftarUkt(ctx context.Context, p DaftarUktParams) ([]DaftarUkt, int64, error)
	ListKelasUkt(ctx context.Context, p KelasUktParams) ([]KelasUkt, int64, error)
	ListKuliahMhs(ctx context.Context, p KuliahMhsParams) ([]KuliahMhs, int64, error)
	ListPimpinanUnit(ctx context.Context, p PimpinanUnitParams) ([]PimpinanUnit, int64, error)
}

type repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) Repository { return &repository{db: db} }

// ============================================================================
// 11a — Mahasiswa + SDM + Wisuda
// ============================================================================

const mhsListCols = `
	m.nim, m.nama, m.angkatan, m.gelar_depan, m.gelar_belakang, m.jk,
	m.tmpt_lahir, m.tgl_lahir,
	m.id_unit, m.nm_fakultas, m.nm_jurusan, m.nm_prodi,
	m.semester, m.ipk, m.sks_total, m.sks_lulus,
	m.id_status_mhs, m.status_mahasiswa,
	m.id_pd, m.id_reg_pd, m.id_sms, m.last_sync`

func (r *repository) ListMahasiswa(ctx context.Context, p MahasiswaParams) ([]Mahasiswa, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("m.nim", p.Nim)
	cb.AppendUUID("m.id_pd", p.IDPd)
	cb.AppendUUID("m.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("m.id_sms", p.IDSms)
	cb.AppendString("m.angkatan", p.Angkatan)
	cb.AppendString("m.id_unit", p.IdUnit)
	cb.AppendString("m.id_status_mhs", p.IdStatusMhs)
	cb.Like("m.nama", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "m.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.mahasiswa m WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "m.nim", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT %s FROM siakadu.mahasiswa m WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		mhsListCols, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Mahasiswa
	for rows.Next() {
		var m Mahasiswa
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) DetailMahasiswa(ctx context.Context, nim string) (*MahasiswaDetail, error) {
	q := `SELECT
		m.nim, m.nama, m.angkatan, m.gelar_depan, m.gelar_belakang, m.jk,
		m.tmpt_lahir, m.tgl_lahir,
		m.id_unit, m.nm_fakultas, m.nm_jurusan, m.nm_prodi,
		m.semester, m.ipk, m.sks_total, m.sks_lulus,
		m.id_status_mhs, m.status_mahasiswa,
		m.id_pd, m.id_reg_pd, m.id_sms, m.last_sync,

		m.nik, m.nokk, m.nisn, m.nupn, m.no_kps, m.npsn, m.nomor_tes,
		CAST(m.no_skdo AS VARCHAR(500)) AS no_skdo, m.pt_nim,
		CAST(m.alamat AS VARCHAR(MAX)) AS alamat, m.telepon, m.hp, m.hp2,
		m.email, m.email_kampus, m.email_ortu, m.kode_pos,
		m.id_kota, m.nama_kota, m.id_kecamatan, m.kecamatan,
		m.rt, m.rw, m.dusun, m.desa,
		m.id_agama, m.nama_agama, m.nama_negara,
		m.jenis_tinggal, m.nama_transport,
		m.nama_pekerjaan, m.nama_penghasilan, m.nama_suku, m.gol_darah,
		m.jalur_pendaftaran, m.tgl_daftar, m.nilai_tpa, m.is_beasiswa,
		m.is_transfer, m.nim_lama, m.univ_asal, m.ipk_asal, m.sks_asal,
		m.asal_smu, m.no_ijazah_smu, m.nem, m.thn_lulus_sekolah,
		m.kategori_ukt
	FROM siakadu.mahasiswa m WHERE m.nim = @p1 AND m.soft_delete = 0`

	var d MahasiswaDetail
	err := r.db.QueryRowxContext(ctx, q, nim).StructScan(&d)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &d, nil
}

func (r *repository) ListKeluargaMhs(ctx context.Context, p KeluargaMhsParams) ([]KeluargaMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("k.nim", p.Nim)
	cb.AppendString("k.status_keluarga", p.StatusKeluarga)
	cb.Like("k.nama", p.Search)

	conds, args := cb.Build()
	where := "1=1"
	if len(conds) > 0 {
		where = strings.Join(conds, " AND ")
	}

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.keluarga_mhs k WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.nim, k.status_keluarga", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT k.nim, k.status_keluarga, k.nama, k.status_ortu, k.kondisi_ortu,
		k.pend_akhir, k.pekerjaan, k.penghasilan, k.no_hp,
		CAST(k.alamat AS VARCHAR(MAX)) AS alamat, k.tgl_lahir, k.nik, k.last_sync
		FROM siakadu.keluarga_mhs k WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KeluargaMhs
	for rows.Next() {
		var m KeluargaMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListSdm(ctx context.Context, p SdmParams) ([]Sdm, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("s.id_sdm", p.IDSDM)
	cb.AppendInt("s.id_jns_sdm", p.IDJnsSDM)
	cb.AppendString("s.nip", p.Nip)
	cb.AppendString("s.nidn", p.Nidn)
	cb.AppendString("s.jk", p.Jk)
	cb.Like("s.nm_sdm", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "s.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.sdm s WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "s.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		s.id_sdm, s.nm_sdm, s.jk, s.tmpt_lahir, s.tgl_lahir,
		s.nik, s.niy_nigk, s.nuptk, s.nidn, s.nsdmi,
		s.id_jns_sdm, s.email, s.no_hp, s.nip,
		s.tmt_pns, s.npwp, s.nm_wp, s.last_sync
		FROM siakadu.sdm s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []Sdm
	for rows.Next() {
		var m Sdm
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) DetailSdm(ctx context.Context, idSdm string) (*Sdm, error) {
	q := `SELECT
		s.id_sdm, s.nm_sdm, s.jk, s.tmpt_lahir, s.tgl_lahir,
		s.nik, s.niy_nigk, s.nuptk, s.nidn, s.nsdmi,
		s.id_jns_sdm, s.email, s.no_hp, s.nip,
		s.tmt_pns, s.npwp, s.nm_wp, s.last_sync
		FROM siakadu.sdm s WHERE s.id_sdm = @p1 AND s.soft_delete = 0`

	var m Sdm
	err := r.db.QueryRowxContext(ctx, q, idSdm).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) ListRegPtk(ctx context.Context, p RegPtkParams) ([]RegPtk, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("r.id_reg_ptk", p.IDRegPtk)
	cb.AppendUUID("r.id_sdm", p.IDSDM)
	cb.AppendUUID("r.id_sms", p.IDSms)
	cb.AppendInt("r.id_stat_pegawai", p.IDStatPegawai)
	cb.AppendString("r.id_jns_keluar", p.IDJnsKeluar)

	conds, args := cb.Build()
	if p.OnlyAktif != nil && *p.OnlyAktif {
		conds = append(conds, "r.id_jns_keluar IS NULL")
	}
	conds = append(conds, "r.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.reg_ptk r
		LEFT JOIN siakadu.sdm s ON s.id_sdm = r.id_sdm
		LEFT JOIN siakadu.sms ss ON ss.id_sms = r.id_sms`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "s.nm_sdm", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		r.id_reg_ptk, r.id_sdm, s.nm_sdm, s.nip,
		r.id_sp, r.id_sms, ss.nm_lemb AS nm_sms,
		r.id_stat_pegawai, r.id_ikatan_kerja, r.id_jns_keluar,
		r.nidn, r.no_srt_tgs, r.tgl_srt_tgs, r.tmt_srt_tgs,
		r.tgl_ptk_keluar, r.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []RegPtk
	for rows.Next() {
		var m RegPtk
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListWisuda(ctx context.Context, p WisudaParams) ([]WisudaMahasiswa, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendInt("w.id_yudisium", p.IDYudisium)
	cb.AppendString("w.id_periode_wisuda", p.IDPeriodeWisuda)
	cb.AppendUUID("w.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("w.id_sms", p.IDSms)
	cb.AppendString("w.nipd", p.Nipd)
	cb.AppendString("w.is_wisuda", p.IsWisuda)
	cb.Like("w.nm_mahasiswa", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "w.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.wisuda_mahasiswa w
		LEFT JOIN siakadu.periode_wisuda pw ON pw.id_periode_wisuda = w.id_periode_wisuda
		LEFT JOIN siakadu.sms s ON s.id_sms = w.id_sms`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "pw.tgl_wisuda DESC, w.nipd", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		w.id_yudisium,
		w.id_periode_wisuda, pw.nm_periode,
		w.id_reg_pd, w.nipd, w.nm_mahasiswa,
		w.no_sk_yudisium, w.tgl_sk_yudisium,
		w.no_ijasah, w.is_wisuda, w.is_hadir_wisuda, w.is_valid_wisuda,
		w.ipk_lulusan,
		w.id_sms, s.nm_lemb AS nm_sms,
		CAST(w.keterangan AS VARCHAR(MAX)) AS keterangan, w.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []WisudaMahasiswa
	for rows.Next() {
		var m WisudaMahasiswa
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListPeriodeWisuda(ctx context.Context, p PeriodeWisudaParams) ([]PeriodeWisuda, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendString("pw.id_periode_wisuda", p.IDPeriodeWisuda)
	cb.AppendInt("pw.id_thn_ajaran", p.IDThnAjaran)
	cb.AppendInt("pw.a_aktif", p.AAktif)
	cb.Like("pw.nm_periode", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "pw.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.periode_wisuda pw WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "pw.tgl_wisuda DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		pw.id_periode_wisuda, pw.nm_periode, pw.tgl_wisuda,
		pw.id_thn_ajaran, pw.smt, pw.tgl_mulai, pw.tgl_selesai,
		CAST(pw.keterangan AS VARCHAR(MAX)) AS keterangan, pw.a_aktif
		FROM siakadu.periode_wisuda pw WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PeriodeWisuda
	for rows.Next() {
		var m PeriodeWisuda
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// 11b — Nilai + Kehadiran + Kinerja
// ============================================================================

func (r *repository) ListNilaiSmt(ctx context.Context, p NilaiSmtParams) ([]NilaiSmtMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("n.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("n.id_kls", p.IDKls)
	cb.AppendString("kk.id_smt", p.IDSmt)
	cb.AppendString("m.nim", p.Nipd)

	conds, args := cb.Build()
	conds = append(conds, "n.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.nilai_smt_mhs n
		LEFT JOIN siakadu.mahasiswa m ON m.id_reg_pd = n.id_reg_pd
		LEFT JOIN siakadu.kelas_kuliah kk ON kk.id_kls = n.id_kls
		LEFT JOIN siakadu.matkul mk ON mk.id_mk = kk.id_mk`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "kk.id_smt DESC, mk.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		n.id_reg_pd, m.nim AS nipd, m.nama AS nm_mhs,
		n.id_kls, kk.nm_kls,
		mk.kode_mk, mk.nm_mk,
		kk.id_smt,
		n.nilai_angka, n.nilai_huruf, n.nilai_indeks, n.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []NilaiSmtMhs
	for rows.Next() {
		var m NilaiSmtMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListNilaiTranskrip(ctx context.Context, p NilaiTranskripParams) ([]NilaiTranskrip, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("n.id_reg_pd", p.IDRegPd)
	cb.AppendUUID("n.id_mk", p.IDMk)
	cb.AppendInt("n.smt_ke", p.SmtKe)
	cb.AppendString("m.nim", p.Nipd)

	conds, args := cb.Build()
	conds = append(conds, "n.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.nilai_transkrip n
		LEFT JOIN siakadu.mahasiswa m ON m.id_reg_pd = n.id_reg_pd
		LEFT JOIN siakadu.matkul mk ON mk.id_mk = n.id_mk`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "n.smt_ke, mk.kode_mk", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		n.id_reg_pd, m.nim AS nipd, m.nama AS nm_mhs,
		n.id_mk, mk.kode_mk, mk.nm_mk, n.id_kls,
		n.nilai_angka, n.nilai_huruf, n.nilai_indeks,
		n.smt_ke, n.sks_mk, n.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []NilaiTranskrip
	for rows.Next() {
		var m NilaiTranskrip
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListKehadiranMhs(ctx context.Context, p KehadiranMhsParams) ([]KehadiranMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_reg_ptk", p.IDRegPtk)
	cb.AppendUUID("k.id_kls", p.IDKls)
	cb.AppendUUID("k.id_hadir_mhs", p.IDHadirMhs)
	cb.AppendString("k.stat_hadir", p.StatHadir)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.kehadiran_mhs k WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.tgl_hadir DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT k.id_reg_ptk, k.id_kls, k.id_hadir_mhs,
		k.tgl_hadir, k.waktu_presensi, k.stat_hadir, k.last_sync
		FROM siakadu.kehadiran_mhs k WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KehadiranMhs
	for rows.Next() {
		var m KehadiranMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListKehadiranSdm(ctx context.Context, p KehadiranSdmParams) ([]KehadiranSdm, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_kehadiran_sdm", p.IDKehadiranSdm)
	cb.AppendUUID("k.id_sdm", p.IDSDM)

	conds, args := cb.Build()
	if p.TglFrom != nil && *p.TglFrom != "" {
		conds = append(conds, fmt.Sprintf("k.tgl_hadir >= @p%d", len(args)+1))
		args = append(args, *p.TglFrom)
	}
	if p.TglTo != nil && *p.TglTo != "" {
		conds = append(conds, fmt.Sprintf("k.tgl_hadir <= @p%d", len(args)+1))
		args = append(args, *p.TglTo)
	}
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.kehadiran_sdm k
		LEFT JOIN siakadu.sdm s ON s.id_sdm = k.id_sdm`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.tgl_hadir DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		k.id_kehadiran_sdm, k.id_sdm, s.nm_sdm, s.nip,
		k.tgl_hadir, k.waktu_presensi, k.lokasi_presensi,
		k.waktu_pulang, k.lokasi_pulang,
		CAST(k.rencana_hari_ini AS VARCHAR(MAX)) AS rencana_hari_ini,
		CAST(k.realisasi_hari_ini AS VARCHAR(MAX)) AS realisasi_hari_ini,
		k.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KehadiranSdm
	for rows.Next() {
		var m KehadiranSdm
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListKinerjaDosen(ctx context.Context, p KinerjaDosenParams) ([]KinerjaDosen, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_reg_ptk", p.IDRegPtk)
	cb.AppendString("k.id_smt", p.IDSmt)
	cb.AppendInt("k.id_jabfung", p.IDJabfung)
	cb.AppendString("k.stat_tugas", p.StatTugas)
	cb.AppendString("k.stat_belajar", p.StatBelajar)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.kinerja_dosen k
		LEFT JOIN siakadu.reg_ptk rp ON rp.id_reg_ptk = k.id_reg_ptk
		LEFT JOIN siakadu.sdm s ON s.id_sdm = rp.id_sdm`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.id_smt DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		k.id_reg_ptk, rp.id_sdm, s.nm_sdm,
		k.id_smt, k.id_jabfung, k.stat_tugas, k.stat_belajar, k.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KinerjaDosen
	for rows.Next() {
		var m KinerjaDosen
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

// ============================================================================
// 11c — Keuangan + Status Kuliah + Unit
// ============================================================================

func (r *repository) ListSppMhs(ctx context.Context, p SppMhsParams) ([]SppMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("s.id_spp_mhs", p.IDSppMhs)
	cb.AppendUUID("s.id_reg_pd", p.IDRegPd)
	cb.AppendString("s.nim", p.Nim)
	cb.AppendString("s.id_smt", p.IDSmt)

	conds, args := cb.Build()
	conds = append(conds, "s.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.spp_mhs s
		LEFT JOIN siakadu.kelas_ukt ku ON ku.id_kelas_ukt = s.id_kelas_ukt
		LEFT JOIN ref.semester rs ON rs.id_smt = s.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "s.tgl_bayar DESC", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		s.id_spp_mhs, s.id_reg_pd, s.nim,
		s.id_smt, rs.nm_smt,
		s.id_kelas_ukt, ku.nm_kelas_ukt,
		s.id_daftar_ukt,
		s.tgl_bayar, s.nominal, s.total_tagihan,
		s.jumlah_spi, s.jumlah_denda, s.jumlah_lainnya, s.sisa_tagihan,
		s.a_cicil, s.cicilan_ke, s.kode_pembayaran,
		CAST(s.ket AS VARCHAR(MAX)) AS ket, s.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []SppMhs
	for rows.Next() {
		var m SppMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListDaftarUkt(ctx context.Context, p DaftarUktParams) ([]DaftarUkt, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("d.id_daftar_ukt", p.IDDaftarUkt)
	cb.AppendUUID("d.id_sms", p.IDSms)
	cb.AppendInt("d.tahun", p.Tahun)
	cb.AppendInt("d.kode_strata", p.KodeStrata)
	cb.Like("d.nama_prodi", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "d.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.daftar_ukt d WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "d.tahun DESC, d.nama_fakultas, d.kode_kelas", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		d.id_daftar_ukt, d.id_prodi_simpedam, d.nama_prodi, d.tahun,
		d.kode_fakultas, d.nama_fakultas, d.kode_kelas, d.nama_kelas,
		d.nominal, d.kode_strata, d.id_sms, d.id_jenj_didik, d.last_sync
		FROM siakadu.daftar_ukt d WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []DaftarUkt
	for rows.Next() {
		var m DaftarUkt
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListKelasUkt(ctx context.Context, p KelasUktParams) ([]KelasUkt, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_kelas_ukt", p.IDKelasUkt)
	cb.Like("k.nm_kelas_ukt", p.Search)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.kelas_ukt k WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.nm_kelas_ukt", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT k.id_kelas_ukt, k.nm_kelas_ukt, k.nominal_ukt, k.last_sync
		FROM siakadu.kelas_ukt k WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KelasUkt
	for rows.Next() {
		var m KelasUkt
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListKuliahMhs(ctx context.Context, p KuliahMhsParams) ([]KuliahMhs, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("k.id_reg_pd", p.IDRegPd)
	cb.AppendString("k.nim", p.Nim)
	cb.AppendString("k.id_smt", p.IDSmt)
	cb.AppendString("k.id_stat_mhs", p.IDStatMhs)

	conds, args := cb.Build()
	conds = append(conds, "k.soft_delete = 0")
	where := strings.Join(conds, " AND ")

	join := `
		FROM siakadu.kuliah_mhs k
		LEFT JOIN siakadu.mahasiswa m ON m.id_reg_pd = k.id_reg_pd
		LEFT JOIN ref.semester rs ON rs.id_smt = k.id_smt`

	var total int64
	if err := r.db.QueryRowContext(ctx, "SELECT COUNT(*)"+join+" WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy, order := "k.id_smt DESC, k.nim", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "ASC"
	}

	q := fmt.Sprintf(`SELECT
		k.id_reg_pd, k.nim, m.nama AS nm_mhs,
		k.id_smt, rs.nm_smt,
		k.id_pembiayaan, k.id_stat_mhs,
		k.ips, k.sks_semester, k.ipk, k.total_sks, k.biaya_smt, k.last_sync
		%s WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		join, where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []KuliahMhs
	for rows.Next() {
		var m KuliahMhs
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}

func (r *repository) ListPimpinanUnit(ctx context.Context, p PimpinanUnitParams) ([]PimpinanUnit, int64, error) {
	p.Normalize()

	cb := helper.NewCondBuilder()
	cb.AppendUUID("p.id_pimpinan", p.IDPimpinan)
	cb.AppendString("p.id_unit", p.IDUnit)
	cb.AppendUUID("p.id_sdm", p.IDSDM)
	cb.AppendString("p.nip", p.Nip)
	cb.Like("p.nama", p.Search)

	conds, args := cb.Build()
	where := "1=1"
	if len(conds) > 0 {
		where = strings.Join(conds, " AND ")
	}

	var total int64
	if err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM siakadu.pimpinan_unit p WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Default sortBy column saja (tanpa direction) — direction dikontrol via `order`.
	// Bug fix: sebelumnya default "p.tgl_mulai DESC" digabung dgn order="ASC" menjadi
	// "ORDER BY p.tgl_mulai DESC ASC ..." → SQL Server tolak (Invalid usage of the option NEXT).
	sortBy, order := "p.tgl_mulai", p.Order
	if p.SortBy != "" {
		sortBy = p.SortBy
	}
	if order == "" {
		order = "DESC"
	}

	// Hierarki ref_unit: prodi (P) → jurusan (J) → fakultas (F) → universitas (U).
	// Beberapa pimpinan langsung di level J atau F, sehingga chain di-COALESCE.
	q := fmt.Sprintf(`SELECT
		p.id_pimpinan, p.id_unit, p.id_sdm, p.nip, p.nama, p.jabatan,
		p.tgl_mulai, p.tgl_selesai, p.last_sync,
		mu.id_sms,
		ru.nm_unit AS nm_unit,
		ru.jns_unit AS jns_unit,
		ru.id_jenjang AS id_jenjang,
		CASE
			WHEN ru.id_jenjang IS NOT NULL AND LEN(LTRIM(RTRIM(ru.id_jenjang))) > 0
				THEN LTRIM(RTRIM(ru.id_jenjang)) + ' ' + ru.nm_unit
			ELSE ru.nm_unit
		END AS nm_unit_lengkap,
		CASE WHEN ru1.jns_unit = 'J' THEN ru1.nm_unit ELSE NULL END AS nm_jurusan,
		CASE
			WHEN ru.jns_unit = 'F' THEN ru.nm_unit
			WHEN ru1.jns_unit = 'F' THEN ru1.nm_unit
			WHEN ru2.jns_unit = 'F' THEN ru2.nm_unit
			ELSE NULL
		END AS nm_fakultas
		FROM siakadu.pimpinan_unit p
		LEFT JOIN siakadu.mapping_unit mu ON mu.kode_siakad = p.id_unit
		LEFT JOIN siakadu.ref_unit ru ON ru.id_unit = p.id_unit
		LEFT JOIN siakadu.ref_unit ru1 ON ru1.id_unit = ru.id_parent_unit
		LEFT JOIN siakadu.ref_unit ru2 ON ru2.id_unit = ru1.id_parent_unit
		WHERE %s ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		where, sortBy, order, len(args)+1, len(args)+2)
	args = append(args, p.Offset(), p.Limit)

	rows, err := r.db.QueryxContext(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []PimpinanUnit
	for rows.Next() {
		var m PimpinanUnit
		if err := rows.StructScan(&m); err != nil {
			return nil, 0, err
		}
		result = append(result, m)
	}
	return result, total, rows.Err()
}
