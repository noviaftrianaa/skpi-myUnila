package post

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// =============================================================================
// SCHEDULED POSTS PUBLISHER
// Background goroutine yang publish post dengan status='scheduled' saat tgl_jadwal tiba.
// Emit new_post_from_following notif ke followers (treat sebagai first publish).
// =============================================================================

// SchedulerNotifier — emitter interface untuk follower notif.
// Sama dengan PublishNotifier di handler.go, tapi declared lagi untuk decouple.
type SchedulerNotifier interface {
	EmitNewPostFromFollowing(ctx context.Context, idPost, idBlog uuid.UUID)
}

// RunScheduler — start background ticker. Block selama service jalan.
// Pakai 60s interval — granular cukup buat kebutuhan blog (gak perlu sub-second).
// Cancel via context dari main.
func RunScheduler(ctx context.Context, db *sqlx.DB, notif SchedulerNotifier) {
	log.Println("📅 Post scheduler started (60s tick)")
	// Run once immediately untuk catch any due posts saat startup
	publishDue(ctx, db, notif)
	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			log.Println("📅 Post scheduler stopped")
			return
		case <-ticker.C:
			publishDue(ctx, db, notif)
		}
	}
}

// publishDue — find scheduled posts with tgl_jadwal in past, publish them, emit notif.
// Single-roundtrip UPDATE with RETURNING. Status 'scheduled' transition ke 'published'.
// Set tgl_terbit = tgl_jadwal (preserve scheduled time as publish time) kalau belum.
func publishDue(ctx context.Context, db *sqlx.DB, notif SchedulerNotifier) {
	type result struct {
		IDPost uuid.UUID `db:"id_post"`
		IDBlog uuid.UUID `db:"id_blog"`
		Judul  string    `db:"judul"`
	}
	var rows []result
	err := db.SelectContext(ctx, &rows, `
		UPDATE blog.post
		SET status = 'published',
		    tgl_terbit = COALESCE(tgl_terbit, tgl_jadwal),
		    updated_at = NOW()
		WHERE status = 'scheduled'
		  AND tgl_jadwal IS NOT NULL
		  AND tgl_jadwal <= NOW()
		  AND soft_delete IS NULL
		RETURNING id_post, id_blog, judul`)
	if err != nil {
		log.Printf("📅 scheduler.publishDue: %v", err)
		return
	}
	if len(rows) == 0 {
		return
	}
	log.Printf("📅 scheduler: published %d due posts", len(rows))
	for _, r := range rows {
		log.Printf("   ✓ %s (%s)", r.Judul, r.IDPost.String()[:8])
		if notif != nil {
			// background context — gak terikat ctx Done supaya notif tetap masuk
			// kalau service shutdown di tengah loop. Pakai goroutine biar paralel.
			go notif.EmitNewPostFromFollowing(context.Background(), r.IDPost, r.IDBlog)
		}
	}
}
