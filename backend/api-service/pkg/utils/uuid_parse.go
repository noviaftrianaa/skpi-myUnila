package utils

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// ============================================================================
// Custom UUID Type untuk SQL Server uniqueidentifier
// ============================================================================

// UUID adalah custom type yang handle SQL Server uniqueidentifier (mixed-endian)
type UUID string

// Scan implements sql.Scanner interface
func (u *UUID) Scan(value interface{}) error {
	if value == nil {
		*u = ""
		return nil
	}

	switch v := value.(type) {
	case []byte:
		// SQL Server uniqueidentifier dikembalikan sebagai 16 bytes dengan mixed-endian byte order
		if len(v) == 16 {
			// SQL Server GUID byte order (mixed-endian):
			// - bytes 0-3: reversed (little-endian)
			// - bytes 4-5: reversed (little-endian)
			// - bytes 6-7: reversed (little-endian)
			// - bytes 8-15: normal (big-endian)
			// Perlu di-swap ke standard UUID format
			swapped := []byte{
				v[3], v[2], v[1], v[0], // swap first 4 bytes
				v[5], v[4], // swap bytes 4-5
				v[7], v[6], // swap bytes 6-7
				v[8], v[9], v[10], v[11], v[12], v[13], v[14], v[15], // keep bytes 8-15
			}
			parsed, err := uuid.FromBytes(swapped)
			if err != nil {
				return fmt.Errorf("failed to parse UUID from bytes: %w", err)
			}
			*u = UUID(parsed.String())
			return nil
		}
		// Jika byte array tapi bukan 16 bytes, coba parse sebagai string UUID
		strUUID := string(v)
		// Validasi format UUID
		if _, err := uuid.Parse(strUUID); err != nil {
			return fmt.Errorf("invalid UUID format from bytes: %s, error: %w", strUUID, err)
		}
		*u = UUID(strUUID)
		return nil
	case string:
		// Validasi format UUID string
		if v != "" {
			if _, err := uuid.Parse(v); err != nil {
				return fmt.Errorf("invalid UUID format from string: %s, error: %w", v, err)
			}
		}
		*u = UUID(v)
		return nil
	default:
		return fmt.Errorf("unsupported type for UUID: %T", value)
	}
}

// Value implements driver.Valuer interface
func (u UUID) Value() (driver.Value, error) {
	if u == "" {
		return nil, nil
	}
	return string(u), nil
}

// String returns the string representation
func (u UUID) String() string {
	return string(u)
}

// MarshalJSON implements json.Marshaler - return UUID in uppercase
func (u UUID) MarshalJSON() ([]byte, error) {
	if u == "" {
		return []byte(`""`), nil
	}
	// Convert to uppercase for JSON output
	return json.Marshal(strings.ToUpper(string(u)))
}

// UnmarshalJSON implements json.Unmarshaler
func (u *UUID) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	*u = UUID(s)
	return nil
}

// ============================================================================
// Nullable UUID Type
// ============================================================================

// NullUUID is a nullable UUID type
type NullUUID struct {
	UUID  UUID
	Valid bool
}

// Scan implements sql.Scanner interface
func (nu *NullUUID) Scan(value interface{}) error {
	if value == nil {
		nu.UUID, nu.Valid = "", false
		return nil
	}
	nu.Valid = true
	return nu.UUID.Scan(value)
}

// Value implements driver.Valuer interface
func (nu NullUUID) Value() (driver.Value, error) {
	if !nu.Valid {
		return nil, nil
	}
	return nu.UUID.Value()
}

// MarshalJSON implements json.Marshaler - return clean JSON in uppercase
func (nu NullUUID) MarshalJSON() ([]byte, error) {
	if !nu.Valid {
		return []byte("null"), nil
	}
	// Convert to uppercase for JSON output
	return json.Marshal(strings.ToUpper(nu.UUID.String()))
}

// UnmarshalJSON implements json.Unmarshaler - accept both UUID string and null
func (nu *NullUUID) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		nu.Valid = false
		nu.UUID = ""
		return nil
	}
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	nu.Valid = true
	nu.UUID = UUID(s)
	return nil
}

// ============================================================================
// Custom Nullable Types dengan JSON marshal yang clean
// ============================================================================

// NullString wraps sql.NullString with custom JSON marshaling
type NullString struct {
	sql.NullString
}

// MarshalJSON implements json.Marshaler - return clean JSON
func (ns NullString) MarshalJSON() ([]byte, error) {
	if ns.Valid {
		return json.Marshal(ns.String)
	}
	return []byte("null"), nil
}

// UnmarshalJSON implements json.Unmarshaler - accept both string and null
func (ns *NullString) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		ns.Valid = false
		ns.String = ""
		return nil
	}
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}
	ns.Valid = true
	ns.String = s
	return nil
}

// Scan implements sql.Scanner interface
func (ns *NullString) Scan(value interface{}) error {
	return ns.NullString.Scan(value)
}

// Value implements driver.Valuer interface
func (ns NullString) Value() (driver.Value, error) {
	return ns.NullString.Value()
}

// NullInt64 wraps sql.NullInt64 with custom JSON marshaling
type NullInt64 struct {
	sql.NullInt64
}

// MarshalJSON implements json.Marshaler - return clean JSON
func (ni NullInt64) MarshalJSON() ([]byte, error) {
	if ni.Valid {
		return json.Marshal(ni.Int64)
	}
	return []byte("null"), nil
}

// UnmarshalJSON implements json.Unmarshaler - accept both number and null
func (ni *NullInt64) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		ni.Valid = false
		ni.Int64 = 0
		return nil
	}
	var i int64
	if err := json.Unmarshal(data, &i); err != nil {
		return err
	}
	ni.Valid = true
	ni.Int64 = i
	return nil
}

// Scan implements sql.Scanner interface
func (ni *NullInt64) Scan(value interface{}) error {
	return ni.NullInt64.Scan(value)
}

// Value implements driver.Valuer interface
func (ni NullInt64) Value() (driver.Value, error) {
	return ni.NullInt64.Value()
}

// NullTime wraps sql.NullTime with custom JSON marshaling
type NullTime struct {
	sql.NullTime
}

// MarshalJSON implements json.Marshaler - return clean JSON
func (nt NullTime) MarshalJSON() ([]byte, error) {
	if nt.Valid {
		return json.Marshal(nt.Time)
	}
	return []byte("null"), nil
}

// UnmarshalJSON implements json.Unmarshaler - accept both timestamp and null
func (nt *NullTime) UnmarshalJSON(data []byte) error {
	if string(data) == "null" {
		nt.Valid = false
		nt.Time = time.Time{}
		return nil
	}
	var t time.Time
	if err := json.Unmarshal(data, &t); err != nil {
		return err
	}
	nt.Valid = true
	nt.Time = t
	return nil
}

// Scan implements sql.Scanner interface
func (nt *NullTime) Scan(value interface{}) error {
	return nt.NullTime.Scan(value)
}

// Value implements driver.Valuer interface
func (nt NullTime) Value() (driver.Value, error) {
	return nt.NullTime.Value()
}
