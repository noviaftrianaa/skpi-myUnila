package akreditasi

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// Service — orkestrasi sync BAN-PT → pdrd.akreditasi_prodi.
type Service interface {
	List(ctx context.Context, p AkreditasiListParams) ([]AkreditasiRow, int64, error)
	Sync(ctx context.Context, mode string, triggeredBy *string, triggeredUser *string) (*SyncResult, error)
	ListLogs(ctx context.Context, limit, offset int) ([]SyncLogRow, int64, error)
	GetLogDetails(ctx context.Context, idLog string, action string) ([]SyncLogDetail, error)
	GetLog(ctx context.Context, idLog string) (*SyncLogRow, error)
	Stats(ctx context.Context) (*Stats, error)

	// Mapping Unit
	ListMapping(ctx context.Context, p MappingUnitListParams) ([]MappingUnitRow, int64, error)
	GetMapping(ctx context.Context, kodeSiakad string) (*MappingUnitRow, error)
	UpsertMapping(ctx context.Context, req MappingUnitUpsertReq) error
	DeleteMapping(ctx context.Context, kodeSiakad string) error
	MappingStats(ctx context.Context) (*MappingStats, error)

	// Manual akreditasi CRUD per prodi (untuk halaman Mapping Unit yg tampilkan pdrd.sms)
	UpsertManualAkreditasi(ctx context.Context, idSms, idLembAkred string, idAkred int, sk string, tglSk, tstSk *time.Time) (action string, oldRow *AkreditasiCurrent, err error)
	UpsertManualAkreditasiWithAlias(ctx context.Context, idSms, idLembAkred string, idAkred int, sk string, tglSk, tstSk *time.Time, banptName, banptJenjang string) (action string, oldRow *AkreditasiCurrent, err error)
	DeleteAkreditasi(ctx context.Context, idSms string) error
	RefAkreditasi(ctx context.Context) (nilai []RefRow, lembaga []RefRow, err error)

	// Scheduler entrypoint
	RunSchedule(ctx context.Context, syncedBy string) (interface{}, error)

	// Daftar BAN-PT entry yang tidak match pdrd.sms (utk Mapping Unit page)
	UnmatchedBanpt(ctx context.Context) ([]UnmatchedRow, error)
}

// UnmatchedRow — BAN-PT prodi yg gagal di-match (untuk admin mapping manual).
type UnmatchedRow struct {
	NmProdiBanpt    string  `db:"nm_prodi_external" json:"nm_prodi_banpt"`
	JenjangBanpt    string  `db:"jenjang_external" json:"jenjang_banpt"`
	NewIDAkred      *int    `db:"new_id_akred" json:"new_id_akred"`
	NewNmAkred      *string `db:"new_nm_akred" json:"new_nm_akred"`
	NewSk           *string `db:"new_sk" json:"new_sk"`
	NewTstSk        *string `db:"new_tst_sk" json:"new_tst_sk"`
	IDLog           string  `db:"id_log" json:"id_log"`
	StartedAt       string  `db:"started_at" json:"started_at"`
}

// RefRow — struct untuk dropdown options.
type RefRow struct {
	ID    string `json:"id"`
	Nama  string `json:"nama"`
}

// MappingStats — KPI untuk halaman Mapping Unit.
type MappingStats struct {
	Total    int `json:"total"`
	Mapped   int `json:"mapped"`
	Unmapped int `json:"unmapped"`
	Broken   int `json:"broken"`
}

// Stats — ringkasan untuk landing page integrator.
type Stats struct {
	TotalProdi          int     `json:"total_prodi"`
	TotalTerakreditasi  int     `json:"total_terakreditasi"`
	TotalKadaluarsa     int     `json:"total_kadaluarsa"`     // tst_sk < today
	TotalAkanKadaluarsa int     `json:"total_akan_kadaluarsa"` // 90 hari ke depan
	TotalBelum          int     `json:"total_belum"`
	ByAkreditasi        map[string]int `json:"by_akreditasi"` // {Unggul: 5, A: 12, ...}
	LastSyncAt          *string `json:"last_sync_at"`
	LastSyncStatus      *string `json:"last_sync_status"`
}

type service struct {
	repo  Repository
	banpt *BanptClient
}

func NewService(repo Repository, banpt *BanptClient) Service {
	return &service{repo: repo, banpt: banpt}
}

func (s *service) List(ctx context.Context, p AkreditasiListParams) ([]AkreditasiRow, int64, error) {
	return s.repo.ListAkreditasi(ctx, p)
}

func (s *service) ListLogs(ctx context.Context, limit, offset int) ([]SyncLogRow, int64, error) {
	return s.repo.ListSyncLogs(ctx, limit, offset)
}

func (s *service) GetLogDetails(ctx context.Context, idLog string, action string) ([]SyncLogDetail, error) {
	return s.repo.GetSyncLogDetails(ctx, idLog, action)
}

func (s *service) GetLog(ctx context.Context, idLog string) (*SyncLogRow, error) {
	return s.repo.GetSyncLog(ctx, idLog)
}

// ============================================================================
// Mapping Unit
// ============================================================================

func (s *service) ListMapping(ctx context.Context, p MappingUnitListParams) ([]MappingUnitRow, int64, error) {
	return s.repo.ListMappingUnit(ctx, p)
}
func (s *service) GetMapping(ctx context.Context, k string) (*MappingUnitRow, error) {
	return s.repo.GetMappingUnit(ctx, k)
}
func (s *service) UpsertMapping(ctx context.Context, req MappingUnitUpsertReq) error {
	if strings.TrimSpace(req.KodeSiakad) == "" {
		return fmt.Errorf("kode_siakad wajib diisi")
	}
	return s.repo.UpsertMappingUnit(ctx, req)
}
func (s *service) DeleteMapping(ctx context.Context, k string) error {
	return s.repo.DeleteMappingUnit(ctx, k)
}
func (s *service) MappingStats(ctx context.Context) (*MappingStats, error) {
	mapped, unmapped, broken, err := s.repo.MappingUnitStats(ctx)
	if err != nil {
		return nil, err
	}
	return &MappingStats{
		Total:    mapped + unmapped + broken,
		Mapped:   mapped,
		Unmapped: unmapped,
		Broken:   broken,
	}, nil
}

// UpsertManualAkreditasi — admin override 1 prodi via halaman Mapping Unit.
// Reuse repo.UpsertAkreditasi tapi mark asal_data = "2" (manual). Kalau dipanggil
// dengan parameter banptName + banptJenjang (dari "Map ke pdrd" flow), juga
// simpan alias BAN-PT → id_sms di tabel myunila.akreditasi_prodi_alias supaya
// sync berikutnya bisa direlay ke id_sms tsb.
func (s *service) UpsertManualAkreditasi(ctx context.Context, idSms, idLembAkred string, idAkred int, sk string, tglSk, tstSk *time.Time) (string, *AkreditasiCurrent, error) {
	if strings.TrimSpace(idSms) == "" {
		return "", nil, fmt.Errorf("id_sms wajib")
	}
	if idAkred <= 0 {
		return "", nil, fmt.Errorf("id_akred wajib")
	}
	if idLembAkred == "" {
		idLembAkred = "00001"
	}
	// asal_data CHAR(1) dengan CHECK constraint 1-9. "2" = manual entry admin.
	return s.repo.UpsertAkreditasi(ctx, strings.ToUpper(idSms), idLembAkred, idAkred, sk, tglSk, tstSk, "2")
}

// UpsertManualAkreditasiWithAlias — sama dengan UpsertManualAkreditasi tapi
// juga simpan alias BAN-PT name → id_sms supaya sync berikutnya match otomatis.
// Dipanggil dari flow "Map ke pdrd" di Mapping Unit page.
func (s *service) UpsertManualAkreditasiWithAlias(ctx context.Context, idSms, idLembAkred string, idAkred int, sk string, tglSk, tstSk *time.Time, banptName, banptJenjang string) (string, *AkreditasiCurrent, error) {
	action, oldRow, err := s.UpsertManualAkreditasi(ctx, idSms, idLembAkred, idAkred, sk, tglSk, tstSk)
	if err != nil {
		return action, oldRow, err
	}
	// Save alias — best effort, don't fail upsert kalau alias gagal.
	if strings.TrimSpace(banptName) != "" && strings.TrimSpace(banptJenjang) != "" {
		if aliasErr := s.repo.UpsertProdiAlias(ctx, banptName, banptJenjang, idSms); aliasErr != nil {
			fmt.Printf("[akreditasi] save alias failed (non-fatal): %v\n", aliasErr)
		}
	}
	return action, oldRow, nil
}

// DeleteAkreditasi — soft-deactivate semua row aktif untuk prodi (a_aktif=0).
func (s *service) DeleteAkreditasi(ctx context.Context, idSms string) error {
	return s.repo.DeactivateAkreditasi(ctx, idSms)
}

// RefAkreditasi — load referensi nilai_akred + lembaga_akred utk dropdown.
func (s *service) RefAkreditasi(ctx context.Context) ([]RefRow, []RefRow, error) {
	return s.repo.RefAkreditasi(ctx)
}

func (s *service) Stats(ctx context.Context) (*Stats, error) {
	rows, _, err := s.repo.ListAkreditasi(ctx, AkreditasiListParams{Limit: 5000, Page: 1})
	if err != nil {
		return nil, err
	}
	now := time.Now()
	in90 := now.AddDate(0, 0, 90)
	st := &Stats{ByAkreditasi: map[string]int{}}
	for _, r := range rows {
		st.TotalProdi++
		if r.IDAkred == nil || (r.NmAkred != nil && (*r.NmAkred == "Belum Terakreditasi" || *r.NmAkred == "Tidak Terakreditasi")) {
			st.TotalBelum++
			continue
		}
		st.TotalTerakreditasi++
		if r.NmAkred != nil {
			st.ByAkreditasi[*r.NmAkred]++
		}
		if r.TstSk != nil {
			if r.TstSk.Before(now) {
				st.TotalKadaluarsa++
			} else if r.TstSk.Before(in90) {
				st.TotalAkanKadaluarsa++
			}
		}
	}

	// Last sync
	logs, _, err := s.repo.ListSyncLogs(ctx, 1, 0)
	if err == nil && len(logs) > 0 {
		started := logs[0].StartedAt.Format(time.RFC3339)
		st.LastSyncAt = &started
		ls := logs[0].Status
		st.LastSyncStatus = &ls
	}

	return st, nil
}

// ============================================================================
// SYNC — fetch BAN-PT, build preview, optionally apply.
// ============================================================================

func (s *service) Sync(ctx context.Context, mode string, triggeredBy *string, triggeredUser *string) (*SyncResult, error) {
	if mode != "preview" && mode != "apply" {
		mode = "preview"
	}
	startedAt := time.Now()

	// Tulis log header dulu (status=running) supaya request panjang ada audit
	idLog, err := s.repo.InsertSyncLog(ctx, SyncLogRow{
		Sumber: "banpt", Mode: mode,
		TriggeredBy: triggeredBy, TriggeredUser: triggeredUser,
		Status: "running", StartedAt: startedAt,
	})
	if err != nil {
		return nil, fmt.Errorf("init log: %w", err)
	}

	res := &SyncResult{
		IDLog: idLog, Sumber: "banpt", Mode: mode,
		Status: "running", StartedAt: startedAt,
	}

	// 1. Fetch BAN-PT
	records, totalFetched, fetchErr := s.banpt.FetchUnila(ctx)
	res.TotalFetched = totalFetched
	if fetchErr != nil {
		s.finishWithError(ctx, res, fetchErr)
		return res, fetchErr
	}

	// 2. Load PDRD prodi + akreditasi aktif
	prodis, err := s.repo.ListProdi(ctx)
	if err != nil {
		s.finishWithError(ctx, res, fmt.Errorf("load prodi: %w", err))
		return res, err
	}
	akreds, err := s.repo.ListAkreditasiAktif(ctx)
	if err != nil {
		s.finishWithError(ctx, res, fmt.Errorf("load akreditasi: %w", err))
		return res, err
	}

	// 3. Build matching index
	prodiByKey := map[string]ProdiPdrd{}
	prodiBySms := map[string]ProdiPdrd{}
	for _, p := range prodis {
		key := makeKey(p.NmLemb, jenjangFromIDDidik(p.IDJenjDidik))
		if key != "" {
			prodiByKey[key] = p
		}
		prodiBySms[strings.ToUpper(p.IDSms)] = p
	}
	akredBySms := map[string]AkreditasiCurrent{}
	for _, a := range akreds {
		akredBySms[strings.ToUpper(a.IDSms)] = a
	}

	// 3b. Load alias BAN-PT name → id_sms dari myunila.akreditasi_prodi_alias.
	// Admin men-define alias via "Map ke pdrd" di Mapping Unit page.
	mappingByKey := map[string]string{} // key (nm|jenjang lower) → id_sms
	if aliases, aErr := s.repo.ListProdiAlias(ctx); aErr == nil {
		for k, idSms := range aliases {
			// k disimpan di repo dengan format "nm_lower|jenjang_upper". Kita
			// re-key dengan makeKey() biar konsisten dengan key BAN-PT yang
			// di-build di main loop.
			parts := strings.SplitN(k, "|", 2)
			if len(parts) == 2 {
				mappingByKey[makeKey(parts[0], parts[1])] = idSms
			}
		}
	}

	// 4. Per-record processing
	details := make([]SyncLogDetail, 0, len(records))
	for _, b := range records {
		key := makeKey(b.NamaProdi, b.Jenjang)
		p, ok := prodiByKey[key]
		// Fallback: kalau key langsung tidak ketemu, coba via mapping_unit override.
		if !ok {
			if idSms, mok := mappingByKey[key]; mok {
				if pp, pok := prodiBySms[idSms]; pok {
					p = pp
					ok = true
				}
			}
		}

		idAkred, nmAkred := mapAkreditasi(b.Akreditasi)
		newSk := strings.TrimSpace(b.NoSK)
		newTglSk := parseDate(b.TahunSK)
		newTstSk := parseDate(b.TanggalExpired)
		idLembAkred := "00001" // BAN-PT
		idLembAkredP := idLembAkred

		external := b.NamaProdi
		jenjangExt := b.Jenjang

		if !ok {
			// Unmatched
			d := SyncLogDetail{
				NmProdiExternal: &external, JenjangExternal: &jenjangExt,
				Action:    "unmatched",
				NewIDAkred: &idAkred, NewNmAkred: &nmAkred,
				NewSk:     ptrIfNotEmpty(newSk),
				NewTglSk:  newTglSk, NewTstSk: newTstSk,
				IDLembAkred: &idLembAkredP,
				Notes: ptrStr(fmt.Sprintf("Prodi BAN-PT tidak ketemu di pdrd.sms: %s (%s)", b.NamaProdi, b.Jenjang)),
			}
			details = append(details, d)
			res.TotalUnmatched++
			continue
		}

		res.TotalMatched++
		nmProdi := p.NmLemb
		jenjangP := jenjangFromIDDidik(p.IDJenjDidik)
		current, hasCurrent := akredBySms[strings.ToUpper(p.IDSms)]
		idSms := p.IDSms

		// Compute action (without applying yet).
		// Comparison hanya pakai id_akred + id_lemb + sk + tst_sk (expired date).
		// tgl_sk DIKECUALIKAN karena BAN-PT publik hanya kasih tahun_sk, kalau
		// dipakai akan terus mismatch dengan DB yg punya tanggal exact dari SK.
		// Kalau BAN-PT akreditasi/SK/expired sama dengan DB → "unchanged".
		desiredAction := "insert"
		if hasCurrent {
			sameAkred := current.IDAkred != nil && *current.IDAkred == idAkred
			sameLemb := current.IDLembAkred != nil && strings.EqualFold(strings.TrimSpace(*current.IDLembAkred), idLembAkred)
			sameSk := stringPtrEq(current.SkAkreditasiProdi, newSk)
			sameTst := datePtrEq(current.TstSkAkred, newTstSk)
			if sameAkred && sameLemb && sameSk && sameTst {
				desiredAction = "unchanged"
			} else {
				desiredAction = "update"
			}
		}

		// Saat write: kalau BAN-PT tahun_sk = year dari current.TanggalSkAkred,
		// preserve current.TanggalSkAkred (tetap tanggal exact existing — bukan Jan 1).
		writeTglSk := newTglSk
		if hasCurrent && current.TanggalSkAkred != nil && newTglSk != nil &&
			current.TanggalSkAkred.Year() == newTglSk.Year() {
			writeTglSk = current.TanggalSkAkred
		}

		d := SyncLogDetail{
			IDSms:           &idSms,
			NmProdiExternal: &external,
			JenjangExternal: &jenjangExt,
			NmProdiPdrd:     &nmProdi,
			JenjangPdrd:     ptrIfNotEmpty(jenjangP),
			NewIDAkred:      &idAkred,
			NewNmAkred:      &nmAkred,
			NewSk:           ptrIfNotEmpty(newSk),
			NewTglSk:        newTglSk,
			NewTstSk:        newTstSk,
			IDLembAkred:     &idLembAkredP,
		}
		if hasCurrent {
			d.OldIDAkred = current.IDAkred
			d.OldNmAkred = current.NmAkred
			d.OldSk = current.SkAkreditasiProdi
			d.OldTglSk = current.TanggalSkAkred
			d.OldTstSk = current.TstSkAkred
		}

		if mode == "apply" && desiredAction != "unchanged" {
			// asal_data CHAR(1) dengan CHECK constraint values 1-9.
			// "1" = BAN-PT direktori publik. ("5" = SISTER, existing convention).
			// writeTglSk = preserve existing tgl_sk kalau year sama dengan BAN-PT (avoid Jan 1 overwrite).
			actualAction, _, err := s.repo.UpsertAkreditasi(ctx, idSms, idLembAkred, idAkred, newSk, writeTglSk, newTstSk, "1")
			if err != nil {
				d.Action = "error"
				msg := fmt.Sprintf("upsert: %v", err)
				d.Notes = &msg
				details = append(details, d)
				continue
			}
			d.Action = actualAction
		} else {
			d.Action = desiredAction
		}

		switch d.Action {
		case "insert":
			res.TotalInserted++
		case "update":
			res.TotalUpdated++
		case "unchanged":
			res.TotalUnchanged++
		}
		details = append(details, d)
	}

	// 5. Persist details + finish header
	if err := s.repo.InsertSyncLogDetails(ctx, idLog, details); err != nil {
		s.finishWithError(ctx, res, fmt.Errorf("save details: %w", err))
		return res, err
	}

	res.FinishedAt = time.Now()
	res.DurationMs = int(res.FinishedAt.Sub(res.StartedAt).Milliseconds())
	res.Status = "success"
	res.Changes = details
	if err := s.repo.UpdateSyncLogFinish(ctx, idLog, *res); err != nil {
		// log only, jangan gagalkan response
		fmt.Printf("[akreditasi] update log finish: %v\n", err)
	}
	return res, nil
}

// UnmatchedBanpt — pull "unmatched" detail dari sync log preview/apply terbaru.
// Admin bisa lihat dan mapping ke pdrd.sms.id_sms via Mapping Unit page.
func (s *service) UnmatchedBanpt(ctx context.Context) ([]UnmatchedRow, error) {
	return s.repo.GetLatestUnmatched(ctx)
}

// RunSchedule — entrypoint untuk scheduler service. Wrap Sync(mode="apply").
// syncedBy = nama identitas yang ngetrigger (e.g. "scheduler").
func (s *service) RunSchedule(ctx context.Context, syncedBy string) (interface{}, error) {
	user := syncedBy
	if user == "" {
		user = "scheduler"
	}
	return s.Sync(ctx, "apply", nil, &user)
}

func (s *service) finishWithError(ctx context.Context, res *SyncResult, err error) {
	res.FinishedAt = time.Now()
	res.DurationMs = int(res.FinishedAt.Sub(res.StartedAt).Milliseconds())
	res.Status = "failed"
	res.Error = err.Error()
	_ = s.repo.UpdateSyncLogFinish(ctx, res.IDLog, *res)
}

// ============================================================================
// Helpers
// ============================================================================

// makeKey — normalisasi nama prodi + kode jenjang untuk matching BAN-PT ↔ pdrd.sms.
// Strategi: lower, strip prefix administratif, strip kode jenjang yang sering
// dimasukkan ke nama, strip punctuation, compress whitespace.
func makeKey(name, jenjang string) string {
	name = normalizeProdiName(name)
	if name == "" {
		return ""
	}
	jenjang = normalizeJenjang(jenjang)
	return name + "|" + jenjang
}

// normalizeProdiName — turunkan nama ke bentuk kanonik:
// - lower-case + trim
// - strip prefix "Program Studi", "Jurusan", "PJJ", "Pendidikan Profesi"
// - strip kode jenjang di awal (S1, S2, S3, D3, D4, D-III, D-IV, Profesi)
// - hilangkan tanda baca (koma, titik, tanda hubung sekitar kata)
// - compress whitespace
func normalizeProdiName(name string) string {
	s := strings.ToLower(strings.TrimSpace(name))
	if s == "" {
		return ""
	}
	// Hilangkan punctuation umum.
	replacer := strings.NewReplacer(
		",", " ", ".", " ", ";", " ", ":", " ",
		"(", " ", ")", " ", "/", " ", "&", " dan ",
	)
	s = replacer.Replace(s)
	s = strings.Join(strings.Fields(s), " ")

	// Strip prefix administratif (loop sampai stable).
	prefixes := []string{
		"program studi profesi ",
		"program studi ",
		"pendidikan profesi ",
		"jurusan jurusan ",
		"jurusan ",
		"pjj ",
		"profesi ", // BAN-PT kadang prefix "Profesi Insinyur"
	}
	for {
		stripped := false
		for _, p := range prefixes {
			if strings.HasPrefix(s, p) {
				s = strings.TrimSpace(strings.TrimPrefix(s, p))
				stripped = true
				break
			}
		}
		if !stripped {
			break
		}
	}

	// Strip kode jenjang yang kadang ditempel di awal (e.g. "s1 manajemen").
	jenjangPrefix := []string{"s1 ", "s2 ", "s3 ", "d3 ", "d4 ", "d-iii ", "d-iv ", "diploma iii ", "diploma iv ", "magister ", "doktor ", "sarjana "}
	for _, jp := range jenjangPrefix {
		if strings.HasPrefix(s, jp) {
			s = strings.TrimSpace(strings.TrimPrefix(s, jp))
			break
		}
	}

	// Khusus PDDIKTI sering "profesi profesi insinyur" — collapse repeat.
	for strings.Contains(s, "profesi profesi") {
		s = strings.ReplaceAll(s, "profesi profesi", "profesi")
	}

	return strings.Join(strings.Fields(s), " ")
}

// normalizeJenjang — kode jenjang kanonik (S1, S2, S3, D-III, D-IV, PROFESI, SP-1).
func normalizeJenjang(jenjang string) string {
	j := strings.ToUpper(strings.TrimSpace(jenjang))
	switch j {
	case "D3", "D-3", "DIPLOMA III", "D III":
		return "D-III"
	case "D4", "D-4", "DIPLOMA IV", "D IV":
		return "D-IV"
	case "SARJANA":
		return "S1"
	case "MAGISTER":
		return "S2"
	case "DOKTOR":
		return "S3"
	case "PROFESI":
		return "PROFESI"
	case "SPESIALIS", "SP1", "SP-1":
		return "SP-1"
	}
	return j
}

// jenjangFromIDDidik — inverse dari ref.jenjang_pendidikan id → kode normalized
// untuk matching key. Mapping di pdut staging (verified):
//   22=D3, 23=D4, 30=S1, 31=Profesi, 32=Sp-1, 35=S2, 40=S3
// D3 → "D-III", D4 → "D-IV" supaya match BAN-PT yang pakai format dengan dash.
func jenjangFromIDDidik(id *int) string {
	if id == nil {
		return ""
	}
	switch *id {
	case 22:
		return "D-III"
	case 23:
		return "D-IV"
	case 30:
		return "S1"
	case 31:
		return "PROFESI"
	case 32:
		return "SP-1"
	case 35:
		return "S2"
	case 40:
		return "S3"
	}
	return ""
}

// mapAkreditasi — translate string BAN-PT ke (id_akred, nm_akred).
func mapAkreditasi(akr string) (int, string) {
	a := strings.ToUpper(strings.TrimSpace(akr))
	switch a {
	case "UNGGUL":
		return 4, "Unggul"
	case "BAIK SEKALI":
		return 5, "Baik Sekali"
	case "BAIK":
		return 6, "Baik"
	case "A":
		return 1, "A"
	case "B":
		return 2, "B"
	case "C":
		return 3, "C"
	case "TIDAK TERAKREDITASI", "KADALUWARSA", "KADALUARSA":
		return 8, "Tidak Terakreditasi"
	default:
		return 9, "Belum Terakreditasi"
	}
}

// parseDate — parse "DD-MM-YYYY" atau "YYYY-MM-DD" atau angka tahun.
func parseDate(s string) *time.Time {
	s = strings.TrimSpace(s)
	if s == "" || s == "-" {
		return nil
	}
	formats := []string{"2006-01-02", "02-01-2006", "02/01/2006", "2006/01/02", "2006"}
	for _, f := range formats {
		if t, err := time.Parse(f, s); err == nil {
			return &t
		}
	}
	return nil
}

func ptrStr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func ptrIfNotEmpty(s string) *string {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return &s
}
