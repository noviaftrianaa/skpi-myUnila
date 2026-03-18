package database

import (
	"fmt"
	"log"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/myunila/project-service/config"
)

func ConnectSQLServer(cfg config.MSSQLConfig) (*sqlx.DB, error) {
	dsn := fmt.Sprintf(
		"sqlserver://%s:%s@%s:%s?database=%s&TrustServerCertificate=true",
		cfg.Username, cfg.Password, cfg.Host, cfg.Port, cfg.Database,
	)

	db, err := sqlx.Connect("sqlserver", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SQL Server: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(3)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping SQL Server: %w", err)
	}

	log.Printf("✅ Connected to SQL Server: %s:%s/%s", cfg.Host, cfg.Port, cfg.Database)
	return db, nil
}
