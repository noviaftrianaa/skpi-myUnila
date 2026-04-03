package keywords

import "time"

// ThreatKeyword represents a keyword used for judol/threat detection
type ThreatKeyword struct {
	ID         int        `json:"id"          db:"id"`
	Keyword    string     `json:"keyword"     db:"keyword"`
	Category   string     `json:"category"    db:"category"`
	Weight     int        `json:"weight"      db:"weight"`
	IsActive   int        `json:"is_active"   db:"is_active"`
	Notes      *string    `json:"notes"       db:"notes"`
	CreateDate time.Time  `json:"-" db:"create_date"`
	IDCreator  string     `json:"-" db:"id_creator"`
	LastUpdate time.Time  `json:"-" db:"last_update"`
	IDUpdater  *string    `json:"-" db:"id_updater"`
	SoftDelete int        `json:"-"           db:"soft_delete"`
}

type CreateKeywordRequest struct {
	Keyword  string  `json:"keyword"  validate:"required"`
	Category string  `json:"category" validate:"required"`
	Weight   int     `json:"weight"`
	IsActive int     `json:"is_active"`
	Notes    *string `json:"notes"`
}

type UpdateKeywordRequest struct {
	Keyword  *string `json:"keyword"`
	Category *string `json:"category"`
	Weight   *int    `json:"weight"`
	IsActive *int    `json:"is_active"`
	Notes    *string `json:"notes"`
}

type KeywordFilter struct {
	Category string `query:"category"`
	IsActive string `query:"is_active"`
	Search   string `query:"search"`
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
}
