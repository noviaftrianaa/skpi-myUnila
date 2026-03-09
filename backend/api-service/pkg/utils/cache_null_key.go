package utils

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
)

// HashParams menghasilkan hash SHA1 dari struct params untuk cache key.
// Otomatis handle pointer, nil, dan semua tipe data.
func HashParams(v interface{}) string {
	b, _ := json.Marshal(v)
	hash := sha1.Sum(b)
	return hex.EncodeToString(hash[:])
}
