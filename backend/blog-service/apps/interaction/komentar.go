package interaction

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// =============================================================================
// KOMENTAR — threaded reply (max depth 3), moderasi (pending/approved/spam/rejected)
// =============================================================================

type Komentar struct {
	IDKomentar         uuid.UUID       `db:"id_komentar"           json:"id_komentar"`
	IDPost             uuid.UUID       `db:"id_post"               json:"id_post"`
	IDKomentarParent   *uuid.UUID      `db:"id_komentar_parent"    json:"id_komentar_parent,omitempty"`
	IDPenggunaPdut     *uuid.UUID      `db:"id_pengguna_pdut"      json:"id_pengguna_pdut,omitempty"`
	NmKomentator       *string         `db:"nm_komentator"         json:"nm_komentator,omitempty"`
	EmailKomentator    *string         `db:"email_komentator"      json:"email_komentator,omitempty"`
	Isi                string          `db:"isi"                   json:"isi"`
	StatusModerasi     string          `db:"status_moderasi"       json:"status_moderasi"`
	JumlahLike         int             `db:"jumlah_like"           json:"jumlah_like"`
	APinned            bool            `db:"a_pinned"              json:"a_pinned"`
	CreatedAt          time.Time       `db:"created_at"            json:"created_at"`
}

// KomentarWithReplies — Komentar + nested replies (max depth 3 di frontend)
type KomentarWithReplies struct {
	Komentar
	Replies []Komentar `json:"replies,omitempty"`
}

type KomentarRepository struct{ db *sqlx.DB }

func NewKomentarRepository(db *sqlx.DB) *KomentarRepository { return &KomentarRepository{db: db} }

// ListByPost — list komentar approved untuk post tertentu, dengan nested replies.
// Public endpoint, status_moderasi='approved' only.
func (r *KomentarRepository) ListByPost(ctx context.Context, idPost uuid.UUID) ([]KomentarWithReplies, error) {
	q := `SELECT id_komentar, id_post, id_komentar_parent, id_pengguna_pdut,
	             nm_komentator, email_komentator, isi, status_moderasi,
	             jumlah_like, a_pinned, created_at
	      FROM interaction.komentar
	      WHERE id_post = $1 AND status_moderasi = 'approved' AND soft_delete IS NULL
	      ORDER BY a_pinned DESC, created_at ASC`
	rows := make([]Komentar, 0)
	if err := r.db.SelectContext(ctx, &rows, q, idPost); err != nil {
		return nil, fmt.Errorf("list komentar: %w", err)
	}

	// Group: top-level (parent=null) vs replies
	byParent := map[uuid.UUID][]Komentar{}
	var topLevel []Komentar
	for _, k := range rows {
		if k.IDKomentarParent == nil {
			topLevel = append(topLevel, k)
		} else {
			byParent[*k.IDKomentarParent] = append(byParent[*k.IDKomentarParent], k)
		}
	}

	out := make([]KomentarWithReplies, 0, len(topLevel))
	for _, k := range topLevel {
		out = append(out, KomentarWithReplies{
			Komentar: k,
			Replies:  byParent[k.IDKomentar],
		})
	}
	return out, nil
}

// CreateInput — payload buat komentar.
type CreateInput struct {
	IDPost             uuid.UUID  `json:"id_post"`
	IDKomentarParent   *uuid.UUID `json:"id_komentar_parent,omitempty"`
	Isi                string     `json:"isi"`
	// Untuk anonymous (kalau IDPenggunaPdut nil di handler):
	NmKomentator       string     `json:"nm_komentator,omitempty"`
	EmailKomentator    string     `json:"email_komentator,omitempty"`
}

// Create — INSERT komentar. Status default 'pending' (perlu moderasi per-blog).
// Kalau user login (idPengguna != nil), tag dengan id_pengguna_pdut.
// Kalau anonymous, butuh nm_komentator + email_komentator.
func (r *KomentarRepository) Create(ctx context.Context, in CreateInput, idPengguna *uuid.UUID, ipAddr, userAgent string) (*Komentar, error) {
	if strings.TrimSpace(in.Isi) == "" {
		return nil, errors.New("isi komentar required")
	}
	if len(in.Isi) > 5000 {
		return nil, errors.New("isi komentar max 5000 char")
	}
	if idPengguna == nil {
		// Anonymous — wajib nm + email
		if strings.TrimSpace(in.NmKomentator) == "" || strings.TrimSpace(in.EmailKomentator) == "" {
			return nil, errors.New("anonymous comment requires nm_komentator + email_komentator")
		}
		if !strings.Contains(in.EmailKomentator, "@") {
			return nil, errors.New("invalid email format")
		}
	}

	// Cek post exists + a_komentar_aktif dari blog. Sekalian fetch id_blog
	// supaya bisa cek per-blog commenter ban (Phase BF) tanpa second-query.
	var meta struct {
		Allowed bool      `db:"allowed"`
		IDBlog  uuid.UUID `db:"id_blog"`
	}
	err := r.db.GetContext(ctx, &meta, `
		SELECT (b.a_komentar_aktif AND p.a_komentar_aktif) AS allowed,
		       b.id_blog AS id_blog
		FROM blog.post p
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1 AND p.status = 'published' AND p.soft_delete IS NULL`,
		in.IDPost)
	if err != nil {
		return nil, errors.New("post tidak ditemukan atau belum published")
	}
	if !meta.Allowed {
		return nil, errors.New("komentar dinonaktifkan untuk post/blog ini")
	}

	// Phase BF — per-blog commenter ban. Hanya cek untuk authenticated user
	// (anonymous tidak bisa di-ban karena gak punya id_pengguna_pdut).
	if idPengguna != nil {
		var alasan string
		berr := r.db.GetContext(ctx, &alasan, `
			SELECT alasan FROM blog.banned_commenter
			WHERE id_blog = $1 AND id_pengguna_pdut = $2 AND soft_delete IS NULL
			LIMIT 1`, meta.IDBlog, *idPengguna)
		if berr == nil {
			return nil, fmt.Errorf("anda telah diblokir dari komentar di blog ini: %s", alasan)
		}
		if !errors.Is(berr, sql.ErrNoRows) {
			return nil, fmt.Errorf("ban check: %w", berr)
		}
	}

	// INSERT — status default 'pending'. Kalau dari user yang sama dengan owner blog,
	// bisa auto-approve di Phase 3. Untuk MVP: semua pending.
	q := `INSERT INTO interaction.komentar
	        (id_post, id_komentar_parent, id_pengguna_pdut, nm_komentator, email_komentator,
	         isi, ip_alamat, user_agent, status_moderasi)
	      VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''), $6, NULLIF($7, '')::INET, NULLIF($8, ''), 'pending')
	      RETURNING id_komentar, id_post, id_komentar_parent, id_pengguna_pdut,
	                nm_komentator, email_komentator, isi, status_moderasi,
	                jumlah_like, a_pinned, created_at`
	var k Komentar
	err = r.db.GetContext(ctx, &k, q,
		in.IDPost, in.IDKomentarParent, idPengguna, in.NmKomentator, in.EmailKomentator,
		in.Isi, ipAddr, userAgent)
	if err != nil {
		return nil, fmt.Errorf("insert komentar: %w", err)
	}
	return &k, nil
}

// SoftDelete — set soft_delete = NOW(). Komentar hilang dari semua moderation queues
// + dari public list. Bisa di-restore. Ownership guard via id_blog.
func (r *KomentarRepository) SoftDelete(ctx context.Context, idKomentar, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE interaction.komentar k
		SET soft_delete = NOW()
		WHERE k.id_komentar = $1
		  AND k.id_post IN (SELECT id_post FROM blog.post WHERE id_blog = $2)
		  AND k.soft_delete IS NULL`, idKomentar, idBlog)
	if err != nil {
		return fmt.Errorf("soft delete komentar: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("komentar not found or not owned")
	}
	return nil
}

// ListTrash — soft-deleted komentar untuk owner. Pagination.
func (r *KomentarRepository) ListTrash(ctx context.Context, idBlog uuid.UUID, limit, offset int) ([]Komentar, int, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	var total int
	if err := r.db.GetContext(ctx, &total, `
		SELECT COUNT(*)
		FROM interaction.komentar k
		JOIN blog.post p ON k.id_post = p.id_post
		WHERE p.id_blog = $1 AND k.soft_delete IS NOT NULL`, idBlog); err != nil {
		return nil, 0, fmt.Errorf("count trash: %w", err)
	}
	rows := make([]Komentar, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT k.id_komentar, k.id_post, k.id_komentar_parent, k.id_pengguna_pdut,
		       k.nm_komentator, k.email_komentator, k.isi, k.status_moderasi,
		       k.jumlah_like, k.a_pinned, k.created_at
		FROM interaction.komentar k
		JOIN blog.post p ON k.id_post = p.id_post
		WHERE p.id_blog = $1 AND k.soft_delete IS NOT NULL
		ORDER BY k.soft_delete DESC
		LIMIT $2 OFFSET $3`, idBlog, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list trash komentar: %w", err)
	}
	return rows, total, nil
}

// Restore — undo soft_delete. status_moderasi tetap (kalau approved tetap approved).
func (r *KomentarRepository) Restore(ctx context.Context, idKomentar, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE interaction.komentar k
		SET soft_delete = NULL
		WHERE k.id_komentar = $1
		  AND k.id_post IN (SELECT id_post FROM blog.post WHERE id_blog = $2)
		  AND k.soft_delete IS NOT NULL`, idKomentar, idBlog)
	if err != nil {
		return fmt.Errorf("restore komentar: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("komentar not found in trash or not owned")
	}
	return nil
}

// HardDelete — permanent DELETE. Cascade ke like_komentar via FK.
// Safety: hanya jalan kalau sudah soft-deleted dulu.
func (r *KomentarRepository) HardDelete(ctx context.Context, idKomentar, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		DELETE FROM interaction.komentar
		WHERE id_komentar = $1
		  AND id_post IN (SELECT id_post FROM blog.post WHERE id_blog = $2)
		  AND soft_delete IS NOT NULL`, idKomentar, idBlog)
	if err != nil {
		return fmt.Errorf("hard delete komentar: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("komentar not in trash or not owned (soft-delete dulu)")
	}
	return nil
}

// TogglePin — flip a_pinned untuk komentar tertentu. Ownership via id_blog → post → komentar.
// Hanya approved comments yang relevan untuk pin (tapi gak block — owner discretion).
func (r *KomentarRepository) TogglePin(ctx context.Context, idKomentar, idBlog uuid.UUID) (bool, error) {
	var newPinned bool
	err := r.db.GetContext(ctx, &newPinned, `
		UPDATE interaction.komentar k
		SET a_pinned = NOT a_pinned
		WHERE k.id_komentar = $1
		  AND k.id_post IN (SELECT id_post FROM blog.post WHERE id_blog = $2)
		  AND k.soft_delete IS NULL
		RETURNING k.a_pinned`, idKomentar, idBlog)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, errors.New("komentar not found or not owned")
		}
		return false, fmt.Errorf("toggle pin: %w", err)
	}
	return newPinned, nil
}

// =============================================================================
// Moderasi (admin / blog owner)
// =============================================================================

// ListForModeration — komentar pending/spam untuk blog tertentu (perlu auth blog owner).
func (r *KomentarRepository) ListForModeration(ctx context.Context, idBlog uuid.UUID, status string) ([]Komentar, error) {
	if status == "" {
		status = "pending"
	}
	q := `SELECT k.id_komentar, k.id_post, k.id_komentar_parent, k.id_pengguna_pdut,
	             k.nm_komentator, k.email_komentator, k.isi, k.status_moderasi,
	             k.jumlah_like, k.a_pinned, k.created_at
	      FROM interaction.komentar k
	      JOIN blog.post p ON k.id_post = p.id_post
	      WHERE p.id_blog = $1 AND k.status_moderasi = $2 AND k.soft_delete IS NULL
	      ORDER BY k.created_at DESC
	      LIMIT 100`
	rows := make([]Komentar, 0)
	if err := r.db.SelectContext(ctx, &rows, q, idBlog, status); err != nil {
		return nil, fmt.Errorf("list moderation: %w", err)
	}
	return rows, nil
}

// ModerateBulk — apply status ke banyak komentar sekaligus, scoped ke idBlog.
// Ownership guard: hanya komentar yang post-nya milik idBlog. Returns rows affected.
// Pakai pq.Array karena `id_komentar IN (?)` butuh native array binding.
func (r *KomentarRepository) ModerateBulk(ctx context.Context, ids []uuid.UUID, idBlog uuid.UUID, newStatus string) (int, error) {
	valid := map[string]bool{"pending": true, "approved": true, "spam": true, "rejected": true}
	if !valid[newStatus] {
		return 0, errors.New("invalid status (pending/approved/spam/rejected)")
	}
	if len(ids) == 0 {
		return 0, errors.New("ids empty")
	}
	// Convert []uuid.UUID → []string supaya pq.Array bisa.
	strIDs := make([]string, len(ids))
	for i, id := range ids {
		strIDs[i] = id.String()
	}
	res, err := r.db.ExecContext(ctx, `
		UPDATE interaction.komentar k
		SET status_moderasi = $1
		WHERE k.id_komentar = ANY($2::uuid[])
		  AND k.id_post IN (SELECT id_post FROM blog.post WHERE id_blog = $3)
		  AND k.soft_delete IS NULL`,
		newStatus, pq.Array(strIDs), idBlog)
	if err != nil {
		return 0, fmt.Errorf("bulk moderate: %w", err)
	}
	n, _ := res.RowsAffected()
	return int(n), nil
}

// Moderate — set status_moderasi. Allowed transitions:
//   pending → approved / spam / rejected
//   approved → spam / rejected (unpublish)
//   spam → approved / pending
func (r *KomentarRepository) Moderate(ctx context.Context, idKomentar, idBlog uuid.UUID, newStatus string) error {
	valid := map[string]bool{"pending": true, "approved": true, "spam": true, "rejected": true}
	if !valid[newStatus] {
		return errors.New("invalid status (pending/approved/spam/rejected)")
	}
	// Verify komentar belongs to blog (security check)
	q := `UPDATE interaction.komentar k
	      SET status_moderasi = $1
	      WHERE k.id_komentar = $2
	        AND k.id_post IN (SELECT id_post FROM blog.post WHERE id_blog = $3)
	        AND k.soft_delete IS NULL`
	res, err := r.db.ExecContext(ctx, q, newStatus, idKomentar, idBlog)
	if err != nil {
		return fmt.Errorf("moderate: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("komentar not found or not owned")
	}
	return nil
}

// =============================================================================
// Handler
// =============================================================================

type KomentarHandler struct {
	repo  *KomentarRepository
	notif *NotifService
}

func NewKomentarHandler(repo *KomentarRepository) *KomentarHandler { return &KomentarHandler{repo: repo} }

func (h *KomentarHandler) SetNotif(n *NotifService) { h.notif = n }

// GET /api/v1/posts/:id/komentar — public, list approved komentar
func (h *KomentarHandler) ListPublic(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	rows, err := h.repo.ListByPost(c.Context(), idPost)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// POST /api/v1/posts/:id/komentar — create komentar (anonymous OR authenticated)
// Status: 'pending' (perlu moderasi).
func (h *KomentarHandler) Create(c *fiber.Ctx) error {
	idPost, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_post")
	}
	var in CreateInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	in.IDPost = idPost

	// User login? Pakai id_pengguna_pdut, set nm/email dari JWT
	var idPengguna *uuid.UUID
	if uid, _ := c.Locals("user_id").(string); uid != "" {
		if u, err := uuid.Parse(uid); err == nil {
			idPengguna = &u
			// Override nm/email dari JWT (jangan trust input)
			if n, _ := c.Locals("name").(string); n != "" {
				in.NmKomentator = n
			}
			if e, _ := c.Locals("email").(string); e != "" {
				in.EmailKomentator = e
			}
		}
	}

	ip := c.Get("X-Forwarded-For")
	if ip == "" {
		ip = c.IP()
	}
	if idx := strings.Index(ip, ","); idx > 0 {
		ip = strings.TrimSpace(ip[:idx])
	}
	ua := c.Get("User-Agent")
	if len(ua) > 255 {
		ua = ua[:255]
	}

	k, err := h.repo.Create(c.Context(), in, idPengguna, ip, ua)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Emit notif ke post owner (top-level komentar) — agar bisa segera moderate.
	// Reply notif ke parent komentator di-emit di Moderate handler saat status=approved
	// (supaya spam tidak nge-spam parent komentator dengan reply tidak valid).
	if h.notif != nil && k.IDKomentarParent == nil {
		actorName := in.NmKomentator
		h.notif.EmitKomentarPost(c.Context(), idPost, k.IDKomentar, idPengguna, actorName)
	}
	// Mentions: only emit when approved (handled di Moderate). Skip di sini — pending.

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"data":    k,
		"message": "Komentar tersimpan & menunggu moderasi.",
	})
}

// GET /api/v1/me/blog/komentar?status=pending — list komentar utk moderasi
func (h *KomentarHandler) ListMine(c *fiber.Ctx) error {
	// id_blog di-resolve via context (di-set di main.go via middleware)
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	status := c.Query("status", "pending")
	rows, err := h.repo.ListForModeration(c.Context(), idBlog, status)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// DELETE /api/v1/me/blog/komentar/:id — soft delete komentar.
func (h *KomentarHandler) SoftDelete(c *fiber.Ctx) error {
	idKomentar, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
	}
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	if err := h.repo.SoftDelete(c.Context(), idKomentar, idBlog); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/v1/me/blog/komentar/trash?limit=50&offset=0
func (h *KomentarHandler) ListTrash(c *fiber.Ctx) error {
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.ListTrash(c.Context(), idBlog, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{"items": rows, "total": total, "limit": limit, "offset": offset},
	})
}

// POST /api/v1/me/blog/komentar/:id/restore
func (h *KomentarHandler) Restore(c *fiber.Ctx) error {
	idKomentar, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
	}
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	if err := h.repo.Restore(c.Context(), idKomentar, idBlog); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// DELETE /api/v1/me/blog/komentar/:id/permanent
func (h *KomentarHandler) PermanentDelete(c *fiber.Ctx) error {
	idKomentar, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
	}
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return err
	}
	if err := h.repo.HardDelete(c.Context(), idKomentar, idBlog); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// resolveBlog helper — extract id_blog dari Locals (set di middleware).
func (h *KomentarHandler) resolveBlog(c *fiber.Ctx) (uuid.UUID, error) {
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return uuid.Nil, fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return uuid.Nil, fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	return idBlog, nil
}

// PATCH /api/v1/me/blog/komentar/:id/pin — toggle pinned state untuk komentar approved.
// Pinned komentar muncul pertama di public list (ORDER BY a_pinned DESC).
func (h *KomentarHandler) TogglePin(c *fiber.Ctx) error {
	idKomentar, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
	}
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	newPinned, err := h.repo.TogglePin(c.Context(), idKomentar, idBlog)
	if err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"a_pinned": newPinned}})
}

// POST /api/v1/me/blog/komentar/bulk — bulk moderate. Body: { ids: [...], status: "approved" }
func (h *KomentarHandler) ModerateBulk(c *fiber.Ctx) error {
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	var body struct {
		IDs    []string `json:"ids"`
		Status string   `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if len(body.IDs) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "ids empty")
	}
	if len(body.IDs) > 200 {
		return fiber.NewError(fiber.StatusBadRequest, "max 200 ids per request")
	}
	uuids := make([]uuid.UUID, 0, len(body.IDs))
	for _, s := range body.IDs {
		u, err := uuid.Parse(s)
		if err != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid id: "+s)
		}
		uuids = append(uuids, u)
	}
	n, err := h.repo.ModerateBulk(c.Context(), uuids, idBlog, body.Status)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"affected": n}})
}

// PATCH /api/v1/me/blog/komentar/:id — moderate (approve/reject/spam)
func (h *KomentarHandler) Moderate(c *fiber.Ctx) error {
	idKomentar, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
	}
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	idBlog, err := uuid.Parse(idBlogStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}

	// Resolve komentar meta sebelum moderate (untuk emit reply + mention notif).
	var meta struct {
		IDPost           uuid.UUID  `db:"id_post"`
		IDKomentarParent *uuid.UUID `db:"id_komentar_parent"`
		IDPenggunaPdut   *uuid.UUID `db:"id_pengguna_pdut"`
		NmKomentator     *string    `db:"nm_komentator"`
		Isi              string     `db:"isi"`
	}
	_ = h.repo.db.GetContext(c.Context(), &meta,
		`SELECT id_post, id_komentar_parent, id_pengguna_pdut, nm_komentator, isi
		 FROM interaction.komentar WHERE id_komentar = $1`, idKomentar)

	if err := h.repo.Moderate(c.Context(), idKomentar, idBlog, body.Status); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Emit reply notif kalau approved + komentar adalah reply.
	// Recipient: parent komentator (kalau punya id_pengguna_pdut).
	if h.notif != nil && body.Status == "approved" {
		actorName := ""
		if meta.NmKomentator != nil {
			actorName = *meta.NmKomentator
		}
		if meta.IDKomentarParent != nil {
			h.notif.EmitReplyKomentar(
				c.Context(), meta.IDPost, *meta.IDKomentarParent, idKomentar,
				meta.IDPenggunaPdut, actorName,
			)
		}
		// Mentions: parse @subdomain dari isi, notify mentioned users.
		// Approval-gated supaya spam mention gak nyampe target.
		h.notif.EmitMentions(c.Context(), meta.IDPost, idKomentar, meta.IDPenggunaPdut, actorName, meta.Isi)
	}

	return c.JSON(fiber.Map{"success": true})
}

// =============================================================================
// Helper: Marshal Komentar JSON safely (handle nil sql.NullString etc)
// =============================================================================

func (k Komentar) MarshalJSON() ([]byte, error) {
	type Alias Komentar
	return json.Marshal((*Alias)(&k))
}
