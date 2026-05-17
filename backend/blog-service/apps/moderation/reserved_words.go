package moderation

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
// RESERVED WORDS — ref.kata_terlarang
// Subdomain claim Layer 2 validation cek list ini.
// Kategori: system | role | brand | offensive (DB CHECK constraint).
// =============================================================================

var ValidKategoriKata = []string{"system", "role", "brand", "offensive"}

func isValidKategoriKata(k string) bool {
	for _, v := range ValidKategoriKata {
		if v == k {
			return true
		}
	}
	return false
}

type KataTerlarang struct {
	IDKataTerlarang uuid.UUID  `db:"id_kata_terlarang" json:"id_kata_terlarang"`
	Kata            string     `db:"kata"              json:"kata"`
	Kategori        string     `db:"kategori"          json:"kategori"`
	Keterangan      *string    `db:"keterangan"        json:"keterangan,omitempty"`
	CreatedAt       time.Time  `db:"created_at"        json:"created_at"`
	UpdatedAt       time.Time  `db:"updated_at"        json:"updated_at"`
}

type ReservedWordsRepository struct{ db *sqlx.DB }

func NewReservedWordsRepository(db *sqlx.DB) *ReservedWordsRepository {
	return &ReservedWordsRepository{db: db}
}

// List — pagination + filter kategori + search by kata.
func (r *ReservedWordsRepository) List(ctx context.Context, kategori, search string, limit, offset int) ([]KataTerlarang, int, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	where := []string{"soft_delete IS NULL"}
	args := []any{}
	idx := 1
	if kategori != "" {
		where = append(where, fmt.Sprintf("kategori = $%d", idx))
		args = append(args, kategori)
		idx++
	}
	if search != "" {
		where = append(where, fmt.Sprintf("kata ILIKE $%d", idx))
		args = append(args, "%"+strings.ToLower(search)+"%")
		idx++
	}
	whereSQL := "WHERE " + strings.Join(where, " AND ")

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM ref.kata_terlarang "+whereSQL, args...); err != nil {
		return nil, 0, fmt.Errorf("count kata: %w", err)
	}
	q := fmt.Sprintf(`
		SELECT id_kata_terlarang, kata, kategori, keterangan, created_at, updated_at
		FROM ref.kata_terlarang %s
		ORDER BY kategori ASC, kata ASC
		LIMIT $%d OFFSET $%d`, whereSQL, idx, idx+1)
	args = append(args, limit, offset)

	rows := make([]KataTerlarang, 0)
	if err := r.db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, 0, fmt.Errorf("list kata: %w", err)
	}
	return rows, total, nil
}

// CountByKategori — buat dashboard badges.
func (r *ReservedWordsRepository) CountByKategori(ctx context.Context) (map[string]int, error) {
	rows, err := r.db.QueryxContext(ctx, `
		SELECT kategori, COUNT(*) AS jumlah
		FROM ref.kata_terlarang
		WHERE soft_delete IS NULL
		GROUP BY kategori`)
	if err != nil {
		return nil, fmt.Errorf("count by kategori: %w", err)
	}
	defer rows.Close()
	out := map[string]int{"system": 0, "role": 0, "brand": 0, "offensive": 0}
	for rows.Next() {
		var k string
		var n int
		if err := rows.Scan(&k, &n); err == nil {
			out[k] = n
		}
	}
	return out, nil
}

type UpsertKataInput struct {
	Kata       string  `json:"kata"`
	Kategori   string  `json:"kategori"`
	Keterangan *string `json:"keterangan,omitempty"`
}

func (in *UpsertKataInput) normalize() error {
	in.Kata = strings.ToLower(strings.TrimSpace(in.Kata))
	if in.Kata == "" || len(in.Kata) > 80 {
		return errors.New("kata harus 1-80 karakter")
	}
	in.Kategori = strings.ToLower(strings.TrimSpace(in.Kategori))
	if !isValidKategoriKata(in.Kategori) {
		return fmt.Errorf("kategori harus salah satu: %s", strings.Join(ValidKategoriKata, ", "))
	}
	if in.Keterangan != nil {
		t := strings.TrimSpace(*in.Keterangan)
		if t == "" {
			in.Keterangan = nil
		} else {
			in.Keterangan = &t
		}
	}
	return nil
}

func (r *ReservedWordsRepository) Create(ctx context.Context, idCreator uuid.UUID, in UpsertKataInput) (*KataTerlarang, error) {
	if err := in.normalize(); err != nil {
		return nil, err
	}
	var k KataTerlarang
	err := r.db.GetContext(ctx, &k, `
		INSERT INTO ref.kata_terlarang (kata, kategori, keterangan, id_creator)
		VALUES ($1, $2, NULLIF($3, ''), $4)
		RETURNING id_kata_terlarang, kata, kategori, keterangan, created_at, updated_at`,
		in.Kata, in.Kategori, derefOrEmpty(in.Keterangan), idCreator)
	if err != nil {
		// uniq constraint
		if strings.Contains(err.Error(), "kata_terlarang_kata_key") {
			return nil, fmt.Errorf("kata %q sudah ada", in.Kata)
		}
		return nil, fmt.Errorf("insert kata: %w", err)
	}
	return &k, nil
}

func (r *ReservedWordsRepository) Update(ctx context.Context, id, idUpdater uuid.UUID, in UpsertKataInput) (*KataTerlarang, error) {
	if err := in.normalize(); err != nil {
		return nil, err
	}
	var k KataTerlarang
	err := r.db.GetContext(ctx, &k, `
		UPDATE ref.kata_terlarang
		SET kata = $1, kategori = $2, keterangan = NULLIF($3, ''),
		    id_updater = $4, updated_at = NOW()
		WHERE id_kata_terlarang = $5 AND soft_delete IS NULL
		RETURNING id_kata_terlarang, kata, kategori, keterangan, created_at, updated_at`,
		in.Kata, in.Kategori, derefOrEmpty(in.Keterangan), idUpdater, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("kata not found")
		}
		if strings.Contains(err.Error(), "kata_terlarang_kata_key") {
			return nil, fmt.Errorf("kata %q sudah ada", in.Kata)
		}
		return nil, fmt.Errorf("update kata: %w", err)
	}
	return &k, nil
}

func (r *ReservedWordsRepository) Delete(ctx context.Context, id, idUpdater uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE ref.kata_terlarang
		SET soft_delete = NOW(), id_updater = $1, updated_at = NOW()
		WHERE id_kata_terlarang = $2 AND soft_delete IS NULL`, idUpdater, id)
	if err != nil {
		return fmt.Errorf("soft delete kata: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("kata not found")
	}
	return nil
}

func derefOrEmpty(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// =============================================================================
// HANDLER
// =============================================================================

type ReservedWordsHandler struct{ repo *ReservedWordsRepository }

func NewReservedWordsHandler(repo *ReservedWordsRepository) *ReservedWordsHandler {
	return &ReservedWordsHandler{repo: repo}
}

// GET /api/v1/admin/kata-terlarang?kategori=&search=&limit=&offset=
func (h *ReservedWordsHandler) List(c *fiber.Ctx) error {
	kategori := c.Query("kategori", "")
	search := c.Query("search", "")
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.List(c.Context(), kategori, search, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	counts, _ := h.repo.CountByKategori(c.Context())
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":          rows,
			"total":          total,
			"limit":          limit,
			"offset":         offset,
			"count_kategori": counts,
		},
	})
}

// POST /api/v1/admin/kata-terlarang
func (h *ReservedWordsHandler) Create(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	idCreator, _ := uuid.Parse(uid)
	var in UpsertKataInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	k, err := h.repo.Create(c.Context(), idCreator, in)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": k})
}

// PUT /api/v1/admin/kata-terlarang/:id
func (h *ReservedWordsHandler) Update(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	uid, _ := c.Locals("user_id").(string)
	idUpdater, _ := uuid.Parse(uid)
	var in UpsertKataInput
	if err := c.BodyParser(&in); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	k, err := h.repo.Update(c.Context(), id, idUpdater, in)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": k})
}

// DELETE /api/v1/admin/kata-terlarang/:id
func (h *ReservedWordsHandler) Delete(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id")
	}
	uid, _ := c.Locals("user_id").(string)
	idUpdater, _ := uuid.Parse(uid)
	if err := h.repo.Delete(c.Context(), id, idUpdater); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// GET /api/v1/laporan/alasan-style — return kategori list buat frontend dropdown.
func (h *ReservedWordsHandler) ListKategori(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{"success": true, "data": ValidKategoriKata})
}

// RegisterReservedWordsAdminRoutes — admin-only CRUD.
func RegisterReservedWordsAdminRoutes(admin fiber.Router, h *ReservedWordsHandler) {
	g := admin.Group("/kata-terlarang")
	g.Get("/", h.List)
	g.Get("/kategori", h.ListKategori)
	g.Post("/", h.Create)
	g.Put("/:id", h.Update)
	g.Delete("/:id", h.Delete)
}
