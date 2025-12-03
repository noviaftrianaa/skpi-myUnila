package database

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/myunila/myunila-service/internal/config"
)

// SQLServerDB wraps sqlx.DB
type SQLServerDB struct {
	*sqlx.DB
}

// ConnectSQLServer establishes a connection to SQL Server
func ConnectSQLServer(cfg config.DatabaseConfig) (*SQLServerDB, error) {
	connString := fmt.Sprintf(
		"server=%s;port=%s;user id=%s;password=%s;database=%s;TrustServerCertificate=%t",
		cfg.Host,
		cfg.Port,
		cfg.Username,
		cfg.Password,
		cfg.Database,
		cfg.TrustServerCertificate,
	)

	db, err := sqlx.Connect("sqlserver", connString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SQL Server: %w", err)
	}

	// Configure connection pool
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping SQL Server: %w", err)
	}

	log.Println("✅ Connected to SQL Server successfully")

	return &SQLServerDB{DB: db}, nil
}
