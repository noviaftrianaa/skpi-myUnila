package dosen

import (
	"log"
	"sister-service/external/sister_api"
)

// Service defines the dosen service interface
type Service interface {
	GetDosenPhoto(idSdm string) ([]byte, string, error)
	GetDosenBidangIlmu(idSdm string) ([]map[string]interface{}, error)
}

type service struct {
	sisterAPI *sister_api.Client
}

// NewService creates a new dosen service
func NewService(sisterAPI *sister_api.Client) Service {
	return &service{
		sisterAPI: sisterAPI,
	}
}

// GetDosenPhoto fetches dosen photo from SISTER API
func (s *service) GetDosenPhoto(idSdm string) ([]byte, string, error) {
	log.Printf("📷 Fetching dosen photo for ID: %s", idSdm)

	// Call SISTER API to get photo binary
	photoBytes, contentType, err := s.sisterAPI.GetDosenPhoto(idSdm)
	if err != nil {
		log.Printf("❌ Failed to fetch dosen photo: %v", err)
		return nil, "", err
	}

	log.Printf("✅ Photo fetched successfully: %d bytes, type: %s", len(photoBytes), contentType)
	return photoBytes, contentType, nil
}

// GetDosenBidangIlmu fetches dosen bidang keahlian from SISTER API
func (s *service) GetDosenBidangIlmu(idSdm string) ([]map[string]interface{}, error) {
	log.Printf("📚 Fetching bidang keahlian for ID: %s", idSdm)

	// Call SISTER API to get bidang ilmu
	bidangIlmu, err := s.sisterAPI.GetDosenBidangIlmu(idSdm)
	if err != nil {
		log.Printf("❌ Failed to fetch bidang keahlian: %v", err)
		return nil, err
	}

	log.Printf("✅ Bidang keahlian fetched successfully: %d items", len(bidangIlmu))
	return bidangIlmu, nil
}
