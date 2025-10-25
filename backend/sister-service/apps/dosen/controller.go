package dosen

import (
	"github.com/gofiber/fiber/v2"
)

// Controller defines the dosen controller
type Controller struct {
	service Service
}

// NewController creates a new dosen controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetDosenPhoto handles GET /public/dosen/photo/:id_sdm
// @Summary Get dosen photo from SISTER API
// @Description Fetches dosen photo binary from SISTER API and returns it directly
// @Tags Dosen
// @Produce image/jpeg,image/png
// @Param id_sdm path string true "ID SDM (Dosen ID)"
// @Success 200 {file} binary "Photo binary data"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 404 {object} map[string]interface{} "Photo not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /public/dosen/photo/{id_sdm} [get]
func (ctrl *Controller) GetDosenPhoto(c *fiber.Ctx) error {
	idSdm := c.Params("id_sdm")

	if idSdm == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_sdm parameter is required",
		})
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
