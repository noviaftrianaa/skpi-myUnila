package referensi

import (
	"log"
	"sister-service/pkg/response"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Controller struct {
	service Service
}

// NewController creates a new controller instance
func NewController(service Service) *Controller {
	return &Controller{service: service}
}

// GetAllAgama handles GET request to fetch all agama
// @Summary Get all agama
// @Description Retrieve all agama (religion) reference data
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]referensi.Agama}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/agama [get]
func (ctrl *Controller) GetAllAgama(c *fiber.Ctx) error {
	agamaList, err := ctrl.service.GetAllAgama(c.Context())
	if err != nil {
		log.Printf("Error in GetAllAgama controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch agama", err.Error())
	}

	return response.Success(c, "Agama retrieved successfully", agamaList)
}

// GetAgamaByID handles GET request to fetch agama by ID
// @Summary Get agama by ID
// @Description Retrieve agama (religion) reference data by ID
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Agama ID"
// @Success 200 {object} response.APIResponse{data=referensi.Agama}
// @Failure 400 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/agama/{id} [get]
func (ctrl *Controller) GetAgamaByID(c *fiber.Ctx) error {
	idParam := c.Params("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return response.BadRequest(c, "Invalid ID parameter", err.Error())
	}

	agama, err := ctrl.service.GetAgamaByID(c.Context(), id)
	if err != nil {
		log.Printf("Error in GetAgamaByID controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch agama", err.Error())
	}

	if agama == nil {
		return response.NotFound(c, "Agama not found")
	}

	return response.Success(c, "Agama retrieved successfully", agama)
}

// SyncAgamaFromSister handles POST request to sync agama from Sister API
// @Summary Sync agama from Sister API
// @Description Synchronize agama (religion) data from Sister Kemdikbud API. User identity is automatically extracted from JWT token.
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=referensi.SyncResponse}
// @Failure 401 {object} response.APIResponse "Unauthorized - Missing or invalid JWT token"
// @Failure 403 {object} response.APIResponse "Forbidden - Requires Developer role"
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/agama/sync [post]
func (ctrl *Controller) SyncAgamaFromSister(c *fiber.Ctx) error {
	// Extract user info from JWT context (set by JWTAuth middleware)
	userID, _ := c.Locals("user_id").(string)
	username, _ := c.Locals("username").(string)
	name, _ := c.Locals("name").(string)

	// Use username as synced_by identifier (or use name/ID as needed)
	syncedBy := username
	if syncedBy == "" {
		syncedBy = name // Fallback to name
	}
	if syncedBy == "" {
		syncedBy = userID // Fallback to ID
	}
	if syncedBy == "" {
		syncedBy = "system" // Last fallback
	}

	log.Printf("🔄 Sync agama initiated by: %s (ID: %s, Name: %s)", username, userID, name)

	totalRecords, err := ctrl.service.SyncAgamaFromSister(c.Context(), syncedBy)
	if err != nil {
		log.Printf("❌ Error in SyncAgamaFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync agama from Sister API", err.Error())
	}

	log.Printf("✅ Sync completed: %d records synced by %s", totalRecords, syncedBy)

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     syncedBy,
		Message:      "Agama data synchronized successfully",
	}

	return response.Success(c, "Sync completed successfully", syncResp)
}

// ==================== NEGARA HANDLERS ====================

// GetAllNegara handles GET /api/v1/referensi/negara
func (ctrl *Controller) GetAllNegara(c *fiber.Ctx) error {
	negaraList, err := ctrl.service.GetAllNegara(c.Context())
	if err != nil {
		log.Printf("Error in GetAllNegara controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch negara", err.Error())
	}

	return response.Success(c, "Negara retrieved successfully", negaraList)
}

// GetNegaraByID handles GET /api/v1/referensi/negara/:id
func (ctrl *Controller) GetNegaraByID(c *fiber.Ctx) error {
	id := c.Params("id")

	negara, err := ctrl.service.GetNegaraByID(c.Context(), id)
	if err != nil {
		log.Printf("Error in GetNegaraByID controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch negara", err.Error())
	}

	if negara == nil {
		return response.NotFound(c, "Negara not found")
	}

	return response.Success(c, "Negara retrieved successfully", negara)
}

// SyncNegaraFromSister handles POST /api/v1/referensi/negara/sync
func (ctrl *Controller) SyncNegaraFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncNegaraFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncNegaraFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync negara from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data negara berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Negara synced successfully", syncResp)
}

// ==================== JENJANG PENDIDIKAN HANDLERS ====================

// GetAllJenjangPendidikan handles GET /api/v1/referensi/jenjang-pendidikan
func (ctrl *Controller) GetAllJenjangPendidikan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenjangPendidikan(c.Context())
	if err != nil {
		log.Printf("Error in GetAllJenjangPendidikan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenjang pendidikan", err.Error())
	}

	return response.Success(c, "Jenjang pendidikan retrieved successfully", list)
}

// SyncJenjangPendidikanFromSister handles POST /api/v1/referensi/jenjang-pendidikan/sync
func (ctrl *Controller) SyncJenjangPendidikanFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncJenjangPendidikanFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenjangPendidikanFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync jenjang pendidikan from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data jenjang pendidikan berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Jenjang pendidikan synced successfully", syncResp)
}

// ==================== GELAR AKADEMIK HANDLERS ====================

// GetAllGelarAkademik handles GET /api/v1/referensi/gelar-akademik
func (ctrl *Controller) GetAllGelarAkademik(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllGelarAkademik(c.Context())
	if err != nil {
		log.Printf("Error in GetAllGelarAkademik controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch gelar akademik", err.Error())
	}

	return response.Success(c, "Gelar akademik retrieved successfully", list)
}

// SyncGelarAkademikFromSister handles POST /api/v1/referensi/gelar-akademik/sync
func (ctrl *Controller) SyncGelarAkademikFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncGelarAkademikFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncGelarAkademikFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync gelar akademik from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data gelar akademik berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Gelar akademik synced successfully", syncResp)
}

// ==================== SEMESTER HANDLERS ====================

// GetAllSemester handles GET /api/v1/referensi/semester
func (ctrl *Controller) GetAllSemester(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllSemester(c.Context())
	if err != nil {
		log.Printf("Error in GetAllSemester controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch semester", err.Error())
	}

	return response.Success(c, "Semester retrieved successfully", list)
}

// SyncSemesterFromSister handles POST /api/v1/referensi/semester/sync
func (ctrl *Controller) SyncSemesterFromSister(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	totalRecords, err := ctrl.service.SyncSemesterFromSister(c.Context(), username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncSemesterFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync semester from Sister API", err.Error())
	}

	syncResp := SyncResponse{
		TotalRecords: totalRecords,
		SyncedBy:     username.(string),
		Message:      "Data semester berhasil disinkronkan dari Sister API",
	}

	return response.Success(c, "Semester synced successfully", syncResp)
}

// ==================== NEW 29 ENDPOINTS ====================

// GetAllBidangStudi handles GET /api/v1/referensi/bidang-studi
// @Summary Get all bidang studi
// @Description Retrieve all bidang studi (field of study) reference data
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]referensi.BidangStudi}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/bidang-studi [get]
func (ctrl *Controller) GetAllBidangStudi(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllBidangStudi()
	if err != nil {
		log.Printf("Error in GetAllBidangStudi controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch bidang studi", err.Error())
	}
	return response.Success(c, "Bidang studi retrieved successfully", list)
}

func (ctrl *Controller) SyncBidangStudi(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncBidangStudiFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncBidangStudi: %v", err)
		return response.InternalServerError(c, "Failed to sync bidang studi", err.Error())
	}
	return response.Success(c, "Bidang studi synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Bidang studi synced successfully"})
}

// GetAllBidangUsaha handles GET /api/v1/referensi/bidang-usaha
func (ctrl *Controller) GetAllBidangUsaha(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllBidangUsaha()
	if err != nil {
		log.Printf("Error in GetAllBidangUsaha controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch bidang usaha", err.Error())
	}
	return response.Success(c, "Bidang usaha retrieved successfully", list)
}

func (ctrl *Controller) SyncBidangUsaha(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncBidangUsahaFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncBidangUsaha: %v", err)
		return response.InternalServerError(c, "Failed to sync bidang usaha", err.Error())
	}
	return response.Success(c, "Bidang usaha synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Bidang usaha synced successfully"})
}

// GetAllJabatanFungsional handles GET /api/v1/referensi/jabatan-fungsional
func (ctrl *Controller) GetAllJabatanFungsional(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJabatanFungsional()
	if err != nil {
		log.Printf("Error in GetAllJabatanFungsional controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jabatan fungsional", err.Error())
	}
	return response.Success(c, "Jabatan fungsional retrieved successfully", list)
}

func (ctrl *Controller) SyncJabatanFungsional(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJabatanFungsionalFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJabatanFungsional: %v", err)
		return response.InternalServerError(c, "Failed to sync jabatan fungsional", err.Error())
	}
	return response.Success(c, "Jabatan fungsional synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jabatan fungsional synced successfully"})
}

// GetAllJabatanTugasTambahan handles GET /api/v1/referensi/jabatan-tugas-tambahan
func (ctrl *Controller) GetAllJabatanTugasTambahan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJabatanTugasTambahan()
	if err != nil {
		log.Printf("Error in GetAllJabatanTugasTambahan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jabatan tugas tambahan", err.Error())
	}
	return response.Success(c, "Jabatan tugas tambahan retrieved successfully", list)
}

func (ctrl *Controller) SyncJabatanTugasTambahan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJabatanTugasTambahanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJabatanTugasTambahan: %v", err)
		return response.InternalServerError(c, "Failed to sync jabatan tugas tambahan", err.Error())
	}
	return response.Success(c, "Jabatan tugas tambahan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jabatan tugas tambahan synced successfully"})
}

// GetAllJenisBahanAjar handles GET /api/v1/referensi/jenis-bahan-ajar
func (ctrl *Controller) GetAllJenisBahanAjar(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisBahanAjar()
	if err != nil {
		log.Printf("Error in GetAllJenisBahanAjar controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis bahan ajar", err.Error())
	}
	return response.Success(c, "Jenis bahan ajar retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisBahanAjar(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisBahanAjarFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisBahanAjar: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis bahan ajar", err.Error())
	}
	return response.Success(c, "Jenis bahan ajar synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis bahan ajar synced successfully"})
}

// GetAllJenisBeasiswa handles GET /api/v1/referensi/jenis-beasiswa
func (ctrl *Controller) GetAllJenisBeasiswa(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisBeasiswa()
	if err != nil {
		log.Printf("Error in GetAllJenisBeasiswa controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis beasiswa", err.Error())
	}
	return response.Success(c, "Jenis beasiswa retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisBeasiswa(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisBeasiswaFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisBeasiswa: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis beasiswa", err.Error())
	}
	return response.Success(c, "Jenis beasiswa synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis beasiswa synced successfully"})
}

// GetAllJenisDiklat handles GET /api/v1/referensi/jenis-diklat
func (ctrl *Controller) GetAllJenisDiklat(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisDiklat()
	if err != nil {
		log.Printf("Error in GetAllJenisDiklat controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis diklat", err.Error())
	}
	return response.Success(c, "Jenis diklat retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisDiklat(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisDiklatFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisDiklat: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis diklat", err.Error())
	}
	return response.Success(c, "Jenis diklat synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis diklat synced successfully"})
}

// GetAllJenisDokumen handles GET /api/v1/referensi/jenis-dokumen
func (ctrl *Controller) GetAllJenisDokumen(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisDokumen()
	if err != nil {
		log.Printf("Error in GetAllJenisDokumen controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis dokumen", err.Error())
	}
	return response.Success(c, "Jenis dokumen retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisDokumen(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisDokumenFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisDokumen: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis dokumen", err.Error())
	}
	return response.Success(c, "Jenis dokumen synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis dokumen synced successfully"})
}

// GetAllJenisKeluar handles GET /api/v1/referensi/jenis-keluar
func (ctrl *Controller) GetAllJenisKeluar(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisKeluar()
	if err != nil {
		log.Printf("Error in GetAllJenisKeluar controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis keluar", err.Error())
	}
	return response.Success(c, "Jenis keluar retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisKeluar(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisKeluarFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisKeluar: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis keluar", err.Error())
	}
	return response.Success(c, "Jenis keluar synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis keluar synced successfully"})
}

// GetAllJenisKepanitiaan handles GET /api/v1/referensi/jenis-kepanitiaan
func (ctrl *Controller) GetAllJenisKepanitiaan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisKepanitiaan()
	if err != nil {
		log.Printf("Error in GetAllJenisKepanitiaan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis kepanitiaan", err.Error())
	}
	return response.Success(c, "Jenis kepanitiaan retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisKepanitiaan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisKepanitiaanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisKepanitiaan: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis kepanitiaan", err.Error())
	}
	return response.Success(c, "Jenis kepanitiaan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis kepanitiaan synced successfully"})
}

// GetAllJenisKesejahteraan handles GET /api/v1/referensi/jenis-kesejahteraan
func (ctrl *Controller) GetAllJenisKesejahteraan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisKesejahteraan()
	if err != nil {
		log.Printf("Error in GetAllJenisKesejahteraan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis kesejahteraan", err.Error())
	}
	return response.Success(c, "Jenis kesejahteraan retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisKesejahteraan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisKesejahteraanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisKesejahteraan: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis kesejahteraan", err.Error())
	}
	return response.Success(c, "Jenis kesejahteraan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis kesejahteraan synced successfully"})
}

// GetAllJenisPublikasi handles GET /api/v1/referensi/jenis-publikasi
func (ctrl *Controller) GetAllJenisPublikasi(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisPublikasi()
	if err != nil {
		log.Printf("Error in GetAllJenisPublikasi controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis publikasi", err.Error())
	}
	return response.Success(c, "Jenis publikasi retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisPublikasi(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisPublikasiFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisPublikasi: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis publikasi", err.Error())
	}
	return response.Success(c, "Jenis publikasi synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis publikasi synced successfully"})
}

// GetAllJenisTes handles GET /api/v1/referensi/jenis-tes
func (ctrl *Controller) GetAllJenisTes(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisTes()
	if err != nil {
		log.Printf("Error in GetAllJenisTes controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis tes", err.Error())
	}
	return response.Success(c, "Jenis tes retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisTes(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisTesFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisTes: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis tes", err.Error())
	}
	return response.Success(c, "Jenis tes synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis tes synced successfully"})
}

// GetAllJenisTunjangan handles GET /api/v1/referensi/jenis-tunjangan
func (ctrl *Controller) GetAllJenisTunjangan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisTunjangan()
	if err != nil {
		log.Printf("Error in GetAllJenisTunjangan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis tunjangan", err.Error())
	}
	return response.Success(c, "Jenis tunjangan retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisTunjangan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisTunjanganFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisTunjangan: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis tunjangan", err.Error())
	}
	return response.Success(c, "Jenis tunjangan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis tunjangan synced successfully"})
}

// GetAllMediaPublikasi handles GET /api/v1/referensi/media-publikasi
func (ctrl *Controller) GetAllMediaPublikasi(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllMediaPublikasi()
	if err != nil {
		log.Printf("Error in GetAllMediaPublikasi controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch media publikasi", err.Error())
	}
	return response.Success(c, "Media publikasi retrieved successfully", list)
}

func (ctrl *Controller) SyncMediaPublikasi(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncMediaPublikasiFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncMediaPublikasi: %v", err)
		return response.InternalServerError(c, "Failed to sync media publikasi", err.Error())
	}
	return response.Success(c, "Media publikasi synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Media publikasi synced successfully"})
}

// GetAllSkimKegiatan handles GET /api/v1/referensi/skim-kegiatan
func (ctrl *Controller) GetAllSkimKegiatan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllSkimKegiatan()
	if err != nil {
		log.Printf("Error in GetAllSkimKegiatan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch skim kegiatan", err.Error())
	}
	return response.Success(c, "Skim kegiatan retrieved successfully", list)
}

func (ctrl *Controller) SyncSkimKegiatan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncSkimKegiatanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncSkimKegiatan: %v", err)
		return response.InternalServerError(c, "Failed to sync skim kegiatan", err.Error())
	}
	return response.Success(c, "Skim kegiatan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Skim kegiatan synced successfully"})
}

// GetAllStatusKepegawaian handles GET /api/v1/referensi/status-kepegawaian
func (ctrl *Controller) GetAllStatusKepegawaian(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllStatusKepegawaian()
	if err != nil {
		log.Printf("Error in GetAllStatusKepegawaian controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch status kepegawaian", err.Error())
	}
	return response.Success(c, "Status kepegawaian retrieved successfully", list)
}

func (ctrl *Controller) SyncStatusKepegawaian(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncStatusKepegawaianFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncStatusKepegawaian: %v", err)
		return response.InternalServerError(c, "Failed to sync status kepegawaian", err.Error())
	}
	return response.Success(c, "Status kepegawaian synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Status kepegawaian synced successfully"})
}

// GetAllSumberGaji handles GET /api/v1/referensi/sumber-gaji
func (ctrl *Controller) GetAllSumberGaji(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllSumberGaji()
	if err != nil {
		log.Printf("Error in GetAllSumberGaji controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch sumber gaji", err.Error())
	}
	return response.Success(c, "Sumber gaji retrieved successfully", list)
}

func (ctrl *Controller) SyncSumberGaji(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncSumberGajiFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncSumberGaji: %v", err)
		return response.InternalServerError(c, "Failed to sync sumber gaji", err.Error())
	}
	return response.Success(c, "Sumber gaji synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Sumber gaji synced successfully"})
}

// GetAllTingkatPenghargaan handles GET /api/v1/referensi/tingkat-penghargaan
func (ctrl *Controller) GetAllTingkatPenghargaan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllTingkatPenghargaan()
	if err != nil {
		log.Printf("Error in GetAllTingkatPenghargaan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch tingkat penghargaan", err.Error())
	}
	return response.Success(c, "Tingkat penghargaan retrieved successfully", list)
}

func (ctrl *Controller) SyncTingkatPenghargaan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncTingkatPenghargaanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncTingkatPenghargaan: %v", err)
		return response.InternalServerError(c, "Failed to sync tingkat penghargaan", err.Error())
	}
	return response.Success(c, "Tingkat penghargaan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Tingkat penghargaan synced successfully"})
}

// GetAllWilayah handles GET /api/v1/referensi/wilayah
func (ctrl *Controller) GetAllWilayah(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllWilayah()
	if err != nil {
		log.Printf("Error in GetAllWilayah controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch wilayah", err.Error())
	}
	return response.Success(c, "Wilayah retrieved successfully", list)
}

func (ctrl *Controller) SyncWilayah(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncWilayahFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncWilayah: %v", err)
		return response.InternalServerError(c, "Failed to sync wilayah", err.Error())
	}
	return response.Success(c, "Wilayah synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Wilayah synced successfully"})
}

// GetAllKategoriCapaianLuaran handles GET /api/v1/referensi/kategori-capaian-luaran
func (ctrl *Controller) GetAllKategoriCapaianLuaran(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllKategoriCapaianLuaran()
	if err != nil {
		log.Printf("Error in GetAllKategoriCapaianLuaran controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch kategori capaian luaran", err.Error())
	}
	return response.Success(c, "Kategori capaian luaran retrieved successfully", list)
}

func (ctrl *Controller) SyncKategoriCapaianLuaran(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncKategoriCapaianLuaranFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncKategoriCapaianLuaran: %v", err)
		return response.InternalServerError(c, "Failed to sync kategori capaian luaran", err.Error())
	}
	return response.Success(c, "Kategori capaian luaran synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Kategori capaian luaran synced successfully"})
}

// GetAllKategoriKegiatan handles GET /api/v1/referensi/kategori-kegiatan
func (ctrl *Controller) GetAllKategoriKegiatan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllKategoriKegiatan()
	if err != nil {
		log.Printf("Error in GetAllKategoriKegiatan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch kategori kegiatan", err.Error())
	}
	return response.Success(c, "Kategori kegiatan retrieved successfully", list)
}

func (ctrl *Controller) SyncKategoriKegiatan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncKategoriKegiatanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncKategoriKegiatan: %v", err)
		return response.InternalServerError(c, "Failed to sync kategori kegiatan", err.Error())
	}
	return response.Success(c, "Kategori kegiatan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Kategori kegiatan synced successfully"})
}

// GetAllKelompokBidang handles GET /api/v1/referensi/kelompok-bidang
func (ctrl *Controller) GetAllKelompokBidang(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllKelompokBidang()
	if err != nil {
		log.Printf("Error in GetAllKelompokBidang controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch kelompok bidang", err.Error())
	}
	return response.Success(c, "Kelompok bidang retrieved successfully", list)
}

func (ctrl *Controller) SyncKelompokBidang(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncKelompokBidangFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncKelompokBidang: %v", err)
		return response.InternalServerError(c, "Failed to sync kelompok bidang", err.Error())
	}
	return response.Success(c, "Kelompok bidang synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Kelompok bidang synced successfully"})
}

// GetAllLembagaSertifikasi handles GET /api/v1/referensi/lembaga-sertifikasi
func (ctrl *Controller) GetAllLembagaSertifikasi(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllLembagaSertifikasi()
	if err != nil {
		log.Printf("Error in GetAllLembagaSertifikasi controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch lembaga sertifikasi", err.Error())
	}
	return response.Success(c, "Lembaga sertifikasi retrieved successfully", list)
}

func (ctrl *Controller) SyncLembagaSertifikasi(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncLembagaSertifikasiFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncLembagaSertifikasi: %v", err)
		return response.InternalServerError(c, "Failed to sync lembaga sertifikasi", err.Error())
	}
	return response.Success(c, "Lembaga sertifikasi synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Lembaga sertifikasi synced successfully"})
}

// GetAllGolonganPangkat handles GET /api/v1/referensi/golongan-pangkat
func (ctrl *Controller) GetAllGolonganPangkat(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllGolonganPangkat()
	if err != nil {
		log.Printf("Error in GetAllGolonganPangkat controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch golongan pangkat", err.Error())
	}
	return response.Success(c, "Golongan pangkat retrieved successfully", list)
}

func (ctrl *Controller) SyncGolonganPangkat(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncGolonganPangkatFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncGolonganPangkat: %v", err)
		return response.InternalServerError(c, "Failed to sync golongan pangkat", err.Error())
	}
	return response.Success(c, "Golongan pangkat synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Golongan pangkat synced successfully"})
}

// GetAllIkatanKerja handles GET /api/v1/referensi/ikatan-kerja
func (ctrl *Controller) GetAllIkatanKerja(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllIkatanKerja()
	if err != nil {
		log.Printf("Error in GetAllIkatanKerja controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch ikatan kerja", err.Error())
	}
	return response.Success(c, "Ikatan kerja retrieved successfully", list)
}

func (ctrl *Controller) SyncIkatanKerja(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncIkatanKerjaFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncIkatanKerja: %v", err)
		return response.InternalServerError(c, "Failed to sync ikatan kerja", err.Error())
	}
	return response.Success(c, "Ikatan kerja synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Ikatan kerja synced successfully"})
}

// GetAllJenisPenghargaan handles GET /api/v1/referensi/jenis-penghargaan
func (ctrl *Controller) GetAllJenisPenghargaan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisPenghargaan()
	if err != nil {
		log.Printf("Error in GetAllJenisPenghargaan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis penghargaan", err.Error())
	}
	return response.Success(c, "Jenis penghargaan retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisPenghargaan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisPenghargaanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisPenghargaan: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis penghargaan", err.Error())
	}
	return response.Success(c, "Jenis penghargaan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis penghargaan synced successfully"})
}

// GetAllJenisPekerjaan handles GET /api/v1/referensi/jenis-pekerjaan
func (ctrl *Controller) GetAllJenisPekerjaan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllJenisPekerjaan()
	if err != nil {
		log.Printf("Error in GetAllJenisPekerjaan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch jenis pekerjaan", err.Error())
	}
	return response.Success(c, "Jenis pekerjaan retrieved successfully", list)
}

func (ctrl *Controller) SyncJenisPekerjaan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncJenisPekerjaanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncJenisPekerjaan: %v", err)
		return response.InternalServerError(c, "Failed to sync jenis pekerjaan", err.Error())
	}
	return response.Success(c, "Jenis pekerjaan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Jenis pekerjaan synced successfully"})
}

// GetAllBidangPekerjaan handles GET /api/v1/referensi/bidang-pekerjaan
func (ctrl *Controller) GetAllBidangPekerjaan(c *fiber.Ctx) error {
	list, err := ctrl.service.GetAllBidangPekerjaan()
	if err != nil {
		log.Printf("Error in GetAllBidangPekerjaan controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch bidang pekerjaan", err.Error())
	}
	return response.Success(c, "Bidang pekerjaan retrieved successfully", list)
}

func (ctrl *Controller) SyncBidangPekerjaan(c *fiber.Ctx) error {
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}
	totalRecords, err := ctrl.service.SyncBidangPekerjaanFromSister(username.(string))
	if err != nil {
		log.Printf("❌ Error in SyncBidangPekerjaan: %v", err)
		return response.InternalServerError(c, "Failed to sync bidang pekerjaan", err.Error())
	}
	return response.Success(c, "Bidang pekerjaan synced successfully", SyncResponse{TotalRecords: totalRecords, SyncedBy: username.(string), Message: "Bidang pekerjaan synced successfully"})
}

// ==================== METADATA & BATCH SYNC HANDLERS ====================

// GetAllReferensiMetadata handles GET /api/v1/referensi/metadata
func (ctrl *Controller) GetAllReferensiMetadata(c *fiber.Ctx) error {
	metadata, err := ctrl.service.GetAllReferensiMetadata(c.Context())
	if err != nil {
		log.Printf("Error in GetAllReferensiMetadata controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch referensi metadata", err.Error())
	}

	return response.Success(c, "Referensi metadata retrieved successfully", metadata)
}

// BatchSyncFromSister handles POST /api/v1/referensi/batch-sync
func (ctrl *Controller) BatchSyncFromSister(c *fiber.Ctx) error {
	// Parse request body
	var req BatchSyncRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", err.Error())
	}

	// Validate request
	if len(req.Endpoints) == 0 {
		return response.BadRequest(c, "No endpoints specified", "endpoints array cannot be empty")
	}

	// Get user info from context
	username := c.Locals("username")
	if username == nil {
		username = "system"
	}

	log.Printf("🔄 Batch sync requested by %s for %d endpoints: %v",
		username, len(req.Endpoints), req.Endpoints)

	// Execute batch sync
	result, err := ctrl.service.BatchSyncFromSister(c.Context(), req.Endpoints, username.(string))
	if err != nil {
		log.Printf("❌ Error in BatchSyncFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to execute batch sync", err.Error())
	}

	log.Printf("✅ Batch sync completed: %d/%d succeeded in %s",
		result.TotalSuccess, result.TotalRequested, result.Duration)

	return response.Success(c, "Batch sync completed", result)
}

// ==================== UNIT KERJA HANDLERS ====================

// GetAllUnitKerja handles GET request to fetch all unit kerja
// @Summary Get all unit kerja
// @Description Retrieve all unit kerja (SMS) reference data
// @Tags Referensi
// @Accept json
// @Produce json
// @Success 200 {object} response.APIResponse{data=[]referensi.UnitKerja}
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/unit-kerja [get]
func (ctrl *Controller) GetAllUnitKerja(c *fiber.Ctx) error {
	unitKerjaList, err := ctrl.service.GetAllUnitKerja()
	if err != nil {
		log.Printf("Error in GetAllUnitKerja controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch unit kerja", err.Error())
	}

	return response.Success(c, "Unit Kerja retrieved successfully", unitKerjaList)
}

// GetUnitKerjaByID handles GET request to fetch unit kerja by ID
// @Summary Get unit kerja by ID
// @Description Retrieve unit kerja (SMS) reference data by ID
// @Tags Referensi
// @Accept json
// @Produce json
// @Param id path string true "Unit Kerja ID (UUID)"
// @Success 200 {object} response.APIResponse{data=referensi.UnitKerja}
// @Failure 404 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/unit-kerja/{id} [get]
func (ctrl *Controller) GetUnitKerjaByID(c *fiber.Ctx) error {
	id := c.Params("id")

	unitKerja, err := ctrl.service.GetUnitKerjaByID(id)
	if err != nil {
		log.Printf("Error in GetUnitKerjaByID controller: %v", err)
		return response.InternalServerError(c, "Failed to fetch unit kerja", err.Error())
	}

	if unitKerja == nil {
		return response.NotFound(c, "Unit Kerja not found")
	}

	return response.Success(c, "Unit Kerja retrieved successfully", unitKerja)
}

// SyncUnitKerjaFromSister handles POST request to sync unit kerja from Sister API
// @Summary Sync unit kerja from Sister API
// @Description Synchronize unit kerja (SMS) data from Sister Kemdikbud API. Requires id_perguruan_tinggi query parameter.
// @Tags Referensi
// @Accept json
// @Produce json
// @Param id_perguruan_tinggi query string true "ID Perguruan Tinggi (UUID)"
// @Param synced_by query string true "Username who triggered the sync"
// @Success 200 {object} response.APIResponse{data=referensi.BatchUnitKerjaSyncResult}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /api/v1/referensi/unit-kerja/sync [post]
func (ctrl *Controller) SyncUnitKerjaFromSister(c *fiber.Ctx) error {
	// Get id_perguruan_tinggi from query params
	idPerguruanTinggi := c.Query("id_perguruan_tinggi")
	if idPerguruanTinggi == "" {
		return response.BadRequest(c, "id_perguruan_tinggi query parameter is required", nil)
	}

	// Get synced_by from query params
	syncedBy := c.Query("synced_by")
	if syncedBy == "" {
		return response.BadRequest(c, "synced_by query parameter is required", nil)
	}

	log.Printf("🔄 Starting sync unit kerja from Sister API (id_pt: %s, synced_by: %s)",
		idPerguruanTinggi, syncedBy)

	// Execute sync
	result, err := ctrl.service.SyncUnitKerjaFromSister(idPerguruanTinggi, syncedBy)
	if err != nil {
		log.Printf("❌ Error in SyncUnitKerjaFromSister controller: %v", err)
		return response.InternalServerError(c, "Failed to sync unit kerja", err.Error())
	}

	log.Printf("✅ Unit Kerja sync completed: %d/%d succeeded in %s",
		result.TotalSuccess, result.TotalProcessed, result.Duration)

	return response.Success(c, "Unit Kerja sync completed", result)
}
