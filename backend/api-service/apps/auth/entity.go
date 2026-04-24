package auth

import (
	"database/sql/driver"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// ============================================================================
// Custom UUID Type untuk SQL Server uniqueidentifier
// ============================================================================

// UUID adalah custom type yang bisa scan dari SQL Server uniqueidentifier
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
// Database Entities
// ============================================================================

// Pengguna adalah entity dari tabel man_akses.pengguna
type Pengguna struct {
	IDPengguna      UUID       `db:"id_pengguna" json:"id_pengguna"`
	Username        string     `db:"username" json:"username"`
	PasswordEncrypt string     `db:"password_encrypt" json:"-"`
	Email           *string    `db:"email" json:"email,omitempty"`
	NmPengguna      *string    `db:"nm_pengguna" json:"nm_pengguna,omitempty"`
	AAktif          int        `db:"a_aktif" json:"a_aktif"`
	Disable         *int       `db:"disable" json:"disable,omitempty"`
	SoftDelete      *int       `db:"soft_delete" json:"-"`
	LastLoginAt     *time.Time `db:"last_login_at" json:"last_login_at,omitempty"`
	LastLoginIP     *string    `db:"last_login_ip" json:"last_login_ip,omitempty"`
}

// PjAplikasi adalah entity dari tabel man_akses.pj_aplikasi (Penanggung Jawab Aplikasi)
type PjAplikasi struct {
	IDPjAplikasi UUID `db:"id_pj_aplikasi" json:"id_pj_aplikasi"`
	IDAplikasi   UUID `db:"id_aplikasi" json:"id_aplikasi"`
	IDPengguna   UUID `db:"id_pengguna" json:"id_pengguna"`
	AMasih       int  `db:"a_masih" json:"a_masih"`
	SoftDelete   *int `db:"soft_delete" json:"-"`
}

// Aplikasi adalah entity dari tabel man_akses.aplikasi
type Aplikasi struct {
	IDAplikasi  UUID       `db:"id_aplikasi" json:"id_aplikasi"`
	NmAplikasi  string     `db:"nm_aplikasi" json:"nm_aplikasi"`
	URL         *string    `db:"url" json:"url,omitempty"`
	ExpiredDate *time.Time `db:"expired_date" json:"expired_date,omitempty"`
}

// RolePengguna adalah entity dari tabel man_akses.role_pengguna
type RolePengguna struct {
	IDRolePengguna UUID    `db:"id_role_pengguna" json:"id_role_pengguna"`
	IDPengguna     UUID    `db:"id_pengguna" json:"id_pengguna"`
	IDPeran        UUID    `db:"id_peran" json:"id_peran"`
	SoftDelete     *int    `db:"soft_delete" json:"-"`
	NmPeran        *string `db:"nm_peran" json:"nm_peran,omitempty"` // dari join dengan tabel peran
}

// LogJWT adalah entity dari tabel logger.log_jwt
type LogJWT struct {
	IDLogJWT     UUID      `db:"id_log_jwt" json:"id_log_jwt"`
	IDPengguna   UUID      `db:"id_pengguna" json:"id_pengguna"`
	IDAplikasi   UUID      `db:"id_aplikasi" json:"id_aplikasi"`
	TokenValue   string    `db:"token_value" json:"token_value"`
	URL          *string   `db:"url" json:"url,omitempty"`
	IPAddress    *string   `db:"ip_address" json:"ip_address,omitempty"`
	WaktuCreate  time.Time `db:"waktu_create" json:"waktu_create"`
	WaktuExpired time.Time `db:"waktu_expired" json:"waktu_expired"`
}

// ============================================================================
// Request DTOs
// ============================================================================

// LoginRequest adalah request body untuk login
type LoginRequest struct {
	IDAplikasi string `json:"id_aplikasi" validate:"required,uuid"`
	Username   string `json:"username" validate:"required"`
	Password   string `json:"password" validate:"required"`
}

// CheckTokenRequest adalah request body untuk check token
type CheckTokenRequest struct {
	TokenBearer string `json:"token_bearer" validate:"required"`
}

// ============================================================================
// Response DTOs
// ============================================================================

// LoginResponse adalah response untuk login berhasil
type LoginResponse struct {
	TokenStatus      string `json:"token_status"`
	TokenDibuat      string `json:"token_dibuat"`
	TokenKadarluwasa string `json:"token_kadarluwasa"`
	AccessToken      string `json:"access_token"`
	TokenType        string `json:"token_type"`
	ExpiresIn        int    `json:"expires_in"` // dalam detik
}

// CheckTokenResponse adalah response untuk check token
type CheckTokenResponse struct {
	TokenStatus      string    `json:"token_status"`
	TokenDibuat      string    `json:"token_dibuat"`
	TokenKadarluwasa string    `json:"token_kadarluwasa"`
	User             *UserInfo `json:"user,omitempty"`
}

// UserInfo adalah informasi user dalam response
type UserInfo struct {
	IDPengguna string  `json:"id_pengguna"`
	Username   string  `json:"username"`
	Email      *string `json:"email,omitempty"`
	NmPengguna *string `json:"nm_pengguna,omitempty"`
	Peran      *string `json:"peran,omitempty"`
	IDAplikasi string  `json:"id_aplikasi"`
}

// ============================================================================
// Validation Helpers
// ============================================================================

// Validate memvalidasi LoginRequest
func (r *LoginRequest) Validate() map[string]string {
	errors := make(map[string]string)

	if r.IDAplikasi == "" {
		errors["id_aplikasi"] = "ID Aplikasi harus diisi"
	} else if _, err := uuid.Parse(r.IDAplikasi); err != nil {
		// Guard UUID format supaya error 400 (bukan 500 dari DB layer)
		errors["id_aplikasi"] = "ID Aplikasi harus format UUID valid (contoh: 12345678-1234-1234-1234-123456789abc)"
	}
	if r.Username == "" {
		errors["username"] = "Username harus diisi"
	}
	if r.Password == "" {
		errors["password"] = "Password harus diisi"
	}

	if len(errors) > 0 {
		return errors
	}
	return nil
}

// Validate memvalidasi CheckTokenRequest
func (r *CheckTokenRequest) Validate() map[string]string {
	errors := make(map[string]string)

	if r.TokenBearer == "" {
		errors["token_bearer"] = "Token harus diisi"
	}

	if len(errors) > 0 {
		return errors
	}
	return nil
}
