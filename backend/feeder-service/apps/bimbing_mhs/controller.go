package bimbing_mhs

import (
	"context"
	"encoding/json"

	"github.com/gofiber/fiber/v2"
)

// Controller defines the bimbing_mhs controller
type Controller struct {
	service Service
}

// NewController creates a new bimbing_mhs controller
func NewController(service Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetList handles GET /bimbing-mhs
func (ctrl *Controller) GetList(c *fiber.Ctx) error {
	ctx := context.Background()

	filter := &ListFilter{
		Page:     c.QueryInt("page", 1),
		Limit:    c.QueryInt("limit", 20),
		Search:   c.Query("search", ""),
		OrderBy:  c.Query("order_by", ""),
		OrderDir: c.Query("order_dir", ""),
	}

	if idProdi := c.Query("id_prodi", ""); idProdi != "" {
		filter.IDProdi = &idProdi
	}

	result, err := ctrl.service.GetList(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve bimbing_mhs list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Bimbing_mhs list retrieved successfully",
		"data":    result,
	})
}

// GetStats handles GET /bimbing-mhs/stats
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

// GetProdiList handles GET /bimbing-mhs/prodi
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

// SyncBimbingMhs handles POST /bimbing-mhs/sync
func (ctrl *Controller) SyncBimbingMhs(c *fiber.Ctx) error {
	ctx := context.Background()
	triggeredBy := c.Query("synced_by", "system")

	filter := &SyncFilter{}

	result, err := ctrl.service.SyncBimbingMhs(ctx, filter, triggeredBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to sync bimbing_mhs",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sync completed",
		"data":    result,
	})
}

// TestGetDosenPembimbing handles GET /bimbing-mhs/test/dosen-pembimbing
// This is for testing the Feeder API endpoint structure
func (ctrl *Controller) TestGetDosenPembimbing(c *fiber.Ctx) error {
	ctx := context.Background()
	filter := c.Query("filter", "")
	limit := c.QueryInt("limit", 5)

	data, err := ctrl.service.TestGetDosenPembimbing(ctx, filter, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success":  false,
			"message":  "Failed to call GetDosenPembimbing",
			"error":    err.Error(),
			"endpoint": "GetDosenPembimbing",
		})
	}

	// Parse JSON to return as object
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to parse response",
			"error":   err.Error(),
			"raw":     string(data),
		})
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"message":  "GetDosenPembimbing response",
		"endpoint": "GetDosenPembimbing",
		"filter":   filter,
		"limit":    limit,
		"data":     jsonData,
	})
}

// TestGetMahasiswaBimbinganDosen handles GET /bimbing-mhs/test/mahasiswa-bimbingan
// This is for testing the Feeder API endpoint structure
func (ctrl *Controller) TestGetMahasiswaBimbinganDosen(c *fiber.Ctx) error {
	ctx := context.Background()
	filter := c.Query("filter", "")
	limit := c.QueryInt("limit", 5)

	data, err := ctrl.service.TestGetMahasiswaBimbinganDosen(ctx, filter, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success":  false,
			"message":  "Failed to call GetMahasiswaBimbinganDosen",
			"error":    err.Error(),
			"endpoint": "GetMahasiswaBimbinganDosen",
		})
	}

	// Parse JSON to return as object
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to parse response",
			"error":   err.Error(),
			"raw":     string(data),
		})
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"message":  "GetMahasiswaBimbinganDosen response",
		"endpoint": "GetMahasiswaBimbinganDosen",
		"filter":   filter,
		"limit":    limit,
		"data":     jsonData,
	})
}

// TestGetListBimbingMahasiswa handles GET /bimbing-mhs/test/list-bimbing
// This is for testing the Feeder API endpoint structure
func (ctrl *Controller) TestGetListBimbingMahasiswa(c *fiber.Ctx) error {
	ctx := context.Background()
	filter := c.Query("filter", "")
	limit := c.QueryInt("limit", 5)

	data, err := ctrl.service.TestGetListBimbingMahasiswa(ctx, filter, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success":  false,
			"message":  "Failed to call GetListBimbingMahasiswa",
			"error":    err.Error(),
			"endpoint": "GetListBimbingMahasiswa",
		})
	}

	// Parse JSON to return as object
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to parse response",
			"error":   err.Error(),
			"raw":     string(data),
		})
	}

	return c.JSON(fiber.Map{
		"success":  true,
		"message":  "GetListBimbingMahasiswa response",
		"endpoint": "GetListBimbingMahasiswa",
		"filter":   filter,
		"limit":    limit,
		"data":     jsonData,
	})
}

// TestCompareEndpoints handles GET /bimbing-mhs/test/compare
// Compares all three endpoints side by side
func (ctrl *Controller) TestCompareEndpoints(c *fiber.Ctx) error {
	ctx := context.Background()
	filter := c.Query("filter", "")
	limit := c.QueryInt("limit", 3)

	results := make(map[string]interface{})

	// Test GetDosenPembimbing
	data1, err1 := ctrl.service.TestGetDosenPembimbing(ctx, filter, limit)
	if err1 != nil {
		results["GetDosenPembimbing"] = map[string]interface{}{
			"success": false,
			"error":   err1.Error(),
		}
	} else {
		var jsonData1 interface{}
		json.Unmarshal(data1, &jsonData1)
		results["GetDosenPembimbing"] = map[string]interface{}{
			"success": true,
			"data":    jsonData1,
		}
	}

	// Test GetMahasiswaBimbinganDosen
	data2, err2 := ctrl.service.TestGetMahasiswaBimbinganDosen(ctx, filter, limit)
	if err2 != nil {
		results["GetMahasiswaBimbinganDosen"] = map[string]interface{}{
			"success": false,
			"error":   err2.Error(),
		}
	} else {
		var jsonData2 interface{}
		json.Unmarshal(data2, &jsonData2)
		results["GetMahasiswaBimbinganDosen"] = map[string]interface{}{
			"success": true,
			"data":    jsonData2,
		}
	}

	// Test GetListBimbingMahasiswa
	data3, err3 := ctrl.service.TestGetListBimbingMahasiswa(ctx, filter, limit)
	if err3 != nil {
		results["GetListBimbingMahasiswa"] = map[string]interface{}{
			"success": false,
			"error":   err3.Error(),
		}
	} else {
		var jsonData3 interface{}
		json.Unmarshal(data3, &jsonData3)
		results["GetListBimbingMahasiswa"] = map[string]interface{}{
			"success": true,
			"data":    jsonData3,
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Comparison of all three endpoints",
		"filter":  filter,
		"limit":   limit,
		"results": results,
	})
}
