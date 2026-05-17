package moderation

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// BAN USER — admin moderation gate for bad actors.
//
// Schema: moderation.banned_user (lihat 2026-05-16_add_banned_user.sql)
// Enforcement: RejectBannedUserMiddleware applied to engagement endpoints
// (POST komentar, POST like, POST follow, POST bookmark, POST post create).
// Read-only endpoints are intentionally NOT gated — banned users can still
// browse and read.
// =============================================================================

// ErrBanned signals an active ban to upstream handlers. Middleware returns
// a 403 with this message; handler doesn't see it.
var ErrBanned = errors.New("user is banned")

type BanRecord struct {
	IDBan            uuid.UUID  `db:"id_ban"             json:"id_ban"`
	IDPenggunaPdut   uuid.UUID  `db:"id_pengguna_pdut"   json:"id_pengguna_pdut"`
	Alasan           string     `db:"alasan"             json:"alasan"`
	BannedAt         time.Time  `db:"banned_at"          json:"banned_at"`
	BannedUntil      *time.Time `db:"banned_until"       json:"banned_until,omitempty"`
	IDBannedBy       uuid.UUID  `db:"id_banned_by"       json:"id_banned_by"`
	CatatanInternal  *string    `db:"catatan_internal"   json:"catatan_internal,omitempty"`
	CreatedAt        time.Time  `db:"created_at"         json:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at"         json:"updated_at"`
	SoftDelete       *time.Time `db:"soft_delete"        json:"soft_delete,omitempty"`
}

// BanRecordView — joined view with the banned user's blog info (when they have one).
// Renders in the admin list so reviewers can see who got banned.
type BanRecordView struct {
	BanRecord
	BlogSubdomain *string `db:"blog_subdomain" json:"blog_subdomain,omitempty"`
	BlogNmBlog    *string `db:"blog_nm_blog"   json:"blog_nm_blog,omitempty"`
	BlogAvatar    *string `db:"blog_avatar"    json:"blog_avatar,omitempty"`
}

type BanRepository struct{ db *sqlx.DB }

func NewBanRepository(db *sqlx.DB) *BanRepository { return &BanRepository{db: db} }

// IsBanned — hot-path middleware check. Returns true when the user has at
// least one active ban (soft_delete IS NULL AND (banned_until IS NULL OR
// banned_until > NOW())). Expired bans auto-fall-off without an admin action.
func (r *BanRepository) IsBanned(ctx context.Context, idUser uuid.UUID) (bool, *BanRecord, error) {
	var b BanRecord
	err := r.db.GetContext(ctx, &b, `
		SELECT id_ban, id_pengguna_pdut, alasan, banned_at, banned_until,
		       id_banned_by, catatan_internal, created_at, updated_at, soft_delete
		FROM moderation.banned_user
		WHERE id_pengguna_pdut = $1
		  AND soft_delete IS NULL
		  AND (banned_until IS NULL OR banned_until > NOW())
		ORDER BY banned_at DESC
		LIMIT 1`, idUser)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil, nil
		}
		return false, nil, fmt.Errorf("ban lookup: %w", err)
	}
	return true, &b, nil
}

type BanInput struct {
	IDPenggunaPdut  uuid.UUID
	Alasan          string
	BannedUntil     *time.Time
	IDBannedBy      uuid.UUID
	CatatanInternal *string
}

func (r *BanRepository) Ban(ctx context.Context, in BanInput) (*BanRecord, error) {
	if in.Alasan == "" {
		return nil, errors.New("alasan ban wajib diisi")
	}
	if in.IDPenggunaPdut == in.IDBannedBy {
		return nil, errors.New("admin cannot ban themselves")
	}
	var b BanRecord
	err := r.db.GetContext(ctx, &b, `
		INSERT INTO moderation.banned_user
		    (id_pengguna_pdut, alasan, banned_until, id_banned_by, catatan_internal)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id_ban, id_pengguna_pdut, alasan, banned_at, banned_until,
		          id_banned_by, catatan_internal, created_at, updated_at, soft_delete`,
		in.IDPenggunaPdut, in.Alasan, in.BannedUntil, in.IDBannedBy, in.CatatanInternal)
	if err != nil {
		return nil, fmt.Errorf("insert ban: %w", err)
	}
	return &b, nil
}

// Unban — soft delete (preserves audit). If multiple active bans exist for
// the user, unbans only the specific record by id_ban.
func (r *BanRepository) Unban(ctx context.Context, idBan uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE moderation.banned_user
		SET soft_delete = NOW(), updated_at = NOW()
		WHERE id_ban = $1 AND soft_delete IS NULL`, idBan)
	if err != nil {
		return fmt.Errorf("unban: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("ban not found or already removed")
	}
	return nil
}

// ListForAdmin — paginated. activeOnly=true filters out expired + soft-deleted.
func (r *BanRepository) ListForAdmin(ctx context.Context, activeOnly bool, limit, offset int) ([]BanRecordView, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}
	where := "1=1"
	if activeOnly {
		where = "bu.soft_delete IS NULL AND (bu.banned_until IS NULL OR bu.banned_until > NOW())"
	} else {
		where = "1=1" // all bans incl. soft-deleted + expired
	}

	var total int
	if err := r.db.GetContext(ctx, &total,
		`SELECT COUNT(*) FROM moderation.banned_user bu WHERE `+where); err != nil {
		return nil, 0, fmt.Errorf("count bans: %w", err)
	}

	rows := make([]BanRecordView, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT bu.id_ban, bu.id_pengguna_pdut, bu.alasan, bu.banned_at, bu.banned_until,
		       bu.id_banned_by, bu.catatan_internal, bu.created_at, bu.updated_at, bu.soft_delete,
		       b.subdomain AS blog_subdomain, b.nm_blog AS blog_nm_blog, b.avatar_url AS blog_avatar
		FROM moderation.banned_user bu
		LEFT JOIN blog.blog b ON b.id_pengguna_pdut = bu.id_pengguna_pdut AND b.soft_delete IS NULL
		WHERE `+where+`
		ORDER BY bu.banned_at DESC
		LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list bans: %w", err)
	}
	return rows, total, nil
}

// =============================================================================
// MIDDLEWARE
// =============================================================================

// RejectBannedUser — Fiber middleware that 403s if the JWT subject is banned
// AND the request is a write operation (POST/PUT/DELETE/PATCH). Read methods
// (GET/HEAD/OPTIONS) always pass — banned users can still browse content.
// Applied AFTER JWTOptional / JWTAuth so user_id is already in Locals.
// Anonymous requests (no user_id) pass through — they're handled by per-route
// auth requirements.
func RejectBannedUser(repo *BanRepository) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Read-only methods are never blocked. A ban is about removing the
		// ability to *act*, not the ability to *read*.
		switch c.Method() {
		case fiber.MethodGet, fiber.MethodHead, fiber.MethodOptions:
			return c.Next()
		}
		uid, _ := c.Locals("user_id").(string)
		if uid == "" {
			return c.Next() // anonymous → not gated here
		}
		idUser, err := uuid.Parse(uid)
		if err != nil {
			return c.Next() // malformed; let downstream auth handle it
		}
		banned, rec, lerr := repo.IsBanned(c.Context(), idUser)
		if lerr != nil {
			// Fail open on infra errors — don't lock out everyone if the
			// moderation table is unreachable. Log instead.
			return c.Next()
		}
		if !banned {
			return c.Next()
		}
		// Surface the reason to the user. The catatan_internal stays internal.
		msg := "Akun ini diblokir dari aksi engagement: " + rec.Alasan
		if rec.BannedUntil != nil {
			msg += fmt.Sprintf(" (sampai %s)", rec.BannedUntil.Format("2 Jan 2006 15:04"))
		}
		return fiber.NewError(fiber.StatusForbidden, msg)
	}
}

// =============================================================================
// HANDLER (admin)
// =============================================================================

type BanHandler struct{ repo *BanRepository }

func NewBanHandler(repo *BanRepository) *BanHandler { return &BanHandler{repo: repo} }

// POST /admin/bans
// Body: { id_pengguna_pdut, alasan, banned_until?, catatan_internal? }
func (h *BanHandler) Create(c *fiber.Ctx) error {
	adminID, _ := c.Locals("user_id").(string)
	idAdmin, err := uuid.Parse(adminID)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid admin user_id")
	}
	var body struct {
		IDPenggunaPdut  string  `json:"id_pengguna_pdut"`
		Alasan          string  `json:"alasan"`
		BannedUntil     *string `json:"banned_until"`
		CatatanInternal *string `json:"catatan_internal"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	idUser, perr := uuid.Parse(body.IDPenggunaPdut)
	if perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_pengguna_pdut")
	}
	var until *time.Time
	if body.BannedUntil != nil && *body.BannedUntil != "" {
		t, terr := time.Parse(time.RFC3339, *body.BannedUntil)
		if terr != nil {
			return fiber.NewError(fiber.StatusBadRequest, "banned_until must be RFC3339")
		}
		until = &t
	}
	rec, berr := h.repo.Ban(c.Context(), BanInput{
		IDPenggunaPdut:  idUser,
		Alasan:          body.Alasan,
		BannedUntil:     until,
		IDBannedBy:      idAdmin,
		CatatanInternal: body.CatatanInternal,
	})
	if berr != nil {
		return fiber.NewError(fiber.StatusBadRequest, berr.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": rec})
}

// GET /admin/bans?active=true&limit=30&offset=0
func (h *BanHandler) List(c *fiber.Ctx) error {
	activeOnly := c.Query("active") != "false" // default: active only
	limit := c.QueryInt("limit", 30)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.ListForAdmin(c.Context(), activeOnly, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":  rows,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// DELETE /admin/bans/:id (unban)
func (h *BanHandler) Delete(c *fiber.Ctx) error {
	idBan, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_ban")
	}
	if uerr := h.repo.Unban(c.Context(), idBan); uerr != nil {
		return fiber.NewError(fiber.StatusNotFound, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// RegisterBanAdminRoutes — admin endpoints under /admin/bans.
func RegisterBanAdminRoutes(admin fiber.Router, h *BanHandler) {
	g := admin.Group("/bans")
	g.Get("/", h.List)
	g.Post("/", h.Create)
	g.Delete("/:id", h.Delete)
}
