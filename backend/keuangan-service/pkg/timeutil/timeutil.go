package timeutil

import (
	"time"
)

var (
	// WIB timezone (Asia/Jakarta UTC+7)
	WIB *time.Location
)

func init() {
	// Load WIB (Asia/Jakarta) timezone
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		// Fallback to fixed UTC+7 if Asia/Jakarta not found
		WIB = time.FixedZone("WIB", 7*60*60)
	} else {
		WIB = loc
	}
}

// NowWIB returns current time in WIB timezone
func NowWIB() time.Time {
	return time.Now().In(WIB)
}

// ToWIB converts any time to WIB timezone
func ToWIB(t time.Time) time.Time {
	return t.In(WIB)
}
