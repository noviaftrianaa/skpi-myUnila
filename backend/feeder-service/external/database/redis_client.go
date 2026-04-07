package database

import (
	"context"
	"time"

	"github.com/go-redis/redis/v8"
)

var globalRedisClient *redis.Client

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
