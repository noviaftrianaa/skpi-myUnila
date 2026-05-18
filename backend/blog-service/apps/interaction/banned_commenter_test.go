//go:build integration

package interaction

import (
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"

	"github.com/myunila/blog-service/testutil"
)

// =============================================================================
// BANNED COMMENTER TESTS (Phase BF)
//
// Covers ownership-scoped ban enforcement + idempotent operations:
//   - Ban happy path
//   - Idempotent re-ban (partial unique constraint)
//   - Reject self-ban (owner banning themselves)
//   - IsBanned returns correct alasan
//   - Unban removes from active query (soft delete)
//   - Re-ban after unban OK (partial unique allows after soft_delete'd)
//   - Empty alasan rejected
//
// Run: go test -tags=integration ./apps/interaction/
// =============================================================================

func cleanupBans(t *testing.T, repo *BannedCommenterRepository, idBlog uuid.UUID) {
	t.Helper()
	_, _ = repo.db.Exec(
		`DELETE FROM blog.banned_commenter WHERE id_blog = $1 AND alasan LIKE 'bantest:%'`,
		idBlog,
	)
}

func TestBan_HappyPath(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	idOwner := uuid.MustParse(testutil.SeededBlogOwnerID)
	idTarget := uuid.MustParse(testutil.SeededFollowerID)
	t.Cleanup(func() { cleanupBans(t, repo, idBlog) })

	rec, err := repo.Ban(ctx, idBlog, idTarget, idOwner, "bantest: spam berulang")
	if err != nil {
		t.Fatalf("Ban: %v", err)
	}
	if rec.IDBlog != idBlog {
		t.Errorf("expected id_blog=%v, got %v", idBlog, rec.IDBlog)
	}
	if rec.Alasan != "bantest: spam berulang" {
		t.Errorf("alasan mismatch: %s", rec.Alasan)
	}

	// IsBanned must return true with correct alasan.
	banned, alasan, err := repo.IsBanned(ctx, idBlog, idTarget)
	if err != nil {
		t.Fatalf("IsBanned: %v", err)
	}
	if !banned {
		t.Error("expected IsBanned=true after Ban")
	}
	if alasan != "bantest: spam berulang" {
		t.Errorf("IsBanned alasan = %q, want spam berulang", alasan)
	}
}

func TestBan_IdempotentRepeat_Rejects(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	idOwner := uuid.MustParse(testutil.SeededBlogOwnerID)
	idTarget := uuid.MustParse(testutil.SeededFollowerID)
	t.Cleanup(func() { cleanupBans(t, repo, idBlog) })

	if _, err := repo.Ban(ctx, idBlog, idTarget, idOwner, "bantest: first ban"); err != nil {
		t.Fatalf("first ban: %v", err)
	}
	_, err := repo.Ban(ctx, idBlog, idTarget, idOwner, "bantest: second ban attempt")
	if err == nil {
		t.Fatal("expected error on duplicate active ban (partial unique constraint)")
	}
	if !strings.Contains(err.Error(), "sudah di-ban") {
		t.Errorf("expected friendly 'sudah di-ban' error, got: %v", err)
	}
}

func TestBan_RejectSelfBan(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	idOwner := uuid.MustParse(testutil.SeededBlogOwnerID)
	t.Cleanup(func() { cleanupBans(t, repo, idBlog) })

	_, err := repo.Ban(ctx, idBlog, idOwner, idOwner, "bantest: self ban")
	if err == nil {
		t.Fatal("expected error when owner bans themselves")
	}
	if !strings.Contains(err.Error(), "diri sendiri") {
		t.Errorf("expected 'diri sendiri' error, got: %v", err)
	}
}

func TestBan_EmptyAlasan_Rejects(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	idOwner := uuid.MustParse(testutil.SeededBlogOwnerID)
	idTarget := uuid.MustParse(testutil.SeededFollowerID)

	for _, alasan := range []string{"", "   ", "\t\n"} {
		_, err := repo.Ban(ctx, idBlog, idTarget, idOwner, alasan)
		if err == nil {
			t.Errorf("expected error for empty/whitespace alasan %q", alasan)
		}
	}
}

func TestUnban_DeactivatesEnforcement(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	idOwner := uuid.MustParse(testutil.SeededBlogOwnerID)
	idTarget := uuid.MustParse(testutil.SeededFollowerID)
	t.Cleanup(func() { cleanupBans(t, repo, idBlog) })

	rec, err := repo.Ban(ctx, idBlog, idTarget, idOwner, "bantest: pre-unban")
	if err != nil {
		t.Fatalf("ban: %v", err)
	}

	if err := repo.Unban(ctx, rec.IDBannedCommenter, idBlog); err != nil {
		t.Fatalf("unban: %v", err)
	}

	banned, _, err := repo.IsBanned(ctx, idBlog, idTarget)
	if err != nil {
		t.Fatalf("IsBanned after unban: %v", err)
	}
	if banned {
		t.Error("user should NOT be banned after Unban (soft_delete activated)")
	}
}

func TestUnban_NotFound_Errors(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	bogusID := uuid.New()
	err := repo.Unban(ctx, bogusID, idBlog)
	if err == nil {
		t.Error("expected error unbanning non-existent ban id")
	}
}

func TestBan_AfterUnban_Allowed(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	idOwner := uuid.MustParse(testutil.SeededBlogOwnerID)
	idTarget := uuid.MustParse(testutil.SeededFollowerID)
	t.Cleanup(func() { cleanupBans(t, repo, idBlog) })

	first, err := repo.Ban(ctx, idBlog, idTarget, idOwner, "bantest: first")
	if err != nil {
		t.Fatalf("first ban: %v", err)
	}
	if err := repo.Unban(ctx, first.IDBannedCommenter, idBlog); err != nil {
		t.Fatalf("unban: %v", err)
	}

	// Partial unique allows new row karena old row punya soft_delete IS NOT NULL.
	second, err := repo.Ban(ctx, idBlog, idTarget, idOwner, "bantest: re-ban after unban")
	if err != nil {
		t.Fatalf("re-ban after unban should succeed: %v", err)
	}
	if second.IDBannedCommenter == first.IDBannedCommenter {
		t.Error("re-ban should produce new id_banned_commenter row, not reuse old")
	}
	banned, alasan, _ := repo.IsBanned(ctx, idBlog, idTarget)
	if !banned {
		t.Error("user should be banned again after re-ban")
	}
	if alasan != "bantest: re-ban after unban" {
		t.Errorf("alasan should be from second ban, got %q", alasan)
	}
}

func TestIsBanned_NoEntry_ReturnsFalse(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewBannedCommenterRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	randomUser := uuid.New() // user yang gak pernah di-ban

	banned, alasan, err := repo.IsBanned(ctx, idBlog, randomUser)
	if err != nil {
		t.Fatalf("IsBanned no-entry: %v", err)
	}
	if banned {
		t.Error("expected false for random user")
	}
	if alasan != "" {
		t.Errorf("expected empty alasan for non-banned, got %q", alasan)
	}
}
