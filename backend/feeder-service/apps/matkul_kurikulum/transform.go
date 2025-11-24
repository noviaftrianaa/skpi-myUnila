package matkul_kurikulum

import (
	"fmt"
	"time"
)

// transformKurikulum converts FeederKurikulumData to KurikulumSP entity
func transformKurikulum(data *FeederKurikulumData, systemUUID string, now time.Time) *KurikulumSP {
	kur := &KurikulumSP{
		IDKurikulumSP: data.IDKurikulum,
		IDSmt:         data.IDSemester,
		IDSMS:         data.IDProdi,
		NmKurikulumSP: data.NamaKurikulum,
		CreateDate:    now,
		IDCreator:     systemUUID,
		LastUpdate:    now,
		LastSync:      now,
		SoftDelete:    0,
	}

	// Convert FlexibleInt to *int
	if data.IDJenisDidik != nil {
		val := int(*data.IDJenisDidik)
		kur.IDJenjDidik = &val
	}

	if data.JumlahSemesterNormal != nil {
		val := int(*data.JumlahSemesterNormal)
		kur.JmlhSmtNormal = &val
	}

	// Convert FlexibleInt to *float64 for SKS fields
	if data.JumlahSksLulus != nil {
		val := float64(*data.JumlahSksLulus)
		kur.JmlhSksLulus = &val
	}

	if data.JumlahSksWajib != nil {
		val := float64(*data.JumlahSksWajib)
		kur.JmlhSksWajib = &val
	}

	if data.JumlahSksPilihan != nil {
		val := float64(*data.JumlahSksPilihan)
		kur.JmlhSksPilihan = &val
	}

	if data.JumlahSksMataKuliahWajib != nil {
		val := float64(*data.JumlahSksMataKuliahWajib)
		kur.JmlhSksMkWajib = &val
	}

	if data.JumlahSksMataKuliahPilihan != nil {
		val := float64(*data.JumlahSksMataKuliahPilihan)
		kur.JmlhSksMkPilih = &val
	}

	return kur
}

// transformMatkulKurikulum converts FeederMatkulKurikulumData to MatkulKurikulum entity
func transformMatkulKurikulum(data *FeederMatkulKurikulumData, systemUUID string, now time.Time) *MatkulKurikulum {
	mk := &MatkulKurikulum{
		IDKurikulumSP: data.IDKurikulum,
		IDMk:          data.IDMatkul,
		CreateDate:    now,
		IDCreator:     systemUUID,
		LastUpdate:    now,
		LastSync:      now,
		SoftDelete:    0,
	}

	// Convert FlexibleInt to *int
	if data.Semester != nil {
		val := int(*data.Semester)
		mk.Smt = &val
	}

	// Convert FlexibleInt to *float64 for SKS fields
	if data.SksMatKul != nil {
		val := float64(*data.SksMatKul)
		mk.SksMk = &val
	}

	if data.SksTatapMuka != nil {
		val := float64(*data.SksTatapMuka)
		mk.SksTm = &val
	}

	if data.SksPraktek != nil {
		val := float64(*data.SksPraktek)
		mk.SksPrak = &val
	}

	if data.SksPraktekLapangan != nil {
		val := float64(*data.SksPraktekLapangan)
		mk.SksPrakLap = &val
	}

	if data.SksSimulasi != nil {
		val := float64(*data.SksSimulasi)
		mk.SksSim = &val
	}

	if data.ApakahWajib != nil {
		val := int(*data.ApakahWajib)
		mk.AWajib = &val
	}

	return mk
}

// transformMatkul converts FeederMatkulData to Matkul entity
func transformMatkul(data *FeederMatkulData, systemUUID string, now time.Time) *Matkul {
	mk := &Matkul{
		IDMkPDDikti:                data.IDMatkul,
		IDSMS:                      data.IDProdi,
		KodeMk:                     data.KodeMataKuliah,
		NmMk:                       data.NamaMataKuliah,
		JnsMk:                      data.JenisMk,
		KelMk:                      data.KelompokMk,
		MetodePelaksanaanKuliah:   data.MetodeKuliah,
		CreateDate:                 now,
		IDCreator:                  systemUUID,
		LastUpdate:                 now,
		LastSync:                   now,
		SoftDelete:                 0,
	}

	// Convert FlexibleInt to *int
	if data.IDJenisDidik != nil {
		val := int(*data.IDJenisDidik)
		mk.IDJenjDidik = &val
	}

	// Convert FlexibleInt to *float64 for SKS fields
	if data.SksMatKul != nil {
		val := float64(*data.SksMatKul)
		mk.SksMk = &val
	}

	if data.SksTatapMuka != nil {
		val := float64(*data.SksTatapMuka)
		mk.SksTm = &val
	}

	if data.SksPraktek != nil {
		val := float64(*data.SksPraktek)
		mk.SksPrak = &val
	}

	if data.SksPraktekLapangan != nil {
		val := float64(*data.SksPraktekLapangan)
		mk.SksPrakLap = &val
	}

	if data.SksSimulasi != nil {
		val := float64(*data.SksSimulasi)
		mk.SksSim = &val
	}

	if data.AdaSap != nil {
		val := int(*data.AdaSap)
		mk.ASap = &val
	}

	if data.AdaSilabus != nil {
		val := int(*data.AdaSilabus)
		mk.ASilabus = &val
	}

	if data.AdaBahanAjar != nil {
		val := int(*data.AdaBahanAjar)
		mk.ABahanAjar = &val
	}

	if data.AdaAcaraPraktek != nil {
		val := int(*data.AdaAcaraPraktek)
		mk.AcaraPrak = &val
	}

	if data.AdaDiktat != nil {
		val := int(*data.AdaDiktat)
		mk.ADiktat = &val
	}

	// Parse tanggal
	if data.TanggalMulaiEfektif != nil && *data.TanggalMulaiEfektif != "" {
		if tgl, err := parseDate(*data.TanggalMulaiEfektif); err == nil {
			mk.TglMulaiEfektif = &tgl
		}
	}

	if data.TanggalAkhirEfektif != nil && *data.TanggalAkhirEfektif != "" {
		if tgl, err := parseDate(*data.TanggalAkhirEfektif); err == nil {
			mk.TglAkhirEfektif = &tgl
		}
	}

	return mk
}

// parseDate parses date string from Feeder API
func parseDate(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("empty date string")
	}

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
