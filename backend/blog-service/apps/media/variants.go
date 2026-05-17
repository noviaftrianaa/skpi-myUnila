package media

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"path/filepath"
	"strings"

	"github.com/disintegration/imaging"
)

var whiteColor = color.NRGBA{R: 255, G: 255, B: 255, A: 255}

// =============================================================================
// IMAGE VARIANTS
//
// On image upload we generate three derived sizes optimised for different
// surfaces:
//   - thumb  (320w) — grid cards in the media picker / library, blog grid
//   - medium (800w) — inline editor previews, in-article images
//   - large  (1600w) — cover hero / lightbox; skipped if original is smaller
//
// All variants are encoded as JPEG (quality 82) for predictable file size, even
// when the source is PNG. The original PNG is preserved untouched.
// PNG sources with transparency are flattened against white before JPEG encode.
//
// Variants live alongside the original in MinIO under the same per-blog prefix:
//   {id_blog}/{yyyy}/{mm}/{hex}.{ext}         ← original (untouched)
//   {id_blog}/{yyyy}/{mm}/{hex}.thumb.jpg     ← 320w variant
//   {id_blog}/{yyyy}/{mm}/{hex}.medium.jpg    ← 800w variant
//   {id_blog}/{yyyy}/{mm}/{hex}.large.jpg     ← 1600w variant (when applicable)
// =============================================================================

const (
	thumbWidth  = 320
	mediumWidth = 800
	largeWidth  = 1600
	jpegQuality = 82
)

type variantSpec struct {
	name  string
	width int
}

// generateVariants resizes the original image bytes into derivatives and
// uploads each to MinIO. Returns a map[name]publicURL for media.varian_json.
// Errors here are non-fatal at the caller — the original upload already
// succeeded and missing variants just mean the frontend falls back to the
// original URL.
func (h *Handler) generateVariants(ctx context.Context, originalPath string, src []byte, originalWidth int) (map[string]string, error) {
	if h.storage == nil {
		return nil, fmt.Errorf("storage not configured")
	}
	img, _, err := image.Decode(bytes.NewReader(src))
	if err != nil {
		return nil, fmt.Errorf("decode source: %w", err)
	}

	// PNG with alpha: composite over white so the resulting JPEG doesn't get
	// dark fringing on transparent pixels.
	if hasAlpha(img) {
		bg := imaging.New(img.Bounds().Dx(), img.Bounds().Dy(), whiteColor)
		img = imaging.Overlay(bg, img, image.Pt(0, 0), 1.0)
	}

	specs := []variantSpec{
		{"thumb", thumbWidth},
		{"medium", mediumWidth},
	}
	// Only generate large if the source is wider than medium (otherwise it'd
	// be the same image as medium, wasting storage).
	if originalWidth > mediumWidth {
		specs = append(specs, variantSpec{"large", largeWidth})
	}

	stem, ext := splitStemExt(originalPath)
	out := map[string]string{}

	for _, sp := range specs {
		// Don't upscale: cap target width at the source width.
		w := sp.width
		if w > originalWidth {
			w = originalWidth
		}
		resized := imaging.Resize(img, w, 0, imaging.Lanczos)

		var buf bytes.Buffer
		if err := jpeg.Encode(&buf, resized, &jpeg.Options{Quality: jpegQuality}); err != nil {
			return out, fmt.Errorf("encode %s: %w", sp.name, err)
		}

		variantPath := fmt.Sprintf("%s.%s.jpg", stem, sp.name)
		url, err := h.storage.PutObjectStream(ctx, variantPath, bytes.NewReader(buf.Bytes()), int64(buf.Len()), "image/jpeg")
		if err != nil {
			return out, fmt.Errorf("upload %s: %w", sp.name, err)
		}
		out[sp.name] = url
	}

	// Reference the original-extension version (jpg/png/gif/webp) under "original"
	// so consumers have a single canonical map to dereference. Falls back to
	// the original public URL if storage doesn't expose it via the client.
	out["original"] = h.storage.GetPublicURL(originalPath)
	_ = ext // ext retained for symmetry; future variants could keep source extension
	return out, nil
}

// splitStemExt splits "a/b/c/foo.png" into ("a/b/c/foo", ".png").
func splitStemExt(p string) (stem, ext string) {
	ext = filepath.Ext(p)
	stem = strings.TrimSuffix(p, ext)
	return stem, ext
}

// hasAlpha checks whether the image's color model carries an alpha channel.
// Cheap heuristic: PNG/WebP often have alpha; JPEG never does.
func hasAlpha(img image.Image) bool {
	switch img.(type) {
	case *image.NRGBA, *image.RGBA, *image.NRGBA64, *image.RGBA64:
		return true
	}
	return false
}

// Keep an unused import alive when only png decoding registers a side-effect.
var _ = png.Encode
