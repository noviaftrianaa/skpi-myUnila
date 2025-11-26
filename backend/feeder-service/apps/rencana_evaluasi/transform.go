package rencana_evaluasi

import (
	"time"
)

// mapKomponenEvaluasi maps id_jenis_evaluasi to komponen_evaluasi code (TGS/QIZ/UTS/UAS)
// Based on Neo Feeder jenis_evaluasi reference:
// 1 = Tugas -> TGS
// 2 = Aktivitas Partisipatif -> TGS (mapped as assignment-like)
// 3 = Quiz -> QIZ
// 4 = UTS -> UTS
// 5 = UAS -> UAS
// Default to nil if unknown (will preserve existing value in DB)
func mapKomponenEvaluasi(idJnsEval *int) *string {
	if idJnsEval == nil {
		return nil
	}

	var komponen string
	switch *idJnsEval {
	case 1: // Tugas
		komponen = "TGS"
	case 2: // Aktivitas Partisipatif - map to TGS
		komponen = "TGS"
	case 3: // Quiz
		komponen = "QIZ"
	case 4: // UTS
		komponen = "UTS"
	case 5: // UAS
		komponen = "UAS"
	default:
		// Unknown jenis evaluasi - return nil to preserve existing value
		return nil
	}

	return &komponen
}

// transformRencanaEvaluasi converts FeederRencanaEvaluasiData to RencanaEvaluasi entity
func transformRencanaEvaluasi(data *FeederRencanaEvaluasiData, systemUUID string, now time.Time) *RencanaEvaluasi {
	// Map komponen_evaluasi from id_jenis_evaluasi
	komponenEvaluasi := mapKomponenEvaluasi(data.IDJenisEvaluasi.Value)

	re := &RencanaEvaluasi{
		IDReMk:           data.IDRencanaEvaluasi,
		IDJnsEval:        data.IDJenisEvaluasi.Value,
		IDMk:             data.IDMatkul,
		NoUrut:           data.NomorUrut.Value,
		KomponenEvaluasi: komponenEvaluasi,
		DeskIndo:         data.DeskripsiIndonesia,
		DeskIng:          data.DeskripsiInggris,
		BobotEvaluasi:    data.BobotEvaluasi.Value,
		CreateDate:       now,
		IDCreator:        systemUUID,
		LastUpdate:       now,
		LastSync:         now,
		SoftDelete:       0,
	}

	return re
}

// transformJenisEvaluasi converts FeederJenisEvaluasiData to JenisEvaluasi entity
func transformJenisEvaluasi(data *FeederJenisEvaluasiData, now time.Time) *JenisEvaluasi {
	je := &JenisEvaluasi{
		IDJnsEval:  data.IDJenisEvaluasi,
		NmJnsEval:  data.NamaJenisEvaluasi,
		CreateDate: now,
		LastUpdate: now,
		LastSync:   now,
	}

	return je
}
