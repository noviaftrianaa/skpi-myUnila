package mail

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// CaptureEmailMiddleware — opportunistic upsert of email_pengguna from JWT.
//
// Runs AFTER JWTAuth so `user_id` and `email` are already in Locals. For each
// authenticated /me/* request, checks if blog.blog.email_pengguna matches the
// JWT email and updates if not. Cheap path: one indexed conditional UPDATE
// that affects 0 rows on no-change.
//
// The check is purely async (goroutine) so it never adds latency to the
// request — by the time the user makes their next API call, the email is
// already denormed.
func CaptureEmailMiddleware(db *sqlx.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		uid, _ := c.Locals("user_id").(string)
		email, _ := c.Locals("email").(string)
		if uid != "" && email != "" {
			idUser, err := uuid.Parse(uid)
			if err == nil {
				go upsertEmail(db, idUser, email)
			}
		}
		return c.Next()
	}
}

// upsertEmail fires in a goroutine. WHERE-clause ensures we only write when
// the stored email differs (or is NULL), avoiding write amplification on
// every request.
func upsertEmail(db *sqlx.DB, idUser uuid.UUID, email string) {
	_, err := db.Exec(`
		UPDATE blog.blog
		SET email_pengguna = $2, updated_at = NOW()
		WHERE id_pengguna_pdut = $1
		  AND soft_delete IS NULL
		  AND (email_pengguna IS DISTINCT FROM $2)`,
		idUser, email)
	if err != nil {
		log.Printf("mail.capture: %v", err)
	}
}
