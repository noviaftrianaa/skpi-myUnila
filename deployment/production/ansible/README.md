# MyUnila Production Deployment dengan Ansible

Deployment otomatis ke 7 VM production menggunakan Ansible.

## Prerequisites

1. **Install Ansible di komputer lokal Anda:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ansible

# MacOS
brew install ansible

# Windows (WSL)
sudo apt update && sudo apt install ansible
```

2. **Setup SSH Keys untuk semua VM:**
```bash
# Generate SSH key jika belum ada
ssh-keygen -t rsa -b 4096

# Copy SSH key ke semua VM
ssh-copy-id myfrontend@192.168.120.41
ssh-copy-id mybackend1@192.168.120.42
ssh-copy-id mybackend2@192.168.120.43
ssh-copy-id mybalancer@192.168.120.44
ssh-copy-id mystagging@192.168.120.45
ssh-copy-id myreplica@192.168.120.46
ssh-copy-id mydocument@192.168.120.47
```

3. **Test koneksi SSH:**
```bash
ansible all -i inventory/hosts.yml -m ping
```

## Deployment Steps

### Step 1: Setup Docker di semua VM

Install Docker, Docker Compose, dan dependencies:

```bash
cd deployment/production/ansible
ansible-playbook -i inventory/hosts.yml playbooks/01-setup-docker.yml
```

**Apa yang dilakukan:**
- Install Docker & Docker Compose
- Setup Docker daemon configuration
- Create myunila directory
- Configure firewall (ufw)
- Set timezone

**Estimasi waktu:** 5-10 menit per VM

### Step 2: Deploy VM1 - Frontend & Kong Gateway

```bash
ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-vm1-frontend-kong.yml
```

**Services yang di-deploy:**
- Kong Gateway (API Gateway)
- Frontend Next.js
- PostgreSQL (untuk Kong)
- Redis

**Ports:**
- 9800: Kong Proxy
- 9801: Kong Admin
- 3000: Frontend

### Step 3: Deploy VM2 - Backend Services 1

```bash
ansible-playbook -i inventory/hosts.yml playbooks/03-deploy-vm2-backend1.yml
```

**Services yang di-deploy:**
- Dashboard Service
- Auth Service
- Nginx

**Ports:**
- 8081: Auth Service (via Nginx)
- 8082: Dashboard Service (via Nginx)

### Step 4: Deploy VM3 - Backend Services 2

```bash
ansible-playbook -i inventory/hosts.yml playbooks/04-deploy-vm3-backend2.yml
```

**Services yang di-deploy:**
- Sister Service
- Feeder Service (future)
- Scheduler (future)

**Ports:**
- 8083: Sister Service

### Step 5: Deploy VM4 - Monitoring Stack

```bash
ansible-playbook -i inventory/hosts.yml playbooks/05-deploy-vm4-monitoring.yml
```

**Services yang di-deploy:**
- Grafana
- Prometheus
- Loki

**Ports:**
- 3001: Grafana
- 9090: Prometheus
- 3100: Loki

## Deploy Semua Sekaligus

Untuk deploy ke semua VM sekaligus (VM 1-4):

```bash
ansible-playbook -i inventory/hosts.yml playbooks/01-setup-docker.yml
ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-vm1-frontend-kong.yml
ansible-playbook -i inventory/hosts.yml playbooks/03-deploy-vm2-backend1.yml
ansible-playbook -i inventory/hosts.yml playbooks/04-deploy-vm3-backend2.yml
ansible-playbook -i inventory/hosts.yml playbooks/05-deploy-vm4-monitoring.yml
```

Atau buat master playbook (coming soon).

## Monitoring & Maintenance

### Check Status Semua VM

```bash
ansible all -i inventory/hosts.yml -a "docker ps --format 'table {{.Names}}\t{{.Status}}'"
```

### Restart Service di VM Tertentu

```bash
# Restart frontend
ansible frontend -i inventory/hosts.yml -a "docker compose -f /var/www/my-unila/deployment/production/vm1-frontend-kong/services/frontend/docker-compose.yml restart"

# Restart dashboard service
ansible backend1 -i inventory/hosts.yml -a "docker compose -f /var/www/my-unila/deployment/production/vm2-backend1/services/dashboard/docker-compose.yml restart"
```

### Update Code di Semua VM

```bash
ansible all -i inventory/hosts.yml -a "cd /var/www/my-unila && git pull"
```

## Troubleshooting

### Test Koneksi

```bash
ansible all -i inventory/hosts.yml -m ping
```

### Check Logs

```bash
# Logs dari VM1
ansible frontend -i inventory/hosts.yml -a "docker logs myunila-frontend --tail 50"

# Logs dari VM2
ansible backend1 -i inventory/hosts.yml -a "docker logs myunila-dashboard-service --tail 50"
```

### Verbose Mode

Untuk debugging, gunakan `-vvv`:

```bash
ansible-playbook -i inventory/hosts.yml playbooks/01-setup-docker.yml -vvv
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (VM4)                     │
│              Grafana │ Prometheus │ Loki                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Frontend & Gateway (VM1)                    │
│         Kong Gateway │ Frontend │ Redis │ PostgreSQL        │
│                   Port 9800, 3000                            │
└─────────────────────────────────────────────────────────────┘
                    │                    │
        ┌───────────┴────────┬───────────┴──────────┐
        ▼                    ▼                      ▼
┌──────────────┐   ┌──────────────┐      ┌──────────────┐
│   VM2        │   │   VM3        │      │   VM7        │
│  Backend 1   │   │  Backend 2   │      │  Document    │
│              │   │              │      │              │
│ Dashboard    │   │ Sister       │      │ File Storage │
│ Auth         │   │ Feeder       │      │              │
│              │   │ Scheduler    │      │              │
│ Port 8081/82 │   │ Port 8083    │      │              │
└──────────────┘   └──────────────┘      └──────────────┘
```

## VM Assignment

| VM | IP | User | Services |
|----|-------|----------|----------|
| VM1 | 192.168.120.41 | myfrontend | Frontend, Kong, PostgreSQL, Redis |
| VM2 | 192.168.120.42 | mybackend1 | Dashboard Service, Auth Service |
| VM3 | 192.168.120.43 | mybackend2 | Sister Service, Scheduler |
| VM4 | 192.168.120.44 | mybalancer | Grafana, Prometheus, Loki |
| VM5 | 192.168.120.45 | mystagging | Staging Environment |
| VM6 | 192.168.120.46 | myreplica | Replica/Backup |
| VM7 | 192.168.120.47 | mydocument | Document Handler |

## Security Notes

1. **Change default passwords** di template files sebelum deploy
2. **Setup firewall** rules sudah included di playbook
3. **Enable SSL/TLS** untuk production (tambahkan di Kong)
4. **Backup database** regularly
5. **Monitor logs** via Loki & Grafana

## Next Steps

- [ ] Setup VM5, VM6, VM7
- [ ] Configure SSL certificates
- [ ] Setup automated backups
- [ ] Configure log shipping to Loki
- [ ] Setup alerting in Grafana
- [ ] Configure load balancing
