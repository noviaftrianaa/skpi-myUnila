package middleware

import (
	"errors"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"

	"github.com/myunila/blog-service/config"
)

// JWTClaims mirror dengan auth-service issued tokens.
// Field penting:
//   - User.ID:   id_pengguna_pdut (UUID) — dipakai untuk identifikasi blog owner
//   - User.Role: nama peran (Administrator / Developer / Mahasiswa / Dosen / ...)
type JWTClaims struct {
	ISS  string `json:"iss"`
	IAT  int64  `json:"iat"`
	EXP  int64  `json:"exp"`
	NBF  int64  `json:"nbf"`
	SUB  string `json:"sub"`
	JTI  string `json:"jti"`
	Type string `json:"type"` // "access" / "refresh"
	User struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
	} `json:"user"`
	jwt.RegisteredClaims
}

// JWTAuth — strict: token wajib, valid, type=access.
// Pakai di endpoint yang butuh login (mutation /me/*, /admin/*).
func JWTAuth(cfg config.JWTConfig) fiber.Handler {
	return func(c *fiber.Ctx) error {
		claims, err := parseBearer(c, cfg)
		if err != nil {
			return fiber.NewError(fiber.StatusUnauthorized, err.Error())
		}
		setUserLocals(c, claims)
		return c.Next()
	}
}

// JWTOptional — non-strict: kalau ada token & valid, attach user_id ke locals;
// kalau tidak ada, lanjut tanpa user_id. Pakai untuk endpoint yang
// behavior-nya berbeda berdasarkan login state (e.g. like_post counter di view).
func JWTOptional(cfg config.JWTConfig) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return c.Next()
		}
		claims, err := parseBearer(c, cfg)
		if err == nil {
			setUserLocals(c, claims)
		}
		return c.Next()
	}
}

// RequireRole — limit akses ke peran tertentu (case-insensitive).
// Contoh: middleware.RequireRole("Administrator", "Developer") untuk admin endpoints.
func RequireRole(roles ...string) fiber.Handler {
	allowed := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowed[strings.ToLower(r)] = true
	}
	return func(c *fiber.Ctx) error {
		role, _ := c.Locals("role").(string)
		if !allowed[strings.ToLower(role)] {
			return fiber.NewError(fiber.StatusForbidden, "insufficient role")
		}
		return c.Next()
	}
}

// =========================================================================
// helpers
// =========================================================================

func parseBearer(c *fiber.Ctx, cfg config.JWTConfig) (*JWTClaims, error) {
	auth := c.Get("Authorization")
	if auth == "" {
		return nil, errors.New("missing authorization header")
	}
	parts := strings.SplitN(auth, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return nil, errors.New("invalid authorization header format")
	}

	token, err := jwt.ParseWithClaims(parts[1], &JWTClaims{}, func(t *jwt.Token) (any, error) {
		if t.Method.Alg() != cfg.Algo {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(cfg.Secret), nil
	})
	if err != nil {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}
	if claims.Type != "" && claims.Type != "access" {
		return nil, errors.New("invalid token type (expected access)")
	}
	return claims, nil
}

func setUserLocals(c *fiber.Ctx, claims *JWTClaims) {
	c.Locals("user_id", claims.User.ID)
	c.Locals("username", claims.User.Username)
	c.Locals("email", claims.User.Email)
	c.Locals("name", claims.User.Name)
	c.Locals("role", claims.User.Role)
}

// UserID — convenience getter dari fiber context (return empty string kalau tidak login).
func UserID(c *fiber.Ctx) string {
	id, _ := c.Locals("user_id").(string)
	return id
}

// Role — convenience getter (empty string kalau tidak login).
func Role(c *fiber.Ctx) string {
	r, _ := c.Locals("role").(string)
	return r
}
