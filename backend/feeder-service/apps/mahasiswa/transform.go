package mahasiswa

import (
	"fmt"
	"strings"
	"time"

	"github.com/myunila/feeder-service/pkg/timeutil"
)

// flexibleIntToInt converts *FlexibleInt to *int
func flexibleIntToInt(fi *FlexibleInt) *int {
	if fi == nil {
		return nil
	}
	val := int(*fi)
	return &val
}

// TransformFeederToEntities transforms Feeder API responses to database entities
// Uses regData.IDRegistrasiMahasiswa as the authoritative id_reg_pd source
// to prevent cross-registration mismatch for multi-registration students
func TransformFeederToEntities(
	feederMhs *FeederMahasiswaData,
	feederReg *FeederRiwayatPendidikan,
	feederLulusDO *FeederMahasiswaLulusDO,
	feederKuliah []*FeederPerkuliahanMahasiswa,
	idSP string,
	systemUUID string,
) (*PesertaDidik, *RegPd, []*KuliahMhs, error) {
	now := timeutil.NowWIB()

	// Transform PesertaDidik
	pesertaDidik := transformPesertaDidik(feederMhs, systemUUID, now)

	// Transform RegPd
	regPd := transformRegPd(feederMhs, feederReg, feederLulusDO, idSP, systemUUID, now)

	// Transform KuliahMhs (multiple records)
	// Use regData.IDRegistrasiMahasiswa (authoritative) instead of mhsData.IDRegistrasiMahasiswa
	kuliahMhsList := transformKuliahMhs(feederKuliah, feederReg.IDRegistrasiMahasiswa, systemUUID, now)

	return pesertaDidik, regPd, kuliahMhsList, nil
}

// transformPesertaDidik converts FeederMahasiswaData to PesertaDidik entity
func transformPesertaDidik(data *FeederMahasiswaData, systemUUID string, now time.Time) *PesertaDidik {
	pd := &PesertaDidik{
		IDPD:       data.IDMahasiswa,
		NamaPD:     data.NamaMahasiswa,
		JK:         data.JenisKelamin,
		NISN:       data.NISN,
		NIK:        data.NIK,
		CreateDate: now,
		IDCreator:  systemUUID,
		LastUpdate: now,
		LastSync:   now,
		SoftDelete: 0,
	}

	// Tempat & Tanggal Lahir (NOT NULL - use defaults if missing)
	if data.TempatLahir != nil && *data.TempatLahir != "" {
		pd.TempatLahir = data.TempatLahir
	} else {
		defaultPlace := "-"
		pd.TempatLahir = &defaultPlace
	}

	if data.TanggalLahir != nil {
		if tgl, err := parseDate(*data.TanggalLahir); err == nil {
			pd.TglLahir = &tgl
		}
	}

	// Address
	pd.Jalan = data.Jalan
	pd.RT = data.RT
	pd.RW = data.RW
	pd.NamaDusun = data.Dusun
	pd.Kelurahan = data.Kelurahan
	pd.KodePos = data.KodePos
	pd.TeleponRumah = data.Telepon
	pd.TeleponHP = data.Handphone
	pd.Email = data.Email

	// Wali
	pd.NamaWali = data.NamaWali
	if data.TanggalLahirWali != nil {
		if tgl, err := parseDate(*data.TanggalLahirWali); err == nil {
			pd.TglLahirWali = &tgl
		}
	}
	pd.IDPekerjaanWali = flexibleIntToInt(data.IDPekerjaanWali)
	pd.IDPenghasilanWali = flexibleIntToInt(data.IDPenghasilanWali)
	pd.IDPendidikanWali = flexibleIntToInt(data.IDPendidikanWali)

	// Ibu
	pd.NamaIbu = data.NamaIbuKandung
	if data.TanggalLahirIbu != nil {
		if tgl, err := parseDate(*data.TanggalLahirIbu); err == nil {
			pd.TglLahirIbu = &tgl
		}
	}
	pd.NIKIbu = data.NIKIbu
	pd.IDPekerjaanIbu = flexibleIntToInt(data.IDPekerjaanIbu)
	pd.IDPenghasilanIbu = flexibleIntToInt(data.IDPenghasilanIbu)
	pd.IDPendidikanIbu = flexibleIntToInt(data.IDPendidikanIbu)
	pd.IDKKIbu = flexibleIntToInt(data.IDKebutuhanKhususIbu)

	// Ayah
	pd.NamaAyah = data.NamaAyah
	if data.TanggalLahirAyah != nil {
		if tgl, err := parseDate(*data.TanggalLahirAyah); err == nil {
			pd.TglLahirAyah = &tgl
		}
	}
	pd.NIKAyah = data.NIKAyah
	pd.IDPekerjaanAyah = flexibleIntToInt(data.IDPekerjaanAyah)
	pd.IDPenghasilanAyah = flexibleIntToInt(data.IDPenghasilanAyah)
	pd.IDPendidikanAyah = flexibleIntToInt(data.IDPendidikanAyah)
	pd.IDKKAyah = flexibleIntToInt(data.IDKebutuhanKhususAyah)

	// Assistance
	// Convert FlexibleInt to int
	if data.PenerimaKPS != nil {
		val := int(*data.PenerimaKPS)
		pd.ATerimaKPS = &val
	}
	pd.NoKPS = data.NomorKPS
	pd.IDKK = flexibleIntToInt(data.IDKebutuhanKhususMahasiswa)
	pd.IDAlatTransport = flexibleIntToInt(data.IDAlatTransportasi)

	// References (REQUIRED NOT NULL fields)
	// id_kewarganegaraan - NOT NULL, default "ID"
	if data.IDNegara != nil && *data.IDNegara != "" {
		pd.IDKewarganegaraan = data.IDNegara
	} else {
		defaultCountry := "ID"
		pd.IDKewarganegaraan = &defaultCountry
	}

	// id_agama - NOT NULL, default 99 (tidak diketahui)
	if data.IDAgama != nil && int(*data.IDAgama) > 0 {
		pd.IDAgama = flexibleIntToInt(data.IDAgama)
	} else {
		defaultAgama := 99
		pd.IDAgama = &defaultAgama
	}

	pd.IDJenisTinggal = flexibleIntToInt(data.IDJenisTinggal)
	pd.IDWilayah = data.IDWilayah

	// id_stat_mhs - NOT NULL, map from nama_status_mahasiswa
	statusMhs := mapStatusMahasiswa(data.NamaStatusMahasiswa)
	pd.IDStatMhs = &statusMhs

	return pd
}

// transformRegPd converts Feeder data to RegPd entity
func transformRegPd(
	mhsData *FeederMahasiswaData,
	regData *FeederRiwayatPendidikan,
	lulusDOData *FeederMahasiswaLulusDO,
	idSP string,
	systemUUID string,
	now time.Time,
) *RegPd {
	reg := &RegPd{
		// Use regData.IDRegistrasiMahasiswa (from RiwayatPendidikan filtered by specific id_reg_pd)
		// NOT mhsData.IDRegistrasiMahasiswa (from DataLengkap which may return wrong registration
		// for students with multiple registrations across different prodi)
		IDRegPd:         regData.IDRegistrasiMahasiswa,
		IDSP:            idSP,
		IDSMS:           mhsData.IDProdi,
		IDPD:            mhsData.IDMahasiswa,
		IDSemesterMasuk: regData.IDPeriodeMasuk,
		CreateDate:      now,
		IDCreator:       systemUUID,
		LastUpdate:      now,
		LastSync:        now,
		SoftDelete:      0,
	}

	// REQUIRED NOT NULL fields with defaults
	// id_jns_daftar - default 1
	if regData.IDJenisDaftar != nil && *regData.IDJenisDaftar > 0 {
		val := int(*regData.IDJenisDaftar)
		reg.IDJenisDaftar = &val
	} else {
		defaultJnsDaftar := 1
		reg.IDJenisDaftar = &defaultJnsDaftar
	}

	// id_jalur_daftar - default 5
	if regData.IDJalurDaftar != nil && *regData.IDJalurDaftar > 0 {
		val := int(*regData.IDJalurDaftar)
		reg.IDJalurDaftar = &val
	} else {
		defaultJalur := 5
		reg.IDJalurDaftar = &defaultJalur
	}

	// id_pembiayaan - default 1
	if regData.IDPembiayaan != nil && *regData.IDPembiayaan > 0 {
		val := int(*regData.IDPembiayaan)
		reg.IDPembiayaan = &val
	} else {
		defaultPembiayaan := 1
		reg.IDPembiayaan = &defaultPembiayaan
	}

	// id_jns_keluar
	if regData.IDJenisKeluar != nil {
		val := int(*regData.IDJenisKeluar)
		reg.IDJenisKeluar = &val
	}

	// sks_diakui
	if regData.SKSDiakui != nil {
		val := int(*regData.SKSDiakui)
		reg.SKSDiakui = &val
	}

	// nipd (NIM) - REQUIRED NOT NULL
	if regData.NIM != nil && *regData.NIM != "" {
		reg.NIPD = regData.NIM
	} else {
		// Fallback: generate from ID or use placeholder
		defaultNIM := mhsData.IDMahasiswa[:10]
		reg.NIPD = &defaultNIM
	}

	// tgl_masuk_sp - REQUIRED NOT NULL
	if regData.TanggalDaftar != nil {
		if tgl, err := parseDate(*regData.TanggalDaftar); err == nil {
			reg.TglMasukSP = &tgl
		}
	}
	if reg.TglMasukSP == nil {
		// Fallback: use current date
		defaultTgl := now
		reg.TglMasukSP = &defaultTgl
	}

	// Transfer credits (SKSDiakui already converted above)
	reg.IDPTAsal = regData.IDPerguruanTinggiAsal
	reg.NamaPTAsal = regData.NamaPerguruanTinggiAsal
	reg.IDProdiAsal = regData.IDProdiAsal
	reg.NamaProdiAsal = regData.NamaProgramStudiAsal

	// Lulus/DO data (if available)
	if lulusDOData != nil {
		reg.IDJenisKeluar = lulusDOData.IDJenisKeluar

		if lulusDOData.TanggalKeluar != nil {
			if tgl, err := parseDate(*lulusDOData.TanggalKeluar); err == nil {
				reg.TglKeluar = &tgl
			}
		}

		reg.Keterangan = lulusDOData.Keterangan
		reg.SKYudisium = lulusDOData.NomorSKYudisium

		if lulusDOData.TanggalSKYudisium != nil {
			if tgl, err := parseDate(*lulusDOData.TanggalSKYudisium); err == nil {
				reg.TglSKYudisium = &tgl
			}
		}

		reg.IPK = lulusDOData.IPK
		reg.NoSeriIjazah = lulusDOData.NomorIjazah
		reg.JalurSkripsi = lulusDOData.JalurSkripsi
		reg.JudulSkripsi = lulusDOData.JudulSkripsi
		reg.BlnAwalBimbingan = lulusDOData.BulanAwalBimbingan
		reg.BlnAkhirBimbingan = lulusDOData.BulanAkhirBimbingan
		reg.AsalDataIjazah = lulusDOData.AsalIjazah
	}

	return reg
}

// transformKuliahMhs converts Feeder perkuliahan data to KuliahMhs entities
func transformKuliahMhs(
	feederList []*FeederPerkuliahanMahasiswa,
	idRegPd string,
	systemUUID string,
	now time.Time,
) []*KuliahMhs {
	var kuliahList []*KuliahMhs

	for _, feeder := range feederList {
		// Convert FlexibleFloat to float64
		var ips, ipk *float64
		if feeder.IPS != nil {
			val := float64(*feeder.IPS)
			ips = &val
		}
		if feeder.IPK != nil {
			val := float64(*feeder.IPK)
			ipk = &val
		}

		// Convert FlexibleInt to *int
		var sksSemester, sksTotal *int
		if feeder.SKSSemester != nil {
			val := int(*feeder.SKSSemester)
			sksSemester = &val
		}
		if feeder.SKSTotal != nil {
			val := int(*feeder.SKSTotal)
			sksTotal = &val
		}

		kuliah := &KuliahMhs{
			IDRegPd:       idRegPd,
			IDSmt:         feeder.IDSemester,
			IDStatMhs:     feeder.IDStatusMahasiswa,
			IPS:           ips,
			IPK:           ipk,
			SKSSemester:   sksSemester,
			TotalSKS:      sksTotal,
			BiayaSemester: feeder.BiayaKuliahSemester,
			CreateDate:    now,
			IDCreator:     systemUUID,
			LastUpdate:    now,
			LastSync:      now,
			SoftDelete:    0,
		}

		kuliahList = append(kuliahList, kuliah)
	}

	return kuliahList
}

// mapStatusMahasiswa maps status mahasiswa name to id_stat_mhs code
func mapStatusMahasiswa(namaStatus string) string {
	namaStatus = strings.ToLower(namaStatus)

	statusMap := map[string]string{
		"aktif":                      "A",
		"lulus":                      "L",
		"cuti":                       "C",
		"keluar":                     "K",
		"do":                         "D",
		"meninggal":                  "G",
		"mengundurkan diri":          "K",
		"putus studi":                "D",
		"non aktif":                  "N",
		"sedang double degree":       "A",
		"sedang tugas belajar":       "A",
		"pindah keluar pt":           "K",
		"lulus/keluar pindah pt":     "L",
		"transfer/pindah prodi":      "K",
		"aktif kelas karyawan":       "A",
	}

	if code, exists := statusMap[namaStatus]; exists {
		return code
	}

	// Default: if status contains "lulus", set as L
	if strings.Contains(namaStatus, "lulus") {
		return "L"
	}

	// Default: N (tidak aktif) if unknown
	return "N"
}

// parseDate parses date string from Feeder API (format: "YYYY-MM-DD" or "DD-MM-YYYY")
func parseDate(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("empty date string")
	}

	// Try multiple formats
	formats := []string{
		"2006-01-02",           // YYYY-MM-DD
		"02-01-2006",           // DD-MM-YYYY
		"2006-01-02 15:04:05",  // YYYY-MM-DD HH:MM:SS
		"02/01/2006",           // DD/MM/YYYY
		"2006/01/02",           // YYYY/MM/DD
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

// ExtractAngkatan extracts year from semester ID (e.g., "20211" -> "2021")
func ExtractAngkatan(idSemester string) string {
	if len(idSemester) >= 4 {
		return idSemester[:4]
	}
	return idSemester
}

// IsSemesterPendek checks if semester is short semester (last digit = 3)
func IsSemesterPendek(idSemester string) bool {
	if len(idSemester) == 0 {
		return false
	}
	lastChar := idSemester[len(idSemester)-1:]
	return lastChar == "3"
}

// buildLulusDOFromExistingRegPd constructs a FeederMahasiswaLulusDO from existing
// database RegPd data. This is used as a fallback when the Feeder API call to
// GetDetailMahasiswaLulusDO fails, to prevent overwriting existing graduation
// data with NULL values during the MERGE/upsert operation.
func buildLulusDOFromExistingRegPd(reg *RegPd) *FeederMahasiswaLulusDO {
	if reg == nil {
		return nil
	}

	lulusDO := &FeederMahasiswaLulusDO{
		IDJenisKeluar:       reg.IDJenisKeluar,
		Keterangan:          reg.Keterangan,
		NomorSKYudisium:     reg.SKYudisium,
		IPK:                 reg.IPK,
		NomorIjazah:         reg.NoSeriIjazah,
		JalurSkripsi:        reg.JalurSkripsi,
		JudulSkripsi:        reg.JudulSkripsi,
		BulanAwalBimbingan:  reg.BlnAwalBimbingan,
		BulanAkhirBimbingan: reg.BlnAkhirBimbingan,
		AsalIjazah:          reg.AsalDataIjazah,
	}

	// Convert time.Time back to string format for the DTO
	if reg.TglKeluar != nil {
		tglStr := reg.TglKeluar.Format("2006-01-02")
		lulusDO.TanggalKeluar = &tglStr
	}

	if reg.TglSKYudisium != nil {
		tglStr := reg.TglSKYudisium.Format("2006-01-02")
		lulusDO.TanggalSKYudisium = &tglStr
	}

	return lulusDO
}
