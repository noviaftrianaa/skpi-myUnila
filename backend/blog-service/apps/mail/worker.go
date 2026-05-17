package mail

import (
	"context"
	"errors"
	"log"
	"time"
)

// =============================================================================
// OUTBOX WORKER
//
// Ticks every 60s. Pulls up to 20 pending+due rows per tick, attempts SMTP
// delivery, transitions to "sent" or schedules retry. ErrNoActiveConfig is
// treated as a transient "skip this tick" rather than a row failure — admin
// might just be in the middle of configuring SMTP.
// =============================================================================

const (
	workerInterval = 60 * time.Second
	workerBatch    = 20
)

// Worker holds the dependencies; created once at boot and run as a goroutine.
type Worker struct {
	cfgRepo    *ConfigRepository
	outboxRepo *OutboxRepository
	sender     *Sender
}

func NewWorker(cfgRepo *ConfigRepository, outboxRepo *OutboxRepository, sender *Sender) *Worker {
	return &Worker{cfgRepo: cfgRepo, outboxRepo: outboxRepo, sender: sender}
}

// Run blocks until ctx is cancelled. First tick fires after the interval —
// no boot-time burst (in case admin hasn't configured SMTP yet).
func (w *Worker) Run(ctx context.Context) {
	log.Printf("✉️  Email outbox worker started (every %s, batch %d)", workerInterval, workerBatch)
	ticker := time.NewTicker(workerInterval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			w.tick(ctx)
		}
	}
}

func (w *Worker) tick(ctx context.Context) {
	// Quick config check — if SMTP isn't set up, skip the batch claim entirely.
	if _, err := w.cfgRepo.GetActive(ctx); err != nil {
		if errors.Is(err, ErrNoActiveConfig) {
			return // silent — admin sees the warning in the dashboard
		}
		log.Printf("✉️  worker config lookup: %v", err)
		return
	}

	batch, err := w.outboxRepo.ClaimBatch(ctx, workerBatch)
	if err != nil {
		log.Printf("✉️  worker claim: %v", err)
		return
	}
	if len(batch) == 0 {
		return
	}

	sent := 0
	failed := 0
	for _, m := range batch {
		err := w.sender.Send(ctx, m.RecipientEmail, m.Subject, m.BodyHTML, strDeref(m.BodyText))
		if err != nil {
			failed++
			if perr := w.outboxRepo.MarkFailed(ctx, m.IDEmail, m.Attempts, err.Error()); perr != nil {
				log.Printf("✉️  mark failed: %v", perr)
			}
			continue
		}
		sent++
		if perr := w.outboxRepo.MarkSent(ctx, m.IDEmail); perr != nil {
			log.Printf("✉️  mark sent: %v", perr)
		}
	}
	if sent > 0 || failed > 0 {
		log.Printf("✉️  outbox drain: %d sent, %d failed of %d claimed", sent, failed, len(batch))
	}
}

func strDeref(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}
