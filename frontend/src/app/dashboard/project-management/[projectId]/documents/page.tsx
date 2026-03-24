"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardBody,
  Btn,
  TwInput,
  TwSelect,
  TwTextarea,
  Spinner,
  Chip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmDialog,
  useToast,
} from "../../components/ui";
import {
  FiPlus,
  FiSearch,
  FiFile,
  FiDownload,
  FiTrash2,
  FiEdit,
  FiEye,
  FiGrid,
  FiList,
  FiUploadCloud,
  FiX,
  FiFileText,
  FiCalendar,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiRefreshCw,
  FiGitBranch,
} from "react-icons/fi";
import Link from "next/link";
import {
  projectService,
  type Project,
  type DocumentCategory,
  type DocumentListItem,
  type Document_,
  type DocumentUpdatePayload,
  type DocumentVersion,
} from "@/lib/services/project/projectService";

const STATUS_OPTIONS = [
  { key: "draft", label: "Draft", color: "default" as const },
  { key: "active", label: "Aktif", color: "success" as const },
  { key: "expired", label: "Expired", color: "danger" as const },
  { key: "archived", label: "Arsip", color: "warning" as const },
];

const STATUS_SELECT_OPTIONS = STATUS_OPTIONS.map(s => ({ value: s.key, label: s.label }));

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusChip(status: string) {
  const opt = STATUS_OPTIONS.find((s) => s.key === status);
  return (
    <Chip size="sm" color={opt?.color ?? "default"}>
      {opt?.label ?? status}
    </Chip>
  );
}

function getCategoryIcon(icon?: string): string {
  return icon ?? "📄";
}

// Simple pagination component
function SimplePagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center gap-1 justify-center flex-wrap">
      <Btn size="sm" variant="ghost" onClick={() => onChange(page - 1)} disabled={page <= 1}>‹</Btn>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <Btn
          key={p}
          size="sm"
          variant={p === page ? "primary" : "ghost"}
          onClick={() => onChange(p)}
        >
          {p}
        </Btn>
      ))}
      <Btn size="sm" variant="ghost" onClick={() => onChange(page + 1)} disabled={page >= total}>›</Btn>
    </div>
  );
}

export default function DocumentsPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDrag, setUploadDrag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    nm_dokumen: "",
    nomor_dokumen: "",
    id_doc_category: "",
    tgl_dokumen: "",
    tgl_berlaku: "",
    tgl_berakhir: "",
    deskripsi: "",
    status: "active",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Detail / Preview modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document_ | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Version history
  const [docVersions, setDocVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [detailTab, setDetailTab] = useState<"info" | "versions">("info");
  const [deleteDoc, setDeleteDoc] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  // Replace file modal
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceCatatan, setReplaceCatatan] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState("");

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<DocumentUpdatePayload>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const loadDocuments = useCallback(async () => {
    if (!projectId) return;
    try {
      const result = await projectService.getDocuments(projectId, {
        page,
        limit,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setDocuments(result.data ?? []);
      setTotalPages(result.meta?.total_pages ?? 1);
      setTotal(result.meta?.total ?? 0);
    } catch (e) {
      console.error("Error loading documents:", e);
      setDocuments([]);
    }
  }, [projectId, page, categoryFilter, statusFilter, searchQuery]);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [proj, cats] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getDocumentCategories(),
      ]);
      setProject(proj);
      setCategories(cats ?? []);
      await loadDocuments();
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, loadDocuments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isLoading) loadDocuments();
  }, [page, categoryFilter, statusFilter, searchQuery]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, statusFilter, searchQuery]);

  // Upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDrag(true);
  };
  const handleDragLeave = () => setUploadDrag(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadForm.nm_dokumen) {
        setUploadForm((prev) => ({
          ...prev,
          nm_dokumen: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadForm.nm_dokumen) {
        setUploadForm((prev) => ({
          ...prev,
          nm_dokumen: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadForm({
      nm_dokumen: "",
      nomor_dokumen: "",
      id_doc_category: "",
      tgl_dokumen: "",
      tgl_berlaku: "",
      tgl_berakhir: "",
      deskripsi: "",
      status: "active",
    });
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError("Pilih file terlebih dahulu");
      return;
    }
    if (!uploadForm.nm_dokumen.trim()) {
      setUploadError("Nama dokumen wajib diisi");
      return;
    }
    if (!uploadForm.id_doc_category) {
      setUploadError("Kategori wajib dipilih");
      return;
    }
    setIsUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("nm_dokumen", uploadForm.nm_dokumen.trim());
      formData.append("id_doc_category", uploadForm.id_doc_category);
      formData.append("status", uploadForm.status);
      if (uploadForm.nomor_dokumen) formData.append("nomor_dokumen", uploadForm.nomor_dokumen);
      if (uploadForm.tgl_dokumen) formData.append("tgl_dokumen", uploadForm.tgl_dokumen);
      if (uploadForm.tgl_berlaku) formData.append("tgl_berlaku", uploadForm.tgl_berlaku);
      if (uploadForm.tgl_berakhir) formData.append("tgl_berakhir", uploadForm.tgl_berakhir);
      if (uploadForm.deskripsi) formData.append("deskripsi", uploadForm.deskripsi);

      await projectService.uploadDocument(projectId, formData);
      setUploadModalOpen(false);
      resetUploadForm();
      await loadDocuments();
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Gagal upload dokumen");
    } finally {
      setIsUploading(false);
    }
  };

  // Detail handler
  const handleViewDetail = async (docId: string) => {
    setIsLoadingDetail(true);
    setDetailTab("info");
    setDocVersions([]);
    setDetailModalOpen(true);
    try {
      const doc = await projectService.getDocument(docId);
      setSelectedDoc(doc);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleLoadVersions = async (docId: string) => {
    setIsLoadingVersions(true);
    try {
      const versions = await projectService.getDocumentVersions(docId);
      setDocVersions(versions);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleOpenReplace = () => {
    setReplaceFile(null);
    setReplaceCatatan("");
    setReplaceError("");
    setReplaceModalOpen(true);
  };

  const handleReplace = async () => {
    if (!replaceFile || !selectedDoc) {
      setReplaceError("Pilih file terlebih dahulu");
      return;
    }
    setIsReplacing(true);
    setReplaceError("");
    try {
      const formData = new FormData();
      formData.append("file", replaceFile);
      if (replaceCatatan) formData.append("catatan", replaceCatatan);
      const updated = await projectService.replaceDocumentFile(selectedDoc.id_document, formData);
      setSelectedDoc(updated);
      setReplaceModalOpen(false);
      setReplaceFile(null);
      setReplaceCatatan("");
      // Refresh versions list if on versions tab
      if (detailTab === "versions") {
        await handleLoadVersions(updated.id_document);
      }
      await loadDocuments();
    } catch (e) {
      setReplaceError(e instanceof Error ? e.message : "Gagal mengganti file");
    } finally {
      setIsReplacing(false);
    }
  };

  // Edit handler
  const handleOpenEdit = async (docId: string) => {
    setIsLoadingDetail(true);
    setEditModalOpen(true);
    try {
      const doc = await projectService.getDocument(docId);
      setSelectedDoc(doc);
      setEditForm({
        id_doc_category: doc.id_doc_category,
        nm_dokumen: doc.nm_dokumen,
        nomor_dokumen: doc.nomor_dokumen ?? "",
        tgl_dokumen: doc.tgl_dokumen?.split("T")[0] ?? "",
        tgl_berlaku: doc.tgl_berlaku?.split("T")[0] ?? "",
        tgl_berakhir: doc.tgl_berakhir?.split("T")[0] ?? "",
        deskripsi: doc.deskripsi ?? "",
        status: doc.status,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedDoc) return;
    setIsEditing(true);
    setEditError("");
    try {
      await projectService.updateDocument(selectedDoc.id_document, editForm);
      setEditModalOpen(false);
      await loadDocuments();
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Gagal update dokumen");
    } finally {
      setIsEditing(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteDoc) return;
    setDeleteLoading(true);
    try {
      await projectService.deleteDocument(deleteDoc.id);
      await loadDocuments();
      toast(`Dokumen "${deleteDoc.name}" dihapus`, "success");
    } catch (e) {
      console.error(e);
      toast("Gagal menghapus dokumen", "error");
    } finally {
      setDeleteLoading(false);
      setDeleteDoc(null);
    }
  };

  // Download
  const handleDownload = (docId: string) => {
    const url = projectService.getDocumentDownloadUrl(docId);
    window.open(url, "_blank");
  };

  const categorySelectOptions = [
    { value: "", label: "Semua Kategori" },
    ...categories.map(cat => ({
      value: cat.id_doc_category,
      label: cat.icon ? `${cat.icon} ${cat.nm_kategori}` : cat.nm_kategori,
    })),
  ];

  const categoryFormOptions = categories.map(cat => ({
    value: cat.id_doc_category,
    label: cat.icon ? `${cat.icon} ${cat.nm_kategori}` : cat.nm_kategori,
  }));

  const statusSelectOptions = [
    { value: "", label: "Semua Status" },
    ...STATUS_SELECT_OPTIONS,
  ];

  if (isLoading) {
    return (
        <>
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        </>
);
  }

  return (
      <>
        <div className="space-y-4">
          {/* Header handled by layout tabs */}

          {/* Header + Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiFileText className="w-5 h-5 text-[#0B5EA8]" />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Dokumen</h1>
              <span className="text-sm text-gray-400">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-[#0B5EA8] text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-[#0B5EA8] text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
              <Btn
                size="sm"
                variant="primary"
                startContent={<FiPlus className="w-3.5 h-3.5" />}
                onClick={() => {
                  resetUploadForm();
                  setUploadModalOpen(true);
                }}
              >
                Upload Dokumen
              </Btn>
            </div>
          </div>

          {/* Quick Stats — only show when there are documents */}
          {total > 0 && (() => {
            const todayD = new Date(); todayD.setHours(0,0,0,0);
            const in30 = new Date(todayD); in30.setDate(in30.getDate() + 30);
            const allDocs = documents;
            const totalDocs = total; // server total
            const activeDocs = allDocs.filter(d => d.status === 'active').length;
            const expiredDocsList = allDocs.filter(d => {
              if (!d.tgl_berakhir) return false;
              const exp = new Date(d.tgl_berakhir); exp.setHours(0,0,0,0);
              return exp < todayD;
            });
            const expiringSoonList = allDocs.filter(d => {
              if (!d.tgl_berakhir) return false;
              const exp = new Date(d.tgl_berakhir); exp.setHours(0,0,0,0);
              return exp >= todayD && exp <= in30;
            });
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
                  <CardBody className="p-4 text-center">
                    <div className="flex justify-center mb-1">
                      <FiFileText className="w-4 h-4 text-gray-500" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDocs}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Dokumen</p>
                  </CardBody>
                </Card>
                <Card className="border border-emerald-200 dark:border-emerald-800 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20">
                  <CardBody className="p-4 text-center">
                    <div className="flex justify-center mb-1">
                      <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeDocs}</p>
                    <p className="text-xs text-emerald-600 mt-1">Aktif</p>
                  </CardBody>
                </Card>
                <Card className={`border shadow-sm ${expiredDocsList.length > 0 ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <CardBody className="p-4 text-center">
                    <div className="flex justify-center mb-1">
                      <FiAlertTriangle className={`w-4 h-4 ${expiredDocsList.length > 0 ? "text-red-600" : "text-gray-400"}`} />
                    </div>
                    <p className={`text-2xl font-bold ${expiredDocsList.length > 0 ? "text-red-700 dark:text-red-400" : "text-gray-400"}`}>{expiredDocsList.length}</p>
                    <p className={`text-xs mt-1 ${expiredDocsList.length > 0 ? "text-red-600 dark:text-red-500" : "text-gray-400"}`}>Expired</p>
                  </CardBody>
                </Card>
                <Card className={`border shadow-sm ${expiringSoonList.length > 0 ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20" : "border-gray-200 dark:border-gray-700"}`}>
                  <CardBody className="p-4 text-center">
                    <div className="flex justify-center mb-1">
                      <FiClock className={`w-4 h-4 ${expiringSoonList.length > 0 ? "text-amber-600" : "text-gray-400"}`} />
                    </div>
                    <p className={`text-2xl font-bold ${expiringSoonList.length > 0 ? "text-amber-700 dark:text-amber-400" : "text-gray-400"}`}>{expiringSoonList.length}</p>
                    <p className={`text-xs mt-1 ${expiringSoonList.length > 0 ? "text-amber-600 dark:text-amber-500" : "text-gray-400"}`}>Berakhir &lt;30 hari</p>
                  </CardBody>
                </Card>
              </div>
            );
          })()}

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <TwInput
              inputSize="sm"
              placeholder="Cari dokumen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<FiSearch className="w-4 h-4 text-gray-400" />}
              className="w-48 shrink-0"
            />
            <TwSelect
              selectSize="sm"
              placeholder="Semua Kategori"
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v ?? "")}
              options={categorySelectOptions}
              className="w-44 shrink-0"
            />
            <TwSelect
              selectSize="sm"
              placeholder="Semua Status"
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v ?? "")}
              options={statusSelectOptions}
              className="w-36 shrink-0"
            />
            {(categoryFilter || statusFilter || searchQuery) && (
              <Btn
                size="sm"
                variant="flat"
                onClick={() => {
                  setCategoryFilter("");
                  setStatusFilter("");
                  setSearchQuery("");
                }}
              >
                Reset Filter
              </Btn>
            )}
          </div>

          {/* Document Grid / List */}
          {documents.length === 0 ? (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardBody className="py-16 text-center">
                <FiFile className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">Belum ada dokumen</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Klik &quot;Upload Dokumen&quot; untuk menambahkan
                </p>
              </CardBody>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <Card
                  key={doc.id_document}
                  className="border border-gray-200 dark:border-gray-700 hover:border-[#0B5EA8]/50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetail(doc.id_document)}
                >
                  <CardBody className="p-4 space-y-3">
                    {/* Icon + Category */}
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">
                        {getCategoryIcon(doc.kategori_icon)}
                      </span>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {doc.version_number && doc.version_number > 1 && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
                            v{doc.version_number}
                          </span>
                        )}
                        {getStatusChip(doc.status)}
                      </div>
                    </div>
                    {/* Name */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {doc.nm_dokumen}
                      </p>
                      {doc.nomor_dokumen && (
                        <p className="text-xs text-gray-400 mt-0.5">{doc.nomor_dokumen}</p>
                      )}
                    </div>
                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{formatDate(doc.tgl_dokumen || doc.created_at)}</span>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                      <Btn
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc.id_document);
                        }}
                        title="Download"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                      </Btn>
                      <Btn
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(doc.id_document);
                        }}
                        title="Edit"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                      </Btn>
                      <Btn
                        size="sm"
                        variant="ghost"
                        isIconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteDoc({ id: doc.id_document, name: doc.nm_dokumen });
                        }}
                        title="Hapus"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </Btn>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardBody className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-x-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id_document}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors min-w-0"
                      onClick={() => handleViewDetail(doc.id_document)}
                    >
                      <span className="text-xl flex-shrink-0">
                        {getCategoryIcon(doc.kategori_icon)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.nm_dokumen}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                          {doc.nomor_dokumen && <span>{doc.nomor_dokumen}</span>}
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{formatDate(doc.tgl_dokumen || doc.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">{getStatusChip(doc.status)}</div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Btn
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          onClick={(e) => { e.stopPropagation(); handleDownload(doc.id_document); }}
                        >
                          <FiDownload className="w-3.5 h-3.5" />
                        </Btn>
                        <Btn
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(doc.id_document); }}
                        >
                          <FiEdit className="w-3.5 h-3.5" />
                        </Btn>
                        <Btn
                          size="sm"
                          variant="ghost"
                          isIconOnly
                          onClick={(e) => { e.stopPropagation(); setDeleteDoc({ id: doc.id_document, name: doc.nm_dokumen }); }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <SimplePagination total={totalPages} page={page} onChange={setPage} />
            </div>
          )}
        </div>

        {/* ===== UPLOAD MODAL ===== */}
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => { setUploadModalOpen(false); resetUploadForm(); }}
          size="2xl"
        >
          <ModalHeader className="flex items-center gap-2">
            <FiUploadCloud className="w-5 h-5 text-[#0B5EA8]" />
            Upload Dokumen
          </ModalHeader>
          <ModalBody className="space-y-4">
            {uploadError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {uploadError}
              </div>
            )}

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-colors ${
                uploadDrag
                  ? "border-[#0B5EA8] bg-blue-50 dark:bg-blue-950/20"
                  : uploadFile
                  ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-[#0B5EA8]/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar,.txt,.csv"
              />
              {uploadFile ? (
                <div className="space-y-2">
                  <FiFile className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {uploadFile.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadFile.size)}</p>
                  <Btn
                    size="sm"
                    variant="flat"
                    startContent={<FiX className="w-3 h-3" />}
                    onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                  >
                    Ganti File
                  </Btn>
                </div>
              ) : (
                <div className="space-y-2">
                  <FiUploadCloud className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-[#0B5EA8]">Klik untuk memilih</span>{" "}
                    atau drag & drop file
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, XLS, PPT, gambar, ZIP (maks 50MB)
                  </p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TwInput
                inputSize="sm"
                label="Nama Dokumen"
                required
                value={uploadForm.nm_dokumen}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, nm_dokumen: v }))}
                className="sm:col-span-2"
              />
              <TwInput
                inputSize="sm"
                label="Nomor Dokumen"
                placeholder="SK/123/UN26/2026"
                value={uploadForm.nomor_dokumen}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, nomor_dokumen: v }))}
              />
              <TwSelect
                selectSize="sm"
                label="Kategori"
                value={uploadForm.id_doc_category}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, id_doc_category: v ?? "" }))}
                options={categoryFormOptions}
                placeholder="Pilih Kategori"
              />
              <TwInput
                inputSize="sm"
                label="Tanggal Dokumen"
                type="date"
                value={uploadForm.tgl_dokumen}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, tgl_dokumen: v }))}
              />
              <TwSelect
                selectSize="sm"
                label="Status"
                value={uploadForm.status}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, status: v ?? "active" }))}
                options={STATUS_SELECT_OPTIONS}
              />
              <TwInput
                inputSize="sm"
                label="Berlaku Sejak"
                type="date"
                value={uploadForm.tgl_berlaku}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, tgl_berlaku: v }))}
              />
              <TwInput
                inputSize="sm"
                label="Berakhir"
                type="date"
                value={uploadForm.tgl_berakhir}
                onValueChange={(v) => setUploadForm((p) => ({ ...p, tgl_berakhir: v }))}
              />
            </div>
            <TwTextarea
              label="Deskripsi"
              placeholder="Keterangan dokumen (opsional)"
              value={uploadForm.deskripsi}
              onValueChange={(v) => setUploadForm((p) => ({ ...p, deskripsi: v }))}
              rows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Btn variant="ghost" onClick={() => { setUploadModalOpen(false); resetUploadForm(); }} size="sm">
              Batal
            </Btn>
            <Btn
              variant="primary"
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={!uploadFile}
              size="sm"
            >
              Upload
            </Btn>
          </ModalFooter>
        </Modal>

        {/* ===== DETAIL / PREVIEW MODAL ===== */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedDoc(null);
            setDocVersions([]);
            setDetailTab("info");
          }}
          size="3xl"
        >
          {isLoadingDetail || !selectedDoc ? (
            <ModalBody className="py-16 flex justify-center">
              <Spinner size="lg" />
            </ModalBody>
          ) : (
            <>
              <ModalHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FiEye className="w-4 h-4 text-[#0B5EA8]" />
                  <span>Detail Dokumen</span>
                  {selectedDoc.version_number && selectedDoc.version_number > 1 && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                      v{selectedDoc.version_number}
                    </span>
                  )}
                </div>
                <Btn
                  size="sm"
                  variant="flat"
                  startContent={<FiRefreshCw className="w-3.5 h-3.5" />}
                  onClick={handleOpenReplace}
                  className="text-amber-600"
                >
                  Ganti File
                </Btn>
              </ModalHeader>

              {/* Tabs */}
              <div className="px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-4 overflow-x-auto">
                  <button
                    onClick={() => setDetailTab("info")}
                    className={`text-sm pb-2 border-b-2 transition-colors whitespace-nowrap ${
                      detailTab === "info"
                        ? "border-[#0B5EA8] text-[#0B5EA8] font-medium"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Info
                  </button>
                  <button
                    onClick={() => {
                      setDetailTab("versions");
                      if (docVersions.length === 0) {
                        handleLoadVersions(selectedDoc.id_document);
                      }
                    }}
                    className={`text-sm pb-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      detailTab === "versions"
                        ? "border-[#0B5EA8] text-[#0B5EA8] font-medium"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FiGitBranch className="w-3.5 h-3.5" />
                    Riwayat Versi
                  </button>
                </div>
              </div>

              <ModalBody className="space-y-4">
                {detailTab === "info" ? (
                  <>
                    {/* Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Nama Dokumen</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedDoc.nm_dokumen}
                        </p>
                      </div>
                      {selectedDoc.nomor_dokumen && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Nomor</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedDoc.nomor_dokumen}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Status</p>
                        {getStatusChip(selectedDoc.status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">File</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {selectedDoc.file_name} ({formatFileSize(selectedDoc.file_size)})
                        </p>
                      </div>
                      {selectedDoc.tgl_dokumen && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Tanggal Dokumen</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(selectedDoc.tgl_dokumen)}
                          </p>
                        </div>
                      )}
                      {selectedDoc.tgl_berakhir && (
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Berlaku s/d</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {formatDate(selectedDoc.tgl_berakhir)}
                          </p>
                        </div>
                      )}
                    </div>

                    {selectedDoc.deskripsi && (
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">Deskripsi</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {selectedDoc.deskripsi}
                        </p>
                      </div>
                    )}

                    {/* PDF Preview */}
                    {selectedDoc.mime_type === "application/pdf" && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <iframe
                          src={projectService.getDocumentDownloadUrl(selectedDoc.id_document)}
                          className="w-full h-[400px] sm:h-[500px]"
                          title="PDF Preview"
                        />
                      </div>
                    )}
                  </>
                ) : (
                  /* Version History Tab */
                  <div className="space-y-2">
                    {isLoadingVersions ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="md" />
                      </div>
                    ) : docVersions.length === 0 ? (
                      <div className="text-center py-10">
                        <FiGitBranch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">Belum ada riwayat versi</p>
                        <p className="text-xs text-gray-400 mt-1">Versi lama akan muncul di sini setelah file diganti</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {docVersions.map((v) => (
                          <div key={v.id_version} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">v{v.version_number}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{v.file_name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                                <span>{formatFileSize(v.file_size)}</span>
                                <span>·</span>
                                <span>{formatDate(v.created_at)}</span>
                                {v.catatan && (
                                  <>
                                    <span>·</span>
                                    <span className="italic text-gray-500">{v.catatan}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <a
                              href={projectService.getDocumentDownloadUrl(selectedDoc.id_document) + `?version=${v.version_number}`}
                              title="Download versi ini"
                              className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FiDownload className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Btn
                  variant="flat"
                  startContent={<FiDownload className="w-4 h-4" />}
                  onClick={() => handleDownload(selectedDoc.id_document)}
                  size="sm"
                >
                  Download
                </Btn>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedDoc(null);
                    setDocVersions([]);
                    setDetailTab("info");
                  }}
                  size="sm"
                >
                  Tutup
                </Btn>
              </ModalFooter>
            </>
          )}
        </Modal>

        {/* ===== REPLACE FILE MODAL ===== */}
        <Modal
          isOpen={replaceModalOpen}
          onClose={() => {
            setReplaceModalOpen(false);
            setReplaceFile(null);
            setReplaceCatatan("");
            setReplaceError("");
          }}
          size="md"
        >
          <ModalHeader className="flex items-center gap-2">
            <FiRefreshCw className="w-4 h-4 text-amber-500" />
            Ganti File Dokumen
          </ModalHeader>
          <ModalBody className="space-y-3">
            {replaceError && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                {replaceError}
              </div>
            )}
            {selectedDoc && (
              <div className="text-sm bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="font-medium text-amber-700 dark:text-amber-400">File saat ini:</p>
                <p className="text-amber-600 dark:text-amber-500 mt-0.5">{selectedDoc.file_name} ({formatFileSize(selectedDoc.file_size)})</p>
                <p className="text-xs text-amber-500 mt-1">File lama akan disimpan sebagai versi sebelumnya.</p>
              </div>
            )}
            <div
              onClick={() => replaceFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                replaceFile
                  ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-[#0B5EA8]/50"
              }`}
            >
              <input
                ref={replaceFileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setReplaceFile(file);
                }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar,.txt,.csv"
              />
              {replaceFile ? (
                <div className="space-y-1">
                  <FiFile className="w-7 h-7 mx-auto text-green-500" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{replaceFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(replaceFile.size)}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <FiUploadCloud className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-[#0B5EA8]">Klik</span> untuk memilih file baru
                  </p>
                </div>
              )}
            </div>
            <TwTextarea
              label="Catatan perubahan (opsional)"
              placeholder="Contoh: Update sesuai revisi rapat 18 Maret 2026"
              value={replaceCatatan}
              onValueChange={setReplaceCatatan}
              rows={2}
            />
          </ModalBody>
          <ModalFooter>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplaceModalOpen(false);
                setReplaceFile(null);
                setReplaceCatatan("");
              }}
            >
              Batal
            </Btn>
            <Btn
              variant="flat"
              size="sm"
              isLoading={isReplacing}
              disabled={!replaceFile}
              onClick={handleReplace}
              className="bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              Ganti File
            </Btn>
          </ModalFooter>
        </Modal>

        {/* ===== EDIT MODAL ===== */}
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedDoc(null);
            setEditError("");
          }}
          size="lg"
        >
          {isLoadingDetail || !selectedDoc ? (
            <ModalBody className="py-16 flex justify-center">
              <Spinner size="lg" />
            </ModalBody>
          ) : (
            <>
              <ModalHeader className="flex items-center gap-2">
                <FiEdit className="w-4 h-4 text-[#0B5EA8]" />
                Edit Dokumen
              </ModalHeader>
              <ModalBody className="space-y-3">
                {editError && (
                  <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    {editError}
                  </div>
                )}
                <TwInput
                  inputSize="sm"
                  label="Nama Dokumen"
                  value={editForm.nm_dokumen ?? ""}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, nm_dokumen: v }))}
                />
                <TwInput
                  inputSize="sm"
                  label="Nomor Dokumen"
                  value={editForm.nomor_dokumen ?? ""}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, nomor_dokumen: v }))}
                />
                <TwSelect
                  selectSize="sm"
                  label="Kategori"
                  value={editForm.id_doc_category ?? ""}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, id_doc_category: v }))}
                  options={categoryFormOptions}
                  placeholder="Pilih Kategori"
                />
                <TwSelect
                  selectSize="sm"
                  label="Status"
                  value={editForm.status ?? ""}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, status: v }))}
                  options={STATUS_SELECT_OPTIONS}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <TwInput
                    inputSize="sm"
                    label="Tanggal Dokumen"
                    type="date"
                    value={editForm.tgl_dokumen ?? ""}
                    onValueChange={(v) => setEditForm((p) => ({ ...p, tgl_dokumen: v }))}
                  />
                  <TwInput
                    inputSize="sm"
                    label="Berlaku Sejak"
                    type="date"
                    value={editForm.tgl_berlaku ?? ""}
                    onValueChange={(v) => setEditForm((p) => ({ ...p, tgl_berlaku: v }))}
                  />
                  <TwInput
                    inputSize="sm"
                    label="Berakhir"
                    type="date"
                    value={editForm.tgl_berakhir ?? ""}
                    onValueChange={(v) => setEditForm((p) => ({ ...p, tgl_berakhir: v }))}
                  />
                </div>
                <TwTextarea
                  label="Deskripsi"
                  value={editForm.deskripsi ?? ""}
                  onValueChange={(v) => setEditForm((p) => ({ ...p, deskripsi: v }))}
                  rows={2}
                />
              </ModalBody>
              <ModalFooter>
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedDoc(null);
                  }}
                  size="sm"
                >
                  Batal
                </Btn>
                <Btn
                  variant="primary"
                  onClick={handleUpdate}
                  isLoading={isEditing}
                  size="sm"
                >
                  Simpan
                </Btn>
              </ModalFooter>
            </>
          )}
        </Modal>

        <ConfirmDialog
          isOpen={!!deleteDoc}
          onClose={() => setDeleteDoc(null)}
          onConfirm={handleDelete}
          title="Hapus Dokumen"
          message={`Yakin hapus dokumen "${deleteDoc?.name}"? File akan dihapus permanen.`}
          confirmText="Hapus"
          variant="danger"
          isLoading={deleteLoading}
        />
      </>
);
}
