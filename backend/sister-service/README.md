# Sister Service

Service untuk sinkronisasi data dari Sister API Kemdikbud ke database MyUnila/OneData PDDIKTI.

## 🚀 Features

- ✅ Sinkronisasi data referensi (Agama, Negara, Wilayah, dll)
- ✅ Sinkronisasi data mahasiswa
- ✅ Sinkronisasi data dosen
- ✅ Sinkronisasi data program studi
- ✅ REST API dengan Fiber Framework
- ✅ SQL Server database
- ✅ Docker support
- ✅ Domain-Driven Design (DDD) architecture

## 📂 Project Structure

```
sister-service/
├── cmd/
│   └── api/
│       └── main.go                 # Application entry point
├── apps/                           # Domain modules
│   └── referensi/                  # Referensi domain (contoh: agama)
│       ├── entity.go               # Domain entities
│       ├── repository.go           # Data access layer
│       ├── service.go              # Business logic
│       ├── controller.go           # HTTP handlers
│       ├── request.go              # Request DTOs
│       ├── response.go             # Response DTOs
│       └── router.go               # Route registration
├── external/                       # External dependencies
│   ├── database/
│   │   └── sqlserver.go            # SQL Server connection
│   └── sister_api/
│       └── client.go               # Sister API HTTP client
├── internal/
│   └── config/
│       └── config.go               # Configuration loader
├── pkg/                            # Shared packages
│   ├── response/
│   │   └── response.go             # Standard API response
│   └── validator/
│       └── validator.go            # Request validation
├── go.mod
├── go.sum
├── Dockerfile
├── .env.example
└── README.md
```

## 🔧 Installation

### Prerequisites
- Go 1.22.6+
- SQL Server
- Sister API Token (dari Kemdikbud)

### Local Development

1. **Clone repository**
```bash
cd backend/sister-service
```

2. **Install dependencies**
```bash
go mod download
```

3. **Setup environment**
```bash
cp .env.example .env
# Edit .env file dengan konfigurasi Anda
```

4. **Run application**
```bash
go run cmd/api/main.go
```

Server akan berjalan di `http://localhost:8083`

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t sister-service:latest .
```

### Run with Docker
```bash
docker run -p 8083:8083 \
  -e DB_HOST=myunila-sqlserver \
  -e DB_PASSWORD=your_password \
  -e SISTER_API_TOKEN=your_token \
  sister-service:latest
```

### Docker Compose Integration
Tambahkan ke `docker-compose.yml`:
```yaml
  sister-service:
    build:
      context: ./sister-service
      dockerfile: Dockerfile
    container_name: myunila-sister-service
    ports:
      - "8083:8083"
    environment:
      - APP_NAME=Sister Service
      - APP_PORT=:8083
      - DB_HOST=myunila-sqlserver
      - DB_PORT=1433
      - DB_USER=sa
      - DB_PASSWORD=${DB_SQLSRV_PASSWORD}
      - DB_NAME=pddikti
      - SISTER_API_BASE_URL=https://api-sister.kemdikbud.go.id/ws
      - SISTER_API_TOKEN=${SISTER_API_TOKEN}
    depends_on:
      - myunila-sqlserver
    networks:
      - myunila-network
    restart: unless-stopped
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Referensi - Agama

#### Get All Agama
```http
GET /api/v1/referensi/agama
```

Response:
```json
{
  "success": true,
  "message": "Agama retrieved successfully",
  "data": [
    {
      "id_agama": 1,
      "nama_agama": "Islam",
      "last_sync": "2025-01-15T10:30:00Z",
      "synced_by": "admin"
    }
  ]
}
```

#### Get Agama by ID
```http
GET /api/v1/referensi/agama/:id
```

#### Sync Agama from Sister API
```http
POST /api/v1/referensi/agama/sync
Content-Type: application/json

{
  "synced_by": "admin"
}
```

Response:
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "data": {
    "total_records": 7,
    "synced_by": "admin",
    "message": "Agama data synchronized successfully"
  }
}
```

## 🗄️ Database Schema

### Table: ref.lv_agama
```sql
CREATE TABLE ref.lv_agama (
    id_agama INT PRIMARY KEY,
    nama_agama NVARCHAR(50) NOT NULL,
    expired_date DATETIME NULL,
    last_sync DATETIME NULL,
    synced_by NVARCHAR(50) NULL
);
```

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Sister Service |
| `APP_PORT` | Server port | :8083 |
| `APP_ENV` | Environment (development/production) | development |
| `DB_HOST` | SQL Server host | localhost |
| `DB_PORT` | SQL Server port | 1433 |
| `DB_USER` | Database user | sa |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | pddikti |
| `SISTER_API_BASE_URL` | Sister API base URL | https://api-sister.kemdikbud.go.id/ws |
| `SISTER_API_TOKEN` | Sister API authentication token | - |

## 🧪 Testing

### Manual Testing with curl

**Get all agama:**
```bash
curl http://localhost:8083/api/v1/referensi/agama
```

**Sync agama from Sister API:**
```bash
curl -X POST http://localhost:8083/api/v1/referensi/agama/sync \
  -H "Content-Type: application/json" \
  -d '{"synced_by":"admin"}'
```

## 📝 Sister API Documentation

Official documentation: https://sister-api.kemdikbud.go.id/ws.php/1.0

### Sister API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `GET /1.0/referensi/agama` | Get list of religions |
| `GET /1.0/referensi/negara` | Get list of countries |
| `GET /1.0/referensi/wilayah` | Get list of regions |

## 🔐 Authentication

Sister API menggunakan token-based authentication. Token didapat dari Kemdikbud dan di-set di environment variable `SISTER_API_TOKEN`.

Request header:
```
Authorization: your_sister_api_token
```

## 🛠️ Development

### Adding New Domain

1. Create new folder in `apps/`:
```bash
mkdir -p apps/mahasiswa
```

2. Create domain files:
```bash
touch apps/mahasiswa/entity.go
touch apps/mahasiswa/repository.go
touch apps/mahasiswa/service.go
touch apps/mahasiswa/controller.go
touch apps/mahasiswa/router.go
```

3. Register in `cmd/api/main.go`:
```go
import "sister-service/apps/mahasiswa"

mahasiswa.Init(apiV1, db, sisterAPI)
```

## 📊 Monitoring

Access service health:
```bash
curl http://localhost:8083/health
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Internal project - MyUnila

## 👥 Team

Backend Development Team - MyUnila
