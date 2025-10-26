package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/microsoft/go-mssqldb"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	godotenv.Load()

	connString := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s&TrustServerCertificate=true",
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_DATABASE"),
	)

	db, err := sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer db.Close()

	// Query all ref schema tables
	query := `
		SELECT TABLE_NAME
		FROM INFORMATION_SCHEMA.TABLES
		WHERE TABLE_SCHEMA = 'ref'
		ORDER BY TABLE_NAME
	`

	rows, err := db.Query(query)
	if err != nil {
		log.Fatal("Error querying tables:", err)
	}
	defer rows.Close()

	fmt.Println("=== Ref Schema Tables ===")
	count := 0
	for rows.Next() {
		var tableName string
		rows.Scan(&tableName)
		fmt.Printf("%d. ref.%s\n", count+1, tableName)
		count++
	}
	fmt.Printf("\nTotal: %d tables\n", count)

	// Check specific tables we need
	neededTables := []string{
		"bidang_studi", "bidang_usaha", "jabfung", "jab_tgs",
		"jenis_bahan_ajar", "jenis_beasiswa", "jenis_diklat", "jenis_dokumen",
		"jenis_keluar", "jenis_kepanitiaan", "jenis_kesejahteraan", "jenis_publikasi",
		"jenis_tes", "jenis_tunjangan", "media_publikasi", "skim_kegiatan",
		"status_kepegawaian", "sumber_gaji", "tingkat_penghargaan", "wilayah",
		"kategori_capaian_luaran", "kategori_kegiatan", "kelompok_bidang", "lembaga_sertifikasi",
		"pangkat_golongan", "ikatan_kerja_sdm", "jenis_penghargaan", "pekerjaan", "bidang_pekerjaan",
	}

	fmt.Println("\n=== Checking Required Tables ===")
	for _, table := range neededTables {
		var exists int
		err := db.QueryRow(`
			SELECT COUNT(*)
			FROM INFORMATION_SCHEMA.TABLES
			WHERE TABLE_SCHEMA = 'ref' AND TABLE_NAME = ?
		`, table).Scan(&exists)

		if err == nil && exists > 0 {
			fmt.Printf("✅ ref.%s EXISTS\n", table)
		} else {
			fmt.Printf("❌ ref.%s NOT FOUND\n", table)
		}
	}
}
