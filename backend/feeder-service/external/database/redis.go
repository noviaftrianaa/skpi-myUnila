package database

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/go-redis/redis/v8"
)

var ctx = context.Background()

// ConnectRedis creates a Redis client connection
// Returns nil if connection fails (graceful degradation)
func ConnectRedis() *redis.Client {
	// Get Redis configuration from environment
	redisHost := os.Getenv("REDIS_HOST")
	redisPort := os.Getenv("REDIS_PORT")
	redisPassword := os.Getenv("REDIS_PASSWORD")
	redisDB := 0 // default database

	// Default values if not set
	if redisHost == "" {
		redisHost = "redis"
	}
	if redisPort == "" {
		redisPort = "6379"
	}

	redisAddr := fmt.Sprintf("%s:%s", redisHost, redisPort)

	// Create Redis client
	client := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       redisDB,
	})

	// Test connection
	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Printf("⚠️  Failed to connect to Redis at %s: %v", redisAddr, err)
		log.Println("⚠️  Continuing without Redis cache (graceful degradation)")
		return nil
	}

	log.Printf("✅ Redis connected successfully at %s", redisAddr)
	return client
}
