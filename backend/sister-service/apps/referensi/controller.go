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

// ==================== NEGARA HANDLERS ====================

// GetAllNegara handles GET /api/v1/referensi/negara
func (ctrl *Controller) GetAllNegara(c *fiber.Ctx) error {
	negaraList, err := ctrl.service.GetAllNegara(c.Context())
	if err != nil {
		log.Printf("Error in GetAllNegara controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch negara", err.Error())
	}

	return response.Success(c, "Negara retrieved successfully", negaraList)
}

// GetNegaraByID handles GET /api/v1/referensi/negara/:id
func (ctrl *Controller) GetNegaraByID(c *fiber.Ctx) error {
	id := c.Params("id")

	negara, err := ctrl.service.GetNegaraByID(c.Context(), id)
	if err != nil {
		log.Printf("Error in GetNegaraByID controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch negara", err.Error())
	}

	if negara == nil {
		return response.NotFound(c, "Negara not found")
	}

	return response.Success(c, "Negara retrieved successfully", negara)
}

// SyncNegaraFromSister handles POST /api/v1/referensi/negara/sync
func (ctrl *Controller) SyncNegaraFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncNegaraFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncNegaraFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync negara from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data negara berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Negara synced successfully", syncResp)
}

// ==================== JENJANG PENDIDIKAN HANDLERS ====================

// GetAllJenjangPendidikan handles GET /api/v1/referensi/jenjang-pendidikan
func (ctrl *Controller) GetAllJenjangPendidikan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenjangPendidikan(c.Context())
	if err != nil {
		log.Printf("Error in GetAllJenjangPendidikan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenjang pendidikan", err.Error())
	}

	return response.Success(c, "Jenjang pendidikan retrieved successfully", list)
}

// SyncJenjangPendidikanFromSister handles POST /api/v1/referensi/jenjang-pendidikan/sync
func (ctrl *Controller) SyncJenjangPendidikanFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncJenjangPendidikanFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenjangPendidikanFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync jenjang pendidikan from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data jenjang pendidikan berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Jenjang pendidikan synced successfully", syncResp)
}

// ==================== GELAR AKADEMIK HANDLERS ====================

// GetAllGelarAkademik handles GET /api/v1/referensi/gelar-akademik
func (ctrl *Controller) GetAllGelarAkademik(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllGelarAkademik(c.Context())
	if err != nil {
		log.Printf("Error in GetAllGelarAkademik controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch gelar akademik", err.Error())
	}

	return response.Success(c, "Gelar akademik retrieved successfully", list)
}

// SyncGelarAkademikFromSister handles POST /api/v1/referensi/gelar-akademik/sync
func (ctrl *Controller) SyncGelarAkademikFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncGelarAkademikFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncGelarAkademikFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync gelar akademik from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data gelar akademik berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Gelar akademik synced successfully", syncResp)
}

// ==================== SEMESTER HANDLERS ====================

// GetAllSemester handles GET /api/v1/referensi/semester
func (ctrl *Controller) GetAllSemester(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllSemester(c.Context())
	if err != nil {
		log.Printf("Error in GetAllSemester controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch semester", err.Error())
	}

	return response.Success(c, "Semester retrieved successfully", list)
}

// SyncSemesterFromSister handles POST /api/v1/referensi/semester/sync
func (ctrl *Controller) SyncSemesterFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncSemesterFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncSemesterFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync semester from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data semester berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Semester synced successfully", syncResp)
}

// ==================== METADATA & BATCH SYNC HANDLERS ====================

// GetAllReferensiMetadata handles GET /api/v1/referensi/metadata
func (ctrl *Controller) GetAllReferensiMetadata(c *fiber.Ctx) error {
	metadata, err := ctrl.service.GetAllReferensiMetadata(c.Context())
	if err != nil {
		log.Printf("Error in GetAllReferensiMetadata controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch referensi metadata", err.Error())
	}

	return response.Success(c, "Referensi metadata retrieved successfully", metadata)
}

// BatchSyncFromSister handles POST /api/v1/referensi/batch-sync
func (ctrl *Controller) BatchSyncFromSister(c *fiber.Ctx) error {
	// Parse request body
	var req BatchSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", err.Error())
	}

	// Validate request
	if len(req.Endpoints) == 0 {
		return response.BadRequest(c, "No endpoints specified", "endpoints array cannot be empty")
	}

	// Get user info from context
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	log.Printf("🔄 Batch sync requested by %s for %d endpoints: %v",
		username, len(req.Endpoints), req.Endpoints)

	// Execute batch sync
	result, err := ctrl.service.BatchSyncFromSister(c.Context(), req.Endpoints, username.(string))
	if err != nil {
		log.Printf("❌ Error in BatchSyncFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to execute batch sync", err.Error())
	}

	log.Printf("✅ Batch sync completed: %d/%d succeeded in %s",
		result.TotalSuccess, result.TotalRequested, result.Duration)

	return response.Success(c, "Batch sync completed", result)
}
