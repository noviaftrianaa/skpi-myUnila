package interaction

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

// =============================================================================
// NOTIFIKASI — Saluran balik ke user untuk aksi engagement.
// Emit di application-level (bukan DB trigger) supaya bisa:
//   - Skip notif self-action (user like post sendiri jangan munculin notif)
//   - Resolve denorm fields (judul post, subdomain) sekali
//   - Future: queue async / webhook tanpa coupling DB
// =============================================================================

const (
	NotifLikePost            = "like_post"
	NotifKomentarPost        = "komentar_post"
	NotifReplyKomentar       = "reply_komentar"
	NotifFollowBlog          = "follow_blog"
	NotifNewPostFromFollowing = "new_post_from_following"
	NotifMentionKomentar      = "mention_komentar"
	NotifMentionPost          = "mention_post"
	NotifCoauthorInvite       = "coauthor_invite"
	NotifCoauthorResponded    = "coauthor_responded"
)

// Notif — entry untuk list dashboard.
type Notif struct {
	IDNotifikasi  uuid.UUID  `db:"id_notifikasi"     json:"id_notifikasi"`
	IDAktorPdut   *uuid.UUID `db:"id_aktor_pdut"     json:"id_aktor_pdut,omitempty"`
	AktorNama     *string    `db:"aktor_nama"        json:"aktor_nama,omitempty"`
	Tipe          string     `db:"tipe"              json:"tipe"`
	IDRefPost     *uuid.UUID `db:"id_ref_post"       json:"id_ref_post,omitempty"`
	IDRefKomentar *uuid.UUID `db:"id_ref_komentar"   json:"id_ref_komentar,omitempty"`
	IDRefBlog     *uuid.UUID `db:"id_ref_blog"       json:"id_ref_blog,omitempty"`
	JudulRef      *string    `db:"judul_ref"         json:"judul_ref,omitempty"`
	URLTarget     *string    `db:"url_target"        json:"url_target,omitempty"`
	SudahDibaca   bool       `db:"sudah_dibaca"      json:"sudah_dibaca"`
	TglDibaca     *time.Time `db:"tgl_dibaca"        json:"tgl_dibaca,omitempty"`
	CreatedAt     time.Time  `db:"created_at"        json:"created_at"`
}

// EmailEnqueuer — interface for queueing an email after a notif is created.
// Implemented by apps/mail.Bridge. nil-safe: when not injected, the notif
// system silently skips email delivery (in-app notif still works).
type EmailEnqueuer interface {
	EnqueueForNotif(ctx context.Context, idNotif uuid.UUID, idPenerima uuid.UUID, tipe string, aktorNama string, judulRef *string, urlTarget *string) error
}

type NotifRepository struct {
	db    *sqlx.DB
	email EmailEnqueuer
}

func NewNotifRepository(db *sqlx.DB) *NotifRepository { return &NotifRepository{db: db} }

// SetEmailEnqueuer wires the email outbox bridge. Optional — call once at
// boot from main.go once apps/mail is set up.
func (r *NotifRepository) SetEmailEnqueuer(e EmailEnqueuer) { r.email = e }

// Insert — generic insert (low-level).
// Recipient + aktor + tipe wajib; ref fields opsional.
type NotifInput struct {
	IDPenerima    uuid.UUID
	IDAktor       *uuid.UUID // NULL untuk anonymous komentator
	AktorNama     *string
	Tipe          string
	IDRefPost     *uuid.UUID
	IDRefKomentar *uuid.UUID
	IDRefBlog     *uuid.UUID
	JudulRef      *string
	URLTarget     *string
}

func (r *NotifRepository) Insert(ctx context.Context, n NotifInput) error {
	// Check user preference — kalau tipe ini di-mute, skip both in-app AND email.
	if muted, _ := r.IsMuted(ctx, n.IDPenerima, n.Tipe); muted {
		return nil
	}
	var idNotif uuid.UUID
	err := r.db.GetContext(ctx, &idNotif, `
		INSERT INTO interaction.notifikasi
		    (id_penerima_pdut, id_aktor_pdut, aktor_nama, tipe,
		     id_ref_post, id_ref_komentar, id_ref_blog, judul_ref, url_target)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id_notifikasi`,
		n.IDPenerima, n.IDAktor, n.AktorNama, n.Tipe,
		n.IDRefPost, n.IDRefKomentar, n.IDRefBlog, n.JudulRef, n.URLTarget)
	if err != nil {
		return fmt.Errorf("insert notif: %w", err)
	}
	// Fan-out to email — best-effort, errors logged but never block in-app
	// notif success.
	if r.email != nil {
		actorNama := ""
		if n.AktorNama != nil {
			actorNama = *n.AktorNama
		}
		if eerr := r.email.EnqueueForNotif(ctx, idNotif, n.IDPenerima, n.Tipe, actorNama, n.JudulRef, n.URLTarget); eerr != nil {
			log.Printf("notif.Insert email enqueue: %v", eerr)
		}
	}
	return nil
}

// =============================================================================
// PREFERENCES — per-user mute settings.
// =============================================================================

type NotifPreference struct {
	IDPenggunaPdut uuid.UUID      `db:"id_pengguna_pdut" json:"id_pengguna_pdut"`
	MutedTipes     pq.StringArray `db:"muted_tipes"      json:"muted_tipes"`
	UpdatedAt      time.Time      `db:"updated_at"       json:"updated_at"`
}

// GetPreference — return pref row, atau default (kosong) kalau belum pernah set.
func (r *NotifRepository) GetPreference(ctx context.Context, idUser uuid.UUID) (*NotifPreference, error) {
	var p NotifPreference
	err := r.db.GetContext(ctx, &p, `
		SELECT id_pengguna_pdut, muted_tipes, updated_at
		FROM interaction.notif_preference
		WHERE id_pengguna_pdut = $1`, idUser)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Default: no mutes
			return &NotifPreference{IDPenggunaPdut: idUser, MutedTipes: pq.StringArray{}}, nil
		}
		return nil, fmt.Errorf("get pref: %w", err)
	}
	if p.MutedTipes == nil {
		p.MutedTipes = pq.StringArray{}
	}
	return &p, nil
}

// SetPreference — upsert. tipes validated against whitelist constants.
func (r *NotifRepository) SetPreference(ctx context.Context, idUser uuid.UUID, mutedTipes []string) error {
	// Validate tipes against known whitelist
	valid := map[string]bool{
		NotifLikePost: true, NotifKomentarPost: true, NotifReplyKomentar: true,
		NotifFollowBlog: true, NotifNewPostFromFollowing: true,
		NotifMentionKomentar: true, NotifMentionPost: true,
		NotifCoauthorInvite: true, NotifCoauthorResponded: true,
	}
	clean := make([]string, 0, len(mutedTipes))
	seen := map[string]bool{}
	for _, t := range mutedTipes {
		if !valid[t] || seen[t] {
			continue
		}
		seen[t] = true
		clean = append(clean, t)
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO interaction.notif_preference (id_pengguna_pdut, muted_tipes)
		VALUES ($1, $2)
		ON CONFLICT (id_pengguna_pdut)
		DO UPDATE SET muted_tipes = EXCLUDED.muted_tipes, updated_at = NOW()`,
		idUser, pq.Array(clean))
	if err != nil {
		return fmt.Errorf("set pref: %w", err)
	}
	return nil
}

// IsMuted — cek apakah user mute tipe tertentu. Gracefully treats no-row as false.
func (r *NotifRepository) IsMuted(ctx context.Context, idUser uuid.UUID, tipe string) (bool, error) {
	var muted bool
	err := r.db.GetContext(ctx, &muted, `
		SELECT $2 = ANY(muted_tipes)
		FROM interaction.notif_preference
		WHERE id_pengguna_pdut = $1`, idUser, tipe)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return muted, nil
}

// List — paginated unread/all.
func (r *NotifRepository) List(ctx context.Context, idPenerima uuid.UUID, onlyUnread bool, limit, offset int) ([]Notif, int, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	where := "id_penerima_pdut = $1"
	if onlyUnread {
		where += " AND sudah_dibaca = FALSE"
	}

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM interaction.notifikasi WHERE "+where, idPenerima); err != nil {
		return nil, 0, fmt.Errorf("count notif: %w", err)
	}

	rows := make([]Notif, 0)
	err := r.db.SelectContext(ctx, &rows, `
		SELECT id_notifikasi, id_aktor_pdut, aktor_nama, tipe,
		       id_ref_post, id_ref_komentar, id_ref_blog, judul_ref, url_target,
		       sudah_dibaca, tgl_dibaca, created_at
		FROM interaction.notifikasi
		WHERE `+where+`
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`, idPenerima, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("list notif: %w", err)
	}
	return rows, total, nil
}

func (r *NotifRepository) UnreadCount(ctx context.Context, idPenerima uuid.UUID) (int, error) {
	var n int
	err := r.db.GetContext(ctx, &n,
		`SELECT COUNT(*) FROM interaction.notifikasi
		 WHERE id_penerima_pdut = $1 AND sudah_dibaca = FALSE`, idPenerima)
	return n, err
}

func (r *NotifRepository) MarkRead(ctx context.Context, idNotif, idPenerima uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE interaction.notifikasi
		SET sudah_dibaca = TRUE, tgl_dibaca = NOW()
		WHERE id_notifikasi = $1 AND id_penerima_pdut = $2 AND sudah_dibaca = FALSE`,
		idNotif, idPenerima)
	if err != nil {
		return fmt.Errorf("mark read: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return errors.New("notif not found, not owned, or already read")
	}
	return nil
}

func (r *NotifRepository) MarkAllRead(ctx context.Context, idPenerima uuid.UUID) (int, error) {
	res, err := r.db.ExecContext(ctx, `
		UPDATE interaction.notifikasi
		SET sudah_dibaca = TRUE, tgl_dibaca = NOW()
		WHERE id_penerima_pdut = $1 AND sudah_dibaca = FALSE`, idPenerima)
	if err != nil {
		return 0, fmt.Errorf("mark all read: %w", err)
	}
	n, _ := res.RowsAffected()
	return int(n), nil
}

// =============================================================================
// SERVICE — emit notif untuk berbagai aksi engagement.
// Resolve recipient + denorm fields via single query supaya emit cepat.
// Semua emit fungsi fire-and-forget oriented: error di-log, tidak block caller.
// =============================================================================

type NotifService struct {
	repo *NotifRepository
	db   *sqlx.DB
}

func NewNotifService(repo *NotifRepository, db *sqlx.DB) *NotifService {
	return &NotifService{repo: repo, db: db}
}

// EmitLikePost — saat user like post.
// Recipient: post author (blog.id_pengguna_pdut).
// Skip kalau aktor == recipient (like sendiri).
func (s *NotifService) EmitLikePost(ctx context.Context, idPost, idAktor uuid.UUID, aktorNama string) {
	var row struct {
		IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut"`
		Subdomain      string    `db:"subdomain"`
		Judul          string    `db:"judul"`
		Slug           string    `db:"slug"`
		IDBlog         uuid.UUID `db:"id_blog"`
	}
	err := s.db.GetContext(ctx, &row, `
		SELECT b.id_pengguna_pdut, b.subdomain, p.judul, p.slug, b.id_blog
		FROM blog.post p
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1`, idPost)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("notif.EmitLikePost resolve: %v", err)
		}
		return
	}
	if row.IDPenggunaPdut == idAktor {
		return // skip self-like
	}
	url := fmt.Sprintf("/dashboard/blog-platform/posts/%s", idPost)
	aktorNamePtr := &aktorNama
	if aktorNama == "" {
		aktorNamePtr = nil
	}
	if err := s.repo.Insert(ctx, NotifInput{
		IDPenerima:  row.IDPenggunaPdut,
		IDAktor:     &idAktor,
		AktorNama:   aktorNamePtr,
		Tipe:        NotifLikePost,
		IDRefPost:   &idPost,
		IDRefBlog:   &row.IDBlog,
		JudulRef:    &row.Judul,
		URLTarget:   &url,
	}); err != nil {
		log.Printf("notif.EmitLikePost insert: %v", err)
	}
}

// EmitKomentarPost — saat ada komentar baru di post (top-level).
// Recipient: post author. Skip self-comment.
// Untuk anonymous komentator (idAktor == nil), aktorNama wajib (nm_komentator).
func (s *NotifService) EmitKomentarPost(ctx context.Context, idPost, idKomentar uuid.UUID, idAktor *uuid.UUID, aktorNama string) {
	var row struct {
		IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut"`
		Judul          string    `db:"judul"`
		IDBlog         uuid.UUID `db:"id_blog"`
	}
	err := s.db.GetContext(ctx, &row, `
		SELECT b.id_pengguna_pdut, p.judul, b.id_blog
		FROM blog.post p
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1`, idPost)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("notif.EmitKomentarPost resolve: %v", err)
		}
		return
	}
	if idAktor != nil && *idAktor == row.IDPenggunaPdut {
		return // skip self-comment
	}
	url := fmt.Sprintf("/dashboard/blog-platform/komentar?id=%s", idKomentar)
	aktorNamePtr := &aktorNama
	if aktorNama == "" {
		aktorNamePtr = nil
	}
	if err := s.repo.Insert(ctx, NotifInput{
		IDPenerima:    row.IDPenggunaPdut,
		IDAktor:       idAktor,
		AktorNama:     aktorNamePtr,
		Tipe:          NotifKomentarPost,
		IDRefPost:     &idPost,
		IDRefKomentar: &idKomentar,
		IDRefBlog:     &row.IDBlog,
		JudulRef:      &row.Judul,
		URLTarget:     &url,
	}); err != nil {
		log.Printf("notif.EmitKomentarPost insert: %v", err)
	}
}

// EmitReplyKomentar — saat reply ke komentar lain.
// Recipient: parent komentator (kalau punya id_pengguna_pdut, skip kalau anonymous).
// Skip kalau aktor == parent komentator.
func (s *NotifService) EmitReplyKomentar(ctx context.Context, idPost, idKomentarParent, idKomentarReply uuid.UUID, idAktor *uuid.UUID, aktorNama string) {
	var row struct {
		IDPenggunaPdut *uuid.UUID `db:"id_pengguna_pdut"`
		Judul          string     `db:"judul"`
		IDBlog         uuid.UUID  `db:"id_blog"`
	}
	err := s.db.GetContext(ctx, &row, `
		SELECT k.id_pengguna_pdut, p.judul, b.id_blog
		FROM interaction.komentar k
		JOIN blog.post p ON k.id_post = p.id_post
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE k.id_komentar = $1`, idKomentarParent)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("notif.EmitReplyKomentar resolve: %v", err)
		}
		return
	}
	if row.IDPenggunaPdut == nil {
		return // parent komentator anonymous → tidak punya inbox
	}
	if idAktor != nil && *idAktor == *row.IDPenggunaPdut {
		return // skip self-reply
	}
	url := fmt.Sprintf("/dashboard/blog-platform/komentar?id=%s", idKomentarReply)
	aktorNamePtr := &aktorNama
	if aktorNama == "" {
		aktorNamePtr = nil
	}
	if err := s.repo.Insert(ctx, NotifInput{
		IDPenerima:    *row.IDPenggunaPdut,
		IDAktor:       idAktor,
		AktorNama:     aktorNamePtr,
		Tipe:          NotifReplyKomentar,
		IDRefPost:     &idPost,
		IDRefKomentar: &idKomentarReply,
		IDRefBlog:     &row.IDBlog,
		JudulRef:      &row.Judul,
		URLTarget:     &url,
	}); err != nil {
		log.Printf("notif.EmitReplyKomentar insert: %v", err)
	}
}

// EmitNewPostFromFollowing — saat post di-publish, batch INSERT notif ke semua follower.
// Pakai single INSERT FROM SELECT untuk efisiensi (1 roundtrip).
// Skip blog owner sendiri (in case owner follow blog sendiri, edge case).
func (s *NotifService) EmitNewPostFromFollowing(ctx context.Context, idPost, idBlog uuid.UUID) {
	var meta struct {
		Judul     string    `db:"judul"`
		Subdomain string    `db:"subdomain"`
		NmBlog    string    `db:"nm_blog"`
		IDOwner   uuid.UUID `db:"id_pengguna_pdut"`
	}
	err := s.db.GetContext(ctx, &meta, `
		SELECT p.judul, b.subdomain, b.nm_blog, b.id_pengguna_pdut
		FROM blog.post p
		JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1`, idPost)
	if err != nil {
		log.Printf("notif.EmitNewPostFromFollowing resolve: %v", err)
		return
	}
	url := "/dashboard/blog-platform/feed"
	res, err := s.db.ExecContext(ctx, `
		INSERT INTO interaction.notifikasi
		    (id_penerima_pdut, id_aktor_pdut, aktor_nama, tipe,
		     id_ref_post, id_ref_blog, judul_ref, url_target)
		SELECT f.id_pengguna_pdut, $1, $2, 'new_post_from_following',
		       $3, $4, $5, $6
		FROM interaction.follower f
		WHERE f.id_blog = $4 AND f.id_pengguna_pdut <> $1`,
		meta.IDOwner, meta.NmBlog, idPost, idBlog, meta.Judul, url)
	if err != nil {
		log.Printf("notif.EmitNewPostFromFollowing insert: %v", err)
		return
	}
	n, _ := res.RowsAffected()
	if n > 0 {
		log.Printf("notif.EmitNewPostFromFollowing: post=%s blog=%s notified=%d followers", idPost, idBlog, n)
	}
}

// EmitMentions — parse @subdomain di teks komentar, emit notif ke setiap user yang di-mention.
// Skip: aktor sendiri, post owner (sudah dapat komentar_post notif), dan duplicates dalam batch.
// Hanya match active blogs (a_aktif + soft_delete IS NULL).
func (s *NotifService) EmitMentions(
	ctx context.Context,
	idPost, idKomentar uuid.UUID,
	idAktor *uuid.UUID,
	aktorNama string,
	isi string,
) {
	mentions := extractMentions(isi)
	if len(mentions) == 0 {
		return
	}

	// Resolve subdomain → id_pengguna_pdut + id_blog.
	type mentionTarget struct {
		IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut"`
		Subdomain      string    `db:"subdomain"`
		IDBlog         uuid.UUID `db:"id_blog"`
	}
	targets := make([]mentionTarget, 0)
	// Use sqlx.In to expand IN (?) → IN (?, ?, ?), then Rebind to PostgreSQL $1, $2, $3.
	args := make([]any, len(mentions))
	for i, m := range mentions {
		args[i] = m
	}
	query, expandedArgs, err := sqlx.In(`
		SELECT id_pengguna_pdut, subdomain, id_blog
		FROM blog.blog
		WHERE subdomain IN (?)
		  AND soft_delete IS NULL AND a_aktif = TRUE`, args)
	if err != nil {
		log.Printf("notif.EmitMentions build query: %v", err)
		return
	}
	query = s.db.Rebind(query)
	if err := s.db.SelectContext(ctx, &targets, query, expandedArgs...); err != nil {
		log.Printf("notif.EmitMentions select: %v", err)
		return
	}

	// Resolve post owner (skip mention ke post owner — sudah dapat komentar notif).
	var postOwner uuid.UUID
	_ = s.db.GetContext(ctx, &postOwner, `
		SELECT b.id_pengguna_pdut
		FROM blog.post p JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1`, idPost)

	// Resolve judul post untuk denorm
	var judul string
	_ = s.db.GetContext(ctx, &judul, `SELECT judul FROM blog.post WHERE id_post = $1`, idPost)

	url := fmt.Sprintf("/dashboard/blog-platform/komentar?id=%s", idKomentar)

	for _, t := range targets {
		// Skip self-mention
		if idAktor != nil && *idAktor == t.IDPenggunaPdut {
			continue
		}
		// Skip post owner (akan dapat komentar_post notif)
		if t.IDPenggunaPdut == postOwner {
			continue
		}
		actorNamePtr := &aktorNama
		if aktorNama == "" {
			actorNamePtr = nil
		}
		if err := s.repo.Insert(ctx, NotifInput{
			IDPenerima:    t.IDPenggunaPdut,
			IDAktor:       idAktor,
			AktorNama:     actorNamePtr,
			Tipe:          NotifMentionKomentar,
			IDRefPost:     &idPost,
			IDRefKomentar: &idKomentar,
			IDRefBlog:     &t.IDBlog,
			JudulRef:      &judul,
			URLTarget:     &url,
		}); err != nil {
			log.Printf("notif.EmitMentions insert: %v", err)
		}
	}
}

// EmitMentionsInPost — parse @subdomain di teks/HTML konten post, emit notif
// ke setiap user yang di-mention. Different tipe (mention_post) from comments
// so users can opt out per-channel via Phase AG preferences.
//
// Same skip rules as EmitMentions: post owner gets nothing (they wrote it),
// active blogs only, dedup, anonymous post owner edge case ignored.
//
// Called from post.Handler.PublishMine via PublishNotifier — and only on the
// FIRST publish (republish doesn't re-notify mentions, otherwise editing a
// published post would re-spam recipients).
func (s *NotifService) EmitMentionsInPost(
	ctx context.Context,
	idPost uuid.UUID,
	idAktor *uuid.UUID,
	aktorNama string,
	bodyText string,
) {
	mentions := extractMentions(bodyText)
	if len(mentions) == 0 {
		return
	}

	type mentionTarget struct {
		IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut"`
		Subdomain      string    `db:"subdomain"`
		IDBlog         uuid.UUID `db:"id_blog"`
	}
	targets := make([]mentionTarget, 0)
	args := make([]any, len(mentions))
	for i, m := range mentions {
		args[i] = m
	}
	query, expandedArgs, err := sqlx.In(`
		SELECT id_pengguna_pdut, subdomain, id_blog
		FROM blog.blog
		WHERE subdomain IN (?)
		  AND soft_delete IS NULL AND a_aktif = TRUE`, args)
	if err != nil {
		log.Printf("notif.EmitMentionsInPost build query: %v", err)
		return
	}
	query = s.db.Rebind(query)
	if err := s.db.SelectContext(ctx, &targets, query, expandedArgs...); err != nil {
		log.Printf("notif.EmitMentionsInPost select: %v", err)
		return
	}

	// Resolve post owner + judul for skip + denorm.
	var meta struct {
		IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut"`
		Judul          string    `db:"judul"`
		IDBlog         uuid.UUID `db:"id_blog"`
	}
	if err := s.db.GetContext(ctx, &meta, `
		SELECT b.id_pengguna_pdut, p.judul, b.id_blog
		FROM blog.post p JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1`, idPost); err != nil {
		log.Printf("notif.EmitMentionsInPost resolve post: %v", err)
		return
	}

	url := fmt.Sprintf("/dashboard/blog-platform/posts/%s/edit", idPost)
	for _, t := range targets {
		// Skip self-mention
		if idAktor != nil && *idAktor == t.IDPenggunaPdut {
			continue
		}
		// Skip post owner (they wrote it — no notif needed)
		if t.IDPenggunaPdut == meta.IDPenggunaPdut {
			continue
		}
		actorNamePtr := &aktorNama
		if aktorNama == "" {
			actorNamePtr = nil
		}
		if err := s.repo.Insert(ctx, NotifInput{
			IDPenerima: t.IDPenggunaPdut,
			IDAktor:    idAktor,
			AktorNama:  actorNamePtr,
			Tipe:       NotifMentionPost,
			IDRefPost:  &idPost,
			IDRefBlog:  &t.IDBlog,
			JudulRef:   &meta.Judul,
			URLTarget:  &url,
		}); err != nil {
			log.Printf("notif.EmitMentionsInPost insert: %v", err)
		}
	}
}

// extractMentions — parse @subdomain di teks. Subdomain rules:
//   3-60 char, lowercase letter/digit/hyphen, tidak boleh start/end dengan hyphen.
// Match yang lebih longgar dipakai di sini (regex), filter lebih ketat saat DB lookup.
func extractMentions(text string) []string {
	re := regexp.MustCompile(`@([a-z0-9][a-z0-9-]{1,58}[a-z0-9])`)
	matches := re.FindAllStringSubmatch(strings.ToLower(text), -1)
	seen := map[string]bool{}
	out := []string{}
	for _, m := range matches {
		if len(m) < 2 {
			continue
		}
		s := m[1]
		if strings.Contains(s, "--") {
			continue // double hyphen invalid
		}
		if seen[s] {
			continue
		}
		seen[s] = true
		out = append(out, s)
	}
	return out
}

// EmitCoauthorInvite — saat post owner mengundang user lain sebagai co-author.
// Recipient: the invitee's primary blog owner. Skip if invitee == owner
// (already caught at repo level but defended here too).
func (s *NotifService) EmitCoauthorInvite(
	ctx context.Context,
	idPost uuid.UUID,
	idBlogCo uuid.UUID,
	peran, aktorNama string,
	idAktor uuid.UUID,
) {
	// Resolve invitee's user id + post judul in one round-trip.
	var row struct {
		IDPenggunaCo   uuid.UUID `db:"id_pengguna_co"`
		Judul          string    `db:"judul"`
		IDBlogOwner    uuid.UUID `db:"id_blog_owner"`
	}
	err := s.db.GetContext(ctx, &row, `
		SELECT bc.id_pengguna_pdut AS id_pengguna_co,
		       p.judul,
		       p.id_blog AS id_blog_owner
		FROM blog.blog bc
		CROSS JOIN blog.post p
		WHERE bc.id_blog = $1 AND p.id_post = $2 AND p.soft_delete IS NULL`,
		idBlogCo, idPost)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("notif.EmitCoauthorInvite resolve: %v", err)
		}
		return
	}
	if row.IDPenggunaCo == idAktor {
		return // safety: shouldn't happen because repo blocks self-add
	}
	url := "/dashboard/blog-platform/co-author-invites"
	aktorNamePtr := &aktorNama
	if aktorNama == "" {
		aktorNamePtr = nil
	}
	peranLabel := peran
	judulWithRole := fmt.Sprintf("%s (sebagai %s)", row.Judul, peranLabel)
	if err := s.repo.Insert(ctx, NotifInput{
		IDPenerima: row.IDPenggunaCo,
		IDAktor:    &idAktor,
		AktorNama:  aktorNamePtr,
		Tipe:       NotifCoauthorInvite,
		IDRefPost:  &idPost,
		IDRefBlog:  &row.IDBlogOwner,
		JudulRef:   &judulWithRole,
		URLTarget:  &url,
	}); err != nil {
		log.Printf("notif.EmitCoauthorInvite insert: %v", err)
	}
}

// EmitCoauthorResponded — saat invitee accept atau decline undangan.
// Recipient: post owner. aktorNama is the responder's name; idBlogOwner used
// to resolve the post owner's user id.
func (s *NotifService) EmitCoauthorResponded(
	ctx context.Context,
	idPost uuid.UUID,
	idBlogOwner uuid.UUID,
	accepted bool,
	aktorNama string,
	idAktor uuid.UUID,
) {
	var row struct {
		IDPenggunaOwner uuid.UUID `db:"id_pengguna_pdut"`
		Judul           string    `db:"judul"`
	}
	err := s.db.GetContext(ctx, &row, `
		SELECT b.id_pengguna_pdut, p.judul
		FROM blog.post p JOIN blog.blog b ON p.id_blog = b.id_blog
		WHERE p.id_post = $1 AND b.id_blog = $2`, idPost, idBlogOwner)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("notif.EmitCoauthorResponded resolve: %v", err)
		}
		return
	}
	if row.IDPenggunaOwner == idAktor {
		return
	}
	url := fmt.Sprintf("/dashboard/blog-platform/posts/%s/edit", idPost)
	aktorNamePtr := &aktorNama
	if aktorNama == "" {
		aktorNamePtr = nil
	}
	verdict := "ditolak"
	if accepted {
		verdict = "diterima"
	}
	judulPlus := fmt.Sprintf("%s — co-author %s", row.Judul, verdict)
	if err := s.repo.Insert(ctx, NotifInput{
		IDPenerima: row.IDPenggunaOwner,
		IDAktor:    &idAktor,
		AktorNama:  aktorNamePtr,
		Tipe:       NotifCoauthorResponded,
		IDRefPost:  &idPost,
		IDRefBlog:  &idBlogOwner,
		JudulRef:   &judulPlus,
		URLTarget:  &url,
	}); err != nil {
		log.Printf("notif.EmitCoauthorResponded insert: %v", err)
	}
}

// EmitFollowBlog — saat user follow blog.
// Recipient: blog owner. Skip self-follow.
func (s *NotifService) EmitFollowBlog(ctx context.Context, idBlog uuid.UUID, idAktor uuid.UUID, aktorNama string) {
	var row struct {
		IDPenggunaPdut uuid.UUID `db:"id_pengguna_pdut"`
		Subdomain      string    `db:"subdomain"`
		NmBlog         string    `db:"nm_blog"`
	}
	err := s.db.GetContext(ctx, &row,
		`SELECT id_pengguna_pdut, subdomain, nm_blog FROM blog.blog WHERE id_blog = $1`, idBlog)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Printf("notif.EmitFollowBlog resolve: %v", err)
		}
		return
	}
	if row.IDPenggunaPdut == idAktor {
		return
	}
	url := "/dashboard/blog-platform/followers"
	judul := row.NmBlog
	aktorNamePtr := &aktorNama
	if aktorNama == "" {
		aktorNamePtr = nil
	}
	if err := s.repo.Insert(ctx, NotifInput{
		IDPenerima: row.IDPenggunaPdut,
		IDAktor:    &idAktor,
		AktorNama:  aktorNamePtr,
		Tipe:       NotifFollowBlog,
		IDRefBlog:  &idBlog,
		JudulRef:   &judul,
		URLTarget:  &url,
	}); err != nil {
		log.Printf("notif.EmitFollowBlog insert: %v", err)
	}
}

// =============================================================================
// HANDLER
// =============================================================================

type NotifHandler struct{ repo *NotifRepository }

func NewNotifHandler(repo *NotifRepository) *NotifHandler { return &NotifHandler{repo: repo} }

// GET /api/v1/me/notifications?unread=true&limit=20&offset=0
func (h *NotifHandler) List(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	unread := c.Query("unread") == "true"
	limit := c.QueryInt("limit", 20)
	offset := c.QueryInt("offset", 0)
	rows, total, err := h.repo.List(c.Context(), idUser, unread, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"items":  rows,
			"total":  total,
			"limit":  limit,
			"offset": offset,
		},
	})
}

// GET /api/v1/me/notifications/unread-count
func (h *NotifHandler) UnreadCount(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	count, err := h.repo.UnreadCount(c.Context(), idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"unread_count": count}})
}

// POST /api/v1/me/notifications/:id/read
func (h *NotifHandler) MarkRead(c *fiber.Ctx) error {
	idNotif, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid id_notif")
	}
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	if err := h.repo.MarkRead(c.Context(), idNotif, idUser); err != nil {
		return fiber.NewError(fiber.StatusNotFound, err.Error())
	}
	return c.JSON(fiber.Map{"success": true})
}

// POST /api/v1/me/notifications/read-all
func (h *NotifHandler) MarkAllRead(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	n, err := h.repo.MarkAllRead(c.Context(), idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": fiber.Map{"marked": n}})
}

// GET /api/v1/me/notifications/preferences — return mute prefs.
func (h *NotifHandler) GetPreferences(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	p, err := h.repo.GetPreference(c.Context(), idUser)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// PUT /api/v1/me/notifications/preferences — body { muted_tipes: [...] }.
func (h *NotifHandler) SetPreferences(c *fiber.Ctx) error {
	uid, _ := c.Locals("user_id").(string)
	if uid == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "login required")
	}
	idUser, err := uuid.Parse(uid)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid user_id")
	}
	var body struct {
		MutedTipes []string `json:"muted_tipes"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid JSON body")
	}
	if body.MutedTipes == nil {
		body.MutedTipes = []string{}
	}
	if err := h.repo.SetPreference(c.Context(), idUser, body.MutedTipes); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	// Return the canonical normalized list.
	p, _ := h.repo.GetPreference(c.Context(), idUser)
	return c.JSON(fiber.Map{"success": true, "data": p})
}

// RegisterNotifMineRoutes — endpoints `/me/notifications/*` (JWT required).
func RegisterNotifMineRoutes(me fiber.Router, h *NotifHandler) {
	g := me.Group("/notifications")
	g.Get("/", h.List)
	g.Get("/unread-count", h.UnreadCount)
	g.Get("/preferences", h.GetPreferences)
	g.Put("/preferences", h.SetPreferences)
	g.Post("/read-all", h.MarkAllRead)
	g.Post("/:id/read", h.MarkRead)
}
