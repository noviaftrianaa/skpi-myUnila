package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"sister-service/external/sister_api"
)

func main() {
	// Get credentials from env
	token := os.Getenv("SISTER_API_TOKEN")
	if token == "" {
		log.Fatal("SISTER_API_TOKEN not set")
	}

	client := sister_api.NewClient(token)

	// Test endpoints yang error
	endpoints := []string{"wilayah", "jenis_tes", "bidang_studi"}

	for _, ep := range endpoints {
		fmt.Printf("\n======== Testing %s ========\n", ep)

		var rawData []byte
		var err error

		switch ep {
		case "wilayah":
			rawData, err = client.GetReferensiWilayah()
		case "jenis_tes":
			rawData, err = client.GetReferensiJenisTes()
		case "bidang_studi":
			rawData, err = client.GetReferensiBidangStudi()
		}

		if err != nil {
			fmt.Printf("Error: %v\n", err)
			continue
		}

		// Print first 500 chars
		if len(rawData) > 500 {
			fmt.Printf("Response (first 500 chars): %s...\n", string(rawData[:500]))
		} else {
			fmt.Printf("Response: %s\n", string(rawData))
		}

		// Try to detect structure
		var asArray []interface{}
		var asObject map[string]interface{}

		if err := json.Unmarshal(rawData, &asArray); err == nil {
			fmt.Printf("✅ Structure: ARRAY with %d items\n", len(asArray))
		} else if err := json.Unmarshal(rawData, &asObject); err == nil {
			fmt.Printf("✅ Structure: OBJECT with keys: ")
			for k := range asObject {
				fmt.Printf("%s, ", k)
			}
			fmt.Println()

			// Check if there's a data field
			if data, ok := asObject["data"]; ok {
				if dataArr, ok := data.([]interface{}); ok {
					fmt.Printf("   - 'data' field contains ARRAY with %d items\n", len(dataArr))
				}
			}
		} else {
			fmt.Printf("❌ Unknown structure\n")
		}
	}
}
