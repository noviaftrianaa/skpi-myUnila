package auth

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/myunila/api-service/internal/config"
	"github.com/myunila/api-service/internal/response"
	"github.com/myunila/api-service/pkg/jwt"
)

// Re-export global errors untuk kemudahan penggunaan di handler
var (
	ErrUserNotFound       = response.ErrUserNotFound
	ErrUserNotActive      = response.ErrUserNotActive
	ErrUserDisabled       = response.ErrUserDisabled
	ErrInvalidPassword    = response.ErrInvalidPassword
	ErrAppNotRegistered   = response.ErrAppNotRegistered
	ErrUserNotAuthorized  = response.ErrUserNotAuthorized
	ErrUserNoLongerActive = response.ErrUserNoLongerActive
	ErrUserNotDeveloper   = response.ErrUserNotDeveloper
)

// PeranDeveloper = id_peran yang wajib dimiliki pengguna untuk login ws-api.
// Mengikuti desain: PJ aplikasi boleh banyak, tapi khusus yang akses ws-api
// wajib punya role Developer (dari menu manajemen akses).
const PeranDeveloper = 107

// Service interface untuk auth business logic
type Service interface {
	Login(ctx context.Context, req *LoginRequest, ipAddress string) (*LoginResponse, error)
	CheckToken(ctx context.Context, tokenBearer string) (*CheckTokenResponse, error)
}

type service struct {
	repo Repository
}

// NewService membuat service baru
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// Login melakukan autentikasi dan generate token
func (s *service) Login(ctx context.Context, req *LoginRequest, ipAddress string) (*LoginResponse, error) {
	// 1. Validasi aplikasi terdaftar
	aplikasi, err := s.repo.GetAplikasi(ctx, req.IDAplikasi)
	if err != nil {
		log.Printf("Error getting aplikasi: %v", err)
		return nil, fmt.Errorf("internal error: %w", err)
	}
	if aplikasi == nil {
		return nil, ErrAppNotRegistered
	}

	// 2. Cari pengguna berdasarkan username
	pengguna, err := s.repo.GetPenggunaByUsername(ctx, req.Username)
	if err != nil {
		log.Printf("Error getting pengguna: %v", err)
		return nil, fmt.Errorf("internal error: %w", err)
	}
	if pengguna == nil {
		return nil, ErrUserNotFound
	}

	// 3. Cek pengguna aktif
	if pengguna.AAktif == 0 {
		return nil, ErrUserNotActive
	}

	// 4. Cek pengguna tidak disabled
	if pengguna.Disable != nil && *pengguna.Disable == 1 {
		return nil, ErrUserDisabled
	}

	// 5. Validasi password (SHA1 -> bcrypt verification)
	// Strategy sama dengan auth-service Laravel:
	// - Hash input dengan SHA1
	// - Verify SHA1 hash dengan bcrypt hash di database (kolom password_encrypt)
	if !jwt.VerifyPasswordSHA1Bcrypt(req.Password, pengguna.PasswordEncrypt) {
		return nil, ErrInvalidPassword
	}

	// 6. Cek pengguna terdaftar di aplikasi (pj_aplikasi)
	pjAplikasi, err := s.repo.GetPjAplikasi(ctx, req.IDAplikasi, pengguna.IDPengguna.String())
	if err != nil {
		log.Printf("Error getting pj_aplikasi: %v", err)
		return nil, fmt.Errorf("internal error: %w", err)
	}
	if pjAplikasi == nil {
		return nil, ErrUserNotAuthorized
	}

	// 7. Cek masih aktif di aplikasi
	if pjAplikasi.AMasih == 0 {
		return nil, ErrUserNoLongerActive
	}

	// 7b. Cek peran Developer. PJ aplikasi boleh banyak, tapi yang boleh akses
	// ws-api harus punya peran Developer (id_peran 107) — supaya akun Non-tech
	// staff (misal Kabag yang juga PJ) tidak bisa issue JWT ke ws-api.
	hasDev, err := s.repo.HasPeran(ctx, pengguna.IDPengguna.String(), PeranDeveloper)
	if err != nil {
		log.Printf("Error checking peran Developer: %v", err)
		return nil, fmt.Errorf("internal error: %w", err)
	}
	if !hasDev {
		return nil, ErrUserNotDeveloper
	}

	// 8. Cek apakah sudah ada token aktif
	existingToken, err := s.repo.GetActiveToken(ctx, pengguna.IDPengguna.String(), req.IDAplikasi)
	if err != nil {
		log.Printf("Warning: Error checking existing token: %v", err)
		// Lanjutkan saja, buat token baru
	}

	// Jika ada token aktif yang belum expired, kembalikan token tersebut
	if existingToken != nil && existingToken.WaktuExpired.After(time.Now()) {
		return &LoginResponse{
			TokenStatus:      "Aktif",
			TokenDibuat:      existingToken.WaktuCreate.Format("2006-01-02 15:04:05"),
			TokenKadarluwasa: existingToken.WaktuExpired.Format("2006-01-02 15:04:05"),
			AccessToken:      existingToken.TokenValue,
			TokenType:        "Bearer",
			ExpiresIn:        int(time.Until(existingToken.WaktuExpired).Seconds()),
		}, nil
	}

	// 9. Ambil role pengguna
	role, err := s.repo.GetRolePengguna(ctx, pengguna.IDPengguna.String())
	if err != nil {
		log.Printf("Warning: Error getting role: %v", err)
	}
	roleName := "user"
	if role != nil && role.NmPeran != nil {
		roleName = *role.NmPeran
	}

	// 10. Generate JWT token
	userData := jwt.UserClaim{
		ID:         pengguna.IDPengguna.String(),
		Username:   pengguna.Username,
		Role:       roleName,
		IDAplikasi: req.IDAplikasi,
	}
	if pengguna.Email != nil {
		userData.Email = *pengguna.Email
	}
	if pengguna.NmPengguna != nil {
		userData.Name = *pengguna.NmPengguna
	}

	tokenString, claims, err := jwt.GenerateToken(userData, ipAddress)
	if err != nil {
		log.Printf("Error generating token: %v", err)
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	// 11. Simpan log JWT ke database
	url := "/v1/auth/login"
	logJWT := &LogJWT{
		IDLogJWT:     UUID(claims.ID),
		IDPengguna:   pengguna.IDPengguna,
		IDAplikasi:   UUID(req.IDAplikasi),
		TokenValue:   tokenString,
		URL:          &url,
		IPAddress:    &ipAddress,
		WaktuCreate:  claims.IssuedAt.Time,
		WaktuExpired: claims.ExpiresAt.Time,
	}
	if err := s.repo.CreateLogJWT(ctx, logJWT); err != nil {
		log.Printf("Warning: Failed to log JWT: %v", err)
		// Lanjutkan saja, token sudah dibuat
	}

	// 12. Update last login
	if err := s.repo.UpdateLastLogin(ctx, pengguna.IDPengguna.String(), ipAddress); err != nil {
		log.Printf("Warning: Failed to update last login: %v", err)
	}

	return &LoginResponse{
		TokenStatus:      "Baru",
		TokenDibuat:      claims.IssuedAt.Time.Format("2006-01-02 15:04:05"),
		TokenKadarluwasa: claims.ExpiresAt.Time.Format("2006-01-02 15:04:05"),
		AccessToken:      tokenString,
		TokenType:        "Bearer",
		ExpiresIn:        config.Cfg.JWT.AccessTokenTTL * 60, // convert menit ke detik
	}, nil
}

// CheckToken memvalidasi token dan mengembalikan informasi
func (s *service) CheckToken(ctx context.Context, tokenBearer string) (*CheckTokenResponse, error) {
	// Validasi token
	claims, err := jwt.ValidateToken(tokenBearer)
	if err != nil {
		switch err {
		case jwt.ErrExpiredToken:
			return &CheckTokenResponse{
				TokenStatus:      "Kadaluarsa",
				TokenDibuat:      "",
				TokenKadarluwasa: "",
				User:             nil,
			}, nil
		case jwt.ErrBlacklistedToken:
			return &CheckTokenResponse{
				TokenStatus:      "Dicabut",
				TokenDibuat:      "",
				TokenKadarluwasa: "",
				User:             nil,
			}, nil
		default:
			return &CheckTokenResponse{
				TokenStatus:      "Tidak Valid",
				TokenDibuat:      "",
				TokenKadarluwasa: "",
				User:             nil,
			}, nil
		}
	}

	// Ambil info user dari database untuk data terbaru
	pengguna, err := s.repo.GetPenggunaByID(ctx, claims.User.ID)
	if err != nil || pengguna == nil {
		// Gunakan data dari token jika tidak bisa ambil dari DB
		return &CheckTokenResponse{
			TokenStatus:      "Aktif",
			TokenDibuat:      claims.IssuedAt.Time.Format("2006-01-02 15:04:05"),
			TokenKadarluwasa: claims.ExpiresAt.Time.Format("2006-01-02 15:04:05"),
			User: &UserInfo{
				IDPengguna: claims.User.ID,
				Username:   claims.User.Username,
				IDAplikasi: claims.User.IDAplikasi,
			},
		}, nil
	}

	// Cek user masih aktif
	if pengguna.AAktif == 0 {
		return &CheckTokenResponse{
			TokenStatus:      "User Tidak Aktif",
			TokenDibuat:      claims.IssuedAt.Time.Format("2006-01-02 15:04:05"),
			TokenKadarluwasa: claims.ExpiresAt.Time.Format("2006-01-02 15:04:05"),
			User:             nil,
		}, nil
	}

	// Ambil role
	role, _ := s.repo.GetRolePengguna(ctx, pengguna.IDPengguna.String())
	var roleName *string
	if role != nil {
		roleName = role.NmPeran
	}

	return &CheckTokenResponse{
		TokenStatus:      "Aktif",
		TokenDibuat:      claims.IssuedAt.Time.Format("2006-01-02 15:04:05"),
		TokenKadarluwasa: claims.ExpiresAt.Time.Format("2006-01-02 15:04:05"),
		User: &UserInfo{
			IDPengguna: pengguna.IDPengguna.String(),
			Username:   pengguna.Username,
			Email:      pengguna.Email,
			NmPengguna: pengguna.NmPengguna,
			Peran:      roleName,
			IDAplikasi: claims.User.IDAplikasi,
		},
	}, nil
}
