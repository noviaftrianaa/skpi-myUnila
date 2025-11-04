package publikasi

import (
	"log"
	"strconv"

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

// SyncPublikasiByIDSDM godoc
// @Summary Sync publikasi by id_sdm
// @Description Sync all publikasi for a dosen from Sister API
// @Tags Publikasi
// @Accept json
// @Produce json
// @Param id_sdm query string true "ID SDM (Dosen)"
// @Param synced_by query string false "Synced by (default: system)"
// @Success 200 {object} BatchPublikasiSyncResult
// @Router /api/v1/publikasi/sync [post]
func (c *Controller) SyncPublikasiByIDSDM(ctx *fiber.Ctx) error {
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

	log.Printf("📥 Sync publikasi request for id_sdm: %s (synced_by: %s)", idSDM, syncedBy)

	result, err := c.service.SyncPublikasiByIDSDM(idSDM, syncedBy)
	if err != nil {
		log.Printf("❌ Sync publikasi failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// BatchSyncAllPublikasi godoc
// @Summary Batch sync all publikasi
// @Description Sync publikasi for all dosen from Sister API
// @Tags Publikasi
// @Accept json
// @Produce json
// @Param synced_by query string false "Synced by (default: system)"
// @Success 200 {object} BatchAllSyncResult
// @Router /api/v1/publikasi/sync-all [post]
func (c *Controller) BatchSyncAllPublikasi(ctx *fiber.Ctx) error {
	syncedBy := ctx.Query("synced_by")
	if syncedBy == "" {
		syncedBy = "system"
	}

	log.Printf("📥 Batch sync all publikasi request (synced_by: %s)", syncedBy)

	result, err := c.service.BatchSyncAllPublikasi(syncedBy)
	if err != nil {
		log.Printf("❌ Batch sync all publikasi failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// GetPublikasiByID godoc
// @Summary Get publikasi by ID
// @Description Get a single publikasi by id_publikasi
// @Tags Publikasi
// @Produce json
// @Param id path string true "ID Publikasi"
// @Success 200 {object} Publikasi
// @Router /public/publikasi/{id} [get]
func (c *Controller) GetPublikasiByID(ctx *fiber.Ctx) error {
	idPublikasi := ctx.Params("id")
	if idPublikasi == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_publikasi is required",
		})
	}

	publikasi, err := c.service.GetPublikasiByID(idPublikasi)
	if err != nil {
		log.Printf("❌ Get publikasi failed: %v", err)
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Publikasi not found",
		})
	}

	return ctx.JSON(publikasi)
}

// GetPublikasiList godoc
// @Summary Get publikasi list
// @Description Get paginated list of publikasi
// @Tags Publikasi
// @Produce json
// @Param page query int false "Page number (default: 1)"
// @Param limit query int false "Limit per page (default: 10)"
// @Param search query string false "Search by judul or nama_jurnal"
// @Success 200 {object} PublikasiListResult
// @Router /public/publikasi/list [get]
func (c *Controller) GetPublikasiList(ctx *fiber.Ctx) error {
	page, _ := strconv.Atoi(ctx.Query("page", "1"))
	limit, _ := strconv.Atoi(ctx.Query("limit", "10"))
	search := ctx.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := c.service.GetPublikasiList(page, limit, search)
	if err != nil {
		log.Printf("❌ Get publikasi list failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(result)
}

// GetPublikasiStats godoc
// @Summary Get publikasi statistics
// @Description Get overall publikasi statistics
// @Tags Publikasi
// @Produce json
// @Success 200 {object} PublikasiStats
// @Router /public/publikasi/stats [get]
func (c *Controller) GetPublikasiStats(ctx *fiber.Ctx) error {
	stats, err := c.service.GetPublikasiStats()
	if err != nil {
		log.Printf("❌ Get publikasi stats failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(stats)
}

// GetTulisPubByPublikasi godoc
// @Summary Get penulis by publikasi
// @Description Get all penulis/authors for a publikasi
// @Tags Publikasi
// @Produce json
// @Param id path string true "ID Publikasi"
// @Success 200 {array} TulisPub
// @Router /public/publikasi/{id}/penulis [get]
func (c *Controller) GetTulisPubByPublikasi(ctx *fiber.Ctx) error {
	idPublikasi := ctx.Params("id")
	if idPublikasi == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "id_publikasi is required",
		})
	}

	penulisList, err := c.service.GetTulisPubByPublikasi(idPublikasi)
	if err != nil {
		log.Printf("❌ Get tulis_pub failed: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return ctx.JSON(penulisList)
}
