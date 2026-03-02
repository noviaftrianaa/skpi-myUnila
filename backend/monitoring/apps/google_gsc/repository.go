package google_gsc

import (
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	Insert(log *GSCRemovalLog) (int64, error)
	UpdateStatus(id int64, status string, gscRequestID *string, errMsg *string) error
	List(f LogFilter) ([]*GSCRemovalLog, int, error)
	CountToday() (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Insert(l *GSCRemovalLog) (int64, error) {
	var id int64
	err := r.db.QueryRow(`
		INSERT INTO monitoring.gsc_removal_logs
		  (threat_id, url, action, gsc_request_id, status, submitted_by,
		   submitted_at, error_message,
		   create_date, id_creator, last_update, soft_delete)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10, @p11, 0)`,
		l.ThreatID, l.URL, l.Action, l.GSCRequestID, l.Status, l.SubmittedBy,
		l.SubmittedAt, l.ErrorMessage,
		l.CreateDate, l.IDCreator, l.LastUpdate,
	).Scan(&id)
	return id, err
}

func (r *repository) UpdateStatus(id int64, status string, gscRequestID *string, errMsg *string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.gsc_removal_logs
		SET status = @p1, gsc_request_id = ISNULL(@p2, gsc_request_id),
		    error_message = ISNULL(@p3, error_message), last_update = @p4
		WHERE id = @p5`,
		status, gscRequestID, errMsg, time.Now(), id,
	)
	return err
}

func (r *repository) List(f LogFilter) ([]*GSCRemovalLog, int, error) {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.Limit <= 0 || f.Limit > 100 {
		f.Limit = 20
	}
	offset := (f.Page - 1) * f.Limit

	where := []string{"soft_delete = 0"}
	args := []interface{}{}
	idx := 1

	if f.ThreatID > 0 {
		where = append(where, fmt.Sprintf("threat_id = @p%d", idx))
		args = append(args, f.ThreatID)
		idx++
	}
	if f.Status != "" {
		where = append(where, fmt.Sprintf("status = @p%d", idx))
		args = append(args, f.Status)
		idx++
	}

	whereStr := strings.Join(where, " AND ")

	var total int
	r.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM monitoring.gsc_removal_logs WHERE %s", whereStr), args...).Scan(&total)

	dataSQL := fmt.Sprintf(`
		SELECT id, threat_id, url, action, gsc_request_id, status, submitted_by,
		       submitted_at, error_message,
		       create_date, id_creator, last_update, id_updater, soft_delete
		FROM monitoring.gsc_removal_logs
		WHERE %s
		ORDER BY submitted_at DESC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereStr, idx, idx+1)
	args = append(args, offset, f.Limit)

	rows, err := r.db.Queryx(dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*GSCRemovalLog
	for rows.Next() {
		l := &GSCRemovalLog{}
		if err := rows.StructScan(l); err != nil {
			return nil, 0, err
		}
		list = append(list, l)
	}
	return list, total, nil
}

func (r *repository) CountToday() (int, error) {
	var count int
	today := time.Now().Format("2006-01-02")
	err := r.db.QueryRow(`
		SELECT ISNULL(COUNT(*), 0) FROM monitoring.gsc_removal_logs
		WHERE soft_delete = 0
		  AND status IN ('submitted', 'success')
		  AND CONVERT(date, submitted_at) = CONVERT(date, @p1)`, today).Scan(&count)
	return count, err
}
