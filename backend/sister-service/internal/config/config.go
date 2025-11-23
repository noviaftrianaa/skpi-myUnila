package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	App           AppConfig
	JWT           JWTConfig
	Database      DatabaseConfig
	SisterAPI     SisterAPIConfig
	EncryptionKey string
}

type AppConfig struct {
	Name string
	Port string
	Env  string
}

type JWTConfig struct {
	Secret string
	Algo   string
}

type DatabaseConfig struct {
	Driver          string
	Host            string
	Port            string
	User            string
	Password        string
	Name            string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime string
}

type SisterAPIConfig struct {
	BaseURL    string
	IDPengguna string
	Username   string
	Password   string
	APICode    string // API code identifier for logging (e.g., "SISTER")
}

var Cfg Config

func LoadConfig() error {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	Cfg = Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Sister Service"),
			Port: getEnv("APP_PORT", ":8083"),
			Env:  getEnv("APP_ENV", "development"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", ""),
			Algo:   getEnv("JWT_ALGO", "HS256"),
		},
		Database: DatabaseConfig{
			Driver:          getEnv("DB_DRIVER", "sqlserver"),
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "1433"),
			User:            getEnv("DB_USERNAME", "sa"),
			Password:        getEnv("DB_PASSWORD", ""),
			Name:            getEnv("DB_DATABASE", "pddikti"),
			MaxOpenConns:    25,
			MaxIdleConns:    5,
			ConnMaxLifetime: getEnv("DB_CONN_MAX_LIFETIME", "5m"),
		},
		SisterAPI: SisterAPIConfig{
			BaseURL:    getEnv("SISTER_API_BASE_URL", "https://sister-api.kemdikbud.go.id/ws.php"),
			IDPengguna: getEnv("SISTER_API_IDPENGGUNA", ""),
			Username:   getEnv("SISTER_API_USERNAME", ""),
			Password:   getEnv("SISTER_API_PASSWORD", ""),
			APICode:    getEnv("SISTER_API_CODE", "SISTER"), // Default to SISTER
		},
		EncryptionKey: getEnv("API_CONFIG_ENCRYPTION_KEY", ""),
	}

	return nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
