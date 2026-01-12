package auth

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// Repository interface untuk auth operations
type Repository interface {
	// User operations
	GetPenggunaByUsername(ctx context.Context, username string) (*Pengguna, error)
	GetPenggunaByID(ctx context.Context, idPengguna string) (*Pengguna, error)
	UpdateLastLogin(ctx context.Context, idPengguna, ipAddress string) error

	// Aplikasi operations
	GetPjAplikasi(ctx context.Context, idAplikasi, idPengguna string) (*PjAplikasi, error)
	GetAplikasi(ctx context.Context, idAplikasi string) (*Aplikasi, error)

	// Role operations
	GetRolePengguna(ctx context.Context, idPengguna string) (*RolePengguna, error)

	// JWT Log operations
	CreateLogJWT(ctx context.Context, log *LogJWT) error
	GetActiveToken(ctx context.Context, idPengguna, idAplikasi string) (*LogJWT, error)
}

type repository struct {
	db *sqlx.DB
}

// NewRepository membuat repository baru
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// GetPenggunaByUsername mengambil pengguna berdasarkan username
func (r *repository) GetPenggunaByUsername(ctx context.Context, username string) (*Pengguna, error) {
	query := `
		SELECT
			id_pengguna,
			username,
			password_encrypt,
			email,
			nm_pengguna,
			a_aktif,
			disable,
			soft_delete,
			last_login_at,
			last_login_ip
		FROM man_akses.pengguna
		WHERE username = @p1
		AND (soft_delete IS NULL OR soft_delete = 0)
	`

	var pengguna Pengguna
	err := r.db.GetContext(ctx, &pengguna, query, username)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get pengguna: %w", err)
	}

	return &pengguna, nil
}

// GetPenggunaByID mengambil pengguna berdasarkan ID
func (r *repository) GetPenggunaByID(ctx context.Context, idPengguna string) (*Pengguna, error) {
	query := `
		SELECT
			id_pengguna,
			username,
			password_encrypt,
			email,
			nm_pengguna,
			a_aktif,
			disable,
			soft_delete,
			last_login_at,
			last_login_ip
		FROM man_akses.pengguna
		WHERE id_pengguna = @p1
		AND (soft_delete IS NULL OR soft_delete = 0)
	`

	var pengguna Pengguna
	err := r.db.GetContext(ctx, &pengguna, query, idPengguna)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get pengguna: %w", err)
	}

	return &pengguna, nil
}

// UpdateLastLogin mengupdate waktu login terakhir
func (r *repository) UpdateLastLogin(ctx context.Context, idPengguna, ipAddress string) error {
	query := `
		UPDATE man_akses.pengguna
		SET last_login_at = GETDATE(),
			last_login_ip = @p2
		WHERE id_pengguna = @p1
	`

	_, err := r.db.ExecContext(ctx, query, idPengguna, ipAddress)
	if err != nil {
		return fmt.Errorf("failed to update last login: %w", err)
	}

	return nil
}

// GetPjAplikasi mengambil data penanggung jawab aplikasi
func (r *repository) GetPjAplikasi(ctx context.Context, idAplikasi, idPengguna string) (*PjAplikasi, error) {
	// Parse string UUID ke uuid.UUID untuk proper binding dengan SQL Server uniqueidentifier
	appUUID, err := uuid.Parse(idAplikasi)
	if err != nil {
		return nil, fmt.Errorf("invalid id_aplikasi format: %w", err)
	}
	userUUID, err := uuid.Parse(idPengguna)
	if err != nil {
		return nil, fmt.Errorf("invalid id_pengguna format: %w", err)
	}

	query := `
		SELECT
			id_pj_aplikasi,
			id_aplikasi,
			id_pengguna,
			ISNULL(a_masih, 1) as a_masih,
			soft_delete
		FROM man_akses.pj_aplikasi
		WHERE id_aplikasi = @p1
		AND id_pengguna = @p2
		AND (soft_delete IS NULL OR soft_delete = 0)
		AND (a_masih IS NULL OR a_masih = 1)
	`

	var pjAplikasi PjAplikasi
	err = r.db.GetContext(ctx, &pjAplikasi, query, appUUID, userUUID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get pj_aplikasi: %w", err)
	}

	return &pjAplikasi, nil
}

// GetAplikasi mengambil data aplikasi
func (r *repository) GetAplikasi(ctx context.Context, idAplikasi string) (*Aplikasi, error) {
	// Parse string UUID ke uuid.UUID untuk proper binding
	appUUID, err := uuid.Parse(idAplikasi)
	if err != nil {
		return nil, fmt.Errorf("invalid id_aplikasi format: %w", err)
	}

	query := `
		SELECT
			id_aplikasi,
			nm_aplikasi,
			url,
			expired_date
		FROM man_akses.aplikasi
		WHERE id_aplikasi = @p1
		AND expired_date IS NULL
	`

	var aplikasi Aplikasi
	err = r.db.GetContext(ctx, &aplikasi, query, appUUID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get aplikasi: %w", err)
	}

	return &aplikasi, nil
}

// GetRolePengguna mengambil role pengguna
func (r *repository) GetRolePengguna(ctx context.Context, idPengguna string) (*RolePengguna, error) {
	// Parse string UUID ke uuid.UUID untuk proper binding
	userUUID, err := uuid.Parse(idPengguna)
	if err != nil {
		return nil, fmt.Errorf("invalid id_pengguna format: %w", err)
	}

	query := `
		SELECT TOP 1
			rp.id_role_pengguna,
			rp.id_pengguna,
			rp.id_peran,
			rp.soft_delete,
			p.nm_peran
		FROM man_akses.role_pengguna rp
		JOIN man_akses.peran p ON p.id_peran = rp.id_peran
			AND p.expired_date IS NULL
		WHERE rp.id_pengguna = @p1
		AND (rp.soft_delete IS NULL OR rp.soft_delete = 0)
		ORDER BY rp.last_active DESC
	`

	var role RolePengguna
	err = r.db.GetContext(ctx, &role, query, userUUID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get role_pengguna: %w", err)
	}

	return &role, nil
}

// CreateLogJWT menyimpan log JWT ke database
func (r *repository) CreateLogJWT(ctx context.Context, log *LogJWT) error {
	if log.IDLogJWT == "" {
		log.IDLogJWT = UUID(uuid.New().String())
	}

	query := `
		INSERT INTO logger.log_jwt (
			id_log_jwt,
			id_pengguna,
			id_aplikasi,
			token_value,
			url,
			ip_address,
			waktu_create,
			waktu_expired
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8
		)
	`

	_, err := r.db.ExecContext(ctx, query,
		log.IDLogJWT,
		log.IDPengguna,
		log.IDAplikasi,
		log.TokenValue,
		log.URL,
		log.IPAddress,
		log.WaktuCreate,
		log.WaktuExpired,
	)
	if err != nil {
		return fmt.Errorf("failed to create log_jwt: %w", err)
	}

	return nil
}

// GetActiveToken mengambil token aktif terakhir
func (r *repository) GetActiveToken(ctx context.Context, idPengguna, idAplikasi string) (*LogJWT, error) {
	// Parse string UUID ke uuid.UUID untuk proper binding
	userUUID, err := uuid.Parse(idPengguna)
	if err != nil {
		return nil, fmt.Errorf("invalid id_pengguna format: %w", err)
	}
	appUUID, err := uuid.Parse(idAplikasi)
	if err != nil {
		return nil, fmt.Errorf("invalid id_aplikasi format: %w", err)
	}

	query := `
		SELECT TOP 1
			id_log_jwt,
			id_pengguna,
			id_aplikasi,
			token_value,
			url,
			ip_address,
			waktu_create,
			waktu_expired
		FROM logger.log_jwt
		WHERE id_pengguna = @p1
		AND id_aplikasi = @p2
		AND token_value IS NOT NULL
		AND waktu_expired > GETDATE()
		ORDER BY waktu_expired DESC
	`

	var log LogJWT
	err = r.db.GetContext(ctx, &log, query, userUUID, appUUID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get active token: %w", err)
	}

	return &log, nil
}

