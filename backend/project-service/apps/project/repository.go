package project

import (
	"context"
	"fmt"
	"math"
	"strings"

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
	where := "WHERE soft_delete = FALSE"
	args := []interface{}{}
	argIdx := 1

	if search != "" {
		where += fmt.Sprintf(" AND (nm_project ILIKE $%d OR kode_project ILIKE $%d)", argIdx, argIdx)
		args = append(args, "%"+search+"%")
		argIdx++
	}
	if status != "" {
		where += fmt.Sprintf(" AND status = $%d", argIdx)
		args = append(args, status)
		argIdx++
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM projects %s", where)
	if err := r.db.GetContext(ctx, &total, countQuery, args...); err != nil {
		return nil, fmt.Errorf("failed to count projects: %w", err)
	}

	dataArgs := append(args, limit, offset)
	limitIdx := argIdx
	offsetIdx := argIdx + 1
	dataQuery := fmt.Sprintf(`
		SELECT id_project, kode_project, nm_project, deskripsi, status, warna,
		       tgl_mulai, tgl_target, repo_url, created_at, updated_at
		FROM projects %s
		ORDER BY created_at DESC
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
		INSERT INTO projects (id_project, kode_project, nm_project, deskripsi, status, repo_url, repo_provider, warna, tgl_mulai, tgl_target, id_owner)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := r.db.ExecContext(ctx, query,
		p.IDProject, p.KodeProject, p.NmProject, p.Deskripsi, p.Status,
		p.RepoURL, p.RepoProvider, p.Warna, p.TglMulai, p.TglTarget, p.IDOwner,
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
		_, err := tx.ExecContext(ctx, "UPDATE tasks SET urutan = $1 WHERE id_task = $2", item.Urutan, item.IDTask)
		if err != nil {
			return fmt.Errorf("failed to reorder task %s: %w", item.IDTask, err)
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
		SELECT id_task, id_module, id_project, kode_task, nomor_task, judul,
		       tipe, prioritas, status, id_assignee, tgl_target, progress, urutan, created_at, updated_at
		FROM tasks t %s
		ORDER BY status, urutan ASC
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
