/**
 * Project Service - CRUD operations for Project Management module
 * Follows same pattern as manakses services
 */

import { projectClient } from '@/lib/api/projectClient';

// ===================== TYPES =====================

export interface Project {
  id: string;
  kode: string;
  nama: string;
  deskripsi?: string;
  repo_url?: string;
  warna?: string;
  status: 'active' | 'archived' | 'completed';
  tanggal_mulai?: string;
  tanggal_target?: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  task_done?: number;
  module_count?: number;
  progress?: number;
  // New visibility fields
  id_unit?: string;
  nm_unit?: string;
  visibility?: 'private' | 'unit' | 'public';
  // Backend field names (direct mapping)
  id_project?: string;
  kode_project?: string;
  nm_project?: string;
  tgl_mulai?: string;
  tgl_target?: string;
}

/** Map backend snake_case fields to frontend interface */
function mapProject(raw: Record<string, unknown>): Project {
  return {
    ...raw,
    id: (raw.id_project ?? raw.id) as string,
    kode: (raw.kode_project ?? raw.kode) as string,
    nama: (raw.nm_project ?? raw.nama) as string,
    tanggal_mulai: (raw.tgl_mulai ?? raw.tanggal_mulai) as string | undefined,
    tanggal_target: (raw.tgl_target ?? raw.tanggal_target) as string | undefined,
  } as Project;
}

function mapProjects(raw: Record<string, unknown>[]): Project[] {
  return (raw ?? []).map(mapProject);
}

export interface ProjectModule {
  id: string;
  project_id: string;
  nama: string;
  deskripsi?: string;
  status?: string;
  urutan?: number;
  warna?: string;
  total_tasks?: number;
  task_done?: number;
  created_at: string;
  // Backend field names
  id_module?: string;
  nm_module?: string;
}

function mapModule(raw: Record<string, unknown>): ProjectModule {
  return {
    ...raw,
    id: (raw.id_module ?? raw.id) as string,
    project_id: (raw.id_project ?? raw.project_id) as string,
    nama: (raw.nm_module ?? raw.nama) as string,
  } as ProjectModule;
}

function mapModules(raw: Record<string, unknown>[]): ProjectModule[] {
  return (raw ?? []).map(mapModule);
}

export interface Task {
  id: string;
  project_id: string;
  module_id?: string;
  sprint_id?: string;
  module?: ProjectModule;
  kode: string;
  judul: string;
  deskripsi?: string;
  tipe: 'feature' | 'bugfix' | 'improvement' | 'chore' | 'documentation';
  prioritas: 'urgent' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  assignee_id?: string;
  assignee_name?: string;
  assignee_initial?: string;
  due_date?: string;
  tgl_mulai?: string;
  tgl_target?: string;
  tgl_selesai?: string;
  progress?: number;
  estimasi_jam?: number;
  actual_jam?: number;
  tags?: string[];
  posisi?: number;
  created_at: string;
  updated_at: string;
  // Backend field names
  id_task?: string;
  id_module?: string;
  id_sprint?: string;
  id_assignee?: string;
  kode_task?: string;
}

function mapTask(raw: Record<string, unknown>): Task {
  const mapped = {
    ...raw,
    id: (raw.id_task ?? raw.id) as string,
    project_id: (raw.id_project ?? raw.project_id) as string,
    module_id: (raw.id_module ?? raw.module_id) as string | undefined,
    sprint_id: (raw.id_sprint ?? raw.sprint_id) as string | undefined,
    assignee_id: (raw.id_assignee ?? raw.assignee_id) as string | undefined,
    kode: (raw.kode_task ?? raw.kode) as string,
    due_date: (raw.tgl_target ?? raw.due_date) as string | undefined,
  } as Task;
  // Map nested module if present
  if (raw.module && typeof raw.module === 'object') {
    mapped.module = mapModule(raw.module as Record<string, unknown>);
  }
  return mapped;
}

function mapTasks(raw: Record<string, unknown>[]): Task[] {
  return (raw ?? []).map(mapTask);
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  user_initial?: string;
  isi: string;
  created_at: string;
}

export interface Commit {
  id: string;
  task_id: string;
  sha: string;
  message: string;
  author: string;
  committed_at: string;
}

export interface Activity {
  id: string;
  project_id: string;
  task_id?: string;
  task_kode?: string;
  user_name: string;
  aksi: string;
  detail?: string;
  created_at: string;
  // Backend field names
  id_activity?: string;
}

function mapActivity(raw: Record<string, unknown>): Activity {
  return {
    ...raw,
    id: (raw.id_activity ?? raw.id) as string,
    project_id: (raw.id_project ?? raw.project_id) as string,
    task_id: (raw.id_task ?? raw.task_id) as string | undefined,
  } as Activity;
}

function mapActivities(raw: Record<string, unknown>[]): Activity[] {
  return (raw ?? []).map(mapActivity);
}

export interface Sprint {
  id_sprint: string;
  id_project: string;
  nm_sprint: string;
  deskripsi?: string;
  tgl_mulai?: string;
  tgl_selesai?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  total_tasks?: number;
  task_done?: number;
  urutan?: number;
  created_at: string;
  updated_at: string;
}

export interface Label {
  id_label: string;
  id_project: string;
  nm_label: string;
  warna: string;
  created_at: string;
}

export interface DocumentCategory {
  id_doc_category: string;
  nm_kategori: string;
  kode_kategori: string;
  icon?: string;
  urutan: number;
  created_at: string;
}

export interface DocumentListItem {
  id_document: string;
  id_project: string;
  id_doc_category: string;
  id_task?: string;
  nm_dokumen: string;
  nomor_dokumen?: string;
  tgl_dokumen?: string;
  tgl_berlaku?: string;
  tgl_berakhir?: string;
  file_name: string;
  file_size: number;
  mime_type?: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
  id_uploader?: string;
  version_number?: number;
  created_at: string;
  updated_at: string;
  kategori_nama?: string;
  kategori_icon?: string;
}

// Renamed to avoid conflict with DOM's Document interface
export interface Document_ {
  id_document: string;
  id_project: string;
  id_doc_category: string;
  id_task?: string;
  nm_dokumen: string;
  nomor_dokumen?: string;
  tgl_dokumen?: string;
  tgl_berlaku?: string;
  tgl_berakhir?: string;
  deskripsi?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type?: string;
  status: 'draft' | 'active' | 'expired' | 'archived';
  id_uploader?: string;
  version_number?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUpdatePayload {
  id_doc_category?: string;
  id_task?: string;
  nm_dokumen?: string;
  nomor_dokumen?: string;
  tgl_dokumen?: string;
  tgl_berlaku?: string;
  tgl_berakhir?: string;
  deskripsi?: string;
  status?: string;
}

export interface DocumentVersion {
  id_version: string;
  id_document: string;
  version_number: number;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type?: string;
  catatan?: string;
  id_uploader?: string;
  created_at: string;
}

// ===== MEMBER / WATCHER / ORG INTERFACES =====

export interface ProjectMember {
  id_member: string;
  id_project: string;
  id_pengguna: string;
  nm_pengguna: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  added_by?: string;
  created_at: string;
}

export interface ProjectWatcher {
  id_watcher: string;
  id_project: string;
  id_pengguna: string;
  id_sdm?: string;
  nm_pengguna: string;
  jabatan: string;
  nm_unit: string;
  tipe_akses: 'viewer' | 'commenter';
  created_at: string;
}

export interface OrgNode {
  id_node: string;
  id_project: string;
  id_pengguna?: string;
  id_sdm?: string;
  nm_display: string;
  jabatan: string;
  foto_url?: string;
  urutan: number;
  warna?: string;
  pos_x: number;
  pos_y: number;
}

export interface OrgEdge {
  id_edge: string;
  id_project: string;
  id_node_from: string;
  id_node_to: string;
  label?: string;
}

export interface AddMemberRequest {
  id_pengguna: string;
  nm_pengguna: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface AddWatcherRequest {
  id_pengguna: string;
  id_sdm?: string;
  nm_pengguna: string;
  jabatan: string;
  nm_unit: string;
}

export interface CreateOrgNodeRequest {
  id_pengguna?: string;
  id_sdm?: string;
  nm_display: string;
  jabatan: string;
  foto_url?: string;
  warna?: string;
  pos_x: number;
  pos_y: number;
}

export interface CreateOrgEdgeRequest {
  id_node_from: string;
  id_node_to: string;
  label?: string;
}

export interface UpdateOrgNodeRequest {
  nm_display?: string;
  jabatan?: string;
  pos_x?: number;
  pos_y?: number;
  warna?: string;
}

export interface OrgStructure {
  nodes: OrgNode[];
  edges: OrgEdge[];
}

export interface WebhookConfig {
  id_webhook: string;
  id_project: string;
  provider: string;
  repo_full_name: string;
  webhook_secret: string;
  a_active: boolean;
  created_at: string;
}

// ===== ANALYTICS TYPES =====

export interface ContributionData {
  year: number;
  total: number;
  longest_streak: number;
  current_streak: number;
  data: Record<string, number>;
  by_type: Record<string, number>;
}

export interface ActivityPoint {
  period: string;
  task_created: number;
  task_done: number;
  comments: number;
  documents: number;
  total: number;
}

export interface TeamContribution {
  id_pengguna: string;
  nm_pengguna: string;
  total: number;
  task_done: number;
  comments: number;
  documents: number;
}

export interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
}

export interface TaskDistribution {
  status: string;
  count: number;
}

export interface UserProfile {
  id_pengguna: string;
  nm_pengguna: string;
  contributions: ContributionData;
  stats: {
    task_completed: number;
    task_created: number;
    comments: number;
    documents: number;
    total_activity: number;
  };
  projects: Array<{
    id_project: string;
    nm_project: string;
    role: string;
    task_done: number;
    total_tasks: number;
    progress: number;
  }>;
}

export interface ProjectStats {
  total_project: number;
  project_aktif: number;
  task_done: number;
  task_overdue: number;
}

export interface TaskReorderPayload {
  task_id: string;
  status: Task['status'];
  posisi: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
  };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ===================== PROJECT SERVICE =====================

export const projectService = {
  // --- Stats ---
  async getStats(): Promise<ProjectStats> {
    const response = await projectClient.get<SingleResponse<ProjectStats>>('/project/stats');
    if (!response.data.success) throw new Error('Failed to fetch project stats');
    return response.data.data;
  },

  // --- Projects ---
  async getProjects(params?: { page?: number; per_page?: number; search?: string; status?: string }): Promise<PaginatedResponse<Project>> {
    const response = await projectClient.get<PaginatedResponse<Project>>('/project', { params });
    const result = response.data;
    if (result.data) result.data = mapProjects(result.data as unknown as Record<string, unknown>[]);
    return result;
  },

  async getProject(id: string): Promise<Project> {
    const response = await projectClient.get<SingleResponse<Project>>(`/project/${id}`);
    if (!response.data.success) throw new Error('Failed to fetch project');
    return mapProject(response.data.data as unknown as Record<string, unknown>);
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const payload = {
      ...data,
      nm_project: data.nama ?? (data as Record<string, unknown>).nm_project,
      kode_project: data.kode ?? (data as Record<string, unknown>).kode_project,
      tgl_mulai: data.tanggal_mulai ?? data.tgl_mulai,
      tgl_target: data.tanggal_target ?? data.tgl_target,
    };
    const response = await projectClient.post<SingleResponse<Project>>('/project', payload);
    if (!response.data.success) throw new Error('Failed to create project');
    return mapProject(response.data.data as unknown as Record<string, unknown>);
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const payload = { ...data } as Record<string, unknown>;
    if (data.nama !== undefined) payload.nm_project = data.nama;
    if (data.kode !== undefined) payload.kode_project = data.kode;
    if (data.tanggal_mulai !== undefined) payload.tgl_mulai = data.tanggal_mulai;
    if (data.tanggal_target !== undefined) payload.tgl_target = data.tanggal_target;
    const response = await projectClient.put<SingleResponse<Project>>(`/project/${id}`, payload);
    if (!response.data.success) throw new Error('Failed to update project');
    return mapProject(response.data.data as unknown as Record<string, unknown>);
  },

  async deleteProject(id: string): Promise<void> {
    await projectClient.delete(`/project/${id}`);
  },

  // --- Modules ---
  async getModules(projectId: string): Promise<ProjectModule[]> {
    const response = await projectClient.get<SingleResponse<ProjectModule[]>>(`/project/${projectId}/modules`);
    if (!response.data.success) throw new Error('Failed to fetch modules');
    return mapModules(response.data.data as unknown as Record<string, unknown>[]);
  },

  async createModule(projectId: string, data: Partial<ProjectModule>): Promise<ProjectModule> {
    const payload = {
      ...data,
      nm_module: data.nama ?? (data as Record<string, unknown>).nm_module,
      id_project: projectId,
    };
    const response = await projectClient.post<SingleResponse<ProjectModule>>(`/project/${projectId}/modules`, payload);
    if (!response.data.success) throw new Error('Failed to create module');
    return mapModule(response.data.data as unknown as Record<string, unknown>);
  },

  async updateModule(projectId: string, moduleId: string, data: Partial<ProjectModule>): Promise<ProjectModule> {
    const payload = { ...data };
    if (data.nama !== undefined) (payload as Record<string, unknown>).nm_module = data.nama;
    const response = await projectClient.put<SingleResponse<ProjectModule>>(`/project/${projectId}/modules/${moduleId}`, payload);
    if (!response.data.success) throw new Error('Failed to update module');
    return mapModule(response.data.data as unknown as Record<string, unknown>);
  },

  async deleteModule(projectId: string, moduleId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/modules/${moduleId}`);
  },

  // --- Tasks ---
  async getTasks(projectId: string, params?: {
    page?: number;
    per_page?: number;
    search?: string;
    module_id?: string;
    status?: string;
    prioritas?: string;
  }): Promise<PaginatedResponse<Task>> {
    const response = await projectClient.get<PaginatedResponse<Task>>(`/project/${projectId}/tasks`, { params });
    const result = response.data;
    if (result.data) result.data = mapTasks(result.data as unknown as Record<string, unknown>[]);
    return result;
  },

  async getTasksByStatus(projectId: string, params?: {
    module_id?: string;
    prioritas?: string;
    search?: string;
  }): Promise<Record<string, Task[]>> {
    const response = await projectClient.get<SingleResponse<Record<string, Task[]>>>(
      `/project/${projectId}/tasks/board`,
      { params }
    );
    if (!response.data.success) throw new Error('Failed to fetch board tasks');
    // Map tasks in each status column
    const data = response.data.data;
    const mapped: Record<string, Task[]> = {};
    for (const [status, tasks] of Object.entries(data)) {
      mapped[status] = mapTasks(tasks as unknown as Record<string, unknown>[]);
    }
    return mapped;
  },

  async getTask(projectId: string, taskId: string): Promise<Task> {
    const response = await projectClient.get<SingleResponse<Task>>(`/project/${projectId}/tasks/${taskId}`);
    if (!response.data.success) throw new Error('Failed to fetch task');
    return mapTask(response.data.data as unknown as Record<string, unknown>);
  },

  async createTask(projectId: string, data: Partial<Task>): Promise<Task> {
    // Map frontend field names to backend field names
    const payload = {
      ...data,
      id_module: data.module_id ?? data.id_module,
      id_sprint: data.sprint_id ?? data.id_sprint,
      id_assignee: data.assignee_id ?? data.id_assignee,
      id_project: projectId,
    };
    const response = await projectClient.post<SingleResponse<Task>>(`/project/${projectId}/tasks`, payload);
    if (!response.data.success) throw new Error('Failed to create task');
    return mapTask(response.data.data as unknown as Record<string, unknown>);
  },

  async updateTask(projectId: string, taskId: string, data: Partial<Task>): Promise<Task> {
    // Map frontend field names to backend field names
    const payload = { ...data };
    if (data.module_id !== undefined) (payload as Record<string, unknown>).id_module = data.module_id;
    if (data.sprint_id !== undefined) (payload as Record<string, unknown>).id_sprint = data.sprint_id;
    if (data.assignee_id !== undefined) (payload as Record<string, unknown>).id_assignee = data.assignee_id;
    const response = await projectClient.put<SingleResponse<Task>>(`/project/${projectId}/tasks/${taskId}`, payload);
    if (!response.data.success) throw new Error('Failed to update task');
    return mapTask(response.data.data as unknown as Record<string, unknown>);
  },

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/tasks/${taskId}`);
  },

  async reorderTasks(projectId: string, items: TaskReorderPayload[]): Promise<void> {
    await projectClient.post(`/project/${projectId}/tasks/reorder`, { items });
  },

  // --- Comments ---
  async getComments(projectId: string, taskId: string): Promise<Comment[]> {
    const response = await projectClient.get<SingleResponse<Comment[]>>(
      `/project/${projectId}/tasks/${taskId}/comments`
    );
    if (!response.data.success) throw new Error('Failed to fetch comments');
    return response.data.data;
  },

  async createComment(projectId: string, taskId: string, isi: string): Promise<Comment> {
    const response = await projectClient.post<SingleResponse<Comment>>(
      `/project/${projectId}/tasks/${taskId}/comments`,
      { isi }
    );
    if (!response.data.success) throw new Error('Failed to create comment');
    return response.data.data;
  },

  // --- Commits ---
  async getCommits(projectId: string, taskId: string): Promise<Commit[]> {
    const response = await projectClient.get<SingleResponse<Commit[]>>(
      `/project/${projectId}/tasks/${taskId}/commits`
    );
    if (!response.data.success) throw new Error('Failed to fetch commits');
    return response.data.data;
  },

  // --- Activity ---
  async getActivity(projectId: string, params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<Activity>> {
    const response = await projectClient.get<PaginatedResponse<Activity>>(
      `/project/${projectId}/activity`,
      { params }
    );
    const result = response.data;
    if (result.data) result.data = mapActivities(result.data as unknown as Record<string, unknown>[]);
    return result;
  },

  // --- Webhooks ---
  async getWebhooks(projectId: string): Promise<WebhookConfig[]> {
    const response = await projectClient.get<{ success: boolean; data: WebhookConfig[] }>(
      `/project/${projectId}/webhooks`
    );
    if (!response.data.success) throw new Error('Failed to fetch webhooks');
    return response.data.data;
  },

  async createWebhook(projectId: string, data: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const response = await projectClient.post<{ success: boolean; data: WebhookConfig }>(
      `/project/${projectId}/webhooks`,
      data
    );
    if (!response.data.success) throw new Error('Failed to create webhook');
    return response.data.data;
  },

  async updateWebhook(projectId: string, webhookId: string, data: Partial<WebhookConfig>): Promise<WebhookConfig> {
    const response = await projectClient.put<{ success: boolean; data: WebhookConfig }>(
      `/project/${projectId}/webhooks/${webhookId}`,
      data
    );
    if (!response.data.success) throw new Error('Failed to update webhook');
    return response.data.data;
  },

  async deleteWebhook(projectId: string, webhookId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/webhooks/${webhookId}`);
  },

  // --- Labels ---
  async getProjectLabels(projectId: string): Promise<Label[]> {
    const response = await projectClient.get<SingleResponse<Label[]>>(`/project/${projectId}/labels`);
    if (!response.data.success) throw new Error('Failed to fetch labels');
    return response.data.data;
  },

  async createProjectLabel(projectId: string, nmLabel: string, warna: string): Promise<Label> {
    const response = await projectClient.post<SingleResponse<Label>>(`/project/${projectId}/labels`, { nm_label: nmLabel, warna });
    if (!response.data.success) throw new Error('Failed to create label');
    return response.data.data;
  },

  async deleteProjectLabel(labelId: string): Promise<void> {
    await projectClient.delete(`/labels/${labelId}`);
  },

  // --- Task Labels ---
  async getTaskLabels(projectId: string, taskId: string): Promise<Label[]> {
    const response = await projectClient.get<SingleResponse<Label[]>>(`/tasks/${taskId}/labels`);
    if (!response.data.success) throw new Error('Failed to fetch task labels');
    return response.data.data;
  },

  async addTaskLabel(projectId: string, taskId: string, labelId: string): Promise<void> {
    await projectClient.post(`/tasks/${taskId}/labels`, { label_id: labelId });
  },

  async removeTaskLabel(projectId: string, taskId: string, labelId: string): Promise<void> {
    await projectClient.delete(`/tasks/${taskId}/labels/${labelId}`);
  },

  // --- Document Categories ---
  async getDocumentCategories(): Promise<DocumentCategory[]> {
    const response = await projectClient.get<{ success: boolean; data: DocumentCategory[] }>('/document-categories');
    if (!response.data.success) throw new Error('Failed to fetch document categories');
    return response.data.data;
  },

  async createDocumentCategory(data: Partial<DocumentCategory>): Promise<DocumentCategory> {
    const response = await projectClient.post<{ success: boolean; data: DocumentCategory }>('/document-categories', data);
    if (!response.data.success) throw new Error('Failed to create document category');
    return response.data.data;
  },

  // --- Documents ---
  async getDocuments(projectId: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<{ data: DocumentListItem[]; meta: { total: number; page: number; limit: number; total_pages: number } }> {
    const response = await projectClient.get<{ success: boolean; data: DocumentListItem[]; meta: { total: number; page: number; limit: number; total_pages: number } }>(
      `/project/${projectId}/documents`, { params }
    );
    if (!response.data.success) throw new Error('Failed to fetch documents');
    return { data: response.data.data, meta: response.data.meta };
  },

  async getDocument(documentId: string): Promise<Document_> {
    const response = await projectClient.get<{ success: boolean; data: Document_ }>(`/documents/${documentId}`);
    if (!response.data.success) throw new Error('Failed to fetch document');
    return response.data.data;
  },

  async uploadDocument(projectId: string, formData: FormData): Promise<Document_> {
    const response = await projectClient.post<{ success: boolean; data: Document_ }>(
      `/project/${projectId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (!response.data.success) throw new Error('Failed to upload document');
    return response.data.data;
  },

  async updateDocument(documentId: string, data: Partial<DocumentUpdatePayload>): Promise<Document_> {
    const response = await projectClient.put<{ success: boolean; data: Document_ }>(`/documents/${documentId}`, data);
    if (!response.data.success) throw new Error('Failed to update document');
    return response.data.data;
  },

  async deleteDocument(documentId: string): Promise<void> {
    await projectClient.delete(`/documents/${documentId}`);
  },

  getDocumentDownloadUrl(documentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_PROJECT_API_URL || 'http://localhost:8090/api/v1';
    return `${baseUrl}/documents/${documentId}/download`;
  },

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const response = await projectClient.get<{ success: boolean; data: DocumentVersion[] }>(`/documents/${documentId}/versions`);
    if (!response.data.success) throw new Error('Failed to fetch versions');
    return response.data.data;
  },

  async replaceDocumentFile(documentId: string, formData: FormData): Promise<Document_> {
    const response = await projectClient.post<{ success: boolean; data: Document_ }>(
      `/documents/${documentId}/replace`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    if (!response.data.success) throw new Error('Failed to replace document');
    return response.data.data;
  },

  // --- Sprints ---
  async getSprints(projectId: string): Promise<Sprint[]> {
    const response = await projectClient.get<{ success: boolean; data: Sprint[] }>(
      `/project/${projectId}/sprints`
    );
    if (!response.data.success) throw new Error('Failed to fetch sprints');
    return response.data.data;
  },

  async createSprint(projectId: string, data: Partial<Sprint>): Promise<Sprint> {
    const response = await projectClient.post<{ success: boolean; data: Sprint }>(
      `/project/${projectId}/sprints`,
      data
    );
    if (!response.data.success) throw new Error('Failed to create sprint');
    return response.data.data;
  },

  async updateSprint(sprintId: string, data: Partial<Sprint>): Promise<Sprint> {
    const response = await projectClient.put<{ success: boolean; data: Sprint }>(
      `/sprints/${sprintId}`,
      data
    );
    if (!response.data.success) throw new Error('Failed to update sprint');
    return response.data.data;
  },

  async deleteSprint(sprintId: string): Promise<void> {
    await projectClient.delete(`/sprints/${sprintId}`);
  },

  // --- My Projects (user-filtered) ---
  async getMyProjects(params: {
    user_id: string;
    is_pimpinan?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Project>> {
    const response = await projectClient.get<PaginatedResponse<Project>>('/project/my', { params });
    const result = response.data;
    if (result.data) result.data = mapProjects(result.data as unknown as Record<string, unknown>[]);
    return result;
  },

  // --- Members ---
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    const response = await projectClient.get<SingleResponse<ProjectMember[]>>(`/project/${projectId}/members`);
    if (!response.data.success) throw new Error('Failed to fetch members');
    return response.data.data;
  },

  async addMember(projectId: string, data: AddMemberRequest, addedBy?: string): Promise<ProjectMember> {
    const response = await projectClient.post<SingleResponse<ProjectMember>>(
      `/project/${projectId}/members${addedBy ? `?added_by=${addedBy}` : ''}`,
      data
    );
    if (!response.data.success) throw new Error('Failed to add member');
    return response.data.data;
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/members/${memberId}`);
  },

  // --- Watchers ---
  async getWatchers(projectId: string): Promise<ProjectWatcher[]> {
    const response = await projectClient.get<SingleResponse<ProjectWatcher[]>>(`/project/${projectId}/watchers`);
    if (!response.data.success) throw new Error('Failed to fetch watchers');
    return response.data.data;
  },

  async addWatcher(projectId: string, data: AddWatcherRequest): Promise<ProjectWatcher> {
    const response = await projectClient.post<SingleResponse<ProjectWatcher>>(
      `/project/${projectId}/watchers`,
      data
    );
    if (!response.data.success) throw new Error('Failed to add watcher');
    return response.data.data;
  },

  async removeWatcher(projectId: string, watcherId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/watchers/${watcherId}`);
  },

  // --- Org Structure ---
  async getOrgStructure(projectId: string): Promise<OrgStructure> {
    const response = await projectClient.get<SingleResponse<OrgStructure>>(`/project/${projectId}/org`);
    if (!response.data.success) throw new Error('Failed to fetch org structure');
    return response.data.data;
  },

  async createOrgNode(projectId: string, data: CreateOrgNodeRequest): Promise<OrgNode> {
    const response = await projectClient.post<SingleResponse<OrgNode>>(`/project/${projectId}/org/nodes`, data);
    if (!response.data.success) throw new Error('Failed to create org node');
    return response.data.data;
  },

  async updateOrgNode(projectId: string, nodeId: string, data: UpdateOrgNodeRequest): Promise<OrgNode> {
    const response = await projectClient.put<SingleResponse<OrgNode>>(`/project/${projectId}/org/nodes/${nodeId}`, data);
    if (!response.data.success) throw new Error('Failed to update org node');
    return response.data.data;
  },

  async deleteOrgNode(projectId: string, nodeId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/org/nodes/${nodeId}`);
  },

  async createOrgEdge(projectId: string, data: CreateOrgEdgeRequest): Promise<OrgEdge> {
    const response = await projectClient.post<SingleResponse<OrgEdge>>(`/project/${projectId}/org/edges`, data);
    if (!response.data.success) throw new Error('Failed to create org edge');
    return response.data.data;
  },

  async deleteOrgEdge(projectId: string, edgeId: string): Promise<void> {
    await projectClient.delete(`/project/${projectId}/org/edges/${edgeId}`);
  },

  // ===== ANALYTICS / CONTRIBUTIONS =====

  async getContributions(userId: string, year?: number): Promise<ContributionData> {
    const params: Record<string, string | number> = { user_id: userId };
    if (year) params.year = year;
    const response = await projectClient.get<SingleResponse<ContributionData>>('/project/contributions', { params });
    if (!response.data.success) throw new Error('Failed to fetch contributions');
    return response.data.data;
  },

  async getProjectContributions(projectId: string, year?: number): Promise<ContributionData> {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    const response = await projectClient.get<SingleResponse<ContributionData>>(`/project/${projectId}/contributions`, { params });
    if (!response.data.success) throw new Error('Failed to fetch project contributions');
    return response.data.data;
  },

  async getActivityTimeline(projectId: string, period?: string, months?: number): Promise<ActivityPoint[]> {
    const params: Record<string, string | number> = {};
    if (period) params.period = period;
    if (months) params.months = months;
    const response = await projectClient.get<SingleResponse<ActivityPoint[]>>(`/project/${projectId}/charts/activity`, { params });
    if (!response.data.success) throw new Error('Failed to fetch activity timeline');
    return response.data.data ?? [];
  },

  async getBurndown(projectId: string, sprintId: string): Promise<BurndownPoint[]> {
    const response = await projectClient.get<SingleResponse<BurndownPoint[]>>(`/project/${projectId}/charts/burndown`, { params: { sprint_id: sprintId } });
    if (!response.data.success) throw new Error('Failed to fetch burndown');
    return response.data.data ?? [];
  },

  async getTaskDistribution(projectId: string): Promise<TaskDistribution[]> {
    const response = await projectClient.get<SingleResponse<TaskDistribution[]>>(`/project/${projectId}/charts/distribution`);
    if (!response.data.success) throw new Error('Failed to fetch task distribution');
    return response.data.data ?? [];
  },

  async getTeamContribution(projectId: string, months?: number): Promise<TeamContribution[]> {
    const params: Record<string, number> = {};
    if (months) params.months = months;
    const response = await projectClient.get<SingleResponse<TeamContribution[]>>(`/project/${projectId}/charts/team`, { params });
    if (!response.data.success) throw new Error('Failed to fetch team contribution');
    return response.data.data ?? [];
  },

  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await projectClient.get<SingleResponse<UserProfile>>(`/project/profile/${userId}`);
    if (!response.data.success) throw new Error('Failed to fetch user profile');
    return response.data.data;
  },
};

export default projectService;
