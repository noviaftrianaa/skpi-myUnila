package interaction

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// BANNED COMMENTER (Phase BF) — per-blog ban.
//
// Beda dengan Phase AO (moderation.banned_user): di sini blog owner block
// specific user dari komentar di blog mereka aja. Tidak global; tidak butuh
// admin platform.
//
// Enforcement: KomentarRepository.Create resolves id_blog dari post, lalu
// cek IsBanned(idBlog, idUser) sebelum insert. Anonymous commenter tidak
// bisa di-ban di sini (mereka identified by email saja — out of scope).
// =============================================================================

type BannedCommenter struct {
	IDBannedCommenter uuid.UUID  `db:"id_banned_commenter" json:"id_banned_commenter"`
	IDBlog            uuid.UUID  `db:"id_blog"             json:"id_blog"`
	IDPenggunaPdut    uuid.UUID  `db:"id_pengguna_pdut"    json:"id_pengguna_pdut"`
	Alasan            string     `db:"alasan"              json:"alasan"`
	DibannedOleh      uuid.UUID  `db:"dibanned_oleh"       json:"dibanned_oleh"`
	DibannedPada      time.Time  `db:"dibanned_pada"       json:"dibanned_pada"`
	SoftDelete        *time.Time `db:"soft_delete"         json:"-"`
}

// BannedCommenterView — joined dengan blog target user (kalau punya) supaya
// owner bisa lihat siapa yang di-ban tanpa harus query siakadu.
type BannedCommenterView struct {
	BannedCommenter
	NmKomentator  *string `db:"nm_komentator"  json:"nm_komentator,omitempty"`
	BlogSubdomain *string `db:"blog_subdomain" json:"blog_subdomain,omitempty"`
	BlogAvatar    *string `db:"blog_avatar"    json:"blog_avatar,omitempty"`
}

type BannedCommenterRepository struct{ db *sqlx.DB }

func NewBannedCommenterRepository(db *sqlx.DB) *BannedCommenterRepository {
	return &BannedCommenterRepository{db: db}
}

// IsBanned — hot path. Dipanggil di KomentarRepository.Create. Cepat karena
// partial unique index (id_blog, id_pengguna_pdut) WHERE soft_delete IS NULL.
func (r *BannedCommenterRepository) IsBanned(ctx context.Context, idBlog, idUser uuid.UUID) (bool, string, error) {
	var alasan string
	err := r.db.GetContext(ctx, &alasan, `
		SELECT alasan
		FROM blog.banned_commenter
		WHERE id_blog = $1 AND id_pengguna_pdut = $2 AND soft_delete IS NULL
		LIMIT 1`, idBlog, idUser)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, "", nil
		}
		return false, "", fmt.Errorf("ban lookup: %w", err)
	}
	return true, alasan, nil
}

// Ban — adds ban entry. Idempotent via partial unique constraint: re-banning
// surfaces a friendly error instead of crashing.
func (r *BannedCommenterRepository) Ban(ctx context.Context, idBlog, idUser, idOwner uuid.UUID, alasan string) (*BannedCommenter, error) {
	if strings.TrimSpace(alasan) == "" {
		return nil, errors.New("alasan ban wajib diisi")
	}
	if idUser == idOwner {
		return nil, errors.New("tidak bisa ban diri sendiri")
	}
	var b BannedCommenter
	err := r.db.GetContext(ctx, &b, `
		INSERT INTO blog.banned_commenter
		    (id_blog, id_pengguna_pdut, alasan, dibanned_oleh)
		VALUES ($1, $2, $3, $4)
		RETURNING id_banned_commenter, id_blog, id_pengguna_pdut, alasan,
		          dibanned_oleh, dibanned_pada, soft_delete`,
		idBlog, idUser, alasan, idOwner)
	if err != nil {
		// 23505 = unique_violation — already banned.
		if strings.Contains(err.Error(), "uq_banned_commenter_blog_user") {
			return nil, errors.New("user sudah di-ban dari blog ini")
		}
		return nil, fmt.Errorf("insert ban: %w", err)
	}
	return &b, nil
}

// Unban — soft delete the ban row (keeps audit). Only owner can unban via
// id_blog scope check.
func (r *BannedCommenterRepository) Unban(ctx context.Context, idBanned, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE blog.banned_commenter
		SET soft_delete = NOW()
		WHERE id_banned_commenter = $1 AND id_blog = $2 AND soft_delete IS NULL`,
		idBanned, idBlog)
	if err != nil {
		return fmt.Errorf("unban: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("ban not found or already removed")
	}
	return nil
}

// List — paginated list untuk blog owner. Joined dengan blog target user
// supaya UI bisa render subdomain/avatar tanpa second-query.
func (r *BannedCommenterRepository) List(ctx context.Context, idBlog uuid.UUID, limit, offset int) ([]BannedCommenterView, int, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM blog.banned_commenter
		 WHERE id_blog = $1 AND soft_delete IS NULL`, idBlog); err != nil {
		return nil, 0, fmt.Errorf("count bans: %w", err)
	}
	rows := make([]BannedCommenterView, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT bc.id_banned_commenter, bc.id_blog, bc.id_pengguna_pdut, bc.alasan,
		       bc.dibanned_oleh, bc.dibanned_pada, bc.soft_delete,
		       b.nm_tampilan AS nm_komentator,
		       b.subdomain   AS blog_subdomain,
		       b.avatar_url  AS blog_avatar
		FROM blog.banned_commenter bc
		LEFT JOIN blog.blog b ON b.id_pengguna_pdut = bc.id_pengguna_pdut AND b.soft_delete IS NULL
		WHERE bc.id_blog = $1 AND bc.soft_delete IS NULL
		ORDER BY bc.dibanned_pada DESC
		LIMIT $2 OFFSET $3`, idBlog, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list bans: %w", err)
	}
	return rows, total, nil
}

// =============================================================================
// HANDLER
// =============================================================================

type BannedCommenterHandler struct {
	repo *BannedCommenterRepository
	kom  *KomentarRepository
}

func NewBannedCommenterHandler(repo *BannedCommenterRepository, kom *KomentarRepository) *BannedCommenterHandler {
	return &BannedCommenterHandler{repo: repo, kom: kom}
}

func (h *BannedCommenterHandler) resolveBlog(c *fiber.Ctx) (uuid.UUID, error) {
	idBlogStr, _ := c.Locals("id_blog").(string)
	if idBlogStr == "" {
		return uuid.Nil, fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved")
	}
	return uuid.Parse(idBlogStr)
}

// GET /api/v1/me/blog/banned-commenter?limit=50&offset=0
func (h *BannedCommenterHandler) List(c *fiber.Ctx) error {
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.List(c.Context(), idBlog, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data":    fiber.Map{"items": rows, "total": total, "limit": limit, "offset": offset},
	})
}

// POST /api/v1/me/blog/banned-commenter
// Body: { id_pengguna_pdut: "<uuid>", alasan: "..." }
// — OR shortcut: { id_komentar: "<uuid>", alasan: "..." } untuk ban langsung
//   dari moderation queue (resolve id_pengguna_pdut dari komentar).
func (h *BannedCommenterHandler) Create(c *fiber.Ctx) error {
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	ownerID, _ := c.Locals("user_id").(string)
	idOwner, err := uuid.Parse(ownerID)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid user_id")
	}
	var body struct {
		IDPenggunaPdut *string `json:"id_pengguna_pdut"`
		IDKomentar     *string `json:"id_komentar"`
		Alasan         string  `json:"alasan"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}

	// Resolve id_pengguna_pdut — directly atau dari komentar.
	var idUser uuid.UUID
	switch {
	case body.IDPenggunaPdut != nil && *body.IDPenggunaPdut != "":
		u, perr := uuid.Parse(*body.IDPenggunaPdut)
		if perr != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid id_pengguna_pdut")
		}
		idUser = u
	case body.IDKomentar != nil && *body.IDKomentar != "":
		idKom, perr := uuid.Parse(*body.IDKomentar)
		if perr != nil {
			return fiber.NewError(fiber.StatusBadRequest, "invalid id_komentar")
		}
		// Resolve user via komentar + verify komentar belongs to this blog.
		var holder struct {
			IDPenggunaPdut *uuid.UUID `db:"id_pengguna_pdut"`
		}
		qerr := h.kom.db.GetContext(c.Context(), &holder, `
			SELECT k.id_pengguna_pdut
			FROM interaction.komentar k
			JOIN blog.post p ON k.id_post = p.id_post
			WHERE k.id_komentar = $1 AND p.id_blog = $2`, idKom, idBlog)
		if qerr != nil {
			return fiber.NewError(fiber.StatusNotFound, "komentar tidak ditemukan atau bukan milik blog ini")
		}
		if holder.IDPenggunaPdut == nil {
			return fiber.NewError(fiber.StatusBadRequest, "komentar anonymous tidak bisa di-ban (tidak ada id_pengguna_pdut)")
		}
		idUser = *holder.IDPenggunaPdut
	default:
		return fiber.NewError(fiber.StatusBadRequest, "harus provide id_pengguna_pdut atau id_komentar")
	}

	rec, berr := h.repo.Ban(c.Context(), idBlog, idUser, idOwner, body.Alasan)
	if berr != nil {
		return fiber.NewError(fiber.StatusBadRequest, berr.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": rec})
}

// DELETE /api/v1/me/blog/banned-commenter/:id
func (h *BannedCommenterHandler) Delete(c *fiber.Ctx) error {
	idBanned, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	idBlog, err := h.resolveBlog(c)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_blog")
	}
	if uerr := h.repo.Unban(c.Context(), idBanned, idBlog); uerr != nil {
		return fiber.NewError(fiber.StatusNotFound, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}
