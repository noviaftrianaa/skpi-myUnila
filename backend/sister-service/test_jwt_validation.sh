#!/bin/bash

echo "======================================"
echo "JWT Validation Test Script"
echo "======================================"
echo ""

# Step 1: Get Kong JWT secret
echo "1. Checking Kong JWT credential..."
KONG_JWT=$(curl -s http://localhost:9801/consumers/auth-service/jwt)
echo "$KONG_JWT" | python -m json.tool
echo ""

# Step 2: Get Auth Service JWT secret
echo "2. Checking Auth Service JWT secret..."
AUTH_SECRET=$(docker exec myunila-auth-service env | grep "^JWT_SECRET=" | cut -d= -f2)
echo "Auth Service JWT Secret: $AUTH_SECRET"
echo ""

# Step 3: Check if they match
KONG_SECRET=$(echo "$KONG_JWT" | python -c "import sys, json; print(json.load(sys.stdin)['data'][0]['secret'])" 2>/dev/null)
echo "Kong JWT Secret: $KONG_SECRET"
echo ""

if [ "$AUTH_SECRET" = "$KONG_SECRET" ]; then
    echo "✅ Secrets MATCH"
else
    echo "❌ Secrets DO NOT MATCH"
    echo "  Auth Service: $AUTH_SECRET"
    echo "  Kong:         $KONG_SECRET"
fi
echo ""

# Step 4: Test with browser's token (you need to paste it here)
echo "4. To test with your browser token:"
echo "   1. Open Browser DevTools → Application → Local Storage"
echo "   2. Copy the value of 'token' key"
echo "   3. Run this command:"
echo ""
echo "      TOKEN='<paste-your-token-here>'"
echo "      curl -X GET http://localhost:9800/sister-service/api/v1/referensi/agama \\"
echo "        -H \"Authorization: Bearer \$TOKEN\" -v"
echo ""
