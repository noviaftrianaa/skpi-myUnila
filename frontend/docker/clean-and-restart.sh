#!/bin/bash

echo "========================================"
echo "Cleaning Next.js Cache"
echo "========================================"
echo ""

echo "[1/4] Stopping any running Next.js server..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "[2/4] Removing .next cache folder..."
rm -rf .next

echo "[3/4] Removing node_modules cache..."
rm -rf node_modules/.cache

echo "[4/4] Verifying .env.local..."
grep "NEXT_PUBLIC_API_URL" .env.local
echo ""

echo "========================================"
echo "Cache cleared successfully!"
echo "========================================"
echo ""
echo "Now run: npm run dev"
echo ""
