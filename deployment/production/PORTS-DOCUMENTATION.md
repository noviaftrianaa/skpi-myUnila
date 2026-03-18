# MyUnila Production - Port Documentation

Dokumentasi lengkap semua port yang digunakan dalam arsitektur MyUnila Production untuk konfigurasi firewall dan network.

## 📋 Table of Contents
- [Network Architecture Overview](#network-architecture-overview)
- [Port List by VM](#port-list-by-vm)
- [External Services Ports](#external-services-ports)
- [Firewall Rules Required](#firewall-rules-required)
- [Security Recommendations](#security-recommendations)

---

## 🏗️ Network Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Internet/VPN Users                          │
│                   (10.10.110.0/24 or public)                     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   VM1 (192.168.120.41)        │
         │   Frontend & Kong Gateway     │
         │                               │
         │   - Frontend: 3000            │
         │   - Kong Proxy: 9800          │
         │   - Kong Admin: 9801          │
         └───────────────┬───────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌────────────────────┐         ┌────────────────────┐
│ VM2 (192.168.120.42)│         │ VM3 (192.168.120.43)│
│ Backend Services 1 │         │ Backend Services 2 │
│                    │         │                    │
│ - Dashboard: 8082  │         │ - Sister: 8083     │
│ - Auth: 8081       │         │ - Feeder: 8084*    │
│ - PostgreSQL: 5432 │         │                    │
│ - Redis: 6379      │         └────────────────────┘
│ - Meilisearch: 7700│
└────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Database Server                │
│ (192.168.123.119)              │
│                                │
│ - SQL Server: 1433             │
└────────────────────────────────┘

* Future service
```

---

## 🖥️ Port List by VM

### VM1 - Frontend & Kong Gateway (192.168.120.41)
**User:** `myfrontend`

| Port | Service | Protocol | Purpose | Access From |
|------|---------|----------|---------|-------------|
| **3000** | Frontend (Next.js) | TCP | Web application UI | **Public/VPN Users** |
| **9800** | Kong Gateway (Proxy) | TCP | API Gateway - Main entry point | **Public/VPN Users** |
| **9801** | Kong Gateway (Admin) | TCP | Kong administration API | **Admins only** |
| 5432 | PostgreSQL (Kong DB) | TCP | Kong's database (internal) | Localhost only |
| 22 | SSH | TCP | Server management | Admins only |

**Critical Ports for End Users:**
- ✅ **Port 3000** - Frontend web interface
- ✅ **Port 9800** - API Gateway (all backend API calls)

---

### VM2 - Backend Services 1 & Infrastructure (192.168.120.42)
**User:** `mybackend1`

| Port | Service | Protocol | Purpose | Access From |
|------|---------|----------|---------|-------------|
| **8081** | Auth Service (Nginx) | TCP | Authentication API | VM1 (Kong) only |
| **8082** | Dashboard Service (Nginx) | TCP | Dashboard API | VM1 (Kong) only |
| 9000 | PHP-FPM (Auth) | TCP | PHP processor (internal) | Localhost only |
| 9000 | PHP-FPM (Dashboard) | TCP | PHP processor (internal) | Localhost only |
| **5432** | PostgreSQL | TCP | Kong's database | VM1 only |
| **6379** | Redis | TCP | Cache & sessions | All VMs |
| **7700** | Meilisearch | TCP | Search engine | All VMs |
| 22 | SSH | TCP | Server management | Admins only |

**Note:** Backend services (8081, 8082) should **NOT** be publicly accessible - only through Kong Gateway.

---

### VM3 - Backend Services 2 (192.168.120.43)
**User:** `mybackend2`

| Port | Service | Protocol | Purpose | Access From |
|------|---------|----------|---------|-------------|
| **8083** | Sister Service (Go) | TCP | Sister API integration | VM1 (Kong) only |
| 8084 | Feeder Service* | TCP | Feeder PDDIKTI integration | VM1 (Kong) only |
| 22 | SSH | TCP | Server management | Admins only |

*Future service - not yet deployed

---

## 🌐 External Services Ports

### Database Server (192.168.123.119)
**Current Status:** ⚠️ Not accessible from VMs (routing issue)

| Port | Service | Protocol | Purpose | Required Access From |
|------|---------|----------|---------|---------------------|
| **1433** | SQL Server | TCP | Main database | ✅ 192.168.120.42 (VM2)<br>✅ 192.168.120.43 (VM3) |

**Critical:** This connection must be enabled for backend services to function.

---

## 🔥 Firewall Rules Required

### 1. VPN/Internet Users → VM1 (Frontend & API Access)

**Source:** VPN Users (10.10.110.0/24) or Public Internet
**Destination:** 192.168.120.41 (VM1)

```bash
# Allow Frontend access
allow tcp from 10.10.110.0/24 to 192.168.120.41 port 3000

# Allow Kong API Gateway access
allow tcp from 10.10.110.0/24 to 192.168.120.41 port 9800

# Allow Kong Admin (Admins only)
allow tcp from 10.10.110.118 to 192.168.120.41 port 9801  # Specific admin IP
```

**Priority:** 🔴 **CRITICAL** - Without these, users cannot access the application

---

### 2. VM1 → VM2 (Backend Services Communication)

**Source:** 192.168.120.41 (VM1)
**Destination:** 192.168.120.42 (VM2)

```bash
# Allow Kong to reach Auth Service
allow tcp from 192.168.120.41 to 192.168.120.42 port 8081

# Allow Kong to reach Dashboard Service
allow tcp from 192.168.120.42 to 192.168.120.42 port 8082

# Allow Kong to reach PostgreSQL
allow tcp from 192.168.120.41 to 192.168.120.42 port 5432
```

---

### 3. VM1 → VM3 (Backend Services Communication)

**Source:** 192.168.120.41 (VM1)
**Destination:** 192.168.120.43 (VM3)

```bash
# Allow Kong to reach Sister Service
allow tcp from 192.168.120.41 to 192.168.120.43 port 8083

# Future: Feeder Service
allow tcp from 192.168.120.41 to 192.168.120.43 port 8084
```

---

### 4. All VMs → Infrastructure Services (VM2)

**Source:** 192.168.120.0/24
**Destination:** 192.168.120.42 (VM2)

```bash
# Redis access from all VMs
allow tcp from 192.168.120.0/24 to 192.168.120.42 port 6379

# Meilisearch access from all VMs
allow tcp from 192.168.120.0/24 to 192.168.120.42 port 7700
```

---

### 5. Backend VMs → Database Server (CRITICAL - Currently Blocked)

**Source:** 192.168.120.42-43 (VM2, VM3)
**Destination:** 192.168.123.119 (SQL Server)

```bash
# SQL Server access from VM2 (Dashboard & Auth)
allow tcp from 192.168.120.42 to 192.168.123.119 port 1433

# SQL Server access from VM3 (Sister Service)
allow tcp from 192.168.120.43 to 192.168.123.119 port 1433
```

**Status:** 🔴 **BLOCKED** - Network gateway/router between 192.168.120.x and 192.168.123.x is blocking this traffic.

**Action Required:** Configure router/firewall to allow traffic from 192.168.120.0/23 to 192.168.123.119:1433

---

## 🛡️ Security Recommendations

### 1. **Public/External Access (MUST be open)**
- ✅ Port 3000 (Frontend)
- ✅ Port 9800 (Kong Proxy)
- ⚠️ Port 9801 (Kong Admin) - Restrict to admin IPs only

### 2. **Internal Services (MUST NOT be public)**
These ports should only be accessible within the internal network:
- ❌ Port 8081 (Auth Service) - Only from VM1
- ❌ Port 8082 (Dashboard Service) - Only from VM1
- ❌ Port 8083 (Sister Service) - Only from VM1
- ❌ Port 5432 (PostgreSQL) - Only from VM1
- ❌ Port 6379 (Redis) - Only from 192.168.120.0/24
- ❌ Port 7700 (Meilisearch) - Only from 192.168.120.0/24

### 3. **Database Access**
- ✅ SQL Server 1433 must be accessible from VM2 and VM3
- ⚠️ Add source IP filtering for security

### 4. **SSH Access**
- Port 22 should be restricted to admin IPs only
- Consider using VPN or bastion host for SSH access

---

## 🧪 Testing Commands

### From VPN/Local Machine:
```bash
# Test Frontend
curl http://192.168.120.41:3000/api/health

# Test Kong Gateway
curl http://192.168.120.41:9800

# Test Kong Admin (if allowed)
curl http://192.168.120.41:9801
```

### From VM1 (Kong):
```bash
# Test backend services
curl http://192.168.120.42:8081/api/health  # Auth
curl http://192.168.120.42:8082/api/health  # Dashboard
curl http://192.168.120.43:8083/health      # Sister

# Test infrastructure
redis-cli -h 192.168.120.42 -p 6379 PING
curl http://192.168.120.42:7700/health
```

### From VM2/VM3 (Backend):
```bash
# Test database connection (CURRENTLY FAILS)
telnet 192.168.123.119 1433
# OR
nc -zv 192.168.123.119 1433
```

---

## 📞 Contact for Port Access Issues

**Network/Firewall Team:**
- Request opening ports from VPN subnet to VM1 (3000, 9800, 9801)
- Request routing between 192.168.120.x and 192.168.123.119:1433

**Current Issues:**
1. ✅ VMs can ping each other (ICMP allowed)
2. ❌ TCP ports blocked from VPN to VM1 (3000, 9800)
3. ❌ Database access blocked from VM2/VM3 to 192.168.123.119:1433

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-12 | 1.0 | Initial documentation for production deployment |

---

## 🔗 Related Documentation

- [Production Deployment Guide](./README.md)
- [Ansible Playbooks](./ansible/)
- [Architecture Diagram](./docs/architecture.md)

---

**Generated for:** MyUnila Production Deployment
**Last Updated:** 2025-11-12
**Maintained by:** Development Team

---

## 🖥️ VM5 Staging (192.168.120.45)

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| Frontend (Next.js) | 3000 | HTTP | Staging portal |
| Kong Proxy | 9800 | HTTP | API Gateway |
| Kong Admin | 9801 | HTTP | Admin API |
| Auth Service | 8081 | HTTP | Via Nginx |
| Public Service | 8082 | HTTP | Via Nginx |
| Dashboard Service | 8087 | HTTP | Via Nginx |
| Sister Service | 8083 | HTTP | Go |
| Feeder Service | 8084 | HTTP | Go |
| WS Service | 8085 | HTTP | Go (api-service) |
| MyUnila Service | 8086 | HTTP | Go |
| Keuangan Service | 8088 | HTTP | Go |
| Monitoring Service | 8089 | HTTP | Go (webmon) |
| **Project Service** | **8095** | **HTTP** | **Go (project-management) ⭐ NEW** |
| Redis | 6379 | TCP | Cache |
| MeiliSearch | 7700 | HTTP | Search engine |
| PostgreSQL | 5432 | TCP | **Project Management DB (native, not Docker)** |
| Grafana | 3001 | HTTP | Monitoring dashboard |
| Loki | 3100 | HTTP | Log aggregation |
| Prometheus | 9090 | HTTP | Metrics |
| Node Exporter | 9100 | HTTP | Host metrics |
| Nginx Exporter | 9113 | HTTP | Nginx metrics |
| Redis Exporter | 9121 | HTTP | Redis metrics |
| cAdvisor | 18080 | HTTP | Container metrics |
