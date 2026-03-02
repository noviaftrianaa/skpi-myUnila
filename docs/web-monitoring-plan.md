# Web Monitoring Service - Technical Plan

> **Service**: `webmon-service` (Go Fiber, port 8089)
> **Schema**: `monitoring` (SQL Server)
> **Status**: Phase 1–8 ✅ Complete — Backend + Frontend Production Ready
> **Last Updated**: 2026-03-02

---

## 1. Context & Problem Statement

Universitas Lampung memiliki banyak subdomain (`*.unila.ac.id`) yang rentan diretas dan diinjeksi konten judi online ("judol"). Contoh query Google yang membuktikan masalah ini:

```
site:unila.ac.id (intitle:slot OR "slot gacor" OR "slot online" OR togel OR casino)
```

Saat ini **tidak ada sistem terpusat** untuk:
- Mengelola daftar situs CMS per unit (WordPress, Blogger, dll)
- Mendeteksi konten judol yang terinjeksi di situs-situs tersebut
- Memberikan early warning ke pimpinan/admin tentang ancaman keamanan

**webmon-service** akan menjadi satu Go Fiber microservice dengan dua modul utama:
- **Site Management**: Registry & health monitoring situs CMS
- **Judol Monitor**: Crawler + keyword detection + early warning dashboard

---

## 2. Architecture Overview

```
webmon-service (Go Fiber, port 8089)
├── apps/
│   ├── site/           # CMS site registry & health check
│   ├── blog_sync/      # Blogger API content sync
│   ├── crawler/        # Web crawler engine (gocolly/colly)
│   ├── detector/       # Content analysis & keyword detection
│   ├── alert/          # Alert & notification system
│   ├── summary/        # Daily summary generation
│   └── scheduler/      # Cron-based scheduling (robfig/cron)
├── cmd/api/main.go     # Entry point (same pattern as api-service)
└── internal/
    ├── config/         # Environment-based config
    ├── database/       # SQL Server connection (sqlx + go-mssqldb)
    └── redis/          # Redis connection
```

### Integration Points

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Next.js     │────▶│  Kong Gateway   │────▶│  webmon-     │
│  Frontend    │     │  Port 9800      │     │  service     │
│  Port 3000   │     │  /webmon-svc/*  │     │  Port 8089   │
└──────────────┘     └─────────────────┘     └──────┬───────┘
                                                     │
                     ┌───────────────────────────────┤
                     ▼              ▼                 ▼
              ┌────────────┐ ┌──────────┐ ┌────────────────┐
              │ SQL Server │ │  Redis   │ │  External:     │
              │ Schema:    │ │  Cache   │ │  - Blogger API │
              │ monitoring │ │          │ │  - *.unila.ac  │
              └────────────┘ └──────────┘ └────────────────┘
```

---

## 3. Database Schema: `monitoring`

### 3.1 CMS Management Tables

#### `monitoring.sites` - Registry semua situs CMS

```sql
CREATE TABLE monitoring.sites (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    url                 NVARCHAR(500)    NOT NULL,
    name                NVARCHAR(200)    NOT NULL,
    platform            NVARCHAR(50)     NOT NULL DEFAULT 'blogger',
        -- blogger / wordpress / joomla / drupal / custom
    platform_version    NVARCHAR(50)     NULL,
    blogger_blog_id     NVARCHAR(100)    NULL,
    blogger_api_key     NVARCHAR(200)    NULL,
    sync_interval_min   INT              NOT NULL DEFAULT 15,
    last_synced_at      DATETIME2        NULL,
    status              NVARCHAR(20)     NOT NULL DEFAULT 'active',
        -- active / inactive / compromised / maintenance
    fakultas_id         NVARCHAR(50)     NULL,
    unit_id             NVARCHAR(50)     NULL,
    admin_name          NVARCHAR(200)    NULL,
    admin_email         NVARCHAR(200)    NULL,
    admin_phone         NVARCHAR(50)     NULL,
    notes               NVARCHAR(MAX)    NULL,
    is_behind_kong      BIT              NOT NULL DEFAULT 0,
    is_sso_enabled      BIT              NOT NULL DEFAULT 0,
    created_at          DATETIME2        NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_sites_url UNIQUE (url)
);

CREATE INDEX IX_sites_status ON monitoring.sites (status);
CREATE INDEX IX_sites_platform ON monitoring.sites (platform);
CREATE INDEX IX_sites_fakultas ON monitoring.sites (fakultas_id);
```

#### `monitoring.site_checks` - Log health check

```sql
CREATE TABLE monitoring.site_checks (
    id                      BIGINT IDENTITY(1,1) PRIMARY KEY,
    site_id                 UNIQUEIDENTIFIER NOT NULL,
    is_online               BIT              NOT NULL,
    http_status             INT              NULL,
    response_time_ms        INT              NULL,
    ssl_valid               BIT              NULL,
    ssl_expiry              DATETIME2        NULL,
    cms_version_detected    NVARCHAR(50)     NULL,
    checked_at              DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_site_checks_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id) ON DELETE CASCADE
);

CREATE INDEX IX_site_checks_site_date ON monitoring.site_checks (site_id, checked_at DESC);
```

#### `monitoring.site_metadata` - Info tambahan per situs

```sql
CREATE TABLE monitoring.site_metadata (
    id          BIGINT IDENTITY(1,1) PRIMARY KEY,
    site_id     UNIQUEIDENTIFIER NOT NULL,
    meta_key    NVARCHAR(100)    NOT NULL,
        -- theme / plugins / php_version / server / ip_address
    meta_value  NVARCHAR(MAX)    NULL,
    updated_at  DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_site_metadata_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id) ON DELETE CASCADE,
    CONSTRAINT UQ_site_metadata_key UNIQUE (site_id, meta_key)
);
```

### 3.2 Blogger Content Cache Tables

#### `monitoring.blog_posts_cache` - Cache konten dari Blogger API

```sql
CREATE TABLE monitoring.blog_posts_cache (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    site_id             UNIQUEIDENTIFIER NOT NULL,
    blogger_post_id     NVARCHAR(100)    NOT NULL,
    title               NVARCHAR(500)    NOT NULL,
    content             NVARCHAR(MAX)    NOT NULL,
    excerpt             NVARCHAR(1000)   NULL,
    slug                NVARCHAR(500)    NOT NULL,
    author_name         NVARCHAR(200)    NULL,
    author_avatar_url   NVARCHAR(500)    NULL,
    labels              NVARCHAR(MAX)    NULL,       -- JSON array: ["berita","akademik"]
    thumbnail_url       NVARCHAR(500)    NULL,
    published_at        DATETIME2        NOT NULL,
    updated_at          DATETIME2        NOT NULL,
    synced_at           DATETIME2        NOT NULL DEFAULT GETDATE(),
    is_visible          BIT              NOT NULL DEFAULT 1,

    CONSTRAINT FK_blog_posts_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id) ON DELETE CASCADE,
    CONSTRAINT UQ_blog_posts_external UNIQUE (site_id, blogger_post_id)
);

CREATE INDEX IX_blog_posts_published ON monitoring.blog_posts_cache (published_at DESC);
CREATE INDEX IX_blog_posts_slug ON monitoring.blog_posts_cache (slug);
CREATE INDEX IX_blog_posts_site ON monitoring.blog_posts_cache (site_id, published_at DESC);
```

#### `monitoring.blog_sync_logs` - Log sync history

```sql
CREATE TABLE monitoring.blog_sync_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    site_id         UNIQUEIDENTIFIER NOT NULL,
    status          NVARCHAR(20)     NOT NULL,  -- success / failed
    posts_fetched   INT              NOT NULL DEFAULT 0,
    posts_new       INT              NOT NULL DEFAULT 0,
    posts_updated   INT              NOT NULL DEFAULT 0,
    error_message   NVARCHAR(MAX)    NULL,
    duration_ms     INT              NOT NULL DEFAULT 0,
    synced_at       DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_blog_sync_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id) ON DELETE CASCADE
);

CREATE INDEX IX_blog_sync_site_date ON monitoring.blog_sync_logs (site_id, synced_at DESC);
```

### 3.3 Judol Monitoring Tables

#### `monitoring.threat_keywords` - Daftar keyword judol (configurable)

```sql
CREATE TABLE monitoring.threat_keywords (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    keyword     NVARCHAR(200)    NOT NULL,
    category    NVARCHAR(50)     NOT NULL,
        -- slot / togel / casino / poker / generic
    weight      INT              NOT NULL DEFAULT 5,  -- severity 1-10
    is_regex    BIT              NOT NULL DEFAULT 0,
    is_active   BIT              NOT NULL DEFAULT 1,
    created_at  DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_threat_keywords UNIQUE (keyword, category)
);

CREATE INDEX IX_keywords_active ON monitoring.threat_keywords (is_active) WHERE is_active = 1;
```

#### `monitoring.crawl_jobs` - Scheduled crawl jobs

```sql
CREATE TABLE monitoring.crawl_jobs (
    id                  INT IDENTITY(1,1) PRIMARY KEY,
    name                NVARCHAR(200)    NOT NULL,
    description         NVARCHAR(MAX)    NULL,
    target_scope        NVARCHAR(20)     NOT NULL DEFAULT 'all',
        -- all / specific / custom_urls
    target_site_ids     NVARCHAR(MAX)    NULL,   -- JSON array site UUIDs
    custom_urls         NVARCHAR(MAX)    NULL,   -- JSON array URLs
    max_depth           INT              NOT NULL DEFAULT 3,
    max_pages_per_site  INT              NOT NULL DEFAULT 500,
    cron_expression     NVARCHAR(100)    NOT NULL,
    is_active           BIT              NOT NULL DEFAULT 1,
    last_run_at         DATETIME2        NULL,
    next_run_at         DATETIME2        NULL,
    created_by          NVARCHAR(200)    NULL,
    created_at          DATETIME2        NOT NULL DEFAULT GETDATE(),
    updated_at          DATETIME2        NOT NULL DEFAULT GETDATE()
);
```

#### `monitoring.crawl_sessions` - Satu eksekusi crawl

```sql
CREATE TABLE monitoring.crawl_sessions (
    id              UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    job_id          INT              NOT NULL,
    status          NVARCHAR(20)     NOT NULL DEFAULT 'queued',
        -- queued / running / completed / failed / cancelled
    sites_scanned   INT              NOT NULL DEFAULT 0,
    pages_scanned   INT              NOT NULL DEFAULT 0,
    threats_found   INT              NOT NULL DEFAULT 0,
    error_message   NVARCHAR(MAX)    NULL,
    started_at      DATETIME2        NULL,
    completed_at    DATETIME2        NULL,
    duration_ms     BIGINT           NOT NULL DEFAULT 0,

    CONSTRAINT FK_crawl_sessions_job FOREIGN KEY (job_id)
        REFERENCES monitoring.crawl_jobs (id) ON DELETE CASCADE
);

CREATE INDEX IX_crawl_sessions_job ON monitoring.crawl_sessions (job_id, started_at DESC);
CREATE INDEX IX_crawl_sessions_status ON monitoring.crawl_sessions (status);
```

#### `monitoring.crawl_pages` - Setiap halaman yang dicrawl

```sql
CREATE TABLE monitoring.crawl_pages (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    session_id      UNIQUEIDENTIFIER NOT NULL,
    site_id         UNIQUEIDENTIFIER NOT NULL,
    url             NVARCHAR(2000)   NOT NULL,
    http_status     INT              NULL,
    content_length  INT              NULL,
    content_hash    NVARCHAR(64)     NULL,       -- SHA256
    threat_score    INT              NOT NULL DEFAULT 0,
    scanned_at      DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_crawl_pages_session FOREIGN KEY (session_id)
        REFERENCES monitoring.crawl_sessions (id) ON DELETE CASCADE,
    CONSTRAINT FK_crawl_pages_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id)
);

CREATE INDEX IX_crawl_pages_session ON monitoring.crawl_pages (session_id);
CREATE INDEX IX_crawl_pages_threat ON monitoring.crawl_pages (threat_score DESC) WHERE threat_score > 0;
```

#### `monitoring.detected_threats` - Temuan konten judol

```sql
CREATE TABLE monitoring.detected_threats (
    id                  UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    session_id          UNIQUEIDENTIFIER NOT NULL,
    page_id             BIGINT           NOT NULL,
    site_id             UNIQUEIDENTIFIER NOT NULL,
    url                 NVARCHAR(2000)   NOT NULL,
    matched_keywords    NVARCHAR(MAX)    NOT NULL,  -- JSON: [{keyword,category,weight}]
    threat_score        INT              NOT NULL,
    snippet             NVARCHAR(MAX)    NULL,       -- 200 char context
    page_title          NVARCHAR(500)    NULL,
    status              NVARCHAR(20)     NOT NULL DEFAULT 'new',
        -- new / confirmed / false_positive / resolved
    resolved_by         NVARCHAR(200)    NULL,
    resolved_at         DATETIME2        NULL,
    resolution_notes    NVARCHAR(MAX)    NULL,
    detected_at         DATETIME2        NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_threats_session FOREIGN KEY (session_id)
        REFERENCES monitoring.crawl_sessions (id),
    CONSTRAINT FK_threats_page FOREIGN KEY (page_id)
        REFERENCES monitoring.crawl_pages (id),
    CONSTRAINT FK_threats_site FOREIGN KEY (site_id)
        REFERENCES monitoring.sites (id)
);

CREATE INDEX IX_threats_status ON monitoring.detected_threats (status, detected_at DESC);
CREATE INDEX IX_threats_site ON monitoring.detected_threats (site_id, status);
CREATE INDEX IX_threats_score ON monitoring.detected_threats (threat_score DESC);
```

#### `monitoring.alert_notifications` - History notifikasi

```sql
CREATE TABLE monitoring.alert_notifications (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    threat_id       UNIQUEIDENTIFIER NULL,
    session_id      UNIQUEIDENTIFIER NULL,
    channel         NVARCHAR(20)     NOT NULL,  -- email / webhook / telegram / dashboard
    recipient       NVARCHAR(200)    NOT NULL,
    subject         NVARCHAR(500)    NOT NULL,
    body            NVARCHAR(MAX)    NULL,
    is_sent         BIT              NOT NULL DEFAULT 0,
    sent_at         DATETIME2        NULL,
    error_message   NVARCHAR(MAX)    NULL,

    CONSTRAINT FK_alerts_threat FOREIGN KEY (threat_id)
        REFERENCES monitoring.detected_threats (id),
    CONSTRAINT FK_alerts_session FOREIGN KEY (session_id)
        REFERENCES monitoring.crawl_sessions (id)
);
```

#### `monitoring.daily_summary` - Ringkasan harian (public dashboard)

```sql
CREATE TABLE monitoring.daily_summary (
    id                          INT IDENTITY(1,1) PRIMARY KEY,
    summary_date                DATE         NOT NULL,
    total_sites_monitored       INT          NOT NULL DEFAULT 0,
    sites_online                INT          NOT NULL DEFAULT 0,
    sites_offline               INT          NOT NULL DEFAULT 0,
    sites_compromised           INT          NOT NULL DEFAULT 0,
    new_threats_count           INT          NOT NULL DEFAULT 0,
    resolved_threats_count      INT          NOT NULL DEFAULT 0,
    active_threats_count        INT          NOT NULL DEFAULT 0,
    overall_status              NVARCHAR(20) NOT NULL DEFAULT 'aman',
        -- aman / waspada / bahaya
    top_threat_categories       NVARCHAR(MAX) NULL,  -- JSON: {slot: 5, togel: 3}
    created_at                  DATETIME2    NOT NULL DEFAULT GETDATE(),

    CONSTRAINT UQ_daily_summary_date UNIQUE (summary_date)
);
```

### 3.4 Seed Data - Default Keywords

```sql
-- 06_seed_keywords.sql
INSERT INTO monitoring.threat_keywords (keyword, category, weight, is_regex, is_active) VALUES
-- Category: slot
('slot gacor',       'slot', 9, 0, 1),
('slot online',      'slot', 8, 0, 1),
('slot deposit',     'slot', 8, 0, 1),
('rtp slot',         'slot', 8, 0, 1),
('slot terpercaya',  'slot', 7, 0, 1),
('pragmatic play',   'slot', 7, 0, 1),
('scatter',          'slot', 5, 0, 1),
('daftar slot',      'slot', 7, 0, 1),
('maxwin',           'slot', 7, 0, 1),
('gacor hari ini',   'slot', 8, 0, 1),
-- Regex: slot + modifiers
('slot\s*(gacor|online|terpercaya|deposit|dana|pulsa)', 'slot', 8, 1, 1),

-- Category: togel
('togel online',     'togel', 9, 0, 1),
('bandar togel',     'togel', 9, 0, 1),
('togel sgp',        'togel', 8, 0, 1),
('togel hk',         'togel', 8, 0, 1),
('togel sidney',     'togel', 7, 0, 1),
('togel',            'togel', 8, 0, 1),
-- Regex: togel + modifiers
('togel\s*(sgp|hk|sidney|online|hari ini)', 'togel', 8, 1, 1),

-- Category: casino
('judi online',      'casino', 9, 0, 1),
('casino online',    'casino', 8, 0, 1),
('live casino',      'casino', 8, 0, 1),
('casino',           'casino', 7, 0, 1),

-- Category: poker
('poker online',     'poker', 7, 0, 1),
('judi bola',        'poker', 7, 0, 1),
('situs judi',       'poker', 8, 0, 1),

-- Category: generic (indicators of gambling content)
('bonus new member', 'generic', 6, 0, 1),
('link alternatif',  'generic', 6, 0, 1),
('bo terpercaya',    'generic', 7, 0, 1),
('withdraw',         'generic', 4, 0, 1),
('jackpot',          'generic', 5, 0, 1);
```

**Total: 12 tabel + seed data dalam schema `monitoring`**

---

## 4. Tech Stack & Libraries

### Backend (Go)

| Library | Version | Purpose |
|---------|---------|---------|
| `gofiber/fiber/v2` | latest | HTTP framework (same as existing services) |
| `gocolly/colly/v2` | v2.1.0+ | Web crawler - crawl sites, follow links, extract content |
| `PuerkitoBio/goquery` | latest | HTML parser (included with Colly) |
| `robfig/cron/v3` | latest | Scheduled crawl jobs (same pattern as feeder-service) |
| `jmoiron/sqlx` | latest | SQL toolkit (same as existing services) |
| `microsoft/go-mssqldb` | latest | SQL Server driver (same as existing) |
| `redis/go-redis/v9` | latest | Redis cache (same as existing) |
| `google/uuid` | latest | UUID generation (same as existing) |
| `go-gomail/gomail` | v2 | Email notifications (Phase 4) |

### Frontend (Next.js - already installed)

| Library | Purpose |
|---------|---------|
| `echarts` + `echarts-for-react` | Charts (threat trends, distributions) |
| HeroUI Table | Data tables (sites, threats, sessions) |
| Axios | HTTP client (webmonClient) |
| React Query | Data fetching & caching |
| `react-icons` / `lucide-react` | Icons |

---

## 5. API Endpoints

### 5.1 Site Management (Authenticated - JWT)

```
GET    /v1/sites                        # List (paginated, filter: status, platform, fakultas)
POST   /v1/sites                        # Register situs baru
GET    /v1/sites/:id                    # Detail + latest health + latest sync
GET    /v1/sites/:id/health-history     # Health check history (last 30 days)
POST   /v1/sites/:id/check-now         # Trigger manual health check
PUT    /v1/sites/:id                    # Update info situs
DELETE /v1/sites/:id                    # Remove dari registry
GET    /v1/sites/stats/overview         # Aggregate stats

POST   /v1/sites/:id/sync-now          # Trigger immediate Blogger sync
GET    /v1/sites/:id/sync-logs         # Sync history
```

### 5.2 Crawl / Scanner (Authenticated)

```
GET    /v1/crawl/jobs                   # List crawl jobs
POST   /v1/crawl/jobs                   # Create crawl job
PUT    /v1/crawl/jobs/:id               # Update crawl job
DELETE /v1/crawl/jobs/:id               # Delete crawl job
POST   /v1/crawl/jobs/:id/toggle        # Enable/disable
POST   /v1/crawl/jobs/:id/run           # Trigger manual crawl

GET    /v1/crawl/sessions               # List sessions (paginated)
GET    /v1/crawl/sessions/:id           # Detail + pages + threats
GET    /v1/crawl/sessions/:id/pages     # Pages scanned in session
```

### 5.3 Threats (Authenticated)

```
GET    /v1/threats                       # List (filter: status, site, category, date range, min score)
GET    /v1/threats/:id                   # Detail + evidence + matched keywords
PUT    /v1/threats/:id/status            # Update: confirm / false_positive / resolved (+ notes)
GET    /v1/threats/stats                 # Stats: by category, by site, trend
GET    /v1/threats/export                # Export to CSV (for reporting)
```

### 5.4 Keywords (Authenticated)

```
GET    /v1/keywords                      # List (filter: category, active)
POST   /v1/keywords                      # Add keyword
PUT    /v1/keywords/:id                  # Update keyword
DELETE /v1/keywords/:id                  # Delete keyword
POST   /v1/keywords/seed                 # Reset to default seed data
POST   /v1/keywords/import               # Bulk import from JSON
```

### 5.5 Public Dashboard (No Auth Required)

```
GET    /v1/public/status                 # Overall status: {status, last_scan, sites_monitored}
GET    /v1/public/daily-summary          # Last 30 days: [{date, threats, resolved, status}]
GET    /v1/public/stats                  # Aggregate: {total_scans, resolved, avg_response}
```

### 5.6 Public Blog Content (No Auth Required)

```
GET    /v1/public/posts                  # List cached posts (paginated, filter: site, labels)
GET    /v1/public/posts/:slug            # Single post by slug
GET    /v1/public/posts/site/:siteId     # Posts by site/unit
GET    /v1/public/posts/search?q=...     # Search posts
GET    /v1/public/sites                  # List blog sites (name + URL only)
```

---

## 6. Crawler Design (Colly)

### 6.1 Crawl Strategy

```
1. Load target sites dari monitoring.sites (status = active)

2. Per site:
   a. GET robots.txt → parse Disallow rules, respect them
   b. GET sitemap.xml → add URLs to crawl queue
   c. Start from homepage → follow internal links
   d. Configuration:
      - Max depth: 3 levels (configurable per job)
      - Max pages: 500 per site (configurable per job)
      - Rate limit: 1 request/second per domain (polite crawling)
      - Timeout: 30 seconds per request
      - User-Agent: "MyUnila-WebMon/1.0 (+https://my.unila.ac.id/webmon)"
      - Concurrent domains: 3 (crawl 3 sites simultaneously)
      - AllowedDomains: only *.unila.ac.id

3. Per page:
   a. Extract visible text (strip HTML tags using goquery)
   b. Analyze content zones: <title>, <meta name="description">,
      <h1>-<h6>, <a href> text, <body> text
   c. Run keyword matching (detector module):
      - Exact match (case-insensitive, strings.Contains)
      - Regex patterns (pre-compiled *regexp.Regexp)
      - Calculate threat_score = SUM(matched keyword weights)
   d. If threat_score >= 5 → INSERT monitoring.detected_threats
   e. Store 200-char snippet context around first match
   f. Calculate SHA256 content_hash (detect page changes between scans)
   g. INSERT monitoring.crawl_pages

4. After crawl complete:
   a. UPDATE monitoring.crawl_sessions (totals, status, duration)
   b. Generate/update monitoring.daily_summary
   c. If new threats found → trigger alert_notifications
```

### 6.2 Keyword Detection (Detector Module)

```go
// Pre-compile all regex keywords on startup
type Analyzer struct {
    exactKeywords []ThreatKeyword               // is_regex = false
    regexKeywords []ThreatKeyword               // is_regex = true
    regexCache    map[int]*regexp.Regexp         // compiled regex
}

type AnalysisResult struct {
    ThreatScore     int
    MatchedKeywords []MatchedKeyword
    Snippets        []string
}

type MatchedKeyword struct {
    Keyword  string
    Category string
    Weight   int
    Position int     // character position in text
}

// Scoring rules:
// - Page score = SUM of all matched keyword weights
// - Threshold: score >= 5 = flagged as threat
// - Duplicate keywords on same page only counted once
// - Title/H1 matches get 1.5x weight multiplier
```

---

## 7. Frontend — Current Implementation (✅ Complete)

> **Base Path**: `src/app/dashboard/monitoring`
> **Route**: `/dashboard/monitoring`
> **Status**: Phase 1 & 2 Complete — using dummy data
> **Portal Entry**: Injected as static app in `src/app/portal/page.tsx`

### 7.0 Component Inventory (Already Built)

#### Structure
```
src/app/dashboard/monitoring/
├── config/menuConfig.tsx          # Sidebar menu config
├── layout.tsx                     # DashboardLayoutWithDynamicMenu wrapper
├── page.tsx                       # Main dashboard page (responsive grid)
└── components/
    ├── index.ts                   # Barrel exports
    ├── StatCard.tsx               # Gradient stat cards (responsive)
    ├── OverviewStatCards.tsx       # 5 stat cards row
    ├── MonitoringCharts.tsx        # Pie charts (kategori + status)
    ├── RecentThreatsTable.tsx      # Uses shared DataTable
    ├── TrendChart.tsx              # Line chart (6-month threats)
    ├── TopUnitsChart.tsx           # DrilldownBarChart (faculty→prodi)
    ├── ResponseTimeChart.tsx       # Gauge + metrics
    ├── AlertFeed.tsx               # ✅ Early warning panel, severity filter
    ├── SiteRegistryTable.tsx       # ✅ Uses shared DataTable, health bars, SSL
    ├── ScanHistoryTimeline.tsx     # ✅ Visual timeline of scan results
    └── charts/
        ├── index.ts               # Barrel exports
        ├── BaseChart.tsx           # ECharts wrapper (dynamic import)
        ├── PieChart.tsx            # Configurable pie/donut
        ├── BarChart.tsx            # Configurable bar (H/V)
        ├── LineChart.tsx           # Configurable line/area
        ├── GaugeChart.tsx          # Gauge with target
        └── DrilldownBarChart.tsx   # ✅ Clickable drill-down bar chart
```

#### Shared Component Conventions (WAJIB DIIKUTI)

Agent berikutnya **HARUS** mengikuti konvensi berikut agar konsisten:

| Konvensi | Detail |
|----------|--------|
| **Data Tables** | Gunakan `@/shared/components/ui/DataTable` (bukan raw HTML table). Support: `searchable`, `searchKeys`, `filterSlot`, `actionSlot`, `sortable`, `render` per kolom, pagination |
| **Card Wrapper** | HeroUI `Card` dengan class: `bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300` |
| **Card Header** | Icon container `w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-{color}-100 dark:bg-{color}-900/30` + title `text-sm sm:text-base font-bold` + subtitle `text-[10px] sm:text-xs text-gray-500` |
| **Responsive Text** | `text-[10px] sm:text-xs` for captions, `text-xs sm:text-sm` for body, `text-sm sm:text-base` for titles |
| **Responsive Padding** | `p-3 sm:p-4` for CardBody, `gap-3 sm:gap-4 md:gap-6` for grids |
| **Badges/Chips** | HeroUI `Chip` dengan `size="sm"`, `variant="flat"` atau `"solid"`, warna sesuai severity |
| **Text Overflow** | `truncate` untuk single-line, `line-clamp-2` untuk multi-line |
| **Charts** | Gunakan komponen dari `./charts/` (`BaseChart`, `PieChart`, `BarChart`, `LineChart`, `GaugeChart`, `DrilldownBarChart`) |
| **Grid Breakpoints** | `grid-cols-1 lg:grid-cols-3` (1/3 split), `grid-cols-1 md:grid-cols-2` (equal split) |
| **Icons** | `react-icons/fi` (Feather Icons) |

### 7.1 Public: `/keamanan-web` (Early Warning) — BELUM DIIMPLEMENTASI

**Layout**: PublicLayout (Navbar + Footer)

**Components (to build)**:
- `SecurityStatusHero.tsx` - Status badge + pulse animation if BAHAYA
- `MonitoringStatsRow.tsx` - 3 stat cards
- `ThreatTrendPublicChart.tsx` - ECharts line chart (30 days, count only)
- `SecurityTipsSection.tsx` - Static tips

**Data**: `GET /v1/public/status` + `GET /v1/public/daily-summary`

### 7.2 Dashboard: `/dashboard/monitoring` (Overview) — ✅ SELESAI

**Layout**: DashboardLayoutWithDynamicMenu

**Page Layout** (responsive grid, top to bottom):
1. Header — Title + Export + Lapor Insiden buttons
2. `OverviewStatCards` — 5 gradient stat cards (grid-cols-2 sm:3 lg:5)
3. `AlertFeed` (1/3) + `TrendChart` (2/3)
4. `ResponseTimeChart` (1/3) + `TopUnitsChart` with drilldown (2/3)
5. `MonitoringCharts` — 2 pie charts side-by-side
6. `ScanHistoryTimeline` (1/3) + `RecentThreatsTable` in Card (2/3)
7. `SiteRegistryTable` — full-width DataTable with filters

**Semua komponen sudah diimplementasi dengan dummy data.**

### 7.3 Dashboard: `/dashboard/webmon/sites` (Site Management) — BELUM

**Components (to build)**:
- `SiteTable.tsx` - HeroUI Table: URL, platform icon, status badge, health, last sync, actions
- `SiteFormModal.tsx` - Create/edit modal (URL, name, platform, fakultas, PIC info)
- `BloggerConnectForm.tsx` - Input blogspot URL → auto-detect blogId
- `SiteDetailPanel.tsx` - Expandable detail: health history chart, metadata table, sync logs
- `SiteHealthBadge.tsx` - Color-coded badge: online/offline/compromised
- `SyncNowButton.tsx` - Trigger immediate Blogger sync

### 7.4 Dashboard: `/dashboard/webmon/scanner` (Crawl Jobs) — BELUM

**Components (to build)**:
- `CrawlJobTable.tsx` - List: name, scope, cron, last run, next run, toggle switch
- `CrawlJobFormModal.tsx` - Create/edit: name, target scope, schedule, depth
- `TriggerScanButton.tsx` - Manual trigger with confirmation dialog
- `CrawlSessionList.tsx` - Session history accordion
- `SessionDetailView.tsx` - Pages table + threats inline + timeline chart
- `CrawlProgressIndicator.tsx` - Progress bar for running sessions

### 7.5 Dashboard: `/dashboard/webmon/threats` (Threat Management) — BELUM

**Components (to build)**:
- `ThreatStatsCards.tsx` - 4 cards: New, Confirmed, Resolved, False Positive
- `ThreatTable.tsx` - Filterable, uses shared DataTable
- `ThreatDetailModal.tsx` - Full detail + matched keywords + snippet
- `ThreatStatusWorkflow.tsx` - Action buttons + notes
- `ThreatBySiteChart.tsx` - Horizontal bar: top 10 sites
- `ThreatExportButton.tsx` - Export to CSV

### 7.6 Dashboard: `/dashboard/webmon/keywords` (Keyword Config) — BELUM

**Components (to build)**:
- `KeywordTable.tsx` - List with category badge, weight bar, regex icon
- `KeywordFormModal.tsx` - Add/edit keyword
- `KeywordCategoryFilter.tsx` - Tab filter by category
- `BulkImportButton.tsx` - Upload JSON/CSV
- `ResetToDefaultButton.tsx` - Reset ke seed data

### 7.7 Public: `/berita` (Aggregated Blog Content) — BELUM

**Components (to build)**:
- `BlogPostGrid.tsx` - Responsive card grid (3 cols desktop, 1 col mobile)
- `BlogPostCard.tsx` - Card: thumbnail, title, excerpt, author, date, unit badge
- `BlogFilterBar.tsx` - Filter: unit/fakultas dropdown, search, label tags
- `BlogPagination.tsx` - Load more / infinite scroll

### 7.8 Public: `/berita/[slug]` (Single Post) — BELUM

**Components (to build)**:
- `BlogPostContent.tsx` - Full HTML content (sanitized)
- `BlogPostHeader.tsx` - Title, author, date, labels
- `BlogPostSidebar.tsx` - Related posts, unit info
- `BlogShareButtons.tsx` - Share to social media

---

## 8. Implementation Phases

### Phase 0: Frontend Dashboard Prototype — ✅ SELESAI (2026-02-18)
- Portal injection, full dashboard layout dengan dummy data
- 5 StatCards, 6 chart components, AlertFeed, SiteRegistryTable, ScanHistoryTimeline, RecentThreatsTable

### Phase 1: Backend Foundation & DB Schema — ✅ SELESAI (2026-02-21)
- Go Fiber app: Dockerfile, config, middleware KongAuth, pkg/response, health endpoint
- SQL Server: 16 tabel schema `monitoring` + seed 41 keywords + settings table
- Commit: `feat(monitoring-db)`, `feat(monitoring-service)`, `feat(monitoring-docker)`

### Phase 2: Site Registry + Blog Sync — ✅ SELESAI (2026-02-25)
- Module site: CRUD + health check scheduler (cron 5 menit)
- Module blog_sync: Blogger API v3, upsert blog_posts_cache, sync scheduler

### Phase 3: Crawler + Detection — ✅ SELESAI (2026-02-28)
- Module crawler: colly engine, rate limit 1 req/s/domain, max depth 3, max 500 pages/site
- Module detector: pre-compile regex, scoring dengan title/H1 multiplier 1.5x, threshold ≥ 5
- Module keywords: CRUD + seed 41 kata kunci default + reset ke default

### Phase 4: Threats + Alerts — ✅ SELESAI (2026-02-28)
- Module threats: CRUD status (pending/confirmed/false_positive/resolved), stats, alert notifikasi
- Alert notifications INSERT ke `monitoring.alert_notifications` saat threat baru terdeteksi

### Phase 5: Summary + Public API — ✅ SELESAI (2026-02-28)
- Module summary: GetStatus, GetStats, DailySummary
- Public endpoints `/v1/public/status`, `/v1/public/stats`, `/v1/public/daily-summary` (tanpa auth)
- Scheduler: daily summary cron jam 05:00 AM

### Phase 6: Google GSC — ✅ SELESAI (2026-03-01)
- Module google_gsc: Indexing API, rate limiting 200 req/hari (free quota)
- monitoring.settings table: config GSC dari DB (site_url, email, threshold, enabled)
- GSC service account JSON di `/app/secrets/` (gitignored, volume mount)
- Auto-trigger: score ≥ GSC_AUTO_REMOVE_THRESHOLD → submit URL removal ke Google

### Phase 7: Frontend Integration — ✅ SELESAI (2026-03-02)
- webmonClient.ts: axios + JWT auto-refresh
- 5 service files: siteService, threatService, keywordService, crawlerService, publicService
- Semua halaman monitoring → real API (hapus semua dummy data)
- Dashboard components: OverviewStatCards, AlertFeed, RecentThreatsTable, SiteRegistryTable, ScanHistoryTimeline → fetch dari API

---

## 9. Next Steps — Aktivasi & Feature Lanjutan

### A. Aktivasi Sistem (Prioritas Tinggi — Segera)

> **Perlu dilakukan manual oleh admin sebelum sistem bisa berjalan:**

| # | Task | Cara | Estimasi |
|---|------|------|---------|
| 1 | **Jalankan SQL seed sites** | SSMS: jalankan `monitoring_15_seed_sites.sql` | 5 menit |
| 2 | **Jalankan SQL settings** | SSMS: jalankan `monitoring_16_settings_create.sql` | 2 menit |
| 3 | **Register Kong route** | Jalankan `deployment/local/scripts/setup-kong-routes.sh` | 5 menit |
| 4 | **Enable GSC** | Set `GSC_ENABLED=true` di `.env` monitoring-service, restart container | 2 menit |
| 5 | **Delegate GSC property** | Di Search Console: tambah `webmon-gsc-bot@...` sebagai user dengan Full permission | 10 menit |
| 6 | **Test end-to-end** | POST `/api/v1/crawl/jobs` (job_type=full), monitor `/api/v1/threats`, cek `/v1/public/status` | 30 menit |

### B. Phase 8 — Halaman Publik (Next Session)

#### B.1 `/keamanan-web` — Early Warning Public Page

**Route**: `frontend/src/app/(public)/keamanan-web/page.tsx`
**Layout**: PublicLayout (tanpa auth)
**Komponen yang perlu dibuat**:
- `SecurityStatusHero.tsx` — Status badge (AMAN/WASPADA/BAHAYA) + pulse animation jika BAHAYA
- `MonitoringStatsRow.tsx` — 3 kartu: situs dipantau, ancaman bulan ini, terselesaikan
- `ThreatTrendPublicChart.tsx` — ECharts line chart 30 hari (jumlah saja, bukan detail)
- `SecurityTipsSection.tsx` — Tips keamanan web untuk admin unit (static content)

**Data source**: `publicService.getStatus()` + `publicService.getDailySummary()`

#### B.2 `/berita` — Aggregated Blog Content

**Route**: `frontend/src/app/(public)/berita/page.tsx`
**Data source**: `GET /v1/public/posts` (blog_sync module)
**Komponen yang perlu dibuat**:
- `BlogPostGrid.tsx` — Responsive card grid (3 col desktop, 1 mobile)
- `BlogPostCard.tsx` — Thumbnail, judul, excerpt, penulis, tanggal, badge unit
- `BlogFilterBar.tsx` — Filter: unit/fakultas dropdown, search, label tags
- `BlogPagination.tsx` — Load more / infinite scroll

#### B.3 `/berita/[slug]` — Single Post

**Route**: `frontend/src/app/(public)/berita/[slug]/page.tsx`
**Komponen**:
- `BlogPostContent.tsx` — Full HTML content (sanitized dengan DOMPurify)
- `BlogPostHeader.tsx` — Judul, penulis, tanggal, labels
- `BlogPostSidebar.tsx` — Related posts, info unit

### C. Phase 9 — GSC Dashboard (Next Session)

**Route**: `frontend/src/app/dashboard/monitoring/gsc/page.tsx`
**Tujuan**: Monitor status URL removal ke Google Search Console

**Komponen yang perlu dibuat**:
- `GSCQuotaCard.tsx` — Quota hari ini (xxx/200 removal), status enabled/disabled
- `GSCRemovalTable.tsx` — History: URL, status (submitted/success/failed/rate_limited), tanggal
- `GSCRemoveButton.tsx` — Form manual remove URL (input URL + threat dropdown)

**API**: `GET /api/v1/gsc/quota`, `GET /api/v1/gsc/logs`, `POST /api/v1/gsc/remove`

### D. Phase 10 — Reporting & Enhancement

#### D.1 Export Laporan
- Threats page: tombol "Export Laporan" → CSV/Excel actual (saat ini hanya placeholder)
- Backend: `GET /api/v1/threats/export` → generate CSV stream
- Frontend: `threatService.exportCsv()` + trigger download

#### D.2 Threat Detail Modal
- `ThreatDetailModal.tsx` — Full detail: URL, snippet, matched keywords, skor, history status
- Tombol aksi: Konfirmasi / Tandai False Positive / Tandai Resolved + isian notes
- Tombol: "Request Google Removal" → call `/api/v1/gsc/remove-threat/:id`

#### D.3 Email Notifications
- Backend `apps/alert/email.go`: send via SMTP saat threat baru terdeteksi
- Config via `monitoring.settings`: smtp_host, smtp_port, smtp_from, smtp_to_admin
- Template: HTML email dengan detail ancaman

#### D.4 Telegram Bot
- Webhook notifications ke grup Telegram admin IT
- Config: `monitoring.settings` → telegram_bot_token, telegram_chat_id

#### D.5 Screenshot Evidence
- `chromedp` screenshot halaman terancam saat crawl
- Simpan di MinIO: `monitoring-screenshots/{site_id}/{threat_id}.png`
- Tampil di ThreatDetailModal sebagai evidence

### E. Phase 11 — Enhancement Lanjutan

| Feature | Deskripsi |
|---------|-----------|
| Subdomain auto-discovery | DNS enumeration `*.unila.ac.id` untuk discover situs baru |
| ML anomaly detection | Deteksi lonjakan threat mendadak per unit |
| Geospatial heatmap | Peta sebaran ancaman per fakultas/gedung |
| Monthly PDF report | Auto-generate laporan bulanan untuk pimpinan |
| Compliance report | Report per unit untuk audit IT |
| Google CSE cross-reference | Cek apakah URL sudah keluar dari Google Search |

---

## 10. Status Deployment

### Local Development
```
Container: myunila-monitoring-service
Port:       8089 (internal), route via Kong /webmon-service
DB:         SQL Server - schema monitoring
Secrets:    deployment/local/secrets/gsc-service-account.json
Docker:     deployment/local/services/3-backend/docker-compose.monitoring.yml
```

### Kong Routes (setelah setup-kong-routes.sh dijalankan)
```
/webmon-service/*           → monitoring-service:8089 (JWT required)
/webmon-service/v1/public/* → monitoring-service:8089/v1/public/* (via same JWT route)
```

### Environment Variables Penting
```env
# Frontend (.env.local)
NEXT_PUBLIC_WEBMON_API_URL=http://localhost:9800/webmon-service

# Backend monitoring-service (.env)
GSC_ENABLED=true  ← wajib diset setelah delegate GSC property
GSC_AUTO_REMOVE_THRESHOLD=15
GSC_SERVICE_ACCOUNT_JSON=/app/secrets/gsc-service-account.json
```

---

## 11. Verification Checklist

| Test | Endpoint | Expected |
|------|---------|---------|
| Health | `GET /health` | `{status: ok, db: connected}` |
| Keywords | `GET /api/v1/keywords` | 41 keywords (setelah seed) |
| Sites | `GET /api/v1/sites` | 249 sites (setelah seed) |
| Public status | `GET /v1/public/status` (no auth) | `{status: aman, sites_monitored: N}` |
| Create job | `POST /api/v1/crawl/jobs` `{job_type: full}` | Job created (status: queued) |
| GSC quota | `GET /api/v1/gsc/quota` | `{used: 0, limit: 200, enabled: true}` |
| Via Kong | `GET localhost:9800/webmon-service/health` | Same (dengan JWT token) |

---

## 10. Google Search Console Integration

### 10.1 Overview

Setelah crawler mendeteksi halaman terinjeksi judol, sistem secara otomatis mengajukan
**temporary URL removal** ke Google Search Console API — halaman hilang dari hasil
pencarian Google selama ~6 bulan, memberi waktu admin unit untuk membersihkan konten.

> **Penting**: Fitur ini hanya menghapus dari **Google Search results**, bukan dari server.
> Admin unit tetap harus membersihkan konten yang terinjeksi.

```
Crawler detects threat (score >= GSC_AUTO_REMOVE_THRESHOLD)
        │
        ▼
monitoring.detected_threats (status = 'new')
        │
        ▼
apps/google_gsc/service.go
  ├── SubmitURLRemoval(url)   → POST ke Google Search Console API
  └── Log ke monitoring.gsc_removal_logs
        │
        ▼
Google Search Console
  → URL tidak muncul di Google Search (~6 bulan)
```

---

### 10.2 Setup Google Cloud Console (Admin — One-time)

#### A1. Buat Project
1. Buka https://console.cloud.google.com
2. Klik dropdown project → **New Project**
3. Name: `myunila-webmon` → **Create**

#### A2. Enable Google Search Console API
1. **APIs & Services → Library**
2. Search: `Google Search Console API` → **Enable**

#### A3. Buat Service Account
1. **APIs & Services → Credentials → Create Credentials → Service Account**
2. Name: `webmon-gsc-bot`
3. Description: `Web Monitoring - GSC URL Removal Bot`
4. Role: **Editor**
5. Klik **Done**

#### A4. Download JSON Key
1. Klik service account → tab **Keys → Add Key → Create new key → JSON**
2. Simpan sebagai `gsc-service-account.json`
3. Taruh di server: `/app/secrets/gsc-service-account.json`
4. **JANGAN commit ke git** — pastikan ada di `.gitignore`

---

### 10.3 Setup Google Search Console (Admin — One-time)

#### B1. Tambah Domain Property
1. Buka https://search.google.com/search-console
2. **Add Property → Domain**
3. Masukkan: `unila.ac.id`
   _(Domain property = otomatis covers semua `*.unila.ac.id`)_

#### B2. Verifikasi via DNS TXT Record
1. Login ke DNS manager domain `unila.ac.id`
2. Tambah record:
   ```
   Name:  @  (atau unila.ac.id)
   Type:  TXT
   Value: google-site-verification=XXXXXXXXXXXX
   TTL:   3600
   ```
3. Kembali ke Search Console → klik **Verify**
   _(Propagasi DNS bisa 5–60 menit)_

#### B3. Tambah Service Account sebagai User
1. Property `unila.ac.id` → **Settings → Users and permissions → Add user**
2. Email: `webmon-gsc-bot@myunila-webmon.iam.gserviceaccount.com`
3. Permission: **Full**
4. Klik **Add**

---

### 10.4 Database: Tabel `monitoring.gsc_removal_logs`

```sql
CREATE TABLE monitoring.gsc_removal_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    threat_id       UNIQUEIDENTIFIER NOT NULL,
    url             NVARCHAR(2000)   NOT NULL,
    action          NVARCHAR(20)     NOT NULL,      -- removal / recrawl
    gsc_request_id  NVARCHAR(200)    NULL,
    status          NVARCHAR(20)     NOT NULL DEFAULT 'submitted',
        -- submitted / completed / failed
    submitted_by    NVARCHAR(200)    NULL,           -- 'auto' atau user email
    submitted_at    DATETIME2        NOT NULL DEFAULT GETDATE(),
    error_message   NVARCHAR(MAX)    NULL,

    CONSTRAINT FK_gsc_logs_threat FOREIGN KEY (threat_id)
        REFERENCES monitoring.detected_threats (id)
);

CREATE INDEX IX_gsc_logs_threat ON monitoring.gsc_removal_logs (threat_id);
CREATE INDEX IX_gsc_logs_submitted ON monitoring.gsc_removal_logs (submitted_at DESC);
```

---

### 10.5 Go Dependencies (Tambah ke `go.mod`)

```bash
go get google.golang.org/api@latest
go get golang.org/x/oauth2@latest
```

---

### 10.6 Environment Variables

```env
# Google Search Console Integration
GSC_SERVICE_ACCOUNT_JSON=/app/secrets/gsc-service-account.json
GSC_SITE_URL=sc-domain:unila.ac.id
GSC_AUTO_REMOVE_THRESHOLD=15
GSC_ENABLED=true
```

---

### 10.7 Module Structure: `apps/google_gsc/`

```
apps/google_gsc/
├── entity.go       # GSCRemovalLog, GSCRemovalRequest struct
├── service.go      # SubmitURLRemoval(), SubmitRecrawl() via Google API
├── repository.go   # INSERT/SELECT monitoring.gsc_removal_logs
└── router.go       # Endpoints: remove, recrawl, logs
```

#### API Endpoints

```
POST /v1/gsc/remove             body: {url, threat_id}  → Submit URL removal ke Google
POST /v1/gsc/recrawl/:threatId                          → Submit recrawl setelah konten bersih
GET  /v1/gsc/logs?threat_id=    query param             → History removal logs
```

#### Auto-trigger dari Crawler

Di `apps/detector/service.go`, setelah `INSERT` ke `detected_threats`:

```go
if threat.ThreatScore >= cfg.GSCAutoRemoveThreshold && cfg.GSCEnabled {
    go gscService.SubmitURLRemoval(ctx, threat.URL)
}
```

---

### 10.8 Limitasi & Catatan

| Hal | Detail |
|-----|--------|
| Durasi removal | ~6 bulan, lalu Google recrawl ulang |
| Apa yang dihapus | Hanya dari **Google Search results**, konten di server tetap ada |
| Quota | 1.000 removal request/hari per property |
| Rate limit | 1.200 query/menit |
| Biaya | **Gratis** (Google Search Console API tidak berbayar) |
| Cakupan | Domain property `unila.ac.id` covers semua `*.unila.ac.id` |

---

## 9. Verification & Testing

1. **Service health**: `GET /health` → DB + Redis status
2. **Site CRUD**: Register Blogger site, verify auto-detect blogId
3. **Blogger sync**: Trigger sync, verify posts cached in blog_posts_cache
4. **Health check**: Trigger check, verify site_checks log
5. **Crawler**: Crawl test site, verify pages logged and threats detected
6. **Detection**: Create page with "slot gacor", verify threat_score >= 5
7. **Public API**: Access `/v1/public/status` without auth
8. **Frontend**: Navigate all dashboard pages, verify data renders
9. **Public page**: Access `/keamanan-web` without login
10. **Kong**: Access via `localhost:9800/webmon-service/v1/health`
