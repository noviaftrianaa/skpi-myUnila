package ktw

import (
	"encoding/json"
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/internal/response"
)

// Handler — parse query → call service → wrap response envelope.
type Handler struct {
	svc Service
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// ---------- Handlers per endpoint ----------

// GET /v1/dashboard/ktw/overview
func (h *Handler) Overview(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "overview", "Berhasil mengambil overview KTW", []string{"cohort", "jenjang", "cutoff", "reconcile"})
}

// GET /v1/dashboard/ktw/fakultas
func (h *Handler) Fakultas(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "fakultas", "Berhasil mengambil KTW per fakultas", []string{"cohort", "jenjang", "cutoff"})
}

// GET /v1/dashboard/ktw/prodi
func (h *Handler) Prodi(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "prodi", "Berhasil mengambil KTW per prodi", []string{"cohort", "jenjang", "cutoff", "id_fakultas"})
}

// GET /v1/dashboard/ktw/prodi/:id_sms
func (h *Handler) ProdiDetail(c *fiber.Ctx) error {
	idSms := c.Params("id_sms")
	if idSms == "" {
		return response.BadRequest(c, "id_sms wajib", map[string]string{"id_sms": "required"})
	}
	return h.proxyGeneric(c, "prodi/"+idSms, "Berhasil mengambil detail prodi", []string{"cohort", "reconcile"})
}

// GET /v1/dashboard/ktw/trend
func (h *Handler) Trend(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "trend", "Berhasil mengambil trend KTW", []string{"jenjang", "start", "end"})
}

// GET /v1/dashboard/ktw/status-breakdown
func (h *Handler) StatusBreakdown(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "status-breakdown", "Berhasil mengambil breakdown status", []string{"cohort", "jenjang", "cutoff"})
}

// GET /v1/dashboard/ktw/gender-breakdown
func (h *Handler) GenderBreakdown(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "gender-breakdown", "Berhasil mengambil breakdown gender", []string{"cohort", "jenjang", "cutoff"})
}

// GET /v1/dashboard/ktw/jalur-breakdown
func (h *Handler) JalurBreakdown(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "jalur-breakdown", "Berhasil mengambil breakdown jalur", []string{"cohort", "jenjang", "cutoff"})
}

// GET /v1/dashboard/ktw/masa-mukim-stats
func (h *Handler) MasaMukimStats(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "masa-mukim-stats", "Berhasil mengambil statistik masa mukim", []string{"cohort", "jenjang", "cutoff"})
}

// GET /v1/dashboard/ktw/top-prodi
func (h *Handler) TopProdi(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "top-prodi", "Berhasil mengambil top prodi", []string{"cohort", "jenjang", "cutoff", "limit"})
}

// GET /v1/dashboard/ktw/presets
func (h *Handler) Presets(c *fiber.Ctx) error {
	return h.proxyGeneric(c, "presets", "Berhasil mengambil preset cutoff", nil)
}

// ---------- Internal helper ----------

// proxyGeneric — pola umum: parse allowed query params → svc.Get → envelope.
// allowed = whitelist query params yang diteruskan ke upstream (sanitize).
func (h *Handler) proxyGeneric(c *fiber.Ctx, endpoint string, message string, allowed []string) error {
	params := map[string]string{}
	for _, k := range allowed {
		v := c.Query(k)
		if v == "" {
			continue
		}
		// Coerce tipe ringan — validasi detail ditangani upstream
		if k == "cohort" || k == "start" || k == "end" || k == "limit" {
			if _, err := strconv.Atoi(v); err != nil {
				return response.BadRequest(c, "Parameter "+k+" harus integer", map[string]string{k: "must be int"})
			}
		}
		params[k] = v
	}

	body, statusCode, err := h.svc.Get(c.Context(), endpoint, params)
	if err != nil {
		log.Printf("KTW proxy error [%s]: %v", endpoint, err)
		return response.InternalError(c, "Gagal mengambil data KTW dari upstream")
	}

	// Upstream 4xx/5xx — relay sebagai error envelope
	if statusCode >= 400 {
		return c.Status(statusCode).JSON(fiber.Map{
			"success":   false,
			"message":   "Upstream error",
			"error":     extractError(body),
			"timestamp": nowIso(),
		})
	}

	// Unmarshal body supaya bisa di-nested sebagai "data" di envelope
	var raw interface{}
	if err := json.Unmarshal(body, &raw); err != nil {
		return response.InternalError(c, "Response upstream tidak valid")
	}

	return response.Success(c, message, raw)
}
