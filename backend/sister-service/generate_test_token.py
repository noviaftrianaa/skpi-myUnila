#!/usr/bin/env python3
"""
Generate test JWT token for Sister Service testing
"""
import jwt
import datetime

# JWT Configuration (from auth-service)
JWT_SECRET = "!UnilaAuthService2025"
JWT_ALGORITHM = "HS256"

# Test user payload
payload = {
    "iss": "http://localhost:8081",
    "iat": datetime.datetime.utcnow(),
    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
    "nbf": datetime.datetime.utcnow(),
    "sub": "TEST-USER-ID-123",
    "jti": "test-jwt-id-12345",
    "type": "access",
    "user": {
        "id": "TEST-USER-ID-123",
        "username": "test_developer",
        "email": "test@unila.ac.id",
        "name": "Test Developer User",
        "role": "Developer"  # Important: Must be "Developer" for Sister Service
    }
}

# Generate token
token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

print("\n" + "="*80)
print("TEST JWT TOKEN GENERATED")
print("="*80)
print(f"\nToken: {token}")
print(f"\nUser: {payload['user']['name']}")
print(f"Role: {payload['user']['role']}")
print(f"Expires: {payload['exp']}")
print("\n" + "="*80)
print("\nUSAGE:")
print("="*80)
print("\n1. Test with cURL:")
print(f'\ncurl -X GET http://localhost:8083/api/v1/referensi/agama \\')
print(f'  -H "Authorization: Bearer {token}"')
print("\n2. Test with Swagger UI:")
print("   - Open: http://localhost:8083/swagger/index.html")
print("   - Click 'Authorize' button")
print(f"   - Enter: Bearer {token}")
print("   - Click 'Authorize' then 'Close'")
print("   - Try any endpoint!")
print("\n" + "="*80 + "\n")
