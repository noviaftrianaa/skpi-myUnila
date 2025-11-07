package tugas_tambahan

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"sister-service/pkg/response"
)

// Controller handles HTTP requests for tugas tambahan
type Controller struct {
	service *Service
}

// NewController creates a new Controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetTugasTambahanStats returns statistics
// @Summary Get tugas tambahan statistics
// @Tags Tugas Tambahan
// @Produce json
// @Success 200 {object} response.SuccessResponse{data=TugasTambahanStats}
// @Failure 500 {object} response.ErrorResponse
// @Router /public/tugas-tambahan/stats [get]
func (ctrl *Controller) GetTugasTambahanStats(c *fiber.Ctx) error {
	stats, err := ctrl.service.GetTugasTambahanStats()
	if err != nil {
		log.Printf("❌ Error getting tugas tambahan stats: %v", err)
		return response.InternalServerError(c, "Failed to get statistics", err)
	}

	return response.Success(c, "Statistics retrieved successfully", stats)
}

// GetTugasTambahanList returns paginated list of tugas tambahan
// @Summary Get tugas tambahan list
// @Tags Tugas Tambahan
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search query"
// @Param sort_by query string false "Sort by field"
// @Param sort_order query string false "Sort order (ASC/DESC)"
// @Success 200 {object} response.SuccessResponse{data=TugasTambahanListResult}
// @Failure 500 {object} response.ErrorResponse
// @Router /public/tugas-tambahan/list [get]
func (ctrl *Controller) GetTugasTambahanList(c *fiber.Ctx) error {
	// Parse query parameters
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	sortBy := c.Query("sort_by", "")
	sortOrder := c.Query("sort_order", "DESC")

	result, err := ctrl.service.GetTugasTambahanList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Error getting tugas tambahan list: %v", err)
		return response.InternalServerError(c, "Failed to get tugas tambahan list", err)
	}

	return response.Success(c, "Tugas tambahan list retrieved successfully", result)
}

// GetTugasTambahanDetail returns detail of a single tugas tambahan
// @Summary Get tugas tambahan detail
// @Tags Tugas Tambahan
// @Produce json
// @Param id path string true "Tugas Tambahan ID (UUID)"
// @Success 200 {object} response.SuccessResponse{data=TugasTambahanWithDetail}
// @Failure 404 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /public/tugas-tambahan/{id} [get]
func (ctrl *Controller) GetTugasTambahanDetail(c *fiber.Ctx) error {
	id := c.Params("id")

	if id == "" {
		return response.BadRequest(c, "Tugas tambahan ID is required", nil)
	}

	detail, err := ctrl.service.GetTugasTambahanByID(id)
	if err != nil {
		log.Printf("❌ Error getting tugas tambahan detail: %v", err)
		return response.NotFound(c, "Tugas tambahan not found")
	}

	return response.Success(c, "Tugas tambahan detail retrieved successfully", detail)
}

// SyncTugasTambahanByIDSDM syncs tugas tambahan for a single dosen
// @Summary Sync tugas tambahan by ID SDM
// @Tags Tugas Tambahan
// @Accept json
// @Produce json
// @Param id_sdm query string true "ID SDM (UUID)"
// @Param synced_by query string true "User who triggered sync"
// @Success 200 {object} response.SuccessResponse{data=SyncResult}
// @Failure 400 {object} response.ErrorResponse
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/tugas-tambahan/sync [post]
func (ctrl *Controller) SyncTugasTambahanByIDSDM(c *fiber.Ctx) error {
	idSDM := c.Query("id_sdm")
	syncedBy := c.Query("synced_by", "system")

	if idSDM == "" {
		return response.BadRequest(c, "id_sdm is required", nil)
	}

	log.Printf("🔄 API: Syncing tugas tambahan for id_sdm: %s (by: %s)", idSDM, syncedBy)

	result, err := ctrl.service.SyncTugasTambahanByIDSDM(idSDM, "manual")
	if err != nil {
		log.Printf("❌ API: Failed to sync tugas tambahan: %v", err)
		return response.InternalServerError(c, "Failed to sync tugas tambahan", err)
	}

	return response.Success(c, "Tugas tambahan sync completed", result)
}

// BatchSyncAllTugasTambahan syncs tugas tambahan for all dosen
// @Summary Batch sync all tugas tambahan
// @Tags Tugas Tambahan
// @Accept json
// @Produce json
// @Param synced_by query string true "User who triggered sync"
// @Success 200 {object} response.SuccessResponse{data=BatchSyncResult}
// @Failure 500 {object} response.ErrorResponse
// @Router /api/v1/tugas-tambahan/sync-all [post]
func (ctrl *Controller) BatchSyncAllTugasTambahan(c *fiber.Ctx) error {
	syncedBy := c.Query("synced_by", "system")

	log.Printf("🚀 API: Starting batch sync for all dosen tugas tambahan (by: %s)", syncedBy)

	result, err := ctrl.service.BatchSyncAllTugasTambahan("manual")
	if err != nil {
		log.Printf("❌ API: Failed to batch sync: %v", err)
		return response.InternalServerError(c, "Failed to batch sync tugas tambahan", err)
	}

	return response.Success(c, "Batch sync completed", result)
}