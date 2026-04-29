// Package kategori — taxonomy referensi pengumuman/berita.
package kategori

import "time"

type Kategori struct {
	IDKategori string     `db:"id_kategori" json:"id_kategori"`
	Kode       string     `db:"kode" json:"kode"`
	Nama       string     `db:"nama" json:"nama"`
	IconName   *string    `db:"icon_name" json:"icon_name,omitempty"`
	Color      *string    `db:"color" json:"color,omitempty"`
	Jenis      string     `db:"jenis" json:"jenis"` // 'pengumuman'|'berita'|'both'
	Urutan     int        `db:"urutan" json:"urutan"`
	IsActive   bool       `db:"is_active" json:"is_active"`
	CreateDate *time.Time `db:"create_date" json:"create_date,omitempty"`
	LastUpdate *time.Time `db:"last_update" json:"last_update,omitempty"`
}

type CreateKategoriRequest struct {
	Kode     string  `json:"kode" validate:"required"`
	Nama     string  `json:"nama" validate:"required"`
	IconName *string `json:"icon_name,omitempty"`
	Color    *string `json:"color,omitempty"`
	Jenis    string  `json:"jenis" validate:"required,oneof=pengumuman berita both"`
	Urutan   int     `json:"urutan"`
	IsActive bool    `json:"is_active"`
}

type UpdateKategoriRequest struct {
	Nama     *string `json:"nama,omitempty"`
	IconName *string `json:"icon_name,omitempty"`
	Color    *string `json:"color,omitempty"`
	Jenis    *string `json:"jenis,omitempty"`
	Urutan   *int    `json:"urutan,omitempty"`
	IsActive *bool   `json:"is_active,omitempty"`
}
