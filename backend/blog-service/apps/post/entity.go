package post

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// PostSummary — versi list (tanpa konten lengkap).
type PostSummary struct {
	IDPost         uuid.UUID  `db:"id_post"           json:"id_post"`
	IDBlog         uuid.UUID  `db:"id_blog"           json:"id_blog"`
	Subdomain      string     `db:"subdomain"         json:"subdomain"`
	NmBlog         string     `db:"nm_blog"           json:"nm_blog"`
	BlogAvatarURL  *string    `db:"avatar_url"        json:"blog_avatar_url,omitempty"`
	IDKategori     *uuid.UUID `db:"id_kategori_post"  json:"id_kategori_post,omitempty"`
	KategoriSlug   *string    `db:"kategori_slug"     json:"kategori_slug,omitempty"`
	KategoriNama   *string    `db:"kategori_nama"     json:"kategori_nama,omitempty"`
	KategoriWarna  *string    `db:"kategori_warna"    json:"kategori_warna,omitempty"`
	Judul          string     `db:"judul"             json:"judul"`
	Slug           string     `db:"slug"              json:"slug"`
	Ringkasan      *string    `db:"ringkasan"         json:"ringkasan,omitempty"`
	CoverURL       *string    `db:"cover_url"         json:"cover_url,omitempty"`
	Status         string     `db:"status"            json:"status"`
	Visibilitas    string     `db:"visibilitas"       json:"visibilitas"`
	TglTerbit      *time.Time `db:"tgl_terbit"        json:"tgl_terbit,omitempty"`
	TglJadwal      *time.Time `db:"tgl_jadwal"        json:"tgl_jadwal,omitempty"`
	APinned        bool       `db:"a_pinned"          json:"a_pinned"`
	AUnggulan      bool       `db:"a_unggulan"        json:"a_unggulan"`
	AUnggulanBlog  bool       `db:"a_unggulan_blog"   json:"a_unggulan_blog"`
	JumlahView     int        `db:"jumlah_view"       json:"jumlah_view"`
	JumlahLike     int        `db:"jumlah_like"       json:"jumlah_like"`
	JumlahKomentar int        `db:"jumlah_komentar"   json:"jumlah_komentar"`
	WaktuBacaMenit int        `db:"waktu_baca_menit"  json:"waktu_baca_menit"`
	CreatedAt      time.Time  `db:"created_at"        json:"created_at"`
}

// Post — versi detail dengan konten lengkap (untuk view post + edit).
// konten_json pakai pointer agar NULL kolom (post baru / draft tanpa TipTap state) bisa di-scan.
type Post struct {
	PostSummary
	KontenHTML   *string          `db:"konten_html"      json:"konten_html,omitempty"`
	KontenJSON   *json.RawMessage `db:"konten_json"      json:"konten_json,omitempty"`
	KontenMD     *string          `db:"konten_md"        json:"konten_md,omitempty"`
	JumlahShare  int              `db:"jumlah_share"     json:"jumlah_share"`
	JumlahKata   int              `db:"jumlah_kata"      json:"jumlah_kata"`
	MetaSeoJSON  json.RawMessage  `db:"meta_seo_json"    json:"meta_seo_json"`
	Bahasa       string           `db:"bahasa"           json:"bahasa"`
	IDSeries     *uuid.UUID       `db:"id_series"        json:"id_series,omitempty"`
	UrutanSeries *int             `db:"urutan_series"    json:"urutan_series,omitempty"`
	UpdatedAt    time.Time        `db:"updated_at"       json:"updated_at"`
	Tags         []TagBrief       `db:"-"                json:"tags"` // populated separately
}

// TagBrief — slim tag info untuk attach ke Post detail.
type TagBrief struct {
	IDTag uuid.UUID `db:"id_tag" json:"id_tag"`
	Slug  string    `db:"slug"   json:"slug"`
	NmTag string    `db:"nm_tag" json:"nm_tag"`
}
