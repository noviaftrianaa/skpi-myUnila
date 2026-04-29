// Package notif — broadcast notifikasi + per-user inbox.
package notif

import "time"

// Notifikasi — 1 row per broadcast (admin compose).
type Notifikasi struct {
	IDNotif       string     `db:"id_notif" json:"id_notif"`
	Tipe          string     `db:"tipe" json:"tipe"` // 'pengumuman'|'berita'|'system'|'reminder'|'alert'
	Judul         string     `db:"judul" json:"judul"`
	Pesan         string     `db:"pesan" json:"pesan"`
	TargetURL     *string    `db:"target_url" json:"target_url,omitempty"`
	IconName      *string    `db:"icon_name" json:"icon_name,omitempty"`
	Severity      string     `db:"severity" json:"severity"` // info|success|warning|error
	TargetRole    string     `db:"target_role" json:"target_role"`
	TargetUnitIDs *string    `db:"target_unit_ids" json:"target_unit_ids,omitempty"` // JSON array
	TargetUserIDs *string    `db:"target_user_ids" json:"target_user_ids,omitempty"` // JSON array
	ExpiryAt      *time.Time `db:"expiry_at" json:"expiry_at,omitempty"`
	CreateDate    *time.Time `db:"create_date" json:"create_date,omitempty"`
	LastUpdate    *time.Time `db:"last_update" json:"last_update,omitempty"`
}

// InboxItem — per-user view of notifikasi (notif row + recipient state).
type InboxItem struct {
	IDRecipient string     `db:"id_recipient" json:"id_recipient"`
	IDNotif     string     `db:"id_notif" json:"id_notif"`
	Tipe        string     `db:"tipe" json:"tipe"`
	Judul       string     `db:"judul" json:"judul"`
	Pesan       string     `db:"pesan" json:"pesan"`
	TargetURL   *string    `db:"target_url" json:"target_url,omitempty"`
	IconName    *string    `db:"icon_name" json:"icon_name,omitempty"`
	Severity    string     `db:"severity" json:"severity"`
	IsRead      bool       `db:"is_read" json:"is_read"`
	ReadAt      *time.Time `db:"read_at" json:"read_at,omitempty"`
	IsDismissed bool       `db:"is_dismissed" json:"is_dismissed"`
	DeliveredAt time.Time  `db:"delivered_at" json:"delivered_at"`
	CreateDate  *time.Time `db:"create_date" json:"create_date,omitempty"`
}

// BroadcastRequest — admin compose body.
type BroadcastRequest struct {
	Tipe          string   `json:"tipe"`
	Judul         string   `json:"judul" validate:"required"`
	Pesan         string   `json:"pesan" validate:"required"`
	TargetURL     *string  `json:"target_url,omitempty"`
	IconName      *string  `json:"icon_name,omitempty"`
	Severity      string   `json:"severity,omitempty"`     // default 'info'
	TargetRole    string   `json:"target_role,omitempty"`  // default 'all'
	TargetUserIDs []string `json:"target_user_ids,omitempty"` // direct messaging
	ExpiryAt      *string  `json:"expiry_at,omitempty"`
}

// BroadcastResult — response broadcast.
type BroadcastResult struct {
	IDNotif        string `json:"id_notif"`
	TotalRecipient int    `json:"total_recipient"`
}

// InboxFilter — list inbox per user.
type InboxFilter struct {
	IDPengguna string
	Page       int
	Limit      int
	OnlyUnread bool
}

type InboxResult struct {
	Items []InboxItem `json:"items"`
	Total int         `json:"total"`
	Page  int         `json:"page"`
	Limit int         `json:"limit"`
}
