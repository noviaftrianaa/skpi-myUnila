package referensi

import "time"

// Agama represents religion reference data from ref.agama table
type Agama struct {
	IDAgama     int        `json:"id_agama" db:"id_agama"`
	NamaAgama   string     `json:"nama_agama" db:"nama_agama"`
	ExpiredDate *time.Time `json:"expired_date,omitempty" db:"expired_date"`
	LastSync    *time.Time `json:"last_sync,omitempty" db:"last_sync"`
}

// SisterAgama represents religion data from Sister API
type SisterAgama struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

// SyncRequest represents base sync request (empty - user info from JWT)
type SyncRequest struct {
	// No fields needed - user info extracted from JWT context
}
