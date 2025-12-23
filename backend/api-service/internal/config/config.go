package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type AppConfig struct {
	Name string
	Port string
	Env  string
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

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret string
	Algo   string
}

var Cfg Config

func LoadConfig() error {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	Cfg = Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Service"),
			Port: getEnv("APP_PORT", ":8080"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Driver:          getEnv("DB_DRIVER", "sqlserver"),
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "1433"),
			User:            getEnv("DB_USERNAME", "sa"),
			Password:        getEnv("DB_PASSWORD", ""),
			Name:            getEnv("DB_DATABASE", "myunila"),
			MaxOpenConns:    25,
			MaxIdleConns:    5,
			ConnMaxLifetime: getEnv("DB_CONN_MAX_LIFETIME", "5m"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       0,
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", ""),
			Algo:   getEnv("JWT_ALGO", "HS256"),
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
