# 🏗️ MY UNILA - PRODUCTION ARCHITECTURE

**Version:** 1.0
**Last Updated:** 2025-10-29
**Status:** Production Ready

---

## 📊 INFRASTRUCTURE OVERVIEW

### **Server Allocation**

| Server | Role | Specs | IP Address | Services |
|--------|------|-------|------------|----------|
| **VM Ubuntu 1** | Frontend & Gateway | 8C/16GB/100GB | 192.168.1.10 | Next.js, Kong, Nginx |
| **VM Ubuntu 2** | Backend Services | 8C/16GB/100GB | 192.168.1.11 | Auth, Dashboard, Sister, Redis |
| **Windows Server 1** | Monitoring | 16GB/Xeon 5218R | 192.168.1.12 | Prometheus, Grafana |
| **Windows Server 2** | Database | 16GB/Xeon 5218R | 192.168.1.13 | SQL Server 2022 |

---

## 🎨 ARCHITECTURE DIAGRAM

```
                              ┌─────────────────────┐
                              │      INTERNET       │
                              │  (Users & Clients)  │
                              └──────────┬──────────┘
                                         │
                                         │ HTTPS (443)
                                         │ HTTP (80)
                                         ▼
                    ┌────────────────────────────────────┐
                    │     FIREWALL / ROUTER              │
                    │     NAT & Port Forwarding          │
                    └────────────────────────────────────┘
                                         │
                       ┌─────────────────┴─────────────────┐
                       │                                   │
                       ▼                                   ▼
         ┌──────────────────────────┐        ┌──────────────────────────┐
         │   PUBLIC ZONE (DMZ)      │        │   MANAGEMENT ZONE        │
         │                          │        │                          │
         │  ┌────────────────────┐  │        │  ┌────────────────────┐  │
         │  │  VM UBUNTU 1       │  │        │  │  WINDOWS SERVER 1  │  │
         │  │  192.168.1.10      │  │        │  │  192.168.1.12      │  │
         │  │  8C / 16GB RAM     │  │        │  │  16GB / Xeon 5218R │  │
         │  ├────────────────────┤  │        │  ├────────────────────┤  │
         │  │                    │  │        │  │                    │  │
         │  │ 📱 Next.js         │  │        │  │ 📊 Prometheus      │  │
         │  │    Frontend        │  │        │  │    Port: 9090      │  │
         │  │    Port: 3000      │  │        │  │                    │  │
         │  │                    │  │        │  │ 📈 Grafana         │  │
         │  │ 🚪 Kong Gateway    │  │        │  │    Port: 3002      │  │
         │  │    Port: 9800      │  │        │  │                    │  │
         │  │                    │  │        │  │ 🔔 AlertManager    │  │
         │  │ 🌐 Nginx           │  │        │  │    Port: 9093      │  │
         │  │    Port: 80/443    │  │        │  │                    │  │
         │  │                    │  │        │  └────────────────────┘  │
         │  │ 📡 Exporters       │  │        │           ▲              │
         │  │    9100, 8090      │  │        │           │ Scraping    │
         │  └──────────┬─────────┘  │        │           │ Metrics     │
         │             │             │        └───────────┼──────────────┘
         └─────────────┼─────────────┘                    │
                       │                                  │
                       │ Internal Network                 │
                       │ (Private Communication)          │
                       ▼                                  │
         ┌──────────────────────────────────────────────┐ │
         │       PRIVATE ZONE (Backend Services)        │ │
         │                                              │ │
         │  ┌────────────────────────────────────────┐ │ │
         │  │     VM UBUNTU 2 - 192.168.1.11         │ │ │
         │  │     8C / 16GB RAM / 100GB Storage      │ │ │
         │  ├────────────────────────────────────────┤ │ │
         │  │                                        │ │ │
         │  │  ╔══════════════════════════════════╗ │ │ │
         │  │  ║   CURRENT SERVICES (Phase 1)    ║ │ │ │
         │  │  ╠══════════════════════════════════╣ │ │ │
         │  │  ║                                  ║ │ │ │
         │  │  ║  🔐 Auth Service (Laravel)      ║ │ │ │
         │  │  ║     - JWT Authentication        ║ │ │ │
         │  │  ║     - User Management           ║ │ │ │
         │  │  ║     - RBAC & Permissions        ║ │ │ │
         │  │  ║     Port: 8081                  ║ │ │ │
         │  │  ║     RAM: ~100MB                 ║ │ │ │
         │  │  ║                                  ║ │ │ │
         │  │  ║  📊 Dashboard Service (Laravel) ║ │ │ │
         │  │  ║     - Analytics & Reporting     ║ │ │ │
         │  │  ║     - Data Aggregation          ║ │ │ │
         │  │  ║     Port: 8082                  ║ │ │ │
         │  │  ║     RAM: ~100MB                 ║ │ │ │
         │  │  ║                                  ║ │ │ │
         │  │  ║  🎓 Sister Service (Go/Fiber)   ║ │ │ │
         │  │  ║     - SISTER API Integration    ║ │ │ │
         │  │  ║     - Dosen Data Sync           ║ │ │ │
         │  │  ║     - API Config Management     ║ │ │ │
         │  │  ║     - AES-256-GCM Encryption    ║ │ │ │
         │  │  ║     Port: 8083                  ║ │ │ │
         │  │  ║     RAM: ~50MB                  ║ │ │ │
         │  │  ║                                  ║ │ │ │
         │  │  ╚══════════════════════════════════╝ │ │ │
         │  │                                        │ │ │
         │  │  ┌──────────────────────────────────┐ │ │ │
         │  │  │  FUTURE SERVICES (Ready to Add)  │ │ │ │
         │  │  ├──────────────────────────────────┤ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  📚 Akademik Service (Port 8084) │ │ │ │
         │  │  │     - Mahasiswa Management       │ │ │ │
         │  │  │     - Mata Kuliah & Kurikulum    │ │ │ │
         │  │  │     - KRS & Jadwal               │ │ │ │
         │  │  │     - Nilai & Transkrip          │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  💰 Keuangan Service (Port 8085) │ │ │ │
         │  │  │     - Pembayaran Mahasiswa       │ │ │ │
         │  │  │     - Payment Gateway            │ │ │ │
         │  │  │     - Invoice & Receipt          │ │ │ │
         │  │  │     - Beasiswa                   │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  📝 PMB Service (Port 8086)      │ │ │ │
         │  │  │     - Pendaftaran Online         │ │ │ │
         │  │  │     - Seleksi & Ujian CBT        │ │ │ │
         │  │  │     - Registrasi Ulang           │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  📄 PDDIKTI Service (Port 8087)  │ │ │ │
         │  │  │     - Feeder Integration         │ │ │ │
         │  │  │     - Data Validation            │ │ │ │
         │  │  │     - Reporting ke Dikti         │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  👥 SDM Service (Port 8088)      │ │ │ │
         │  │  │     - Dosen & Staff Management   │ │ │ │
         │  │  │     - Presensi & Absensi         │ │ │ │
         │  │  │     - Kepegawaian                │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  📚 Perpustakaan (Port 8089)     │ │ │ │
         │  │  │  📧 Notification (Port 8090)     │ │ │ │
         │  │  │  📊 Analytics (Port 8091)        │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  └──────────────────────────────────┘ │ │ │
         │  │                                        │ │ │
         │  │  ┌──────────────────────────────────┐ │ │ │
         │  │  │   INFRASTRUCTURE LAYER           │ │ │ │
         │  │  ├──────────────────────────────────┤ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  🔴 Redis                        │ │ │ │
         │  │  │     - Cache (Session, API)       │ │ │ │
         │  │  │     - Queue (Background Jobs)    │ │ │ │
         │  │  │     - Pub/Sub (Events)           │ │ │ │
         │  │  │     Port: 6379                   │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  │  🌐 Nginx (Internal Proxy)       │ │ │ │
         │  │  │  📡 Exporters (Monitoring)       │ │ │ │
         │  │  │                                   │ │ │ │
         │  │  └──────────────────────────────────┘ │ │ │
         │  │                                        │ │ │
         │  └────────────────┬───────────────────────┘ │ │
         │                   │                         │ │
         └───────────────────┼─────────────────────────┘ │
                             │                           │
                             │ Database Connection       │
                             │ Port 1433                 │
                             ▼                           │
         ┌──────────────────────────────────────────────┐ │
         │       DATA ZONE (Database Server)            │ │
         │                                              │ │
         │  ┌────────────────────────────────────────┐ │ │
         │  │   WINDOWS SERVER 2 - 192.168.1.13      │ │ │
         │  │   16GB RAM / Intel Xeon Gold 5218R     │ │ │
         │  ├────────────────────────────────────────┤ │ │
         │  │                                        │ │ │
         │  │  💾 SQL Server 2022                   │ │ │
         │  │     - pdut_dev (Production DB)        │ │ │
         │  │     - Automated Backups               │ │ │
         │  │     Port: 1433                        │ │ │
         │  │                                        │ │ │
         │  │  📦 Database Schemas:                 │ │ │
         │  │     • auth (Users, Roles)             │ │ │
         │  │     • akademik (Mahasiswa, Dosen)     │ │ │
         │  │     • keuangan (Payments)             │ │ │
         │  │     • sister (SISTER Data)            │ │ │
         │  │     • pddikti (Feeder Data)           │ │ │
         │  │     • setting (Configuration)         │ │ │
         │  │                                        │ │ │
         │  └────────────────────────────────────────┘ │ │
         │                                              │ │
         └──────────────────────────────────────────────┘ │
                                                          │
              (All services report metrics) ──────────────┘
```

---

## 🔄 DATA FLOW ARCHITECTURE

### **1. User Request Flow (Frontend → Backend → Database)**

```
Step 1: User opens browser
┌──────────┐
│  USER    │  https://myunila.ac.id
│ (Browser)│
└────┬─────┘
     │
     │ ① HTTPS Request (Port 443)
     │
     ▼
┌─────────────────┐
│  Nginx          │  ← SSL Termination (Let's Encrypt)
│  (VM Ubuntu 1)  │  ← Security Headers
│  Port: 80/443   │  ← Gzip Compression
└────┬────────────┘
     │
     │ ② Proxy Pass to Frontend
     │    http://frontend:3000
     │
     ▼
┌─────────────────┐
│  Next.js        │  ← Server-Side Rendering
│  Frontend       │  ← React Components
│  Port: 3000     │  ← TypeScript
└────┬────────────┘
     │
     │ ③ API Call to Backend
     │    https://api.myunila.ac.id/auth-service/api/v1/login
     │
     ▼
┌─────────────────┐
│  Kong Gateway   │  ← Rate Limiting (100 req/min)
│  (VM Ubuntu 1)  │  ← Authentication Check
│  Port: 9800     │  ← Logging & Monitoring
└────┬────────────┘  ← Route to Backend Services
     │
     │ ④ Route to Backend Service
     │    http://192.168.1.11:8081/api/v1/login
     │
     ▼
┌─────────────────┐
│  Auth Service   │  ← JWT Token Generation
│  (VM Ubuntu 2)  │  ← Password Hashing (bcrypt)
│  Port: 8081     │  ← Business Logic
└────┬────────────┘  ← Session Management
     │
     │ ⑤ Database Query
     │    SELECT * FROM auth.users WHERE email = ?
     │
     ▼
┌─────────────────┐
│  SQL Server     │  ← Query Execution
│  (Win Server 2) │  ← Transaction Management
│  Port: 1433     │  ← Data Retrieval
└────┬────────────┘
     │
     │ ⑥ Return Data
     │
     ▼
    Response flows back through the same path
    (Database → Auth → Kong → Frontend → Nginx → User)
```

### **2. SISTER API Integration Flow**

```
┌────────────────┐
│  Admin User    │  Trigger: "Sync Data Dosen"
│  (Frontend)    │
└───────┬────────┘
        │
        │ POST /public/dosen/sync
        │
        ▼
┌─────────────────────┐
│  Sister Service     │
│  (VM Ubuntu 2)      │
│  Port: 8083         │
└──────┬──────────────┘
       │
       │ ① Get API Config from Database
       │    (Credentials encrypted with AES-256-GCM)
       │
       ▼
┌─────────────────┐
│  SQL Server     │
│  setting.       │  SELECT * FROM api_configs
│  api_configs    │  WHERE api_code = 'SISTER'
└──────┬──────────┘
       │
       │ ② Decrypt Credentials
       │
       ▼
┌──────────────────────────────┐
│  SISTER API (External)       │
│  sister-api.kemdikbud.go.id  │
└──────┬───────────────────────┘
       │
       │ ③ Authenticate
       │    POST /ws.php/1.0/authorize
       │    Response: JWT Token
       │
       │ ④ Fetch Dosen Data
       │    GET /ws.php/1.0/referensi/sdm?id_sp=xxx
       │    Headers: Authorization Bearer {token}
       │
       │ ⑤ Process & Transform Data
       │    - Map SISTER fields to local schema
       │    - Validate data
       │    - Handle errors
       │
       ▼
┌─────────────────┐
│  SQL Server     │
│  sister.dosen   │  MERGE INTO dosen ...
└─────────────────┘  (Insert/Update records)
       │
       │ ⑥ Log Sync Results
       │
       ▼
┌─────────────────┐
│  SQL Server     │
│  setting.       │  INSERT INTO sync_logs
│  sync_logs      │  (status, records, duration)
└─────────────────┘
```

### **3. Monitoring & Metrics Flow**

```
┌─────────────────────────────────────────────────┐
│  All Servers (Ubuntu VMs + Windows)             │
│                                                 │
│  ┌──────────────┐  ┌──────────────┐           │
│  │node-exporter │  │  cadvisor    │           │
│  │Port: 9100    │  │  Port: 8090  │           │
│  └──────┬───────┘  └──────┬───────┘           │
│         │                  │                    │
│         │ Expose Metrics   │                    │
│         │ HTTP Endpoint    │                    │
│         │                  │                    │
└─────────┼──────────────────┼────────────────────┘
          │                  │
          │                  │
          │ HTTP GET (every 15 seconds)
          │                  │
          ▼                  ▼
┌─────────────────────────────────────┐
│  Prometheus (Windows Server 1)      │
│  Port: 9090                         │
├─────────────────────────────────────┤
│  • Scrape metrics from exporters    │
│  • Store time-series data           │
│  • Retention: 30 days               │
│  • Evaluate alert rules             │
└────────────┬────────────────────────┘
             │
             │ PromQL Query
             │
             ▼
┌─────────────────────────────────────┐
│  Grafana (Windows Server 1)         │
│  Port: 3002                         │
├─────────────────────────────────────┤
│  • Query Prometheus                 │
│  • Render Dashboards                │
│  • Send Alerts (Email/Slack)        │
│  • User Authentication              │
└─────────────────────────────────────┘
             │
             │ View Dashboards
             │
             ▼
┌─────────────────────────────────────┐
│  Admin User (Browser)               │
│  http://monitoring.myunila.ac.id    │
└─────────────────────────────────────┘
```

---

## 🏢 DETAILED SERVICE ARCHITECTURE

### **Current Services (Phase 1 - Deployed)** ✅

#### **1. Auth Service (Laravel/PHP)**

```
╔═══════════════════════════════════════════════════════════╗
║              AUTH SERVICE (Laravel 11)                    ║
╠═══════════════════════════════════════════════════════════╣
║  Language: PHP 8.2                                        ║
║  Framework: Laravel 11                                    ║
║  Port: 8081                                               ║
║  RAM Usage: ~100-150MB                                    ║
║  CPU Usage: 1-5%                                          ║
╠═══════════════════════════════════════════════════════════╣
║  RESPONSIBILITIES:                                        ║
║  • User Authentication (JWT)                              ║
║  • User Registration & Profile Management                 ║
║  • Password Reset & Email Verification                    ║
║  • Role-Based Access Control (RBAC)                       ║
║  • Permission Management                                  ║
║  • OAuth2 Integration (Future)                            ║
║  • Session Management (Redis)                             ║
║  • API Token Management                                   ║
╠═══════════════════════════════════════════════════════════╣
║  DEPENDENCIES:                                            ║
║  • SQL Server: auth schema (users, roles, permissions)    ║
║  • Redis: Session storage, Token blacklist                ║
╠═══════════════════════════════════════════════════════════╣
║  KEY ENDPOINTS:                                           ║
║  POST   /api/v1/login        - User login                 ║
║  POST   /api/v1/register     - User registration          ║
║  POST   /api/v1/logout       - User logout                ║
║  GET    /api/v1/me           - Get current user           ║
║  POST   /api/v1/refresh      - Refresh JWT token          ║
║  POST   /api/v1/forgot       - Forgot password            ║
║  GET    /api/v1/users        - List users (Admin)         ║
║  POST   /api/v1/roles        - Manage roles               ║
╠═══════════════════════════════════════════════════════════╣
║  SECURITY FEATURES:                                       ║
║  • JWT Token (HS256)                                      ║
║  • Password Hashing (bcrypt)                              ║
║  • Rate Limiting (via Kong)                               ║
║  • CSRF Protection                                        ║
║  • XSS Protection                                         ║
╚═══════════════════════════════════════════════════════════╝
```

#### **2. Dashboard Service (Laravel/PHP)**

```
╔═══════════════════════════════════════════════════════════╗
║           DASHBOARD SERVICE (Laravel 11)                  ║
╠═══════════════════════════════════════════════════════════╣
║  Language: PHP 8.2                                        ║
║  Framework: Laravel 11                                    ║
║  Port: 8082                                               ║
║  RAM Usage: ~100-150MB                                    ║
║  CPU Usage: 1-5%                                          ║
╠═══════════════════════════════════════════════════════════╣
║  RESPONSIBILITIES:                                        ║
║  • Analytics & Business Intelligence                      ║
║  • Data Aggregation from Multiple Sources                 ║
║  • Report Generation (PDF, Excel, CSV)                    ║
║  • Charts & Visualizations                                ║
║  • Real-time Statistics                                   ║
║  • Custom Dashboard Builder                               ║
╠═══════════════════════════════════════════════════════════╣
║  DEPENDENCIES:                                            ║
║  • SQL Server: All schemas (cross-schema queries)         ║
║  • Redis: Cache for expensive queries                     ║
║  • Auth Service: User authentication                      ║
╠═══════════════════════════════════════════════════════════╣
║  KEY FEATURES:                                            ║
║  • Export to PDF (using DomPDF)                           ║
║  • Export to Excel (using PhpSpreadsheet)                 ║
║  • Chart.js Integration                                   ║
║  • Scheduled Reports (via Laravel Queue)                  ║
║  • Email Reports                                          ║
╚═══════════════════════════════════════════════════════════╝
```

#### **3. Sister Service (Go/Fiber)**

```
╔═══════════════════════════════════════════════════════════╗
║            SISTER SERVICE (Go 1.22 + Fiber)               ║
╠═══════════════════════════════════════════════════════════╣
║  Language: Go 1.22                                        ║
║  Framework: Fiber v2                                      ║
║  Port: 8083                                               ║
║  RAM Usage: ~30-50MB                                      ║
║  CPU Usage: 0.5-3%                                        ║
╠═══════════════════════════════════════════════════════════╣
║  RESPONSIBILITIES:                                        ║
║  • SISTER API Integration (Kemdikbud)                     ║
║  • Dosen Data Synchronization                             ║
║  • Referensi Data Management (34+ endpoints)              ║
║  • API Configuration Management                           ║
║  • Credential Encryption (AES-256-GCM)                    ║
║  • Sync Logging & Monitoring                              ║
║  • Automatic Retry Mechanism                              ║
║  • Rate Limiting                                          ║
╠═══════════════════════════════════════════════════════════╣
║  DEPENDENCIES:                                            ║
║  • SQL Server: sister, setting schemas                    ║
║  • Redis: Cache API responses, Queue sync jobs            ║
║  • SISTER API: External Kemdikbud API                     ║
╠═══════════════════════════════════════════════════════════╣
║  KEY ENDPOINTS:                                           ║
║  GET    /health                    - Health check         ║
║  POST   /public/dosen/sync         - Sync dosen data      ║
║  GET    /public/dosen              - List dosen           ║
║  GET    /public/referensi/:type    - Get referensi       ║
║  POST   /public/referensi/sync     - Sync referensi      ║
║  GET    /public/api-configs        - List API configs     ║
║  POST   /public/api-configs        - Create API config    ║
║  GET    /public/sync-logs          - Get sync logs        ║
║  GET    /public/monitoring/active  - System status        ║
╠═══════════════════════════════════════════════════════════╣
║  FEATURES:                                                ║
║  • Concurrent Sync (Goroutines)                           ║
║  • Bulk Operations (1000+ records)                        ║
║  • Error Recovery                                         ║
║  • Progress Tracking                                      ║
║  • Detailed Logging                                       ║
╚═══════════════════════════════════════════════════════════╝
```

---

### **Future Services (Roadmap)** 🔜

#### **4. Akademik Service (Go/Laravel)**

```
┌───────────────────────────────────────────────────────────┐
│           AKADEMIK SERVICE (Port 8084)                    │
├───────────────────────────────────────────────────────────┤
│  Status: 🔜 Planned Q1 2026                               │
│  Estimated RAM: ~150-200MB                                │
├───────────────────────────────────────────────────────────┤
│  MODULES:                                                 │
│                                                           │
│  📚 Mahasiswa Management:                                 │
│     • Data Pribadi & Keluarga                             │
│     • Riwayat Pendidikan                                  │
│     • Status Mahasiswa (Aktif/Cuti/DO/Lulus)             │
│     • Beasiswa & Prestasi                                 │
│                                                           │
│  📖 Mata Kuliah & Kurikulum:                              │
│     • Daftar Mata Kuliah per Program Studi                │
│     • SKS & Beban Studi                                   │
│     • Prasyarat Mata Kuliah                               │
│     • Kurikulum per Tahun Ajaran                          │
│                                                           │
│  📝 KRS (Kartu Rencana Studi):                            │
│     • Input KRS Online                                    │
│     • Validasi Beban SKS                                  │
│     • Approval Dosen Wali                                 │
│     • Validasi Jadwal (Conflict Detection)                │
│     • Add/Drop Period                                     │
│                                                           │
│  🕐 Jadwal Perkuliahan:                                   │
│     • Penjadwalan Otomatis (Auto-scheduling)              │
│     • Conflict Detection                                  │
│     • Ruangan & Resource Management                       │
│     • Dosen Assignment                                    │
│                                                           │
│  📊 Nilai & Transkrip:                                    │
│     • Input Nilai (Dosen)                                 │
│     • Perhitungan IP/IPK Otomatis                         │
│     • Generate Transkrip                                  │
│     • Yudisium                                            │
└───────────────────────────────────────────────────────────┘
```

#### **5. Keuangan Service (Go/Laravel)**

```
┌───────────────────────────────────────────────────────────┐
│           KEUANGAN SERVICE (Port 8085)                    │
├───────────────────────────────────────────────────────────┤
│  Status: 🔜 Planned Q2 2026                               │
│  Estimated RAM: ~150-200MB                                │
├───────────────────────────────────────────────────────────┤
│  MODULES:                                                 │
│                                                           │
│  💰 Pembayaran Mahasiswa:                                 │
│     • Tagihan SPP per Semester                            │
│     • Biaya Pendaftaran (PMB)                             │
│     • Biaya Wisuda                                        │
│     • Biaya Lain-lain (Sertifikat, dll)                   │
│                                                           │
│  💳 Payment Gateway Integration:                          │
│     • Virtual Account (BCA, Mandiri, BNI)                 │
│     • E-Wallet (OVO, GoPay, Dana, ShopeePay)             │
│     • Credit/Debit Card                                   │
│     • QRIS                                                │
│     • Transfer Bank Manual                                │
│                                                           │
│  📄 Invoice & Receipt:                                    │
│     • Generate Invoice Otomatis                           │
│     • Print Receipt (PDF)                                 │
│     • Email Notification                                  │
│     • Invoice History                                     │
│                                                           │
│  🎓 Beasiswa:                                             │
│     • Pendaftaran Beasiswa Online                         │
│     • Verifikasi Dokumen                                  │
│     • Approval Workflow                                   │
│     • Pencairan Dana                                      │
│                                                           │
│  📊 Financial Reporting:                                  │
│     • Laporan Penerimaan                                  │
│     • Laporan Tunggakan                                   │
│     • Rekapitulasi per Fakultas                           │
│     • Export to Excel                                     │
└───────────────────────────────────────────────────────────┘
```

#### **6. PMB Service (Penerimaan Mahasiswa Baru)**

```
┌───────────────────────────────────────────────────────────┐
│       PMB SERVICE - Port 8086                             │
├───────────────────────────────────────────────────────────┤
│  Status: 🔜 Planned Q1 2026                               │
│  Estimated RAM: ~100-150MB                                │
├───────────────────────────────────────────────────────────┤
│  MODULES:                                                 │
│                                                           │
│  📝 Pendaftaran Online:                                   │
│     • Form Biodata Calon Mahasiswa                        │
│     • Upload Dokumen (KTP, Ijazah, Foto)                  │
│     • Pilihan Program Studi                               │
│     • Payment Gateway Integration                         │
│                                                           │
│  ✍️ Seleksi & Ujian:                                     │
│     • Ujian Online (CBT - Computer Based Test)            │
│     • Timer & Auto Submit                                 │
│     • Penilaian Otomatis                                  │
│     • Ranking & Passing Grade                             │
│     • Ujian Wawancara (Scoring)                           │
│                                                           │
│  📢 Pengumuman:                                           │
│     • Hasil Seleksi Online                                │
│     • Notifikasi Email & SMS                              │
│     • Cetak Kartu Peserta                                 │
│                                                           │
│  ✅ Registrasi Ulang:                                     │
│     • Verifikasi Dokumen Asli                             │
│     • Pembayaran Biaya Kuliah                             │
│     • Generate NIM (Nomor Induk Mahasiswa)                │
│     • Cetak Kartu Mahasiswa                               │
└───────────────────────────────────────────────────────────┘
```

#### **7. PDDIKTI Service (Feeder Integration)**

```
┌───────────────────────────────────────────────────────────┐
│           PDDIKTI SERVICE (Port 8087)                     │
├───────────────────────────────────────────────────────────┤
│  Status: 🔜 Planned Q1 2026                               │
│  Language: Go (for performance)                           │
│  Estimated RAM: ~50-100MB                                 │
├───────────────────────────────────────────────────────────┤
│  RESPONSIBILITIES:                                        │
│                                                           │
│  📡 Feeder Integration:                                   │
│     • Web Service PDDIKTI Dikti                           │
│     • Data Mahasiswa Upload                               │
│     • Data Dosen Upload                                   │
│     • Data Perkuliahan Upload                             │
│     • Automatic Sync Schedule                             │
│                                                           │
│  ✔️ Data Validation:                                      │
│     • NIK Validation (Dukcapil)                           │
│     • NISN Validation                                     │
│     • Data Completeness Check                             │
│     • Business Rules Validation                           │
│     • Error Detection & Reporting                         │
│                                                           │
│  📊 Reporting ke Dikti:                                   │
│     • Periodic Sync (Daily/Weekly)                        │
│     • Manual Upload                                       │
│     • Status Monitoring                                   │
│     • Error Log Management                                │
└───────────────────────────────────────────────────────────┘
```

#### **8-11. Additional Services**

```
┌───────────────────────────────────────────────────────────┐
│  👥 SDM Service (Port 8088) - Q2 2026                     │
├───────────────────────────────────────────────────────────┤
│  • Dosen & Staff Management                               │
│  • Presensi & Absensi (Fingerprint Integration)          │
│  • Cuti & Izin Workflow                                   │
│  • Penilaian Kinerja                                      │
│  • Surat Tugas & Perjalanan Dinas                         │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  📚 Perpustakaan Service (Port 8089) - Q3 2026            │
├───────────────────────────────────────────────────────────┤
│  • Katalog Buku (OPAC)                                    │
│  • Peminjaman & Pengembalian                              │
│  • Denda Keterlambatan                                    │
│  • Digital Library (E-Book, E-Journal)                    │
│  • Barcode/RFID Integration                               │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  📧 Notification Service (Port 8090) - Q2 2026            │
├───────────────────────────────────────────────────────────┤
│  • Email Service (SMTP)                                   │
│  • SMS Gateway                                            │
│  • Push Notifications (Mobile App)                        │
│  • WhatsApp Business API                                  │
│  • Notification Templates                                 │
│  • Queue Management                                       │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│  📊 Analytics Service (Port 8091) - Q4 2026               │
├───────────────────────────────────────────────────────────┤
│  • Data Warehouse (ETL)                                   │
│  • Business Intelligence                                  │
│  • Advanced Reporting Engine                              │
│  • Predictive Analytics                                   │
│  • Data Mining                                            │
└───────────────────────────────────────────────────────────┘
```

---

## 📈 CAPACITY PLANNING

### **Resource Usage Projection**

| Phase | Services | Estimated RAM | Estimated CPU | Concurrent Users | Status |
|-------|----------|---------------|---------------|------------------|--------|
| **Phase 1** (Current) | 3 services | 400MB (2.5%) | 1-3% | 200-400 | ✅ Deployed |
| **Phase 2** (Q1 2026) | 6 services | ~1.5GB (9%) | 5-10% | 500-800 | 🔜 Planned |
| **Phase 3** (Q2 2026) | 9 services | ~2.5GB (15%) | 10-20% | 1000-1500 | 🔜 Planned |
| **Phase 4** (Q4 2026) | 12+ services | ~4GB (25%) | 20-40% | 2000+ | 🔜 Planned |
| **Maximum** | 20 services | ~12GB (75%) | 60-80% | 5000+ | Future |

**Conclusion:** Current VM Ubuntu 2 (16GB RAM) dapat menampung hingga **20 microservices** sebelum perlu tambahan server.

---

## 🔒 SECURITY ARCHITECTURE

### **Multi-Layer Security**

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: NETWORK PERIMETER                              │
├─────────────────────────────────────────────────────────┤
│ • Firewall (UFW on Ubuntu, Windows Firewall)           │
│ • DDoS Protection (CloudFlare/External)                 │
│ • WAF - Web Application Firewall                        │
│ • IP Whitelisting for Admin                            │
│ • Fail2Ban (Brute Force Protection)                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 2: APPLICATION GATEWAY                            │
├─────────────────────────────────────────────────────────┤
│ • SSL/TLS Encryption (Let's Encrypt)                    │
│ • Kong Gateway:                                         │
│   - Rate Limiting (100 req/min per IP)                  │
│   - JWT Authentication                                  │
│   - Request/Response Logging                            │
│   - API Key Validation                                  │
│ • CORS Configuration                                    │
│ • Security Headers (HSTS, CSP, X-Frame-Options)        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 3: SERVICE SECURITY                               │
├─────────────────────────────────────────────────────────┤
│ • Service-to-Service Authentication                     │
│ • Input Validation & Sanitization                       │
│ • SQL Injection Prevention (Parameterized Queries)      │
│ • XSS Protection                                        │
│ • CSRF Protection (Laravel)                             │
│ • File Upload Validation                                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ Layer 4: DATA SECURITY                                  │
├─────────────────────────────────────────────────────────┤
│ • Database Encryption at Rest                           │
│ • API Credentials Encryption (AES-256-GCM)              │
│ • Password Hashing (bcrypt, cost: 12)                   │
│ • Redis Password Protection                             │
│ • Database User Permissions (Least Privilege)           │
│ • Automated Backups (Encrypted)                         │
│ • Audit Logging                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 SCALABILITY OPTIONS

### **Option 1: Vertical Scaling (Current)**
```
┌─────────────────────────┐
│  VM Ubuntu 2            │
│  Single Server          │
│  8C / 16GB RAM          │
│  All Backend Services   │
│  Capacity: 2000 users   │
└─────────────────────────┘
```

### **Option 2: Horizontal Scaling (Future)**
```
┌──────────────────────────────────────────────┐
│          LOAD BALANCER (HAProxy)             │
│          192.168.1.5                         │
└────────────┬─────────────────────────┬───────┘
             │                         │
     ┌───────▼────────┐       ┌───────▼────────┐
     │  VM Ubuntu 2   │       │  VM Ubuntu 4   │
     │  Backend #1    │       │  Backend #2    │
     │  192.168.1.11  │       │  192.168.1.21  │
     └────────────────┘       └────────────────┘
             │                         │
             └─────────┬───────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Redis Cluster │
              │  (High Avail.) │
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  SQL Server    │
              │  (Win Server 2)│
              └────────────────┘

Capacity: 5000+ users
```

---

## 🎯 DEPLOYMENT ROADMAP

### **Phase 1: Foundation** ✅ (Q4 2025 - Current)
- ✅ Auth Service
- ✅ Dashboard Service
- ✅ Sister Service
- ✅ Monitoring Stack (Prometheus + Grafana)
- ✅ Production Infrastructure

**Status:** Deployed & Stable
**Users:** 200-400 concurrent
**Services:** 3

---

### **Phase 2: Academic Core** 🔜 (Q1 2026 - 3 months)
- 🔜 Akademik Service (Mahasiswa, Jadwal, KRS, Nilai)
- 🔜 PMB Service (Pendaftaran Online, Seleksi)
- 🔜 PDDIKTI Service (Feeder Integration)

**Target:** January - March 2026
**Expected Users:** 500-800 concurrent
**Total Services:** 6

---

### **Phase 3: Finance & Admin** 🔜 (Q2 2026 - 3 months)
- 🔜 Keuangan Service (Pembayaran, Beasiswa)
- 🔜 SDM Service (Dosen, Staff, Presensi)
- 🔜 Notification Service (Email, SMS, Push)

**Target:** April - June 2026
**Expected Users:** 1000-1500 concurrent
**Total Services:** 9

---

### **Phase 4: Advanced Features** 🔜 (Q3-Q4 2026 - 6 months)
- 🔜 Perpustakaan Service
- 🔜 Analytics Service (BI & Data Warehouse)
- 🔜 Mobile App Integration
- 🔜 Advanced Reporting

**Target:** July - December 2026
**Expected Users:** 2000+ concurrent
**Total Services:** 12+

---

## 💻 TECHNOLOGY STACK

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 15.x | Web Application UI |
| | React | 18.x | Component Library |
| | TypeScript | 5.x | Type Safety |
| | Tailwind CSS | 3.x | Styling |
| | HeroUI | Latest | UI Components |
| **API Gateway** | Kong | 3.4 | Routing, Auth, Rate Limiting |
| | PostgreSQL | 13 | Kong Configuration DB |
| **Backend (Go)** | Go | 1.22 | High-Performance Services |
| | Fiber | v2 | Web Framework |
| **Backend (PHP)** | PHP | 8.2 | Laravel Services |
| | Laravel | 11.x | Web Framework |
| | Composer | 2.x | Dependency Management |
| **Database** | SQL Server | 2022 | Primary Database |
| | go-mssqldb | Latest | Go SQL Server Driver |
| **Cache/Queue** | Redis | 7.x | Cache, Session, Queue |
| **Monitoring** | Prometheus | 2.48 | Metrics Collection |
| | Grafana | 10.x | Visualization |
| | cAdvisor | Latest | Container Metrics |
| | Node Exporter | Latest | Host Metrics |
| **Web Server** | Nginx | Alpine | Reverse Proxy, SSL |
| **Container** | Docker | Latest | Containerization |
| | Docker Compose | v2 | Orchestration |
| **OS** | Ubuntu | 22.04 LTS | VM Operating System |
| | Windows Server | 2022 | Database & Monitoring |

---

## 📝 BEST PRACTICES

### **Development Guidelines**

1. **Microservices Communication:**
   - Internal: HTTP REST API
   - Real-time: Redis Pub/Sub
   - Async: Redis Queue

2. **Database Design:**
   - Schema per domain (auth, akademik, keuangan)
   - Foreign keys dengan ON DELETE CASCADE
   - Indexes pada frequently queried columns
   - Soft deletes untuk audit trail

3. **API Design:**
   - RESTful endpoints
   - Versioning: /api/v1/
   - Consistent response format
   - Proper HTTP status codes
   - Pagination untuk list endpoints

4. **Error Handling:**
   - Centralized error handler
   - Structured logging
   - Error codes untuk client
   - Stack trace di development only

5. **Security:**
   - Never log sensitive data
   - Use environment variables
   - Validate all inputs
   - Sanitize outputs
   - Regular dependency updates

---

## 🔍 MONITORING & OBSERVABILITY

### **What We Monitor:**

```
┌─────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE METRICS                                  │
├─────────────────────────────────────────────────────────┤
│  • CPU Usage (per core)                                 │
│  • Memory Usage (total, available, cached)              │
│  • Disk Usage (/, /data)                                │
│  • Network I/O (bytes in/out, packets)                  │
│  • Load Average (1m, 5m, 15m)                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  APPLICATION METRICS                                     │
├─────────────────────────────────────────────────────────┤
│  • Request Rate (req/sec)                               │
│  • Response Time (avg, p50, p95, p99)                   │
│  • Error Rate (4xx, 5xx)                                │
│  • Active Connections                                   │
│  • Queue Length (Redis)                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  BUSINESS METRICS                                        │
├─────────────────────────────────────────────────────────┤
│  • Active Users (daily, monthly)                        │
│  • Registrations (per day)                              │
│  • Failed Logins                                        │
│  • SISTER Sync Success Rate                             │
│  • Payment Transactions                                 │
└─────────────────────────────────────────────────────────┘
```

### **Alerting Rules:**

- CPU > 80% for 5 minutes
- Memory > 90% for 5 minutes
- Disk > 85%
- Service down for 1 minute
- Error rate > 5% for 5 minutes
- Response time > 2s (p95)

---

## 📞 SUPPORT & MAINTENANCE

### **Operational Tasks:**

**Daily:**
- Check monitoring dashboards
- Review error logs
- Check backup status

**Weekly:**
- Review security logs
- Check disk space
- Update documentation

**Monthly:**
- Security updates
- Performance review
- Capacity planning review
- Backup testing

**Quarterly:**
- Security audit
- Disaster recovery drill
- Architecture review

---

**Document Version:** 1.0
**Last Review:** 2025-10-29
**Next Review:** After Phase 2 Deployment
**Maintained By:** MyUnila DevOps Team

---

**🎯 Key Takeaways:**

1. ✅ Current infrastructure can scale to **20+ microservices**
2. ✅ Supports **200-400 users** now, **5000+ users** with scaling
3. ✅ Clear roadmap for 4 phases (Q4 2025 - Q4 2026)
4. ✅ Security implemented at **4 layers**
5. ✅ Monitoring ready from **day 1**
6. ✅ Technology stack proven and battle-tested

**Ready for production deployment! 🚀**
