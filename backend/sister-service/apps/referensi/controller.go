package referensi

import (
	"log"
	"sister-service/pkg/response"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

// NewController creates a new controller instance
func NewController(service Service) *Controller {
	return &Controller{service: service}
}

// GetAllAgama handles GET request to fetch all agama
// @Summary Get all agama
// @Description Retrieve all agama (religion) reference data
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]referensi.Agama}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/agama [get]
func (ctrl *Controller) GetAllAgama(c *fiber.Ctx) error {
	agamaList, err := ctrl.service.GetAllAgama(c.Context())
	if err != nil {
		log.Printf("Error in GetAllAgama controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch agama", err.Error())
	}

	return response.Success(c, "Agama retrieved successfully", agamaList)
}

// GetAgamaByID handles GET request to fetch agama by ID
// @Summary Get agama by ID
// @Description Retrieve agama (religion) reference data by ID
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Agama ID"
// @Success 200 {object} response.APIResponse{data=referensi.Agama}
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/agama/{id} [get]
func (ctrl *Controller) GetAgamaByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return response.BadRequest(c, "Invalid ID parameter", err.Error())
	}

	agama, err := ctrl.service.GetAgamaByID(c.Context(), id)
	if err != nil {
		log.Printf("Error in GetAgamaByID controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch agama", err.Error())
	}

	if agama == nil {
		return response.NotFound(c, "Agama not found")
	}

	return response.Success(c, "Agama retrieved successfully", agama)
}

// SyncAgamaFromSister handles POST request to sync agama from Sister API
// @Summary Sync agama from Sister API
// @Description Synchronize agama (religion) data from Sister Kemdikbud API. User identity is automatically extracted from JWT token.
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=referensi.SyncResponse}
// @Failure 401 {object} response.APIResponse "Unauthorized - Missing or invalid JWT token"
// @Failure 403 {object} response.APIResponse "Forbidden - Requires Developer role"
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/agama/sync [post]
func (ctrl *Controller) SyncAgamaFromSister(c *fiber.Ctx) error {
	// Extract user info from JWT context (set by JWTAuth middleware)
	userID, _ := c.Locals("user_id").(string)
	username, _ := c.Locals("username").(string)
	name, _ := c.Locals("name").(string)

	// Use username as synced_by identifier (or use name/ID as needed)
	syncedBy := username
	if syncedBy == "" {
		syncedBy = name // Fallback to name
	}
	if syncedBy == "" {
		syncedBy = userID // Fallback to ID
	}
	if syncedBy == "" {
		syncedBy = "system" // Last fallback
	}

	log.Printf("🔄 Sync agama initiated by: %s (ID: %s, Name: %s)", username, userID, name)

	totalRecords, err := ctrl.service.SyncAgamaFromSister(c.Context(), syncedBy)
	if err != nil {
		log.Printf("❌ Error in SyncAgamaFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync agama from Sister API", err.Error())
	}

	log.Printf("✅ Sync completed: %d records synced by %s", totalRecords, syncedBy)

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     syncedBy,
		Message:      "Agama data synchronized successfully",
	}

	return response.Success(c, "Sync completed successfully", syncResp)
}
