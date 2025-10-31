package penugasan

import (
	"log"
	"sister-service/pkg/response"

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

// GetAllPenugasanByIDSDM handles GET /api/v1/penugasan
// Query param: id_sdm (required)
func (ctrl *Controller) GetAllPenugasanByIDSDM(c *fiber.Ctx) error {
	idSDM := c.Query("id_sdm")
	if idSDM == "" {
		return response.BadRequest(c, "Parameter id_sdm is required", nil)
	}

	penugasanList, err := ctrl.service.GetAllPenugasanByIDSDM(idSDM)
	if err != nil {
		log.Printf("Error in GetAllPenugasanByIDSDM controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch penugasan", err.Error())
	}

	return response.Success(c, "Penugasan retrieved successfully", penugasanList)
}

// GetPenugasanByIDRegPTK handles GET /api/v1/penugasan/:id
func (ctrl *Controller) GetPenugasanByIDRegPTK(c *fiber.Ctx) error {
	idRegPTK := c.Params("id")
	if idRegPTK == "" {
		return response.BadRequest(c, "Parameter id is required", nil)
	}

	penugasan, err := ctrl.service.GetPenugasanByIDRegPTK(idRegPTK)
	if err != nil {
		log.Printf("Error in GetPenugasanByIDRegPTK controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch penugasan", err.Error())
	}

	if penugasan == nil {
		return response.NotFound(c, "Penugasan not found")
	}

	return response.Success(c, "Penugasan retrieved successfully", penugasan)
}

// SyncPenugasanByIDSDM handles POST /api/v1/penugasan/sync
// Query params: id_sdm (required), synced_by (optional)
func (ctrl *Controller) SyncPenugasanByIDSDM(c *fiber.Ctx) error {
	idSDM := c.Query("id_sdm")
	if idSDM == "" {
		return response.BadRequest(c, "Parameter id_sdm is required", nil)
	}

	syncedBy := c.Query("synced_by", "system")

	log.Printf("🔄 Sync penugasan request for id_sdm: %s, synced_by: %s", idSDM, syncedBy)

	result, err := ctrl.service.SyncPenugasanByIDSDM(idSDM, syncedBy)
	if err != nil {
		log.Printf("Error in SyncPenugasanByIDSDM controller: %v", err)
		return response.InternalServerError(c, "Failed to sync penugasan", err.Error())
	}

	return response.Success(c, "Penugasan synced successfully", result)
}
