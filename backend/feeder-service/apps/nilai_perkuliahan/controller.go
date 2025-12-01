package nilai_perkuliahan

import (
	"context"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the nilai_perkuliahan controller
type Controller struct {
	service Service
}

// NewController creates a new nilai_perkuliahan controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetNilaiPerkuliahanList handles GET /nilai-perkuliahan
// @Summary Get list of nilai perkuliahan from database
// @Description Retrieves paginated list of nilai perkuliahan with search and filter capabilities
// @Tags NilaiPerkuliahan
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by NIM, nama mahasiswa, or nama matkul"
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional, e.g., 20251,20241)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID)"
// @Param id_kelas query string false "Filter by ID Kelas (UUID)"
// @Param sort_by query string false "Sort by field (nim, nama_mahasiswa, nilai_huruf, nilai_angka, last_sync)"
// @Param sort_order query string false "Sort order (asc, desc)"
// @Success 200 {object} map[string]interface{} "List of nilai perkuliahan"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan [get]
func (ctrl *Controller) GetNilaiPerkuliahanList(c *fiber.Ctx) error {
	ctx := context.Background()
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
	idKelas := c.Query("id_kelas", "")
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

	// Parse id_kelas (optional)
	var idKelasPtr *string
	if idKelas != "" {
		idKelasPtr = &idKelas
	}

	result, err := ctrl.service.GetNilaiPerkuliahanList(ctx, page, limit, search, idSemester, idProdiPtr, idKelasPtr, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve nilai perkuliahan list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Nilai perkuliahan list retrieved successfully",
		"data":    result,
	})
}

// GetNilaiByKelas handles GET /nilai-perkuliahan/kelas/:id_kls
// @Summary Get nilai by kelas ID
// @Description Retrieves all nilai perkuliahan for a specific kelas
// @Tags NilaiPerkuliahan
// @Produce json
// @Param id_kls path string true "ID Kelas (UUID)"
// @Success 200 {object} map[string]interface{} "List of nilai for the kelas"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan/kelas/{id_kls} [get]
func (ctrl *Controller) GetNilaiByKelas(c *fiber.Ctx) error {
	ctx := context.Background()
	idKls := c.Params("id_kls")

	if idKls == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_kls parameter is required",
		})
	}

	nilaiList, err := ctrl.service.GetNilaiByKelas(ctx, idKls)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve nilai by kelas",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Nilai by kelas retrieved successfully",
		"data":    nilaiList,
	})
}

// GetStats handles GET /nilai-perkuliahan/stats
// @Summary Get statistics for nilai perkuliahan
// @Description Retrieves overall statistics including total nilai, total mahasiswa, and last sync
// @Tags NilaiPerkuliahan
// @Produce json
// @Success 200 {object} map[string]interface{} "Statistics"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan/stats [get]
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

// GetProdiList handles GET /nilai-perkuliahan/helper/prodi
// @Summary Get list of active prodi
// @Description Retrieves list of active study programs from database
// @Tags NilaiPerkuliahan
// @Produce json
// @Success 200 {object} map[string]interface{} "List of prodi"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan/helper/prodi [get]
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

// GetSemesterList handles GET /nilai-perkuliahan/helper/semester
// @Summary Get list of semesters with nilai data
// @Description Retrieves list of semesters that have nilai perkuliahan data
// @Tags NilaiPerkuliahan
// @Produce json
// @Success 200 {object} map[string]interface{} "List of semesters"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan/helper/semester [get]
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

// GetKelasListBySemesterAndProdi handles GET /nilai-perkuliahan/helper/kelas
// @Summary Get list of kelas for sync dropdown
// @Description Retrieves list of kelas filtered by semester and prodi for sync dropdown
// @Tags NilaiPerkuliahan
// @Produce json
// @Param id_semester query string false "Filter by ID Semester (comma-separated)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID)"
// @Success 200 {object} map[string]interface{} "List of kelas"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan/helper/kelas [get]
func (ctrl *Controller) GetKelasListBySemesterAndProdi(c *fiber.Ctx) error {
	ctx := context.Background()
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")

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

	kelasList, err := ctrl.service.GetKelasListBySemesterAndProdi(ctx, idSemester, idProdiPtr)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve kelas list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kelas list retrieved successfully",
		"data":    kelasList,
	})
}

// SyncNilaiPerkuliahan handles POST /nilai-perkuliahan/sync
// @Summary Sync nilai perkuliahan data from Neo Feeder API
// @Description Performs batch sync of nilai perkuliahan from Neo Feeder PDDIKTI API
// @Tags NilaiPerkuliahan
// @Accept json
// @Produce json
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID, optional)"
// @Param id_kelas query string false "Filter by ID Kelas (UUID, optional - sync specific kelas)"
// @Param synced_by query string true "Username of person who triggered the sync"
// @Param force_sync query bool false "Force sync (default: false)"
// @Success 200 {object} BatchNilaiSyncResult "Sync result"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /nilai-perkuliahan/sync [post]
func (ctrl *Controller) SyncNilaiPerkuliahan(c *fiber.Ctx) error {
	ctx := context.Background()
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
	idKelas := c.Query("id_kelas", "")
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

	// Parse id_kelas (optional)
	var idKelasPtr *string
	if idKelas != "" {
		idKelasPtr = &idKelas
	}

	// Build sync filter
	filter := &SyncFilter{
		IDSemester: idSemester,
		IDProdi:    idProdiPtr,
		IDKelas:    idKelasPtr,
		ForceSync:  forceSync,
	}

	// Perform batch sync
	result, err := ctrl.service.SyncNilaiPerkuliahan(ctx, filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync nilai perkuliahan from Neo Feeder",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Nilai perkuliahan sync completed",
		"data":    result,
	})
}
