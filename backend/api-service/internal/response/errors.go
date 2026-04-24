package response

import "net/http"

// Error adalah struktur untuk error yang bisa digunakan di seluruh service
type Error struct {
	Message  string
	Code     string
	HttpCode int
}

// NewError membuat Error baru
func NewError(msg string, code string, httpCode int) Error {
	return Error{
		Message:  msg,
		Code:     code,
		HttpCode: httpCode,
	}
}

// Error implements error interface
func (e Error) Error() string {
	return e.Message
}

// ============================================================================
// Global Error Definitions
// ============================================================================

// General Errors
var (
	ErrGeneral         = NewError("Terjadi kesalahan internal", "INTERNAL_ERROR", http.StatusInternalServerError)
	ErrBadRequest      = NewError("Request tidak valid", "BAD_REQUEST", http.StatusBadRequest)
	ErrNotFound        = NewError("Data tidak ditemukan", "NOT_FOUND", http.StatusNotFound)
	ErrUnauthorized    = NewError("Tidak terautentikasi", "UNAUTHORIZED", http.StatusUnauthorized)
	ErrForbidden       = NewError("Akses ditolak", "FORBIDDEN", http.StatusForbidden)
	ErrConflict        = NewError("Data konflik", "CONFLICT", http.StatusConflict)
	ErrValidation      = NewError("Validasi gagal", "VALIDATION_ERROR", http.StatusUnprocessableEntity)
	ErrTooManyRequests = NewError("Terlalu banyak request", "TOO_MANY_REQUESTS", http.StatusTooManyRequests)
)

// Auth Errors
var (
	ErrUserNotFound       = NewError("Pengguna tidak ditemukan", "USER_NOT_FOUND", http.StatusUnauthorized)
	ErrUserNotActive      = NewError("Pengguna tidak aktif", "USER_NOT_ACTIVE", http.StatusUnauthorized)
	ErrUserDisabled       = NewError("Akun pengguna dinonaktifkan", "USER_DISABLED", http.StatusUnauthorized)
	ErrInvalidPassword    = NewError("Password salah", "INVALID_PASSWORD", http.StatusUnauthorized)
	ErrInvalidCredentials = NewError("Kredensial tidak valid", "INVALID_CREDENTIALS", http.StatusUnauthorized)
	ErrTokenExpired       = NewError("Token sudah kadaluarsa", "TOKEN_EXPIRED", http.StatusUnauthorized)
	ErrTokenInvalid       = NewError("Token tidak valid", "TOKEN_INVALID", http.StatusUnauthorized)
	ErrTokenRevoked       = NewError("Token sudah dicabut", "TOKEN_REVOKED", http.StatusUnauthorized)
	ErrAppNotRegistered   = NewError("Aplikasi tidak terdaftar", "APP_NOT_REGISTERED", http.StatusForbidden)
	ErrUserNotAuthorized  = NewError("Pengguna tidak terdaftar di aplikasi ini", "USER_NOT_AUTHORIZED", http.StatusForbidden)
	ErrUserNoLongerActive = NewError("Pengguna sudah tidak aktif di aplikasi", "USER_NO_LONGER_ACTIVE", http.StatusForbidden)
	ErrUserNotDeveloper   = NewError("Akun tidak memiliki peran Developer. Hubungi admin manajemen akses.", "USER_NOT_DEVELOPER", http.StatusForbidden)
)

// Validation Errors
var (
	ErrRequiredField    = NewError("Field wajib diisi", "REQUIRED_FIELD", http.StatusBadRequest)
	ErrInvalidFormat    = NewError("Format tidak valid", "INVALID_FORMAT", http.StatusBadRequest)
	ErrInvalidUUID      = NewError("Format UUID tidak valid", "INVALID_UUID", http.StatusBadRequest)
	ErrInvalidEmail     = NewError("Format email tidak valid", "INVALID_EMAIL", http.StatusBadRequest)
	ErrInvalidJSON      = NewError("Format JSON tidak valid", "INVALID_JSON", http.StatusBadRequest)
)

// Data Errors
var (
	ErrDataNotFound   = NewError("Data tidak ditemukan", "DATA_NOT_FOUND", http.StatusNotFound)
	ErrDataExists     = NewError("Data sudah ada", "DATA_EXISTS", http.StatusConflict)
	ErrDataInvalid    = NewError("Data tidak valid", "DATA_INVALID", http.StatusBadRequest)
	ErrDatabaseError  = NewError("Kesalahan database", "DATABASE_ERROR", http.StatusInternalServerError)
)

// ============================================================================
// Error Mapping (untuk konversi error ke response)
// ============================================================================

var ErrorMapping = map[string]Error{
	// General
	"internal error":    ErrGeneral,
	"bad request":       ErrBadRequest,
	"not found":         ErrNotFound,
	"unauthorized":      ErrUnauthorized,
	"forbidden":         ErrForbidden,
	"conflict":          ErrConflict,
	"validation failed": ErrValidation,

	// Auth
	"user not found":             ErrUserNotFound,
	"user not active":            ErrUserNotActive,
	"user disabled":              ErrUserDisabled,
	"invalid password":           ErrInvalidPassword,
	"invalid credentials":        ErrInvalidCredentials,
	"token expired":              ErrTokenExpired,
	"token invalid":              ErrTokenInvalid,
	"token revoked":              ErrTokenRevoked,
	"app not registered":         ErrAppNotRegistered,
	"user not authorized":        ErrUserNotAuthorized,
	"user no longer active":      ErrUserNoLongerActive,
}

// GetErrorFromMessage mendapatkan Error dari pesan error
func GetErrorFromMessage(msg string) Error {
	if err, ok := ErrorMapping[msg]; ok {
		return err
	}
	return ErrGeneral
}
