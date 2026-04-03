package settings

import "time"

// Setting represents a row in monitoring.settings
type Setting struct {
	ID           int        `json:"id"            db:"id"`
	KeyGroup     string     `json:"key_group"     db:"key_group"`
	SettingKey   string     `json:"setting_key"   db:"setting_key"`
	SettingValue *string    `json:"setting_value"  db:"setting_value"`
	Description  *string    `json:"description"    db:"description"`
	IsSensitive  int        `json:"is_sensitive"   db:"is_sensitive"`
	CreateDate   time.Time  `json:"-"              db:"create_date"`
	IDCreator    string     `json:"-"              db:"id_creator"`
	LastUpdate   time.Time  `json:"-"              db:"last_update"`
	IDUpdater    *string    `json:"-"              db:"id_updater"`
	SoftDelete   int        `json:"-"              db:"soft_delete"`
}

// UpdateSettingRequest is the body for PUT /api/v1/settings/:id
type UpdateSettingRequest struct {
	SettingValue *string `json:"setting_value"`
}

// BulkUpdateRequest allows updating multiple settings at once
type BulkUpdateRequest struct {
	Settings []BulkItem `json:"settings"`
}

type BulkItem struct {
	ID           int     `json:"id"`
	SettingValue *string `json:"setting_value"`
}
