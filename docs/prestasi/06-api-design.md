# SI-Prestasi Backend — REST API Design

Draft kontrak API untuk service `si-prestasi-service`. Semua endpoint di bawah prefix `/api` setelah Kong route `/si-prestasi-service`.

---

## Auth

Semua endpoint butuh JWT Unila (dari auth-service). Middleware validasi JWT di Kong + backend re-validate role.

---

## Lookup (helper)

### `GET /api/lookup/mahasiswa?q={nim|nama}&limit=10`

Search mahasiswa di pdut. Return:
```json
[
  { "nim": "...", "nama": "...", "id_prodi": "...", "nm_prodi": "...", "id_fakultas": "...", "status": "AKTIF" }
]
```

### `GET /api/lookup/dosen?q={nuptk|nidn|nama}&limit=10`

Return: `{ nuptk, nidn, nama, unit_kerja, ... }`

---

## Prestasi Mandiri

### `GET /api/prestasi-mandiri`

Query params:
- `tahun` int
- `level` enum
- `kategori` enum
- `status` enum (draft/ready/sent/error/acknowledged)
- `fakultas` varchar(8)
- `nim` — filter prestasi yang melibatkan NIM ini
- `page`, `per_page` (default 25)

Response: pagination envelope.

### `GET /api/prestasi-mandiri/{id}`

Detail single record + peserta mahasiswa + dosen + sync history.

### `POST /api/prestasi-mandiri`

Create draft. Body mirror schema (lihat §04) + `mahasiswa` & `dosen` arrays. Server validate:
- Semua NIM exists & status aktif
- `tgl_sertifikat` tidak future date > 1 hari
- `jumlah_unit_peserta >= jumlah mahasiswa unik`
- Enum valid

### `PATCH /api/prestasi-mandiri/{id}`

Update. Hanya boleh kalau status ∈ {draft, error}. Kalau sudah `sent`/`acknowledged`, hanya boleh edit `keterangan` dan `status_workflow = archived` (soft).

### `DELETE /api/prestasi-mandiri/{id}`

Soft delete. Hanya draft/error.

### `POST /api/prestasi-mandiri/{id}/submit`

Ubah status `draft|error → ready`. Trigger dispatch `SubmitToSimkatmawaJob`. Permission: `can:submit-prestasi`.

### `POST /api/prestasi-mandiri/{id}/retry`

Untuk status `error`. Re-queue job. Reset retry counter ke 0.

### `GET /api/prestasi-mandiri/{id}/sync-history`

List semua `sync.submission` row untuk record ini.

---

## Sertifikasi — sama pattern, path `/api/sertifikasi`

Field beda sesuai §04.

## Rekognisi — sama pattern, path `/api/rekognisi`

Tambah `jenis_kode` di body.

---

## File upload

### `POST /api/files`

Multipart upload. Body: `file` (max 10MB), `tipe` (sertifikat/foto/undangan/surat_tugas).

Response:
```json
{ "url": "https://prestasi.unila.ac.id/files/2026/04/<uuid>.pdf", "size": 123456, "content_type": "application/pdf" }
```

Client masukkan URL ke body create prestasi.

Constraints:
- Content-type whitelist: `image/jpeg`, `image/png`, `application/pdf`
- Virus scan (opsional Phase 2, ClamAV)
- Nama file di-randomize (UUID)
- Quota per user / fakultas (Phase 2)

---

## Master Data (admin only)

### `GET /api/master-data/{table}` dan `POST/PUT/DELETE`

Table ∈ `level, kategori_prestasi, peringkat, kelompok_prestasi, bentuk_pelaksanaan, jenis_rekognisi`.

Hanya admin_kemahasiswaan boleh edit.

### `GET /api/master-data/kode-pt`

Return `kode_pt` yang dipakai untuk SIMKATMAWA.

### `PUT /api/master-data/kode-pt` (root admin)

Update `kode_pt`.

### `POST /api/master-data/simkatmawa-credentials` (root admin)

Simpan email + password SIMKATMAWA terenkripsi (untuk login). Password pakai Laravel encrypted cast, key di `.env`.

---

## Sync monitoring

### `GET /api/sync-log`

List `sync.submission` rows dengan filter:
- `tipe_sync`
- `is_success`
- `parent_id`
- `range tanggal`

### `GET /api/sync-log/{id}`

Detail request_payload + response_body.

### `POST /api/sync-log/test-connection`

Ops utility — test login ke SIMKATMAWA, return masked token info (tidak ekspose full token).

---

## Convention

- Response envelope:
  ```json
  { "status": true, "data": ..., "meta": { "pagination": {...} } }
  ```
  atau error:
  ```json
  { "status": false, "error": { "code": "VALIDATION_FAILED", "message": "...", "details": {...} } }
  ```
- Idempotency: header `Idempotency-Key` di `POST /submit` untuk cegah double-submit kalau user double-click.
- Rate limit (backend ke client): 60 req/menit/IP standar.
- Rate limit (backend ke SIMKATMAWA): 30 req/menit (konservatif, lebih rendah dari asumsi).

---

## OpenAPI

Akan digenerate di `backend/si-prestasi-service/docs/openapi.yaml` saat implement.
