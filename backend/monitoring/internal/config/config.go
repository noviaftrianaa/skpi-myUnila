package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	App     AppConfig
	JWT     JWTConfig
	DB      DatabaseConfig
	Redis   RedisConfig
	Blogger BloggerConfig
	GSC     GSCConfig
	Crawler CrawlerConfig
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
	Name            string
	User            string
	Password        string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
}

type BloggerConfig struct {
	APIKey string
}

type GSCConfig struct {
	ServiceAccountJSON   string
	SiteURL              string
	AutoRemoveThreshold  int
	Enabled              bool
}

type CrawlerConfig struct {
	MaxDepth                    int
	MaxPages                    int
	RateLimitMs                 int
	ConcurrentSites             int
	TimeoutSec                  int
	UserAgent                   string
	CloakingEnabled             bool
	CloakingSimilarityThreshold float64
	AMPScanEnabled              bool
}

var Cfg Config

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using environment variables")
	}

	Cfg = Config{
		App: AppConfig{
			Name: getEnv("APP_NAME", "Monitoring Service"),
			Port: getEnv("APP_PORT", ":8089"),
			Env:  getEnv("APP_ENV", "development"),
		},
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", ""),
			Algo:   getEnv("JWT_ALGO", "HS256"),
		},
		DB: DatabaseConfig{
			Driver:          getEnv("DB_DRIVER", "sqlserver"),
			Host:            getEnv("DB_HOST", "localhost"),
			Port:            getEnv("DB_PORT", "1433"),
			Name:            getEnv("DB_DATABASE", ""),
			User:            getEnv("DB_USERNAME", "sa"),
			Password:        getEnv("DB_PASSWORD", ""),
			MaxOpenConns:    25,
			MaxIdleConns:    5,
			ConnMaxLifetime: "5m",
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "redis"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		Blogger: BloggerConfig{
			APIKey: getEnv("BLOGGER_API_KEY", ""),
		},
		GSC: GSCConfig{
			ServiceAccountJSON:  getEnv("GSC_SERVICE_ACCOUNT_JSON", "/app/secrets/gsc-service-account.json"),
			SiteURL:             getEnv("GSC_SITE_URL", "sc-domain:unila.ac.id"),
			AutoRemoveThreshold: getEnvInt("GSC_AUTO_REMOVE_THRESHOLD", 15),
			Enabled:             getEnvBool("GSC_ENABLED", true),
		},
		Crawler: CrawlerConfig{
			MaxDepth:                    getEnvInt("CRAWLER_MAX_DEPTH", 3),
			MaxPages:                    getEnvInt("CRAWLER_MAX_PAGES", 500),
			RateLimitMs:                 getEnvInt("CRAWLER_RATE_LIMIT_MS", 1000),
			ConcurrentSites:             getEnvInt("CRAWLER_CONCURRENT_SITES", 3),
			TimeoutSec:                  getEnvInt("CRAWLER_TIMEOUT_SEC", 30),
			UserAgent:                   getEnv("CRAWLER_USER_AGENT", "MyUnila-WebMon/1.0 (+https://my.unila.ac.id/webmon)"),
			CloakingEnabled:             getEnvBool("CRAWLER_CLOAKING_ENABLED", true),
			CloakingSimilarityThreshold: getEnvFloat("CRAWLER_CLOAKING_THRESHOLD", 0.7),
			AMPScanEnabled:              getEnvBool("CRAWLER_AMP_SCAN_ENABLED", true),
		},
	}

	log.Printf("✅ Config loaded: %s (port %s, env %s)", Cfg.App.Name, Cfg.App.Port, Cfg.App.Env)
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return fallback
}

func getEnvFloat(key string, fallback float64) float64 {
	if value, exists := os.LookupEnv(key); exists {
		if f, err := strconv.ParseFloat(value, 64); err == nil {
			return f
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		return value == "true" || value == "1"
	}
	return fallback
}
