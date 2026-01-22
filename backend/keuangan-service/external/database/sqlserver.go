package database

import (
	"fmt"
	"log"

	"github.com/myunila/keuangan-service/internal/config"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
)

// ConnectSQLServer establishes connection to SQL Server database
func ConnectSQLServer(cfg config.DatabaseConfig) (*sqlx.DB, error) {
	// Build connection string
	// Format: sqlserver://username:password@host:port?database=dbname
	connString := fmt.Sprintf(
		"sqlserver://%s:%s@%s:%s?database=%s&connection+timeout=30",
		cfg.Username,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.Database,
	)

	// Open database connection
	db, err := sqlx.Connect(cfg.Driver, connString)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)

	// Set connection max lifetime (already time.Duration type)
	db.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	// Ping database to verify connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ SQL Server connected successfully")
	return db, nil
}
