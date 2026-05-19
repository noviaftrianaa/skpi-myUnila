-- Description: AUDIT read-only — state mekanisme aplikasi_organisasi whitelist
--              utk basis keputusan enable filter per portal app.
-- Author: mizar.zulmi
-- Date: 2026-05-18
--
-- Tidak modify data. Pure SELECT. Aman dijalankan kapan saja.
--
-- Mekanisme existing (sudah live):
--   - man_akses.aplikasi.a_filter_organisasi (BIT) — flag on/off per app
--   - man_akses.aplikasi_organisasi — whitelist (id_aplikasi, id_organisasi, a_include_children)
--   - man_akses.peran.a_universal — role yg bypass filter (super role)
--   - logic: UserContextService::checkAppAccess

-- ============================================================
-- STEP 1: Inventory aplikasi PORTAL — sesuai my.unila.ac.id/portal
--          (a_aktif=1 AND a_tampil_portal=1). Plus kategori_aplikasi
--          supaya bisa keputusan filter per-kategori (kalau perlu).
-- ============================================================
SELECT
    a.app_slug,
    a.nm_aplikasi,
    ISNULL(k.nm_kategori, '-') AS kategori,
    ISNULL(a.a_tampil_portal, 0) AS tampil_portal,
    ISNULL(a.a_filter_organisasi, 0) AS filter_aktif,
    ISNULL(a.a_maintenance, 0) AS maintenance,
    ISNULL(a.a_live, 0) AS live,
    (SELECT COUNT(*) FROM man_akses.aplikasi_organisasi ao
     WHERE ao.id_aplikasi = a.id_aplikasi
       AND ISNULL(ao.soft_delete, 0) = 0) AS whitelist_count,
    (SELECT COUNT(*) FROM man_akses.aplikasi_organisasi ao
     WHERE ao.id_aplikasi = a.id_aplikasi
       AND ao.a_include_children = 1
       AND ISNULL(ao.soft_delete, 0) = 0) AS whitelist_with_children
FROM man_akses.aplikasi a
LEFT JOIN man_akses.kategori_aplikasi k ON k.id_kategori = a.id_kategori
WHERE ISNULL(a.a_aktif, 0) = 1
  AND ISNULL(a.a_tampil_portal, 0) = 1
ORDER BY ISNULL(k.nm_kategori, 'zzz'), a.app_slug;

-- ============================================================
-- STEP 2: Universal roles (bypass filter — perlu diketahui supaya
--          paham siapa yg auto-pass meski filter di-enable)
-- ============================================================
SELECT
    pe.id_peran,
    pe.nm_peran,
    ISNULL(pe.a_universal, 0) AS universal,
    (SELECT COUNT(*) FROM man_akses.role_pengguna rp
     WHERE rp.id_peran = pe.id_peran AND ISNULL(rp.soft_delete, 0) = 0) AS user_count
FROM man_akses.peran pe
WHERE pe.expired_date IS NULL
  AND ISNULL(pe.a_universal, 0) = 1
ORDER BY pe.nm_peran;

-- ============================================================
-- STEP 3: Distribusi user role Developer (107) by organisasi
--          — untuk memahami spread sebelum putuskan whitelist
-- ============================================================
SELECT
    CAST(rp.id_organisasi AS VARCHAR(36)) AS id_organisasi,
    uo.nm_lemb AS nm_organisasi,
    COUNT(*) AS user_count
FROM man_akses.role_pengguna rp
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = rp.id_organisasi
WHERE rp.id_peran = 107
  AND ISNULL(rp.soft_delete, 0) = 0
GROUP BY rp.id_organisasi, uo.nm_lemb
ORDER BY user_count DESC, nm_organisasi;

-- ============================================================
-- STEP 4: Target apps — detail whitelist saat ini (kalau ada)
--          Apps yg biasanya cuma untuk internal pimpinan/admin Unila:
--          data-unila, dashboard-pimpinan, simbak, akreditasi,
--          manakses, executive-magang (dashboard pimpinan dev).
-- ============================================================
SELECT
    a.app_slug,
    a.nm_aplikasi,
    ISNULL(a.a_filter_organisasi, 0) AS filter_aktif,
    CAST(ao.id_organisasi AS VARCHAR(36)) AS id_organisasi,
    uo.nm_lemb AS nm_organisasi,
    ISNULL(ao.a_include_children, 0) AS include_children,
    ISNULL(ao.a_aktif, 0) AS aktif,
    ao.tgl_create
FROM man_akses.aplikasi a
LEFT JOIN man_akses.aplikasi_organisasi ao
    ON ao.id_aplikasi = a.id_aplikasi AND ISNULL(ao.soft_delete, 0) = 0
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ao.id_organisasi
WHERE a.app_slug IN (
    'data-unila',
    'dashboard-pimpinan',
    'simbak',
    'akreditasi',
    'manakses',
    'executive-magang',
    'si-prestasi',
    'si-kkn'
)
ORDER BY a.app_slug, uo.nm_lemb;

-- ============================================================
-- STEP 5: SIMULASI — kalau a_filter_organisasi di-enable utk Data Unila
--          dan Dashboard Pimpinan, siapa yg lolos vs ke-block.
--
--          Catatan: simulasi ini ASUMSI whitelist BELUM dipopulasikan
--          (kalau sudah ada whitelist, lihat STEP 4 dulu).
--          Universal role auto-lolos di kondisi nyata.
-- ============================================================
WITH target_apps AS (
    SELECT a.id_aplikasi, a.app_slug, a.nm_aplikasi
    FROM man_akses.aplikasi a
    WHERE a.app_slug IN ('data-unila', 'dashboard-pimpinan')
),
user_role_apps AS (
    SELECT DISTINCT
        rp.id_pengguna,
        rp.id_peran,
        rp.id_organisasi,
        ta.id_aplikasi,
        ta.app_slug
    FROM man_akses.role_pengguna rp
    INNER JOIN man_akses.menu_role mr ON mr.id_peran = rp.id_peran
        AND ISNULL(mr.soft_delete, 0) = 0
    INNER JOIN man_akses.menu m ON m.id_menu = mr.id_menu AND m.a_aktif = 1
    INNER JOIN target_apps ta ON ta.id_aplikasi = m.id_aplikasi
    WHERE ISNULL(rp.soft_delete, 0) = 0
)
SELECT
    ura.app_slug,
    pe.nm_peran,
    ISNULL(pe.a_universal, 0) AS peran_universal,
    uo.nm_lemb AS unit_organisasi,
    COUNT(DISTINCT ura.id_pengguna) AS user_count,
    CASE
        WHEN ISNULL(pe.a_universal, 0) = 1 THEN 'AUTO-PASS (universal role)'
        WHEN EXISTS (
            SELECT 1 FROM man_akses.aplikasi_organisasi ao
            WHERE ao.id_aplikasi = ura.id_aplikasi
              AND ao.id_organisasi = ura.id_organisasi
              AND ISNULL(ao.soft_delete, 0) = 0
        ) THEN 'PASS (org whitelisted)'
        ELSE 'BLOCKED (org NOT whitelisted)'
    END AS status_kalau_filter_aktif
FROM user_role_apps ura
INNER JOIN man_akses.peran pe ON pe.id_peran = ura.id_peran
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_organisasi = ura.id_organisasi
GROUP BY
    ura.app_slug, pe.nm_peran, pe.a_universal,
    uo.nm_lemb, ura.id_aplikasi, ura.id_organisasi
ORDER BY ura.app_slug, status_kalau_filter_aktif, user_count DESC;

-- ============================================================
-- STEP 6: Sample org candidates utk whitelist Data Unila + Dashboard Pimpinan
--          (Universitas Lampung root + Fakultas + Rektorat + UPT TIK)
-- ============================================================
SELECT
    CAST(uo.id_organisasi AS VARCHAR(36)) AS id_organisasi,
    uo.nm_lemb,
    uo.kd_satker,
    uo.level_organisasi,
    CAST(uo.id_induk_organisasi AS VARCHAR(36)) AS id_induk
FROM man_akses.unit_organisasi uo
WHERE ISNULL(uo.soft_delete, 0) = 0
  AND (
    uo.nm_lemb LIKE '%Universitas Lampung%'
    OR uo.nm_lemb LIKE 'Fakultas %'
    OR uo.nm_lemb LIKE '%Rektorat%'
    OR uo.nm_lemb LIKE '%UPT%'
)
ORDER BY uo.level_organisasi, uo.nm_lemb;
