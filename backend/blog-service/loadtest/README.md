# Blog Platform — Load Test Scripts (k6)

Performance baseline + rate limit verification untuk blog-service backend.

## Install k6 (sekali)

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Windows (Chocolatey)
choco install k6
```

Atau Docker:
```bash
docker run --rm -i --network host -v $(pwd):/scripts grafana/k6 run /scripts/read-paths.k6.js
```

## Quick start

```bash
cd backend/blog-service/loadtest

# Read paths — 50 VU selama 60 detik (baseline normal traffic)
k6 run --vus 50 --duration 60s read-paths.k6.js

# Read paths — ramp test (warmup → peak → cooldown)
k6 run --stage 30s:50,2m:200,30s:0 read-paths.k6.js

# Write paths — rate limit verification (jangan banyak VU, share IP)
k6 run --vus 1 --duration 60s write-paths.k6.js
```

## Environment override

| Env var | Default | Catatan |
|---|---|---|
| `BASE_URL` | `http://localhost:8091` | Backend endpoint |
| `SAMPLE_POST_ID` | `67ea1cc8-b011-4809-9a86-3fb91c61cdc2` | Post ID untuk detail/related test |
| `SAMPLE_SUBDOMAIN` | `bambang-dosen` | Tenant subdomain |
| `SAMPLE_SLUG` | `belajar-nextjs-15-app-router-untuk-pemula` | Post slug for /by-slug test |
| `RESULT_JSON` | (none) | Path output JSON (untuk parse di CI) |

Contoh staging:
```bash
BASE_URL=https://api.blog.unila.ac.id k6 run --vus 100 --duration 5m read-paths.k6.js
```

## Performance budget (di thresholds option)

Test FAIL kalau breach. Tune di production data:

| Endpoint | Budget p95 | Rationale |
|---|---|---|
| `/posts` list | < 500 ms | High-volume, harus cepat |
| `/posts/:id` detail | < 500 ms | 1 query, simple |
| `/posts/by-slug/:sub/:slug` | < 600 ms | JOIN blog.blog |
| `/search/posts` | < 800 ms | Meilisearch HTTP roundtrip |
| `/search/suggest` | < 400 ms | Highlighted snippet, lighter |
| `/blogs` list | < 500 ms | Authors index |
| `/posts/:id/related` | < 700 ms | Meilisearch + post hydrate |
| Error rate | < 1% | Excluding rate-limit 429 |

## Read vs Write paths

**read-paths.k6.js** — 7 endpoint hot path public read. Tujuan: measure baseline RPS + latency p95/p99.

**write-paths.k6.js** — verify rate limit kick-in. Tujuan: confirm middleware/ratelimit.go works as expected.
- Subscribe limit 5/menit/IP → expect ≤5 accepted per VU dalam 60s, sisanya 429
- Comment limit 5/menit/IP → similar
- Setiap VU dari 1 mesin share IP → test cepat saturate

Untuk realistic write load test (banyak unique IP), perlu:
- k6 Cloud (distributed runner)
- Atau multiple machines + aggregate hasil

## Cleanup setelah load test

Write paths bikin row di DB. Cleanup manual:

```sql
-- Run sebagai postgres user di blog_unila
DELETE FROM interaction.subscriber
WHERE email LIKE 'loadtest_%@k6.test';

DELETE FROM interaction.komentar
WHERE email_komentator LIKE 'commenter_%@k6.test';
```

## Interpreting results

Output k6 default:
```
     ✓ list posts status 200
     ✓ list posts body present
     ✓ post detail status 200
     ...

     checks.........................: 100.00% ✓ 8400      ✗ 0
     data_received..................: 234 MB  3.9 MB/s
     http_req_duration..............: avg=145ms min=2ms med=89ms max=1.2s p(95)=412ms
     http_req_failed................: 0.00%   ✓ 0         ✗ 8400
     iterations.....................: 1200    20/s
     vus_max........................: 50
```

**Yang dilihat:**
- `http_req_duration p(95)` — latency 95% request. Target sesuai budget table.
- `http_req_failed` — non-2xx rate. Target <1% (excl 429 yang valid untuk write).
- `iterations rate` — RPS sustained. Plot vs target throughput.
- `data_received` — bandwidth. Penting untuk capacity planning.

**Custom metrics:**
- `search_latency_ms` p95 — Meilisearch query latency
- `post_list_latency_ms` p95 — paling sering di-hit
- `subscribe_2xx` + `subscribe_429` — verify rate limit balance

## Tips production load test

1. **Warmup**: 30 detik low VU dulu sebelum peak — JIT compile + DB cache hangat
2. **Stage ramp**: jangan langsung peak, ramp 10% → 50% → 100% supaya bisa identify saturation point
3. **Monitor backend**: `docker stats myunila-blog-service` paralel dengan k6 — lihat CPU/RAM growth
4. **EXPLAIN ANALYZE**: kalau ada endpoint melebihi budget, profile query plan di prod-scale data
5. **Production data**: load test dengan real data shape (10k+ posts, 100+ blogs) bukan seed kecil

## Tuning checklist (post-load-test)

Kalau p95 breach budget:

- [ ] Index? `EXPLAIN ANALYZE` query lambat → tambah index atau partial index
- [ ] Cache? Tambah `proxy_cache_valid` di Nginx untuk endpoint read-mostly
- [ ] Connection pool? `MaxOpenConns` di sqlx config (default 25 mungkin kurang untuk traffic tinggi)
- [ ] Meilisearch? Tune `searchableAttributes` rank-rules untuk reduce relevance scoring overhead
- [ ] Goroutine leak? `pprof` heap/goroutine dump cek growth pattern
- [ ] Network? `iperf` antara VM frontend ↔ backend ↔ DB

## CI integration (future)

```yaml
# .github/workflows/loadtest.yml — manual trigger, threshold sebagai gate
name: Load Test (manual)
on: workflow_dispatch
jobs:
  loadtest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: backend/blog-service/loadtest/read-paths.k6.js
          flags: --vus 50 --duration 60s
        env:
          BASE_URL: https://api.staging.blog.unila.ac.id
```
