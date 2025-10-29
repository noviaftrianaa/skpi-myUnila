# API Configuration Management System

Sistem manajemen konfigurasi API eksternal dengan enkripsi AES-256-GCM untuk credentials yang aman.

## 📋 Fitur

✅ **Hybrid Approach**: Fallback ke environment variables untuk production
✅ **AES-256-GCM Encryption**: Credentials terenkripsi di database
✅ **Flexible Schema**: Support multiple API types (SISTER, Feeder, dll)
✅ **Audit Trail**: Tracking semua perubahan konfigurasi
✅ **Connection Testing**: Test koneksi sebelum deploy
✅ **Role-Based Access**: Hanya Developer yang bisa akses
✅ **UI Management**: Interface untuk manage config tanpa edit env

---

## 🚀 Quick Start

### 1. Jalankan Migration SQL

```bash
# Connect ke SQL Server
sqlcmd -S localhost -U sa -P your_password -d pddikti

# Execute migration
:r backend/database/migrations/setting.api_configs.sql
```

### 2. Generate Encryption Key

```bash
# Generate 32 character key for AES-256
openssl rand -base64 32 | head -c 32
```

### 3. Update Environment Variables

Edit `.env`:

```env
# API Config Encryption Key (MUST be exactly 32 characters)
API_CONFIG_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Sister API (fallback jika DB kosong)
SISTER_API_BASE_URL=https://sister-api.kemdikbud.go.id/ws.php
SISTER_API_IDPENGGUNA=your_id
SISTER_API_USERNAME=your_username
SISTER_API_PASSWORD=your_password

# Feeder API (fallback jika DB kosong)
FEEDER_API_USERNAME=your_username
FEEDER_API_PASSWORD=your_password
```

### 4. Start Backend

```bash
cd backend/sister-service
go run cmd/api/main.go
```

Output:
```
✅ Encryption service initialized for API config
✅ API Configuration management enabled
🚀 Server starting on port :8083
```

### 5. Access UI

Frontend: `http://localhost:3000/dashboard/sister-integrator/settings`

API Endpoints:
- `GET /public/api-configs` - List all configs
- `GET /public/api-configs/:code` - Get by API code
- `POST /public/api-configs` - Create new config
- `PUT /public/api-configs/:id` - Update config
- `DELETE /public/api-configs/:id` - Delete config
- `POST /public/api-configs/test-connection` - Test connection

---

## 📊 Database Schema

### Table: `setting.api_configs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Primary key |
| `api_code` | NVARCHAR(50) | Unique: 'SISTER', 'FEEDER' |
| `api_name` | NVARCHAR(200) | Human readable name |
| `base_url` | NVARCHAR(500) | API endpoint URL |
| `auth_type` | NVARCHAR(50) | 'basic', 'token', 'oauth', 'custom' |
| `encrypted_credentials` | NVARCHAR(MAX) | **JSON encrypted (AES-256)** |
| `use_env_fallback` | BIT | Fallback to environment? |
| `is_active` | BIT | Config active? |
| `last_tested_at` | DATETIME | Last connection test |
| `last_test_status` | NVARCHAR(50) | 'success' or 'failed' |

### Credentials Format (JSON - Encrypted)

**SISTER API:**
```json
{
  "id_pengguna": "125e6431-7727-402e-adb5-24d410af493c",
  "username": "sister_unila",
  "password": "Unila2023!"
}
```

**Feeder PDDIKTI:**
```json
{
  "act": "GetToken",
  "username": "feeder_user",
  "password": "feeder_pass"
}
```

---

## 🔄 Logic Flow

```
┌─────────────────────────────────────┐
│ Application Request Credentials    │
│ apiConfigService.GetCredentials()  │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ 1. Query Database                   │
│    SELECT * FROM setting.api_configs│
│    WHERE api_code = 'SISTER'        │
└──────────────┬──────────────────────┘
               │
               ▼
        ┌─────────────┐
        │ Found in DB?│
        └──────┬──────┘
               │
      ┌────────┴────────┐
      │ YES             │ NO
      ▼                 ▼
┌──────────────┐  ┌─────────────────────┐
│Has encrypted │  │use_env_fallback=1?  │
│credentials?  │  └──────┬──────────────┘
└──────┬───────┘         │
       │ YES       ┌─────┴─────┐
       ▼           │ YES       │ NO
┌─────────────────┐│           ▼
│1. Decrypt with  ││   ┌──────────────┐
│   AES-256-GCM   ││   │Return Error: │
│2. Parse JSON    ││   │Not Configured│
│3. Return Creds  ││   └──────────────┘
└─────────────────┘│
                   ▼
      ┌────────────────────────┐
      │Read from Environment:  │
      │- SISTER_API_IDPENGGUNA │
      │- SISTER_API_USERNAME   │
      │- SISTER_API_PASSWORD   │
      └────────────────────────┘
```

---

## 💻 Code Examples

### Backend: Get Credentials

```go
// Get credentials with automatic fallback
credentials, err := apiConfigService.GetCredentials("SISTER")
if err != nil {
    log.Fatal(err)
}

// credentials is map[string]interface{}
idPengguna := credentials["id_pengguna"].(string)
username := credentials["username"].(string)
password := credentials["password"].(string)
```

### Frontend: Create New Config

```typescript
import { apiConfigService } from "@/lib/services/apiConfigService";

const newConfig = {
  api_code: "SIAKADU",
  api_name: "Siakadu Internal API",
  base_url: "https://siakadu.unila.ac.id/api/v1",
  auth_type: "bearer",
  credentials: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  is_active: true,
  use_env_fallback: false,
};

await apiConfigService.create(newConfig);
```

### Frontend: Test Connection

```typescript
const result = await apiConfigService.testConnection({
  api_code: "SISTER",
  base_url: "https://sister-api.kemdikbud.go.id/ws.php",
});

if (result.success) {
  console.log(`Connected! Response time: ${result.response_time_ms}ms`);
}
```

---

## 🔐 Security Best Practices

### ✅ DO:
- **Generate strong encryption key** (32 random characters)
- **Store encryption key in environment** (never in code)
- **Use database for development/testing** credentials
- **Use environment for production** credentials
- **Enable `use_env_fallback=1`** for production configs
- **Test connections** before deploying
- **Review audit logs** regularly

### ❌ DON'T:
- Commit encryption key to git
- Store plaintext passwords in database
- Share encryption key via email/chat
- Disable encryption in production
- Store production credentials in database (use env fallback)
- Allow public access to API config endpoints

---

## 📝 Example Queries

### Check Configuration Source

```sql
SELECT
    api_code,
    api_name,
    CASE
        WHEN encrypted_credentials IS NOT NULL THEN 'DATABASE'
        WHEN use_env_fallback = 1 THEN 'ENVIRONMENT'
        ELSE 'NOT_CONFIGURED'
    END AS credential_source,
    last_test_status,
    last_tested_at
FROM setting.api_configs
WHERE is_active = 1 AND deleted_at IS NULL;
```

### View Audit Trail

```sql
SELECT TOP 20
    al.performed_at,
    al.api_code,
    al.action_type,
    al.performed_by,
    al.notes
FROM setting.api_config_audit_logs al
ORDER BY al.performed_at DESC;
```

---

## 🧪 Testing

### Test Backend API

```bash
# Get all configs
curl http://localhost:8083/public/api-configs

# Get specific config
curl http://localhost:8083/public/api-configs/SISTER

# Test connection
curl -X POST http://localhost:8083/public/api-configs/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "api_code": "SISTER",
    "base_url": "https://sister-api.kemdikbud.go.id/ws.php"
  }'
```

### Test Frontend UI

1. Navigate to: `http://localhost:3000/dashboard/sister-integrator/settings`
2. Click "Add Configuration"
3. Fill in details:
   - API Code: `TEST_API`
   - Name: `Test API`
   - Base URL: `https://httpbin.org/get`
   - Auth Type: `token`
4. Click "Create"
5. Click "Test" button to test connection

---

## 🐛 Troubleshooting

### Error: "Encryption key must be exactly 32 bytes"

**Cause:** `API_CONFIG_ENCRYPTION_KEY` tidak 32 karakter

**Solution:**
```bash
# Generate new key
openssl rand -base64 32 | head -c 32

# Update .env
API_CONFIG_ENCRYPTION_KEY=abc123xyz789abc123xyz789abc123yz  # exactly 32 chars
```

### Error: "API configuration management disabled"

**Cause:** Encryption key tidak diset di environment

**Solution:** Set `API_CONFIG_ENCRYPTION_KEY` di `.env` dan restart service

### Error: "No credentials configured"

**Cause:** Config tidak ada di database dan fallback tidak enabled

**Solution:**
1. Enable fallback: `UPDATE setting.api_configs SET use_env_fallback=1 WHERE api_code='SISTER'`
2. Atau add credentials via UI

### Credentials tidak terdekripsi dengan benar

**Cause:** Encryption key berubah setelah credentials dienkripsi

**Solution:**
1. Gunakan encryption key yang sama
2. Atau delete config dan buat ulang dengan key baru

---

## 📚 API Documentation

Full Swagger documentation available at:
`http://localhost:8083/swagger/index.html`

Tag: **API Config**

---

## 🔄 Migration Path

### From Environment-Only to Database Config

1. **Existing configs tetap work** (via env fallback)
2. **Add database config gradually**:
   ```sql
   -- SISTER config stays in env
   use_env_fallback = 1, encrypted_credentials = NULL

   -- New APIs use database
   use_env_fallback = 0, encrypted_credentials = [encrypted JSON]
   ```
3. **Test new configs** before disabling fallback
4. **Monitor audit logs** for changes

---

## 📞 Support

Jika ada masalah:
1. Check logs: `go run cmd/api/main.go`
2. Verify database: Query `setting.api_configs`
3. Test encryption: Check encryption key length
4. Review audit logs: Query `setting.api_config_audit_logs`

---

## 📄 License

Internal use - Unila MyUnila System