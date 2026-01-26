package middleware

import (
	"context"
	_ "embed"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
	"github.com/redis/go-redis/v9"
)

//go:embed rate_limiter.lua
var luaScript string

// RateLimiterConfig holds rate limiter configuration
type RateLimiterConfig struct {
	Capacity   int     // Maximum number of tokens (max requests)
	RefillRate float64 // Tokens refilled per second
}

// DefaultRateLimiterConfig returns default rate limiter settings
// 10 requests per second with burst capacity of 20
func DefaultRateLimiterConfig() *RateLimiterConfig {
	return &RateLimiterConfig{
		Capacity:   1000, // Can burst up to 20 requests
		RefillRate: 10.0, // Refills 10 tokens per second
	}
}

// RateLimiterMiddleware implements Token Bucket algorithm using Redis + Lua script
func RateLimiterMiddleware(redisClient *redis.Client, config *RateLimiterConfig) fiber.Handler {
	// Load Lua script into Redis (SHA hash will be cached)
	ctx := context.Background()
	scriptSHA, err := redisClient.ScriptLoad(ctx, luaScript).Result()
	if err != nil {
		log.Fatalf("Failed to load Lua script for rate limiter: %v", err)
	}

	return func(c *fiber.Ctx) error {
		// Get user ID from JWT context
		user := GetCurrentUser(c)
		if user == nil {
			return response.Unauthorized(c, "Token tidak valid")
		}

		key := UserRateLimiterKey(user.ID)
		now := time.Now().Unix()
		result, err := redisClient.EvalSha(ctx, scriptSHA, []string{key},
			config.Capacity,
			config.RefillRate,
			now,
		).Result()
		if err != nil {
			log.Printf("Failed to execute rate limiter Lua script: %v", err)
			// On error, allow the request (fail-open)
			return c.Next()
		}

		// Check if request is allowed
		allowed := result.(int64)
		if allowed == 0 {
			// Rate limit exceeded
			return response.ErrTooManyRequests
		}
		return c.Next()
	}
}

// Build cache key for user rate limiting
func UserRateLimiterKey(userID string) string {
	return fmt.Sprintf("rate_limiter:user:%d", userID)
}
