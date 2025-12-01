package feeder_api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/myunila/feeder-service/apps/apiconfig"
)

type FeederClient struct {
	BaseURL    string
	Username   string
	Password   string
	Token      string
	HTTPClient *http.Client
	mu         sync.RWMutex
}

type FeederRequest struct {
	Act      string                 `json:"act"`
	Filter   string                 `json:"filter,omitempty"`
	Limit    int                    `json:"limit,omitempty"`
	Offset   int                    `json:"offset,omitempty"`
	Order    string                 `json:"order,omitempty"`
	Token    string                 `json:"token,omitempty"`
	Username string                 `json:"username,omitempty"` // For GetToken only
	Password string                 `json:"password,omitempty"` // For GetToken only
	Data     map[string]interface{} `json:"data,omitempty"`
}

// FlexibleInt handles both string and int values from JSON
type FlexibleInt int

func (fi *FlexibleInt) UnmarshalJSON(b []byte) error {
	// Try to unmarshal as int first
	var i int
	if err := json.Unmarshal(b, &i); err == nil {
		*fi = FlexibleInt(i)
		return nil
	}

	// Try to unmarshal as string
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}

	// Convert string to int
	i, err := strconv.Atoi(s)
	if err != nil {
		return fmt.Errorf("cannot convert %q to int: %w", s, err)
	}

	*fi = FlexibleInt(i)
	return nil
}

type FeederResponse struct {
	ErrorCode FlexibleInt `json:"error_code"`
	ErrorDesc string      `json:"error_desc"`
	Data      interface{} `json:"data"`
}

var (
	globalClient *FeederClient
	once         sync.Once
)

// NewFeederClient creates a new Feeder API client with credentials from database or environment
func NewFeederClient() (*FeederClient, error) {
	var initErr error

	once.Do(func() {
		// Try to load config from database first
		baseURL := os.Getenv("FEEDER_API_BASE_URL")
		username := os.Getenv("FEEDER_API_USERNAME")
		password := os.Getenv("FEEDER_API_PASSWORD")

		// Try loading from database (apiconfig)
		if svc := apiconfig.GetService(); svc != nil {
			config, err := svc.GetByAPICode("feeder_api")
			if err == nil && config != nil {
				// Use database config
				baseURL = config.BaseURL

				// Try to get credentials (will return env fallback if DB not set)
				creds, err := svc.GetCredentials("feeder_api")
				if err == nil && creds != nil {
					if user, ok := creds["username"].(string); ok {
						username = user
					}
					if pass, ok := creds["password"].(string); ok {
						password = pass
					}
				}
			}
		}

		// Validate we have required credentials
		if baseURL == "" || username == "" || password == "" {
			initErr = errors.New("feeder API credentials not configured (check database setting.api_configs or .env)")
			return
		}

		globalClient = &FeederClient{
			BaseURL:  baseURL,
			Username: username,
			Password: password,
			HTTPClient: &http.Client{
				Timeout: 300 * time.Second, // 5 minutes for slow Neo Feeder API
			},
		}

		// Try to get token on initialization, but don't fail if it doesn't work
		// Token will be obtained lazily when first API call is made
		if err := globalClient.GetToken(); err != nil {
			fmt.Printf("⚠️  Warning: Failed to get initial token (will retry on first request): %v\n", err)
		}
	})

	// Only fail if credentials are missing, not if token generation failed
	if globalClient == nil {
		if initErr != nil {
			return nil, initErr
		}
		return nil, errors.New("failed to initialize feeder client")
	}

	return globalClient, nil
}

// GetToken gets authentication token from Feeder API
func (c *FeederClient) GetToken() error {
	if c == nil {
		return errors.New("feeder client is nil")
	}

	if c.HTTPClient == nil {
		return errors.New("feeder client HTTP client is not initialized")
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	req := FeederRequest{
		Act:      "GetToken",
		Username: c.Username,
		Password: c.Password,
	}

	var resp FeederResponse
	if err := c.doRequest(req, &resp); err != nil {
		return fmt.Errorf("failed to get token: %w", err)
	}

	if resp.ErrorCode != 0 {
		return fmt.Errorf("feeder API error: %s (code: %d)", resp.ErrorDesc, resp.ErrorCode)
	}

	// Extract token from response
	if dataMap, ok := resp.Data.(map[string]interface{}); ok {
		if token, ok := dataMap["token"].(string); ok {
			c.Token = token
			return nil
		}
		return fmt.Errorf("token field not found in data map: %+v", dataMap)
	}

	return fmt.Errorf("token not found in response (data type: %T, value: %+v)", resp.Data, resp.Data)
}

// GetReferensi fetches reference data from Feeder API
func (c *FeederClient) GetReferensi(table string, filter string, limit int, offset int) ([]map[string]interface{}, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetRecord",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var resp FeederResponse
	if err := c.doRequest(req, &resp); err != nil {
		return nil, fmt.Errorf("failed to get referensi: %w", err)
	}

	if resp.ErrorCode != 0 {
		// Token expired, retry with new token
		if resp.ErrorCode == 100 || resp.ErrorDesc == "Token tidak valid" {
			if err := c.GetToken(); err != nil {
				return nil, err
			}
			// Retry request with new token
			req.Token = c.Token
			if err := c.doRequest(req, &resp); err != nil {
				return nil, err
			}
		} else {
			return nil, fmt.Errorf("feeder API error: %s (code: %d)", resp.ErrorDesc, resp.ErrorCode)
		}
	}

	// Parse response data
	if dataList, ok := resp.Data.([]interface{}); ok {
		result := make([]map[string]interface{}, 0, len(dataList))
		for _, item := range dataList {
			if record, ok := item.(map[string]interface{}); ok {
				result = append(result, record)
			}
		}
		return result, nil
	}

	return nil, errors.New("invalid response data format")
}

// GetMahasiswa fetches student data from Feeder API
func (c *FeederClient) GetMahasiswa(filter string, limit int, offset int) ([]map[string]interface{}, error) {
	return c.GetRecordTable("mahasiswa", filter, limit, offset)
}

// GetRecordTable fetches data from specific table
func (c *FeederClient) GetRecordTable(table string, filter string, limit int, offset int) ([]map[string]interface{}, error) {
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetRecordset",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	// Add table name to data
	req.Data = map[string]interface{}{
		"table": table,
	}

	var resp FeederResponse
	if err := c.doRequest(req, &resp); err != nil {
		return nil, fmt.Errorf("failed to get records: %w", err)
	}

	if resp.ErrorCode != 0 {
		// Token expired, retry with new token
		if resp.ErrorCode == 100 || resp.ErrorDesc == "Token tidak valid" {
			if err := c.GetToken(); err != nil {
				return nil, err
			}
			// Retry request with new token
			req.Token = c.Token
			if err := c.doRequest(req, &resp); err != nil {
				return nil, err
			}
		} else {
			return nil, fmt.Errorf("feeder API error: %s (code: %d)", resp.ErrorDesc, resp.ErrorCode)
		}
	}

	// Parse response data
	if dataList, ok := resp.Data.([]interface{}); ok {
		result := make([]map[string]interface{}, 0, len(dataList))
		for _, item := range dataList {
			if record, ok := item.(map[string]interface{}); ok {
				result = append(result, record)
			}
		}
		return result, nil
	}

	return nil, errors.New("invalid response data format")
}

// doRequest performs HTTP request to Feeder API
func (c *FeederClient) doRequest(req FeederRequest, result interface{}) error {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", c.BaseURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	if err := json.Unmarshal(body, result); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	return nil
}

// TestConnection tests the connection to Feeder API
func (c *FeederClient) TestConnection() error {
	return c.GetToken()
}

// ForceRefreshToken forces a token refresh (clear current token and get new one)
func (c *FeederClient) ForceRefreshToken() error {
	c.mu.Lock()
	c.Token = ""
	c.mu.Unlock()
	return c.GetToken()
}

// GetDataLengkapMahasiswaProdi gets detailed student data for a prodi
func (c *FeederClient) GetDataLengkapMahasiswaProdi(idProdi string, filter string, limit, offset int) ([]byte, error) {
	if c == nil {
		return nil, errors.New("feeder client is nil")
	}

	if c.HTTPClient == nil {
		return nil, errors.New("feeder client HTTP client is not initialized")
	}

	// Only get token if not already exists (matches Laravel seeder behavior)
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetDataLengkapMahasiswaProdi",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		// Retry with new token
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	// Return raw JSON bytes
	return json.Marshal(result.Data)
}

// GetListRiwayatPendidikanMahasiswa gets student registration history
func (c *FeederClient) GetListRiwayatPendidikanMahasiswa(idRegPd string) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListRiwayatPendidikanMahasiswa",
		Token:  c.Token,
		Filter: fmt.Sprintf("id_registrasi_mahasiswa='%s'", idRegPd),
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetDetailMahasiswaLulusDO gets graduate/dropout details
func (c *FeederClient) GetDetailMahasiswaLulusDO(idRegPd string) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetDetailMahasiswaLulusDO",
		Token:  c.Token,
		Filter: fmt.Sprintf("id_registrasi_mahasiswa='%s'", idRegPd),
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListPerkuliahanMahasiswa gets student semester activities
func (c *FeederClient) GetListPerkuliahanMahasiswa(idRegPd string) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListPerkuliahanMahasiswa",
		Token:  c.Token,
		Filter: fmt.Sprintf("id_registrasi_mahasiswa='%s'", idRegPd),
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListAktivitasMahasiswa calls GetListAktivitasMahasiswa endpoint
func (c *FeederClient) GetListAktivitasMahasiswa() ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListAktivitasMahasiswa",
		Token:  c.Token,
		Filter: "",
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListAnggotaAktivitasMahasiswa calls GetListAnggotaAktivitasMahasiswa endpoint with id_aktivitas filter
func (c *FeederClient) GetListAnggotaAktivitasMahasiswa(idAktivitas string) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListAnggotaAktivitasMahasiswa",
		Token:  c.Token,
		Filter: fmt.Sprintf(`"id_aktivitas":"%s"`, idAktivitas),
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListAktivitasMahasiswaWithPagination calls GetListAktivitasMahasiswa endpoint with pagination
func (c *FeederClient) GetListAktivitasMahasiswaWithPagination(limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListAktivitasMahasiswa",
		Token:  c.Token,
		Filter: "",
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListAktivitasMahasiswaWithFilter calls GetListAktivitasMahasiswa endpoint with filter and pagination
// filter format: "id_semester = '20242' AND id_prodi = '1f0b8dcc-929e-434c-a14d-191468111154'"
func (c *FeederClient) GetListAktivitasMahasiswaWithFilter(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListAktivitasMahasiswa",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListKurikulum calls GetListKurikulum endpoint with filter and pagination
// filter format: "id_prodi = '1f0b8dcc-929e-434c-a14d-191468111154'"
func (c *FeederClient) GetListKurikulum(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListKurikulum",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetMatkulKurikulum calls GetMatkulKurikulum endpoint with filter and pagination
// filter format: "id_kurikulum = 'abc123'"
func (c *FeederClient) GetMatkulKurikulum(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetMatkulKurikulum",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListMataKuliah calls GetListMataKuliah endpoint with filter and pagination
// filter format: "id_matkul = 'xyz789'" or "id_prodi = '1f0b8dcc-929e-434c-a14d-191468111154'"
func (c *FeederClient) GetListMataKuliah(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListMataKuliah",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListRencanaEvaluasi calls GetListRencanaEvaluasi endpoint with filter and pagination
// filter format: "id_matkul = 'xyz789'"
func (c *FeederClient) GetListRencanaEvaluasi(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListRencanaEvaluasi",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetJenisEvaluasi calls GetJenisEvaluasi endpoint with filter and pagination
func (c *FeederClient) GetJenisEvaluasi(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetJenisEvaluasi",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListKelasKuliah calls GetListKelasKuliah endpoint with filter and pagination
// filter format: "id_semester = '20242' AND id_prodi = '1f0b8dcc-929e-434c-a14d-191468111154'"
func (c *FeederClient) GetListKelasKuliah(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListKelasKuliah",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetDosenPengajarKelasKuliah calls GetDosenPengajarKelasKuliah endpoint with filter and pagination
// filter format: "id_kelas_kuliah = 'xyz789'" or "id_semester = '20242' AND id_prodi = '1f0b8dcc-929e-434c-a14d-191468111154'"
func (c *FeederClient) GetDosenPengajarKelasKuliah(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetDosenPengajarKelasKuliah",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetDetailNilaiPerkuliahanKelas calls GetDetailNilaiPerkuliahanKelas endpoint with filter and pagination
// filter format: "id_kelas_kuliah = 'xyz789'"
// Returns: id_registrasi_mahasiswa, nim, nama_mahasiswa, id_kelas_kuliah, nama_kelas_kuliah, nilai_angka, nilai_huruf, nilai_indeks
func (c *FeederClient) GetDetailNilaiPerkuliahanKelas(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetDetailNilaiPerkuliahanKelas",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListKonversiKampusMerdeka calls GetListKonversiKampusMerdeka endpoint with filter and pagination
// filter format: "id_semester = '20242'"
// Returns: id_konversi_aktivitas, id_matkul, id_anggota, id_aktivitas, nilai_angka, nilai_huruf, nilai_indeks, sks_mata_kuliah
func (c *FeederClient) GetListKonversiKampusMerdeka(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListKonversiKampusMerdeka",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetNilaiTransferPendidikanMahasiswa calls GetNilaiTransferPendidikanMahasiswa endpoint with filter and pagination
// filter format: "id_semester = '20242'"
// Returns: id_transfer, id_aktivitas, id_matkul, id_semester, id_registrasi_mahasiswa,
//
//	kode_mata_kuliah_asal, nama_mata_kuliah_asal, sks_mata_kuliah_asal, sks_mata_kuliah_diakui,
//	nilai_huruf_asal, nilai_huruf_diakui, nilai_angka_diakui, id_perguruan_tinggi
func (c *FeederClient) GetNilaiTransferPendidikanMahasiswa(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetNilaiTransferPendidikanMahasiswa",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetTranskripMahasiswa calls GetTranskripMahasiswa endpoint with filter and pagination
// filter format: "id_semester = '20242'" or "id_registrasi_mahasiswa = 'xxx'"
// Returns: id_registrasi_mahasiswa, id_matkul, id_kelas_kuliah, id_konversi_aktivitas, id_nilai_transfer,
//
//	nilai_angka, nilai_huruf, nilai_indeks, smt_diambil, sks_mata_kuliah
func (c *FeederClient) GetTranskripMahasiswa(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetTranskripMahasiswa",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}

// GetListPrestasiMahasiswa calls GetListPrestasiMahasiswa endpoint with filter and pagination
// filter format: "tahun_prestasi = '2025'" or empty for all
// Returns: id_prestasi, id_mahasiswa, nama_mahasiswa, id_jenis_prestasi, nama_jenis_prestasi,
//
//	id_tingkat_prestasi, nama_tingkat_prestasi, nama_prestasi, tahun_prestasi, penyelenggara, peringkat, id_aktivitas, status_sync
func (c *FeederClient) GetListPrestasiMahasiswa(filter string, limit, offset int) ([]byte, error) {
	// Only get token if not already exists
	if c.Token == "" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
	}

	req := FeederRequest{
		Act:    "GetListPrestasiMahasiswa",
		Token:  c.Token,
		Filter: filter,
		Limit:  limit,
		Offset: offset,
	}

	var result FeederResponse
	if err := c.doRequest(req, &result); err != nil {
		return nil, err
	}

	// Check if token expired, retry with new token
	if result.ErrorCode == 100 || result.ErrorDesc == "Token tidak valid" {
		if err := c.GetToken(); err != nil {
			return nil, err
		}
		req.Token = c.Token
		if err := c.doRequest(req, &result); err != nil {
			return nil, err
		}
	}

	if result.ErrorCode != 0 {
		return nil, fmt.Errorf("feeder API error: %s (code: %d)", result.ErrorDesc, result.ErrorCode)
	}

	return json.Marshal(result.Data)
}
