package ktw

import (
	"encoding/json"
	"time"
)

// nowIso timestamp ISO 8601 (UTC).
func nowIso() string {
	return time.Now().UTC().Format(time.RFC3339)
}

// extractError coba extract pesan error dari body upstream.
// Kalau gagal parse, return pesan generic.
func extractError(body UpstreamResponse) string {
	if len(body) == 0 {
		return "upstream returned empty body"
	}
	var v map[string]interface{}
	if err := json.Unmarshal(body, &v); err != nil {
		return string(body)
	}
	if msg, ok := v["message"].(string); ok {
		return msg
	}
	return "upstream returned non-success status"
}
