package project

import (
	"time"
)

// ===== PROJECT =====

type Project struct {
	IDProject    string     `db:"id_project" json:"id_project"`
	KodeProject  string     `db:"kode_project" json:"kode_project"`
	NmProject    string     `db:"nm_project" json:"nm_project"`
	Deskripsi    *string    `db:"deskripsi" json:"deskripsi"`
	Status       string     `db:"status" json:"status"`
	RepoURL      *string    `db:"repo_url" json:"repo_url"`
	RepoProvider *string    `db:"repo_provider" json:"repo_provider"`
	Warna        *string    `db:"warna" json:"warna"`
	TglMulai     *time.Time `db:"tgl_mulai" json:"tgl_mulai"`
	TglTarget    *time.Time `db:"tgl_target" json:"tgl_target"`
	IDOwner      *string    `db:"id_owner" json:"id_owner"`
	IDUnit       *string    `db:"id_unit" json:"id_unit"`
	NmUnit       *string    `db:"nm_unit" json:"nm_unit"`
	Visibility   string     `db:"visibility" json:"visibility"`
	CreatedAt    time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updated_at"`
	SoftDelete   bool       `db:"soft_delete" json:"-"`
}

type ProjectListItem struct {
	IDProject   string     `db:"id_project" json:"id_project"`
	KodeProject string     `db:"kode_project" json:"kode_project"`
	NmProject   string     `db:"nm_project" json:"nm_project"`
	Deskripsi   *string    `db:"deskripsi" json:"deskripsi"`
	Status      string     `db:"status" json:"status"`
	Warna       *string    `db:"warna" json:"warna"`
	TglMulai    *time.Time `db:"tgl_mulai" json:"tgl_mulai"`
	TglTarget   *time.Time `db:"tgl_target" json:"tgl_target"`
	RepoURL     *string    `db:"repo_url" json:"repo_url"`
	IDUnit      *string    `db:"id_unit" json:"id_unit"`
	NmUnit      *string    `db:"nm_unit" json:"nm_unit"`
	Visibility  string     `db:"visibility" json:"visibility"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
	TaskCount   int        `db:"task_count" json:"task_count"`
	TaskDone    int        `db:"task_done" json:"task_done"`
	ModuleCount int        `db:"module_count" json:"module_count"`
}

type ProjectCreateRequest struct {
	NmProject    string  `json:"nm_project"`
	Deskripsi    *string `json:"deskripsi"`
	Status       string  `json:"status"`
	RepoURL      *string `json:"repo_url"`
	RepoProvider *string `json:"repo_provider"`
	Warna        *string `json:"warna"`
	TglMulai     *string `json:"tgl_mulai"`
	TglTarget    *string `json:"tgl_target"`
	IDOwner      *string `json:"id_owner"`
	IDUnit       *string `json:"id_unit"`
	NmUnit       *string `json:"nm_unit"`
	Visibility   string  `json:"visibility"`
}

type ProjectUpdateRequest struct {
	NmProject    *string `json:"nm_project"`
	Deskripsi    *string `json:"deskripsi"`
	Status       *string `json:"status"`
	RepoURL      *string `json:"repo_url"`
	RepoProvider *string `json:"repo_provider"`
	Warna        *string `json:"warna"`
	TglMulai     *string `json:"tgl_mulai"`
	TglTarget    *string `json:"tgl_target"`
	IDOwner      *string `json:"id_owner"`
	IDUnit       *string `json:"id_unit"`
	NmUnit       *string `json:"nm_unit"`
	Visibility   *string `json:"visibility"`
}

type ProjectStats struct {
	TotalModules  int `db:"total_modules" json:"total_modules"`
	TotalTasks    int `db:"total_tasks" json:"total_tasks"`
	TaskBacklog   int `db:"task_backlog" json:"task_backlog"`
	TaskTodo      int `db:"task_todo" json:"task_todo"`
	TaskInProgress int `db:"task_in_progress" json:"task_in_progress"`
	TaskReview    int `db:"task_review" json:"task_review"`
	TaskDone      int `db:"task_done" json:"task_done"`
	TaskCancelled int `db:"task_cancelled" json:"task_cancelled"`
}

// ===== MODULE =====

type Module struct {
	IDModule    string     `db:"id_module" json:"id_module"`
	IDProject   string     `db:"id_project" json:"id_project"`
	NmModule    string     `db:"nm_module" json:"nm_module"`
	Deskripsi   *string    `db:"deskripsi" json:"deskripsi"`
	Status      string     `db:"status" json:"status"`
	Urutan      int        `db:"urutan" json:"urutan"`
	Warna       *string    `db:"warna" json:"warna"`
	TglMulai    *time.Time `db:"tgl_mulai" json:"tgl_mulai"`
	TglTarget   *time.Time `db:"tgl_target" json:"tgl_target"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
	SoftDelete  bool       `db:"soft_delete" json:"-"`
}

type ModuleWithCounts struct {
	IDModule   string     `db:"id_module" json:"id_module"`
	IDProject  string     `db:"id_project" json:"id_project"`
	NmModule   string     `db:"nm_module" json:"nm_module"`
	Deskripsi  *string    `db:"deskripsi" json:"deskripsi"`
	Status     string     `db:"status" json:"status"`
	Urutan     int        `db:"urutan" json:"urutan"`
	Warna      *string    `db:"warna" json:"warna"`
	TglMulai   *time.Time `db:"tgl_mulai" json:"tgl_mulai"`
	TglTarget  *time.Time `db:"tgl_target" json:"tgl_target"`
	TotalTasks int        `db:"total_tasks" json:"total_tasks"`
	TaskDone   int        `db:"task_done" json:"task_done"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at" json:"updated_at"`
}

type ModuleCreateRequest struct {
	IDProject string  `json:"id_project"`
	NmModule  string  `json:"nm_module"`
	Deskripsi *string `json:"deskripsi"`
	Status    string  `json:"status"`
	Urutan    int     `json:"urutan"`
	Warna     *string `json:"warna"`
	TglMulai  *string `json:"tgl_mulai"`
	TglTarget *string `json:"tgl_target"`
}

type ModuleUpdateRequest struct {
	NmModule  *string `json:"nm_module"`
	Deskripsi *string `json:"deskripsi"`
	Status    *string `json:"status"`
	Urutan    *int    `json:"urutan"`
	Warna     *string `json:"warna"`
	TglMulai  *string `json:"tgl_mulai"`
	TglTarget *string `json:"tgl_target"`
}

// ===== SPRINT =====

type Sprint struct {
	IDSprint   string     `db:"id_sprint" json:"id_sprint"`
	IDProject  string     `db:"id_project" json:"id_project"`
	NmSprint   string     `db:"nm_sprint" json:"nm_sprint"`
	Deskripsi  *string    `db:"deskripsi" json:"deskripsi"`
	TglMulai   *time.Time `db:"tgl_mulai" json:"tgl_mulai"`
	TglSelesai *time.Time `db:"tgl_selesai" json:"tgl_selesai"`
	Status     string     `db:"status" json:"status"`
	Urutan     int        `db:"urutan" json:"urutan"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at" json:"updated_at"`
	SoftDelete bool       `db:"soft_delete" json:"-"`
}

type SprintWithCounts struct {
	Sprint
	TotalTasks int `db:"total_tasks" json:"total_tasks"`
	TaskDone   int `db:"task_done" json:"task_done"`
}

type SprintCreateRequest struct {
	IDProject  string  `json:"id_project"`
	NmSprint   string  `json:"nm_sprint"`
	Deskripsi  *string `json:"deskripsi"`
	TglMulai   *string `json:"tgl_mulai"`
	TglSelesai *string `json:"tgl_selesai"`
	Status     string  `json:"status"`
}

type SprintUpdateRequest struct {
	NmSprint   *string `json:"nm_sprint"`
	Deskripsi  *string `json:"deskripsi"`
	TglMulai   *string `json:"tgl_mulai"`
	TglSelesai *string `json:"tgl_selesai"`
	Status     *string `json:"status"`
}

// ===== TASK =====

type Task struct {
	IDTask       string     `db:"id_task" json:"id_task"`
	IDModule     string     `db:"id_module" json:"id_module"`
	IDProject    string     `db:"id_project" json:"id_project"`
	IDSprint     *string    `db:"id_sprint" json:"id_sprint"`
	KodeTask     string     `db:"kode_task" json:"kode_task"`
	NomorTask    int        `db:"nomor_task" json:"nomor_task"`
	Judul        string     `db:"judul" json:"judul"`
	Deskripsi    *string    `db:"deskripsi" json:"deskripsi"`
	Tipe         string     `db:"tipe" json:"tipe"`
	Prioritas    string     `db:"prioritas" json:"prioritas"`
	Status       string     `db:"status" json:"status"`
	IDAssignee      *string    `db:"id_assignee" json:"id_assignee"`
	AssigneeName    *string    `db:"assignee_name" json:"assignee_name"`
	AssigneeInitial *string    `db:"assignee_initial" json:"assignee_initial"`
	IDReporter      *string    `db:"id_reporter" json:"id_reporter"`
	TglMulai        *time.Time `db:"tgl_mulai" json:"tgl_mulai"`
	TglTarget       *time.Time `db:"tgl_target" json:"tgl_target"`
	TglSelesai      *time.Time `db:"tgl_selesai" json:"tgl_selesai"`
	Progress        int        `db:"progress" json:"progress"`
	EstimasiJam     *float64   `db:"estimasi_jam" json:"estimasi_jam"`
	ActualJam       *float64   `db:"actual_jam" json:"actual_jam"`
	Tags            *string    `db:"tags" json:"tags"`
	Urutan          int        `db:"urutan" json:"urutan"`
	CreatedAt       time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at" json:"updated_at"`
	SoftDelete      bool       `db:"soft_delete" json:"-"`
}

type TaskListItem struct {
	IDTask          string     `db:"id_task" json:"id_task"`
	IDModule        string     `db:"id_module" json:"id_module"`
	IDProject       string     `db:"id_project" json:"id_project"`
	IDSprint        *string    `db:"id_sprint" json:"id_sprint"`
	KodeTask        string     `db:"kode_task" json:"kode_task"`
	NomorTask       int        `db:"nomor_task" json:"nomor_task"`
	Judul           string     `db:"judul" json:"judul"`
	Tipe            string     `db:"tipe" json:"tipe"`
	Prioritas       string     `db:"prioritas" json:"prioritas"`
	Status          string     `db:"status" json:"status"`
	IDAssignee      *string    `db:"id_assignee" json:"id_assignee"`
	AssigneeName    *string    `db:"assignee_name" json:"assignee_name"`
	AssigneeInitial *string    `db:"assignee_initial" json:"assignee_initial"`
	AssigneesJSON   *string    `db:"assignees_json" json:"assignees_json"`
	TglTarget       *time.Time `db:"tgl_target" json:"tgl_target"`
	Progress        int        `db:"progress" json:"progress"`
	Urutan          int        `db:"urutan" json:"urutan"`
	CreatedAt       time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
}

type TaskDetail struct {
	Task
	Comments []TaskComment `json:"comments"`
	Commits  []TaskCommit  `json:"commits"`
}

type TaskCreateRequest struct {
	IDModule    string   `json:"id_module"`
	IDProject   string   `json:"id_project"`
	IDSprint    *string  `json:"id_sprint"`
	Judul       string   `json:"judul"`
	Deskripsi   *string  `json:"deskripsi"`
	Tipe        string   `json:"tipe"`
	Prioritas   string   `json:"prioritas"`
	Status      string   `json:"status"`
	IDAssignee  *string  `json:"id_assignee"`
	IDReporter  *string  `json:"id_reporter"`
	TglMulai    *string  `json:"tgl_mulai"`
	TglTarget   *string  `json:"tgl_target"`
	EstimasiJam *float64 `json:"estimasi_jam"`
	Tags        *string  `json:"tags"`
	IDPengguna  *string  `json:"id_pengguna"` // for activity log
}

type TaskUpdateRequest struct {
	IDModule        *string  `json:"id_module"`
	IDSprint        *string  `json:"id_sprint"`
	Judul           *string  `json:"judul"`
	Deskripsi       *string  `json:"deskripsi"`
	Tipe            *string  `json:"tipe"`
	Prioritas       *string  `json:"prioritas"`
	Status          *string  `json:"status"`
	IDAssignee      *string  `json:"id_assignee"`
	AssigneeName    *string  `json:"assignee_name"`
	AssigneeInitial *string  `json:"assignee_initial"`
	IDReporter      *string  `json:"id_reporter"`
	TglMulai    *string  `json:"tgl_mulai"`
	TglTarget   *string  `json:"tgl_target"`
	TglSelesai  *string  `json:"tgl_selesai"`
	Progress    *int     `json:"progress"`
	EstimasiJam *float64 `json:"estimasi_jam"`
	ActualJam   *float64 `json:"actual_jam"`
	Tags        *string  `json:"tags"`
	IDPengguna  *string  `json:"id_pengguna"` // for activity log
}

type TaskStatusUpdate struct {
	Status     string  `json:"status"`
	Progress   *int    `json:"progress"`
	IDPengguna *string `json:"id_pengguna"` // for activity log
}

type TaskReorderItem struct {
	IDTask string `json:"id_task"`
	Status string `json:"status,omitempty"`
	Urutan int    `json:"urutan"`
}

type TaskReorderRequest struct {
	Items []TaskReorderItem `json:"items"`
}

type TaskFilters struct {
	IDProject  string
	IDModule   string
	Status     string
	Prioritas  string
	IDAssignee string
	Search     string
}

type BoardColumn struct {
	Status string         `json:"status"`
	Label  string         `json:"label"`
	Tasks  []TaskListItem `json:"tasks"`
}

type BoardView struct {
	IDProject string        `json:"id_project"`
	IDModule  string        `json:"id_module"`
	Columns   []BoardColumn `json:"columns"`
}

// ===== TASK COMMENT =====

type TaskAssignee struct {
	IDTaskAssignee string `db:"id_task_assignee" json:"id_task_assignee"`
	IDTask         string `db:"id_task" json:"id_task"`
	IDPengguna     string `db:"id_pengguna" json:"id_pengguna"`
	NmPengguna     string `db:"nm_pengguna" json:"nm_pengguna"`
	Initial        string `db:"initial" json:"initial"`
	CreatedAt      string `db:"created_at" json:"created_at"`
}

type TaskComment struct {
	IDComment  string    `db:"id_comment" json:"id_comment"`
	IDTask     string    `db:"id_task" json:"id_task"`
	IDPengguna *string   `db:"id_pengguna" json:"id_pengguna"`
	Konten     string    `db:"konten" json:"konten"`
	Tipe       string    `db:"tipe" json:"tipe"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time `db:"updated_at" json:"updated_at"`
	SoftDelete bool      `db:"soft_delete" json:"-"`
}

type CommentCreateRequest struct {
	IDTask     string  `json:"id_task"`
	IDPengguna *string `json:"id_pengguna"`
	Konten     string  `json:"konten"`
	Tipe       string  `json:"tipe"`
}

type CommentUpdateRequest struct {
	Konten string `json:"konten"`
}

// ===== TASK COMMIT =====

type TaskCommit struct {
	IDTaskCommit    string    `db:"id_task_commit" json:"id_task_commit"`
	IDTask          *string   `db:"id_task" json:"id_task"`
	IDProject       string    `db:"id_project" json:"id_project"`
	CommitHash      string    `db:"commit_hash" json:"commit_hash"`
	CommitHashShort string    `db:"commit_hash_short" json:"commit_hash_short"`
	CommitMessage   *string   `db:"commit_message" json:"commit_message"`
	AuthorName      *string   `db:"author_name" json:"author_name"`
	AuthorEmail     *string   `db:"author_email" json:"author_email"`
	Branch          *string   `db:"branch" json:"branch"`
	CommitURL       *string   `db:"commit_url" json:"commit_url"`
	CommittedAt     time.Time `db:"committed_at" json:"committed_at"`
	CreatedAt       time.Time `db:"created_at" json:"created_at"`
}

// ===== ACTIVITY LOG =====

type ActivityLog struct {
	IDActivity string    `db:"id_activity" json:"id_activity"`
	IDProject  string    `db:"id_project" json:"id_project"`
	IDTask     *string   `db:"id_task" json:"id_task"`
	IDPengguna *string   `db:"id_pengguna" json:"id_pengguna"`
	Aksi       string    `db:"aksi" json:"aksi"`
	Detail     *string   `db:"detail" json:"detail"`
	CreatedAt  time.Time `db:"created_at" json:"created_at"`
}

// ===== WEBHOOK CONFIG =====

type WebhookConfig struct {
	IDWebhook     string    `db:"id_webhook" json:"id_webhook"`
	IDProject     string    `db:"id_project" json:"id_project"`
	Provider      string    `db:"provider" json:"provider"`
	WebhookSecret string    `db:"webhook_secret" json:"webhook_secret"`
	RepoFullName  string    `db:"repo_full_name" json:"repo_full_name"`
	AActive       bool      `db:"a_active" json:"a_active"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
}

type WebhookConfigCreateRequest struct {
	Provider      string `json:"provider"`
	RepoFullName  string `json:"repo_full_name"`
	WebhookSecret string `json:"webhook_secret"`
}

type WebhookConfigUpdateRequest struct {
	WebhookSecret *string `json:"webhook_secret"`
	AActive       *bool   `json:"a_active"`
}

// ===== LABEL =====

type Label struct {
	IDLabel   string    `db:"id_label" json:"id_label"`
	IDProject string    `db:"id_project" json:"id_project"`
	NmLabel   string    `db:"nm_label" json:"nm_label"`
	Warna     string    `db:"warna" json:"warna"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type TaskLabel struct {
	IDTask  string `db:"id_task" json:"id_task"`
	IDLabel string `db:"id_label" json:"id_label"`
}

type AddTaskLabelRequest struct {
	LabelID string `json:"label_id"`
}

// ===== PAGINATION =====

type Pagination struct {
	Total      int `json:"total"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	TotalPages int `json:"total_pages"`
}

type PaginatedResult struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// ===== DOCUMENT CATEGORY =====

type DocumentCategory struct {
	IDDocCategory string    `db:"id_doc_category" json:"id_doc_category"`
	NmKategori    string    `db:"nm_kategori" json:"nm_kategori"`
	KodeKategori  string    `db:"kode_kategori" json:"kode_kategori"`
	Icon          *string   `db:"icon" json:"icon"`
	Urutan        int       `db:"urutan" json:"urutan"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
}

type DocumentCategoryCreateRequest struct {
	NmKategori   string  `json:"nm_kategori"`
	KodeKategori string  `json:"kode_kategori"`
	Icon         *string `json:"icon"`
	Urutan       int     `json:"urutan"`
}

// ===== DOCUMENT =====

type Document struct {
	IDDocument    string     `db:"id_document" json:"id_document"`
	IDProject     string     `db:"id_project" json:"id_project"`
	IDDocCategory string     `db:"id_doc_category" json:"id_doc_category"`
	IDTask        *string    `db:"id_task" json:"id_task"`
	NmDokumen     string     `db:"nm_dokumen" json:"nm_dokumen"`
	NomorDokumen  *string    `db:"nomor_dokumen" json:"nomor_dokumen"`
	TglDokumen    *time.Time `db:"tgl_dokumen" json:"tgl_dokumen"`
	TglBerlaku    *time.Time `db:"tgl_berlaku" json:"tgl_berlaku"`
	TglBerakhir   *time.Time `db:"tgl_berakhir" json:"tgl_berakhir"`
	Deskripsi     *string    `db:"deskripsi" json:"deskripsi"`
	FilePath      string     `db:"file_path" json:"file_path"`
	FileName      string     `db:"file_name" json:"file_name"`
	FileSize      int64      `db:"file_size" json:"file_size"`
	MimeType      *string    `db:"mime_type" json:"mime_type"`
	Status        string     `db:"status" json:"status"`
	IDUploader    *string    `db:"id_uploader" json:"id_uploader"`
	VersionNumber int        `db:"version_number" json:"version_number"`
	CreatedAt     time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at" json:"updated_at"`
	SoftDelete    bool       `db:"soft_delete" json:"-"`
}

type DocumentListItem struct {
	IDDocument    string     `db:"id_document" json:"id_document"`
	IDProject     string     `db:"id_project" json:"id_project"`
	IDDocCategory string     `db:"id_doc_category" json:"id_doc_category"`
	IDTask        *string    `db:"id_task" json:"id_task"`
	NmDokumen     string     `db:"nm_dokumen" json:"nm_dokumen"`
	NomorDokumen  *string    `db:"nomor_dokumen" json:"nomor_dokumen"`
	TglDokumen    *time.Time `db:"tgl_dokumen" json:"tgl_dokumen"`
	TglBerlaku    *time.Time `db:"tgl_berlaku" json:"tgl_berlaku"`
	TglBerakhir   *time.Time `db:"tgl_berakhir" json:"tgl_berakhir"`
	FileName      string     `db:"file_name" json:"file_name"`
	FileSize      int64      `db:"file_size" json:"file_size"`
	MimeType      *string    `db:"mime_type" json:"mime_type"`
	Status        string     `db:"status" json:"status"`
	IDUploader    *string    `db:"id_uploader" json:"id_uploader"`
	VersionNumber int        `db:"version_number" json:"version_number"`
	CreatedAt     time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at" json:"updated_at"`
	// Joined from document_categories
	KategoriNama *string `db:"kategori_nama" json:"kategori_nama"`
	KategoriIcon *string `db:"kategori_icon" json:"kategori_icon"`
}

type DocumentCreateRequest struct {
	IDProject     string  `json:"id_project"`
	IDDocCategory string  `json:"id_doc_category"`
	IDTask        *string `json:"id_task"`
	NmDokumen     string  `json:"nm_dokumen"`
	NomorDokumen  *string `json:"nomor_dokumen"`
	TglDokumen    *string `json:"tgl_dokumen"`
	TglBerlaku    *string `json:"tgl_berlaku"`
	TglBerakhir   *string `json:"tgl_berakhir"`
	Deskripsi     *string `json:"deskripsi"`
	Status        string  `json:"status"`
	IDUploader    *string `json:"id_uploader"`
	// Set by handler after MinIO upload
	FilePath string  `json:"file_path"`
	FileName string  `json:"file_name"`
	FileSize int64   `json:"file_size"`
	MimeType *string `json:"mime_type"`
}

type DocumentUpdateRequest struct {
	IDDocCategory *string `json:"id_doc_category"`
	IDTask        *string `json:"id_task"`
	NmDokumen     *string `json:"nm_dokumen"`
	NomorDokumen  *string `json:"nomor_dokumen"`
	TglDokumen    *string `json:"tgl_dokumen"`
	TglBerlaku    *string `json:"tgl_berlaku"`
	TglBerakhir   *string `json:"tgl_berakhir"`
	Deskripsi     *string `json:"deskripsi"`
	Status        *string `json:"status"`
}

// ===== DOCUMENT VERSION =====

type DocumentVersion struct {
	IDVersion     string    `db:"id_version" json:"id_version"`
	IDDocument    string    `db:"id_document" json:"id_document"`
	VersionNumber int       `db:"version_number" json:"version_number"`
	FilePath      string    `db:"file_path" json:"file_path"`
	FileName      string    `db:"file_name" json:"file_name"`
	FileSize      int64     `db:"file_size" json:"file_size"`
	MimeType      *string   `db:"mime_type" json:"mime_type"`
	Catatan       *string   `db:"catatan" json:"catatan"`
	IDUploader    *string   `db:"id_uploader" json:"id_uploader"`
	CreatedAt     time.Time `db:"created_at" json:"created_at"`
}

// ===== USER REF (SQL Server) =====

type UserRef struct {
	IDPengguna string  `db:"id_pengguna" json:"id_pengguna"`
	Nama       string  `db:"nama" json:"nama"`
	Username   string  `db:"username" json:"username"`
	Email      *string `db:"email" json:"email"`
	Avatar     *string `db:"avatar" json:"avatar"`
}

// GlobalStats represents global stats across all projects
type GlobalStats struct {
	TotalProject int `db:"total_project" json:"total_project"`
	ProjectAktif int `db:"project_aktif" json:"project_aktif"`
	TaskDone     int `db:"task_done" json:"task_done"`
	TaskOverdue  int `db:"task_overdue" json:"task_overdue"`
}

// ===== PROJECT MEMBERS =====

// ProjectMember represents a project team member
type ProjectMember struct {
	IDMember   string  `db:"id_member" json:"id_member"`
	IDProject  string  `db:"id_project" json:"id_project"`
	IDPengguna string  `db:"id_pengguna" json:"id_pengguna"`
	NmPengguna string  `db:"nm_pengguna" json:"nm_pengguna"`
	Role       string  `db:"role" json:"role"` // owner, admin, member, viewer
	AddedBy    *string `db:"added_by" json:"added_by"`
	CreatedAt  string  `db:"created_at" json:"created_at"`
}

// ProjectWatcher represents a pimpinan watching a project
type ProjectWatcher struct {
	IDWatcher  string  `db:"id_watcher" json:"id_watcher"`
	IDProject  string  `db:"id_project" json:"id_project"`
	IDPengguna string  `db:"id_pengguna" json:"id_pengguna"`
	IDSdm      *string `db:"id_sdm" json:"id_sdm"`
	NmPengguna string  `db:"nm_pengguna" json:"nm_pengguna"`
	Jabatan    string  `db:"jabatan" json:"jabatan"`
	NmUnit     string  `db:"nm_unit" json:"nm_unit"`
	TipeAkses  string  `db:"tipe_akses" json:"tipe_akses"` // viewer, commenter
	CreatedAt  string  `db:"created_at" json:"created_at"`
}

// ===== ORG STRUCTURE =====

// OrgNode represents a node in project org structure
type OrgNode struct {
	IDNode     string  `db:"id_node" json:"id_node"`
	IDProject  string  `db:"id_project" json:"id_project"`
	IDPengguna *string `db:"id_pengguna" json:"id_pengguna"`
	IDSdm      *string `db:"id_sdm" json:"id_sdm"`
	NmDisplay  string  `db:"nm_display" json:"nm_display"`
	Jabatan    string  `db:"jabatan" json:"jabatan"`
	FotoURL    *string `db:"foto_url" json:"foto_url"`
	Urutan     int     `db:"urutan" json:"urutan"`
	Warna      *string `db:"warna" json:"warna"`
	PosX       float64 `db:"pos_x" json:"pos_x"`
	PosY       float64 `db:"pos_y" json:"pos_y"`
}

// OrgEdge represents a connection between org nodes
type OrgEdge struct {
	IDEdge     string  `db:"id_edge" json:"id_edge"`
	IDProject  string  `db:"id_project" json:"id_project"`
	IDNodeFrom string  `db:"id_node_from" json:"id_node_from"`
	IDNodeTo   string  `db:"id_node_to" json:"id_node_to"`
	Label      *string `db:"label" json:"label"`
}

// ===== REQUEST TYPES =====

type AddMemberRequest struct {
	IDPengguna string `json:"id_pengguna"`
	NmPengguna string `json:"nm_pengguna"`
	Role       string `json:"role"`
}

type AddWatcherRequest struct {
	IDPengguna string `json:"id_pengguna"`
	IDSdm      string `json:"id_sdm"`
	NmPengguna string `json:"nm_pengguna"`
	Jabatan    string `json:"jabatan"`
	NmUnit     string `json:"nm_unit"`
}

type CreateOrgNodeRequest struct {
	IDPengguna *string `json:"id_pengguna"`
	IDSdm      *string `json:"id_sdm"`
	NmDisplay  string  `json:"nm_display"`
	Jabatan    string  `json:"jabatan"`
	FotoURL    *string `json:"foto_url"`
	Warna      *string `json:"warna"`
	PosX       float64 `json:"pos_x"`
	PosY       float64 `json:"pos_y"`
}

type CreateOrgEdgeRequest struct {
	IDNodeFrom string  `json:"id_node_from"`
	IDNodeTo   string  `json:"id_node_to"`
	Label      *string `json:"label"`
}

type UpdateOrgNodeRequest struct {
	NmDisplay *string  `json:"nm_display"`
	Jabatan   *string  `json:"jabatan"`
	PosX      *float64 `json:"pos_x"`
	PosY      *float64 `json:"pos_y"`
	Warna     *string  `json:"warna"`
}

// OrgStructure holds org nodes and edges for a project
type OrgStructure struct {
	Nodes []OrgNode `json:"nodes"`
	Edges []OrgEdge `json:"edges"`
}

// ===== ANALYTICS / CONTRIBUTION =====

type ContributionDay struct {
	Date  string `db:"tanggal" json:"date"`
	Count int    `db:"total" json:"count"`
}

type ContributionData struct {
	Year          int            `json:"year"`
	Total         int            `json:"total"`
	LongestStreak int            `json:"longest_streak"`
	CurrentStreak int            `json:"current_streak"`
	Data          map[string]int `json:"data"`
	ByType        map[string]int `json:"by_type"`
}

type ActivityPoint struct {
	Period      string `json:"period"` // "2026-W12" or "2026-03"
	TaskCreated int    `json:"task_created"`
	TaskDone    int    `json:"task_done"`
	Comments    int    `json:"comments"`
	Documents   int    `json:"documents"`
	Total       int    `json:"total"`
}

type TeamContribution struct {
	IDPengguna string `db:"id_pengguna" json:"id_pengguna"`
	NmPengguna string `db:"nm_pengguna" json:"nm_pengguna"`
	Total      int    `db:"total" json:"total"`
	TaskDone   int    `db:"task_done" json:"task_done"`
	Comments   int    `db:"comments" json:"comments"`
	Documents  int    `db:"documents" json:"documents"`
}

type BurndownPoint struct {
	Date      string `json:"date"`
	Remaining int    `json:"remaining"`
	Ideal     int    `json:"ideal"`
}

type TaskDistribution struct {
	Status   string `db:"status" json:"status"`
	Count    int    `db:"count" json:"count"`
	Priority string `db:"priority" json:"priority,omitempty"`
}

type UserProfile struct {
	IDPengguna    string           `json:"id_pengguna"`
	NmPengguna    string           `json:"nm_pengguna"`
	Contributions ContributionData `json:"contributions"`
	Stats         UserStats        `json:"stats"`
	Projects      []ProjectSummary `json:"projects"`
}

type UserStats struct {
	TaskCompleted int `json:"task_completed"`
	TaskCreated   int `json:"task_created"`
	Comments      int `json:"comments"`
	Documents     int `json:"documents"`
	TotalActivity int `json:"total_activity"`
}

type ProjectSummary struct {
	IDProject  string `json:"id_project"`
	NmProject  string `json:"nm_project"`
	Role       string `json:"role"`
	TaskDone   int    `json:"task_done"`
	TotalTasks int    `json:"total_tasks"`
	Progress   int    `json:"progress"` // percentage
}
