#!/bin/bash

echo "========================================="
echo "Diagnosis 502 Bad Gateway Error"
echo "========================================="
echo ""

echo "1. Checking Kong Gateway status..."
ssh myfrontend@192.168.120.41 "docker ps --filter 'name=myunila-kong' --format 'table {{.Names}}\t{{.Status}}'"
echo ""

echo "2. Checking Kong logs for errors..."
ssh myfrontend@192.168.120.41 "docker logs myunila-kong --tail 50" | grep -i error || echo "No errors found"
echo ""

echo "3. Checking Dashboard service status on VM2..."
ssh mybackend1@192.168.120.42 "docker ps --filter 'name=myunila-dashboard' --format 'table {{.Names}}\t{{.Status}}'"
echo ""

echo "4. Checking Dashboard service logs..."
ssh mybackend1@192.168.120.42 "docker logs myunila-dashboard-service --tail 30"
echo ""

echo "5. Checking Dashboard service health endpoint..."
ssh mybackend1@192.168.120.42 "curl -s http://localhost:8082/api/health || echo 'Health check failed'"
echo ""

echo "6. Testing connectivity from VM1 to VM2:8082..."
ssh myfrontend@192.168.120.41 "curl -v --max-time 5 http://192.168.120.42:8082/api/health 2>&1 || echo 'Connection failed'"
echo ""

echo "7. Checking Kong upstream configuration..."
ssh myfrontend@192.168.120.41 "docker exec myunila-kong curl -s http://localhost:8001/upstreams/dashboard-upstream/targets || echo 'Cannot get upstream targets'"
echo ""

echo "8. Checking Kong service configuration..."
ssh myfrontend@192.168.120.41 "docker exec myunila-kong curl -s http://localhost:8001/services/dashboard-service || echo 'Cannot get service config'"
echo ""

echo "9. Checking Kong routes..."
ssh myfrontend@192.168.120.41 "docker exec myunila-kong curl -s http://localhost:8001/routes | grep -A 5 'dashboard-service' || echo 'Cannot find dashboard route'"
echo ""

echo "========================================="
echo "Diagnosis Complete"
echo "========================================="
