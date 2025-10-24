# 🏗️ MyUnila Architecture - Complete System with Kafka

**Institution**: Universitas Lampung (UNILA)
**Infrastructure**: On-Premise (VM Ubuntu + Windows Server)
**Scale**: ~10,000 users/day, 6M+ data sync
**Last Updated**: 23 Oktober 2025

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [VM Infrastructure Requirements](#vm-infrastructure-requirements)
4. [Kafka Cluster Design](#kafka-cluster-design)
5. [Service Components](#service-components)
6. [Data Flow](#data-flow)
7. [Deployment Guide](#deployment-guide)
8. [Monitoring & Operations](#monitoring--operations)
9. [Disaster Recovery](#disaster-recovery)
10. [Scalability Plan](#scalability-plan)

---

## 🎯 System Overview

### **MyUnila Platform Components:**

```
┌──────────────────────────────────────────────────────────────────┐
│                       MyUnila Platform                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Frontend Layer (Next.js)                                        │
│  ├─ Portal Dashboard                                             │
│  ├─ SISTER Integrator UI                                         │
│  ├─ Feeder Integrator UI                                         │
│  └─ Real-time Monitoring Dashboard                               │
│                                                                  │
│  API Gateway (Kong)                                              │
│  ├─ Rate Limiting                                                │
│  ├─ Authentication (JWT)                                         │
│  ├─ Load Balancing                                               │
│  └─ Service Discovery                                            │
│                                                                  │
│  Backend Services (Go + PHP Laravel)                             │
│  ├─ Auth Service (Go)                                            │
│  ├─ Dashboard Service (Laravel)                                  │
│  ├─ SISTER Service (Go + Kafka Producer)                        │
│  ├─ Feeder Service (Go + Kafka Producer)                        │
│  └─ Sync Consumer Service (Go + Kafka Consumer)                 │
│                                                                  │
│  Message Queue (Kafka Cluster)                                   │
│  ├─ Event Streaming (6M+ messages)                              │
│  ├─ Real-time Data Pipeline                                     │
│  └─ Event Sourcing & Replay                                     │
│                                                                  │
│  Databases                                                       │
│  ├─ SQL Server (Windows Server) - Primary Data                  │
│  ├─ Redis - Cache & Session                                     │
│  └─ PostgreSQL (Kong) - API Gateway Config                      │
│                                                                  │
│  Monitoring Stack                                                │
│  ├─ Prometheus - Metrics Collection                             │
│  ├─ Grafana - Visualization                                     │
│  ├─ Loki - Log Aggregation                                      │
│  └─ Alertmanager - Notifications                                │
│                                                                  │
│  External APIs                                                   │
│  ├─ SISTER API (Kemenristekdikti)                              │
│  └─ PDDIKTI Feeder API (Kemdikbud)                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Architecture Diagram

### **Complete System Architecture with Kafka:**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│                        EXTERNAL SERVICES                                            │
│                                                                                     │
│    ┌──────────────────────┐              ┌──────────────────────┐                 │
│    │   SISTER API         │              │   PDDIKTI Feeder     │                 │
│    │   (Kemenristekdikti) │              │   (Kemdikbud)        │                 │
│    └──────────┬───────────┘              └──────────┬───────────┘                 │
│               │                                     │                              │
└───────────────┼─────────────────────────────────────┼──────────────────────────────┘
                │                                     │
                │                                     │
┌───────────────┼─────────────────────────────────────┼──────────────────────────────┐
│               │         MYUNILA INFRASTRUCTURE      │                              │
│               │                                     │                              │
│    ┌──────────▼─────────┐              ┌───────────▼──────────┐                  │
│    │  SISTER Service    │              │  Feeder Service      │                  │
│    │  (Go - Producer)   │              │  (Go - Producer)     │                  │
│    │  Port: 8083        │              │  Port: 8084          │                  │
│    │                    │              │                      │                  │
│    │  - Fetch from API  │              │  - Fetch from API    │                  │
│    │  - Transform data  │              │  - Transform data    │                  │
│    │  - Publish to      │              │  - Publish to        │                  │
│    │    Kafka topics    │              │    Kafka topics      │                  │
│    └──────────┬─────────┘              └───────────┬──────────┘                  │
│               │                                     │                              │
│               └─────────────┬───────────────────────┘                              │
│                             │                                                      │
│                             │ Produce Events                                       │
│                             ▼                                                      │
│              ┌──────────────────────────────────────────┐                         │
│              │                                          │                         │
│              │        KAFKA CLUSTER (3 Brokers)        │                         │
│              │        VM-KAFKA-1, VM-KAFKA-2, VM-KAFKA-3│                        │
│              │                                          │                         │
│              │  Topics (Partitioned):                   │                         │
│              │  ├─ sync.sister.mahasiswa (20 parts)    │                         │
│              │  ├─ sync.sister.dosen (10 parts)        │                         │
│              │  ├─ sync.sister.referensi (5 parts)     │                         │
│              │  ├─ sync.feeder.mahasiswa (30 parts)    │                         │
│              │  ├─ sync.feeder.nilai (40 parts)        │                         │
│              │  ├─ sync.feeder.kelas (20 parts)        │                         │
│              │  └─ sync.status.realtime (5 parts)      │                         │
│              │                                          │                         │
│              │  Features:                               │                         │
│              │  ✅ Replication Factor: 2               │                         │
│              │  ✅ Retention: 7 days                   │                         │
│              │  ✅ Compression: LZ4                    │                         │
│              │  ✅ Min In-Sync Replicas: 2             │                         │
│              │                                          │                         │
│              └──────────────┬───────────────────────────┘                         │
│                             │ Consume Events                                       │
│                             │                                                      │
│                             ▼                                                      │
│              ┌──────────────────────────────────────────┐                         │
│              │                                          │                         │
│              │     CONSUMER GROUPS (Multiple)           │                         │
│              │                                          │                         │
│              │  Consumer Group 1: DB Writer             │                         │
│              │  ├─ 30 consumer instances               │                         │
│              │  ├─ Batch processing (1000 recs)        │                         │
│              │  └─ Bulk insert to SQL Server           │                         │
│              │                                          │                         │
│              │  Consumer Group 2: Cache Updater         │                         │
│              │  ├─ 5 consumer instances                │                         │
│              │  └─ Update Redis cache                  │                         │
│              │                                          │                         │
│              │  Consumer Group 3: Real-time Notifier    │                         │
│              │  ├─ 3 consumer instances                │                         │
│              │  └─ WebSocket broadcast to frontend     │                         │
│              │                                          │                         │
│              │  Consumer Group 4: Analytics Logger      │                         │
│              │  ├─ 2 consumer instances                │                         │
│              │  └─ Write to analytics DB               │                         │
│              │                                          │                         │
│              └──────────────┬───────────────────────────┘                         │
│                             │                                                      │
│                             ▼                                                      │
│              ┌──────────────────────────────────────────┐                         │
│              │   SQL Server (Windows Server)           │                         │
│              │   VM-SQLSERVER                           │                         │
│              │                                          │                         │
│              │   Databases:                             │                         │
│              │   ├─ pddikti (Main data)                │                         │
│              │   ├─ myunila_auth (Users & roles)       │                         │
│              │   └─ myunila_dashboard (Analytics)      │                         │
│              │                                          │                         │
│              │   Data:                                  │                         │
│              │   ├─ Mahasiswa: 1M+ records             │                         │
│              │   ├─ Dosen: 20K+ records                │                         │
│              │   ├─ Nilai: 5M+ records                 │                         │
│              │   └─ Referensi: 1K+ records             │                         │
│              │                                          │                         │
│              └──────────────────────────────────────────┘                         │
│                                                                                    │
│                             ┌──────────────────────────┐                          │
│                             │   Redis Cluster          │                          │
│                             │   VM-REDIS               │                          │
│                             │                          │                          │
│                             │   - Session storage      │                          │
│                             │   - Cache layer          │                          │
│                             │   - Rate limiting        │                          │
│                             │   - Real-time counters   │                          │
│                             └──────────────────────────┘                          │
│                                                                                    │
│              ┌──────────────────────────────────────────────────┐                │
│              │                                                  │                │
│              │        API GATEWAY (Kong)                        │                │
│              │        VM-KONG                                   │                │
│              │                                                  │                │
│              │   Features:                                      │                │
│              │   ├─ JWT Authentication                         │                │
│              │   ├─ Rate Limiting (100 req/min/user)          │                │
│              │   ├─ Load Balancing (Round Robin)              │                │
│              │   ├─ Service Discovery                          │                │
│              │   └─ Request/Response logging                   │                │
│              │                                                  │                │
│              │   Routes:                                        │                │
│              │   ├─ /auth-service → Auth Service              │                │
│              │   ├─ /dashboard-service → Dashboard Service     │                │
│              │   ├─ /sister-service → SISTER Service           │                │
│              │   └─ /feeder-service → Feeder Service           │                │
│              │                                                  │                │
│              └─────────────────┬────────────────────────────────┘                │
│                                │                                                  │
│                                │                                                  │
│              ┌─────────────────▼────────────────────────────────┐                │
│              │                                                  │                │
│              │        FRONTEND (Next.js)                        │                │
│              │        VM-FRONTEND                               │                │
│              │                                                  │                │
│              │   Pages:                                         │                │
│              │   ├─ Portal (/portal)                           │                │
│              │   ├─ SISTER Integrator (/dashboard/sister-*)    │                │
│              │   ├─ Feeder Integrator (/dashboard/feeder-*)    │                │
│              │   └─ Real-time Monitoring                        │                │
│              │                                                  │                │
│              │   Features:                                      │                │
│              │   ├─ WebSocket (real-time updates)              │                │
│              │   ├─ SSR/SSG (performance)                      │                │
│              │   └─ Progressive Web App                         │                │
│              │                                                  │                │
│              └──────────────────────────────────────────────────┘                │
│                                                                                    │
│              ┌──────────────────────────────────────────────────┐                │
│              │                                                  │                │
│              │        MONITORING STACK                          │                │
│              │        VM-MONITORING                             │                │
│              │                                                  │                │
│              │   ├─ Prometheus (Metrics)                       │                │
│              │   ├─ Grafana (Dashboards)                       │                │
│              │   ├─ Loki (Logs)                                │                │
│              │   ├─ Alertmanager (Alerts)                      │                │
│              │   └─ Node Exporter (System metrics)             │                │
│              │                                                  │                │
│              │   Dashboards:                                    │                │
│              │   ├─ Kafka Cluster Health                       │                │
│              │   ├─ Consumer Lag Monitoring                    │                │
│              │   ├─ Sync Performance Metrics                   │                │
│              │   └─ System Resources                           │                │
│              │                                                  │                │
│              └──────────────────────────────────────────────────┘                │
│                                                                                    │
│              ┌──────────────────────────────────────────────────┐                │
│              │                                                  │                │
│              │        KAFKA MANAGEMENT UI                       │                │
│              │        (kafka-ui / AKHQ)                         │                │
│              │        Port: 8090                                │                │
│              │                                                  │                │
│              │   Features:                                      │                │
│              │   ├─ Topic management                           │                │
│              │   ├─ Consumer group monitoring                  │                │
│              │   ├─ Message browser                            │                │
│              │   ├─ Cluster health                             │                │
│              │   └─ Performance metrics                        │                │
│              │                                                  │                │
│              └──────────────────────────────────────────────────┘                │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────────┐
                            │                     │
                            │   USERS (~10K/day)  │
                            │                     │
                            │  - Students         │
                            │  - Lecturers        │
                            │  - Staff            │
                            │  - Admins           │
                            │                     │
                            └─────────────────────┘
```

---

## 🖥️ VM Infrastructure Requirements

### **For 10,000 Users/Day + 6M Data Sync**

#### **Server Inventory:**

| VM Name | OS | Purpose | Specs | Quantity |
|---------|----|---------| ------|----------|
| **VM-KAFKA-1** | Ubuntu 22.04 | Kafka Broker 1 | 4 vCPU, 8 GB RAM, 200 GB SSD | 1 |
| **VM-KAFKA-2** | Ubuntu 22.04 | Kafka Broker 2 | 4 vCPU, 8 GB RAM, 200 GB SSD | 1 |
| **VM-KAFKA-3** | Ubuntu 22.04 | Kafka Broker 3 | 4 vCPU, 8 GB RAM, 200 GB SSD | 1 |
| **VM-APPS** | Ubuntu 22.04 | Backend Services (Go + Laravel) | 8 vCPU, 16 GB RAM, 100 GB SSD | 1 |
| **VM-FRONTEND** | Ubuntu 22.04 | Next.js Frontend + Nginx | 4 vCPU, 8 GB RAM, 50 GB SSD | 1 |
| **VM-KONG** | Ubuntu 22.04 | Kong API Gateway + Redis | 4 vCPU, 8 GB RAM, 50 GB SSD | 1 |
| **VM-MONITORING** | Ubuntu 22.04 | Prometheus + Grafana + Loki | 4 vCPU, 8 GB RAM, 100 GB SSD | 1 |
| **VM-SQLSERVER** | Windows Server 2019 | SQL Server 2019 | 8 vCPU, 32 GB RAM, 500 GB SSD | 1 |
| **TOTAL** | - | - | **40 vCPU, 96 GB RAM, 1.2 TB SSD** | **8 VMs** |

---

### **Detailed VM Specifications:**

#### **1. Kafka Cluster (3 VMs) - VM-KAFKA-1, VM-KAFKA-2, VM-KAFKA-3**

```yaml
Operating System: Ubuntu 22.04 LTS
CPU: 4 vCPU (each)
RAM: 8 GB (each)
Storage: 200 GB SSD (each)
Network: 1 Gbps
Total per VM: 4C / 8GB / 200GB

Software Stack:
├─ Kafka 3.6+ (KRaft mode)
├─ Java 17 (OpenJDK)
├─ Kafka Manager / kafka-ui
└─ Node Exporter (monitoring)

Configuration:
├─ Heap Size: 4 GB
├─ Log Retention: 7 days
├─ Replication Factor: 2
├─ Min In-Sync Replicas: 2
└─ Compression: LZ4

Data Storage:
├─ Kafka Logs: /var/lib/kafka/data
├─ Size per topic: ~50-100 GB
└─ Total capacity: 200 GB (enough for 7 days retention)
```

**Why 3 Brokers?**
- ✅ Minimum for high availability (quorum)
- ✅ Replication factor 2 (data on 2 brokers)
- ✅ Can tolerate 1 broker failure
- ✅ Load distribution across partitions

#### **2. Application Server - VM-APPS**

```yaml
Operating System: Ubuntu 22.04 LTS
CPU: 8 vCPU
RAM: 16 GB
Storage: 100 GB SSD
Network: 1 Gbps

Software Stack:
├─ Docker & Docker Compose
├─ Services:
│   ├─ Auth Service (Go) - 2 GB RAM
│   ├─ Dashboard Service (Laravel/PHP-FPM) - 3 GB RAM
│   ├─ SISTER Service (Go) - 2 GB RAM
│   ├─ Feeder Service (Go) - 2 GB RAM
│   ├─ Sync Consumer Service (Go) - 4 GB RAM
│   ├─ WebSocket Service (Go) - 1 GB RAM
│   └─ Nginx - 1 GB RAM
└─ Total: ~15 GB (with buffer)

Consumer Workers:
├─ DB Writer: 20 workers
├─ Cache Updater: 5 workers
├─ Real-time Notifier: 3 workers
└─ Analytics Logger: 2 workers
```

#### **3. Frontend Server - VM-FRONTEND**

```yaml
Operating System: Ubuntu 22.04 LTS
CPU: 4 vCPU
RAM: 8 GB
Storage: 50 GB SSD
Network: 1 Gbps

Software Stack:
├─ Node.js 20 LTS
├─ Next.js (Production Build)
├─ PM2 (Process Manager)
├─ Nginx (Reverse Proxy)
└─ SSL/TLS Certificates

Configuration:
├─ Next.js Instances: 4 (cluster mode)
├─ PM2 Max Memory: 2 GB per instance
└─ Nginx: Static file caching

Performance:
├─ Concurrent Users: 500-1000
├─ Response Time: < 100ms
└─ Static Assets: CDN or Nginx cache
```

#### **4. API Gateway - VM-KONG**

```yaml
Operating System: Ubuntu 22.04 LTS
CPU: 4 vCPU
RAM: 8 GB
Storage: 50 GB SSD
Network: 1 Gbps

Software Stack:
├─ Kong Gateway 3.5+
├─ PostgreSQL 15 (Kong DB)
├─ Redis 7 (Cache & Rate Limiting)
└─ Kong UI / Konga

Configuration:
├─ Worker Processes: 4
├─ Connections per Worker: 1024
├─ Rate Limiting: 100 req/min/user
└─ JWT Authentication

Performance:
├─ Requests/sec: 5000+
├─ Latency: < 10ms
└─ Concurrent Connections: 4000+
```

#### **5. Monitoring Stack - VM-MONITORING**

```yaml
Operating System: Ubuntu 22.04 LTS
CPU: 4 vCPU
RAM: 8 GB
Storage: 100 GB SSD (Time-series data)
Network: 1 Gbps

Software Stack:
├─ Prometheus 2.48+
│   └─ Metrics retention: 30 days
├─ Grafana 10+
│   └─ Dashboards: 20+
├─ Loki 2.9+
│   └─ Log retention: 7 days
├─ Alertmanager
│   └─ Slack/Email notifications
└─ Node Exporter (on all VMs)

Monitored Metrics:
├─ Kafka: Broker health, consumer lag, throughput
├─ Applications: Request rate, error rate, latency
├─ System: CPU, RAM, Disk, Network
└─ Business: Sync status, data count, sync duration
```

#### **6. Database Server - VM-SQLSERVER**

```yaml
Operating System: Windows Server 2019 Standard
CPU: 8 vCPU
RAM: 32 GB
Storage: 500 GB SSD
Network: 1 Gbps

Software Stack:
├─ SQL Server 2019 Standard/Enterprise
├─ SQL Server Management Studio (SSMS)
└─ SQL Server Agent (scheduled jobs)

Configuration:
├─ Max Memory: 28 GB (leave 4GB for OS)
├─ Max Degree of Parallelism: 4
├─ Cost Threshold for Parallelism: 50
└─ Recovery Model: Full (with backups)

Database Sizes:
├─ pddikti: 100 GB (Mahasiswa, Dosen, Nilai, etc)
├─ myunila_auth: 5 GB (Users, roles, sessions)
├─ myunila_dashboard: 10 GB (Analytics, logs)
├─ tempdb: 50 GB (temp operations)
└─ Total: ~200 GB (with growth space)

Performance:
├─ Concurrent Connections: 500+
├─ Bulk Insert: 10K rows/sec
└─ Query Performance: Optimized indexes
```

---

## 📊 Total Infrastructure Summary

### **Resource Totals:**

| Resource | Total | Notes |
|----------|-------|-------|
| **VMs** | 8 | 7 Ubuntu + 1 Windows |
| **vCPU** | 40 cores | Distributed across VMs |
| **RAM** | 96 GB | ~12 GB per VM average |
| **Storage** | 1.2 TB | SSD for all (performance) |
| **Network** | 1 Gbps | Per VM (assumed) |

### **Cost Estimate (On-Premise):**

```
Assumptions:
- VM Host: Existing infrastructure
- Software: Open source (Kafka, Prometheus, etc)
- SQL Server: Existing license
- Electricity: ~$0.10/kWh

Estimated Power:
- 8 VMs × 200W average = 1.6 kW
- 1.6 kW × 24h × 30 days = 1,152 kWh/month
- 1,152 kWh × $0.10 = ~$115/month (electricity only)

Total Monthly Cost: ~$100-150 (electricity + cooling)

Compare to Cloud:
- AWS/Azure equivalent: ~$2,000-3,000/month
- Savings: ~$2,000/month = $24,000/year
```

---

## 🔧 Kafka Cluster Design

### **Kafka Topics Structure:**

```yaml
# SISTER Service Topics
sister.referensi.agama:
  partitions: 3
  replication_factor: 2
  retention_ms: 604800000  # 7 days
  compression_type: lz4

sister.referensi.negara:
  partitions: 3
  replication_factor: 2
  retention_ms: 604800000

sister.mahasiswa:
  partitions: 20
  replication_factor: 2
  retention_ms: 604800000
  cleanup_policy: delete

sister.dosen:
  partitions: 10
  replication_factor: 2
  retention_ms: 604800000

# Feeder Service Topics
feeder.mahasiswa:
  partitions: 30
  replication_factor: 2
  retention_ms: 604800000

feeder.nilai:
  partitions: 40
  replication_factor: 2
  retention_ms: 604800000

feeder.kelas:
  partitions: 20
  replication_factor: 2
  retention_ms: 604800000

# Status & Monitoring
sync.status.realtime:
  partitions: 5
  replication_factor: 2
  retention_ms: 86400000  # 1 day

sync.errors.dlq:
  partitions: 3
  replication_factor: 2
  retention_ms: 2592000000  # 30 days
```

### **Consumer Group Configuration:**

```yaml
# DB Writer Consumer Group
group.id: sync-db-writer
consumers: 30
max.poll.records: 1000
enable.auto.commit: false
isolation.level: read_committed

# Cache Updater Consumer Group
group.id: sync-cache-updater
consumers: 5
max.poll.records: 500

# Real-time Notifier Consumer Group
group.id: sync-realtime-notifier
consumers: 3
max.poll.records: 100

# Analytics Logger Consumer Group
group.id: sync-analytics-logger
consumers: 2
max.poll.records: 1000
```

---

## 🔄 Data Flow

### **Sync Flow: SISTER/Feeder → Kafka → Database**

```
Step 1: Data Fetch & Transform
┌─────────────────────────────────────────────┐
│  SISTER/Feeder Service (Producer)          │
│                                             │
│  1. Poll API for changes (every 30s)       │
│  2. Transform data format                  │
│  3. Validate data schema                   │
│  4. Partition by key (NIM/NIDN)           │
│  5. Publish to Kafka topic                 │
│                                             │
│  Rate: ~10,000 msg/sec                     │
│  Batch size: 1000 records                  │
│  Compression: LZ4 (3x reduction)           │
└─────────────────────────────────────────────┘
                    ↓
Step 2: Kafka Streaming
┌─────────────────────────────────────────────┐
│  Kafka Cluster (3 Brokers)                │
│                                             │
│  1. Receive messages from producers        │
│  2. Distribute to partitions (by key)      │
│  3. Replicate to 2 brokers                 │
│  4. Store on disk (persistence)            │
│  5. Serve to consumer groups               │
│                                             │
│  Throughput: 500K+ msg/sec                 │
│  Latency: < 10ms                           │
│  Durability: Replicated + Disk             │
└─────────────────────────────────────────────┘
                    ↓
Step 3: Consume & Process
┌─────────────────────────────────────────────┐
│  Consumer Group: DB Writer (30 workers)    │
│                                             │
│  1. Poll messages (1000 per batch)         │
│  2. Deserialize & validate                 │
│  3. Batch accumulation (500 records)       │
│  4. Bulk insert to SQL Server              │
│  5. Commit offset (after success)          │
│                                             │
│  Processing: 20K records/sec               │
│  Batch insert: 10K rows/sec                │
│  Error handling: Retry 3x → DLQ            │
└─────────────────────────────────────────────┘
                    ↓
Step 4: Data Persistence
┌─────────────────────────────────────────────┐
│  SQL Server (Windows)                      │
│                                             │
│  1. Receive bulk insert                    │
│  2. Upsert (INSERT or UPDATE)              │
│  3. Update indexes                         │
│  4. Log transaction                        │
│  5. Return success                         │
│                                             │
│  Write speed: 10K rows/sec                 │
│  Total time (6M records): 3-5 minutes      │
└─────────────────────────────────────────────┘
                    ↓
Step 5: Real-time Updates
┌─────────────────────────────────────────────┐
│  Consumer Group: Real-time Notifier        │
│                                             │
│  1. Consume sync status events             │
│  2. Aggregate progress metrics             │
│  3. Broadcast via WebSocket                │
│  4. Update frontend UI in real-time        │
│                                             │
│  Latency: < 100ms (end-to-end)            │
│  WebSocket clients: 100+ concurrent        │
└─────────────────────────────────────────────┘
```

### **Performance Metrics:**

| Stage | Throughput | Latency |
|-------|------------|---------|
| Producer (SISTER/Feeder) | 10K msg/sec | 5ms |
| Kafka Broker | 500K msg/sec | 10ms |
| Consumer (DB Writer) | 20K records/sec | 50ms |
| SQL Server Bulk Insert | 10K rows/sec | 100ms |
| **End-to-End (6M records)** | **~30K records/sec** | **3-5 minutes** |

---

## 🚀 Deployment Guide

### **Phase 1: VM Preparation (Day 1)**

#### **1.1 Ubuntu VMs Setup**

```bash
# On each Ubuntu VM (VM-KAFKA-1/2/3, VM-APPS, VM-FRONTEND, VM-KONG, VM-MONITORING)

# Update system
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y curl wget git vim htop net-tools

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo ufw allow 22/tcp     # SSH
sudo ufw enable

# Set timezone
sudo timedatectl set-timezone Asia/Jakarta

# Increase file limits (for Kafka)
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

#### **1.2 Windows Server Setup (VM-SQLSERVER)**

```powershell
# Install SQL Server 2019
# Use SQL Server Installation Center

# Configure SQL Server
# - Enable TCP/IP protocol
# - Set max memory: 28 GB
# - Configure backups
# - Create databases: pddikti, myunila_auth, myunila_dashboard

# Open firewall port
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -LocalPort 1433 -Protocol TCP -Action Allow

# Install SSMS
# Download from Microsoft website
```

### **Phase 2: Kafka Cluster Deployment (Day 2-3)**

#### **2.1 Kafka Installation (VM-KAFKA-1/2/3)**

```bash
# Install Java
sudo apt install -y openjdk-17-jdk

# Download Kafka
cd /opt
sudo wget https://downloads.apache.org/kafka/3.6.0/kafka_2.13-3.6.0.tgz
sudo tar -xzf kafka_2.13-3.6.0.tgz
sudo mv kafka_2.13-3.6.0 kafka

# Create Kafka user
sudo useradd -r -s /bin/false kafka
sudo chown -R kafka:kafka /opt/kafka

# Create data directory
sudo mkdir -p /var/lib/kafka/data
sudo chown -R kafka:kafka /var/lib/kafka
```

**Kafka Configuration (server.properties):**

```properties
# VM-KAFKA-1
broker.id=1
listeners=PLAINTEXT://VM-KAFKA-1:9092
advertised.listeners=PLAINTEXT://VM-KAFKA-1:9092
log.dirs=/var/lib/kafka/data
num.partitions=10
default.replication.factor=2
min.insync.replicas=2
log.retention.hours=168
log.segment.bytes=1073741824
compression.type=lz4

# KRaft mode
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@VM-KAFKA-1:9093,2@VM-KAFKA-2:9093,3@VM-KAFKA-3:9093
```

**Repeat for VM-KAFKA-2 (broker.id=2) and VM-KAFKA-3 (broker.id=3)**

#### **2.2 Kafka Systemd Service**

```bash
# Create systemd service
sudo nano /etc/systemd/system/kafka.service
```

```ini
[Unit]
Description=Apache Kafka Server
Documentation=http://kafka.apache.org/documentation.html
Requires=network.target
After=network.target

[Service]
Type=simple
User=kafka
Group=kafka
Environment="KAFKA_HEAP_OPTS=-Xmx4G -Xms4G"
ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/server.properties
ExecStop=/opt/kafka/bin/kafka-server-stop.sh
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Start Kafka
sudo systemctl daemon-reload
sudo systemctl enable kafka
sudo systemctl start kafka

# Check status
sudo systemctl status kafka
```

### **Phase 3: Application Deployment (Day 4-5)**

**See detailed docker-compose.yml in next section**

---

## 📦 Docker Compose Configuration

**File:** `/opt/myunila/docker-compose.yml` (on VM-APPS)

```yaml
version: '3.8'

services:
  # Continue in next response due to length...
```

---

**Would you like me to continue with:**
1. ✅ Complete docker-compose.yml configuration
2. ✅ Kafka topic creation scripts
3. ✅ Monitoring dashboard setup
4. ✅ Backup & disaster recovery procedures
5. ✅ Performance tuning guide
6. ✅ Troubleshooting guide

Apakah Anda ingin saya lanjutkan dengan bagian selanjutnya? 🚀
