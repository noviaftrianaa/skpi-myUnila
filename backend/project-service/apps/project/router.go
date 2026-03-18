package project

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/minio/minio-go/v7"
)

// noopRefRepo is a RefRepository that returns empty results (used when SQL Server is unavailable)
type noopRefRepo struct{}

func (r *noopRefRepo) SearchUsers(ctx context.Context, query string, limit int) ([]UserRef, error) {
	return []UserRef{}, fmt.Errorf("SQL Server not available")
}
func (r *noopRefRepo) GetUserByID(ctx context.Context, id string) (*UserRef, error) {
	return nil, fmt.Errorf("SQL Server not available")
}

// NewNoopRefRepository returns a RefRepository that returns empty results
func NewNoopRefRepository() RefRepository {
	return &noopRefRepo{}
}

// Init initializes project module with both PostgreSQL and SQL Server
func Init(router fiber.Router, pgDB *sqlx.DB, msDB *sqlx.DB) {
	repo := NewRepository(pgDB)
	refRepo := NewRefRepository(msDB)
	svc := NewService(repo, refRepo)
	h := NewHandler(svc)
	initRoutes(router, h)
}

// InitWithNotifier initializes project module with Telegram notifier
func InitWithNotifier(router fiber.Router, pgDB *sqlx.DB, msDB *sqlx.DB, notifier *TelegramNotifier) {
	repo := NewRepository(pgDB)
	refRepo := NewRefRepository(msDB)
	svc := NewServiceWithNotifier(repo, refRepo, notifier)
	h := NewHandler(svc)
	initRoutes(router, h)
}

// InitWithoutRef initializes project module with only PostgreSQL
func InitWithoutRef(router fiber.Router, pgDB *sqlx.DB) {
	repo := NewRepository(pgDB)
	refRepo := &noopRefRepo{}
	svc := NewService(repo, refRepo)
	h := NewHandler(svc)
	initRoutes(router, h)
}

// InitWithoutRefAndNotifier initializes project module with only PostgreSQL and Telegram notifier
func InitWithoutRefAndNotifier(router fiber.Router, pgDB *sqlx.DB, notifier *TelegramNotifier) {
	repo := NewRepository(pgDB)
	refRepo := &noopRefRepo{}
	svc := NewServiceWithNotifier(repo, refRepo, notifier)
	h := NewHandler(svc)
	initRoutes(router, h)
}

// InitWithMinIO initializes project module with MinIO support
func InitWithMinIO(router fiber.Router, pgDB *sqlx.DB, msDB *sqlx.DB, minioClient *minio.Client, bucket string) {
	repo := NewRepository(pgDB)
	var refRepo RefRepository
	if msDB != nil {
		refRepo = NewRefRepository(msDB)
	} else {
		refRepo = &noopRefRepo{}
	}
	svc := NewServiceWithMinIO(repo, refRepo, minioClient, bucket)
	h := NewHandlerWithMinIO(svc, minioClient, bucket)
	initRoutes(router, h)
}

// InitWithMinIOAndNotifier initializes project module with MinIO support and Telegram notifier
func InitWithMinIOAndNotifier(router fiber.Router, pgDB *sqlx.DB, msDB *sqlx.DB, minioClient *minio.Client, bucket string, notifier *TelegramNotifier) {
	repo := NewRepository(pgDB)
	var refRepo RefRepository
	if msDB != nil {
		refRepo = NewRefRepository(msDB)
	} else {
		refRepo = &noopRefRepo{}
	}
	svc := NewServiceWithMinIOAndNotifier(repo, refRepo, minioClient, bucket, notifier)
	h := NewHandlerWithMinIO(svc, minioClient, bucket)
	initRoutes(router, h)
}

func initRoutes(router fiber.Router, h *Handler) {
	// Project routes
	pg := router.Group("/project")
	pg.Get("/stats", h.GetGlobalStats) // Global stats (all projects)
	pg.Get("/my", h.GetMyProjects)     // User-filtered project list
	pg.Get("/", h.GetProjectList)
	pg.Post("/", h.CreateProject)
	pg.Get("/:id", h.GetProjectByID)
	pg.Put("/:id", h.UpdateProject)
	pg.Delete("/:id", h.DeleteProject)
	pg.Get("/:id/stats", h.GetProjectStats)
	pg.Get("/:id/modules", h.GetModulesByProject)
	pg.Get("/:id/board", h.GetBoardView)
	pg.Get("/:id/activity", h.GetActivityByProject)
	pg.Get("/:id/commits", h.GetCommitsByProject)
	pg.Get("/:id/labels", h.GetLabelsByProject)
	pg.Post("/:id/labels", h.CreateLabel)

	// Members & Watchers
	pg.Get("/:id/members", h.GetMembersByProject)
	pg.Post("/:id/members", h.AddMember)
	pg.Delete("/:id/members/:mid", h.RemoveMember)
	pg.Get("/:id/watchers", h.GetWatchersByProject)
	pg.Post("/:id/watchers", h.AddWatcher)
	pg.Delete("/:id/watchers/:wid", h.RemoveWatcher)

	// Org Structure
	pg.Get("/:id/org", h.GetOrgStructure)
	pg.Post("/:id/org/nodes", h.CreateOrgNode)
	pg.Put("/:id/org/nodes/:nid", h.UpdateOrgNode)
	pg.Delete("/:id/org/nodes/:nid", h.DeleteOrgNode)
	pg.Post("/:id/org/edges", h.CreateOrgEdge)
	pg.Delete("/:id/org/edges/:eid", h.DeleteOrgEdge)

	pg.Get("/:id/webhooks", h.GetWebhooksByProject)
	pg.Post("/:id/webhooks", h.CreateWebhookConfig)
	pg.Put("/:id/webhooks/:webhookId", h.UpdateWebhookConfig)
	pg.Delete("/:id/webhooks/:webhookId", h.DeleteWebhookConfig)

	// Tasks nested under project (frontend expects /project/:id/tasks/...)
	pg.Get("/:id/tasks", h.GetTaskList)
	pg.Get("/:id/tasks/board", h.GetBoardView)
	pg.Post("/:id/tasks", h.CreateTask)
	pg.Post("/:id/tasks/reorder", h.ReorderTasks)
	pg.Get("/:id/tasks/:taskId", h.GetTaskByID)
	pg.Put("/:id/tasks/:taskId", h.UpdateTask)
	pg.Patch("/:id/tasks/:taskId/status", h.UpdateTaskStatus)
	pg.Delete("/:id/tasks/:taskId", h.DeleteTask)
	pg.Get("/:id/tasks/:taskId/comments", h.GetCommentsByTask)
	pg.Post("/:id/tasks/:taskId/comments", h.CreateComment)
	pg.Get("/:id/tasks/:taskId/commits", h.GetCommitsByTask)

	// Sprints nested under project
	pg.Get("/:id/sprints", h.GetSprintsByProject)
	pg.Post("/:id/sprints", h.CreateSprint)

	// Documents nested under project
	pg.Get("/:id/documents", h.GetDocumentsByProject)
	pg.Post("/:id/documents", h.UploadDocument)

	// Module routes (standalone — frontend uses /project/:id/modules for list, /modules/:id for single)
	modules := router.Group("/modules")
	modules.Post("/", h.CreateModule)
	modules.Get("/:id", h.GetModuleByID)
	modules.Put("/:id", h.UpdateModule)
	modules.Delete("/:id", h.DeleteModule)

	// Task routes (standalone — for operations that don't need project context)
	tasks := router.Group("/tasks")
	tasks.Get("/:id/labels", h.GetLabelsByTask)
	tasks.Post("/:id/labels", h.AddLabelToTask)
	tasks.Delete("/:id/labels/:labelId", h.RemoveLabelFromTask)

	// Comment routes
	comments := router.Group("/comments")
	comments.Put("/:id", h.UpdateComment)
	comments.Delete("/:id", h.DeleteComment)

	// Label routes
	labels := router.Group("/labels")
	labels.Delete("/:id", h.DeleteLabel)

	// User search (ref to SQL Server)
	users := router.Group("/users")
	users.Get("/search", h.SearchUsers)

	// Document routes (standalone)
	docs := router.Group("/documents")
	docs.Get("/:id", h.GetDocumentByID)
	docs.Put("/:id", h.UpdateDocument)
	docs.Delete("/:id", h.DeleteDocument)
	docs.Get("/:id/download", h.DownloadDocument)
	docs.Get("/:id/versions", h.GetDocumentVersions)
	docs.Post("/:id/replace", h.ReplaceDocumentFile)

	// Sprint routes (standalone)
	sprints := router.Group("/sprints")
	sprints.Get("/:id", h.GetSprintByID)
	sprints.Put("/:id", h.UpdateSprint)
	sprints.Delete("/:id", h.DeleteSprint)

	// Document categories
	docCats := router.Group("/document-categories")
	docCats.Get("/", h.GetDocumentCategories)
	docCats.Post("/", h.CreateDocumentCategory)
}
