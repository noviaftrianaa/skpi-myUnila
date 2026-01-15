package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
)

var globalRedisClient *redis.Client

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
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		log.Printf("⚠️  Failed to connect to Redis at %s: %v", redisAddr, err)
		log.Println("⚠️  Continuing without Redis cache (graceful degradation)")
		return nil
	}

	log.Printf("✅ Redis connected successfully at %s", redisAddr)
	return client
}

// SetGlobalRedisClient sets the global Redis client for use across the application
func SetGlobalRedisClient(client *redis.Client) {
	globalRedisClient = client
}

// GetGlobalRedisClient returns the global Redis client
func GetGlobalRedisClient() *redis.Client {
	return globalRedisClient
}

// RedisGet retrieves a value from Redis using the global client
func RedisGet(ctx context.Context, key string) (string, error) {
	if globalRedisClient == nil {
		return "", redis.Nil
	}
	return globalRedisClient.Get(ctx, key).Result()
}

// RedisSet stores a value in Redis using the global client
func RedisSet(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	if globalRedisClient == nil {
		return nil // Graceful degradation
	}
	return globalRedisClient.Set(ctx, key, value, expiration).Err()
}

// RedisExists checks if a key exists in Redis using the global client
func RedisExists(ctx context.Context, key string) (bool, error) {
	if globalRedisClient == nil {
		return false, nil
	}
	result, err := globalRedisClient.Exists(ctx, key).Result()
	return result > 0, err
}
