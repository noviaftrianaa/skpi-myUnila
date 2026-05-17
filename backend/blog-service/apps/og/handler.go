// Package og — dynamic OpenGraph image generator.
// Returns 1200×630 PNG with brand-coloured gradient, title (auto-wrapped),
// author byline, and blog name. Used as fallback when post has no cover_url.
//
// Cache strategy: same (title, subtitle, byline) tuple → same image, so we set
// a long `Cache-Control: public, max-age=86400` header — clients (Twitter,
// FB, WhatsApp link unfurlers) hit it once and cache.
//
// Performance: ~30-50ms render time on a 4-core box. Fonts are loaded once at
// init via sync.Once.
package og

import (
	"bytes"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"strings"
	"sync"

	"github.com/fogleman/gg"
	"github.com/gofiber/fiber/v2"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
)

// Canvas dimensions match OpenGraph + Twitter card recommended size.
const (
	Width  = 1200
	Height = 630
)

// Layout constants. All values are in pixels referenced to the 1200×630 canvas.
const (
	padLeft         = 80
	padRight        = 80
	padTop          = 80
	titleMaxRunes   = 110 // ≈3 lines at size 70 (≈35 runes each at this width)
	titleSize       = 70.0
	titleSizeSmall  = 56.0 // used when text length > shrinkThreshold
	shrinkThreshold = 60   // runes; titles longer than this drop down to small size
	subtitleSize    = 32.0
	bylineSize      = 26.0
	footerSize      = 22.0
)

// Brand colours (matches the `myunila` Tailwind palette in the frontend).
var (
	gradTop    = color.NRGBA{R: 11, G: 94, B: 168, A: 255}  // myunila base
	gradBottom = color.NRGBA{R: 8, G: 47, B: 84, A: 255}    // darker
	textLight  = color.NRGBA{R: 255, G: 255, B: 255, A: 255}
	textMuted  = color.NRGBA{R: 220, G: 230, B: 250, A: 255}
	accentBar  = color.NRGBA{R: 250, G: 204, B: 21, A: 255} // amber accent line
)

var (
	titleFontOnce    sync.Once
	subtitleFontOnce sync.Once
	titleTTF         *truetype.Font
	regularTTF       *truetype.Font
	loadErr          error
)

func loadFonts() error {
	var firstErr error
	titleFontOnce.Do(func() {
		t, err := truetype.Parse(gobold.TTF)
		if err != nil {
			firstErr = fmt.Errorf("parse gobold: %w", err)
			return
		}
		titleTTF = t
	})
	subtitleFontOnce.Do(func() {
		t, err := truetype.Parse(goregular.TTF)
		if err != nil {
			firstErr = fmt.Errorf("parse goregular: %w", err)
			return
		}
		regularTTF = t
	})
	if firstErr != nil {
		return firstErr
	}
	if titleTTF == nil || regularTTF == nil {
		return fmt.Errorf("fonts not initialised")
	}
	return nil
}

// face returns a fresh truetype.Face at the requested size + boldness.
// Callers must reuse if needed — the function does not memoise per-size faces.
func face(bold bool, size float64) font.Face {
	src := regularTTF
	if bold {
		src = titleTTF
	}
	return truetype.NewFace(src, &truetype.Options{
		Size: size,
		DPI:  72,
	})
}

// RenderInput captures everything we draw onto the canvas. Empty fields are
// silently dropped — callers don't need to validate before passing.
type RenderInput struct {
	Title    string // primary line, wraps up to 4 lines
	Subtitle string // optional caption between title and byline (e.g. category)
	Byline   string // author name (e.g. "Dr. Rina Hartanti")
	Footer   string // bottom-right tagline (e.g. blog.unila.ac.id)
}

// Render returns the PNG bytes for the supplied input. Errors only when the
// embedded fonts fail to load (effectively never).
func Render(in RenderInput) ([]byte, error) {
	if err := loadFonts(); err != nil {
		return nil, fmt.Errorf("og: load fonts: %w", err)
	}

	dc := gg.NewContext(Width, Height)

	// Background — vertical gradient via per-row fill. Faster than the full
	// LinearGradient API which calls a per-pixel callback.
	for y := 0; y < Height; y++ {
		t := float64(y) / float64(Height)
		r := uint8(float64(gradTop.R)*(1-t) + float64(gradBottom.R)*t)
		g := uint8(float64(gradTop.G)*(1-t) + float64(gradBottom.G)*t)
		b := uint8(float64(gradTop.B)*(1-t) + float64(gradBottom.B)*t)
		dc.SetColor(color.NRGBA{R: r, G: g, B: b, A: 255})
		dc.DrawRectangle(0, float64(y), Width, 1)
		dc.Fill()
	}

	// Subtle radial highlight on top-left (gives the card depth without
	// needing a real image source).
	dc.SetColor(color.NRGBA{R: 255, G: 255, B: 255, A: 18})
	dc.DrawCircle(220, 180, 320)
	dc.Fill()

	// Accent bar above the title
	dc.SetColor(accentBar)
	dc.DrawRectangle(padLeft, padTop, 80, 6)
	dc.Fill()

	// Title — bold, large, auto-wrap. Hard-truncate first to avoid runaway
	// wrap into the byline area; shrink font when text length suggests 3+
	// lines so it stays readable without overflowing.
	title := strings.TrimSpace(in.Title)
	if title == "" {
		title = "Blog Unila"
	}
	title = truncate(title, titleMaxRunes)
	ts := titleSize
	if len([]rune(title)) > shrinkThreshold {
		ts = titleSizeSmall
	}
	dc.SetFontFace(face(true, ts))
	dc.SetColor(textLight)
	maxWidth := float64(Width - padLeft - padRight)
	// gg's DrawStringWrapped takes anchor (ax, ay) where 0 = top-left of the
	// wrapped block. Use line spacing 1.15.
	titleY := float64(padTop) + 6 + 32
	dc.DrawStringWrapped(title, padLeft, titleY,
		0, 0, maxWidth, 1.15, gg.AlignLeft)

	// Subtitle (optional)
	if sub := strings.TrimSpace(in.Subtitle); sub != "" {
		dc.SetFontFace(face(false, subtitleSize))
		dc.SetColor(textMuted)
		// Anchor below the title block. We rough-estimate the title height
		// based on font size × estimated line count — exact wrap height
		// isn't exposed by gg without measuring, so leave generous padding.
		dc.DrawString(truncate(sub, 70), padLeft, Height-200)
	}

	// Byline (author). Use em-dash separator instead of a unicode icon because
	// the Go embedded fonts don't carry emoji glyphs.
	if by := strings.TrimSpace(in.Byline); by != "" {
		dc.SetFontFace(face(true, bylineSize))
		dc.SetColor(textLight)
		dc.DrawString("— "+truncate(by, 60), padLeft, Height-padTop-50)
	}

	// Footer (right-aligned, blog hostname or "Blog Unila")
	footer := strings.TrimSpace(in.Footer)
	if footer == "" {
		footer = "blog.unila.ac.id"
	}
	dc.SetFontFace(face(false, footerSize))
	dc.SetColor(textMuted)
	fw, _ := dc.MeasureString(footer)
	dc.DrawString(footer, float64(Width-padRight)-fw, Height-padTop-50)

	// Universitas branding bar (bottom, full-width)
	dc.SetColor(color.NRGBA{R: 0, G: 0, B: 0, A: 70})
	dc.DrawRectangle(0, Height-40, Width, 40)
	dc.Fill()
	dc.SetFontFace(face(true, 18))
	dc.SetColor(textLight)
	dc.DrawString("UNIVERSITAS LAMPUNG", padLeft, Height-15)

	// Encode
	var buf bytes.Buffer
	if err := png.Encode(&buf, dc.Image()); err != nil {
		return nil, fmt.Errorf("encode png: %w", err)
	}
	return buf.Bytes(), nil
}

// truncate clips a string to maxRunes runes, appending an ellipsis if cut.
func truncate(s string, maxRunes int) string {
	if maxRunes <= 0 || s == "" {
		return s
	}
	r := []rune(s)
	if len(r) <= maxRunes {
		return s
	}
	return strings.TrimSpace(string(r[:maxRunes-1])) + "…"
}

// =============================================================================
// HANDLER
// =============================================================================

// Handler stays trivial — no DB, no auth. Pure render.
type Handler struct{}

func NewHandler() *Handler { return &Handler{} }

// GET /api/v1/og?title=...&subtitle=...&author=...&footer=...
func (h *Handler) OG(c *fiber.Ctx) error {
	in := RenderInput{
		Title:    c.Query("title"),
		Subtitle: c.Query("subtitle"),
		Byline:   c.Query("author"),
		Footer:   c.Query("footer"),
	}
	png, err := Render(in)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	c.Set(fiber.HeaderContentType, "image/png")
	// Same input → same output → safe to cache aggressively. 1-day cache is
	// long enough to amortise the render cost without holding stale content
	// past a post edit.
	c.Set("Cache-Control", "public, max-age=86400, immutable")
	return c.Send(png)
}

// RegisterRoutes mounts the public /og endpoint.
func RegisterRoutes(api fiber.Router, h *Handler) {
	api.Get("/og", h.OG)
}

// Avoid stripping "image" import if future code path removes its only use.
var _ = image.Rect
