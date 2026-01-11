# Table Mapping Guide

Mapping antara Laravel models dengan SQL Server tables di schema `man_akses`.

## Overview

Karena menggunakan existing SQL Server database dengan konvensi penamaan berbeda, kita perlu mapping antara Laravel dan SQL Server.

## Tables Mapping

### 1. Users / Pengguna

**Laravel Model**: `User`
**SQL Server Table**: `man_akses.pengguna`

| Laravel Column | SQL Server Column | Type | Notes |
|---|---|---|---|
| id | id_pengguna | uniqueidentifier | Primary Key |
| sso_id | username | varchar(60) | SSO username/NPM/NIP |
| npm | - | - | Derived from username (if mahasiswa) |
| nip | - | - | Derived from username (if dosen/tendik) |
| name | nm_pengguna | varchar(200) | |
| email | email | varchar(60) | |
| phone | no_hp | varchar(20) | |
| password | password_encrypt | varchar(255) | |
| is_active | a_aktif | numeric(1,0) | 1=active, 0=inactive |
| last_login_at | last_update | datetime | Reuse existing column |
| created_at | tgl_create | datetime | |
| updated_at | last_update | datetime | |
| deleted_at | soft_delete | numeric(1,0) | 1=deleted, 0=active |

**Notes**:
- `username` di SQL Server akan menjadi `sso_id` di Laravel
- Role akan diambil dari table `role_pengguna`
- Password menggunakan `password_encrypt` dan `type_encrypt`

### 2. MFA Configuration

**Laravel Model**: `MfaPengguna` (New Model)
**SQL Server Table**: `man_akses.mfa_pengguna` (New Table)

| Laravel Column | SQL Server Column | Type |
|---|---|---|
| id | id_mfa | uniqueidentifier |
| user_id | id_pengguna | uniqueidentifier (FK) |
| mfa_enabled | mfa_enabled | numeric(1,0) |
| mfa_secret | mfa_secret | varchar(500) |
| mfa_type | mfa_type | varchar(20) |
| enabled_at | tgl_enabled | datetime |
| disabled_at | tgl_disabled | datetime |
| created_at | tgl_create | datetime |
| updated_at | last_update | datetime |
| deleted_at | soft_delete | numeric(1,0) |

### 3. MFA Backup Codes

**Laravel Model**: `MfaBackupCode` (Renamed)
**SQL Server Table**: `man_akses.mfa_backup_code` (New)

| Laravel Column | SQL Server Column | Type |
|---|---|---|
| id | id_backup_code | uniqueidentifier |
| user_id | id_pengguna | uniqueidentifier (FK) |
| code_hash | code_hash | varchar(255) |
| used | a_used | numeric(1,0) |
| used_at | tgl_used | datetime |
| created_at | tgl_create | datetime |
| updated_at | last_update | datetime |
| deleted_at | soft_delete | numeric(1,0) |

### 4. MFA Sessions

**Laravel Model**: `MfaSession` (Renamed)
**SQL Server Table**: `man_akses.mfa_session` (New)

| Laravel Column | SQL Server Column | Type |
|---|---|---|
| id | id_mfa_session | uniqueidentifier |
| user_id | id_pengguna | uniqueidentifier (FK) |
| temp_token | temp_token | varchar(500) |
| attempts | attempts | int |
| ip_address | ip_address | varchar(45) |
| user_agent | user_agent | varchar(500) |
| verified | a_verified | numeric(1,0) |
| verified_at | tgl_verified | datetime |
| expires_at | tgl_expired | datetime |
| created_at | tgl_create | datetime |
| updated_at | last_update | datetime |
| deleted_at | soft_delete | numeric(1,0) |

### 5. Refresh Tokens

**Laravel Model**: `RefreshToken` (Renamed)
**SQL Server Table**: `man_akses.refresh_token` (New)

| Laravel Column | SQL Server Column | Type |
|---|---|---|
| id | id_refresh_token | uniqueidentifier |
| user_id | id_pengguna | uniqueidentifier (FK) |
| token_id | token_id | varchar(255) |
| token_hash | token_hash | varchar(500) |
| device_name | device_name | varchar(100) |
| device_type | device_type | varchar(20) |
| ip_address | ip_address | varchar(45) |
| user_agent | user_agent | varchar(500) |
| expires_at | tgl_expired | datetime |
| last_used_at | tgl_last_used | datetime |
| is_revoked | a_revoked | numeric(1,0) |
| revoked_at | tgl_revoked | datetime |
| revoked_reason | revoked_reason | varchar(100) |
| created_at | tgl_create | datetime |
| updated_at | last_update | datetime |
| deleted_at | soft_delete | numeric(1,0) |

### 6. Login Logs

**Laravel Model**: `LoginLog` (Renamed)
**SQL Server Table**: `man_akses.login_log` (New)

| Laravel Column | SQL Server Column | Type |
|---|---|---|
| id | id_login_log | uniqueidentifier |
| user_id | id_pengguna | uniqueidentifier (FK nullable) |
| email | email | varchar(60) |
| username | username | varchar(60) |
| status | status | varchar(20) |
| failure_reason | failure_reason | varchar(255) |
| ip_address | ip_address | varchar(45) |
| user_agent | user_agent | varchar(500) |
| device_type | device_type | varchar(20) |
| browser | browser | varchar(50) |
| platform | platform | varchar(50) |
| location | location | varchar(100) |
| mfa_verified | a_mfa_verified | numeric(1,0) |
| created_at | tgl_create | datetime |

### 7. Token Blacklist

**Laravel Model**: `TokenBlacklist` (Renamed)
**SQL Server Table**: `man_akses.token_blacklist` (New)

| Laravel Column | SQL Server Column | Type |
|---|---|---|
| id | id_blacklist | uniqueidentifier |
| user_id | id_pengguna | uniqueidentifier (FK nullable) |
| token_id | token_id | varchar(255) |
| blacklisted_at | tgl_blacklisted | datetime |
| expires_at | tgl_expired | datetime |
| reason | reason | varchar(100) |

### 8. Role/Peran

**Existing Table**: `man_akses.role_pengguna`

Will be used to get user role(s):
- Relationship: `pengguna` -> `role_pengguna` -> `peran`
- User bisa punya multiple roles per organisasi
- Primary role determination logic needed

## Laravel Configuration

### 1. Update Model Primary Keys

```php
// All models harus pake ini
protected $primaryKey = 'id_xxx'; // sesuaikan
protected $keyType = 'string';
public $incrementing = false;
```

### 2. Update Table Names

```php
// Setiap model
protected $table = 'man_akses.table_name';
```

### 3. Update Column Names

```php
// Const untuk timestamp columns
const CREATED_AT = 'tgl_create';
const UPDATED_AT = 'last_update';
const DELETED_AT = 'soft_delete'; // Special: numeric(1,0) not datetime
```

### 4. Custom Soft Delete

Karena SQL Server menggunakan `numeric(1,0)` untuk soft delete, bukan timestamp:

```php
// Trait khusus untuk soft delete dengan numeric
protected function performDeleteOnModel()
{
    $this->{$this->getDeletedAtColumn()} = 1;
    $this->save();
}

protected function runSoftDelete()
{
    $this->{$this->getDeletedAtColumn()} = 1;
    return $this->save();
}
```

## Migration Strategy

### Option 1: Manual SQL Script (Recommended)

1. Run `create_mfa_tables.sql` di SQL Server Management Studio
2. Update Laravel models untuk mapping
3. Skip Laravel migrations

### Option 2: Laravel Migration Generator

1. Install: `composer require --dev kitloong/laravel-migrations-generator`
2. Generate from existing tables: `php artisan migrate:generate`
3. Edit generated migrations untuk MFA tables

### Option 3: Custom Laravel Migration

Create migration yang execute SQL script:

```php
public function up()
{
    DB::unprepared(file_get_contents(
        database_path('sqlserver/create_mfa_tables.sql')
    ));
}
```

## Testing Connection

### Test SQL Server Connection

```bash
# Inside container
docker exec -it myunila-auth-service php artisan tinker

# Test connection
DB::connection('sqlsrv')->getPdo();

# Test table exists
DB::connection('sqlsrv')->table('man_akses.pengguna')->count();
```

### Test Query

```php
// Tinker
use App\Models\User;

// Test select
$user = DB::table('man_akses.pengguna')->first();
dd($user);

// Test with model (after mapping)
$user = User::first();
dd($user);
```

## Stored Procedures Usage

### From Laravel

```php
// Call stored procedure
$results = DB::select('EXEC man_akses.sp_get_user_mfa_status ?', [$userId]);

// Cleanup expired tokens
DB::statement('EXEC man_akses.sp_cleanup_expired_tokens');

// Revoke all tokens
DB::statement('EXEC man_akses.sp_revoke_all_user_tokens ?, ?', [$userId, 'logout']);
```

## Important Notes

1. **UUID vs uniqueidentifier**
   - Laravel generates UUID v4
   - SQL Server uses uniqueidentifier
   - Use `Str::uuid()` untuk generate

2. **Boolean vs numeric(1,0)**
   - Laravel: true/false
   - SQL Server: 1/0
   - Cast ke integer saat save

3. **Soft Delete**
   - Laravel: deleted_at timestamp
   - SQL Server: soft_delete numeric(1,0)
   - Need custom trait

4. **Timestamps**
   - Prefix `tgl_` untuk date columns
   - Use `GETDATE()` as default in SQL Server

5. **Schema Prefix**
   - Always use `man_akses.table_name`
   - Configure in model: `protected $table = 'man_akses.table_name'`

## Next Steps

1. Run `create_mfa_tables.sql` in SQL Server
2. Update all Laravel models with correct table/column mappings
3. Create custom traits for SQL Server compatibility
4. Test CRUD operations
5. Update services to use correct column names
6. Test complete authentication flow
