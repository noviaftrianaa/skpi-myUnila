# Bitbucket Webhook Integration — Project Management

## Overview

Integrasi Bitbucket → Project Management supaya setiap push/commit otomatis muncul di activity feed project.

## Setup Steps

### 1. Buka Bitbucket Repository Settings

```
https://bitbucket.org/mahendraunila/my-unila/admin/addon/admin/bitbucket-webhooks/bb-webhooks-repo-admin
```

Atau: Repository → Settings → Webhooks → Add webhook

### 2. Konfigurasi Webhook

| Field | Value |
|-------|-------|
| **Title** | MyUnila Project Management |
| **URL** | `https://[DOMAIN]/project-service/api/v1/webhook/bitbucket` |
| **Status** | Active |
| **Triggers** | ✅ Repository push |
|  | ✅ Pull request (Created, Updated, Merged, Declined) |

> **Staging URL:** `http://192.168.120.45:8095/api/v1/webhook/bitbucket`
> **Production URL:** `http://192.168.120.41:9801/project-service/api/v1/webhook/bitbucket`

### 3. Secret (Optional)

Jika ingin validasi signature:
- Generate secret: `openssl rand -hex 32`
- Masukkan di Bitbucket webhook settings
- Set env `BITBUCKET_WEBHOOK_SECRET` di project-service

### 4. Mapping Project

Di Project Management UI → Project Settings → Webhooks:
- Klik "Add Webhook Config"
- Provider: `bitbucket`
- Repo URL: `https://bitbucket.org/mahendraunila/my-unila`
- Events: `push`, `pullrequest:created`, `pullrequest:merged`

### 5. Test

```bash
# Test dari staging
curl -X POST http://192.168.120.45:8095/api/v1/webhook/bitbucket \
  -H "Content-Type: application/json" \
  -H "X-Event-Key: repo:push" \
  -d '{
    "push": {
      "changes": [{
        "new": {
          "name": "master",
          "type": "branch",
          "target": {
            "hash": "abc123",
            "message": "test: webhook integration",
            "author": {
              "raw": "Mizar <mizarzulmiramadhan@gmail.com>"
            },
            "date": "2026-03-24T19:00:00+07:00"
          }
        }
      }]
    },
    "repository": {
      "full_name": "mahendraunila/my-unila",
      "links": {
        "html": { "href": "https://bitbucket.org/mahendraunila/my-unila" }
      }
    }
  }'
```

### 6. Verifikasi

Setelah setup, cek di:
- Project → Activity tab → seharusnya muncul commit entries
- Project → Board → task yang di-reference di commit message (e.g. `[TASK-123]`) otomatis linked

## Commit Convention (Recommended)

Supaya commit otomatis linked ke task:
```
feat(module): deskripsi singkat

Refs: TASK-<id>
```

Contoh:
```
feat(simbak): implement JenisLayanan CRUD

Refs: TASK-abc123
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook tidak masuk | Cek Bitbucket → Webhooks → View requests (ada log) |
| 404 | Pastikan route `/api/v1/webhook/bitbucket` ada di project-service |
| 401/403 | Webhook endpoint harusnya public (no JWT) |
| Commit tidak linked | Pastikan repo_url di project settings match persis |
