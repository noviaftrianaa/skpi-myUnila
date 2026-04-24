package sdm

import (
	"context"
	"fmt"
	"io"
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"

	"github.com/myunila/api-service/external/minio"
	"github.com/myunila/api-service/internal/response"
)

// ============================================================================
// Foto Dosen — MinIO-only, path photos/sdm/{id_sdm}.jpg (public-read).
// GET return URL public (+ exists flag). POST upload multipart file.
// ============================================================================

const fotoSDMMaxBytes = 5 * 1024 * 1024 // 5 MB

func fotoSDMPath(idSDM string) string {
	return fmt.Sprintf("photos/sdm/%s.jpg", strings.ToLower(idSDM))
}

// GET /v1/sdm/foto_dosen?id_sdm=<uuid>
// Response: { id_sdm, foto_url, exists, public_url_source: "minio" }
// Catatan: karena bucket policy sudah set photos/* public-read, URL yang
// dikembalikan bisa langsung dipakai di <img src>. Tidak ada presigned token.
func (h *Handler) GetFotoDosen(c *fiber.Ctx) error {
	idSDM := strings.TrimSpace(c.Query("id_sdm"))
	if idSDM == "" {
		return response.BadRequest(c, "Parameter id_sdm wajib diisi", nil)
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}
	path := fotoSDMPath(idSDM)
	ctx := c.Context()
	exists := minio.Default.ObjectExists(ctx, path)
	return response.Success(c, "OK", fiber.Map{
		"id_sdm":   idSDM,
		"path":     path,
		"foto_url": minio.Default.GetPublicURL(path),
		"exists":   exists,
	})
}

// POST /v1/sdm/foto_dosen
// Multipart form: file=<jpg/png/webp>, id_sdm=<uuid>
func (h *Handler) UploadFotoDosen(c *fiber.Ctx) error {
	idSDM := strings.TrimSpace(c.FormValue("id_sdm"))
	if idSDM == "" {
		return response.BadRequest(c, "Field id_sdm wajib diisi", nil)
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}

	fh, err := c.FormFile("file")
	if err != nil {
		return response.BadRequest(c, "Field 'file' tidak ditemukan (multipart/form-data)", map[string]string{"error": err.Error()})
	}
	if fh.Size > fotoSDMMaxBytes {
		return response.BadRequest(c, "Ukuran file melebihi 5 MB", nil)
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
	data, err := io.ReadAll(io.LimitReader(f, fotoSDMMaxBytes+1))
	if err != nil {
		return response.InternalError(c, "Gagal membaca isi file")
	}
	if int64(len(data)) > fotoSDMMaxBytes {
		return response.BadRequest(c, "Ukuran file melebihi 5 MB", nil)
	}

	path := fotoSDMPath(idSDM)
	if err := minio.Default.PutObject(context.Background(), path, data, ct); err != nil {
		log.Printf("foto_dosen upload err: %v", err)
		return response.InternalError(c, "Gagal upload ke object storage")
	}
	log.Printf("foto_dosen uploaded: id_sdm=%s size=%d ct=%s", idSDM, len(data), ct)

	return response.Success(c, "Foto dosen berhasil di-upload", fiber.Map{
		"id_sdm":   idSDM,
		"path":     path,
		"foto_url": minio.Default.GetPublicURL(path),
		"size":     len(data),
	})
}

func isAllowedImageCT(ct string) bool {
	switch ct {
	case "image/jpeg", "image/jpg", "image/pjpeg":
		return true
	case "image/png":
		return true
	case "image/webp":
		return true
	}
	return false
}
