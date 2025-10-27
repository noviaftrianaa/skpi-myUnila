package swagger

// Referensi API Swagger Documentation
// This file contains Swagger annotations for all 33 Sister Referensi endpoints

// ==================== AGAMA ====================

// GetAllAgama godoc
// @Summary Get all agama (religions)
// @Description Retrieve all religion reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.Agama} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/agama [get]
func GetAllAgama() {}

// SyncAgamaFromSister godoc
// @Summary Sync agama from Sister API
// @Description Synchronize religion data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/agama/sync [post]
func SyncAgamaFromSister() {}

// ==================== NEGARA ====================

// GetAllNegara godoc
// @Summary Get all negara (countries)
// @Description Retrieve all country reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.Negara} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/negara [get]
func GetAllNegara() {}

// SyncNegaraFromSister godoc
// @Summary Sync negara from Sister API
// @Description Synchronize country data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/negara/sync [post]
func SyncNegaraFromSister() {}

// ==================== JENJANG PENDIDIKAN ====================

// GetAllJenjangPendidikan godoc
// @Summary Get all jenjang pendidikan (education levels)
// @Description Retrieve all education level reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenjangPendidikan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenjang-pendidikan [get]
func GetAllJenjangPendidikan() {}

// SyncJenjangPendidikanFromSister godoc
// @Summary Sync jenjang pendidikan from Sister API
// @Description Synchronize education level data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenjang-pendidikan/sync [post]
func SyncJenjangPendidikanFromSister() {}

// ==================== GELAR AKADEMIK ====================

// GetAllGelarAkademik godoc
// @Summary Get all gelar akademik (academic degrees)
// @Description Retrieve all academic degree reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.GelarAkademik} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/gelar-akademik [get]
func GetAllGelarAkademik() {}

// SyncGelarAkademikFromSister godoc
// @Summary Sync gelar akademik from Sister API
// @Description Synchronize academic degree data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/gelar-akademik/sync [post]
func SyncGelarAkademikFromSister() {}

// ==================== SEMESTER ====================

// GetAllSemester godoc
// @Summary Get all semester
// @Description Retrieve all semester reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.Semester} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/semester [get]
func GetAllSemester() {}

// SyncSemesterFromSister godoc
// @Summary Sync semester from Sister API
// @Description Synchronize semester data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/semester/sync [post]
func SyncSemesterFromSister() {}

// ==================== BIDANG STUDI ====================

// GetAllBidangStudi godoc
// @Summary Get all bidang studi (fields of study)
// @Description Retrieve all fields of study reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.BidangStudi} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/bidang-studi [get]
func GetAllBidangStudi() {}

// SyncBidangStudiFromSister godoc
// @Summary Sync bidang studi from Sister API
// @Description Synchronize fields of study data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/bidang-studi/sync [post]
func SyncBidangStudiFromSister() {}

// ==================== BIDANG USAHA ====================

// GetAllBidangUsaha godoc
// @Summary Get all bidang usaha (business sectors)
// @Description Retrieve all business sector reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.BidangUsaha} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/bidang-usaha [get]
func GetAllBidangUsaha() {}

// SyncBidangUsahaFromSister godoc
// @Summary Sync bidang usaha from Sister API
// @Description Synchronize business sector data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/bidang-usaha/sync [post]
func SyncBidangUsahaFromSister() {}

// ==================== JABATAN FUNGSIONAL ====================

// GetAllJabatanFungsional godoc
// @Summary Get all jabatan fungsional (functional positions)
// @Description Retrieve all functional position reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JabatanFungsional} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jabatan-fungsional [get]
func GetAllJabatanFungsional() {}

// SyncJabatanFungsionalFromSister godoc
// @Summary Sync jabatan fungsional from Sister API
// @Description Synchronize functional position data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jabatan-fungsional/sync [post]
func SyncJabatanFungsionalFromSister() {}

// ==================== JABATAN TUGAS TAMBAHAN ====================

// GetAllJabatanTugasTambahan godoc
// @Summary Get all jabatan tugas tambahan (additional duty positions)
// @Description Retrieve all additional duty position reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JabatanTugasTambahan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jabatan-tugas-tambahan [get]
func GetAllJabatanTugasTambahan() {}

// SyncJabatanTugasTambahanFromSister godoc
// @Summary Sync jabatan tugas tambahan from Sister API
// @Description Synchronize additional duty position data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jabatan-tugas-tambahan/sync [post]
func SyncJabatanTugasTambahanFromSister() {}

// ==================== JENIS BAHAN AJAR ====================

// GetAllJenisBahanAjar godoc
// @Summary Get all jenis bahan ajar (teaching material types)
// @Description Retrieve all teaching material type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisBahanAjar} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-bahan-ajar [get]
func GetAllJenisBahanAjar() {}

// SyncJenisBahanAjarFromSister godoc
// @Summary Sync jenis bahan ajar from Sister API
// @Description Synchronize teaching material type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-bahan-ajar/sync [post]
func SyncJenisBahanAjarFromSister() {}

// ==================== JENIS BEASISWA ====================

// GetAllJenisBeasiswa godoc
// @Summary Get all jenis beasiswa (scholarship types)
// @Description Retrieve all scholarship type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisBeasiswa} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-beasiswa [get]
func GetAllJenisBeasiswa() {}

// SyncJenisBeasiswaFromSister godoc
// @Summary Sync jenis beasiswa from Sister API
// @Description Synchronize scholarship type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-beasiswa/sync [post]
func SyncJenisBeasiswaFromSister() {}

// ==================== JENIS DIKLAT ====================

// GetAllJenisDiklat godoc
// @Summary Get all jenis diklat (training types)
// @Description Retrieve all training type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisDiklat} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-diklat [get]
func GetAllJenisDiklat() {}

// SyncJenisDiklatFromSister godoc
// @Summary Sync jenis diklat from Sister API
// @Description Synchronize training type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-diklat/sync [post]
func SyncJenisDiklatFromSister() {}

// ==================== JENIS DOKUMEN ====================

// GetAllJenisDokumen godoc
// @Summary Get all jenis dokumen (document types)
// @Description Retrieve all document type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisDokumen} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-dokumen [get]
func GetAllJenisDokumen() {}

// SyncJenisDokumenFromSister godoc
// @Summary Sync jenis dokumen from Sister API
// @Description Synchronize document type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-dokumen/sync [post]
func SyncJenisDokumenFromSister() {}

// ==================== JENIS KELUAR ====================

// GetAllJenisKeluar godoc
// @Summary Get all jenis keluar (exit types)
// @Description Retrieve all exit type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisKeluar} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-keluar [get]
func GetAllJenisKeluar() {}

// SyncJenisKeluarFromSister godoc
// @Summary Sync jenis keluar from Sister API
// @Description Synchronize exit type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-keluar/sync [post]
func SyncJenisKeluarFromSister() {}

// ==================== JENIS KEPANITIAAN ====================

// GetAllJenisKepanitiaan godoc
// @Summary Get all jenis kepanitiaan (committee types)
// @Description Retrieve all committee type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisKepanitiaan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-kepanitiaan [get]
func GetAllJenisKepanitiaan() {}

// SyncJenisKepanitiaanFromSister godoc
// @Summary Sync jenis kepanitiaan from Sister API
// @Description Synchronize committee type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-kepanitiaan/sync [post]
func SyncJenisKepanitiaanFromSister() {}

// ==================== JENIS KESEJAHTERAAN ====================

// GetAllJenisKesejahteraan godoc
// @Summary Get all jenis kesejahteraan (welfare types)
// @Description Retrieve all welfare type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisKesejahteraan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-kesejahteraan [get]
func GetAllJenisKesejahteraan() {}

// SyncJenisKesejahteraanFromSister godoc
// @Summary Sync jenis kesejahteraan from Sister API
// @Description Synchronize welfare type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-kesejahteraan/sync [post]
func SyncJenisKesejahteraanFromSister() {}

// ==================== JENIS PUBLIKASI ====================

// GetAllJenisPublikasi godoc
// @Summary Get all jenis publikasi (publication types)
// @Description Retrieve all publication type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisPublikasi} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-publikasi [get]
func GetAllJenisPublikasi() {}

// SyncJenisPublikasiFromSister godoc
// @Summary Sync jenis publikasi from Sister API
// @Description Synchronize publication type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-publikasi/sync [post]
func SyncJenisPublikasiFromSister() {}

// ==================== JENIS TES ====================

// GetAllJenisTes godoc
// @Summary Get all jenis tes (test types)
// @Description Retrieve all test type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisTes} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-tes [get]
func GetAllJenisTes() {}

// SyncJenisTesFromSister godoc
// @Summary Sync jenis tes from Sister API
// @Description Synchronize test type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-tes/sync [post]
func SyncJenisTesFromSister() {}

// ==================== JENIS TUNJANGAN ====================

// GetAllJenisTunjangan godoc
// @Summary Get all jenis tunjangan (allowance types)
// @Description Retrieve all allowance type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisTunjangan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-tunjangan [get]
func GetAllJenisTunjangan() {}

// SyncJenisTunjanganFromSister godoc
// @Summary Sync jenis tunjangan from Sister API
// @Description Synchronize allowance type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-tunjangan/sync [post]
func SyncJenisTunjanganFromSister() {}

// ==================== MEDIA PUBLIKASI ====================

// GetAllMediaPublikasi godoc
// @Summary Get all media publikasi (publication media)
// @Description Retrieve all publication media reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.MediaPublikasi} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/media-publikasi [get]
func GetAllMediaPublikasi() {}

// SyncMediaPublikasiFromSister godoc
// @Summary Sync media publikasi from Sister API
// @Description Synchronize publication media data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/media-publikasi/sync [post]
func SyncMediaPublikasiFromSister() {}

// ==================== SKIM KEGIATAN ====================

// GetAllSkimKegiatan godoc
// @Summary Get all skim kegiatan (activity schemes)
// @Description Retrieve all activity scheme reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.SkimKegiatan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/skim-kegiatan [get]
func GetAllSkimKegiatan() {}

// SyncSkimKegiatanFromSister godoc
// @Summary Sync skim kegiatan from Sister API
// @Description Synchronize activity scheme data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/skim-kegiatan/sync [post]
func SyncSkimKegiatanFromSister() {}

// ==================== STATUS KEPEGAWAIAN ====================

// GetAllStatusKepegawaian godoc
// @Summary Get all status kepegawaian (employment status)
// @Description Retrieve all employment status reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.StatusKepegawaian} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/status-kepegawaian [get]
func GetAllStatusKepegawaian() {}

// SyncStatusKepegawaianFromSister godoc
// @Summary Sync status kepegawaian from Sister API
// @Description Synchronize employment status data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/status-kepegawaian/sync [post]
func SyncStatusKepegawaianFromSister() {}

// ==================== SUMBER GAJI ====================

// GetAllSumberGaji godoc
// @Summary Get all sumber gaji (salary sources)
// @Description Retrieve all salary source reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.SumberGaji} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/sumber-gaji [get]
func GetAllSumberGaji() {}

// SyncSumberGajiFromSister godoc
// @Summary Sync sumber gaji from Sister API
// @Description Synchronize salary source data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/sumber-gaji/sync [post]
func SyncSumberGajiFromSister() {}

// ==================== TINGKAT PENGHARGAAN ====================

// GetAllTingkatPenghargaan godoc
// @Summary Get all tingkat penghargaan (award levels)
// @Description Retrieve all award level reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.TingkatPenghargaan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/tingkat-penghargaan [get]
func GetAllTingkatPenghargaan() {}

// SyncTingkatPenghargaanFromSister godoc
// @Summary Sync tingkat penghargaan from Sister API
// @Description Synchronize award level data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/tingkat-penghargaan/sync [post]
func SyncTingkatPenghargaanFromSister() {}

// ==================== WILAYAH ====================

// GetAllWilayah godoc
// @Summary Get all wilayah (regions)
// @Description Retrieve all region reference data from local database. Includes hierarchical data (Negara, Provinsi, Kota/Kabupaten, Kecamatan)
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.Wilayah} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/wilayah [get]
func GetAllWilayah() {}

// SyncWilayahFromSister godoc
// @Summary Sync wilayah from Sister API
// @Description Synchronize region data from Sister Kemdikbud API to local database. Syncs all 4 levels (0=Negara, 1=Provinsi, 2=Kota/Kabupaten, 3=Kecamatan)
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/wilayah/sync [post]
func SyncWilayahFromSister() {}

// ==================== KATEGORI CAPAIAN LUARAN ====================

// GetAllKategoriCapaianLuaran godoc
// @Summary Get all kategori capaian luaran (output achievement categories)
// @Description Retrieve all output achievement category reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.KategoriCapaianLuaran} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/kategori-capaian-luaran [get]
func GetAllKategoriCapaianLuaran() {}

// SyncKategoriCapaianLuaranFromSister godoc
// @Summary Sync kategori capaian luaran from Sister API
// @Description Synchronize output achievement category data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/kategori-capaian-luaran/sync [post]
func SyncKategoriCapaianLuaranFromSister() {}

// ==================== KATEGORI KEGIATAN ====================

// GetAllKategoriKegiatan godoc
// @Summary Get all kategori kegiatan (activity categories)
// @Description Retrieve all activity category reference data from local database. Includes hierarchical tree structure
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.KategoriKegiatan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/kategori-kegiatan [get]
func GetAllKategoriKegiatan() {}

// SyncKategoriKegiatanFromSister godoc
// @Summary Sync kategori kegiatan from Sister API
// @Description Synchronize activity category data from Sister Kemdikbud API to local database. Syncs all 16 menu types with tree structure
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/kategori-kegiatan/sync [post]
func SyncKategoriKegiatanFromSister() {}

// ==================== KELOMPOK BIDANG ====================

// GetAllKelompokBidang godoc
// @Summary Get all kelompok bidang (field groups)
// @Description Retrieve all field group reference data from local database. Includes both IPTEK and non-IPTEK fields
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.KelompokBidang} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/kelompok-bidang [get]
func GetAllKelompokBidang() {}

// SyncKelompokBidangFromSister godoc
// @Summary Sync kelompok bidang from Sister API
// @Description Synchronize field group data from Sister Kemdikbud API to local database. Syncs both iptek=true and iptek=false
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/kelompok-bidang/sync [post]
func SyncKelompokBidangFromSister() {}

// ==================== LEMBAGA SERTIFIKASI ====================

// GetAllLembagaSertifikasi godoc
// @Summary Get all lembaga sertifikasi (certification institutions)
// @Description Retrieve all certification institution reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.LembagaSertifikasi} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/lembaga-sertifikasi [get]
func GetAllLembagaSertifikasi() {}

// SyncLembagaSertifikasiFromSister godoc
// @Summary Sync lembaga sertifikasi from Sister API
// @Description Synchronize certification institution data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/lembaga-sertifikasi/sync [post]
func SyncLembagaSertifikasiFromSister() {}

// ==================== GOLONGAN PANGKAT ====================

// GetAllGolonganPangkat godoc
// @Summary Get all golongan pangkat (rank grades)
// @Description Retrieve all rank grade reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.GolonganPangkat} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/golongan-pangkat [get]
func GetAllGolonganPangkat() {}

// SyncGolonganPangkatFromSister godoc
// @Summary Sync golongan pangkat from Sister API
// @Description Synchronize rank grade data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/golongan-pangkat/sync [post]
func SyncGolonganPangkatFromSister() {}

// ==================== IKATAN KERJA ====================

// GetAllIkatanKerja godoc
// @Summary Get all ikatan kerja (work agreements)
// @Description Retrieve all work agreement reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.IkatanKerja} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/ikatan-kerja [get]
func GetAllIkatanKerja() {}

// SyncIkatanKerjaFromSister godoc
// @Summary Sync ikatan kerja from Sister API
// @Description Synchronize work agreement data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/ikatan-kerja/sync [post]
func SyncIkatanKerjaFromSister() {}

// ==================== JENIS PENGHARGAAN ====================

// GetAllJenisPenghargaan godoc
// @Summary Get all jenis penghargaan (award types)
// @Description Retrieve all award type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisPenghargaan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-penghargaan [get]
func GetAllJenisPenghargaan() {}

// SyncJenisPenghargaanFromSister godoc
// @Summary Sync jenis penghargaan from Sister API
// @Description Synchronize award type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-penghargaan/sync [post]
func SyncJenisPenghargaanFromSister() {}

// ==================== JENIS PEKERJAAN ====================

// GetAllJenisPekerjaan godoc
// @Summary Get all jenis pekerjaan (job types)
// @Description Retrieve all job type reference data from local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=[]referensi.JenisPekerjaan} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-pekerjaan [get]
func GetAllJenisPekerjaan() {}

// SyncJenisPekerjaanFromSister godoc
// @Summary Sync jenis pekerjaan from Sister API
// @Description Synchronize job type data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/jenis-pekerjaan/sync [post]
func SyncJenisPekerjaanFromSister() {}
