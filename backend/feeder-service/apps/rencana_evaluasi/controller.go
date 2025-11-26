package rencana_evaluasi

import (
	"github.com/gofiber/fiber/v2"
)

// Controller wraps the handler for dependency injection
type Controller struct {
	handler *Handler
}

// NewController creates a new rencana_evaluasi controller
func NewController(service Service) *Controller {
	return &Controller{
		handler: NewHandler(service),
	}
}

// GetRencanaEvaluasiList wraps handler method
func (ctrl *Controller) GetRencanaEvaluasiList(c *fiber.Ctx) error {
	return ctrl.handler.GetRencanaEvaluasiList(c)
}

// GetRencanaEvaluasiByID wraps handler method
func (ctrl *Controller) GetRencanaEvaluasiByID(c *fiber.Ctx) error {
	return ctrl.handler.GetRencanaEvaluasiByID(c)
}

// GetJenisEvaluasiList wraps handler method
func (ctrl *Controller) GetJenisEvaluasiList(c *fiber.Ctx) error {
	return ctrl.handler.GetJenisEvaluasiList(c)
}

// GetStats wraps handler method
func (ctrl *Controller) GetStats(c *fiber.Ctx) error {
	return ctrl.handler.GetStats(c)
}

// GetProdiList wraps handler method
func (ctrl *Controller) GetProdiList(c *fiber.Ctx) error {
	return ctrl.handler.GetProdiList(c)
}

// SyncRencanaEvaluasi wraps handler method
func (ctrl *Controller) SyncRencanaEvaluasi(c *fiber.Ctx) error {
	return ctrl.handler.SyncRencanaEvaluasi(c)
}
