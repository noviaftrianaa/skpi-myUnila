package simpedam

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/myunila/keuangan-service/apps/api_config"
	"github.com/myunila/keuangan-service/internal/config"
	"golang.org/x/net/html/charset"
)

// Client represents SIMPEDAM SOAP API client
type Client struct {
	endpoint   string
	username   string
	password   string
	token      string
	tokenTime  time.Time
	httpClient *http.Client
	mu         sync.RWMutex
}

const (
	// Token expires after 1 hour, refresh at 50 minutes
	TokenExpiryDuration = 50 * time.Minute
	// HTTP timeout
	HTTPTimeout = 300 * time.Second
)

// NewClient creates a new SIMPEDAM SOAP client
func NewClient() (*Client, error) {
	cfg := config.Cfg.SimpedamAPI

	// Default values from environment/config
	endpoint := cfg.Endpoint
	username := cfg.Username
	password := cfg.Password

	// Try to get credentials from database first
	credentials, err := api_config.GetAPICredentials("SIMPEDAM")
	if err == nil && credentials != nil {
		log.Println("🔐 [SIMPEDAM] Using credentials from database")
		if user, ok := credentials["username"].(string); ok && user != "" {
			username = user
		}
		if pass, ok := credentials["password"].(string); ok && pass != "" {
			password = pass
		}
	} else {
		log.Printf("🔑 [SIMPEDAM] Using credentials from environment (.env): %v", err)
	}

	if endpoint == "" {
		return nil, fmt.Errorf("SIMPEDAM endpoint not configured")
	}

	if username == "" || password == "" {
		return nil, fmt.Errorf("SIMPEDAM credentials not configured (username or password is empty)")
	}

	// Skip SSL verification (SIMPEDAM uses self-signed cert)
	tr := &http.Transport{
		TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
	}

	client := &Client{
		endpoint: endpoint,
		username: username,
		password: password,
		httpClient: &http.Client{
			Transport: tr,
			Timeout:   HTTPTimeout,
		},
	}

	log.Printf("🌐 [SIMPEDAM] Client initialized - Endpoint: %s, Username: %s", endpoint, username)
	return client, nil
}

// TestConnection tests the API connection by getting a token
func (c *Client) TestConnection() error {
	_, err := c.ensureToken()
	return err
}

// ensureToken ensures we have a valid token, refreshing if necessary
func (c *Client) ensureToken() (string, error) {
	c.mu.RLock()
	if c.token != "" && time.Since(c.tokenTime) < TokenExpiryDuration {
		token := c.token
		c.mu.RUnlock()
		return token, nil
	}
	c.mu.RUnlock()

	// Need to refresh token
	return c.refreshToken()
}

// refreshToken gets a new token from SIMPEDAM
func (c *Client) refreshToken() (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	// Double-check in case another goroutine already refreshed
	if c.token != "" && time.Since(c.tokenTime) < TokenExpiryDuration {
		return c.token, nil
	}

	log.Println("🔑 [SIMPEDAM] Refreshing token...")

	soapEnvelope := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="urn:live2unila">
    <soap:Body>
        <tns:GetToken>
            <user xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</user>
            <password xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</password>
        </tns:GetToken>
    </soap:Body>
</soap:Envelope>`, c.username, c.password)

	respBody, err := c.doSoapRequest("GetToken", soapEnvelope)
	if err != nil {
		return "", fmt.Errorf("failed to get token: %w", err)
	}

	// Parse XML response with charset support
	var envelope SoapEnvelope
	if err := unmarshalXML(respBody, &envelope); err != nil {
		return "", fmt.Errorf("failed to parse token response: %w", err)
	}

	if envelope.Body.Fault != nil {
		return "", fmt.Errorf("SOAP fault: %s", envelope.Body.Fault.FaultString)
	}

	if envelope.Body.GetTokenResponse == nil {
		return "", fmt.Errorf("no token in response")
	}

	c.token = envelope.Body.GetTokenResponse.Return
	c.tokenTime = time.Now()

	log.Println("✅ [SIMPEDAM] Token refreshed successfully")
	return c.token, nil
}

// ForceRefreshToken forces a token refresh
func (c *Client) ForceRefreshToken() (string, error) {
	c.mu.Lock()
	c.token = ""
	c.mu.Unlock()
	return c.refreshToken()
}

// doSoapRequest performs a SOAP request
func (c *Client) doSoapRequest(action string, envelope string) ([]byte, error) {
	req, err := http.NewRequest("POST", c.endpoint, bytes.NewBufferString(envelope))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "text/xml; charset=utf-8")
	req.Header.Set("SOAPAction", fmt.Sprintf("urn:live2unila#%s", action))

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	return body, nil
}

// GetDaftarUKT fetches UKT class list from SIMPEDAM
func (c *Client) GetDaftarUKT(filter string, order string, limit, offset int) ([]DaftarUKTItem, error) {
	token, err := c.ensureToken()
	if err != nil {
		return nil, err
	}

	soapEnvelope := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="urn:live2unila">
    <soap:Body>
        <tns:DaftarUKT>
            <token xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</token>
            <filter xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</filter>
            <order xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</order>
            <limit xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%d</limit>
            <offset xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%d</offset>
        </tns:DaftarUKT>
    </soap:Body>
</soap:Envelope>`, token, filter, order, limit, offset)

	respBody, err := c.doSoapRequest("DaftarUKT", soapEnvelope)
	if err != nil {
		// Check if token expired
		if c.isTokenError(err) {
			log.Println("⚠️  [SIMPEDAM] Token expired, refreshing...")
			if _, err := c.ForceRefreshToken(); err != nil {
				return nil, fmt.Errorf("failed to refresh token: %w", err)
			}
			return c.GetDaftarUKT(filter, order, limit, offset)
		}
		return nil, err
	}

	// Parse XML response with charset support
	var envelope SoapEnvelope
	if err := unmarshalXML(respBody, &envelope); err != nil {
		return nil, fmt.Errorf("failed to parse DaftarUKT response: %w", err)
	}

	if envelope.Body.Fault != nil {
		return nil, fmt.Errorf("SOAP fault: %s", envelope.Body.Fault.FaultString)
	}

	if envelope.Body.DaftarUKTResponse == nil {
		log.Printf("⚠️  [SIMPEDAM] DaftarUKT response is nil, raw response: %.500s", string(respBody))
		return nil, fmt.Errorf("no data in response")
	}

	// Handle empty return
	returnData := envelope.Body.DaftarUKTResponse.Return
	log.Printf("📦 [SIMPEDAM] DaftarUKT return data length: %d chars", len(returnData))
	if returnData == "" || returnData == "null" || returnData == "[]" {
		log.Printf("📭 [SIMPEDAM] DaftarUKT returned empty data")
		return []DaftarUKTItem{}, nil
	}

	// The return field contains JSON array
	var items []DaftarUKTItem
	if err := json.Unmarshal([]byte(returnData), &items); err != nil {
		log.Printf("❌ [SIMPEDAM] Failed to parse JSON: %s (data: %.100s...)", err.Error(), returnData)
		return nil, fmt.Errorf("failed to parse JSON data: %w", err)
	}

	return items, nil
}

// GetMasterBiayaMahasiswa fetches student payment data from SIMPEDAM
func (c *Client) GetMasterBiayaMahasiswa(filter string, order string, limit, offset int) ([]MasterBiayaMahasiswaItem, error) {
	token, err := c.ensureToken()
	if err != nil {
		return nil, err
	}

	soapEnvelope := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="urn:live2unila">
    <soap:Body>
        <tns:MasterBiayaMahasiswa>
            <token xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</token>
            <filter xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</filter>
            <order xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</order>
            <limit xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%d</limit>
            <offset xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%d</offset>
        </tns:MasterBiayaMahasiswa>
    </soap:Body>
</soap:Envelope>`, token, filter, order, limit, offset)

	respBody, err := c.doSoapRequest("MasterBiayaMahasiswa", soapEnvelope)
	if err != nil {
		// Check if token expired
		if c.isTokenError(err) {
			log.Println("⚠️  [SIMPEDAM] Token expired, refreshing...")
			if _, err := c.ForceRefreshToken(); err != nil {
				return nil, fmt.Errorf("failed to refresh token: %w", err)
			}
			return c.GetMasterBiayaMahasiswa(filter, order, limit, offset)
		}
		return nil, err
	}

	// Parse XML response with charset support
	var envelope SoapEnvelope
	if err := unmarshalXML(respBody, &envelope); err != nil {
		return nil, fmt.Errorf("failed to parse MasterBiayaMahasiswa response: %w", err)
	}

	if envelope.Body.Fault != nil {
		return nil, fmt.Errorf("SOAP fault: %s", envelope.Body.Fault.FaultString)
	}

	if envelope.Body.MasterBiayaMahasiswaResponse == nil {
		return nil, fmt.Errorf("no data in response")
	}

	// Handle empty return
	returnData := envelope.Body.MasterBiayaMahasiswaResponse.Return
	if returnData == "" || returnData == "null" || returnData == "[]" {
		log.Printf("📭 [SIMPEDAM] MasterBiayaMahasiswa returned empty data")
		return []MasterBiayaMahasiswaItem{}, nil
	}

	// The return field contains JSON array
	var items []MasterBiayaMahasiswaItem
	if err := json.Unmarshal([]byte(returnData), &items); err != nil {
		log.Printf("❌ [SIMPEDAM] Failed to parse JSON: %s (data: %.100s...)", err.Error(), returnData)
		return nil, fmt.Errorf("failed to parse JSON data: %w", err)
	}

	return items, nil
}

// GetKelasUKT fetches UKT class master from SIMPEDAM
func (c *Client) GetKelasUKT(filter string, order string, limit, offset int) ([]KelasUKTItem, error) {
	token, err := c.ensureToken()
	if err != nil {
		return nil, err
	}

	soapEnvelope := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:tns="urn:live2unila">
    <soap:Body>
        <tns:KelasUKT>
            <token xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</token>
            <filter xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</filter>
            <order xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%s</order>
            <limit xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%d</limit>
            <offset xsi:type="xsd:string" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">%d</offset>
        </tns:KelasUKT>
    </soap:Body>
</soap:Envelope>`, token, filter, order, limit, offset)

	respBody, err := c.doSoapRequest("KelasUKT", soapEnvelope)
	if err != nil {
		// Check if token expired
		if c.isTokenError(err) {
			log.Println("⚠️  [SIMPEDAM] Token expired, refreshing...")
			if _, err := c.ForceRefreshToken(); err != nil {
				return nil, fmt.Errorf("failed to refresh token: %w", err)
			}
			return c.GetKelasUKT(filter, order, limit, offset)
		}
		return nil, err
	}

	// Parse XML response with charset support
	var envelope SoapEnvelope
	if err := unmarshalXML(respBody, &envelope); err != nil {
		return nil, fmt.Errorf("failed to parse KelasUKT response: %w", err)
	}

	if envelope.Body.Fault != nil {
		return nil, fmt.Errorf("SOAP fault: %s", envelope.Body.Fault.FaultString)
	}

	if envelope.Body.KelasUKTResponse == nil {
		return nil, fmt.Errorf("no data in response")
	}

	// Handle empty return
	returnData := envelope.Body.KelasUKTResponse.Return
	if returnData == "" || returnData == "null" || returnData == "[]" {
		log.Printf("📭 [SIMPEDAM] KelasUKT returned empty data")
		return []KelasUKTItem{}, nil
	}

	// The return field contains JSON array
	var items []KelasUKTItem
	if err := json.Unmarshal([]byte(returnData), &items); err != nil {
		log.Printf("❌ [SIMPEDAM] Failed to parse JSON: %s (data: %.100s...)", err.Error(), returnData)
		return nil, fmt.Errorf("failed to parse JSON data: %w", err)
	}

	return items, nil
}

// isTokenError checks if error is related to token expiration
func (c *Client) isTokenError(err error) bool {
	if err == nil {
		return false
	}
	errStr := err.Error()
	return bytes.Contains([]byte(errStr), []byte("token")) ||
		bytes.Contains([]byte(errStr), []byte("Token")) ||
		bytes.Contains([]byte(errStr), []byte("expired")) ||
		bytes.Contains([]byte(errStr), []byte("invalid"))
}

// unmarshalXML parses XML with charset support (handles ISO-8859-1, etc.)
func unmarshalXML(data []byte, v interface{}) error {
	decoder := xml.NewDecoder(bytes.NewReader(data))
	decoder.CharsetReader = charset.NewReaderLabel
	return decoder.Decode(v)
}
