# Log Shipping: Server 119 → Server 190

## Arsitektur

```
┌─────────────────────────────────────┐         ┌─────────────────────────────────────┐
│     SERVER 119 (PRIMARY/UTAMA)      │         │     SERVER 190 (SECONDARY/REPLICA)  │
│     192.168.123.119                 │         │     192.168.123.190                 │
│     WIN-V01F3SG22V0                 │         │     WIN-DBREPLICA                   │
│                                     │         │                                     │
│  ┌──────────┐   ┌────────────────┐  │         │  ┌──────────┐   ┌────────────────┐  │
│  │  pdut    │   │ SQL Agent Job  │  │         │  │  pdut    │   │ SQL Agent Job  │  │
│  │ (ONLINE) │──▶│  1. Backup     │  │         │  │(STANDBY) │◀──│  2. Copy       │  │
│  │          │   │  Transaction   │  │         │  │ READ-ONLY│   │  3. Restore    │  │
│  │  ~13 GB  │   │  Log tiap     │  │         │  │          │   │  Transaction   │  │
│  └──────────┘   │  15 menit     │  │         │  └──────────┘   │  Log           │  │
│                 └───────┬────────┘  │         │                 └───────▲────────┘  │
│                         │           │         │                         │           │
│                         ▼           │         │                         │           │
│               ┌──────────────────┐  │  COPY   │               ┌────────┴─────────┐ │
│               │ C:\SQLBackupShare│──┼────────▶│               │ C:\SQLBackupLocal│ │
│               │ (Network Share)  │  │  FILE   │               │ (Local Copy)     │ │
│               │ *.trn files      │  │         │               │ *.trn files      │ │
│               └──────────────────┘  │         │               └──────────────────┘ │
│                                     │         │                                     │
│  SQL Server Agent: ✅ Running       │         │  SQL Server Agent: ✅ Running       │
│  Recovery Model: FULL               │         │  Database State: STANDBY/NORECOVERY │
└─────────────────────────────────────┘         └─────────────────────────────────────┘
```

## Alur Proses (Otomatis, setiap 15 menit)

```
STEP 1 - BACKUP (di Server 119)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SQL Agent Job → Backup Transaction Log pdut
             → Simpan ke C:\SQLBackupShare\pdut_log_*.trn

                         ▼ (Network Share)

STEP 2 - COPY (dari 119 ke 190)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SQL Agent Job di 190 → Copy file *.trn
dari: \\192.168.123.119\SQLBackupShare\
ke:   C:\SQLBackupLocal\

                         ▼

STEP 3 - RESTORE (di Server 190)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SQL Agent Job di 190 → Restore Transaction Log
ke database pdut (WITH STANDBY)
→ Data ter-sync, DB bisa di-read (read-only)
```

## Setup Awal (Sekali Saja)

```
┌──────────────┐     FULL BACKUP      ┌──────────────┐
│  Server 119  │ ──────────────────▶  │  Server 190  │
│  pdut        │   ~13 GB .bak file   │  pdut        │
│  (ONLINE)    │                      │  (NORECOVERY)│
└──────────────┘                      └──────────────┘

1. Set Recovery Model pdut → FULL (di 119)
2. Full Backup pdut di 119
3. Copy .bak file ke 190
4. Restore di 190 WITH NORECOVERY
5. Aktifkan Log Shipping jobs
```

## Skenario Failover (Manual)

```
       ⚠️ Server 119 DOWN!
              │
              ▼
┌──────────────────────────────┐
│  DBA/Admin menjalankan       │
│  di Server 190 (SSMS):      │
│                              │
│  RESTORE DATABASE pdut       │
│  WITH RECOVERY               │
│                              │
│  → Status: STANDBY → ONLINE │
│  → Bisa read + write         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Update connection string    │
│  di semua VM (1,2,3,5):     │
│                              │
│  DB_HOST=192.168.123.119     │
│         ↓                    │
│  DB_HOST=192.168.123.190     │
│                              │
│  Restart semua services      │
└──────────────────────────────┘
```

## Timeline

| Waktu | Aksi | Server |
|-------|------|--------|
| T+0 | Backup transaction log | 119 |
| T+5 min | Copy file ke 190 | 190 |
| T+10 min | Restore transaction log | 190 |
| T+15 min | Cycle ulang | Keduanya |

**RPO (Recovery Point Objective):** Maksimal kehilangan data = 15 menit terakhir
**RTO (Recovery Time Objective):** ~5-10 menit (manual failover + restart services)

## Yang Dibutuhkan

- [x] SQL Server 2019 di kedua server
- [x] SQL Server Agent running di kedua server
- [x] Disk space cukup di 190 (~122 GB free)
- [x] Shared folder C:\SQLBackupShare di 119 ✅ (2026-03-16)
- [x] Recovery Model pdut = FULL di 119 ✅ (2026-03-16)
- [x] Full backup initial + restore di 190 ✅ (2026-03-16)
- [x] Log Shipping jobs configured ✅ (2026-03-16)

## Setup Details (2026-03-16)

- **Server 190 hostname**: renamed WIN-V01F3SG22V0 → WIN-DBREPLICA
- **Shared folder**: C:\SQLBackupShare di 119, akses via dedicated service account
- **SQL Agent 190**: running as dedicated service account
- **Interval**: setiap 5 menit (backup → copy → restore)
- **Cleanup**: .trn files auto-hapus setelah 72 jam (via forfiles)
- **Job owners di 190**: sa (karena hostname rename issue)

### Jobs
| Server | Job Name | Schedule | Offset |
|--------|----------|----------|--------|
| 119 | LogShip_Backup_pdut | Every 5 min | :00 |
| 190 | LogShip_Copy_pdut | Every 5 min | :02 |
| 190 | LogShip_Restore_pdut | Every 5 min | :04 |
