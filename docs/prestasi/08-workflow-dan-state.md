# Workflow & State Machine

State flow untuk satu record prestasi/sertifikasi/rekognisi.

---

## States

| State | Arti |
|---|---|
| `draft` | Baru dibuat, masih bisa edit bebas |
| `review` | Operator submit ke admin kemahasiswaan untuk verifikasi (opsional, bisa di-skip di Phase 1) |
| `ready` | Siap dikirim ke SIMKATMAWA — queue job sudah dispatch |
| `sending` | Job aktif mengirim (sementara, <30 detik biasanya) |
| `sent` | Berhasil dikirim, punya `simkatmawa_id` |
| `error` | Gagal kirim, max retry tercapai atau error 4xx |
| `archived` | Soft-archived manual (tidak dipakai lagi) |

---

## Transisi

```
         ┌─────────┐
         │  draft  │◄──────────────────┐
         └────┬────┘                   │
              │ submit                 │ retry (dari error)
              ▼                        │
     [optional]                        │
         ┌─────────┐                   │
         │ review  │                   │
         └────┬────┘                   │
              │ approve                │
              ▼                        │
         ┌─────────┐                   │
         │  ready  │◄──────────────────┤
         └────┬────┘                   │
              │ worker pick-up         │
              ▼                        │
         ┌──────────┐                  │
         │ sending  │                  │
         └────┬──┬──┘                  │
    success   │  │  failure            │
              ▼  ▼                     │
         ┌──────┐ ┌────────┐           │
         │ sent │ │ error  ├───────────┘
         └──┬───┘ └────────┘
            │ archive (opsional)
            ▼
         ┌──────────┐
         │ archived │
         └──────────┘
```

### Rules

- `draft → review` oleh operator_fakultas atau admin
- `review → ready` hanya admin_kemahasiswaan (approve)
- Di Phase 1 sederhana, bisa skip `review`: `draft → ready` langsung oleh admin
- `ready → sending → sent/error` dilakukan oleh queue worker, bukan user
- `error → ready` via POST `/retry` oleh admin
- `sent → archived` hanya oleh admin (soft; tidak menghapus dari SIMKATMAWA — API tidak expose DELETE)
- `sent → draft` **tidak diperbolehkan** (sudah authoritative di pihak DIKTI)

### Invariants

1. Record di `sending` tidak boleh di-edit atau di-submit ulang (lock).
2. Retry hanya valid dari `error`, bukan dari `sent`.
3. Kalau `sent`, field boleh diubah hanya: `keterangan`, `status_workflow=archived`. Field lain ter-freeze.
4. Field `status_workflow` di-simpan juga di `log.activity` saat tiap transisi.

---

## Retry policy

Di `sending → error` (transient):

| Attempt | Delay | Total wait |
|---|---|---|
| 1 | — | 0 |
| 2 | 30s | 30s |
| 3 | 2m | 2m30s |
| 4 | 10m | 12m30s (max) |

Setelah max attempt → state `error` permanent sampai admin trigger retry manual.

Failure jenis:
- **4xx dari SIMKATMAWA**: tidak retry otomatis (payload salah → butuh fix di sisi kita). Langsung ke `error`.
- **5xx / timeout / connection reset**: retry sesuai tabel.
- **401 (token invalid)**: trigger refresh token, retry 1x tanpa delay. Kalau masih 401, `error`.

---

## Idempotency

SIMKATMAWA API tidak punya idempotency key. Mitigation:

- State `sending` berfungsi sebagai lock — worker yang ambil pertama kali dulu yang boleh request.
- Kalau worker crash di tengah (sudah kirim tapi belum simpan response), saat restart lihat submissions dengan state `sending` > 2 menit → mark `error` dengan catatan "uncertain — verify manual".

Butuh verify manual karena tidak ada GET API. Tim operator cek portal SIMKATMAWA langsung.

---

## UI state indicator

| State | Badge UI |
|---|---|
| draft | abu-abu "Draft" |
| review | biru "Menunggu Review" |
| ready | kuning "Antrian Kirim" |
| sending | kuning animated "Mengirim..." |
| sent | hijau "Terkirim #<simkatmawa_id>" |
| error | merah "Gagal — retry" (tombol retry) |
| archived | strike-through |

---

## Per-tipe differences

Semua tipe (prestasi_mandiri, sertifikasi, rekognisi) pakai state machine yang sama. Worker pilih endpoint SIMKATMAWA berdasarkan `parent_tipe`:

| parent_tipe | endpoint |
|---|---|
| PRESTASI | POST /api/prestasi-mandiri |
| SERTIFIKASI | POST /api/sertifikasi |
| REKOGNISI | POST /api/rekognisi |
