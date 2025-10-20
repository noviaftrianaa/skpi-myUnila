package swagger

// Referensi Agama Swagger Documentation

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

// GetAgamaByID godoc
// @Summary Get agama by ID
// @Description Retrieve a specific religion by its ID
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Agama ID"
// @Success 200 {object} response.Response{data=referensi.Agama} "Success"
// @Failure 400 {object} response.Response "Bad Request"
// @Failure 404 {object} response.Response "Not Found"
// @Router /api/v1/referensi/agama/{id} [get]
func GetAgamaByID() {}

// SyncAgamaFromSister godoc
// @Summary Sync agama from Sister API
// @Description Synchronize religion data from Sister Kemdikbud API to local database
// @Tags Referensi
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body referensi.SyncAgamaRequest true "Sync Request"
// @Success 200 {object} response.Response{data=referensi.SyncResponse} "Success"
// @Failure 400 {object} response.Response "Bad Request"
// @Failure 500 {object} response.Response "Internal Server Error"
// @Router /api/v1/referensi/agama/sync [post]
func SyncAgamaFromSister() {}
