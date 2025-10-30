# MyUnila Production Architecture - REVISED

**Revisi untuk menambahkan VM Ubuntu 3 khusus untuk Sync Services**

## 📋 Infrastructure Overview - 5 Servers

### Server Allocation

| Server | Role | Spesifikasi | IP Address | Services | RAM Usage |
|--------|------|-------------|------------|----------|-----------|
| **VM Ubuntu 1** | Frontend + Gateway | 8 core, 16GB RAM, 100GB | 192.168.1.10 | Frontend (Next.js), Kong Gateway, Nginx | ~2GB (12%) |
| **VM Ubuntu 2** | Backend Services | 8 core, 16GB RAM, 100GB | 192.168.1.11 | Auth, Dashboard, Redis | ~2GB (12%) |
| **VM Ubuntu 3** | Sync Services | 8 core, 16GB RAM, 100GB | 192.168.1.14 | Sister, PDDIKTI Feeder, Redis | ~3GB (18%) |
| **Windows Server 1** | Monitoring | 16GB RAM, Xeon Gold 5218R | 192.168.1.12 | Prometheus, Grafana | ~1GB (6%) |
| **Windows Server 2** | Database | 16GB RAM, Xeon Gold 5218R | 192.168.1.13 | SQL Server 2022 | ~4GB (25%) |

**Total Capacity**: 48GB RAM (VMs) + 32GB RAM (Windows) = 80GB RAM

---

## 🏗️ Complete Infrastructure Diagram

```
                              Internet (Users)
                                     |
                                     | HTTPS (443)
                                     | HTTP (80)
                                     ↓
                    ┌────────────────────────────────┐
                    │   FIREWALL / ROUTER            │
                    │   NAT & Port Forwarding        │
                    └────────────────┬───────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ↓                      ↓                      ↓
    ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
    │  PUBLIC DMZ      │   │ PRIVATE BACKEND  │   │  SYNC SERVICES   │
    │                  │   │                  │   │                  │
    │  VM Ubuntu 1     │   │  VM Ubuntu 2     │   │  VM Ubuntu 3     │
    │  192.168.1.10    │   │  192.168.1.11    │   │  192.168.1.14    │
    │                  │   │                  │   │                  │
    │  ┌────────────┐  │   │  ┌────────────┐  │   │  ┌────────────┐  │
    │  │  Frontend  │  │   │  │   Auth     │  │   │  │   Sister   │  │
    │  │ (Next.js)  │  │   │  │  Service   │  │   │  │  Service   │  │
    │  │ Port: 3000 │  │   │  │ Port: 8081 │  │   │  │ Port: 8083 │  │
    │  └────────────┘  │   │  └────────────┘  │   │  └────────────┘  │
    │                  │   │                  │   │                  │
    │  ┌────────────┐  │   │  ┌────────────┐  │   │  ┌────────────┐  │
    │  │   Kong     │  │   │  │ Dashboard  │  │   │  │  PDDIKTI   │  │
    │  │  Gateway   │  │   │  │  Service   │  │   │  │  Feeder    │  │
    │  │ Port: 9800 │  │   │  │ Port: 8082 │  │   │  │ Port: 8084 │  │
    │  └────────────┘  │   │  └────────────┘  │   │  └────────────┘  │
    │                  │   │                  │   │                  │
    │  ┌────────────┐  │   │  ┌────────────┐  │   │  ┌────────────┐  │
    │  │   Nginx    │  │   │  │   Redis    │  │   │  │   Redis    │  │
    │  │ (SSL Term) │  │   │  │ Port: 6379 │  │   │  │ Port: 6379 │  │
    │  │  80/443    │  │   │  └────────────┘  │   │  │ (Sync Q)   │  │
    │  └────────────┘  │   │                  │   │  └────────────┘  │
    └──────────────────┘   └──────────────────┘   └──────────────────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
                                     ↓
                    ┌────────────────────────────────┐
                    │   Windows Server 2 (Database)  │
                    │   192.168.1.13                 │
                    │                                │
                    │   ┌────────────────────────┐   │
                    │   │   SQL Server 2022      │   │
                    │   │   Port: 1433           │   │
                    │   │                        │   │
                    │   │  Databases:            │   │
                    │   │  • auth                │   │
                    │   │  • akademik            │   │
                    │   │  • keuangan            │   │
                    │   │  • sister              │   │
                    │   │  • pddikti             │   │
                    │   │  • setting             │   │
                    │   └────────────────────────┘   │
                    └────────────────────────────────┘

                    ┌────────────────────────────────┐
                    │  Windows Server 1 (Monitoring) │
                    │  192.168.1.12                  │
                    │                                │
                    │  ┌────────────┐ ┌───────────┐  │
                    │  │ Prometheus │ │  Grafana  │  │
                    │  │ Port: 9090 │ │ Port:3000 │  │
                    │  └────────────┘ └───────────┘  │
                    │         ↑                      │
                    │         | Scrapes from         │
                    │         | VM1, VM2, VM3        │
                    └────────────────────────────────┘
```

---

## 🎯 Alasan Pemisahan VM Ubuntu 3 untuk Sync Services

### **Keuntungan Isolasi Sync Services**

1. **Performance Isolation**
   - Sync jobs intensif (SISTER & PDDIKTI) tidak mengganggu Auth/Dashboard
   - Background jobs dapat berjalan tanpa mempengaruhi response time services utama
   - Dedicated Redis untuk sync queue

2. **Resource Management**
   - Sister sync bisa consume RAM/CPU tinggi saat sync ribuan records
   - PDDIKTI Feeder upload bisa memakan waktu lama
   - VM terpisah memastikan resources dedicated untuk sync operations

3. **Scalability**
   - Bisa scale horizontal hanya untuk sync services jika diperlukan
   - Bisa adjust worker count tanpa mempengaruhi backend services
   - Mudah add sync services baru (e.g., EMIS, BKD) tanpa mengganggu existing services

4. **Maintenance & Updates**
   - Update Sister/Feeder service tidak require downtime untuk Auth/Dashboard
   - Restart sync services tidak mempengaruhi user authentication
   - Debugging sync issues lebih mudah dengan isolasi

5. **Monitoring & Troubleshooting**
   - Metrics sync services terpisah dari backend services
   - Easier to identify performance bottlenecks
   - Sync logs tidak bercampur dengan application logs

---

## 📊 Network Zones

| Zone | Server | Access Level | Purpose |
|------|--------|--------------|---------|
| **Public DMZ** | VM Ubuntu 1 | Internet-facing | User interface, API Gateway |
| **Private Backend** | VM Ubuntu 2 | Internal only | Core business logic (Auth, Dashboard) |
| **Sync Services** | VM Ubuntu 3 | Internal only | Data synchronization dengan external APIs |
| **Management** | Windows Server 1 | Internal only | Monitoring, alerting, observability |
| **Data** | Windows Server 2 | Internal only | Centralized database storage |

---

## 🔄 Data Flow Architecture

### **1. User Request Flow**
```
User Browser
    ↓ HTTPS
VM Ubuntu 1 (Nginx → Kong Gateway → Frontend)
    ↓ Internal Network
VM Ubuntu 2 (Auth Service / Dashboard Service)
    ↓ SQL Connection
Windows Server 2 (SQL Server Database)
```

### **2. SISTER API Sync Flow**
```
VM Ubuntu 3 (Sister Service)
    ↓ HTTPS (External API)
SISTER API (sister-api.kemdikbud.go.id)
    ↓ Process & Store
VM Ubuntu 3 (Redis Queue → Background Jobs)
    ↓ SQL Connection
Windows Server 2 (Database - sister schema)
    ↓ Notifications
VM Ubuntu 2 (Dashboard Service - Display sync status)
```

### **3. PDDIKTI Feeder Upload Flow**
```
Windows Server 2 (SQL Server - source data)
    ↓ Read Data
VM Ubuntu 3 (PDDIKTI Feeder Service)
    ↓ Transform & Validate
VM Ubuntu 3 (Redis Queue → Scheduled Jobs)
    ↓ HTTPS Upload
PDDIKTI Neo Feeder API (pddikti.kemdikbud.go.id)
    ↓ Store Results
Windows Server 2 (Database - pddikti schema)
```

### **4. Monitoring Flow**
```
VM Ubuntu 1, 2, 3 (Prometheus Exporters)
    ↓ HTTP Scraping (:9100, :9121, :9113)
Windows Server 1 (Prometheus)
    ↓ Query & Visualize
Windows Server 1 (Grafana)
    ↓ HTTPS
Administrators
```

---

## 🖥️ VM Ubuntu 3 - Detailed Services

### **Sister Service (Port 8083)**
**Technology**: Go 1.22 + Fiber Framework

**Responsibilities**:
- SISTER API authentication & authorization
- Sync dosen data (10,000+ records)
- Sync mahasiswa data
- Sync mata kuliah data
- Sync history & logging
- API config encryption (AES-256-GCM)

**Resources**:
- RAM: ~150MB (base) + ~500MB (during sync)
- CPU: 0.5 core (idle), 2 cores (during sync)

**Background Jobs**:
- Scheduled sync (daily/weekly)
- Manual sync trigger
- Delta sync (incremental updates)

---

### **PDDIKTI Feeder Service (Port 8084)**
**Technology**: Go 1.22 + Fiber Framework (NEW)

**Responsibilities**:
- Connect to PDDIKTI Neo Feeder API
- Upload mahasiswa data
- Upload dosen data
- Upload mata kuliah & kelas
- Upload nilai mahasiswa
- Validation & error handling
- Upload history & status tracking

**Resources**:
- RAM: ~100MB (base) + ~400MB (during upload)
- CPU: 0.5 core (idle), 1-2 cores (during upload)

**Background Jobs**:
- Scheduled upload (per semester)
- Batch upload management
- Retry failed uploads
- Data validation pre-upload

---

### **Redis (Port 6379)**
**Technology**: Redis 7

**Purpose**:
- Sync job queue (Bull/BullMQ)
- Cache for SISTER API responses
- Rate limiting for external APIs
- Temporary storage for sync progress

**Resources**:
- RAM: ~100MB
- CPU: 0.1 core

---

## 📈 Capacity Planning

### **Current Usage (3 Services)**
| Server | Services | Current RAM | Headroom |
|--------|----------|-------------|----------|
| VM Ubuntu 1 | 3 services | 2GB / 16GB | 88% |
| VM Ubuntu 2 | 2 services | 2GB / 16GB | 88% |
| VM Ubuntu 3 | 2 services | 3GB / 16GB | 81% |
| **Total** | **7 services** | **7GB / 48GB** | **85%** |

### **Future Capacity (20 Services)**
| Server | Future Services | Projected RAM | Headroom |
|--------|-----------------|---------------|----------|
| VM Ubuntu 1 | 5 services | 4GB / 16GB | 75% |
| VM Ubuntu 2 | 10 services | 10GB / 16GB | 37% |
| VM Ubuntu 3 | 5 services | 8GB / 16GB | 50% |
| **Total** | **20 services** | **22GB / 48GB** | **54%** |

**Kesimpulan**: Infrastructure saat ini sudah cukup untuk support 20+ microservices tanpa perlu tambahan server.

---

## 🔐 Security Architecture

### **Network Security**
```
Layer 1: Firewall (Router)
    ↓ Allow: 80, 443
Layer 2: Nginx (VM Ubuntu 1)
    ↓ SSL Termination, Rate Limiting
Layer 3: Kong Gateway
    ↓ Authentication, Authorization, Rate Limiting
Layer 4: Backend Services (VM Ubuntu 2 & 3)
    ↓ Internal firewall rules (ufw)
Layer 5: Database (Windows Server 2)
    ↓ SQL authentication, encrypted connections
```

### **Firewall Rules**

**VM Ubuntu 1 (Public-facing)**:
```bash
ufw allow 22/tcp      # SSH (admin only)
ufw allow 80/tcp      # HTTP (redirect to HTTPS)
ufw allow 443/tcp     # HTTPS
ufw deny from any to any  # Deny all else
```

**VM Ubuntu 2 (Private)**:
```bash
ufw allow from 192.168.1.10 to any port 8081  # Auth from VM1
ufw allow from 192.168.1.10 to any port 8082  # Dashboard from VM1
ufw allow from 192.168.1.12 to any port 9100  # Prometheus
ufw allow 22/tcp      # SSH (admin only)
ufw deny from any to any
```

**VM Ubuntu 3 (Sync Services)**:
```bash
ufw allow from 192.168.1.10 to any port 8083  # Sister from VM1
ufw allow from 192.168.1.10 to any port 8084  # Feeder from VM1
ufw allow from 192.168.1.12 to any port 9100  # Prometheus
ufw allow 22/tcp      # SSH (admin only)
ufw deny from any to any
```

---

## 🚀 Deployment Sequence (REVISED)

### **Phase 1: Persiapan (4 hours)**
- Setup 3x VM Ubuntu (1, 2, 3)
- Setup 2x Windows Server (1, 2)
- Install Docker di semua VMs
- Configure SSH keys
- Setup firewall rules

### **Phase 2: Database (2 hours)**
- Install SQL Server 2022 (Windows Server 2)
- Create databases (auth, akademik, keuangan, sister, pddikti, setting)
- Configure network access
- Setup backups

### **Phase 3: Monitoring (3 hours)**
- Install Prometheus (Windows Server 1)
- Install Grafana (Windows Server 1)
- Install exporters di VM1, VM2, VM3
- Configure dashboards

### **Phase 4: VM Ubuntu 2 - Backend Services (4 hours)**
- Deploy Auth Service (Laravel)
- Deploy Dashboard Service (Laravel)
- Deploy Redis
- Run migrations
- Test services

### **Phase 5: VM Ubuntu 3 - Sync Services (4 hours)** ⭐ **NEW**
- Deploy Sister Service (Go)
- Deploy PDDIKTI Feeder Service (Go)
- Deploy Redis (sync queue)
- Configure sync schedules
- Test SISTER API connection
- Test PDDIKTI Feeder connection

### **Phase 6: VM Ubuntu 1 - Frontend & Gateway (6 hours)**
- Deploy Kong Gateway
- Deploy Frontend (Next.js)
- Deploy Nginx
- Configure SSL (Let's Encrypt)
- Configure Kong routes (ALL services including Sister & Feeder)

### **Phase 7: Integration & Testing (4 hours)**
- End-to-end testing
- Load testing
- Security testing
- Backup testing

**Total Deployment Time**: ~27 hours (~4 working days)

---

## 📝 Updated Port Mapping

| Server | Port | Service | Access |
|--------|------|---------|--------|
| **VM Ubuntu 1** | 80 | HTTP | Public |
| **VM Ubuntu 1** | 443 | HTTPS | Public |
| **VM Ubuntu 1** | 9800 | Kong Proxy | Internal |
| **VM Ubuntu 1** | 8001 | Kong Admin | Internal |
| **VM Ubuntu 1** | 9100 | Node Exporter | Internal |
| **VM Ubuntu 1** | 9113 | Nginx Exporter | Internal |
| **VM Ubuntu 2** | 8081 | Auth Service | Internal |
| **VM Ubuntu 2** | 8082 | Dashboard Service | Internal |
| **VM Ubuntu 2** | 6379 | Redis | Internal |
| **VM Ubuntu 2** | 9100 | Node Exporter | Internal |
| **VM Ubuntu 2** | 9121 | Redis Exporter | Internal |
| **VM Ubuntu 3** | 8083 | Sister Service | Internal |
| **VM Ubuntu 3** | 8084 | PDDIKTI Feeder | Internal |
| **VM Ubuntu 3** | 6379 | Redis (Sync Queue) | Internal |
| **VM Ubuntu 3** | 9100 | Node Exporter | Internal |
| **VM Ubuntu 3** | 9121 | Redis Exporter | Internal |
| **Windows Server 1** | 9090 | Prometheus | Internal |
| **Windows Server 1** | 3000 | Grafana | Internal |
| **Windows Server 2** | 1433 | SQL Server | Internal |

**Total Ports Exposed**: 19 ports

---

## ✅ Benefits of 5-Server Architecture

| Benefit | Impact |
|---------|--------|
| **Performance** | Sync operations tidak mengganggu user transactions |
| **Reliability** | Failure di sync services tidak affect Auth/Dashboard |
| **Scalability** | Mudah scale sync services independently |
| **Maintenance** | Zero-downtime deployments untuk sync services |
| **Monitoring** | Clearer metrics & easier troubleshooting |
| **Security** | Additional network isolation layer |
| **Cost** | Still within budget (3 VMs, same spec) |

---

## 🎯 Next Steps

1. ✅ Review arsitektur 5-server ini
2. ⏳ Create VM Ubuntu 3 deployment files (docker-compose.yml, .env.example)
3. ⏳ Update deployment scripts (deploy-vm3.sh)
4. ⏳ Update Kong configuration script (add Sister & Feeder routes)
5. ⏳ Update DEPLOYMENT_SUMMARY.md dengan Phase 5 baru
6. ⏳ Update health-check.sh untuk include VM3
7. ⏳ Update backup script untuk include VM3 volumes

---

**Last Updated**: 2025-01-29
**Version**: 2.0 (5-Server Architecture)
**Status**: Ready for Review ✅
