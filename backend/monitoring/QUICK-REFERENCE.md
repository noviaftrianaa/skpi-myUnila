# 🚀 MyUnila Monitoring - Quick Reference

## Start/Stop Commands

```bash
# Start monitoring stack
docker-compose -f docker-compose-monitoring.yml up -d

# Stop monitoring stack
docker-compose -f docker-compose-monitoring.yml down

# View logs
docker-compose -f docker-compose-monitoring.yml logs -f grafana
docker-compose -f docker-compose-monitoring.yml logs -f prometheus

# Restart a service
docker-compose -f docker-compose-monitoring.yml restart grafana
```

## Access URLs

| Service | URL | Login |
|---------|-----|-------|
| Grafana | http://localhost:3002 | admin / makinjaya |
| Prometheus | http://localhost:9090 | No login |
| cAdvisor | http://localhost:8080 | No login |
| Loki | http://localhost:3100 | API only |
| Kong UI | http://localhost:9803 | No login |

## Useful PromQL Queries

```promql
# Container CPU (%)
rate(container_cpu_usage_seconds_total{name=~"myunila.*"}[5m]) * 100

# Container Memory (MB)
container_memory_usage_bytes{name=~"myunila.*"} / 1024 / 1024

# Kong Requests/sec
rate(kong_http_requests_total[5m])

# Redis Ops/sec
rate(redis_commands_processed_total[5m])

# Nginx Requests
rate(nginx_http_requests_total[5m])

# Service Uptime
up{job="kong"}
```

## Useful LogQL Queries

```logql
# All auth-service logs
{service="auth-service"}

# Error logs
{service="auth-service"} |= "ERROR"

# Logs from last 5 minutes
{service="dashboard-service"} [5m]

# Search for specific text
{service="portal-service"} |= "login"

# JSON parsing
{service="auth-service"} | json | level="error"
```

## Docker Commands

```bash
# Check container health
docker ps --filter "name=myunila-"

# View resource usage
docker stats

# Check monitoring containers
docker ps --filter "name=myunila-prometheus" --filter "name=myunila-grafana"

# Restart monitoring stack
docker-compose -f docker-compose-monitoring.yml restart
```

## Troubleshooting

### Grafana "No Data"
```bash
# Check Prometheus is running
curl http://localhost:9090/-/healthy

# Check targets
open http://localhost:9090/targets
```

### Loki no logs
```bash
# Check Promtail
docker logs myunila-promtail

# Check Loki ready
curl http://localhost:3100/ready
```

### Reset Grafana password
```bash
docker exec -it myunila-grafana grafana-cli admin reset-admin-password makinjaya
```

## Port Reference

| Port | Service | Type |
|------|---------|------|
| 3002 | Grafana | Web UI |
| 9090 | Prometheus | Web UI |
| 3100 | Loki | HTTP API |
| 9080 | Promtail | Internal |
| 8080 | cAdvisor | Web UI |
| 9100 | Node Exporter | Metrics |
| 9121 | Redis Exporter | Metrics |

## Files Location

```
C:\laragon\www\my-unila\backend\monitoring\
├── prometheus/prometheus.yml
├── loki/loki-config.yml
├── promtail/promtail-config.yml
├── grafana/provisioning/datasources/datasources.yml
└── grafana/dashboards/myunila-overview.json
```
