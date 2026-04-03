package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Postgres PostgresConfig
	MSSQL    MSSQLConfig
	MinIO    MinIOConfig
	Telegram TelegramConfig
}

type TelegramConfig struct {
	BotToken string
	ChatID   string
	Enabled  bool
}

type MinIOConfig struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
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

type MSSQLConfig struct {
	Host     string
	Port     string
	Database string
	Username string
	Password string
}

var Cfg *Config

func LoadConfig() error {
	env := os.Getenv("APP_ENV")
	if env == "" || env == "development" || env == "local" || env == "staging" {
		envPaths := []string{
			".env",
			"../../.env",
		}
		for _, path := range envPaths {
			if err := godotenv.Load(path); err == nil {
				fmt.Printf("Loaded .env from: %s\n", path)
				break
			}
		}
	}

	Cfg = &Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Project Service"),
			Port: getEnv("APP_PORT", ":8090"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Postgres: PostgresConfig{
			Host:     getEnv("PG_HOST", "localhost"),
			Port:     getEnv("PG_PORT", "5432"),
			Database: getEnv("PG_DATABASE", "myunila_project"),
			Username: getEnv("PG_USERNAME", "myunila_pm"),
			Password: getEnv("PG_PASSWORD", ""),
			SSLMode:  getEnv("PG_SSLMODE", "disable"),
		},
		MSSQL: MSSQLConfig{
			Host:     getEnv("MSSQL_HOST", "localhost"),
			Port:     getEnv("MSSQL_PORT", "1433"),
			Database: getEnv("MSSQL_DATABASE", "pdut_staging"),
			Username: getEnv("MSSQL_USERNAME", ""),
			Password: getEnv("MSSQL_PASSWORD", ""),
		},
		MinIO: MinIOConfig{
			Endpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
			AccessKey: getEnv("MINIO_ACCESS_KEY", ""),
			SecretKey: getEnv("MINIO_SECRET_KEY", ""),
			Bucket:    getEnv("MINIO_BUCKET", "myunila-storage"),
			UseSSL:    getEnv("MINIO_USE_SSL", "false") == "true",
		},
		Telegram: TelegramConfig{
			BotToken: getEnv("TELEGRAM_BOT_TOKEN", ""),
			ChatID:   getEnv("TELEGRAM_CHAT_ID", ""),
			Enabled:  getEnv("TELEGRAM_NOTIFY_ENABLED", "false") == "true",
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
