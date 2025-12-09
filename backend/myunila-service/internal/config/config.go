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
	SikepAPI SikepAPIConfig
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

type SikepAPIConfig struct {
	BaseURL  string
	Username string
	Password string
}

var Cfg *Config

func LoadConfig() error {
	// Only load .env file in development mode
	// In production, environment variables are passed via docker-compose
	env := os.Getenv("APP_ENV")
	if env == "" || env == "development" || env == "local" {
		// Try multiple locations for .env file
		envPaths := []string{
			".env",                          // Current directory
			"../../.env",                    // From cmd/api/ to root
			"../../../myunila-service/.env", // Alternative path
		}

		loaded := false
		for _, path := range envPaths {
			if err := godotenv.Load(path); err == nil {
				fmt.Printf("Loaded .env from: %s\n", path)
				loaded = true
				break
			}
		}

		if !loaded {
			fmt.Println("Warning: .env file not found, using environment variables")
		}
	} else {
		fmt.Printf("Running in %s mode, using environment variables from docker-compose\n", env)
	}

	maxOpenConns, _ := strconv.Atoi(getEnv("DB_MAX_OPEN_CONNS", "25"))
	maxIdleConns, _ := strconv.Atoi(getEnv("DB_MAX_IDLE_CONNS", "5"))
	connMaxLifetime, _ := time.ParseDuration(getEnv("DB_CONN_MAX_LIFETIME", "5m"))

	dbName := getEnv("DB_DATABASE", "pdut")
	dbHost := getEnv("DB_HOST", "localhost")
	fmt.Printf("Database config: host=%s, database=%s\n", dbHost, dbName)

	Cfg = &Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "MyUnila Service"),
			Port: getEnv("APP_PORT", ":8086"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Driver:                 getEnv("DB_DRIVER", "sqlserver"),
			Host:                   dbHost,
			Port:                   getEnv("DB_PORT", "1433"),
			Database:               dbName,
			Username:               getEnv("DB_USERNAME", "sa"),
			Password:               getEnv("DB_PASSWORD", ""),
			TrustServerCertificate: getEnv("DB_TRUST_SERVER_CERTIFICATE", "true") == "true",
			MaxOpenConns:           maxOpenConns,
			MaxIdleConns:           maxIdleConns,
			ConnMaxLifetime:        connMaxLifetime,
		},
		SikepAPI: SikepAPIConfig{
			BaseURL:  getEnv("SIKEP_API_BASE_URL", "https://sikep.unila.ac.id/2022/api/v1"),
			Username: getEnv("SIKEP_API_USERNAME", ""),
			Password: getEnv("SIKEP_API_PASSWORD", ""),
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
