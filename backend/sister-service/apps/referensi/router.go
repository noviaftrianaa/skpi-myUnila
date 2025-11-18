package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// Init initializes referensi routes and returns the service
func Init(router fiber.Router, db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc logger.Service) Service {
	repo := NewRepository(db)
	svc := NewService(repo, sisterAPI, loggerSvc)
	ctrl := NewController(svc)

	// API routes (authenticated with JWT at Kong level)
	api := router.Group("/api/v1")
	referensiAPI := api.Group("/referensi")
	{
		// POST sync routes
		referensiAPI.Post("/agama/sync", ctrl.SyncAgamaFromSister)
		referensiAPI.Post("/negara/sync", ctrl.SyncNegaraFromSister)
		referensiAPI.Post("/jenjang-pendidikan/sync", ctrl.SyncJenjangPendidikanFromSister)
		referensiAPI.Post("/gelar-akademik/sync", ctrl.SyncGelarAkademikFromSister)
		referensiAPI.Post("/semester/sync", ctrl.SyncSemesterFromSister)
		referensiAPI.Post("/bidang-studi/sync", ctrl.SyncBidangStudi)
		referensiAPI.Post("/bidang-usaha/sync", ctrl.SyncBidangUsaha)
		referensiAPI.Post("/jabatan-fungsional/sync", ctrl.SyncJabatanFungsional)
		referensiAPI.Post("/jabatan-tugas-tambahan/sync", ctrl.SyncJabatanTugasTambahan)
		referensiAPI.Post("/jenis-bahan-ajar/sync", ctrl.SyncJenisBahanAjar)
		referensiAPI.Post("/jenis-beasiswa/sync", ctrl.SyncJenisBeasiswa)
		referensiAPI.Post("/jenis-diklat/sync", ctrl.SyncJenisDiklat)
		referensiAPI.Post("/jenis-dokumen/sync", ctrl.SyncJenisDokumen)
		referensiAPI.Post("/jenis-keluar/sync", ctrl.SyncJenisKeluar)
		referensiAPI.Post("/jenis-kepanitiaan/sync", ctrl.SyncJenisKepanitiaan)
		referensiAPI.Post("/jenis-kesejahteraan/sync", ctrl.SyncJenisKesejahteraan)
		referensiAPI.Post("/jenis-publikasi/sync", ctrl.SyncJenisPublikasi)
		referensiAPI.Post("/jenis-tes/sync", ctrl.SyncJenisTes)
		referensiAPI.Post("/jenis-tunjangan/sync", ctrl.SyncJenisTunjangan)
		referensiAPI.Post("/media-publikasi/sync", ctrl.SyncMediaPublikasi)
		referensiAPI.Post("/skim-kegiatan/sync", ctrl.SyncSkimKegiatan)
		referensiAPI.Post("/status-kepegawaian/sync", ctrl.SyncStatusKepegawaian)
		referensiAPI.Post("/sumber-gaji/sync", ctrl.SyncSumberGaji)
		referensiAPI.Post("/tingkat-penghargaan/sync", ctrl.SyncTingkatPenghargaan)
		referensiAPI.Post("/wilayah/sync", ctrl.SyncWilayah)
		referensiAPI.Post("/kategori-capaian-luaran/sync", ctrl.SyncKategoriCapaianLuaran)
		referensiAPI.Post("/kategori-kegiatan/sync", ctrl.SyncKategoriKegiatan)
		referensiAPI.Post("/kelompok-bidang/sync", ctrl.SyncKelompokBidang)
		referensiAPI.Post("/lembaga-sertifikasi/sync", ctrl.SyncLembagaSertifikasi)
		referensiAPI.Post("/golongan-pangkat/sync", ctrl.SyncGolonganPangkat)
		referensiAPI.Post("/ikatan-kerja/sync", ctrl.SyncIkatanKerja)
		referensiAPI.Post("/jenis-penghargaan/sync", ctrl.SyncJenisPenghargaan)
		referensiAPI.Post("/jenis-pekerjaan/sync", ctrl.SyncJenisPekerjaan)
		referensiAPI.Post("/unit-kerja/sync", ctrl.SyncUnitKerjaFromSister)
		referensiAPI.Post("/batch-sync", ctrl.BatchSyncFromSister)

		// GET routes (also protected with JWT)
		// Agama routes
		agamaRouter := referensiAPI.Group("/agama")
		{
			agamaRouter.Get("/", ctrl.GetAllAgama)
			agamaRouter.Get("/:id", ctrl.GetAgamaByID)
		}

		// Negara routes
		negaraRouter := referensiAPI.Group("/negara")
		{
			negaraRouter.Get("/", ctrl.GetAllNegara)
			negaraRouter.Get("/:id", ctrl.GetNegaraByID)
		}

		// Jenjang Pendidikan routes
		jenjangRouter := referensiAPI.Group("/jenjang-pendidikan")
		{
			jenjangRouter.Get("/", ctrl.GetAllJenjangPendidikan)
		}

		// Gelar Akademik routes
		gelarRouter := referensiAPI.Group("/gelar-akademik")
		{
			gelarRouter.Get("/", ctrl.GetAllGelarAkademik)
		}

		// Semester routes
		semesterRouter := referensiAPI.Group("/semester")
		{
			semesterRouter.Get("/", ctrl.GetAllSemester)
		}

		// ==================== NEW 29 ENDPOINTS ====================

		// Bidang Studi routes
		bidangStudiRouter := referensiAPI.Group("/bidang-studi")
		{
			bidangStudiRouter.Get("/", ctrl.GetAllBidangStudi)
		}

		// Bidang Usaha routes
		bidangUsahaRouter := referensiAPI.Group("/bidang-usaha")
		{
			bidangUsahaRouter.Get("/", ctrl.GetAllBidangUsaha)
		}

		// Jabatan Fungsional routes
		jabatanFungsionalRouter := referensiAPI.Group("/jabatan-fungsional")
		{
			jabatanFungsionalRouter.Get("/", ctrl.GetAllJabatanFungsional)
		}

		// Jabatan Tugas Tambahan routes
		jabatanTugasTambahanRouter := referensiAPI.Group("/jabatan-tugas-tambahan")
		{
			jabatanTugasTambahanRouter.Get("/", ctrl.GetAllJabatanTugasTambahan)
		}

		// Jenis Bahan Ajar routes
		jenisBahanAjarRouter := referensiAPI.Group("/jenis-bahan-ajar")
		{
			jenisBahanAjarRouter.Get("/", ctrl.GetAllJenisBahanAjar)
		}

		// Jenis Beasiswa routes
		jenisBeasiswaRouter := referensiAPI.Group("/jenis-beasiswa")
		{
			jenisBeasiswaRouter.Get("/", ctrl.GetAllJenisBeasiswa)
		}

		// Jenis Diklat routes
		jenisDiklatRouter := referensiAPI.Group("/jenis-diklat")
		{
			jenisDiklatRouter.Get("/", ctrl.GetAllJenisDiklat)
		}

		// Jenis Dokumen routes
		jenisDokumenRouter := referensiAPI.Group("/jenis-dokumen")
		{
			jenisDokumenRouter.Get("/", ctrl.GetAllJenisDokumen)
		}

		// Jenis Keluar routes
		jenisKeluarRouter := referensiAPI.Group("/jenis-keluar")
		{
			jenisKeluarRouter.Get("/", ctrl.GetAllJenisKeluar)
		}

		// Jenis Kepanitiaan routes
		jenisKepanitiaanRouter := referensiAPI.Group("/jenis-kepanitiaan")
		{
			jenisKepanitiaanRouter.Get("/", ctrl.GetAllJenisKepanitiaan)
		}

		// Jenis Kesejahteraan routes
		jenisKesejahteraanRouter := referensiAPI.Group("/jenis-kesejahteraan")
		{
			jenisKesejahteraanRouter.Get("/", ctrl.GetAllJenisKesejahteraan)
		}

		// Jenis Publikasi routes
		jenisPublikasiRouter := referensiAPI.Group("/jenis-publikasi")
		{
			jenisPublikasiRouter.Get("/", ctrl.GetAllJenisPublikasi)
		}

		// Jenis Tes routes
		jenisTesRouter := referensiAPI.Group("/jenis-tes")
		{
			jenisTesRouter.Get("/", ctrl.GetAllJenisTes)
		}

		// Jenis Tunjangan routes
		jenisTunjanganRouter := referensiAPI.Group("/jenis-tunjangan")
		{
			jenisTunjanganRouter.Get("/", ctrl.GetAllJenisTunjangan)
		}

		// Media Publikasi routes
		mediaPublikasiRouter := referensiAPI.Group("/media-publikasi")
		{
			mediaPublikasiRouter.Get("/", ctrl.GetAllMediaPublikasi)
		}

		// Skim Kegiatan routes
		skimKegiatanRouter := referensiAPI.Group("/skim-kegiatan")
		{
			skimKegiatanRouter.Get("/", ctrl.GetAllSkimKegiatan)
		}

		// Status Kepegawaian routes
		statusKepegawaianRouter := referensiAPI.Group("/status-kepegawaian")
		{
			statusKepegawaianRouter.Get("/", ctrl.GetAllStatusKepegawaian)
		}

		// Sumber Gaji routes
		sumberGajiRouter := referensiAPI.Group("/sumber-gaji")
		{
			sumberGajiRouter.Get("/", ctrl.GetAllSumberGaji)
		}

		// Tingkat Penghargaan routes
		tingkatPenghargaanRouter := referensiAPI.Group("/tingkat-penghargaan")
		{
			tingkatPenghargaanRouter.Get("/", ctrl.GetAllTingkatPenghargaan)
		}

		// Wilayah routes
		wilayahRouter := referensiAPI.Group("/wilayah")
		{
			wilayahRouter.Get("/", ctrl.GetAllWilayah)
		}

		// Kategori Capaian Luaran routes
		kategoriCapaianLuaranRouter := referensiAPI.Group("/kategori-capaian-luaran")
		{
			kategoriCapaianLuaranRouter.Get("/", ctrl.GetAllKategoriCapaianLuaran)
		}

		// Kategori Kegiatan routes
		kategoriKegiatanRouter := referensiAPI.Group("/kategori-kegiatan")
		{
			kategoriKegiatanRouter.Get("/", ctrl.GetAllKategoriKegiatan)
		}

		// Kelompok Bidang routes
		kelompokBidangRouter := referensiAPI.Group("/kelompok-bidang")
		{
			kelompokBidangRouter.Get("/", ctrl.GetAllKelompokBidang)
		}

		// Lembaga Sertifikasi routes
		lembagaSertifikasiRouter := referensiAPI.Group("/lembaga-sertifikasi")
		{
			lembagaSertifikasiRouter.Get("/", ctrl.GetAllLembagaSertifikasi)
		}

		// Golongan Pangkat routes
		golonganPangkatRouter := referensiAPI.Group("/golongan-pangkat")
		{
			golonganPangkatRouter.Get("/", ctrl.GetAllGolonganPangkat)
		}

		// Ikatan Kerja routes
		ikatanKerjaRouter := referensiAPI.Group("/ikatan-kerja")
		{
			ikatanKerjaRouter.Get("/", ctrl.GetAllIkatanKerja)
		}

		// Jenis Penghargaan routes
		jenisPenghargaanRouter := referensiAPI.Group("/jenis-penghargaan")
		{
			jenisPenghargaanRouter.Get("/", ctrl.GetAllJenisPenghargaan)
		}

		// Jenis Pekerjaan routes
		jenisPekerjaanRouter := referensiAPI.Group("/jenis-pekerjaan")
		{
			jenisPekerjaanRouter.Get("/", ctrl.GetAllJenisPekerjaan)
		}

		// Unit Kerja routes
		unitKerjaRouter := referensiAPI.Group("/unit-kerja")
		{
			unitKerjaRouter.Get("/", ctrl.GetAllUnitKerja)
			unitKerjaRouter.Get("/:id", ctrl.GetUnitKerjaByID)
		}

		// Metadata route
		referensiAPI.Get("/metadata", ctrl.GetAllReferensiMetadata)
	}

	return svc
}
