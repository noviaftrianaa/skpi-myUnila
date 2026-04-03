package project

import (
	"context"
	"fmt"
	"math"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface
type Repository interface {
	// Projects
	GetProjectList(ctx context.Context, page, limit int, search, status string) (*PaginatedResult, error)
	GetProjectByID(ctx context.Context, id string) (*Project, error)
	CreateProject(ctx context.Context, p *Project) error
	UpdateProject(ctx context.Context, id string, fields map[string]interface{}) error
	SoftDeleteProject(ctx context.Context, id string) error
	GetProjectStats(ctx context.Context, id string) (*ProjectStats, error)
	GetGlobalStats(ctx context.Context) (*GlobalStats, error)

	// Modules
	GetModulesByProject(ctx context.Context, projectID string) ([]ModuleWithCounts, error)
	GetModuleByID(ctx context.Context, id string) (*Module, error)
	CreateModule(ctx context.Context, m *Module) error
	UpdateModule(ctx context.Context, id string, fields map[string]interface{}) error
	SoftDeleteModule(ctx context.Context, id string) error

	// Tasks
	GetTaskList(ctx context.Context, page, limit int, filters TaskFilters) (*PaginatedResult, error)
	GetTaskByID(ctx context.Context, id string) (*Task, error)
	CreateTask(ctx context.Context, t *Task) error
	UpdateTask(ctx context.Context, id string, fields map[string]interface{}) error
	SoftDeleteTask(ctx context.Context, id string) error
	GetNextTaskNumber(ctx context.Context, projectID string) (int, error)
	BulkReorderTasks(ctx context.Context, items []TaskReorderItem) error
	GetBoardView(ctx context.Context, projectID, moduleID string) (*BoardView, error)

	// Task Assignees
	GetTaskAssignees(ctx context.Context, taskID string) ([]TaskAssignee, error)
	AddTaskAssignee(ctx context.Context, taskID, userID, userName, initial string) (*TaskAssignee, error)
	RemoveTaskAssignee(ctx context.Context, taskID, userID string) error

	// Comments
	GetCommentsByTask(ctx context.Context, taskID string) ([]TaskComment, error)
	GetCommentByID(ctx context.Context, id string) (*TaskComment, error)
	CreateComment(ctx context.Context, c *TaskComment) error
	UpdateComment(ctx context.Context, id, konten string) error
	SoftDeleteComment(ctx context.Context, id string) error

	// Commits
	GetCommitsByTask(ctx context.Context, taskID string) ([]TaskCommit, error)
	GetCommitsByProject(ctx context.Context, projectID string) ([]TaskCommit, error)
	CreateCommit(ctx context.Context, c *TaskCommit) error
	FindTaskByKode(ctx context.Context, kode string) (*Task, error)
	CommitExists(ctx context.Context, hash string) (bool, error)

	// Activity
	GetActivityByProject(ctx context.Context, projectID string, page, limit int) (*PaginatedResult, error)
	CreateActivity(ctx context.Context, a *ActivityLog) error

	// Webhook
	GetWebhookByRepo(ctx context.Context, repoFullName string) (*WebhookConfig, error)
	GetWebhookByID(ctx context.Context, id string) (*WebhookConfig, error)
	GetWebhooksByProject(ctx context.Context, projectID string) ([]WebhookConfig, error)
	CreateWebhookConfig(ctx context.Context, wh *WebhookConfig) error
	UpdateWebhookConfig(ctx context.Context, id string, fields map[string]interface{}) error
	DeleteWebhookConfig(ctx context.Context, id string) error

	// Labels
	GetLabelsByProject(ctx context.Context, projectID string) ([]Label, error)
	CreateLabel(ctx context.Context, l *Label) error
	DeleteLabel(ctx context.Context, id string) error

	// Task Labels
	GetLabelsByTask(ctx context.Context, taskID string) ([]Label, error)
	AddLabelToTask(ctx context.Context, taskID, labelID string) error
	RemoveLabelFromTask(ctx context.Context, taskID, labelID string) error

	// Document Categories
	GetDocumentCategories(ctx context.Context) ([]DocumentCategory, error)
	CreateDocumentCategory(ctx context.Context, dc *DocumentCategory) error

	// Sprints
	GetSprintsByProject(ctx context.Context, projectID string) ([]SprintWithCounts, error)
	GetSprintByID(ctx context.Context, id string) (*Sprint, error)
	CreateSprint(ctx context.Context, s *Sprint) error
	UpdateSprint(ctx context.Context, id string, fields map[string]interface{}) error
	SoftDeleteSprint(ctx context.Context, id string) error

	// Documents
	GetDocumentsByProject(ctx context.Context, projectID string, page, limit int, category, status, search string) (*PaginatedResult, error)
	GetDocumentByID(ctx context.Context, id string) (*Document, error)
	CreateDocument(ctx context.Context, d *Document) error
	UpdateDocument(ctx context.Context, id string, fields map[string]interface{}) error
	SoftDeleteDocument(ctx context.Context, id string) error

	// Document Versions
	GetDocumentVersions(ctx context.Context, documentID string) ([]DocumentVersion, error)
	CreateDocumentVersion(ctx context.Context, v *DocumentVersion) error
	GetLatestVersionNumber(ctx context.Context, documentID string) (int, error)

	// Members
	GetMembersByProject(ctx context.Context, projectID string) ([]ProjectMember, error)
	AddMember(ctx context.Context, projectID string, req *AddMemberRequest, addedBy *string) (*ProjectMember, error)
	RemoveMember(ctx context.Context, projectID, memberID string) error

	// Watchers
	GetWatchersByProject(ctx context.Context, projectID string) ([]ProjectWatcher, error)
	AddWatcher(ctx context.Context, projectID string, req *AddWatcherRequest) (*ProjectWatcher, error)
	RemoveWatcher(ctx context.Context, projectID, watcherID string) error

	// User-filtered project list
	GetProjectsForUser(ctx context.Context, userID string, isPimpinan bool, page, limit int) (*PaginatedResult, error)

	// Org Structure
	GetOrgStructure(ctx context.Context, projectID string) (*OrgStructure, error)
	CreateOrgNode(ctx context.Context, projectID string, req *CreateOrgNodeRequest) (*OrgNode, error)
	UpdateOrgNode(ctx context.Context, nodeID string, req *UpdateOrgNodeRequest) (*OrgNode, error)
	DeleteOrgNode(ctx context.Context, nodeID string) error
	CreateOrgEdge(ctx context.Context, projectID string, req *CreateOrgEdgeRequest) (*OrgEdge, error)
	DeleteOrgEdge(ctx context.Context, edgeID string) error

	// Analytics / Contributions
	LogActivity(ctx context.Context, projectID string, taskID, userID *string, aksi, detail string) error
	GetContributions(ctx context.Context, userID string, year int) (*ContributionData, error)
	GetProjectContributions(ctx context.Context, projectID string, year int) (*ContributionData, error)
	GetActivityTimeline(ctx context.Context, projectID string, period string, months int) ([]ActivityPoint, error)
	GetBurndown(ctx context.Context, sprintID string) ([]BurndownPoint, error)
	GetTaskDistribution(ctx context.Context, projectID string) ([]TaskDistribution, error)
	GetTeamContribution(ctx context.Context, projectID string, months int) ([]TeamContribution, error)
	GetUserProfile(ctx context.Context, userID string) (*UserProfile, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ===== PROJECT =====

func (r *repository) GetProjectList(ctx context.Context, page, limit int, search, status string) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	where := "WHERE p.soft_delete = FALSE"
	args := []interface{}{}
	argIdx := 1

	if search != "" {
		where += fmt.Sprintf(" AND (p.nm_project ILIKE $%d OR p.kode_project ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	}
	if status != "" {
		where += fmt.Sprintf(" AND p.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM projects p %s", where)
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, fmt.Errorf("failed to count projects: %w", err)
	}

	dataArgs := append(args, limit, offset)
	limitIdx := argIdx
	offsetIdx := argIdx + 1
	dataQuery := fmt.Sprintf(`
		SELECT p.id_project, p.kode_project, p.nm_project, p.deskripsi, p.status, p.warna,
		       p.tgl_mulai, p.tgl_target, p.repo_url, p.id_unit, p.nm_unit, p.visibility, p.created_at, p.updated_at,
		       COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.id_project = p.id_project AND t.soft_delete = FALSE), 0) AS task_count,
		       COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.id_project = p.id_project AND t.soft_delete = FALSE AND t.status = 'done'), 0) AS task_done,
		       COALESCE((SELECT COUNT(DISTINCT id_module) FROM modules m WHERE m.id_project = p.id_project AND m.soft_delete = FALSE), 0) AS module_count
		FROM projects p %s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, limitIdx, offsetIdx)

	var items []ProjectListItem
	if err := r.db.SelectContext(ctx, &items, dataQuery, dataArgs...); err != nil {
		return nil, fmt.Errorf("failed to get project list: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return &PaginatedResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetProjectByID(ctx context.Context, id string) (*Project, error) {
	var p Project
	query := `SELECT * FROM projects WHERE soft_delete = FALSE AND id_project = $1`
	if err := r.db.GetContext(ctx, &p, query, id); err != nil {
		return nil, fmt.Errorf("failed to get project: %w", err)
	}
	return &p, nil
}

func (r *repository) CreateProject(ctx context.Context, p *Project) error {
	query := `
		INSERT INTO projects (id_project, kode_project, nm_project, deskripsi, status, repo_url, repo_provider, warna, tgl_mulai, tgl_target, id_owner, id_unit, nm_unit, visibility)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`
	_, err := r.db.ExecContext(ctx, query,
		p.IDProject, p.KodeProject, p.NmProject, p.Deskripsi, p.Status,
		p.RepoURL, p.RepoProvider, p.Warna, p.TglMulai, p.TglTarget, p.IDOwner,
		p.IDUnit, p.NmUnit, p.Visibility,
	)
	if err != nil {
		return fmt.Errorf("failed to create project: %w", err)
	}
	return nil
}

func (r *repository) UpdateProject(ctx context.Context, id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	setClauses := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
		args = append(args, val)
		idx++
	}
	args = append(args, id)
	query := fmt.Sprintf("UPDATE projects SET %s WHERE id_project = $%d", strings.Join(setClauses, ", "), idx)
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update project: %w", err)
	}
	return nil
}

func (r *repository) SoftDeleteProject(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE projects SET soft_delete = TRUE WHERE id_project = $1", id)
	if err != nil {
		return fmt.Errorf("failed to soft delete project: %w", err)
	}
	return nil
}

func (r *repository) GetProjectStats(ctx context.Context, id string) (*ProjectStats, error) {
	var stats ProjectStats
	query := `
		SELECT
			(SELECT COUNT(*) FROM modules WHERE id_project = $1 AND soft_delete = FALSE) AS total_modules,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE) AS total_tasks,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE AND status = 'backlog') AS task_backlog,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE AND status = 'todo') AS task_todo,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE AND status = 'in_progress') AS task_in_progress,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE AND status = 'review') AS task_review,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE AND status = 'done') AS task_done,
			(SELECT COUNT(*) FROM tasks WHERE id_project = $1 AND soft_delete = FALSE AND status = 'cancelled') AS task_cancelled
	`
	if err := r.db.GetContext(ctx, &stats, query, id); err != nil {
		return nil, fmt.Errorf("failed to get project stats: %w", err)
	}
	return &stats, nil
}

func (r *repository) GetGlobalStats(ctx context.Context) (*GlobalStats, error) {
	var stats GlobalStats
	query := `
		SELECT
			(SELECT COUNT(*) FROM projects WHERE soft_delete = FALSE) AS total_project,
			(SELECT COUNT(*) FROM projects WHERE soft_delete = FALSE AND status = 'active') AS project_aktif,
			(SELECT COUNT(*) FROM tasks WHERE soft_delete = FALSE AND status = 'done') AS task_done,
			(SELECT COUNT(*) FROM tasks WHERE soft_delete = FALSE AND status != 'done' AND status != 'cancelled' AND tgl_target < NOW() AND tgl_target IS NOT NULL) AS task_overdue
	`
	if err := r.db.GetContext(ctx, &stats, query); err != nil {
		return nil, fmt.Errorf("failed to get global stats: %w", err)
	}
	return &stats, nil
}

// ===== MODULE =====

func (r *repository) GetModulesByProject(ctx context.Context, projectID string) ([]ModuleWithCounts, error) {
	var modules []ModuleWithCounts
	query := `
		SELECT
			m.id_module, m.id_project, m.nm_module, m.deskripsi, m.status, m.urutan, m.warna,
			m.tgl_mulai, m.tgl_target, m.created_at, m.updated_at,
			COUNT(t.id_task) AS total_tasks,
			SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS task_done
		FROM modules m
		LEFT JOIN tasks t ON t.id_module = m.id_module AND t.soft_delete = FALSE
		WHERE m.id_project = $1 AND m.soft_delete = FALSE
		GROUP BY m.id_module
		ORDER BY m.urutan ASC, m.created_at ASC
	`
	if err := r.db.SelectContext(ctx, &modules, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get modules: %w", err)
	}
	return modules, nil
}

func (r *repository) GetModuleByID(ctx context.Context, id string) (*Module, error) {
	var m Module
	query := `SELECT * FROM modules WHERE soft_delete = FALSE AND id_module = $1`
	if err := r.db.GetContext(ctx, &m, query, id); err != nil {
		return nil, fmt.Errorf("failed to get module: %w", err)
	}
	return &m, nil
}

func (r *repository) CreateModule(ctx context.Context, m *Module) error {
	query := `
		INSERT INTO modules (id_module, id_project, nm_module, deskripsi, status, urutan, warna, tgl_mulai, tgl_target)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.ExecContext(ctx, query,
		m.IDModule, m.IDProject, m.NmModule, m.Deskripsi, m.Status,
		m.Urutan, m.Warna, m.TglMulai, m.TglTarget,
	)
	if err != nil {
		return fmt.Errorf("failed to create module: %w", err)
	}
	return nil
}

func (r *repository) UpdateModule(ctx context.Context, id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	setClauses := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
		args = append(args, val)
		idx++
	}
	args = append(args, id)
	query := fmt.Sprintf("UPDATE modules SET %s WHERE id_module = $%d", strings.Join(setClauses, ", "), idx)
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update module: %w", err)
	}
	return nil
}

func (r *repository) SoftDeleteModule(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE modules SET soft_delete = TRUE WHERE id_module = $1", id)
	if err != nil {
		return fmt.Errorf("failed to soft delete module: %w", err)
	}
	return nil
}

// ===== TASK =====

func (r *repository) GetTaskList(ctx context.Context, page, limit int, filters TaskFilters) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	where := "WHERE soft_delete = FALSE"
	args := []interface{}{}
	argIdx := 1

	if filters.IDProject != "" {
		where += fmt.Sprintf(" AND id_project = $%d", argIdx)
		args = append(args, filters.IDProject)
		argIdx++
	}
	if filters.IDModule != "" {
		where += fmt.Sprintf(" AND id_module = $%d", argIdx)
		args = append(args, filters.IDModule)
		argIdx++
	}
	if filters.Status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, filters.Status)
		argIdx++
	}
	if filters.Prioritas != "" {
		where += fmt.Sprintf(" AND prioritas = $%d", argIdx)
		args = append(args, filters.Prioritas)
		argIdx++
	}
	if filters.IDAssignee != "" {
		where += fmt.Sprintf(" AND id_assignee = $%d", argIdx)
		args = append(args, filters.IDAssignee)
		argIdx++
	}
	if filters.Search != "" {
		where += fmt.Sprintf(" AND (judul ILIKE $%d OR kode_task ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+filters.Search+"%")
		argIdx++
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM tasks %s", where)
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, fmt.Errorf("failed to count tasks: %w", err)
	}

	dataArgs := append(args, limit, offset)
	dataQuery := fmt.Sprintf(`
		SELECT id_task, id_module, id_project, kode_task, nomor_task, judul,
		       tipe, prioritas, status, id_assignee, tgl_target, progress, urutan, created_at, updated_at
		FROM tasks %s
		ORDER BY urutan ASC, created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argIdx, argIdx+1)

	var items []TaskListItem
	if err := r.db.SelectContext(ctx, &items, dataQuery, dataArgs...); err != nil {
		return nil, fmt.Errorf("failed to get task list: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return &PaginatedResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetTaskByID(ctx context.Context, id string) (*Task, error) {
	var t Task
	query := `SELECT * FROM tasks WHERE soft_delete = FALSE AND id_task = $1`
	if err := r.db.GetContext(ctx, &t, query, id); err != nil {
		return nil, fmt.Errorf("failed to get task: %w", err)
	}
	return &t, nil
}

func (r *repository) CreateTask(ctx context.Context, t *Task) error {
	query := `
		INSERT INTO tasks (id_task, id_module, id_project, id_sprint, kode_task, nomor_task, judul, deskripsi,
		                   tipe, prioritas, status, id_assignee, id_reporter, tgl_mulai, tgl_target,
		                   progress, estimasi_jam, tags, urutan)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
	`
	_, err := r.db.ExecContext(ctx, query,
		t.IDTask, t.IDModule, t.IDProject, t.IDSprint, t.KodeTask, t.NomorTask,
		t.Judul, t.Deskripsi, t.Tipe, t.Prioritas, t.Status,
		t.IDAssignee, t.IDReporter, t.TglMulai, t.TglTarget,
		t.Progress, t.EstimasiJam, t.Tags, t.Urutan,
	)
	if err != nil {
		return fmt.Errorf("failed to create task: %w", err)
	}
	return nil
}

func (r *repository) UpdateTask(ctx context.Context, id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	setClauses := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
		args = append(args, val)
		idx++
	}
	args = append(args, id)
	query := fmt.Sprintf("UPDATE tasks SET %s WHERE id_task = $%d", strings.Join(setClauses, ", "), idx)
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update task: %w", err)
	}
	return nil
}

func (r *repository) SoftDeleteTask(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE tasks SET soft_delete = TRUE WHERE id_task = $1", id)
	if err != nil {
		return fmt.Errorf("failed to soft delete task: %w", err)
	}
	return nil
}

func (r *repository) GetNextTaskNumber(ctx context.Context, projectID string) (int, error) {
	var max int
	query := `SELECT COALESCE(MAX(nomor_task), 0) + 1 FROM tasks WHERE id_project = $1`
	if err := r.db.GetContext(ctx, &max, query, projectID); err != nil {
		return 0, fmt.Errorf("failed to get next task number: %w", err)
	}
	return max, nil
}

func (r *repository) BulkReorderTasks(ctx context.Context, items []TaskReorderItem) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	for _, item := range items {
		if item.Status != "" {
			_, err := tx.ExecContext(ctx, "UPDATE tasks SET urutan = $1, status = $2 WHERE id_task = $3", item.Urutan, item.Status, item.IDTask)
			if err != nil {
				return fmt.Errorf("failed to reorder task %s: %w", item.IDTask, err)
			}
		} else {
			_, err := tx.ExecContext(ctx, "UPDATE tasks SET urutan = $1 WHERE id_task = $2", item.Urutan, item.IDTask)
			if err != nil {
				return fmt.Errorf("failed to reorder task %s: %w", item.IDTask, err)
			}
		}
	}

	return tx.Commit()
}

func (r *repository) GetBoardView(ctx context.Context, projectID, moduleID string) (*BoardView, error) {
	where := "WHERE t.soft_delete = FALSE AND t.id_project = $1"
	args := []interface{}{projectID}
	argIdx := 2

	if moduleID != "" {
		where += fmt.Sprintf(" AND t.id_module = $%d", argIdx)
		args = append(args, moduleID)
	}

	query := fmt.Sprintf(`
		SELECT t.id_task, t.id_module, t.id_project, t.kode_task, t.nomor_task, t.judul,
		       t.tipe, t.prioritas, t.status, t.id_assignee, t.assignee_name, t.assignee_initial,
		       COALESCE(
		         (SELECT json_agg(json_build_object('id', ta.id_pengguna, 'name', ta.nm_pengguna, 'initial', ta.initial))
		          FROM task_assignees ta WHERE ta.id_task = t.id_task),
		         '[]'
		       )::text AS assignees_json,
		       t.tgl_target, t.progress, t.urutan, t.created_at, t.updated_at
		FROM tasks t %s
		ORDER BY t.status, t.urutan ASC
	`, where)

	var tasks []TaskListItem
	if err := r.db.SelectContext(ctx, &tasks, query, args...); err != nil {
		return nil, fmt.Errorf("failed to get board tasks: %w", err)
	}

	statusLabels := map[string]string{
		"backlog":     "Backlog",
		"todo":        "To Do",
		"in_progress": "In Progress",
		"review":      "Review",
		"done":        "Done",
		"cancelled":   "Cancelled",
	}
	statusOrder := []string{"backlog", "todo", "in_progress", "review", "done", "cancelled"}

	tasksByStatus := map[string][]TaskListItem{}
	for _, t := range tasks {
		tasksByStatus[t.Status] = append(tasksByStatus[t.Status], t)
	}

	columns := []BoardColumn{}
	for _, s := range statusOrder {
		col := BoardColumn{
			Status: s,
			Label:  statusLabels[s],
			Tasks:  tasksByStatus[s],
		}
		if col.Tasks == nil {
			col.Tasks = []TaskListItem{}
		}
		columns = append(columns, col)
	}

	return &BoardView{
		IDProject: projectID,
		IDModule:  moduleID,
		Columns:   columns,
	}, nil
}

// ===== TASK ASSIGNEES =====

func (r *repository) GetTaskAssignees(ctx context.Context, taskID string) ([]TaskAssignee, error) {
	var assignees []TaskAssignee
	query := `SELECT id_task_assignee, id_task, id_pengguna, nm_pengguna, initial, created_at::text AS created_at
	          FROM task_assignees WHERE id_task = $1 ORDER BY created_at ASC`
	if err := r.db.SelectContext(ctx, &assignees, query, taskID); err != nil {
		return nil, fmt.Errorf("failed to get task assignees: %w", err)
	}
	if assignees == nil {
		assignees = []TaskAssignee{}
	}
	return assignees, nil
}

func (r *repository) AddTaskAssignee(ctx context.Context, taskID, userID, userName, initial string) (*TaskAssignee, error) {
	var assignee TaskAssignee
	query := `INSERT INTO task_assignees (id_task, id_pengguna, nm_pengguna, initial)
	          VALUES ($1, $2, $3, $4)
	          ON CONFLICT (id_task, id_pengguna) DO NOTHING
	          RETURNING id_task_assignee, id_task, id_pengguna, nm_pengguna, initial, created_at::text AS created_at`
	if err := r.db.GetContext(ctx, &assignee, query, taskID, userID, userName, initial); err != nil {
		return nil, fmt.Errorf("failed to add task assignee: %w", err)
	}
	// Also update the single assignee fields for backward compat
	r.db.ExecContext(ctx, "UPDATE tasks SET id_assignee = $1, assignee_name = $2, assignee_initial = $3 WHERE id_task = $4",
		userID, userName, initial, taskID)
	return &assignee, nil
}

func (r *repository) RemoveTaskAssignee(ctx context.Context, taskID, userID string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM task_assignees WHERE id_task = $1 AND id_pengguna = $2", taskID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove task assignee: %w", err)
	}
	// Update single assignee field — pick first remaining or null
	var remaining []TaskAssignee
	r.db.SelectContext(ctx, &remaining, "SELECT id_pengguna, nm_pengguna, initial FROM task_assignees WHERE id_task = $1 ORDER BY created_at ASC LIMIT 1", taskID)
	if len(remaining) > 0 {
		r.db.ExecContext(ctx, "UPDATE tasks SET id_assignee = $1, assignee_name = $2, assignee_initial = $3 WHERE id_task = $4",
			remaining[0].IDPengguna, remaining[0].NmPengguna, remaining[0].Initial, taskID)
	} else {
		r.db.ExecContext(ctx, "UPDATE tasks SET id_assignee = NULL, assignee_name = NULL, assignee_initial = NULL WHERE id_task = $1", taskID)
	}
	return nil
}

// ===== COMMENTS =====

func (r *repository) GetCommentsByTask(ctx context.Context, taskID string) ([]TaskComment, error) {
	var comments []TaskComment
	query := `SELECT * FROM task_comments WHERE id_task = $1 AND soft_delete = FALSE ORDER BY created_at ASC`
	if err := r.db.SelectContext(ctx, &comments, query, taskID); err != nil {
		return nil, fmt.Errorf("failed to get comments: %w", err)
	}
	return comments, nil
}

func (r *repository) GetCommentByID(ctx context.Context, id string) (*TaskComment, error) {
	var c TaskComment
	query := `SELECT * FROM task_comments WHERE id_comment = $1 AND soft_delete = FALSE`
	if err := r.db.GetContext(ctx, &c, query, id); err != nil {
		return nil, fmt.Errorf("failed to get comment: %w", err)
	}
	return &c, nil
}

func (r *repository) CreateComment(ctx context.Context, c *TaskComment) error {
	query := `
		INSERT INTO task_comments (id_comment, id_task, id_pengguna, konten, tipe)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, query, c.IDComment, c.IDTask, c.IDPengguna, c.Konten, c.Tipe)
	if err != nil {
		return fmt.Errorf("failed to create comment: %w", err)
	}
	return nil
}

func (r *repository) UpdateComment(ctx context.Context, id, konten string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE task_comments SET konten = $1 WHERE id_comment = $2", konten, id)
	if err != nil {
		return fmt.Errorf("failed to update comment: %w", err)
	}
	return nil
}

func (r *repository) SoftDeleteComment(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE task_comments SET soft_delete = TRUE WHERE id_comment = $1", id)
	if err != nil {
		return fmt.Errorf("failed to soft delete comment: %w", err)
	}
	return nil
}

// ===== COMMITS =====

func (r *repository) GetCommitsByTask(ctx context.Context, taskID string) ([]TaskCommit, error) {
	var commits []TaskCommit
	query := `SELECT * FROM task_commits WHERE id_task = $1 ORDER BY committed_at DESC`
	if err := r.db.SelectContext(ctx, &commits, query, taskID); err != nil {
		return nil, fmt.Errorf("failed to get commits: %w", err)
	}
	return commits, nil
}

func (r *repository) GetCommitsByProject(ctx context.Context, projectID string) ([]TaskCommit, error) {
	var commits []TaskCommit
	query := `SELECT * FROM task_commits WHERE id_project = $1 ORDER BY committed_at DESC LIMIT 50`
	if err := r.db.SelectContext(ctx, &commits, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get commits by project: %w", err)
	}
	return commits, nil
}

func (r *repository) CreateCommit(ctx context.Context, c *TaskCommit) error {
	query := `
		INSERT INTO task_commits (id_task_commit, id_task, id_project, commit_hash, commit_hash_short,
		                          commit_message, author_name, author_email, branch, commit_url, committed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(ctx, query,
		c.IDTaskCommit, c.IDTask, c.IDProject, c.CommitHash, c.CommitHashShort,
		c.CommitMessage, c.AuthorName, c.AuthorEmail, c.Branch, c.CommitURL, c.CommittedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create commit: %w", err)
	}
	return nil
}

func (r *repository) FindTaskByKode(ctx context.Context, kode string) (*Task, error) {
	var t Task
	query := `SELECT * FROM tasks WHERE kode_task = $1 AND soft_delete = FALSE`
	if err := r.db.GetContext(ctx, &t, query, kode); err != nil {
		return nil, fmt.Errorf("failed to find task by kode: %w", err)
	}
	return &t, nil
}

func (r *repository) CommitExists(ctx context.Context, hash string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT COUNT(*) FROM task_commits WHERE commit_hash = $1", hash)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// ===== ACTIVITY =====

func (r *repository) GetActivityByProject(ctx context.Context, projectID string, page, limit int) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM activity_log WHERE id_project = $1", projectID); err != nil {
		return nil, fmt.Errorf("failed to count activities: %w", err)
	}

	var items []ActivityLog
	query := `
		SELECT * FROM activity_log
		WHERE id_project = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	if err := r.db.SelectContext(ctx, &items, query, projectID, limit, offset); err != nil {
		return nil, fmt.Errorf("failed to get activities: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return &PaginatedResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) CreateActivity(ctx context.Context, a *ActivityLog) error {
	query := `
		INSERT INTO activity_log (id_activity, id_project, id_task, id_pengguna, aksi, detail)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, a.IDActivity, a.IDProject, a.IDTask, a.IDPengguna, a.Aksi, a.Detail)
	if err != nil {
		return fmt.Errorf("failed to create activity: %w", err)
	}
	return nil
}

// ===== WEBHOOK =====

func (r *repository) GetWebhookByRepo(ctx context.Context, repoFullName string) (*WebhookConfig, error) {
	var wh WebhookConfig
	query := `SELECT * FROM webhook_config WHERE repo_full_name = $1 AND a_active = TRUE`
	if err := r.db.GetContext(ctx, &wh, query, repoFullName); err != nil {
		return nil, fmt.Errorf("failed to get webhook config: %w", err)
	}
	return &wh, nil
}

func (r *repository) GetWebhookByID(ctx context.Context, id string) (*WebhookConfig, error) {
	var wh WebhookConfig
	query := `SELECT * FROM webhook_config WHERE id_webhook = $1`
	if err := r.db.GetContext(ctx, &wh, query, id); err != nil {
		return nil, fmt.Errorf("failed to get webhook config: %w", err)
	}
	return &wh, nil
}

func (r *repository) GetWebhooksByProject(ctx context.Context, projectID string) ([]WebhookConfig, error) {
	var whs []WebhookConfig
	query := `SELECT * FROM webhook_config WHERE id_project = $1 ORDER BY created_at DESC`
	if err := r.db.SelectContext(ctx, &whs, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get webhooks: %w", err)
	}
	return whs, nil
}

func (r *repository) CreateWebhookConfig(ctx context.Context, wh *WebhookConfig) error {
	query := `
		INSERT INTO webhook_config (id_webhook, id_project, provider, repo_full_name, webhook_secret, a_active)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query,
		wh.IDWebhook, wh.IDProject, wh.Provider, wh.RepoFullName, wh.WebhookSecret, wh.AActive,
	)
	if err != nil {
		return fmt.Errorf("failed to create webhook config: %w", err)
	}
	return nil
}

func (r *repository) UpdateWebhookConfig(ctx context.Context, id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	setClauses := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
		args = append(args, val)
		idx++
	}
	args = append(args, id)
	query := fmt.Sprintf("UPDATE webhook_config SET %s WHERE id_webhook = $%d", strings.Join(setClauses, ", "), idx)
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update webhook config: %w", err)
	}
	return nil
}

func (r *repository) DeleteWebhookConfig(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM webhook_config WHERE id_webhook = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete webhook config: %w", err)
	}
	return nil
}

// ===== LABELS =====

func (r *repository) GetLabelsByProject(ctx context.Context, projectID string) ([]Label, error) {
	var labels []Label
	query := `SELECT * FROM labels WHERE id_project = $1 ORDER BY nm_label ASC`
	if err := r.db.SelectContext(ctx, &labels, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get labels: %w", err)
	}
	return labels, nil
}

func (r *repository) CreateLabel(ctx context.Context, l *Label) error {
	query := `INSERT INTO labels (id_label, id_project, nm_label, warna) VALUES ($1, $2, $3, $4)`
	_, err := r.db.ExecContext(ctx, query, l.IDLabel, l.IDProject, l.NmLabel, l.Warna)
	if err != nil {
		return fmt.Errorf("failed to create label: %w", err)
	}
	return nil
}

func (r *repository) DeleteLabel(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM labels WHERE id_label = $1", id)
	if err != nil {
		return fmt.Errorf("failed to delete label: %w", err)
	}
	return nil
}

// ===== TASK LABELS =====

func (r *repository) GetLabelsByTask(ctx context.Context, taskID string) ([]Label, error) {
	var labels []Label
	query := `
		SELECT l.id_label, l.id_project, l.nm_label, l.warna, l.created_at
		FROM labels l
		JOIN task_labels tl ON l.id_label = tl.id_label
		WHERE tl.id_task = $1
		ORDER BY l.nm_label ASC
	`
	if err := r.db.SelectContext(ctx, &labels, query, taskID); err != nil {
		return nil, fmt.Errorf("failed to get task labels: %w", err)
	}
	return labels, nil
}

func (r *repository) AddLabelToTask(ctx context.Context, taskID, labelID string) error {
	query := `INSERT INTO task_labels (id_task, id_label) VALUES ($1, $2) ON CONFLICT DO NOTHING`
	_, err := r.db.ExecContext(ctx, query, taskID, labelID)
	if err != nil {
		return fmt.Errorf("failed to add label to task: %w", err)
	}
	return nil
}

func (r *repository) RemoveLabelFromTask(ctx context.Context, taskID, labelID string) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM task_labels WHERE id_task = $1 AND id_label = $2", taskID, labelID)
	if err != nil {
		return fmt.Errorf("failed to remove label from task: %w", err)
	}
	return nil
}

// ===== DOCUMENT CATEGORIES =====

func (r *repository) GetDocumentCategories(ctx context.Context) ([]DocumentCategory, error) {
	var categories []DocumentCategory
	query := `SELECT * FROM document_categories ORDER BY urutan ASC, nm_kategori ASC`
	if err := r.db.SelectContext(ctx, &categories, query); err != nil {
		return nil, fmt.Errorf("failed to get document categories: %w", err)
	}
	return categories, nil
}

func (r *repository) CreateDocumentCategory(ctx context.Context, dc *DocumentCategory) error {
	query := `
		INSERT INTO document_categories (id_doc_category, nm_kategori, kode_kategori, icon, urutan)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, query,
		dc.IDDocCategory, dc.NmKategori, dc.KodeKategori, dc.Icon, dc.Urutan,
	)
	if err != nil {
		return fmt.Errorf("failed to create document category: %w", err)
	}
	return nil
}

// ===== DOCUMENTS =====

func (r *repository) GetDocumentsByProject(ctx context.Context, projectID string, page, limit int, category, status, search string) (*PaginatedResult, error) {
	offset := (page - 1) * limit
	where := "WHERE d.soft_delete = FALSE AND d.id_project = $1"
	args := []interface{}{projectID}
	argIdx := 2

	if category != "" {
		where += fmt.Sprintf(" AND d.id_doc_category = $%d", argIdx)
		args = append(args, category)
		argIdx++
	}
	if status != "" {
		where += fmt.Sprintf(" AND d.status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}
	if search != "" {
		where += fmt.Sprintf(" AND (d.nm_dokumen ILIKE $%d OR d.nomor_dokumen ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM documents d %s", where)
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, fmt.Errorf("failed to count documents: %w", err)
	}

	dataArgs := append(args, limit, offset)
	dataQuery := fmt.Sprintf(`
		SELECT
			d.id_document, d.id_project, d.id_doc_category, d.id_task,
			d.nm_dokumen, d.nomor_dokumen, d.tgl_dokumen, d.tgl_berlaku, d.tgl_berakhir,
			d.file_name, d.file_size, d.mime_type, d.status, d.id_uploader,
			COALESCE(d.version_number, 1) AS version_number,
			d.created_at, d.updated_at,
			dc.nm_kategori AS kategori_nama,
			dc.icon AS kategori_icon
		FROM documents d
		LEFT JOIN document_categories dc ON dc.id_doc_category = d.id_doc_category
		%s
		ORDER BY d.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argIdx, argIdx+1)

	var items []DocumentListItem
	if err := r.db.SelectContext(ctx, &items, dataQuery, dataArgs...); err != nil {
		return nil, fmt.Errorf("failed to get documents: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return &PaginatedResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (r *repository) GetDocumentByID(ctx context.Context, id string) (*Document, error) {
	var d Document
	query := `SELECT * FROM documents WHERE soft_delete = FALSE AND id_document = $1`
	if err := r.db.GetContext(ctx, &d, query, id); err != nil {
		return nil, fmt.Errorf("failed to get document: %w", err)
	}
	return &d, nil
}

func (r *repository) CreateDocument(ctx context.Context, d *Document) error {
	query := `
		INSERT INTO documents (id_document, id_project, id_doc_category, id_task, nm_dokumen,
		                       nomor_dokumen, tgl_dokumen, tgl_berlaku, tgl_berakhir, deskripsi,
		                       file_path, file_name, file_size, mime_type, status, id_uploader)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`
	_, err := r.db.ExecContext(ctx, query,
		d.IDDocument, d.IDProject, d.IDDocCategory, d.IDTask, d.NmDokumen,
		d.NomorDokumen, d.TglDokumen, d.TglBerlaku, d.TglBerakhir, d.Deskripsi,
		d.FilePath, d.FileName, d.FileSize, d.MimeType, d.Status, d.IDUploader,
	)
	if err != nil {
		return fmt.Errorf("failed to create document: %w", err)
	}
	return nil
}

func (r *repository) UpdateDocument(ctx context.Context, id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	setClauses := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
		args = append(args, val)
		idx++
	}
	args = append(args, id)
	query := fmt.Sprintf("UPDATE documents SET %s WHERE id_document = $%d", strings.Join(setClauses, ", "), idx)
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update document: %w", err)
	}
	return nil
}

func (r *repository) SoftDeleteDocument(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE documents SET soft_delete = TRUE WHERE id_document = $1", id)
	if err != nil {
		return fmt.Errorf("failed to soft delete document: %w", err)
	}
	return nil
}

// ===== DOCUMENT VERSIONS =====

func (r *repository) GetDocumentVersions(ctx context.Context, documentID string) ([]DocumentVersion, error) {
	var versions []DocumentVersion
	query := `SELECT * FROM document_versions WHERE id_document = $1 ORDER BY version_number DESC`
	if err := r.db.SelectContext(ctx, &versions, query, documentID); err != nil {
		return nil, fmt.Errorf("failed to get document versions: %w", err)
	}
	return versions, nil
}

func (r *repository) CreateDocumentVersion(ctx context.Context, v *DocumentVersion) error {
	query := `
		INSERT INTO document_versions (id_version, id_document, version_number, file_path, file_name, file_size, mime_type, catatan, id_uploader)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := r.db.ExecContext(ctx, query,
		v.IDVersion, v.IDDocument, v.VersionNumber, v.FilePath, v.FileName,
		v.FileSize, v.MimeType, v.Catatan, v.IDUploader,
	)
	if err != nil {
		return fmt.Errorf("failed to create document version: %w", err)
	}
	return nil
}

func (r *repository) GetLatestVersionNumber(ctx context.Context, documentID string) (int, error) {
	var max int
	query := `SELECT COALESCE(MAX(version_number), 0) FROM document_versions WHERE id_document = $1`
	if err := r.db.GetContext(ctx, &max, query, documentID); err != nil {
		return 0, fmt.Errorf("failed to get latest version number: %w", err)
	}
	return max, nil
}

// ===== SPRINTS =====

func (r *repository) GetSprintsByProject(ctx context.Context, projectID string) ([]SprintWithCounts, error) {
	var sprints []SprintWithCounts
	query := `
		SELECT
			s.id_sprint, s.id_project, s.nm_sprint, s.deskripsi, s.tgl_mulai, s.tgl_selesai,
			s.status, s.urutan, s.created_at, s.updated_at, s.soft_delete,
			COUNT(t.id_task) AS total_tasks,
			SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) AS task_done
		FROM sprints s
		LEFT JOIN tasks t ON t.id_sprint = s.id_sprint AND t.soft_delete = FALSE
		WHERE s.id_project = $1 AND s.soft_delete = FALSE
		GROUP BY s.id_sprint
		ORDER BY s.urutan ASC, s.created_at ASC
	`
	if err := r.db.SelectContext(ctx, &sprints, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get sprints: %w", err)
	}
	return sprints, nil
}

func (r *repository) GetSprintByID(ctx context.Context, id string) (*Sprint, error) {
	var s Sprint
	query := `SELECT * FROM sprints WHERE soft_delete = FALSE AND id_sprint = $1`
	if err := r.db.GetContext(ctx, &s, query, id); err != nil {
		return nil, fmt.Errorf("failed to get sprint: %w", err)
	}
	return &s, nil
}

func (r *repository) CreateSprint(ctx context.Context, s *Sprint) error {
	query := `
		INSERT INTO sprints (id_sprint, id_project, nm_sprint, deskripsi, tgl_mulai, tgl_selesai, status, urutan)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query,
		s.IDSprint, s.IDProject, s.NmSprint, s.Deskripsi, s.TglMulai, s.TglSelesai, s.Status, s.Urutan,
	)
	if err != nil {
		return fmt.Errorf("failed to create sprint: %w", err)
	}
	return nil
}

func (r *repository) UpdateSprint(ctx context.Context, id string, fields map[string]interface{}) error {
	if len(fields) == 0 {
		return nil
	}
	setClauses := []string{}
	args := []interface{}{}
	idx := 1
	for col, val := range fields {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
		args = append(args, val)
		idx++
	}
	args = append(args, id)
	query := fmt.Sprintf("UPDATE sprints SET %s WHERE id_sprint = $%d", strings.Join(setClauses, ", "), idx)
	_, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("failed to update sprint: %w", err)
	}
	return nil
}

func (r *repository) SoftDeleteSprint(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, "UPDATE sprints SET soft_delete = TRUE WHERE id_sprint = $1", id)
	if err != nil {
		return fmt.Errorf("failed to soft delete sprint: %w", err)
	}
	return nil
}

// ===== MEMBERS =====

func (r *repository) GetMembersByProject(ctx context.Context, projectID string) ([]ProjectMember, error) {
	var members []ProjectMember
	query := `
		SELECT id_member, id_project, id_pengguna, nm_pengguna, role, added_by,
		       created_at::text AS created_at
		FROM project_members
		WHERE id_project = $1 AND soft_delete = FALSE
		ORDER BY created_at ASC
	`
	if err := r.db.SelectContext(ctx, &members, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get members: %w", err)
	}
	return members, nil
}

func (r *repository) AddMember(ctx context.Context, projectID string, req *AddMemberRequest, addedBy *string) (*ProjectMember, error) {
	id := uuid.New().String()
	query := `
		INSERT INTO project_members (id_member, id_project, id_pengguna, nm_pengguna, role, added_by)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.db.ExecContext(ctx, query, id, projectID, req.IDPengguna, req.NmPengguna, req.Role, addedBy)
	if err != nil {
		return nil, fmt.Errorf("failed to add member: %w", err)
	}
	return r.getMemberByID(ctx, id)
}

func (r *repository) getMemberByID(ctx context.Context, id string) (*ProjectMember, error) {
	var m ProjectMember
	query := `SELECT id_member, id_project, id_pengguna, nm_pengguna, role, added_by, created_at::text AS created_at FROM project_members WHERE id_member = $1`
	if err := r.db.GetContext(ctx, &m, query, id); err != nil {
		return nil, fmt.Errorf("failed to get member: %w", err)
	}
	return &m, nil
}

func (r *repository) RemoveMember(ctx context.Context, projectID, memberID string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE project_members SET soft_delete = TRUE WHERE id_member = $1 AND id_project = $2",
		memberID, projectID,
	)
	if err != nil {
		return fmt.Errorf("failed to remove member: %w", err)
	}
	return nil
}

// ===== WATCHERS =====

func (r *repository) GetWatchersByProject(ctx context.Context, projectID string) ([]ProjectWatcher, error) {
	var watchers []ProjectWatcher
	query := `
		SELECT id_watcher, id_project, id_pengguna, id_sdm, nm_pengguna, jabatan, nm_unit, tipe_akses,
		       created_at::text AS created_at
		FROM project_watchers
		WHERE id_project = $1 AND soft_delete = FALSE
		ORDER BY created_at ASC
	`
	if err := r.db.SelectContext(ctx, &watchers, query, projectID); err != nil {
		return nil, fmt.Errorf("failed to get watchers: %w", err)
	}
	return watchers, nil
}

func (r *repository) AddWatcher(ctx context.Context, projectID string, req *AddWatcherRequest) (*ProjectWatcher, error) {
	id := uuid.New().String()
	idSdm := &req.IDSdm
	if req.IDSdm == "" {
		idSdm = nil
	}
	query := `
		INSERT INTO project_watchers (id_watcher, id_project, id_pengguna, id_sdm, nm_pengguna, jabatan, nm_unit)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.db.ExecContext(ctx, query, id, projectID, req.IDPengguna, idSdm, req.NmPengguna, req.Jabatan, req.NmUnit)
	if err != nil {
		return nil, fmt.Errorf("failed to add watcher: %w", err)
	}
	return r.getWatcherByID(ctx, id)
}

func (r *repository) getWatcherByID(ctx context.Context, id string) (*ProjectWatcher, error) {
	var w ProjectWatcher
	query := `SELECT id_watcher, id_project, id_pengguna, id_sdm, nm_pengguna, jabatan, nm_unit, tipe_akses, created_at::text AS created_at FROM project_watchers WHERE id_watcher = $1`
	if err := r.db.GetContext(ctx, &w, query, id); err != nil {
		return nil, fmt.Errorf("failed to get watcher: %w", err)
	}
	return &w, nil
}

func (r *repository) RemoveWatcher(ctx context.Context, projectID, watcherID string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE project_watchers SET soft_delete = TRUE WHERE id_watcher = $1 AND id_project = $2",
		watcherID, projectID,
	)
	if err != nil {
		return fmt.Errorf("failed to remove watcher: %w", err)
	}
	return nil
}

// ===== USER-FILTERED PROJECT LIST =====

func (r *repository) GetProjectsForUser(ctx context.Context, userID string, isPimpinan bool, page, limit int) (*PaginatedResult, error) {
	offset := (page - 1) * limit

	countQuery := `
		SELECT COUNT(*) FROM projects p
		WHERE p.soft_delete = FALSE
		AND (
			EXISTS (SELECT 1 FROM project_members pm WHERE pm.id_project = p.id_project AND pm.id_pengguna = $1 AND pm.soft_delete = FALSE)
			OR EXISTS (SELECT 1 FROM project_watchers pw WHERE pw.id_project = p.id_project AND pw.id_pengguna = $1 AND pw.soft_delete = FALSE)
			OR ($2 = true AND p.visibility = 'public')
		)
	`

	var total int
	if err := r.db.GetContext(ctx, &total, countQuery, userID, isPimpinan); err != nil {
		return nil, fmt.Errorf("failed to count user projects: %w", err)
	}

	dataQuery := `
		SELECT p.id_project, p.kode_project, p.nm_project, p.deskripsi, p.status, p.warna,
		       p.tgl_mulai, p.tgl_target, p.repo_url, p.id_unit, p.nm_unit, p.visibility, p.created_at, p.updated_at,
		       COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.id_project = p.id_project AND t.soft_delete = FALSE), 0) AS task_count,
		       COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.id_project = p.id_project AND t.soft_delete = FALSE AND t.status = 'done'), 0) AS task_done,
		       COALESCE((SELECT COUNT(DISTINCT id_module) FROM modules m WHERE m.id_project = p.id_project AND m.soft_delete = FALSE), 0) AS module_count
		FROM projects p
		WHERE p.soft_delete = FALSE
		AND (
			EXISTS (SELECT 1 FROM project_members pm WHERE pm.id_project = p.id_project AND pm.id_pengguna = $1 AND pm.soft_delete = FALSE)
			OR EXISTS (SELECT 1 FROM project_watchers pw WHERE pw.id_project = p.id_project AND pw.id_pengguna = $1 AND pw.soft_delete = FALSE)
			OR ($2 = true AND p.visibility = 'public')
		)
		ORDER BY p.updated_at DESC
		LIMIT $3 OFFSET $4
	`

	var items []ProjectListItem
	if err := r.db.SelectContext(ctx, &items, dataQuery, userID, isPimpinan, limit, offset); err != nil {
		return nil, fmt.Errorf("failed to get user projects: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))
	return &PaginatedResult{
		Data:       items,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

// ===== ORG STRUCTURE =====

func (r *repository) GetOrgStructure(ctx context.Context, projectID string) (*OrgStructure, error) {
	var nodes []OrgNode
	nodesQuery := `
		SELECT id_node, id_project, id_pengguna, id_sdm, nm_display, jabatan, foto_url, urutan, warna, pos_x, pos_y
		FROM project_org_nodes
		WHERE id_project = $1 AND soft_delete = FALSE
		ORDER BY urutan ASC
	`
	if err := r.db.SelectContext(ctx, &nodes, nodesQuery, projectID); err != nil {
		return nil, fmt.Errorf("failed to get org nodes: %w", err)
	}
	if nodes == nil {
		nodes = []OrgNode{}
	}

	var edges []OrgEdge
	edgesQuery := `
		SELECT id_edge, id_project, id_node_from, id_node_to, label
		FROM project_org_edges
		WHERE id_project = $1
	`
	if err := r.db.SelectContext(ctx, &edges, edgesQuery, projectID); err != nil {
		return nil, fmt.Errorf("failed to get org edges: %w", err)
	}
	if edges == nil {
		edges = []OrgEdge{}
	}

	return &OrgStructure{Nodes: nodes, Edges: edges}, nil
}

func (r *repository) CreateOrgNode(ctx context.Context, projectID string, req *CreateOrgNodeRequest) (*OrgNode, error) {
	id := uuid.New().String()

	// get next urutan
	var maxUrutan int
	_ = r.db.GetContext(ctx, &maxUrutan,
		"SELECT COALESCE(MAX(urutan), 0) + 1 FROM project_org_nodes WHERE id_project = $1 AND soft_delete = FALSE",
		projectID,
	)

	query := `
		INSERT INTO project_org_nodes (id_node, id_project, id_pengguna, id_sdm, nm_display, jabatan, foto_url, urutan, warna, pos_x, pos_y)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(ctx, query,
		id, projectID, req.IDPengguna, req.IDSdm, req.NmDisplay, req.Jabatan, req.FotoURL, maxUrutan, req.Warna, req.PosX, req.PosY,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create org node: %w", err)
	}

	return r.getOrgNodeByID(ctx, id)
}

func (r *repository) getOrgNodeByID(ctx context.Context, id string) (*OrgNode, error) {
	var n OrgNode
	query := `SELECT id_node, id_project, id_pengguna, id_sdm, nm_display, jabatan, foto_url, urutan, warna, pos_x, pos_y FROM project_org_nodes WHERE id_node = $1`
	if err := r.db.GetContext(ctx, &n, query, id); err != nil {
		return nil, fmt.Errorf("failed to get org node: %w", err)
	}
	return &n, nil
}

func (r *repository) UpdateOrgNode(ctx context.Context, nodeID string, req *UpdateOrgNodeRequest) (*OrgNode, error) {
	fields := map[string]interface{}{}
	if req.NmDisplay != nil {
		fields["nm_display"] = *req.NmDisplay
	}
	if req.Jabatan != nil {
		fields["jabatan"] = *req.Jabatan
	}
	if req.PosX != nil {
		fields["pos_x"] = *req.PosX
	}
	if req.PosY != nil {
		fields["pos_y"] = *req.PosY
	}
	if req.Warna != nil {
		fields["warna"] = *req.Warna
	}

	if len(fields) > 0 {
		setClauses := []string{}
		args := []interface{}{}
		idx := 1
		for col, val := range fields {
			setClauses = append(setClauses, fmt.Sprintf("%s = $%d", col, idx))
			args = append(args, val)
			idx++
		}
		args = append(args, nodeID)
		query := fmt.Sprintf("UPDATE project_org_nodes SET %s WHERE id_node = $%d", strings.Join(setClauses, ", "), idx)
		if _, err := r.db.ExecContext(ctx, query, args...); err != nil {
			return nil, fmt.Errorf("failed to update org node: %w", err)
		}
	}

	return r.getOrgNodeByID(ctx, nodeID)
}

func (r *repository) DeleteOrgNode(ctx context.Context, nodeID string) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE project_org_nodes SET soft_delete = TRUE WHERE id_node = $1",
		nodeID,
	)
	if err != nil {
		return fmt.Errorf("failed to delete org node: %w", err)
	}
	return nil
}

func (r *repository) CreateOrgEdge(ctx context.Context, projectID string, req *CreateOrgEdgeRequest) (*OrgEdge, error) {
	id := uuid.New().String()
	query := `
		INSERT INTO project_org_edges (id_edge, id_project, id_node_from, id_node_to, label)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, query, id, projectID, req.IDNodeFrom, req.IDNodeTo, req.Label)
	if err != nil {
		return nil, fmt.Errorf("failed to create org edge: %w", err)
	}

	var e OrgEdge
	qGet := `SELECT id_edge, id_project, id_node_from, id_node_to, label FROM project_org_edges WHERE id_edge = $1`
	if err := r.db.GetContext(ctx, &e, qGet, id); err != nil {
		return nil, fmt.Errorf("failed to get org edge: %w", err)
	}
	return &e, nil
}

func (r *repository) DeleteOrgEdge(ctx context.Context, edgeID string) error {
	_, err := r.db.ExecContext(ctx,
		"DELETE FROM project_org_edges WHERE id_edge = $1",
		edgeID,
	)
	if err != nil {
		return fmt.Errorf("failed to delete org edge: %w", err)
	}
	return nil
}

// ===== ANALYTICS / CONTRIBUTIONS =====

func (r *repository) LogActivity(ctx context.Context, projectID string, taskID, userID *string, aksi, detail string) error {
	id := uuid.New().String()
	query := `INSERT INTO activity_log (id_activity, id_project, id_task, id_pengguna, aksi, detail) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, id, projectID, taskID, userID, aksi, detail)
	return err
}

func (r *repository) GetContributions(ctx context.Context, userID string, year int) (*ContributionData, error) {
	startDate := fmt.Sprintf("%d-01-01", year)
	endDate := fmt.Sprintf("%d-01-01", year+1)

	// Get daily counts
	var days []ContributionDay
	q := `SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS tanggal, COUNT(*) AS total
		FROM activity_log
		WHERE id_pengguna = $1 AND created_at >= $2 AND created_at < $3
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at)`
	if err := r.db.SelectContext(ctx, &days, q, userID, startDate, endDate); err != nil {
		return nil, fmt.Errorf("failed to get contributions: %w", err)
	}

	data := make(map[string]int)
	total := 0
	for _, d := range days {
		data[d.Date] = d.Count
		total += d.Count
	}

	// Get by type
	type TypeRow struct {
		Aksi  string `db:"aksi"`
		Total int    `db:"total"`
	}
	var typeRows []TypeRow
	qType := `SELECT aksi, COUNT(*) AS total FROM activity_log
		WHERE id_pengguna = $1 AND created_at >= $2 AND created_at < $3
		GROUP BY aksi`
	if err := r.db.SelectContext(ctx, &typeRows, qType, userID, startDate, endDate); err != nil {
		return nil, fmt.Errorf("failed to get contribution types: %w", err)
	}
	byType := make(map[string]int)
	for _, t := range typeRows {
		byType[t.Aksi] = t.Total
	}

	// Calculate streaks
	longestStreak, currentStreak := calcStreaks(data, year)

	return &ContributionData{
		Year:          year,
		Total:         total,
		LongestStreak: longestStreak,
		CurrentStreak: currentStreak,
		Data:          data,
		ByType:        byType,
	}, nil
}

func calcStreaks(data map[string]int, year int) (longest, current int) {
	curStreak := 0
	maxStreak := 0
	daysInMonth := []int{31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}
	if year%4 == 0 && (year%100 != 0 || year%400 == 0) {
		daysInMonth[1] = 29
	}
	for month := 1; month <= 12; month++ {
		for day := 1; day <= daysInMonth[month-1]; day++ {
			dateStr := fmt.Sprintf("%d-%02d-%02d", year, month, day)
			if data[dateStr] > 0 {
				curStreak++
				if curStreak > maxStreak {
					maxStreak = curStreak
				}
			} else {
				curStreak = 0
			}
		}
	}
	return maxStreak, curStreak
}

func (r *repository) GetActivityTimeline(ctx context.Context, projectID string, period string, months int) ([]ActivityPoint, error) {
	if months <= 0 {
		months = 3
	}

	var rows []struct {
		Period      string `db:"period"`
		TaskCreated int    `db:"task_created"`
		TaskDone    int    `db:"task_done"`
		Comments    int    `db:"comments"`
		Documents   int    `db:"documents"`
		Total       int    `db:"total"`
	}

	var q string
	if period == "monthly" {
		q = fmt.Sprintf(`
			SELECT 
				TO_CHAR(created_at, 'YYYY-MM') AS period,
				SUM(CASE WHEN aksi LIKE '%%created%%' THEN 1 ELSE 0 END) AS task_created,
				SUM(CASE WHEN aksi IN ('task_completed','task_status_changed') THEN 1 ELSE 0 END) AS task_done,
				SUM(CASE WHEN aksi LIKE '%%comment%%' THEN 1 ELSE 0 END) AS comments,
				SUM(CASE WHEN aksi LIKE '%%document%%' THEN 1 ELSE 0 END) AS documents,
				COUNT(*) AS total
			FROM activity_log
			WHERE id_project = $1 AND created_at >= NOW() - INTERVAL '%d months'
			GROUP BY TO_CHAR(created_at, 'YYYY-MM')
			ORDER BY period`, months)
	} else {
		q = fmt.Sprintf(`
			SELECT 
				TO_CHAR(created_at, 'IYYY-"W"IW') AS period,
				SUM(CASE WHEN aksi LIKE '%%created%%' THEN 1 ELSE 0 END) AS task_created,
				SUM(CASE WHEN aksi IN ('task_completed','task_status_changed') THEN 1 ELSE 0 END) AS task_done,
				SUM(CASE WHEN aksi LIKE '%%comment%%' THEN 1 ELSE 0 END) AS comments,
				SUM(CASE WHEN aksi LIKE '%%document%%' THEN 1 ELSE 0 END) AS documents,
				COUNT(*) AS total
			FROM activity_log
			WHERE id_project = $1 AND created_at >= NOW() - INTERVAL '%d months'
			GROUP BY TO_CHAR(created_at, 'IYYY-"W"IW')
			ORDER BY period`, months)
	}

	if err := r.db.SelectContext(ctx, &rows, q, projectID); err != nil {
		return nil, fmt.Errorf("failed to get activity timeline: %w", err)
	}

	result := make([]ActivityPoint, len(rows))
	for i, row := range rows {
		result[i] = ActivityPoint{
			Period:      row.Period,
			TaskCreated: row.TaskCreated,
			TaskDone:    row.TaskDone,
			Comments:    row.Comments,
			Documents:   row.Documents,
			Total:       row.Total,
		}
	}
	return result, nil
}

func (r *repository) GetBurndown(ctx context.Context, sprintID string) ([]BurndownPoint, error) {
	// Get sprint info
	var sprint struct {
		TglMulai   *string `db:"tgl_mulai"`
		TglSelesai *string `db:"tgl_selesai"`
	}
	qSprint := `SELECT TO_CHAR(tgl_mulai, 'YYYY-MM-DD') AS tgl_mulai, TO_CHAR(tgl_selesai, 'YYYY-MM-DD') AS tgl_selesai FROM sprints WHERE id_sprint = $1`
	if err := r.db.GetContext(ctx, &sprint, qSprint, sprintID); err != nil {
		return nil, fmt.Errorf("sprint not found: %w", err)
	}

	if sprint.TglMulai == nil || sprint.TglSelesai == nil {
		return []BurndownPoint{}, nil
	}

	// Get total tasks
	var totalTasks int
	qTotal := `SELECT COUNT(*) FROM tasks WHERE id_sprint = $1 AND soft_delete = FALSE`
	if err := r.db.GetContext(ctx, &totalTasks, qTotal, sprintID); err != nil {
		return nil, fmt.Errorf("failed to count sprint tasks: %w", err)
	}

	// Get completions per day
	type CompletionRow struct {
		Tanggal string `db:"tanggal"`
		Done    int    `db:"done"`
	}
	var completions []CompletionRow
	qComp := `SELECT TO_CHAR(DATE(tgl_selesai), 'YYYY-MM-DD') AS tanggal, COUNT(*) AS done
		FROM tasks 
		WHERE id_sprint = $1 AND status = 'done' AND tgl_selesai IS NOT NULL AND soft_delete = FALSE
		GROUP BY DATE(tgl_selesai)
		ORDER BY tanggal`
	if err := r.db.SelectContext(ctx, &completions, qComp, sprintID); err != nil {
		return nil, fmt.Errorf("failed to get completions: %w", err)
	}

	// Build completion map
	compMap := make(map[string]int)
	for _, c := range completions {
		compMap[c.Tanggal] = c.Done
	}

	// Generate burndown from start to end date (or today)
	startDate := *sprint.TglMulai
	endDate := *sprint.TglSelesai

	// Parse dates manually
	var startYear, startMonth, startDay int
	fmt.Sscanf(startDate, "%d-%d-%d", &startYear, &startMonth, &startDay)
	var endYear, endMonth, endDay int
	fmt.Sscanf(endDate, "%d-%d-%d", &endYear, &endMonth, &endDay)

	// Calculate total days
	daysInMonth := func(y, m int) int {
		months := []int{0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}
		if m == 2 && (y%4 == 0 && (y%100 != 0 || y%400 == 0)) {
			return 29
		}
		return months[m]
	}

	// Simple day iteration
	type dateIter struct {
		year, month, day int
	}
	nextDay := func(d dateIter) dateIter {
		d.day++
		if d.day > daysInMonth(d.year, d.month) {
			d.day = 1
			d.month++
			if d.month > 12 {
				d.month = 1
				d.year++
			}
		}
		return d
	}
	beforeOrEq := func(a, b dateIter) bool {
		if a.year != b.year {
			return a.year < b.year
		}
		if a.month != b.month {
			return a.month < b.month
		}
		return a.day <= b.day
	}

	start := dateIter{startYear, startMonth, startDay}
	end := dateIter{endYear, endMonth, endDay}

	// Count total sprint days
	totalDays := 0
	for d := start; beforeOrEq(d, end); d = nextDay(d) {
		totalDays++
	}
	if totalDays == 0 {
		totalDays = 1
	}

	var points []BurndownPoint
	remaining := totalTasks
	dayIdx := 0
	for d := start; beforeOrEq(d, end); d = nextDay(d) {
		dateStr := fmt.Sprintf("%d-%02d-%02d", d.year, d.month, d.day)
		if done, ok := compMap[dateStr]; ok {
			remaining -= done
			if remaining < 0 {
				remaining = 0
			}
		}
		ideal := totalTasks - int(float64(totalTasks)*float64(dayIdx)/float64(totalDays-1))
		if dayIdx == totalDays-1 {
			ideal = 0
		}
		points = append(points, BurndownPoint{
			Date:      dateStr,
			Remaining: remaining,
			Ideal:     ideal,
		})
		dayIdx++
	}

	return points, nil
}

func (r *repository) GetTaskDistribution(ctx context.Context, projectID string) ([]TaskDistribution, error) {
	var rows []TaskDistribution
	q := `SELECT status, COUNT(*) AS count FROM tasks WHERE id_project = $1 AND soft_delete = FALSE GROUP BY status ORDER BY status`
	if err := r.db.SelectContext(ctx, &rows, q, projectID); err != nil {
		return nil, fmt.Errorf("failed to get task distribution: %w", err)
	}
	return rows, nil
}

func (r *repository) GetTeamContribution(ctx context.Context, projectID string, months int) ([]TeamContribution, error) {
	if months <= 0 {
		months = 1
	}
	q := fmt.Sprintf(`
		SELECT 
			COALESCE(a.id_pengguna::text, 'unknown') AS id_pengguna,
			COALESCE(m.nm_pengguna, 'Unknown') AS nm_pengguna,
			COUNT(*) AS total,
			SUM(CASE WHEN a.aksi IN ('task_completed') THEN 1 ELSE 0 END) AS task_done,
			SUM(CASE WHEN a.aksi LIKE '%%comment%%' THEN 1 ELSE 0 END) AS comments,
			SUM(CASE WHEN a.aksi LIKE '%%document%%' THEN 1 ELSE 0 END) AS documents
		FROM activity_log a
		LEFT JOIN project_members m ON a.id_pengguna = m.id_pengguna AND m.id_project = a.id_project
		WHERE a.id_project = $1 AND a.created_at >= NOW() - INTERVAL '%d months'
		GROUP BY a.id_pengguna, m.nm_pengguna
		ORDER BY total DESC`, months)

	var rows []TeamContribution
	if err := r.db.SelectContext(ctx, &rows, q, projectID); err != nil {
		return nil, fmt.Errorf("failed to get team contributions: %w", err)
	}
	return rows, nil
}

func (r *repository) GetUserProfile(ctx context.Context, userID string) (*UserProfile, error) {
	// Get current year contributions
	currentYear := 2026
	contributions, err := r.GetContributions(ctx, userID, currentYear)
	if err != nil {
		contributions = &ContributionData{
			Year:   currentYear,
			Data:   make(map[string]int),
			ByType: make(map[string]int),
		}
	}

	// Get user stats
	type StatsRow struct {
		TaskCompleted int `db:"task_completed"`
		TaskCreated   int `db:"task_created"`
		Comments      int `db:"comments"`
		Documents     int `db:"documents"`
		TotalActivity int `db:"total_activity"`
	}
	var stats StatsRow
	qStats := `
		SELECT 
			SUM(CASE WHEN aksi = 'task_completed' THEN 1 ELSE 0 END) AS task_completed,
			SUM(CASE WHEN aksi LIKE '%%created%%' THEN 1 ELSE 0 END) AS task_created,
			SUM(CASE WHEN aksi LIKE '%%comment%%' THEN 1 ELSE 0 END) AS comments,
			SUM(CASE WHEN aksi LIKE '%%document%%' THEN 1 ELSE 0 END) AS documents,
			COUNT(*) AS total_activity
		FROM activity_log
		WHERE id_pengguna = $1`
	if err := r.db.GetContext(ctx, &stats, qStats, userID); err != nil {
		stats = StatsRow{}
	}

	// Get projects for this user
	type ProjectRow struct {
		IDProject  string `db:"id_project"`
		NmProject  string `db:"nm_project"`
		Role       string `db:"role"`
		TaskDone   int    `db:"task_done"`
		TotalTasks int    `db:"total_tasks"`
	}
	var projectRows []ProjectRow
	qProjects := `
		SELECT 
			m.id_project,
			p.nm_project,
			m.role,
			COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.id_project = m.id_project AND t.status = 'done' AND t.id_assignee = m.id_pengguna AND t.soft_delete = FALSE), 0) AS task_done,
			COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.id_project = m.id_project AND t.soft_delete = FALSE), 0) AS total_tasks
		FROM project_members m
		JOIN projects p ON m.id_project = p.id_project
		WHERE m.id_pengguna = $1 AND p.soft_delete = FALSE
		ORDER BY p.nm_project`
	if err := r.db.SelectContext(ctx, &projectRows, qProjects, userID); err != nil {
		projectRows = []ProjectRow{}
	}

	projects := make([]ProjectSummary, len(projectRows))
	for i, pr := range projectRows {
		progress := 0
		if pr.TotalTasks > 0 {
			progress = int(float64(pr.TaskDone) / float64(pr.TotalTasks) * 100)
		}
		projects[i] = ProjectSummary{
			IDProject:  pr.IDProject,
			NmProject:  pr.NmProject,
			Role:       pr.Role,
			TaskDone:   pr.TaskDone,
			TotalTasks: pr.TotalTasks,
			Progress:   progress,
		}
	}

	// Get nm_pengguna from project_members
	nmPengguna := userID
	var nm string
	qNm := `SELECT nm_pengguna FROM project_members WHERE id_pengguna = $1 LIMIT 1`
	if err := r.db.GetContext(ctx, &nm, qNm, userID); err == nil {
		nmPengguna = nm
	}

	return &UserProfile{
		IDPengguna:    userID,
		NmPengguna:    nmPengguna,
		Contributions: *contributions,
		Stats: UserStats{
			TaskCompleted: stats.TaskCompleted,
			TaskCreated:   stats.TaskCreated,
			Comments:      stats.Comments,
			Documents:     stats.Documents,
			TotalActivity: stats.TotalActivity,
		},
		Projects: projects,
	}, nil
}

func (r *repository) GetProjectContributions(ctx context.Context, projectID string, year int) (*ContributionData, error) {
	startDate := fmt.Sprintf("%d-01-01", year)
	endDate := fmt.Sprintf("%d-01-01", year+1)

	var days []ContributionDay
	q := `SELECT TO_CHAR(DATE(created_at), 'YYYY-MM-DD') AS tanggal, COUNT(*) AS total
		FROM activity_log
		WHERE id_project = $1 AND created_at >= $2 AND created_at < $3
		GROUP BY DATE(created_at)
		ORDER BY DATE(created_at)`
	if err := r.db.SelectContext(ctx, &days, q, projectID, startDate, endDate); err != nil {
		return nil, fmt.Errorf("failed to get project contributions: %w", err)
	}

	data := make(map[string]int)
	total := 0
	for _, d := range days {
		data[d.Date] = d.Count
		total += d.Count
	}

	type TypeRow struct {
		Aksi  string `db:"aksi"`
		Total int    `db:"total"`
	}
	var typeRows []TypeRow
	qType := `SELECT aksi, COUNT(*) AS total FROM activity_log
		WHERE id_project = $1 AND created_at >= $2 AND created_at < $3
		GROUP BY aksi`
	if err := r.db.SelectContext(ctx, &typeRows, qType, projectID, startDate, endDate); err != nil {
		return nil, fmt.Errorf("failed to get project contribution types: %w", err)
	}
	byType := make(map[string]int)
	for _, t := range typeRows {
		byType[t.Aksi] = t.Total
	}

	longestStreak, currentStreak := calcStreaks(data, year)
	return &ContributionData{
		Year:          year,
		Total:         total,
		LongestStreak: longestStreak,
		CurrentStreak: currentStreak,
		Data:          data,
		ByType:        byType,
	}, nil
}
