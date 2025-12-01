package transkrip_nilai

import (
	"strconv"
	"time"
)

// TransformFeederToEntity transforms Feeder API response to entity
func TransformFeederToEntity(feeder *FeederTranskripResponse) *TranskripNilai {
	entity := &TranskripNilai{
		IDRegPD:             feeder.IDRegistrasiMahasiswa,
		IDMK:                feeder.IDMK,
		IDKls:               feeder.IDKelasKuliah,
		IDKonversiAktivitas: feeder.IDKonversiAktivitas,
		IDEkuivalensi:       feeder.IDNilaiTransfer,
		LastSync:            time.Now().UTC(),
	}

	// Parse nilai_angka
	if feeder.NilaiAngka != nil && *feeder.NilaiAngka != "" {
		if val, err := strconv.ParseFloat(*feeder.NilaiAngka, 64); err == nil {
			entity.NilaiAngka = &val
		}
	}

	// Parse nilai_huruf
	if feeder.NilaiHuruf != nil && *feeder.NilaiHuruf != "" {
		entity.NilaiHuruf = feeder.NilaiHuruf
	}

	// Parse nilai_indeks
	if feeder.NilaiIndeks != nil && *feeder.NilaiIndeks != "" {
		if val, err := strconv.ParseFloat(*feeder.NilaiIndeks, 64); err == nil {
			entity.NilaiIndeks = &val
		}
	}

	// Parse smt_ke (smt_diambil)
	if feeder.SmtDiambil != nil && *feeder.SmtDiambil != "" {
		if val, err := strconv.Atoi(*feeder.SmtDiambil); err == nil {
			entity.SmtKe = val
		}
	}

	// Parse sks_mk
	if feeder.SksMatkuliah != nil && *feeder.SksMatkuliah != "" {
		if val, err := strconv.ParseFloat(*feeder.SksMatkuliah, 64); err == nil {
			entity.SksMK = val
		}
	}

	return entity
}
