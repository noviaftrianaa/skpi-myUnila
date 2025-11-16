package mahasiswa

import (
	"context"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the mahasiswa controller
type Controller struct {
	service Service
}

// NewController creates a new mahasiswa controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetMahasiswaList handles GET /mahasiswa
// @Summary Get list of mahasiswa from database
// @Description Retrieves paginated list of mahasiswa with search and filter capabilities
// @Tags Mahasiswa
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name, NPM, or NIM"
// @Param angkatan query string false "Filter by angkatan (comma-separated, e.g., 2021,2022)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID)"
// @Success 200 {object} map[string]interface{} "List of mahasiswa"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa [get]
func (ctrl *Controller) GetMahasiswaList(c *fiber.Ctx) error {
	ctx := context.Background()
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	angkatanStr := c.Query("angkatan", "")
	idProdi := c.Query("id_prodi", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Parse angkatan (comma-separated)
	var angkatanList []string
	if angkatanStr != "" {
		angkatanList = strings.Split(angkatanStr, ",")
		// Trim spaces
		for i := range angkatanList {
			angkatanList[i] = strings.TrimSpace(angkatanList[i])
		}
	}

	// Parse id_prodi (optional)
	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	result, err := ctrl.service.GetMahasiswaList(ctx, page, limit, search, angkatanList, idProdiPtr)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve mahasiswa list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa list retrieved successfully",
		"data":    result,
	})
}

// GetMahasiswaDetail handles GET /mahasiswa/:id_pd
// @Summary Get mahasiswa detail by ID
// @Description Retrieves complete mahasiswa information from database
// @Tags Mahasiswa
// @Produce json
// @Param id_pd path string true "ID PD (Peserta Didik ID)"
// @Success 200 {object} map[string]interface{} "Mahasiswa detail"
// @Failure 404 {object} map[string]interface{} "Mahasiswa not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa/{id_pd} [get]
func (ctrl *Controller) GetMahasiswaDetail(c *fiber.Ctx) error {
	ctx := context.Background()
	idPD := c.Params("id_pd")

	if idPD == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_pd parameter is required",
		})
	}

	mahasiswa, err := ctrl.service.GetMahasiswaByID(ctx, idPD)
	if err != nil {
		if err.Error() == "mahasiswa not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Mahasiswa not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve mahasiswa detail",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa detail retrieved successfully",
		"data":    mahasiswa,
	})
}

// GetMahasiswaStats handles GET /mahasiswa/stats
// @Summary Get mahasiswa statistics
// @Description Retrieves overall mahasiswa statistics (total, by angkatan, by prodi, etc)
// @Tags Mahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "Mahasiswa statistics"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa/stats [get]
func (ctrl *Controller) GetMahasiswaStats(c *fiber.Ctx) error {
	ctx := context.Background()

	stats, err := ctrl.service.GetMahasiswaStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve mahasiswa statistics",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa statistics retrieved successfully",
		"data":    stats,
	})
}

// GetAngkatanList handles GET /mahasiswa/helper/angkatan
// @Summary Get list of available angkatan
// @Description Retrieves distinct list of angkatan years from database
// @Tags Mahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "List of angkatan"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa/helper/angkatan [get]
func (ctrl *Controller) GetAngkatanList(c *fiber.Ctx) error {
	ctx := context.Background()

	angkatanList, err := ctrl.service.GetAngkatanList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve angkatan list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Angkatan list retrieved successfully",
		"data":    angkatanList,
	})
}

// GetProdiList handles GET /mahasiswa/helper/prodi
// @Summary Get list of active prodi
// @Description Retrieves list of active study programs from database
// @Tags Mahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "List of prodi"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa/helper/prodi [get]
func (ctrl *Controller) GetProdiList(c *fiber.Ctx) error {
	ctx := context.Background()

	prodiList, err := ctrl.service.GetProdiList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve prodi list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prodi list retrieved successfully",
		"data":    prodiList,
	})
}

// SyncMahasiswaByAngkatan handles POST /mahasiswa/sync
// @Summary Sync mahasiswa data by angkatan from Neo Feeder API
// @Description Performs batch sync of mahasiswa from Neo Feeder PDDIKTI API using goroutine workers
// @Tags Mahasiswa
// @Accept json
// @Produce json
// @Param angkatan query string true "Angkatan (comma-separated, e.g., 2021,2022)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID, optional)"
// @Param synced_by query string true "Username of person who triggered the sync"
// @Success 200 {object} BatchMahasiswaSyncResult "Sync result"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa/sync [post]
func (ctrl *Controller) SyncMahasiswaByAngkatan(c *fiber.Ctx) error {
	ctx := context.Background()
	angkatanStr := c.Query("angkatan", "")
	idProdi := c.Query("id_prodi", "")
	syncedBy := c.Query("synced_by", "system")

	// Validate required parameters
	if angkatanStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "angkatan parameter is required (e.g., 2021 or 2021,2022)",
		})
	}

	if syncedBy == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "synced_by parameter is required",
		})
	}

	// Parse angkatan (comma-separated)
	angkatanList := strings.Split(angkatanStr, ",")
	// Trim spaces and validate
	for i := range angkatanList {
		angkatanList[i] = strings.TrimSpace(angkatanList[i])
		// Validate format (should be 4 digits)
		if len(angkatanList[i]) != 4 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid angkatan format. Should be 4 digits (e.g., 2021)",
			})
		}
		// Validate numeric
		if _, err := strconv.Atoi(angkatanList[i]); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Angkatan must be numeric (e.g., 2021)",
			})
		}
	}

	// Parse id_prodi (optional)
	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	// Build sync filter
	filter := &SyncFilter{
		Angkatan: angkatanList,
		IDProdi:  idProdiPtr,
	}

	// Perform batch sync
	result, err := ctrl.service.SyncMahasiswaByAngkatan(ctx, filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync mahasiswa from Neo Feeder",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa sync completed",
		"data":    result,
	})
}

// SyncSingleMahasiswaTest handles POST /mahasiswa/sync-one/:id_pd
// @Summary Sync single mahasiswa by ID (for testing/debugging)
// @Description Syncs a single mahasiswa from Neo Feeder API by ID with detailed logging
// @Tags Mahasiswa
// @Produce json
// @Param id_pd path string true "ID PD (Peserta Didik ID from Neo Feeder)"
// @Success 200 {object} map[string]interface{} "Sync result"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /mahasiswa/sync-one/{id_pd} [post]
func (ctrl *Controller) SyncSingleMahasiswaTest(c *fiber.Ctx) error {
	ctx := context.Background()
	idPD := c.Params("id_pd")

	if idPD == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_pd parameter is required",
		})
	}

	result, err := ctrl.service.SyncSingleMahasiswaTest(ctx, idPD)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync mahasiswa",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Mahasiswa synced successfully",
		"data":    result,
	})
}
