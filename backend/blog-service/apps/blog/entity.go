package blog

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Blog — per-user blog (1 user = 1 blog).
// Mirror dari blog.blog table di PostgreSQL.
type Blog struct {
	IDBlog          uuid.UUID       `db:"id_blog"           json:"id_blog"`
	IDPenggunaPdut  uuid.UUID       `db:"id_pengguna_pdut"  json:"id_pengguna_pdut"`
	IDTipeRole      uuid.UUID       `db:"id_tipe_role"      json:"id_tipe_role"`
	Subdomain       string          `db:"subdomain"         json:"subdomain"`
	NmBlog          string          `db:"nm_blog"           json:"nm_blog"`
	NmTampilan      *string         `db:"nm_tampilan"       json:"nm_tampilan,omitempty"`
	Tagline         *string         `db:"tagline"           json:"tagline,omitempty"`
	Deskripsi       *string         `db:"deskripsi"         json:"deskripsi,omitempty"`
	AvatarURL       *string         `db:"avatar_url"        json:"avatar_url,omitempty"`
	CoverURL        *string         `db:"cover_url"         json:"cover_url,omitempty"`
	Bio             *string         `db:"bio"               json:"bio,omitempty"`
	Lokasi          *string         `db:"lokasi"            json:"lokasi,omitempty"`
	SosmedJSON      json.RawMessage `db:"sosmed_json"       json:"sosmed_json"`
	IDTemplateTheme *uuid.UUID      `db:"id_template_theme" json:"id_template_theme,omitempty"`
	ThemeConfigJSON json.RawMessage `db:"theme_config_json" json:"theme_config_json"`
	MetaSeoJSON     json.RawMessage `db:"meta_seo_json"     json:"meta_seo_json"`
	Bahasa          string          `db:"bahasa"            json:"bahasa"`
	Timezone        string          `db:"timezone"          json:"timezone"`
	AAktif          bool            `db:"a_aktif"           json:"a_aktif"`
	APublik         bool            `db:"a_publik"          json:"a_publik"`
	AKomentarAktif  bool            `db:"a_komentar_aktif"  json:"a_komentar_aktif"`
	ATerverifikasi  bool            `db:"a_terverifikasi"   json:"a_terverifikasi"`
	TglKlaim        *time.Time      `db:"tgl_klaim"         json:"tgl_klaim,omitempty"`
	JumlahPost      int             `db:"jumlah_post"       json:"jumlah_post"`
	JumlahView      int64           `db:"jumlah_view"       json:"jumlah_view"`
	JumlahFollower  int             `db:"jumlah_follower"   json:"jumlah_follower"`
	RatingAvg       float64         `db:"rating_avg"        json:"rating_avg"`
	RatingCount     int             `db:"rating_count"      json:"rating_count"`
	SkorSEO         int             `db:"skor_seo"          json:"skor_seo"`
	CreatedAt       time.Time       `db:"created_at"        json:"created_at"`
	UpdatedAt       time.Time       `db:"updated_at"        json:"updated_at"`
}

// BlogSummary — versi ringan untuk listing (apex aggregator, admin list).
type BlogSummary struct {
	IDBlog         uuid.UUID `db:"id_blog"          json:"id_blog"`
	Subdomain      string    `db:"subdomain"        json:"subdomain"`
	NmBlog         string    `db:"nm_blog"          json:"nm_blog"`
	NmTampilan     *string   `db:"nm_tampilan"      json:"nm_tampilan,omitempty"`
	Tagline        *string   `db:"tagline"          json:"tagline,omitempty"`
	AvatarURL      *string   `db:"avatar_url"       json:"avatar_url,omitempty"`
	TipeRoleKode   string    `db:"tipe_role_kode"   json:"tipe_role_kode"`
	JumlahPost     int       `db:"jumlah_post"      json:"jumlah_post"`
	JumlahView     int64     `db:"jumlah_view"      json:"jumlah_view"`
	JumlahFollower int       `db:"jumlah_follower"  json:"jumlah_follower"`
	ATerverifikasi bool      `db:"a_terverifikasi"  json:"a_terverifikasi"`
	AAktif         bool      `db:"a_aktif"          json:"a_aktif"`
	TglKlaim       *time.Time `db:"tgl_klaim"       json:"tgl_klaim,omitempty"`
}
