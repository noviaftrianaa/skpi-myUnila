# MyUnila Production - Rebuild & Restart Guide

Panduan lengkap untuk rebuild dan restart services di production menggunakan Ansible automation.

## 🚀 Quick Commands

```bash
# Rebuild all VMs (after code changes)
./rebuild.sh

# Rebuild specific VM only
./rebuild.sh --vm1    # Frontend & Kong
./rebuild.sh --vm2    # Dashboard & Auth  
./rebuild.sh --vm3    # Sister Service

# Quick restart (no rebuild, for .env changes)
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml

# Check connections
./rebuild.sh --check
```

---

## 📋 When to Use Each Command

### Full Rebuild (`./rebuild.sh`)

**Use when:**
- ✅ Backend code changed (PHP/Go)
- ✅ Frontend code changed (Next.js)
- ✅ Dockerfile changed
- ✅ Composer/NPM dependencies changed

**What it does:**
1. Pull latest code from git
2. Rebuild Docker images (--no-cache)
3. Restart all services
4. Verify services are healthy

**Time:** ~10-15 minutes

---

### Quick Restart (`quick-restart.yml`)

**Use when:**
- ✅ Only .env files changed
- ✅ Only Nginx config changed
- ✅ Want to pickup config changes quickly
- ❌ NO code changes

**What it does:**
1. Pull latest code
2. Restart services (no rebuild)

**Time:** ~30 seconds

---

## 🎯 Deployment Scenarios

### Scenario 1: Updated Backend PHP Code

```bash
# Option A: Rebuild only VM2 (faster, recommended)
./rebuild.sh --vm2

# Option B: Rebuild all (if multiple VMs changed)
./rebuild.sh
```

### Scenario 2: Updated Frontend Code

```bash
./rebuild.sh --vm1
```

### Scenario 3: Updated Sister Service (Go)

```bash
./rebuild.sh --vm3
```

### Scenario 4: Changed .env Files

```bash
# No rebuild needed, just restart
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml
```

### Scenario 5: Changed Performance Tuning

```bash
# If changed Dockerfile (PHP-FPM, OPcache)
./rebuild.sh --vm2

# If changed docker-compose.yml
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml
```

---

## ⚠️ Important: Data Safety

### Kong Database is SAFE

Kong routes/services are stored in PostgreSQL with **persistent volume**.

**Safe operations:**
```bash
# Rebuild Kong - Data SAFE ✅
./rebuild.sh --vm1

# Restart Kong - Data SAFE ✅
docker compose -f services/kong/docker-compose.yml restart

# Restart PostgreSQL - Data SAFE ✅
docker compose -f services/postgres/docker-compose.yml restart
```

**DANGEROUS operations (DON'T DO THIS):**
```bash
# This will DELETE Kong data! ❌
docker compose -f services/postgres/docker-compose.yml down -v

# This will DELETE volume! ❌
docker volume rm myunila-kong-postgres-data-vm2
```

---

## 📖 Complete Deployment Flow

### First Time Setup

```bash
# 1. Deploy VM2 (Backend services first)
ansible-playbook -i inventory/hosts.yml playbooks/01-deploy-vm2-backend1.yml

# 2. Deploy VM1 (Frontend & Kong)
ansible-playbook -i inventory/hosts.yml playbooks/02-deploy-vm1-frontend-kong.yml

# 3. Deploy VM3 (Sister service)
ansible-playbook -i inventory/hosts.yml playbooks/03-deploy-vm3-backend2.yml
```

### Regular Updates

```bash
# After code changes - full rebuild
./rebuild.sh

# After .env changes only - quick restart
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml
```

---

## 🔧 Advanced Usage

### Rebuild with Verbose Output

```bash
ansible-playbook -i inventory/hosts.yml playbooks/rebuild-all-services.yml -v
```

### Rebuild Specific VM with Ansible

```bash
# VM1 only
ansible-playbook -i inventory/hosts.yml playbooks/rebuild-all-services.yml --limit frontend

# VM2 only
ansible-playbook -i inventory/hosts.yml playbooks/rebuild-all-services.yml --limit backend1

# VM3 only
ansible-playbook -i inventory/hosts.yml playbooks/rebuild-all-services.yml --limit backend2
```

### Quick Restart Specific VM

```bash
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml --limit frontend
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml --limit backend1
ansible-playbook -i inventory/hosts.yml playbooks/quick-restart.yml --limit backend2
```

---

## 🐛 Troubleshooting

### Problem: Build Fails - Out of Disk Space

```bash
# SSH to affected VM
ssh myfrontend@192.168.120.41

# Clean up Docker
docker system prune -af
docker image prune -af
docker volume prune -f
```

### Problem: Service Unhealthy After Rebuild

```bash
# Check logs
docker logs myunila-kong --tail 100
docker logs myunila-frontend-service --tail 100
docker logs myunila-dashboard-service --tail 100
docker logs myunila-auth-service --tail 100
docker logs myunila-sister-service --tail 100
```

### Problem: Git Pull Fails

```bash
# Change to SSH remote (one time setup)
ssh myfrontend@192.168.120.41
cd /var/www/my-unila
git remote set-url origin git@bitbucket.org:mahendraunila/my-unila.git
```

### Problem: Ansible Connection Refused

```bash
# Test connection
./rebuild.sh --check

# If fails, check SSH
ssh myfrontend@192.168.120.41
ssh mybackend1@192.168.120.42
ssh mybackend2@192.168.120.43
```

---

## 📊 Performance Comparison

| Operation | Method | Time | Use Case |
|-----------|--------|------|----------|
| Full rebuild all VMs | `./rebuild.sh` | ~15 min | Code changes |
| Rebuild 1 VM | `./rebuild.sh --vm1` | ~3-5 min | Single service changed |
| Quick restart | `quick-restart.yml` | ~30 sec | .env changes only |
| Manual rebuild | SSH + docker | ~20 min | Not recommended |

---

## ✅ Best Practices

1. **Always use Ansible** - More reliable than manual SSH
2. **Rebuild only affected VMs** - Saves time
3. **Use quick restart for .env changes** - Much faster
4. **Never use `-v` flag** with docker-compose down (deletes volumes)
5. **Backup Kong database** before major changes:
   ```bash
   ssh mybackend1@192.168.120.42
   docker exec myunila-kong-postgres-vm2 pg_dump -U kong kong_prod > kong_backup.sql
   ```

---

## 🔗 Related Documentation

- [Tuning Guide](../TUNING-GUIDE.md) - Performance optimization
- [Port Documentation](../PORTS-DOCUMENTATION.md) - Network configuration
- [Main README](./README.md) - Complete Ansible guide

---

**Version:** 1.0
**Last Updated:** 2025-11-12
