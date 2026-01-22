package response

import "github.com/gofiber/fiber/v2"

// Response represents standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// PaginatedResponse represents paginated API response
type PaginatedResponse struct {
	Success    bool        `json:"success"`
	Data       interface{} `json:"data"`
	Total      int         `json:"total"`
	Page       int         `json:"page"`
	Limit      int         `json:"limit"`
	TotalPages int         `json:"total_pages"`
}

// Success sends a success response
func Success(c *fiber.Ctx, data interface{}) error {
	return c.JSON(Response{
		Success: true,
		Data:    data,
	})
}

// SuccessWithMessage sends a success response with message
func SuccessWithMessage(c *fiber.Ctx, message string, data interface{}) error {
	return c.JSON(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Error sends an error response
func Error(c *fiber.Ctx, statusCode int, message string) error {
	return c.Status(statusCode).JSON(Response{
		Success: false,
		Error:   message,
	})
}

// Paginated sends a paginated response
func Paginated(c *fiber.Ctx, data interface{}, total, page, limit int) error {
	totalPages := (total + limit - 1) / limit
	if totalPages < 1 {
		totalPages = 1
	}

	return c.JSON(PaginatedResponse{
		Success:    true,
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	})
}
