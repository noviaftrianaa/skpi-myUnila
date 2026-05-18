package post

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/myunila/blog-service/apps/audit"
	"github.com/myunila/blog-service/apps/blog"
)

// PublishNotifier — interface untuk emit notif saat publish post.
// Di-inject dari main.go (interaction.NotifService implements ini implicitly).
// Pakai interface supaya post package tidak bergantung ke interaction.
type PublishNotifier interface {
	EmitNewPostFromFollowing(ctx context.Context, idPost, idBlog uuid.UUID)
	EmitMentionsInPost(ctx context.Context, idPost uuid.UUID, idAktor *uuid.UUID, aktorNama, bodyText string)
}

// Searcher — interface untuk sync post ke Meilisearch index. Di-inject dari
// main.go (apps/search.Service implements it). Hook fires after every mutation
// that can change visibility or content. Errors are logged at the call site,
// never bubble up to the caller — search staleness is not a user-blocking issue.
type Searcher interface {
	IndexPostByID(ctx context.Context, idPost uuid.UUID) error
	RemovePostByID(ctx context.Context, idPost uuid.UUID) error
}

// SubscriberBroadcaster — Phase BB. Notify confirmed newsletter subscribers
// saat post first-publish. Fire-and-forget di goroutine supaya gak block
// publish response.
type SubscriberBroadcaster interface {
	BroadcastPublishedPost(ctx context.Context, idBlog, idPost uuid.UUID)
}

type Handler struct {
	repo        *Repository
	blogRepo    *blog.Repository
	auditRepo   *audit.Repository
	notif       PublishNotifier
	searcher    Searcher
	broadcaster SubscriberBroadcaster
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

// SetBlogRepo — injection untuk resolve id_blog dari user_id (Locals).
// Dipanggil di main.go setelah keduanya dibikin.
func (h *Handler) SetBlogRepo(br *blog.Repository) {
	h.blogRepo = br
}

// SetAuditRepo — inject audit repo agar mutation endpoints bisa log activity.
// Optional: kalau nil, audit logging di-skip silently.
func (h *Handler) SetAuditRepo(ar *audit.Repository) {
	h.auditRepo = ar
}

// SetNotif — inject publish notifier. Optional.
func (h *Handler) SetNotif(n PublishNotifier) {
	h.notif = n
}

// SetSearcher — inject search index hook. Optional; when nil all
// indexHook/removeHook calls become no-ops.
func (h *Handler) SetSearcher(s Searcher) {
	h.searcher = s
}

// SetSubscriberBroadcaster — Phase BB. Optional.
func (h *Handler) SetSubscriberBroadcaster(b SubscriberBroadcaster) {
	h.broadcaster = b
}

// indexHook fires search index updates as a fire-and-forget side effect.
// Errors are logged but never propagated — search staleness must not block
// a successful post mutation.
func (h *Handler) indexHook(c *fiber.Ctx, idPost uuid.UUID) {
	if h.searcher == nil {
		return
	}
	go func(ctx context.Context, id uuid.UUID) {
		if err := h.searcher.IndexPostByID(ctx, id); err != nil {
			// nolint: errcheck — log only, no return path
			_ = err
		}
	}(context.Background(), idPost)
	_ = c // c reserved for future contextual data
}

func (h *Handler) removeHook(c *fiber.Ctx, idPost uuid.UUID) {
	if h.searcher == nil {
		return
	}
	go func(ctx context.Context, id uuid.UUID) {
		_ = h.searcher.RemovePostByID(ctx, id)
	}(context.Background(), idPost)
	_ = c
}

func (h *Handler) audit(c *fiber.Ctx, aksi, entitas string, idEntitas *uuid.UUID, detail map[string]any) {
	if h.auditRepo == nil {
		return
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return
	}
	// Fire-and-forget — jangan block response kalau audit gagal
	_ = h.auditRepo.Log(c.Context(), idUser, aksi, entitas, idEntitas, detail)
}

// resolveBlog — ambil blog milik user dari JWT (id_pengguna_pdut di Locals).
func (h *Handler) resolveBlog(c *fiber.Ctx) (*blog.Blog, error) {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return nil, fiber.NewError(fiber.StatusUnauthorized, "missing user context")
	}
	pid, err := uuid.Parse(uid)
	if err != nil {
		return nil, fiber.NewError(fiber.StatusBadRequest, "invalid user_id in JWT")
	}
	b, err := h.blogRepo.GetByUserPdut(c.Context(), pid)
	if errors.Is(err, blog.ErrNotFound) {
		return nil, fiber.NewError(fiber.StatusNotFound, "user belum punya blog — claim subdomain dulu")
	}
	if err != nil {
		return nil, fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return b, nil
}

// GET /api/v1/posts
//
// Public listing. Query:
//   - ?status=published (default, kalau dashboard pakai draft / scheduled / etc)
//   - ?subdomain=2117051070-mhs (filter ke 1 blog)
//   - ?id_blog=<uuid> (filter ke 1 blog by id)
//   - ?kategori=teknologi (slug)
//   - ?search=…
//   - ?order=latest|popular|oldest|trending
//   - ?unggulan=1, ?pinned=1
//   - ?limit=20&offset=0
func (h *Handler) List(c *fiber.Ctx) error {
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))

	params := ListParams{
		Limit:         limit,
		Offset:        offset,
		BlogSubdomain: c.Query("subdomain", ""),
		KategoriSlug:  c.Query("kategori", ""),
		TagSlug:       c.Query("tag", ""),
		Status:        c.Query("status", "published"),
		Search:        c.Query("search", ""),
		OrderBy:       c.Query("order", "latest"),
		UnggulanOnly:  c.Query("unggulan") == "1",
		PinnedOnly:    c.Query("pinned") == "1",
	}
	if idBlog := c.Query("id_blog"); idBlog != "" {
		if id, err := uuid.Parse(idBlog); err == nil {
			params.IDBlog = &id
		}
	}

	items, total, err := h.repo.List(c.Context(), params)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":  items,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GET /api/v1/posts/:id
func (h *Handler) GetByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	p, err := h.repo.GetByID(c.Context(), id)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "post not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// GET /api/v1/posts/by-slug/:subdomain/:slug
// Public: untuk frontend-blog render post detail.
func (h *Handler) GetBySlug(c *fiber.Ctx) error {
	subdomain := c.Params("subdomain")
	slug := c.Params("slug")
	p, err := h.repo.GetBySlug(c.Context(), subdomain, slug)
	if err == ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "post not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// GET /api/v1/posts/status-count?id_blog=<uuid>
// Dashboard widget "Status Posts" — counts per status.
func (h *Handler) StatusCount(c *fiber.Ctx) error {
	idBlogParam := c.Query("id_blog")
	if idBlogParam == "" {
		return fiber.NewError(fiber.StatusBadRequest, "id_blog query param required")
	}
	idBlog, err := uuid.Parse(idBlogParam)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog UUID")
	}
	counts, err := h.repo.CountByStatus(c.Context(), idBlog)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": counts})
}

// =========================================================================
// Authenticated write endpoints — /api/v1/me/blog/posts/*
// id_blog auto-resolved dari JWT (id_pengguna_pdut), tidak dari payload.
// =========================================================================

// POST /api/v1/me/blog/posts
func (h *Handler) CreateMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	var in CreateInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	in.IDBlog = b.IDBlog // override — owner-only
	p, err := h.repo.Create(c.Context(), in)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	h.audit(c, "create_post", "post", &p.IDPost, map[string]any{"judul": p.Judul, "slug": p.Slug})
	h.indexHook(c, p.IDPost) // sync to search (no-op if status != published)
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": p})
}

// PUT /api/v1/me/blog/posts/:id
func (h *Handler) UpdateMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	var in UpdateInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	p, err := h.repo.Update(c.Context(), id, b.IDBlog, in)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "post not found atau bukan milik blog kamu")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	h.indexHook(c, p.IDPost) // re-sync any title/body/status change to search
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// POST /api/v1/me/blog/posts/:id/publish
func (h *Handler) PublishMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	p, firstPublish, err := h.repo.Publish(c.Context(), id, b.IDBlog)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "post not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	h.audit(c, "publish_post", "post", &p.IDPost, map[string]any{"judul": p.Judul})

	// Emit notif ke followers HANYA saat first publish — supaya republish (unpublish→publish)
	// gak nge-spam followers. Fire-and-forget; pakai background context.
	if firstPublish && h.notif != nil {
		go h.notif.EmitNewPostFromFollowing(context.Background(), p.IDPost, b.IDBlog)
		// Mention-in-post notifs piggyback on first-publish so subsequent edits
		// don't re-spam previously-notified users. Body source is konten_html
		// (HTML tags are stripped by extractMentions which works on raw text).
		if p.KontenHTML != nil && *p.KontenHTML != "" {
			idAktor := b.IDPenggunaPdut
			aktorNama := b.NmBlog
			if b.NmTampilan != nil && *b.NmTampilan != "" {
				aktorNama = *b.NmTampilan
			}
			go h.notif.EmitMentionsInPost(context.Background(), p.IDPost, &idAktor, aktorNama, *p.KontenHTML)
		}
	}

	// Phase BB — fanout email broadcast ke newsletter subscribers blog ini.
	// Sama dengan notif: hanya saat first publish supaya unpublish→publish gak
	// kirim broadcast ulang.
	if firstPublish && h.broadcaster != nil {
		go h.broadcaster.BroadcastPublishedPost(context.Background(), b.IDBlog, p.IDPost)
	}

	h.indexHook(c, p.IDPost) // publish always pushes to search
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// DELETE /api/v1/me/blog/posts/:id
func (h *Handler) DeleteMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	if err := h.repo.SoftDelete(c.Context(), id, b.IDBlog); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	h.audit(c, "delete_post", "post", &id, nil)
	h.removeHook(c, id) // soft-deleted posts must vanish from search immediately
	return c.JSON(fiber.Map{"success": true, "message": "moved to trash"})
}

// PATCH /api/v1/admin/posts/:id/curation — admin set a_unggulan / a_pinned (any post, any blog).
// Body: { a_unggulan?: bool, a_pinned?: bool }. Pakai pointer di service supaya
// optional update (kirim satu flag aja).
func (h *Handler) SetCurationAdmin(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	var body struct {
		AUnggulan *bool `json:"a_unggulan,omitempty"`
		APinned   *bool `json:"a_pinned,omitempty"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	p, err := h.repo.SetFlagsAdmin(c.Context(), id, body.AUnggulan, body.APinned)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "post not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	// Audit log
	detail := map[string]any{"judul": p.Judul, "a_unggulan": p.AUnggulan, "a_pinned": p.APinned}
	h.audit(c, "curate_post", "post", &p.IDPost, detail)
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// GET /api/v1/me/feed?limit=20&offset=0 — personalized timeline:
// posts dari blog yang user follow. Latest first.
// Tidak butuh user punya blog sendiri — semua user yang login bisa pakai feed.
func (h *Handler) FeedMine(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id in JWT")
	}
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	items, total, err := h.repo.ListFeed(c.Context(), idUser, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":  items,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// PUT /api/v1/me/blog — update profile blog milik user yang sedang login.
// Partial update: kirim hanya field yang berubah. Validation di repository.
func (h *Handler) UpdateMyBlog(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	var in blog.UpdateProfileInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	updated, err := h.blogRepo.UpdateProfile(c.Context(), b.IDBlog, in)
	if errors.Is(err, blog.ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	// Audit dengan list field yang berubah (tanpa value sensitive)
	changed := []string{}
	if in.NmBlog != nil { changed = append(changed, "nm_blog") }
	if in.NmTampilan != nil { changed = append(changed, "nm_tampilan") }
	if in.Tagline != nil { changed = append(changed, "tagline") }
	if in.Deskripsi != nil { changed = append(changed, "deskripsi") }
	if in.Bio != nil { changed = append(changed, "bio") }
	if in.Lokasi != nil { changed = append(changed, "lokasi") }
	if in.AvatarURL != nil { changed = append(changed, "avatar_url") }
	if in.CoverURL != nil { changed = append(changed, "cover_url") }
	if in.SosmedJSON != nil { changed = append(changed, "sosmed_json") }
	if in.MetaSeoJSON != nil { changed = append(changed, "meta_seo_json") }
	if in.ThemeConfigJSON != nil { changed = append(changed, "theme_config_json") }
	h.audit(c, "update_blog_profile", "blog", &updated.IDBlog, map[string]any{"fields": changed})
	return c.JSON(fiber.Map{"success": true, "data": updated})
}

// GET /api/v1/me/blog/posts/trash?limit=20&offset=0 — soft-deleted posts.
func (h *Handler) ListTrashMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	limit, _ := strconv.Atoi(c.Query("limit", "20"))
	offset, _ := strconv.Atoi(c.Query("offset", "0"))
	items, total, err := h.repo.ListTrash(c.Context(), b.IDBlog, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{"items": items, "total": total, "limit": limit, "offset": offset},
	})
}

// POST /api/v1/me/blog/posts/:id/restore — undo soft delete. Status → draft.
func (h *Handler) RestoreMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	p, err := h.repo.Restore(c.Context(), id, b.IDBlog)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "post not found in trash")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	h.audit(c, "restore_post", "post", &p.IDPost, map[string]any{"judul": p.Judul})
	h.indexHook(c, p.IDPost) // restore → may become eligible for index again
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// DELETE /api/v1/me/blog/posts/:id/permanent — permanent delete (cascade via FK).
// Safety: hanya jalan kalau post sudah di-trash sebelumnya.
func (h *Handler) PermanentDeleteMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	if err := h.repo.HardDelete(c.Context(), id, b.IDBlog); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post not found in trash (soft-delete dulu sebelum hard delete)")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	h.audit(c, "permanent_delete_post", "post", &id, nil)
	h.removeHook(c, id) // hard delete → drop from search if it lingers
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/v1/me/blog/posts/:id/analytics?days=30 — per-post drill-down.
func (h *Handler) PostAnalyticsMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	days, _ := strconv.Atoi(c.Query("days", "30"))
	a, err := h.repo.AnalyticsPerPost(c.Context(), id, b.IDBlog, days)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "post not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": a})
}

// GET /api/v1/me/blog/posts/:id/revisions — list snapshots for owned post.
func (h *Handler) ListRevisionsMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	rows, err := h.repo.ListRevisions(c.Context(), id, b.IDBlog)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /api/v1/me/blog/posts/:id/revisions/:nomor — single snapshot with full konten.
func (h *Handler) GetRevisionMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}
	nomor, err := strconv.Atoi(c.Params("nomor"))
	if err != nil || nomor < 1 {
		return fiber.NewError(fiber.StatusBadRequest, "invalid nomor_revisi")
	}
	rev, err := h.repo.GetRevision(c.Context(), id, b.IDBlog, nomor)
	if errors.Is(err, ErrNotFound) {
		return fiber.NewError(fiber.StatusNotFound, "revision not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rev})
}

// GET /api/v1/me/blog — info blog milik user yang sedang login.
func (h *Handler) GetMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	return c.JSON(fiber.Map{"success": true, "data": b})
}

// PATCH /api/v1/me/blog/posts/:id/pin — toggle a_unggulan_blog for the owner's post.
// Max 3 pinned per blog (enforced via DB trigger).
func (h *Handler) ToggleAuthorPin(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	newState, terr := h.repo.ToggleAuthorPin(c.Context(), idPost, b.IDBlog)
	if terr != nil {
		if errors.Is(terr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post not found atau bukan milik blog kamu")
		}
		// Cap violation → 422 Unprocessable Entity is the closest fit (HTTP-wise);
		// 409 also reasonable. We use 422 because the resource state is the
		// constraint, not a write conflict.
		return fiber.NewError(fiber.StatusUnprocessableEntity, terr.Error())
	}
	h.audit(c, "toggle_pin_blog", "post", &idPost, map[string]any{"pinned": newState})
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"a_unggulan_blog": newState}})
}

// PUT /api/v1/me/blog/posts/:id/pair — link this post to the other-language
// version. Body: { id_other_post: "<uuid>" }. Both posts must belong to the
// caller's blog AND have different bahasa. Symmetric: both rows updated.
func (h *Handler) LinkPairMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	var body struct {
		IDOtherPost string `json:"id_other_post"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	idOther, perr := uuid.Parse(body.IDOtherPost)
	if perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_other_post")
	}
	if lerr := h.repo.LinkPair(c.Context(), idPost, idOther, b.IDBlog); lerr != nil {
		return fiber.NewError(fiber.StatusBadRequest, lerr.Error())
	}
	h.audit(c, "link_pair", "post", &idPost, map[string]any{"id_other_post": idOther})
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/v1/me/blog/posts/:id/pair — break the pair link. Both rows
// have their id_pair_post set to NULL.
func (h *Handler) UnlinkPairMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	if uerr := h.repo.UnlinkPair(c.Context(), idPost, b.IDBlog); uerr != nil {
		return fiber.NewError(fiber.StatusBadRequest, uerr.Error())
	}
	h.audit(c, "unlink_pair", "post", &idPost, nil)
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/v1/blogs/by-subdomain/:subdomain/pinned — public list of pinned posts.
func (h *Handler) ListPinnedPublic(c *fiber.Ctx) error {
	if h.blogRepo == nil {
		return fiber.NewError(fiber.StatusInternalServerError, "blog repo not configured")
	}
	subdomain := c.Params("subdomain")
	b, err := h.blogRepo.GetBySubdomain(c.Context(), subdomain)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, "blog not found")
	}
	rows, lerr := h.repo.ListPinned(c.Context(), b.IDBlog)
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /api/v1/me/blog/analytics/views?days=30
// Per-day view count untuk chart Engagement di dashboard.
func (h *Handler) AnalyticsMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	days, _ := strconv.Atoi(c.Query("days", "30"))
	rows, repoErr := h.repo.AnalyticsViewsPerDay(c.Context(), b.IDBlog, days)
	if repoErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, repoErr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /api/v1/me/blog/analytics/summary?days=30
// Comprehensive blog-owner analytics: totals + window + top posts + referrers.
func (h *Handler) AnalyticsSummaryMine(c *fiber.Ctx) error {
	b, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	days, _ := strconv.Atoi(c.Query("days", "30"))
	summary, repoErr := h.repo.AnalyticsBlogSummary(c.Context(), b.IDBlog, days)
	if repoErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, repoErr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": summary})
}

// =========================================================================
// Public view tracker — POST /api/v1/posts/:id/view
// Anonymous, ip_hash dedup 30 min window.
// =========================================================================

// hashIP — sha256(ip + UA + salt) untuk dedup tanpa simpan PII raw.
func hashIP(ip, userAgent string) string {
	if ip == "" {
		return ""
	}
	salt := "blog-platform-v1" // hardcoded salt, OK karena hash hanya untuk dedup bukan auth
	h := sha256.Sum256([]byte(ip + "|" + userAgent + "|" + salt))
	return hex.EncodeToString(h[:])
}

// TrackView — POST /api/v1/posts/:id/view
func (h *Handler) TrackView(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post UUID")
	}

	// Extract IP — handle X-Forwarded-For (Kong / nginx proxy)
	ip := c.Get("X-Forwarded-For")
	if ip == "" {
		ip = c.IP()
	}
	// Kalau comma-separated (proxy chain), ambil yang pertama (client real)
	if idx := strings.Index(ip, ","); idx > 0 {
		ip = strings.TrimSpace(ip[:idx])
	}

	ua := c.Get("User-Agent")
	referer := c.Get("Referer")
	ipHash := hashIP(ip, ua)

	// id_pengguna_pdut kalau user login (optional — view tracker tidak butuh auth)
	var idUser *uuid.UUID
	if uid, _ := c.Locals("user_id").(string); uid != "" {
		if u, err := uuid.Parse(uid); err == nil {
			idUser = &u
		}
	}

	if err := h.repo.TrackView(c.Context(), id, ipHash, referer, idUser); err != nil {
		if errors.Is(err, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "post not found / not published")
		}
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}
