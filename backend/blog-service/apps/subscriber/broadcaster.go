package subscriber

import (
	"context"
	"log"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"

	"github.com/myunila/blog-service/apps/mail"
)

// =============================================================================
// SUBSCRIBER BROADCASTER (Phase BB)
//
// Satisfies post.SubscriberBroadcaster. Saat post first-publish, fetch
// confirmed subscribers + minimal post info, lalu hand over ke mail.SubscriberMailer.
//
// Per-broadcast best-effort: error di tengah list gak fail semua. Marks
// last_sent_at untuk yang sukses.
// =============================================================================

type Broadcaster struct {
	db      *sqlx.DB
	repo    *Repository
	mailer  *mail.SubscriberMailer
}

func NewBroadcaster(db *sqlx.DB, repo *Repository, mailer *mail.SubscriberMailer) *Broadcaster {
	return &Broadcaster{db: db, repo: repo, mailer: mailer}
}

// BroadcastPublishedPost satisfies post.SubscriberBroadcaster.
func (b *Broadcaster) BroadcastPublishedPost(ctx context.Context, idBlog, idPost uuid.UUID) {
	if b.mailer == nil {
		return
	}
	// Fetch confirmed subscribers
	subs, err := b.repo.ListConfirmedForBlog(ctx, idBlog)
	if err != nil {
		log.Printf("📬 broadcast subscribers: list: %v", err)
		return
	}
	if len(subs) == 0 {
		return
	}

	// Fetch post minimal info (judul, ringkasan, slug, cover_url)
	var post struct {
		Judul     string  `db:"judul"`
		Ringkasan *string `db:"ringkasan"`
		Slug      string  `db:"slug"`
		CoverURL  *string `db:"cover_url"`
	}
	err = b.db.GetContext(ctx, &post, `
		SELECT judul, ringkasan, slug, cover_url
		FROM blog.post WHERE id_post = $1 AND soft_delete IS NULL`, idPost)
	if err != nil {
		log.Printf("📬 broadcast subscribers: fetch post: %v", err)
		return
	}

	// Convert subs ke mail.Subscriber slice (kasih cuma yang dibutuhin).
	mailSubs := make([]mail.Subscriber, len(subs))
	for i, s := range subs {
		mailSubs[i] = mail.Subscriber{
			IDSubscriber:     s.IDSubscriber,
			Email:            s.Email,
			TokenUnsubscribe: s.TokenUnsubscribe,
		}
	}

	in := mail.BroadcastInput{
		IDBlog:    idBlog,
		JudulPost: post.Judul,
		Slug:      post.Slug,
	}
	if post.Ringkasan != nil {
		in.Ringkasan = *post.Ringkasan
	}
	if post.CoverURL != nil {
		in.CoverURL = *post.CoverURL
	}

	sent, ferr := b.mailer.BroadcastNewPost(ctx, in, mailSubs)
	if ferr != nil {
		log.Printf("📬 broadcast subscribers: fanout: %v", ferr)
		return
	}

	// Mark last_sent_at — pakai semua id (best-effort, gak per-row).
	ids := make([]uuid.UUID, len(subs))
	for i, s := range subs {
		ids[i] = s.IDSubscriber
	}
	b.repo.MarkSent(ctx, ids)

	log.Printf("📬 broadcast post=%s blog=%s: %d email enqueued (of %d subs)",
		idPost, idBlog, sent, len(subs))
}
