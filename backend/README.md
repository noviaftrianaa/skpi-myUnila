# myUnila Backend Services

Microservices architecture untuk backend Portal myUnila - Sistem informasi terintegrasi Universitas Lampung yang menghubungkan 70+ aplikasi dalam satu ekosistem.

![Laravel](https://img.shields.io/badge/Laravel-11.31-FF2D20?logo=laravel)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?logo=php)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Kong](https://img.shields.io/badge/Kong-3.4-003459?logo=kong)

## 📋 Daftar Isi

- [Arsitektur](#-arsitektur)
- [Tech Stack](#-tech-stack)
- [Services](#-services)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Cara Menjalankan](#-cara-menjalankan)
- [API Gateway (Kong)](#-api-gateway-kong)
- [Database Configuration](#-database-configuration)
- [Monitoring](#-monitoring)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)

---

## 🏗 Arsitektur

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                               │
│                    http://localhost:3001                             │
│   ┌──────────────┬──────────────┬────────────────┬────────────────┐ │
│   │  Portal UI   │ Kong Admin   │   Monitoring   │  Applications  │ │
│   │              │ (Developer)  │  (Developer)   │     Catalog    │ │
│   └──────────────┴──────────────┴────────────────┴────────────────┘ │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP/HTTPS Requests
                             ↓
┌──────────────────────────────────────────────────────────────────────┐
│                    Kong API Gateway (Port 9800)                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  🔐 JWT Authentication  │ 🚦 Rate Limiting  │ 🌐 CORS          │  │
│  │  🔀 Request Routing     │ 📊 Monitoring     │ ⚡ Load Balancing │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  Admin: 9801 │ Manager: 9802 │ UI Dashboard: 9803                    │
└─┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬───┘
  │      │      │      │      │      │      │      │      │      │
  ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓      ↓

┌─────────────────────────────────────────────────────────────────────┐
│                    Current Microservices (Phase 1)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│ │   Auth     │  │ Public  │  │   Sister   │                    │
│ │  Service   │  │  Service   │  │  Service   │                    │
│ │ Port: 8081 │  │ Port: 8082 │  │ Port: 8083 │             etc       │
│ │            │  │            │  │            │                    │
│ │ • Login    │  │ • Profile  │  │ • Sync     │                    │
│ │ • JWT      │  │ • Dashboard│  │ • Sister   │                    │
│ │ • SSO      │  │ • Apps     │  │ • PDDIKTI  │                    │
│ │ • MFA      │  │ • Favs     │  │ • Dosen    │                    │
│ └────────────┘  └────────────┘  └────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              Future Microservices (Phase 2-4) 🔜                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │  Feeder  │ │ Akademik │ │Mahasiswa │ │  Dosen   │ │Notif     │  │
│ │   8084   │ │   8085   │ │   8086   │ │   8087   │ │   8088   │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│                                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                             │
│ │   File   │ │ Reporting│ │ Payment  │                             │
│ │   8089   │ │   8090   │ │   8091   │                             │
│ └──────────┘ └──────────┘ └──────────┘                             │
└─────────────────────────────────────────────────────────────────────┘
         │                                                       │
         └───────────────────────┬───────────────────────────────┘
                                 │
         ┌───────────────────────▼───────────────────────┐
         │          Shared Infrastructure                │
         │                                               │
    ┌────▼─────┐  ┌──────────┐  ┌──────────┐  ┌────────▼────┐
    │  Redis   │  │  Nginx   │  │PostgreSQL│  │ SQL Server  │
    │ Port:6379│  │8081-8091 │  │ Port:5432│  │ Port: 1433  │
    │          │  │          │  │          │  │             │
    │ • Cache  │  │ • Proxy  │  │ • Kong DB│  │ • auth_db   │
    │ • Queue  │  │ • SSL    │  │ • Logs   │  │ • dashboard │
    │ • Pub/Sub│  │ • WS     │  │ • Search │  │ • pddikti   │
    │ • Session│  │ • LB     │  └──────────┘  │ • akademik  │
    └──────────┘  └──────────┘                │ • mahasiswa │
                                              │ • dosen     │
    ┌──────────┐  ┌──────────┐                │ • etc...    │
    │  MinIO   │  │ RabbitMQ │                └─────────────┘
    │  Future  │  │  Future  │
    │ • Files  │  │ • Queue  │
    │ • Images │  │ • Events │
    └──────────┘  └──────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   Monitoring & Observability Stack                   │
│                         (Developer Access Only)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │  Grafana    │  │  Prometheus  │  │    Loki     │  │  cAdvisor │ │
│  │  Port: 3002 │  │  Port: 9090  │  │ Port: 3100  │  │Port: 8090 │ │
│  │             │  │              │  │             │  │           │ │
│  │ Dashboards  │←─│   Metrics    │  │ Log Aggr.   │←─│ Container │ │
│  │ & Alerts    │  │  Database    │  │ 31d Retention│ │  Metrics  │ │
│  └──────┬──────┘  └──────────────┘  └─────────────┘  └───────────┘ │
│         │                                                            │
│         │          ┌───────────────┐  ┌──────────────┐              │
│         └─────────→│   Promtail    │  │Node Exporter │              │
│                    │ Log Shipper   │  │ Port: 9100   │              │
│                    │ 15+ Containers│  │ Host Metrics │              │
│                    └───────────────┘  └──────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

### Alur Request:

1. **Frontend** → Kirim request ke Kong Gateway (`:9800`)
2. **Kong Gateway** → Validasi JWT, rate limiting, routing ke service
3. **Service** (auth/dashboard/sister) → Process request, akses database
4. **Database** → SQL Server (eksternal) untuk data persistence
5. **Redis** → Caching & queue management
6. **Monitoring** → Prometheus/Loki collect metrics & logs
7. **Visualization** → Grafana dashboards untuk observability

---

## 🚀 Tech Stack

### Core Frameworks
- **Laravel** `11.31` - PHP framework dengan modern architecture (Auth, Dashboard)
- **Go** `1.22.6` + **Fiber** `v2` - High-performance Go framework (Sister Service)
- **PHP** `8.2+` - Latest PHP features & performance

### API Gateway
- **Kong Gateway** `3.4` - Cloud-native API Gateway
- **Kong UI Dashboard** - Custom admin interface
- **PostgreSQL** `9.6` - Kong database

### Infrastructure
- **Docker** & **Docker Compose** - Containerization
- **Nginx** `alpine` - Web server & reverse proxy
- **Redis** `7-alpine` - Cache, queue & session backend

### Database Drivers
- **SQL Server PDO** - Primary database (Microsoft SQL Server)
  - `auth_db` - Auth Service database
  - `dashboard_db` - Dashboard Service database
  - `pddikti` - Sister Service database (PDDIKTI data)
- **PostgreSQL** - Kong Gateway database

### Security & Auth
- **Firebase JWT** `^6.10` - JSON Web Token authentication (Laravel services)
- **golang-jwt/jwt** `v5` - JWT validation (Go services)
- **Laravel Sanctum** - API token authentication
- **Google2FA** `^2.3` - Two-factor authentication (MFA)
- **Kong JWT Plugin** - Gateway-level authentication

**JWT Flow**:
1. User login via Auth Service → receives JWT token
2. Client includes token in `Authorization: Bearer <token>` header
3. Kong Gateway validates JWT before forwarding request
4. Services re-validate JWT signature using shared `JWT_SECRET`
5. Role-based authorization (e.g., Developer-only endpoints)

### Monitoring & Observability
- **Grafana** `latest` - Visualization & dashboards
- **Prometheus** `latest` - Metrics collection & storage
- **Loki** `latest` - Log aggregation system (31-day retention)
- **Promtail** `latest` - Log shipper for Docker containers
- **cAdvisor** `latest` - Container resource metrics
- **Node Exporter** `latest` - Host system metrics
- **Redis Exporter** `latest` - Redis metrics

### API Documentation
- **L5-Swagger** - OpenAPI/Swagger for Laravel services
- **Swag** - OpenAPI/Swagger for Go services
- **Postman Collections** - Pre-configured API testing

### Development Tools
- **Laravel Pint** - Code style fixer
- **Laravel Pail** - Real-time log viewer
- **PHPUnit** `^11.0` - Unit & feature testing
- **Air** - Live reload for Go development (optional)

---

## 🎯 Services

### 1. **Auth Service** (Port 8081)
**Responsibility**: Authentication & Authorization

**Features**:
- ✅ JWT-based authentication
- ✅ Login/Logout/Refresh Token
- ✅ SSO Unila integration
- ✅ Multi-Factor Authentication (MFA/2FA)
- ✅ Password management
- ✅ Session management
- ✅ User verification

**Endpoints**:
```
GET  /api/v1/health           - Health check
POST /api/v1/auth/login       - Login
POST /api/v1/auth/logout      - Logout
POST /api/v1/auth/refresh     - Refresh token
GET  /api/v1/auth/me          - Get user info
POST /api/v1/auth/verify      - Verify token
POST /api/v1/auth/sso/login   - SSO login
```

**Database**: SQL Server (auth_db)

**Tech Stack**:
- Laravel 11.31
- Firebase JWT
- Google2FA (MFA)
- Redis (sessions)

---

### 2. **Dashboard Service** (Port 8082)
**Responsibility**: User dashboard & application catalog

**Features**:
- ✅ User dashboard data
- ✅ 70+ Application catalog
- ✅ Favorite applications
- ✅ Announcements management
- ✅ Statistics & analytics
- ✅ Profile management
- ✅ Role-based access

**Endpoints**:
```
GET  /api/v1/health            - Health check
GET  /api/v1/dashboard         - Dashboard data
GET  /api/v1/applications      - List applications
POST /api/v1/favorites         - Add favorite
GET  /api/v1/announcements     - List announcements
GET  /api/v1/statistics        - Get statistics
```

**Database**: SQL Server (dashboard_db)

**Tech Stack**:
- Laravel 11.31
- JWT Authentication
- Redis (caching)

---

### 3. **Sister Service** (Port 8083)
**Responsibility**: Data synchronization from Sister Kemdikbud API

**Features**:
- ✅ JWT Authentication (validates tokens from auth-service)
- ✅ Role-Based Authorization (Developer only)
- ✅ Sync referensi data (Agama, Negara, Wilayah, dll)
- ✅ Sync mahasiswa data
- ✅ Sync dosen data
- ✅ Sync program studi data
- ✅ Real-time Sister API integration
- ✅ Automatic data transformation
- ✅ Sync history tracking

**Endpoints**:

*Public Endpoints (No authentication required):*
```
GET  /                                   - Welcome message
GET  /health                             - Health check
GET  /api/documentation                  - Swagger UI (redirect)
GET  /swagger/*                          - Swagger documentation
```

*Protected Endpoints (Require: JWT + Developer role):*
```
GET  /api/v1/referensi/agama            - Get all agama
GET  /api/v1/referensi/agama/:id        - Get agama by ID
POST /api/v1/referensi/agama/sync       - Sync from Sister API
```

**Authentication Flow**:
1. Get JWT token from Auth Service (`POST /api/v1/auth/login`)
2. Include token in header: `Authorization: Bearer <token>`
3. Sister Service validates JWT signature and role
4. Only "Developer" role can access sync endpoints

**Database**: SQL Server (pddikti)

**Tech Stack**:
- Go 1.22.6 + Fiber Framework
- golang-jwt/jwt (JWT validation)
- SQL Server Driver (go-mssqldb)
- Sister Kemdikbud API Client
- DDD Architecture

**Documentation**:
- [sister-service/README.md](sister-service/README.md)
- [sister-service/AUTHORIZATION.md](sister-service/AUTHORIZATION.md)
- [sister-service/DEPLOYMENT.md](sister-service/DEPLOYMENT.md)

---

## 🚧 Future Services (In Development)

Berikut adalah microservices yang akan dikembangkan untuk melengkapi ekosistem myUnila:

### 4. **Feeder Service** (Port 8084) - 🔜 Coming Soon
**Responsibility**: PDDIKTI Feeder Integration & Data Management

**Planned Features**:
- 🔄 Bi-directional sync dengan Feeder PDDIKTI
- 📊 Data validation before upload to Feeder
- 📈 Upload statistics & monitoring
- 🔍 Data comparison (local vs Feeder)
- 📝 Audit trail untuk setiap upload
- ⚠️ Error handling & retry mechanism
- 📋 Bulk operations support

**Tech Stack**: Go + Fiber (planned)
**Database**: SQL Server (pddikti)

---

### 5. **Akademik Service** (Port 8085) - 🔜 Coming Soon
**Responsibility**: Academic Data Management & Operations

**Planned Features**:
- 📚 Curriculum management (Kurikulum, Mata Kuliah)
- 📝 Course offerings (Kelas perkuliahan)
- 📊 Grade management (Nilai mahasiswa)
- 📅 Academic calendar
- 🎓 Graduation requirements tracking
- 📈 Academic analytics & reports
- 🔍 Transcript generation

**Tech Stack**: Laravel 11 (planned)
**Database**: SQL Server (akademik_db)

---

### 6. **Mahasiswa Service** (Port 8086) - 🔜 Coming Soon
**Responsibility**: Student Data Management & Services

**Planned Features**:
- 👨‍🎓 Student profile management
- 📋 Student registration (KRS)
- 💳 Payment management
- 📄 Document requests (Surat keterangan, Transkrip)
- 🎯 Academic progress tracking
- 📊 Student statistics
- 🏆 Scholarship management

**Tech Stack**: Laravel 11 (planned)
**Database**: SQL Server (mahasiswa_db)

---

### 7. **Dosen Service** (Port 8087) - 🔜 Coming Soon
**Responsibility**: Faculty Data Management & Services

**Planned Features**:
- 👨‍🏫 Faculty profile management
- 📚 Teaching load management
- 📝 Grade submission
- 📊 Teaching evaluation
- 🔬 Research tracking
- 📄 Publication management
- 🎓 Academic advisory

**Tech Stack**: Laravel 11 (planned)
**Database**: SQL Server (dosen_db)

---

### 8. **Notification Service** (Port 8088) - 🔜 Coming Soon
**Responsibility**: Multi-channel Notification System

**Planned Features**:
- 📧 Email notifications
- 📱 Push notifications (Web & Mobile)
- 💬 SMS notifications (optional)
- 📮 In-app notifications
- 🔔 Real-time notification delivery
- 📊 Notification analytics
- ⏰ Scheduled notifications
- 📝 Notification templates

**Tech Stack**: Go + Fiber + WebSocket (planned)
**Message Queue**: Redis Pub/Sub or RabbitMQ

---

### 9. **File Service** (Port 8089) - 🔜 Coming Soon
**Responsibility**: Centralized File Storage & Management

**Planned Features**:
- 📁 File upload/download
- 🖼️ Image processing & optimization
- 📄 Document conversion (PDF, Office)
- 🗂️ File versioning
- 🔒 Access control
- 📊 Storage analytics
- 🔍 File search & indexing
- ♻️ Automatic cleanup & archiving

**Tech Stack**: Go + MinIO/S3 (planned)
**Storage**: MinIO or AWS S3

---

### 10. **Reporting Service** (Port 8090) - 🔜 Coming Soon
**Responsibility**: Report Generation & Analytics

**Planned Features**:
- 📊 Custom report builder
- 📈 Data visualization
- 📉 Statistical analysis
- 📅 Scheduled reports
- 📧 Report distribution
- 🔍 Advanced filtering
- 📑 Multiple export formats (PDF, Excel, CSV)
- 🎨 Template management

**Tech Stack**: Laravel 11 + Chart.js (planned)
**Database**: SQL Server (reporting_db)

---

### 11. **Payment Service** (Port 8091) - 🔜 Coming Soon
**Responsibility**: Payment Processing & Financial Management

**Planned Features**:
- 💳 Payment gateway integration
- 🧾 Invoice generation
- 📊 Payment tracking
- 💰 Refund management
- 📈 Financial reports
- 🔔 Payment reminders
- 🏦 Multiple payment methods
- 📝 Transaction history

**Tech Stack**: Laravel 11 (planned)
**Database**: SQL Server (payment_db)
**Payment Gateways**: Midtrans, Bank Transfer, VA

---

### Service Architecture Overview (Future)

```
┌─────────────────────────────────────────────────────────────────┐
│                   Kong API Gateway (:9800)                      │
│              Central Entry Point for All Services               │
└────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────────┘
     │    │    │    │    │    │    │    │    │    │    │
     │    │    │    │    │    │    │    │    │    │    │
┌────▼┐ ┌─▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐ ┌▼──┐
│Auth│ │Dash│ │Sis│ │Feed│ │Akd│ │Mhs│ │Dsn│ │Not│ │Fil│ │Rep│ │Pay│
│8081│ │8082│ │8083│ │8084│ │8085│ │8086│ │8087│ │8088│ │8089│ │8090│ │8091│
└─┬──┘ └─┬──┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘ └─┬─┘
  │      │      │     │     │     │     │     │     │     │     │
  └──────┴──────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
         │                                                   │
         │         Shared Infrastructure Layer               │
         │                                                   │
    ┌────▼─────────────────────────────────────────────────▼────┐
    │  Redis    SQL Server    PostgreSQL    MinIO    RabbitMQ   │
    │  Cache    Databases     Kong DB       Storage  Queue      │
    └──────────────────────────────────────────────────────────┘
```

**Legend**:
- Auth = Auth Service
- Dash = Dashboard Service
- Sis = Sister Service
- Feed = Feeder Service
- Akd = Akademik Service
- Mhs = Mahasiswa Service
- Dsn = Dosen Service
- Not = Notification Service
- Fil = File Service
- Rep = Reporting Service
- Pay = Payment Service

---

### Development Roadmap

**Phase 1 (Current)** ✅:
- Auth Service
- Dashboard Service
- Sister Service
- Kong API Gateway
- Monitoring Stack

**Phase 2 (Q1 2026)** 🔜:
- Feeder Service
- Akademik Service
- Notification Service (basic)

**Phase 3 (Q2 2026)** 📋:
- Mahasiswa Service
- Dosen Service
- File Service

**Phase 4 (Q3 2026)** 📋:
- Reporting Service
- Payment Service
- Advanced Analytics

---

## 🌐 Kong API Gateway (Port 9800)
**Responsibility**: API Gateway & Traffic Management

**Features**:
- ✅ Request routing to microservices
- ✅ JWT authentication verification
- ✅ Rate limiting (100 req/minute)
- ✅ CORS handling
- ✅ Request/Response transformation
- ✅ Load balancing
- ✅ Health checking
- ✅ Logging & monitoring

**Admin Ports**:
- `9800` - Proxy (API Gateway)
- `9801` - Admin API
- `9802` - Kong Manager GUI
- `9803` - Konga Admin Panel

**Routes Configuration**:
```
/auth-service/*      → auth-service:8081
/dashboard-service/* → dashboard-service:8082
/sister-service/*    → sister-service:8083
```

---

## 🏗️ Infrastructure Services

### Redis (Port 6379)
**Current Services**:
- Session storage (Auth Service)
- Cache management (all services)
- Queue backend (background jobs)
- Rate limiting data (Kong Gateway)

**Future Usage**:
- Pub/Sub for Notification Service
- Real-time data streaming
- Distributed locks
- Leaderboard/ranking data

### Nginx (Ports 8081-8091)
**Current Services**:
- Reverse proxy untuk Auth, Dashboard, Sister
- Static file serving
- Request buffering
- Header manipulation

**Future Services**:
- Load balancing untuk scaled services
- SSL/TLS termination (production)
- Rate limiting per service
- WebSocket proxy (Notification Service)

### PostgreSQL (Port 5432)
**Current Usage**:
- Kong Gateway database
- Kong Admin data

**Future Usage**:
- Time-series data (optional)
- Full-text search (optional)
- Geospatial data (optional)

### MinIO / S3 (Future)
**Planned for File Service**:
- Document storage
- Image storage
- Backup storage
- Static assets CDN

### RabbitMQ (Future)
**Planned for Message Queue**:
- Async task processing
- Inter-service communication
- Event-driven architecture
- Notification delivery queue

---

## 📦 Prerequisites

### Required
- **Docker Desktop** (Latest version) - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** v2.0+ (included with Docker Desktop)
- **Git** - [Download](https://git-scm.com/downloads)

### External Services (Must be running)
- **SQL Server** - Primary database
  - Host: `localhost` or `host.docker.internal`
  - Port: `1433`
  - Databases: `auth_db`, `dashboard_db`
- **PostgreSQL** (Optional) - For Kong Gateway
  - Host: `localhost`
  - Port: `5432`
  - Databases: `kong`, `konga`

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Ports yang Dibutuhkan
Pastikan ports berikut tersedia:
- `6379` - Redis
- `8081` - Auth Service (Nginx)
- `8082` - Dashboard Service (Nginx)
- `8083` - Sister Service (Go + Fiber)
- `9800` - Kong Proxy (API Gateway)
- `9801` - Kong Admin API
- `9802` - Kong Manager
- `9803` - Konga Admin Panel

---

## ⚡ Quick Start

### 1. Clone Repository

```bash
git clone https://bitbucket.org/mahendraunila/my-unila.git
cd my-unila/backend
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env file dengan database credentials Anda
# IMPORTANT: Set DB_SQLSRV_PASSWORD dan connection details
```

### 3. Generate App Keys & JWT Secrets

```bash
# Auth Service
cd auth-service
php artisan key:generate
cd ..

# Dashboard Service
cd dashboard-service
php artisan key:generate
cd ..

# Generate JWT Secret
openssl rand -base64 32
# Copy output ke JWT_SECRET di .env
```

### 4. Setup Database

Pastikan SQL Server sudah running, lalu create databases:

```sql
-- Run di SQL Server Management Studio atau Azure Data Studio
CREATE DATABASE auth_db;
CREATE DATABASE dashboard_db;
GO

-- Run migration untuk sister-service (add sync tracking columns)
-- File: sister-service/database/migrations/001_create_ref_lv_agama_sync_columns.sql
```

### 5. Start All Services (One Command)

#### Windows:
```batch
start-all.bat
```

#### Linux/Mac/Git Bash:
```bash
chmod +x start-all.sh
./start-all.sh
```

Script akan otomatis:
- ✅ Check Docker running
- ✅ Start Redis
- ✅ Start Auth Service
- ✅ Start Dashboard Service
- ✅ Start Nginx
- ✅ Start Kong Gateway + PostgreSQL
- ✅ Configure Kong routes
- ✅ Run database migrations
- ✅ Test all endpoints

### 6. Verify Installation

Buka browser dan akses:
- **Kong Gateway**: http://localhost:9800/auth-service/api/v1/health
- **Auth Service**: http://localhost:8081/api/v1/health
- **Dashboard Service**: http://localhost:8082/api/v1/health
- **Kong Manager**: http://localhost:9802
- **Konga Admin**: http://localhost:9803

Expected response:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-10-16T12:00:00.000000Z"
}
```

---

## ⚙️ Konfigurasi Environment

### Backend Root `.env`

```bash
# =============================================
# Application Environment
# =============================================
APP_ENV=local
APP_DEBUG=true

# =============================================
# SQL Server Database Configuration
# =============================================
DB_SQLSRV_HOST=host.docker.internal    # Use localhost jika local
DB_SQLSRV_PORT=1433
DB_AUTH_DATABASE=auth_db
DB_DASHBOARD_DATABASE=dashboard_db
DB_SQLSRV_USERNAME=sa
DB_SQLSRV_PASSWORD=YourStrong@Passw0rd

# =============================================
# JWT Configuration
# =============================================
JWT_SECRET=your_generated_jwt_secret_here
JWT_TTL=60                              # Token TTL (minutes)
JWT_REFRESH_TTL=10080                   # Refresh token TTL (7 days)

# =============================================
# Redis Configuration
# =============================================
REDIS_HOST=redis                         # Use 'redis' in Docker, 'localhost' local
REDIS_PORT=6379
REDIS_PASSWORD=null

# =============================================
# SSO Unila Configuration (Optional)
# =============================================
SSO_UNILA_BASE_URL=https://akses.unila.ac.id
SSO_UNILA_APP_KEY=
SSO_UNILA_JWT_SECRET=
SSO_UNILA_CALLBACK_URL=http://localhost:9800/auth-service/api/v1/auth/sso/callback

# =============================================
# Kong Gateway (Optional - for Kong setup)
# =============================================
DB_PGSQL_HOST=host.docker.internal
DB_PGSQL_PORT=5432
DB_PGSQL_USERNAME=postgres
DB_PGSQL_PASSWORD=postgres
DB_KONG_DATABASE=kong
DB_KONGA_DATABASE=konga
```

### Service-Specific `.env`

Setiap service memiliki `.env` sendiri di folder masing-masing:

#### `auth-service/.env`:
```bash
APP_NAME="MyUnila Auth Service"
APP_URL=http://localhost:8081

DB_CONNECTION=sqlsrv
DB_HOST=host.docker.internal
DB_PORT=1433
DB_DATABASE=auth_db
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd

CACHE_STORE=redis
REDIS_HOST=redis
REDIS_PORT=6379

JWT_SECRET=same_as_root_env
JWT_TTL=60
```

#### `dashboard-service/.env`:
```bash
APP_NAME="MyUnila Dashboard Service"
APP_URL=http://localhost:8082

DB_CONNECTION=sqlsrv
DB_HOST=host.docker.internal
DB_PORT=1433
DB_DATABASE=dashboard_db
DB_USERNAME=sa
DB_PASSWORD=YourStrong@Passw0rd

CACHE_STORE=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

#### `sister-service/.env`:
```bash
APP_NAME=Sister Service
APP_PORT=:8083
APP_ENV=development

# JWT Configuration (MUST match auth-service)
JWT_SECRET=same_as_auth_service_jwt_secret
JWT_ALGO=HS256

# Sister API Kemdikbud
SISTER_API_BASE_URL=https://api-sister.kemdikbud.go.id/ws
SISTER_API_TOKEN=your_sister_api_token_here

# SQL Server Database (PDDIKTI)
DB_DRIVER=sqlserver
DB_HOST=host.docker.internal
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrong@Passw0rd
DB_NAME=pddikti
```

**⚠️ IMPORTANT**: Sister Service `JWT_SECRET` **MUST** match Auth Service untuk JWT validation!

---

## 🎯 Cara Menjalankan

### A. Development (Recommended)

Untuk development dengan hot-reload dan debugging:

#### 1. Start Infrastructure (Redis)
```bash
docker-compose up -d redis
```

#### 2. Start Services Locally
```bash
# Terminal 1: Auth Service
cd auth-service
composer install
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8081

# Terminal 2: Dashboard Service
cd dashboard-service
composer install
php artisan migrate
php artisan serve --host=0.0.0.0 --port=8082
```

#### 3. Start Kong (Optional)
```bash
# Uncomment Kong services di docker-compose.yml
docker-compose up -d kong konga
./setup-kong-jwt.sh
```

**Advantages**:
- ✅ Fast reload (no container rebuild)
- ✅ Easy debugging dengan Xdebug
- ✅ Direct file editing
- ✅ Artisan commands langsung tersedia

---

### B. Production (Docker)

Untuk production atau staging environment:

#### 1. Setup Environment
```bash
# Copy production env
cp .env.example .env.production

# Edit dengan production credentials
# Set APP_ENV=production, APP_DEBUG=false
```

#### 2. Build & Start All Services
```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f
```

#### 3. Run Migrations
```bash
# Auth Service
docker exec -it myunila-auth-service php artisan migrate --force

# Dashboard Service
docker exec -it myunila-dashboard-service php artisan migrate --force
```

#### 4. Setup Kong Gateway
```bash
# Wait for Kong to be healthy
docker-compose ps

# Configure Kong routes
./setup-kong-jwt.sh
```

**Advantages**:
- ✅ Production-ready setup
- ✅ Consistent environment
- ✅ Easy scaling
- ✅ Automatic restarts

---

### C. Hybrid (Services in Docker, DB Local)

Best untuk development dengan external databases:

```bash
# Start only services (not databases)
docker-compose up -d auth-service dashboard-service nginx redis

# Access databases via host.docker.internal
```

---

## 🌐 API Gateway (Kong)

### Kong Configuration

Kong Gateway menyediakan centralized API management untuk semua services.

#### Service Routes

```
# Auth Service
http://localhost:9800/auth-service/*
→ Forward ke auth-service:8081

# Dashboard Service
http://localhost:9800/dashboard-service/*
→ Forward ke dashboard-service:8082
```

#### Kong Admin Endpoints

```bash
# List all services
curl http://localhost:9801/services

# List all routes
curl http://localhost:9801/routes

# Check Kong status
curl http://localhost:9801/status
```

#### JWT Authentication Plugin

Kong secara otomatis memvalidasi JWT tokens untuk protected routes.

**Flow**:
1. User login → Auth Service generates JWT
2. Client attach JWT di header: `Authorization: Bearer <token>`
3. Kong validates JWT sebelum forward request
4. Jika valid → forward ke service
5. Jika invalid → return 401 Unauthorized

**Setup JWT Plugin**:
```bash
# Automated via setup-kong-jwt.sh
./setup-kong-jwt.sh

# Manual setup
curl -X POST http://localhost:9801/services/auth-service/plugins \
  --data "name=jwt" \
  --data "config.secret_is_base64=false"
```

#### Rate Limiting

Kong menerapkan rate limiting untuk mencegah abuse:

```
- Limit: 100 requests per minute
- Scope: Per consumer (authenticated user)
- Response: 429 Too Many Requests jika exceeded
```

**Configure Rate Limit**:
```bash
curl -X POST http://localhost:9801/services/auth-service/plugins \
  --data "name=rate-limiting" \
  --data "config.minute=100" \
  --data "config.policy=local"
```

#### CORS Configuration

Kong menangani CORS untuk frontend:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

## 💾 Database Configuration

### SQL Server Setup

#### Windows (Local SQL Server)

```sql
-- 1. Enable TCP/IP
-- SQL Server Configuration Manager → SQL Server Network Configuration
-- → Protocols → TCP/IP → Enable

-- 2. Set Port 1433
-- TCP/IP Properties → IP Addresses → IPAll → TCP Port: 1433

-- 3. Restart SQL Server service

-- 4. Create databases
CREATE DATABASE auth_db;
CREATE DATABASE dashboard_db;
GO

-- 5. Create login (jika belum ada)
CREATE LOGIN sa WITH PASSWORD = 'YourStrong@Passw0rd';
ALTER SERVER ROLE sysadmin ADD MEMBER sa;
GO
```

#### Docker SQL Server

```bash
# Start SQL Server in Docker
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Create databases
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -Q "CREATE DATABASE auth_db; CREATE DATABASE dashboard_db;"
```

### Connection String

**From Host Machine**:
```
Server=localhost,1433;Database=auth_db;User Id=sa;Password=YourStrong@Passw0rd
```

**From Docker Container**:
```
Server=host.docker.internal,1433;Database=auth_db;User Id=sa;Password=YourStrong@Passw0rd
```

### PostgreSQL (Kong Gateway)

```bash
# Start PostgreSQL
docker run -d \
  --name postgres-kong \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=kong \
  -p 5432:5432 \
  postgres:15-alpine

# Create Kong database
docker exec -it postgres-kong psql -U postgres -c "CREATE DATABASE kong;"
docker exec -it postgres-kong psql -U postgres -c "CREATE DATABASE konga;"
```

### Migrations

```bash
# Auth Service
cd auth-service
php artisan migrate
php artisan db:seed  # Optional: seed sample data

# Dashboard Service
cd dashboard-service
php artisan migrate
php artisan db:seed

# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (DANGER: drops all tables)
php artisan migrate:fresh
```

---

## 🎨 Frontend Portal

### Overview
Frontend Portal Next.js dengan role-based access control dan integrated developer tools.

**Repository**: `my-unila/frontend`
**URL**: http://localhost:3001

**Key Features**:
- ✅ Portal aplikasi terintegrasi (70+ apps)
- ✅ Role-based menu filtering (Mahasiswa, Dosen, Admin, Developer)
- ✅ JWT authentication via Auth Service
- ✅ Kong Admin management (Developer only)
- ✅ Monitoring & Observability dashboard (Developer only)
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Real-time notifications

### User Roles & Access
- **Mahasiswa**: Basic portal access, student applications
- **Dosen**: Faculty applications, academic tools
- **Admin**: Administrative tools, user management
- **Developer**: Full access + Kong Admin + Monitoring tools

### Developer Tools (Role: Developer)

#### Kong Admin (`/portal/kong-admin`)
**Purpose**: API Gateway management & service documentation

**Access**: http://localhost:3001/portal/kong-admin

**Features**:
- 📋 Services list with routes
- 📖 API Documentation links (Swagger UI)
- 🔧 Kong Admin API access
- 🟢 Real-time service health status
- 🔍 Route debugging tools

**Available Services**:
- Auth Service API Docs → http://localhost:8081/api/documentation
- Dashboard Service API Docs → http://localhost:8082/api/documentation
- Sister Service API Docs → http://localhost:8083/api/documentation

**Security**:
- Role-based: Only `Developer` role can access
- JWT authentication required
- Menu hidden for non-Developer users

#### Monitoring & Observability (`/portal/monitoring`)
**Purpose**: System monitoring, logging & observability

**Access**: http://localhost:3001/portal/monitoring

**Unified Dashboard for**:
1. **Grafana** (http://localhost:3002)
   - 🎨 Real-time dashboards
   - 📊 Custom visualizations
   - 🔗 Multi-datasource support
   - 📈 Pre-configured "MyUnila Application Logs" dashboard
   - 🔔 Alert management

2. **Prometheus** (http://localhost:9090)
   - ⏱️ Time-series metrics database
   - 🔍 PromQL query language
   - 🎯 Service discovery & scraping
   - 📉 Target health monitoring

3. **Loki** (http://localhost:3100)
   - 📝 Log aggregation system
   - 🔎 LogQL query language
   - 🗄️ 31-day log retention
   - 🏷️ Label-based indexing

4. **Promtail** (Background Service)
   - 📦 Docker log collection
   - 🔄 Auto-discovery (15+ containers)
   - 🚀 Real-time log streaming

5. **cAdvisor** (http://localhost:8090)
   - 📊 Container resource metrics
   - 💾 Memory & CPU statistics
   - 🌐 Network I/O stats
   - 💽 Disk usage monitoring

6. **Node Exporter** (http://localhost:9100)
   - 🖥️ Host system metrics
   - 📈 1500+ metrics exposed
   - 🔋 CPU, RAM, Disk, Network

**Quick Actions**:
- View all application logs in Grafana
- Query specific errors or exceptions
- Monitor container resource usage
- Track API response times
- Alert on service failures

**Security**:
- Role-based: Only `Developer` role can access
- JWT authentication required
- Unified access point for all monitoring tools
- Grafana credentials: `admin` / `makinjaya`

---

## 📊 Monitoring Stack

### Overview
Comprehensive monitoring & observability stack untuk production-ready system monitoring.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Collection                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Container Logs → Promtail → Loki (31d retention)          │
│                                                             │
│  Containers     → cAdvisor  → Prometheus                    │
│  Host System    → Node Exp. → Prometheus                    │
│  Redis          → Redis Exp.→ Prometheus                    │
│                                                             │
│                           ↓                                 │
│                     ┌──────────┐                            │
│                     │ Grafana  │                            │
│                     │ Port 3002│                            │
│                     └──────────┘                            │
│                                                             │
│  📊 Dashboards  📝 Logs  🔔 Alerts  📈 Metrics             │
└─────────────────────────────────────────────────────────────┘
```

### Quick Start Monitoring

```bash
# 1. Start core services first
docker-compose up -d

# 2. Start monitoring stack
docker-compose -f docker-compose-monitoring.yml up -d

# 3. Wait for all services to be healthy (~30 seconds)
docker ps --filter "name=myunila"

# 4. Access Grafana
open http://localhost:3002
# Login: admin / makinjaya

# 5. Navigate to "MyUnila - Application Logs" dashboard
# Pre-configured at: http://localhost:3002/d/myunila-logs
```

### Monitoring Components

| Component | Port | Purpose | Retention |
|-----------|------|---------|-----------|
| **Grafana** | 3002 | Visualization & Dashboards | N/A |
| **Prometheus** | 9090 | Metrics Database | 15 days |
| **Loki** | 3100 | Log Storage | 31 days |
| **Promtail** | - | Log Shipper (15 containers) | N/A |
| **cAdvisor** | 8090 | Container Metrics | N/A |
| **Node Exporter** | 9100 | Host Metrics | N/A |
| **Redis Exporter** | 9121 | Redis Metrics | N/A |

### Pre-configured Dashboards

**1. MyUnila - Application Logs** (Main Dashboard)
- **URL**: http://localhost:3002/d/myunila-logs
- **Description**: Centralized application logs dari semua containers
- **Features**:
  - 📊 Real-time log streaming
  - 🔍 Full-text search & filtering
  - 🏷️ Container-based filtering
  - ⚠️ Error/Exception highlighting
  - 📈 Log volume charts
  - ⏱️ Customizable time ranges

**2. Container Resource Metrics**
- **URL**: Auto-created via Prometheus datasource
- **Description**: Docker container resource monitoring
- **Metrics**:
  - 💾 Memory usage per container
  - ⚡ CPU usage & throttling
  - 🌐 Network I/O (RX/TX)
  - 💽 Disk I/O & usage
  - 🔄 Container restart counts

**3. System Overview**
- **URL**: Auto-created via Node Exporter
- **Description**: Host system monitoring
- **Metrics**:
  - 🖥️ CPU load & utilization
  - 💾 Memory & swap usage
  - 💽 Disk space & I/O
  - 🌐 Network interfaces
  - ⏰ System uptime

**4. Redis Metrics**
- **URL**: Auto-created via Redis Exporter
- **Description**: Redis performance monitoring
- **Metrics**:
  - 📊 Commands per second
  - 💾 Memory usage & fragmentation
  - 🔑 Keyspace statistics
  - 👥 Connected clients
  - 🔄 Evicted & expired keys

### Monitoring Endpoints

| Service | URL | Purpose | Credentials |
|---------|-----|---------|-------------|
| **Grafana** | http://localhost:3002 | Visualization & Dashboards | `admin` / `makinjaya` |
| **Prometheus** | http://localhost:9090 | Metrics Database & PromQL | None |
| **Loki** | http://localhost:3100 | Log Storage API | None |
| **cAdvisor** | http://localhost:8090 | Container Metrics UI | None |
| **Node Exporter** | http://localhost:9100 | System Metrics (raw) | None |
| **Redis Exporter** | http://localhost:9121 | Redis Metrics (raw) | None |

### Service Health Checks

```bash
# Auth Service
curl http://localhost:8081/api/v1/health

# Dashboard Service
curl http://localhost:8082/api/v1/health

# Sister Service
curl http://localhost:8083/health

# Via Kong Gateway
curl http://localhost:9800/auth-service/api/v1/health
curl http://localhost:9800/dashboard-service/api/v1/health
curl http://localhost:9800/sister-service/health

# Kong Gateway
curl http://localhost:9801/status

# Loki
curl http://localhost:3100/ready

# Prometheus
curl http://localhost:9090/-/healthy
```

### Docker Health Status

```bash
# Check all containers
docker-compose ps

# Service-specific health
docker inspect --format='{{json .State.Health}}' myunila-auth-service | jq

# View logs
docker-compose logs -f auth-service
docker-compose logs -f dashboard-service
docker-compose logs -f kong
```

### Application Logs

#### Via Grafana (Recommended)
1. Open http://localhost:3002
2. Navigate to "MyUnila - Application Logs" dashboard
3. Filter by container, time range, search keywords
4. View real-time logs with live tail

#### Via Docker
```bash
# Real-time logs dengan Pail (recommended)
cd auth-service
php artisan pail

# Traditional tail
tail -f auth-service/storage/logs/laravel.log
tail -f dashboard-service/storage/logs/laravel.log

# Docker logs
docker logs -f myunila-auth-service
docker logs -f myunila-dashboard-service
```

### Log Queries (Grafana Explore)

```logql
# All logs from auth-service
{container="myunila-auth-service"}

# Error logs from all containers
{container=~"myunila-.*"} |~ "(?i)(error|exception|fatal)"

# Login activity
{container="myunila-auth-service"} |~ "(?i)login"

# HTTP errors (4xx, 5xx)
{container="myunila-nginx"} |~ "HTTP.*[45][0-9]{2}"
```

### Metrics Queries (Prometheus)

```promql
# Container CPU usage
rate(container_cpu_usage_seconds_total{name=~"myunila-.*"}[5m])

# Container memory usage
container_memory_usage_bytes{name=~"myunila-.*"}

# Redis operations
redis_commands_total

# Node CPU usage
node_cpu_seconds_total
```

---

## 📖 API Documentation

### Swagger/OpenAPI

Setiap service memiliki interactive API documentation:

**Auth Service**:
- Swagger UI: http://localhost:8081/api/documentation
- OpenAPI JSON: http://localhost:8081/api/documentation/json

**Dashboard Service**:
- Swagger UI: http://localhost:8082/api/documentation
- OpenAPI JSON: http://localhost:8082/api/documentation/json

**Sister Service**:
- Swagger UI: http://localhost:8083/api/documentation
- OpenAPI JSON: http://localhost:8083/swagger/doc.json
- 🔐 **Protected endpoints require JWT token** (click "Authorize" button)

### Generate/Update Documentation

```bash
# Laravel Services (Auth & Dashboard)
cd auth-service
php artisan l5-swagger:generate

cd ../dashboard-service
php artisan l5-swagger:generate

# Go Service (Sister)
cd ../sister-service
swag init -g cmd/api/main.go -o docs
# Or use Go installed swag:
~/go/bin/swag init -g cmd/api/main.go -o docs
```

### Postman Collections

Pre-configured Postman collections tersedia di:
```
auth-service/postman/Auth-Service.postman_collection.json
dashboard-service/postman/Dashboard-Service.postman_collection.json
```

**Import ke Postman**:
1. Open Postman
2. File → Import
3. Select collection file
4. Setup environment variables:
   - `base_url`: http://localhost:9800
   - `auth_service_url`: http://localhost:8081
   - `dashboard_service_url`: http://localhost:8082

---

## 🧪 Testing

### Unit & Feature Tests

```bash
# Auth Service
cd auth-service
./vendor/bin/phpunit

# Atau dengan artisan
php artisan test

# Dengan coverage
php artisan test --coverage

# Specific test file
php artisan test tests/Feature/AuthTest.php

# Dashboard Service
cd dashboard-service
php artisan test
```

### API Testing dengan Postman

1. Import collection dari `postman/` folder
2. Setup environment
3. Run collection:
   - Postman → Collections → Auth Service → Run
   - View test results

### Manual Testing

```bash
# 1. Login to get JWT token
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

# Save the access_token from response
TOKEN="your_jwt_token_here"

# 2. Test Auth Service with JWT
curl http://localhost:8081/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Test Dashboard Service with JWT
curl http://localhost:8082/api/v1/dashboard \
  -H "Authorization: Bearer $TOKEN"

# 4. Test Sister Service (Public - no auth)
curl http://localhost:8083/health

# 5. Test Sister Service (Protected - requires Developer role)
curl http://localhost:8083/api/v1/referensi/agama \
  -H "Authorization: Bearer $TOKEN"

# Expected responses:
# - 401 Unauthorized: Missing or invalid token
# - 403 Forbidden: Valid token but not Developer role
# - 200 OK: Valid token with Developer role

# 6. Test via Kong Gateway
curl -X POST http://localhost:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'

curl http://localhost:9800/sister-service/api/v1/referensi/agama \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🐛 Troubleshooting

### 1. Container Won't Start

**Problem**: Service exits immediately
```bash
# Check logs
docker-compose logs auth-service

# Common issues:
# - Database connection failed
# - Missing .env file
# - Port already in use
```

**Solution**:
```bash
# Check .env file exists
ls -la auth-service/.env

# Check database connection
docker exec -it myunila-auth-service php artisan tinker
>>> DB::connection()->getPdo();

# Check port availability
netstat -ano | findstr :8081  # Windows
lsof -i :8081                 # Linux/Mac
```

### 2. Database Connection Failed

**Problem**: SQLSTATE[08001] Connection refused

**Solution**:
```bash
# Check SQL Server running
# Windows: Services → SQL Server (MSSQLSERVER) → Running
# Docker: docker ps | grep sqlserver

# Check connection from container
docker exec -it myunila-auth-service php artisan tinker
>>> DB::connection()->getPdo();

# Verify host.docker.internal works
docker exec -it myunila-auth-service ping host.docker.internal

# Alternative: Use container IP
docker inspect sqlserver | grep IPAddress
# Update DB_HOST in .env with IP
```

### 3. Kong Gateway Not Working

**Problem**: 502 Bad Gateway dari Kong

**Solution**:
```bash
# Check Kong healthy
docker-compose ps kong

# Check Kong logs
docker-compose logs kong

# Verify routes configured
curl http://localhost:9801/routes

# Re-setup Kong
./setup-kong-jwt.sh

# Check service connectivity
curl http://localhost:9801/services/auth-service/health
```

### 4. JWT Token Invalid

**Problem**: 401 Unauthorized dengan valid token

**Solution**:
```bash
# Check JWT_SECRET sama di SEMUA services (termasuk sister-service!)
# Root .env
grep JWT_SECRET .env

# Auth Service .env
grep JWT_SECRET auth-service/.env

# Dashboard Service .env
grep JWT_SECRET dashboard-service/.env

# Sister Service .env (Go)
grep JWT_SECRET sister-service/.env

# Generate new JWT secret
openssl rand -base64 32

# Update SEMUA .env files dengan secret yang sama
# Restart services
docker-compose restart
```

**⚠️ CRITICAL**: Sister Service JWT_SECRET **MUST** match Auth Service exactly!

### 4b. Sister Service - 403 Forbidden

**Problem**: Valid JWT token but getting 403 Forbidden from Sister Service

**Solution**:
```bash
# Check user role in token
# Decode JWT token at https://jwt.io
# Look for: "user": { "role": "Developer" }

# Sister Service requires "Developer" role for sync endpoints
# Update user role in auth-service database
UPDATE users SET role = 'Developer' WHERE username = 'your_username';

# Login again to get new token with updated role
curl -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

### 5. Permission Denied (Storage)

**Problem**: Laravel can't write to storage/logs

**Solution**:
```bash
# Fix permissions
cd auth-service
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Or in Docker
docker exec -it myunila-auth-service chmod -R 775 storage bootstrap/cache
docker exec -it myunila-auth-service chown -R www-data:www-data storage bootstrap/cache
```

### 6. Redis Connection Failed

**Problem**: Connection to redis:6379 failed

**Solution**:
```bash
# Check Redis running
docker-compose ps redis

# Test Redis connection
docker exec -it myunila-redis redis-cli ping
# Should return: PONG

# Restart Redis
docker-compose restart redis

# Check Redis from service
docker exec -it myunila-auth-service php artisan tinker
>>> Cache::put('test', 'value', 60);
>>> Cache::get('test');
```

### 7. Composer Dependencies Missing

**Problem**: Class not found errors

**Solution**:
```bash
# Install dependencies
cd auth-service
composer install

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Rebuild autoload
composer dump-autoload
```

### 8. Port Already in Use

**Problem**: Bind for 0.0.0.0:8081 failed: port is already allocated

**Solution**:
```bash
# Find process using port (Windows)
netstat -ano | findstr :8081
taskkill /PID <process_id> /F

# Find process using port (Linux/Mac)
lsof -ti:8081 | xargs kill -9

# Or change port di docker-compose.yml
ports:
  - "8091:80"  # Change 8081 to 8091
```

---

## 📚 Additional Documentation

### General Documentation
- **[QUICK-START.md](QUICK-START.md)** - Panduan cepat start all services
- **[WINDOWS-GUIDE.md](WINDOWS-GUIDE.md)** - Panduan khusus Windows
- **[KONG-JWT-TESTING.md](KONG-JWT-TESTING.md)** - Testing Kong JWT authentication
- **[API-DOCUMENTATION-STANDARDS.md](API-DOCUMENTATION-STANDARDS.md)** - API documentation standards

### Service Documentation
- **Auth Service**: [auth-service/README.md](auth-service/README.md)
- **Dashboard Service**: [dashboard-service/README.md](dashboard-service/README.md)
- **Sister Service**:
  - [sister-service/README.md](sister-service/README.md) - Service overview
  - [sister-service/AUTHORIZATION.md](sister-service/AUTHORIZATION.md) - JWT & Role-based auth
  - [sister-service/DEPLOYMENT.md](sister-service/DEPLOYMENT.md) - Deployment guide
  - [sister-service/CHANGELOG.md](sister-service/CHANGELOG.md) - Version history

---

## 🤝 Contributing

### Development Workflow

1. Create feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes & test
   ```bash
   php artisan test
   ```

3. Commit dengan conventional commits
   ```bash
   git commit -m "feat(auth): add SSO integration"
   ```

4. Push & create Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

### Coding Standards

- Follow PSR-12 coding standards
- Use Laravel Pint for formatting:
  ```bash
  ./vendor/bin/pint
  ```
- Write tests for new features
- Document API endpoints dengan OpenAPI annotations

### Branch Strategy

- `master` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes

---

## 📄 License

Copyright © 2025 UPA TIK Universitas Lampung. All rights reserved.

---

## 📞 Support

**Tim UPA TIK Universitas Lampung**

- 📧 Email: dev@unila.ac.id
- 🌐 Website: https://www.unila.ac.id
- 📍 Alamat: Universitas Lampung, Bandar Lampung

---

**Built with ❤️ by UPA TIK Universitas Lampung**
