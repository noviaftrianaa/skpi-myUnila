// Package media — file uploads to MinIO bucket blog-media.
// Schema: media.media. Per-blog folder isolation via path prefix.
package media

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// VarianMap — JSONB column scanned via custom Scan/Value. Maps variant name
// ("thumb", "medium", "large") to its public URL.
type VarianMap map[string]string

func (v *VarianMap) Scan(src any) error {
	if src == nil {
		*v = VarianMap{}
		return nil
	}
	var b []byte
	switch s := src.(type) {
	case []byte:
		b = s
	case string:
		b = []byte(s)
	default:
		return fmt.Errorf("VarianMap: unsupported scan type %T", src)
	}
	if len(b) == 0 {
		*v = VarianMap{}
		return nil
	}
	return json.Unmarshal(b, v)
}

func (v VarianMap) Value() (driver.Value, error) {
	if v == nil {
		return "{}", nil
	}
	return json.Marshal(v)
}

var ErrNotFound = errors.New("media not found")

// JenisMedia values match the chk_media_jenis constraint.
const (
	JenisImage    = "image"
	JenisVideo    = "video"
	JenisAudio    = "audio"
	JenisDocument = "document"
	JenisOther    = "other"
)

type Media struct {
	IDMedia        uuid.UUID  `db:"id_media"        json:"id_media"`
	IDBlog         uuid.UUID  `db:"id_blog"         json:"id_blog"`
	IDPenggunaPdut uuid.UUID  `db:"id_pengguna_pdut" json:"id_pengguna_pdut"`
	NamaFile       string     `db:"nama_file"       json:"nama_file"`
	PathStorage    string     `db:"path_storage"    json:"path_storage"`
	URLPublik      string     `db:"url_publik"      json:"url_publik"`
	MimeType       string     `db:"mime_type"       json:"mime_type"`
	UkuranBytes    int64      `db:"ukuran_bytes"    json:"ukuran_bytes"`
	LebarPx        *int       `db:"lebar_px"        json:"lebar_px,omitempty"`
	TinggiPx       *int       `db:"tinggi_px"       json:"tinggi_px,omitempty"`
	DurasiDetik    *int       `db:"durasi_detik"    json:"durasi_detik,omitempty"`
	VarianJSON     VarianMap  `db:"varian_json"     json:"varian_json"`
	AltText        *string    `db:"alt_text"        json:"alt_text,omitempty"`
	Caption        *string    `db:"caption"         json:"caption,omitempty"`
	JenisMedia     string     `db:"jenis_media"     json:"jenis_media"`
	CreatedAt      time.Time  `db:"created_at"      json:"created_at"`
	UpdatedAt      time.Time  `db:"updated_at"      json:"updated_at"`
	SoftDelete     *time.Time `db:"soft_delete"     json:"soft_delete,omitempty"`
}

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

type InsertInput struct {
	IDBlog         uuid.UUID
	IDPenggunaPdut uuid.UUID
	NamaFile       string
	PathStorage    string
	URLPublik      string
	MimeType       string
	UkuranBytes    int64
	LebarPx        *int
	TinggiPx       *int
	JenisMedia     string
	AltText        *string
	VarianJSON     VarianMap
}

func (r *Repository) Insert(ctx context.Context, in InsertInput) (*Media, error) {
	varian := in.VarianJSON
	if varian == nil {
		varian = VarianMap{}
	}
	varianBytes, _ := json.Marshal(varian)

	var m Media
	err := r.db.GetContext(ctx, &m, `
		INSERT INTO media.media
		    (id_blog, id_pengguna_pdut, nama_file, path_storage, url_publik,
		     mime_type, ukuran_bytes, lebar_px, tinggi_px, jenis_media, alt_text,
		     varian_json, id_creator)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$2)
		RETURNING
		    id_media, id_blog, id_pengguna_pdut, nama_file, path_storage, url_publik,
		    mime_type, ukuran_bytes, lebar_px, tinggi_px, durasi_detik, varian_json,
		    alt_text, caption, jenis_media, created_at, updated_at, soft_delete`,
		in.IDBlog, in.IDPenggunaPdut, in.NamaFile, in.PathStorage, in.URLPublik,
		in.MimeType, in.UkuranBytes, in.LebarPx, in.TinggiPx, in.JenisMedia, in.AltText,
		string(varianBytes))
	if err != nil {
		return nil, fmt.Errorf("insert media: %w", err)
	}
	return &m, nil
}

type ListParams struct {
	IDBlog uuid.UUID
	Jenis  string // optional filter; "" = all
	Limit  int
	Offset int
}

func (r *Repository) List(ctx context.Context, p ListParams) ([]Media, int, error) {
	if p.Limit <= 0 || p.Limit > 100 {
		p.Limit = 30
	}
	where := "id_blog = $1 AND soft_delete IS NULL"
	args := []any{p.IDBlog}
	if p.Jenis != "" {
		where += " AND jenis_media = $2"
		args = append(args, p.Jenis)
	}

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM media.media WHERE "+where, args...); err != nil {
		return nil, 0, fmt.Errorf("count media: %w", err)
	}

	limitArg := len(args) + 1
	offsetArg := len(args) + 2
	args = append(args, p.Limit, p.Offset)
	q := fmt.Sprintf(`
		SELECT id_media, id_blog, id_pengguna_pdut, nama_file, path_storage, url_publik,
		       mime_type, ukuran_bytes, lebar_px, tinggi_px, durasi_detik, varian_json,
		       alt_text, caption, jenis_media, created_at, updated_at, soft_delete
		FROM media.media
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d`, where, limitArg, offsetArg)

	rows := make([]Media, 0)
	if err := r.db.SelectContext(ctx, &rows, q, args...); err != nil {
		return nil, 0, fmt.Errorf("list media: %w", err)
	}
	return rows, total, nil
}

// GetByID returns the media row only if it belongs to idBlog (ownership check).
func (r *Repository) GetByID(ctx context.Context, idMedia, idBlog uuid.UUID) (*Media, error) {
	var m Media
	err := r.db.GetContext(ctx, &m, `
		SELECT id_media, id_blog, id_pengguna_pdut, nama_file, path_storage, url_publik,
		       mime_type, ukuran_bytes, lebar_px, tinggi_px, durasi_detik, varian_json,
		       alt_text, caption, jenis_media, created_at, updated_at, soft_delete
		FROM media.media
		WHERE id_media = $1 AND id_blog = $2 AND soft_delete IS NULL`, idMedia, idBlog)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("get media: %w", err)
	}
	return &m, nil
}

// SoftDelete marks the row deleted. The actual MinIO object removal is the
// caller's responsibility (handler invokes storage.RemoveObject after this).
func (r *Repository) SoftDelete(ctx context.Context, idMedia, idBlog uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE media.media
		SET soft_delete = NOW(), updated_at = NOW()
		WHERE id_media = $1 AND id_blog = $2 AND soft_delete IS NULL`, idMedia, idBlog)
	if err != nil {
		return fmt.Errorf("soft delete media: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

type UpdateMetaInput struct {
	AltText *string
	Caption *string
}

func (r *Repository) UpdateMeta(ctx context.Context, idMedia, idBlog uuid.UUID, in UpdateMetaInput) (*Media, error) {
	res, err := r.db.ExecContext(ctx, `
		UPDATE media.media
		SET alt_text = COALESCE($3, alt_text),
		    caption  = COALESCE($4, caption),
		    updated_at = NOW()
		WHERE id_media = $1 AND id_blog = $2 AND soft_delete IS NULL`,
		idMedia, idBlog, in.AltText, in.Caption)
	if err != nil {
		return nil, fmt.Errorf("update media meta: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, ErrNotFound
	}
	return r.GetByID(ctx, idMedia, idBlog)
}

// UsageStats summarises bucket usage per blog (for quota display).
type UsageStats struct {
	TotalBytes int64 `db:"total_bytes" json:"total_bytes"`
	TotalCount int   `db:"total_count" json:"total_count"`
}

func (r *Repository) Usage(ctx context.Context, idBlog uuid.UUID) (UsageStats, error) {
	var s UsageStats
	err := r.db.GetContext(ctx, &s, `
		SELECT COALESCE(SUM(ukuran_bytes), 0)::BIGINT AS total_bytes,
		       COUNT(*)::INT AS total_count
		FROM media.media
		WHERE id_blog = $1 AND soft_delete IS NULL`, idBlog)
	if err != nil {
		return s, fmt.Errorf("usage: %w", err)
	}
	return s, nil
}
