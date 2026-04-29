// Package config — env loader untuk manajemen-konten-service.
// Mengikuti pola backend/myunila-service/internal/config.
package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Storage  StorageConfig
}

type AppConfig struct {
	Name string
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host                   string
	Port                   string
	Database               string
	Username               string
	Password               string
	TrustServerCertificate bool
	MaxOpenConns           int
	MaxIdleConns           int
	ConnMaxLifetime        time.Duration
}

type JWTConfig struct {
	Secret string
}

type StorageConfig struct {
	UploadDir string // local path inside container, mounted via docker volume
	BaseURL   string // public URL prefix untuk file di-serve via nginx
}

var Cfg *Config

func LoadConfig() error {
	env := os.Getenv("APP_ENV")
	if env == "" || env == "development" || env == "local" {
		_ = godotenv.Load(".env")
	}

	maxOpenConns, _ := strconv.Atoi(getEnv("DB_MAX_OPEN_CONNS", "25"))
	maxIdleConns, _ := strconv.Atoi(getEnv("DB_MAX_IDLE_CONNS", "5"))
	connLifetime, _ := strconv.Atoi(getEnv("DB_CONN_MAX_LIFETIME_MIN", "60"))

	Cfg = &Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Manajemen Konten Service"),
			Port: getEnv("APP_PORT", ":8090"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:                   getEnv("DB_HOST", "192.168.123.119"),
			Port:                   getEnv("DB_PORT", "1433"),
			Database:               getEnv("DB_DATABASE", "pdut_staging"),
			Username:               getEnv("DB_USERNAME", ""),
			Password:               getEnv("DB_PASSWORD", ""),
			TrustServerCertificate: getEnv("DB_TRUST_SERVER_CERTIFICATE", "true") == "true",
			MaxOpenConns:           maxOpenConns,
			MaxIdleConns:           maxIdleConns,
			ConnMaxLifetime:        time.Duration(connLifetime) * time.Minute,
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", ""),
		},
		Storage: StorageConfig{
			UploadDir: getEnv("UPLOAD_DIR", "/data/uploads"),
			BaseURL:   getEnv("UPLOAD_BASE_URL", "/man-konten/uploads"),
		},
	}

	if Cfg.Database.Username == "" || Cfg.Database.Password == "" {
		return fmt.Errorf("DB_USERNAME and DB_PASSWORD are required")
	}
	if Cfg.JWT.Secret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}

	return nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
