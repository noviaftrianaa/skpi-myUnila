package diklat

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
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
		// Jika sudah dalam format string
		*u = UUID(string(v))
		return nil
	case string:
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

// MarshalJSON implements json.Marshaler - return clean JSON
func (nu NullUUID) MarshalJSON() ([]byte, error) {
	if !nu.Valid {
		return []byte("null"), nil
	}
	return json.Marshal(nu.UUID.String())
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

// ============================================================================
// Database Entities
// ============================================================================

// Diklat adalah entity dari tabel pdrd.diklat (sesuai struktur database asli)
type Diklat struct {
	// Primary Keys & Foreign Keys (UUIDs) - gunakan custom UUID type
	IDDiklat    UUID     `db:"id_diklat" json:"id_diklat"`
	IDSP        NullUUID `db:"id_sp" json:"id_sp,omitempty"`
	IDSDM       UUID     `db:"id_sdm" json:"id_sdm"`
	IDKelBidang NullUUID `db:"id_kel_bidang" json:"id_kel_bidang,omitempty"`

	// Integer IDs
	IDKatGiat   int `db:"id_katgiat" json:"id_katgiat"`
	IDJnsDiklat int `db:"id_jns_diklat" json:"id_jns_diklat"`

	// Informasi Diklat - gunakan custom NullString dan NullInt64
	NmDiklat      string     `db:"nm_diklat" json:"nm_diklat"`
	Penyelenggara NullString `db:"penyelenggara" json:"penyelenggara,omitempty"`
	Thn           int        `db:"thn" json:"thn"` // numeric -> int
	Peran         NullString `db:"peran" json:"peran,omitempty"`
	Tkt           NullInt64  `db:"tkt" json:"tkt,omitempty"`         // numeric -> int (tingkat)
	JmlJam        NullInt64  `db:"jml_jam" json:"jml_jam,omitempty"` // numeric -> int

	// Sertifikat & SK - gunakan custom NullString dan NullTime
	NoSert     NullString `db:"no_sert" json:"no_sert,omitempty"`
	TglSert    NullTime   `db:"tgl_sert" json:"tgl_sert,omitempty"`
	Tempat     NullString `db:"tempat" json:"tempat,omitempty"`
	TglMulai   NullTime   `db:"tgl_mulai" json:"tgl_mulai,omitempty"`
	TglSelesai NullTime   `db:"tgl_selesai" json:"tgl_selesai,omitempty"`
	SkTugas    NullString `db:"sk_tugas" json:"sk_tugas,omitempty"`
	TglSkTugas NullTime   `db:"tgl_sk_tugas" json:"tgl_sk_tugas,omitempty"`

	// Validasi - gunakan custom NullInt64 dan NullTime
	AValid      NullInt64 `db:"a_valid" json:"a_valid,omitempty"`
	TglValidasi NullTime  `db:"tgl_validasi" json:"tgl_validasi,omitempty"`

	// Audit Fields (Required) - gunakan custom UUID
	CreateDate time.Time `db:"create_date" json:"create_date"`
	IDCreator  UUID      `db:"id_creator" json:"id_creator"`
	LastUpdate time.Time `db:"last_update" json:"last_update"`
	IDUpdater  NullUUID  `db:"id_updater" json:"id_updater,omitempty"`
	SoftDelete int       `db:"soft_delete" json:"-"` // 0=aktif, 1=deleted
	LastSync   time.Time `db:"last_sync" json:"last_sync"`
}

// DiklatCreateRequest untuk input create diklat (dari user)
type DiklatCreateRequest struct {
	IDDiklat      string  `json:"id_diklat,omitempty"` // Will be generated by service if empty
	IDSP          *string `json:"id_sp"`
	IDSDM         string  `json:"id_sdm" validate:"required"`
	IDKelBidang   *string `json:"id_kel_bidang"`
	IDKatGiat     int     `json:"id_katgiat" validate:"required"`
	IDJnsDiklat   int     `json:"id_jns_diklat" validate:"required"`
	NmDiklat      string  `json:"nm_diklat" validate:"required"`
	Penyelenggara *string `json:"penyelenggara"`
	Thn           int     `json:"thn" validate:"required"`
	Peran         *string `json:"peran"`
	Tkt           *int    `json:"tkt"`
	JmlJam        *int    `json:"jml_jam"`
	NoSert        *string `json:"no_sert"`
	TglSert       *string `json:"tgl_sert"` // Format: YYYY-MM-DD
	Tempat        *string `json:"tempat"`
	TglMulai      *string `json:"tgl_mulai"`   // Format: YYYY-MM-DD
	TglSelesai    *string `json:"tgl_selesai"` // Format: YYYY-MM-DD
	SkTugas       *string `json:"sk_tugas"`
	TglSkTugas    *string `json:"tgl_sk_tugas"`         // Format: YYYY-MM-DD
	IDCreator     string  `json:"id_creator,omitempty"` // Will be set from JWT token
}

// DiklatUpdateRequest untuk input update diklat (dari user)
type DiklatUpdateRequest struct {
	IDDiklat      string  `json:"id_diklat" validate:"required"`
	IDSP          *string `json:"id_sp"`
	IDSDM         string  `json:"id_sdm" validate:"required"`
	IDKelBidang   *string `json:"id_kel_bidang"`
	IDKatGiat     int     `json:"id_katgiat" validate:"required"`
	IDJnsDiklat   int     `json:"id_jns_diklat" validate:"required"`
	NmDiklat      string  `json:"nm_diklat" validate:"required"`
	Penyelenggara *string `json:"penyelenggara"`
	Thn           int     `json:"thn" validate:"required"`
	Peran         *string `json:"peran"`
	Tkt           *int    `json:"tkt"`
	JmlJam        *int    `json:"jml_jam"`
	NoSert        *string `json:"no_sert"`
	TglSert       *string `json:"tgl_sert"` // Format: YYYY-MM-DD
	Tempat        *string `json:"tempat"`
	TglMulai      *string `json:"tgl_mulai"`   // Format: YYYY-MM-DD
	TglSelesai    *string `json:"tgl_selesai"` // Format: YYYY-MM-DD
	SkTugas       *string `json:"sk_tugas"`
	TglSkTugas    *string `json:"tgl_sk_tugas"`         // Format: YYYY-MM-DD
	IDUpdater     string  `json:"id_updater,omitempty"` // Will be set from JWT token
}

type DiklatResponse struct {
	Status   bool             `json:"status"`
	Message  string           `json:"message"`
	Latency  float64          `json:"latency"`
	Data     interface{}      `json:"data,omitempty"`
	Error    *ValidationError `json:"error,omitempty"`
	Response interface{}      `json:"response,omitempty"`
}

type ValidationError map[string][]string

type DiklatParams struct {
	PaginationParams
	IDDiklat *string `query:"id_diklat"`
	IDSDM    *string `query:"id_sdm"`
	Thn      *int    `query:"thn"`
	Peran    *string `query:"peran"`
	TglMulai *string `query:"tgl_mulai"` // Format: YYYY-MM-DD
}

// PaginationParams untuk parameter pagination standar
type PaginationParams struct {
	Page   int    `query:"page"`
	Limit  int    `query:"limit"`
	Search string `query:"search"`
	SortBy string `query:"sort_by"`
	Order  string `query:"order"` // asc atau desc
}

// ============================================================================
// Default Values
// ============================================================================

const (
	DefaultPage  = 1
	DefaultLimit = 20
	MaxLimit     = 100
)

// NormalizePagination memastikan nilai pagination valid
func (p *PaginationParams) NormalizePagination() {
	if p.Page < 1 {
		p.Page = DefaultPage
	}
	if p.Limit < 1 {
		p.Limit = DefaultLimit
	}
	if p.Limit > MaxLimit {
		p.Limit = MaxLimit
	}
	if p.Order != "asc" && p.Order != "desc" {
		p.Order = "asc"
	}
}

// Offset menghitung offset untuk query
func (p *PaginationParams) Offset() int {
	return (p.Page - 1) * p.Limit
}
