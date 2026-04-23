package akademik

import pt "github.com/myunila/api-service/apps/pdrd/types"

type MatkulParams struct {
	pt.PaginationParams
	IDMk        *string `query:"id_mk"`
	IDSms       *string `query:"id_sms"`
	IDJenjDidik *int    `query:"id_jenj_didik"`
	IDJnsMk     *int    `query:"id_jns_mk"`
	IDKelMk     *int    `query:"id_kel_mk"`
	KodeMk      *string `query:"kode_mk"`
	WithDetail  *bool   `query:"with_detail"` // true = join ref tables
}

type KelasKuliahParams struct {
	pt.PaginationParams
	IDKls *string `query:"id_kls"`
	IDSmt *int    `query:"id_smt"`
	IDSms *string `query:"id_sms"`
	IDMk  *string `query:"id_mk"`
}

type JadwalKelasParams struct {
	pt.PaginationParams
	IDJdwlKls *string `query:"id_jdwl_kls"`
	IDKls     *string `query:"id_kls"`
	IDSmt     *int    `query:"id_smt"`
	Status    *string `query:"status"`
}

type KurikulumParams struct {
	pt.PaginationParams
	IDKurikulumSp *string `query:"id_kurikulum_sp"`
	IDSms         *string `query:"id_sms"`
	IDSmt         *int    `query:"id_smt"`
	IDJenjDidik   *int    `query:"id_jenj_didik"`
	ADigunakan    *int    `query:"a_digunakan"`
}
