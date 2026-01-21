package referensi

// import (
// 	"log"

// 	"github.com/gofiber/fiber/v2"
// 	"github.com/myunila/api-service/internal/response"
// )

// // Handler menangani HTTP request untuk referensi
// type Handler struct {
// 	svc Service
// }

// // NewHandler membuat instance handler baru
// func NewHandler(svc Service) *Handler {
// 	return &Handler{svc: svc}
// }

// // GetSemesters returns list of semesters with pagination
// func (h *Handler) GetSemesters(c *fiber.Ctx) error {
// 	var params SemesterParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	semesters, total, err := h.svc.GetSemesters(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting semesters: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data semester")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data semester", semesters, params.Page, params.Limit, total)
// }

// // GetTahunAjarans returns list of academic years with pagination
// func (h *Handler) GetTahunAjarans(c *fiber.Ctx) error {
// 	var params TahunAjaranParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	tahunAjarans, total, err := h.svc.GetTahunAjarans(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting tahun_ajaran: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data tahun ajaran")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data tahun ajaran", tahunAjarans, params.Page, params.Limit, total)
// }

// // GetAgamas returns list of religions with pagination
// func (h *Handler) GetAgamas(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	agamas, total, err := h.svc.GetAgamas(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting agama: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data agama")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data agama", agamas, params.Page, params.Limit, total)
// }

// // GetWilayahs returns list of regions with pagination and level filter
// func (h *Handler) GetWilayahs(c *fiber.Ctx) error {
// 	var params WilayahParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	wilayahs, total, err := h.svc.GetWilayahs(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting wilayah: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data wilayah")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data wilayah", wilayahs, params.Page, params.Limit, total)
// }

// // GetAktifitasKerjasama returns list of aktifitas kerjasama with pagination
// func (h *Handler) GetAktifitasKerjasama(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetAktifitasKerjasama(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting aktifitas kerjasama: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data aktifitas kerjasama")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data aktifitas kerjasama", data, params.Page, params.Limit, total)
// }

// // GetBasisEvaluasi returns list of basis evaluasi with pagination
// func (h *Handler) GetBasisEvaluasi(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetBasisEvaluasi(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting basis evaluasi: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data basis evaluasi")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data basis evaluasi", data, params.Page, params.Limit, total)
// }

// // GetBentukKegiatanKerjasama returns list of bentuk kegiatan kerjasama with pagination
// func (h *Handler) GetBentukKegiatanKerjasama(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetBentukKegiatanKerjasama(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting bentuk kegiatan kerjasama: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data bentuk kegiatan kerjasama")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data bentuk kegiatan kerjasama", data, params.Page, params.Limit, total)
// }

// // GetBentukPendidikan returns list of bentuk pendidikan with pagination
// func (h *Handler) GetBentukPendidikan(c *fiber.Ctx) error {
// 	var params BentukPendidikanParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetBentukPendidikan(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting bentuk pendidikan: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data bentuk pendidikan")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data bentuk pendidikan", data, params.Page, params.Limit, total)
// }

// // GetBidangKerjasama returns list of bidang kerjasama with pagination
// func (h *Handler) GetBidangKerjasama(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetBidangKerjasama(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting bidang kerjasama: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data bidang kerjasama")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang kerjasama", data, params.Page, params.Limit, total)
// }

// // GetBidangPekerjaan returns list of bidang pekerjaan with pagination
// func (h *Handler) GetBidangPekerjaan(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetBidangPekerjaan(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting bidang pekerjaan: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data bidang pekerjaan")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang pekerjaan", data, params.Page, params.Limit, total)
// }

// // GetBidangStudi returns list of bidang studi with pagination
// func (h *Handler) GetBidangStudi(c *fiber.Ctx) error {
// 	var params BidangStudiParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	data, total, err := h.svc.GetBidangStudi(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting bidang studi: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data bidang studi")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang studi", data, params.Page, params.Limit, total)
// }

// // GetBidangUsaha returns list of bidang usaha with pagination
// func (h *Handler) GetBidangUsaha(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	bidangUsaha, total, err := h.svc.GetBidangUsaha(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting bidang usaha: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data bidang usaha")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data bidang usaha", bidangUsaha, params.Page, params.Limit, total)
// }

// // GetFungsiLab returns list of fungsi lab with pagination
// func (h *Handler) GetFungsiLab(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	fungsiLab, total, err := h.svc.GetFungsiLab(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting fungsi lab: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data fungsi lab")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data fungsi lab", fungsiLab, params.Page, params.Limit, total)
// }

// // GetGelarAkademik returns list of gelar akademik with pagination
// func (h *Handler) GetGelarAkademik(c *fiber.Ctx) error {
// 	var params GelarAkademikParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	gelarAkademik, total, err := h.svc.GetGelarAkademik(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting gelar akademik: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data gelar akademik")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data gelar akademik", gelarAkademik, params.Page, params.Limit, total)
// }

// // GetIkatanKerjaSdm returns list of ikatan kerja sdm with pagination
// func (h *Handler) GetIkatanKerjaSdm(c *fiber.Ctx) error {
// 	var params PaginationParams
// 	if err := c.QueryParser(&params); err != nil {
// 		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
// 	}

// 	ikatanKerjaSdm, total, err := h.svc.GetIkatanKerjaSdm(c.Context(), params)
// 	if err != nil {
// 		log.Printf("Error getting ikatan kerja sdm: %v", err)
// 		return response.InternalError(c, "Gagal mengambil data ikatan kerja sdm")
// 	}

// 	params.NormalizePagination()
// 	return response.SuccessWithMeta(c, "Berhasil mengambil data ikatan kerja sdm", ikatanKerjaSdm, params.Page, params.Limit, total)
// }
