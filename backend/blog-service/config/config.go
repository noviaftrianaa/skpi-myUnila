package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	App         AppConfig
	Postgres    PostgresConfig
	CORS        CORSConfig
	JWT         JWTConfig
	MinIO       MinIOConfig
	Meilisearch MeilisearchConfig
	WebPush     WebPushConfig
}

// WebPushConfig — VAPID keypair untuk web push (Phase BA).
// Generate sekali via tools/gen-vapid lalu set di env. Kosong = push disabled
// (subscribe endpoint return 503, service worker degrade gracefully).
type WebPushConfig struct {
	PublicKey  string // base64url uncompressed P-256 public key
	PrivateKey string // base64url private key (32 bytes scalar)
	Subject    string // mailto: atau https URL untuk identify sender ke push service
}

type MinIOConfig struct {
	Endpoint  string // host:port (no scheme)
	AccessKey string
	SecretKey string
	Bucket    string // default: blog-media
	UseSSL    bool
	PublicURL string // e.g. https://minio.unila.ac.id (no trailing slash)
}

type MeilisearchConfig struct {
	URL    string // e.g. http://meilisearch:7700
	APIKey string // master/admin key
	Index  string // default: blog_post
}

type JWTConfig struct {
	Secret  string // HMAC secret, shared dengan auth-service
	Algo    string // default: HS256
}

type AppConfig struct {
	Name string
	Port string
	Env  string
}

type PostgresConfig struct {
	Host     string
	Port     string
	Database string
	Username string
	Password string
	SSLMode  string
}

type CORSConfig struct {
	AllowOrigins string
}

func Load() (*Config, error) {
	// .env loading is optional (production pakai env injection)
	_ = godotenv.Load()

	cfg := &Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "blog-service"),
			Port: getEnv("APP_PORT", "8091"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Postgres: PostgresConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			Database: getEnv("DB_NAME", "blog_unila"),
			Username: getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		CORS: CORSConfig{
			AllowOrigins: getEnv("CORS_ALLOW_ORIGINS", "http://localhost:3000, http://localhost:3001, http://localhost:3002, http://localhost:9800"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "dev-secret-change-me"),
			Algo:   getEnv("JWT_ALGO", "HS256"),
		},
		MinIO: MinIOConfig{
			Endpoint:  getEnv("MINIO_ENDPOINT", ""),
			AccessKey: getEnv("MINIO_ACCESS_KEY", ""),
			SecretKey: getEnv("MINIO_SECRET_KEY", ""),
			Bucket:    getEnv("MINIO_BUCKET", "blog-media"),
			UseSSL:    getEnv("MINIO_USE_SSL", "false") == "true",
			PublicURL: getEnv("MINIO_PUBLIC_URL", ""),
		},
		Meilisearch: MeilisearchConfig{
			URL:    getEnv("MEILISEARCH_URL", ""),
			APIKey: getEnv("MEILISEARCH_API_KEY", ""),
			Index:  getEnv("MEILISEARCH_INDEX", "blog_post"),
		},
		WebPush: WebPushConfig{
			PublicKey:  getEnv("WEBPUSH_PUBLIC_KEY", ""),
			PrivateKey: getEnv("WEBPUSH_PRIVATE_KEY", ""),
			Subject:    getEnv("WEBPUSH_SUBJECT", "mailto:dev@unila.ac.id"),
		},
	}

	if cfg.Postgres.Password == "" {
		return nil, fmt.Errorf("DB_PASSWORD is required")
	}
	if cfg.App.Env == "production" && cfg.JWT.Secret == "dev-secret-change-me" {
		return nil, fmt.Errorf("JWT_SECRET must be set in production")
	}
	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}
