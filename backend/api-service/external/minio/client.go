// Package minio wrap MinIO client untuk ws-api (photos/* public-read,
// documents/* private). Pattern diadopsi dari sister-service.
package minio

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"

	miniogo "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/myunila/api-service/internal/config"
)

type Client struct {
	cli       *miniogo.Client
	bucket    string
	publicURL string
}

var Default *Client

// Init connect ke MinIO dan set Default global client. Called sekali dari main.
// Kalau config kosong / connect gagal, return error tanpa panic — caller decide
// mau fail-fast atau graceful degrade.
func Init(cfg config.MinIOConfig) (*Client, error) {
	if cfg.Endpoint == "" || cfg.AccessKey == "" || cfg.SecretKey == "" {
		return nil, fmt.Errorf("MinIO config incomplete (endpoint/access_key/secret_key required)")
	}
	c, err := miniogo.New(cfg.Endpoint, &miniogo.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("init minio client: %w", err)
	}
	ctx := context.Background()
	exists, err := c.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("bucket exists check: %w", err)
	}
	if !exists {
		return nil, fmt.Errorf("bucket %s not found", cfg.Bucket)
	}
	Default = &Client{
		cli:       c,
		bucket:    cfg.Bucket,
		publicURL: cfg.PublicURL,
	}
	log.Printf("✅ MinIO connected (endpoint=%s, bucket=%s)", cfg.Endpoint, cfg.Bucket)
	return Default, nil
}

// PutObject upload bytes ke path di bucket.
func (c *Client) PutObject(ctx context.Context, path string, data []byte, contentType string) error {
	_, err := c.cli.PutObject(ctx, c.bucket, path,
		bytes.NewReader(data), int64(len(data)),
		miniogo.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return fmt.Errorf("put %s: %w", path, err)
	}
	return nil
}

// ObjectExists cek apakah object ada di path.
func (c *Client) ObjectExists(ctx context.Context, path string) bool {
	_, err := c.cli.StatObject(ctx, c.bucket, path, miniogo.StatObjectOptions{})
	return err == nil
}

// GetPublicURL kembalikan URL public untuk object (only valid untuk path di
// prefix photos/* — lihat bucket policy di sister-service).
func (c *Client) GetPublicURL(path string) string {
	return fmt.Sprintf("%s/%s/%s", c.publicURL, c.bucket, path)
}

// GetObject download object sebagai byte + content-type.
func (c *Client) GetObject(ctx context.Context, path string) ([]byte, string, error) {
	obj, err := c.cli.GetObject(ctx, c.bucket, path, miniogo.GetObjectOptions{})
	if err != nil {
		return nil, "", fmt.Errorf("get %s: %w", path, err)
	}
	defer obj.Close()
	stat, err := obj.Stat()
	if err != nil {
		return nil, "", fmt.Errorf("stat %s: %w", path, err)
	}
	data, err := io.ReadAll(obj)
	if err != nil {
		return nil, "", fmt.Errorf("read %s: %w", path, err)
	}
	return data, stat.ContentType, nil
}

// RemoveObject hapus object di path.
func (c *Client) RemoveObject(ctx context.Context, path string) error {
	return c.cli.RemoveObject(ctx, c.bucket, path, miniogo.RemoveObjectOptions{})
}

// Bucket return nama bucket aktif (buat logging/debug).
func (c *Client) Bucket() string { return c.bucket }
