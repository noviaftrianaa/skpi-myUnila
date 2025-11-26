package rencana_evaluasi

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for rencana_evaluasi
type Handler struct {
	service Service
}

// NewHandler creates a new rencana_evaluasi handler
func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// GetRencanaEvaluasiList handles GET /rencana-evaluasi
// Query params: page, limit, search, id_matkul, sort_by, sort_order
func (h *Handler) GetRencanaEvaluasiList(c *fiber.Ctx) error {
	// Parse pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Parse filters
	search := c.Query("search", "")
	idMatkul := c.Query("id_matkul", "")
	idProdi := c.Query("id_prodi", "")
	sortBy := c.Query("sort_by", "")
	sortOrder := c.Query("sort_order", "asc")

	var idMatkulPtr *string
	if idMatkul != "" {
		idMatkulPtr = &idMatkul
	}

	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	// Get list from service
	result, err := h.service.GetRencanaEvaluasiList(
		c.Context(),
		page,
		limit,
		search,
		idMatkulPtr,
		idProdiPtr,
		sortBy,
		sortOrder,
	)
	if err != nil {
		log.Printf("⚠️  [Handler] Failed to get rencana evaluasi list: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar rencana evaluasi",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
		"message": "Berhasil mengambil daftar rencana evaluasi",
	})
}

// GetRencanaEvaluasiByID handles GET /rencana-evaluasi/:id
func (h *Handler) GetRencanaEvaluasiByID(c *fiber.Ctx) error {
	idReMk := c.Params("id")
	if idReMk == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID rencana evaluasi tidak boleh kosong",
		})
	}

	re, err := h.service.GetRencanaEvaluasiByID(c.Context(), idReMk)
	if err != nil {
		log.Printf("⚠️  [Handler] Failed to get rencana evaluasi by ID: %v", err)
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Rencana evaluasi tidak ditemukan",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    re,
		"message": "Berhasil mengambil detail rencana evaluasi",
	})
}

// GetJenisEvaluasiList handles GET /rencana-evaluasi/jenis-evaluasi
func (h *Handler) GetJenisEvaluasiList(c *fiber.Ctx) error {
	jeList, err := h.service.GetJenisEvaluasiList(c.Context())
	if err != nil {
		log.Printf("⚠️  [Handler] Failed to get jenis evaluasi list: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar jenis evaluasi",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    jeList,
		"message": "Berhasil mengambil daftar jenis evaluasi",
	})
}

// GetProdiList handles GET /rencana-evaluasi/helper/prodi
func (h *Handler) GetProdiList(c *fiber.Ctx) error {
	// Query to get unique prodi from matkul that have rencana evaluasi
	query := `
		SELECT DISTINCT
			CAST(m.id_sms AS VARCHAR(50)) AS id_sms,
			s.nm_lemb AS nama_prodi,
			s.kode_prodi,
			j.nm_jenj_didik
		FROM pdrd.matkul m WITH(NOLOCK)
		JOIN pdrd.re_mk re WITH(NOLOCK) ON CAST(re.id_mk AS VARCHAR(50)) = CAST(m.id_mk AS VARCHAR(50)) AND re.soft_delete = 0
		JOIN pdrd.sms s WITH(NOLOCK) ON s.id_sms = m.id_sms AND s.soft_delete = 0
		LEFT JOIN ref.jenjang_pendidikan j WITH(NOLOCK) ON j.id_jenj_didik = s.id_jenj_didik
		WHERE m.soft_delete = 0
		ORDER BY j.nm_jenj_didik, s.nm_lemb
	`

	type ProdiItem struct {
		IDSms        string  `db:"id_sms" json:"id_sms"`
		NamaProdi    string  `db:"nama_prodi" json:"nama_prodi"`
		KodeProdi    *string `db:"kode_prodi" json:"kode_prodi"`
		NmJenjDidik  *string `db:"nm_jenj_didik" json:"nm_jenj_didik"`
	}

	var prodiList []ProdiItem
	err := h.service.(*service).repo.(*repository).db.SelectContext(c.Context(), &prodiList, query)
	if err != nil {
		log.Printf("⚠️  [Handler] Failed to get prodi list: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil daftar prodi",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    prodiList,
		"message": "Berhasil mengambil daftar prodi",
	})
}

// GetStats handles GET /rencana-evaluasi/stats
func (h *Handler) GetStats(c *fiber.Ctx) error {
	stats, err := h.service.GetStats(c.Context())
	if err != nil {
		log.Printf("⚠️  [Handler] Failed to get stats: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil statistik",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
		"message": "Berhasil mengambil statistik",
	})
}

// SyncRencanaEvaluasi handles POST /rencana-evaluasi/sync
// Query params: id_matkul (optional), synced_by (optional)
func (h *Handler) SyncRencanaEvaluasi(c *fiber.Ctx) error {
	// Parse filters
	idMatkul := c.Query("id_matkul", "")
	syncedBy := c.Query("synced_by", "system")

	var filter *SyncFilter
	if idMatkul != "" {
		filter = &SyncFilter{
			IDMatkul: &idMatkul,
		}
	}

	log.Printf("🔄 [Handler] Starting rencana evaluasi sync (synced_by: %s, filter: %+v)", syncedBy, filter)

	// Call sync service
	result, err := h.service.SyncRencanaEvaluasi(c.Context(), filter, syncedBy)
	if err != nil {
		log.Printf("⚠️  [Handler] Sync failed: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Sinkronisasi rencana evaluasi gagal",
			"error":   err.Error(),
		})
	}

	log.Printf("✅ [Handler] Sync completed (Success: %d, Failed: %d, Duration: %s)",
		result.TotalSuccess, result.TotalFailed, result.Duration)

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
		"message": "Sinkronisasi rencana evaluasi berhasil",
	})
}
