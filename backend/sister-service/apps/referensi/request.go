package referensi

// SyncAgamaRequest represents request payload for sync agama
// No request body needed - user info extracted from JWT context
type SyncAgamaRequest struct {
	// Empty struct - synced_by will be extracted from JWT token
}
