# SSO Unila Upgrade

Folder ini berisi brainstorm modernisasi sistem SSO Unila + integrasi RADIUS WiFi internal kampus.

## Konteks Singkat

SSO Unila saat ini berbasis **CAS protocol** (PHP) dengan library `composer require unila/sso`. Limitasinya:

- Protokol CAS only (tidak support OIDC/OAuth/SAML untuk app modern)
- Password storage lemah: **MD5 tanpa salt** (RADIUS MySQL) + **SHA1(YYYYMMDD+NPM)** (SSO Unila) — keduanya *critical risk*
- Tidak ada MFA
- MyUnila man-akses login query PDUT langsung (tight coupling)
- RADIUS MySQL terpisah dengan format password berbeda

Dokumen ini membandingkan **3 path upgrade** terhadap kondisi sekarang dari sisi protokol, keamanan, integrasi RADIUS, customization, dan biaya — lalu memberikan rekomendasi.

## Dokumen

| File | Isi |
|---|---|
| [sso-upgrade-brainstorm.md](sso-upgrade-brainstorm.md) | **Brainstorm v2 lengkap** — 13 bagian + Appendix: Executive Summary, Current State, 4 Opsi Upgrade (Apereo CAS / Keycloak / Custom Go / Entra ID), Reference ITS+IPB, Federation Pattern, Tabel Perbandingan Lengkap, Keamanan, Integrasi RADIUS, Arsitektur DB, Migrasi Password & MFA, Biaya, Rekomendasi Final, Open Questions, **Tahapan Migrasi Aman (9 fase user-affecting)**, Protocol Glossary. |
| [sso-upgrade-brainstorm.pdf](sso-upgrade-brainstorm.pdf) | Versi PDF dari brainstorm v2 (di-generate via `docs/tools/md2pdf/`). |

## Rekomendasi Final

**Opsi B — Keycloak** sebagai IdP utama, dengan:
- **Federation** ke Microsoft Entra (M365) + Google Workspace via SAML 2.0 — Keycloak satu source of truth
- **FreeRADIUS REST** ke Keycloak untuk WiFi (EAP-TTLS-PAP)
- **Pisah DB** — `identity` PostgreSQL baru, PDUT tetap source of truth atribut user
- **Migrasi password rehash-on-login** (custom Keycloak SPI) — transparent ke user (MD5 RADIUS + SHA1 SSO → Argon2id)
- **MFA pindah ke Keycloak** — secret existing dari `mfa_tokens` MyUnila bisa dimigrasi tanpa user re-scan QR
- **Migrasi 9 fase rolling** — zero-downtime, per-kohort, dengan rollback per fase

**Opsi D — Entra ID langsung:** DITOLAK (no CAS, RADIUS ribet, vendor lock-in)

## Status

- **Versi:** v2 (brainstorm + safe migration plan)
- **Tanggal:** 13 Mei 2026
- **Tahap:** Menunggu konfirmasi tim infra (controller WiFi, concurrent session, device target), inventory app legacy, dan decision Java stack.

## Hubungan dengan Proyek Lain

- **`docs/identity-lifecycle/`** — Otomasi provisioning M365 + Google Workspace. Skema `identity` DB di doc tersebut **berlaku juga di sini** sebagai backend Keycloak (atau pelengkap).
- **`si-registrasi/`** — sumber event NPM-generated yang triggers provisioning ke Keycloak + M365 + Google.

## Cara Update Dokumen

```bash
cd docs/tools/md2pdf
./md2pdf.sh ../../sso-upgrade/sso-upgrade-brainstorm.md \
    -o ../../sso-upgrade/sso-upgrade-brainstorm.pdf \
    --title "SSO Unila Upgrade — Brainstorm & Perbandingan Opsi"
```
