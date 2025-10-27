package referensi

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"
	appLogger "sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// Service defines business logic for referensi domain
type Service interface {
	// Agama methods
	GetAllAgama(ctx context.Context) ([]Agama, error)
	GetAgamaByID(ctx context.Context, id int) (*Agama, error)
	SyncAgamaFromSister(ctx context.Context, syncedBy string) (int, error)

	// Negara methods
	GetAllNegara(ctx context.Context) ([]Negara, error)
	GetNegaraByID(ctx context.Context, id string) (*Negara, error)
	SyncNegaraFromSister(ctx context.Context, syncedBy string) (int, error)

	// Jenjang Pendidikan methods
	GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error)
	SyncJenjangPendidikanFromSister(ctx context.Context, syncedBy string) (int, error)

	// Gelar Akademik methods
	GetAllGelarAkademik(ctx context.Context) ([]GelarAkademik, error)
	SyncGelarAkademikFromSister(ctx context.Context, syncedBy string) (int, error)

	// Semester methods
	GetAllSemester(ctx context.Context) ([]Semester, error)
	SyncSemesterFromSister(ctx context.Context, syncedBy string) (int, error)

	// New Referensi GetAll methods (29 endpoints)
	GetAllBidangStudi() ([]BidangStudi, error)
	GetAllBidangUsaha() ([]BidangUsaha, error)
	GetAllJabatanFungsional() ([]JabatanFungsional, error)
	GetAllJabatanTugasTambahan() ([]JabatanTugasTambahan, error)
	GetAllJenisBahanAjar() ([]JenisBahanAjar, error)
	GetAllJenisBeasiswa() ([]JenisBeasiswa, error)
	GetAllJenisDiklat() ([]JenisDiklat, error)
	GetAllJenisDokumen() ([]JenisDokumen, error)
	GetAllJenisKeluar() ([]JenisKeluar, error)
	GetAllJenisKepanitiaan() ([]JenisKepanitiaan, error)
	GetAllJenisKesejahteraan() ([]JenisKesejahteraan, error)
	GetAllJenisPublikasi() ([]JenisPublikasi, error)
	GetAllJenisTes() ([]JenisTes, error)
	GetAllJenisTunjangan() ([]JenisTunjangan, error)
	GetAllMediaPublikasi() ([]MediaPublikasi, error)
	GetAllSkimKegiatan() ([]SkimKegiatan, error)
	GetAllStatusKepegawaian() ([]StatusKepegawaian, error)
	GetAllSumberGaji() ([]SumberGaji, error)
	GetAllTingkatPenghargaan() ([]TingkatPenghargaan, error)
	GetAllWilayah() ([]Wilayah, error)
	GetAllKategoriCapaianLuaran() ([]KategoriCapaianLuaran, error)
	GetAllKategoriKegiatan() ([]KategoriKegiatan, error)
	GetAllKelompokBidang() ([]KelompokBidang, error)
	GetAllLembagaSertifikasi() ([]LembagaSertifikasi, error)
	GetAllGolonganPangkat() ([]GolonganPangkat, error)
	GetAllIkatanKerja() ([]IkatanKerja, error)
	GetAllJenisPenghargaan() ([]JenisPenghargaan, error)
	GetAllJenisPekerjaan() ([]JenisPekerjaan, error)
	GetAllBidangPekerjaan() ([]BidangPekerjaan, error)

	// New Referensi Sync methods (29 endpoints)
	SyncBidangStudiFromSister(syncedBy string) (int, error)
	SyncBidangUsahaFromSister(syncedBy string) (int, error)
	SyncJabatanFungsionalFromSister(syncedBy string) (int, error)
	SyncJabatanTugasTambahanFromSister(syncedBy string) (int, error)
	SyncJenisBahanAjarFromSister(syncedBy string) (int, error)
	SyncJenisBeasiswaFromSister(syncedBy string) (int, error)
	SyncJenisDiklatFromSister(syncedBy string) (int, error)
	SyncJenisDokumenFromSister(syncedBy string) (int, error)
	SyncJenisKeluarFromSister(syncedBy string) (int, error)
	SyncJenisKepanitiaanFromSister(syncedBy string) (int, error)
	SyncJenisKesejahteraanFromSister(syncedBy string) (int, error)
	SyncJenisPublikasiFromSister(syncedBy string) (int, error)
	SyncJenisTesFromSister(syncedBy string) (int, error)
	SyncJenisTunjanganFromSister(syncedBy string) (int, error)
	SyncMediaPublikasiFromSister(syncedBy string) (int, error)
	SyncSkimKegiatanFromSister(syncedBy string) (int, error)
	SyncStatusKepegawaianFromSister(syncedBy string) (int, error)
	SyncSumberGajiFromSister(syncedBy string) (int, error)
	SyncTingkatPenghargaanFromSister(syncedBy string) (int, error)
	SyncWilayahFromSister(syncedBy string) (int, error)
	SyncKategoriCapaianLuaranFromSister(syncedBy string) (int, error)
	SyncKategoriKegiatanFromSister(syncedBy string) (int, error)
	SyncKelompokBidangFromSister(syncedBy string) (int, error)
	SyncLembagaSertifikasiFromSister(syncedBy string) (int, error)
	SyncGolonganPangkatFromSister(syncedBy string) (int, error)
	SyncIkatanKerjaFromSister(syncedBy string) (int, error)
	SyncJenisPenghargaanFromSister(syncedBy string) (int, error)
	SyncJenisPekerjaanFromSister(syncedBy string) (int, error)
	SyncBidangPekerjaanFromSister(syncedBy string) (int, error)

	// Metadata & Batch Sync methods
	GetAllReferensiMetadata(ctx context.Context) ([]ReferensiMetadata, error)
	BatchSyncFromSister(ctx context.Context, endpoints []string, syncedBy string) (*BatchSyncResponse, error)
}

type service struct {
	repo          Repository
	sisterAPI     *sister_api.Client
	loggerService appLogger.Service
}

// NewService creates a new service instance
func NewService(repo Repository, sisterAPI *sister_api.Client, loggerSvc appLogger.Service) Service {
	return &service{
		repo:          repo,
		sisterAPI:     sisterAPI,
		loggerService: loggerSvc,
	}
}

// GetAllAgama retrieves all agama
func (s *service) GetAllAgama(ctx context.Context) ([]Agama, error) {
	return s.repo.GetAllAgama(ctx)
}

// GetAgamaByID retrieves agama by ID
func (s *service) GetAgamaByID(ctx context.Context, id int) (*Agama, error) {
	return s.repo.GetAgamaByID(ctx, id)
}

// SyncAgamaFromSister synchronizes agama data from Sister API
func (s *service) SyncAgamaFromSister(ctx context.Context, syncedBy string) (int, error) {
	startTime := time.Now()
	var totalRecords int
	var syncErr error

	defer func() {
		s.logSyncResult(ctx, "Agama", "agama", "manual", syncedBy, totalRecords, startTime, syncErr)
	}()

	log.Println("🔄 Starting sync agama from Sister API...")

	// 1. Fetch data from Sister API
	rawData, err := s.sisterAPI.GetReferensiAgama()
	if err != nil {
		log.Printf("Error fetching agama from Sister API: %v", err)
		syncErr = fmt.Errorf("failed to fetch from Sister API: %w", err)
		return 0, syncErr
	}

	// 2. Parse Sister API response
	var sisterAgamaList []SisterAgama
	if err := json.Unmarshal(rawData, &sisterAgamaList); err != nil {
		log.Printf("Error parsing Sister API response: %v", err)
		syncErr = fmt.Errorf("failed to parse Sister API response: %w", err)
		return 0, syncErr
	}

	totalRecords = len(sisterAgamaList)
	log.Printf("✅ Fetched %d agama from Sister API", totalRecords)

	// 3. Transform to domain entity
	agamaList := make([]Agama, len(sisterAgamaList))
	for i, sa := range sisterAgamaList {
		agamaList[i] = Agama{
			IDAgama:   sa.ID,
			NamaAgama: sa.Nama,
		}
	}

	// Log who synced for audit trail
	log.Printf("📝 Sync requested by: %s", syncedBy)

	// 4. Bulk upsert to database
	if err := s.repo.BulkUpsertAgama(ctx, agamaList); err != nil {
		log.Printf("Error upserting agama to database: %v", err)
		syncErr = fmt.Errorf("failed to save to database: %w", err)
		return 0, syncErr
	}

	log.Printf("✅ Successfully synced %d agama records", len(agamaList))
	return len(agamaList), nil
}

// ==================== NEGARA SERVICE METHODS ====================

// GetAllNegara retrieves all negara from database
func (s *service) GetAllNegara(ctx context.Context) ([]Negara, error) {
	return s.repo.GetAllNegara(ctx)
}

// GetNegaraByID retrieves a negara by ID
func (s *service) GetNegaraByID(ctx context.Context, id string) (*Negara, error) {
	return s.repo.GetNegaraByID(ctx, id)
}

// SyncNegaraFromSister fetches negara from Sister API and syncs to database
func (s *service) SyncNegaraFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync negara from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiNegara()
	if err != nil {
		log.Printf("Error fetching negara from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterNegaraList []SisterNegara
	if err := json.Unmarshal(rawData, &sisterNegaraList); err != nil {
		log.Printf("Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d negara from Sister API", len(sisterNegaraList))

	negaraList := make([]Negara, len(sisterNegaraList))
	for i, sn := range sisterNegaraList {
		negaraList[i] = Negara{
			IDNegara:   sn.ID,
			NamaNegara: sn.Nama,
			SyncedBy:   &syncedBy,
		}
	}

	if err := s.repo.BulkUpsertNegara(ctx, negaraList); err != nil {
		log.Printf("Error upserting negara to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d negara records", len(negaraList))
	return len(negaraList), nil
}

// ==================== JENJANG PENDIDIKAN SERVICE METHODS ====================

// GetAllJenjangPendidikan retrieves all jenjang pendidikan from database
func (s *service) GetAllJenjangPendidikan(ctx context.Context) ([]JenjangPendidikan, error) {
	return s.repo.GetAllJenjangPendidikan(ctx)
}

// SyncJenjangPendidikanFromSister fetches jenjang pendidikan from Sister API and syncs to database
func (s *service) SyncJenjangPendidikanFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync jenjang pendidikan from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiJenjangPendidikan()
	if err != nil {
		log.Printf("❌ Error fetching jenjang pendidikan from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterList []SisterJenjangPendidikan
	if err := json.Unmarshal(rawData, &sisterList); err != nil {
		log.Printf("❌ Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d jenjang pendidikan from Sister API", len(sisterList))

	list := make([]JenjangPendidikan, 0, len(sisterList))
	for _, item := range sisterList {
		id, err := strconv.Atoi(item.ID)
		if err != nil {
			log.Printf("⚠️ Skipping invalid ID: %s", item.ID)
			continue
		}

		list = append(list, JenjangPendidikan{
			IDJenjangPendidikan: id,
			NamaJenjang:         item.Nama,
			SyncedBy:            &syncedBy,
		})
	}

	if err := s.repo.BulkUpsertJenjangPendidikan(ctx, list); err != nil {
		log.Printf("❌ Error upserting jenjang pendidikan to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d jenjang pendidikan records", len(list))
	return len(list), nil
}

// ==================== GELAR AKADEMIK SERVICE METHODS ====================

// GetAllGelarAkademik retrieves all gelar akademik from database
func (s *service) GetAllGelarAkademik(ctx context.Context) ([]GelarAkademik, error) {
	return s.repo.GetAllGelarAkademik(ctx)
}

// SyncGelarAkademikFromSister fetches gelar akademik from Sister API and syncs to database
func (s *service) SyncGelarAkademikFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync gelar akademik from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiGelarAkademik()
	if err != nil {
		log.Printf("❌ Error fetching gelar akademik from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterList []SisterGelarAkademik
	if err := json.Unmarshal(rawData, &sisterList); err != nil {
		log.Printf("❌ Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d gelar akademik from Sister API", len(sisterList))

	list := make([]GelarAkademik, 0, len(sisterList))
	for _, item := range sisterList {
		list = append(list, GelarAkademik{
			IDGelarAkademik: item.ID,
			NamaGelar:       item.Nama,
			SyncedBy:        &syncedBy,
		})
	}

	if err := s.repo.BulkUpsertGelarAkademik(ctx, list); err != nil {
		log.Printf("❌ Error upserting gelar akademik to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d gelar akademik records", len(list))
	return len(list), nil
}

// ==================== SEMESTER SERVICE METHODS ====================

// GetAllSemester retrieves all semester from database
func (s *service) GetAllSemester(ctx context.Context) ([]Semester, error) {
	return s.repo.GetAllSemester(ctx)
}

// SyncSemesterFromSister fetches semester from Sister API and syncs to database
func (s *service) SyncSemesterFromSister(ctx context.Context, syncedBy string) (int, error) {
	log.Println("🔄 Starting sync semester from Sister API...")

	rawData, err := s.sisterAPI.GetReferensiSemester()
	if err != nil {
		log.Printf("❌ Error fetching semester from Sister API: %v", err)
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	var sisterList []SisterSemester
	if err := json.Unmarshal(rawData, &sisterList); err != nil {
		log.Printf("❌ Error parsing Sister API response: %v", err)
		return 0, fmt.Errorf("failed to parse Sister API response: %w", err)
	}

	log.Printf("✅ Fetched %d semester from Sister API", len(sisterList))

	list := make([]Semester, len(sisterList))
	for i, item := range sisterList {
		list[i] = Semester{
			IDSemester:   item.ID,
			NamaSemester: item.Nama,
			SyncedBy:     &syncedBy,
		}
	}

	if err := s.repo.BulkUpsertSemester(ctx, list); err != nil {
		log.Printf("❌ Error upserting semester to database: %v", err)
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	log.Printf("✅ Successfully synced %d semester records", len(list))
	return len(list), nil
}

// ==================== METADATA & BATCH SYNC METHODS ====================

// GetAllReferensiMetadata returns metadata for all available referensi endpoints
func (s *service) GetAllReferensiMetadata(ctx context.Context) ([]ReferensiMetadata, error) {
	log.Println("📊 Fetching metadata for all referensi endpoints...")

	metadata := []ReferensiMetadata{
		{Key: "agama", Name: "Agama", Description: "Data referensi agama/kepercayaan", Available: true},
		{Key: "negara", Name: "Negara", Description: "Data referensi negara", Available: true},
		{Key: "jenjang_pendidikan", Name: "Jenjang Pendidikan", Description: "Data referensi jenjang pendidikan", Available: true},
		{Key: "gelar_akademik", Name: "Gelar Akademik", Description: "Data referensi gelar/titel akademik", Available: true},
		{Key: "semester", Name: "Semester", Description: "Data referensi semester", Available: true},
		// New 29 endpoints
		{Key: "bidang_studi", Name: "Bidang Studi", Description: "Data referensi bidang studi/keilmuan", Available: true},
		{Key: "bidang_usaha", Name: "Bidang Usaha", Description: "Data referensi bidang usaha", Available: true},
		{Key: "jabatan_fungsional", Name: "Jabatan Fungsional", Description: "Data referensi jabatan fungsional", Available: true},
		{Key: "jabatan_tugas_tambahan", Name: "Jabatan Tugas Tambahan", Description: "Data referensi jabatan tugas tambahan", Available: true},
		{Key: "jenis_bahan_ajar", Name: "Jenis Bahan Ajar", Description: "Data referensi jenis bahan ajar", Available: true},
		{Key: "jenis_beasiswa", Name: "Jenis Beasiswa", Description: "Data referensi jenis beasiswa", Available: true},
		{Key: "jenis_diklat", Name: "Jenis Diklat", Description: "Data referensi jenis diklat/pelatihan", Available: true},
		{Key: "jenis_dokumen", Name: "Jenis Dokumen", Description: "Data referensi jenis dokumen", Available: true},
		{Key: "jenis_keluar", Name: "Jenis Keluar", Description: "Data referensi jenis keluar mahasiswa/dosen", Available: true},
		{Key: "jenis_kepanitiaan", Name: "Jenis Kepanitiaan", Description: "Data referensi jenis kepanitiaan", Available: true},
		{Key: "jenis_kesejahteraan", Name: "Jenis Kesejahteraan", Description: "Data referensi jenis kesejahteraan", Available: true},
		{Key: "jenis_publikasi", Name: "Jenis Publikasi", Description: "Data referensi jenis publikasi ilmiah", Available: true},
		{Key: "jenis_tes", Name: "Jenis Tes", Description: "Data referensi jenis tes", Available: true},
		{Key: "jenis_tunjangan", Name: "Jenis Tunjangan", Description: "Data referensi jenis tunjangan", Available: true},
		{Key: "media_publikasi", Name: "Media Publikasi", Description: "Data referensi media publikasi", Available: true},
		{Key: "skim_kegiatan", Name: "Skim Kegiatan", Description: "Data referensi skim kegiatan penelitian/pengabdian", Available: true},
		{Key: "status_kepegawaian", Name: "Status Kepegawaian", Description: "Data referensi status kepegawaian", Available: true},
		{Key: "sumber_gaji", Name: "Sumber Gaji", Description: "Data referensi sumber gaji", Available: true},
		{Key: "tingkat_penghargaan", Name: "Tingkat Penghargaan", Description: "Data referensi tingkat penghargaan", Available: true},
		{Key: "wilayah", Name: "Wilayah", Description: "Data referensi wilayah Indonesia", Available: true},
		{Key: "kategori_capaian_luaran", Name: "Kategori Capaian Luaran", Description: "Data referensi kategori capaian luaran penelitian", Available: true},
		{Key: "kategori_kegiatan", Name: "Kategori Kegiatan", Description: "Data referensi kategori kegiatan", Available: true},
		{Key: "kelompok_bidang", Name: "Kelompok Bidang", Description: "Data referensi kelompok bidang ilmu", Available: true},
		{Key: "lembaga_sertifikasi", Name: "Lembaga Sertifikasi", Description: "Data referensi lembaga sertifikasi", Available: true},
		{Key: "golongan_pangkat", Name: "Golongan Pangkat", Description: "Data referensi golongan/pangkat pegawai", Available: true},
		{Key: "ikatan_kerja", Name: "Ikatan Kerja", Description: "Data referensi ikatan kerja SDM", Available: true},
		{Key: "jenis_penghargaan", Name: "Jenis Penghargaan", Description: "Data referensi jenis penghargaan", Available: true},
		{Key: "jenis_pekerjaan", Name: "Jenis Pekerjaan", Description: "Data referensi jenis pekerjaan", Available: true},
		{Key: "bidang_pekerjaan", Name: "Bidang Pekerjaan", Description: "Data referensi bidang pekerjaan", Available: true},
	}

	// Get counts and last sync info for each endpoint
	for i := range metadata {
		switch metadata[i].Key {
		case "agama":
			agamaList, _ := s.repo.GetAllAgama(ctx)
			metadata[i].TotalRecords = len(agamaList)
			if len(agamaList) > 0 && agamaList[0].LastSync != nil {
				metadata[i].LastSync = agamaList[0].LastSync
			}
		case "negara":
			negaraList, _ := s.repo.GetAllNegara(ctx)
			metadata[i].TotalRecords = len(negaraList)
			if len(negaraList) > 0 && negaraList[0].LastSync != nil {
				metadata[i].LastSync = negaraList[0].LastSync
				if negaraList[0].SyncedBy != nil {
					metadata[i].SyncedBy = *negaraList[0].SyncedBy
				}
			}
		case "jenjang_pendidikan":
			list, _ := s.repo.GetAllJenjangPendidikan(ctx)
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "gelar_akademik":
			list, _ := s.repo.GetAllGelarAkademik(ctx)
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "semester":
			list, _ := s.repo.GetAllSemester(ctx)
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "bidang_studi":
			list, _ := s.repo.GetAllBidangStudi()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "bidang_usaha":
			list, _ := s.repo.GetAllBidangUsaha()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jabatan_fungsional":
			list, _ := s.repo.GetAllJabatanFungsional()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jabatan_tugas_tambahan":
			list, _ := s.repo.GetAllJabatanTugasTambahan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_bahan_ajar":
			list, _ := s.repo.GetAllJenisBahanAjar()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_beasiswa":
			list, _ := s.repo.GetAllJenisBeasiswa()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_diklat":
			list, _ := s.repo.GetAllJenisDiklat()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_dokumen":
			list, _ := s.repo.GetAllJenisDokumen()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_keluar":
			list, _ := s.repo.GetAllJenisKeluar()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_kepanitiaan":
			list, _ := s.repo.GetAllJenisKepanitiaan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_kesejahteraan":
			list, _ := s.repo.GetAllJenisKesejahteraan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_publikasi":
			list, _ := s.repo.GetAllJenisPublikasi()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_tes":
			list, _ := s.repo.GetAllJenisTes()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_tunjangan":
			list, _ := s.repo.GetAllJenisTunjangan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "media_publikasi":
			list, _ := s.repo.GetAllMediaPublikasi()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "skim_kegiatan":
			list, _ := s.repo.GetAllSkimKegiatan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "status_kepegawaian":
			list, _ := s.repo.GetAllStatusKepegawaian()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "sumber_gaji":
			list, _ := s.repo.GetAllSumberGaji()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "tingkat_penghargaan":
			list, _ := s.repo.GetAllTingkatPenghargaan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "wilayah":
			list, _ := s.repo.GetAllWilayah()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "kategori_capaian_luaran":
			list, _ := s.repo.GetAllKategoriCapaianLuaran()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "kategori_kegiatan":
			list, _ := s.repo.GetAllKategoriKegiatan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "kelompok_bidang":
			list, _ := s.repo.GetAllKelompokBidang()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "lembaga_sertifikasi":
			list, _ := s.repo.GetAllLembagaSertifikasi()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "golongan_pangkat":
			list, _ := s.repo.GetAllGolonganPangkat()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "ikatan_kerja":
			list, _ := s.repo.GetAllIkatanKerja()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_penghargaan":
			list, _ := s.repo.GetAllJenisPenghargaan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "jenis_pekerjaan":
			list, _ := s.repo.GetAllJenisPekerjaan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		case "bidang_pekerjaan":
			list, _ := s.repo.GetAllBidangPekerjaan()
			metadata[i].TotalRecords = len(list)
			if len(list) > 0 && list[0].LastSync != nil {
				metadata[i].LastSync = list[0].LastSync
				if list[0].SyncedBy != nil {
					metadata[i].SyncedBy = *list[0].SyncedBy
				}
			}
		}
	}

	log.Printf("✅ Fetched metadata for %d endpoints", len(metadata))
	return metadata, nil
}

// BatchSyncFromSister syncs multiple endpoints in parallel using goroutines
func (s *service) BatchSyncFromSister(ctx context.Context, endpoints []string, syncedBy string) (*BatchSyncResponse, error) {
	startTime := time.Now()
	log.Printf("🔄 Starting batch sync for %d endpoints: %v", len(endpoints), endpoints)

	// Create channels for results and WaitGroup for synchronization
	var wg sync.WaitGroup
	resultChan := make(chan BatchSyncResult, len(endpoints))

	// Launch goroutine for each endpoint
	for _, endpoint := range endpoints {
		wg.Add(1)
		go func(ep string) {
			defer wg.Done()

			result := BatchSyncResult{
				Endpoint: ep,
			}

			// Call appropriate sync method based on endpoint
			var totalRecords int
			var err error

			switch ep {
			case "agama":
				totalRecords, err = s.SyncAgamaFromSister(ctx, syncedBy)
			case "negara":
				totalRecords, err = s.SyncNegaraFromSister(ctx, syncedBy)
			case "jenjang_pendidikan":
				totalRecords, err = s.SyncJenjangPendidikanFromSister(ctx, syncedBy)
			case "gelar_akademik":
				totalRecords, err = s.SyncGelarAkademikFromSister(ctx, syncedBy)
			case "semester":
				totalRecords, err = s.SyncSemesterFromSister(ctx, syncedBy)
			// New 29 endpoints
			case "bidang_studi":
				totalRecords, err = s.SyncBidangStudiFromSister(syncedBy)
			case "bidang_usaha":
				totalRecords, err = s.SyncBidangUsahaFromSister(syncedBy)
			case "jabatan_fungsional":
				totalRecords, err = s.SyncJabatanFungsionalFromSister(syncedBy)
			case "jabatan_tugas_tambahan":
				totalRecords, err = s.SyncJabatanTugasTambahanFromSister(syncedBy)
			case "jenis_bahan_ajar":
				totalRecords, err = s.SyncJenisBahanAjarFromSister(syncedBy)
			case "jenis_beasiswa":
				totalRecords, err = s.SyncJenisBeasiswaFromSister(syncedBy)
			case "jenis_diklat":
				totalRecords, err = s.SyncJenisDiklatFromSister(syncedBy)
			case "jenis_dokumen":
				totalRecords, err = s.SyncJenisDokumenFromSister(syncedBy)
			case "jenis_keluar":
				totalRecords, err = s.SyncJenisKeluarFromSister(syncedBy)
			case "jenis_kepanitiaan":
				totalRecords, err = s.SyncJenisKepanitiaanFromSister(syncedBy)
			case "jenis_kesejahteraan":
				totalRecords, err = s.SyncJenisKesejahteraanFromSister(syncedBy)
			case "jenis_publikasi":
				totalRecords, err = s.SyncJenisPublikasiFromSister(syncedBy)
			case "jenis_tes":
				totalRecords, err = s.SyncJenisTesFromSister(syncedBy)
			case "jenis_tunjangan":
				totalRecords, err = s.SyncJenisTunjanganFromSister(syncedBy)
			case "media_publikasi":
				totalRecords, err = s.SyncMediaPublikasiFromSister(syncedBy)
			case "skim_kegiatan":
				totalRecords, err = s.SyncSkimKegiatanFromSister(syncedBy)
			case "status_kepegawaian":
				totalRecords, err = s.SyncStatusKepegawaianFromSister(syncedBy)
			case "sumber_gaji":
				totalRecords, err = s.SyncSumberGajiFromSister(syncedBy)
			case "tingkat_penghargaan":
				totalRecords, err = s.SyncTingkatPenghargaanFromSister(syncedBy)
			case "wilayah":
				totalRecords, err = s.SyncWilayahFromSister(syncedBy)
			case "kategori_capaian_luaran":
				totalRecords, err = s.SyncKategoriCapaianLuaranFromSister(syncedBy)
			case "kategori_kegiatan":
				totalRecords, err = s.SyncKategoriKegiatanFromSister(syncedBy)
			case "kelompok_bidang":
				totalRecords, err = s.SyncKelompokBidangFromSister(syncedBy)
			case "lembaga_sertifikasi":
				totalRecords, err = s.SyncLembagaSertifikasiFromSister(syncedBy)
			case "golongan_pangkat":
				totalRecords, err = s.SyncGolonganPangkatFromSister(syncedBy)
			case "ikatan_kerja":
				totalRecords, err = s.SyncIkatanKerjaFromSister(syncedBy)
			case "jenis_penghargaan":
				totalRecords, err = s.SyncJenisPenghargaanFromSister(syncedBy)
			case "jenis_pekerjaan":
				totalRecords, err = s.SyncJenisPekerjaanFromSister(syncedBy)
			case "bidang_pekerjaan":
				totalRecords, err = s.SyncBidangPekerjaanFromSister(syncedBy)
			default:
				err = fmt.Errorf("unknown endpoint: %s", ep)
			}

			if err != nil {
				result.Success = false
				result.Error = err.Error()
				result.Message = fmt.Sprintf("Failed to sync %s", ep)
				log.Printf("❌ Batch sync failed for %s: %v", ep, err)
			} else {
				result.Success = true
				result.TotalRecords = totalRecords
				result.Message = fmt.Sprintf("Successfully synced %d records", totalRecords)
				log.Printf("✅ Batch sync succeeded for %s: %d records", ep, totalRecords)
			}

			resultChan <- result
		}(endpoint)
	}

	// Wait for all goroutines to complete
	wg.Wait()
	close(resultChan)

	// Collect results
	var results []BatchSyncResult
	totalSuccess := 0
	totalFailed := 0

	for result := range resultChan {
		results = append(results, result)
		if result.Success {
			totalSuccess++
		} else {
			totalFailed++
		}
	}

	duration := time.Since(startTime)

	response := &BatchSyncResponse{
		TotalRequested: len(endpoints),
		TotalSuccess:   totalSuccess,
		TotalFailed:    totalFailed,
		Results:        results,
		Duration:       duration.String(),
	}

	log.Printf("✅ Batch sync completed: %d succeeded, %d failed in %s",
		totalSuccess, totalFailed, duration.String())

	return response, nil
}

// GetAllBidangStudi returns all bidang_studi records
func (s *service) GetAllBidangStudi() ([]BidangStudi, error) {
	return s.repo.GetAllBidangStudi()
}

// GetAllBidangUsaha returns all bidang_usaha records
func (s *service) GetAllBidangUsaha() ([]BidangUsaha, error) {
	return s.repo.GetAllBidangUsaha()
}

// GetAllJabatanFungsional returns all jabatan_fungsional records
func (s *service) GetAllJabatanFungsional() ([]JabatanFungsional, error) {
	return s.repo.GetAllJabatanFungsional()
}

// GetAllJabatanTugasTambahan returns all jabatan_tugas_tambahan records
func (s *service) GetAllJabatanTugasTambahan() ([]JabatanTugasTambahan, error) {
	return s.repo.GetAllJabatanTugasTambahan()
}

// GetAllJenisBahanAjar returns all jenis_bahan_ajar records
func (s *service) GetAllJenisBahanAjar() ([]JenisBahanAjar, error) {
	return s.repo.GetAllJenisBahanAjar()
}

// GetAllJenisBeasiswa returns all jenis_beasiswa records
func (s *service) GetAllJenisBeasiswa() ([]JenisBeasiswa, error) {
	return s.repo.GetAllJenisBeasiswa()
}

// GetAllJenisDiklat returns all jenis_diklat records
func (s *service) GetAllJenisDiklat() ([]JenisDiklat, error) {
	return s.repo.GetAllJenisDiklat()
}

// GetAllJenisDokumen returns all jenis_dokumen records
func (s *service) GetAllJenisDokumen() ([]JenisDokumen, error) {
	return s.repo.GetAllJenisDokumen()
}

// GetAllJenisKeluar returns all jenis_keluar records
func (s *service) GetAllJenisKeluar() ([]JenisKeluar, error) {
	return s.repo.GetAllJenisKeluar()
}

// GetAllJenisKepanitiaan returns all jenis_kepanitiaan records
func (s *service) GetAllJenisKepanitiaan() ([]JenisKepanitiaan, error) {
	return s.repo.GetAllJenisKepanitiaan()
}

// GetAllJenisKesejahteraan returns all jenis_kesejahteraan records
func (s *service) GetAllJenisKesejahteraan() ([]JenisKesejahteraan, error) {
	return s.repo.GetAllJenisKesejahteraan()
}

// GetAllJenisPublikasi returns all jenis_publikasi records
func (s *service) GetAllJenisPublikasi() ([]JenisPublikasi, error) {
	return s.repo.GetAllJenisPublikasi()
}

// GetAllJenisTes returns all jenis_tes records
func (s *service) GetAllJenisTes() ([]JenisTes, error) {
	return s.repo.GetAllJenisTes()
}

// GetAllJenisTunjangan returns all jenis_tunjangan records
func (s *service) GetAllJenisTunjangan() ([]JenisTunjangan, error) {
	return s.repo.GetAllJenisTunjangan()
}

// GetAllMediaPublikasi returns all media_publikasi records
func (s *service) GetAllMediaPublikasi() ([]MediaPublikasi, error) {
	return s.repo.GetAllMediaPublikasi()
}

// GetAllSkimKegiatan returns all skim_kegiatan records
func (s *service) GetAllSkimKegiatan() ([]SkimKegiatan, error) {
	return s.repo.GetAllSkimKegiatan()
}

// GetAllStatusKepegawaian returns all status_kepegawaian records
func (s *service) GetAllStatusKepegawaian() ([]StatusKepegawaian, error) {
	return s.repo.GetAllStatusKepegawaian()
}

// GetAllSumberGaji returns all sumber_gaji records
func (s *service) GetAllSumberGaji() ([]SumberGaji, error) {
	return s.repo.GetAllSumberGaji()
}

// GetAllTingkatPenghargaan returns all tingkat_penghargaan records
func (s *service) GetAllTingkatPenghargaan() ([]TingkatPenghargaan, error) {
	return s.repo.GetAllTingkatPenghargaan()
}

// GetAllWilayah returns all wilayah records
func (s *service) GetAllWilayah() ([]Wilayah, error) {
	return s.repo.GetAllWilayah()
}

// GetAllKategoriCapaianLuaran returns all kategori_capaian_luaran records
func (s *service) GetAllKategoriCapaianLuaran() ([]KategoriCapaianLuaran, error) {
	return s.repo.GetAllKategoriCapaianLuaran()
}

// GetAllKategoriKegiatan returns all kategori_kegiatan records
func (s *service) GetAllKategoriKegiatan() ([]KategoriKegiatan, error) {
	return s.repo.GetAllKategoriKegiatan()
}

// GetAllKelompokBidang returns all kelompok_bidang records
func (s *service) GetAllKelompokBidang() ([]KelompokBidang, error) {
	return s.repo.GetAllKelompokBidang()
}

// GetAllLembagaSertifikasi returns all lembaga_sertifikasi records
func (s *service) GetAllLembagaSertifikasi() ([]LembagaSertifikasi, error) {
	return s.repo.GetAllLembagaSertifikasi()
}

// GetAllGolonganPangkat returns all golongan_pangkat records
func (s *service) GetAllGolonganPangkat() ([]GolonganPangkat, error) {
	return s.repo.GetAllGolonganPangkat()
}

// GetAllIkatanKerja returns all ikatan_kerja records
func (s *service) GetAllIkatanKerja() ([]IkatanKerja, error) {
	return s.repo.GetAllIkatanKerja()
}

// GetAllJenisPenghargaan returns all jenis_penghargaan records
func (s *service) GetAllJenisPenghargaan() ([]JenisPenghargaan, error) {
	return s.repo.GetAllJenisPenghargaan()
}

// GetAllJenisPekerjaan returns all jenis_pekerjaan records
func (s *service) GetAllJenisPekerjaan() ([]JenisPekerjaan, error) {
	return s.repo.GetAllJenisPekerjaan()
}

// GetAllBidangPekerjaan returns all bidang_pekerjaan records
func (s *service) GetAllBidangPekerjaan() ([]BidangPekerjaan, error) {
	return s.repo.GetAllBidangPekerjaan()
}

// SyncBidangStudiFromSister syncs bidang_studi data from Sister API to database
func (s *service) SyncBidangStudiFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiBidangStudi()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterBidangStudi](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertBidangStudi(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncBidangUsahaFromSister syncs bidang_usaha data from Sister API to database
func (s *service) SyncBidangUsahaFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiBidangUsaha()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterBidangUsaha](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertBidangUsaha(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJabatanFungsionalFromSister syncs jabatan_fungsional data from Sister API to database
func (s *service) SyncJabatanFungsionalFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJabatanFungsional()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJabatanFungsional](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJabatanFungsional(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJabatanTugasTambahanFromSister syncs jabatan_tugas_tambahan data from Sister API to database
func (s *service) SyncJabatanTugasTambahanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJabatanTugasTambahan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJabatanTugasTambahan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJabatanTugasTambahan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisBahanAjarFromSister syncs jenis_bahan_ajar data from Sister API to database
func (s *service) SyncJenisBahanAjarFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisBahanAjar()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisBahanAjar](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisBahanAjar(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisBeasiswaFromSister syncs jenis_beasiswa data from Sister API to database
func (s *service) SyncJenisBeasiswaFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisBeasiswa()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisBeasiswa](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisBeasiswa(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisDiklatFromSister syncs jenis_diklat data from Sister API to database
func (s *service) SyncJenisDiklatFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisDiklat()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisDiklat](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisDiklat(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisDokumenFromSister syncs jenis_dokumen data from Sister API to database
func (s *service) SyncJenisDokumenFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisDokumen()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisDokumen](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisDokumen(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisKeluarFromSister syncs jenis_keluar data from Sister API to database
func (s *service) SyncJenisKeluarFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisKeluar()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisKeluar](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisKeluar(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisKepanitiaanFromSister syncs jenis_kepanitiaan data from Sister API to database
func (s *service) SyncJenisKepanitiaanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisKepanitiaan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisKepanitiaan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisKepanitiaan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisKesejahteraanFromSister syncs jenis_kesejahteraan data from Sister API to database
func (s *service) SyncJenisKesejahteraanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisKesejahteraan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisKesejahteraan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisKesejahteraan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisPublikasiFromSister syncs jenis_publikasi data from Sister API to database
func (s *service) SyncJenisPublikasiFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisPublikasi()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisPublikasi](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisPublikasi(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisTesFromSister syncs jenis_tes data from Sister API to database
func (s *service) SyncJenisTesFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisTes()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisTes](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisTes(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisTunjanganFromSister syncs jenis_tunjangan data from Sister API to database
func (s *service) SyncJenisTunjanganFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisTunjangan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisTunjangan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisTunjangan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncMediaPublikasiFromSister syncs media_publikasi data from Sister API to database
func (s *service) SyncMediaPublikasiFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiMediaPublikasi()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterMediaPublikasi](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertMediaPublikasi(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncSkimKegiatanFromSister syncs skim_kegiatan data from Sister API to database
func (s *service) SyncSkimKegiatanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiSkimKegiatan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterSkimKegiatan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertSkimKegiatan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncStatusKepegawaianFromSister syncs status_kepegawaian data from Sister API to database
func (s *service) SyncStatusKepegawaianFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiStatusKepegawaian()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterStatusKepegawaian](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertStatusKepegawaian(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncSumberGajiFromSister syncs sumber_gaji data from Sister API to database
func (s *service) SyncSumberGajiFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiSumberGaji()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterSumberGaji](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertSumberGaji(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncTingkatPenghargaanFromSister syncs tingkat_penghargaan data from Sister API to database
func (s *service) SyncTingkatPenghargaanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiTingkatPenghargaan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterTingkatPenghargaan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertTingkatPenghargaan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncWilayahFromSister syncs wilayah data from Sister API to database
func (s *service) SyncWilayahFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiWilayah()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterWilayah](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertWilayah(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncKategoriCapaianLuaranFromSister syncs kategori_capaian_luaran data from Sister API to database
func (s *service) SyncKategoriCapaianLuaranFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiKategoriCapaianLuaran()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterKategoriCapaianLuaran](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertKategoriCapaianLuaran(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncKategoriKegiatanFromSister syncs kategori_kegiatan data from Sister API to database
func (s *service) SyncKategoriKegiatanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiKategoriKegiatan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterKategoriKegiatan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertKategoriKegiatan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncKelompokBidangFromSister syncs kelompok_bidang data from Sister API to database
func (s *service) SyncKelompokBidangFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiKelompokBidang()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterKelompokBidang](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertKelompokBidang(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncLembagaSertifikasiFromSister syncs lembaga_sertifikasi data from Sister API to database
func (s *service) SyncLembagaSertifikasiFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiLembagaSertifikasi()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterLembagaSertifikasi](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertLembagaSertifikasi(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncGolonganPangkatFromSister syncs golongan_pangkat data from Sister API to database
func (s *service) SyncGolonganPangkatFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiGolonganPangkat()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterGolonganPangkat](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertGolonganPangkat(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncIkatanKerjaFromSister syncs ikatan_kerja data from Sister API to database
func (s *service) SyncIkatanKerjaFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiIkatanKerja()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterIkatanKerja](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertIkatanKerja(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisPenghargaanFromSister syncs jenis_penghargaan data from Sister API to database
func (s *service) SyncJenisPenghargaanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisPenghargaan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisPenghargaan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisPenghargaan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncJenisPekerjaanFromSister syncs jenis_pekerjaan data from Sister API to database
func (s *service) SyncJenisPekerjaanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiJenisPekerjaan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterJenisPekerjaan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertJenisPekerjaan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}

// SyncBidangPekerjaanFromSister syncs bidang_pekerjaan data from Sister API to database
func (s *service) SyncBidangPekerjaanFromSister(syncedBy string) (int, error) {
	rawData, err := s.sisterAPI.GetReferensiBidangPekerjaan()
	if err != nil {
		return 0, fmt.Errorf("failed to fetch from Sister API: %w", err)
	}

	sisterData, err := UnmarshalSisterResponse[SisterBidangPekerjaan](rawData)
	if err != nil {
		return 0, fmt.Errorf("failed to parse response: %w", err)
	}

	err = s.repo.BulkUpsertBidangPekerjaan(sisterData, syncedBy)
	if err != nil {
		return 0, fmt.Errorf("failed to save to database: %w", err)
	}

	return len(sisterData), nil
}
