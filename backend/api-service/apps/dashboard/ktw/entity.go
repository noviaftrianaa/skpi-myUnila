// Package ktw — wrapper KTW (Kelulusan Tepat Waktu) data.
// Upstream source of truth: public-service /api/v1/ktw/*.
// Pattern: proxy + redis cache, envelope normalization ke ws-service response.
package ktw

import "encoding/json"

// Params adalah parameter query KTW yang diterima handler.
// Validasi ringan: tipe + range; validasi detail mengikuti upstream (public-service).
type Params struct {
	Cohort   int    `query:"cohort"`   // tahun angkatan, optional (default upstream)
	Jenjang  string `query:"jenjang"`  // D3|D4|S1|S2|S3, default S1 di upstream
	Cutoff   string `query:"cutoff"`   // YYYY-MM-DD, optional
	Start    int    `query:"start"`    // untuk trend
	End      int    `query:"end"`      // untuk trend
	IDFak    string `query:"id_fakultas"`
	IDProdi  string `query:"id_prodi"`
	Limit    int    `query:"limit"`    // top-prodi
	Reconcile bool  `query:"reconcile"` // overview / prodi detail
}

// Response upstream kita pass-through apa adanya (nested JSON).
// Ini simpan sebagai raw supaya struktur meta/formula upstream tetap utuh.
type UpstreamResponse json.RawMessage

// MarshalJSON supaya bisa embedded langsung di response envelope.
func (u UpstreamResponse) MarshalJSON() ([]byte, error) {
	if len(u) == 0 {
		return []byte("null"), nil
	}
	return u, nil
}
