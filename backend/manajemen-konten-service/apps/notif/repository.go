package notif

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	Broadcast(ctx context.Context, req *BroadcastRequest, creatorID string) (string, error)
	FanoutTo(ctx context.Context, idNotif, idPengguna string) error
	GetInbox(ctx context.Context, f *InboxFilter) (*InboxResult, error)
	UnreadCount(ctx context.Context, idPengguna string) (int, error)
	MarkRead(ctx context.Context, idRecipient, idPengguna string) error
	MarkAllRead(ctx context.Context, idPengguna string) error
	Dismiss(ctx context.Context, idRecipient, idPengguna string) error
	ListBroadcasts(ctx context.Context, page, limit int) ([]Notifikasi, int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// Broadcast — INSERT 1 row di notifikasi. Recipient di-fanout terpisah
// (lazy/on-demand atau batch BULK INSERT untuk audience besar).
func (r *repository) Broadcast(ctx context.Context, req *BroadcastRequest, creatorID string) (string, error) {
	tipe := req.Tipe
	if tipe == "" {
		tipe = "system"
	}
	severity := req.Severity
	if severity == "" {
		severity = "info"
	}
	target := req.TargetRole
	if target == "" {
		target = "all"
	}

	var expiryAt *time.Time
	if req.ExpiryAt != nil && *req.ExpiryAt != "" {
		if t, err := time.Parse(time.RFC3339, *req.ExpiryAt); err == nil {
			expiryAt = &t
		} else if t, err := time.Parse("2006-01-02", *req.ExpiryAt); err == nil {
			expiryAt = &t
		}
	}

	var targetUserIDsJSON *string
	if len(req.TargetUserIDs) > 0 {
		b, _ := json.Marshal(req.TargetUserIDs)
		s := string(b)
		targetUserIDsJSON = &s
	}

	var creatorVal interface{}
	if creatorID != "" {
		creatorVal = creatorID
	}

	var id string
	row := r.db.QueryRowxContext(ctx, `
		INSERT INTO man_konten.notifikasi
			(id_notif, tipe, judul, pesan, target_url, icon_name, severity,
			 target_role, target_unit_ids, target_user_ids, expiry_at,
			 id_creator, create_date, last_update, soft_delete)
		OUTPUT CAST(INSERTED.id_notif AS VARCHAR(36))
		VALUES (NEWID(), @p1, @p2, @p3, @p4, @p5, @p6,
		        @p7, NULL, @p8, @p9,
		        @p10, GETDATE(), GETDATE(), 0)
	`, tipe, req.Judul, req.Pesan, req.TargetURL, req.IconName, severity,
		target, targetUserIDsJSON, expiryAt, creatorVal)
	if err := row.Scan(&id); err != nil {
		return "", fmt.Errorf("insert notif: %w", err)
	}

	// Direct fanout untuk target_user_ids (small set, fast).
	if len(req.TargetUserIDs) > 0 {
		for _, u := range req.TargetUserIDs {
			_ = r.FanoutTo(ctx, id, u)
		}
	}
	return id, nil
}

// FanoutTo — buat 1 row notif_recipient untuk pasangan (notif, user). Idempotent.
func (r *repository) FanoutTo(ctx context.Context, idNotif, idPengguna string) error {
	_, err := r.db.ExecContext(ctx, `
		IF NOT EXISTS (
			SELECT 1 FROM man_konten.notif_recipient
			WHERE id_notif = @p1 AND id_pengguna = @p2 AND soft_delete = 0
		)
		INSERT INTO man_konten.notif_recipient
			(id_recipient, id_notif, id_pengguna, is_read, is_dismissed, delivered_at, soft_delete)
		VALUES (NEWID(), @p1, @p2, 0, 0, GETDATE(), 0)
	`, idNotif, idPengguna)
	return err
}

// GetInbox — fetch inbox per user. Auto-materialize: kalau ada notif aktif
// (target_role match user OR target=all) yg user belum punya recipient row,
// FanoutTo dulu (lazy materialize) sebelum query.
//
// Catatan: untuk Phase 1, lazy materialize cuma untuk target_role='all'.
// Targeting role-specific (mahasiswa/dosen/tendik) butuh user-role lookup
// yang JOIN ke man_akses.role_pengguna — TODO Phase 1E.
func (r *repository) GetInbox(ctx context.Context, f *InboxFilter) (*InboxResult, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.Limit < 1 || f.Limit > 100 {
		f.Limit = 20
	}

	// Lazy materialize: untuk semua notif active (target='all' OR direct target_user_ids
	// containing this user) yg belum di-fanout ke user ini, INSERT recipient row.
	// Pakai NOT EXISTS check supaya idempotent.
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO man_konten.notif_recipient
			(id_recipient, id_notif, id_pengguna, is_read, is_dismissed, delivered_at, soft_delete)
		SELECT NEWID(), n.id_notif, @p1, 0, 0, GETDATE(), 0
		FROM man_konten.notifikasi n
		WHERE n.soft_delete = 0
		  AND (n.expiry_at IS NULL OR n.expiry_at > GETDATE())
		  AND n.target_role = 'all'
		  AND NOT EXISTS (
		      SELECT 1 FROM man_konten.notif_recipient r
		      WHERE r.id_notif = n.id_notif AND r.id_pengguna = @p1 AND r.soft_delete = 0
		  )
	`, f.IDPengguna)
	if err != nil {
		return nil, fmt.Errorf("lazy materialize: %w", err)
	}

	args := []any{f.IDPengguna}
	where := "WHERE r.id_pengguna = @p1 AND r.soft_delete = 0 AND r.is_dismissed = 0"
	if f.OnlyUnread {
		where += " AND r.is_read = 0"
	}

	var total int
	if err := r.db.GetContext(ctx, &total,
		"SELECT COUNT(*) FROM man_konten.notif_recipient r "+where, args...); err != nil {
		return nil, fmt.Errorf("count inbox: %w", err)
	}

	offset := (f.Page - 1) * f.Limit
	args = append(args, offset, f.Limit)
	q := fmt.Sprintf(`
		SELECT
			CAST(r.id_recipient AS VARCHAR(36)) AS id_recipient,
			CAST(r.id_notif AS VARCHAR(36)) AS id_notif,
			n.tipe, n.judul, n.pesan, n.target_url, n.icon_name, n.severity,
			CAST(r.is_read AS BIT) AS is_read,
			r.read_at,
			CAST(r.is_dismissed AS BIT) AS is_dismissed,
			r.delivered_at,
			n.create_date
		FROM man_konten.notif_recipient r
		INNER JOIN man_konten.notifikasi n
			ON n.id_notif = r.id_notif AND n.soft_delete = 0
		%s
		ORDER BY r.is_read ASC, r.delivered_at DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY
	`, where, len(args)-1, len(args))

	var items []InboxItem
	if err := r.db.SelectContext(ctx, &items, q, args...); err != nil {
		return nil, fmt.Errorf("select inbox: %w", err)
	}
	return &InboxResult{Items: items, Total: total, Page: f.Page, Limit: f.Limit}, nil
}

// UnreadCount — untuk bell badge. Auto-materialize too.
func (r *repository) UnreadCount(ctx context.Context, idPengguna string) (int, error) {
	// Lazy materialize sama seperti GetInbox.
	_, _ = r.db.ExecContext(ctx, `
		INSERT INTO man_konten.notif_recipient
			(id_recipient, id_notif, id_pengguna, is_read, is_dismissed, delivered_at, soft_delete)
		SELECT NEWID(), n.id_notif, @p1, 0, 0, GETDATE(), 0
		FROM man_konten.notifikasi n
		WHERE n.soft_delete = 0
		  AND (n.expiry_at IS NULL OR n.expiry_at > GETDATE())
		  AND n.target_role = 'all'
		  AND NOT EXISTS (
		      SELECT 1 FROM man_konten.notif_recipient r
		      WHERE r.id_notif = n.id_notif AND r.id_pengguna = @p1 AND r.soft_delete = 0
		  )
	`, idPengguna)

	var n int
	err := r.db.GetContext(ctx, &n, `
		SELECT COUNT(*)
		FROM man_konten.notif_recipient r
		INNER JOIN man_konten.notifikasi n ON n.id_notif = r.id_notif AND n.soft_delete = 0
		WHERE r.id_pengguna = @p1 AND r.is_read = 0 AND r.is_dismissed = 0 AND r.soft_delete = 0
		  AND (n.expiry_at IS NULL OR n.expiry_at > GETDATE())
	`, idPengguna)
	return n, err
}

func (r *repository) MarkRead(ctx context.Context, idRecipient, idPengguna string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.notif_recipient
		SET is_read = 1, read_at = GETDATE()
		WHERE id_recipient = @p1 AND id_pengguna = @p2
	`, idRecipient, idPengguna)
	return err
}

func (r *repository) MarkAllRead(ctx context.Context, idPengguna string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.notif_recipient
		SET is_read = 1, read_at = GETDATE()
		WHERE id_pengguna = @p1 AND is_read = 0
	`, idPengguna)
	return err
}

func (r *repository) Dismiss(ctx context.Context, idRecipient, idPengguna string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE man_konten.notif_recipient
		SET is_dismissed = 1, dismissed_at = GETDATE()
		WHERE id_recipient = @p1 AND id_pengguna = @p2
	`, idRecipient, idPengguna)
	return err
}

func (r *repository) ListBroadcasts(ctx context.Context, page, limit int) ([]Notifikasi, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	var total int
	if err := r.db.GetContext(ctx, &total, "SELECT COUNT(*) FROM man_konten.notifikasi WHERE soft_delete=0"); err != nil {
		return nil, 0, err
	}
	offset := (page - 1) * limit
	var items []Notifikasi
	err := r.db.SelectContext(ctx, &items, `
		SELECT CAST(id_notif AS VARCHAR(36)) AS id_notif,
		       tipe, judul, pesan, target_url, icon_name, severity, target_role,
		       target_unit_ids, target_user_ids, expiry_at, create_date, last_update
		FROM man_konten.notifikasi
		WHERE soft_delete = 0
		ORDER BY create_date DESC
		OFFSET @p1 ROWS FETCH NEXT @p2 ROWS ONLY
	`, offset, limit)
	if err != nil {
		return nil, 0, err
	}
	return items, total, nil
}
