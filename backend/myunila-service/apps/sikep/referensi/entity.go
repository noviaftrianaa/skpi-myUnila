package referensi

import "time"

// ReferensiMetadata holds metadata for each referensi endpoint
type ReferensiMetadata struct {
	Key          string     `json:"key"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	TotalRecords int        `json:"total_records"`
	LastSync     *time.Time `json:"last_sync"`
	SyncedBy     string     `json:"synced_by"`
	Available    bool       `json:"available"`
}

// BatchSyncRequest holds request for batch sync
type BatchSyncRequest struct {
	Endpoints []string `json:"endpoints"`
}

// BatchSyncResult holds result for single endpoint sync
type BatchSyncResult struct {
	Endpoint     string `json:"endpoint"`
	Success      bool   `json:"success"`
	TotalRecords int    `json:"total_records"`
	Message      string `json:"message"`
	Error        string `json:"error,omitempty"`
}

// BatchSyncResponse holds response for batch sync
type BatchSyncResponse struct {
	TotalRequested int               `json:"total_requested"`
	TotalSuccess   int               `json:"total_success"`
	TotalFailed    int               `json:"total_failed"`
	Results        []BatchSyncResult `json:"results"`
	Duration       string            `json:"duration"`
}

// PaginatedResult holds paginated data for any referensi endpoint
type PaginatedResult struct {
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// ========================================
// Organisasi Entity
// ========================================

type Organisasi struct {
	IDUnitOrga      string     `db:"id_unit_orga" json:"id_unit_orga"`
	IDUnitOrgaInduk *string    `db:"id_unit_orga_induk" json:"id_unit_orga_induk"`
	KdUnitOrga      *string    `db:"kd_unit_orga" json:"kd_unit_orga"`
	NmUnitOrga      string     `db:"nm_unit_orga" json:"nm_unit_orga"`
	Alamat          *string    `db:"alamat" json:"alamat"`
	NoTlp           *string    `db:"no_tlp" json:"no_tlp"`
	NoFax           *string    `db:"no_fax" json:"no_fax"`
	KdPos           *string    `db:"kd_pos" json:"kd_pos"`
	NmSingkat       *string    `db:"nm_singkat" json:"nm_singkat"`
	NmInisial       *string    `db:"nm_inisial" json:"nm_inisial"`
	CreateDate      *time.Time `db:"create_date" json:"create_date"`
	LastSync        *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Fungsional Entity
// ========================================

type Fungsional struct {
	IDJabfung  string     `db:"id_jabfung" json:"id_jabfung"`
	NmJabfung  string     `db:"nm_jabfung" json:"nm_jabfung"`
	Kum        *string    `db:"kum" json:"kum"`
	IsPak      *string    `db:"ispak" json:"ispak"`
	IDGol      *string    `db:"id_gol" json:"id_gol"`
	Tipe       *string    `db:"tipe" json:"tipe"`
	Grade      *string    `db:"grade" json:"grade"`
	CreateDate *time.Time `db:"create_date" json:"create_date"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Struktural Entity
// ========================================

type Struktural struct {
	IDJabstruk string     `db:"id_jabstruk" json:"id_jabstruk"`
	KdJabstruk *string    `db:"kd_jabstruk" json:"kd_jabstruk"`
	NmJabstruk string     `db:"nm_jabstruk" json:"nm_jabstruk"`
	CreateDate *time.Time `db:"create_date" json:"create_date"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Golongan PNS Entity
// ========================================

type GolonganPNS struct {
	IDGol      string     `db:"id_gol" json:"id_gol"`
	KdGol      *string    `db:"kd_gol" json:"kd_gol"`
	NmGol      *string    `db:"nm_gol" json:"nm_gol"`
	NmPangkat  *string    `db:"nm_pangkat" json:"nm_pangkat"`
	Deskripsi  *string    `db:"deskripsi" json:"deskripsi"`
	CreateDate *time.Time `db:"create_date" json:"create_date"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Golongan PPPK Entity
// ========================================

type GolonganPPPK struct {
	ID         string     `db:"id" json:"id"`
	Golongan   string     `db:"golongan" json:"golongan"`
	Pangkat    string     `db:"pangkat" json:"pangkat"`
	IDCreator  *string    `db:"id_creator" json:"id_creator"`
	CreateDate *time.Time `db:"create_date" json:"create_date"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
	SoftDelete *time.Time `db:"soft_delete" json:"soft_delete"`
}

// ========================================
// Pendidikan Entity
// ========================================

type Pendidikan struct {
	IDPend     string     `db:"id_pend" json:"id_pend"`
	NmPend     string     `db:"nm_pend" json:"nm_pend"`
	CreateDate *time.Time `db:"create_date" json:"create_date"`
	LastSync   *time.Time `db:"last_sync" json:"last_sync"`
}

// ========================================
// Endpoint Config
// ========================================

type EndpointConfig struct {
	Key         string
	Name        string
	Description string
	Table       string
	APIEndpoint string
}

// GetEndpointConfigs returns all available endpoint configurations
func GetEndpointConfigs() []EndpointConfig {
	return []EndpointConfig{
		{
			Key:         "organisasi",
			Name:        "Unit Organisasi",
			Description: "Data unit organisasi/struktur UNILA",
			Table:       "sikep.unit_orga",
			APIEndpoint: "/organisasi",
		},
		{
			Key:         "fungsional",
			Name:        "Jabatan Fungsional",
			Description: "Data jabatan fungsional dosen dan tendik",
			Table:       "sikep.jabfung",
			APIEndpoint: "/fungsional",
		},
		{
			Key:         "struktural",
			Name:        "Jabatan Struktural",
			Description: "Data jabatan struktural pejabat",
			Table:       "sikep.jabstruk",
			APIEndpoint: "/struktural",
		},
		{
			Key:         "golongan_pns",
			Name:        "Golongan PNS",
			Description: "Data golongan dan pangkat PNS",
			Table:       "sikep.golongan_pns",
			APIEndpoint: "/golongan",
		},
		{
			Key:         "golongan_pppk",
			Name:        "Golongan PPPK",
			Description: "Data golongan PPPK (Pegawai Pemerintah dengan Perjanjian Kerja)",
			Table:       "sikep.golongan_pppk",
			APIEndpoint: "/golonganpppk",
		},
		{
			Key:         "pendidikan",
			Name:        "Tingkat Pendidikan",
			Description: "Data tingkat pendidikan terakhir",
			Table:       "sikep.pendidikan",
			APIEndpoint: "/pendidikan",
		},
	}
}
