package database

import (
	"context"
	"fmt"
	"log"

	"monitoring-service/internal/config"

	"github.com/go-redis/redis/v8"
)

func ConnectRedis(cfg config.RedisConfig) *redis.Client {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: cfg.Password,
		DB:       0,
	})

	if _, err := client.Ping(context.Background()).Result(); err != nil {
		log.Printf("⚠️  Redis not available (%s): %v — caching disabled", addr, err)
		return nil
	}

	log.Printf("✅ Redis connected: %s", addr)
	return client
}
