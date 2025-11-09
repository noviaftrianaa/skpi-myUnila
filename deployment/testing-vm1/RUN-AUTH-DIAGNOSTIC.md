# Auth Service Login Diagnostic

## Problem
Auth service login endpoint returns 504 Gateway Timeout after 60 seconds.

## To Run Diagnostic

SSH to server as root or user with docker permissions:

```bash
# Copy script to correct location
sudo mv ~/diagnose-auth-login.sh /var/www/my-unila/deployment/testing-vm1/scripts/
sudo chmod +x /var/www/my-unila/deployment/testing-vm1/scripts/diagnose-auth-login.sh

# Run diagnostic
cd /var/www/my-unila/deployment/testing-vm1/scripts
sudo ./diagnose-auth-login.sh
```

## What the Diagnostic Checks

1. **Container Status** - Is auth-service running?
2. **Health Check** - What's the container health status?
3. **Laravel Logs** - Any errors in application logs?
4. **PHP-FPM Logs** - Any PHP errors?
5. **Environment Variables** - Are all required vars set?
6. **Database Connectivity** - Can it connect to SQL Server?
7. **Redis Connectivity** - Can it connect to Redis?
8. **Users Table** - Does it exist and have data?
9. **Query Performance** - How long does a simple query take?
10. **Kong Configuration** - What's the timeout setting?
11. **Kong Logs** - Recent requests to auth-service

## Expected Findings

The diagnostic will help identify:

- **If Kong timeout is 60s instead of 180s** → Need to restart Kong
- **If database queries are slow** → Need to optimize queries or increase resources
- **If no users exist** → Need to seed database
- **If Laravel errors exist** → Need to fix application code
- **If environment variables are missing** → Need to run update-auth-env.sh

## Quick Fixes

### 1. If Kong timeout is still 60s:
```bash
cd /var/www/my-unila/deployment/testing-vm1/services/2-gateway
sudo docker compose -f docker-compose.kong.yml restart
sleep 15
# Test again
curl -v -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'
```

### 2. If environment variables are missing:
```bash
cd /var/www/my-unila/deployment/testing-vm1/scripts
sudo ./update-auth-env.sh
sudo ./restart-auth-with-env.sh
```

### 3. If no users exist:
```bash
sudo docker exec myunila-auth-service php artisan db:seed
```

### 4. Check Laravel logs manually:
```bash
sudo docker exec myunila-auth-service cat /var/www/storage/logs/laravel.log | tail -100
```

### 5. Test login directly inside container (bypass Kong):
```bash
sudo docker exec myunila-auth-service curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'
```

## Frontend Fix

The frontend is sending "email" field but the endpoint expects "username". Update frontend login form to send:

```javascript
{
  "username": "admin",  // NOT "email"
  "password": "Admin@2024"
}
```
