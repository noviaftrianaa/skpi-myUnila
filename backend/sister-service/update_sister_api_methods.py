#!/usr/bin/env python3
"""
Update 3 Sister API methods to accept required parameters
"""

# Read the file
with open('external/sister_api/client.go', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace GetReferensiWilayah
old_wilayah = '''func (c *Client) GetReferensiWilayah() ([]byte, error) {
\treturn c.Get("/1.0/referensi/wilayah")
}'''

new_wilayah = '''// GetReferensiWilayah fetches wilayah data with required id_level_wilayah parameter
// id_level_wilayah: 0=Negara, 1=Provinsi, 2=Kota/Kabupaten, 3=Kecamatan
func (c *Client) GetReferensiWilayah(idLevelWilayah int) ([]byte, error) {
\treturn c.Get(fmt.Sprintf("/1.0/referensi/wilayah?id_level_wilayah=%d", idLevelWilayah))
}'''

content = content.replace(old_wilayah, new_wilayah)

# Replace GetReferensiKategoriKegiatan
old_kategori = '''func (c *Client) GetReferensiKategoriKegiatan() ([]byte, error) {
\treturn c.Get("/1.0/referensi/kategori_kegiatan")
}'''

new_kategori = '''// GetReferensiKategoriKegiatan fetches kategori_kegiatan with required parameters
// tipe: "list" or "tree"
// menu: anggota_profesi, bahan_ajar, detasering, diklat, kekayaan_intelektual, jabatan_struktural,
//       orasi_ilmiah, penelitian, pembicara, pengabdian, pengelola_jurnal, penghargaan,
//       penunjang_lain, publikasi, tugas_tambahan, visiting_scientist
func (c *Client) GetReferensiKategoriKegiatan(tipe, menu string) ([]byte, error) {
\treturn c.Get(fmt.Sprintf("/1.0/referensi/kategori_kegiatan?tipe=%s&menu=%s", tipe, menu))
}'''

content = content.replace(old_kategori, new_kategori)

# Replace GetReferensiKelompokBidang
old_kelompok = '''func (c *Client) GetReferensiKelompokBidang() ([]byte, error) {
\treturn c.Get("/1.0/referensi/kelompok_bidang")
}'''

new_kelompok = '''// GetReferensiKelompokBidang fetches kelompok_bidang with required iptek parameter
// iptek: true for iptek fields, false for non-iptek
func (c *Client) GetReferensiKelompokBidang(iptek bool) ([]byte, error) {
\tiptekStr := "false"
\tif iptek {
\t\tiptekStr = "true"
\t}
\treturn c.Get(fmt.Sprintf("/1.0/referensi/kelompok_bidang?iptek=%s", iptekStr))
}'''

content = content.replace(old_kelompok, new_kelompok)

# Write back
with open('external/sister_api/client.go', 'w', encoding='utf-8') as f:
    f.write(content)

print("OK Updated 3 Sister API methods with required parameters")
print("   - GetReferensiWilayah(idLevelWilayah int)")
print("   - GetReferensiKategoriKegiatan(tipe, menu string)")
print("   - GetReferensiKelompokBidang(iptek bool)")
