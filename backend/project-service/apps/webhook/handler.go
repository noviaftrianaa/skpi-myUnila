package webhook

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/myunila/project-service/apps/project"
)

// WebhookHandler handles webhook events
type WebhookHandler struct {
	repo    project.Repository
	refRepo project.RefRepository
	svc     project.Service
}

func NewWebhookHandler(pgDB *sqlx.DB, msDB *sqlx.DB) *WebhookHandler {
	repo := project.NewRepository(pgDB)
	refRepo := project.NewRefRepository(msDB)
	svc := project.NewService(repo, refRepo)
	return &WebhookHandler{repo: repo, refRepo: refRepo, svc: svc}
}

// HandleBitbucket POST /webhooks/bitbucket
func (h *WebhookHandler) HandleBitbucket(c *fiber.Ctx) error {
	ctx := c.Context()

	eventKey := c.Get("X-Event-Key")
	log.Printf("🔔 Bitbucket webhook received: %s", eventKey)

	// Only process push events
	if eventKey != "repo:push" {
		return c.JSON(fiber.Map{
			"success": true,
			"message": fmt.Sprintf("Event '%s' ignored", eventKey),
		})
	}

	var payload BitbucketPushEvent
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Failed to parse webhook payload",
			"error":   err.Error(),
		})
	}

	repoFullName := payload.Repository.FullName
	if repoFullName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Repository full_name is empty",
		})
	}

	// Find webhook config by repo
	webhookConfig, err := h.svc.GetWebhookByRepo(ctx, repoFullName)
	if err != nil {
		log.Printf("⚠️  No webhook config for repo '%s': %v", repoFullName, err)
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("No active webhook config for repo '%s'", repoFullName),
		})
	}

	// HMAC-SHA256 signature verification
	if webhookConfig.WebhookSecret != "" {
		sigHeader := c.Get("X-Hub-Signature")
		if sigHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Missing X-Hub-Signature header",
			})
		}
		body := c.Body()
		mac := hmac.New(sha256.New, []byte(webhookConfig.WebhookSecret))
		mac.Write(body)
		expectedSig := "sha256=" + hex.EncodeToString(mac.Sum(nil))
		if !hmac.Equal([]byte(sigHeader), []byte(expectedSig)) {
			log.Printf("⛔ Invalid webhook signature for repo '%s'", repoFullName)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid webhook signature",
			})
		}
	}

	projectID := webhookConfig.IDProject
	processed := 0
	errors := 0

	for _, change := range payload.Push.Changes {
		branchName := ""
		if change.New != nil {
			branchName = change.New.Name
		}

		for _, commit := range change.Commits {
			hashShort := commit.Hash
			if len(hashShort) > 8 {
				hashShort = hashShort[:8]
			}

			commitMsg := commit.Message
			authorName := extractAuthorName(commit.Author.Raw)
			authorEmail := extractAuthorEmail(commit.Author.Raw)

			commitURL := ""
			if commit.Links.HTML.Href != "" {
				commitURL = commit.Links.HTML.Href
			}

			tc := &project.TaskCommit{
				IDProject:       projectID,
				CommitHash:      commit.Hash,
				CommitHashShort: hashShort,
				CommitMessage:   &commitMsg,
				AuthorName:      &authorName,
				AuthorEmail:     &authorEmail,
				Branch:          &branchName,
				CommitURL:       &commitURL,
				CommittedAt:     commit.Date,
			}

			if tc.CommittedAt.IsZero() {
				tc.CommittedAt = time.Now()
			}

			if err := h.svc.ProcessWebhookCommit(ctx, tc, projectID); err != nil {
				log.Printf("❌ Failed to process commit %s: %v", commit.Hash, err)
				errors++
			} else {
				processed++
				log.Printf("✅ Processed commit %s for project %s", hashShort, projectID)
			}
		}
	}

	return c.JSON(fiber.Map{
		"success":   true,
		"message":   "Webhook processed",
		"processed": processed,
		"errors":    errors,
		"repo":      repoFullName,
	})
}

// Init registers webhook routes
func Init(router fiber.Router, pgDB *sqlx.DB, msDB *sqlx.DB) {
	h := NewWebhookHandler(pgDB, msDB)
	wh := router.Group("/webhooks")
	wh.Post("/bitbucket", h.HandleBitbucket)
}

// InitWithoutRef registers webhook routes without SQL Server
func InitWithoutRef(router fiber.Router, pgDB *sqlx.DB) {
	repo := project.NewRepository(pgDB)
	refRepo := project.NewNoopRefRepository()
	svc := project.NewService(repo, refRepo)
	h := &WebhookHandler{repo: repo, refRepo: refRepo, svc: svc}
	wh := router.Group("/webhooks")
	wh.Post("/bitbucket", h.HandleBitbucket)
}

// extractAuthorName extracts name from "Name <email>" format
func extractAuthorName(raw string) string {
	if idx := strings.Index(raw, "<"); idx > 0 {
		return strings.TrimSpace(raw[:idx])
	}
	return raw
}

// extractAuthorEmail extracts email from "Name <email>" format
func extractAuthorEmail(raw string) string {
	start := strings.Index(raw, "<")
	end := strings.Index(raw, ">")
	if start >= 0 && end > start {
		return raw[start+1 : end]
	}
	return ""
}
