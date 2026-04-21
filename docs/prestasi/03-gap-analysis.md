# Gap Analysis — SIMKATMAWA vs Existing

Mapping tiap field yang SIMKATMAWA minta dengan apa yang ada di database existing. Gap → ada / tidak ada di tabel lokal.

---

## Tabel mapping — Prestasi Mandiri

| SIMKATMAWA field | Existing `pdrd.prestasi` | Gap | Keputusan |
|---|---|---|---|
| `level` (KAB/PROV/NAS/INT) | `id_tkt_prestasi` (8 kode) | Partial — perlu mapping 1:1 + reject Sekolah/Kecamatan/Regional/Lainnya | Kolom baru `level_simkatmawa` |
| `kategori` (RISNOV..MINAT) | `id_jenis_prestasi` (Sains/Seni/Olahraga/Lain) | Mismatch — kode beda total | Tabel ref baru `sp_kategori` |
| `lomba` | `nm_prestasi` (160) | Panjang mungkin cukup, semantik sama | Kolom baru `nm_lomba` |
| `cabang` | — | ❌ tidak ada | Kolom baru `cabang` |
| `penyelenggara` | `penyelenggara` (100) | OK | Kolom baru `penyelenggara` |
| `peringkat` (JUARA1..PESERTA) | `peringkat` numeric(1) | Mismatch — format beda | Kolom baru `peringkat_simkatmawa` |
| `jumlah_unit_peserta` | — | ❌ tidak ada | Kolom baru `jumlah_unit_peserta` int |
| `kelompok_prestasi` (INDIVIDU/KELOMPOK) | — | ❌ tidak ada | Kolom baru `kelompok_prestasi` |
| `bentuk` (DARING/LURING) | — | ❌ tidak ada | Kolom baru `bentuk` |
| `url_peserta` | — | ❌ tidak ada | Kolom baru |
| `url_sertifikat` | — | ❌ tidak ada | Kolom baru |
| `tgl_sertifikat` | — | ❌ tidak ada | Kolom baru |
| `url_foto_upp` | — | ❌ tidak ada | Kolom baru |
| `url_dokumen_undangan` | — | ❌ tidak ada | Kolom baru |
| `keterangan` | — | ❌ tidak ada | Kolom baru `keterangan` text |
| `mahasiswa[]` (array, NIM+nama) | `id_pd` (single) | Mismatch — 1:N vs 1:1 | Tabel child `sp_peserta_mhs` |
| `dosen[]` (array, NUPTK+nama+url_surat_tugas) | — | ❌ tidak ada | Tabel child `sp_peserta_dosen` |

---

## Tabel mapping — Sertifikasi

Subset dari prestasi-mandiri. Field unik:
- `nama` (bukan `lomba`) — beda naming tapi semantik mirip
- Tidak ada: kategori, peringkat, cabang, kelompok, bentuk, jumlah_unit_peserta

---

## Tabel mapping — Rekognisi

Sama seperti sertifikasi + `jenis` (SERKOM..PKD, 14 kode).

---

## Rangkuman gap

| # | Kategori gap | Implikasi |
|---|---|---|
| A | Enum berbeda (kategori, peringkat, level, bentuk, kelompok, jenis rekognisi) | Butuh 6 tabel referensi baru + seeder |
| B | Field baru (cabang, jumlah_unit_peserta, URL dokumen, tgl_sertifikat, keterangan) | Butuh ~10 kolom baru per tabel utama |
| C | Multi-mahasiswa per prestasi | Butuh tabel child `sp_peserta_mhs` |
| D | Dosen pembimbing/pendamping | Butuh tabel child `sp_peserta_dosen` |
| E | Tidak ada sertifikasi/rekognisi mahasiswa di schema existing | 2 tabel baru utuh |
| F | Tidak ada tracking sync ke SIMKATMAWA (id, status, response) | Butuh kolom tracking atau tabel log |
| G | URL publik untuk file | Butuh storage policy (§09) |

---

## Kenapa tidak ALTER `pdrd.prestasi` saja

Tiga alasan kuat:

1. **Domain berbeda** — `pdrd.prestasi` adalah entity PDDIKTI feeder (sudah ada 751 rows + sync service). SIMKATMAWA adalah laporan kemahasiswaan. Mencampur 2 domain dalam 1 tabel bikin:
   - ETL feeder bisa accidentally overwrite field SIMKATMAWA (atau sebaliknya)
   - Query tidak pernah bersih (WHERE source = 'feeder' / 'simkatmawa' di setiap query)
   - Ownership tidak jelas
2. **Multi-mahasiswa** — kalau `pdrd.prestasi.id_pd` jadi nullable dan tambah child table, kita merusak kontrak feeder yang selalu expect single `id_pd`.
3. **Performance & isolation** — SQL Server pdut shared oleh banyak service. Nambah ~15 kolom + child table di `pdrd.prestasi` efek ke semua konsumer.

---

## Kenapa tidak schema baru di SQL Server pdut

1. Migration di SQL Server pdut butuh approval DBA + CLAUDE.md menyebut "shared production db — JANGAN jalankan migration destructive".
2. SIMBAK precedent: punya PostgreSQL sendiri dengan schema `ref`, `layanan`, `batch`, `log`. Pola ini cocok untuk SI-Prestasi juga (stateful, write-heavy di SIMBAK/SI-Prestasi).
3. PostgreSQL lebih friendly untuk JSON/JSONB (useful untuk cache payload SIMKATMAWA, tracking log).
4. Data master (mahasiswa NIM, dosen NUPTK/NIDN) tetap di SQL Server — SI-Prestasi query cross-DB pakai pattern SIMBAK (`PdutRepository`).

**Keputusan:** PostgreSQL database baru `si_prestasi`, lookup referensi mahasiswa/dosen via pdut SQL Server. DDL di `04-proposed-schema-postgres.md`.

---

## Mapping mahasiswa / dosen ke data master

| Butuh di SIMKATMAWA | Master data di Unila | Cara ambil |
|---|---|---|
| `mahasiswa[].nim` | `siakadu.peserta_didik.nim` | Query by NIM |
| `mahasiswa[].nama` | `siakadu.peserta_didik.nm_pd` | Ikut query |
| `dosen[].nuptk` | `ref.sdm.nuptk` atau `ref.sdm.nidn` | Kasus-kasus NIDN vs NUPTK perlu klarifikasi |
| `dosen[].nama` | `ref.sdm.nm_sdm` | Ikut query |

**Open question:** SIMKATMAWA minta `nuptk` tapi dokumentasi bilang "NUPTK/NIDN/identifier dosen (sesuai sistem)". Untuk dosen PNS/PPPK Unila biasanya pakai NIDN. Perlu test: apakah NIDN accepted di field nuptk.

---

## Gap di API SIMKATMAWA itu sendiri (bukan di kita)

| Kebutuhan kita | Ketersediaan di API | Workaround |
|---|---|---|
| GET list prestasi per `kode_pt` | ❌ tidak ada | Simpan snapshot lokal dari response POST |
| GET detail by id | ❌ tidak ada | Sama |
| UPDATE / DELETE prestasi yang sudah dikirim | ❌ tidak ada | Assume append-only; perbaikan via kontak admin SIMKATMAWA |
| Validasi duplikat (NIM + lomba + tahun sama) | ❌ tidak ada | Validasi lokal sebelum kirim |
| Pagination / batch send | ❌ tidak ada | Kirim one-by-one dengan queue + rate limit |
| Webhook hasil verifikasi | ❌ tidak ada | Polling manual, atau percaya sukses = valid |

**Implikasi besar:** SI-Prestasi harus jadi *source of truth* lokal. Sekali push ke SIMKATMAWA berhasil, data di kita tetap authoritative.
