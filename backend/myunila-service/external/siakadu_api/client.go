package siakadu_api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"sync"
	"time"

	"github.com/myunila/myunila-service/apps/api_config"
	"github.com/myunila/myunila-service/internal/config"
)

// SiakaduClient handles SIAKADU API communication
type SiakaduClient struct {
	BaseURL    string
	Username   string
	Password   string
	Token      string
	HTTPClient *http.Client
	mu         sync.RWMutex
}

// AuthResponse represents the response from auth/login
type AuthResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Payload struct {
		AccessToken string `json:"access_token"`
	} `json:"payload"`
}

// PaginatedResponse represents a generic paginated response from SIAKADU API
type PaginatedResponse struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Payload []map[string]interface{} `json:"payload"`
	Query   struct {
		TotalCount int `json:"total_count"`
		TotalPage  int `json:"total_page"`
		Page       int `json:"page"`
		PageSize   int `json:"page_size"`
	} `json:"query"`
}

// SimpleResponse represents a non-paginated response
type SimpleResponse struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Payload []map[string]interface{} `json:"payload"`
}

var (
	globalClient *SiakaduClient
	once         sync.Once
)

// NewSiakaduClient creates a new SIAKADU API client
// Priority: Database (api_configs) > Environment Variables
func NewSiakaduClient() (*SiakaduClient, error) {
	var initErr error

	once.Do(func() {
		// Default from environment/config
		baseURL := config.Cfg.SiakaduAPI.BaseURL
		username := config.Cfg.SiakaduAPI.Username
		password := config.Cfg.SiakaduAPI.Password

		// Try to load from database (api_configs) first - priority over env
		if svc := api_config.GetService(); svc != nil {
			dbConfig, err := svc.GetByAPICode("SIAKADU")
			if err == nil && dbConfig != nil {
				baseURL = dbConfig.BaseURL
				fmt.Printf("📁 Using SIAKADU base URL from database: %s\n", baseURL)

				creds, err := svc.GetCredentials("SIAKADU")
				if err == nil && creds != nil {
					if user, ok := creds["username"].(string); ok && user != "" {
						username = user
					}
					if pass, ok := creds["password"].(string); ok && pass != "" {
						password = pass
					}
					fmt.Println("🔐 Using SIAKADU credentials from database")
				}
			}
		}

		// Validate credentials
		if baseURL == "" || username == "" || password == "" {
			initErr = errors.New("SIAKADU API credentials not configured (check database setting.api_configs or .env)")
			return
		}

		globalClient = &SiakaduClient{
			BaseURL:  baseURL,
			Username: username,
			Password: password,
			HTTPClient: &http.Client{
				Timeout: 60 * time.Second,
			},
		}

		fmt.Printf("🌐 SIAKADU API client initialized with base URL: %s\n", baseURL)

		// Get initial token
		if err := globalClient.Login(); err != nil {
			fmt.Printf("⚠️  Warning: Failed to get initial SIAKADU token: %v\n", err)
		}
	})

	if globalClient == nil {
		if initErr != nil {
			return nil, initErr
		}
		return nil, errors.New("failed to initialize SIAKADU client")
	}

	return globalClient, nil
}

// Login authenticates and retrieves access token from SIAKADU API
func (c *SiakaduClient) Login() error {
	if c == nil {
		return errors.New("SIAKADU client is nil")
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// Prepare JSON body
	loginPayload := map[string]string{
		"username": c.Username,
		"password": c.Password,
	}
	jsonBody, err := json.Marshal(loginPayload)
	if err != nil {
		return fmt.Errorf("failed to marshal login payload: %w", err)
	}

	authURL := c.BaseURL + "/auth/login"
	req, err := http.NewRequest("POST", authURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	var authResp AuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !authResp.Success || authResp.Payload.AccessToken == "" {
		return fmt.Errorf("failed to get token: %s", authResp.Message)
	}

	c.Token = authResp.Payload.AccessToken
	fmt.Println("✅ SIAKADU API token obtained successfully")

	return nil
}

// doGet performs a GET request with Bearer token, auto-refreshes on 401
func (c *SiakaduClient) doGet(endpoint string, params url.Values, retry bool) ([]byte, error) {
	if c.Token == "" {
		if err := c.Login(); err != nil {
			return nil, err
		}
	}

	reqURL := c.BaseURL + "/" + endpoint
	if len(params) > 0 {
		reqURL += "?" + params.Encode()
	}

	req, err := http.NewRequest("GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.mu.RLock()
	req.Header.Set("Authorization", "Bearer "+c.Token)
	c.mu.RUnlock()
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Handle 401 - refresh token and retry once
	if resp.StatusCode == http.StatusUnauthorized && !retry {
		if err := c.Login(); err != nil {
			return nil, fmt.Errorf("failed to refresh token: %w", err)
		}
		return c.doGet(endpoint, params, true)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP error %d: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

// getPaginated performs a paginated GET request
func (c *SiakaduClient) getPaginated(endpoint string, params url.Values) ([]map[string]interface{}, int, error) {
	body, err := c.doGet(endpoint, params, false)
	if err != nil {
		return nil, 0, err
	}

	var resp PaginatedResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, 0, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !resp.Success {
		return nil, 0, fmt.Errorf("API error: %s", resp.Message)
	}

	return resp.Payload, resp.Query.TotalCount, nil
}

// getSimple performs a non-paginated GET request
func (c *SiakaduClient) getSimple(endpoint string, params url.Values) ([]map[string]interface{}, error) {
	body, err := c.doGet(endpoint, params, false)
	if err != nil {
		return nil, err
	}

	var resp SimpleResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !resp.Success {
		return nil, fmt.Errorf("API error: %s", resp.Message)
	}

	return resp.Payload, nil
}

// ========================================
// Mahasiswa Endpoints
// ========================================

// GetMahasiswa fetches paginated list of mahasiswa
func (c *SiakaduClient) GetMahasiswa(page, pageSize int, idUnit string) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("mahasiswa/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetMahasiswa(page=%d, pageSize=%d, idUnit=%s) -> %d records, total: %d",
		page, pageSize, idUnit, len(data), total)

	return data, total, nil
}

// GetMahasiswaDetail fetches detail of a single mahasiswa by NIM
func (c *SiakaduClient) GetMahasiswaDetail(nim string) (map[string]interface{}, error) {
	params := url.Values{}
	params.Set("nim", nim)

	body, err := c.doGet("mahasiswa/detail", params, false)
	if err != nil {
		return nil, err
	}

	// Detail response has payload as single object
	var resp struct {
		Success bool                   `json:"success"`
		Message string                 `json:"message"`
		Payload map[string]interface{} `json:"payload"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	if !resp.Success {
		return nil, fmt.Errorf("API error: %s", resp.Message)
	}

	return resp.Payload, nil
}

// ========================================
// Pegawai Endpoints
// ========================================

// GetPegawai fetches paginated list of pegawai
func (c *SiakaduClient) GetPegawai(page, pageSize int, idUnit string) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("pegawai/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetPegawai(page=%d, pageSize=%d) -> %d records, total: %d",
		page, pageSize, len(data), total)

	return data, total, nil
}

// ========================================
// Kelas Endpoints
// ========================================

// GetKelas fetches paginated list of kelas
func (c *SiakaduClient) GetKelas(idSemester, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idSemester != "" {
		params.Set("id_semester", idSemester)
	}
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("kelas/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetKelas(semester=%s, unit=%s) -> %d records, total: %d",
		idSemester, idUnit, len(data), total)

	return data, total, nil
}

// ========================================
// KRS Endpoints
// ========================================

// GetKRS fetches paginated list of KRS
func (c *SiakaduClient) GetKRS(idSemester, npm, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idSemester != "" {
		params.Set("id_semester", idSemester)
	}
	if npm != "" {
		params.Set("npm", npm)
	}
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("krs/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetKRS(semester=%s, npm=%s) -> %d records, total: %d",
		idSemester, npm, len(data), total)

	return data, total, nil
}

// ========================================
// KHS Endpoints
// ========================================

// GetKHS fetches paginated list of KHS (nilai per semester)
func (c *SiakaduClient) GetKHS(idSemester, npm string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idSemester != "" {
		params.Set("id_semester", idSemester)
	}
	if npm != "" {
		params.Set("npm", npm)
	}

	data, total, err := c.getPaginated("khs/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetKHS(semester=%s, npm=%s) -> %d records, total: %d",
		idSemester, npm, len(data), total)

	return data, total, nil
}

// ========================================
// Kuliah Endpoints
// ========================================

// GetKuliah fetches paginated list of status kuliah mahasiswa
func (c *SiakaduClient) GetKuliah(idSemester, npm string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idSemester != "" {
		params.Set("id_semester", idSemester)
	}
	if npm != "" {
		params.Set("npm", npm)
	}

	data, total, err := c.getPaginated("kuliah/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetKuliah(semester=%s, npm=%s) -> %d records, total: %d",
		idSemester, npm, len(data), total)

	return data, total, nil
}

// ========================================
// Kurikulum Endpoints
// ========================================

// GetKurikulum fetches paginated list of kurikulum
func (c *SiakaduClient) GetKurikulum(thnKurikulum int, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if thnKurikulum > 0 {
		params.Set("thn_kurikulum", strconv.Itoa(thnKurikulum))
	}
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("kurikulum/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetKurikulum(thn=%d, unit=%s) -> %d records, total: %d",
		thnKurikulum, idUnit, len(data), total)

	return data, total, nil
}

// ========================================
// Mata Kuliah Endpoints
// ========================================

// GetMataKuliah fetches paginated list of mata kuliah
func (c *SiakaduClient) GetMataKuliah(thnKurikulum int, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if thnKurikulum > 0 {
		params.Set("thn_kurikulum", strconv.Itoa(thnKurikulum))
	}
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("matakuliah/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetMataKuliah(thn=%d, unit=%s) -> %d records, total: %d",
		thnKurikulum, idUnit, len(data), total)

	return data, total, nil
}

// ========================================
// Transkrip Endpoints
// ========================================

// GetTranskrip fetches paginated list of transkrip
func (c *SiakaduClient) GetTranskrip(npm string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if npm != "" {
		params.Set("npm", npm)
	}

	data, total, err := c.getPaginated("transkrip/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetTranskrip(npm=%s) -> %d records, total: %d",
		npm, len(data), total)

	return data, total, nil
}

// ========================================
// Jadwal Kuliah Endpoints
// ========================================

// GetJadwalKuliah fetches paginated list of jadwal kuliah
func (c *SiakaduClient) GetJadwalKuliah(idSemester, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idSemester != "" {
		params.Set("id_semester", idSemester)
	}
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("kelas/jadwal_kuliah/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetJadwalKuliah(semester=%s, unit=%s) -> %d records, total: %d",
		idSemester, idUnit, len(data), total)

	return data, total, nil
}

// ========================================
// Presensi Endpoints
// ========================================

// GetPresensi fetches paginated list of presensi
func (c *SiakaduClient) GetPresensi(idSemester, idKelas string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idSemester != "" {
		params.Set("id_semester", idSemester)
	}
	if idKelas != "" {
		params.Set("id_kelas", idKelas)
	}

	data, total, err := c.getPaginated("presensi/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetPresensi(semester=%s, kelas=%s) -> %d records, total: %d",
		idSemester, idKelas, len(data), total)

	return data, total, nil
}

// ========================================
// Keuangan Endpoints
// ========================================

// GetKeuangan fetches paginated list of pembayaran keuangan
func (c *SiakaduClient) GetKeuangan(nim, idPeriode string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if nim != "" {
		params.Set("nim", nim)
	}
	if idPeriode != "" {
		params.Set("id_periode", idPeriode)
	}

	data, total, err := c.getPaginated("keuangan/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetKeuangan(nim=%s, periode=%s) -> %d records, total: %d",
		nim, idPeriode, len(data), total)

	return data, total, nil
}

// ========================================
// Wisuda Endpoints
// ========================================

// GetWisudaPeriode fetches list of wisuda periode (non-paginated)
func (c *SiakaduClient) GetWisudaPeriode() ([]map[string]interface{}, error) {
	data, err := c.getSimple("wisuda/periode/list", nil)
	if err != nil {
		return nil, err
	}

	log.Printf("📊 [SIAKADU API] GetWisudaPeriode() -> %d records", len(data))
	return data, nil
}

// GetWisudaPeserta fetches paginated list of wisuda peserta
func (c *SiakaduClient) GetWisudaPeserta(idPeriode, idUnit string, page, pageSize int) ([]map[string]interface{}, int, error) {
	params := url.Values{}
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))
	if idPeriode != "" {
		params.Set("id_periode_wisuda", idPeriode)
	}
	if idUnit != "" {
		params.Set("id_unit", idUnit)
	}

	data, total, err := c.getPaginated("wisuda/peserta/list", params)
	if err != nil {
		return nil, 0, err
	}

	log.Printf("📊 [SIAKADU API] GetWisudaPeserta(periode=%s, unit=%s) -> %d records, total: %d",
		idPeriode, idUnit, len(data), total)

	return data, total, nil
}

// ========================================
// Referensi Endpoints
// ========================================

// GetReferensi fetches referensi data by type (generic for all ref endpoints)
// refType examples: tahun_kurikulum, tahun_ajaran, unit, jenjang_didik, agama, etc.
func (c *SiakaduClient) GetReferensi(refType string) ([]map[string]interface{}, error) {
	endpoint := "referensi/" + refType + "/list"

	data, err := c.getSimple(endpoint, nil)
	if err != nil {
		return nil, err
	}

	log.Printf("📊 [SIAKADU API] GetReferensi(%s) -> %d records", refType, len(data))
	return data, nil
}

// ========================================
// Utility Methods
// ========================================

// TestConnection tests the connection to SIAKADU API
func (c *SiakaduClient) TestConnection() error {
	return c.Login()
}

// ForceRefreshToken clears current token and gets new one
func (c *SiakaduClient) ForceRefreshToken() error {
	c.mu.Lock()
	c.Token = ""
	c.mu.Unlock()
	return c.Login()
}
