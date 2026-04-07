package site

import (
	"fmt"
	"sync"
	"time"
)

// CheckAllProgressDTO is the JSON response for check-all progress
type CheckAllProgressDTO struct {
	Status    string `json:"status"`     // idle, running, completed, failed
	Total     int    `json:"total"`      // Total sites to check
	Checked   int    `json:"checked"`    // Sites checked so far
	Ok        int    `json:"ok"`         // Successful checks
	Fail      int    `json:"fail"`       // Failed checks
	StartedAt string `json:"started_at"` // ISO timestamp
	UpdatedAt string `json:"updated_at"` // ISO timestamp
	Message   string `json:"message"`    // Status message
	CheckedBy string `json:"checked_by"` // Who triggered the check
}

// checkAllProgress is the in-memory singleton tracking CheckAll progress
type checkAllProgress struct {
	mu        sync.RWMutex
	status    string
	total     int
	checked   int
	ok        int
	fail      int
	startedAt time.Time
	updatedAt time.Time
	message   string
	checkedBy string
}

var progress = &checkAllProgress{status: "idle"}

// GetCheckProgress returns the singleton progress tracker
func GetCheckProgress() *checkAllProgress {
	return progress
}

// Start initializes a new check-all run
func (p *checkAllProgress) Start(total int, checkedBy string) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.status = "running"
	p.total = total
	p.checked = 0
	p.ok = 0
	p.fail = 0
	p.startedAt = time.Now()
	p.updatedAt = time.Now()
	p.message = fmt.Sprintf("Memulai pemeriksaan %d situs...", total)
	p.checkedBy = checkedBy
}

// Increment records one completed check (thread-safe)
func (p *checkAllProgress) Increment(isOk bool) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.checked++
	if isOk {
		p.ok++
	} else {
		p.fail++
	}
	p.updatedAt = time.Now()
	p.message = fmt.Sprintf("Memeriksa situs %d/%d (OK: %d, Gagal: %d)", p.checked, p.total, p.ok, p.fail)
}

// Complete marks the check-all as finished and auto-resets after 30s
func (p *checkAllProgress) Complete() {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.status = "completed"
	p.updatedAt = time.Now()
	p.message = fmt.Sprintf("Selesai: %d situs diperiksa — %d OK, %d gagal", p.total, p.ok, p.fail)

	go func() {
		time.Sleep(30 * time.Second)
		p.mu.Lock()
		defer p.mu.Unlock()
		if p.status == "completed" {
			p.status = "idle"
		}
	}()
}

// Fail marks the check-all as failed
func (p *checkAllProgress) Fail(errMsg string) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.status = "failed"
	p.updatedAt = time.Now()
	p.message = fmt.Sprintf("Gagal: %s", errMsg)

	go func() {
		time.Sleep(60 * time.Second)
		p.mu.Lock()
		defer p.mu.Unlock()
		if p.status == "failed" {
			p.status = "idle"
		}
	}()
}

// Snapshot returns a thread-safe copy for JSON serialization
func (p *checkAllProgress) Snapshot() CheckAllProgressDTO {
	p.mu.RLock()
	defer p.mu.RUnlock()

	dto := CheckAllProgressDTO{
		Status:    p.status,
		Total:     p.total,
		Checked:   p.checked,
		Ok:        p.ok,
		Fail:      p.fail,
		Message:   p.message,
		CheckedBy: p.checkedBy,
	}
	if !p.startedAt.IsZero() {
		dto.StartedAt = p.startedAt.Format(time.RFC3339)
	}
	if !p.updatedAt.IsZero() {
		dto.UpdatedAt = p.updatedAt.Format(time.RFC3339)
	}
	return dto
}
