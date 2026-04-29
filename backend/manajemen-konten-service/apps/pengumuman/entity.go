// Package pengumuman — pengumuman (short-form announcement).
package pengumuman

import "time"

// Pengumuman — fleksibel: tipe bisa 'pengumuman' / 'berita' / 'artikel'.
// Tabel pakai nama `pengumuman` (legacy schema), tapi UI admin bisa kelola
// ketiganya via filter `tipe` field.
type Pengumuman struct {
	IDPengumuman  string     `db:"id_pengumuman" json:"id_pengumuman"`
	Tipe          string     `db:"tipe" json:"tipe"` // 'pengumuman'|'berita'|'artikel'
	Judul         string     `db:"judul" json:"judul"`
	Slug          *string    `db:"slug" json:"slug,omitempty"`
	Ringkasan     *string    `db:"ringkasan" json:"ringkasan,omitempty"`
	Isi           *string    `db:"isi" json:"isi,omitempty"`
	IDKategori    *string    `db:"id_kategori" json:"id_kategori,omitempty"`
	NamaKategori  *string    `db:"nama_kategori" json:"nama_kategori,omitempty"`
	IconKategori  *string    `db:"icon_kategori" json:"icon_kategori,omitempty"`
	ColorKategori *string    `db:"color_kategori" json:"color_kategori,omitempty"`
	BannerURL     *string    `db:"banner_url" json:"banner_url,omitempty"`
	Author        *string    `db:"author" json:"author,omitempty"`
	Tags          *string    `db:"tags" json:"tags,omitempty"`
	IsPinned      bool       `db:"is_pinned" json:"is_pinned"`
	IsFeatured    bool       `db:"is_featured" json:"is_featured"`
	TglTerbit     time.Time  `db:"tgl_terbit" json:"tgl_terbit"`
	TglExpiry     *time.Time `db:"tgl_expiry" json:"tgl_expiry,omitempty"`
	Status        string     `db:"status" json:"status"`
	TargetRole    string     `db:"target_role" json:"target_role"`
	ViewCount     int        `db:"view_count" json:"view_count"`
	AllowComment  bool       `db:"allow_comment" json:"allow_comment"`
	AllowLike     bool       `db:"allow_like" json:"allow_like"`
	CreateDate    *time.Time `db:"create_date" json:"create_date,omitempty"`
	LastUpdate    *time.Time `db:"last_update" json:"last_update,omitempty"`
}

type ListFilter struct {
	Page       int
	Limit      int
	Search     string
	Tipe       string
	IDKategori string
	Status     string
	TargetRole string
}

type CreatePengumumanRequest struct {
	Tipe         string  `json:"tipe"` // default 'pengumuman'
	Judul        string  `json:"judul" validate:"required"`
	Slug         *string `json:"slug,omitempty"`
	Ringkasan    *string `json:"ringkasan,omitempty"`
	Isi          *string `json:"isi,omitempty"`
	IDKategori   *string `json:"id_kategori,omitempty"`
	BannerURL    *string `json:"banner_url,omitempty"`
	Author       *string `json:"author,omitempty"`
	Tags         *string `json:"tags,omitempty"`
	IsPinned     bool    `json:"is_pinned"`
	IsFeatured   bool    `json:"is_featured"`
	TglTerbit    *string `json:"tgl_terbit,omitempty"`
	TglExpiry    *string `json:"tgl_expiry,omitempty"`
	Status       string  `json:"status,omitempty"`
	TargetRole   string  `json:"target_role,omitempty"`
	AllowComment bool    `json:"allow_comment"`
	AllowLike    bool    `json:"allow_like"`
}

type UpdatePengumumanRequest struct {
	Tipe         *string `json:"tipe,omitempty"`
	Judul        *string `json:"judul,omitempty"`
	Slug         *string `json:"slug,omitempty"`
	Ringkasan    *string `json:"ringkasan,omitempty"`
	Isi          *string `json:"isi,omitempty"`
	IDKategori   *string `json:"id_kategori,omitempty"`
	BannerURL    *string `json:"banner_url,omitempty"`
	Author       *string `json:"author,omitempty"`
	Tags         *string `json:"tags,omitempty"`
	IsPinned     *bool   `json:"is_pinned,omitempty"`
	IsFeatured   *bool   `json:"is_featured,omitempty"`
	TglTerbit    *string `json:"tgl_terbit,omitempty"`
	TglExpiry    *string `json:"tgl_expiry,omitempty"`
	Status       *string `json:"status,omitempty"`
	TargetRole   *string `json:"target_role,omitempty"`
	AllowComment *bool   `json:"allow_comment,omitempty"`
	AllowLike    *bool   `json:"allow_like,omitempty"`
}

type ListResult struct {
	Items []Pengumuman `json:"items"`
	Total int          `json:"total"`
	Page  int          `json:"page"`
	Limit int          `json:"limit"`
}
