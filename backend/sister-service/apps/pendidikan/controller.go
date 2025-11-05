package pendidikan

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// SyncPendidikanFormalByIDSDM godoc
// @Summary Sync pendidikan formal by id_sdm
// @Description Sync all pendidikan formal data for a dosen from Sister API
// @Tags Pendidikan Formal
// @Accept json
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Param synced_by query string false "Synced by (default: system)"
// @Success 200 {object} BatchPendidikanFormalSyncResult
// @Router /api/v1/pendidikan-formal/sync [post]
func (c *Controller) SyncPendidikanFormalByIDSDM(ctx *fiber.Ctx) error {
	idSDM := ctx.Query("id_sdm")
	if idSDM == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_sdm is required",
		})
	}

	syncedBy := ctx.Query("synced_by")
	if syncedBy == "" {
		syncedBy = "system"
	}

	log.Printf("📥 Sync pendidikan formal request: id_sdm=%s, synced_by=%s", idSDM, syncedBy)

	result, err := c.service.SyncPendidikanFormalByIDSDM(idSDM, syncedBy)
	if err != nil {
		log.Printf("❌ Sync pendidikan formal failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// BatchSyncAllPendidikanFormal godoc
// @Summary Batch sync all pendidikan formal
// @Description Sync pendidikan formal for all dosen from Sister API
// @Tags Pendidikan Formal
// @Accept json
// @Produce json
// @Param synced_by query string false "Synced by (default: system)"
// @Success 200 {object} BatchAllSyncResult
// @Router /api/v1/pendidikan-formal/sync-all [post]
func (c *Controller) BatchSyncAllPendidikanFormal(ctx *fiber.Ctx) error {
	syncedBy := ctx.Query("synced_by")
	if syncedBy == "" {
		syncedBy = "system"
	}

	log.Printf("📥 Batch sync all pendidikan formal request (synced_by: %s)", syncedBy)

	result, err := c.service.BatchSyncAllPendidikanFormal(syncedBy)
	if err != nil {
		log.Printf("❌ Batch sync all pendidikan formal failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// GetPendidikanFormalByIDSDM godoc
// @Summary Get pendidikan formal by id_sdm
// @Description Get all pendidikan formal for a dosen
// @Tags Pendidikan Formal
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Success 200 {array} RwyPendFormal
// @Router /public/pendidikan-formal [get]
func (c *Controller) GetPendidikanFormalByIDSDM(ctx *fiber.Ctx) error {
	idSDM := ctx.Query("id_sdm")
	if idSDM == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_sdm is required",
		})
	}

	pendidikanList, err := c.service.GetPendidikanFormalByIDSDM(idSDM)
	if err != nil {
		log.Printf("❌ Get pendidikan formal failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(pendidikanList)
}

// GetPendidikanFormalDetail godoc
// @Summary Get pendidikan formal detail
// @Description Get detail of a single pendidikan formal
// @Tags Pendidikan Formal
// @Produce json
// @Param id path string true "ID Pendidikan Formal"
// @Success 200 {object} RwyPendFormal
// @Router /public/pendidikan-formal/{id} [get]
func (c *Controller) GetPendidikanFormalDetail(ctx *fiber.Ctx) error {
	idRwyDidikFormal := ctx.Params("id")

	if idRwyDidikFormal == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id is required",
		})
	}

	pendidikan, err := c.service.GetPendidikanFormalByID(idRwyDidikFormal)
	if err != nil {
		log.Printf("❌ Get pendidikan formal detail failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if pendidikan == nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "pendidikan formal not found",
		})
	}

	return ctx.JSON(pendidikan)
}

// GetPendidikanFormalStats godoc
// @Summary Get pendidikan formal statistics
// @Description Get statistics for pendidikan formal
// @Tags Pendidikan Formal
// @Produce json
// @Success 200 {object} PendidikanFormalStats
// @Router /public/pendidikan-formal/stats [get]
func (c *Controller) GetPendidikanFormalStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetPendidikanFormalStats()
	if err != nil {
		log.Printf("❌ Get pendidikan formal stats failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(stats)
}

// GetPendidikanFormalList godoc
// @Summary Get pendidikan formal list
// @Description Get paginated list of pendidikan formal with search functionality
// @Tags Pendidikan Formal
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by nama perguruan tinggi, judul tesis, nipd, jenjang, bidang studi"
// @Param sort_by query string false "Sort by field (nama_dosen, nm_sp_formal, thn_lulus)" default("thn_lulus")
// @Param sort_order query string false "Sort order (asc, desc)" default("desc")
// @Success 200 {object} PendidikanFormalListResult
// @Router /public/pendidikan-formal/list [get]
func (c *Controller) GetPendidikanFormalList(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 10)
	search := ctx.Query("search", "")
	sortBy := ctx.Query("sort_by", "thn_lulus")
	sortOrder := ctx.Query("sort_order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := c.service.GetPendidikanFormalList(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Get pendidikan formal list failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve pendidikan formal list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Pendidikan formal list retrieved successfully",
		"data":    result,
	})
}
