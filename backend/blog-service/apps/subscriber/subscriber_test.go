//go:build integration

package subscriber

import (
	"context"
	"strings"
	"testing"

	"github.com/google/uuid"

	"github.com/myunila/blog-service/testutil"
)

// =============================================================================
// SUBSCRIBER REPOSITORY TESTS (Phase BB)
//
// Covers critical security/business logic:
//   - Token rotation pasca-confirm (replay prevention)
//   - Idempotent re-subscribe (3 status branches: new / already_confirmed / resent)
//   - Email validation rejection
//   - Confirm token expiry / one-shot semantic
//   - Unsubscribe permanent token (idempotent)
//   - List confirmed-only for broadcast fanout
//
// Run: go test -tags=integration ./apps/subscriber/
// =============================================================================

const testEmailPrefix = "subscribertest"

func cleanupTestSubscribers(t *testing.T, repo *Repository) {
	t.Helper()
	_, _ = repo.db.Exec(
		`DELETE FROM interaction.subscriber WHERE email LIKE $1`,
		testEmailPrefix+"%@test.local",
	)
}

func TestSubscribe_NewEmail_ReturnsPendingConfirmation(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	res, err := repo.Subscribe(ctx, idBlog, testEmailPrefix+"_new@test.local")
	if err != nil {
		t.Fatalf("subscribe new: %v", err)
	}
	if res.Status != "pending_confirmation" {
		t.Errorf("expected status=pending_confirmation, got %q", res.Status)
	}
	if res.TokenVerify == "" {
		t.Error("expected token_verify to be generated")
	}
	if len(res.TokenVerify) < 32 {
		t.Errorf("token_verify too short (entropy concern): %d chars", len(res.TokenVerify))
	}
}

func TestSubscribe_ReSubmitPending_RotatesToken(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	email := testEmailPrefix + "_rotate@test.local"

	first, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("first subscribe: %v", err)
	}
	second, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("second subscribe: %v", err)
	}
	if second.Status != "resent" {
		t.Errorf("expected status=resent on second submit, got %q", second.Status)
	}
	if second.TokenVerify == first.TokenVerify {
		t.Error("token_verify should rotate on re-submit — got same token")
	}

	// Original token must NOT be valid anymore (replay prevention).
	if _, err := repo.ConfirmByToken(ctx, first.TokenVerify); err == nil {
		t.Error("confirming with old (rotated-out) token should fail")
	}
}

func TestSubscribe_AlreadyConfirmed_NoToken(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	email := testEmailPrefix + "_confirmed@test.local"

	first, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("first subscribe: %v", err)
	}
	if _, err := repo.ConfirmByToken(ctx, first.TokenVerify); err != nil {
		t.Fatalf("confirm: %v", err)
	}
	// Re-submit same email setelah confirmed → no-op, no email sent.
	again, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("re-submit confirmed: %v", err)
	}
	if again.Status != "already_confirmed" {
		t.Errorf("expected already_confirmed, got %q", again.Status)
	}
	if again.TokenVerify != "" {
		t.Error("token_verify should be empty for already_confirmed (no email send)")
	}
}

func TestSubscribe_InvalidEmail_Rejected(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	cases := []string{
		"",
		"   ",
		"not-an-email",
		"@nodomain",
		"no-at-sign.test",
		strings.Repeat("a", 201) + "@long.test", // length cap 200
	}
	for _, e := range cases {
		t.Run(e, func(t *testing.T) {
			if _, err := repo.Subscribe(ctx, idBlog, e); err == nil {
				t.Errorf("expected error for invalid email %q", e)
			}
		})
	}
}

func TestConfirm_RotatesTokenAfterConfirm(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	email := testEmailPrefix + "_confirm_rotate@test.local"

	res, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("subscribe: %v", err)
	}
	originalToken := res.TokenVerify

	sub, err := repo.ConfirmByToken(ctx, originalToken)
	if err != nil {
		t.Fatalf("first confirm: %v", err)
	}
	if sub.Status != "confirmed" {
		t.Errorf("expected confirmed status, got %q", sub.Status)
	}

	// Replay attack: same token must NOT work twice.
	if _, err := repo.ConfirmByToken(ctx, originalToken); err == nil {
		t.Error("re-confirm with same token should fail (token rotated)")
	}
}

func TestUnsubscribe_PermanentTokenIdempotent(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	email := testEmailPrefix + "_unsub@test.local"

	res, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("subscribe: %v", err)
	}
	confirmed, err := repo.ConfirmByToken(ctx, res.TokenVerify)
	if err != nil {
		t.Fatalf("confirm: %v", err)
	}

	first, err := repo.UnsubscribeByToken(ctx, confirmed.TokenUnsubscribe)
	if err != nil {
		t.Fatalf("first unsubscribe: %v", err)
	}
	if first.Status != "unsubscribed" {
		t.Errorf("expected unsubscribed, got %q", first.Status)
	}

	// Unsubscribe permanent token works repeatedly (no rotation).
	again, err := repo.UnsubscribeByToken(ctx, confirmed.TokenUnsubscribe)
	if err != nil {
		t.Errorf("idempotent unsubscribe should not error: %v", err)
	}
	if again.Status != "unsubscribed" {
		t.Errorf("expected unsubscribed on replay, got %q", again.Status)
	}
}

func TestUnsubscribe_InvalidToken_Rejects(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)

	ctx := context.Background()
	if _, err := repo.UnsubscribeByToken(ctx, "nonexistent-token-xyz"); err == nil {
		t.Error("expected error for unknown unsubscribe token")
	}
	if _, err := repo.UnsubscribeByToken(ctx, ""); err == nil {
		t.Error("expected error for empty unsubscribe token")
	}
}

func TestListConfirmedForBlog_FiltersByStatus(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)

	// Seed 3 subscribers in 3 different states.
	pendingRes, _ := repo.Subscribe(ctx, idBlog, testEmailPrefix+"_list_pending@test.local")
	confirmRes, _ := repo.Subscribe(ctx, idBlog, testEmailPrefix+"_list_confirmed@test.local")
	confirmed, err := repo.ConfirmByToken(ctx, confirmRes.TokenVerify)
	if err != nil {
		t.Fatalf("confirm seed: %v", err)
	}
	unsubRes, _ := repo.Subscribe(ctx, idBlog, testEmailPrefix+"_list_unsub@test.local")
	unsubConfirmed, err := repo.ConfirmByToken(ctx, unsubRes.TokenVerify)
	if err != nil {
		t.Fatalf("confirm seed for unsub: %v", err)
	}
	if _, err := repo.UnsubscribeByToken(ctx, unsubConfirmed.TokenUnsubscribe); err != nil {
		t.Fatalf("unsub seed: %v", err)
	}

	confirmedList, err := repo.ListConfirmedForBlog(ctx, idBlog)
	if err != nil {
		t.Fatalf("list confirmed: %v", err)
	}
	// Must include our confirmed row + exclude pending/unsubscribed.
	foundConfirmed := false
	for _, s := range confirmedList {
		if s.Email == confirmed.Email {
			foundConfirmed = true
		}
		if s.Email == testEmailPrefix+"_list_pending@test.local" {
			t.Error("pending subscriber should NOT appear in confirmed list")
		}
		if s.Email == testEmailPrefix+"_list_unsub@test.local" {
			t.Error("unsubscribed should NOT appear in confirmed list")
		}
	}
	if !foundConfirmed {
		t.Error("expected confirmed subscriber to be in list")
	}
	_ = pendingRes // silence unused var
}

func TestSubscribe_ResubscribeAfterUnsubscribe(t *testing.T) {
	db := testutil.OpenTestDB(t)
	repo := NewRepository(db)
	t.Cleanup(func() { cleanupTestSubscribers(t, repo) })

	ctx := context.Background()
	idBlog := uuid.MustParse(testutil.SeededBlogID)
	email := testEmailPrefix + "_resub@test.local"

	res, _ := repo.Subscribe(ctx, idBlog, email)
	confirmed, _ := repo.ConfirmByToken(ctx, res.TokenVerify)
	if _, err := repo.UnsubscribeByToken(ctx, confirmed.TokenUnsubscribe); err != nil {
		t.Fatalf("unsub: %v", err)
	}

	// Re-submit setelah unsubscribed → reset ke pending dengan token baru.
	again, err := repo.Subscribe(ctx, idBlog, email)
	if err != nil {
		t.Fatalf("resubscribe: %v", err)
	}
	if again.Status != "resent" {
		t.Errorf("expected resent after unsub-resub, got %q", again.Status)
	}
}
