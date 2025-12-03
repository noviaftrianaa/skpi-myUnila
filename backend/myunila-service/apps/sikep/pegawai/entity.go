package pegawai

import (
	"time"
)

// Pegawai - Entity for pegawai data (sikep.pegawai)
// Based on PegawaiSeeder.php field mapping
type Pegawai struct {
	// Primary Key
	IDPegawai string `json:"id_pegawai" db:"id_pegawai"`

	// Personal Information
	NmPegawai string  `json:"nm_pegawai" db:"nm_pegawai"`
	JK        *string `json:"jk" db:"jk"`               // Jenis Kelamin
	NIP       *string `json:"nip" db:"nip"`             // Nomor Induk Pegawai
	NIDN      *string `json:"nidn" db:"nidn"`           // Nomor Induk Dosen Nasional
	TmpLahir  *string `json:"tmp_lahir" db:"tmp_lahir"` // Tempat Lahir
	TglLahir  *string `json:"tgl_lahir" db:"tgl_lahir"` // Tanggal Lahir
	Alamat    *string `json:"alamat" db:"alamat"`       // Alamat

	// Employment Information
	JnsPegawai *string `json:"jns_pegawai" db:"jns_pegawai"` // Jenis Pegawai
	TmtCPNS    *string `json:"tmt_cpns" db:"tmt_cpns"`       // TMT CPNS
	TmtPNS     *string `json:"tmt_pns" db:"tmt_pns"`         // TMT PNS
	JnsTenaga  *string `json:"jns_tenaga" db:"jns_tenaga"`   // Jenis Tenaga

	// Position References
	IDGolongan   *string `json:"id_golongan" db:"id_golongan"`     // ID Golongan
	TmtGol       *string `json:"tmt_gol" db:"tmt_gol"`             // TMT Golongan
	IDFungsional *string `json:"id_fungsional" db:"id_fungsional"` // ID Jabatan Fungsional
	TmtFung      *string `json:"tmt_fung" db:"tmt_fung"`           // TMT Fungsional
	IDStruktural *string `json:"id_struktural" db:"id_struktural"` // ID Jabatan Struktural
	IDPendidikan *string `json:"id_pendidikan" db:"id_pendidikan"` // ID Pendidikan

	// Organization References
	IDOrg1 *string `json:"id_org1" db:"id_org1"` // Fakultas
	IDOrg2 *string `json:"id_org2" db:"id_org2"` // Jurusan
	IDOrg3 *string `json:"id_org3" db:"id_org3"` // Prodi

	// Status
	Status     *string `json:"status" db:"status"`           // Status Kepegawaian
	TmtPensiun *string `json:"tmt_pensiun" db:"tmt_pensiun"` // TMT Pensiun

	// Audit Fields
	IDCreator  *string    `json:"id_creator" db:"id_creator"`
	CreateDate *time.Time `json:"create_date" db:"create_date"`
	LastSync   *time.Time `json:"last_sync" db:"last_sync"`
}

// PegawaiListItem - Pegawai for list view with calculated/joined fields
type PegawaiListItem struct {
	IDPegawai      string     `db:"id_pegawai" json:"id_pegawai"`
	NmPegawai      string     `db:"nm_pegawai" json:"nm_pegawai"`
	NIP            *string    `db:"nip" json:"nip"`
	NIDN           *string    `db:"nidn" json:"nidn"`
	JK             *string    `db:"jk" json:"jk"`
	JnsPegawai     *string    `db:"jns_pegawai" json:"jns_pegawai"`
	JnsTenaga      *string    `db:"jns_tenaga" json:"jns_tenaga"`
	NamaGolongan   *string    `db:"nama_golongan" json:"nama_golongan"`
	NamaFungsional *string    `db:"nama_fungsional" json:"nama_fungsional"`
	IDOrg1         *string    `db:"id_org1" json:"id_org1"`       // Fakultas ID
	IDOrg2         *string    `db:"id_org2" json:"id_org2"`       // Jurusan ID
	IDOrg3         *string    `db:"id_org3" json:"id_org3"`       // Prodi ID
	NamaOrg1       *string    `db:"nama_org1" json:"nama_org1"`   // Fakultas Name
	NamaOrg2       *string    `db:"nama_org2" json:"nama_org2"`   // Jurusan Name
	NamaOrg3       *string    `db:"nama_org3" json:"nama_org3"`   // Prodi Name
	Status         *string    `db:"status" json:"status"`
	LastSync       *time.Time `db:"last_sync" json:"last_sync"`
}

// PegawaiListResult - Paginated list result
type PegawaiListResult struct {
	Data       []*PegawaiListItem `json:"data"`
	Total      int                `json:"total"`
	Page       int                `json:"page"`
	Limit      int                `json:"limit"`
	TotalPages int                `json:"total_pages"`
}

// PegawaiStats - Statistics for dashboard (4 stats only)
type PegawaiStats struct {
	TotalPegawai     int        `json:"total_pegawai"`
	TotalDosenAktif  int        `json:"total_dosen_aktif"`
	TotalTendikAktif int        `json:"total_tendik_aktif"`
	LastSync         *time.Time `json:"last_sync"`
}

// SyncFilter - Filter for sync operations
type SyncFilter struct {
	Start     int    `json:"start"`
	Limit     int    `json:"limit"`
	ForceSync bool   `json:"force_sync,omitempty"`
	SyncType  string `json:"sync_type,omitempty"` // 'manual', 'batch', 'scheduled'
}

// SyncResult - Result for pegawai sync
type SyncResult struct {
	TotalProcessed int    `json:"total_processed"`
	TotalSuccess   int    `json:"total_success"`
	TotalFailed    int    `json:"total_failed"`
	Duration       string `json:"duration"`
	SyncedBy       string `json:"synced_by"`
}

// SikepPegawaiData - Response from SIKEP API /pegawai
type SikepPegawaiData struct {
	IDPegawai    string  `json:"idpegawai"`
	NmPegawai    string  `json:"nmpegawai"`
	JK           *string `json:"jnskel"`
	NIP          *string `json:"nip"`
	NIDN         *string `json:"nidn"`
	TmpLahir     *string `json:"tmplahir"`
	TglLahir     *string `json:"tgllahir"`
	Alamat       *string `json:"alamat"`
	JnsPegawai   *string `json:"jnspegawai"`
	TmtCPNS      *string `json:"tmtcpns"`
	TmtPNS       *string `json:"tmtpns"`
	JnsTenaga    *string `json:"jnstenaga"`
	IDGolongan   *string `json:"idgolongan"`
	TmtGol       *string `json:"tmtgol"`
	IDFungsional *string `json:"idfungsional"`
	TmtFung      *string `json:"tmtfung"`
	IDStruktural *string `json:"idstruktural"`
	IDPendidikan *string `json:"idpendidikan"`
	IDOrg1       *string `json:"idorg1"`
	IDOrg2       *string `json:"idorg2"`
	IDOrg3       *string `json:"idorg3"`
	Status       *string `json:"status"`
	TmtPensiun   *string `json:"tmtpensiun"`
}
