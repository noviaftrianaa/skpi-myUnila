# RBAC SQL Scripts (man_akses.menu_role)

Folder ini berisi **SQL scripts terkontrol** untuk perubahan RBAC (menu_role assignments).

## Kenapa SQL Script, bukan Seeder?

Seeder PHP rentan accidental run di production dan, jika logic DELETE+INSERT-nya gagal di tengah, dapat menghapus seluruh menu_role assignments — user kehilangan akses massal. Kami pernah mengalami insiden seperti ini (2026-05-13).

SQL script di sini:
- **Versioned** per perubahan (filename `YYYYMMDD_<deskripsi>.sql`)
- **Reviewable** — plain SQL, mudah diaudit sebelum dijalankan
- **Idempotent** — semua INSERT pakai `WHERE NOT EXISTS`
- **Explicit** — harus diketik manual, tidak bisa keliru `php artisan db:seed`

## Konvensi Penamaan

```
YYYYMMDD_<aksi>_<scope>.sql
```

Contoh:
- `20260513_restore_menu_role_post_incident.sql`
- `20260514_grant_kajur_to_data_unila.sql`
- `20260601_add_admin_jurusan_to_simbak.sql`

## Template Aman

Setiap script di folder ini WAJIB mulai dengan:

```sql
-- Description: <apa yang di-update>
-- Author: <nama>
-- Date: YYYY-MM-DD
-- Tested on: staging? production?
-- Rollback: SELECT ... FROM menu_role_backup_<date> (lihat bagian rollback)

BEGIN TRANSACTION;

-- 1) Backup state (kalau belum)
-- SELECT * INTO man_akses.menu_role_backup_YYYYMMDD FROM man_akses.menu_role;

-- 2) Idempotent INSERT (no overwrite)
INSERT INTO man_akses.menu_role
    (id_peran, id_menu, akses_menu, a_boleh_show, a_boleh_insert, a_boleh_update,
     a_boleh_delete, a_boleh_sanggah, approval_menu, tgl_create, last_update,
     soft_delete, last_sync, id_updater)
SELECT
    :id_peran, m.id_menu, 'full', 1, 0, 0, 0, 0, 1,
    GETDATE(), GETDATE(), 0, GETDATE(),
    '11111111-1111-1111-1111-111111111111'
FROM man_akses.menu m
INNER JOIN man_akses.aplikasi a ON a.id_aplikasi = m.id_aplikasi
LEFT JOIN man_akses.menu_role mr
    ON mr.id_menu = m.id_menu AND mr.id_peran = :id_peran AND mr.soft_delete = 0
WHERE a.app_slug = :app_slug
  AND mr.id_menu IS NULL;  -- only insert if doesn't exist

-- 3) Verify
SELECT @@ROWCOUNT AS rows_inserted;

COMMIT TRANSACTION;
-- ROLLBACK TRANSACTION;  -- uncomment ini kalau ada masalah
```

## Workflow Production

1. **Draft SQL di local/staging** — tulis script versioned
2. **Test di staging** — verifikasi efeknya
3. **Backup production** sebelum eksekusi:
   ```sql
   SELECT * INTO man_akses.menu_role_backup_YYYYMMDD FROM man_akses.menu_role;
   ```
4. **Run SQL via DBeaver / mssql-cli** dengan transaction wrapper
5. **Smoke test** — login as affected role, verify access
6. **Commit script** ke git: `database/sql/rbac/YYYYMMDD_*.sql`

## Rollback

Backup tabel selalu ada di `man_akses.menu_role_backup_YYYYMMDD`. Untuk restore:

```sql
BEGIN TRANSACTION;

-- Pastikan ini state yang benar untuk di-restore
SELECT COUNT(*) FROM man_akses.menu_role_backup_YYYYMMDD;

-- Wipe current, insert dari backup
DELETE FROM man_akses.menu_role
WHERE id_menu IN (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = '<APP_ID>');

INSERT INTO man_akses.menu_role
SELECT * FROM man_akses.menu_role_backup_YYYYMMDD
WHERE id_menu IN (SELECT id_menu FROM man_akses.menu WHERE id_aplikasi = '<APP_ID>');

-- Verify before commit
SELECT COUNT(*) FROM man_akses.menu_role;

COMMIT;
-- ROLLBACK;  -- jika hasil tidak sesuai
```

## Apa yang TIDAK Boleh

- ❌ Jangan jalankan `DELETE FROM menu_role` di production tanpa backup
- ❌ Jangan run `php artisan db:seed --class=PortalRbacSeeder` (sudah dihapus)
- ❌ Jangan run script tanpa transaction wrapper di production
- ❌ Jangan auto-run via cron / CI — RBAC perubahan harus reviewed
