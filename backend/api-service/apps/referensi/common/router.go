package common

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/redis/go-redis/v9"
)

// RegisterRoutes mendaftarkan routes untuk common referensi
func RegisterRoutes(router fiber.Router, db *sqlx.DB, redis *redis.Client) {
	// Init layers
	repo := NewRepository(db)
	svc := NewService(repo, redis)
	handler := NewHandler(svc)

	// Register routes
	router.Get("/semester", handler.GetSemesters)
	router.Get("/tahun_ajaran", handler.GetTahunAjarans)
	router.Get("/agama", handler.GetAgamas)
	router.Get("/wilayah", handler.GetWilayahs)
	router.Get("/aktifitas_kerjasama", handler.GetAktifitasKerjasama)
	router.Get("/basis_evaluasi", handler.GetBasisEvaluasi)
	router.Get("/fungsi_lab", handler.GetFungsiLab)
	router.Get("/gelar_akademik", handler.GetGelarAkademik)
	router.Get("/ikatan_kerja_sdm", handler.GetIkatanKerjaSdm)
	router.Get("/jalur_daftar", handler.GetJalurDaftar)
	router.Get("/jenjang_pendidikan", handler.GetJenjangPendidikan)
	router.Get("/jurusan", handler.GetJurusan)
	// New routes
	router.Get("/kbli", handler.GetKbli)
	router.Get("/keahlian_lab", handler.GetKeahlianLab)
	router.Get("/kebutuhan_khusus", handler.GetKebutuhanKhusus)
	router.Get("/kriteria_mitra", handler.GetKriteriaMitra)
	router.Get("/level_wilayah", handler.GetLevelWilayah)
	router.Get("/media_publikasi", handler.GetMediaPublikasi)
	router.Get("/negara", handler.GetNegara)
	router.Get("/nilai_akred", handler.GetNilaiAkred)
	router.Get("/pangkat_golongan", handler.GetPangkatGolongan)
	router.Get("/pekerjaan", handler.GetPekerjaan)
	router.Get("/pembiayaan", handler.GetPembiayaan)
	router.Get("/penghasilan", handler.GetPenghasilan)
	router.Get("/satuan", handler.GetSatuan)
	router.Get("/tahun_anggaran", handler.GetTahunAnggaran)
	router.Get("/tse", handler.GetTse)
	router.Get("/skim_kegiatan", handler.GetSkimKegiatan)
}
