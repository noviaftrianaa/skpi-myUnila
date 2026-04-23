// Package pegawai — API untuk pegawai dari schema sikep.pegawai.
// Sumber data: SIKEP (Sistem Kepegawaian Unila).
// Berbeda dengan pdrd.sdm (SISTER); sikep lebih komprehensif untuk tendik/struktural.
package pegawai

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// Pegawai — list ringkas
type Pegawai struct {
	IDPegawai  utils.UUID           `db:"id_pegawai" json:"id_pegawai"`
	NmPegawai  string               `db:"nm_pegawai" json:"nm_pegawai"`
	Jk         *string              `db:"jk" json:"jk"`
	Nip        *string              `db:"nip" json:"nip"`
	Nidn       *string              `db:"nidn" json:"nidn"`
	TmpLahir   *string              `db:"tmp_lahir" json:"tmp_lahir"`
	TglLahir   *types.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	JnsPegawai *string              `db:"jns_pegawai" json:"jns_pegawai"`
	JnsTenaga  *string              `db:"jns_tenaga" json:"jns_tenaga"`
	Status     *string              `db:"status" json:"status"`
	IDGol      *int                 `db:"id_gol" json:"id_gol"`
	IDJabfung  *int                 `db:"id_jabfung" json:"id_jabfung"`
	IDJabstruk *int                 `db:"id_jabstruk" json:"id_jabstruk"`
	IDPend     *int                 `db:"id_pend" json:"id_pend"`
	IDUnitOrga *int                 `db:"id_unit_orga" json:"id_unit_orga"`
	LastSync   types.SQLServerTime  `db:"last_sync" json:"last_sync"`
}

// PegawaiDetail — include nama referensi (Gol, Jabfung, Jabstruk, Pendidikan, Unit)
type PegawaiDetail struct {
	IDPegawai   utils.UUID           `db:"id_pegawai" json:"id_pegawai"`
	NmPegawai   string               `db:"nm_pegawai" json:"nm_pegawai"`
	Jk          *string              `db:"jk" json:"jk"`
	Nip         *string              `db:"nip" json:"nip"`
	Nidn        *string              `db:"nidn" json:"nidn"`
	TmpLahir    *string              `db:"tmp_lahir" json:"tmp_lahir"`
	TglLahir    *types.SQLServerTime `db:"tgl_lahir" json:"tgl_lahir"`
	Alamat      *string              `db:"alamat" json:"alamat"`
	JnsPegawai  *string              `db:"jns_pegawai" json:"jns_pegawai"`
	JnsTenaga   *string              `db:"jns_tenaga" json:"jns_tenaga"`
	TmtCpns     *types.SQLServerTime `db:"tmt_cpns" json:"tmt_cpns"`
	TmtPns      *types.SQLServerTime `db:"tmt_pns" json:"tmt_pns"`
	Status      *string              `db:"status" json:"status"`
	TmtPensiun  *types.SQLServerTime `db:"tmt_pensiun" json:"tmt_pensiun"`

	IDGol      *int    `db:"id_gol" json:"id_gol"`
	NmGol      *string `db:"nm_gol" json:"nm_gol"`
	NmPangkat  *string `db:"nm_pangkat" json:"nm_pangkat"`
	KdGol      *string `db:"kd_gol" json:"kd_gol"`
	TmtGol     *types.SQLServerTime `db:"tmt_gol" json:"tmt_gol"`

	IDJabfung  *int    `db:"id_jabfung" json:"id_jabfung"`
	NmJabfung  *string `db:"nm_jabfung" json:"nm_jabfung"`
	TmtJabfung *types.SQLServerTime `db:"tmt_jabfung" json:"tmt_jabfung"`

	IDJabstruk *int    `db:"id_jabstruk" json:"id_jabstruk"`
	NmJabstruk *string `db:"nm_jabstruk" json:"nm_jabstruk"`
	KdJabstruk *string `db:"kd_jabstruk" json:"kd_jabstruk"`

	IDPend *int    `db:"id_pend" json:"id_pend"`
	NmPend *string `db:"nm_pend" json:"nm_pend"`

	IDUnitOrga *int    `db:"id_unit_orga" json:"id_unit_orga"`
	NmUnitOrga *string `db:"nm_unit_orga" json:"nm_unit_orga"`
	KdUnitOrga *string `db:"kd_unit_orga" json:"kd_unit_orga"`

	LastSync types.SQLServerTime `db:"last_sync" json:"last_sync"`
}
