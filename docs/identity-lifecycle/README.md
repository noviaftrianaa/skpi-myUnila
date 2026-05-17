# Identity Lifecycle Management — Unila

Folder ini berisi dokumen perencanaan inisiatif **otomasi provisioning email Microsoft 365 & Google Workspace** untuk seluruh civitas Universitas Lampung.

## Konteks Singkat

Saat ini admin TIK masih melakukan **upload manual CSV** ke admin console Microsoft 365 dan Google Workspace setiap kali ada mahasiswa baru atau perubahan status. Inisiatif ini menggantikan proses tersebut dengan integrasi **API langsung** ke Microsoft Graph dan Google Admin Directory, terintegrasi dengan pipeline SI-Registrasi yang sudah ada.

## Dokumen

| File | Isi |
|---|---|
| [business-process.md](business-process.md) | **Dokumen Business Process lengkap** — 13 bagian: Executive Summary, Current State, Target State, API Comparison, Architecture, 6 Lifecycle Flows, Database Schema, Security, Roadmap, Cost, Risk, API Examples, Open Questions. |
| [business-process.pdf](business-process.pdf) | Versi PDF dari `business-process.md` (di-generate via `docs/tools/md2pdf/`). |

## Status

- **Versi:** v1 (draft)
- **Tanggal:** 13 Mei 2026
- **Tahap:** Stakeholder review — menunggu input untuk 15 Open Questions di akhir dokumen.

## Repo Terkait

- **`my-unila/`** — platform MyUnila (host service baru `identity-service` dan frontend `manajemen-akses`).
- **`si-registrasi/`** (repo terpisah, `E:/laragon/www/si-registrasi/`) — sumber event pasca-NPM-terbit.

## Cara Update Dokumen

```bash
# Edit business-process.md
# Lalu re-generate PDF:
cd docs/tools/md2pdf
./md2pdf.sh ../../identity-lifecycle/business-process.md \
    -o ../../identity-lifecycle/business-process.pdf \
    --title "Identity Lifecycle Management Unila — Business Process"
```
