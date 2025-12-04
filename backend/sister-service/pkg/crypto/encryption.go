package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
)

// EncryptionService handles AES-256-GCM encryption/decryption
type EncryptionService struct {
	key []byte
}

// NewEncryptionService creates a new encryption service with the given key
// Key must be 32 bytes for AES-256
func NewEncryptionService(key string) (*EncryptionService, error) {
	keyBytes := []byte(key)

	if len(keyBytes) != 32 {
		return nil, errors.New("encryption key must be exactly 32 bytes for AES-256")
	}

	return &EncryptionService{
		key: keyBytes,
	}, nil
}

// Encrypt encrypts plaintext using AES-256-GCM
// Returns base64 encoded ciphertext
func (s *EncryptionService) Encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	// Create cipher block
	block, err := aes.NewCipher(s.key)
	if err != nil {
		return "", err
	}

	// Create GCM mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Generate nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// Encrypt and seal
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// Encode to base64 for storage
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts base64 encoded ciphertext using AES-256-GCM
// Returns plaintext
func (s *EncryptionService) Decrypt(encryptedText string) (string, error) {
	if encryptedText == "" {
		return "", nil
	}

	// Decode from base64
	ciphertext, err := base64.StdEncoding.DecodeString(encryptedText)
	if err != nil {
		return "", err
	}

	// Create cipher block
	block, err := aes.NewCipher(s.key)
	if err != nil {
		return "", err
	}

	// Create GCM mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// Get nonce size
	nonceSize := gcm.NonceSize()
	if len(ciphertext) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	// Split nonce and ciphertext
	nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]

	// Decrypt and open
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// IsEncrypted checks if a string appears to be base64 encoded (heuristic)
func (s *EncryptionService) IsEncrypted(text string) bool {
	if text == "" {
		return false
	}

	// Try to decode base64
	_, err := base64.StdEncoding.DecodeString(text)
	return err == nil && len(text) > 32 // Encrypted text should be reasonably long
}

// LaravelEncryption handles Laravel's AES-256-CBC encryption format
// Laravel's encrypted strings are base64-encoded JSON with: iv, value, mac
type LaravelEncryption struct {
	key []byte
}

// LaravelPayload represents Laravel's encrypted payload structure
type LaravelPayload struct {
	IV    string `json:"iv"`
	Value string `json:"value"`
	Mac   string `json:"mac"`
}

// NewLaravelEncryption creates a new Laravel-compatible encryption service
// Key should be the APP_KEY from Laravel (without base64: prefix)
func NewLaravelEncryption(appKey string) (*LaravelEncryption, error) {
	// Laravel APP_KEY is base64 encoded (after removing "base64:" prefix)
	keyBytes, err := base64.StdEncoding.DecodeString(appKey)
	if err != nil {
		return nil, errors.New("failed to decode APP_KEY: " + err.Error())
	}

	if len(keyBytes) != 32 {
		return nil, errors.New("APP_KEY must decode to 32 bytes for AES-256")
	}

	return &LaravelEncryption{
		key: keyBytes,
	}, nil
}

// Decrypt decrypts a Laravel-encrypted string
// The input is the full base64-encoded JSON payload from Laravel's Crypt::encryptString()
func (l *LaravelEncryption) Decrypt(encryptedText string) (string, error) {
	if encryptedText == "" {
		return "", errors.New("encrypted text is empty")
	}

	// Decode the outer base64 (Laravel's payload)
	payloadJSON, err := base64.StdEncoding.DecodeString(encryptedText)
	if err != nil {
		return "", errors.New("failed to decode base64 payload: " + err.Error())
	}

	// Parse the JSON payload
	var payload LaravelPayload
	if err := json.Unmarshal(payloadJSON, &payload); err != nil {
		return "", errors.New("failed to parse JSON payload: " + err.Error())
	}

	// Decode IV
	iv, err := base64.StdEncoding.DecodeString(payload.IV)
	if err != nil {
		return "", errors.New("failed to decode IV: " + err.Error())
	}

	// Decode ciphertext
	ciphertext, err := base64.StdEncoding.DecodeString(payload.Value)
	if err != nil {
		return "", errors.New("failed to decode ciphertext: " + err.Error())
	}

	// Create AES cipher block
	block, err := aes.NewCipher(l.key)
	if err != nil {
		return "", errors.New("failed to create cipher: " + err.Error())
	}

	// Decrypt using CBC mode
	mode := cipher.NewCBCDecrypter(block, iv)
	plaintext := make([]byte, len(ciphertext))
	mode.CryptBlocks(plaintext, ciphertext)

	// Remove PKCS7 padding
	plaintext, err = pkcs7Unpad(plaintext)
	if err != nil {
		return "", errors.New("failed to unpad: " + err.Error())
	}

	return string(plaintext), nil
}

// pkcs7Unpad removes PKCS7 padding from decrypted data
func pkcs7Unpad(data []byte) ([]byte, error) {
	if len(data) == 0 {
		return nil, errors.New("data is empty")
	}

	padding := int(data[len(data)-1])
	if padding > len(data) || padding > aes.BlockSize {
		return nil, errors.New("invalid padding")
	}

	// Verify padding
	for i := len(data) - padding; i < len(data); i++ {
		if data[i] != byte(padding) {
			return nil, errors.New("invalid padding bytes")
		}
	}

	return data[:len(data)-padding], nil
}