package kelas_kuliah

import (
	"time"
)

// transformKelasKuliah converts FeederKelasKuliahData to KelasKuliah entity
func transformKelasKuliah(data *FeederKelasKuliahData, systemUUID string, now time.Time) *KelasKuliah {
	kelas := &KelasKuliah{
		IDKls:      data.IDKelasKuliah,
		NmKls:      safeString(data.NamaKelasKuliah),
		CreateDate: now,
		IDCreator:  systemUUID,
		LastUpdate: now,
		LastSync:   now,
		SoftDelete: 0,
	}

	// Foreign Keys
	if data.IDProdi != nil {
		kelas.IDSMS = *data.IDProdi
	}

	if data.IDSemester != nil {
		kelas.IDSmt = *data.IDSemester
	}

	if data.IDMatkul != nil {
		kelas.IDMk = *data.IDMatkul
	}

	// SKS field from FlexFloat
	if data.SKS.Value != nil {
		kelas.SksMk = data.SKS.Value
	}

	// A Pengguna PDITT from FlexInt
	if data.ApaUntukPditt.Value != nil {
		kelas.APenggunaPditt = *data.ApaUntukPditt.Value
	}

	return kelas
}

// transformDosenPengajar converts FeederDosenPengajarData to AktAjarDosen entity
func transformDosenPengajar(data *FeederDosenPengajarData, systemUUID string, now time.Time) *AktAjarDosen {
	ajar := &AktAjarDosen{
		IDAjar:     data.IDAktivitasMengajar,
		CreateDate: now,
		IDCreator:  systemUUID,
		LastUpdate: now,
		LastSync:   now,
		SoftDelete: 0,
	}

	// Foreign Keys
	if data.IDRegistrasiDosen != nil {
		ajar.IDRegPtk = *data.IDRegistrasiDosen
	}

	if data.IDSubstansi != nil {
		ajar.IDSubst = data.IDSubstansi
	}

	if data.IDKelasKuliah != nil {
		ajar.IDKls = *data.IDKelasKuliah
	}

	// Jenis Evaluasi from FlexInt
	if data.IDJenisEvaluasi.Value != nil {
		ajar.IDJnsEval = *data.IDJenisEvaluasi.Value
	}

	// SKS Substansi Total from FlexFloat
	if data.SksSubstansiTotal.Value != nil {
		ajar.SksSubstTot = *data.SksSubstansiTotal.Value
	}

	// Rencana Minggu Pertemuan from FlexInt
	if data.RencanaMingguPertemuan.Value != nil {
		ajar.JmlTmRenc = *data.RencanaMingguPertemuan.Value
	}

	// Realisasi Minggu Pertemuan from FlexInt
	if data.RealisasiMingguPertemuan.Value != nil {
		ajar.JmlTmReal = data.RealisasiMingguPertemuan.Value
	}

	return ajar
}

// transformDosenPengajarList converts list of FeederDosenPengajarData to AktAjarDosen entities
func transformDosenPengajarList(dataList []*FeederDosenPengajarData, systemUUID string, now time.Time) []*AktAjarDosen {
	var result []*AktAjarDosen

	for _, data := range dataList {
		ajar := transformDosenPengajar(data, systemUUID, now)
		result = append(result, ajar)
	}

	return result
}

// safeString returns empty string if pointer is nil, otherwise the value
func safeString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}
