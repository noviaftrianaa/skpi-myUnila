package push

import (
	"context"
	"log"

	"github.com/google/uuid"
)

// =============================================================================
// NOTIF → PUSH BRIDGE
//
// Implements interaction.PushNotifier. Called di goroutine async dari
// NotifRepository.Insert (fire-and-forget). Per-tipe punya title/body subject
// yang singkat — sesuai notification box di browser yang space-nya terbatas.
// =============================================================================

type Bridge struct{ sender *Sender }

func NewBridge(sender *Sender) *Bridge { return &Bridge{sender: sender} }

// NotifyForNotif satisfies interaction.PushNotifier. Best-effort: error
// di-log saja, gak return (notif tetap insert).
func (b *Bridge) NotifyForNotif(ctx context.Context, idNotif uuid.UUID, idPenerima uuid.UUID, tipe string, aktorNama string, judulRef *string, urlTarget *string) {
	if b.sender == nil || !b.sender.Configured() {
		return
	}
	title, body := renderPush(tipe, aktorNama, judulRef)
	url := "/dashboard/blog-platform/notifications"
	if urlTarget != nil && *urlTarget != "" {
		url = *urlTarget
	}
	sent, deleted, err := b.sender.SendToUser(ctx, idPenerima, Payload{
		Title:   title,
		Body:    body,
		URL:     url,
		Tipe:    tipe,
		IDNotif: idNotif.String(),
	})
	if err != nil {
		log.Printf("🔔 push bridge: %v", err)
		return
	}
	if sent > 0 || deleted > 0 {
		log.Printf("🔔 push %s → user=%s: %d sent, %d stale-deleted", tipe, idPenerima, sent, deleted)
	}
}

// renderPush — short title/body untuk tiap tipe. Browser notification UI
// cuma show ~50 char title + 100 char body sebelum truncate.
func renderPush(tipe, aktor string, judulRef *string) (title, body string) {
	if aktor == "" {
		aktor = "Seseorang"
	}
	judul := ""
	if judulRef != nil {
		judul = *judulRef
	}
	switch tipe {
	case "like_post":
		title = "❤️ " + aktor + " menyukai post kamu"
		body = judul
	case "komentar_post":
		title = "💬 " + aktor + " berkomentar"
		body = judul
	case "reply_komentar":
		title = "↩️ " + aktor + " membalas komentar"
		body = judul
	case "follow_blog":
		title = "✨ " + aktor + " mulai follow blog kamu"
		body = "Mereka akan dapat notif post baru kamu."
	case "new_post_from_following":
		title = "📰 " + aktor + " publish post baru"
		body = judul
	case "mention_komentar":
		title = "📣 " + aktor + " menyebut kamu"
		body = judul
	case "mention_post":
		title = "📣 " + aktor + " menyebut kamu di post"
		body = judul
	case "coauthor_invite":
		title = "✉️ Undangan co-author dari " + aktor
		body = judul
	case "coauthor_responded":
		title = "✉️ " + aktor + " merespon undangan"
		body = judul
	default:
		title = "🔔 Notifikasi baru Blog Unila"
		body = aktor
	}
	if len(title) > 80 {
		title = title[:80]
	}
	if len(body) > 160 {
		body = body[:160] + "…"
	}
	return title, body
}
