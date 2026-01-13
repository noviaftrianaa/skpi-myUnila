package auth

import (
	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/internal/response"
)

// Handler untuk auth endpoints
type Handler struct {
	svc Service
}

// NewHandler membuat handler baru
func NewHandler(svc Service) *Handler {
	return &Handler{svc: svc}
}

// Login handles user authentication
func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Format request tidak valid", map[string]string{
			"body": "Request body harus berupa JSON yang valid",
		})
	}

	// Validasi request
	if errors := req.Validate(); errors != nil {
		return response.ValidationError(c, errors)
	}

	// Get IP address
	ipAddress := c.IP()
	if forwarded := c.Get("X-Forwarded-For"); forwarded != "" {
		ipAddress = forwarded
	}

	// Execute login
	result, err := h.svc.Login(c.Context(), &req, ipAddress)
	if err != nil {
		switch err {
		case ErrUserNotFound:
			return response.Unauthorized(c, "Gagal Otentikasi. Pengguna tidak ditemukan")
		case ErrUserNotActive:
			return response.Unauthorized(c, "Gagal Otentikasi. Pengguna tidak aktif")
		case ErrUserDisabled:
			return response.Unauthorized(c, "Gagal Otentikasi. Akun dinonaktifkan")
		case ErrInvalidPassword:
			return response.Unauthorized(c, "Gagal Otentikasi. Password salah")
		case ErrAppNotRegistered:
			return response.Forbidden(c, "Gagal Otentikasi. Aplikasi tidak terdaftar")
		case ErrUserNotAuthorized:
			return response.Forbidden(c, "Gagal Otentikasi. Pengguna tidak terdaftar sebagai pengguna aplikasi ini")
		case ErrUserNoLongerActive:
			return response.Forbidden(c, "Gagal Otentikasi. Pengguna sudah tidak aktif di aplikasi")
		default:
			return response.InternalError(c, "Terjadi kesalahan internal")
		}
	}

	return response.Success(c, "Berhasil Otentikasi", result)
}

// CheckToken validates a JWT token
func (h *Handler) CheckToken(c *fiber.Ctx) error {
	var req CheckTokenRequest

	// Parse request body
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Format request tidak valid", map[string]string{
			"body": "Request body harus berupa JSON yang valid",
		})
	}

	// Validasi request
	if errors := req.Validate(); errors != nil {
		return response.ValidationError(c, errors)
	}

	// Execute check token
	result, err := h.svc.CheckToken(c.Context(), req.TokenBearer)
	if err != nil {
		return response.InternalError(c, "Terjadi kesalahan internal")
	}

	// Tentukan message berdasarkan status
	message := "Token valid"
	if result.TokenStatus != "Aktif" {
		message = "Token tidak valid"
	}

	return response.Success(c, message, result)
}
