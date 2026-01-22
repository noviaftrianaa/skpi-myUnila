package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	App        AppConfig
	Database   DatabaseConfig
	SimpedamAPI SimpedamAPIConfig
}

type AppConfig struct {
	Name string
	Port string
	Env  string
}

type DatabaseConfig struct {
	Driver                 string
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

type SimpedamAPIConfig struct {
	Endpoint string
	Username string
	Password string
	APICode  string // API code identifier for logging (e.g., "SIMPEDAM")
}

var Cfg *Config

func LoadConfig() error {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: .env file not found, using environment variables")
	}

	maxOpenConns, _ := strconv.Atoi(getEnv("DB_MAX_OPEN_CONNS", "25"))
	maxIdleConns, _ := strconv.Atoi(getEnv("DB_MAX_IDLE_CONNS", "5"))
	connMaxLifetime, _ := time.ParseDuration(getEnv("DB_CONN_MAX_LIFETIME", "5m"))

	Cfg = &Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Keuangan Service"),
			Port: getEnv("APP_PORT", ":8088"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Driver:                 getEnv("DB_DRIVER", "sqlserver"),
			Host:                   getEnv("DB_HOST", "localhost"),
			Port:                   getEnv("DB_PORT", "1433"),
			Database:               getEnv("DB_DATABASE", "pdut"),
			Username:               getEnv("DB_USERNAME", "sa"),
			Password:               getEnv("DB_PASSWORD", ""),
			TrustServerCertificate: getEnv("DB_TRUST_SERVER_CERTIFICATE", "true") == "true",
			MaxOpenConns:           maxOpenConns,
			MaxIdleConns:           maxIdleConns,
			ConnMaxLifetime:        connMaxLifetime,
		},
		SimpedamAPI: SimpedamAPIConfig{
			Endpoint: getEnv("SIMPEDAM_ENDPOINT", "https://simpedam.unila.ac.id/ws/live2unila.php"),
			Username: getEnv("SIMPEDAM_USER", ""),
			Password: getEnv("SIMPEDAM_PASSWORD", ""),
			APICode:  getEnv("SIMPEDAM_API_CODE", "SIMPEDAM"),
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
