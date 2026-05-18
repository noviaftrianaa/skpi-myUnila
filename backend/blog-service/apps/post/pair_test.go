//go:build integration

package post

import (
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"

	"github.com/myunila/blog-service/testutil"
)

// =============================================================================
// POST PAIR-LINK TESTS (Phase BD — bilingual ID↔EN)
//
// Covers atomic transaction safety + business rules:
//   - Symmetric link (both rows updated)
//   - Reject same-bahasa pair
//   - Reject self-pair
//   - Reject cross-blog pair (security: only own posts)
//   - Detach prior pair when re-linking
//   - Unlink clears both sides
//
// Run: go test -tags=integration ./apps/post/
// =============================================================================

const testPostSlugPrefix = "pairtest"

// makeTestPost — INSERT minimal test post + return id. Cleanup via t.Cleanup.
func makeTestPost(t *testing.T, repo *Repository, idBlog uuid.UUID, slug, bahasa string) uuid.UUID {
	t.Helper()
	var idPost uuid.UUID
	err := repo.db.QueryRow(`
		INSERT INTO blog.post (id_blog, judul, slug, status, visibilitas, bahasa)
		VALUES ($1, $2, $3, 'draft', 'public', $4)
		RETURNING id_post`,
		idBlog, "Test "+slug, slug, bahasa,
	).Scan(&idPost)
	if err != nil {
		t.Fatalf("insert test post %s: %v", slug, err)
	}
	t.Cleanup(func() {
		_, _ = repo.db.Exec(`DELETE FROM blog.post WHERE id_post = $1`, idPost)
	})
	return idPost
}

func TestLinkPair_SymmetricUpdate(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	idID := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-link-id", "id")
	idEN := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-link-en", "en")

	if err := repo.LinkPair(ctx, idID, idEN, idBlog); err != nil {
		t.Fatalf("LinkPair: %v", err)
	}

	// Verify both sides point to each other.
	pID, err := repo.GetByID(ctx, idID)
	if err != nil {
		t.Fatalf("get ID side: %v", err)
	}
	if pID.IDPairPost == nil || *pID.IDPairPost != idEN {
		t.Errorf("ID side pair = %v, want %v", pID.IDPairPost, idEN)
	}

	pEN, err := repo.GetByID(ctx, idEN)
	if err != nil {
		t.Fatalf("get EN side: %v", err)
	}
	if pEN.IDPairPost == nil || *pEN.IDPairPost != idID {
		t.Errorf("EN side pair = %v, want %v", pEN.IDPairPost, idID)
	}
}

func TestLinkPair_RejectSameBahasa(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	idA := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-same-a", "id")
	idB := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-same-b", "id")

	err := repo.LinkPair(ctx, idA, idB, idBlog)
	if err == nil {
		t.Fatal("expected error linking two same-bahasa posts")
	}
	if !strings.Contains(err.Error(), "beda bahasa") {
		t.Errorf("expected 'beda bahasa' error, got: %v", err)
	}

	// Both should remain unlinked.
	pA, _ := repo.GetByID(ctx, idA)
	if pA.IDPairPost != nil {
		t.Error("A should not be linked after rejected attempt")
	}
}

func TestLinkPair_RejectSelfPair(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	id := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-self", "id")

	err := repo.LinkPair(ctx, id, id, idBlog)
	if err == nil {
		t.Fatal("expected error linking post to itself")
	}
}

func TestLinkPair_RejectCrossBlog(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	// Cari blog kedua untuk uji cross-blog (kalau gak ada, skip).
	var otherBlogID uuid.UUID
	err := db.QueryRow(`
		SELECT id_blog FROM blog.blog
		WHERE id_blog <> $1 AND soft_delete IS NULL
		ORDER BY created_at LIMIT 1`, idBlog).Scan(&otherBlogID)
	if err != nil {
		t.Skipf("need 2+ blogs in DB for cross-blog test: %v", err)
	}

	idMine := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-cross-mine", "id")
	idOther := makeTestPost(t, repo, otherBlogID, testPostSlugPrefix+"-cross-other", "en")

	// Owner (idBlog) cannot link to a post in otherBlogID.
	err = repo.LinkPair(ctx, idMine, idOther, idBlog)
	if err == nil {
		t.Fatal("expected error linking cross-blog posts")
	}
	if !strings.Contains(err.Error(), "blog yang sama") {
		t.Errorf("expected 'blog yang sama' error, got: %v", err)
	}
}

func TestLinkPair_DetachPriorPair(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	idA := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-detach-a", "id")
	idB := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-detach-b", "en")
	idC := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-detach-c", "en")

	// Link A ↔ B
	if err := repo.LinkPair(ctx, idA, idB, idBlog); err != nil {
		t.Fatalf("first link: %v", err)
	}
	// Re-link A ↔ C → B should auto-detach
	if err := repo.LinkPair(ctx, idA, idC, idBlog); err != nil {
		t.Fatalf("relink: %v", err)
	}

	pB, _ := repo.GetByID(ctx, idB)
	if pB.IDPairPost != nil {
		t.Errorf("B should be detached after A re-linked to C, but pair=%v", pB.IDPairPost)
	}
	pA, _ := repo.GetByID(ctx, idA)
	if pA.IDPairPost == nil || *pA.IDPairPost != idC {
		t.Errorf("A should now pair to C, got %v", pA.IDPairPost)
	}
	pC, _ := repo.GetByID(ctx, idC)
	if pC.IDPairPost == nil || *pC.IDPairPost != idA {
		t.Errorf("C should now pair to A, got %v", pC.IDPairPost)
	}
}

func TestUnlinkPair_ClearsBothSides(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	idID := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-unlink-id", "id")
	idEN := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-unlink-en", "en")

	if err := repo.LinkPair(ctx, idID, idEN, idBlog); err != nil {
		t.Fatalf("link setup: %v", err)
	}
	if err := repo.UnlinkPair(ctx, idID, idBlog); err != nil {
		t.Fatalf("unlink: %v", err)
	}

	pID, _ := repo.GetByID(ctx, idID)
	if pID.IDPairPost != nil {
		t.Errorf("ID side should be null after unlink, got %v", pID.IDPairPost)
	}
	pEN, _ := repo.GetByID(ctx, idEN)
	if pEN.IDPairPost != nil {
		t.Errorf("EN side should be null after unlink, got %v", pEN.IDPairPost)
	}
}

func TestUnlinkPair_NotLinked_Errors(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	id := makeTestPost(t, repo, idBlog, testPostSlugPrefix+"-no-pair", "id")
	err := repo.UnlinkPair(ctx, id, idBlog)
	if err == nil {
		t.Error("expected error unlinking a non-paired post")
	}
}
