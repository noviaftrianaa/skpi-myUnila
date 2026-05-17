// Package minio wraps the MinIO S3 client for blog-service.
// Bucket: blog-media. Path convention: {id_blog}/{yyyy}/{mm}/{uuid}.{ext}.
// Pattern adopted from api-service/external/minio for consistency.
package minio

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"net/url"
	"time"

	miniogo "github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"github.com/myunila/blog-service/config"
)

type Client struct {
	cli       *miniogo.Client
	bucket    string
	publicURL string
}

var Default *Client

// Init connects to MinIO and sets the package-level Default. Returns nil client
// without error when credentials are empty (caller can opt-in to "no storage"
// mode for local dev). Returns error only when config is partially set but
// the connection actually fails.
func Init(cfg config.MinIOConfig) (*Client, error) {
	if cfg.Endpoint == "" || cfg.AccessKey == "" || cfg.SecretKey == "" {
		log.Printf("⚠️  MinIO not configured (endpoint/access_key/secret_key empty) — media uploads disabled")
		return nil, nil
	}
	c, err := miniogo.New(cfg.Endpoint, &miniogo.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("init minio client: %w", err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	exists, err := c.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		return nil, fmt.Errorf("bucket exists check (%s): %w", cfg.Bucket, err)
	}
	if !exists {
		// Auto-create bucket for dev convenience. Production should pre-create
		// via mc with explicit policy.
		if err := c.MakeBucket(ctx, cfg.Bucket, miniogo.MakeBucketOptions{}); err != nil {
			return nil, fmt.Errorf("create bucket %s: %w", cfg.Bucket, err)
		}
		// Set anonymous read policy — every uploaded object must be
		// browser-fetchable via the URL we store in media.url_publik.
		policy := fmt.Sprintf(`{
			"Version": "2012-10-17",
			"Statement": [
				{
					"Effect": "Allow",
					"Principal": {"AWS": ["*"]},
					"Action": ["s3:GetObject"],
					"Resource": ["arn:aws:s3:::%s/*"]
				}
			]
		}`, cfg.Bucket)
		if err := c.SetBucketPolicy(ctx, cfg.Bucket, policy); err != nil {
			log.Printf("⚠️  failed to set public-read policy on %s: %v", cfg.Bucket, err)
		}
		log.Printf("📦 MinIO bucket created with public-read policy: %s", cfg.Bucket)
	}

	publicURL := cfg.PublicURL
	if publicURL == "" {
		scheme := "http"
		if cfg.UseSSL {
			scheme = "https"
		}
		publicURL = fmt.Sprintf("%s://%s", scheme, cfg.Endpoint)
	}

	Default = &Client{cli: c, bucket: cfg.Bucket, publicURL: publicURL}
	log.Printf("✅ MinIO connected (endpoint=%s, bucket=%s)", cfg.Endpoint, cfg.Bucket)
	return Default, nil
}

func (c *Client) Bucket() string    { return c.bucket }
func (c *Client) PublicURL() string { return c.publicURL }

// PutObject uploads bytes. Returns the public URL for the stored object.
func (c *Client) PutObject(ctx context.Context, path string, data []byte, contentType string) (string, error) {
	_, err := c.cli.PutObject(ctx, c.bucket, path,
		bytes.NewReader(data), int64(len(data)),
		miniogo.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", fmt.Errorf("put %s: %w", path, err)
	}
	return c.GetPublicURL(path), nil
}

// PutObjectStream is the io.Reader variant — preferred for large uploads to
// avoid reading the whole file into memory before sending.
func (c *Client) PutObjectStream(ctx context.Context, path string, r io.Reader, size int64, contentType string) (string, error) {
	_, err := c.cli.PutObject(ctx, c.bucket, path, r, size,
		miniogo.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", fmt.Errorf("put stream %s: %w", path, err)
	}
	return c.GetPublicURL(path), nil
}

// RemoveObject deletes the object at path.
func (c *Client) RemoveObject(ctx context.Context, path string) error {
	return c.cli.RemoveObject(ctx, c.bucket, path, miniogo.RemoveObjectOptions{})
}

// GetPublicURL returns the canonical public URL for a stored object.
func (c *Client) GetPublicURL(path string) string {
	return fmt.Sprintf("%s/%s/%s", c.publicURL, c.bucket, path)
}

// PresignedGetURL generates a time-limited read URL — useful when bucket
// policy is not public-read (e.g. document attachments).
func (c *Client) PresignedGetURL(ctx context.Context, path string, ttl time.Duration) (string, error) {
	u, err := c.cli.PresignedGetObject(ctx, c.bucket, path, ttl, url.Values{})
	if err != nil {
		return "", fmt.Errorf("presign %s: %w", path, err)
	}
	return u.String(), nil
}
