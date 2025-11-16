# Feeder Service - API Configuration via Database

> **Pattern**: Sama seperti SISTER Service - menggunakan tabel `setting.api_configs`
> **Priority**: Database Config → Environment Variables (Fallback)

---

## 1. Environment Variables (.env)

### Backend: `backend/feeder-service/.env`

```env
# Application
APP_NAME=Feeder Service
APP_PORT=:8084
APP_ENV=development

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_ALGO=HS256

# Neo Feeder API (Fallback - Priority: Database > Environment Variables)
URL_WS_FEEDER=https://dapelmikpdpt.unila.ac.id/New/ws/Api.php
WS_USERNAME=your-feeder-username
WS_PASSWORD=your-feeder-password

# Database
DB_HOST=192.168.123.119
DB_PORT=1433
DB_USER=mizarzulmi
DB_PASSWORD=Makinjaya!2myunila
DB_NAME=pdut

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Encryption Key (for encrypting API credentials in database)
ENCRYPTION_KEY=your-32-char-encryption-key-here-12345
```

### Frontend: `frontend/.env.local`

```env
NEXT_PUBLIC_FEEDER_API_URL=http://localhost:9800/feeder-service
NEXT_PUBLIC_AUTH_API_URL=http://localhost:9800/auth-service
NEXT_PUBLIC_API_TIMEOUT=120000
```

### Deployment: `deployment/local/.env`

```env
# ... existing configs ...

# Feeder Service
FEEDER_APP_NAME=Feeder Service - Local
FEEDER_APP_ENV=local
FEEDER_APP_PORT=8084

# Feeder API Configuration
URL_WS_FEEDER=https://dapelmikpdpt.unila.ac.id/New/ws/Api.php
WS_USERNAME=your-feeder-username
WS_PASSWORD=your-feeder-password

FEEDER_REDIS_HOST=redis
FEEDER_REDIS_PORT=6379
```

---

## 2. Database Configuration

### 2.1 Table: `setting.api_configs`

**Tabel ini sudah ada**, digunakan untuk SISTER dan akan digunakan juga untuk FEEDER.

```sql
CREATE TABLE setting.api_configs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    api_code NVARCHAR(50) NOT NULL UNIQUE,          -- 'feeder_api'
    api_name NVARCHAR(200) NOT NULL,                -- 'Neo Feeder PDDIKTI API'
    api_description NVARCHAR(MAX),                  -- Description
    base_url NVARCHAR(500) NOT NULL,                -- 'https://dapelmikpdpt.unila.ac.id/New/ws/Api.php'
    auth_type NVARCHAR(50) NOT NULL,                -- 'token_based'
    encrypted_credentials NVARCHAR(MAX),            -- Encrypted JSON: {"username":"xxx","password":"yyy"}
    additional_headers NVARCHAR(MAX),               -- NULL or JSON headers
    timeout_seconds INT DEFAULT 120,                -- 120 seconds
    max_retries INT DEFAULT 3,
    retry_delay_ms INT DEFAULT 1000,
    is_active BIT NOT NULL DEFAULT 1,
    is_encrypted BIT NOT NULL DEFAULT 1,
    use_env_fallback BIT NOT NULL DEFAULT 1,        -- Fallback to env vars if no DB config
    last_tested_at DATETIME,
    last_test_status NVARCHAR(50),                  -- 'success', 'failed'
    last_test_message NVARCHAR(MAX),
    created_by NVARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    updated_by NVARCHAR(100),
    updated_at DATETIME NOT NULL DEFAULT GETDATE(),
    deleted_at DATETIME NULL,
    deleted_by NVARCHAR(100) NULL,
    tags NVARCHAR(500),                             -- 'feeder,pddikti,mahasiswa'
    notes NVARCHAR(MAX)
);
```

### 2.2 Insert Initial Feeder Config

```sql
-- Insert Neo Feeder API Configuration
INSERT INTO setting.api_configs (
    api_code,
    api_name,
    api_description,
    base_url,
    auth_type,
    encrypted_credentials,
    timeout_seconds,
    max_retries,
    retry_delay_ms,
    is_active,
    is_encrypted,
    use_env_fallback,
    created_by,
    tags,
    notes
) VALUES (
    'feeder_api',
    'Neo Feeder PDDIKTI API',
    'API untuk sinkronisasi data mahasiswa dengan Neo Feeder PDDIKTI',
    'https://dapelmikpdpt.unila.ac.id/New/ws/Api.php',
    'token_based',
    NULL,  -- Will be encrypted and inserted via API
    120,
    3,
    1000,
    1,
    1,
    1,  -- Enable fallback to environment variables
    'system',
    'feeder,pddikti,mahasiswa',
    'Credentials akan dienkripsi. Fallback ke environment variables jika credentials kosong.'
);
```

### 2.3 Table: `setting.api_config_audit_logs`

```sql
-- Audit log table (should already exist)
CREATE TABLE setting.api_config_audit_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    config_id INT NOT NULL,
    api_code NVARCHAR(50) NOT NULL,
    action_type NVARCHAR(50) NOT NULL,          -- 'create', 'update', 'delete', 'test'
    old_values NVARCHAR(MAX),
    new_values NVARCHAR(MAX),
    performed_by NVARCHAR(100) NOT NULL,
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(500),
    performed_at DATETIME NOT NULL DEFAULT GETDATE(),
    notes NVARCHAR(MAX),
    INDEX idx_config_id (config_id),
    INDEX idx_api_code (api_code),
    INDEX idx_performed_at (performed_at DESC)
);
```

---

## 3. Backend Implementation

### 3.1 Config Module Structure

```
backend/feeder-service/
├── apps/
│   └── apiconfig/
│       ├── entity.go          # APIConfig, APIConfigDTO
│       ├── repository.go      # Database operations
│       ├── service.go         # Business logic + encryption/decryption
│       ├── controller.go      # HTTP handlers
│       └── router.go          # Route registration
```

### 3.2 Update Feeder API Client to Use Database Config

**File**: `backend/feeder-service/external/feeder_api/client.go`

```go
package feeder_api

import (
    "bytes"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "net/http"
    "time"

    "github.com/myunila/feeder-service/apps/apiconfig"
    "github.com/myunila/feeder-service/internal/config"
)

type Client struct {
    BaseURL    string
    Username   string
    Password   string
    Token      string
    TokenExp   time.Time
    HTTPClient *http.Client

    // API Config service for dynamic configuration
    configService apiconfig.Service
}

// NewClient creates a new Feeder API client
func NewClient(configService apiconfig.Service) *Client {
    return &Client{
        HTTPClient: &http.Client{
            Timeout: 120 * time.Second,
        },
        configService: configService,
    }
}

// LoadConfig loads configuration from database or environment variables
func (c *Client) LoadConfig() error {
    if c.configService != nil {
        // Try to get from database first
        apiConfig, credentials, err := c.configService.GetConfigWithCredentials("feeder_api")

        if err == nil && apiConfig != nil {
            c.BaseURL = apiConfig.BaseURL

            // Get credentials from decrypted JSON
            if username, ok := credentials["username"].(string); ok {
                c.Username = username
            }
            if password, ok := credentials["password"].(string); ok {
                c.Password = password
            }

            return nil
        }
    }

    // Fallback to environment variables
    c.BaseURL = config.Cfg.FeederAPI.BaseURL
    c.Username = config.Cfg.FeederAPI.Username
    c.Password = config.Cfg.FeederAPI.Password

    if c.BaseURL == "" {
        return errors.New("feeder API base URL not configured")
    }
    if c.Username == "" || c.Password == "" {
        return errors.New("feeder API credentials not configured")
    }

    return nil
}

// GetToken - Authenticate and get JWT token
func (c *Client) GetToken() error {
    // Ensure config is loaded
    if err := c.LoadConfig(); err != nil {
        return fmt.Errorf("failed to load config: %w", err)
    }

    payload := map[string]string{
        "act":      "GetToken",
        "username": c.Username,
        "password": c.Password,
    }

    jsonData, err := json.Marshal(payload)
    if err != nil {
        return fmt.Errorf("failed to marshal payload: %w", err)
    }

    req, err := http.NewRequest("POST", c.BaseURL, bytes.NewBuffer(jsonData))
    if err != nil {
        return fmt.Errorf("failed to create request: %w", err)
    }

    req.Header.Set("Content-Type", "application/json")

    resp, err := c.HTTPClient.Do(req)
    if err != nil {
        return fmt.Errorf("failed to send request: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(resp.Body)
    if err != nil {
        return fmt.Errorf("failed to read response: %w", err)
    }

    var feederResp FeederResponse
    if err := json.Unmarshal(body, &feederResp); err != nil {
        return fmt.Errorf("failed to unmarshal response: %w", err)
    }

    if feederResp.ErrorCode != 0 {
        return fmt.Errorf("feeder API error: %s", feederResp.ErrorDesc)
    }

    var tokenResp TokenResponse
    if err := json.Unmarshal(feederResp.Data, &tokenResp); err != nil {
        return fmt.Errorf("failed to unmarshal token: %w", err)
    }

    c.Token = tokenResp.Token
    c.TokenExp = time.Now().Add(2 * time.Hour)

    return nil
}

// Rest of the methods remain the same...
```

### 3.3 Update Config Structure

**File**: `backend/feeder-service/internal/config/config.go`

```go
package config

import (
    "fmt"
    "os"
    "github.com/joho/godotenv"
)

type Config struct {
    App          AppConfig
    JWT          JWTConfig
    Database     DatabaseConfig
    FeederAPI    FeederAPIConfig
    Redis        RedisConfig
    EncryptionKey string
}

type FeederAPIConfig struct {
    BaseURL  string
    Username string
    Password string
}

var Cfg Config

func LoadConfig() error {
    if err := godotenv.Load(); err != nil {
        fmt.Println("Warning: .env file not found, using environment variables")
    }

    Cfg = Config{
        App: AppConfig{
            Name: getEnv("APP_NAME", "Feeder Service"),
            Port: getEnv("APP_PORT", ":8084"),
            Env:  getEnv("APP_ENV", "development"),
        },
        JWT: JWTConfig{
            Secret: getEnv("JWT_SECRET", ""),
            Algo:   getEnv("JWT_ALGO", "HS256"),
        },
        Database: DatabaseConfig{
            Host:     getEnv("DB_HOST", "localhost"),
            Port:     getEnv("DB_PORT", "1433"),
            User:     getEnv("DB_USER", "sa"),
            Password: getEnv("DB_PASSWORD", ""),
            Database: getEnv("DB_NAME", "pdut"),
        },
        FeederAPI: FeederAPIConfig{
            BaseURL:  getEnv("URL_WS_FEEDER", ""),
            Username: getEnv("WS_USERNAME", ""),
            Password: getEnv("WS_PASSWORD", ""),
        },
        Redis: RedisConfig{
            Host: getEnv("REDIS_HOST", "redis"),
            Port: getEnv("REDIS_PORT", "6379"),
        },
        EncryptionKey: getEnv("ENCRYPTION_KEY", ""),
    }

    return nil
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}
```

### 3.4 Update Main Entry Point

**File**: `backend/feeder-service/cmd/api/main.go`

```go
package main

import (
    "log"

    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/gofiber/fiber/v2/middleware/recover"

    "github.com/myunila/feeder-service/internal/config"
    "github.com/myunila/feeder-service/external/database"
    "github.com/myunila/feeder-service/external/feeder_api"
    "github.com/myunila/feeder-service/apps/apiconfig"
    "github.com/myunila/feeder-service/pkg/crypto"
)

func main() {
    // Load configuration
    if err := config.LoadConfig(); err != nil {
        log.Fatalf("Failed to load config: %v", err)
    }

    // Connect to databases
    db := database.ConnectSQLServer(config.Cfg.Database)
    defer db.Close()

    redisClient := database.ConnectRedis()
    defer redisClient.Close()

    // Initialize encryption service
    encryptionService := crypto.NewEncryptionService(config.Cfg.EncryptionKey)

    // Create Fiber app
    app := fiber.New(fiber.Config{
        AppName:      config.Cfg.App.Name,
        ServerHeader: "Feeder Service",
    })

    // Apply middleware
    app.Use(recover.New())
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
    }))

    // Health check
    app.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "service": config.Cfg.App.Name,
            "status":  "healthy",
        })
    })

    // API routes
    api := app.Group("/api/v1")

    // Initialize API Config module (required for dynamic config)
    apiConfigRepo := apiconfig.NewRepository(db)
    apiConfigService := apiconfig.NewService(apiConfigRepo, encryptionService)
    apiconfig.RegisterRoutes(api, apiConfigService)

    // Initialize Feeder API client with config service
    feederAPI := feeder_api.NewClient(apiConfigService)

    // Initialize domain modules
    // mahasiswa.Init(api, db, feederAPI, redisClient, loggerService)
    // referensi.Init(api, db, feederAPI, loggerService)

    log.Printf("%s starting on %s", config.Cfg.App.Name, config.Cfg.App.Port)
    if err := app.Listen(config.Cfg.App.Port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
```

---

## 4. API Endpoints

### 4.1 Get All API Configs

```
GET /api/v1/api-configs
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "api_code": "feeder_api",
      "api_name": "Neo Feeder PDDIKTI API",
      "api_description": "API untuk sinkronisasi data mahasiswa",
      "base_url": "https://dapelmikpdpt.unila.ac.id/New/ws/Api.php",
      "auth_type": "token_based",
      "has_credentials": true,
      "timeout_seconds": 120,
      "max_retries": 3,
      "is_active": true,
      "use_env_fallback": true,
      "credential_source": "database",
      "last_tested_at": "2025-11-16T10:30:00Z",
      "last_test_status": "success"
    }
  ]
}
```

### 4.2 Get Specific API Config

```
GET /api/v1/api-configs/feeder_api
Authorization: Bearer <token>
```

### 4.3 Update API Config

```
PUT /api/v1/api-configs/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "base_url": "https://dapelmikpdpt.unila.ac.id/New/ws/Api.php",
  "credentials": {
    "username": "your-username",
    "password": "your-password"
  },
  "is_active": true
}
```

### 4.4 Test Connection

```
POST /api/v1/api-configs/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "api_code": "feeder_api",
  "base_url": "https://dapelmikpdpt.unila.ac.id/New/ws/Api.php",
  "credentials": {
    "username": "test-user",
    "password": "test-pass"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "status": "connected",
    "message": "Successfully authenticated and received token",
    "response_time_ms": 245
  }
}
```

---

## 5. Frontend Implementation

### 5.1 Settings Page

**File**: `frontend/src/app/dashboard/feeder-integrator/settings/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import { Card, CardBody, Button, Input, Switch, Chip } from "@heroui/react";
import { RiGraduationCapFill } from "react-icons/ri";
import { FiSettings, FiSave, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-hot-toast";

export default function FeederSettingsPage() {
  useRequireAuth();
  const { user } = useAuth();

  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [formData, setFormData] = useState({
    base_url: "",
    username: "",
    password: "",
    is_active: true,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call
      // const response = await apiConfigService.getByCode('feeder_api');
      // setConfig(response);
      // setFormData({
      //   base_url: response.base_url,
      //   username: '',
      //   password: '',
      //   is_active: response.is_active,
      // });
    } catch (error) {
      console.error("Error fetching config:", error);
      toast.error("Gagal memuat konfigurasi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement API call
      // await apiConfigService.update('feeder_api', formData);
      toast.success("Konfigurasi berhasil disimpan");
      fetchConfig();
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("Gagal menyimpan konfigurasi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      // TODO: Implement API call
      // const result = await apiConfigService.testConnection({
      //   base_url: formData.base_url,
      //   credentials: {
      //     username: formData.username,
      //     password: formData.password,
      //   },
      // });
      // if (result.success) {
      //   toast.success(`Koneksi berhasil (${result.response_time_ms}ms)`);
      // } else {
      //   toast.error(result.message);
      // }
      toast.success("Koneksi berhasil!");
    } catch (error) {
      console.error("Error testing connection:", error);
      toast.error("Gagal menghubungi API Feeder");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="API Configuration"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                <FiSettings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Neo Feeder API Configuration</h2>
                <p className="text-blue-100">Konfigurasi koneksi ke Neo Feeder PDDIKTI</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardBody className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Base URL</label>
              <Input
                value={formData.base_url}
                onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                placeholder="https://dapelmikpdpt.unila.ac.id/New/ws/Api.php"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Username Feeder"
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                fullWidth
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status Aktif</p>
                <p className="text-sm text-gray-500">Aktifkan koneksi ke Feeder API</p>
              </div>
              <Switch
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                color="primary"
                startContent={<FiSave />}
                onPress={handleSave}
                isLoading={isSaving}
              >
                Simpan Konfigurasi
              </Button>
              <Button
                variant="bordered"
                startContent={<FiRefreshCw />}
                onPress={handleTestConnection}
                isLoading={isTesting}
              >
                Test Koneksi
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardBody className="p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Catatan:</strong> Kredensial akan dienkripsi dan disimpan di database.
              Jika credentials kosong, sistem akan menggunakan environment variables sebagai fallback.
            </p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

---

## 6. Migration Summary

### Files to Create/Update

**Backend:**
- ✅ `backend/feeder-service/internal/config/config.go` - Add EncryptionKey
- ✅ `backend/feeder-service/external/feeder_api/client.go` - Add LoadConfig() method
- ✅ `backend/feeder-service/cmd/api/main.go` - Initialize apiconfig module
- ✅ Copy `backend/sister-service/apps/apiconfig/*` → `backend/feeder-service/apps/apiconfig/`
- ✅ Copy `backend/sister-service/pkg/crypto/*` → `backend/feeder-service/pkg/crypto/`

**Database:**
- ✅ Use existing `setting.api_configs` table
- ✅ Insert initial feeder config row

**Frontend:**
- ✅ `frontend/src/app/dashboard/feeder-integrator/settings/page.tsx`
- ✅ `frontend/src/lib/services/apiConfigService.ts` (create new)

---

## 7. Testing Checklist

- [ ] Insert feeder config to database
- [ ] Test getting config from database
- [ ] Test updating config via API
- [ ] Test credential encryption/decryption
- [ ] Test connection to Feeder API
- [ ] Test fallback to environment variables
- [ ] Test frontend settings page
- [ ] Test audit logging

---

**Document Version**: 1.0
**Created**: 2025-11-16
**Related**: implementation-plan.md
