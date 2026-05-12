# Deployment Checklist — Staging → Production

> Status: **STAGING TESTING** (belum deploy ke production)
> Last Updated: 2026-03-17
> Author: Vibe Bot ⚡

---

## ⚠️ PENTING

Semua perubahan di bawah ini **sudah jalan di staging (VM5)** tapi **belum di-deploy ke production (VM1-VM4)**.
Jangan deploy sebelum Mizar approve semua item.

---

## 1. Database Seeds (pdut → production)

### 1.1 ManAkses — Menu & RBAC

Data menu di `pdut_staging` sudah ada (286 rows), tapi di `pdut` production **belum di-seed** untuk menu-menu baru:

| Menu | Path | Status di Staging | Status di Production |
|------|------|------------------|---------------------|
| WS Authorization | `/dashboard/manajemen-akses/manajemen/ws-authorization` | ✅ Ada | ❌ Belum seed |
| WS Endpoint | `/dashboard/manajemen-akses/manajemen/ws-endpoint` | ✅ Ada | ❌ Belum seed |
| PJ Aplikasi | `/dashboard/manajemen-akses/manajemen/pj-aplikasi` | ✅ Ada | ❌ Belum seed |

**Yang perlu di-seed ke production:**
- [ ] Insert menu baru ke `man_akses.menu` (pdut)
- [ ] Insert menu_role assignments ke `man_akses.menu_role` (pdut)
- [ ] Pastikan role Developer & Administrator punya akses

### 1.2 WS Endpoint Data

- [ ] Generate endpoints dari ws-service ke `man_akses.ws_endpoint` (pdut)
- [ ] Setup ws_authorization untuk role yang perlu akses API

---

## 2. Frontend Rebuild

### 2.1 Perubahan Label RBAC vs WS Authorization (2026-03-17)

Commit: `80ee146c0`

**Files changed:**
- `frontend/src/app/dashboard/manajemen-akses/manajemen/rbac/page.tsx`
  - Judul: "Role Base Access Control" → "RBAC Portal Internal"
  - Tab: "Menu Role" → "Akses Menu per Role", "Role Pengguna" → "Pengguna & Role"
- `frontend/src/app/dashboard/manajemen-akses/manajemen/ws-authorization/page.tsx`
  - Judul: "WS Authorization" → "Otorisasi Web Service API"
  - Deskripsi updated untuk PJ Aplikasi eksternal
- `frontend/src/shared/components/manakses/WsAuthorizationManager.tsx`
  - Placeholder: "Pilih Role" → "Pilih Role PJ Aplikasi"
  - Empty state text updated
- `frontend/src/shared/components/manakses/MenuRoleTable.tsx`
  - Filter label: "Semua Aplikasi" → "Semua Aplikasi Internal"
- `frontend/src/shared/components/manakses/RolePenggunaTable.tsx`
  - Search placeholder updated

**Deploy steps:**
- [ ] Rebuild frontend Docker image di VM1 (production)
- [ ] Restart frontend container

---

## 3. Backend Rebuild

### 3.1 MyUnila Service

Commit: container di-rebuild staging (2026-03-17) tapi **tanpa perubahan code** — rollback ke original main.go.

- [ ] Tidak perlu rebuild production (belum ada perubahan backend yang di-commit)

---

## 4. Konfigurasi

### 4.1 Kong API Gateway

- [ ] Pastikan route `/ws-service` ada di Kong production (port 9801)
- [ ] Pastikan route untuk endpoint baru yang di-generate sudah terdaftar

### 4.2 Docker

- [ ] Prune build cache di production VMs (`docker system prune -f && docker builder prune -f`)

---

## 5. Deployment Order (saat siap production)

Deploy production via **Ansible dari VM1** (`/var/www/my-unila/deployment/production/ansible`):

```
1. Backup database pdut (full backup di 119)
2. Execute seed script ke pdut:
   data-model/script/sqlserver/seed_staging_to_production_20260317.sql
3. Rebuild & deploy via Ansible:
   cd /var/www/my-unila/deployment/production/ansible
   ansible-playbook playbooks/02-deploy-vm1-frontend-kong.yml    # Frontend
   ansible-playbook playbooks/03-deploy-vm2-backend1.yml         # Auth + Dashboard + Public
   ansible-playbook playbooks/04-deploy-vm3-backend2.yml         # Go services (jika ada perubahan)
4. Flush Redis di production
5. Test akses WS Authorization & RBAC di production
6. Verify sidebar menu muncul untuk role Developer & Administrator
```

**⚠️ Lesson learned (2026-03-17):**
- Setelah ganti DB config, pastikan SEMUA container di-restart (bukan hanya yang utama)
- Container yang ga di-restart akan tetap pakai env lama (bisa ngarah ke DB production!)
- Gunakan compose file + env file untuk restart, jangan manual docker run

---

## 6. Rollback Plan

Jika ada masalah setelah deploy:
- Frontend: `docker tag` ke image sebelumnya, restart container
- Database: Restore dari backup pdut
- Menu data: Soft delete menu baru (`UPDATE man_akses.menu SET soft_delete = 1 WHERE ...`)

---

## 7. Items Masih Testing di Staging

| Item | Status | Notes |
|------|--------|-------|
| RBAC label differentiation | ✅ Deployed staging | Perlu test UX |
| WS Authorization PJ Aplikasi | ✅ Deployed staging | Perlu test flow lengkap |
| Project Management module | 📝 Planning only | SQL script + planning doc ready, belum implementasi |
| Data Unila IKU module | ❌ Belum mulai | |
| Export Excel (Data Unila) | ❌ Belum mulai | Currently CSV only |
| Monitoring production | ❌ Belum setup | VM2/VM3 blackbox prober |

---

*Update file ini setiap ada perubahan baru yang perlu di-deploy.*
