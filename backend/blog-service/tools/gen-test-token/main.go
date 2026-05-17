// gen-test-token — utility untuk generate JWT test (admin / regular user).
// Usage:
//   go run ./tools/gen-test-token admin
//   go run ./tools/gen-test-token user <uuid_pengguna_pdut>
//   go run ./tools/gen-test-token user <uuid_pengguna_pdut> <email>
package main

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWT_SECRET — pakai env BLOG_JWT_SECRET kalau ada, atau fallback ke shared secret production.
// Untuk match dengan blog-service container yg pakai JWT_SECRET dari deployment/local/.env.
func getSecret() string {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return s
	}
	return "local-dev-jwt-secret-key-change-in-production"
}

type Claims struct {
	Type string `json:"type"`
	User struct {
		ID       string `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
		Name     string `json:"name"`
		Role     string `json:"role"`
	} `json:"user"`
	jwt.RegisteredClaims
}

func main() {
	mode := "admin"
	uid := "00000000-0000-0000-0000-000000000001"
	email := ""
	if len(os.Args) > 1 {
		mode = os.Args[1]
	}
	if len(os.Args) > 2 {
		uid = os.Args[2]
	}
	if len(os.Args) > 3 {
		email = os.Args[3]
	}
	if email == "" {
		email = mode + "@test.local"
	}

	var claims Claims
	claims.Type = "access"
	claims.User.ID = uid
	claims.User.Username = "test-" + mode
	claims.User.Email = email
	claims.User.Name = "Test " + mode
	switch mode {
	case "admin":
		claims.User.Role = "Administrator"
	case "dev":
		claims.User.Role = "Developer"
	default:
		claims.User.Role = "Mahasiswa"
	}
	claims.RegisteredClaims = jwt.RegisteredClaims{
		Issuer:    "auth-service-test",
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		Subject:   uid,
	}

	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := tok.SignedString([]byte(getSecret()))
	if err != nil {
		fmt.Fprintln(os.Stderr, "sign error:", err)
		os.Exit(1)
	}
	fmt.Println(s)
}
