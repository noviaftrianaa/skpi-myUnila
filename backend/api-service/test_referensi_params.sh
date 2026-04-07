#!/bin/bash

# ============================================================================
# Script untuk testing endpoint dengan parameter khusus (bukan cuma pagination)
# Usage: ./test_referensi_params.sh [TOKEN]
# ============================================================================

BASE_URL="http://localhost:8085/v1/referensi"

# Use token from argument or default
if [ -n "$1" ]; then
    TOKEN="$1"
else
    TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzUzNTI1MjcsImlkX3VzZXIiOiJiMDQwMmIzYy00NjU1LTExZWUtODAwNC0wMDUwNTY5YzBiMGUiLCJuYW1hIjoiQWRtaW5pc3RyYXRvciIsInVzZXJuYW1lIjoiYWRtaW4ifQ.3ZIRRLjqABYp2FlOKtwbaLD03GTjEF0ZtT09aR_rpA4uGGoKUAknnFM7Oc"
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
TOTAL=0

# Function untuk test endpoint dengan parameter
test_with_params() {
    local endpoint=$1
    local name=$2
    local params=$3
    
    TOTAL=$((TOTAL + 1))
    echo -e "${BLUE}Testing:${NC} ${name}"
    echo -e "${YELLOW}  Params:${NC} ${params}"
    
    response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}${endpoint}?${params}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        # Check if valid JSON
        if echo "$body" | jq empty 2>/dev/null; then
            data_count=$(echo "$body" | jq -r '.data | length' 2>/dev/null)
            total=$(echo "$body" | jq -r '.metadata.total // 0' 2>/dev/null)
            echo -e "  ${GREEN}✓ PASS${NC} - HTTP $http_code | Records: $data_count | Total: $total"
            PASSED=$((PASSED + 1))
        else
            echo -e "  ${RED}✗ FAIL${NC} - Invalid JSON response"
            FAILED=$((FAILED + 1))
        fi
    else
        error_msg=$(echo "$body" | jq -r '.error // .message // "Unknown error"' 2>/dev/null || echo "Unknown error")
        echo -e "  ${RED}✗ FAIL${NC} - HTTP $http_code | Error: $error_msg"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Testing Referensi API Endpoints with Special Parameters${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# ============================================================================
# COMMON Package
# ============================================================================
echo -e "${YELLOW}=== COMMON Package ===${NC}"

# Wilayah - WilayahParams
test_with_params "/wilayah" "Wilayah - Filter by level provinsi" "level=1&limit=5"
test_with_params "/wilayah" "Wilayah - Filter by level kabupaten/kota" "level=2&limit=5"
test_with_params "/wilayah" "Wilayah - Filter by level kecamatan" "level=3&limit=5"
test_with_params "/wilayah" "Wilayah - Filter by id_negara" "id_negara=ID&limit=5"

# Semester - SemesterParams
test_with_params "/semester" "Semester - Filter by tahun_ajaran" "tahun_ajaran=2024&limit=5"
test_with_params "/semester" "Semester - Filter by periode_aktif" "periode_aktif=1&limit=5"

# Tahun Ajaran - TahunAjaranParams
test_with_params "/tahun_ajaran" "Tahun Ajaran - Filter by periode_aktif" "periode_aktif=1&limit=5"

# Bentuk Pendidikan - BentukPendidikanParams
test_with_params "/bentuk_pendidikan" "Bentuk Pendidikan - Filter by jenjang_paud" "jenjang_paud=1&limit=5"
test_with_params "/bentuk_pendidikan" "Bentuk Pendidikan - Filter by jenjang_sd" "jenjang_sd=1&limit=5"
test_with_params "/bentuk_pendidikan" "Bentuk Pendidikan - Filter by jenjang_tinggi" "jenjang_tinggi=1&limit=5"
test_with_params "/bentuk_pendidikan" "Bentuk Pendidikan - Filter by aktif" "aktif=1&limit=5"

# Bidang Studi - BidangStudiParams
test_with_params "/bidang_studi" "Bidang Studi - Filter by kelompok" "kelompok=1&limit=5"
test_with_params "/bidang_studi" "Bidang Studi - Filter by jenjang_smp" "jenjang_smp=1&limit=5"
test_with_params "/bidang_studi" "Bidang Studi - Filter by jenjang_tinggi" "jenjang_tinggi=1&limit=5"

# Gelar Akademik - GelarAkademikParams
test_with_params "/gelar_akademik" "Gelar Akademik - Filter by posisi_gelar" "posisi_gelar=1&limit=5"

# Jenjang Pendidikan - JenjangPendidikanParams
test_with_params "/jenjang_pendidikan" "Jenjang Pendidikan - Filter by u_jenj_lemb" "u_jenj_lemb=1&limit=5"
test_with_params "/jenjang_pendidikan" "Jenjang Pendidikan - Filter by u_jenj_org" "u_jenj_org=1&limit=5"

# Jurusan - JurusanParams
test_with_params "/jurusan" "Jurusan - Filter by id_jenj_didik" "id_jenj_didik=1&limit=5"
test_with_params "/jurusan" "Jurusan - Filter by u_sma" "u_sma=1&limit=5"
test_with_params "/jurusan" "Jurusan - Filter by u_smk" "u_smk=1&limit=5"
test_with_params "/jurusan" "Jurusan - Filter by u_pt" "u_pt=1&limit=5"

# Negara - NegaraParams
test_with_params "/negara" "Negara - Filter by a_ln" "a_ln=1&limit=5"
test_with_params "/negara" "Negara - Filter by benua" "benua=1&limit=5"

# Pangkat Golongan - PangkatGolonganParams
test_with_params "/pangkat_golongan" "Pangkat Golongan - Filter by kode_gol" "kode_gol=III&limit=5"

# Tahun Anggaran - TahunAnggaranParams
test_with_params "/tahun_anggaran" "Tahun Anggaran - Filter by a_periode_aktif" "a_periode_aktif=1&limit=5"

# TSE - TseParams
test_with_params "/tse" "TSE - Filter by kode_tse" "kode_tse=S1&limit=5"

# ============================================================================
# JENIS Package
# ============================================================================
echo -e "${YELLOW}=== JENIS Package ===${NC}"

# Jab Tgs - JabTgsParams
test_with_params "/jab_tgs" "Jab Tgs - Filter by jabatan_utama_sek" "jabatan_utama_sek=1&limit=5"
test_with_params "/jab_tgs" "Jab Tgs - Filter by jabatan_utama_pt" "jabatan_utama_pt=1&limit=5"

# Jab Fung - JabFungParams
test_with_params "/jabfung" "Jab Fung - Filter by angka_kredit" "angka_kredit=1&limit=5"

# Jenis Akt Mhs - JenisAktMhsParams
test_with_params "/jenis_akt_mhs" "Jenis Akt Mhs - Filter by kegiatan_kampus_merdeka" "kegiatan_kampus_merdeka=1&limit=5"

# Jenis Beasiswa - JenisBeasiswaParams
test_with_params "/jenis_beasiswa" "Jenis Beasiswa - Filter by u_pd" "u_pd=1&limit=5"
test_with_params "/jenis_beasiswa" "Jenis Beasiswa - Filter by u_ptk" "u_ptk=1&limit=5"
test_with_params "/jenis_beasiswa" "Jenis Beasiswa - Filter by kat_beasiswa" "kat_beasiswa=1&limit=5"

# Jenis Diklat - JenisDiklatParams
test_with_params "/jenis_diklat" "Jenis Diklat - Filter by u_guru" "u_guru=1&limit=5"
test_with_params "/jenis_diklat" "Jenis Diklat - Filter by u_dosen" "u_dosen=1&limit=5"
test_with_params "/jenis_diklat" "Jenis Diklat - Filter by u_tendik" "u_tendik=1&limit=5"

# Jenis Keluar - JenisKeluarParams
test_with_params "/jenis_keluar" "Jenis Keluar - Filter by a_pd" "a_pd=1&limit=5"
test_with_params "/jenis_keluar" "Jenis Keluar - Filter by a_ptk" "a_ptk=1&limit=5"

# Jenis Keuangan - JenisKeuanganParams
test_with_params "/jenis_keuangan" "Jenis Keuangan - Filter by pengeluaran" "pengeluaran=1&limit=5"
test_with_params "/jenis_keuangan" "Jenis Keuangan - Filter by pemasukan" "pemasukan=1&limit=5"

# Jenis Lembaga - JenisLembagaParams
test_with_params "/jenis_lembaga" "Jenis Lembaga - Filter by sp" "sp=1&limit=5"
test_with_params "/jenis_lembaga" "Jenis Lembaga - Filter by lemb_akred" "lemb_akred=1&limit=5"
test_with_params "/jenis_lembaga" "Jenis Lembaga - Filter by pengelola_pendidikan" "pengelola_pendidikan=1&limit=5"

# Jenis Pendaftaran - JenisPendaftaranParams
test_with_params "/jenis_pendaftaran" "Jenis Pendaftaran - Filter by daftar_sekolah" "daftar_sekolah=1&limit=5"
test_with_params "/jenis_pendaftaran" "Jenis Pendaftaran - Filter by daftar_rombel" "daftar_rombel=1&limit=5"

# Jenis Penghargaan - JenisPenghargaanParams
test_with_params "/jenis_penghargaan" "Jenis Penghargaan - Filter by lembaga" "lembaga=1&limit=5"

# Jenis Sarana - JenisSaranaParams
test_with_params "/jenis_sarana" "Jenis Sarana - Filter by penempatan" "penempatan=1&limit=5"

# Jenis SDM - JenisSdmParams
test_with_params "/jenis_sdm" "Jenis SDM - Filter by guru_kelas" "guru_kelas=1&limit=5"
test_with_params "/jenis_sdm" "Jenis SDM - Filter by guru_mapel" "guru_mapel=1&limit=5"
test_with_params "/jenis_sdm" "Jenis SDM - Filter by dosen" "dosen=1&limit=5"
test_with_params "/jenis_sdm" "Jenis SDM - Filter by peneliti" "peneliti=1&limit=5"

# Jenis Sert - JenisSertParams
test_with_params "/jenis_sert" "Jenis Sert - Filter by prof_guru" "prof_guru=1&limit=5"
test_with_params "/jenis_sert" "Jenis Sert - Filter by prof_dosen" "prof_dosen=1&limit=5"
test_with_params "/jenis_sert" "Jenis Sert - Filter by lembaga" "lembaga=1&limit=5"

# Jenis Tes - JenisTesParams
test_with_params "/jenis_tes" "Jenis Tes - Filter by nilai_maks" "nilai_maks=100&limit=5"

# ============================================================================
# KATEGORI Package
# ============================================================================
echo -e "${YELLOW}=== KATEGORI Package ===${NC}"

# Kategori Kegiatan - KategoriKegiatanParams
test_with_params "/kategori_kegiatan" "Kategori Kegiatan - Filter by level_kat" "level_kat=1&limit=5"
test_with_params "/kategori_kegiatan" "Kategori Kegiatan - Filter by judul" "judul=1&limit=5"
test_with_params "/kategori_kegiatan" "Kategori Kegiatan - Filter by bkd" "bkd=1&limit=5"
test_with_params "/kategori_kegiatan" "Kategori Kegiatan - Filter by pak" "pak=1&limit=5"

# Kategori Tabel - KategoriTabelParams (cek kalau ada endpoint ini)
# test_with_params "/kategori_tabel" "Kategori Tabel - Basic" "limit=5"

# ============================================================================
# KELOMPOK Package
# ============================================================================
echo -e "${YELLOW}=== KELOMPOK Package ===${NC}"

# KBLI - KbliParams
test_with_params "/kbli" "KBLI - Filter by lv_kbli" "lv_kbli=1&limit=5"
test_with_params "/kbli" "KBLI - Filter by kategori" "kategori=A&limit=5"

# Media Publikasi - MediaPublikasiParams
test_with_params "/media_publikasi" "Media Publikasi - Filter by bentuk_media_pub" "bentuk_media_pub=jurnal&limit=5"
test_with_params "/media_publikasi" "Media Publikasi - Filter by jns_penerbit" "jns_penerbit=nasional&limit=5"

# Skim Kegiatan - SkimKegiatanParams
test_with_params "/skim_kegiatan" "Skim Kegiatan - Filter by jml_min_personil" "jml_min_personil=1&limit=5"
test_with_params "/skim_kegiatan" "Skim Kegiatan - Filter by jml_maks_personil" "jml_maks_personil=5&limit=5"
test_with_params "/skim_kegiatan" "Skim Kegiatan - Filter by dana_min_thn_berjalan" "dana_min_thn_berjalan=1000000&limit=5"

# Kelompok Bidang - KelompokBidangParams
test_with_params "/kelompok_bidang" "Kelompok Bidang - Filter by u_sma" "u_sma=1&limit=5"
test_with_params "/kelompok_bidang" "Kelompok Bidang - Filter by u_pt" "u_pt=1&limit=5"
test_with_params "/kelompok_bidang" "Kelompok Bidang - Filter by u_iptek" "u_iptek=1&limit=5"
test_with_params "/kelompok_bidang" "Kelompok Bidang - Filter by a_leaf_node" "a_leaf_node=1&limit=5"

# ============================================================================
# LEMBAGA Package
# ============================================================================
echo -e "${YELLOW}=== LEMBAGA Package ===${NC}"

# Lembaga Akred - LembagaAkredParams
test_with_params "/lembaga_akred" "Lembaga Akred - Filter by target_akred" "target_akred=sp&limit=5"
test_with_params "/lembaga_akred" "Lembaga Akred - Filter by kode_pos" "kode_pos=12345&limit=5"

# ============================================================================
# PETA Package
# ============================================================================
echo -e "${YELLOW}=== PETA Package ===${NC}"

# Peta Katgiat Jnsdok - PetaKatgiatJnsdokParams (cek endpoint)
# test_with_params "/peta_katgiat_jnsdok" "Peta Katgiat Jnsdok - Filter by a_wajib" "a_wajib=1&limit=5"

# ============================================================================
# SUMBER Package
# ============================================================================
echo -e "${YELLOW}=== SUMBER Package ===${NC}"

# Sumber Dana - SumberDanaParams
test_with_params "/sumber_dana" "Sumber Dana - Filter by u_blockgrant" "u_blockgrant=1&limit=5"
test_with_params "/sumber_dana" "Sumber Dana - Filter by u_beasiswa" "u_beasiswa=1&limit=5"
test_with_params "/sumber_dana" "Sumber Dana - Filter by u_lit" "u_lit=1&limit=5"
test_with_params "/sumber_dana" "Sumber Dana - Filter by u_unit_usaha" "u_unit_usaha=1&limit=5"

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}✗ Some tests failed!${NC}"
    exit 1
fi
