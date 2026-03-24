package project

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

// getTaskID extracts task ID from either :taskId (nested route) or :id (standalone route)
func getTaskID(c *fiber.Ctx) string {
	if taskID := c.Params("taskId"); taskID != "" {
		return taskID
	}
	return c.Params("id")
}

// HandlerMinIO holds MinIO client for file upload/download
type HandlerMinIO struct {
	client *minio.Client
	bucket string
}

// Handler for project endpoints
type Handler struct {
	svc   Service
	minio *HandlerMinIO
}

func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

func NewHandlerWithMinIO(svc Service, minioClient *minio.Client, bucket string) *Handler {
	return &Handler{
		svc:   svc,
		minio: &HandlerMinIO{client: minioClient, bucket: bucket},
	}
}

// ===== PROJECT HANDLERS =====

// GetProjectList GET /api/v1/project
func (h *Handler) GetProjectList(c *fiber.Ctx) error {
	ctx := c.Context()
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "10"))
	search := c.Query("search", "")
	status := c.Query("status", "")

	result, err := h.svc.GetProjectList(ctx, page, limit, search, status)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get project list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Project list retrieved",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetProjectByID GET /api/v1/project/:id
func (h *Handler) GetProjectByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	project, err := h.svc.GetProjectByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Project not found",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Project retrieved",
		"data":    project,
	})
}

// CreateProject POST /api/v1/project
func (h *Handler) CreateProject(c *fiber.Ctx) error {
	ctx := c.Context()

	var req ProjectCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.NmProject == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "nm_project is required",
		})
	}

	project, err := h.svc.CreateProject(ctx, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create project",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Project created",
		"data":    project,
	})
}

// UpdateProject PUT /api/v1/project/:id
func (h *Handler) UpdateProject(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	var req ProjectUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	penggunaID := c.Get("X-User-ID")
	var updatedBy *string
	if penggunaID != "" {
		updatedBy = &penggunaID
	}

	project, err := h.svc.UpdateProject(ctx, id, &req, updatedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update project",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Project updated",
		"data":    project,
	})
}

// DeleteProject DELETE /api/v1/project/:id
func (h *Handler) DeleteProject(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	penggunaID := c.Get("X-User-ID")
	var deletedBy *string
	if penggunaID != "" {
		deletedBy = &penggunaID
	}

	if err := h.svc.DeleteProject(ctx, id, deletedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete project",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Project deleted",
	})
}

// GetProjectStats GET /api/v1/project/:id/stats
func (h *Handler) GetProjectStats(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	stats, err := h.svc.GetProjectStats(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get project stats",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Project stats retrieved",
		"data":    stats,
	})
}

// ===== MODULE HANDLERS =====

// GetModulesByProject GET /api/v1/project/:id/modules
func (h *Handler) GetModulesByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	modules, err := h.svc.GetModulesByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get modules",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Modules retrieved",
		"data":    modules,
	})
}

// GetModuleByID GET /api/v1/modules/:id
func (h *Handler) GetModuleByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	module, err := h.svc.GetModuleByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Module not found",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Module retrieved",
		"data":    module,
	})
}

// CreateModule POST /api/v1/modules
func (h *Handler) CreateModule(c *fiber.Ctx) error {
	ctx := c.Context()

	var req ModuleCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.NmModule == "" || req.IDProject == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "nm_module and id_project are required",
		})
	}

	module, err := h.svc.CreateModule(ctx, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create module",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Module created",
		"data":    module,
	})
}

// UpdateModule PUT /api/v1/modules/:id
func (h *Handler) UpdateModule(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	var req ModuleUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	penggunaID := c.Get("X-User-ID")
	var updatedBy *string
	if penggunaID != "" {
		updatedBy = &penggunaID
	}

	module, err := h.svc.UpdateModule(ctx, id, &req, updatedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update module",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Module updated",
		"data":    module,
	})
}

// DeleteModule DELETE /api/v1/modules/:id
func (h *Handler) DeleteModule(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	penggunaID := c.Get("X-User-ID")
	var deletedBy *string
	if penggunaID != "" {
		deletedBy = &penggunaID
	}

	if err := h.svc.DeleteModule(ctx, id, deletedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete module",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Module deleted",
	})
}

// ===== TASK HANDLERS =====

// GetTaskList GET /api/v1/tasks
func (h *Handler) GetTaskList(c *fiber.Ctx) error {
	ctx := c.Context()
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	filters := TaskFilters{
		IDProject:  c.Query("id_project", ""),
		IDModule:   c.Query("id_module", ""),
		Status:     c.Query("status", ""),
		Prioritas:  c.Query("prioritas", ""),
		IDAssignee: c.Query("id_assignee", ""),
		Search:     c.Query("search", ""),
	}

	result, err := h.svc.GetTaskList(ctx, page, limit, filters)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get task list",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Task list retrieved",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetTaskByID GET /api/v1/tasks/:id
func (h *Handler) GetTaskByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := getTaskID(c)

	task, err := h.svc.GetTaskByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Task not found",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Task retrieved",
		"data":    task,
	})
}

// CreateTask POST /api/v1/tasks
func (h *Handler) CreateTask(c *fiber.Ctx) error {
	ctx := c.Context()

	var req TaskCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.Judul == "" || req.IDModule == "" || req.IDProject == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "judul, id_module, and id_project are required",
		})
	}

	// Get user from header if not in body
	if req.IDPengguna == nil {
		penggunaID := c.Get("X-User-ID")
		if penggunaID != "" {
			req.IDPengguna = &penggunaID
		}
	}

	task, err := h.svc.CreateTask(ctx, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create task",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Task created",
		"data":    task,
	})
}

// UpdateTask PUT /api/v1/tasks/:id
func (h *Handler) UpdateTask(c *fiber.Ctx) error {
	ctx := c.Context()
	id := getTaskID(c)

	var req TaskUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.IDPengguna == nil {
		penggunaID := c.Get("X-User-ID")
		if penggunaID != "" {
			req.IDPengguna = &penggunaID
		}
	}

	task, err := h.svc.UpdateTask(ctx, id, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update task",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Task updated",
		"data":    task,
	})
}

// UpdateTaskStatus PATCH /api/v1/tasks/:id/status
func (h *Handler) UpdateTaskStatus(c *fiber.Ctx) error {
	ctx := c.Context()
	id := getTaskID(c)

	var req TaskStatusUpdate
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.Status == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "status is required",
		})
	}

	if req.IDPengguna == nil {
		penggunaID := c.Get("X-User-ID")
		if penggunaID != "" {
			req.IDPengguna = &penggunaID
		}
	}

	task, err := h.svc.UpdateTaskStatus(ctx, id, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update task status",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Task status updated",
		"data":    task,
	})
}

// DeleteTask DELETE /api/v1/tasks/:id
func (h *Handler) DeleteTask(c *fiber.Ctx) error {
	ctx := c.Context()
	id := getTaskID(c)

	penggunaID := c.Get("X-User-ID")
	var deletedBy *string
	if penggunaID != "" {
		deletedBy = &penggunaID
	}

	if err := h.svc.DeleteTask(ctx, id, deletedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete task",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Task deleted",
	})
}

// ReorderTasks POST /api/v1/tasks/reorder
func (h *Handler) ReorderTasks(c *fiber.Ctx) error {
	ctx := c.Context()

	var req TaskReorderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if err := h.svc.BulkReorderTasks(ctx, &req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to reorder tasks",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tasks reordered",
	})
}

// GetBoardView GET /api/v1/project/:id/board
func (h *Handler) GetBoardView(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	moduleID := c.Query("id_module", "")

	board, err := h.svc.GetBoardView(ctx, projectID, moduleID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get board view",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Board view retrieved",
		"data":    board,
	})
}

// ===== COMMENT HANDLERS =====

// GetCommentsByTask GET /api/v1/tasks/:id/comments
func (h *Handler) GetCommentsByTask(c *fiber.Ctx) error {
	ctx := c.Context()
	taskID := getTaskID(c)

	comments, err := h.svc.GetCommentsByTask(ctx, taskID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get comments",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Comments retrieved",
		"data":    comments,
	})
}

// CreateComment POST /api/v1/tasks/:id/comments
func (h *Handler) CreateComment(c *fiber.Ctx) error {
	ctx := c.Context()
	taskID := getTaskID(c)

	var req CommentCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	req.IDTask = taskID

	if req.Konten == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "konten is required",
		})
	}

	if req.IDPengguna == nil {
		penggunaID := c.Get("X-User-ID")
		if penggunaID != "" {
			req.IDPengguna = &penggunaID
		}
	}

	comment, err := h.svc.CreateComment(ctx, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create comment",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Comment created",
		"data":    comment,
	})
}

// UpdateComment PUT /api/v1/comments/:id
func (h *Handler) UpdateComment(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	var req CommentUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	comment, err := h.svc.UpdateComment(ctx, id, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update comment",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Comment updated",
		"data":    comment,
	})
}

// DeleteComment DELETE /api/v1/comments/:id
func (h *Handler) DeleteComment(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	if err := h.svc.DeleteComment(ctx, id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete comment",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Comment deleted",
	})
}

// ===== COMMIT HANDLERS =====

// GetCommitsByTask GET /api/v1/tasks/:id/commits
func (h *Handler) GetCommitsByTask(c *fiber.Ctx) error {
	ctx := c.Context()
	taskID := getTaskID(c)

	commits, err := h.svc.GetCommitsByTask(ctx, taskID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get commits",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Commits retrieved",
		"data":    commits,
	})
}

// GetCommitsByProject GET /api/v1/project/:id/commits
func (h *Handler) GetCommitsByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	commits, err := h.svc.GetCommitsByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get commits",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Commits retrieved",
		"data":    commits,
	})
}

// ===== ACTIVITY HANDLERS =====

// GetActivityByProject GET /api/v1/project/:id/activity
func (h *Handler) GetActivityByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	result, err := h.svc.GetActivityByProject(ctx, projectID, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get activity",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Activity retrieved",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// ===== USER REF HANDLERS =====

// SearchUsers GET /api/v1/users/search
func (h *Handler) SearchUsers(c *fiber.Ctx) error {
	ctx := c.Context()
	query := c.Query("q", "")
	limit, _ := strconv.Atoi(c.Query("limit", "10"))

	if query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Query parameter 'q' is required",
		})
	}

	users, err := h.svc.SearchUsers(ctx, query, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to search users",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Users retrieved",
		"data":    users,
	})
}

// ===== LABEL HANDLERS =====

// GetLabelsByProject GET /api/v1/project/:id/labels
func (h *Handler) GetLabelsByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	labels, err := h.svc.GetLabelsByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get labels",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Labels retrieved",
		"data":    labels,
	})
}

// CreateLabel POST /api/v1/project/:id/labels
func (h *Handler) CreateLabel(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var body struct {
		NmLabel string `json:"nm_label"`
		Warna   string `json:"warna"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if body.NmLabel == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "nm_label is required",
		})
	}

	label, err := h.svc.CreateLabel(ctx, projectID, body.NmLabel, body.Warna)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create label",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Label created",
		"data":    label,
	})
}

// DeleteLabel DELETE /api/v1/labels/:id
func (h *Handler) DeleteLabel(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	if err := h.svc.DeleteLabel(ctx, id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete label",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Label deleted",
	})
}

// ===== TASK LABEL HANDLERS =====

// GetLabelsByTask GET /api/v1/tasks/:id/labels
func (h *Handler) GetLabelsByTask(c *fiber.Ctx) error {
	ctx := c.Context()
	taskID := getTaskID(c)

	labels, err := h.svc.GetLabelsByTask(ctx, taskID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get task labels",
			"error":   err.Error(),
		})
	}
	if labels == nil {
		labels = []Label{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Task labels retrieved",
		"data":    labels,
	})
}

// AddLabelToTask POST /api/v1/tasks/:id/labels
func (h *Handler) AddLabelToTask(c *fiber.Ctx) error {
	ctx := c.Context()
	taskID := getTaskID(c)

	var req AddTaskLabelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.LabelID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "label_id is required",
		})
	}

	if err := h.svc.AddLabelToTask(ctx, taskID, req.LabelID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to add label to task",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Label added to task",
	})
}

// RemoveLabelFromTask DELETE /api/v1/tasks/:id/labels/:labelId
func (h *Handler) RemoveLabelFromTask(c *fiber.Ctx) error {
	ctx := c.Context()
	taskID := getTaskID(c)
	labelID := c.Params("labelId")

	if err := h.svc.RemoveLabelFromTask(ctx, taskID, labelID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to remove label from task",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Label removed from task",
	})
}

// ===== WEBHOOK CONFIG HANDLERS =====

// GetWebhooksByProject GET /api/v1/project/:id/webhooks
func (h *Handler) GetWebhooksByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	webhooks, err := h.svc.GetWebhooksByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get webhooks",
			"error":   err.Error(),
		})
	}
	if webhooks == nil {
		webhooks = []WebhookConfig{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Webhooks retrieved",
		"data":    webhooks,
	})
}

// CreateWebhookConfig POST /api/v1/project/:id/webhooks
func (h *Handler) CreateWebhookConfig(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var req WebhookConfigCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.RepoFullName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "repo_full_name is required",
		})
	}

	webhook, err := h.svc.CreateWebhookConfig(ctx, projectID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create webhook config",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Webhook config created",
		"data":    webhook,
	})
}

// UpdateWebhookConfig PUT /api/v1/project/:id/webhooks/:webhookId
func (h *Handler) UpdateWebhookConfig(c *fiber.Ctx) error {
	ctx := c.Context()
	webhookID := c.Params("webhookId")

	var req WebhookConfigUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	webhook, err := h.svc.UpdateWebhookConfig(ctx, webhookID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update webhook config",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Webhook config updated",
		"data":    webhook,
	})
}

// DeleteWebhookConfig DELETE /api/v1/project/:id/webhooks/:webhookId
func (h *Handler) DeleteWebhookConfig(c *fiber.Ctx) error {
	ctx := c.Context()
	webhookID := c.Params("webhookId")

	if err := h.svc.DeleteWebhookConfig(ctx, webhookID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete webhook config",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Webhook config deleted",
	})
}

// ===== SPRINT HANDLERS =====

// GetSprintsByProject GET /api/v1/project/:id/sprints
func (h *Handler) GetSprintsByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	sprints, err := h.svc.GetSprintsByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get sprints",
			"error":   err.Error(),
		})
	}
	if sprints == nil {
		sprints = []SprintWithCounts{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sprints retrieved",
		"data":    sprints,
	})
}

// GetSprintByID GET /api/v1/sprints/:id
func (h *Handler) GetSprintByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	sprint, err := h.svc.GetSprintByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Sprint not found",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sprint retrieved",
		"data":    sprint,
	})
}

// CreateSprint POST /api/v1/project/:id/sprints
func (h *Handler) CreateSprint(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var req SprintCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	req.IDProject = projectID

	if req.NmSprint == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "nm_sprint is required",
		})
	}

	sprint, err := h.svc.CreateSprint(ctx, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create sprint",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Sprint created",
		"data":    sprint,
	})
}

// UpdateSprint PUT /api/v1/sprints/:id
func (h *Handler) UpdateSprint(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	var req SprintUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	penggunaID := c.Get("X-User-ID")
	var updatedBy *string
	if penggunaID != "" {
		updatedBy = &penggunaID
	}

	sprint, err := h.svc.UpdateSprint(ctx, id, &req, updatedBy)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update sprint",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sprint updated",
		"data":    sprint,
	})
}

// DeleteSprint DELETE /api/v1/sprints/:id
func (h *Handler) DeleteSprint(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	penggunaID := c.Get("X-User-ID")
	var deletedBy *string
	if penggunaID != "" {
		deletedBy = &penggunaID
	}

	if err := h.svc.DeleteSprint(ctx, id, deletedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete sprint",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Sprint deleted",
	})
}

// ===== DOCUMENT CATEGORY HANDLERS =====

// GetDocumentCategories GET /api/v1/document-categories
func (h *Handler) GetDocumentCategories(c *fiber.Ctx) error {
	ctx := c.Context()

	categories, err := h.svc.GetDocumentCategories(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get document categories",
			"error":   err.Error(),
		})
	}
	if categories == nil {
		categories = []DocumentCategory{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Document categories retrieved",
		"data":    categories,
	})
}

// CreateDocumentCategory POST /api/v1/document-categories
func (h *Handler) CreateDocumentCategory(c *fiber.Ctx) error {
	ctx := c.Context()

	var req DocumentCategoryCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	if req.NmKategori == "" || req.KodeKategori == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "nm_kategori and kode_kategori are required",
		})
	}

	category, err := h.svc.CreateDocumentCategory(ctx, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create document category",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Document category created",
		"data":    category,
	})
}

// ===== DOCUMENT HANDLERS =====

// GetDocumentsByProject GET /api/v1/project/:id/documents
func (h *Handler) GetDocumentsByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	category := c.Query("category", "")
	status := c.Query("status", "")
	search := c.Query("search", "")

	result, err := h.svc.GetDocumentsByProject(ctx, projectID, page, limit, category, status, search)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get documents",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Documents retrieved",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// GetDocumentByID GET /api/v1/documents/:id
func (h *Handler) GetDocumentByID(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	doc, err := h.svc.GetDocumentByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Document not found",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Document retrieved",
		"data":    doc,
	})
}

// UploadDocument POST /api/v1/project/:id/documents (multipart/form-data)
func (h *Handler) UploadDocument(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	if h.minio == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "File storage not available",
		})
	}

	// Parse multipart file
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File is required",
			"error":   err.Error(),
		})
	}

	nmDokumen := c.FormValue("nm_dokumen")
	if nmDokumen == "" {
		nmDokumen = strings.TrimSuffix(fileHeader.Filename, filepath.Ext(fileHeader.Filename))
	}

	idDocCategory := c.FormValue("id_doc_category")
	if idDocCategory == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "id_doc_category is required",
		})
	}

	// Build doc ID early so we can use it in file path
	docID := fmt.Sprintf("%s", newDocumentID())
	originalFilename := fileHeader.Filename
	ext := filepath.Ext(originalFilename)
	safeFilename := docID + ext
	filePath := fmt.Sprintf("projects/%s/documents/%s/%s", projectID, docID, safeFilename)

	// Read file content
	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to open uploaded file",
			"error":   err.Error(),
		})
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to read file",
			"error":   err.Error(),
		})
	}

	// Detect content type
	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" || mimeType == "application/octet-stream" {
		mimeType = detectMimeType(originalFilename)
	}

	// Upload to MinIO
	_, err = h.minio.client.PutObject(
		context.Background(),
		h.minio.bucket,
		filePath,
		bytes.NewReader(fileBytes),
		int64(len(fileBytes)),
		minio.PutObjectOptions{ContentType: mimeType},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to upload file to storage",
			"error":   err.Error(),
		})
	}

	// Build create request
	nomorDokumen := c.FormValue("nomor_dokumen")
	tglDokumen := c.FormValue("tgl_dokumen")
	tglBerlaku := c.FormValue("tgl_berlaku")
	tglBerakhir := c.FormValue("tgl_berakhir")
	deskripsi := c.FormValue("deskripsi")
	idTask := c.FormValue("id_task")
	statusVal := c.FormValue("status")
	uploaderID := c.Get("X-User-ID")

	req := &DocumentCreateRequest{
		IDProject:     projectID,
		IDDocCategory: idDocCategory,
		NmDokumen:     nmDokumen,
		FilePath:      filePath,
		FileName:      originalFilename,
		FileSize:      int64(len(fileBytes)),
		Status:        statusVal,
	}

	mt := mimeType
	req.MimeType = &mt

	if nomorDokumen != "" {
		req.NomorDokumen = &nomorDokumen
	}
	if tglDokumen != "" {
		req.TglDokumen = &tglDokumen
	}
	if tglBerlaku != "" {
		req.TglBerlaku = &tglBerlaku
	}
	if tglBerakhir != "" {
		req.TglBerakhir = &tglBerakhir
	}
	if deskripsi != "" {
		req.Deskripsi = &deskripsi
	}
	if idTask != "" {
		req.IDTask = &idTask
	}
	if uploaderID != "" {
		req.IDUploader = &uploaderID
	}

	// Override the document ID in service by passing it through the request
	// We use a workaround: set FilePath/FileName which handler just set
	// Service will generate a new UUID but we need the same one
	// Solution: call repo directly via a special service path
	doc, err := h.svc.CreateDocumentWithID(ctx, projectID, docID, req)
	if err != nil {
		// Cleanup MinIO on failure
		_ = h.minio.client.RemoveObject(context.Background(), h.minio.bucket, filePath, minio.RemoveObjectOptions{})
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to save document",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Document uploaded",
		"data":    doc,
	})
}

// UpdateDocument PUT /api/v1/documents/:id
func (h *Handler) UpdateDocument(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	var req DocumentUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	doc, err := h.svc.UpdateDocument(ctx, id, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update document",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Document updated",
		"data":    doc,
	})
}

// DeleteDocument DELETE /api/v1/documents/:id
func (h *Handler) DeleteDocument(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	penggunaID := c.Get("X-User-ID")
	var deletedBy *string
	if penggunaID != "" {
		deletedBy = &penggunaID
	}

	if err := h.svc.DeleteDocument(ctx, id, deletedBy); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete document",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Document deleted",
	})
}

// DownloadDocument GET /api/v1/documents/:id/download
func (h *Handler) DownloadDocument(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	doc, err := h.svc.GetDocumentByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Document not found",
			"error":   err.Error(),
		})
	}

	if h.minio == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "File storage not available",
		})
	}

	// Get object from MinIO
	obj, err := h.minio.client.GetObject(
		context.Background(),
		h.minio.bucket,
		doc.FilePath,
		minio.GetObjectOptions{},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to retrieve file from storage",
			"error":   err.Error(),
		})
	}
	defer obj.Close()

	fileBytes, err := io.ReadAll(obj)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to read file from storage",
			"error":   err.Error(),
		})
	}

	mimeType := "application/octet-stream"
	if doc.MimeType != nil && *doc.MimeType != "" {
		mimeType = *doc.MimeType
	}

	c.Set("Content-Type", mimeType)
	c.Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, doc.FileName))
	c.Set("Content-Length", strconv.Itoa(len(fileBytes)))

	return c.Send(fileBytes)
}

// GetDocumentVersions GET /api/v1/documents/:id/versions
func (h *Handler) GetDocumentVersions(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	versions, err := h.svc.GetDocumentVersions(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get document versions",
			"error":   err.Error(),
		})
	}
	if versions == nil {
		versions = []DocumentVersion{}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Document versions retrieved",
		"data":    versions,
	})
}

// ReplaceDocumentFile POST /api/v1/documents/:id/replace (multipart)
func (h *Handler) ReplaceDocumentFile(c *fiber.Ctx) error {
	ctx := c.Context()
	id := c.Params("id")

	if h.minio == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "File storage not available",
		})
	}

	// Get existing doc for project context
	doc, err := h.svc.GetDocumentByID(ctx, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Document not found",
			"error":   err.Error(),
		})
	}

	// Parse multipart file
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "File is required",
			"error":   err.Error(),
		})
	}

	originalFilename := fileHeader.Filename
	ext := filepath.Ext(originalFilename)
	safeFilename := uuid.New().String() + ext
	filePath := fmt.Sprintf("projects/%s/documents/%s/%s", doc.IDProject, id, safeFilename)

	// Read file content
	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to open uploaded file",
			"error":   err.Error(),
		})
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to read file",
			"error":   err.Error(),
		})
	}

	// Detect content type
	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" || mimeType == "application/octet-stream" {
		mimeType = detectMimeType(originalFilename)
	}

	// Upload to MinIO
	_, err = h.minio.client.PutObject(
		context.Background(),
		h.minio.bucket,
		filePath,
		bytes.NewReader(fileBytes),
		int64(len(fileBytes)),
		minio.PutObjectOptions{ContentType: mimeType},
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to upload file to storage",
			"error":   err.Error(),
		})
	}

	// Catatan (optional note about the change)
	catatanStr := c.FormValue("catatan")
	var catatan *string
	if catatanStr != "" {
		catatan = &catatanStr
	}

	uploaderID := c.Get("X-User-ID")
	var uploaderPtr *string
	if uploaderID != "" {
		uploaderPtr = &uploaderID
	}

	updatedDoc, err := h.svc.ReplaceDocumentFile(ctx, id, filePath, originalFilename, int64(len(fileBytes)), mimeType, catatan, uploaderPtr)
	if err != nil {
		// Cleanup MinIO on failure
		_ = h.minio.client.RemoveObject(context.Background(), h.minio.bucket, filePath, minio.RemoveObjectOptions{})
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to replace document file",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Document file replaced",
		"data":    updatedDoc,
	})
}

// helper functions
func newDocumentID() string {
	return uuid.New().String()
}

func detectMimeType(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	mimeMap := map[string]string{
		".pdf":  "application/pdf",
		".doc":  "application/msword",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".xls":  "application/vnd.ms-excel",
		".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		".ppt":  "application/vnd.ms-powerpoint",
		".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		".png":  "image/png",
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".gif":  "image/gif",
		".txt":  "text/plain",
		".zip":  "application/zip",
		".rar":  "application/x-rar-compressed",
	}
	if mt, ok := mimeMap[ext]; ok {
		return mt
	}
	return "application/octet-stream"
}

// GetGlobalStats GET /api/v1/project/stats — global stats across all projects
func (h *Handler) GetGlobalStats(c *fiber.Ctx) error {
	ctx := c.Context()

	stats, err := h.svc.GetGlobalStats(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get global stats",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Global stats retrieved",
		"data":    stats,
	})
}

// ===== MEMBER HANDLERS =====

// GetMembersByProject GET /api/v1/project/:id/members
func (h *Handler) GetMembersByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	members, err := h.svc.GetMembersByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get members",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Members retrieved",
		"data":    members,
	})
}

// AddMember POST /api/v1/project/:id/members
func (h *Handler) AddMember(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var req AddMemberRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	addedBy := c.Query("added_by")
	var addedByPtr *string
	if addedBy != "" {
		addedByPtr = &addedBy
	}

	member, err := h.svc.AddMember(ctx, projectID, &req, addedByPtr)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to add member",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Member added",
		"data":    member,
	})
}

// RemoveMember DELETE /api/v1/project/:id/members/:mid
func (h *Handler) RemoveMember(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	memberID := c.Params("mid")

	if err := h.svc.RemoveMember(ctx, projectID, memberID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to remove member",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Member removed",
	})
}

// ===== WATCHER HANDLERS =====

// GetWatchersByProject GET /api/v1/project/:id/watchers
func (h *Handler) GetWatchersByProject(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	watchers, err := h.svc.GetWatchersByProject(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get watchers",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Watchers retrieved",
		"data":    watchers,
	})
}

// AddWatcher POST /api/v1/project/:id/watchers
func (h *Handler) AddWatcher(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var req AddWatcherRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	watcher, err := h.svc.AddWatcher(ctx, projectID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to add watcher",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Watcher added",
		"data":    watcher,
	})
}

// RemoveWatcher DELETE /api/v1/project/:id/watchers/:wid
func (h *Handler) RemoveWatcher(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	watcherID := c.Params("wid")

	if err := h.svc.RemoveWatcher(ctx, projectID, watcherID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to remove watcher",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Watcher removed",
	})
}

// ===== MY PROJECTS HANDLER =====

// GetMyProjects GET /api/v1/project/my
func (h *Handler) GetMyProjects(c *fiber.Ctx) error {
	ctx := c.Context()
	userID := c.Query("user_id", "")
	isPimpinanStr := c.Query("is_pimpinan", "false")
	isPimpinan := isPimpinanStr == "true" || isPimpinanStr == "1"
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "20"))

	if userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "user_id is required",
		})
	}

	result, err := h.svc.GetMyProjects(ctx, userID, isPimpinan, page, limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get projects",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Projects retrieved",
		"data":    result.Data,
		"meta": fiber.Map{
			"total":       result.Total,
			"page":        result.Page,
			"limit":       result.Limit,
			"total_pages": result.TotalPages,
		},
	})
}

// ===== ORG STRUCTURE HANDLERS =====

// GetOrgStructure GET /api/v1/project/:id/org
func (h *Handler) GetOrgStructure(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	org, err := h.svc.GetOrgStructure(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to get org structure",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Org structure retrieved",
		"data":    org,
	})
}

// CreateOrgNode POST /api/v1/project/:id/org/nodes
func (h *Handler) CreateOrgNode(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var req CreateOrgNodeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	node, err := h.svc.CreateOrgNode(ctx, projectID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create org node",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Org node created",
		"data":    node,
	})
}

// UpdateOrgNode PUT /api/v1/project/:id/org/nodes/:nid
func (h *Handler) UpdateOrgNode(c *fiber.Ctx) error {
	ctx := c.Context()
	nodeID := c.Params("nid")

	var req UpdateOrgNodeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	node, err := h.svc.UpdateOrgNode(ctx, nodeID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to update org node",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Org node updated",
		"data":    node,
	})
}

// DeleteOrgNode DELETE /api/v1/project/:id/org/nodes/:nid
func (h *Handler) DeleteOrgNode(c *fiber.Ctx) error {
	ctx := c.Context()
	nodeID := c.Params("nid")

	if err := h.svc.DeleteOrgNode(ctx, nodeID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete org node",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Org node deleted",
	})
}

// CreateOrgEdge POST /api/v1/project/:id/org/edges
func (h *Handler) CreateOrgEdge(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")

	var req CreateOrgEdgeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
	}

	edge, err := h.svc.CreateOrgEdge(ctx, projectID, &req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to create org edge",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Org edge created",
		"data":    edge,
	})
}

// DeleteOrgEdge DELETE /api/v1/project/:id/org/edges/:eid
func (h *Handler) DeleteOrgEdge(c *fiber.Ctx) error {
	ctx := c.Context()
	edgeID := c.Params("eid")

	if err := h.svc.DeleteOrgEdge(ctx, edgeID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Failed to delete org edge",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Org edge deleted",
	})
}

// ===== ANALYTICS HANDLERS =====

// GetContributions GET /project/contributions?user_id=xxx&year=2026
func (h *Handler) GetContributions(c *fiber.Ctx) error {
	ctx := c.Context()
	userID := c.Query("user_id", "")
	year, _ := strconv.Atoi(c.Query("year", "2026"))
	if userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "user_id is required"})
	}
	data, err := h.svc.GetContributions(ctx, userID, year)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetProjectContributions GET /project/:id/contributions?year=2026
func (h *Handler) GetProjectContributions(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	year, _ := strconv.Atoi(c.Query("year", "2026"))
	data, err := h.svc.GetProjectContributions(ctx, projectID, year)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetActivityTimeline GET /project/:id/charts/activity?period=weekly&months=3
func (h *Handler) GetActivityTimeline(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	period := c.Query("period", "weekly")
	months, _ := strconv.Atoi(c.Query("months", "3"))
	data, err := h.svc.GetActivityTimeline(ctx, projectID, period, months)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if data == nil {
		data = []ActivityPoint{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetBurndown GET /project/:id/charts/burndown?sprint_id=xxx
func (h *Handler) GetBurndown(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	sprintID := c.Query("sprint_id", "")
	if sprintID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": "sprint_id is required"})
	}
	data, err := h.svc.GetBurndown(ctx, projectID, sprintID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if data == nil {
		data = []BurndownPoint{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetTaskDistribution GET /project/:id/charts/distribution
func (h *Handler) GetTaskDistribution(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	data, err := h.svc.GetTaskDistribution(ctx, projectID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if data == nil {
		data = []TaskDistribution{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetTeamContribution GET /project/:id/charts/team?months=1
func (h *Handler) GetTeamContribution(c *fiber.Ctx) error {
	ctx := c.Context()
	projectID := c.Params("id")
	months, _ := strconv.Atoi(c.Query("months", "1"))
	data, err := h.svc.GetTeamContribution(ctx, projectID, months)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	if data == nil {
		data = []TeamContribution{}
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// GetUserProfile GET /project/profile/:userId
func (h *Handler) GetUserProfile(c *fiber.Ctx) error {
	ctx := c.Context()
	userID := c.Params("userId")
	data, err := h.svc.GetUserProfile(ctx, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": err.Error()})
	}
	return c.JSON(fiber.Map{"success": true, "data": data})
}

// ==================== PUBLIC HANDLERS (no auth) ====================

// publicGuard checks if project exists and has visibility=public
func (h *Handler) publicGuard(c *fiber.Ctx) (*Project, error) {
	id := c.Params("id")
	ctx := c.Context()
	project, err := h.svc.GetProjectByID(ctx, id)
	if err != nil {
		return nil, c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false, "message": "Project not found",
		})
	}
	if project.Visibility != "public" {
		return nil, c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false, "message": "Project is not public",
		})
	}
	return project, nil
}

// GetPublicProject GET /api/v1/public/project/:id
func (h *Handler) GetPublicProject(c *fiber.Ctx) error {
	project, err := h.publicGuard(c)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": project})
}

// GetPublicModules GET /api/v1/public/project/:id/modules
func (h *Handler) GetPublicModules(c *fiber.Ctx) error {
	if _, err := h.publicGuard(c); err != nil {
		return err
	}
	return h.GetModulesByProject(c)
}

// GetPublicTasks GET /api/v1/public/project/:id/tasks
func (h *Handler) GetPublicTasks(c *fiber.Ctx) error {
	if _, err := h.publicGuard(c); err != nil {
		return err
	}
	return h.GetTaskList(c)
}

// GetPublicActivity GET /api/v1/public/project/:id/activity
func (h *Handler) GetPublicActivity(c *fiber.Ctx) error {
	if _, err := h.publicGuard(c); err != nil {
		return err
	}
	return h.GetActivityByProject(c)
}

// GetPublicSprints GET /api/v1/public/project/:id/sprints
func (h *Handler) GetPublicSprints(c *fiber.Ctx) error {
	if _, err := h.publicGuard(c); err != nil {
		return err
	}
	return h.GetSprintsByProject(c)
}

// GetPublicActivityTimeline GET /api/v1/public/project/:id/charts/activity
func (h *Handler) GetPublicActivityTimeline(c *fiber.Ctx) error {
	if _, err := h.publicGuard(c); err != nil {
		return err
	}
	return h.GetActivityTimeline(c)
}

// GetPublicTaskDistribution GET /api/v1/public/project/:id/charts/distribution
func (h *Handler) GetPublicTaskDistribution(c *fiber.Ctx) error {
	if _, err := h.publicGuard(c); err != nil {
		return err
	}
	return h.GetTaskDistribution(c)
}
