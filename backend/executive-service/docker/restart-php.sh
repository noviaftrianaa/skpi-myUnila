#!/bin/bash
# Script untuk restart PHP-FPM di container saat development
# Penggunaan: ./restart-php.sh

echo "🔄 Restarting PHP-FPM in executive-service container..."

docker exec myunila-executive-service pkill -f "php-fpm: master process" && \
docker exec myunila-executive-service php-fpm -D && \
echo "✅ PHP-FPM restarted successfully!" || \
echo "❌ Failed to restart PHP-FPM"

# Atau menggunakan cara yang lebih smooth:
echo "💡 Atau gunakan: docker-compose restart executive-service"
