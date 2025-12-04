package referensi

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	svc Service
}

func NewController(svc Service) *Controller {
	return &Controller{svc: svc}
}

// GetAllStats returns stats for all referensi endpoints
// @Summary Get all referensi stats
// @Tags Referensi
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/stats [get]
func (ctrl *Controller) GetAllStats(c *fiber.Ctx) error {
	stats, err := ctrl.svc.GetAllStats(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// GetEndpointStats returns stats for a specific endpoint
// @Summary Get referensi stats for specific endpoint
// @Tags Referensi
// @Accept json
// @Produce json
// @Param endpoint_key path string true "Endpoint key"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/{endpoint_key}/stats [get]
func (ctrl *Controller) GetEndpointStats(c *fiber.Ctx) error {
	endpointKey := c.Params("endpoint_key")

	stats, err := ctrl.svc.GetStats(c.Context(), endpointKey)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    stats,
	})
}

// GetData returns paginated data for an endpoint
// @Summary Get referensi data
// @Tags Referensi
// @Accept json
// @Produce json
// @Param endpoint_key path string true "Endpoint key"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search query"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/{endpoint_key} [get]
func (ctrl *Controller) GetData(c *fiber.Ctx) error {
	endpointKey := c.Params("endpoint_key")

	// Parse pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	data, err := ctrl.svc.GetData(c.Context(), endpointKey, page, limit, search)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    data.Data,
		"meta": fiber.Map{
			"total": data.Total,
			"page":  data.Page,
			"limit": data.Limit,
		},
	})
}

// GetDetail returns detail for a specific record
// @Summary Get referensi detail
// @Tags Referensi
// @Accept json
// @Produce json
// @Param endpoint_key path string true "Endpoint key"
// @Param id path string true "Record ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/{endpoint_key}/{id} [get]
func (ctrl *Controller) GetDetail(c *fiber.Ctx) error {
	endpointKey := c.Params("endpoint_key")
	id := c.Params("id")

	data, err := ctrl.svc.GetDetail(c.Context(), endpointKey, id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}

// SyncEndpoint syncs a single endpoint
// @Summary Sync referensi endpoint
// @Tags Referensi
// @Accept json
// @Produce json
// @Param endpoint_key path string true "Endpoint key"
// @Param synced_by query string true "User who initiated sync"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/{endpoint_key}/sync [post]
func (ctrl *Controller) SyncEndpoint(c *fiber.Ctx) error {
	endpointKey := c.Params("endpoint_key")
	syncedBy := c.Query("synced_by", "system")

	result, err := ctrl.svc.SyncEndpoint(c.Context(), endpointKey, syncedBy)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
		"message": "Sync completed",
	})
}

// SyncMultiple syncs multiple endpoints
// @Summary Sync multiple referensi endpoints
// @Tags Referensi
// @Accept json
// @Produce json
// @Param body body SyncMultipleRequest true "Sync request"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/sync [post]
func (ctrl *Controller) SyncMultiple(c *fiber.Ctx) error {
	var req SyncMultipleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
		})
	}

	if len(req.EndpointKeys) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "endpoint_keys is required",
		})
	}

	if req.SyncedBy == "" {
		req.SyncedBy = "system"
	}

	result, err := ctrl.svc.SyncMultiple(c.Context(), req.EndpointKeys, req.SyncedBy)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
		"message": result.Message,
	})
}

// GetAvailableEndpoints returns list of available endpoints
// @Summary Get available referensi endpoints
// @Tags Referensi
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/referensi/endpoints [get]
func (ctrl *Controller) GetAvailableEndpoints(c *fiber.Ctx) error {
	endpoints := GetReferensiEndpoints()

	return c.JSON(fiber.Map{
		"success": true,
		"data":    endpoints,
	})
}

// SyncMultipleRequest for batch sync
type SyncMultipleRequest struct {
	EndpointKeys []string `json:"endpoint_keys"`
	SyncedBy     string   `json:"synced_by"`
	ForceSync    bool     `json:"force_sync"`
}
