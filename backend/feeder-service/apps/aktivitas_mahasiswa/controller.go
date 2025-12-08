package aktivitas_mahasiswa

import (
	"context"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the aktivitas_mahasiswa controller
type Controller struct {
	service Service
}

// NewController creates a new aktivitas_mahasiswa controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetAktivitasList handles GET /aktivitas-mahasiswa
// @Summary Get list of aktivitas mahasiswa from database
// @Description Retrieves paginated list of aktivitas mahasiswa with search and filter capabilities
// @Tags AktivitasMahasiswa
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by judul aktivitas"
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional, e.g., 20251,20241)"
// @Param id_prodi query string false "Filter by ID Prodi (UUID)"
// @Param id_jenis_aktivitas query int false "Filter by ID Jenis Aktivitas"
// @Param sort_by query string false "Sort by field (judul, semester, jenis_aktivitas, last_sync)"
// @Param sort_order query string false "Sort order (asc, desc)"
// @Success 200 {object} map[string]interface{} "List of aktivitas mahasiswa"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa [get]
func (ctrl *Controller) GetAktivitasList(c *fiber.Ctx) error {
	ctx := context.Background()
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
	idJenisAktivitasStr := c.Query("id_jenis_aktivitas", "")
	sortBy := c.Query("sort_by", "")
	sortOrder := c.Query("sort_order", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	// Parse id_semester (optional - if empty, show all semesters)
	var idSemester []string
	if idSemesterStr != "" {
		idSemester = strings.Split(idSemesterStr, ",")
	}

	// Parse id_prodi (optional)
	var idProdiPtr *string
	if idProdi != "" {
		idProdiPtr = &idProdi
	}

	// Parse id_jenis_aktivitas (optional)
	var idJenisAktivitasPtr *int
	if idJenisAktivitasStr != "" {
		if val, err := strconv.Atoi(idJenisAktivitasStr); err == nil {
			idJenisAktivitasPtr = &val
		}
	}

	result, err := ctrl.service.GetAktivitasList(ctx, page, limit, search, idSemester, idProdiPtr, idJenisAktivitasPtr, sortBy, sortOrder)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve aktivitas list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Aktivitas list retrieved successfully",
		"data":    result,
	})
}

// GetAktivitasDetail handles GET /aktivitas-mahasiswa/:id_akt_mhs
// @Summary Get aktivitas detail by ID
// @Description Retrieves complete aktivitas information with anggota list from database
// @Tags AktivitasMahasiswa
// @Produce json
// @Param id_akt_mhs path string true "ID Aktivitas Mahasiswa (UUID)"
// @Success 200 {object} map[string]interface{} "Aktivitas detail with anggota"
// @Failure 404 {object} map[string]interface{} "Aktivitas not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa/{id_akt_mhs} [get]
func (ctrl *Controller) GetAktivitasDetail(c *fiber.Ctx) error {
	ctx := context.Background()
	idAktMhs := c.Params("id_akt_mhs")

	if idAktMhs == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_akt_mhs parameter is required",
		})
	}

	detail, err := ctrl.service.GetAktivitasDetail(ctx, idAktMhs)
	if err != nil {
		if err.Error() == "aktivitas not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Aktivitas not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve aktivitas detail",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Aktivitas detail retrieved successfully",
		"data":    detail,
	})
}

// GetStats handles GET /aktivitas-mahasiswa/stats
// @Summary Get statistics for aktivitas mahasiswa
// @Description Retrieves overall statistics including total aktivitas, total anggota, and last sync
// @Tags AktivitasMahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "Statistics"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa/stats [get]
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

// GetProdiList handles GET /aktivitas-mahasiswa/prodi
// @Summary Get list of active prodi
// @Description Retrieves list of active study programs from database
// @Tags AktivitasMahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "List of prodi"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa/prodi [get]
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

// GetSemesterList handles GET /aktivitas-mahasiswa/semester
// @Summary Get list of semesters with aktivitas data
// @Description Retrieves list of semesters that have aktivitas mahasiswa data
// @Tags AktivitasMahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "List of semesters"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa/semester [get]
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

// GetJenisAktivitasList handles GET /aktivitas-mahasiswa/jenis-aktivitas
// @Summary Get list of jenis aktivitas
// @Description Retrieves list of jenis aktivitas mahasiswa from reference table
// @Tags AktivitasMahasiswa
// @Produce json
// @Success 200 {object} map[string]interface{} "List of jenis aktivitas"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa/jenis-aktivitas [get]
func (ctrl *Controller) GetJenisAktivitasList(c *fiber.Ctx) error {
	ctx := context.Background()

	jenisAktivitasList, err := ctrl.service.GetJenisAktivitasList(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve jenis aktivitas list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Jenis aktivitas list retrieved successfully",
		"data":    jenisAktivitasList,
	})
}

// SyncAktivitasMahasiswa handles POST /aktivitas-mahasiswa/sync
// @Summary Sync aktivitas mahasiswa data from Neo Feeder API
// @Description Performs batch sync of aktivitas mahasiswa and anggota from Neo Feeder PDDIKTI API. If no semester filter provided, will sync all semesters.
// @Tags AktivitasMahasiswa
// @Accept json
// @Produce json
// @Param id_semester query string false "Filter by ID Semester (comma-separated, optional, e.g., 20251,20241). If not provided, syncs all semesters"
// @Param id_prodi query string false "Filter by ID Prodi (UUID, optional)"
// @Param id_jenis_aktivitas query int false "Filter by ID Jenis Aktivitas (optional, e.g., 24 for Magang)"
// @Param synced_by query string true "Username of person who triggered the sync"
// @Param force_sync query bool false "Force sync (default: false)"
// @Success 200 {object} BatchAktivitasSyncResult "Sync result"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /aktivitas-mahasiswa/sync [post]
func (ctrl *Controller) SyncAktivitasMahasiswa(c *fiber.Ctx) error {
	ctx := context.Background()
	idSemesterStr := c.Query("id_semester", "")
	idProdi := c.Query("id_prodi", "")
	idJenisAktivitasStr := c.Query("id_jenis_aktivitas", "")
	syncedBy := c.Query("synced_by", "system")
	forceSync := c.QueryBool("force_sync", false)

	// Parse id_semester (optional - if empty, sync all semesters)
	var idSemester []string
	if idSemesterStr != "" {
		idSemester = strings.Split(idSemesterStr, ",")
	}

	// Validate required parameters: synced_by
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

	// Parse id_jenis_aktivitas (optional)
	var idJenisAktivitasPtr *int
	if idJenisAktivitasStr != "" {
		if val, err := strconv.Atoi(idJenisAktivitasStr); err == nil {
			idJenisAktivitasPtr = &val
		}
	}

	// Build sync filter
	filter := &SyncFilter{
		IDSemester:       idSemester,
		IDProdi:          idProdiPtr,
		IDJenisAktivitas: idJenisAktivitasPtr,
		ForceSync:        forceSync,
	}

	// Perform batch sync
	result, err := ctrl.service.SyncAktivitasMahasiswa(ctx, filter, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync aktivitas mahasiswa from Neo Feeder",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Aktivitas mahasiswa sync completed",
		"data":    result,
	})
}
