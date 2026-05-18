// Package testutil — shared helpers untuk integration test blog-service.
//
// Strategy: tests jalan terhadap local Postgres dev DB (blog_unila), bukan
// in-memory atau testcontainer, supaya validate actual SQL behavior (CHECK
// constraint, partial unique index, FK cascade, dst).
//
// Build tag `integration` di tiap test file supaya `go test ./...` default
// skip mereka. Run dengan: `go test -tags=integration ./...`.
//
// Cleanup: tests pakai prefix-based unique values + DELETE di t.Cleanup
// supaya idempotent + tidak mengganggu data dev existing.
package testutil

import (
	"fmt"
	"os"
	"testing"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// OpenTestDB — connect ke blog_unila di local dev. Env vars override
// (BLOG_DB_HOST, BLOG_DB_PORT, BLOG_DB_USER, BLOG_DB_PASSWORD, BLOG_DB_NAME).
// Default cocok untuk laragon Postgres 14.5 lokal.
//
// Test akan skip (not fail) kalau DB unreachable — supaya CI tanpa DB
// passing dengan integration tests sebagai opt-in.
//
// Close di-register via t.Cleanup BUKAN defer di caller — supaya cleanup
// DELETE queries (yang juga di t.Cleanup) jalan SEBELUM connection close.
// t.Cleanup adalah LIFO, jadi yang register terakhir jalan duluan: db.Close
// di sini register pertama → jalan terakhir.
func OpenTestDB(t *testing.T) *sqlx.DB {
	t.Helper()
	host := envOr("BLOG_DB_HOST", "127.0.0.1")
	port := envOr("BLOG_DB_PORT", "5432")
	user := envOr("BLOG_DB_USER", "postgres")
	pass := envOr("BLOG_DB_PASSWORD", "postgres")
	dbname := envOr("BLOG_DB_NAME", "blog_unila")
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, pass, dbname)
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		t.Skipf("Skip integration test (no DB): %v", err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

func envOr(k, fallback string) string {
	if v, ok := os.LookupEnv(k); ok && v != "" {
		return v
	}
	return fallback
}

// SeededBlogID — id_blog dari blog "bambang-dosen" yang sudah ada di seed
// data dev. Tests bisa pakai ini sebagai owner kalau butuh real blog row.
// Kalau berubah, update di sini saja.
const SeededBlogID = "e6978498-24c8-4d70-9eba-900873f673a7"

// SeededBlogOwnerID — id_pengguna_pdut Bambang (owner SeededBlogID).
const SeededBlogOwnerID = "78ef7961-6986-4e4e-9612-4403c83db2ca"

// SeededFollowerID — test user id (00...001) yang seed sudah follow blog
// di atas; dipakai untuk simulasi authenticated user.
const SeededFollowerID = "00000000-0000-0000-0000-000000000001"
