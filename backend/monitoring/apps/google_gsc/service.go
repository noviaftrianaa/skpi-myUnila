package google_gsc

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"monitoring-service/internal/config"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/indexing/v3"
	"google.golang.org/api/option"
)

const (
	sysUserID    = "00000000-0000-0000-0000-000000000001"
	indexingScope = "https://www.googleapis.com/auth/indexing"

	// Google Indexing API free quota: 200 requests/day
	// Ref: https://developers.google.com/search/apis/indexing-api/v3/quota-pricing
	DefaultDailyQuota = 200
)

type Service interface {
	SubmitRemoval(req RemoveURLRequest, submittedBy string) (*GSCRemovalLog, error)
	SubmitRecrawl(req RemoveURLRequest, submittedBy string) (*GSCRemovalLog, error)
	GetQuota() (*QuotaStatus, error)
	ListLogs(f LogFilter) ([]*GSCRemovalLog, int, error)
}

type service struct {
	repo   Repository
	cfg    config.GSCConfig
	client *indexing.Service // nil if disabled or JSON missing
}

func NewService(repo Repository, cfg config.GSCConfig) Service {
	svc := &service{repo: repo, cfg: cfg}
	if cfg.Enabled {
		svc.initClient()
	}
	return svc
}

func (s *service) initClient() {
	jsonData, err := os.ReadFile(s.cfg.ServiceAccountJSON)
	if err != nil {
		log.Printf("⚠️  GSC: service account JSON not found at %s: %v", s.cfg.ServiceAccountJSON, err)
		return
	}

	ctx := context.Background()
	creds, err := google.CredentialsFromJSON(ctx, jsonData, indexingScope)
	if err != nil {
		log.Printf("⚠️  GSC: failed to parse credentials: %v", err)
		return
	}

	indexingSvc, err := indexing.NewService(ctx, option.WithCredentials(creds))
	if err != nil {
		log.Printf("⚠️  GSC: failed to create indexing service: %v", err)
		return
	}

	s.client = indexingSvc
	log.Printf("✅ GSC: Indexing API client initialized (site=%s, quota=%d/day)",
		s.cfg.SiteURL, DefaultDailyQuota)
}

func (s *service) GetQuota() (*QuotaStatus, error) {
	used, err := s.repo.CountToday()
	if err != nil {
		return nil, err
	}
	remaining := DefaultDailyQuota - used
	if remaining < 0 {
		remaining = 0
	}
	// Next reset: midnight WIB
	now := time.Now()
	tomorrow := time.Date(now.Year(), now.Month(), now.Day()+1, 0, 0, 0, 0, now.Location())

	return &QuotaStatus{
		DailyLimit:    DefaultDailyQuota,
		UsedToday:     used,
		Remaining:     remaining,
		ResetAt:       tomorrow.Format("2006-01-02 00:00:00"),
		QuotaExceeded: remaining == 0,
	}, nil
}

func (s *service) ListLogs(f LogFilter) ([]*GSCRemovalLog, int, error) {
	return s.repo.List(f)
}

func (s *service) SubmitRemoval(req RemoveURLRequest, submittedBy string) (*GSCRemovalLog, error) {
	action := req.Action
	if action == "" {
		action = "URL_DELETED"
	}
	return s.submit(req.ThreatID, req.URL, action, submittedBy)
}

func (s *service) SubmitRecrawl(req RemoveURLRequest, submittedBy string) (*GSCRemovalLog, error) {
	return s.submit(req.ThreatID, req.URL, "URL_UPDATED", submittedBy)
}

func (s *service) submit(threatID int, url, action, submittedBy string) (*GSCRemovalLog, error) {
	now := time.Now()
	l := &GSCRemovalLog{
		ThreatID:    threatID,
		URL:         url,
		Action:      action,
		Status:      "submitted",
		SubmittedAt: now,
		CreateDate:  now,
		IDCreator:   sysUserID,
		LastUpdate:  now,
	}
	if submittedBy != "" {
		l.SubmittedBy = &submittedBy
	}

	// Check daily quota
	quota, err := s.GetQuota()
	if err != nil {
		log.Printf("⚠️  GSC: quota check failed: %v", err)
	} else if quota.QuotaExceeded {
		l.Status = "rate_limited"
		msg := fmt.Sprintf("Daily quota %d reached. Resets at %s", DefaultDailyQuota, quota.ResetAt)
		l.ErrorMessage = &msg
		id, err := s.repo.Insert(l)
		if err != nil {
			return nil, err
		}
		l.ID = id
		log.Printf("⚠️  GSC: rate limited for %s (quota %d/%d)", url, quota.UsedToday, DefaultDailyQuota)
		return l, nil
	}

	if !s.cfg.Enabled || s.client == nil {
		l.Status = "skipped"
		msg := "GSC integration disabled or not configured"
		l.ErrorMessage = &msg
		id, _ := s.repo.Insert(l)
		l.ID = id
		return l, nil
	}

	// Insert log first (pending)
	id, err := s.repo.Insert(l)
	if err != nil {
		return nil, fmt.Errorf("failed to insert GSC log: %w", err)
	}
	l.ID = id

	// Call Google Indexing API
	notification := &indexing.UrlNotification{
		Url:  url,
		Type: action,
	}
	resp, apiErr := s.client.UrlNotifications.Publish(notification).Do()
	if apiErr != nil {
		errMsg := apiErr.Error()
		l.Status = "failed"
		l.ErrorMessage = &errMsg
		s.repo.UpdateStatus(id, "failed", nil, &errMsg)
		log.Printf("❌ GSC: failed to submit %s: %v", url, apiErr)
		return l, nil
	}

	// Success
	reqID := resp.UrlNotificationMetadata.LatestUpdate.Url
	l.Status = "success"
	l.GSCRequestID = &reqID
	s.repo.UpdateStatus(id, "success", &reqID, nil)
	log.Printf("✅ GSC: submitted %s action=%s (quota %d/%d)", url, action, quota.UsedToday+1, DefaultDailyQuota)

	return l, nil
}
