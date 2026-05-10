// Package photo handles foto user yang sedang login (POST upload, DELETE,
// GET info). Endpoint protected via Kong JWT — user_id diambil dari Locals.
//
// Resolusi path:
//
//	dosen     → photos/sdm/{id_sdm_pengguna}.jpg
//	mahasiswa → photos/pd/{id_pd_pengguna}.jpg
//	tendik    → photos/tendik/{NIP}.jpg     (NIP dari sikep.pegawai by id_user_sikep)
package photo

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	_ "image/png" // register PNG decoder
	"io"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"golang.org/x/image/draw"
	_ "golang.org/x/image/webp" // register WebP decoder

	"github.com/myunila/api-service/external/minio"
	"github.com/myunila/api-service/internal/response"
)

const (
	fotoMaxBytes        = 2 * 1024 * 1024 // 2 MB max upload (input — pre-resize)
	fotoTargetMaxDim    = 800             // resize ke max 800 px (sisi terpanjang)
	fotoOutputQuality   = 85              // JPEG quality output (re-encode)
	fotoMinDim          = 100             // reject foto < 100x100 (avatar tidak masuk akal)
)

// processProfileImage decode → resize ke max 800x800 (preserve aspect) →
// re-encode JPEG 85%. Stripping EXIF/metadata terjadi otomatis di re-encode.
// Defensive: backend tidak boleh trust frontend (curl bisa bypass crop).
func processProfileImage(data []byte) ([]byte, error) {
	src, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("decode (format=%s): %w", format, err)
	}
	bounds := src.Bounds()
	w, h := bounds.Dx(), bounds.Dy()
	if w < fotoMinDim || h < fotoMinDim {
		return nil, fmt.Errorf("dimensi terlalu kecil (%dx%d, minimum %dx%d)", w, h, fotoMinDim, fotoMinDim)
	}

	var dst image.Image = src
	if w > fotoTargetMaxDim || h > fotoTargetMaxDim {
		var dw, dh int
		if w >= h {
			dw = fotoTargetMaxDim
			dh = h * fotoTargetMaxDim / w
		} else {
			dh = fotoTargetMaxDim
			dw = w * fotoTargetMaxDim / h
		}
		rgba := image.NewRGBA(image.Rect(0, 0, dw, dh))
		draw.CatmullRom.Scale(rgba, rgba.Bounds(), src, bounds, draw.Over, nil)
		dst = rgba
	}

	var buf bytes.Buffer
	if err := jpeg.Encode(&buf, dst, &jpeg.Options{Quality: fotoOutputQuality}); err != nil {
		return nil, fmt.Errorf("encode jpeg: %w", err)
	}
	return buf.Bytes(), nil
}

type Handler struct {
	db *sqlx.DB
}

func NewHandler(db *sqlx.DB) *Handler { return &Handler{db: db} }

type userPhotoTarget struct {
	Kind string // sdm | pd | tendik
	Key  string // id_sdm | id_pd | nip
}

// resolveTarget query man_akses.pengguna untuk dapat jenis user, lalu (kalau
// tendik) lookup NIP dari sikep.pegawai.
func (h *Handler) resolveTarget(ctx context.Context, idPengguna string) (*userPhotoTarget, error) {
	var row struct {
		IDSdm     *string `db:"id_sdm_pengguna"`
		IDPd      *string `db:"id_pd_pengguna"`
		IDUSikep  *string `db:"id_user_sikep"`
	}
	q := `SELECT id_sdm_pengguna, id_pd_pengguna, id_user_sikep FROM man_akses.pengguna WHERE id_pengguna = @p1`
	if err := h.db.GetContext(ctx, &row, q, idPengguna); err != nil {
		return nil, fmt.Errorf("lookup pengguna: %w", err)
	}

	if row.IDSdm != nil && *row.IDSdm != "" {
		return &userPhotoTarget{Kind: "sdm", Key: strings.ToLower(*row.IDSdm)}, nil
	}
	if row.IDPd != nil && *row.IDPd != "" {
		// id_pd di MinIO disimpan UPPERCASE (mengikuti hasil upload tools FOTOMHS)
		return &userPhotoTarget{Kind: "pd", Key: strings.ToUpper(*row.IDPd)}, nil
	}
	if row.IDUSikep != nil && *row.IDUSikep != "" {
		// Tendik foto naming pakai uuid_pegawai (kolom UNIQUEIDENTIFIER) — stabil
		// independen dari NIP. NIP bisa berubah/null untuk honorer; UUID generated
		// otomatis via DEFAULT NEWID(). Lihat data-model/script/sqlserver/
		// alter_sikep_pegawai_add_uuid.sql.
		var uuidPeg *string
		err := h.db.GetContext(ctx, &uuidPeg,
			`SELECT LOWER(CONVERT(VARCHAR(36), uuid_pegawai)) FROM sikep.pegawai WHERE id_pegawai = @p1`,
			*row.IDUSikep)
		if err == nil && uuidPeg != nil {
			u := strings.TrimSpace(*uuidPeg)
			if u != "" {
				return &userPhotoTarget{Kind: "tendik", Key: u}, nil
			}
		}
	}
	return nil, fmt.Errorf("user tidak punya id_sdm/id_pd/id_user_sikep dengan NIP")
}

func (t *userPhotoTarget) path() string {
	return fmt.Sprintf("photos/%s/%s.jpg", t.Kind, t.Key)
}

func userIDFrom(c *fiber.Ctx) string {
	if v, ok := c.Locals("user_id").(string); ok {
		return strings.TrimSpace(v)
	}
	return ""
}

// GET /v1/me/foto — info foto user (path, url, exists).
func (h *Handler) GetMyPhoto(c *fiber.Ctx) error {
	uid := userIDFrom(c)
	if uid == "" {
		return response.Unauthorized(c, "Token user tidak valid")
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}
	t, err := h.resolveTarget(c.Context(), uid)
	if err != nil {
		return response.NotFound(c, "Foto tidak tersedia: "+err.Error())
	}
	p := t.path()
	return response.Success(c, "OK", fiber.Map{
		"kind":     t.Kind,
		"path":     p,
		"foto_url": minio.Default.GetPublicURL(p),
		"exists":   minio.Default.ObjectExists(c.Context(), p),
	})
}

// POST /v1/me/foto — upload foto user (multipart file). Overwrite kalau sudah ada.
func (h *Handler) UploadMyPhoto(c *fiber.Ctx) error {
	uid := userIDFrom(c)
	if uid == "" {
		return response.Unauthorized(c, "Token user tidak valid")
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}
	t, err := h.resolveTarget(c.Context(), uid)
	if err != nil {
		return response.BadRequest(c, "Tidak bisa resolve target foto: "+err.Error(), nil)
	}

	fh, err := c.FormFile("file")
	if err != nil {
		return response.BadRequest(c, "Field 'file' tidak ditemukan (multipart/form-data)", map[string]string{"error": err.Error()})
	}
	if fh.Size > fotoMaxBytes {
		return response.BadRequest(c, "Ukuran file melebihi 2 MB", nil)
	}
	ct := strings.ToLower(fh.Header.Get("Content-Type"))
	if !isAllowedImageCT(ct) {
		return response.BadRequest(c, "Format file harus image/jpeg, image/png, atau image/webp", map[string]string{"content_type": ct})
	}

	f, err := fh.Open()
	if err != nil {
		return response.InternalError(c, "Gagal membuka file")
	}
	defer f.Close()
	data, err := io.ReadAll(io.LimitReader(f, fotoMaxBytes+1))
	if err != nil {
		return response.InternalError(c, "Gagal membaca isi file")
	}
	if int64(len(data)) > fotoMaxBytes {
		return response.BadRequest(c, "Ukuran file melebihi 2 MB", nil)
	}

	// Defensive re-process: decode → resize → re-encode JPEG. Strip EXIF.
	processed, err := processProfileImage(data)
	if err != nil {
		log.Printf("me-foto invalid uid=%s err=%v", uid, err)
		return response.BadRequest(c, "File foto tidak valid atau rusak", map[string]string{
			"detail": err.Error(),
		})
	}

	p := t.path()
	if err := minio.Default.PutObject(c.Context(), p, processed, "image/jpeg"); err != nil {
		log.Printf("me-foto upload err uid=%s path=%s: %v", uid, p, err)
		return response.InternalError(c, "Gagal upload ke object storage")
	}
	log.Printf("me-foto uploaded: uid=%s kind=%s path=%s size=%d→%d ct=%s",
		uid, t.Kind, p, len(data), len(processed), ct)
	return response.Success(c, "Foto berhasil di-upload", fiber.Map{
		"kind":          t.Kind,
		"path":          p,
		"foto_url":      minio.Default.GetPublicURL(p),
		"size_uploaded": len(data),
		"size_stored":   len(processed),
	})
}

// DELETE /v1/me/foto — hapus foto user.
func (h *Handler) DeleteMyPhoto(c *fiber.Ctx) error {
	uid := userIDFrom(c)
	if uid == "" {
		return response.Unauthorized(c, "Token user tidak valid")
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}
	t, err := h.resolveTarget(c.Context(), uid)
	if err != nil {
		return response.BadRequest(c, "Tidak bisa resolve target foto: "+err.Error(), nil)
	}
	p := t.path()
	if !minio.Default.ObjectExists(c.Context(), p) {
		return response.Success(c, "Foto tidak ada", fiber.Map{"path": p, "removed": false})
	}
	if err := minio.Default.RemoveObject(c.Context(), p); err != nil {
		log.Printf("me-foto delete err uid=%s path=%s: %v", uid, p, err)
		return response.InternalError(c, "Gagal hapus dari object storage")
	}
	log.Printf("me-foto deleted: uid=%s kind=%s path=%s", uid, t.Kind, p)
	return response.Success(c, "Foto berhasil dihapus", fiber.Map{"path": p, "removed": true})
}

func isAllowedImageCT(ct string) bool {
	// strip charset (e.g. "image/jpeg; charset=utf-8")
	if i := strings.Index(ct, ";"); i >= 0 {
		ct = strings.TrimSpace(ct[:i])
	}
	switch ct {
	case "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp":
		return true
	}
	return false
}
