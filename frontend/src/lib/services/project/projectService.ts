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
}

export interface ProjectModule {
  id: string;
  project_id: string;
  nama: string;
  deskripsi?: string;
  urutan?: number;
  created_at: string;
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

export interface WebhookConfig {
  id_webhook: string;
  id_project: string;
  provider: string;
  repo_full_name: string;
  webhook_secret: string;
  a_active: boolean;
  created_at: string;
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
    return response.data;
  },

  async getProject(id: string): Promise<Project> {
    const response = await projectClient.get<SingleResponse<Project>>(`/project/${id}`);
    if (!response.data.success) throw new Error('Failed to fetch project');
    return response.data.data;
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const response = await projectClient.post<SingleResponse<Project>>('/project', data);
    if (!response.data.success) throw new Error('Failed to create project');
    return response.data.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await projectClient.put<SingleResponse<Project>>(`/project/${id}`, data);
    if (!response.data.success) throw new Error('Failed to update project');
    return response.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await projectClient.delete(`/project/${id}`);
  },

  // --- Modules ---
  async getModules(projectId: string): Promise<ProjectModule[]> {
    const response = await projectClient.get<SingleResponse<ProjectModule[]>>(`/project/${projectId}/modules`);
    if (!response.data.success) throw new Error('Failed to fetch modules');
    return response.data.data;
  },

  async createModule(projectId: string, data: Partial<ProjectModule>): Promise<ProjectModule> {
    const response = await projectClient.post<SingleResponse<ProjectModule>>(`/project/${projectId}/modules`, data);
    if (!response.data.success) throw new Error('Failed to create module');
    return response.data.data;
  },

  async updateModule(projectId: string, moduleId: string, data: Partial<ProjectModule>): Promise<ProjectModule> {
    const response = await projectClient.put<SingleResponse<ProjectModule>>(`/project/${projectId}/modules/${moduleId}`, data);
    if (!response.data.success) throw new Error('Failed to update module');
    return response.data.data;
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
    return response.data;
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
    return response.data.data;
  },

  async getTask(projectId: string, taskId: string): Promise<Task> {
    const response = await projectClient.get<SingleResponse<Task>>(`/project/${projectId}/tasks/${taskId}`);
    if (!response.data.success) throw new Error('Failed to fetch task');
    return response.data.data;
  },

  async createTask(projectId: string, data: Partial<Task>): Promise<Task> {
    const response = await projectClient.post<SingleResponse<Task>>(`/project/${projectId}/tasks`, data);
    if (!response.data.success) throw new Error('Failed to create task');
    return response.data.data;
  },

  async updateTask(projectId: string, taskId: string, data: Partial<Task>): Promise<Task> {
    const response = await projectClient.put<SingleResponse<Task>>(`/project/${projectId}/tasks/${taskId}`, data);
    if (!response.data.success) throw new Error('Failed to update task');
    return response.data.data;
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
    return response.data;
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
};

export default projectService;
