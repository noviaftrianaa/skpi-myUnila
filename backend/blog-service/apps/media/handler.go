package media

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/myunila/blog-service/external/minio"
)

// Per-blog upload quota (bytes). Bumpable via config later.
const MaxBlogStorageBytes int64 = 500 * 1024 * 1024 // 500 MB

type Handler struct {
	repo    *Repository
	storage *minio.Client
	db      *sqlx.DB
}

func NewHandler(repo *Repository, storage *minio.Client, db *sqlx.DB) *Handler {
	return &Handler{repo: repo, storage: storage, db: db}
}

// resolveBlog — read id_blog from Locals (set by interaction.ResolveBlogMiddleware).
func resolveBlog(c *fiber.Ctx) (uuid.UUID, error) {
	s, _ := c.Locals("id_blog").(string)
	if s == "" {
		return uuid.Nil, fiber.NewError(fiber.StatusUnauthorized, "id_blog not resolved (middleware missing?)")
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return uuid.Nil, fiber.NewError(fiber.StatusBadRequest, "invalid id_blog UUID")
	}
	return id, nil
}

func randomHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// buildPath = {id_blog}/{yyyy}/{mm}/{uuid}{ext} — per-blog folder isolation.
// Note: ext is taken from the *sanitised* filename (validation has already
// confirmed it's in the allow-list and matches the sniffed content type).
func buildPath(idBlog uuid.UUID, ext string) string {
	now := time.Now().UTC()
	return fmt.Sprintf("%s/%04d/%02d/%s%s",
		idBlog, now.Year(), int(now.Month()), randomHex(12), ext)
}

// POST /api/v1/me/blog/media
// multipart/form-data: field "file" (required), "alt_text" (optional).
func (h *Handler) Upload(c *fiber.Ctx) error {
	if h.storage == nil {
		return fiber.NewError(fiber.StatusServiceUnavailable, "storage not configured")
	}

	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	uid, _ := c.Locals("user_id").(string)
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}

	fh, err := c.FormFile("file")
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "missing form field 'file'")
	}

	// Step 1 — cheap metadata validation (size, extension, per-jenis cap).
	declaredMIME := fh.Header.Get("Content-Type")
	ext, jenis, _, verr := ValidateUpload(fh.Filename, declaredMIME, fh.Size)
	if verr != nil {
		return fiber.NewError(fiber.StatusBadRequest, verr.Error())
	}

	// Step 2 — per-blog quota check (cheap: SUM via index).
	if usage, uerr := h.repo.Usage(c.Context(), idBlog); uerr == nil {
		if usage.TotalBytes+fh.Size > MaxBlogStorageBytes {
			return fiber.NewError(fiber.StatusInsufficientStorage,
				fmt.Sprintf("quota exceeded (%d MB used, %d MB cap)",
					usage.TotalBytes/1024/1024, MaxBlogStorageBytes/1024/1024))
		}
	}

	// Step 3 — open the file once for content-byte sniffing. We re-open it later
	// for the actual stream-to-MinIO so the sniffed 512 bytes don't get
	// consumed.
	sniffReader, err := fh.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "open upload: "+err.Error())
	}
	sniffedMIME, sniffErr := SniffMIME(sniffReader)
	_ = sniffReader.Close()
	if sniffErr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "sniff content: "+sniffErr.Error())
	}

	// Step 4 — reconcile declared / sniffed / extension. All three must point
	// at the same jenis. The sniffed MIME wins because the client can't lie
	// about content bytes.
	mime, agreeErr := CheckMIMEAgreement(declaredMIME, sniffedMIME, ext, jenis)
	if agreeErr != nil {
		return fiber.NewError(fiber.StatusUnsupportedMediaType, agreeErr.Error())
	}

	// Step 5 — open a fresh reader for the actual upload. Images get fully
	// buffered so we can decode dimensions (and later: generate variants).
	src, err := fh.Open()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "reopen upload: "+err.Error())
	}
	defer src.Close()

	var lebar, tinggi *int
	var bodyForUpload io.Reader = src
	var imageBytes []byte
	if jenis == JenisImage {
		buf, rerr := io.ReadAll(src)
		if rerr != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "read upload: "+rerr.Error())
		}
		imageBytes = buf
		if img, _, derr := image.DecodeConfig(strings.NewReader(string(buf))); derr == nil {
			w, h := img.Width, img.Height
			// Step 5a — image bomb guard: reject decoded pixel count > cap.
			if int64(w)*int64(h) > MaxImagePixels {
				return fiber.NewError(fiber.StatusRequestEntityTooLarge,
					fmt.Sprintf("image too large: %d×%d px exceeds %d-pixel cap", w, h, MaxImagePixels))
			}
			lebar, tinggi = &w, &h
		}
		bodyForUpload = strings.NewReader(string(buf))
	}

	path := buildPath(idBlog, ext)
	publicURL, perr := h.storage.PutObjectStream(c.Context(), path, bodyForUpload, fh.Size, mime)
	if perr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "minio upload: "+perr.Error())
	}

	// Step 6 — image variants (thumb/medium/large). Best-effort: if generation
	// fails, the original is still saved.
	varianJSON := map[string]string{}
	if jenis == JenisImage && len(imageBytes) > 0 && lebar != nil && tinggi != nil {
		if vmap, gerr := h.generateVariants(c.Context(), path, imageBytes, *lebar); gerr != nil {
			log.Printf("media.Upload variants: %v", gerr)
		} else {
			varianJSON = vmap
		}
	}

	var altPtr *string
	if alt := strings.TrimSpace(c.FormValue("alt_text")); alt != "" {
		clean := SanitiseAltText(alt)
		altPtr = &clean
	}

	m, ierr := h.repo.Insert(c.Context(), InsertInput{
		IDBlog:         idBlog,
		IDPenggunaPdut: idUser,
		NamaFile:       SanitiseFilename(fh.Filename),
		PathStorage:    path,
		URLPublik:      publicURL,
		MimeType:       mime,
		UkuranBytes:    fh.Size,
		LebarPx:        lebar,
		TinggiPx:       tinggi,
		JenisMedia:     jenis,
		AltText:        altPtr,
		VarianJSON:     varianJSON,
	})
	if ierr != nil {
		// Best-effort cleanup so we don't leave an orphan in MinIO.
		_ = h.storage.RemoveObject(c.Context(), path)
		for _, vpath := range varianJSON {
			if p := stripPublicURL(vpath); p != "" {
				_ = h.storage.RemoveObject(c.Context(), p)
			}
		}
		return fiber.NewError(fiber.StatusInternalServerError, "db insert: "+ierr.Error())
	}
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": m})
}

// stripPublicURL extracts the MinIO path from a public URL (best-effort, only
// for the cleanup orphan-deletion case where the URL is one we minted ourselves).
func stripPublicURL(url string) string {
	if i := strings.Index(url, "/blog-media/"); i >= 0 {
		return strings.TrimPrefix(url[i:], "/blog-media/")
	}
	return ""
}

// SanitiseAltText keeps alt text to plain printable text — strip control chars,
// limit length. Alt text is rendered as HTML attribute downstream, so escape
// happens at the template layer, but we still trim hostile junk here.
func SanitiseAltText(s string) string {
	s = strings.TrimSpace(s)
	// Strip control characters
	out := make([]rune, 0, len(s))
	for _, r := range s {
		if r < 0x20 || r == 0x7f {
			continue
		}
		out = append(out, r)
	}
	clean := string(out)
	if len(clean) > 255 {
		clean = clean[:255]
	}
	return clean
}

// GET /api/v1/me/blog/media?jenis=image&limit=30&offset=0
func (h *Handler) List(c *fiber.Ctx) error {
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	jenis := c.Query("jenis")
	limit := c.QueryInt("limit", 30)
	offset := c.QueryInt("offset", 0)

	items, total, lerr := h.repo.List(c.Context(), ListParams{
		IDBlog: idBlog, Jenis: jenis, Limit: limit, Offset: offset,
	})
	if lerr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, lerr.Error())
	}
	usage, _ := h.repo.Usage(c.Context(), idBlog)
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":          items,
			"total":          total,
			"limit":          limit,
			"offset":         offset,
			"usage":          usage,
			"quota_bytes":    MaxBlogStorageBytes,
			"max_file_bytes": HardCapBytes,
			"limits":         PerJenisLimits,
		},
	})
}

// DELETE /api/v1/me/blog/media/:id
func (h *Handler) Delete(c *fiber.Ctx) error {
	idMedia, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_media")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	m, gerr := h.repo.GetByID(c.Context(), idMedia, idBlog)
	if gerr != nil {
		if errors.Is(gerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "media not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, gerr.Error())
	}
	if derr := h.repo.SoftDelete(c.Context(), idMedia, idBlog); derr != nil {
		return fiber.NewError(fiber.StatusInternalServerError, derr.Error())
	}
	if h.storage != nil {
		if rerr := h.storage.RemoveObject(c.Context(), m.PathStorage); rerr != nil {
			log.Printf("media.Delete: minio remove %s failed: %v", m.PathStorage, rerr)
		}
		// Also wipe variants so we don't leak storage.
		for _, vurl := range m.VarianJSON {
			if vp := stripPublicURL(vurl); vp != "" {
				_ = h.storage.RemoveObject(c.Context(), vp)
			}
		}
	}
	return c.JSON(fiber.Map{"success": true})
}

// PATCH /api/v1/me/blog/media/:id — body { alt_text?, caption? }
func (h *Handler) UpdateMeta(c *fiber.Ctx) error {
	idMedia, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_media")
	}
	idBlog, err := resolveBlog(c)
	if err != nil {
		return err
	}
	var body struct {
		AltText *string `json:"alt_text"`
		Caption *string `json:"caption"`
	}
	if perr := c.BodyParser(&body); perr != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	// Sanitise free-text fields before persisting (defense in depth — the
	// frontend escapes on render too).
	if body.AltText != nil {
		clean := SanitiseAltText(*body.AltText)
		body.AltText = &clean
	}
	if body.Caption != nil {
		clean := SanitiseAltText(*body.Caption)
		// Caption can be longer than alt text — bump cap if you want richer
		// captions later. For now share the same sanitiser.
		if len(clean) > 1000 {
			clean = clean[:1000]
		}
		body.Caption = &clean
	}
	m, uerr := h.repo.UpdateMeta(c.Context(), idMedia, idBlog, UpdateMetaInput{
		AltText: body.AltText, Caption: body.Caption,
	})
	if uerr != nil {
		if errors.Is(uerr, ErrNotFound) {
			return fiber.NewError(fiber.StatusNotFound, "media not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, uerr.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": m})
}

// RegisterMineRoutes mounts owner endpoints under /me.
func RegisterMineRoutes(me fiber.Router, h *Handler) {
	g := me.Group("/blog/media")
	g.Post("/", h.Upload)
	g.Get("/", h.List)
	g.Delete("/:id", h.Delete)
	g.Patch("/:id", h.UpdateMeta)
}

// Keep the import live for downstream users that still reference the package
// without the validation helpers directly.
var _ = filepath.Base
