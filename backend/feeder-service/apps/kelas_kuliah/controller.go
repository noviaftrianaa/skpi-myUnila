package kelas_kuliah

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the kelas_kuliah controller
type Controller struct {
	service Service
}

// NewController creates a new kelas_kuliah controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetKelasKuliahList handles GET /kelas-kuliah
// @Summary Get list of kelas kuliah from database
// @Description Retrieves paginated list of kelas kuliah with search and filter capabilities
// @Tags KelasKuliah
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by nama kelas or nama matkul"
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional, e.g., 20251,20241)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID)"
// @Param sort_by query string false "Sort by field (nm_kls, id_semester, nama_matkul, sks_mk, jumlah_dosen, last_sync)"
// @Param sort_order query string false "Sort order (asc, desc)"
// @Success 200 {object} map[string]interface{} "List of kelas kuliah"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /kelas-kuliah [get]
func (ctrl *Controller) GetKelasKuliahList(c *fiber.Ctx) error {
	ctx := context.Background()
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
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

	result, err := ctrl.service.GetKelasKuliahList(ctx, page, limit, search, idSemester, idProdiPtr, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve kelas kuliah list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kelas kuliah list retrieved successfully",
		"data":    result,
	})
}

// GetKelasKuliahDetail handles GET /kelas-kuliah/:id_kls
// @Summary Get kelas kuliah detail by ID
// @Description Retrieves complete kelas kuliah information with dosen pengajar list from database
// @Tags KelasKuliah
// @Produce json
// @Param id_kls path string true "ID Kelas Kuliah (UUID)"
// @Success 200 {object} map[string]interface{} "Kelas kuliah detail with dosen pengajar"
// @Failure 404 {object} map[string]interface{} "Kelas kuliah not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /kelas-kuliah/{id_kls} [get]
func (ctrl *Controller) GetKelasKuliahDetail(c *fiber.Ctx) error {
	ctx := context.Background()
	idKls := c.Params("id_kls")

	if idKls == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_kls parameter is required",
		})
	}

	detail, err := ctrl.service.GetKelasKuliahDetail(ctx, idKls)
	if err != nil {
		if err.Error() == "kelas kuliah not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Kelas kuliah not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve kelas kuliah detail",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kelas kuliah detail retrieved successfully",
		"data":    detail,
	})
}

// GetStats handles GET /kelas-kuliah/stats
// @Summary Get statistics for kelas kuliah
// @Description Retrieves overall statistics including total kelas, total dosen, and last sync
// @Tags KelasKuliah
// @Produce json
// @Success 200 {object} map[string]interface{} "Statistics"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /kelas-kuliah/stats [get]
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

// GetProdiList handles GET /kelas-kuliah/helper/prodi
// @Summary Get list of active prodi
// @Description Retrieves list of active study programs from database
// @Tags KelasKuliah
// @Produce json
// @Success 200 {object} map[string]interface{} "List of prodi"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /kelas-kuliah/helper/prodi [get]
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

// GetSemesterList handles GET /kelas-kuliah/helper/semester
// @Summary Get list of semesters with kelas kuliah data
// @Description Retrieves list of semesters that have kelas kuliah data
// @Tags KelasKuliah
// @Produce json
// @Success 200 {object} map[string]interface{} "List of semesters"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /kelas-kuliah/helper/semester [get]
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

// SyncKelasKuliah handles POST /kelas-kuliah/sync
// @Summary Sync kelas kuliah data from Neo Feeder API
// @Description Performs batch sync of kelas kuliah and dosen pengajar from Neo Feeder PDDIKTI API
// @Tags KelasKuliah
// @Accept json
// @Produce json
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID, optional)"
// @Param synced_by query string true "Username of person who triggered the sync"
// @Param force_sync query bool false "Force sync (default: false)"
// @Success 200 {object} BatchKelasKuliahSyncResult "Sync result"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /kelas-kuliah/sync [post]
func (ctrl *Controller) SyncKelasKuliah(c *fiber.Ctx) error {
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
	result, err := ctrl.service.SyncKelasKuliah(ctx, filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync kelas kuliah from Neo Feeder",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kelas kuliah sync completed",
		"data":    result,
	})
}
