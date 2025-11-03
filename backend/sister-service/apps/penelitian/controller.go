package penelitian

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

// SyncPenelitianByIDSDM godoc
// @Summary Sync penelitian by id_sdm
// @Description Sync all penelitian data for a dosen from Sister API
// @Tags Penelitian
// @Accept json
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Param synced_by query string false "Synced by (default: system)"
// @Success 200 {object} BatchPenelitianSyncResult
// @Router /api/v1/penelitian/sync [post]
func (c *Controller) SyncPenelitianByIDSDM(ctx *fiber.Ctx) error {
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

	log.Printf("📥 Sync penelitian request: id_sdm=%s, synced_by=%s", idSDM, syncedBy)

	result, err := c.service.SyncPenelitianByIDSDM(idSDM, syncedBy)
	if err != nil {
		log.Printf("❌ Sync penelitian failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// SyncPengabdianByIDSDM godoc
// @Summary Sync pengabdian by id_sdm
// @Description Sync all pengabdian data for a dosen from Sister API
// @Tags Pengabdian
// @Accept json
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Param synced_by query string false "Synced by (default: system)"
// @Success 200 {object} BatchPenelitianSyncResult
// @Router /api/v1/pengabdian/sync [post]
func (c *Controller) SyncPengabdianByIDSDM(ctx *fiber.Ctx) error {
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

	log.Printf("📥 Sync pengabdian request: id_sdm=%s, synced_by=%s", idSDM, syncedBy)

	result, err := c.service.SyncPengabdianByIDSDM(idSDM, syncedBy)
	if err != nil {
		log.Printf("❌ Sync pengabdian failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// GetPenelitianByIDSDM godoc
// @Summary Get penelitian by id_sdm
// @Description Get all penelitian for a dosen
// @Tags Penelitian
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Success 200 {array} Litabmas
// @Router /public/penelitian [get]
func (c *Controller) GetPenelitianByIDSDM(ctx *fiber.Ctx) error {
	idSDM := ctx.Query("id_sdm")
	if idSDM == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_sdm is required",
		})
	}

	penelitianList, err := c.service.GetPenelitianByIDSDM(idSDM)
	if err != nil {
		log.Printf("❌ Get penelitian failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(penelitianList)
}

// GetPengabdianByIDSDM godoc
// @Summary Get pengabdian by id_sdm
// @Description Get all pengabdian for a dosen
// @Tags Pengabdian
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Success 200 {array} Litabmas
// @Router /public/pengabdian [get]
func (c *Controller) GetPengabdianByIDSDM(ctx *fiber.Ctx) error {
	idSDM := ctx.Query("id_sdm")
	if idSDM == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_sdm is required",
		})
	}

	pengabdianList, err := c.service.GetPengabdianByIDSDM(idSDM)
	if err != nil {
		log.Printf("❌ Get pengabdian failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(pengabdianList)
}

// GetLitabmasDetail godoc
// @Summary Get litabmas detail
// @Description Get detail of a single litabmas (penelitian/pengabdian)
// @Tags Penelitian
// @Produce json
// @Param id path string true "ID Litabmas"
// @Success 200 {object} Litabmas
// @Router /public/litabmas/{id} [get]
func (c *Controller) GetLitabmasDetail(ctx *fiber.Ctx) error {
	idLitabmas := ctx.Params("id")

	if idLitabmas == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id is required",
		})
	}

	litabmas, err := c.service.GetLitabmasByID(idLitabmas)
	if err != nil {
		log.Printf("❌ Get litabmas detail failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	if litabmas == nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "litabmas not found",
		})
	}

	return ctx.JSON(litabmas)
}

// GetPenelitianStats godoc
// @Summary Get penelitian statistics
// @Description Get statistics for penelitian
// @Tags Penelitian
// @Produce json
// @Success 200 {object} PenelitianStats
// @Router /public/penelitian/stats [get]
func (c *Controller) GetPenelitianStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetPenelitianStats()
	if err != nil {
		log.Printf("❌ Get penelitian stats failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(stats)
}

// GetPengabdianStats godoc
// @Summary Get pengabdian statistics
// @Description Get statistics for pengabdian (count, active, total dana, last sync)
// @Tags Pengabdian
// @Produce json
// @Success 200 {object} PenelitianStats
// @Router /public/pengabdian/stats [get]
func (c *Controller) GetPengabdianStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetPengabdianStats()
	if err != nil {
		log.Printf("❌ Get pengabdian stats failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(stats)
}

// GetPenelitianList godoc
// @Summary Get penelitian list
// @Description Get paginated list of penelitian with search functionality
// @Tags Penelitian
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by judul"
// @Param sort_by query string false "Sort by field (judul_litabmas, pendanaan)" default(id_thn_kegiatan)
// @Param sort_order query string false "Sort order (asc, desc)" default(desc)
// @Success 200 {object} LitabmasListResult
// @Router /public/penelitian/list [get]
func (c *Controller) GetPenelitianList(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 10)
	search := ctx.Query("search", "")
	sortBy := ctx.Query("sort_by", "")
	sortOrder := ctx.Query("sort_order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := c.service.GetPenelitianListWithSort(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Get penelitian list failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve penelitian list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Penelitian list retrieved successfully",
		"data":    result,
	})
}

// GetPengabdianList godoc
// @Summary Get pengabdian list
// @Description Get paginated list of pengabdian with search functionality
// @Tags Pengabdian
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by judul"
// @Param sort_by query string false "Sort by field (judul_litabmas, pendanaan)" default(id_thn_kegiatan)
// @Param sort_order query string false "Sort order (asc, desc)" default(desc)
// @Success 200 {object} LitabmasListResult
// @Router /public/pengabdian/list [get]
func (c *Controller) GetPengabdianList(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 10)
	search := ctx.Query("search", "")
	sortBy := ctx.Query("sort_by", "")
	sortOrder := ctx.Query("sort_order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := c.service.GetPengabdianListWithSort(page, limit, search, sortBy, sortOrder)
	if err != nil {
		log.Printf("❌ Get pengabdian list failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve pengabdian list",
			"error":   err.Error(),
		})
	}

	return ctx.JSON(fiber.Map{
		"success": true,
		"message": "Pengabdian list retrieved successfully",
		"data":    result,
	})
}

// GetDokumenByLitabmas godoc
// @Summary Get dokumen by litabmas
// @Description Get all dokumen for a litabmas (penelitian/pengabdian)
// @Tags Dokumen
// @Produce json
// @Param id path string true "ID Litabmas"
// @Success 200 {array} Dokumen
// @Router /public/litabmas/{id}/dokumen [get]
func (c *Controller) GetDokumenByLitabmas(ctx *fiber.Ctx) error {
	idLitabmas := ctx.Params("id")

	if idLitabmas == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id is required",
		})
	}

	dokumenList, err := c.service.GetDokumenByLitabmas(idLitabmas)
	if err != nil {
		log.Printf("❌ Get dokumen failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(dokumenList)
}
