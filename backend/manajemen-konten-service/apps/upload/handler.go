// Package upload — file upload ke Docker volume (banner image).
//
// Endpoint:
//   POST /upload — multipart/form-data, field "file"
//   Returns: { url: "/man-konten/uploads/<unique>.<ext>" }
//
// Storage path: ${UPLOAD_DIR} (Docker volume `man-konten-uploads`)
// Public URL: ${UPLOAD_BASE_URL} + /<filename>
//
// Limits (Phase 2A):
//   - Max 5MB (image-level)
//   - Allowed: jpg, jpeg, png, webp, gif (banner / inline image)
//   - Filename: random hex 16 + original extension (collision-safe)
package upload

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/manajemen-konten-service/internal/config"
	"github.com/myunila/manajemen-konten-service/internal/middleware"
)

const (
	maxUploadSize = 5 * 1024 * 1024 // 5 MB
)

var allowedExt = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".webp": true,
	".gif":  true,
}

func Init(router fiber.Router) {
	g := router.Group("/upload", middleware.RequireAuth(), middleware.RequireRole("developer"))
	g.Post("/", handleUpload)
}

func handleUpload(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "field 'file' required"})
	}

	if file.Size > maxUploadSize {
		return c.Status(413).JSON(fiber.Map{"success": false, "message": fmt.Sprintf("max %dMB", maxUploadSize/1024/1024)})
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExt[ext] {
		return c.Status(400).JSON(fiber.Map{"success": false, "message": "ext not allowed: " + ext})
	}

	// random filename — 16 byte hex + ext
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "rand fail: " + err.Error()})
	}
	fname := hex.EncodeToString(b) + ext
	dst := filepath.Join(config.Cfg.Storage.UploadDir, fname)

	if err := c.SaveFile(file, dst); err != nil {
		return c.Status(500).JSON(fiber.Map{"success": false, "message": "save fail: " + err.Error()})
	}

	publicURL := strings.TrimRight(config.Cfg.Storage.BaseURL, "/") + "/" + fname
	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"filename":  fname,
			"url":       publicURL,
			"size":      file.Size,
			"mime_type": file.Header.Get("Content-Type"),
		},
	})
}
