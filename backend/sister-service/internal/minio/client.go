package minio

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"sister-service/internal/config"
)

// Client wraps the MinIO client for photo storage operations
type Client struct {
	client    *minio.Client
	bucket    string
	publicURL string
}

// NewClient creates a new MinIO client wrapper
func NewClient(cfg config.MinIOConfig) (*Client, error) {
	if cfg.Endpoint == "" || cfg.AccessKey == "" || cfg.SecretKey == "" {
		return nil, fmt.Errorf("MinIO configuration incomplete: endpoint, access_key, and secret_key are required")
	}

	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to initialize MinIO client: %w", err)
	}

	// Verify bucket exists
	ctx := context.Background()
	exists, err := client.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("failed to check bucket existence: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("bucket %s does not exist", cfg.Bucket)
	}

	log.Printf("✅ MinIO client initialized (endpoint: %s, bucket: %s)", cfg.Endpoint, cfg.Bucket)

	return &Client{
		client:    client,
		bucket:    cfg.Bucket,
		publicURL: cfg.PublicURL,
	}, nil
}

// PutObject uploads data to MinIO at the specified path
func (c *Client) PutObject(path string, data []byte, contentType string) error {
	ctx := context.Background()
	reader := bytes.NewReader(data)

	_, err := c.client.PutObject(ctx, c.bucket, path, reader, int64(len(data)), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("failed to upload object %s: %w", path, err)
	}

	return nil
}

// ObjectExists checks if an object exists at the specified path
func (c *Client) ObjectExists(path string) bool {
	ctx := context.Background()
	_, err := c.client.StatObject(ctx, c.bucket, path, minio.StatObjectOptions{})
	return err == nil
}

// GetPublicURL returns the public URL for an object
func (c *Client) GetPublicURL(path string) string {
	return fmt.Sprintf("%s/%s/%s", c.publicURL, c.bucket, path)
}

// GetObject downloads an object from MinIO and returns its bytes and content type
func (c *Client) GetObject(path string) ([]byte, string, error) {
	ctx := context.Background()
	obj, err := c.client.GetObject(ctx, c.bucket, path, minio.GetObjectOptions{})
	if err != nil {
		return nil, "", fmt.Errorf("failed to get object %s: %w", path, err)
	}
	defer obj.Close()

	stat, err := obj.Stat()
	if err != nil {
		return nil, "", fmt.Errorf("failed to stat object %s: %w", path, err)
	}

	data, err := io.ReadAll(obj)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read object %s: %w", path, err)
	}

	return data, stat.ContentType, nil
}

// RemoveObject deletes an object at the specified path
func (c *Client) RemoveObject(path string) error {
	ctx := context.Background()
	err := c.client.RemoveObject(ctx, c.bucket, path, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to remove object %s: %w", path, err)
	}
	return nil
}
