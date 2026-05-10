package minio

import (
	"bytes"
	"context"
	"encoding/json"
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

	c := &Client{
		client:    client,
		bucket:    cfg.Bucket,
		publicURL: cfg.PublicURL,
	}

	// Apply bucket policies: photos/ public-read, documents/ private
	if err := c.setupBucketPolicy(ctx); err != nil {
		log.Printf("⚠️  Failed to set bucket policy: %v", err)
	}

	log.Printf("✅ MinIO client initialized (endpoint: %s, bucket: %s)", cfg.Endpoint, cfg.Bucket)
	return c, nil
}

// setupBucketPolicy sets S3 bucket policies based on top-level prefix:
//
// Bucket layout convention:
//
//	photos/                     ← public-read (all entity types)
//	  sdm/{id_sdm}.jpg          ← dosen profile photo
//	  pd/{id_pd}.jpg            ← mahasiswa profile photo
//	  tendik/{id}.jpg           ← tendik profile photo
//
//	documents/                  ← private (all entity types, access via JWT endpoint)
//	  sdm/{id_sdm}/{jns}/{id}   ← dosen documents
//	  pd/{id_pd}/{jns}/{id}     ← mahasiswa documents (future)
//
// Policy: photos/* → public-read | documents/* → private (no statement = deny)
//
// Note on privacy: Foto mahasiswa/tendik di-protect di lapisan endpoint backend
// (mis. /api/v1/me/photo dengan kong.auth middleware). Frontend portal memanggil
// endpoint barrier, bukan URL MinIO langsung — UUID id_pd/id_tendik tidak ke-expose
// di kode frontend. UUID v4 (128 bit) tidak praktis untuk brute-force enumerate.
func (c *Client) setupBucketPolicy(ctx context.Context) error {
	type Statement struct {
		Effect    string            `json:"Effect"`
		Principal map[string]string `json:"Principal"`
		Action    []string          `json:"Action"`
		Resource  []string          `json:"Resource"`
	}
	type Policy struct {
		Version   string      `json:"Version"`
		Statement []Statement `json:"Statement"`
	}

	// Only photos/* is public-read — covers sdm, pd, tendik, and any future entity type.
	// documents/* has no Allow statement → denied to anonymous (private by default).
	policy := Policy{
		Version: "2012-10-17",
		Statement: []Statement{
			{
				Effect:    "Allow",
				Principal: map[string]string{"AWS": "*"},
				Action:    []string{"s3:GetObject"},
				Resource:  []string{fmt.Sprintf("arn:aws:s3:::%s/photos/*", c.bucket)},
			},
		},
	}

	policyJSON, err := json.Marshal(policy)
	if err != nil {
		return fmt.Errorf("failed to marshal bucket policy: %w", err)
	}

	if err := c.client.SetBucketPolicy(ctx, c.bucket, string(policyJSON)); err != nil {
		return fmt.Errorf("failed to apply bucket policy: %w", err)
	}

	log.Printf("✅ Bucket policy: photos/* = public-read | documents/* = private")
	return nil
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

// CountObjects counts all objects under a given prefix
func (c *Client) CountObjects(prefix string) int {
	ctx := context.Background()
	count := 0
	for range c.client.ListObjects(ctx, c.bucket, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	}) {
		count++
	}
	return count
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
