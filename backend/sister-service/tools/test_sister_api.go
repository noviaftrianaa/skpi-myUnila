package main

import (
	"encoding/json"
	"fmt"
	"log"
	"sister-service/external/sister_api"
	"sister-service/internal/config"
)

type SisterAgama struct {
	ID   int    `json:"id"`
	Nama string `json:"nama"`
}

func main() {
	// Load config
	if err := config.LoadConfig(); err != nil {
		log.Fatal("Failed to load config:", err)
	}

	fmt.Println("🔄 Testing Sister API Connection...")
	fmt.Printf("Base URL: %s\n", config.Cfg.SisterAPI.BaseURL)
	fmt.Printf("Token: %s...\n\n", config.Cfg.SisterAPI.Token[:50])

	// Create Sister API client
	client := sister_api.NewClient(config.Cfg.SisterAPI)

	// Test GetReferensiAgama
	fmt.Println("📡 Fetching /1.0/referensi/agama...")
	rawData, err := client.GetReferensiAgama()
	if err != nil {
		log.Fatal("❌ Error:", err)
	}

	// Parse response
	var agamaList []SisterAgama
	if err := json.Unmarshal(rawData, &agamaList); err != nil {
		log.Fatal("❌ Failed to parse response:", err)
	}

	// Print results
	fmt.Printf("\n✅ Success! Fetched %d agama:\n\n", len(agamaList))
	for _, agama := range agamaList {
		fmt.Printf("  %2d - %s\n", agama.ID, agama.Nama)
	}

	fmt.Println("\n🎉 Sister API connection test successful!")
}
