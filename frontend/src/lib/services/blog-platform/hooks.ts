/**
 * TanStack Query hooks untuk blog-platform.
 * Pakai existing QueryClient yang sudah di-set di providers.tsx.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kategoriService } from "./kategoriService";
import { tagService } from "./tagService";
import { postService, type ListPostsParams } from "./postService";
import { blogService, type ListBlogsParams } from "./blogService";
import {
  adminKategoriService, adminTagService, adminPostService, adminBlogService,
  type KategoriUpsertInput, type TagUpsertInput, type PostCurationInput, type BlogFlagsInput,
} from "./adminService";
import {
  meBlogService, mePostService,
  type CreatePostInput, type UpdatePostInput, type UpdateBlogProfileInput,
} from "./meService";
import {
  subdomainService,
  type ClaimInput,
} from "./subdomainService";
import {
  meKomentarService,
  type ModerationStatus,
} from "./komentarService";
import { meFollowerService } from "./followerService";
import { meBookmarkService } from "./bookmarkService";
import { meMediaService, type JenisMedia, type UpdateMediaMetaInput } from "./mediaService";
import { meSeriesService, type CreateSeriesInput, type UpdateSeriesInput } from "./seriesService";
import { meNotifService, type NotifType } from "./notifService";
import { adminLaporanService, type LaporanStatus, type ModerateInput } from "./laporanService";
import { adminReservedWordsService, type KataKategori, type UpsertKataInput } from "./reservedWordsService";
import { adminTemplateThemeService, templateThemeService, type UpsertTemplateInput } from "./templateThemeService";
import { adminAuditService, type AuditListParams } from "./auditAdminService";
import { adminStatsService } from "./adminStatsService";
import { adminKlaimService, type KlaimStatus, type KlaimModerateInput } from "./klaimService";

// =================== Kategori ===================

export function useKategoriList(aktifOnly = true) {
  return useQuery({
    queryKey: ["blog", "kategori", { aktifOnly }],
    queryFn: () => kategoriService.list(aktifOnly),
    staleTime: 5 * 60_000, // 5 min — kategori rarely change
  });
}

// =================== Tag ===================

export function useTagList(opts: { aktifOnly?: boolean; limit?: number } = {}) {
  return useQuery({
    queryKey: ["blog", "tag", opts],
    queryFn: () => tagService.list(opts),
    staleTime: 60_000,
  });
}

// =================== Post ===================

export function usePostList(params: ListPostsParams = {}) {
  return useQuery({
    queryKey: ["blog", "post", "list", params],
    queryFn: () => postService.list(params),
    staleTime: 30_000,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["blog", "post", "id", id],
    queryFn: () => postService.getByID(id),
    enabled: !!id,
  });
}

export function usePostBySlug(subdomain: string, slug: string) {
  return useQuery({
    queryKey: ["blog", "post", "slug", subdomain, slug],
    queryFn: () => postService.getBySlug(subdomain, slug),
    enabled: !!subdomain && !!slug,
  });
}

export function usePostStatusCount(idBlog: string) {
  return useQuery({
    queryKey: ["blog", "post", "status-count", idBlog],
    queryFn: () => postService.statusCount(idBlog),
    enabled: !!idBlog,
    staleTime: 60_000,
  });
}

// =================== Blog ===================

export function useBlogList(params: ListBlogsParams = {}) {
  return useQuery({
    queryKey: ["blog", "blog", "list", params],
    queryFn: () => blogService.list(params),
    staleTime: 60_000,
  });
}

export function useBlogBySubdomain(subdomain: string) {
  return useQuery({
    queryKey: ["blog", "blog", "subdomain", subdomain],
    queryFn: () => blogService.getBySubdomain(subdomain),
    enabled: !!subdomain,
  });
}

// =================== Admin Mutations ===================

export function useCreateKategori() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: KategoriUpsertInput) => adminKategoriService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "kategori"] }),
  });
}

export function useUpdateKategori() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: KategoriUpsertInput }) =>
      adminKategoriService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "kategori"] }),
  });
}

export function useToggleKategoriAktif() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminKategoriService.toggleAktif(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "kategori"] }),
  });
}

export function useDeleteKategori() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminKategoriService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "kategori"] }),
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TagUpsertInput) => adminTagService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "tag"] }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TagUpsertInput }) =>
      adminTagService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "tag"] }),
  });
}

export function useAdminSetBlogFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BlogFlagsInput }) =>
      adminBlogService.setFlags(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "blog"] });
    },
  });
}

export function useCuratePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PostCurationInput }) =>
      adminPostService.setCuration(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminTagService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "tag"] }),
  });
}

// =================== Me (authenticated owner) ===================

export function useMyBlog() {
  return useQuery({
    queryKey: ["blog", "me", "blog"],
    queryFn: () => meBlogService.getMine(),
    staleTime: 60_000,
    retry: false, // jangan retry kalau 401 / 404 (no blog yet)
  });
}

export function useUpdateMyBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBlogProfileInput) => meBlogService.updateMine(input),
    onSuccess: (blog) => {
      qc.setQueryData(["blog", "me", "blog"], blog);
      qc.invalidateQueries({ queryKey: ["blog", "me"] });
    },
  });
}

export function useAnalyticsViews(days = 30, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "analytics", "views", days],
    queryFn: () => meBlogService.analyticsViews(days),
    enabled,
    staleTime: 5 * 60_000, // 5 min cache
  });
}

export function useAnalyticsSummary(days = 30, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "analytics", "summary", days],
    queryFn: () => meBlogService.analyticsSummary(days),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useFeed(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["blog", "me", "feed", limit, offset],
    queryFn: () => meBlogService.feed(limit, offset),
    staleTime: 60_000,
  });
}

// =================== Media Library ===================

export function useMediaList(jenis?: JenisMedia, limit = 30, offset = 0) {
  return useQuery({
    queryKey: ["blog", "me", "media", { jenis, limit, offset }],
    queryFn: () => meMediaService.list(jenis, limit, offset),
    staleTime: 30_000,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, altText }: { file: File; altText?: string }) =>
      meMediaService.upload(file, altText),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "media"] }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idMedia: string) => meMediaService.delete(idMedia),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "media"] }),
  });
}

export function useUpdateMediaMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMediaMetaInput }) =>
      meMediaService.updateMeta(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "media"] }),
  });
}

export function useAuditLog(limit = 20, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "audit", limit],
    queryFn: () => meBlogService.auditList(limit),
    enabled,
    staleTime: 30_000,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePostInput) => mePostService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
      qc.invalidateQueries({ queryKey: ["blog", "me"] });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePostInput }) =>
      mePostService.update(id, input),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
      // Update cached individual post detail
      qc.setQueryData(["blog", "post", "id", post.id_post], post);
    },
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mePostService.publish(id),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
      qc.setQueryData(["blog", "post", "id", post.id_post], post);
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mePostService.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
    },
  });
}

export function usePostRevisions(idPost: string, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "post", idPost, "revisions"],
    queryFn: () => mePostService.listRevisions(idPost),
    enabled: enabled && !!idPost,
    staleTime: 30_000,
  });
}

export function usePostRevision(idPost: string, nomor: number | null) {
  return useQuery({
    queryKey: ["blog", "me", "post", idPost, "revisions", nomor],
    queryFn: () => mePostService.getRevision(idPost, nomor!),
    enabled: !!idPost && nomor !== null,
    staleTime: 5 * 60_000, // immutable snapshot — long cache
  });
}

export function usePostAnalytics(idPost: string, days = 30, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "post", idPost, "analytics", days],
    queryFn: () => mePostService.analytics(idPost, days),
    enabled: enabled && !!idPost,
    staleTime: 60_000,
  });
}

export function useTrashList(limit = 20, offset = 0, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "post", "trash", limit, offset],
    queryFn: () => mePostService.listTrash(limit, offset),
    enabled,
    staleTime: 15_000,
  });
}

export function useRestorePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idPost: string) => mePostService.restore(idPost),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "post", "trash"] });
    },
  });
}

export function usePermanentDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idPost: string) => mePostService.permanentDelete(idPost),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "post", "trash"] });
    },
  });
}

// =================== Subdomain claim flow ===================

export function useSubdomainOptions(enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "subdomain", "options"],
    queryFn: () => subdomainService.getOptions(),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
}

export function useCheckSubdomain() {
  return useMutation({
    mutationFn: (subdomain: string) => subdomainService.check(subdomain),
  });
}

// =================== Komentar (moderation) ===================

export function useKomentarList(status: ModerationStatus = "pending", enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "komentar", status],
    queryFn: () => meKomentarService.list(status),
    enabled,
    staleTime: 10_000,
  });
}

export function useFollowerList(limit = 50, offset = 0, enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "followers", limit, offset],
    queryFn: () => meFollowerService.list(limit, offset),
    enabled,
    staleTime: 30_000,
  });
}

// =================== Bookmark (Reading list) ===================

export function useBookmarkList(label?: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["blog", "me", "bookmarks", { label, limit, offset }],
    queryFn: () => meBookmarkService.list(label, limit, offset),
    staleTime: 30_000,
  });
}

export function useBookmarkLabels() {
  return useQuery({
    queryKey: ["blog", "me", "bookmarks", "labels"],
    queryFn: () => meBookmarkService.listLabels(),
    staleTime: 60_000,
  });
}

export function useUpdateBookmarkLabel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string | null }) =>
      meBookmarkService.updateLabel(id, label),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "bookmarks"] }),
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idBookmark: string) => meBookmarkService.remove(idBookmark),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "bookmarks"] }),
  });
}

// =================== Notif ===================

// useNotifList — paginated list. onlyUnread filter di server.
export function useNotifList(onlyUnread = false, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["blog", "me", "notifications", { onlyUnread, limit, offset }],
    queryFn: () => meNotifService.list(onlyUnread, limit, offset),
    staleTime: 15_000,
  });
}

// useUnreadNotifCount — polling 30s untuk bell badge. Lightweight COUNT query.
export function useUnreadNotifCount(enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "notifications", "unread-count"],
    queryFn: () => meNotifService.unreadCount(),
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useMarkNotifRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idNotif: string) => meNotifService.markRead(idNotif),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "notifications"] }),
  });
}

export function useMarkAllNotifRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => meNotifService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "notifications"] }),
  });
}

export function useNotifPreferences() {
  return useQuery({
    queryKey: ["blog", "me", "notifications", "preferences"],
    queryFn: () => meNotifService.getPreferences(),
    staleTime: 60_000,
  });
}

export function useUpdateNotifPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mutedTipes: NotifType[]) => meNotifService.setPreferences(mutedTipes),
    onSuccess: (data) => {
      qc.setQueryData(["blog", "me", "notifications", "preferences"], data);
    },
  });
}

// =================== Admin Laporan ===================

export function useLaporanList(status?: LaporanStatus, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["blog", "admin", "laporan", { status, limit, offset }],
    queryFn: () => adminLaporanService.list(status, limit, offset),
    staleTime: 15_000,
  });
}

export function useModerateLaporan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ModerateInput }) =>
      adminLaporanService.moderate(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "laporan"] }),
  });
}

// =================== Admin Reserved Words ===================

export function useReservedWordsList(params: {
  kategori?: KataKategori; search?: string; limit?: number; offset?: number;
} = {}) {
  return useQuery({
    queryKey: ["blog", "admin", "kata-terlarang", params],
    queryFn: () => adminReservedWordsService.list(params),
    staleTime: 30_000,
  });
}

export function useCreateReservedWord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertKataInput) => adminReservedWordsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "kata-terlarang"] }),
  });
}

export function useUpdateReservedWord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpsertKataInput }) =>
      adminReservedWordsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "kata-terlarang"] }),
  });
}

export function useDeleteReservedWord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminReservedWordsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "kata-terlarang"] }),
  });
}

// =================== Admin Template Theme ===================

export function useTemplateThemeList() {
  return useQuery({
    queryKey: ["blog", "admin", "template-theme"],
    queryFn: () => adminTemplateThemeService.list(),
    staleTime: 60_000,
  });
}

// Public list (aktif only) — buat author Settings → Theme pick preset.
export function usePublicTemplateThemeList() {
  return useQuery({
    queryKey: ["blog", "template-theme", "public"],
    queryFn: () => templateThemeService.listPublic(),
    staleTime: 5 * 60_000, // template jarang berubah
  });
}

export function useCreateTemplateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpsertTemplateInput) => adminTemplateThemeService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "template-theme"] }),
  });
}

export function useUpdateTemplateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpsertTemplateInput }) =>
      adminTemplateThemeService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "template-theme"] }),
  });
}

export function useSetDefaultTemplateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminTemplateThemeService.setDefault(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "template-theme"] }),
  });
}

export function useDeleteTemplateTheme() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminTemplateThemeService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "template-theme"] }),
  });
}

// =================== Admin Audit Log ===================

export function useAdminAuditList(params: AuditListParams = {}) {
  return useQuery({
    queryKey: ["blog", "admin", "audit", params],
    queryFn: () => adminAuditService.list(params),
    staleTime: 15_000,
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["blog", "admin", "stats"],
    queryFn: () => adminStatsService.get(),
    staleTime: 60_000,
  });
}

// =================== Admin Klaim Subdomain ===================

export function useAdminKlaimList(status?: KlaimStatus, limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["blog", "admin", "klaim", { status, limit, offset }],
    queryFn: () => adminKlaimService.list(status, limit, offset),
    staleTime: 30_000,
  });
}

export function useModerateKlaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: KlaimModerateInput }) =>
      adminKlaimService.moderate(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "klaim"] }),
  });
}

export function useModerateKomentar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModerationStatus }) =>
      meKomentarService.moderate(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] });
    },
  });
}

export function useModerateKomentarBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: ModerationStatus }) =>
      meKomentarService.moderateBulk(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] });
    },
  });
}

export function useToggleKomentarPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meKomentarService.togglePin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] }),
  });
}

export function useKomentarTrash(enabled = true) {
  return useQuery({
    queryKey: ["blog", "me", "komentar", "trash"],
    queryFn: () => meKomentarService.listTrash(),
    enabled,
    staleTime: 15_000,
  });
}

export function useSoftDeleteKomentar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meKomentarService.softDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] }),
  });
}

export function useRestoreKomentar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meKomentarService.restore(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] }),
  });
}

export function usePermanentDeleteKomentar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meKomentarService.permanentDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] }),
  });
}

export function useClaimSubdomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ClaimInput) => subdomainService.claim(input),
    onSuccess: () => {
      // After claim, invalidate /me/blog supaya dashboard pickup blog baru
      qc.invalidateQueries({ queryKey: ["blog", "me"] });
      qc.invalidateQueries({ queryKey: ["blog", "blog"] });
    },
  });
}

// =================== Series ===================

export function useSeriesList(activeOnly = false) {
  return useQuery({
    queryKey: ["blog", "me", "series", { activeOnly }],
    queryFn: () => meSeriesService.list(activeOnly),
    staleTime: 30_000,
  });
}

export function useSeriesDetail(idSeries: string | null) {
  return useQuery({
    queryKey: ["blog", "me", "series", idSeries],
    queryFn: () => meSeriesService.get(idSeries as string),
    enabled: !!idSeries,
    staleTime: 30_000,
  });
}

export function useCreateSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSeriesInput) => meSeriesService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "series"] }),
  });
}

export function useUpdateSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSeriesInput }) =>
      meSeriesService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "series"] }),
  });
}

export function useDeleteSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idSeries: string) => meSeriesService.delete(idSeries),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "series"] }),
  });
}

export function useAttachPostToSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idSeries, idPost, urutan }: { idSeries: string; idPost: string; urutan?: number }) =>
      meSeriesService.attachPost(idSeries, idPost, urutan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "series"] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "posts"] });
    },
  });
}

export function useDetachPostFromSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idPost: string) => meSeriesService.detachPost(idPost),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "series"] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "posts"] });
    },
  });
}

export function useReorderSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idSeries, orderedPostIDs }: { idSeries: string; orderedPostIDs: string[] }) =>
      meSeriesService.reorder(idSeries, orderedPostIDs),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "series"] }),
  });
}

// =================== Co-author ===================

import { meCoAuthorService, type AddCoAuthorInput, type UpdateCoAuthorInput } from "./coAuthorService";

export function useCoAuthors(idPost: string | null) {
  return useQuery({
    queryKey: ["blog", "me", "co-authors", idPost],
    queryFn: () => meCoAuthorService.list(idPost as string),
    enabled: !!idPost,
    staleTime: 30_000,
  });
}

export function useAddCoAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idPost, input }: { idPost: string; input: AddCoAuthorInput }) =>
      meCoAuthorService.add(idPost, input),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["blog", "me", "co-authors", vars.idPost] }),
  });
}

export function useUpdateCoAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idPost, idBlogCo, input }: { idPost: string; idBlogCo: string; input: UpdateCoAuthorInput }) =>
      meCoAuthorService.update(idPost, idBlogCo, input),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["blog", "me", "co-authors", vars.idPost] }),
  });
}

export function useRemoveCoAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idPost, idBlogCo }: { idPost: string; idBlogCo: string }) =>
      meCoAuthorService.remove(idPost, idBlogCo),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["blog", "me", "co-authors", vars.idPost] }),
  });
}

export function useCoAuthorInvites(status?: import("./coAuthorService").CoAuthorStatus, limit = 20) {
  return useQuery({
    queryKey: ["blog", "me", "co-author-invites", { status, limit }],
    queryFn: () => meCoAuthorService.listMyInvites(status, limit),
    staleTime: 30_000,
  });
}

export function useRespondCoAuthorInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idPost, input }: { idPost: string; input: import("./coAuthorService").RespondInviteInput }) =>
      meCoAuthorService.respondInvite(idPost, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "co-author-invites"] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "co-authors"] });
    },
  });
}

// =================== Ban (admin) ===================

import { adminBanService, type BanCreateInput } from "./banService";

export function useBanList(activeOnly = true, limit = 30, offset = 0) {
  return useQuery({
    queryKey: ["blog", "admin", "bans", { activeOnly, limit, offset }],
    queryFn: () => adminBanService.list(activeOnly, limit, offset),
    staleTime: 30_000,
  });
}

export function useCreateBan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BanCreateInput) => adminBanService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "bans"] }),
  });
}

export function useUnban() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idBan: string) => adminBanService.unban(idBan),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "bans"] }),
  });
}

// =================== Reading Progress ===================

import { meReadingProgressService } from "./readingProgressService";

export function useContinueReading(limit = 6) {
  return useQuery({
    queryKey: ["blog", "me", "reading-progress", "incomplete", limit],
    queryFn: () => meReadingProgressService.listIncomplete(limit),
    staleTime: 30_000,
  });
}

export function useReadingHistory(limit = 10) {
  return useQuery({
    queryKey: ["blog", "me", "reading-progress", "completed", limit],
    queryFn: () => meReadingProgressService.listCompleted(limit),
    staleTime: 60_000,
  });
}

// =================== Author Pin (Phase AW) ===================

export function useToggleAuthorPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idPost: string) => mePostService.toggleAuthorPin(idPost),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "post"] });
      qc.invalidateQueries({ queryKey: ["blog", "me"] });
    },
  });
}

// =================== Mail Config (admin) ===================

import { adminMailService, type MailConfigInput } from "./mailService";

export function useMailConfigList() {
  return useQuery({
    queryKey: ["blog", "admin", "mail-config"],
    queryFn: () => adminMailService.list(),
    staleTime: 30_000,
  });
}

export function useCreateMailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: MailConfigInput) => adminMailService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "mail-config"] }),
  });
}

export function useUpdateMailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: MailConfigInput }) =>
      adminMailService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "mail-config"] }),
  });
}

export function useActivateMailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminMailService.activate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "mail-config"] }),
  });
}

export function useDeleteMailConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminMailService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "admin", "mail-config"] }),
  });
}

export function useTestSendMail() {
  return useMutation({
    mutationFn: (recipient: string) => adminMailService.testSend(recipient),
  });
}

export function useOutboxStats() {
  return useQuery({
    queryKey: ["blog", "admin", "mail-config", "outbox-stats"],
    queryFn: () => adminMailService.outboxStats(),
    staleTime: 15_000,
  });
}

export function useOutboxList(status?: string, limit = 50) {
  return useQuery({
    queryKey: ["blog", "admin", "mail-config", "outbox", { status, limit }],
    queryFn: () => adminMailService.outboxList(status, limit),
    staleTime: 15_000,
  });
}

// =================== Banned Commenter (per-blog, Phase BF) ===================

import { bannedCommenterService, type BanCommenterInput } from "./bannedCommenterService";

export function useBannedCommenterList(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["blog", "me", "banned-commenter", { limit, offset }],
    queryFn: () => bannedCommenterService.list(limit, offset),
    staleTime: 30_000,
  });
}

export function useBanCommenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BanCommenterInput) => bannedCommenterService.ban(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "banned-commenter"] });
      // Refresh moderation queue too — UI may want to gray out related rows.
      qc.invalidateQueries({ queryKey: ["blog", "me", "komentar"] });
    },
  });
}

export function useUnbanCommenter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bannedCommenterService.unban(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blog", "me", "banned-commenter"] }),
  });
}

// =================== Bilingual Pair (Phase BD) ===================

export function useLinkPostPair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, idOtherPost }: { id: string; idOtherPost: string }) =>
      mePostService.linkPair(id, idOtherPost),
    onSuccess: (_data, { id, idOtherPost }) => {
      // Invalidate both posts — pair updated symmetrically on backend.
      qc.invalidateQueries({ queryKey: ["blog", "me", "post", id] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "post", idOtherPost] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "posts"] });
    },
  });
}

export function useUnlinkPostPair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mePostService.unlinkPair(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["blog", "me", "post", id] });
      qc.invalidateQueries({ queryKey: ["blog", "me", "posts"] });
    },
  });
}

// =================== Subscribers (Phase BB owner dashboard) ===================

import { meSubscriberService } from "./subscriberService";

export function useSubscriberList(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ["blog", "me", "subscribers", { limit, offset }],
    queryFn: () => meSubscriberService.list(limit, offset),
    staleTime: 30_000,
  });
}
