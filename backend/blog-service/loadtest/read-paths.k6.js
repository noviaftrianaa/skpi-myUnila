// k6 load test — READ paths (Sprint 13 §5.1 performance tuneup)
//
// Hot path public endpoints yang harus tahan traffic spike publikasi viral:
//   - GET /api/v1/posts (list with pagination + filter)
//   - GET /api/v1/posts/:id (detail)
//   - GET /api/v1/posts/by-slug/:subdomain/:slug
//   - GET /api/v1/search/posts (full-text search)
//   - GET /api/v1/search/suggest (autocomplete — RATE LIMITED 60/menit/IP)
//   - GET /api/v1/blogs (list authors)
//   - GET /api/v1/posts/:id/related (related posts)
//
// Run:
//   k6 run --vus 50 --duration 60s read-paths.k6.js
//   k6 run --vus 200 --duration 5m read-paths.k6.js
//   k6 run --stage 30s:50,2m:200,30s:0 read-paths.k6.js   # ramp
//
// Env override:
//   BASE_URL    — default http://localhost:8091
//   SAMPLE_POST_ID, SAMPLE_SUBDOMAIN, SAMPLE_SLUG — override post yang di-hit
//
// Output:
//   Default text + summary di akhir. Tambah --out json=result.json untuk parse.
//   Performance budget: p95 < 500ms untuk semua endpoint kecuali search (< 800ms).

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8091';
const SAMPLE_POST_ID = __ENV.SAMPLE_POST_ID || '67ea1cc8-b011-4809-9a86-3fb91c61cdc2';
const SAMPLE_SUBDOMAIN = __ENV.SAMPLE_SUBDOMAIN || 'bambang-dosen';
const SAMPLE_SLUG = __ENV.SAMPLE_SLUG || 'belajar-nextjs-15-app-router-untuk-pemula';

// Custom metrics — per-endpoint p95 untuk easier review.
const errorRate = new Rate('blog_errors');
const searchLatency = new Trend('search_latency_ms', true);
const postListLatency = new Trend('post_list_latency_ms', true);
const postDetailLatency = new Trend('post_detail_latency_ms', true);

export const options = {
  // Default: 50 VU selama 60s. Override via CLI.
  vus: 50,
  duration: '60s',
  thresholds: {
    // Performance budget. Test failed kalau breach.
    'http_req_duration{endpoint:post_list}': ['p(95)<500'],
    'http_req_duration{endpoint:post_detail}': ['p(95)<500'],
    'http_req_duration{endpoint:post_by_slug}': ['p(95)<600'],
    'http_req_duration{endpoint:search}': ['p(95)<800'],
    'http_req_duration{endpoint:suggest}': ['p(95)<400'],
    'http_req_duration{endpoint:blogs}': ['p(95)<500'],
    'http_req_duration{endpoint:related}': ['p(95)<700'],
    'blog_errors': ['rate<0.01'], // <1% error rate
  },
};

// Common query keywords untuk search test — biar realistis (bukan random gibberish).
const SEARCH_TERMS = ['nextjs', 'react', 'postgresql', 'docker', 'unila', 'belajar', 'mahasiswa'];
const SUGGEST_PREFIXES = ['nex', 'pos', 'rea', 'doc', 'mah', 'pen'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function checkOK(res, name) {
  const ok = check(res, {
    [`${name} status 200`]: (r) => r.status === 200,
    [`${name} body present`]: (r) => r.body && r.body.length > 0,
  });
  if (!ok) errorRate.add(1);
  else errorRate.add(0);
  return ok;
}

export default function () {
  // 1. List posts (paling sering — homepage + apex landing)
  let res = http.get(`${BASE_URL}/api/v1/posts?status=published&limit=12&order=latest`, {
    tags: { endpoint: 'post_list' },
  });
  postListLatency.add(res.timings.duration);
  checkOK(res, 'list posts');
  sleep(0.5);

  // 2. Post detail (1 per page view)
  res = http.get(`${BASE_URL}/api/v1/posts/${SAMPLE_POST_ID}`, {
    tags: { endpoint: 'post_detail' },
  });
  postDetailLatency.add(res.timings.duration);
  checkOK(res, 'post detail');
  sleep(0.3);

  // 3. Post by slug (tenant page) — most public reads hit this
  res = http.get(`${BASE_URL}/api/v1/posts/by-slug/${SAMPLE_SUBDOMAIN}/${SAMPLE_SLUG}`, {
    tags: { endpoint: 'post_by_slug' },
  });
  checkOK(res, 'post by slug');
  sleep(0.3);

  // 4. Full search (less frequent, more expensive Meilisearch query)
  res = http.get(`${BASE_URL}/api/v1/search/posts?q=${pickRandom(SEARCH_TERMS)}&limit=10`, {
    tags: { endpoint: 'search' },
  });
  searchLatency.add(res.timings.duration);
  checkOK(res, 'search');
  sleep(0.5);

  // 5. Suggest (autocomplete — rate limited 60/menit/IP, so accept 429)
  res = http.get(`${BASE_URL}/api/v1/search/suggest?q=${pickRandom(SUGGEST_PREFIXES)}`, {
    tags: { endpoint: 'suggest' },
  });
  check(res, {
    'suggest 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
  if (res.status !== 200 && res.status !== 429) errorRate.add(1);
  sleep(0.2);

  // 6. Blogs list (authors discovery)
  res = http.get(`${BASE_URL}/api/v1/blogs?limit=20&order=popular`, {
    tags: { endpoint: 'blogs' },
  });
  checkOK(res, 'blogs list');
  sleep(0.3);

  // 7. Related posts (Phase AQ — Meilisearch query by tags)
  res = http.get(`${BASE_URL}/api/v1/posts/${SAMPLE_POST_ID}/related?limit=4`, {
    tags: { endpoint: 'related' },
  });
  checkOK(res, 'related');
  sleep(0.5);
}

export function handleSummary(data) {
  const summary = {
    'stdout': textSummary(data),
  };
  // Tambah JSON output kalau RESULT_JSON=1
  if (__ENV.RESULT_JSON) {
    summary[__ENV.RESULT_JSON] = JSON.stringify(data, null, 2);
  }
  return summary;
}

// Inline text summary (k6 default formatter, simplified).
function textSummary(data) {
  const lines = [];
  lines.push('');
  lines.push('=== Blog Platform Load Test — Read Paths ===');
  lines.push(`Duration: ${data.state.testRunDurationMs}ms`);
  lines.push(`VUs max:  ${data.metrics.vus_max.values.max}`);
  lines.push('');
  lines.push('Latency p95 per endpoint (ms):');
  const httpDuration = data.metrics.http_req_duration;
  if (httpDuration && httpDuration.values) {
    lines.push(`  ALL endpoints: ${httpDuration.values['p(95)'].toFixed(0)}`);
  }
  if (data.metrics.search_latency_ms && data.metrics.search_latency_ms.values) {
    lines.push(`  search:        ${data.metrics.search_latency_ms.values['p(95)'].toFixed(0)}`);
  }
  if (data.metrics.post_list_latency_ms && data.metrics.post_list_latency_ms.values) {
    lines.push(`  post list:     ${data.metrics.post_list_latency_ms.values['p(95)'].toFixed(0)}`);
  }
  if (data.metrics.post_detail_latency_ms && data.metrics.post_detail_latency_ms.values) {
    lines.push(`  post detail:   ${data.metrics.post_detail_latency_ms.values['p(95)'].toFixed(0)}`);
  }
  lines.push('');
  lines.push(`Error rate: ${(data.metrics.blog_errors.values.rate * 100).toFixed(2)}%`);
  lines.push(`Total requests: ${data.metrics.http_reqs.values.count}`);
  lines.push(`RPS avg: ${data.metrics.http_reqs.values.rate.toFixed(1)}`);
  lines.push('');
  return lines.join('\n');
}
