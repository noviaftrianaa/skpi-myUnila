package nilai_perkuliahan

import (
	"time"
)

// transformNilaiPerkuliahan converts FeederNilaiPerkuliahanData to NilaiSmtMhs entity
func transformNilaiPerkuliahan(data *FeederNilaiPerkuliahanData, systemUUID string, now time.Time) *NilaiSmtMhs {
	nilai := &NilaiSmtMhs{
		IDRegPd:    data.IDRegistrasiMahasiswa,
		IDKls:      data.IDKelasKuliah,
		CreateDate: now,
		IDCreator:  systemUUID,
		LastUpdate: now,
		LastSync:   now,
		SoftDelete: 0,
	}

	// Nilai Angka from FlexFloat
	if data.NilaiAngka.Value != nil {
		nilai.NilaiAngka = data.NilaiAngka.Value
	}

	// Nilai Huruf
	if data.NilaiHuruf != nil {
		nilai.NilaiHuruf = data.NilaiHuruf
	}

	// Nilai Indeks from FlexFloat
	if data.NilaiIndeks.Value != nil {
		nilai.NilaiIndeks = data.NilaiIndeks.Value
	}

	return nilai
}

// transformNilaiPerkuliahanList converts list of FeederNilaiPerkuliahanData to NilaiSmtMhs entities
func transformNilaiPerkuliahanList(dataList []*FeederNilaiPerkuliahanData, systemUUID string, now time.Time) []*NilaiSmtMhs {
	var result []*NilaiSmtMhs

	for _, data := range dataList {
		nilai := transformNilaiPerkuliahan(data, systemUUID, now)
		result = append(result, nilai)
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
