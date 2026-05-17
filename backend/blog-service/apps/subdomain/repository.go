package subdomain

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

var (
	// Format: 3-60 char, lowercase alnum + dash, must start/end alphanumeric.
	// Go regex (RE2) tidak support lookahead — check "--" substring separately di validateFormat.
	subdomainPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*[a-z0-9]$`)

	ErrInvalidFormat   = errors.New("format subdomain tidak valid (3-60 char, lowercase alnum + dash)")
	ErrReservedWord    = errors.New("subdomain mengandung kata terlarang")
	ErrAlreadyTaken    = errors.New("subdomain sudah dipakai")
	ErrAlreadyHasBlog  = errors.New("user sudah punya blog (1 user = 1 blog)")
	ErrTipeRoleInvalid = errors.New("tipe_role tidak dikenal")
)

type Repository struct{ db *sqlx.DB }

func NewRepository(db *sqlx.DB) *Repository { return &Repository{db: db} }

// ValidationResult — output 4-layer validation per opsi.
type ValidationResult struct {
	Subdomain        string `json:"subdomain"`
	LayerFormat      bool   `json:"layer1_format"`
	LayerReserved    bool   `json:"layer2_reserved"`
	LayerUnique      bool   `json:"layer3_unique"`
	LayerImpersonate bool   `json:"layer4_impersonation"`
	Available        bool   `json:"available"`
	Reason           string `json:"reason,omitempty"` // kalau tidak available, kenapa
}

// validateFormat — layer 1: regex pattern check.
func validateFormat(s string) bool {
	if len(s) < 3 || len(s) > 60 {
		return false
	}
	if strings.Contains(s, "--") {
		return false
	}
	return subdomainPattern.MatchString(s)
}

// roleSuffixes — bagian SUFFIX yang ditambahkan sistem secara otomatis & TIDAK
// boleh dianggap match terhadap reserved words (mereka by-design ditambahkan ke
// subdomain). Eksklusi terjadi hanya untuk part TERAKHIR; di tengah subdomain
// kata "dosen"/"staf" tetap dianggap reserved.
var roleSuffixes = map[string]bool{
	"mhs": true, "dosen": true, "staf": true, "alumni": true,
}

// checkReserved — layer 2: cek ref.kata_terlarang.
// Match by SUBSTRING dengan word boundary supaya 'rektor-staf' kena 'rektor'.
// Last part (suffix role) skip pengecekan karena di-append sistem.
func (r *Repository) checkReserved(ctx context.Context, s string) (matched string, err error) {
	// Ambil semua kata terlarang dan cek substring.
	// Untuk performa di production: cache di Redis atau load sekali di startup.
	q := `SELECT kata FROM ref.kata_terlarang WHERE soft_delete IS NULL`
	var words []string
	if err := r.db.SelectContext(ctx, &words, q); err != nil {
		return "", fmt.Errorf("load kata_terlarang: %w", err)
	}
	parts := strings.Split(s, "-")
	for _, w := range words {
		w = strings.ToLower(strings.TrimSpace(w))
		if w == "" {
			continue
		}
		for i, p := range parts {
			// Skip last part kalau itu role suffix (mhs/dosen/staf/alumni)
			if i == len(parts)-1 && roleSuffixes[p] {
				continue
			}
			if p == w {
				return w, nil
			}
		}
	}
	return "", nil
}

// checkUnique — layer 3: cek di blog.blog (case-insensitive global).
func (r *Repository) checkUnique(ctx context.Context, s string) (bool, error) {
	var n int
	if err := r.db.GetContext(ctx, &n, `SELECT COUNT(*) FROM blog.blog WHERE LOWER(subdomain) = LOWER($1) AND soft_delete IS NULL`, s); err != nil {
		return false, fmt.Errorf("check unique: %w", err)
	}
	return n == 0, nil
}

// ValidateOption — full 4-layer validation untuk satu subdomain.
func (r *Repository) ValidateOption(ctx context.Context, s string) (*ValidationResult, error) {
	res := &ValidationResult{Subdomain: s}
	res.LayerImpersonate = true // inherent kalau generator — semua opsi derived dari profil asli

	res.LayerFormat = validateFormat(s)
	if !res.LayerFormat {
		res.Reason = "Format tidak valid"
		return res, nil
	}

	matched, err := r.checkReserved(ctx, s)
	if err != nil {
		return nil, err
	}
	res.LayerReserved = matched == ""
	if !res.LayerReserved {
		res.Reason = fmt.Sprintf("Mengandung kata terlarang: '%s'", matched)
		return res, nil
	}

	unique, err := r.checkUnique(ctx, s)
	if err != nil {
		return nil, err
	}
	res.LayerUnique = unique
	if !unique {
		res.Reason = "Subdomain sudah dipakai"
		return res, nil
	}

	res.Available = res.LayerFormat && res.LayerReserved && res.LayerUnique && res.LayerImpersonate
	return res, nil
}

// resolveTipeRole — get id_tipe_role dari kode (MHS/DOSEN/STAF/ALUMNI).
func (r *Repository) resolveTipeRole(ctx context.Context, kode string) (uuid.UUID, error) {
	var id uuid.UUID
	err := r.db.GetContext(ctx, &id, `SELECT id_tipe_role FROM ref.tipe_role WHERE UPPER(kode) = UPPER($1) AND soft_delete IS NULL`, kode)
	if errors.Is(err, sql.ErrNoRows) {
		return uuid.Nil, ErrTipeRoleInvalid
	}
	return id, err
}

// ClaimInput — payload claim.
type ClaimInput struct {
	Subdomain    string `json:"subdomain"`
	NmBlog       string `json:"nm_blog"`
	NmTampilan   string `json:"nm_tampilan"`
	Tagline      string `json:"tagline,omitempty"`
}

// Claim — create blog.blog row, link ke user (id_pengguna_pdut).
// Validasi:
//   1. Format
//   2. Reserved word
//   3. Unique global
//   4. User belum punya blog (UNIQUE constraint di id_pengguna_pdut)
// ClaimResult — returned by Claim untuk audit log + response.
type ClaimResult struct {
	IDBlog       uuid.UUID
	IDTipeRole   uuid.UUID
	ValidasiJSON []byte // JSON marshaled ValidationResult
}

func (r *Repository) Claim(ctx context.Context, idPengguna uuid.UUID, tipeRoleKode string, in ClaimInput) (ClaimResult, error) {
	// Validasi
	v, err := r.ValidateOption(ctx, in.Subdomain)
	if err != nil {
		return ClaimResult{}, err
	}
	if !v.Available {
		switch {
		case !v.LayerFormat:
			return ClaimResult{}, ErrInvalidFormat
		case !v.LayerReserved:
			return ClaimResult{}, fmt.Errorf("%w: %s", ErrReservedWord, v.Reason)
		case !v.LayerUnique:
			return ClaimResult{}, ErrAlreadyTaken
		default:
			return ClaimResult{}, errors.New("subdomain tidak tersedia: " + v.Reason)
		}
	}

	// Cek user belum punya blog
	var existsCount int
	if err := r.db.GetContext(ctx, &existsCount, `SELECT COUNT(*) FROM blog.blog WHERE id_pengguna_pdut = $1 AND soft_delete IS NULL`, idPengguna); err != nil {
		return ClaimResult{}, fmt.Errorf("check existing blog: %w", err)
	}
	if existsCount > 0 {
		return ClaimResult{}, ErrAlreadyHasBlog
	}

	// Resolve tipe_role
	idTipeRole, err := r.resolveTipeRole(ctx, tipeRoleKode)
	if err != nil {
		return ClaimResult{}, err
	}

	// INSERT blog
	nmBlog := strings.TrimSpace(in.NmBlog)
	if nmBlog == "" {
		nmBlog = "Blog " + in.NmTampilan
	}
	nmTampilan := strings.TrimSpace(in.NmTampilan)
	tagline := strings.TrimSpace(in.Tagline)

	var idBlog uuid.UUID
	q := `INSERT INTO blog.blog
	        (id_pengguna_pdut, id_tipe_role, subdomain, nm_blog, nm_tampilan, tagline,
	         a_aktif, a_publik, a_komentar_aktif, a_terverifikasi, tgl_klaim)
	      VALUES ($1, $2, $3, $4, $5, NULLIF($6, ''), TRUE, TRUE, TRUE, FALSE, NOW())
	      RETURNING id_blog`
	if err := r.db.GetContext(ctx, &idBlog, q, idPengguna, idTipeRole, in.Subdomain, nmBlog, nmTampilan, tagline); err != nil {
		return ClaimResult{}, fmt.Errorf("insert blog: %w", err)
	}

	// Marshal validation result untuk audit
	validasiJSON, _ := json.Marshal(v)
	return ClaimResult{
		IDBlog:       idBlog,
		IDTipeRole:   idTipeRole,
		ValidasiJSON: validasiJSON,
	}, nil
}
