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

	// Check tables we need
	tables := []string{
		"bidang_studi", "bidang_usaha", "jabfung", "jab_tgs",
		"jenis_bahan_ajar", "jenis_beasiswa", "jenis_diklat", "jenis_dokumen",
		"jenis_keluar", "jenis_kepanitiaan", "jenis_kesejahteraan", "jenis_publikasi",
		"jenis_tes", "jenis_tunjangan", "media_publikasi", "skim_kegiatan",
		"status_kepegawaian", "sumber_gaji", "tingkat_penghargaan", "wilayah",
		"kategori_capaian_luaran", "kategori_kegiatan", "kelompok_bidang", "lembaga_sertifikasi",
		"pangkat_golongan", "ikatan_kerja_sdm", "jenis_penghargaan", "pekerjaan", "bidang_pekerjaan",
	}

	fmt.Println("=== Checking Table Structures ===\n")

	for _, table := range tables {
		fmt.Printf("📋 ref.%s:\n", table)

		// Get columns
		query := fmt.Sprintf(`
			SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
			FROM INFORMATION_SCHEMA.COLUMNS
			WHERE TABLE_SCHEMA = 'ref' AND TABLE_NAME = '%s'
			ORDER BY ORDINAL_POSITION
		`, table)

		rows, err := db.Query(query)
		if err != nil {
			fmt.Printf("   ❌ Error: %v\n\n", err)
			continue
		}

		hasColumns := false
		for rows.Next() {
			var colName, dataType, nullable string
			var maxLength sql.NullInt64

			rows.Scan(&colName, &dataType, &maxLength, &nullable)

			maxLenStr := ""
			if maxLength.Valid {
				if maxLength.Int64 == -1 {
					maxLenStr = "(MAX)"
				} else {
					maxLenStr = fmt.Sprintf("(%d)", maxLength.Int64)
				}
			}

			fmt.Printf("   - %s: %s%s %s\n", colName, dataType, maxLenStr, nullable)
			hasColumns = true
		}
		rows.Close()

		if !hasColumns {
			fmt.Printf("   ❌ Table not found\n")
		}
		fmt.Println()
	}
}
