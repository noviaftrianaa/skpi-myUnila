package api_config

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/myunila/keuangan-service/pkg/crypto"
)

type Service interface {
	GetCredentials(apiCode string) (map[string]interface{}, error)
}

type service struct {
	repo      Repository
	encryptor *crypto.EncryptionService
}

func NewService(repo Repository, encryptor *crypto.EncryptionService) Service {
	return &service{
		repo:      repo,
		encryptor: encryptor,
	}
}

func (s *service) GetCredentials(apiCode string) (map[string]interface{}, error) {
	config, err := s.repo.GetByAPICode(apiCode)
	if err != nil {
		// If not found in database and it's a known API, try environment fallback
		if strings.Contains(err.Error(), "not found") {
			return s.getCredentialsFromEnv(apiCode)
		}
		return nil, err
	}

	// If config exists but has no credentials and fallback is enabled
	if (!config.EncryptedCredentials.Valid || config.EncryptedCredentials.String == "") && config.UseEnvFallback {
		return s.getCredentialsFromEnv(apiCode)
	}

	// Decrypt credentials from database
	if config.EncryptedCredentials.Valid && config.EncryptedCredentials.String != "" {
		decrypted, err := s.encryptor.Decrypt(config.EncryptedCredentials.String)
		if err != nil {
			return nil, fmt.Errorf("failed to decrypt credentials: %v", err)
		}

		var credentials map[string]interface{}
		if err := json.Unmarshal([]byte(decrypted), &credentials); err != nil {
			return nil, fmt.Errorf("failed to parse credentials: %v", err)
		}

		return credentials, nil
	}

	return nil, fmt.Errorf("no credentials configured for %s", apiCode)
}

func (s *service) getCredentialsFromEnv(apiCode string) (map[string]interface{}, error) {
	switch strings.ToUpper(apiCode) {
	case "SIMPEDAM":
		return map[string]interface{}{
			"username": os.Getenv("SIMPEDAM_USER"),
			"password": os.Getenv("SIMPEDAM_PASSWORD"),
		}, nil

	default:
		return nil, fmt.Errorf("no environment fallback configured for %s", apiCode)
	}
}

// Global service instance for external packages to use
var globalService Service

// SetService sets the global api_config service instance
func SetService(s Service) {
	globalService = s
}

// GetService returns the global api_config service instance
func GetService() Service {
	return globalService
}

// GetAPICredentials is a helper function for external packages
func GetAPICredentials(apiCode string) (map[string]interface{}, error) {
	if globalService == nil {
		return nil, fmt.Errorf("api_config service not initialized")
	}
	return globalService.GetCredentials(apiCode)
}
