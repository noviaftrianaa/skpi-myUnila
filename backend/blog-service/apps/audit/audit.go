// Package audit — log aksi pengguna ke audit.jejak_audit + read endpoint
// untuk activity timeline di dashboard.
package audit

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type Entry struct {
	IDJejakAudit   uuid.UUID       `db:"id_jejak_audit"     json:"id_jejak_audit"`
	IDPenggunaPdut *uuid.UUID      `db:"id_pengguna_pdut"   json:"id_pengguna_pdut,omitempty"`
	Aksi           string          `db:"aksi"               json:"aksi"`
	Entitas        string          `db:"entitas"            json:"entitas"`
	IDEntitas      *uuid.UUID      `db:"id_entitas"         json:"id_entitas,omitempty"`
	DetailJSON     json.RawMessage `db:"detail_json"        json:"detail_json"`
	CreatedAt      time.Time       `db:"created_at"         json:"created_at"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// Log — write audit entry (call dari handler lain saat ada mutasi).
// Aksi: 'create_post' / 'publish_post' / 'delete_post' / 'claim_subdomain' / dst
func (r *Repository) Log(ctx context.Context, idUser uuid.UUID, aksi, entitas string, idEntitas *uuid.UUID, detail map[string]any) error {
	var detailJSON []byte = []byte("{}")
	if detail != nil {
		b, err := json.Marshal(detail)
		if err == nil {
			detailJSON = b
		}
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO audit.jejak_audit (id_pengguna_pdut, aksi, entitas, id_entitas, detail_json)
		 VALUES ($1, $2, $3, $4, $5::jsonb)`,
		idUser, aksi, entitas, idEntitas, detailJSON)
	if err != nil {
		return fmt.Errorf("audit log: %w", err)
	}
	return nil
}

// ListByUser — activity timeline untuk dashboard (last N entries dari user).
func (r *Repository) ListByUser(ctx context.Context, idUser uuid.UUID, limit int) ([]Entry, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	q := `SELECT id_jejak_audit, id_pengguna_pdut, aksi, entitas, id_entitas, detail_json, created_at
	      FROM audit.jejak_audit
	      WHERE id_pengguna_pdut = $1
	      ORDER BY created_at DESC
	      LIMIT $2`
	rows := make([]Entry, 0)
	if err := r.db.SelectContext(ctx, &rows, q, idUser, limit); err != nil {
		return nil, fmt.Errorf("list audit: %w", err)
	}
	return rows, nil
}

// AdminListParams — admin cross-user filter.
type AdminListParams struct {
	Aksi      string
	Entitas   string
	IDUser    *uuid.UUID
	IDEntitas *uuid.UUID
	Limit     int
	Offset    int
}

// ListForAdmin — cross-user audit query untuk admin moderation/forensics.
func (r *Repository) ListForAdmin(ctx context.Context, p AdminListParams) ([]Entry, int, error) {
	if p.Limit <= 0 || p.Limit > 200 {
		p.Limit = 50
	}
	where := []string{"1=1"}
	args := []any{}
	idx := 1
	if p.Aksi != "" {
		where = append(where, fmt.Sprintf("aksi = $%d", idx))
		args = append(args, p.Aksi)
		idx++
	}
	if p.Entitas != "" {
		where = append(where, fmt.Sprintf("entitas = $%d", idx))
		args = append(args, p.Entitas)
		idx++
	}
	if p.IDUser != nil {
		where = append(where, fmt.Sprintf("id_pengguna_pdut = $%d", idx))
		args = append(args, *p.IDUser)
		idx++
	}
	if p.IDEntitas != nil {
		where = append(where, fmt.Sprintf("id_entitas = $%d", idx))
		args = append(args, *p.IDEntitas)
		idx++
	}
	whereSQL := "WHERE " + strings.Join(where, " AND ")

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM audit.jejak_audit "+whereSQL, args...); err != nil {
		return nil, 0, fmt.Errorf("count audit: %w", err)
	}

	q := fmt.Sprintf(`
		SELECT id_jejak_audit, id_pengguna_pdut, aksi, entitas, id_entitas, detail_json, created_at
		FROM audit.jejak_audit %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d`, whereSQL, idx, idx+1)
	args = append(args, p.Limit, p.Offset)

	rows := make([]Entry, 0)
	if err := r.db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, 0, fmt.Errorf("list audit: %w", err)
	}
	return rows, total, nil
}

// CountByAksi — aggregate (last 30d) untuk dashboard chips.
func (r *Repository) CountByAksi(ctx context.Context) (map[string]int, error) {
	rows, err := r.db.QueryxContext(ctx, `
		SELECT aksi, COUNT(*)
		FROM audit.jejak_audit
		WHERE created_at > NOW() - INTERVAL '30 days'
		GROUP BY aksi
		ORDER BY COUNT(*) DESC`)
	if err != nil {
		return nil, fmt.Errorf("count by aksi: %w", err)
	}
	defer rows.Close()
	out := map[string]int{}
	for rows.Next() {
		var a string
		var n int
		if err := rows.Scan(&a, &n); err == nil {
			out[a] = n
		}
	}
	return out, nil
}

// =============== Handler ===============

type Handler struct{ repo *Repository }

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

// GET /api/v1/me/audit?limit=20
// Activity timeline untuk dashboard.
func (h *Handler) ListMine(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing user_id")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id UUID")
	}
	limit := c.QueryInt("limit", 20)
	rows, err := h.repo.ListByUser(c.Context(), idUser, limit)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": rows})
}

// GET /api/v1/admin/audit?aksi=&entitas=&id_user=&limit=50&offset=0
func (h *Handler) ListAdmin(c *fiber.Ctx) error {
	p := AdminListParams{
		Aksi:    c.Query("aksi", ""),
		Entitas: c.Query("entitas", ""),
		Limit:   c.QueryInt("limit", 50),
		Offset:  c.QueryInt("offset", 0),
	}
	if v := c.Query("id_user", ""); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			p.IDUser = &id
		}
	}
	if v := c.Query("id_entitas", ""); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			p.IDEntitas = &id
		}
	}
	rows, total, err := h.repo.ListForAdmin(c.Context(), p)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	counts, _ := h.repo.CountByAksi(c.Context())
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":      rows,
			"total":      total,
			"limit":      p.Limit,
			"offset":     p.Offset,
			"count_aksi": counts,
		},
	})
}

// =============== Router ===============

func RegisterMineRoutes(me fiber.Router, h *Handler) {
	me.Get("/audit", h.ListMine)
}

func RegisterAdminRoutes(admin fiber.Router, h *Handler) {
	admin.Get("/audit", h.ListAdmin)
}
