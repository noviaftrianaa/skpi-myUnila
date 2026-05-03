package akreditasi

import (
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type Handler struct{ svc Service }

func NewHandler(svc Service) *Handler { return &Handler{svc: svc} }

// GET /akreditasi
func (h *Handler) List(c *fiber.Ctx) error {
	p := AkreditasiListParams{
		Search:      c.Query("search"),
		IDLembAkred: c.Query("id_lemb_akred"),
		IDAkred:     c.Query("id_akred"),
		Page:        atoiDefault(c.Query("page"), 1),
		Limit:       atoiDefault(c.Query("limit"), 50),
		SortBy:      c.Query("sort_by"),
		Order:       c.Query("order"),
	}
	rows, total, err := h.svc.List(c.Context(), p)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success":    true,
		"data":       rows,
		"pagination": fiber.Map{"page": p.Page, "limit": p.Limit, "total": total},
	})
}

// GET /akreditasi/stats
func (h *Handler) Stats(c *fiber.Ctx) error {
	st, err := h.svc.Stats(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": st})
}

// POST /akreditasi/sync — body {"mode":"preview"|"apply"}
func (h *Handler) Sync(c *fiber.Ctx) error {
	var req SyncRequest
	_ = c.BodyParser(&req)
	if req.Mode != "apply" {
		req.Mode = "preview"
	}

	user := getAuthUser(c)
	res, err := h.svc.Sync(c.Context(), req.Mode, user.id, user.username)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
			"data":    res, // tetap balikkan log id supaya UI bisa rekonsiliasi
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": res})
}

// GET /akreditasi/sync-log
func (h *Handler) ListLogs(c *fiber.Ctx) error {
	limit := atoiDefault(c.Query("limit"), 30)
	page := atoiDefault(c.Query("page"), 1)
	offset := (page - 1) * limit

	rows, total, err := h.svc.ListLogs(c.Context(), limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    rows,
		"pagination": fiber.Map{"page": page, "limit": limit, "total": total},
	})
}

// GET /akreditasi/sync-log/:id  → header + grouped detail counts
func (h *Handler) GetLog(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "id is required")
	}
	log, err := h.svc.GetLog(c.Context(), id)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	if log == nil {
		return fiber.NewError(fiber.StatusNotFound, "log tidak ditemukan")
	}
	return c.JSON(fiber.Map{"success": true, "data": log})
}

// GET /akreditasi/sync-log/:id/details?action=insert
func (h *Handler) GetLogDetails(c *fiber.Ctx) error {
	id := c.Params("id")
	action := c.Query("action")
	if id == "" {
		return fiber.NewError(fiber.StatusBadRequest, "id is required")
	}
	out, err := h.svc.GetLogDetails(c.Context(), id, action)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": out})
}

// ============================================================================
// Mapping Akreditasi (per-prodi CRUD pdrd.akreditasi_prodi) handlers
// "Mapping Unit" di UI = list pdrd.sms + status akreditasi + CRUD akreditasi.
// ============================================================================

func (h *Handler) ListMapping(c *fiber.Ctx) error {
	p := AkreditasiListParams{
		Search:      c.Query("search"),
		IDLembAkred: c.Query("id_lemb_akred"),
		IDAkred:     c.Query("id_akred"),
		Page:        atoiDefault(c.Query("page"), 1),
		Limit:       atoiDefault(c.Query("limit"), 50),
		SortBy:      c.Query("sort_by"),
		Order:       c.Query("order"),
	}
	statusF := strings.ToLower(strings.TrimSpace(c.Query("status")))
	rows, total, err := h.svc.List(c.Context(), p)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	// Apply status filter di service-level (sederhana, post-fetch).
	if statusF == "mapped" {
		filtered := make([]AkreditasiRow, 0, len(rows))
		for _, r := range rows {
			if r.IDAkred != nil && (r.NmAkred == nil || (*r.NmAkred != "Belum Terakreditasi" && *r.NmAkred != "Tidak Terakreditasi")) {
				filtered = append(filtered, r)
			}
		}
		rows = filtered
	} else if statusF == "unmapped" {
		filtered := make([]AkreditasiRow, 0, len(rows))
		for _, r := range rows {
			if r.IDAkred == nil || (r.NmAkred != nil && (*r.NmAkred == "Belum Terakreditasi" || *r.NmAkred == "Tidak Terakreditasi")) {
				filtered = append(filtered, r)
			}
		}
		rows = filtered
	} else if statusF == "expired" {
		now := time.Now()
		filtered := make([]AkreditasiRow, 0, len(rows))
		for _, r := range rows {
			if r.TstSk != nil && r.TstSk.Before(now) {
				filtered = append(filtered, r)
			}
		}
		rows = filtered
	}
	return c.JSON(fiber.Map{
		"success":    true,
		"data":       rows,
		"pagination": fiber.Map{"page": p.Page, "limit": p.Limit, "total": total},
	})
}

func (h *Handler) MappingStats(c *fiber.Ctx) error {
	st, err := h.svc.Stats(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	// Reshape ke shape Mapping Stats (Total / Mapped / Unmapped / Broken).
	total := st.TotalProdi
	mapped := st.TotalTerakreditasi
	unmapped := st.TotalBelum
	expired := st.TotalKadaluarsa
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total":    total,
			"mapped":   mapped,
			"unmapped": unmapped,
			"expired":  expired,
		},
	})
}

// PUT /akreditasi/mapping-unit/:id_sms — manual upsert akreditasi untuk 1 prodi.
// Body: { id_lemb_akred, id_akred, sk, tgl_sk, tst_sk, banpt_name?, banpt_jenjang? }
// Kalau banpt_name + banpt_jenjang dikirim → service akan ALSO save alias supaya
// sync berikutnya match BAN-PT name ke id_sms ini.
func (h *Handler) UpsertMapping(c *fiber.Ctx) error {
	idSms := c.Params("id_sms")
	if idSms == "" {
		idSms = c.Params("kode") // backward compat
	}
	if idSms == "" {
		return fiber.NewError(fiber.StatusBadRequest, "id_sms wajib")
	}
	var req struct {
		IDLembAkred  string  `json:"id_lemb_akred"`
		IDAkred      int     `json:"id_akred"`
		Sk           string  `json:"sk"`
		TglSk        *string `json:"tgl_sk"`
		TstSk        *string `json:"tst_sk"`
		BanptName    string  `json:"banpt_name"`
		BanptJenjang string  `json:"banpt_jenjang"`
	}
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if req.IDLembAkred == "" {
		req.IDLembAkred = "00001"
	}
	var tglSk, tstSk *time.Time
	if req.TglSk != nil {
		if t, err := time.Parse("2006-01-02", *req.TglSk); err == nil {
			tglSk = &t
		}
	}
	if req.TstSk != nil {
		if t, err := time.Parse("2006-01-02", *req.TstSk); err == nil {
			tstSk = &t
		}
	}

	var action string
	var err error
	if strings.TrimSpace(req.BanptName) != "" {
		action, _, err = h.svc.UpsertManualAkreditasiWithAlias(c.Context(), idSms, req.IDLembAkred, req.IDAkred, req.Sk, tglSk, tstSk, req.BanptName, req.BanptJenjang)
	} else {
		action, _, err = h.svc.UpsertManualAkreditasi(c.Context(), idSms, req.IDLembAkred, req.IDAkred, req.Sk, tglSk, tstSk)
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"action": action, "id_sms": idSms}})
}

func (h *Handler) DeleteMapping(c *fiber.Ctx) error {
	idSms := c.Params("id_sms")
	if idSms == "" {
		idSms = c.Params("kode")
	}
	if idSms == "" {
		return fiber.NewError(fiber.StatusBadRequest, "id_sms wajib")
	}
	if err := h.svc.DeleteAkreditasi(c.Context(), idSms); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /akreditasi/unmatched — list BAN-PT records yg gagal di-match ke pdrd.sms
// di sync log terbaru. Admin pakai untuk define mapping manual via Mapping Unit page.
func (h *Handler) UnmatchedBanpt(c *fiber.Ctx) error {
	rows, err := h.svc.UnmatchedBanpt(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /akreditasi/ref-akreditasi — referensi nilai_akred + lembaga_akred utk dropdown form.
func (h *Handler) RefAkreditasi(c *fiber.Ctx) error {
	nilai, lembaga, err := h.svc.RefAkreditasi(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{
		"nilai_akred":   nilai,
		"lembaga_akred": lembaga,
	}})
}

// GET /akreditasi/scheduler-config — returns disabled stub.
// User asked: scheduler UI saja, jangan eksekusi otomatis.
func (h *Handler) SchedulerConfig(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"enabled":     false,
			"cron":        "0 2 1 * *", // monthly default (visual only)
			"description": "Scheduler dinonaktifkan — sync hanya manual oleh admin (kebijakan operasional).",
			"updated_at":  time.Now(),
		},
	})
}

// ============================================================================
// helpers
// ============================================================================

type authUser struct {
	id       *string
	username *string
}

func getAuthUser(c *fiber.Ctx) authUser {
	var au authUser
	if v := c.Locals("user_id"); v != nil {
		if s, ok := v.(string); ok && s != "" {
			au.id = &s
		}
	}
	if v := c.Locals("username"); v != nil {
		if s, ok := v.(string); ok && s != "" {
			au.username = &s
		}
	}
	return au
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	v, err := strconv.Atoi(s)
	if err != nil {
		return def
	}
	return v
}
