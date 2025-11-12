# ANALISIS & BRAINSTORMING: FITUR PENCARIAN MY-UNILA

## 📋 OVERVIEW

Fitur pencarian terintegrasi untuk My-Unila dengan **7 kategori utama**:

**Kategori Utama:**
- 🎓 **Mahasiswa** - Cari mahasiswa berdasarkan nama, NIM, fakultas, prodi
- 👨‍🏫 **Dosen** - Cari dosen berdasarkan nama, NIDN/NIP, fakultas, jabatan
- 📚 **Program Studi** - Cari program studi berdasarkan nama, jenjang, akreditasi

**Kategori Karya Ilmiah:**
- 🔬 **Penelitian** - Cari penelitian berdasarkan judul atau nama anggota
- 🤝 **Pengabdian** - Cari pengabdian masyarakat berdasarkan judul atau anggota
- 📖 **Publikasi** - Cari publikasi (jurnal, buku, prosiding, HaKI) berdasarkan judul atau penulis

**Kategori Keahlian:**
- 🎯 **Bidang Keilmuan** - Cari dosen berdasarkan bidang keahlian/expertise

Referensi: PDDikti Kemdikbud (https://pddikti.kemdiktisaintek.go.id)

---

## 🎯 REQUIREMENTS ANALYSIS

### 1. FITUR PENCARIAN YANG DIBUTUHKAN

#### A. GLOBAL SEARCH BAR
**Lokasi:** Header/Navbar (semua halaman)
```
┌────────────────────────────────────────────────┐
│  🔍 Cari Dosen, Mahasiswa, atau Program Studi │
│  [Kategori ▼] [━━━━━━━━━━━━━━━━━━━━━] [Cari] │
└────────────────────────────────────────────────┘
```

**Fitur:**
- Auto-suggestion saat mengetik
- Kategori filter (All, Dosen, Mahasiswa, Prodi)
- Debounce input (300ms)
- Fuzzy matching (typo tolerance)
- Highlight matched text

---

#### B. PENCARIAN DOSEN

**Field yang Dicari:**
- ✅ Nama Dosen (full text search)
- ✅ NIDN/NIP
- ✅ Email
- ✅ Fakultas
- ✅ Program Studi
- ✅ Bidang Keahlian
- ✅ Jabatan Fungsional

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Dosen:                           │
│ • Fakultas: [Dropdown]                  │
│ • Program Studi: [Dropdown]             │
│ • Jenjang Pendidikan: [S2/S3]          │
│ • Jabatan: [Asisten Ahli/Lektor/...]   │
│ • Status: [Aktif/Tidak Aktif]          │
└─────────────────────────────────────────┘
```

**Hasil Pencarian:**
```
👨‍🏫 Prof. Dr. Nama Dosen, M.Si.
   NIDN: 0012345678 | Email: dosen@unila.ac.id
   Fakultas Teknik - Teknik Informatika
   Jabatan: Profesor | Bidang: Artificial Intelligence
   [Lihat Profile →]
```

---

#### C. PENCARIAN MAHASISWA

**Field yang Dicari:**
- ✅ Nama Mahasiswa
- ✅ NIM
- ✅ Email
- ✅ Fakultas
- ✅ Program Studi
- ✅ Angkatan

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Mahasiswa:                       │
│ • Fakultas: [Dropdown]                  │
│ • Program Studi: [Dropdown]             │
│ • Angkatan: [2020/2021/2022/...]       │
│ • Status: [Aktif/Cuti/Lulus/DO]        │
│ • Jenjang: [D3/D4/S1/S2/S3]            │
└─────────────────────────────────────────┘
```

**Hasil Pencarian:**
```
🎓 Nama Mahasiswa
   NIM: 1234567890 | Angkatan: 2021
   Fakultas Teknik - Teknik Informatika (S1)
   Status: Aktif
   [Lihat Profile →]
```

---

#### D. PENCARIAN PROGRAM STUDI

**Field yang Dicari:**
- ✅ Nama Program Studi
- ✅ Kode Program Studi
- ✅ Fakultas
- ✅ Jenjang (D3/D4/S1/S2/S3)
- ✅ Akreditasi

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Program Studi:                   │
│ • Fakultas: [Dropdown]                  │
│ • Jenjang: [D3/D4/S1/S2/S3]            │
│ • Akreditasi: [A/B/C/Unggul/...]       │
│ • Status: [Aktif/Tutup]                │
└─────────────────────────────────────────┘
```

**Hasil Pencarian:**
```
📚 Teknik Informatika (S1)
   Kode: 55201 | Akreditasi: A
   Fakultas Teknik
   Status: Aktif | Jumlah Dosen: 25 | Mahasiswa: 450
   [Lihat Detail →]
```

---

#### E. PENCARIAN PENELITIAN

**Field yang Dicari:**
- ✅ Judul Penelitian (full text)
- ✅ Nama Ketua Peneliti
- ✅ Nama Anggota Peneliti
- ✅ Skema Penelitian
- ✅ Tahun Penelitian
- ✅ Bidang Ilmu

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Penelitian:                      │
│ • Tahun: [2020/2021/2022/...]          │
│ • Skema: [Fundamental/Terapan/...]     │
│ • Status: [Berjalan/Selesai]           │
│ • Sumber Dana: [Internal/External]     │
│ • Fakultas: [Dropdown]                  │
└─────────────────────────────────────────┘
```

**Hasil Pencarian:**
```
🔬 Penerapan Machine Learning untuk Deteksi Penyakit
   Tahun: 2023 | Skema: Penelitian Fundamental
   Ketua: Prof. Dr. Nama Dosen, M.Si.
   Anggota: 3 orang (Dr. A, Dr. B, Dr. C)
   Status: Berjalan | Dana: Rp 50.000.000
   [Lihat Detail →]
```

---

#### F. PENCARIAN PENGABDIAN MASYARAKAT

**Field yang Dicari:**
- ✅ Judul Pengabdian (full text)
- ✅ Nama Ketua Pengabdian
- ✅ Nama Anggota Pengabdian
- ✅ Lokasi Pengabdian
- ✅ Tahun Pengabdian
- ✅ Skema Pengabdian

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Pengabdian:                      │
│ • Tahun: [2020/2021/2022/...]          │
│ • Skema: [Reguler/Kemitraan/...]       │
│ • Status: [Berjalan/Selesai]           │
│ • Lokasi: [Provinsi/Kabupaten]         │
│ • Fakultas: [Dropdown]                  │
└─────────────────────────────────────────┘
```

**Hasil Pencarian:**
```
🤝 Pelatihan Digital Marketing untuk UMKM Lampung
   Tahun: 2023 | Skema: Pengabdian Kemitraan
   Ketua: Dr. Nama Dosen, M.Kom.
   Anggota: 2 orang (Dr. X, Dr. Y)
   Lokasi: Bandar Lampung, Lampung
   Status: Selesai
   [Lihat Detail →]
```

---

#### G. PENCARIAN PUBLIKASI

**Field yang Dicari:**
- ✅ Judul Publikasi (jurnal, buku, prosiding, HaKI)
- ✅ Nama Penulis/Author
- ✅ Nama Jurnal/Penerbit
- ✅ Tahun Publikasi
- ✅ Jenis Publikasi (Jurnal/Buku/Prosiding/HaKI)
- ✅ Quartile (Q1/Q2/Q3/Q4 untuk jurnal)

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Publikasi:                       │
│ • Jenis: [Jurnal/Buku/Prosiding/HaKI]  │
│ • Tahun: [2020/2021/2022/...]          │
│ • Quartile: [Q1/Q2/Q3/Q4]              │
│ • Jenis Jurnal: [Nasional/Internasional]│
│ • Fakultas: [Dropdown]                  │
│ • Penulis: [Search nama dosen]          │
└─────────────────────────────────────────┘
```

**Hasil Pencarian (Jurnal):**
```
📖 Deep Learning for Image Classification
   Jenis: Jurnal Internasional | Tahun: 2023
   Jurnal: IEEE Transactions on AI | Quartile: Q1
   Penulis: Dr. A, Dr. B, Dr. C (3 penulis)
   DOI: 10.1109/xxx | ISSN: 1234-5678
   [Lihat Detail →]
```

**Hasil Pencarian (Buku):**
```
📚 Panduan Praktis Pemrograman Python
   Jenis: Buku | Tahun: 2022
   Penerbit: Gramedia
   Penulis: Prof. Dr. Nama, M.T.
   ISBN: 978-602-xxxx-xx-x
   [Lihat Detail →]
```

**Hasil Pencarian (HaKI):**
```
⚖️ Sistem Monitoring IoT Berbasis Cloud
   Jenis: Hak Cipta | Tahun: 2023
   Nomor Pendaftaran: EC00202312345
   Pencipta: Dr. A, Dr. B
   [Lihat Detail →]
```

---

#### H. PENCARIAN DOSEN BY BIDANG KEILMUAN

**Use Case:**
> "Saya ingin mencari dosen yang ahli di bidang **Sistem Informasi**"
> "Cari dosen yang expertise-nya **Artificial Intelligence**"

**Field yang Dicari:**
- ✅ Nama Bidang Ilmu/Keahlian
- ✅ Kode Bidang Ilmu
- ✅ Kategori Bidang (Ilmu Komputer, Teknik, dll)
- ✅ Level Keahlian (Utama/Pendukung)

**Filter Advanced:**
```
┌─────────────────────────────────────────┐
│ Filter Bidang Keilmuan:                 │
│ • Kategori: [Teknik/Sains/Sosial/...]  │
│ • Fakultas: [Dropdown]                  │
│ • Jenjang Dosen: [S2/S3]               │
│ • Jabatan: [Lektor/Profesor/...]       │
└─────────────────────────────────────────┘
```

**Hasil Pencarian:**
```
🎯 Bidang Keilmuan: Sistem Informasi

📋 Daftar Dosen (15 dosen):

1. 👨‍🏫 Prof. Dr. Ahmad Yani, M.Kom.
   NIDN: 0012345678 | Jabatan: Profesor
   Fakultas: Teknik | Prodi: Teknik Informatika
   Keahlian Tambahan: Database, Machine Learning
   [Lihat Profile →]

2. 👨‍🏫 Dr. Budi Santoso, M.Si.
   NIDN: 0023456789 | Jabatan: Lektor Kepala
   Fakultas: Teknik | Prodi: Sistem Informasi
   Keahlian Tambahan: Business Intelligence
   [Lihat Profile →]

... (13 more)

[Load More Results]
```

**Advanced Search Example:**
```
Query: "cari dosen ahli artificial intelligence yang profesor"

Filter Applied:
- Bidang Keilmuan: "Artificial Intelligence"
- Jabatan: "Profesor"

Results: 5 dosen yang memenuhi kriteria
```

---

### 2. ESTIMASI DATA VOLUME

**Current Data Estimation:**
```
KATEGORI UTAMA:
- Dosen:          ~2,000 records
- Mahasiswa:      ~25,000 records
- Program Studi:  ~70 records

KARYA ILMIAH:
- Penelitian:     ~5,000 records
- Pengabdian:     ~3,000 records
- Publikasi:      ~8,000 records
  ├─ Jurnal:      ~4,000
  ├─ Buku:        ~1,500
  ├─ Prosiding:   ~2,000
  └─ HaKI:        ~500

KEAHLIAN:
- Bidang Ilmu:    ~150 unique bidang
  (mapping to ~2,000 dosen)
────────────────────────────────────────
TOTAL RECORDS:    ~43,000+ records
TOTAL SEARCH DOCS: ~45,000+ (with relations)
```

**Growth Projection (5 tahun):**
```
- Dosen:          ~2,500 records (+25%)
- Mahasiswa:      ~35,000 records (+40%)
- Program Studi:  ~80 records (+15%)
- Penelitian:     ~8,000 records (+60%)
- Pengabdian:     ~5,000 records (+65%)
- Publikasi:      ~15,000 records (+90%)
- Bidang Ilmu:    ~200 unique (+35%)
────────────────────────────────────────
TOTAL:            ~65,000+ records
```

**Search Index Size Estimation:**
```
MeiliSearch Index Sizes (estimated):
- dosen:          ~20MB (2K records × ~10KB/doc)
- mahasiswa:      ~100MB (25K × ~4KB)
- prodi:          ~1MB (70 × ~15KB)
- penelitian:     ~50MB (5K × ~10KB)
- pengabdian:     ~30MB (3K × ~10KB)
- publikasi:      ~80MB (8K × ~10KB)
- bidang_ilmu:    ~2MB (150 × ~15KB)
────────────────────────────────────
TOTAL INDEX SIZE: ~280MB (compressed)
TOTAL WITH OVERHEAD: ~500MB - 1GB
```

---

## 🔍 TECHNOLOGY COMPARISON

### OPTION 1: ELASTICSEARCH ⚡

#### Pros ✅
1. **Full-Text Search Excellence**
   - Inverted index untuk search super cepat
   - Fuzzy matching & typo tolerance built-in
   - Relevance scoring otomatis
   - Highlight matched text

2. **Advanced Features**
   - Auto-suggestion (completion suggester)
   - Faceted search (filter aggregations)
   - Geo-search (jika butuh map)
   - Multi-language support

3. **Scalability**
   - Horizontal scaling mudah
   - Distributed architecture
   - Handle millions of records

4. **Analytics & Insights**
   - Search analytics (popular queries)
   - Click-through rate tracking
   - User behavior analysis

#### Cons ❌
1. **Infrastructure Overhead**
   - Butuh 1 container baru (Elasticsearch)
   - Memory intensive (min 2GB RAM)
   - Storage lebih besar (index overhead)
   - Maintenance lebih kompleks

2. **Learning Curve**
   - Perlu belajar Elasticsearch DSL
   - Index mapping configuration
   - Cluster management

3. **Cost**
   - Resource requirements tinggi
   - Monitoring & alerting
   - Backup strategy

4. **Complexity**
   - Data synchronization (SQL → Elasticsearch)
   - Eventual consistency handling
   - Index rebuild strategy

**Best For:**
- Data > 100,000 records
- Complex search requirements
- Real-time analytics needed
- Budget & resources available

---

### OPTION 2: SQL FULL-TEXT SEARCH (SQL Server) 🗄️

#### Pros ✅
1. **Native Integration**
   - Sudah built-in di SQL Server
   - No additional infrastructure
   - Gunakan existing database
   - Zero learning curve (SQL syntax)

2. **Simplicity**
   - No data sync needed
   - Single source of truth
   - ACID compliance
   - Transactional consistency

3. **Cost Effective**
   - No extra container
   - No additional memory
   - No additional license

4. **Features**
   - Full-text indexing
   - CONTAINS, FREETEXT queries
   - Proximity search
   - Weighted search

#### Cons ❌
1. **Performance Limitations**
   - Slower than Elasticsearch (untuk data besar)
   - Lock contention pada high concurrency
   - Index rebuild impact

2. **Limited Advanced Features**
   - No auto-suggestion built-in
   - Basic fuzzy matching
   - No relevance tuning
   - Limited analytics

3. **Scalability**
   - Vertical scaling only (upgrade server)
   - Not distributed
   - Index size limitations

**Best For:**
- Data < 100,000 records
- Simple search requirements
- Low budget
- Prefer simplicity over features

---

### OPTION 3: POSTGRESQL FULL-TEXT SEARCH 🐘

*Note: Anda pakai SQL Server, jadi ini untuk reference saja*

#### Pros ✅
- Free & open source
- Better full-text than SQL Server
- Good performance (GIN/GiST indexes)
- Built-in similarity search

#### Cons ❌
- Butuh migrasi dari SQL Server
- Masih tidak sekuat Elasticsearch
- Limited advanced features

---

### OPTION 4: GO + BLEVE (Pure Go Search) 🔵

#### Pros ✅
1. **Pure Go Solution**
   - No external dependencies
   - Embedded search library
   - Low memory footprint
   - Fast & efficient

2. **Easy Integration**
   - Integrate langsung di Sister Service (Go)
   - No separate container
   - File-based index

3. **Features**
   - Full-text search
   - Faceted search
   - Fuzzy matching
   - Custom analyzers

#### Cons ❌
1. **Not as Powerful**
   - Tidak sekuat Elasticsearch
   - Limited distributed capabilities
   - Manual optimization needed

2. **Learning Curve**
   - Perlu setup indexing
   - Manual relevance tuning

**Best For:**
- Ingin embedded solution
- No external dependencies
- Medium data size

---

### OPTION 5: MEILISEARCH 🚀

*Emerging alternative to Elasticsearch*

#### Pros ✅
1. **Blazing Fast**
   - Rust-based (super fast)
   - Instant search (<50ms)
   - Typo-tolerance excellent

2. **Developer Friendly**
   - Simple API (REST)
   - Easy to setup
   - Great documentation
   - Beautiful admin UI

3. **Lightweight**
   - Low memory (~500MB)
   - Small footprint
   - Docker ready

4. **Features**
   - Auto-suggestion
   - Faceted search
   - Geo-search
   - Ranking rules

#### Cons ❌
1. **Relatively New**
   - Smaller community
   - Less mature than Elasticsearch
   - Limited enterprise features

2. **Not as Feature-Rich**
   - No analytics built-in
   - Limited aggregations

**Best For:**
- Modern tech stack
- Want Elasticsearch features without complexity
- Good balance performance vs resources

---

## 📊 DECISION MATRIX

| Kriteria | SQL Server FTS | Elasticsearch | Bleve (Go) | MeiliSearch |
|----------|----------------|---------------|------------|-------------|
| **Setup Complexity** | ⭐⭐⭐⭐⭐ (1h) | ⭐⭐ (1 day) | ⭐⭐⭐⭐ (4h) | ⭐⭐⭐⭐ (2h) |
| **Performance** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Scalability** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Features** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost (Resources)** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Maintenance** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Data Sync** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Typo Tolerance** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Auto-suggestion** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Relevance Tuning** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Community Support** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **TOTAL SCORE** | **42/60** | **48/60** | **42/60** | **50/60** |

---

## 💡 RECOMMENDATION

### 🏆 **RECOMMENDED: MEILISEARCH**

**Alasan:**
1. ✅ **Best Balance** - Performa hampir setara Elasticsearch tapi lebih ringan
2. ✅ **Easy Setup** - Setup < 2 jam, tidak perlu expert Elasticsearch
3. ✅ **Low Resources** - Hanya butuh ~500MB RAM vs Elasticsearch 2GB+
4. ✅ **Great UX** - Auto-suggestion, typo-tolerance excellent
5. ✅ **Modern** - Admin UI built-in, REST API sederhana
6. ✅ **Cost Effective** - Hemat resource tanpa sacrificing features

**Perfect for My-Unila karena:**
- Data volume ~27K records (sweet spot untuk MeiliSearch)
- Butuh UX modern (auto-suggestion, instant search)
- Budget resource terbatas
- Tim tidak perlu jadi Elasticsearch expert

---

### 🥈 **ALTERNATIVE 1: SQL SERVER FULL-TEXT SEARCH**

**Kapan Pilih Ini:**
- ✅ Budget sangat terbatas (no extra container)
- ✅ Data < 50K records
- ✅ Search requirements sederhana
- ✅ Prefer simplicity & stability

**Trade-off:**
- ❌ No auto-suggestion (harus custom buat)
- ❌ Typo tolerance terbatas
- ❌ Performa search lebih lambat (tapi masih acceptable)

---

### 🥉 **ALTERNATIVE 2: ELASTICSEARCH**

**Kapan Pilih Ini:**
- ✅ Budget resources cukup (4GB+ RAM available)
- ✅ Data akan grow > 100K records
- ✅ Butuh advanced analytics
- ✅ Tim ada yang expert Elasticsearch
- ✅ Production-critical search features

**Trade-off:**
- ❌ Setup kompleks
- ❌ Maintenance overhead
- ❌ Data sync complexity

---

## 🏗️ PROPOSED ARCHITECTURE

### ARCHITECTURE 1: MEILISEARCH (RECOMMENDED)

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│          (Next.js - Search Components)              │
└────────────────┬────────────────────────────────────┘
                 │ HTTP Request
                 ↓
┌─────────────────────────────────────────────────────┐
│              KONG API GATEWAY                       │
│         (Route: /search-service/*)                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│           SEARCH SERVICE (NEW!)                     │
│  • Language: Go (Fiber) atau Laravel (PHP)         │
│  • Features:                                        │
│    - Universal search endpoint                      │
│    - Category filtering                             │
│    - Auto-suggestion                                │
│    - Search analytics                               │
│    - Rate limiting                                  │
└────┬─────────────────────────────┬──────────────────┘
     │                             │
     │ Index Data                  │ Query
     ↓                             ↓
┌─────────────────┐     ┌────────────────────────────┐
│  SQL SERVER DB  │     │    MEILISEARCH ENGINE      │
│  (Source Data)  │     │  • Docker Container        │
│                 │     │  • Port: 7700              │
│  • pdut         │     │  • Index: dosen           │
│  • pdut_dev     │     │  • Index: mahasiswa       │
│                 │     │  • Index: prodi           │
└─────────────────┘     └────────────────────────────┘
     │                             ▲
     │                             │
     └──────── Sync Worker ────────┘
              (Scheduler)
```

**Data Flow:**

1. **Indexing (Background):**
   ```
   SQL Server → Sync Worker → MeiliSearch Index
   (Every 1 hour or triggered manually)
   ```

2. **Search Query:**
   ```
   User → Frontend → Kong → Search Service → MeiliSearch → Results
   ```

3. **Data Update:**
   ```
   Admin Update Data → SQL Server → Trigger Sync → MeiliSearch
   ```

---

### ARCHITECTURE 2: SQL SERVER FTS (SIMPLE)

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│          (Next.js - Search Components)              │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│              KONG API GATEWAY                       │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│         DASHBOARD SERVICE (Enhanced)                │
│  • Add search endpoints                             │
│  • Use SQL Server CONTAINS/FREETEXT                │
│  • Cache results in Redis                           │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│              SQL SERVER DATABASE                    │
│  • Full-Text Catalog: ft_myunila                   │
│  • Full-Text Index: ft_dosen                       │
│  • Full-Text Index: ft_mahasiswa                   │
│  • Full-Text Index: ft_prodi                       │
└─────────────────────────────────────────────────────┘
```

**Pros:**
- ✅ No new service
- ✅ No new container
- ✅ Langsung pakai existing DB

**Cons:**
- ❌ Performance terbatas
- ❌ No auto-suggestion
- ❌ Manual optimization

---

## 🚀 IMPLEMENTATION ROADMAP

### PHASE 1: MVP (2-3 weeks)

**Week 1: Setup & Infrastructure**
- [ ] Setup MeiliSearch container
- [ ] Create Search Service (Go/Laravel)
- [ ] Setup Kong routes
- [ ] Create database indexes

**Week 2: Core Search Features**
- [ ] Implement Dosen search
- [ ] Implement Mahasiswa search
- [ ] Implement Prodi search
- [ ] Data sync worker
- [ ] Basic filters

**Week 3: UI & Testing**
- [ ] Frontend search component
- [ ] Auto-suggestion UI
- [ ] Filter UI
- [ ] Testing & bug fixes

### PHASE 2: Enhancement (2 weeks)

**Week 4: Advanced Features**
- [ ] Advanced filters
- [ ] Search analytics
- [ ] Highlight matched text
- [ ] Pagination optimization

**Week 5: Performance & Polish**
- [ ] Search performance tuning
- [ ] Relevance optimization
- [ ] UI/UX improvements
- [ ] Documentation

### PHASE 3: Monitoring (1 week)

**Week 6: Observability**
- [ ] Search metrics (Grafana)
- [ ] Popular queries tracking
- [ ] Error monitoring
- [ ] Performance alerts

---

## 📝 IMPLEMENTATION DETAILS

### 1. MEILISEARCH DOCKER SETUP

```yaml
# docker-compose.yml
services:
  meilisearch:
    image: getmeili/meilisearch:v1.6
    container_name: myunila-meilisearch
    restart: unless-stopped
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
      - MEILI_ENV=production
      - MEILI_DB_PATH=/data.ms
    volumes:
      - meilisearch_data:/data.ms
    networks:
      - myunila-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7700/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  meilisearch_data:
```

---

### 2. INDEX SCHEMA

#### A. Dosen Index
```json
{
  "uid": "dosen",
  "primaryKey": "id_sdm",
  "searchableAttributes": [
    "nama_lengkap",
    "nidn",
    "nip",
    "email",
    "fakultas",
    "program_studi",
    "bidang_keahlian",
    "jabatan_fungsional"
  ],
  "filterableAttributes": [
    "fakultas",
    "program_studi",
    "jenjang_pendidikan",
    "jabatan_fungsional",
    "status_aktif"
  ],
  "sortableAttributes": [
    "nama_lengkap",
    "nidn"
  ],
  "displayedAttributes": [
    "id_sdm",
    "nama_lengkap",
    "nidn",
    "nip",
    "email",
    "foto_url",
    "fakultas",
    "program_studi",
    "jabatan_fungsional"
  ],
  "rankingRules": [
    "words",
    "typo",
    "proximity",
    "attribute",
    "sort",
    "exactness"
  ]
}
```

#### B. Mahasiswa Index
```json
{
  "uid": "mahasiswa",
  "primaryKey": "nim",
  "searchableAttributes": [
    "nama_lengkap",
    "nim",
    "email",
    "fakultas",
    "program_studi",
    "angkatan"
  ],
  "filterableAttributes": [
    "fakultas",
    "program_studi",
    "angkatan",
    "jenjang",
    "status"
  ],
  "sortableAttributes": [
    "nama_lengkap",
    "nim",
    "angkatan"
  ]
}
```

#### C. Program Studi Index
```json
{
  "uid": "program_studi",
  "primaryKey": "id_prodi",
  "searchableAttributes": [
    "nama_prodi",
    "kode_prodi",
    "fakultas",
    "jenjang"
  ],
  "filterableAttributes": [
    "fakultas",
    "jenjang",
    "akreditasi",
    "status"
  ]
}
```

---

### 3. API ENDPOINTS

```
Search Service Endpoints:

# Universal Search
GET  /api/v1/search?q={query}&category={all|dosen|mahasiswa|prodi}&limit=10

# Category-specific Search
GET  /api/v1/search/dosen?q={query}&fakultas={id}&prodi={id}
GET  /api/v1/search/mahasiswa?q={query}&fakultas={id}&angkatan={year}
GET  /api/v1/search/prodi?q={query}&jenjang={level}

# Auto-suggestion
GET  /api/v1/search/suggest?q={query}&category={category}

# Search Analytics (Protected)
GET  /api/v1/search/analytics/popular-queries
GET  /api/v1/search/analytics/stats

# Admin: Re-index
POST /api/v1/search/reindex/{category}
POST /api/v1/search/reindex/all
```

---

### 4. SYNC WORKER STRATEGY

**Option A: Scheduler-based (Recommended)**
```go
// Sister Service Scheduler
// Every 1 hour: Sync data to MeiliSearch

func SyncToMeiliSearch() {
    // 1. Fetch data from SQL Server
    dosen := fetchDosenFromDB()
    mahasiswa := fetchMahasiswaFromDB()
    prodi := fetchProdiFromDB()

    // 2. Transform data
    dosenDocs := transformDosenForSearch(dosen)

    // 3. Index to MeiliSearch
    meilisearch.Index("dosen").AddDocuments(dosenDocs)
    meilisearch.Index("mahasiswa").AddDocuments(mahasiswaDocs)
    meilisearch.Index("prodi").AddDocuments(prodiDocs)
}
```

**Option B: Trigger-based (Real-time)**
```sql
-- SQL Server Trigger
-- Trigger re-index when data changes

CREATE TRIGGER trg_dosen_update
ON pdrd.sdm
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    -- Call API to re-index specific record
    EXEC sp_http_request
        @url = 'http://search-service:8084/api/v1/search/reindex/dosen',
        @method = 'POST'
END
```

**Option C: CDC (Change Data Capture)**
- Real-time sync menggunakan SQL Server CDC
- Capture changes → Queue → Process → Index

---

### 5. FRONTEND COMPONENT

```tsx
// components/GlobalSearch.tsx
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (q: string) => {
    const res = await fetch(
      `/api/search/suggest?q=${q}&category=${category}`
    );
    const data = await res.json();
    setSuggestions(data.hits);
  };

  const handleSearch = async () => {
    const res = await fetch(
      `/api/search?q=${query}&category=${category}`
    );
    const data = await res.json();
    setResults(data.hits);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari Dosen, Mahasiswa, atau Program Studi..."
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">Semua</option>
        <option value="dosen">Dosen</option>
        <option value="mahasiswa">Mahasiswa</option>
        <option value="prodi">Program Studi</option>
      </select>
      <button onClick={handleSearch}>Cari</button>

      {/* Auto-suggestion dropdown */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((item) => (
            <div key={item.id} onClick={() => selectSuggestion(item)}>
              {highlightMatch(item.name, query)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 💰 COST ANALYSIS

### MEILISEARCH (Recommended)

**Infrastructure:**
- Container: Free (Docker)
- Memory: 500MB - 1GB
- Storage: ~2GB (indexes)
- CPU: 0.5 core

**Development Time:**
- Setup: 4 hours
- Implementation: 2 weeks
- Testing: 1 week

**Total Cost:** ~$0 (using existing server)

---

### ELASTICSEARCH

**Infrastructure:**
- Container: Free (Docker)
- Memory: 2GB - 4GB (minimum)
- Storage: ~5GB (indexes + overhead)
- CPU: 1 core

**Development Time:**
- Setup: 1 day (learning curve)
- Implementation: 3 weeks
- Testing: 1 week

**Ongoing:**
- Monitoring & maintenance overhead

**Total Cost:** ~$0 (infrastructure), higher dev time

---

### SQL SERVER FTS

**Infrastructure:**
- No additional cost (existing DB)
- Memory: included in DB
- Storage: ~500MB (FT catalogs)

**Development Time:**
- Setup: 2 hours (enable FTS)
- Implementation: 1 week
- Testing: 3 days

**Total Cost:** ~$0 (cheapest option)

---

## 🎯 FINAL RECOMMENDATION SUMMARY

### ✅ **GO WITH: MEILISEARCH**

**Reasoning:**
1. **Perfect fit untuk My-Unila:**
   - Data volume (27K) dalam sweet spot MeiliSearch
   - Modern UX (instant search, typo-tolerance)
   - Low resource footprint (~500MB)

2. **Best ROI:**
   - Setup cepat (< 1 day)
   - Performance excellent
   - Features lengkap (auto-suggestion, facets, etc)
   - Maintenance minimal

3. **Future-proof:**
   - Scalable sampai 100K+ records
   - Active development
   - Growing community

4. **Better than SQL FTS:**
   - 10x faster search response
   - Better UX (auto-suggestion)
   - Better relevance scoring

5. **Better than Elasticsearch:**
   - 75% lebih ringan (RAM)
   - Setup 80% lebih cepat
   - No expert needed
   - Same UX quality

---

## 📚 RESOURCES & LEARNING

**MeiliSearch:**
- Docs: https://www.meilisearch.com/docs
- Go SDK: https://github.com/meilisearch/meilisearch-go
- PHP SDK: https://github.com/meilisearch/meilisearch-php

**SQL Server FTS:**
- Docs: https://learn.microsoft.com/en-us/sql/relational-databases/search/full-text-search

**Elasticsearch:**
- Docs: https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html

---

## 🤔 QUESTIONS TO CONSIDER

1. **Budget:** Apakah ada budget untuk additional container?
   - Yes → MeiliSearch
   - No → SQL Server FTS

2. **Timeline:** Kapan fitur ini harus live?
   - < 2 weeks → SQL Server FTS
   - 2-4 weeks → MeiliSearch
   - > 1 month → Elasticsearch (jika tim perlu belajar)

3. **Performance Priority:** Seberapa penting search speed?
   - Critical (instant) → MeiliSearch or Elasticsearch
   - Important (< 500ms) → SQL Server FTS acceptable

4. **Future Growth:** Apakah data akan grow signifikan?
   - Yes (> 100K) → Elasticsearch
   - Maybe (50K-100K) → MeiliSearch
   - No (< 50K) → SQL Server FTS

5. **Team Skill:** Apakah ada yang familiar dengan search engines?
   - Yes (Elasticsearch) → Elasticsearch
   - No → MeiliSearch (easier)
   - Prefer SQL → SQL Server FTS

---

## 🏁 NEXT STEPS

**If choosing MeiliSearch:**
1. [ ] Review & approve architecture
2. [ ] Setup MeiliSearch container
3. [ ] Create Search Service skeleton
4. [ ] Define index schemas
5. [ ] Implement sync worker
6. [ ] Build frontend components
7. [ ] Testing & optimization

**If choosing SQL Server FTS:**
1. [ ] Review & approve simplified architecture
2. [ ] Enable Full-Text Search on SQL Server
3. [ ] Create FT catalogs & indexes
4. [ ] Add search endpoints to Dashboard Service
5. [ ] Build frontend components
6. [ ] Testing & optimization

---

**Silakan diskusikan pilihan ini dan saya siap implementasi! 🚀**
