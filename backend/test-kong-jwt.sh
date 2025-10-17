#!/bin/bash

# Test Kong JWT Validation with your account

echo "========================================="
echo "Testing Kong JWT Validation"
echo "Account: mizar.zulmi1073"
echo "========================================="
echo ""

# Step 1: Login
echo "Step 1: Login to get JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8081/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mizar.zulmi1073","password":"makinjaya"}')

echo "$LOGIN_RESPONSE" | grep -q "success.*true"
if [ $? -eq 0 ]; then
    echo "✓ Login successful"

    # Extract token
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "✓ Token extracted (length: ${#TOKEN} chars)"
    echo ""
else
    echo "✗ Login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

# Step 2: Test public endpoint
echo "Step 2: Test PUBLIC endpoint (no token needed)..."
PUBLIC_RESPONSE=$(curl -s http://localhost:9800/dashboard-service/api/v1/university-profile/quick-facts)
echo "$PUBLIC_RESPONSE" | grep -q "success.*true"
if [ $? -eq 0 ]; then
    echo "✓ Public endpoint works"
else
    echo "✗ Public endpoint failed"
    echo "$PUBLIC_RESPONSE"
fi
echo ""

# Step 3: Test protected endpoint WITHOUT token
echo "Step 3: Test PROTECTED endpoint WITHOUT token (should fail)..."
NO_TOKEN_RESPONSE=$(curl -s http://localhost:9800/dashboard-service/api/v1/my-profile)
echo "$NO_TOKEN_RESPONSE" | grep -q "Unauthorized"
if [ $? -eq 0 ]; then
    echo "✓ Correctly rejected (Unauthorized)"
else
    echo "✗ Should return Unauthorized"
    echo "$NO_TOKEN_RESPONSE"
fi
echo ""

# Step 4: Test protected endpoint WITH token
echo "Step 4: Test PROTECTED endpoint WITH token (should success)..."
PROTECTED_RESPONSE=$(curl -s http://localhost:9800/dashboard-service/api/v1/my-profile \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$PROTECTED_RESPONSE"
echo ""

echo "$PROTECTED_RESPONSE" | grep -q "success.*true"
if [ $? -eq 0 ]; then
    echo "✓ Protected endpoint works with JWT!"
    echo ""
    echo "User Info:"
    echo "$PROTECTED_RESPONSE" | grep -o '"name":"[^"]*"' | head -1
    echo "$PROTECTED_RESPONSE" | grep -o '"email":"[^"]*"' | head -1
    echo "$PROTECTED_RESPONSE" | grep -o '"role":"[^"]*"' | head -1
else
    echo "✗ Protected endpoint failed"
    echo ""
    echo "Debugging info:"
    echo "- Token length: ${#TOKEN}"
    echo "- Token starts with: ${TOKEN:0:50}..."

    # Test direct to service (bypass Kong)
    echo ""
    echo "Testing DIRECT to service (simulating Kong headers)..."
    DIRECT_RESPONSE=$(curl -s http://localhost:8082/api/v1/my-profile \
      -H "X-User-Id: F8C8DC15-D3FF-4A79-A255-EF095D4224A9" \
      -H "X-User-Name: Mizar Zulmi Ramadhan" \
      -H "X-User-Email: mizar.zulmi1073@students.unila.ac.id" \
      -H "X-User-Role: Mahasiswa" \
      -H "X-User-Username: mizar.zulmi1073")

    echo "Direct response:"
    echo "$DIRECT_RESPONSE"

    echo "$DIRECT_RESPONSE" | grep -q "success.*true"
    if [ $? -eq 0 ]; then
        echo "✓ Service works when bypassing Kong"
        echo "✗ Issue is with Kong JWT validation"
    else
        echo "✗ Service itself has issues"
    fi
fi

echo ""
echo "========================================="
echo "Test Complete"
echo "========================================="
