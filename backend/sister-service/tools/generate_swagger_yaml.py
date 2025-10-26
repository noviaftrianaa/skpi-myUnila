#!/usr/bin/env python3
"""
Generate Swagger YAML additions for 29 new referensi endpoints
"""

endpoints_config = [
    {"name": "BidangStudi", "snake": "bidang_studi", "kebab": "bidang-studi", "desc": "field of study", "desc_id": "bidang studi"},
    {"name": "BidangUsaha", "snake": "bidang_usaha", "kebab": "bidang-usaha", "desc": "business field", "desc_id": "bidang usaha"},
    {"name": "JabatanFungsional", "snake": "jabatan_fungsional", "kebab": "jabatan-fungsional", "desc": "functional position", "desc_id": "jabatan fungsional"},
    {"name": "JabatanTugasTambahan", "snake": "jabatan_tugas_tambahan", "kebab": "jabatan-tugas-tambahan", "desc": "additional duty position", "desc_id": "jabatan tugas tambahan"},
    {"name": "JenisBahanAjar", "snake": "jenis_bahan_ajar", "kebab": "jenis-bahan-ajar", "desc": "teaching material type", "desc_id": "jenis bahan ajar"},
    {"name": "JenisBeasiswa", "snake": "jenis_beasiswa", "kebab": "jenis-beasiswa", "desc": "scholarship type", "desc_id": "jenis beasiswa"},
    {"name": "JenisDiklat", "snake": "jenis_diklat", "kebab": "jenis-diklat", "desc": "training type", "desc_id": "jenis diklat"},
    {"name": "JenisDokumen", "snake": "jenis_dokumen", "kebab": "jenis-dokumen", "desc": "document type", "desc_id": "jenis dokumen"},
    {"name": "JenisKeluar", "snake": "jenis_keluar", "kebab": "jenis-keluar", "desc": "exit type", "desc_id": "jenis keluar"},
    {"name": "JenisKepanitiaan", "snake": "jenis_kepanitiaan", "kebab": "jenis-kepanitiaan", "desc": "committee type", "desc_id": "jenis kepanitiaan"},
    {"name": "JenisKesejahteraan", "snake": "jenis_kesejahteraan", "kebab": "jenis-kesejahteraan", "desc": "welfare type", "desc_id": "jenis kesejahteraan"},
    {"name": "JenisPublikasi", "snake": "jenis_publikasi", "kebab": "jenis-publikasi", "desc": "publication type", "desc_id": "jenis publikasi"},
    {"name": "JenisTes", "snake": "jenis_tes", "kebab": "jenis-tes", "desc": "test type", "desc_id": "jenis tes"},
    {"name": "JenisTunjangan", "snake": "jenis_tunjangan", "kebab": "jenis-tunjangan", "desc": "allowance type", "desc_id": "jenis tunjangan"},
    {"name": "MediaPublikasi", "snake": "media_publikasi", "kebab": "media-publikasi", "desc": "publication media", "desc_id": "media publikasi"},
    {"name": "SkimKegiatan", "snake": "skim_kegiatan", "kebab": "skim-kegiatan", "desc": "activity scheme", "desc_id": "skim kegiatan"},
    {"name": "StatusKepegawaian", "snake": "status_kepegawaian", "kebab": "status-kepegawaian", "desc": "employment status", "desc_id": "status kepegawaian"},
    {"name": "SumberGaji", "snake": "sumber_gaji", "kebab": "sumber-gaji", "desc": "salary source", "desc_id": "sumber gaji"},
    {"name": "TingkatPenghargaan", "snake": "tingkat_penghargaan", "kebab": "tingkat-penghargaan", "desc": "award level", "desc_id": "tingkat penghargaan"},
    {"name": "Wilayah", "snake": "wilayah", "kebab": "wilayah", "desc": "region", "desc_id": "wilayah"},
    {"name": "KategoriCapaianLuaran", "snake": "kategori_capaian_luaran", "kebab": "kategori-capaian-luaran", "desc": "output achievement category", "desc_id": "kategori capaian luaran"},
    {"name": "KategoriKegiatan", "snake": "kategori_kegiatan", "kebab": "kategori-kegiatan", "desc": "activity category", "desc_id": "kategori kegiatan"},
    {"name": "KelompokBidang", "snake": "kelompok_bidang", "kebab": "kelompok-bidang", "desc": "field group", "desc_id": "kelompok bidang"},
    {"name": "LembagaSertifikasi", "snake": "lembaga_sertifikasi", "kebab": "lembaga-sertifikasi", "desc": "certification institution", "desc_id": "lembaga sertifikasi"},
    {"name": "GolonganPangkat", "snake": "golongan_pangkat", "kebab": "golongan-pangkat", "desc": "rank grade", "desc_id": "golongan pangkat"},
    {"name": "IkatanKerja", "snake": "ikatan_kerja", "kebab": "ikatan-kerja", "desc": "work bond", "desc_id": "ikatan kerja"},
    {"name": "JenisPenghargaan", "snake": "jenis_penghargaan", "kebab": "jenis-penghargaan", "desc": "award type", "desc_id": "jenis penghargaan"},
    {"name": "JenisPekerjaan", "snake": "jenis_pekerjaan", "kebab": "jenis-pekerjaan", "desc": "job type", "desc_id": "jenis pekerjaan"},
    {"name": "BidangPekerjaan", "snake": "bidang_pekerjaan", "kebab": "bidang-pekerjaan", "desc": "job field", "desc_id": "bidang pekerjaan"},
]

# Field mappings for each entity (simplified - adjust based on actual structs)
field_mappings = {
    "BidangStudi": ["id_bidang_studi:integer", "nama_bidang_studi:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "BidangUsaha": ["id_bidang_usaha:integer", "nama_bidang_usaha:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JabatanFungsional": ["id_jabatan_fungsional:integer", "nama_jabatan_fungsional:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JabatanTugasTambahan": ["id_jabatan_tugas_tambahan:integer", "nama_jabatan_tugas_tambahan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisBahanAjar": ["id_jenis_bahan_ajar:integer", "nama_jenis_bahan_ajar:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisBeasiswa": ["id_jenis_beasiswa:integer", "nama_jenis_beasiswa:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisDiklat": ["id_jenis_diklat:integer", "nama_jenis_diklat:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisDokumen": ["id_jenis_dokumen:integer", "nama_jenis_dokumen:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisKeluar": ["id_jenis_keluar:integer", "nama_jenis_keluar:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisKepanitiaan": ["id_jenis_kepanitiaan:integer", "nama_jenis_kepanitiaan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisKesejahteraan": ["id_jenis_kesejahteraan:integer", "nama_jenis_kesejahteraan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisPublikasi": ["id_jenis_publikasi:integer", "nama_jenis_publikasi:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisTes": ["id_jenis_tes:integer", "nama_jenis_tes:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisTunjangan": ["id_jenis_tunjangan:integer", "nama_jenis_tunjangan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "MediaPublikasi": ["id_media_publikasi:integer", "nama_media_publikasi:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "SkimKegiatan": ["id_skim_kegiatan:integer", "nama_skim_kegiatan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "StatusKepegawaian": ["id_status_kepegawaian:integer", "nama_status_kepegawaian:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "SumberGaji": ["id_sumber_gaji:integer", "nama_sumber_gaji:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "TingkatPenghargaan": ["id_tingkat_penghargaan:integer", "nama_tingkat_penghargaan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "Wilayah": ["id_wilayah:string", "nama_wilayah:string", "id_negara:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "KategoriCapaianLuaran": ["id_kategori_capaian_luaran:integer", "nama_kategori_capaian_luaran:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "KategoriKegiatan": ["id_kategori_kegiatan:integer", "nama_kategori_kegiatan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "KelompokBidang": ["id_kelompok_bidang:integer", "nama_kelompok_bidang:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "LembagaSertifikasi": ["id_lembaga_sertifikasi:integer", "nama_lembaga_sertifikasi:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "GolonganPangkat": ["id_golongan_pangkat:integer", "nama_golongan_pangkat:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "IkatanKerja": ["id_ikatan_kerja:integer", "nama_ikatan_kerja:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisPenghargaan": ["id_jenis_penghargaan:integer", "nama_jenis_penghargaan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "JenisPekerjaan": ["id_jenis_pekerjaan:integer", "nama_jenis_pekerjaan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
    "BidangPekerjaan": ["id_bidang_pekerjaan:integer", "nama_bidang_pekerjaan:string", "expired_date:string", "last_sync:string", "synced_by:string"],
}

print("# ===== DEFINITIONS TO ADD =====\n")
print("# Add these under 'definitions:' section after referensi.Agama\n")

for ep in endpoints_config:
    print(f"  referensi.{ep['name']}:")
    print(f"    properties:")
    for field in field_mappings.get(ep['name'], []):
        fname, ftype = field.split(":")
        print(f"      {fname}:")
        print(f"        type: {ftype}")
    print(f"    type: object")

print("\n\n# ===== PATHS TO ADD =====\n")
print("# Add these under 'paths:' section\n")

for ep in endpoints_config:
    # GET path
    print(f"  /api/v1/referensi/{ep['kebab']}:")
    print(f"    get:")
    print(f"      consumes:")
    print(f"      - application/json")
    print(f"      description: Retrieve all {ep['snake']} ({ep['desc']}) reference data")
    print(f"      produces:")
    print(f"      - application/json")
    print(f"      responses:")
    print(f"        \"200\":")
    print(f"          description: OK")
    print(f"          schema:")
    print(f"            allOf:")
    print(f"            - $ref: '#/definitions/response.APIResponse'")
    print(f"            - properties:")
    print(f"                data:")
    print(f"                  items:")
    print(f"                    $ref: '#/definitions/referensi.{ep['name']}'")
    print(f"                  type: array")
    print(f"              type: object")
    print(f"        \"500\":")
    print(f"          description: Internal Server Error")
    print(f"          schema:")
    print(f"            $ref: '#/definitions/response.APIResponse'")
    print(f"      security:")
    print(f"      - BearerAuth: []")
    print(f"      summary: Get all {ep['snake']}")
    print(f"      tags:")
    print(f"      - Referensi")

    # POST sync path
    print(f"  /api/v1/referensi/{ep['kebab']}/sync:")
    print(f"    post:")
    print(f"      consumes:")
    print(f"      - application/json")
    print(f"      description: Synchronize {ep['snake']} ({ep['desc']}) data from Sister Kemdikbud")
    print(f"        API. User identity is automatically extracted from JWT token.")
    print(f"      produces:")
    print(f"      - application/json")
    print(f"      responses:")
    print(f"        \"200\":")
    print(f"          description: OK")
    print(f"          schema:")
    print(f"            allOf:")
    print(f"            - $ref: '#/definitions/response.APIResponse'")
    print(f"            - properties:")
    print(f"                data:")
    print(f"                  $ref: '#/definitions/referensi.SyncResponse'")
    print(f"              type: object")
    print(f"        \"401\":")
    print(f"          description: Unauthorized - Missing or invalid JWT token")
    print(f"          schema:")
    print(f"            $ref: '#/definitions/response.APIResponse'")
    print(f"        \"403\":")
    print(f"          description: Forbidden - Requires Developer role")
    print(f"          schema:")
    print(f"            $ref: '#/definitions/response.APIResponse'")
    print(f"        \"500\":")
    print(f"          description: Internal Server Error")
    print(f"          schema:")
    print(f"            $ref: '#/definitions/response.APIResponse'")
    print(f"      security:")
    print(f"      - BearerAuth: []")
    print(f"      summary: Sync {ep['snake']} from Sister API")
    print(f"      tags:")
    print(f"      - Referensi")

print("\n# ===== END OF ADDITIONS =====")
