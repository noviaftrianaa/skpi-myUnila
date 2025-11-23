package aktivitas_mahasiswa

import (
	"fmt"
	"time"
)

// transformAktivitas converts FeederAktivitasData to AktMhs entity
func transformAktivitas(data *FeederAktivitasData, systemUUID string, now time.Time) *AktMhs {
	akt := &AktMhs{
		IDAktMhs:       data.IDAktivitas,
		JudulAktMhs:    data.Judul,
		LokasiKegiatan: data.Lokasi,
		SKTugas:        data.SKTugas,
		KetAkt:         data.Keterangan,
		CreateDate:     now,
		IDCreator:      systemUUID,
		LastUpdate:     now,
		LastSync:       now,
		SoftDelete:     0,
	}

	// Convert FlexibleInt to *int for IDJnsAktMhs
	if data.IDJenisAktivitas != nil {
		val := int(*data.IDJenisAktivitas)
		akt.IDJnsAktMhs = &val
	}

	// Convert FlexibleInt to *int for AKomunal
	if data.UntukKampusMerdeka != nil {
		val := int(*data.UntukKampusMerdeka)
		akt.AKomunal = &val
	}

	// Foreign Keys
	if data.IDProdi != nil {
		akt.IDSMS = data.IDProdi
	}

	if data.IDSemester != nil {
		akt.IDSmt = data.IDSemester
	}

	// Parse tanggal SK tugas
	if data.TanggalSKTugas != nil && *data.TanggalSKTugas != "" {
		if tgl, err := parseDate(*data.TanggalSKTugas); err == nil {
			akt.TglSKTugas = &tgl
		}
	}

	return akt
}

// transformAnggotaList converts list of FeederAnggotaAktivitasData to AnggotaAktMhs entities
func transformAnggotaList(dataList []*FeederAnggotaAktivitasData, systemUUID string, now time.Time) []*AnggotaAktMhs {
	var result []*AnggotaAktMhs

	for _, data := range dataList {
		anggota := &AnggotaAktMhs{
			IDAngAktMhs: data.IDAnggota,
			IDAktMhs:    data.IDAktivitas,
			IDRegPd:     data.IDRegistrasiMahasiswa,
			NmPd:        data.NamaMahasiswa,
			NIPD:        data.NIM,
			CreateDate:  now,
			IDCreator:   systemUUID,
			LastUpdate:  now,
			LastSync:    now,
			SoftDelete:  0,
		}

		// Convert FlexibleInt to *int for JnsPeranMhs
		if data.JenisPeran != nil {
			val := int(*data.JenisPeran)
			anggota.JnsPeranMhs = &val
		}

		result = append(result, anggota)
	}

	return result
}

// parseDate parses date string from Feeder API (format: "YYYY-MM-DD" or "DD-MM-YYYY")
func parseDate(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("empty date string")
	}

	// Try multiple formats
	formats := []string{
		"2006-01-02",          // YYYY-MM-DD
		"02-01-2006",          // DD-MM-YYYY
		"2006-01-02 15:04:05", // YYYY-MM-DD HH:MM:SS
		"02/01/2006",          // DD/MM/YYYY
		"2006/01/02",          // YYYY/MM/DD
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}
