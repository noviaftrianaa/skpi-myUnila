package redis

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/internal/config"
	"github.com/redis/go-redis/v9"
)

var Client *redis.Client

// Connect membuat koneksi ke Redis
func Connect(cfg config.RedisConfig) error {
	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)

	Client = redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := Client.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Printf("✅ Redis connected at %s", addr)
	return nil
}

// Close menutup koneksi Redis
func Close() error {
	if Client != nil {
		return Client.Close()
	}
	return nil
}

// Set menyimpan key-value dengan TTL
func Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	log.Printf("Setting key in Redis: %s", key)
	return Client.Set(ctx, key, value, ttl).Err()
}

// Get mengambil value dari key
func Get(ctx context.Context, key string) (string, error) {
	log.Printf("Getting key from Redis: %s", key)
	return Client.Get(ctx, key).Result()
}

// Del menghapus key
func Del(ctx context.Context, keys ...string) error {
	log.Printf("Deleting keys from Redis: %s", keys)
	return Client.Del(ctx, keys...).Err()
}

// Del menghapus key dengan pola tertentu
func DelByPattern(ctx context.Context, key string) error {
	var cursor uint64
	var keys []string
	for {
		var err error
		var scanKeys []string

		scanKeys, cursor, err = Client.Scan(ctx, cursor, key, 100).Result()
		if err != nil {
			return err
		}
		keys = append(keys, scanKeys...)
		if cursor == 0 {
			break
		}
	}
	if len(keys) == 0 {
		return nil
	}
	log.Printf("Deleting pattern keys from Redis: %s", key)
	if err := Client.Del(ctx, keys...).Err(); err != nil {
		return err
	}
	return nil
}

// Exists mengecek apakah key ada
func Exists(ctx context.Context, key string) (bool, error) {
	result, err := Client.Exists(ctx, key).Result()
	return result > 0, err
}

// SetJSON menyimpan value sebagai JSON
func SetJSON(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return Set(ctx, key, value, ttl)
}
