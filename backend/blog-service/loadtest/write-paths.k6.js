// k6 load test — WRITE paths (Sprint 13 §5.1 performance + rate limit verify)
//
// Public WRITE endpoints yang rate limited (see middleware/ratelimit.go):
//   - POST /blogs/by-subdomain/:subdomain/subscribe  (5/menit/IP)
//   - POST /posts/:id/komentar                       (5/menit/IP)
//   - POST /posts/:id/like                           (30/menit/IP, skip-auth)
//   - POST /posts/:id/bookmark                       (30/menit/IP, skip-auth)
//
// Goal:
//   1. Verify rate limit kick-in benar (429 setelah threshold)
//   2. Measure throughput sustained = limit (e.g. 5 req/min subscribe = 0.083 RPS)
//   3. Confirm rate limit memory tidak leak (jalankan lama-lama, RSS stabil)
//
// IMPORTANT: jalankan dengan VU rendah (1-5) karena rate limit per-IP — banyak
// VU dari satu mesin akan share IP, jadi limit hit cepat. Untuk realistic
// production test, perlu distributed runner (k6 cloud / multiple machines).
//
// Run:
//   k6 run --vus 1 --duration 60s write-paths.k6.js
//   k6 run --vus 5 --duration 5m write-paths.k6.js   # heavier abuse simulation
//
// Env:
//   BASE_URL, SAMPLE_POST_ID, SAMPLE_SUBDOMAIN — sama dengan read-paths

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8091';
const SAMPLE_POST_ID = __ENV.SAMPLE_POST_ID || '67ea1cc8-b011-4809-9a86-3fb91c61cdc2';
const SAMPLE_SUBDOMAIN = __ENV.SAMPLE_SUBDOMAIN || 'bambang-dosen';

const subscribeAccepted = new Counter('subscribe_2xx');
const subscribeLimited = new Counter('subscribe_429');
const commentAccepted = new Counter('comment_2xx');
const commentLimited = new Counter('comment_429');
const otherError = new Rate('other_errors');

export const options = {
  vus: 1,
  duration: '60s',
  thresholds: {
    // Subscribe limit 5/menit/IP. Dalam 60s test, expect ≤5 accepted per VU.
    // (Sebenarnya bisa lebih kalau sleep besar, tapi guard kasar.)
    'subscribe_2xx': ['count<10'],
    // Setiap request setelah threshold → 429. Pastikan limit kick-in.
    'subscribe_429': ['count>0'],
    'other_errors': ['rate<0.05'],  // <5% non-rate-limit error tolerated
  },
};

let counter = 0;

export default function () {
  counter++;

  // 1. Subscribe — verify rate limit. Pakai email unique per iteration supaya
  //    tidak hit unique constraint duplicate (yang error 400, bukan 429).
  let res = http.post(
    `${BASE_URL}/api/v1/blogs/by-subdomain/${SAMPLE_SUBDOMAIN}/subscribe`,
    JSON.stringify({ email: `loadtest_${__VU}_${counter}_${Date.now()}@k6.test` }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'subscribe' } },
  );
  if (res.status === 200 || res.status === 201) subscribeAccepted.add(1);
  else if (res.status === 429) subscribeLimited.add(1);
  else otherError.add(1);

  check(res, {
    'subscribe: 2xx or 429': (r) => r.status === 200 || r.status === 201 || r.status === 429,
  });
  sleep(0.5);

  // 2. Comment create (anonymous) — verify rate limit. Need nm + email untuk anonymous.
  res = http.post(
    `${BASE_URL}/api/v1/posts/${SAMPLE_POST_ID}/komentar`,
    JSON.stringify({
      isi: `Load test comment iteration ${counter}`,
      nm_komentator: `LoadTester ${__VU}`,
      email_komentator: `commenter_${__VU}@k6.test`,
    }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'comment' } },
  );
  if (res.status === 201 || res.status === 200) commentAccepted.add(1);
  else if (res.status === 429) commentLimited.add(1);
  else if (res.status === 400 || res.status === 403) {
    // 400 = post not published / comment disabled — OK untuk skip
    // 403 = banned — OK untuk skip
  } else {
    otherError.add(1);
  }

  check(res, {
    'comment: success or rate-limited': (r) =>
      r.status === 201 || r.status === 200 || r.status === 429 || r.status === 400 || r.status === 403,
  });
  sleep(1);
}

export function teardown() {
  // Note: smoke test rows tidak auto-cleanup. Manual cleanup:
  //   DELETE FROM interaction.subscriber WHERE email LIKE 'loadtest_%@k6.test';
  //   DELETE FROM interaction.komentar  WHERE email_komentator LIKE 'commenter_%@k6.test';
  console.log('Test selesai. Cleanup test rows: lihat comment di teardown function.');
}

export function handleSummary(data) {
  const accepted = data.metrics.subscribe_2xx?.values?.count ?? 0;
  const limited = data.metrics.subscribe_429?.values?.count ?? 0;
  const commentOK = data.metrics.comment_2xx?.values?.count ?? 0;
  const commentLimit = data.metrics.comment_429?.values?.count ?? 0;

  const lines = [];
  lines.push('');
  lines.push('=== Blog Platform Load Test — Write Paths (Rate Limit Verify) ===');
  lines.push(`Duration:  ${data.state.testRunDurationMs}ms`);
  lines.push(`VUs max:   ${data.metrics.vus_max.values.max}`);
  lines.push('');
  lines.push('SUBSCRIBE (limit 5/menit/IP):');
  lines.push(`  2xx accepted:  ${accepted}`);
  lines.push(`  429 limited:   ${limited}`);
  lines.push(`  → kick-in correct: ${limited > 0 ? 'YES ✓' : 'NO ✗ (limit gak trigger)'}`);
  lines.push('');
  lines.push('COMMENT (limit 5/menit/IP):');
  lines.push(`  2xx accepted:  ${commentOK}`);
  lines.push(`  429 limited:   ${commentLimit}`);
  lines.push('');
  lines.push(`Other errors:    ${(data.metrics.other_errors?.values?.rate * 100 || 0).toFixed(2)}%`);
  lines.push(`Total requests:  ${data.metrics.http_reqs?.values?.count ?? 0}`);
  lines.push('');
  lines.push('CLEANUP DB rows (manual):');
  lines.push("  DELETE FROM interaction.subscriber WHERE email LIKE 'loadtest_%@k6.test';");
  lines.push("  DELETE FROM interaction.komentar  WHERE email_komentator LIKE 'commenter_%@k6.test';");
  lines.push('');

  return { stdout: lines.join('\n') };
}
