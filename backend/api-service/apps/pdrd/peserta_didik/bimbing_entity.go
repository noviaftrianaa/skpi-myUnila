package pesertadidik

import (
	"github.com/myunila/api-service/internal/types"
	"github.com/myunila/api-service/pkg/utils"
)

// BimbingMhs — pivot bimbingan dosen → aktivitas mhs (skripsi/tesis/disertasi)
type BimbingMhs struct {
	IDBimbMhs       utils.UUID          `db:"id_bimb_mhs" json:"id_bimb_mhs"`
	IDSDM           utils.UUID          `db:"id_sdm" json:"id_sdm"`
	NmSDM           *string             `db:"nm_sdm" json:"nm_sdm"`
	Nidn            *string             `db:"nidn" json:"nidn"`
	IDAktMhs        utils.UUID          `db:"id_akt_mhs" json:"id_akt_mhs"`
	JudulAktMhs     *string             `db:"judul_akt_mhs" json:"judul_akt_mhs"`
	IDJnsAktMhs     *int                `db:"id_jns_akt_mhs" json:"id_jns_akt_mhs"`
	NmJnsAktMhs     *string             `db:"nm_jns_akt_mhs" json:"nm_jns_akt_mhs"`
	IDKatgiat       *int                `db:"id_katgiat" json:"id_katgiat"`
	NmKatgiat       *string             `db:"nm_katgiat" json:"nm_katgiat"`
	UrutanPromotor  *int                `db:"urutan_promotor" json:"urutan_promotor"`
	LastSync        types.SQLServerTime `db:"last_sync" json:"last_sync"`
}

// UjiMhs — pivot pengujian dosen → aktivitas mhs (sidang)
type UjiMhs struct {
	IDUjiMhs    utils.UUID          `db:"id_uji_mhs" json:"id_uji_mhs"`
	IDSDM       utils.UUID          `db:"id_sdm" json:"id_sdm"`
	NmSDM       *string             `db:"nm_sdm" json:"nm_sdm"`
	Nidn        *string             `db:"nidn" json:"nidn"`
	IDAktMhs    utils.UUID          `db:"id_akt_mhs" json:"id_akt_mhs"`
	JudulAktMhs *string             `db:"judul_akt_mhs" json:"judul_akt_mhs"`
	IDKatgiat   *int                `db:"id_katgiat" json:"id_katgiat"`
	NmKatgiat   *string             `db:"nm_katgiat" json:"nm_katgiat"`
	UrutanUji   *int                `db:"urutan_uji" json:"urutan_uji"`
	LastSync    types.SQLServerTime `db:"last_sync" json:"last_sync"`
}
