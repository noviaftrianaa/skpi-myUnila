package types

import (
	"database/sql/driver"
	"encoding/json"
	"time"
)

// SQLServerTime is a custom time type that handles SQL Server datetime format
// and provides proper JSON marshaling
type SQLServerTime struct {
	time.Time
}

// Scan implements sql.Scanner interface
// Handles SQL Server datetime formats automatically
func (t *SQLServerTime) Scan(value interface{}) error {
	if value == nil {
		t.Time = time.Time{}
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		t.Time = v
		return nil
	case []byte:
		return t.parseDatetime(string(v))
	case string:
		return t.parseDatetime(v)
	default:
		t.Time = time.Time{}
		return nil
	}
}

// parseDatetime tries multiple datetime formats
func (t *SQLServerTime) parseDatetime(s string) error {
	// Try common SQL Server datetime formats
	formats := []string{
		"2006-01-02 15:04:05.999",
		"2006-01-02 15:04:05.99",
		"2006-01-02 15:04:05.9",
		"2006-01-02 15:04:05",
		"2006-01-02T15:04:05.999Z",
		"2006-01-02T15:04:05Z",
		time.RFC3339,
		time.RFC3339Nano,
	}

	for _, format := range formats {
		if parsed, err := time.Parse(format, s); err == nil {
			t.Time = parsed
			return nil
		}
	}

	// If all fail, set to zero time
	t.Time = time.Time{}
	return nil
}

// Value implements driver.Valuer interface
func (t SQLServerTime) Value() (driver.Value, error) {
	if t.Time.IsZero() {
		return nil, nil
	}
	return t.Time, nil
}

// MarshalJSON implements json.Marshaler
// Returns datetime in format: "2013-05-13 00:00:00.000"
func (t SQLServerTime) MarshalJSON() ([]byte, error) {
	if t.Time.IsZero() {
		return []byte("null"), nil
	}
	// Format to match SQL Server output: "2013-05-13 00:00:00.000"
	formatted := t.Time.Format("2006-01-02 15:04:05.000")
	return json.Marshal(formatted)
}

// UnmarshalJSON implements json.Unmarshaler
func (t *SQLServerTime) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		t.Time = time.Time{}
		return nil
	}

	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	return t.parseDatetime(s)
}

// String returns formatted datetime string
func (t SQLServerTime) String() string {
	if t.Time.IsZero() {
		return ""
	}
	return t.Time.Format("2006-01-02 15:04:05.000")
}
