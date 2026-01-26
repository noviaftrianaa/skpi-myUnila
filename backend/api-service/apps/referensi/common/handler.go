package common

import (
	"log"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/apps/referensi/types"
	"github.com/myunila/api-service/internal/response"
)

type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetSemesters returns list of semesters with pagination
func (h *Handler) GetSemesters(c *fiber.Ctx) error {
	var params types.SemesterParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSemesters(c.Context(), params)
	if err != nil {
		log.Printf("Error getting semesters: %v", err)
		return response.InternalError(c, "Gagal mengambil data semester")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data semester", data, params.Page, params.Limit, total)
}

// GetTahunAjarans returns list of tahun ajaran with pagination
func (h *Handler) GetTahunAjarans(c *fiber.Ctx) error {
	var params types.TahunAjaranParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetTahunAjarans(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tahun ajaran: %v", err)
		return response.InternalError(c, "Gagal mengambil data tahun ajaran")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tahun ajaran", data, params.Page, params.Limit, total)
}

// GetAgamas returns list of agama with pagination
func (h *Handler) GetAgamas(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetAgamas(c.Context(), params)
	if err != nil {
		log.Printf("Error getting agama: %v", err)
		return response.InternalError(c, "Gagal mengambil data agama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data agama", data, params.Page, params.Limit, total)
}

// GetWilayahs returns list of wilayah with pagination
func (h *Handler) GetWilayahs(c *fiber.Ctx) error {
	var params types.WilayahParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetWilayahs(c.Context(), params)
	if err != nil {
		log.Printf("Error getting wilayah: %v", err)
		return response.InternalError(c, "Gagal mengambil data wilayah")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data wilayah", data, params.Page, params.Limit, total)
}

// GetAktifitasKerjasama returns list of aktifitas kerjasama with pagination
func (h *Handler) GetAktifitasKerjasama(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetAktifitasKerjasama(c.Context(), params)
	if err != nil {
		log.Printf("Error getting aktifitas kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil data aktifitas kerjasama")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data aktifitas kerjasama", data, params.Page, params.Limit, total)
}

// GetBasisEvaluasi returns list of basis evaluasi with pagination
func (h *Handler) GetBasisEvaluasi(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetBasisEvaluasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting basis evaluasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data basis evaluasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data basis evaluasi", data, params.Page, params.Limit, total)
}

// GetFungsiLab returns list of fungsi lab with pagination
func (h *Handler) GetFungsiLab(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetFungsiLab(c.Context(), params)
	if err != nil {
		log.Printf("Error getting fungsi lab: %v", err)
		return response.InternalError(c, "Gagal mengambil data fungsi lab")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data fungsi lab", data, params.Page, params.Limit, total)
}

// GetGelarAkademik returns list of gelar akademik with pagination
func (h *Handler) GetGelarAkademik(c *fiber.Ctx) error {
	var params types.GelarAkademikParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetGelarAkademik(c.Context(), params)
	if err != nil {
		log.Printf("Error getting gelar akademik: %v", err)
		return response.InternalError(c, "Gagal mengambil data gelar akademik")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data gelar akademik", data, params.Page, params.Limit, total)
}

// GetIkatanKerjaSdm returns list of ikatan kerja SDM with pagination
func (h *Handler) GetIkatanKerjaSdm(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetIkatanKerjaSdm(c.Context(), params)
	if err != nil {
		log.Printf("Error getting ikatan kerja SDM: %v", err)
		return response.InternalError(c, "Gagal mengambil data ikatan kerja SDM")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data ikatan kerja SDM", data, params.Page, params.Limit, total)
}

// GetJalurDaftar returns list of jalur daftar with pagination
func (h *Handler) GetJalurDaftar(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJalurDaftar(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jalur daftar: %v", err)
		return response.InternalError(c, "Gagal mengambil data jalur daftar")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jalur daftar", data, params.Page, params.Limit, total)
}

// GetJenjangPendidikan returns list of jenjang pendidikan with pagination
func (h *Handler) GetJenjangPendidikan(c *fiber.Ctx) error {
	var params types.JenjangPendidikanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJenjangPendidikan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jenjang pendidikan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jenjang pendidikan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jenjang pendidikan", data, params.Page, params.Limit, total)
}

// GetJurusan returns list of jurusan with pagination
func (h *Handler) GetJurusan(c *fiber.Ctx) error {
	var params types.JurusanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetJurusan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting jurusan: %v", err)
		return response.InternalError(c, "Gagal mengambil data jurusan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data jurusan", data, params.Page, params.Limit, total)
}

// ============================================================================
// Kbli
// ============================================================================

func (h *Handler) GetKbli(c *fiber.Ctx) error {
	var params types.KbliParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKbli(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kbli: %v", err)
		return response.InternalError(c, "Gagal mengambil data kbli")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kbli", data, params.Page, params.Limit, total)
}

// ============================================================================
// KeahlianLab
// ============================================================================

func (h *Handler) GetKeahlianLab(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKeahlianLab(c.Context(), params)
	if err != nil {
		log.Printf("Error getting keahlian lab: %v", err)
		return response.InternalError(c, "Gagal mengambil data keahlian lab")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data keahlian lab", data, params.Page, params.Limit, total)
}

// ============================================================================
// KebutuhanKhusus
// ============================================================================

func (h *Handler) GetKebutuhanKhusus(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKebutuhanKhusus(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kebutuhan khusus: %v", err)
		return response.InternalError(c, "Gagal mengambil data kebutuhan khusus")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kebutuhan khusus", data, params.Page, params.Limit, total)
}

// ============================================================================
// KriteriaMitra
// ============================================================================

func (h *Handler) GetKriteriaMitra(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetKriteriaMitra(c.Context(), params)
	if err != nil {
		log.Printf("Error getting kriteria mitra: %v", err)
		return response.InternalError(c, "Gagal mengambil data kriteria mitra")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kriteria mitra", data, params.Page, params.Limit, total)
}

// ============================================================================
// LevelWilayah
// ============================================================================

func (h *Handler) GetLevelWilayah(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetLevelWilayah(c.Context(), params)
	if err != nil {
		log.Printf("Error getting level wilayah: %v", err)
		return response.InternalError(c, "Gagal mengambil data level wilayah")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data level wilayah", data, params.Page, params.Limit, total)
}

// ============================================================================
// MediaPublikasi
// ============================================================================

func (h *Handler) GetMediaPublikasi(c *fiber.Ctx) error {
	var params types.MediaPublikasiParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetMediaPublikasi(c.Context(), params)
	if err != nil {
		log.Printf("Error getting media publikasi: %v", err)
		return response.InternalError(c, "Gagal mengambil data media publikasi")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data media publikasi", data, params.Page, params.Limit, total)
}

// ============================================================================
// Negara
// ============================================================================

func (h *Handler) GetNegara(c *fiber.Ctx) error {
	var params types.NegaraParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetNegara(c.Context(), params)
	if err != nil {
		log.Printf("Error getting negara: %v", err)
		return response.InternalError(c, "Gagal mengambil data negara")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data negara", data, params.Page, params.Limit, total)
}

// ============================================================================
// NilaiAkred
// ============================================================================

func (h *Handler) GetNilaiAkred(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetNilaiAkred(c.Context(), params)
	if err != nil {
		log.Printf("Error getting nilai akred: %v", err)
		return response.InternalError(c, "Gagal mengambil data nilai akred")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data nilai akred", data, params.Page, params.Limit, total)
}

// ============================================================================
// PangkatGolongan
// ============================================================================

func (h *Handler) GetPangkatGolongan(c *fiber.Ctx) error {
	var params types.PangkatGolonganParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPangkatGolongan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting pangkat golongan: %v", err)
		return response.InternalError(c, "Gagal mengambil data pangkat golongan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pangkat golongan", data, params.Page, params.Limit, total)
}

// ============================================================================
// Pembiayaan
// ============================================================================

func (h *Handler) GetPembiayaan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPembiayaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting pembiayaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data pembiayaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pembiayaan", data, params.Page, params.Limit, total)
}

// ============================================================================
// Pekerjaan
// ============================================================================

func (h *Handler) GetPekerjaan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPekerjaan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting pekerjaan: %v", err)
		return response.InternalError(c, "Gagal mengambil data pekerjaan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data pekerjaan", data, params.Page, params.Limit, total)
}

// ============================================================================
// Penghasilan
// ============================================================================

func (h *Handler) GetPenghasilan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetPenghasilan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting penghasilan: %v", err)
		return response.InternalError(c, "Gagal mengambil data penghasilan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data penghasilan", data, params.Page, params.Limit, total)
}

// ============================================================================
// Satuan
// ============================================================================

func (h *Handler) GetSatuan(c *fiber.Ctx) error {
	var params types.PaginationParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSatuan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting satuan: %v", err)
		return response.InternalError(c, "Gagal mengambil data satuan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data satuan", data, params.Page, params.Limit, total)
}

// ============================================================================
// TahunAnggaran
// ============================================================================

func (h *Handler) GetTahunAnggaran(c *fiber.Ctx) error {
	var params types.TahunAnggaranParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetTahunAnggaran(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tahun anggaran: %v", err)
		return response.InternalError(c, "Gagal mengambil data tahun anggaran")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tahun anggaran", data, params.Page, params.Limit, total)
}

// ============================================================================
// Tse
// ============================================================================

func (h *Handler) GetTse(c *fiber.Ctx) error {
	var params types.TseParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetTse(c.Context(), params)
	if err != nil {
		log.Printf("Error getting tse: %v", err)
		return response.InternalError(c, "Gagal mengambil data tse")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data tse", data, params.Page, params.Limit, total)
}

// ============================================================================
// SkimKegiatan
// ============================================================================

func (h *Handler) GetSkimKegiatan(c *fiber.Ctx) error {
	var params types.SkimKegiatanParams
	if err := c.QueryParser(&params); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}

	data, total, err := h.svc.GetSkimKegiatan(c.Context(), params)
	if err != nil {
		log.Printf("Error getting skim kegiatan: %v", err)
		return response.InternalError(c, "Gagal mengambil data skim kegiatan")
	}

	params.NormalizePagination()
	return response.SuccessWithMeta(c, "Berhasil mengambil data skim kegiatan", data, params.Page, params.Limit, total)
}
