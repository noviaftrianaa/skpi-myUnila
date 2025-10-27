package referensi

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"sister-service/apps/logger"
	"sister-service/external/sister_api"
)

// Init initializes referensi routes
func Init(router fiber.Router, db *sqlx.DB, sisterAPI *sister_api.Client, loggerSvc logger.Service) {
	repo := NewRepository(db)
	svc := NewService(repo, sisterAPI, loggerSvc)
	ctrl := NewController(svc)

	// TEMPORARY: All auth middleware disabled for testing
	// TODO: Re-enable auth before production
	referensiRouter := router.Group("/referensi")
	// referensiRouter.Use(middleware.KongAuth())           // DISABLED for testing
	// referensiRouter.Use(middleware.RequireDeveloper())   // DISABLED for testing
	{
		// Agama routes
		agamaRouter := referensiRouter.Group("/agama")
		{
			agamaRouter.Get("/", ctrl.GetAllAgama)
			agamaRouter.Get("/:id", ctrl.GetAgamaByID)
			agamaRouter.Post("/sync", ctrl.SyncAgamaFromSister)
		}

		// Negara routes
		negaraRouter := referensiRouter.Group("/negara")
		{
			negaraRouter.Get("/", ctrl.GetAllNegara)
			negaraRouter.Get("/:id", ctrl.GetNegaraByID)
			negaraRouter.Post("/sync", ctrl.SyncNegaraFromSister)
		}

		// Jenjang Pendidikan routes
		jenjangRouter := referensiRouter.Group("/jenjang-pendidikan")
		{
			jenjangRouter.Get("/", ctrl.GetAllJenjangPendidikan)
			jenjangRouter.Post("/sync", ctrl.SyncJenjangPendidikanFromSister)
		}

		// Gelar Akademik routes
		gelarRouter := referensiRouter.Group("/gelar-akademik")
		{
			gelarRouter.Get("/", ctrl.GetAllGelarAkademik)
			gelarRouter.Post("/sync", ctrl.SyncGelarAkademikFromSister)
		}

		// Semester routes
		semesterRouter := referensiRouter.Group("/semester")
		{
			semesterRouter.Get("/", ctrl.GetAllSemester)
			semesterRouter.Post("/sync", ctrl.SyncSemesterFromSister)
		}

		// ==================== NEW 29 ENDPOINTS ====================

		// Bidang Studi routes
		bidangStudiRouter := referensiRouter.Group("/bidang-studi")
		{
			bidangStudiRouter.Get("/", ctrl.GetAllBidangStudi)
			bidangStudiRouter.Post("/sync", ctrl.SyncBidangStudi)
		}

		// Bidang Usaha routes
		bidangUsahaRouter := referensiRouter.Group("/bidang-usaha")
		{
			bidangUsahaRouter.Get("/", ctrl.GetAllBidangUsaha)
			bidangUsahaRouter.Post("/sync", ctrl.SyncBidangUsaha)
		}

		// Jabatan Fungsional routes
		jabatanFungsionalRouter := referensiRouter.Group("/jabatan-fungsional")
		{
			jabatanFungsionalRouter.Get("/", ctrl.GetAllJabatanFungsional)
			jabatanFungsionalRouter.Post("/sync", ctrl.SyncJabatanFungsional)
		}

		// Jabatan Tugas Tambahan routes
		jabatanTugasTambahanRouter := referensiRouter.Group("/jabatan-tugas-tambahan")
		{
			jabatanTugasTambahanRouter.Get("/", ctrl.GetAllJabatanTugasTambahan)
			jabatanTugasTambahanRouter.Post("/sync", ctrl.SyncJabatanTugasTambahan)
		}

		// Jenis Bahan Ajar routes
		jenisBahanAjarRouter := referensiRouter.Group("/jenis-bahan-ajar")
		{
			jenisBahanAjarRouter.Get("/", ctrl.GetAllJenisBahanAjar)
			jenisBahanAjarRouter.Post("/sync", ctrl.SyncJenisBahanAjar)
		}

		// Jenis Beasiswa routes
		jenisBeasiswaRouter := referensiRouter.Group("/jenis-beasiswa")
		{
			jenisBeasiswaRouter.Get("/", ctrl.GetAllJenisBeasiswa)
			jenisBeasiswaRouter.Post("/sync", ctrl.SyncJenisBeasiswa)
		}

		// Jenis Diklat routes
		jenisDiklatRouter := referensiRouter.Group("/jenis-diklat")
		{
			jenisDiklatRouter.Get("/", ctrl.GetAllJenisDiklat)
			jenisDiklatRouter.Post("/sync", ctrl.SyncJenisDiklat)
		}

		// Jenis Dokumen routes
		jenisDokumenRouter := referensiRouter.Group("/jenis-dokumen")
		{
			jenisDokumenRouter.Get("/", ctrl.GetAllJenisDokumen)
			jenisDokumenRouter.Post("/sync", ctrl.SyncJenisDokumen)
		}

		// Jenis Keluar routes
		jenisKeluarRouter := referensiRouter.Group("/jenis-keluar")
		{
			jenisKeluarRouter.Get("/", ctrl.GetAllJenisKeluar)
			jenisKeluarRouter.Post("/sync", ctrl.SyncJenisKeluar)
		}

		// Jenis Kepanitiaan routes
		jenisKepanitiaanRouter := referensiRouter.Group("/jenis-kepanitiaan")
		{
			jenisKepanitiaanRouter.Get("/", ctrl.GetAllJenisKepanitiaan)
			jenisKepanitiaanRouter.Post("/sync", ctrl.SyncJenisKepanitiaan)
		}

		// Jenis Kesejahteraan routes
		jenisKesejahteraanRouter := referensiRouter.Group("/jenis-kesejahteraan")
		{
			jenisKesejahteraanRouter.Get("/", ctrl.GetAllJenisKesejahteraan)
			jenisKesejahteraanRouter.Post("/sync", ctrl.SyncJenisKesejahteraan)
		}

		// Jenis Publikasi routes
		jenisPublikasiRouter := referensiRouter.Group("/jenis-publikasi")
		{
			jenisPublikasiRouter.Get("/", ctrl.GetAllJenisPublikasi)
			jenisPublikasiRouter.Post("/sync", ctrl.SyncJenisPublikasi)
		}

		// Jenis Tes routes
		jenisTesRouter := referensiRouter.Group("/jenis-tes")
		{
			jenisTesRouter.Get("/", ctrl.GetAllJenisTes)
			jenisTesRouter.Post("/sync", ctrl.SyncJenisTes)
		}

		// Jenis Tunjangan routes
		jenisTunjanganRouter := referensiRouter.Group("/jenis-tunjangan")
		{
			jenisTunjanganRouter.Get("/", ctrl.GetAllJenisTunjangan)
			jenisTunjanganRouter.Post("/sync", ctrl.SyncJenisTunjangan)
		}

		// Media Publikasi routes
		mediaPublikasiRouter := referensiRouter.Group("/media-publikasi")
		{
			mediaPublikasiRouter.Get("/", ctrl.GetAllMediaPublikasi)
			mediaPublikasiRouter.Post("/sync", ctrl.SyncMediaPublikasi)
		}

		// Skim Kegiatan routes
		skimKegiatanRouter := referensiRouter.Group("/skim-kegiatan")
		{
			skimKegiatanRouter.Get("/", ctrl.GetAllSkimKegiatan)
			skimKegiatanRouter.Post("/sync", ctrl.SyncSkimKegiatan)
		}

		// Status Kepegawaian routes
		statusKepegawaianRouter := referensiRouter.Group("/status-kepegawaian")
		{
			statusKepegawaianRouter.Get("/", ctrl.GetAllStatusKepegawaian)
			statusKepegawaianRouter.Post("/sync", ctrl.SyncStatusKepegawaian)
		}

		// Sumber Gaji routes
		sumberGajiRouter := referensiRouter.Group("/sumber-gaji")
		{
			sumberGajiRouter.Get("/", ctrl.GetAllSumberGaji)
			sumberGajiRouter.Post("/sync", ctrl.SyncSumberGaji)
		}

		// Tingkat Penghargaan routes
		tingkatPenghargaanRouter := referensiRouter.Group("/tingkat-penghargaan")
		{
			tingkatPenghargaanRouter.Get("/", ctrl.GetAllTingkatPenghargaan)
			tingkatPenghargaanRouter.Post("/sync", ctrl.SyncTingkatPenghargaan)
		}

		// Wilayah routes
		wilayahRouter := referensiRouter.Group("/wilayah")
		{
			wilayahRouter.Get("/", ctrl.GetAllWilayah)
			wilayahRouter.Post("/sync", ctrl.SyncWilayah)
		}

		// Kategori Capaian Luaran routes
		kategoriCapaianLuaranRouter := referensiRouter.Group("/kategori-capaian-luaran")
		{
			kategoriCapaianLuaranRouter.Get("/", ctrl.GetAllKategoriCapaianLuaran)
			kategoriCapaianLuaranRouter.Post("/sync", ctrl.SyncKategoriCapaianLuaran)
		}

		// Kategori Kegiatan routes
		kategoriKegiatanRouter := referensiRouter.Group("/kategori-kegiatan")
		{
			kategoriKegiatanRouter.Get("/", ctrl.GetAllKategoriKegiatan)
			kategoriKegiatanRouter.Post("/sync", ctrl.SyncKategoriKegiatan)
		}

		// Kelompok Bidang routes
		kelompokBidangRouter := referensiRouter.Group("/kelompok-bidang")
		{
			kelompokBidangRouter.Get("/", ctrl.GetAllKelompokBidang)
			kelompokBidangRouter.Post("/sync", ctrl.SyncKelompokBidang)
		}

		// Lembaga Sertifikasi routes
		lembagaSertifikasiRouter := referensiRouter.Group("/lembaga-sertifikasi")
		{
			lembagaSertifikasiRouter.Get("/", ctrl.GetAllLembagaSertifikasi)
			lembagaSertifikasiRouter.Post("/sync", ctrl.SyncLembagaSertifikasi)
		}

		// Golongan Pangkat routes
		golonganPangkatRouter := referensiRouter.Group("/golongan-pangkat")
		{
			golonganPangkatRouter.Get("/", ctrl.GetAllGolonganPangkat)
			golonganPangkatRouter.Post("/sync", ctrl.SyncGolonganPangkat)
		}

		// Ikatan Kerja routes
		ikatanKerjaRouter := referensiRouter.Group("/ikatan-kerja")
		{
			ikatanKerjaRouter.Get("/", ctrl.GetAllIkatanKerja)
			ikatanKerjaRouter.Post("/sync", ctrl.SyncIkatanKerja)
		}

		// Jenis Penghargaan routes
		jenisPenghargaanRouter := referensiRouter.Group("/jenis-penghargaan")
		{
			jenisPenghargaanRouter.Get("/", ctrl.GetAllJenisPenghargaan)
			jenisPenghargaanRouter.Post("/sync", ctrl.SyncJenisPenghargaan)
		}

		// Jenis Pekerjaan routes
		jenisPekerjaanRouter := referensiRouter.Group("/jenis-pekerjaan")
		{
			jenisPekerjaanRouter.Get("/", ctrl.GetAllJenisPekerjaan)
			jenisPekerjaanRouter.Post("/sync", ctrl.SyncJenisPekerjaan)
		}

	// Bidang Pekerjaan routes - REMOVED as per user request
// 		// Bidang Pekerjaan routes
// 		bidangPekerjaanRouter := referensiRouter.Group("/bidang-pekerjaan")
// 		{
// 			bidangPekerjaanRouter.Get("/", ctrl.GetAllBidangPekerjaan)
// 			bidangPekerjaanRouter.Post("/sync", ctrl.SyncBidangPekerjaan)
// 		}

		// Metadata & Batch Sync routes
		referensiRouter.Get("/metadata", ctrl.GetAllReferensiMetadata)
		referensiRouter.Post("/batch-sync", ctrl.BatchSyncFromSister)
	}
}
