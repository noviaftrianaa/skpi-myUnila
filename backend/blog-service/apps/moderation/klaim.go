package moderation

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
)

// =============================================================================
// KLAIM SUBDOMAIN — moderation queue untuk subdomain claims.
// Setiap claim attempt (yang lulus validation) di-log ke moderation.klaim_subdomain.
// Status: pending | auto_approved | manual_review | approved | rejected.
// Admin bisa override status untuk flag suspicious claims.
// =============================================================================

var ValidKlaimStatus = []string{"pending", "auto_approved", "manual_review", "approved", "rejected"}

func isValidKlaimStatus(s string) bool {
	for _, v := range ValidKlaimStatus {
		if v == s {
			return true
		}
	}
	return false
}

// Klaim — single row dari moderation.klaim_subdomain dengan denorm role kode.
type Klaim struct {
	IDKlaimSubdomain uuid.UUID       `db:"id_klaim_subdomain"  json:"id_klaim_subdomain"`
	IDPenggunaPdut   uuid.UUID       `db:"id_pengguna_pdut"    json:"id_pengguna_pdut"`
	IDTipeRole       uuid.UUID       `db:"id_tipe_role"        json:"id_tipe_role"`
	SubdomainDiminta string          `db:"subdomain_diminta"   json:"subdomain_diminta"`
	AlasanSubdomain  *string         `db:"alasan_subdomain"    json:"alasan_subdomain,omitempty"`
	ValidasiJSON     json.RawMessage `db:"validasi_json"       json:"validasi_json"`
	Status           string          `db:"status"              json:"status"`
	CatatanModerator *string         `db:"catatan_moderator"   json:"catatan_moderator,omitempty"`
	IDModeratorPdut  *uuid.UUID      `db:"id_moderator_pdut"   json:"id_moderator_pdut,omitempty"`
	TglDiputuskan    *time.Time      `db:"tgl_diputuskan"      json:"tgl_diputuskan,omitempty"`
	CreatedAt        time.Time       `db:"created_at"          json:"created_at"`
	UpdatedAt        time.Time       `db:"updated_at"          json:"updated_at"`
	// Denorm
	RoleKode *string `db:"role_kode" json:"role_kode,omitempty"`
}

type KlaimRepository struct{ db *sqlx.DB }

func NewKlaimRepository(db *sqlx.DB) *KlaimRepository { return &KlaimRepository{db: db} }

// LogClaim — write entry dari subdomain Claim flow setelah blog berhasil dibuat.
// Status default 'auto_approved' karena yang sampe sini sudah lulus 4-layer validation.
// validasiJSON optional — kalau nil, pakai {} placeholder.
func (r *KlaimRepository) LogClaim(
	ctx context.Context,
	idPengguna, idTipeRole uuid.UUID,
	subdomain string,
	validasi []byte,
) error {
	if len(validasi) == 0 {
		validasi = []byte(`{}`)
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO moderation.klaim_subdomain
		    (id_pengguna_pdut, id_tipe_role, subdomain_diminta, validasi_json,
		     status, tgl_diputuskan, id_creator)
		VALUES ($1, $2, $3, $4::jsonb, 'auto_approved', NOW(), $1)`,
		idPengguna, idTipeRole, subdomain, string(validasi))
	if err != nil {
		return fmt.Errorf("log klaim: %w", err)
	}
	return nil
}

// ListForAdmin — filter by status, pagination, latest-first.
func (r *KlaimRepository) ListForAdmin(ctx context.Context, status string, limit, offset int) ([]Klaim, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	where := "k.soft_delete IS NULL"
	args := []any{}
	idx := 1
	if status != "" {
		where += fmt.Sprintf(" AND k.status = $%d", idx)
		args = append(args, status)
		idx++
	}

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM moderation.klaim_subdomain k WHERE "+where, args...); err != nil {
		return nil, 0, fmt.Errorf("count klaim: %w", err)
	}

	q := fmt.Sprintf(`
		SELECT
		    k.id_klaim_subdomain, k.id_pengguna_pdut, k.id_tipe_role, k.subdomain_diminta,
		    k.alasan_subdomain, k.validasi_json, k.status, k.catatan_moderator,
		    k.id_moderator_pdut, k.tgl_diputuskan, k.created_at, k.updated_at,
		    r.kode AS role_kode
		FROM moderation.klaim_subdomain k
		LEFT JOIN ref.tipe_role r ON k.id_tipe_role = r.id_tipe_role
		WHERE %s
		ORDER BY k.created_at DESC
		LIMIT $%d OFFSET $%d`, where, idx, idx+1)
	args = append(args, limit, offset)
	rows := make([]Klaim, 0)
	if err := r.db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, 0, fmt.Errorf("list klaim: %w", err)
	}
	return rows, total, nil
}

// CountByStatus — admin dashboard counts.
func (r *KlaimRepository) CountByStatus(ctx context.Context) (map[string]int, error) {
	out := map[string]int{
		"pending": 0, "auto_approved": 0, "manual_review": 0, "approved": 0, "rejected": 0,
	}
	rows, err := r.db.QueryxContext(ctx,
		`SELECT status, COUNT(*) FROM moderation.klaim_subdomain
		 WHERE soft_delete IS NULL GROUP BY status`)
	if err != nil {
		return nil, fmt.Errorf("count by status: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var s string
		var n int
		if err := rows.Scan(&s, &n); err == nil {
			out[s] = n
		}
	}
	return out, nil
}

// Moderate — admin override status + catatan. Doesn't affect existing blog.blog row.
func (r *KlaimRepository) Moderate(ctx context.Context, idKlaim, idModerator uuid.UUID, newStatus string, catatan *string) error {
	if !isValidKlaimStatus(newStatus) {
		return errors.New("invalid status (" + strings.Join(ValidKlaimStatus, "/") + ")")
	}
	if catatan != nil && len(*catatan) > 0 {
		t := strings.TrimSpace(*catatan)
		catatan = &t
	}
	q := `UPDATE moderation.klaim_subdomain
	      SET status = $1, catatan_moderator = NULLIF($2, ''),
	          id_moderator_pdut = $3, tgl_diputuskan = NOW(),
	          id_updater = $3, updated_at = NOW()
	      WHERE id_klaim_subdomain = $4 AND soft_delete IS NULL`
	t := ""
	if catatan != nil {
		t = *catatan
	}
	res, err := r.db.ExecContext(ctx, q, newStatus, t, idModerator, idKlaim)
	if err != nil {
		return fmt.Errorf("moderate klaim: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		if _, e := r.db.ExecContext(ctx, `SELECT 1 FROM moderation.klaim_subdomain WHERE id_klaim_subdomain = $1`, idKlaim); e != nil {
			return sql.ErrNoRows
		}
		return errors.New("klaim not found")
	}
	return nil
}

// =============================================================================
// HANDLER
// =============================================================================

type KlaimHandler struct{ repo *KlaimRepository }

func NewKlaimHandler(repo *KlaimRepository) *KlaimHandler { return &KlaimHandler{repo: repo} }

// GET /api/v1/admin/klaim-subdomain?status=&limit=&offset=
func (h *KlaimHandler) ListAdmin(c *fiber.Ctx) error {
	status := c.Query("status", "")
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.ListForAdmin(c.Context(), status, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	counts, _ := h.repo.CountByStatus(c.Context())
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":          rows,
			"total":          total,
			"limit":          limit,
			"offset":         offset,
			"count_status":   counts,
		},
	})
}

// PATCH /api/v1/admin/klaim-subdomain/:id — body { status, catatan? }
func (h *KlaimHandler) Moderate(c *fiber.Ctx) error {
	idKlaim, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_klaim")
	}
	uid, _ := c.Locals("user_id").(string)
	idMod, _ := uuid.Parse(uid)
	var body struct {
		Status  string  `json:"status"`
		Catatan *string `json:"catatan,omitempty"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if err := h.repo.Moderate(c.Context(), idKlaim, idMod, body.Status, body.Catatan); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// RegisterKlaimAdminRoutes — admin-only.
func RegisterKlaimAdminRoutes(admin fiber.Router, h *KlaimHandler) {
	g := admin.Group("/klaim-subdomain")
	g.Get("/", h.ListAdmin)
	g.Patch("/:id", h.Moderate)
}
