package database

import (
	"fmt"
	"log"
	"time"

	"monitoring-service/internal/config"

	"github.com/jmoiron/sqlx"
	_ "github.com/microsoft/go-mssqldb"
)

func ConnectSQLServer(cfg config.DatabaseConfig) *sqlx.DB {
	connString := fmt.Sprintf(
		"sqlserver://%s:%s@%s:%s?database=%s&connection+timeout=30",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.Name,
	)

	db, err := sqlx.Connect(cfg.Driver, connString)
	if err != nil {
		log.Fatalf("❌ Failed to connect to SQL Server: %v", err)
	}

	db.SetMaxOpenConns(cfg.MaxOpenConns)
	db.SetMaxIdleConns(cfg.MaxIdleConns)

	if duration, err := time.ParseDuration(cfg.ConnMaxLifetime); err == nil {
		db.SetConnMaxLifetime(duration)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping SQL Server: %v", err)
	}

	log.Printf("✅ SQL Server connected: %s:%s/%s", cfg.Host, cfg.Port, cfg.Name)
	return db
}
