// custom-token: generate JWT dengan custom user fields.
// Usage:
//   go run ./tools/gen-test-token/custom <uuid> <username> <name> <role>
package main

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

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
	if len(os.Args) < 5 {
		fmt.Fprintln(os.Stderr, "Usage: go run ./tools/gen-test-token/custom <uuid> <username> <name> <role>")
		os.Exit(1)
	}
	var claims Claims
	claims.Type = "access"
	claims.User.ID = os.Args[1]
	claims.User.Username = os.Args[2]
	claims.User.Name = os.Args[3]
	claims.User.Role = os.Args[4]
	claims.User.Email = os.Args[2] + "@unila.ac.id"
	claims.RegisteredClaims = jwt.RegisteredClaims{
		Issuer:    "auth-service-test",
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		Subject:   os.Args[1],
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := tok.SignedString([]byte(getSecret()))
	if err != nil {
		fmt.Fprintln(os.Stderr, "sign:", err)
		os.Exit(1)
	}
	fmt.Println(s)
}
