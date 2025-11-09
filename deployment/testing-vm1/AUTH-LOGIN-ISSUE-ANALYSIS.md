# Auth Service Login Timeout - Root Cause Analysis

## Problem Summary
Login endpoint (`POST /auth-service/api/v1/auth/login`) returns **504 Gateway Timeout** after 60 seconds.

## Root Cause Identified

The issue is in [UserRepository.php:79-151](../../../backend/auth-service/app/Repositories/UserRepository.php#L79-L151), specifically the `getUserDetail()` method.

### The Slow Query

```sql
SELECT
    pg.id_pengguna,
    pg.username,
    pg.nm_pengguna,
    pg.email,
    prn.nm_peran,
    STUFF((SELECT ' ' + UPPER(LEFT(value, 1)) + LOWER(SUBSTRING(value, 2, LEN(value)))
        FROM STRING_SPLIT(sp.nm_lemb, ' ')
        WHERE RTRIM(value) <> ''
        FOR XML PATH('')
    ), 1, 1, '') AS nm_satuan_pendidikan,
    STUFF((SELECT ' ' + UPPER(LEFT(value, 1)) + LOWER(SUBSTRING(value, 2, LEN(value)))
        FROM STRING_SPLIT(fak.nm_lemb, ' ')
        WHERE RTRIM(value) <> ''
        FOR XML PATH('')
    ), 1, 1, '') AS nm_fakultas,
    -- ... 3 more STUFF+STRING_SPLIT operations
FROM
    man_akses.pengguna pg
    OUTER APPLY (
        SELECT TOP 1 rol_appl.id_peran, rol_appl.id_organisasi
        FROM man_akses.role_pengguna rol_appl
        WHERE rol_appl.id_pengguna = pg.id_pengguna
            AND rol_appl.soft_delete = 0
            AND rol_appl.approval_peran = 1
        ORDER BY rol_appl.last_active DESC
    ) AS rol
    LEFT JOIN man_akses.peran prn ON ...
    LEFT JOIN pdrd.sms AS prodi WITH(NOLOCK) ON ...
    LEFT JOIN pdrd.satuan_pendidikan sp WITH(NOLOCK) ON ...
    LEFT JOIN pdrd.sms AS jur WITH(NOLOCK) ON ...
    LEFT JOIN pdrd.sms AS fak WITH(NOLOCK) ON ...
    LEFT JOIN ref.jenjang_pendidikan AS jenj WITH(NOLOCK) ON ...
WHERE
    pg.soft_delete = 0
    AND pg.id_pengguna = ?
```

### Why It's Slow

1. **Multiple LEFT JOINs** - Joining 6+ tables for every login
2. **OUTER APPLY** - Correlated subquery that runs for each row
3. **STRING_SPLIT + STUFF** - Complex string processing repeated 4-5 times
4. **FOR XML PATH** - XML operations for string concatenation
5. **WITH(NOLOCK)** - Dirty reads to avoid blocking, indicates known performance issues
6. **Multiple table scans** - pdrd.sms table joined 3 separate times (prodi, jurusan, fakultas)

### When This Runs

Every single login triggers this query in [AuthService.php:84](../../../backend/auth-service/app/Services/Auth/AuthService.php#L84):

```php
// Get user detail
$userDetail = $this->userRepo->getUserDetail($user->id_pengguna);
```

## Solutions (Ordered by Priority)

### Option 1: Make getUserDetail() Optional (QUICK FIX - 5 minutes)
**Impact**: Immediate fix, login works within seconds
**Trade-off**: Organizational info (fakultas, jurusan, prodi) won't be in login response

**Implementation**:
Edit `AuthService.php` line 84 - Make the query optional:

```php
// Get user detail (optional - skip if taking too long)
try {
    $userDetail = $this->userRepo->getUserDetail($user->id_pengguna);
} catch (\Exception $e) {
    Log::warning('getUserDetail failed, using basic user info', ['user_id' => $user->id_pengguna]);
    $userDetail = null;
}
```

Then update the response builder (lines 108-125) to handle null `$userDetail`:

```php
return [
    'user' => [
        'id' => $user->id_pengguna,
        'username' => $user->username,
        'name' => $user->nm_pengguna,
        'email' => $user->email,
        'role' => $userDetail->nm_peran ?? $activeRole,
        'roles' => $roles,
        'satuan_pendidikan' => $userDetail->nm_satuan_pendidikan ?? null,
        'fakultas' => $userDetail->nm_fakultas ?? null,
        'jurusan' => $userDetail->nm_jurusan ?? null,
        'prodi' => $userDetail->nm_prodi_jenjang ?? null,
        // ... rest of fields
    ],
    'tokens' => [ ... ]
];
```

### Option 2: Add Query Timeout (MEDIUM - 10 minutes)
**Impact**: Prevents infinite hangs
**Trade-off**: Still returns error, but fails fast

**Implementation**:
Edit `UserRepository.php` line 150:

```php
// Add timeout hint
return DB::selectOne($sql, [$userId], ['timeout' => 10]);
```

### Option 3: Optimize the Query (RECOMMENDED - 1-2 hours)

#### 3a. Add Database Indexes
```sql
-- Index on role_pengguna for OUTER APPLY
CREATE NONCLUSTERED INDEX IX_role_pengguna_user_active
ON man_akses.role_pengguna (id_pengguna, soft_delete, approval_peran, last_active DESC)
INCLUDE (id_peran, id_organisasi);

-- Index on pdrd.sms for faster joins
CREATE NONCLUSTERED INDEX IX_sms_lookup
ON pdrd.sms (id_sms, soft_delete)
INCLUDE (nm_lemb, id_sp, id_jur_unila, id_fak_unila, id_jenj_didik);

-- Index on satuan_pendidikan
CREATE NONCLUSTERED INDEX IX_satuan_pendidikan_lookup
ON pdrd.satuan_pendidikan (id_sp, soft_delete)
INCLUDE (nm_lemb);
```

#### 3b. Simplify String Processing
Move the STUFF+STRING_SPLIT operations to application layer:

```php
// In UserRepository.php - simplified query
$sql = "
    SELECT
        pg.id_pengguna,
        pg.username,
        pg.nm_pengguna,
        pg.email,
        prn.nm_peran,
        sp.nm_lemb AS nm_satuan_pendidikan,  -- Raw value
        fak.nm_lemb AS nm_fakultas,          -- Raw value
        jur.nm_lemb AS nm_jurusan,           -- Raw value
        prodi.nm_lemb AS nm_prodi,           -- Raw value
        jenj.nm_jenj_didik
    FROM ...
";

$result = DB::selectOne($sql, [$userId]);

// Format names in PHP (much faster than SQL)
if ($result) {
    $result->nm_satuan_pendidikan = $this->formatProperCase($result->nm_satuan_pendidikan);
    $result->nm_fakultas = $this->formatProperCase($result->nm_fakultas);
    $result->nm_jurusan = $this->formatProperCase($result->nm_jurusan);
    $result->nm_prodi_jenjang = $result->nm_prodi
        ? $this->formatProperCase($result->nm_prodi) . " ({$result->nm_jenj_didik})"
        : null;
}

return $result;

// Helper method
private function formatProperCase(?string $text): ?string
{
    if (!$text) return null;
    return mb_convert_case(mb_strtolower($text), MB_CASE_TITLE, 'UTF-8');
}
```

### Option 4: Cache User Details (BEST LONG-TERM - 2-3 hours)
**Impact**: Organizational info loaded once, cached in Redis
**Trade-off**: Slightly stale data (acceptable for org structure)

**Implementation**:
```php
public function getUserDetail(string $userId): ?object
{
    $cacheKey = "user_detail:{$userId}";

    // Try cache first (24 hour TTL)
    $cached = Cache::remember($cacheKey, 86400, function() use ($userId) {
        return $this->fetchUserDetailFromDatabase($userId);
    });

    return $cached;
}

// Clear cache when user/org data changes
public function clearUserDetailCache(string $userId): void
{
    Cache::forget("user_detail:{$userId}");
}
```

### Option 5: Load Org Details Separately (ARCHITECTURAL - 4-6 hours)
**Impact**: Login fast, org details loaded asynchronously
**Trade-off**: Requires frontend changes

**Flow**:
1. Login returns basic user info (fast)
2. Frontend calls separate endpoint `/api/v1/user/organization-details`
3. Load org details in background, update UI when ready

## Recommended Action Plan

### Immediate (Do Now - 15 minutes)
1. ✅ **Deploy diagnostic script** to confirm this is the issue
2. ⚡ **Apply Option 1** (make getUserDetail optional) - Get login working ASAP
3. 🔄 **Restart Kong** to apply 180s timeout configuration

### Short-term (Today - 2 hours)
4. 🗄️ **Apply Option 3a** (add database indexes) - Optimize existing query
5. 📊 **Monitor query performance** - Check if indexes help enough

### Medium-term (This Week - 4 hours)
6. 💾 **Apply Option 4** (add Redis caching) - Reduce database load
7. 🧹 **Apply Option 3b** (move string formatting to PHP) - Simplify SQL

### Long-term (Next Sprint)
8. 🏗️ **Consider Option 5** (separate endpoint) - Better UX + performance

## Testing After Fix

```bash
# Test login performance
time curl -X POST http://192.168.123.172:9800/auth-service/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@2024"}'

# Should return in < 5 seconds with Option 1
# Should return in < 2 seconds with Option 3a + 3b
# Should return in < 1 second with Option 4
```

## Additional Findings

### Kong Timeout Still 60s
Despite configuration for 180s in `docker-compose.kong.yml`, Kong is still using 60s timeout.

**Fix**: Restart Kong service
```bash
cd /var/www/my-unila/deployment/testing-vm1/services/2-gateway
docker compose -f docker-compose.kong.yml restart
```

### Frontend Sending Wrong Field
Frontend is sending `"email"` but endpoint expects `"username"`.

**Fix**: Update frontend login form:
```javascript
// Change from:
{ email: "admin@example.com", password: "..." }

// To:
{ username: "admin", password: "..." }
```

## Files to Edit

1. **Quick Fix**: [backend/auth-service/app/Services/Auth/AuthService.php](../../../backend/auth-service/app/Services/Auth/AuthService.php#L84)
2. **Query Optimization**: [backend/auth-service/app/Repositories/UserRepository.php](../../../backend/auth-service/app/Repositories/UserRepository.php#L79)
3. **Database Indexes**: Run SQL scripts on production SQL Server
4. **Frontend**: Login form component (exact file TBD)

## Verification

After applying fixes, verify:
- ✅ Login completes in < 5 seconds
- ✅ Returns 200 OK with access_token + refresh_token
- ✅ User object includes basic info (username, email, role)
- ✅ No 504 Gateway Timeout errors
- ✅ No 500 errors in auth-service logs
