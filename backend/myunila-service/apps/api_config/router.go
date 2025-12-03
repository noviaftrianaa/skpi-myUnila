package api_config

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/myunila-service/pkg/crypto"
)

// InitService initializes just the service (without routes) for external use
// This should be called before any external clients need to read API config from database
func InitService(db *sqlx.DB, encryptor *crypto.EncryptionService) Service {
	repo := NewRepository(db)
	return NewService(repo, encryptor)
}

// Init initializes the api_config module and registers routes
func Init(router fiber.Router, db *sqlx.DB, encryptor *crypto.EncryptionService) Service {
	repo := NewRepository(db)
	svc := NewService(repo, encryptor)
	handler := NewHandler(svc)

	// Register routes under /api-configs
	apiConfigGroup := router.Group("/api-configs")
	apiConfigGroup.Get("/", handler.GetAll)
	apiConfigGroup.Get("/:code", handler.GetByCode)
	apiConfigGroup.Post("/", handler.Create)
	apiConfigGroup.Put("/:id", handler.Update)
	apiConfigGroup.Delete("/:id", handler.Delete)
	apiConfigGroup.Post("/test-connection", handler.TestConnection)

	return svc
}
