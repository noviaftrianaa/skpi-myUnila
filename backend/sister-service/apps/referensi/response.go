package referensi

// AgamaResponse represents response for agama data
type AgamaResponse struct {
	IDAgama   int    `json:"id_agama"`
	NamaAgama string `json:"nama_agama"`
	LastSync  string `json:"last_sync,omitempty"`
}

// SyncResponse represents response for sync operation
type SyncResponse struct {
	TotalRecords int    `json:"total_records"`
	SyncedBy     string `json:"synced_by"`
	Message      string `json:"message"`
}
