package matkul_kurikulum

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// GetKurikulumList godoc
// @Summary Get kurikulum list with filtering and pagination
// @Description Retrieve kurikulum list with optional filters and pagination
// @Tags Kurikulum
// @Accept json
// @Produce json
// @Param id_prodi query string false "Filter by prodi ID"
// @Param search query string false "Search by nama kurikulum"
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Items per page (default: 20)"
// @Param sort_by query string false "Sort field (nm_kurikulum_sp, id_semester, last_sync)"
// @Param sort_order query string false "Sort order (asc, desc)"
// @Success 200 {object} KurikulumListResult
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/kurikulum [get]
func (h *Handler) GetKurikulumList(c *fiber.Ctx) error {
	// Parse pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Parse filters
	search := c.Query("search", "")
	sortBy := c.Query("sort_by", "")
	sortOrder := c.Query("sort_order", "asc")

	var idProdi *string
	if prodiParam := c.Query("id_prodi"); prodiParam != "" {
		idProdi = &prodiParam
	}

	// Get kurikulum list
	result, err := h.service.GetKurikulumList(c.Context(), page, limit, search, idProdi, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get kurikulum list",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// GetKurikulumDetail godoc
// @Summary Get kurikulum detail with matkul list
// @Description Retrieve detailed kurikulum information including matkul list
// @Tags Kurikulum
// @Accept json
// @Produce json
// @Param id path string true "Kurikulum ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/kurikulum/{id} [get]
func (h *Handler) GetKurikulumDetail(c *fiber.Ctx) error {
	idKurikulumSP := c.Params("id")

	if idKurikulumSP == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Invalid request",
			"message": "id_kurikulum_sp is required",
		})
	}

	// Get kurikulum detail
	detail, err := h.service.GetKurikulumDetail(c.Context(), idKurikulumSP)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error":   "Kurikulum not found",
			"message": err.Error(),
		})
	}

	return c.JSON(detail)
}

// GetMatkulByKurikulum godoc
// @Summary Get matkul list by kurikulum with search
// @Description Retrieve list of matkul for a specific kurikulum with optional search
// @Tags Kurikulum
// @Accept json
// @Produce json
// @Param id path string true "Kurikulum ID"
// @Param search query string false "Search by nama matkul or kode matkul"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/kurikulum/{id}/matkul [get]
func (h *Handler) GetMatkulByKurikulum(c *fiber.Ctx) error {
	idKurikulumSP := c.Params("id")
	search := c.Query("search", "")

	if idKurikulumSP == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request",
			"message": "id_kurikulum_sp is required",
		})
	}

	// Get matkul list
	matkulList, err := h.service.GetMatkulByKurikulum(c.Context(), idKurikulumSP, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get matkul list",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    matkulList,
	})
}

// GetProdiList godoc
// @Summary Get prodi list
// @Description Retrieve list of active prodi
// @Tags Kurikulum
// @Accept json
// @Produce json
// @Success 200 {array} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/kurikulum/prodi [get]
func (h *Handler) GetProdiList(c *fiber.Ctx) error {
	prodiList, err := h.service.GetProdiList(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get prodi list",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    prodiList,
	})
}

// GetStats godoc
// @Summary Get kurikulum statistics
// @Description Retrieve statistics for kurikulum data
// @Tags Kurikulum
// @Accept json
// @Produce json
// @Success 200 {object} KurikulumStats
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/kurikulum/stats [get]
func (h *Handler) GetStats(c *fiber.Ctx) error {
	stats, err := h.service.GetStats(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to get stats",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// SyncKurikulum godoc
// @Summary Sync kurikulum from Neo Feeder
// @Description Sync kurikulum data from Neo Feeder API by prodi
// @Tags Kurikulum
// @Accept json
// @Produce json
// @Param id_prodi query string false "Filter by prodi ID (optional)"
// @Param synced_by query string true "User who triggered the sync"
// @Success 200 {object} BatchKurikulumSyncResult
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/kurikulum/sync [post]
func (h *Handler) SyncKurikulum(c *fiber.Ctx) error {
	// Get parameters from query string
	idProdi := c.Query("id_prodi", "")
	syncedBy := c.Query("synced_by", "system")

	// Validate required parameters: synced_by
	if syncedBy == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid request",
			"message": "synced_by parameter is required",
		})
	}

	// Parse id_prodi (optional)
	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	// Build sync filter
	filter := &SyncFilter{
		IDProdi: idProdiPtr,
	}

	// Perform sync
	result, err := h.service.SyncKurikulum(c.Context(), filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Failed to sync kurikulum",
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
		"message": "Sinkronisasi kurikulum berhasil",
	})
}
