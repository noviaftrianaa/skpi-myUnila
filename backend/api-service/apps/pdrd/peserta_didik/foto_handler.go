package pesertadidik

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
// Foto Mahasiswa — MinIO-only, path photos/pd/{id_pd}.jpg (public-read).
// Pattern mirror dengan foto dosen di modul sdm (Batch 9a).
// SIAKADU push foto via POST, client consume via GET.
// ============================================================================

const fotoMhsMaxBytes = 5 * 1024 * 1024 // 5 MB

func fotoMhsPath(idPd string) string {
	return fmt.Sprintf("photos/pd/%s.jpg", strings.ToLower(idPd))
}

// GET /v1/mahasiswa/foto_mahasiswa?id_pd=<uuid>
// Response: { id_pd, foto_url, exists }
func (h *Handler) GetFotoMahasiswa(c *fiber.Ctx) error {
	idPd := strings.TrimSpace(c.Query("id_pd"))
	if idPd == "" {
		return response.BadRequest(c, "Parameter id_pd wajib diisi", nil)
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}
	path := fotoMhsPath(idPd)
	exists := minio.Default.ObjectExists(c.Context(), path)
	return response.Success(c, "OK", fiber.Map{
		"id_pd":    idPd,
		"path":     path,
		"foto_url": minio.Default.GetPublicURL(path),
		"exists":   exists,
	})
}

// POST /v1/mahasiswa/foto_mahasiswa
// Multipart form: file=<jpg/png/webp>, id_pd=<uuid>
func (h *Handler) UploadFotoMahasiswa(c *fiber.Ctx) error {
	idPd := strings.TrimSpace(c.FormValue("id_pd"))
	if idPd == "" {
		return response.BadRequest(c, "Field id_pd wajib diisi", nil)
	}
	if minio.Default == nil {
		return response.InternalError(c, "MinIO client belum tersedia")
	}

	fh, err := c.FormFile("file")
	if err != nil {
		return response.BadRequest(c, "Field 'file' tidak ditemukan (multipart/form-data)", map[string]string{"error": err.Error()})
	}
	if fh.Size > fotoMhsMaxBytes {
		return response.BadRequest(c, "Ukuran file melebihi 5 MB", nil)
	}
	ct := strings.ToLower(fh.Header.Get("Content-Type"))
	if !isAllowedMhsImageCT(ct) {
		return response.BadRequest(c, "Format file harus image/jpeg, image/png, atau image/webp", map[string]string{"content_type": ct})
	}

	f, err := fh.Open()
	if err != nil {
		return response.InternalError(c, "Gagal membuka file")
	}
	defer f.Close()
	data, err := io.ReadAll(io.LimitReader(f, fotoMhsMaxBytes+1))
	if err != nil {
		return response.InternalError(c, "Gagal membaca isi file")
	}
	if int64(len(data)) > fotoMhsMaxBytes {
		return response.BadRequest(c, "Ukuran file melebihi 5 MB", nil)
	}

	path := fotoMhsPath(idPd)
	if err := minio.Default.PutObject(context.Background(), path, data, ct); err != nil {
		log.Printf("foto_mahasiswa upload err: %v", err)
		return response.InternalError(c, "Gagal upload ke object storage")
	}
	log.Printf("foto_mahasiswa uploaded: id_pd=%s size=%d ct=%s", idPd, len(data), ct)

	return response.Success(c, "Foto mahasiswa berhasil di-upload", fiber.Map{
		"id_pd":    idPd,
		"path":     path,
		"foto_url": minio.Default.GetPublicURL(path),
		"size":     len(data),
	})
}

func isAllowedMhsImageCT(ct string) bool {
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
