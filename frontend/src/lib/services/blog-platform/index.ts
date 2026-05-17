// Barrel export — single import point untuk blog-platform services.
//
// Usage:
//   import { kategoriService, postService, useKategoriList } from "@/lib/services/blog-platform";

export { blogClient } from "./blogClient";
export type { APIEnvelope, APIList } from "./blogClient";
export * from "./types";

export { kategoriService } from "./kategoriService";
export { tagService } from "./tagService";
export { postService } from "./postService";
export { blogService } from "./blogService";
export { adminKategoriService, adminTagService, adminPostService, adminBlogService } from "./adminService";
export type { KategoriUpsertInput, TagUpsertInput, PostCurationInput, BlogFlagsInput } from "./adminService";
export { meBlogService, mePostService } from "./meService";
export type {
  CreatePostInput, UpdatePostInput, UpdateBlogProfileInput,
  PostRevisionSummary, PostRevision,
  PostAnalytics, PostAnalyticsDaily, PostAnalyticsReferrer,
  BlogAnalyticsSummary, BlogTotals, BlogWindowStat, BlogTopPost, BlogReferrer,
  DailyViews,
} from "./meService";
export { meKomentarService } from "./komentarService";
export type { KomentarItem, ModerationStatus } from "./komentarService";
export { meFollowerService } from "./followerService";
export type { FollowerEntry } from "./followerService";
export { meBookmarkService } from "./bookmarkService";
export type { BookmarkEntry, BookmarkLabelStat } from "./bookmarkService";
export { meMediaService, mediaURL } from "./mediaService";
export type {
  MediaItem, MediaUsage, MediaListResult, UpdateMediaMetaInput, JenisMedia, MediaVariants,
} from "./mediaService";
export { meSeriesService } from "./seriesService";
export type {
  Series, SeriesPost, SeriesDetail, CreateSeriesInput, UpdateSeriesInput,
} from "./seriesService";
export {
  meCoAuthorService, publicCoAuthorService, CO_AUTHOR_PERAN_LABEL, CO_AUTHOR_STATUS_LABEL,
} from "./coAuthorService";
export type {
  CoAuthor, CoAuthorInvite, CoAuthorPeran, CoAuthorStatus,
  AddCoAuthorInput, UpdateCoAuthorInput, RespondInviteInput,
} from "./coAuthorService";
export { adminBanService } from "./banService";
export type { BanEntry, BanListResult, BanCreateInput } from "./banService";
export { meReadingProgressService } from "./readingProgressService";
export type { ReadingProgressItem } from "./readingProgressService";
export { adminMailService } from "./mailService";
export type {
  MailConfig, MailConfigInput, OutboxStats, EmailOutboxEntry,
} from "./mailService";
export { meNotifService, ALL_NOTIF_TIPES } from "./notifService";
export type { NotifEntry, NotifType, NotifPreference } from "./notifService";
export { adminLaporanService } from "./laporanService";
export type { LaporanEntry, LaporanStatus, LaporanListResult, ModerateInput } from "./laporanService";
export { adminReservedWordsService } from "./reservedWordsService";
export type { KataTerlarang, KataKategori, KataListResult, UpsertKataInput } from "./reservedWordsService";
export { adminTemplateThemeService, templateThemeService } from "./templateThemeService";
export type { TemplateTheme, UpsertTemplateInput } from "./templateThemeService";
export { adminAuditService } from "./auditAdminService";
export type { AuditEntry as AdminAuditEntry, AuditListResult, AuditListParams } from "./auditAdminService";
export { adminKlaimService } from "./klaimService";
export type { KlaimEntry, KlaimStatus, KlaimListResult, KlaimModerateInput } from "./klaimService";
export { adminStatsService } from "./adminStatsService";
export type { AdminStatsResult, StatsCounts, TopBlogStat } from "./adminStatsService";
export { subdomainService } from "./subdomainService";
export type {
  SubdomainOption, SubdomainOptionsResponse, SubdomainValidation,
  ClaimInput, ClaimResponse,
} from "./subdomainService";

// React Query hooks
export * from "./hooks";
