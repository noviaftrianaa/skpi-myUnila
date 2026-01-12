package jwt

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/myunila/api-service/external/redis"
	"github.com/myunila/api-service/internal/config"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidToken     = errors.New("invalid token")
	ErrExpiredToken     = errors.New("token has expired")
	ErrBlacklistedToken = errors.New("token has been revoked")
)

// Claims adalah struktur JWT claims untuk OneData API
// Format sama dengan auth-service Laravel
type Claims struct {
	jwt.RegisteredClaims
	Type string    `json:"type"`
	User UserClaim `json:"user"`
}

// UserClaim berisi informasi user dalam token
type UserClaim struct {
	ID         string `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email,omitempty"`
	Name       string `json:"name,omitempty"`
	Role       string `json:"role"`
	IDAplikasi string `json:"id_aplikasi"`
}

// TokenMetadata untuk disimpan di Redis
type TokenMetadata struct {
	UserID     string `json:"user_id"`
	IDAplikasi string `json:"id_aplikasi"`
	Type       string `json:"type"`
	ExpiresAt  int64  `json:"expires_at"`
	IPAddress  string `json:"ip_address,omitempty"`
}

// GenerateToken membuat JWT token baru
func GenerateToken(userData UserClaim, ipAddress string) (string, *Claims, error) {
	cfg := config.Cfg.JWT
	now := time.Now()
	expiresAt := now.Add(time.Duration(cfg.AccessTokenTTL) * time.Minute)
	tokenID := uuid.New().String()

	claims := &Claims{
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    cfg.Issuer,
			Subject:   userData.ID,
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ID:        tokenID,
		},
		Type: "access",
		User: userData,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.Secret))
	if err != nil {
		return "", nil, fmt.Errorf("failed to sign token: %w", err)
	}

	// Simpan metadata ke Redis
	metadata := TokenMetadata{
		UserID:     userData.ID,
		IDAplikasi: userData.IDAplikasi,
		Type:       "access",
		ExpiresAt:  expiresAt.Unix(),
		IPAddress:  ipAddress,
	}
	metadataJSON, _ := json.Marshal(metadata)

	ctx := context.Background()
	ttl := time.Duration(cfg.AccessTokenTTL) * time.Minute
	if err := redis.Set(ctx, fmt.Sprintf("token:%s", tokenID), string(metadataJSON), ttl); err != nil {
		// Log warning tapi jangan gagal
		fmt.Printf("Warning: failed to store token in Redis: %v\n", err)
	}

	return tokenString, claims, nil
}

// ValidateToken memvalidasi dan decode JWT token
func ValidateToken(tokenString string) (*Claims, error) {
	cfg := config.Cfg.JWT

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(cfg.Secret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	// Check blacklist di Redis
	ctx := context.Background()
	blacklisted, _ := redis.Exists(ctx, fmt.Sprintf("blacklist:%s", claims.ID))
	if blacklisted {
		return nil, ErrBlacklistedToken
	}

	return claims, nil
}

// BlacklistToken menambahkan token ke blacklist
func BlacklistToken(tokenID string, expiresAt time.Time) error {
	ctx := context.Background()
	ttl := time.Until(expiresAt)
	if ttl <= 0 {
		return nil // Token sudah expired, tidak perlu blacklist
	}
	return redis.Set(ctx, fmt.Sprintf("blacklist:%s", tokenID), "1", ttl)
}

// HashPasswordSHA1 untuk kompatibilitas dengan auth-service yang pakai SHA1
func HashPasswordSHA1(password string) string {
	h := sha1.New()
	h.Write([]byte(password))
	return hex.EncodeToString(h.Sum(nil))
}

// VerifyPasswordSHA1Bcrypt memverifikasi password dengan strategy:
// 1. Hash input dengan SHA1
// 2. Verify SHA1 hash dengan bcrypt hash yang tersimpan di database
// Sama dengan implementasi auth-service Laravel
func VerifyPasswordSHA1Bcrypt(password string, hashedPassword string) bool {
	// Step 1: Hash password dengan SHA1
	sha1Hash := HashPasswordSHA1(password)

	// Step 2: Verify SHA1 hash dengan bcrypt
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(sha1Hash))
	return err == nil
}

// GetTokenExpiry mendapatkan waktu expired token
func GetTokenExpiry(claims *Claims) time.Time {
	if claims.ExpiresAt != nil {
		return claims.ExpiresAt.Time
	}
	return time.Now()
}
