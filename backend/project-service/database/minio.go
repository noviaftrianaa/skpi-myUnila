package database

import (
	"context"
	"fmt"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/myunila/project-service/config"
)

var MinIOClient *minio.Client

func ConnectMinIO(cfg config.MinIOConfig) (*minio.Client, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client: %w", err)
	}

	// Verify connection by listing buckets
	ctx := context.Background()
	exists, err := client.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("failed to check MinIO bucket: %w", err)
	}
	if !exists {
		// Try to create bucket
		if err := client.MakeBucket(ctx, cfg.Bucket, minio.MakeBucketOptions{}); err != nil {
			return nil, fmt.Errorf("bucket '%s' does not exist and failed to create: %w", cfg.Bucket, err)
		}
		log.Printf("✅ MinIO bucket '%s' created", cfg.Bucket)
	}

	log.Printf("✅ Connected to MinIO at %s (bucket: %s)", cfg.Endpoint, cfg.Bucket)
	MinIOClient = client
	return client, nil
}
