package matkul_kurikulum

// Controller is alias for Handler (for consistency with other modules)
type Controller = Handler

// NewController creates a new controller
func NewController(service Service) *Controller {
	return NewHandler(service)
}
