# Template Dokumentasi API dengan OpenAPI YAML + Scalar UI

Template ini digunakan sebagai acuan untuk membuat dokumentasi API di semua microservice MyUnila.

## Struktur Folder

```
docs/
├── handler.go              # Handler Fiber untuk serve documentation
├── swagger.go              # (Optional) Legacy swaggo annotations
├── TEMPLATE-README.md      # Panduan ini
└── openapi/
    ├── loader.go           # Go loader untuk compile YAML files
    ├── openapi.yaml        # Main OpenAPI spec (entry point)
    ├── paths/              # Endpoint definitions
    │   ├── auth.yaml
    │   ├── referensi.yaml
    │   └── system.yaml
    ├── schemas/            # Data schemas
    │   ├── _index.yaml     # Schema index
    │   ├── common.yaml     # Reusable pagination, response schemas
    │   ├── auth.yaml       # Auth-specific schemas
    │   └── referensi.yaml  # Domain-specific schemas
    └── responses/          # Response definitions
        ├── _index.yaml     # Response index
        └── errors.yaml     # Standard error responses
```

## Cara Menggunakan di Service Baru

### 1. Copy folder `docs/openapi/` ke service baru

```bash
cp -r backend/api-service/docs/openapi backend/your-service/docs/
```

### 2. Copy `docs/handler.go` ke service baru

Handler ini sudah termasuk:
- Scalar UI dengan custom theme
- Loading screen
- Custom CSS untuk dark/light mode
- Credit "Developed by Tim myUnila"

### 3. Edit `openapi.yaml` sesuai service

```yaml
openapi: 3.0.3
info:
  title: Your Service Name API
  description: |
    Deskripsi service anda.
  version: 1.0.0
  contact:
    name: Tim MyUnila
    email: dev@unila.ac.id

servers:
  - url: http://localhost:PORT
    description: Local Development
  - url: https://my.unila.ac.id/gateway/your-service
    description: Production Server

tags:
  - name: YourDomain
    description: Deskripsi domain

paths:
  /v1/your-endpoint:
    $ref: './paths/your-domain.yaml#/endpoint-name'

components:
  schemas:
    $ref: './schemas/_index.yaml'
  responses:
    $ref: './responses/_index.yaml'
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 4. Buat file path untuk endpoint

Contoh `paths/your-domain.yaml`:

```yaml
# YourDomain API Paths

endpoint-name:
  get:
    tags:
      - YourDomain
    summary: Get something
    description: Detailed description
    operationId: getSomething
    security:
      - BearerAuth: []
    parameters:
      - $ref: '../schemas/common.yaml#/parameters/page'
      - $ref: '../schemas/common.yaml#/parameters/limit'
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema:
              $ref: '../schemas/common.yaml#/PaginatedResponse'
      '401':
        $ref: '../responses/errors.yaml#/Unauthorized'
```

### 5. Buat schema untuk domain

Contoh `schemas/your-domain.yaml`:

```yaml
# YourDomain Schemas

YourEntity:
  type: object
  properties:
    id:
      type: string
      example: "uuid-here"
    name:
      type: string
      example: "Entity Name"
    created_at:
      type: string
      format: date-time
```

### 6. Update `schemas/_index.yaml`

```yaml
# Common
SuccessResponse:
  $ref: './common.yaml#/SuccessResponse'
PaginatedResponse:
  $ref: './common.yaml#/PaginatedResponse'

# YourDomain
YourEntity:
  $ref: './your-domain.yaml#/YourEntity'
```

### 7. Register handler di main.go

```go
import "github.com/myunila/your-service/docs"

func main() {
    app := fiber.New()

    // Setup documentation
    docs.SetupSwagger(app)

    // ... rest of setup
}
```

## File yang Dapat Di-reuse Langsung

File-file berikut dapat langsung digunakan tanpa modifikasi:

1. **`docs/openapi/loader.go`** - Go loader untuk compile YAML
2. **`docs/openapi/schemas/common.yaml`** - Pagination params & response schemas
3. **`docs/openapi/responses/errors.yaml`** - Standard error responses
4. **`docs/handler.go`** - Handler dengan Scalar UI template (sesuaikan import path)

## Endpoints yang Dihasilkan

Setelah setup selesai, service akan memiliki endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /docs` | Scalar UI documentation |
| `GET /docs/openapi.json` | OpenAPI spec (JSON) |
| `GET /docs/openapi.yaml` | OpenAPI spec (YAML) |

## Tips

1. **Gunakan $ref** - Hindari duplikasi dengan menggunakan $ref ke schemas yang sudah ada
2. **Konsisten naming** - Gunakan camelCase untuk operationId, kebab-case untuk path
3. **Security** - Selalu tambahkan `security: [BearerAuth: []]` untuk endpoint yang perlu auth
4. **Response schema** - Gunakan PaginatedResponse dari common.yaml untuk list endpoints
5. **Error responses** - Gunakan standard error responses dari errors.yaml

## Dependency yang Diperlukan

```bash
go get gopkg.in/yaml.v3
```

## Service yang Menggunakan Template Ini

- [x] api-service (Go)
- [ ] public-service (Laravel) - Perlu adapter PHP
- [ ] auth-service (Laravel) - Perlu adapter PHP
- [ ] feeder-service (Go)
- [ ] sister-service (Go)
- [ ] myunila-service (Go)
