// Package subdomain handles subdomain claim flow:
//   1. Generate 5 picker options dari profil user (NIM/nama/role)
//   2. 4-layer validation: format / reserved / unique / impersonation (inherent)
//   3. Claim — create blog.blog row + link ke id_pengguna_pdut
//
// Subdomain pattern:
//   - MHS:     {NIM}-mhs              (locked, 1 option only — from JWT username)
//   - DOSEN:   5 variants from name + -dosen suffix
//   - STAF:    5 variants from name + -staf suffix
//   - ALUMNI:  5 variants from name + -alumni suffix
//
// Reasoning per opsi disertakan agar UI bisa explain "kenapa opsi ini di-generate".
package subdomain

import (
	"strings"
	"unicode"
)

type Option struct {
	Subdomain string `json:"subdomain"`
	Reasoning string `json:"reasoning"`
	Preferred bool   `json:"preferred,omitempty"`
}

// ProfileInput dari JWT claims (kalau pernah integrate ke pdut, ganti pakai cross-DB lookup).
type ProfileInput struct {
	Username string // NIM / NIP / NPP
	Name     string // Full name dengan title (e.g. "Dr. Rina Hartanti, S.Si., M.Si.")
	Role     string // "Mahasiswa" / "Dosen" / "Tenaga Kependidikan" / "Alumni" / "Administrator" / "Developer"
}

// RoleToSuffix maps JWT role → subdomain suffix.
// Admin/Developer fallback ke -staf (mereka tetap civitas).
func RoleToSuffix(role string) string {
	switch strings.ToLower(role) {
	case "mahasiswa", "calon mahasiswa":
		return "mhs"
	case "dosen":
		return "dosen"
	case "alumni":
		return "alumni"
	default:
		// staf, tendik, dekan, kaprodi, administrator, developer, dll → -staf
		return "staf"
	}
}

// Generate — produces options sesuai role:
//   - MHS → 1 opsi (locked, format {NIM}-mhs)
//   - Selain MHS → up to 5 variants dari nama
func Generate(p ProfileInput) []Option {
	suffix := RoleToSuffix(p.Role)

	if suffix == "mhs" {
		// MHS auto-assigned dari NIM (locked, tidak ada pilihan)
		base := cleanSlug(p.Username)
		return []Option{
			{
				Subdomain: base + "-mhs",
				Reasoning: "Format default berbasis NIM (locked untuk mahasiswa)",
				Preferred: true,
			},
		}
	}

	// Untuk dosen/staf/alumni: 5 variants dari nama
	clean := stripTitle(p.Name)
	parts := strings.Fields(clean)
	if len(parts) == 0 {
		// Fallback ke NIP / username
		return []Option{
			{
				Subdomain: cleanSlug(p.Username) + "-" + suffix,
				Reasoning: "Nama tidak terbaca; fallback ke NIP/NPP",
				Preferred: true,
			},
		}
	}

	seen := make(map[string]bool)
	var options []Option

	add := func(base, reason string, preferred bool) {
		s := cleanSlug(base)
		if s == "" {
			return
		}
		full := s + "-" + suffix
		if seen[full] {
			return
		}
		seen[full] = true
		options = append(options, Option{
			Subdomain: full,
			Reasoning: reason,
			Preferred: preferred,
		})
	}

	first := parts[0]
	last := parts[len(parts)-1]

	// 1. Nama depan (paling natural)
	add(first, "Nama depan", true)

	// 2. Nama lengkap (kalau lebih dari 1 token)
	if len(parts) > 1 {
		add(strings.Join(parts, "-"), "Nama lengkap (dash-separated)", false)
	}

	// 3. Nama lengkap tanpa spasi
	if len(parts) > 1 {
		add(strings.Join(parts, ""), "Nama lengkap (tanpa spasi)", false)
	}

	// 4. Inisial depan + nama belakang (kalau distinct dari first)
	if len(parts) > 1 && first != last {
		add(string(first[0])+"-"+last, "Inisial depan + nama belakang", false)
	}

	// 5. Nama belakang (kalau berbeda dari first)
	if first != last {
		add(last, "Nama belakang", false)
	}

	// Limit ke 5
	if len(options) > 5 {
		options = options[:5]
	}
	return options
}

// cleanSlug — lowercase alphanumeric + dash, trim leading/trailing dash.
func cleanSlug(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	b.Grow(len(s))
	prevDash := true
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			b.WriteRune(r)
			prevDash = false
		} else if !prevDash {
			b.WriteRune('-')
			prevDash = true
		}
	}
	return strings.Trim(b.String(), "-")
}

// stripTitle — buang gelar akademik & sapaan dari nama.
// Contoh: "Dr. Rina Hartanti, S.Si., M.Si." → "Rina Hartanti"
func stripTitle(name string) string {
	// Hilangkan semua koma + sesudahnya (biasanya gelar belakang)
	if idx := strings.Index(name, ","); idx > 0 {
		name = name[:idx]
	}
	// Hilangkan token title di depan
	titles := map[string]bool{
		"dr": true, "drs": true, "ir": true, "prof": true, "h": true, "hj": true,
		"st": true, "sh": true, "ssi": true, "msi": true, "mhum": true,
		"smkom": true, "skom": true, "mkom": true, "ssn": true, "mt": true, "mm": true,
	}
	tokens := strings.Fields(name)
	var out []string
	for _, t := range tokens {
		// Drop kalau seluruhnya title (dengan/tanpa titik)
		bare := strings.ToLower(strings.Trim(t, "."))
		bare = strings.ReplaceAll(bare, ".", "")
		if titles[bare] {
			continue
		}
		// Buang karakter non-alfanumerik di akhir (titik, koma)
		clean := strings.TrimFunc(t, func(r rune) bool {
			return !unicode.IsLetter(r) && !unicode.IsDigit(r)
		})
		if clean != "" {
			out = append(out, clean)
		}
	}
	return strings.Join(out, " ")
}
