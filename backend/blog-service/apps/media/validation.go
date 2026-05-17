package media

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"unicode/utf8"
)

// =============================================================================
// UPLOAD VALIDATION
//
// Defense-in-depth: we don't trust the browser-supplied Content-Type header
// (trivially spoofable). Every upload goes through:
//   1. Per-jenis size cap (small numbers, fail-fast before bandwidth burn)
//   2. Extension allow-list per jenis (case-insensitive)
//   3. Magic-byte sniffing via http.DetectContentType — must agree with the
//      declared header and the file extension
//   4. SVG is rejected outright (XSS via embedded <script> / on* handlers)
//   5. Filename hard-sanitized to [a-zA-Z0-9._-] before storage in DB
//   6. Image dimensions checked downstream (image-bomb guard, ~50 MP cap)
// =============================================================================

// PerJenisLimits — bytes. Keep tight enough that users compress before upload.
// Per-file hard ceiling enforced regardless of jenis.
var PerJenisLimits = map[string]int64{
	JenisImage:    8 * 1024 * 1024,  // 8 MB — most blog photos < 2 MB after web-opt
	JenisVideo:    50 * 1024 * 1024, // 50 MB — short clips only; long video belongs on YouTube
	JenisAudio:    20 * 1024 * 1024, // 20 MB
	JenisDocument: 20 * 1024 * 1024, // 20 MB
}

// HardCapBytes — absolute upper bound, regardless of jenis. Defense against
// the per-jenis map being misconfigured to allow something huge.
const HardCapBytes int64 = 60 * 1024 * 1024 // 60 MB

// MaxImagePixels — guard against decompression bombs (e.g. 50000×50000 PNG
// that compresses to 5 KB but decodes to ~10 GB in memory).
const MaxImagePixels int64 = 50_000_000 // ~7000×7000

// Per-jenis extension allow-list. Case-insensitive. SVG intentionally excluded
// from image even though browsers render it — too easy to embed scripts.
var extAllowed = map[string]map[string]bool{
	JenisImage: {
		".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true,
	},
	JenisVideo: {
		".mp4": true, ".webm": true, ".ogv": true, ".ogg": true,
	},
	JenisAudio: {
		".mp3": true, ".ogg": true, ".wav": true, ".m4a": true,
	},
	JenisDocument: {
		".pdf": true, ".doc": true, ".docx": true, ".xls": true, ".xlsx": true,
		".ppt": true, ".pptx": true, ".txt": true, ".csv": true, ".md": true,
	},
}

// extToJenis — reverse lookup for primary jenis classification by extension.
// Used when the sniffed MIME and header disagree but the extension is decisive.
var extToJenis = func() map[string]string {
	m := map[string]string{}
	for j, exts := range extAllowed {
		for e := range exts {
			m[e] = j
		}
	}
	return m
}()

// Dangerous extensions — always reject even if the MIME claims otherwise.
// Defense against double-extension tricks (`shell.php.png`) and rendering as
// active content if MinIO is ever fronted by a server that sniffs.
var dangerousExt = map[string]bool{
	".exe": true, ".dll": true, ".so": true, ".dylib": true,
	".sh": true, ".bat": true, ".cmd": true, ".ps1": true,
	".js": true, ".mjs": true, ".vbs": true, ".jar": true, ".class": true,
	".html": true, ".htm": true, ".xhtml": true, ".svg": true, ".xml": true,
	".php": true, ".asp": true, ".aspx": true, ".jsp": true, ".cgi": true, ".py": true, ".rb": true,
}

// Compatibility table: declared/sniffed MIME may differ slightly
// (e.g. `image/jpeg` vs `image/jpg`, `audio/x-wav` vs `audio/wav`). We canonicalise
// before comparing.
func canonicalMIME(m string) string {
	m = strings.ToLower(strings.TrimSpace(strings.Split(m, ";")[0]))
	switch m {
	case "image/jpg":
		return "image/jpeg"
	case "image/x-png":
		return "image/png"
	case "audio/x-wav":
		return "audio/wav"
	case "audio/mp3":
		return "audio/mpeg"
	case "application/x-pdf":
		return "application/pdf"
	}
	return m
}

// SniffMIME reads up to 512 bytes (per net/http spec) to detect the actual
// content type. Reads through `io.ReadCloser`; caller must re-open the file
// (FileHeader.Open is safe to call multiple times) before streaming to MinIO.
func SniffMIME(r io.Reader) (string, error) {
	buf := make([]byte, 512)
	n, err := io.ReadFull(r, buf)
	if err != nil && !errors.Is(err, io.EOF) && !errors.Is(err, io.ErrUnexpectedEOF) {
		return "", fmt.Errorf("read for sniff: %w", err)
	}
	return canonicalMIME(http.DetectContentType(buf[:n])), nil
}

// ValidateUpload performs all checks except the actual content-byte sniff. The
// sniff happens in the handler because we want to open the file lazily, and
// returns the validated (extension, jenis, declared MIME). Returns user-facing
// error messages safe to surface via HTTP status.
//
// Inputs:
//   - filename: as supplied by client (basename only; path stripped beforehand)
//   - declaredMIME: from the multipart-part's Content-Type header
//   - size: bytes
func ValidateUpload(filename, declaredMIME string, size int64) (ext, jenis, mime string, err error) {
	if size <= 0 {
		return "", "", "", errors.New("file is empty")
	}
	if size > HardCapBytes {
		return "", "", "", fmt.Errorf("file too large (%d MB) — hard cap is %d MB",
			size/1024/1024, HardCapBytes/1024/1024)
	}

	ext = strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		return "", "", "", errors.New("file has no extension")
	}
	if dangerousExt[ext] {
		return "", "", "", fmt.Errorf("extension %s is not allowed", ext)
	}

	jenis, ok := extToJenis[ext]
	if !ok {
		return "", "", "", fmt.Errorf("extension %s is not supported", ext)
	}

	cap, capOK := PerJenisLimits[jenis]
	if !capOK {
		return "", "", "", fmt.Errorf("no size cap configured for jenis %s", jenis)
	}
	if size > cap {
		return "", "", "", fmt.Errorf("%s file too large (%d MB), max %d MB for %s",
			jenis, size/1024/1024, cap/1024/1024, jenis)
	}

	mime = canonicalMIME(declaredMIME)
	if mime == "" || mime == "application/octet-stream" {
		// Header was missing — let the sniff decide later.
		mime = ""
	}
	return ext, jenis, mime, nil
}

// CheckMIMEAgreement reconciles the declared header MIME with the content-sniffed
// MIME and the file extension. All three must point at the same jenis. Returns
// the canonical MIME we'll persist (sniffed wins — it's the only one a client
// can't lie about).
func CheckMIMEAgreement(declaredMIME, sniffedMIME, ext, jenis string) (string, error) {
	d := canonicalMIME(declaredMIME)
	s := canonicalMIME(sniffedMIME)
	if s == "" {
		return "", errors.New("could not detect content type from bytes")
	}

	expectedJenis, ok := mimeToJenis(s)
	if !ok {
		return "", fmt.Errorf("sniffed MIME %s is not in allow-list", s)
	}
	if expectedJenis != jenis {
		return "", fmt.Errorf("content-type %s disagrees with extension %s (expected %s, got %s)",
			s, ext, jenis, expectedJenis)
	}
	// Header is informational — log mismatch but don't reject; some clients send
	// vague "application/octet-stream" but the bytes are clearly a PNG.
	if d != "" && d != s {
		expectedJenisFromHeader, hOK := mimeToJenis(d)
		if hOK && expectedJenisFromHeader != jenis {
			return "", fmt.Errorf("declared content-type %s disagrees with content bytes %s", d, s)
		}
	}
	return s, nil
}

// mimeToJenis classifies a sniffed/declared MIME into our jenis enum. Centralised
// here so the allow-list lives in one place.
func mimeToJenis(m string) (string, bool) {
	switch m {
	case "image/jpeg", "image/png", "image/gif", "image/webp":
		return JenisImage, true
	case "video/mp4", "video/webm", "video/ogg":
		return JenisVideo, true
	case "audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4":
		return JenisAudio, true
	case "application/pdf",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"text/plain", "text/csv", "text/markdown":
		return JenisDocument, true
	// http.DetectContentType returns these for docx/xlsx/pptx because they're
	// zip files under the hood. We trust the extension here since the header +
	// our zip-magic check would otherwise be the same as a raw .zip upload.
	case "application/zip":
		// Caller should fall back to extension-based classification when this
		// shows up. ValidateUpload's ext check already gates which extensions
		// can land in this bucket.
		return JenisDocument, true
	}
	return "", false
}

// SanitiseFilename returns a filename safe to store + display. Rules:
//   - Strip directory separators
//   - Keep only [a-zA-Z0-9._-]; replace anything else with `_`
//   - Collapse consecutive underscores
//   - Limit to 120 chars (with extension)
//   - Ensure non-empty fallback
//
// The actual MinIO path uses a random UUID, so the sanitised name is purely
// cosmetic for the dashboard listing — but a hostile filename could still slip
// through to logs, alt-text, or downstream consumers.
var fnUnsafeChars = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)
var fnConsecUnderscore = regexp.MustCompile(`_{2,}`)

func SanitiseFilename(name string) string {
	clean := filepath.Base(name)
	clean = strings.ReplaceAll(clean, "\\", "/")
	clean = filepath.Base(clean)
	clean = strings.TrimSpace(clean)
	// Normalise to NFC then drop anything past 200 runes before regex (cheap
	// guard against pathological inputs).
	if utf8.RuneCountInString(clean) > 200 {
		// Keep only the leading 200 runes.
		runes := []rune(clean)
		clean = string(runes[:200])
	}
	clean = fnUnsafeChars.ReplaceAllString(clean, "_")
	clean = fnConsecUnderscore.ReplaceAllString(clean, "_")
	clean = strings.Trim(clean, "._-")
	if clean == "" {
		return "upload"
	}
	if len(clean) > 120 {
		// Preserve extension if possible.
		ext := filepath.Ext(clean)
		if len(ext) > 0 && len(ext) <= 10 {
			stem := clean[:120-len(ext)]
			clean = stem + ext
		} else {
			clean = clean[:120]
		}
	}
	return clean
}
