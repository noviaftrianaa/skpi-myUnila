package project

import (
	"context"
	"fmt"
	"strings"
	"time"
	"unicode"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

// Service interface
type Service interface {
	// Projects
	GetProjectList(ctx context.Context, page, limit int, search, status string) (*PaginatedResult, error)
	GetProjectByID(ctx context.Context, id string) (*Project, error)
	CreateProject(ctx context.Context, req *ProjectCreateRequest) (*Project, error)
	UpdateProject(ctx context.Context, id string, req *ProjectUpdateRequest, updatedBy *string) (*Project, error)
	DeleteProject(ctx context.Context, id string, deletedBy *string) error
	GetProjectStats(ctx context.Context, id string) (*ProjectStats, error)
	GetGlobalStats(ctx context.Context) (*GlobalStats, error)

	// Modules
	GetModulesByProject(ctx context.Context, projectID string) ([]ModuleWithCounts, error)
	GetModuleByID(ctx context.Context, id string) (*Module, error)
	CreateModule(ctx context.Context, req *ModuleCreateRequest) (*Module, error)
	UpdateModule(ctx context.Context, id string, req *ModuleUpdateRequest, updatedBy *string) (*Module, error)
	DeleteModule(ctx context.Context, id string, deletedBy *string) error

	// Tasks
	GetTaskList(ctx context.Context, page, limit int, filters TaskFilters) (*PaginatedResult, error)
	GetTaskByID(ctx context.Context, id string) (*TaskDetail, error)
	CreateTask(ctx context.Context, req *TaskCreateRequest) (*Task, error)
	UpdateTask(ctx context.Context, id string, req *TaskUpdateRequest) (*Task, error)
	UpdateTaskStatus(ctx context.Context, id string, req *TaskStatusUpdate) (*Task, error)
	DeleteTask(ctx context.Context, id string, deletedBy *string) error
	BulkReorderTasks(ctx context.Context, req *TaskReorderRequest) error
	GetBoardView(ctx context.Context, projectID, moduleID string) (*BoardView, error)

	// Comments
	GetCommentsByTask(ctx context.Context, taskID string) ([]TaskComment, error)
	CreateComment(ctx context.Context, req *CommentCreateRequest) (*TaskComment, error)
	UpdateComment(ctx context.Context, id string, req *CommentUpdateRequest) (*TaskComment, error)
	DeleteComment(ctx context.Context, id string) error

	// Commits
	GetCommitsByTask(ctx context.Context, taskID string) ([]TaskCommit, error)
	GetCommitsByProject(ctx context.Context, projectID string) ([]TaskCommit, error)
	ProcessWebhookCommit(ctx context.Context, commit *TaskCommit, projectID string) error

	// Activity
	GetActivityByProject(ctx context.Context, projectID string, page, limit int) (*PaginatedResult, error)

	// Webhook
	GetWebhookByRepo(ctx context.Context, repoFullName string) (*WebhookConfig, error)
	GetWebhooksByProject(ctx context.Context, projectID string) ([]WebhookConfig, error)
	CreateWebhookConfig(ctx context.Context, projectID string, req *WebhookConfigCreateRequest) (*WebhookConfig, error)
	UpdateWebhookConfig(ctx context.Context, id string, req *WebhookConfigUpdateRequest) (*WebhookConfig, error)
	DeleteWebhookConfig(ctx context.Context, id string) error

	// Users (from SQL Server)
	SearchUsers(ctx context.Context, query string, limit int) ([]UserRef, error)

	// Labels
	GetLabelsByProject(ctx context.Context, projectID string) ([]Label, error)
	CreateLabel(ctx context.Context, projectID, nmLabel, warna string) (*Label, error)
	DeleteLabel(ctx context.Context, id string) error

	// Task Labels
	GetLabelsByTask(ctx context.Context, taskID string) ([]Label, error)
	AddLabelToTask(ctx context.Context, taskID, labelID string) error
	RemoveLabelFromTask(ctx context.Context, taskID, labelID string) error

	// Document Categories
	GetDocumentCategories(ctx context.Context) ([]DocumentCategory, error)
	CreateDocumentCategory(ctx context.Context, req *DocumentCategoryCreateRequest) (*DocumentCategory, error)

	// Sprints
	GetSprintsByProject(ctx context.Context, projectID string) ([]SprintWithCounts, error)
	GetSprintByID(ctx context.Context, id string) (*Sprint, error)
	CreateSprint(ctx context.Context, req *SprintCreateRequest) (*Sprint, error)
	UpdateSprint(ctx context.Context, id string, req *SprintUpdateRequest, updatedBy *string) (*Sprint, error)
	DeleteSprint(ctx context.Context, id string, deletedBy *string) error

	// Documents
	GetDocumentsByProject(ctx context.Context, projectID string, page, limit int, category, status, search string) (*PaginatedResult, error)
	GetDocumentByID(ctx context.Context, id string) (*Document, error)
	CreateDocument(ctx context.Context, projectID string, req *DocumentCreateRequest, minioClient interface{}, bucket string) (*Document, error)
	CreateDocumentWithID(ctx context.Context, projectID string, docID string, req *DocumentCreateRequest) (*Document, error)
	UpdateDocument(ctx context.Context, id string, req *DocumentUpdateRequest) (*Document, error)
	DeleteDocument(ctx context.Context, id string, deletedBy *string) error

	// Document Versions
	GetDocumentVersions(ctx context.Context, documentID string) ([]DocumentVersion, error)
	ReplaceDocumentFile(ctx context.Context, documentID, filePath, fileName string, fileSize int64, mimeType string, catatan *string, uploaderID *string) (*Document, error)

	// Members
	GetMembersByProject(ctx context.Context, projectID string) ([]ProjectMember, error)
	AddMember(ctx context.Context, projectID string, req *AddMemberRequest, addedBy *string) (*ProjectMember, error)
	RemoveMember(ctx context.Context, projectID, memberID string) error

	// Watchers
	GetWatchersByProject(ctx context.Context, projectID string) ([]ProjectWatcher, error)
	AddWatcher(ctx context.Context, projectID string, req *AddWatcherRequest) (*ProjectWatcher, error)
	RemoveWatcher(ctx context.Context, projectID, watcherID string) error

	// User-filtered project list
	GetMyProjects(ctx context.Context, userID string, isPimpinan bool, page, limit int) (*PaginatedResult, error)

	// Org Structure
	GetOrgStructure(ctx context.Context, projectID string) (*OrgStructure, error)
	CreateOrgNode(ctx context.Context, projectID string, req *CreateOrgNodeRequest) (*OrgNode, error)
	UpdateOrgNode(ctx context.Context, nodeID string, req *UpdateOrgNodeRequest) (*OrgNode, error)
	DeleteOrgNode(ctx context.Context, nodeID string) error
	CreateOrgEdge(ctx context.Context, projectID string, req *CreateOrgEdgeRequest) (*OrgEdge, error)
	DeleteOrgEdge(ctx context.Context, edgeID string) error

	// Analytics
	LogActivity(ctx context.Context, projectID string, taskID, userID *string, aksi, detail string)
	GetContributions(ctx context.Context, userID string, year int) (*ContributionData, error)
	GetProjectContributions(ctx context.Context, projectID string, year int) (*ContributionData, error)
	GetActivityTimeline(ctx context.Context, projectID string, period string, months int) ([]ActivityPoint, error)
	GetBurndown(ctx context.Context, projectID, sprintID string) ([]BurndownPoint, error)
	GetTaskDistribution(ctx context.Context, projectID string) ([]TaskDistribution, error)
	GetTeamContribution(ctx context.Context, projectID string, months int) ([]TeamContribution, error)
	GetUserProfile(ctx context.Context, userID string) (*UserProfile, error)
}

type service struct {
	repo        Repository
	refRepo     RefRepository
	minioClient *minio.Client
	minioBucket string
	notifier    *TelegramNotifier
}

func NewService(repo Repository, refRepo RefRepository) Service {
	return &service{repo: repo, refRepo: refRepo, notifier: NewTelegramNotifier("", "", false)}
}

func NewServiceWithMinIO(repo Repository, refRepo RefRepository, minioClient *minio.Client, bucket string) Service {
	return &service{repo: repo, refRepo: refRepo, minioClient: minioClient, minioBucket: bucket, notifier: NewTelegramNotifier("", "", false)}
}

func NewServiceWithNotifier(repo Repository, refRepo RefRepository, notifier *TelegramNotifier) Service {
	return &service{repo: repo, refRepo: refRepo, notifier: notifier}
}

func NewServiceWithMinIOAndNotifier(repo Repository, refRepo RefRepository, minioClient *minio.Client, bucket string, notifier *TelegramNotifier) Service {
	return &service{repo: repo, refRepo: refRepo, minioClient: minioClient, minioBucket: bucket, notifier: notifier}
}

// generateKode generates a short code from name (first letters of each word, uppercase)
func generateKode(name string) string {
	words := strings.Fields(name)
	kode := ""
	for _, w := range words {
		runes := []rune(w)
		for _, r := range runes {
			if unicode.IsLetter(r) {
				kode += string(unicode.ToUpper(r))
				break
			}
		}
	}
	if kode == "" {
		kode = strings.ToUpper(strings.ReplaceAll(name, " ", ""))
	}
	if len(kode) > 10 {
		kode = kode[:10]
	}
	return kode
}

func (s *service) logActivity(ctx context.Context, projectID string, taskID *string, penggunaID *string, aksi, detail string) {
	a := &ActivityLog{
		IDActivity: uuid.New().String(),
		IDProject:  projectID,
		IDTask:     taskID,
		IDPengguna: penggunaID,
		Aksi:       aksi,
		Detail:     &detail,
	}
	_ = s.repo.CreateActivity(ctx, a)
}

// ===== PROJECT =====

func (s *service) GetProjectList(ctx context.Context, page, limit int, search, status string) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return s.repo.GetProjectList(ctx, page, limit, search, status)
}

func (s *service) GetProjectByID(ctx context.Context, id string) (*Project, error) {
	return s.repo.GetProjectByID(ctx, id)
}

func (s *service) CreateProject(ctx context.Context, req *ProjectCreateRequest) (*Project, error) {
	kode := generateKode(req.NmProject)

	status := req.Status
	if status == "" {
		status = "active"
	}
	provider := req.RepoProvider
	if provider == nil {
		p := "bitbucket"
		provider = &p
	}

	visibility := req.Visibility
	if visibility == "" {
		visibility = "private"
	}

	p := &Project{
		IDProject:    uuid.New().String(),
		KodeProject:  kode,
		NmProject:    req.NmProject,
		Deskripsi:    req.Deskripsi,
		Status:       status,
		RepoURL:      req.RepoURL,
		RepoProvider: provider,
		Warna:        req.Warna,
		IDOwner:      req.IDOwner,
		IDUnit:       req.IDUnit,
		NmUnit:       req.NmUnit,
		Visibility:   visibility,
	}

	if err := s.repo.CreateProject(ctx, p); err != nil {
		return nil, err
	}

	s.logActivity(ctx, p.IDProject, nil, p.IDOwner, "project_created", fmt.Sprintf("Project '%s' dibuat", p.NmProject))

	return s.repo.GetProjectByID(ctx, p.IDProject)
}

func (s *service) UpdateProject(ctx context.Context, id string, req *ProjectUpdateRequest, updatedBy *string) (*Project, error) {
	existing, err := s.repo.GetProjectByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}

	fields := map[string]interface{}{}
	if req.NmProject != nil {
		fields["nm_project"] = *req.NmProject
	}
	if req.Deskripsi != nil {
		fields["deskripsi"] = *req.Deskripsi
	}
	if req.Status != nil {
		fields["status"] = *req.Status
	}
	if req.RepoURL != nil {
		fields["repo_url"] = *req.RepoURL
	}
	if req.RepoProvider != nil {
		fields["repo_provider"] = *req.RepoProvider
	}
	if req.Warna != nil {
		fields["warna"] = *req.Warna
	}
	if req.IDOwner != nil {
		fields["id_owner"] = *req.IDOwner
	}
	if req.IDUnit != nil {
		fields["id_unit"] = *req.IDUnit
	}
	if req.NmUnit != nil {
		fields["nm_unit"] = *req.NmUnit
	}
	if req.Visibility != nil {
		fields["visibility"] = *req.Visibility
	}

	if err := s.repo.UpdateProject(ctx, id, fields); err != nil {
		return nil, err
	}

	s.logActivity(ctx, id, nil, updatedBy, "project_updated", fmt.Sprintf("Project '%s' diupdate", existing.NmProject))

	return s.repo.GetProjectByID(ctx, id)
}

func (s *service) DeleteProject(ctx context.Context, id string, deletedBy *string) error {
	p, err := s.repo.GetProjectByID(ctx, id)
	if err != nil {
		return fmt.Errorf("project not found: %w", err)
	}
	if err := s.repo.SoftDeleteProject(ctx, id); err != nil {
		return err
	}
	s.logActivity(ctx, id, nil, deletedBy, "project_deleted", fmt.Sprintf("Project '%s' dihapus", p.NmProject))
	return nil
}

func (s *service) GetProjectStats(ctx context.Context, id string) (*ProjectStats, error) {
	return s.repo.GetProjectStats(ctx, id)
}

func (s *service) GetGlobalStats(ctx context.Context) (*GlobalStats, error) {
	return s.repo.GetGlobalStats(ctx)
}

// ===== MODULE =====

func (s *service) GetModulesByProject(ctx context.Context, projectID string) ([]ModuleWithCounts, error) {
	return s.repo.GetModulesByProject(ctx, projectID)
}

func (s *service) GetModuleByID(ctx context.Context, id string) (*Module, error) {
	return s.repo.GetModuleByID(ctx, id)
}

func (s *service) CreateModule(ctx context.Context, req *ModuleCreateRequest) (*Module, error) {
	_, err := s.repo.GetProjectByID(ctx, req.IDProject)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}

	status := req.Status
	if status == "" {
		status = "backlog"
	}

	m := &Module{
		IDModule:  uuid.New().String(),
		IDProject: req.IDProject,
		NmModule:  req.NmModule,
		Deskripsi: req.Deskripsi,
		Status:    status,
		Urutan:    req.Urutan,
		Warna:     req.Warna,
	}

	if err := s.repo.CreateModule(ctx, m); err != nil {
		return nil, err
	}

	s.logActivity(ctx, req.IDProject, nil, nil, "module_created", fmt.Sprintf("Module '%s' dibuat", m.NmModule))

	return s.repo.GetModuleByID(ctx, m.IDModule)
}

func (s *service) UpdateModule(ctx context.Context, id string, req *ModuleUpdateRequest, updatedBy *string) (*Module, error) {
	existing, err := s.repo.GetModuleByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("module not found: %w", err)
	}

	fields := map[string]interface{}{}
	if req.NmModule != nil {
		fields["nm_module"] = *req.NmModule
	}
	if req.Deskripsi != nil {
		fields["deskripsi"] = *req.Deskripsi
	}
	if req.Status != nil {
		fields["status"] = *req.Status
	}
	if req.Urutan != nil {
		fields["urutan"] = *req.Urutan
	}
	if req.Warna != nil {
		fields["warna"] = *req.Warna
	}

	if err := s.repo.UpdateModule(ctx, id, fields); err != nil {
		return nil, err
	}

	s.logActivity(ctx, existing.IDProject, nil, updatedBy, "module_updated", fmt.Sprintf("Module '%s' diupdate", existing.NmModule))

	return s.repo.GetModuleByID(ctx, id)
}

func (s *service) DeleteModule(ctx context.Context, id string, deletedBy *string) error {
	m, err := s.repo.GetModuleByID(ctx, id)
	if err != nil {
		return fmt.Errorf("module not found: %w", err)
	}
	if err := s.repo.SoftDeleteModule(ctx, id); err != nil {
		return err
	}
	s.logActivity(ctx, m.IDProject, nil, deletedBy, "module_deleted", fmt.Sprintf("Module '%s' dihapus", m.NmModule))
	return nil
}

// ===== TASK =====

func (s *service) GetTaskList(ctx context.Context, page, limit int, filters TaskFilters) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.GetTaskList(ctx, page, limit, filters)
}

func (s *service) GetTaskByID(ctx context.Context, id string) (*TaskDetail, error) {
	t, err := s.repo.GetTaskByID(ctx, id)
	if err != nil {
		return nil, err
	}

	comments, _ := s.repo.GetCommentsByTask(ctx, id)
	commits, _ := s.repo.GetCommitsByTask(ctx, id)

	detail := &TaskDetail{
		Task:     *t,
		Comments: comments,
		Commits:  commits,
	}
	if detail.Comments == nil {
		detail.Comments = []TaskComment{}
	}
	if detail.Commits == nil {
		detail.Commits = []TaskCommit{}
	}
	return detail, nil
}

func (s *service) CreateTask(ctx context.Context, req *TaskCreateRequest) (*Task, error) {
	_, err := s.repo.GetProjectByID(ctx, req.IDProject)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}

	project, err := s.repo.GetProjectByID(ctx, req.IDProject)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}

	nomorTask, err := s.repo.GetNextTaskNumber(ctx, req.IDProject)
	if err != nil {
		return nil, fmt.Errorf("failed to get task number: %w", err)
	}

	kodeTask := fmt.Sprintf("%s-%d", project.KodeProject, nomorTask)

	status := req.Status
	if status == "" {
		status = "backlog"
	}
	tipe := req.Tipe
	if tipe == "" {
		tipe = "feature"
	}
	prioritas := req.Prioritas
	if prioritas == "" {
		prioritas = "medium"
	}

	t := &Task{
		IDTask:      uuid.New().String(),
		IDModule:    req.IDModule,
		IDProject:   req.IDProject,
		IDSprint:    req.IDSprint,
		KodeTask:    kodeTask,
		NomorTask:   nomorTask,
		Judul:       req.Judul,
		Deskripsi:   req.Deskripsi,
		Tipe:        tipe,
		Prioritas:   prioritas,
		Status:      status,
		IDAssignee:  req.IDAssignee,
		IDReporter:  req.IDReporter,
		EstimasiJam: req.EstimasiJam,
		Tags:        req.Tags,
		Progress:    0,
		Urutan:      nomorTask,
	}

	if err := s.repo.CreateTask(ctx, t); err != nil {
		return nil, err
	}

	s.logActivity(ctx, req.IDProject, &t.IDTask, req.IDPengguna, "task_created",
		fmt.Sprintf("Task '%s: %s' dibuat", kodeTask, t.Judul))

	// Telegram: notify urgent task
	if prioritas == "urgent" {
		s.notifier.Send(fmt.Sprintf("🔴 Task URGENT: %s %s", kodeTask, t.Judul))
	}

	return s.repo.GetTaskByID(ctx, t.IDTask)
}

func (s *service) UpdateTask(ctx context.Context, id string, req *TaskUpdateRequest) (*Task, error) {
	existing, err := s.repo.GetTaskByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}

	fields := map[string]interface{}{}
	if req.IDModule != nil {
		fields["id_module"] = *req.IDModule
	}
	if req.IDSprint != nil {
		fields["id_sprint"] = *req.IDSprint
	}
	if req.Judul != nil {
		fields["judul"] = *req.Judul
	}
	if req.Deskripsi != nil {
		fields["deskripsi"] = *req.Deskripsi
	}
	if req.Tipe != nil {
		fields["tipe"] = *req.Tipe
	}
	if req.Prioritas != nil {
		fields["prioritas"] = *req.Prioritas
	}
	if req.Status != nil {
		fields["status"] = *req.Status
	}
	if req.IDAssignee != nil {
		if *req.IDAssignee == "" {
			fields["id_assignee"] = nil
			fields["assignee_name"] = nil
			fields["assignee_initial"] = nil
		} else {
			fields["id_assignee"] = *req.IDAssignee
			if req.AssigneeName != nil {
				fields["assignee_name"] = *req.AssigneeName
			}
			if req.AssigneeInitial != nil {
				fields["assignee_initial"] = *req.AssigneeInitial
			}
		}
	}
	if req.IDReporter != nil {
		fields["id_reporter"] = *req.IDReporter
	}
	if req.Progress != nil {
		fields["progress"] = *req.Progress
	}
	if req.EstimasiJam != nil {
		fields["estimasi_jam"] = *req.EstimasiJam
	}
	if req.ActualJam != nil {
		fields["actual_jam"] = *req.ActualJam
	}
	if req.Tags != nil {
		fields["tags"] = *req.Tags
	}

	if err := s.repo.UpdateTask(ctx, id, fields); err != nil {
		return nil, err
	}

	detail := ""
	if req.Status != nil && *req.Status != existing.Status {
		detail = fmt.Sprintf("Status task '%s' berubah dari '%s' ke '%s'", existing.KodeTask, existing.Status, *req.Status)
		s.logActivity(ctx, existing.IDProject, &id, req.IDPengguna, "task_status_changed", detail)
		// Telegram: notify task done
		if *req.Status == "done" {
			s.notifier.Send(fmt.Sprintf("✅ Task %s: %s selesai", existing.KodeTask, existing.Judul))
		}
	} else {
		detail = fmt.Sprintf("Task '%s' diupdate", existing.KodeTask)
		s.logActivity(ctx, existing.IDProject, &id, req.IDPengguna, "task_updated", detail)
	}

	return s.repo.GetTaskByID(ctx, id)
}

func (s *service) UpdateTaskStatus(ctx context.Context, id string, req *TaskStatusUpdate) (*Task, error) {
	existing, err := s.repo.GetTaskByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("task not found: %w", err)
	}

	fields := map[string]interface{}{
		"status": req.Status,
	}
	if req.Progress != nil {
		fields["progress"] = *req.Progress
	}
	if req.Status == "done" {
		fields["progress"] = 100
	}

	if err := s.repo.UpdateTask(ctx, id, fields); err != nil {
		return nil, err
	}

	s.logActivity(ctx, existing.IDProject, &id, req.IDPengguna, "task_status_changed",
		fmt.Sprintf("Status task '%s' berubah dari '%s' ke '%s'", existing.KodeTask, existing.Status, req.Status))

	// Telegram: notify task done
	if req.Status == "done" && existing.Status != "done" {
		s.notifier.Send(fmt.Sprintf("✅ Task %s: %s selesai", existing.KodeTask, existing.Judul))
	}

	return s.repo.GetTaskByID(ctx, id)
}

func (s *service) DeleteTask(ctx context.Context, id string, deletedBy *string) error {
	t, err := s.repo.GetTaskByID(ctx, id)
	if err != nil {
		return fmt.Errorf("task not found: %w", err)
	}
	if err := s.repo.SoftDeleteTask(ctx, id); err != nil {
		return err
	}
	s.logActivity(ctx, t.IDProject, &id, deletedBy, "task_deleted",
		fmt.Sprintf("Task '%s: %s' dihapus", t.KodeTask, t.Judul))
	return nil
}

func (s *service) BulkReorderTasks(ctx context.Context, req *TaskReorderRequest) error {
	return s.repo.BulkReorderTasks(ctx, req.Items)
}

func (s *service) GetBoardView(ctx context.Context, projectID, moduleID string) (*BoardView, error) {
	return s.repo.GetBoardView(ctx, projectID, moduleID)
}

// ===== COMMENTS =====

func (s *service) GetCommentsByTask(ctx context.Context, taskID string) ([]TaskComment, error) {
	return s.repo.GetCommentsByTask(ctx, taskID)
}

func (s *service) CreateComment(ctx context.Context, req *CommentCreateRequest) (*TaskComment, error) {
	tipe := req.Tipe
	if tipe == "" {
		tipe = "comment"
	}
	c := &TaskComment{
		IDComment:  uuid.New().String(),
		IDTask:     req.IDTask,
		IDPengguna: req.IDPengguna,
		Konten:     req.Konten,
		Tipe:       tipe,
	}
	if err := s.repo.CreateComment(ctx, c); err != nil {
		return nil, err
	}
	// Log activity
	if task, err := s.repo.GetTaskByID(ctx, req.IDTask); err == nil {
		s.logActivity(ctx, task.IDProject, &req.IDTask, req.IDPengguna, "comment_added", "Komentar ditambahkan")
	}
	return s.repo.GetCommentByID(ctx, c.IDComment)
}

func (s *service) UpdateComment(ctx context.Context, id string, req *CommentUpdateRequest) (*TaskComment, error) {
	existing, err := s.repo.GetCommentByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("comment not found: %w", err)
	}
	if err := s.repo.UpdateComment(ctx, id, req.Konten); err != nil {
		return nil, err
	}
	// Log activity
	if task, err := s.repo.GetTaskByID(ctx, existing.IDTask); err == nil {
		s.logActivity(ctx, task.IDProject, &existing.IDTask, existing.IDPengguna, "comment_updated", "Komentar diupdate")
	}
	return s.repo.GetCommentByID(ctx, id)
}

func (s *service) DeleteComment(ctx context.Context, id string) error {
	existing, err := s.repo.GetCommentByID(ctx, id)
	if err != nil {
		return fmt.Errorf("comment not found: %w", err)
	}
	// Log activity
	if task, err := s.repo.GetTaskByID(ctx, existing.IDTask); err == nil {
		s.logActivity(ctx, task.IDProject, &existing.IDTask, existing.IDPengguna, "comment_deleted", "Komentar dihapus")
	}
	return s.repo.SoftDeleteComment(ctx, id)
}

// ===== COMMITS =====

func (s *service) GetCommitsByTask(ctx context.Context, taskID string) ([]TaskCommit, error) {
	return s.repo.GetCommitsByTask(ctx, taskID)
}

func (s *service) GetCommitsByProject(ctx context.Context, projectID string) ([]TaskCommit, error) {
	return s.repo.GetCommitsByProject(ctx, projectID)
}

func (s *service) ProcessWebhookCommit(ctx context.Context, commit *TaskCommit, projectID string) error {
	// Check duplicate
	exists, err := s.repo.CommitExists(ctx, commit.CommitHash)
	if err != nil {
		return err
	}
	if exists {
		return nil // already processed
	}

	commit.IDProject = projectID
	commit.IDTaskCommit = uuid.New().String()

	var linkedTask *Task
	var autoClose bool

	// Parse commit message for task kode pattern #KODE-123
	if commit.CommitMessage != nil {
		taskKode := extractTaskKode(*commit.CommitMessage)
		if taskKode != "" {
			task, err := s.repo.FindTaskByKode(ctx, taskKode)
			if err == nil && task != nil {
				commit.IDTask = &task.IDTask
				linkedTask = task

				// Check if commit message has auto-close keywords before #KODE-NN
				autoClose = hasAutoCloseKeyword(*commit.CommitMessage, taskKode)
			}
		}
	}

	if err := s.repo.CreateCommit(ctx, commit); err != nil {
		return err
	}

	// Log activity for commit
	if linkedTask != nil && commit.CommitMessage != nil {
		detail := fmt.Sprintf("Commit %s: %s", commit.CommitHashShort, *commit.CommitMessage)
		s.logActivity(ctx, projectID, commit.IDTask, nil, "committed", detail)

		// Auto-close task if keyword found
		if autoClose && linkedTask.Status != "done" {
			fields := map[string]interface{}{
				"status":   "done",
				"progress": 100,
			}
			if err := s.repo.UpdateTask(ctx, linkedTask.IDTask, fields); err == nil {
				autoDetail := fmt.Sprintf("Task '%s' ditutup otomatis via commit %s", linkedTask.KodeTask, commit.CommitHashShort)
				s.logActivity(ctx, projectID, commit.IDTask, nil, "task_auto_closed", autoDetail)
			}
		}
	}

	return nil
}

// hasAutoCloseKeyword checks if commit message contains auto-close keywords before #KODE-NN
func hasAutoCloseKeyword(message, taskKode string) bool {
	lower := strings.ToLower(message)
	keywords := []string{"fixes", "closes", "close", "fix"}
	ref := "#" + strings.ToLower(taskKode)
	refIdx := strings.Index(lower, ref)
	if refIdx < 0 {
		return false
	}
	prefix := lower[:refIdx]
	for _, kw := range keywords {
		if strings.Contains(prefix, kw) {
			return true
		}
	}
	return false
}

// extractTaskKode extracts task kode from commit message (e.g., #MYUNILA-1)
func extractTaskKode(message string) string {
	// Find pattern #KODE-NUMBER
	for i := 0; i < len(message); i++ {
		if message[i] == '#' {
			rest := message[i+1:]
			end := strings.IndexAny(rest, " \t\n\r,;.!?")
			if end == -1 {
				end = len(rest)
			}
			candidate := rest[:end]
			// Check if it has LETTERS-NUMBERS pattern
			dashIdx := strings.LastIndex(candidate, "-")
			if dashIdx > 0 && dashIdx < len(candidate)-1 {
				prefix := candidate[:dashIdx]
				suffix := candidate[dashIdx+1:]
				if len(prefix) > 0 && isAllAlpha(prefix) && isAllDigit(suffix) {
					return strings.ToUpper(candidate)
				}
			}
		}
	}
	return ""
}

func isAllAlpha(s string) bool {
	for _, r := range s {
		if !unicode.IsLetter(r) {
			return false
		}
	}
	return len(s) > 0
}

func isAllDigit(s string) bool {
	for _, r := range s {
		if !unicode.IsDigit(r) {
			return false
		}
	}
	return len(s) > 0
}

// ===== ACTIVITY =====

func (s *service) GetActivityByProject(ctx context.Context, projectID string, page, limit int) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.GetActivityByProject(ctx, projectID, page, limit)
}

// ===== WEBHOOK =====

func (s *service) GetWebhookByRepo(ctx context.Context, repoFullName string) (*WebhookConfig, error) {
	return s.repo.GetWebhookByRepo(ctx, repoFullName)
}

func (s *service) GetWebhooksByProject(ctx context.Context, projectID string) ([]WebhookConfig, error) {
	return s.repo.GetWebhooksByProject(ctx, projectID)
}

func (s *service) CreateWebhookConfig(ctx context.Context, projectID string, req *WebhookConfigCreateRequest) (*WebhookConfig, error) {
	provider := req.Provider
	if provider == "" {
		provider = "bitbucket"
	}
	wh := &WebhookConfig{
		IDWebhook:     uuid.New().String(),
		IDProject:     projectID,
		Provider:      provider,
		RepoFullName:  req.RepoFullName,
		WebhookSecret: req.WebhookSecret,
		AActive:       true,
	}
	if err := s.repo.CreateWebhookConfig(ctx, wh); err != nil {
		return nil, err
	}
	whs, err := s.repo.GetWebhooksByProject(ctx, projectID)
	if err != nil {
		return wh, nil
	}
	for _, w := range whs {
		if w.IDWebhook == wh.IDWebhook {
			return &w, nil
		}
	}
	return wh, nil
}

func (s *service) UpdateWebhookConfig(ctx context.Context, id string, req *WebhookConfigUpdateRequest) (*WebhookConfig, error) {
	fields := map[string]interface{}{}
	if req.WebhookSecret != nil {
		fields["webhook_secret"] = *req.WebhookSecret
	}
	if req.AActive != nil {
		fields["a_active"] = *req.AActive
	}
	if err := s.repo.UpdateWebhookConfig(ctx, id, fields); err != nil {
		return nil, err
	}
	return s.repo.GetWebhookByID(ctx, id)
}

func (s *service) DeleteWebhookConfig(ctx context.Context, id string) error {
	return s.repo.DeleteWebhookConfig(ctx, id)
}

// ===== USERS =====

func (s *service) SearchUsers(ctx context.Context, query string, limit int) ([]UserRef, error) {
	if limit < 1 || limit > 50 {
		limit = 10
	}
	return s.refRepo.SearchUsers(ctx, query, limit)
}

// ===== LABELS =====

func (s *service) GetLabelsByProject(ctx context.Context, projectID string) ([]Label, error) {
	return s.repo.GetLabelsByProject(ctx, projectID)
}

func (s *service) CreateLabel(ctx context.Context, projectID, nmLabel, warna string) (*Label, error) {
	if warna == "" {
		warna = "#6B7280"
	}
	l := &Label{
		IDLabel:   uuid.New().String(),
		IDProject: projectID,
		NmLabel:   nmLabel,
		Warna:     warna,
	}
	if err := s.repo.CreateLabel(ctx, l); err != nil {
		return nil, err
	}
	labels, err := s.repo.GetLabelsByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	for _, lb := range labels {
		if lb.IDLabel == l.IDLabel {
			return &lb, nil
		}
	}
	return l, nil
}

func (s *service) DeleteLabel(ctx context.Context, id string) error {
	return s.repo.DeleteLabel(ctx, id)
}

// ===== TASK LABELS =====

func (s *service) GetLabelsByTask(ctx context.Context, taskID string) ([]Label, error) {
	return s.repo.GetLabelsByTask(ctx, taskID)
}

func (s *service) AddLabelToTask(ctx context.Context, taskID, labelID string) error {
	return s.repo.AddLabelToTask(ctx, taskID, labelID)
}

func (s *service) RemoveLabelFromTask(ctx context.Context, taskID, labelID string) error {
	return s.repo.RemoveLabelFromTask(ctx, taskID, labelID)
}

// ===== SPRINTS =====

func (s *service) GetSprintsByProject(ctx context.Context, projectID string) ([]SprintWithCounts, error) {
	return s.repo.GetSprintsByProject(ctx, projectID)
}

func (s *service) GetSprintByID(ctx context.Context, id string) (*Sprint, error) {
	return s.repo.GetSprintByID(ctx, id)
}

func (s *service) CreateSprint(ctx context.Context, req *SprintCreateRequest) (*Sprint, error) {
	_, err := s.repo.GetProjectByID(ctx, req.IDProject)
	if err != nil {
		return nil, fmt.Errorf("project not found: %w", err)
	}

	status := req.Status
	if status == "" {
		status = "planned"
	}

	sp := &Sprint{
		IDSprint:  uuid.New().String(),
		IDProject: req.IDProject,
		NmSprint:  req.NmSprint,
		Deskripsi: req.Deskripsi,
		TglMulai:  parseDate(req.TglMulai),
		TglSelesai: parseDate(req.TglSelesai),
		Status:    status,
		Urutan:    0,
	}

	if err := s.repo.CreateSprint(ctx, sp); err != nil {
		return nil, err
	}

	s.logActivity(ctx, req.IDProject, nil, nil, "sprint_created",
		fmt.Sprintf("Sprint '%s' dibuat", sp.NmSprint))

	return s.repo.GetSprintByID(ctx, sp.IDSprint)
}

func (s *service) UpdateSprint(ctx context.Context, id string, req *SprintUpdateRequest, updatedBy *string) (*Sprint, error) {
	existing, err := s.repo.GetSprintByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("sprint not found: %w", err)
	}

	fields := map[string]interface{}{}
	if req.NmSprint != nil {
		fields["nm_sprint"] = *req.NmSprint
	}
	if req.Deskripsi != nil {
		fields["deskripsi"] = *req.Deskripsi
	}
	if req.TglMulai != nil {
		fields["tgl_mulai"] = parseDate(req.TglMulai)
	}
	if req.TglSelesai != nil {
		fields["tgl_selesai"] = parseDate(req.TglSelesai)
	}
	if req.Status != nil {
		fields["status"] = *req.Status
	}
	fields["updated_at"] = time.Now()

	if err := s.repo.UpdateSprint(ctx, id, fields); err != nil {
		return nil, err
	}

	s.logActivity(ctx, existing.IDProject, nil, updatedBy, "sprint_updated",
		fmt.Sprintf("Sprint '%s' diupdate", existing.NmSprint))

	// Telegram: notify sprint completed
	if req.Status != nil && *req.Status == "completed" && existing.Status != "completed" {
		s.notifier.Send(fmt.Sprintf("🏁 Sprint '%s' selesai", existing.NmSprint))
	}

	return s.repo.GetSprintByID(ctx, id)
}

func (s *service) DeleteSprint(ctx context.Context, id string, deletedBy *string) error {
	sp, err := s.repo.GetSprintByID(ctx, id)
	if err != nil {
		return fmt.Errorf("sprint not found: %w", err)
	}
	if err := s.repo.SoftDeleteSprint(ctx, id); err != nil {
		return err
	}
	s.logActivity(ctx, sp.IDProject, nil, deletedBy, "sprint_deleted",
		fmt.Sprintf("Sprint '%s' dihapus", sp.NmSprint))
	return nil
}

// ===== DOCUMENT CATEGORIES =====

func (s *service) GetDocumentCategories(ctx context.Context) ([]DocumentCategory, error) {
	return s.repo.GetDocumentCategories(ctx)
}

func (s *service) CreateDocumentCategory(ctx context.Context, req *DocumentCategoryCreateRequest) (*DocumentCategory, error) {
	dc := &DocumentCategory{
		IDDocCategory: uuid.New().String(),
		NmKategori:    req.NmKategori,
		KodeKategori:  strings.ToUpper(req.KodeKategori),
		Icon:          req.Icon,
		Urutan:        req.Urutan,
	}
	if err := s.repo.CreateDocumentCategory(ctx, dc); err != nil {
		return nil, err
	}
	categories, err := s.repo.GetDocumentCategories(ctx)
	if err != nil {
		return dc, nil
	}
	for _, c := range categories {
		if c.IDDocCategory == dc.IDDocCategory {
			return &c, nil
		}
	}
	return dc, nil
}

// ===== DOCUMENTS =====

func (s *service) GetDocumentsByProject(ctx context.Context, projectID string, page, limit int, category, status, search string) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	return s.repo.GetDocumentsByProject(ctx, projectID, page, limit, category, status, search)
}

func (s *service) GetDocumentByID(ctx context.Context, id string) (*Document, error) {
	return s.repo.GetDocumentByID(ctx, id)
}

func (s *service) CreateDocument(ctx context.Context, projectID string, req *DocumentCreateRequest, minioClientIface interface{}, bucket string) (*Document, error) {
	// Use CreateDocumentWithID with a new UUID
	return s.CreateDocumentWithID(ctx, projectID, uuid.New().String(), req)
}

func (s *service) UpdateDocument(ctx context.Context, id string, req *DocumentUpdateRequest) (*Document, error) {
	existing, err := s.repo.GetDocumentByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("document not found: %w", err)
	}

	fields := map[string]interface{}{}
	if req.IDDocCategory != nil {
		fields["id_doc_category"] = *req.IDDocCategory
	}
	if req.IDTask != nil {
		fields["id_task"] = *req.IDTask
	}
	if req.NmDokumen != nil {
		fields["nm_dokumen"] = *req.NmDokumen
	}
	if req.NomorDokumen != nil {
		fields["nomor_dokumen"] = *req.NomorDokumen
	}
	if req.TglDokumen != nil {
		fields["tgl_dokumen"] = *req.TglDokumen
	}
	if req.TglBerlaku != nil {
		fields["tgl_berlaku"] = *req.TglBerlaku
	}
	if req.TglBerakhir != nil {
		fields["tgl_berakhir"] = *req.TglBerakhir
	}
	if req.Deskripsi != nil {
		fields["deskripsi"] = *req.Deskripsi
	}
	if req.Status != nil {
		fields["status"] = *req.Status
	}

	if err := s.repo.UpdateDocument(ctx, id, fields); err != nil {
		return nil, err
	}

	s.logActivity(ctx, existing.IDProject, nil, nil, "document_updated",
		fmt.Sprintf("Dokumen '%s' diupdate", existing.NmDokumen))

	return s.repo.GetDocumentByID(ctx, id)
}

func parseDate(s *string) *time.Time {
	if s == nil || *s == "" {
		return nil
	}
	t, err := time.Parse("2006-01-02", *s)
	if err != nil {
		return nil
	}
	return &t
}

func (s *service) CreateDocumentWithID(ctx context.Context, projectID string, docID string, req *DocumentCreateRequest) (*Document, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}

	d := &Document{
		IDDocument:    docID,
		IDProject:     projectID,
		IDDocCategory: req.IDDocCategory,
		IDTask:        req.IDTask,
		NmDokumen:     req.NmDokumen,
		NomorDokumen:  req.NomorDokumen,
		TglDokumen:    parseDate(req.TglDokumen),
		TglBerlaku:    parseDate(req.TglBerlaku),
		TglBerakhir:   parseDate(req.TglBerakhir),
		Deskripsi:     req.Deskripsi,
		FilePath:      req.FilePath,
		FileName:      req.FileName,
		FileSize:      req.FileSize,
		MimeType:      req.MimeType,
		Status:        status,
		IDUploader:    req.IDUploader,
	}

	if err := s.repo.CreateDocument(ctx, d); err != nil {
		return nil, err
	}

	s.logActivity(ctx, projectID, nil, req.IDUploader, "document_uploaded",
		fmt.Sprintf("Dokumen '%s' diupload", d.NmDokumen))

	return s.repo.GetDocumentByID(ctx, d.IDDocument)
}

func (s *service) DeleteDocument(ctx context.Context, id string, deletedBy *string) error {
	d, err := s.repo.GetDocumentByID(ctx, id)
	if err != nil {
		return fmt.Errorf("document not found: %w", err)
	}
	if err := s.repo.SoftDeleteDocument(ctx, id); err != nil {
		return err
	}
	s.logActivity(ctx, d.IDProject, nil, deletedBy, "document_deleted",
		fmt.Sprintf("Dokumen '%s' dihapus", d.NmDokumen))
	return nil
}

// ===== DOCUMENT VERSIONS =====

func (s *service) GetDocumentVersions(ctx context.Context, documentID string) ([]DocumentVersion, error) {
	return s.repo.GetDocumentVersions(ctx, documentID)
}

func (s *service) ReplaceDocumentFile(ctx context.Context, documentID, filePath, fileName string, fileSize int64, mimeType string, catatan *string, uploaderID *string) (*Document, error) {
	// 1) Get current document
	doc, err := s.repo.GetDocumentByID(ctx, documentID)
	if err != nil {
		return nil, fmt.Errorf("document not found: %w", err)
	}

	// 2) Determine current version number (use doc.VersionNumber or fallback to latest from versions table)
	currentVersion := doc.VersionNumber
	if currentVersion < 1 {
		currentVersion = 1
	}

	// 3) Save current file info as a version
	mt := doc.MimeType
	v := &DocumentVersion{
		IDVersion:     uuid.New().String(),
		IDDocument:    documentID,
		VersionNumber: currentVersion,
		FilePath:      doc.FilePath,
		FileName:      doc.FileName,
		FileSize:      doc.FileSize,
		MimeType:      mt,
		Catatan:       catatan,
		IDUploader:    uploaderID,
	}
	if err := s.repo.CreateDocumentVersion(ctx, v); err != nil {
		return nil, fmt.Errorf("failed to save version: %w", err)
	}

	// 4) Update document with new file info + increment version_number
	newVersion := currentVersion + 1
	mt2 := mimeType
	fields := map[string]interface{}{
		"file_path":      filePath,
		"file_name":      fileName,
		"file_size":      fileSize,
		"mime_type":      &mt2,
		"version_number": newVersion,
		"updated_at":     time.Now(),
	}
	if err := s.repo.UpdateDocument(ctx, documentID, fields); err != nil {
		return nil, fmt.Errorf("failed to update document: %w", err)
	}

	s.logActivity(ctx, doc.IDProject, nil, uploaderID, "document_replaced",
		fmt.Sprintf("File dokumen '%s' diganti (v%d → v%d)", doc.NmDokumen, currentVersion, newVersion))

	return s.repo.GetDocumentByID(ctx, documentID)
}

// ===== MEMBERS =====

func (s *service) GetMembersByProject(ctx context.Context, projectID string) ([]ProjectMember, error) {
	return s.repo.GetMembersByProject(ctx, projectID)
}

func (s *service) AddMember(ctx context.Context, projectID string, req *AddMemberRequest, addedBy *string) (*ProjectMember, error) {
	if req.Role == "" {
		req.Role = "member"
	}
	member, err := s.repo.AddMember(ctx, projectID, req, addedBy)
	if err != nil {
		return nil, err
	}
	s.logActivity(ctx, projectID, nil, addedBy, "member_added",
		fmt.Sprintf("Member '%s' ditambahkan sebagai %s", req.NmPengguna, req.Role))
	return member, nil
}

func (s *service) RemoveMember(ctx context.Context, projectID, memberID string) error {
	s.logActivity(ctx, projectID, nil, nil, "member_removed",
		fmt.Sprintf("Member (id: %s) dihapus", memberID))
	return s.repo.RemoveMember(ctx, projectID, memberID)
}

// ===== WATCHERS =====

func (s *service) GetWatchersByProject(ctx context.Context, projectID string) ([]ProjectWatcher, error) {
	return s.repo.GetWatchersByProject(ctx, projectID)
}

func (s *service) AddWatcher(ctx context.Context, projectID string, req *AddWatcherRequest) (*ProjectWatcher, error) {
	return s.repo.AddWatcher(ctx, projectID, req)
}

func (s *service) RemoveWatcher(ctx context.Context, projectID, watcherID string) error {
	return s.repo.RemoveWatcher(ctx, projectID, watcherID)
}

// ===== USER-FILTERED PROJECT LIST =====

func (s *service) GetMyProjects(ctx context.Context, userID string, isPimpinan bool, page, limit int) (*PaginatedResult, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	return s.repo.GetProjectsForUser(ctx, userID, isPimpinan, page, limit)
}

// ===== ORG STRUCTURE =====

func (s *service) GetOrgStructure(ctx context.Context, projectID string) (*OrgStructure, error) {
	return s.repo.GetOrgStructure(ctx, projectID)
}

func (s *service) CreateOrgNode(ctx context.Context, projectID string, req *CreateOrgNodeRequest) (*OrgNode, error) {
	return s.repo.CreateOrgNode(ctx, projectID, req)
}

func (s *service) UpdateOrgNode(ctx context.Context, nodeID string, req *UpdateOrgNodeRequest) (*OrgNode, error) {
	return s.repo.UpdateOrgNode(ctx, nodeID, req)
}

func (s *service) DeleteOrgNode(ctx context.Context, nodeID string) error {
	return s.repo.DeleteOrgNode(ctx, nodeID)
}

func (s *service) CreateOrgEdge(ctx context.Context, projectID string, req *CreateOrgEdgeRequest) (*OrgEdge, error) {
	return s.repo.CreateOrgEdge(ctx, projectID, req)
}

func (s *service) DeleteOrgEdge(ctx context.Context, edgeID string) error {
	return s.repo.DeleteOrgEdge(ctx, edgeID)
}

// ===== ANALYTICS =====

func (s *service) LogActivity(ctx context.Context, projectID string, taskID, userID *string, aksi, detail string) {
	_ = s.repo.LogActivity(ctx, projectID, taskID, userID, aksi, detail)
}

func (s *service) GetContributions(ctx context.Context, userID string, year int) (*ContributionData, error) {
	return s.repo.GetContributions(ctx, userID, year)
}

func (s *service) GetProjectContributions(ctx context.Context, projectID string, year int) (*ContributionData, error) {
	return s.repo.GetProjectContributions(ctx, projectID, year)
}

func (s *service) GetActivityTimeline(ctx context.Context, projectID string, period string, months int) ([]ActivityPoint, error) {
	return s.repo.GetActivityTimeline(ctx, projectID, period, months)
}

func (s *service) GetBurndown(ctx context.Context, projectID, sprintID string) ([]BurndownPoint, error) {
	return s.repo.GetBurndown(ctx, sprintID)
}

func (s *service) GetTaskDistribution(ctx context.Context, projectID string) ([]TaskDistribution, error) {
	return s.repo.GetTaskDistribution(ctx, projectID)
}

func (s *service) GetTeamContribution(ctx context.Context, projectID string, months int) ([]TeamContribution, error) {
	return s.repo.GetTeamContribution(ctx, projectID, months)
}

func (s *service) GetUserProfile(ctx context.Context, userID string) (*UserProfile, error) {
	return s.repo.GetUserProfile(ctx, userID)
}
