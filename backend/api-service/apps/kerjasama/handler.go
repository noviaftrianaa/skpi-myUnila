package kerjasama

import (
	"errors"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/internal/response"
)

type Handler struct{ svc Service }

func NewHandler(s Service) *Handler { return &Handler{svc: s} }

// ---------- mou ----------

func (h *Handler) ListMou(c *fiber.Ctx) error {
	var p MouParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListMou(c.Context(), p)
	if err != nil {
		log.Printf("list mou: %v", err)
		return response.InternalError(c, "Gagal mengambil data MOU")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data MOU", data, p.Page, p.Limit, total)
}

func (h *Handler) GetMou(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetMou(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "MOU tidak ditemukan")
	}
	if err != nil {
		log.Printf("get mou: %v", err)
		return response.InternalError(c, "Gagal mengambil detail MOU")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) CreateMou(c *fiber.Ctx) error {
	var in MouCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDSp == "" || in.SkMou == "" || in.JudulMou == "" || in.NmDudi == "" || in.NmBu == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_sp, sk_mou, judul_mou, tgl_mulai, tgl_selesai, nm_dudi, nm_bu, id_creator",
		})
	}
	id, err := h.svc.CreateMou(c.Context(), in)
	if err != nil {
		log.Printf("create mou: %v", err)
		return response.InternalError(c, "Gagal menyimpan MOU")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "MOU berhasil disimpan", fiber.Map{"id_mou": id})
}

func (h *Handler) UpdateMou(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in MouUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateMou(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "MOU tidak ditemukan")
		}
		log.Printf("update mou: %v", err)
		return response.InternalError(c, "Gagal memperbarui MOU")
	}
	return response.Success(c, "MOU berhasil diperbarui", fiber.Map{"id_mou": id})
}

func (h *Handler) DeleteMou(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpdater := extractUpdater(c)
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteMou(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "MOU tidak ditemukan")
		}
		log.Printf("delete mou: %v", err)
		return response.InternalError(c, "Gagal menghapus MOU")
	}
	return response.Success(c, "MOU berhasil dihapus (soft delete)", fiber.Map{"id_mou": id})
}

// ---------- sms_kerjasama ----------

func (h *Handler) ListSmsKerjasama(c *fiber.Ctx) error {
	var p SmsKerjasamaParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListSmsKerjasama(c.Context(), p)
	if err != nil {
		log.Printf("list sms_kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil data kerjasama prodi")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data kerjasama prodi", data, p.Page, p.Limit, total)
}

func (h *Handler) GetSmsKerjasama(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetSmsKerjasama(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Kerjasama prodi tidak ditemukan")
	}
	if err != nil {
		log.Printf("get sms_kerjasama: %v", err)
		return response.InternalError(c, "Gagal mengambil detail kerjasama prodi")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) CreateSmsKerjasama(c *fiber.Ctx) error {
	var in SmsKerjasamaCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDSms == "" || in.IDMou == "" || in.IDTingkatKerjasama == 0 || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_sms, id_mou, id_tingkat_kerjasama, id_creator",
		})
	}
	id, err := h.svc.CreateSmsKerjasama(c.Context(), in)
	if err != nil {
		log.Printf("create sms_kerjasama: %v", err)
		return response.InternalError(c, "Gagal menyimpan kerjasama prodi")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Kerjasama prodi berhasil disimpan", fiber.Map{"id_sms_kerjasama": id})
}

func (h *Handler) UpdateSmsKerjasama(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in SmsKerjasamaUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateSmsKerjasama(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Kerjasama prodi tidak ditemukan")
		}
		log.Printf("update sms_kerjasama: %v", err)
		return response.InternalError(c, "Gagal memperbarui kerjasama prodi")
	}
	return response.Success(c, "Kerjasama prodi berhasil diperbarui", fiber.Map{"id_sms_kerjasama": id})
}

func (h *Handler) DeleteSmsKerjasama(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpdater := extractUpdater(c)
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteSmsKerjasama(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Kerjasama prodi tidak ditemukan")
		}
		log.Printf("delete sms_kerjasama: %v", err)
		return response.InternalError(c, "Gagal menghapus kerjasama prodi")
	}
	return response.Success(c, "Kerjasama prodi berhasil dihapus (soft delete)", fiber.Map{"id_sms_kerjasama": id})
}

// ---------- dudi ----------

func (h *Handler) ListDudi(c *fiber.Ctx) error {
	var p DudiParams
	if err := c.QueryParser(&p); err != nil {
		return response.BadRequest(c, "Parameter tidak valid", map[string]string{"error": err.Error()})
	}
	data, total, err := h.svc.ListDudi(c.Context(), p)
	if err != nil {
		log.Printf("list dudi: %v", err)
		return response.InternalError(c, "Gagal mengambil data DUDI")
	}
	p.Normalize()
	return response.SuccessWithMeta(c, "Berhasil mengambil data DUDI", data, p.Page, p.Limit, total)
}

func (h *Handler) GetDudi(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetDudi(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "DUDI tidak ditemukan")
	}
	if err != nil {
		log.Printf("get dudi: %v", err)
		return response.InternalError(c, "Gagal mengambil detail DUDI")
	}
	return response.Success(c, "OK", m)
}

func (h *Handler) CreateDudi(c *fiber.Ctx) error {
	var in DudiCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.NmLemb == "" || in.IDWil == "" || in.IDBu == "" || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "nm_lemb, id_wil, id_bu, id_creator",
		})
	}
	id, err := h.svc.CreateDudi(c.Context(), in)
	if err != nil {
		log.Printf("create dudi: %v", err)
		return response.InternalError(c, "Gagal menyimpan DUDI")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "DUDI berhasil disimpan", fiber.Map{"id_dudi": id})
}

func (h *Handler) UpdateDudi(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in DudiUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdateDudi(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "DUDI tidak ditemukan")
		}
		log.Printf("update dudi: %v", err)
		return response.InternalError(c, "Gagal memperbarui DUDI")
	}
	return response.Success(c, "DUDI berhasil diperbarui", fiber.Map{"id_dudi": id})
}

func (h *Handler) DeleteDudi(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	idUpdater := extractUpdater(c)
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeleteDudi(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "DUDI tidak ditemukan")
		}
		log.Printf("delete dudi: %v", err)
		return response.InternalError(c, "Gagal menghapus DUDI")
	}
	return response.Success(c, "DUDI berhasil dihapus (soft delete)", fiber.Map{"id_dudi": id})
}

func extractUpdater(c *fiber.Ctx) string {
	var body DeleteBody
	_ = c.BodyParser(&body)
	if body.IDUpdater != "" {
		return body.IDUpdater
	}
	return strings.TrimSpace(c.Query("id_updater"))
}
