
export const dummySites = [
    {
        id: "1",
        url: "https://fmipa.unila.ac.id",
        name: "FMIPA Unila",
        platform: "WordPress",
        status: "active", // active, inactive, compromised, maintenance
        fakultas: "FMIPA",
        last_sync: "2024-02-18T10:00:00Z",
        health: {
            is_online: true,
            response_time: 120, // ms
            ssl_valid: true,
            ssl_expiry: "2024-12-31",
        },
    },
    {
        id: "2",
        url: "https://fisip.unila.ac.id",
        name: "FISIP Unila",
        platform: "Blogger",
        status: "active",
        fakultas: "FISIP",
        last_sync: "2024-02-18T09:30:00Z",
        health: {
            is_online: true,
            response_time: 250,
            ssl_valid: true,
            ssl_expiry: "2024-11-20",
        },
    },
    {
        id: "3",
        url: "https://himsak.unila.ac.id",
        name: "Himpunan Mahasiswa Sakti",
        platform: "Custom",
        status: "compromised",
        fakultas: "UKM",
        last_sync: "2024-02-17T15:00:00Z",
        health: {
            is_online: true,
            response_time: 400,
            ssl_valid: false,
            ssl_expiry: "2023-01-01",
        },
    },
    {
        id: "4",
        url: "https://kkn.unila.ac.id",
        name: "KKN Unila",
        platform: "Joomla",
        status: "maintenance",
        fakultas: "LPPM",
        last_sync: "2024-02-10T11:00:00Z",
        health: {
            is_online: false,
            response_time: 0,
            ssl_valid: true,
            ssl_expiry: "2025-06-15",
        },
    },
];

export const dummyCrawlJobs = [
    {
        id: 1,
        name: "Daily Scan - All Sites",
        target_scope: "all", // all, specific
        cron_expression: "0 0 * * *",
        last_run: "2024-02-17T00:00:00Z",
        next_run: "2024-02-18T00:00:00Z",
        status: "active", // active, inactive
        avg_duration: "45m",
    },
    {
        id: 2,
        name: "Hourly Check - High Risk",
        target_scope: "specific",
        cron_expression: "0 * * * *",
        last_run: "2024-02-18T10:00:00Z",
        next_run: "2024-02-18T11:00:00Z",
        status: "active",
        avg_duration: "5m",
    },
];

export const dummySessions = [
    {
        id: "sess-001",
        job_name: "Daily Scan - All Sites",
        status: "completed", // queued, running, completed, failed
        started_at: "2024-02-18T08:00:00Z",
        completed_at: "2024-02-18T08:45:00Z",
        sites_scanned: 150,
        pages_scanned: 4500,
        threats_found: 3,
    },
    {
        id: "sess-002",
        job_name: "Manual Scan - FISIP",
        status: "running",
        started_at: "2024-02-18T10:15:00Z",
        completed_at: null,
        sites_scanned: 1,
        pages_scanned: 56,
        threats_found: 0,
    },
    {
        id: "sess-003",
        job_name: "Hourly Check - High Risk",
        status: "failed",
        started_at: "2024-02-18T09:00:00Z",
        completed_at: "2024-02-18T09:01:00Z",
        sites_scanned: 0,
        pages_scanned: 0,
        threats_found: 0,
        error: "Connection timeout",
    },
];

export const dummyThreats = [
    {
        id: "t-001",
        site_name: "Himpunan Mahasiswa Sakti",
        url: "https://himsak.unila.ac.id/news/juara-lomba",
        threat_score: 9,
        status: "new", // new, confirmed, false_positive, resolved
        detected_at: "2024-02-18T08:12:00Z",
        matched_keywords: [
            { keyword: "slot gacor", category: "slot", weight: 9 },
        ],
    },
    {
        id: "t-002",
        site_name: "Blog Dosen X",
        url: "https://staff.unila.ac.id/dosenx/2023/01/materi",
        threat_score: 7,
        status: "confirmed",
        detected_at: "2024-02-17T14:30:00Z",
        matched_keywords: [
            { keyword: "bandar togel", category: "togel", weight: 9 },
        ],
    },
    {
        id: "t-003",
        site_name: "Portal Unit Y",
        url: "https://unity.unila.ac.id/forum",
        threat_score: 5,
        status: "resolved",
        detected_at: "2024-02-15T09:00:00Z",
        matched_keywords: [
            { keyword: "poker online", category: "poker", weight: 7 },
        ],
    },
];

export const dummyKeywords = [
    { id: 1, keyword: "slot gacor", category: "slot", weight: 9, is_regex: false, is_active: true },
    { id: 2, keyword: "togel online", category: "togel", weight: 9, is_regex: false, is_active: true },
    { id: 3, keyword: "slot\\s*(deposit|dana)", category: "slot", weight: 8, is_regex: true, is_active: true },
    { id: 4, keyword: "casino", category: "casino", weight: 7, is_regex: false, is_active: true },
    { id: 5, keyword: "poker", category: "poker", weight: 7, is_regex: false, is_active: false },
];
