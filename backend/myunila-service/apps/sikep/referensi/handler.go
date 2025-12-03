package referensi

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

// Handler for referensi endpoints
type Handler struct {
	svc Service
}

// NewHandler creates a new referensi handler
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// GetMetadata returns metadata for all referensi endpoints
func (h *Handler) GetMetadata(c *fiber.Ctx) error {
	ctx := c.Context()

	metadata, err := h.svc.GetMetadata(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get metadata",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Metadata retrieved successfully",
		"data":    metadata,
	})
}

// BatchSync syncs multiple endpoints in parallel
func (h *Handler) BatchSync(c *fiber.Ctx) error {
	ctx := c.Context()

	var req BatchSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if len(req.Endpoints) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "No endpoints specified",
		})
	}

	syncedBy := c.Query("synced_by", "system")

	response, err := h.svc.BatchSync(ctx, req.Endpoints, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Batch sync failed",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Batch sync completed",
		"data":    response,
	})
}

// SyncOrganisasi syncs organisasi data
func (h *Handler) SyncOrganisasi(c *fiber.Ctx) error {
	return h.syncEndpoint(c, "organisasi")
}

// SyncFungsional syncs fungsional data
func (h *Handler) SyncFungsional(c *fiber.Ctx) error {
	return h.syncEndpoint(c, "fungsional")
}

// SyncStruktural syncs struktural data
func (h *Handler) SyncStruktural(c *fiber.Ctx) error {
	return h.syncEndpoint(c, "struktural")
}

// SyncGolonganPNS syncs golongan PNS data
func (h *Handler) SyncGolonganPNS(c *fiber.Ctx) error {
	return h.syncEndpoint(c, "golongan_pns")
}

// SyncGolonganPPPK syncs golongan PPPK data
func (h *Handler) SyncGolonganPPPK(c *fiber.Ctx) error {
	return h.syncEndpoint(c, "golongan_pppk")
}

// SyncPendidikan syncs pendidikan data
func (h *Handler) SyncPendidikan(c *fiber.Ctx) error {
	return h.syncEndpoint(c, "pendidikan")
}

func (h *Handler) syncEndpoint(c *fiber.Ctx, key string) error {
	ctx := c.Context()
	syncedBy := c.Query("synced_by", "system")

	result, err := h.svc.SyncEndpoint(ctx, key, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": result.Message,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": result.Message,
		"data":    result,
	})
}

// ========================================
// Get Data Endpoints
// ========================================

// GetOrganisasi returns organisasi data
func (h *Handler) GetOrganisasi(c *fiber.Ctx) error {
	ctx := c.Context()

	data, err := h.svc.GetOrganisasiList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get organisasi data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Organisasi data retrieved successfully",
		"data":    data,
	})
}

// GetFungsional returns fungsional data
func (h *Handler) GetFungsional(c *fiber.Ctx) error {
	ctx := c.Context()

	data, err := h.svc.GetFungsionalList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get fungsional data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Fungsional data retrieved successfully",
		"data":    data,
	})
}

// GetStruktural returns struktural data
func (h *Handler) GetStruktural(c *fiber.Ctx) error {
	ctx := c.Context()

	data, err := h.svc.GetStrukturalList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get struktural data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Struktural data retrieved successfully",
		"data":    data,
	})
}

// GetGolonganPNS returns golongan PNS data
func (h *Handler) GetGolonganPNS(c *fiber.Ctx) error {
	ctx := c.Context()

	data, err := h.svc.GetGolonganPNSList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get golongan PNS data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Golongan PNS data retrieved successfully",
		"data":    data,
	})
}

// GetGolonganPPPK returns golongan PPPK data
func (h *Handler) GetGolonganPPPK(c *fiber.Ctx) error {
	ctx := c.Context()

	data, err := h.svc.GetGolonganPPPKList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get golongan PPPK data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Golongan PPPK data retrieved successfully",
		"data":    data,
	})
}

// GetPendidikan returns pendidikan data
func (h *Handler) GetPendidikan(c *fiber.Ctx) error {
	ctx := c.Context()

	data, err := h.svc.GetPendidikanList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get pendidikan data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pendidikan data retrieved successfully",
		"data":    data,
	})
}

// ========================================
// Paginated Data Endpoint
// ========================================

// GetEndpointDataPaginated returns paginated data for any endpoint
func (h *Handler) GetEndpointDataPaginated(c *fiber.Ctx) error {
	ctx := c.Context()

	// Get endpoint key from URL param
	key := c.Params("key")
	if key == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Endpoint key is required",
		})
	}

	// Parse pagination params with defaults
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := h.svc.GetEndpointDataPaginated(ctx, key, page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Data retrieved successfully",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}
