// Package database — SQL Server connector via sqlx.
package database

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/myunila/manajemen-konten-service/internal/config"
)

type SQLServerDB struct {
	*sqlx.DB
}

func ConnectSQLServer(cfg config.DatabaseConfig) (*SQLServerDB, error) {
	conn := fmt.Sprintf(
		"server=%s;port=%s;user id=%s;password=%s;database=%s;TrustServerCertificate=%t",
		cfg.Host, cfg.Port, cfg.Username, cfg.Password, cfg.Database, cfg.TrustServerCertificate,
	)
	db, err := sqlx.Connect("sqlserver", conn)
	if err != nil {
		return nil, fmt.Errorf("connect sqlserver: %w", err)
	}
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("ping sqlserver: %w", err)
	}
	log.Println("✅ Connected to SQL Server (man_konten)")
	return &SQLServerDB{DB: db}, nil
}
