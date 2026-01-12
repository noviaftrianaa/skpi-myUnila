package response

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Response adalah struktur standar untuk semua API response
type Response struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message"`
	Data      interface{} `json:"data,omitempty"`
	Meta      *Meta       `json:"meta,omitempty"`
	Error     *ErrorInfo  `json:"error,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// Meta berisi informasi pagination dan metadata lainnya
type Meta struct {
	Page       int   `json:"page,omitempty"`
	Limit      int   `json:"limit,omitempty"`
	Total      int64 `json:"total,omitempty"`
	TotalPages int   `json:"total_pages,omitempty"`
}

// ErrorInfo berisi detail error
type ErrorInfo struct {
	Code    string            `json:"code"`
	Details map[string]string `json:"details,omitempty"`
}

// ResponseBuilder untuk membangun response dengan pattern builder
type ResponseBuilder struct {
	httpCode  int
	success   bool
	message   string
	data      interface{}
	meta      *Meta
	errorInfo *ErrorInfo
}

// New membuat ResponseBuilder baru dengan default success
func New() *ResponseBuilder {
	return &ResponseBuilder{
		httpCode: http.StatusOK,
		success:  true,
	}
}

// WithSuccess set status success
func (rb *ResponseBuilder) WithSuccess(success bool) *ResponseBuilder {
	rb.success = success
	return rb
}

// WithMessage set pesan response
func (rb *ResponseBuilder) WithMessage(message string) *ResponseBuilder {
	rb.message = message
	return rb
}

// WithData set data response
func (rb *ResponseBuilder) WithData(data interface{}) *ResponseBuilder {
	rb.data = data
	return rb
}

// WithMeta set meta information (pagination)
func (rb *ResponseBuilder) WithMeta(meta *Meta) *ResponseBuilder {
	rb.meta = meta
	return rb
}

// WithPagination set pagination meta
func (rb *ResponseBuilder) WithPagination(page, limit int, total int64) *ResponseBuilder {
	totalPages := int(total) / limit
	if int(total)%limit > 0 {
		totalPages++
	}
	rb.meta = &Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}
	return rb
}

// WithHTTPCode set HTTP status code
func (rb *ResponseBuilder) WithHTTPCode(code int) *ResponseBuilder {
	rb.httpCode = code
	return rb
}

// WithError set error information
func (rb *ResponseBuilder) WithError(code string, details map[string]string) *ResponseBuilder {
	rb.success = false
	rb.errorInfo = &ErrorInfo{
		Code:    code,
		Details: details,
	}
	return rb
}

// Build membuat Response object
func (rb *ResponseBuilder) Build() Response {
	return Response{
		Success:   rb.success,
		Message:   rb.message,
		Data:      rb.data,
		Meta:      rb.meta,
		Error:     rb.errorInfo,
		Timestamp: time.Now().Format(time.RFC3339),
	}
}

// Send mengirim response ke client
func (rb *ResponseBuilder) Send(ctx *fiber.Ctx) error {
	return ctx.Status(rb.httpCode).JSON(rb.Build())
}

// ============================================================================
// Helper functions untuk response umum
// ============================================================================

// Success mengirim response sukses
func Success(ctx *fiber.Ctx, message string, data interface{}) error {
	return New().
		WithMessage(message).
		WithData(data).
		Send(ctx)
}

// SuccessWithMeta mengirim response sukses dengan pagination
func SuccessWithMeta(ctx *fiber.Ctx, message string, data interface{}, page, limit int, total int64) error {
	return New().
		WithMessage(message).
		WithData(data).
		WithPagination(page, limit, total).
		Send(ctx)
}

// Created mengirim response untuk resource yang baru dibuat
func Created(ctx *fiber.Ctx, message string, data interface{}) error {
	return New().
		WithHTTPCode(http.StatusCreated).
		WithMessage(message).
		WithData(data).
		Send(ctx)
}

// BadRequest mengirim response error 400
func BadRequest(ctx *fiber.Ctx, message string, details map[string]string) error {
	return New().
		WithHTTPCode(http.StatusBadRequest).
		WithSuccess(false).
		WithMessage(message).
		WithError("BAD_REQUEST", details).
		Send(ctx)
}

// Unauthorized mengirim response error 401
func Unauthorized(ctx *fiber.Ctx, message string) error {
	return New().
		WithHTTPCode(http.StatusUnauthorized).
		WithSuccess(false).
		WithMessage(message).
		WithError("UNAUTHORIZED", nil).
		Send(ctx)
}

// Forbidden mengirim response error 403
func Forbidden(ctx *fiber.Ctx, message string) error {
	return New().
		WithHTTPCode(http.StatusForbidden).
		WithSuccess(false).
		WithMessage(message).
		WithError("FORBIDDEN", nil).
		Send(ctx)
}

// NotFound mengirim response error 404
func NotFound(ctx *fiber.Ctx, message string) error {
	return New().
		WithHTTPCode(http.StatusNotFound).
		WithSuccess(false).
		WithMessage(message).
		WithError("NOT_FOUND", nil).
		Send(ctx)
}

// InternalError mengirim response error 500
func InternalError(ctx *fiber.Ctx, message string) error {
	return New().
		WithHTTPCode(http.StatusInternalServerError).
		WithSuccess(false).
		WithMessage(message).
		WithError("INTERNAL_ERROR", nil).
		Send(ctx)
}

// ValidationError mengirim response error validasi
func ValidationError(ctx *fiber.Ctx, details map[string]string) error {
	return New().
		WithHTTPCode(http.StatusUnprocessableEntity).
		WithSuccess(false).
		WithMessage("Validation failed").
		WithError("VALIDATION_ERROR", details).
		Send(ctx)
}
