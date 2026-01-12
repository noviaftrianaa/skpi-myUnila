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

// Login godoc
// @Summary Login untuk mendapatkan access token
// @Description Autentikasi pengguna dengan id_aplikasi, username, dan password untuk mendapatkan JWT token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} response.Response{data=LoginResponse} "Login berhasil"
// @Failure 400 {object} response.Response "Bad request - validasi gagal"
// @Failure 401 {object} response.Response "Unauthorized - kredensial salah"
// @Failure 403 {object} response.Response "Forbidden - pengguna tidak terdaftar di aplikasi"
// @Failure 500 {object} response.Response "Internal server error"
// @Router /v1/auth/login [post]
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

// CheckToken godoc
// @Summary Cek validitas token
// @Description Memvalidasi JWT token dan mengembalikan informasi token serta user
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body CheckTokenRequest true "Token to check"
// @Success 200 {object} response.Response{data=CheckTokenResponse} "Token info"
// @Failure 400 {object} response.Response "Bad request - validasi gagal"
// @Failure 500 {object} response.Response "Internal server error"
// @Router /v1/auth/check-token [post]
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
