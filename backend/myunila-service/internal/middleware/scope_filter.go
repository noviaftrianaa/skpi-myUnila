package middleware

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/myunila-service/external/database"
)

// ScopeFilter — server-authoritative role-based scope injection.
//
// Pasangan Laravel `app/Http/Middleware/RoleScopeFilter.php` di dashboard-service.
// Sumber data: Redis key `user_context_json:{userId}` (di-set oleh auth-service
// saat user memilih konteks role). JSON payload supaya Go bisa unmarshal langsung
// tanpa parse PHP-serialize.
//
// Logic:
//   level <=3 / peran universal (admin/dev/helpdesk) → ScopeUniversal{}, no filter
//   level 4 (Dekan)                                   → IdFakultas = id_organisasi
//   level 5 (Kaprodi)                                 → IdProdi    = id_organisasi
//                                                       IdFakultas = id_induk_organisasi
//
// Akses scope di handler: `c.Locals("scope").(Scope)`.
// Repository SHOULD respect scope via WHERE clause; client-supplied
// `id_fakultas` / `id_prodi` query params HARUS di-override jika scope active.
//
// Failure-mode: setiap error → pass through tanpa scope. Auth real di KongAuth.
//
// REQUIRES: KongAuth() middleware sebelum ini (set c.Locals("user_id")).
//           Redis global client via database.GetGlobalRedisClient().

const (
	scopeRedisKeyPrefix = "user_context_json:"
	scopeRedisTimeout   = 200 * time.Millisecond
)

// universalRoleKeywords — kalau nm_peran mengandung salah satu, bypass scope.
var universalRoleKeywords = []string{"administrator", "developer", "helpdesk", "service api"}

// Scope — payload yang di-inject ke fiber context (`c.Locals("scope")`).
type Scope struct {
	HasScope     bool   `json:"has_scope"`
	IsUniversal  bool   `json:"is_universal"`
	Level        int    `json:"level"`
	IdFakultas   string `json:"id_fakultas,omitempty"`
	IdProdi      string `json:"id_prodi,omitempty"`
	IdPeran      any    `json:"id_peran,omitempty"`
	NmPeran      string `json:"nm_peran,omitempty"`
	NmOrganisasi string `json:"nm_organisasi,omitempty"`
}

// userContext — struktur JSON yang ditulis auth-service.
type userContext struct {
	IdRolePengguna    string `json:"id_role_pengguna"`
	IdPeran           any    `json:"id_peran"`
	NmPeran           string `json:"nm_peran"`
	IdOrganisasi      string `json:"id_organisasi"`
	NmOrganisasi      string `json:"nm_organisasi"`
	LevelOrganisasi   int    `json:"level_organisasi"`
	IdIndukOrganisasi string `json:"id_induk_organisasi"`
}

// ScopeFilter mengembalikan fiber.Handler yang auto-inject scope ke c.Locals.
func ScopeFilter() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID, _ := c.Locals("user_id").(string)
		if userID == "" {
			return c.Next()
		}

		ctx, err := readUserContext(userID)
		if err != nil || ctx == nil {
			c.Locals("scope", Scope{HasScope: false})
			return c.Next()
		}

		nmPeran := strings.ToLower(ctx.NmPeran)
		isUniversal := ctx.LevelOrganisasi == 0 || ctx.LevelOrganisasi <= 3
		for _, kw := range universalRoleKeywords {
			if strings.Contains(nmPeran, kw) {
				isUniversal = true
				break
			}
		}

		s := Scope{
			HasScope:     false,
			Level:        ctx.LevelOrganisasi,
			IsUniversal:  isUniversal,
			IdPeran:      ctx.IdPeran,
			NmPeran:      ctx.NmPeran,
			NmOrganisasi: ctx.NmOrganisasi,
		}

		if !isUniversal && ctx.IdOrganisasi != "" {
			switch ctx.LevelOrganisasi {
			case 4:
				s.IdFakultas = ctx.IdOrganisasi
				s.HasScope = true
			case 5:
				s.IdProdi = ctx.IdOrganisasi
				s.IdFakultas = ctx.IdIndukOrganisasi
				s.HasScope = true
			}
		}

		c.Locals("scope", s)

		// Compat: override query params kalau scope active — sama seperti Laravel
		// version. Repository yang baca c.Query("id_fakultas") otomatis kena scope
		// tanpa refactor.
		if s.HasScope {
			if s.IdFakultas != "" {
				c.Request().URI().QueryArgs().Set("id_fakultas", s.IdFakultas)
			}
			if s.IdProdi != "" {
				c.Request().URI().QueryArgs().Set("id_prodi", s.IdProdi)
			}
		}

		return c.Next()
	}
}

// GetScope helper utk handler — selalu return Scope (zero-value kalau belum di-set).
func GetScope(c *fiber.Ctx) Scope {
	if s, ok := c.Locals("scope").(Scope); ok {
		return s
	}
	return Scope{}
}

func readUserContext(userID string) (*userContext, error) {
	client := database.GetGlobalRedisClient()
	if client == nil {
		return nil, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), scopeRedisTimeout)
	defer cancel()

	raw, err := client.Get(ctx, scopeRedisKeyPrefix+userID).Result()
	if err != nil {
		return nil, err
	}

	var uc userContext
	if err := json.Unmarshal([]byte(raw), &uc); err != nil {
		return nil, err
	}
	return &uc, nil
}
