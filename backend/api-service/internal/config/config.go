package config

import (
	"log"
	"os"
	"strconv"

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
	URL  string
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
	Secret         string
	Algo           string
	AccessTokenTTL int // dalam menit
	Issuer         string
}

var Cfg Config

func LoadConfig() error {
	// Load .env file jika ada
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	maxOpenConns, _ := strconv.Atoi(getEnv("DB_MAX_OPEN_CONNS", "25"))
	maxIdleConns, _ := strconv.Atoi(getEnv("DB_MAX_IDLE_CONNS", "5"))
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	jwtTTL, _ := strconv.Atoi(getEnv("JWT_ACCESS_TOKEN_TTL", "60")) // default 60 menit

	Cfg = Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "MyUnila API Service"),
			Port: getEnv("APP_PORT", ":8085"),
			Env:  getEnv("APP_ENV", "development"),
			URL:  getEnv("APP_URL", "http://localhost:8085"),
		},
		Database: DatabaseConfig{
			Driver:          getEnv("DB_DRIVER", "sqlserver"),
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "1433"),
			User:            getEnv("DB_USERNAME", "sa"),
			Password:        getEnv("DB_PASSWORD", ""),
			Name:            getEnv("DB_DATABASE", "pdut"),
			MaxOpenConns:    maxOpenConns,
			MaxIdleConns:    maxIdleConns,
			ConnMaxLifetime: getEnv("DB_CONN_MAX_LIFETIME", "5m"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       redisDB,
		},
		JWT: JWTConfig{
			Secret:         getEnv("JWT_SECRET", ""),
			Algo:           getEnv("JWT_ALGO", "HS256"),
			AccessTokenTTL: jwtTTL,
			Issuer:         getEnv("JWT_ISSUER", "onedata-api"),
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
