package tracer

import (
	"errors"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

// ---------- hasil_tracer_study ----------

// GET /v1/tracer/hasil_tracer
func (h *Handler) List(c *fiber.Ctx) error {
	var p HasilTracerParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListHasilTracer(c.Context(), p)
	if err != nil {
		log.Printf("list hasil_tracer: %v", err)
		return response.InternalError(c, "Gagal mengambil data hasil tracer study")
	}
	normT(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data hasil tracer study", data, p.Page, p.Limit, total)
}

// GET /v1/tracer/hasil_tracer/:id
func (h *Handler) Get(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetHasilTracer(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Hasil tracer study tidak ditemukan")
	}
	if err != nil {
		log.Printf("get hasil_tracer: %v", err)
		return response.InternalError(c, "Gagal mengambil detail hasil tracer")
	}
	return response.Success(c, "OK", m)
}

// POST /v1/tracer/hasil_tracer
func (h *Handler) Create(c *fiber.Ctx) error {
	var in HasilTracerCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDRegPd == "" || in.IDThnAjaran == 0 || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_reg_pd, id_thn_ajaran, wkt_pengisian, status_lulusan, id_creator",
		})
	}
	id, err := h.svc.CreateHasilTracer(c.Context(), in)
	if err != nil {
		log.Printf("create hasil_tracer: %v", err)
		return response.InternalError(c, "Gagal menyimpan hasil tracer study")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Hasil tracer study berhasil disimpan", fiber.Map{
		"id_hasil_tracer_study": id,
	})
}

// PUT /v1/tracer/hasil_tracer/:id
func (h *Handler) Update(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in HasilTracerUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateHasilTracer(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Hasil tracer study tidak ditemukan")
		}
		log.Printf("update hasil_tracer: %v", err)
		return response.InternalError(c, "Gagal memperbarui hasil tracer study")
	}
	return response.Success(c, "Hasil tracer study berhasil diperbarui", fiber.Map{
		"id_hasil_tracer_study": id,
	})
}

// DELETE /v1/tracer/hasil_tracer/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var body DeleteBody
	_ = c.BodyParser(&body)
	idUpdater := body.IDUpdater
	if idUpdater == "" {
		idUpdater = strings.TrimSpace(c.Query("id_updater"))
	}
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi (body JSON atau query)", nil)
	}
	if err := h.svc.DeleteHasilTracer(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Hasil tracer study tidak ditemukan")
		}
		log.Printf("delete hasil_tracer: %v", err)
		return response.InternalError(c, "Gagal menghapus hasil tracer study")
	}
	return response.Success(c, "Hasil tracer study berhasil dihapus (soft delete)", fiber.Map{
		"id_hasil_tracer_study": id,
	})
}

// ---------- hasil_tracer_atasan ----------

func (h *Handler) ListAtasan(c *fiber.Ctx) error {
	var p HasilTracerAtasanParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListHasilTracerAtasan(c.Context(), p)
	if err != nil {
		log.Printf("list atasan: %v", err)
		return response.InternalError(c, "Gagal mengambil data hasil tracer atasan")
	}
	normT(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data hasil tracer atasan", data, p.Page, p.Limit, total)
}

func (h *Handler) GetAtasan(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetHasilTracerAtasan(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Hasil tracer atasan tidak ditemukan")
	}
	if err != nil {
		log.Printf("get atasan: %v", err)
		return response.InternalError(c, "Gagal mengambil detail hasil tracer atasan")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) CreateAtasan(c *fiber.Ctx) error {
	var in HasilTracerAtasanCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDHasilTracerStudy == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_hasil_tracer_study, id_creator",
		})
	}
	id, err := h.svc.CreateHasilTracerAtasan(c.Context(), in)
	if err != nil {
		log.Printf("create atasan: %v", err)
		return response.InternalError(c, "Gagal menyimpan hasil tracer atasan")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Hasil tracer atasan berhasil disimpan", fiber.Map{
		"id_hasil_tracer_atasan": id,
	})
}

func (h *Handler) UpdateAtasan(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in HasilTracerAtasanUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateHasilTracerAtasan(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Hasil tracer atasan tidak ditemukan")
		}
		log.Printf("update atasan: %v", err)
		return response.InternalError(c, "Gagal memperbarui hasil tracer atasan")
	}
	return response.Success(c, "Hasil tracer atasan berhasil diperbarui", fiber.Map{
		"id_hasil_tracer_atasan": id,
	})
}

func (h *Handler) DeleteAtasan(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var body DeleteBody
	_ = c.BodyParser(&body)
	idUpdater := body.IDUpdater
	if idUpdater == "" {
		idUpdater = strings.TrimSpace(c.Query("id_updater"))
	}
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteHasilTracerAtasan(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Hasil tracer atasan tidak ditemukan")
		}
		log.Printf("delete atasan: %v", err)
		return response.InternalError(c, "Gagal menghapus hasil tracer atasan")
	}
	return response.Success(c, "Hasil tracer atasan berhasil dihapus (soft delete)", fiber.Map{
		"id_hasil_tracer_atasan": id,
	})
}

// ---------- umr_wilayah (full CRUD) ----------

func (h *Handler) ListUmr(c *fiber.Ctx) error {
	var p UmrWilayahParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListUmrWilayah(c.Context(), p)
	if err != nil {
		log.Printf("list umr: %v", err)
		return response.InternalError(c, "Gagal mengambil data UMR wilayah")
	}
	normT(&p.Page, &p.Limit, &p.Order)
	return response.SuccessWithMeta(c, "Berhasil mengambil data UMR wilayah", data, p.Page, p.Limit, total)
}

func (h *Handler) GetUmr(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetUmrWilayah(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "UMR wilayah tidak ditemukan")
	}
	if err != nil {
		log.Printf("get umr: %v", err)
		return response.InternalError(c, "Gagal mengambil detail UMR wilayah")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) CreateUmr(c *fiber.Ctx) error {
	var in UmrWilayahCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDWil == "" || in.IDTahunAnggaran == 0 || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_wil, id_tahun_anggaran, besaran_umr, id_creator",
		})
	}
	id, err := h.svc.CreateUmrWilayah(c.Context(), in)
	if err != nil {
		log.Printf("create umr: %v", err)
		return response.InternalError(c, "Gagal menyimpan UMR wilayah")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "UMR wilayah berhasil disimpan", fiber.Map{
		"id_umr_wil": id,
	})
}

func (h *Handler) UpdateUmr(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in UmrWilayahUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateUmrWilayah(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "UMR wilayah tidak ditemukan")
		}
		log.Printf("update umr: %v", err)
		return response.InternalError(c, "Gagal memperbarui UMR wilayah")
	}
	return response.Success(c, "UMR wilayah berhasil diperbarui", fiber.Map{"id_umr_wil": id})
}

func (h *Handler) DeleteUmr(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var body DeleteBody
	_ = c.BodyParser(&body)
	idUpdater := body.IDUpdater
	if idUpdater == "" {
		idUpdater = strings.TrimSpace(c.Query("id_updater"))
	}
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteUmrWilayah(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "UMR wilayah tidak ditemukan")
		}
		log.Printf("delete umr: %v", err)
		return response.InternalError(c, "Gagal menghapus UMR wilayah")
	}
	return response.Success(c, "UMR wilayah berhasil dihapus (soft delete)", fiber.Map{"id_umr_wil": id})
}
