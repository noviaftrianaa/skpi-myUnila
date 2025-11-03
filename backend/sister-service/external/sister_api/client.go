package sister_api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sister-service/internal/config"
	"time"
)

// Client handles Sister API requests
type Client struct {
	BaseURL    string
	IDPengguna string
	Username   string
	Password   string
	Token      string // JWT token received from login (cached)
	HTTPClient *http.Client
}

// NewClient creates a new Sister API client
func NewClient(cfg config.SisterAPIConfig) *Client {
	return &Client{
		BaseURL:    cfg.BaseURL,
		IDPengguna: cfg.IDPengguna,
		Username:   cfg.Username,
		Password:   cfg.Password,
		HTTPClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// ErrorResponse represents Sister API error response
type ErrorResponse struct {
	Message string `json:"message"`
	Detail  string `json:"detail"`
}

// LoginResponse represents Sister API login response
type LoginResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}

// EnsureAuthenticated ensures client has valid token, login if needed
func (c *Client) EnsureAuthenticated() error {
	// If already have token, assume it's valid
	if c.Token != "" {
		return nil
	}

	log.Printf("🔐 Authenticating to Sister API...")
	log.Printf("   Base URL: %s", c.BaseURL)
	log.Printf("   Username: %s", c.Username)
	log.Printf("   ID Pengguna: %s", c.IDPengguna)

	// Need to login
	payload := map[string]string{
		"username":    c.Username,
		"password":    c.Password,
		"id_pengguna": c.IDPengguna,
	}

	// Login to Sister API
	body, err := c.Post("/1.0/authorize", payload)
	if err != nil {
		log.Printf("❌ Sister API authentication failed: %v", err)
		return fmt.Errorf("failed to authenticate with Sister API: %w", err)
	}

	// Parse response
	var loginResp LoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		log.Printf("❌ Failed to parse Sister API login response: %v", err)
		return fmt.Errorf("failed to parse login response: %w", err)
	}

	// Validate response
	if loginResp.Token == "" {
		log.Printf("❌ Sister API returned empty token")
		return fmt.Errorf("Sister API returned empty token")
	}

	// Store token for future requests
	c.Token = loginResp.Token
	log.Printf("✅ Sister API authentication successful!")
	log.Printf("   Token: %s...", c.Token[:50]) // Show first 50 chars

	return nil
}

// ForceRefreshToken forces a token refresh by clearing the cached token and re-authenticating
// This is useful for scheduled jobs to ensure they always use a fresh token
func (c *Client) ForceRefreshToken() error {
	log.Println("🔄 Forcing token refresh for scheduled sync...")
	c.Token = "" // Clear cached token
	return c.EnsureAuthenticated()
}

// Get performs GET request to Sister API with automatic retry for transient errors
func (c *Client) Get(endpoint string) ([]byte, error) {
	return c.GetWithRetry(endpoint, 3) // Default 3 retries
}

// GetWithRetry performs GET request with configurable retry for 429, 503 errors
func (c *Client) GetWithRetry(endpoint string, maxRetries int) ([]byte, error) {
	var lastErr error

	for attempt := 0; attempt <= maxRetries; attempt++ {
		// Ensure we have valid authentication token
		if err := c.EnsureAuthenticated(); err != nil {
			return nil, err
		}

		url := fmt.Sprintf("%s%s", c.BaseURL, endpoint)

		req, err := http.NewRequest("GET", url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}

		// Set headers - Sister API uses Bearer token
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")

		// Execute request
		resp, err := c.HTTPClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("failed to execute request: %w", err)
			if attempt < maxRetries {
				waitTime := time.Duration(attempt+1) * 2 * time.Second
				log.Printf("⚠️  Request failed (attempt %d/%d), retrying in %v...", attempt+1, maxRetries+1, waitTime)
				time.Sleep(waitTime)
				continue
			}
			return nil, lastErr
		}
		defer resp.Body.Close()

		// Read response body
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read response: %w", err)
		}

		// Check HTTP status
		if resp.StatusCode != http.StatusOK {
			// Handle 429 (Rate Limit) with retry
			if resp.StatusCode == http.StatusTooManyRequests && attempt < maxRetries {
				waitTime := time.Duration(attempt+1) * 3 * time.Second // Longer wait for rate limit
				log.Printf("⚠️  Sister API rate limit (429) hit (attempt %d/%d), retrying in %v...", attempt+1, maxRetries+1, waitTime)
				time.Sleep(waitTime)
				lastErr = fmt.Errorf("API returned status 429 (rate limit): %s", string(body))
				continue
			}

			// Handle 502 (Bad Gateway) with retry
			if resp.StatusCode == http.StatusBadGateway && attempt < maxRetries {
				waitTime := time.Duration(attempt+1) * 2 * time.Second
				log.Printf("⚠️  Sister API bad gateway (502) (attempt %d/%d), retrying in %v...", attempt+1, maxRetries+1, waitTime)
				time.Sleep(waitTime)
				lastErr = fmt.Errorf("API returned status 502 (bad gateway): %s", string(body))
				continue
			}

			// Handle 503 (Service Unavailable) with retry
			if resp.StatusCode == http.StatusServiceUnavailable && attempt < maxRetries {
				waitTime := time.Duration(attempt+1) * 2 * time.Second
				log.Printf("⚠️  Sister API unavailable (503) (attempt %d/%d), retrying in %v...", attempt+1, maxRetries+1, waitTime)
				time.Sleep(waitTime)
				lastErr = fmt.Errorf("API returned status 503: %s", string(body))
				continue
			}

			// Try to parse error response
			var errResp ErrorResponse
			if err := json.Unmarshal(body, &errResp); err == nil {
				// If token expired, try to re-authenticate once
				if errResp.Message == "Token expired" || errResp.Detail == "Token expired" {
					log.Printf("⚠️  Sister API token expired, re-authenticating...")
					c.Token = "" // Clear expired token

					// Retry with new token
					if err := c.EnsureAuthenticated(); err != nil {
						return nil, fmt.Errorf("failed to re-authenticate: %w", err)
					}

					// Retry the request with new token
					req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
					resp2, err := c.HTTPClient.Do(req)
					if err != nil {
						return nil, fmt.Errorf("failed to retry request: %w", err)
					}
					defer resp2.Body.Close()

					body2, err := io.ReadAll(resp2.Body)
					if err != nil {
						return nil, fmt.Errorf("failed to read retry response: %w", err)
					}

					if resp2.StatusCode != http.StatusOK {
						return nil, fmt.Errorf("retry failed with status %d: %s", resp2.StatusCode, string(body2))
					}

					log.Printf("✅ Successfully re-authenticated and retried request")
					return body2, nil
				}

				return nil, fmt.Errorf("Sister API error: %s - %s", errResp.Message, errResp.Detail)
			}
			return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
		}

		// Sister API returns direct array/object, not wrapped
		return body, nil
	}

	return nil, fmt.Errorf("max retries exceeded: %w", lastErr)
}

// Post performs POST request to Sister API
func (c *Client) Post(endpoint string, payload interface{}) ([]byte, error) {
	url := fmt.Sprintf("%s%s", c.BaseURL, endpoint)

	// Marshal payload to JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers - Sister API uses Bearer token for most endpoints
	// But login endpoint might not require it
	if c.Token != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	// Execute request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check HTTP status
	if resp.StatusCode != http.StatusOK {
		// Try to parse error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			return nil, fmt.Errorf("Sister API error: %s - %s", errResp.Message, errResp.Detail)
		}
		return nil, fmt.Errorf("API returned status %d: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

// ==================== REFERENSI ENDPOINTS ====================

// GetReferensiAgama fetches list of religions from Sister API
func (c *Client) GetReferensiAgama() ([]byte, error) {
	return c.Get("/1.0/referensi/agama")
}

// GetReferensiNegara fetches list of countries from Sister API
func (c *Client) GetReferensiNegara() ([]byte, error) {
	return c.Get("/1.0/referensi/negara")
}

// GetReferensiJenjangPendidikan fetches list of education levels from Sister API
func (c *Client) GetReferensiJenjangPendidikan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenjang_pendidikan")
}

// GetReferensiGelarAkademik fetches list of academic titles from Sister API
func (c *Client) GetReferensiGelarAkademik() ([]byte, error) {
	return c.Get("/1.0/referensi/gelar_akademik")
}

// GetReferensiSemester fetches list of semesters from Sister API
func (c *Client) GetReferensiSemester() ([]byte, error) {
	return c.Get("/1.0/referensi/semester")
}

// ==================== NEW REFERENSI ENDPOINTS (29 METHODS) ====================

func (c *Client) GetReferensiBidangStudi() ([]byte, error) {
	return c.Get("/1.0/referensi/bidang_studi")
}

func (c *Client) GetReferensiBidangUsaha() ([]byte, error) {
	return c.Get("/1.0/referensi/bidang_usaha")
}

func (c *Client) GetReferensiJabatanFungsional() ([]byte, error) {
	return c.Get("/1.0/referensi/jabatan_fungsional")
}

func (c *Client) GetReferensiJabatanTugasTambahan() ([]byte, error) {
	return c.Get("/1.0/referensi/jabatan_tugas_tambahan")
}

func (c *Client) GetReferensiJenisBahanAjar() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_bahan_ajar")
}

func (c *Client) GetReferensiJenisBeasiswa() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_beasiswa")
}

func (c *Client) GetReferensiJenisDiklat() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_diklat")
}

func (c *Client) GetReferensiJenisDokumen() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_dokumen")
}

func (c *Client) GetReferensiJenisKeluar() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_keluar")
}

func (c *Client) GetReferensiJenisKepanitiaan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_kepanitiaan")
}

func (c *Client) GetReferensiJenisKesejahteraan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_kesejahteraan")
}

func (c *Client) GetReferensiJenisPublikasi() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_publikasi")
}

func (c *Client) GetReferensiJenisTes() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_tes")
}

func (c *Client) GetReferensiJenisTunjangan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_tunjangan")
}

func (c *Client) GetReferensiMediaPublikasi() ([]byte, error) {
	return c.Get("/1.0/referensi/media_publikasi")
}

func (c *Client) GetReferensiSkimKegiatan() ([]byte, error) {
	return c.Get("/1.0/referensi/skim_kegiatan")
}

func (c *Client) GetReferensiStatusKepegawaian() ([]byte, error) {
	return c.Get("/1.0/referensi/status_kepegawaian")
}

func (c *Client) GetReferensiSumberGaji() ([]byte, error) {
	return c.Get("/1.0/referensi/sumber_gaji")
}

func (c *Client) GetReferensiTingkatPenghargaan() ([]byte, error) {
	return c.Get("/1.0/referensi/tingkat_penghargaan")
}

// GetReferensiWilayah fetches wilayah data with required id_level_wilayah parameter
// id_level_wilayah: 0=Negara, 1=Provinsi, 2=Kota/Kabupaten, 3=Kecamatan
func (c *Client) GetReferensiWilayah(idLevelWilayah int) ([]byte, error) {
	return c.Get(fmt.Sprintf("/1.0/referensi/wilayah?id_level_wilayah=%d", idLevelWilayah))
}

func (c *Client) GetReferensiKategoriCapaianLuaran() ([]byte, error) {
	return c.Get("/1.0/referensi/kategori_capaian_luaran")
}

// GetReferensiKategoriKegiatan fetches kategori_kegiatan with required parameters
// tipe: "list" or "tree"
// menu: anggota_profesi, bahan_ajar, detasering, diklat, kekayaan_intelektual, jabatan_struktural,
//       orasi_ilmiah, penelitian, pembicara, pengabdian, pengelola_jurnal, penghargaan,
//       penunjang_lain, publikasi, tugas_tambahan, visiting_scientist
func (c *Client) GetReferensiKategoriKegiatan(tipe, menu string) ([]byte, error) {
	return c.Get(fmt.Sprintf("/1.0/referensi/kategori_kegiatan?tipe=%s&menu=%s", tipe, menu))
}

// GetReferensiKelompokBidang fetches kelompok_bidang with required iptek parameter
// iptek: true for iptek fields, false for non-iptek
func (c *Client) GetReferensiKelompokBidang(iptek bool) ([]byte, error) {
	iptekStr := "false"
	if iptek {
		iptekStr = "true"
	}
	return c.Get(fmt.Sprintf("/1.0/referensi/kelompok_bidang?iptek=%s", iptekStr))
}

func (c *Client) GetReferensiLembagaSertifikasi() ([]byte, error) {
	return c.Get("/1.0/referensi/lembaga_sertifikasi")
}

func (c *Client) GetReferensiGolonganPangkat() ([]byte, error) {
	return c.Get("/1.0/referensi/golongan_pangkat")
}

func (c *Client) GetReferensiIkatanKerja() ([]byte, error) {
	return c.Get("/1.0/referensi/ikatan_kerja")
}

func (c *Client) GetReferensiJenisPenghargaan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_penghargaan")
}

func (c *Client) GetReferensiJenisPekerjaan() ([]byte, error) {
	return c.Get("/1.0/referensi/jenis_pekerjaan")
}

func (c *Client) GetReferensiBidangPekerjaan() ([]byte, error) {
	return c.Get("/1.0/referensi/bidang_pekerjaan")
}

// GetReferensiUnitKerja fetches unit kerja list from Sister API
// id_perguruan_tinggi is required parameter
func (c *Client) GetReferensiUnitKerja(idPerguruanTinggi string) ([]byte, error) {
	return c.Get(fmt.Sprintf("/1.0/referensi/unit_kerja?id_perguruan_tinggi=%s", idPerguruanTinggi))
}

// GetReferensiDetailUnitKerja fetches unit kerja detail from Sister API
// id_unit_kerja is required parameter
func (c *Client) GetReferensiDetailUnitKerja(idUnitKerja string) ([]byte, error) {
	return c.Get(fmt.Sprintf("/1.0/referensi/detail_unit_kerja?id_unit_kerja=%s", idUnitKerja))
}

// GetDosenPhoto fetches dosen photo binary from Sister API
// Returns photo bytes, content type, and error
func (c *Client) GetDosenPhoto(idSdm string) ([]byte, string, error) {
	// Ensure we have valid authentication token
	if err := c.EnsureAuthenticated(); err != nil {
		return nil, "", err
	}

	url := fmt.Sprintf("%s/1.0/data_pribadi/foto/%s", c.BaseURL, idSdm)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers - Sister API uses Bearer token
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	// Don't set Accept header to allow binary response

	log.Printf("🖼️  Fetching dosen photo from Sister API: %s", url)

	// Execute request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read response: %w", err)
	}

	// Check HTTP status
	if resp.StatusCode == http.StatusNotFound {
		return nil, "", fmt.Errorf("photo not found")
	}

	if resp.StatusCode != http.StatusOK {
		// Check if token expired
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			if errResp.Message == "Token expired" || errResp.Detail == "Token expired" {
				log.Printf("⚠️  Sister API token expired, re-authenticating...")
				c.Token = "" // Clear expired token

				// Retry with new token
				if err := c.EnsureAuthenticated(); err != nil {
					return nil, "", fmt.Errorf("failed to re-authenticate: %w", err)
				}

				// Retry the request with new token
				req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
				resp2, err := c.HTTPClient.Do(req)
				if err != nil {
					return nil, "", fmt.Errorf("failed to retry request: %w", err)
				}
				defer resp2.Body.Close()

				body2, err := io.ReadAll(resp2.Body)
				if err != nil {
					return nil, "", fmt.Errorf("failed to read retry response: %w", err)
				}

				if resp2.StatusCode == http.StatusNotFound {
					return nil, "", fmt.Errorf("photo not found")
				}

				if resp2.StatusCode != http.StatusOK {
					return nil, "", fmt.Errorf("retry failed with status %d", resp2.StatusCode)
				}

				contentType := resp2.Header.Get("Content-Type")
				if contentType == "" {
					contentType = "image/jpeg" // Default to JPEG
				}

				log.Printf("✅ Successfully fetched dosen photo (after retry): %d bytes, type: %s", len(body2), contentType)
				return body2, contentType, nil
			}

			return nil, "", fmt.Errorf("Sister API error: %s - %s", errResp.Message, errResp.Detail)
		}
		return nil, "", fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	// Get content type from response headers
	contentType := resp.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "image/jpeg" // Default to JPEG if not specified
	}

	log.Printf("✅ Successfully fetched dosen photo: %d bytes, type: %s", len(body), contentType)
	return body, contentType, nil
}

// GetDosenBidangIlmu fetches bidang keahlian for a dosen from Sister API
func (c *Client) GetDosenBidangIlmu(idSdm string) ([]map[string]interface{}, error) {
	// Ensure we have valid token
	if err := c.EnsureAuthenticated(); err != nil {
		return nil, fmt.Errorf("authentication failed: %w", err)
	}

	// Build the endpoint URL
	endpoint := fmt.Sprintf("%s/1.0/data_pribadi/bidang_ilmu/%s", c.BaseURL, idSdm)
	log.Printf("🌐 Fetching bidang ilmu from: %s", endpoint)

	// Create the request
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// DEBUG: Log raw response
	log.Printf("🔍 Raw SISTER API response for bidang_ilmu: %s", string(body))

	// Handle different status codes
	if resp.StatusCode == http.StatusNotFound {
		return []map[string]interface{}{}, nil // Return empty array for 404
	}

	if resp.StatusCode != http.StatusOK {
		// Try to parse error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil {
			// If 401, token might be expired, try to re-authenticate once
			if resp.StatusCode == http.StatusUnauthorized {
				log.Printf("⚠️ Token expired, re-authenticating...")
				c.Token = "" // Clear token to force re-auth

				// Retry with new token
				if err := c.EnsureAuthenticated(); err != nil {
					return nil, fmt.Errorf("failed to re-authenticate: %w", err)
				}

				// Retry the request with new token
				req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.Token))
				resp2, err := c.HTTPClient.Do(req)
				if err != nil {
					return nil, fmt.Errorf("failed to retry request: %w", err)
				}
				defer resp2.Body.Close()

				body2, err := io.ReadAll(resp2.Body)
				if err != nil {
					return nil, fmt.Errorf("failed to read retry response: %w", err)
				}

				if resp2.StatusCode == http.StatusNotFound {
					return []map[string]interface{}{}, nil
				}

				if resp2.StatusCode != http.StatusOK {
					return nil, fmt.Errorf("retry failed with status %d", resp2.StatusCode)
				}

				// Parse successful retry response
				var result []map[string]interface{}
				if err := json.Unmarshal(body2, &result); err != nil {
					return nil, fmt.Errorf("failed to parse retry response: %w", err)
				}

				log.Printf("✅ Successfully fetched bidang ilmu (after retry): %d items", len(result))
				return result, nil
			}

			return nil, fmt.Errorf("Sister API error: %s - %s", errResp.Message, errResp.Detail)
		}
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	// Parse successful response
	var result []map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	log.Printf("✅ Successfully fetched bidang ilmu: %d items", len(result))
	return result, nil
}

// ==================== DOSEN ENDPOINTS ====================

// GetReferensiSDM fetches list of SDM from Sister API with id_sp filter
func (c *Client) GetReferensiSDM(idSP string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/referensi/sdm?id_sp=%s", idSP)
	return c.Get(endpoint)
}

// GetDosenProfil fetches dosen profil data from Sister API
func (c *Client) GetDosenProfil(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/data_pribadi/profil/%s", idSDM)
	return c.Get(endpoint)
}

// GetDosenKependudukan fetches dosen kependudukan data from Sister API
func (c *Client) GetDosenKependudukan(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/data_pribadi/kependudukan/%s", idSDM)
	return c.Get(endpoint)
}

// GetDosenKeluarga fetches dosen keluarga data from Sister API
func (c *Client) GetDosenKeluarga(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/data_pribadi/keluarga/%s", idSDM)
	return c.Get(endpoint)
}

// GetDosenAlamat fetches dosen alamat data from Sister API
func (c *Client) GetDosenAlamat(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/data_pribadi/alamat/%s", idSDM)
	return c.Get(endpoint)
}

// GetDosenKepegawaian fetches dosen kepegawaian data from Sister API
func (c *Client) GetDosenKepegawaian(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/data_pribadi/kepegawaian/%s", idSDM)
	return c.Get(endpoint)
}

// GetDosenLain fetches dosen data lain from Sister API
func (c *Client) GetDosenLain(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/data_pribadi/lain/%s", idSDM)
	return c.Get(endpoint)
}

// ==================== PENUGASAN ENDPOINTS ====================

// GetPenugasanByIDSDM fetches list of penugasan for a dosen from Sister API
// Endpoint: GET /1.0/penugasan?id_sdm={id_sdm}
func (c *Client) GetPenugasanByIDSDM(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/penugasan?id_sdm=%s", idSDM)
	return c.Get(endpoint)
}

// GetPenugasanDetail fetches detail of a single penugasan from Sister API
// Endpoint: GET /1.0/penugasan/{id}
func (c *Client) GetPenugasanDetail(idPenugasan string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/penugasan/%s", idPenugasan)
	return c.Get(endpoint)
}

// ==================== PENELITIAN ENDPOINTS ====================

// GetPenelitianByIDSDM fetches list of penelitian for a dosen from Sister API
// Endpoint: GET /1.0/penelitian?id_sdm={id_sdm}
func (c *Client) GetPenelitianByIDSDM(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/penelitian?id_sdm=%s", idSDM)
	return c.Get(endpoint)
}

// GetPenelitianDetail fetches detail of a single penelitian from Sister API
// Endpoint: GET /1.0/penelitian/{id}
func (c *Client) GetPenelitianDetail(idPenelitian string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/penelitian/%s", idPenelitian)
	return c.Get(endpoint)
}

// ==================== PENGABDIAN ENDPOINTS ====================

// GetPengabdianByIDSDM fetches list of pengabdian for a dosen from Sister API
// Endpoint: GET /1.0/pengabdian?id_sdm={id_sdm}
func (c *Client) GetPengabdianByIDSDM(idSDM string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/pengabdian?id_sdm=%s", idSDM)
	return c.Get(endpoint)
}

// GetPengabdianDetail fetches detail of a single pengabdian from Sister API
// Endpoint: GET /1.0/pengabdian/{id}
func (c *Client) GetPengabdianDetail(idPengabdian string) ([]byte, error) {
	endpoint := fmt.Sprintf("/1.0/pengabdian/%s", idPengabdian)
	return c.Get(endpoint)
}
