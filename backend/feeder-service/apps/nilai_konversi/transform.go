package nilai_konversi

import (
	"time"
)

// transformKonversi converts FeederKonversiKampusMerdeka to KonversiAktMhs entity
func transformKonversi(data *FeederKonversiKampusMerdeka, systemUUID string, now time.Time) *KonversiAktMhs {
	konversi := &KonversiAktMhs{
		IDKonversiAktivitas: data.IDKonversiAktivitas,
		IDMK:                data.IDMatkul,
		IDAktMhs:            data.IDAktivitas,
		CreateDate:          now,
		IDCreator:           systemUUID,
		LastUpdate:          now,
		LastSync:            now,
		SoftDelete:          0,
	}

	// ID Anggota (ang_akt_mhs)
	if data.IDAnggota != "" {
		konversi.IDAngAktMhs = &data.IDAnggota
	}

	// Nilai fields - extract from FlexFloat
	konversi.NilaiAngka = data.NilaiAngka.Value
	konversi.NilaiHuruf = data.NilaiHuruf
	konversi.NilaiIndeks = data.NilaiIndeks.Value
	konversi.SksMK = data.SksMataKuliah.Value

	return konversi
}

// transformKonversiList converts list of FeederKonversiKampusMerdeka to KonversiAktMhs entities
func transformKonversiList(dataList []*FeederKonversiKampusMerdeka, systemUUID string, now time.Time) []*KonversiAktMhs {
	var result []*KonversiAktMhs

	for _, data := range dataList {
		konversi := transformKonversi(data, systemUUID, now)
		result = append(result, konversi)
	}

	return result
}

// transformTransfer converts FeederNilaiTransfer to EkuivTransfer entity
func transformTransfer(data *FeederNilaiTransfer, systemUUID string, now time.Time) *EkuivTransfer {
	transfer := &EkuivTransfer{
		IDEkuivalensi: data.IDTransfer,
		IDMK:          data.IDMatkul,
		IDRegPD:       data.IDRegistrasiMahasiswa,
		CreateDate:    now,
		IDCreator:     systemUUID,
		LastUpdate:    now,
		LastSync:      now,
		SoftDelete:    0,
	}

	// String fields with defaults
	if data.KodeMataKuliahAsal != nil {
		transfer.KodeMKAsal = *data.KodeMataKuliahAsal
	}
	if data.NamaMataKuliahAsal != nil {
		transfer.NmMKAsal = *data.NamaMataKuliahAsal
	}
	if data.NilaiHurufAsal != nil {
		transfer.NilaiHurufAsal = *data.NilaiHurufAsal
	}
	if data.NilaiHurufDiakui != nil {
		transfer.NilaiHurufDiakui = *data.NilaiHurufDiakui
	}

	// FlexFloat/FlexInt fields - extract Value with defaults
	if data.SksMataKuliahAsal.Value != nil {
		transfer.SksAsal = *data.SksMataKuliahAsal.Value
	}
	if data.SksMataKuliahDiakui.Value != nil {
		transfer.SksDiakui = *data.SksMataKuliahDiakui.Value
	}
	if data.NilaiAngkaDiakui.Value != nil {
		transfer.NilaiAngkaDiakui = *data.NilaiAngkaDiakui.Value
	}

	// Optional fields
	transfer.IDAktMhs = data.IDAktivitas
	transfer.IDSmt = data.IDSemester
	transfer.IDSP = data.IDPerguruanTinggi

	return transfer
}

// transformTransferList converts list of FeederNilaiTransfer to EkuivTransfer entities
func transformTransferList(dataList []*FeederNilaiTransfer, systemUUID string, now time.Time) []*EkuivTransfer {
	var result []*EkuivTransfer

	for _, data := range dataList {
		transfer := transformTransfer(data, systemUUID, now)
		result = append(result, transfer)
	}

	return result
}
