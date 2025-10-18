# MyUnila Monitoring Stack Guide

Complete monitoring and observability setup for MyUnila microservices.

## 📊 Monitoring Tools Overview

### 1. **Grafana** (Port 3002)
- **Purpose**: Visualization Dashboard
- **URL**: http://localhost:3002
- **Credentials**: 
  - Username: `admin`
  - Password: `makinjaya`
- **Features**:
  - Pre-configured dashboards
  - Real-time metrics visualization
  - Log exploration via Loki
  - Alerting capabilities

### 2. **Prometheus** (Port 9090)
- **Purpose**: Metrics Collection & Storage
- **URL**: http://localhost:9090
- **Features**:
  - Time-series database
  - Scrapes metrics from all exporters
  - Query language (PromQL)
  - Alert rules

### 3. **Loki** (Port 3100)
- **Purpose**: Log Aggregation
- **URL**: http://localhost:3100
- **Features**:
  - Collects logs from all containers
  - Indexed by labels, not content
  - Integrates with Grafana
  - Efficient log storage

### 4. **Promtail** (No UI)
- **Purpose**: Log Shipper
- **Features**:
  - Scrapes container logs
  - Sends logs to Loki
  - Auto-discovers Docker containers

### 5. **cAdvisor** (Port 8080)
- **Purpose**: Container Metrics
- **URL**: http://localhost:8080
- **Features**:
  - Real-time container resource usage
  - CPU, Memory, Network, Disk I/O
  - Per-container statistics

### 6. **Node Exporter** (Port 9100)
- **Purpose**: Host System Metrics
- **URL**: http://localhost:9100/metrics
- **Features**:
  - Host CPU, Memory, Disk usage
  - Network statistics
  - System load averages

### 7. **Redis Exporter** (Port 9121)
- **Purpose**: Redis Metrics
- **URL**: http://localhost:9121/metrics
- **Features**:
  - Redis commands/sec
  - Memory usage
  - Connected clients
  - Key statistics

---

## 🚀 Quick Start

### Start Monitoring Stack

```bash
cd /c/laragon/www/my-unila/backend

# Start all monitoring services
docker-compose -f docker-compose-monitoring.yml up -d

# Check status
docker-compose -f docker-compose-monitoring.yml ps

# View logs
docker-compose -f docker-compose-monitoring.yml logs -f
```

### Stop Monitoring Stack

```bash
docker-compose -f docker-compose-monitoring.yml down

# Stop and remove volumes (WARNING: deletes all metrics/logs)
docker-compose -f docker-compose-monitoring.yml down -v
```

---

## 📈 Access Monitoring Tools

After starting the monitoring stack, access these URLs:

| Tool | URL | Purpose |
|------|-----|---------|
| **Grafana** | http://localhost:3002 | Main dashboard (login required) |
| **Prometheus** | http://localhost:9090 | Metrics explorer |
| **cAdvisor** | http://localhost:8080 | Container stats |
| **Loki** | http://localhost:3100 | Log API |
| **Node Exporter** | http://localhost:9100/metrics | Host metrics |
| **Redis Exporter** | http://localhost:9121/metrics | Redis metrics |
| **Kong UI** | http://localhost:9803 | Gateway dashboard (has monitoring links) |

---

## 🎯 Common Tasks

### 1. View Service Logs in Grafana

1. Open Grafana: http://localhost:3002
2. Login with `admin` / `makinjaya`
3. Go to **Explore** (compass icon)
4. Select **Loki** as datasource
5. Query examples:
   ```logql
   # All logs from auth-service
   {service="auth-service"}
   
   # Error logs only
   {service="auth-service"} |= "ERROR"
   
   # Logs from last 5 minutes
   {service="dashboard-service"} [5m]
   ```

### 2. Query Metrics in Prometheus

1. Open Prometheus: http://localhost:9090
2. Go to **Graph** tab
3. Example queries:
   ```promql
   # CPU usage by container
   rate(container_cpu_usage_seconds_total{name=~"myunila.*"}[5m]) * 100
   
   # Memory usage by container (MB)
   container_memory_usage_bytes{name=~"myunila.*"} / 1024 / 1024
   
   # Kong request rate
   rate(kong_http_requests_total[5m])
   
   # Redis commands per second
   rate(redis_commands_processed_total[5m])
   ```

### 3. Create Custom Dashboard in Grafana

1. Login to Grafana
2. Click **+** → **Dashboard**
3. Click **Add visualization**
4. Select **Prometheus** datasource
5. Enter PromQL query
6. Customize panel (graph type, labels, etc.)
7. Click **Save**

### 4. Check Container Health

```bash
# Using cAdvisor web UI
open http://localhost:8080

# Using Docker commands
docker stats

# Using Prometheus query
curl http://localhost:9090/api/v1/query?query=up
```

---

## 🔔 Alerts (Optional)

### Configure Grafana Alerts

1. Open Grafana → Alerting → Alert rules
2. Create new alert rule
3. Example: Alert when CPU > 80%
   ```
   Query: rate(container_cpu_usage_seconds_total[5m]) * 100 > 80
   Condition: WHEN last() OF query IS ABOVE 80
   ```

### Email Notifications

Edit `monitoring/grafana/provisioning/notifiers/email.yml`:
```yaml
notifiers:
  - name: Email
    type: email
    settings:
      addresses: admin@unila.ac.id
```

---

## 📦 Data Retention

- **Prometheus**: 15 days (default)
- **Loki**: 31 days (configured in `loki-config.yml`)
- **Grafana**: Unlimited (stored in database)

To change retention:
- **Prometheus**: Edit `prometheus.yml` → `storage.tsdb.retention.time`
- **Loki**: Edit `loki-config.yml` → `limits_config.retention_period`

---

## 🛠 Troubleshooting

### Grafana shows "No Data"

1. Check Prometheus is running:
   ```bash
   curl http://localhost:9090/-/healthy
   ```

2. Check datasource in Grafana:
   - Configuration → Data sources → Prometheus
   - Click "Test" button
   - Should show "Data source is working"

3. Check Prometheus targets:
   - Open http://localhost:9090/targets
   - All targets should be "UP"

### Loki logs not appearing

1. Check Promtail is running:
   ```bash
   docker logs myunila-promtail
   ```

2. Check Loki is receiving logs:
   ```bash
   curl http://localhost:3100/ready
   ```

3. Verify Docker labels in `promtail-config.yml`

### High Memory Usage

- Reduce Prometheus retention period
- Reduce Loki retention period
- Limit scrape interval (increase from 15s to 30s)

---

## 📁 File Structure

```
monitoring/
├── prometheus/
│   └── prometheus.yml           # Prometheus config & scrape targets
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasources.yml  # Auto-configure Prometheus & Loki
│   │   └── dashboards/
│   │       └── dashboards.yml   # Dashboard provisioning
│   └── dashboards/
│       └── myunila-overview.json # Pre-built dashboard
├── loki/
│   └── loki-config.yml          # Loki config & retention
├── promtail/
│   └── promtail-config.yml      # Log scraping config
└── MONITORING-GUIDE.md          # This file
```

---

## 🎨 Pre-built Dashboards

### MyUnila System Overview
- Container CPU Usage (all services)
- Container Memory Usage (all services)
- Kong Request Rate
- Redis Operations

Access: Grafana → Dashboards → MyUnila folder

---

## 🔗 Integration with Services

All metrics are automatically collected via:
1. **Prometheus** scrapes Kong `/metrics` endpoint
2. **cAdvisor** monitors all Docker containers
3. **Node Exporter** monitors host system
4. **Redis Exporter** monitors Redis instance
5. **Promtail** scrapes Docker container logs

No code changes needed in your services!

---

## 📚 Learn More

- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **Loki**: https://grafana.com/docs/loki/
- **cAdvisor**: https://github.com/google/cadvisor

---

## 💡 Best Practices

1. **Regularly review dashboards** - Check for anomalies daily
2. **Set up alerts** - Don't wait for users to report issues
3. **Monitor disk usage** - Metrics can grow large over time
4. **Backup Grafana** - Export dashboards regularly
5. **Review retention** - Balance between history and disk space

---

**Last Updated**: 2025-10-18  
**Maintained by**: UPA TIK UNILA
