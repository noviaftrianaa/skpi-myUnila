package dosen

import (
	"fmt"
	"strings"
	"sister-service/pkg/crypto"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the dosen controller
type Controller struct {
	service         Service
	laravelCrypto   *crypto.LaravelEncryption
}

// NewController creates a new dosen controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// NewControllerWithCrypto creates a new dosen controller with Laravel encryption support
func NewControllerWithCrypto(service Service, laravelCrypto *crypto.LaravelEncryption) *Controller {
	return &Controller{
		service:       service,
		laravelCrypto: laravelCrypto,
	}
}

// GetDosenPhoto handles GET /public/dosen/photo/:encrypted_id
// @Summary Get dosen photo from SISTER API
// @Description Fetches dosen photo binary from SISTER API using encrypted dosen ID
// @Tags Dosen
// @Produce image/jpeg,image/png
// @Param encrypted_id path string true "Encrypted Dosen ID"
// @Success 200 {file} binary "Photo binary data"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "Photo not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /public/dosen/photo/{encrypted_id} [get]
func (ctrl *Controller) GetDosenPhoto(c *fiber.Ctx) error {
	encryptedId := c.Params("encrypted_id")

	if encryptedId == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "encrypted_id parameter is required",
		})
	}

	// Decrypt the encrypted ID to get actual id_sdm
	var idSdm string
	if ctrl.laravelCrypto != nil {
		decrypted, err := ctrl.laravelCrypto.Decrypt(encryptedId)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid dosen ID",
				"error":   "Decryption failed",
			})
		}
		idSdm = decrypted
	} else {
		// Fallback: assume it's already a plain id_sdm (for backward compatibility)
		idSdm = encryptedId
	}

	// Get photo from SISTER API
	photoBytes, contentType, err := ctrl.service.GetDosenPhoto(idSdm)
	if err != nil {
		// Check if it's a 404 error
		if err.Error() == "photo not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Photo not found for this dosen",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch dosen photo",
			"error":   err.Error(),
		})
	}

	// Set content type header
	c.Set("Content-Type", contentType)

	// Set cache headers (cache for 1 hour)
	c.Set("Cache-Control", "public, max-age=3600")

	// Return photo binary
	return c.Send(photoBytes)
}

// GetDosenBidangIlmu handles GET /public/dosen/bidang_ilmu/:id_sdm
// @Summary Get dosen bidang keahlian from SISTER API
// @Description Fetches dosen bidang ilmu/keahlian from SISTER API
// @Tags Dosen
// @Produce json
// @Param id_sdm path string true "ID SDM (Dosen ID)"
// @Success 200 {object} map[string]interface{} "Bidang keahlian data"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "Data not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /public/dosen/bidang_ilmu/{id_sdm} [get]
func (ctrl *Controller) GetDosenBidangIlmu(c *fiber.Ctx) error {
	idSdm := c.Params("id_sdm")

	if idSdm == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
	}

	// Get bidang ilmu from SISTER API
	bidangIlmu, err := ctrl.service.GetDosenBidangIlmu(idSdm)
	if err != nil {
		// Check if it's a 404 error
		if err.Error() == "data not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Bidang keahlian not found for this dosen",
				"data":    []interface{}{},
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to fetch bidang keahlian",
			"error":   err.Error(),
		})
	}

	// Return bidang ilmu data
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Bidang keahlian retrieved successfully",
		"data":    bidangIlmu,
	})
}

// GetDosenList handles GET /public/dosen
// @Summary Get list of dosen from database
// @Description Retrieves paginated list of dosen with search and filter capabilities
// @Tags Dosen
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search by name, NIDN, or NIP"
// @Param id_jns_sdm query int false "Filter by jenis SDM"
// @Param id_stat_aktif query int false "Filter by status aktif"
// @Success 200 {object} map[string]interface{} "List of dosen"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /public/dosen [get]
func (ctrl *Controller) GetDosenList(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")
	idJnsSDM := c.QueryInt("id_jns_sdm", 0)
	idStatAktif := c.QueryInt("id_stat_aktif", 0)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	result, err := ctrl.service.GetDosenList(page, limit, search, idJnsSDM, idStatAktif)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve dosen list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dosen list retrieved successfully",
		"data":    result,
	})
}

// GetDosenDetail handles GET /public/dosen/:id_sdm
// @Summary Get dosen detail by ID
// @Description Retrieves complete dosen information from database
// @Tags Dosen
// @Produce json
// @Param id_sdm path string true "ID SDM (Dosen ID)"
// @Success 200 {object} map[string]interface{} "Dosen detail"
// @Failure 404 {object} map[string]interface{} "Dosen not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /public/dosen/{id_sdm} [get]
func (ctrl *Controller) GetDosenDetail(c *fiber.Ctx) error {
	idSDM := c.Params("id_sdm")

	if idSDM == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
	}

	dosen, err := ctrl.service.GetDosenByID(idSDM)
	if err != nil {
		if err.Error() == "dosen not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Dosen not found",
			})
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve dosen detail",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dosen detail retrieved successfully",
		"data":    dosen,
	})
}

// GetDosenStats handles GET /public/dosen/stats
// @Summary Get dosen statistics
// @Description Retrieves overall dosen statistics (total, by jenis, by status, etc)
// @Tags Dosen
// @Produce json
// @Success 200 {object} map[string]interface{} "Dosen statistics"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /public/dosen/stats [get]
func (ctrl *Controller) GetDosenStats(c *fiber.Ctx) error {
	stats, err := ctrl.service.GetDosenStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve dosen statistics",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dosen statistics retrieved successfully",
		"data":    stats,
	})
}

// SyncDosenPhotos handles POST /api/v1/dosen/sync-photos
// @Summary Sync all dosen photos from SISTER API to MinIO
// @Description Batch fetches dosen photos from SISTER API and uploads to MinIO storage
// @Tags Dosen
// @Produce json
// @Param synced_by query string true "Username of person who triggered the sync"
// @Success 200 {object} BatchPhotoSyncResult "Photo sync result"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /dosen/sync-photos [post]
func (ctrl *Controller) SyncDosenPhotos(c *fiber.Ctx) error {
	syncedBy := c.Query("synced_by", "system")

	result, err := ctrl.service.SyncDosenPhotosToMinIO(syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync dosen photos",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Photo sync completed: %d success, %d skipped, %d failed",
			result.TotalSuccess, result.TotalSkipped, result.TotalFailed),
		"data": result,
	})
}

// SyncDosenFromSister handles POST /dosen/sync
// @Summary Sync all dosen data from SISTER API to database
// @Description Performs batch sync of all Unila dosen from SISTER API using goroutine workers
// @Tags Dosen
// @Accept json
// @Produce json
// @Param synced_by query string true "Username of person who triggered the sync"
// @Success 200 {object} BatchDosenSyncResult "Sync result"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /dosen/sync [post]
func (ctrl *Controller) SyncDosenFromSister(c *fiber.Ctx) error {
	syncedBy := c.Query("synced_by", "system")

	if syncedBy == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "synced_by parameter is required",
		})
	}

	// Unila ID SP (Satuan Perguruan Tinggi)
	const UNILA_ID_SP = "e2b705a7-173e-464a-9fac-509128709515"

	// Perform batch sync
	result, err := ctrl.service.SyncDosenFromSister(UNILA_ID_SP, syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync dosen from SISTER",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dosen sync completed",
		"data":    result,
	})
}

// SyncDosenDokumen handles POST /api/v1/dosen/sync-dokumen
// @Summary Sync all dosen documents from SISTER API to MinIO
// @Description Batch fetches dosen documents from SISTER API and uploads to MinIO storage
// @Tags Dosen
// @Produce json
// @Param synced_by query string false "Username of person who triggered the sync"
// @Success 200 {object} BatchDokumenSyncResult "Dokumen sync result"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /dosen/sync-dokumen [post]
func (ctrl *Controller) SyncDosenDokumen(c *fiber.Ctx) error {
	syncedBy := c.Query("synced_by", "system")

	result, err := ctrl.service.SyncDosenDokumenToMinIO(syncedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync dosen documents",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("Dokumen sync completed: %d dosen, %d docs (%d success, %d skipped, %d failed)",
			result.TotalDosen, result.TotalDokumen, result.TotalSuccess, result.TotalSkipped, result.TotalFailed),
		"data": result,
	})
}

// GetAllDokumen handles GET /api/v1/dosen/dokumen
// @Summary Get paginated list of all synced documents
// @Description Returns all documents from dok.dok_sdm joined with dok.dokumen and pdrd.sdm
func (ctrl *Controller) GetAllDokumen(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 20)
	search := c.Query("search", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	result, err := ctrl.service.GetAllDokumen(page, limit, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve dokumen list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("%d dokumen found", result.Total),
		"data":    result,
	})
}

// GetDosenDokumenList handles GET /api/v1/dosen/dokumen/:id_sdm
// @Summary Get list of documents for a dosen
// @Description Returns metadata of all documents synced from SISTER API for a given dosen
// @Tags Dosen
// @Produce json
// @Param id_sdm path string true "Dosen ID (UUID)"
// @Success 200 {object} map[string]interface{} "Dokumen list"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /dosen/dokumen/{id_sdm} [get]
func (ctrl *Controller) GetDosenDokumenList(c *fiber.Ctx) error {
	idSDM := c.Params("id_sdm")
	if idSDM == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
	}

	docs, err := ctrl.service.GetDosenDokumen(idSDM)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve dokumen",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": fmt.Sprintf("%d dokumen found", len(docs)),
		"data":    docs,
	})
}

// DownloadDosenDokumen handles GET /api/v1/dosen/dokumen/download/:id_dok
// @Summary Download a dosen document from MinIO
// @Description Streams document binary from MinIO storage
// @Tags Dosen
// @Produce application/octet-stream
// @Param id_dok path string true "Document ID (UUID)"
// @Success 200 {file} binary "Document binary"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "Document not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /dosen/dokumen/download/{id_dok} [get]
func (ctrl *Controller) DownloadDosenDokumen(c *fiber.Ctx) error {
	idDok := c.Params("id_dok")
	if idDok == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_dok parameter is required",
		})
	}

	data, contentType, fileName, err := ctrl.service.DownloadDosenDokumen(idDok)
	if err != nil {
		errMsg := err.Error()
		if strings.Contains(errMsg, "dokumen not found") || strings.Contains(errMsg, "no MinIO path") {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Document not found",
				"error":   errMsg,
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to download document",
			"error":   errMsg,
		})
	}

	c.Set("Content-Type", contentType)
	c.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, fileName))
	c.Set("Cache-Control", "private, max-age=3600")

	return c.Send(data)
}

// SyncSingleDosenTest handles POST /dosen/sync-one/:id_sdm
// @Summary Sync single dosen by ID (for testing/debugging)
// @Description Syncs a single dosen from SISTER API by ID with detailed logging
// @Tags Dosen
// @Produce json
// @Param id_sdm path string true "Dosen ID (UUID)"
// @Success 200 {object} map[string]interface{} "Sync result"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /dosen/sync-one/{id_sdm} [post]
func (ctrl *Controller) SyncSingleDosenTest(c *fiber.Ctx) error {
	idSDM := c.Params("id_sdm")
	if idSDM == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
	}

	result, err := ctrl.service.SyncSingleDosenTest(idSDM)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync dosen",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dosen synced successfully",
		"data":    result,
	})
}
