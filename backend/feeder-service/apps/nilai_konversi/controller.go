package nilai_konversi

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the nilai_konversi controller
type Controller struct {
	service Service
}

// NewController creates a new nilai_konversi controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetNilaiKonversiList handles GET /nilai-konversi
// @Summary Get list of nilai konversi from database
// @Description Retrieves paginated list of nilai konversi (combined konversi + transfer) with search and filter capabilities
// @Tags NilaiKonversi
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by NIM, nama mahasiswa, or nama matkul"
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional, e.g., 20251,20241)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID)"
// @Param jenis_konversi query string false "Filter by jenis (konversi, transfer)"
// @Param sort_by query string false "Sort by field (nim, nama_mahasiswa, nilai_huruf, nilai_angka, jenis_konversi, last_sync)"
// @Param sort_order query string false "Sort order (asc, desc)"
// @Success 200 {object} map[string]interface{} "List of nilai konversi"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-konversi [get]
func (ctrl *Controller) GetNilaiKonversiList(c *fiber.Ctx) error {
	ctx := context.Background()
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
	jenisKonversi := c.Query("jenis_konversi", "")
	sortBy := c.Query("sort_by", "")
	sortOrder := c.Query("sort_order", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Parse id_semester (optional)
	var idSemester []string
	if idSemesterStr != "" {
		idSemester = strings.Split(idSemesterStr, ",")
	}

	// Parse id_prodi (optional)
	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	// Parse jenis_konversi (optional)
	var jenisKonversiPtr *string
	if jenisKonversi != "" {
		jenisKonversiPtr = &jenisKonversi
	}

	result, err := ctrl.service.GetNilaiKonversiList(ctx, page, limit, search, idSemester, idProdiPtr, jenisKonversiPtr, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve nilai konversi list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Nilai konversi list retrieved successfully",
		"data":    result,
	})
}

// GetStats handles GET /nilai-konversi/stats
// @Summary Get statistics for nilai konversi
// @Description Retrieves overall statistics including total konversi, transfer, mahasiswa, and last sync
// @Tags NilaiKonversi
// @Produce json
// @Success 200 {object} map[string]interface{} "Statistics"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-konversi/stats [get]
func (ctrl *Controller) GetStats(c *fiber.Ctx) error {
	ctx := context.Background()

	stats, err := ctrl.service.GetStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve statistics",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Statistics retrieved successfully",
		"data":    stats,
	})
}

// GetProdiList handles GET /nilai-konversi/helper/prodi
// @Summary Get list of active prodi
// @Description Retrieves list of active study programs from database
// @Tags NilaiKonversi
// @Produce json
// @Success 200 {object} map[string]interface{} "List of prodi"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-konversi/helper/prodi [get]
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

// GetSemesterList handles GET /nilai-konversi/helper/semester
// @Summary Get list of semesters with nilai konversi/transfer data
// @Description Retrieves list of semesters that have nilai konversi or transfer data
// @Tags NilaiKonversi
// @Produce json
// @Success 200 {object} map[string]interface{} "List of semesters"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-konversi/helper/semester [get]
func (ctrl *Controller) GetSemesterList(c *fiber.Ctx) error {
	ctx := context.Background()

	semesterList, err := ctrl.service.GetSemesterList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve semester list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Semester list retrieved successfully",
		"data":    semesterList,
	})
}

// SyncNilaiKonversi handles POST /nilai-konversi/sync
// @Summary Sync nilai konversi data from Neo Feeder API
// @Description Performs batch sync of nilai konversi and transfer from Neo Feeder PDDIKTI API
// @Tags NilaiKonversi
// @Accept json
// @Produce json
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID, optional)"
// @Param synced_by query string true "Username of person who triggered the sync"
// @Param force_sync query bool false "Force sync (default: false)"
// @Success 200 {object} SyncResult "Sync result"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-konversi/sync [post]
func (ctrl *Controller) SyncNilaiKonversi(c *fiber.Ctx) error {
	ctx := context.Background()
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
	syncedBy := c.Query("synced_by", "system")
	forceSync := c.QueryBool("force_sync", false)

	// Parse id_semester (optional)
	var idSemester []string
	if idSemesterStr != "" {
		idSemester = strings.Split(idSemesterStr, ",")
	}

	// Validate required parameters
	if syncedBy == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "synced_by parameter is required",
		})
	}

	// Parse id_prodi (optional)
	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	// Build sync filter
	filter := &SyncFilter{
		IDSemester: idSemester,
		IDProdi:    idProdiPtr,
		ForceSync:  forceSync,
	}

	// Perform batch sync
	result, err := ctrl.service.SyncNilaiKonversi(ctx, filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync nilai konversi from Neo Feeder",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Nilai konversi sync completed",
		"data":    result,
	})
}
