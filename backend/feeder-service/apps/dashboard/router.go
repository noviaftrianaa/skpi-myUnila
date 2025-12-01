package dashboard

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
)

// Init initializes dashboard routes and returns the service
func Init(router fiber.Router, db *sqlx.DB) Service {
	repo := NewRepository(db)
	svc := NewService(repo)
	ctrl := NewController(svc)

	// Dashboard routes
	dashboardRouter := router.Group("/dashboard")
	{
		// GET /dashboard/stats - Get comprehensive dashboard statistics
		dashboardRouter.Get("/stats", ctrl.GetDashboardStats)
	}

	return svc
}
