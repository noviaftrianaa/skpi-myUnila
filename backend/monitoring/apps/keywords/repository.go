package keywords

import (
	"fmt"
	"strings"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	List(filter KeywordFilter) ([]*ThreatKeyword, int, error)
	GetByID(id int) (*ThreatKeyword, error)
	Create(kw *ThreatKeyword) (int, error)
	Update(id int, req UpdateKeywordRequest, updaterID string) error
	SoftDelete(id int, updaterID string) error
	ListActive() ([]*ThreatKeyword, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) List(f KeywordFilter) ([]*ThreatKeyword, int, error) {
	if f.Page <= 0 {
		f.Page = 1
	}
	if f.Limit <= 0 || f.Limit > 200 {
		f.Limit = 50
	}
	offset := (f.Page - 1) * f.Limit

	where := []string{"soft_delete = 0"}
	args := []interface{}{}
	idx := 1

	if f.Category != "" {
		where = append(where, fmt.Sprintf("category = @p%d", idx))
		args = append(args, f.Category)
		idx++
	}
	if f.IsActive == "1" || f.IsActive == "0" {
		where = append(where, fmt.Sprintf("is_active = @p%d", idx))
		args = append(args, f.IsActive)
		idx++
	}
	if f.Search != "" {
		where = append(where, fmt.Sprintf("keyword LIKE @p%d", idx))
		args = append(args, "%"+f.Search+"%")
		idx++
	}

	whereStr := strings.Join(where, " AND ")

	var total int
	r.db.QueryRow(fmt.Sprintf("SELECT COUNT(*) FROM monitoring.threat_keywords WHERE %s", whereStr), args...).Scan(&total)

	dataSQL := fmt.Sprintf(`
		SELECT id, keyword, category, weight, is_active, notes,
		       create_date, id_creator, last_update, id_updater, soft_delete
		FROM monitoring.threat_keywords
		WHERE %s
		ORDER BY category ASC, weight DESC, keyword ASC
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		whereStr, idx, idx+1)
	args = append(args, offset, f.Limit)

	rows, err := r.db.Queryx(dataSQL, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var list []*ThreatKeyword
	for rows.Next() {
		kw := &ThreatKeyword{}
		if err := rows.StructScan(kw); err != nil {
			return nil, 0, err
		}
		list = append(list, kw)
	}
	return list, total, nil
}

func (r *repository) GetByID(id int) (*ThreatKeyword, error) {
	kw := &ThreatKeyword{}
	err := r.db.QueryRowx(`
		SELECT id, keyword, category, weight, is_active, notes,
		       create_date, id_creator, last_update, id_updater, soft_delete
		FROM monitoring.threat_keywords
		WHERE id = @p1 AND soft_delete = 0`, id).StructScan(kw)
	return kw, err
}

func (r *repository) Create(kw *ThreatKeyword) (int, error) {
	var id int
	err := r.db.QueryRow(`
		INSERT INTO monitoring.threat_keywords
		       (keyword, category, weight, is_active, notes, create_date, id_creator, last_update, soft_delete)
		OUTPUT INSERTED.id
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, 0)`,
		kw.Keyword, kw.Category, kw.Weight, kw.IsActive, kw.Notes,
		kw.CreateDate, kw.IDCreator, kw.LastUpdate).Scan(&id)
	return id, err
}

func (r *repository) Update(id int, req UpdateKeywordRequest, updaterID string) error {
	sets := []string{"last_update = @p1", "id_updater = @p2"}
	args := []interface{}{time.Now(), updaterID}
	idx := 3

	if req.Keyword != nil {
		sets = append(sets, fmt.Sprintf("keyword = @p%d", idx))
		args = append(args, *req.Keyword)
		idx++
	}
	if req.Category != nil {
		sets = append(sets, fmt.Sprintf("category = @p%d", idx))
		args = append(args, *req.Category)
		idx++
	}
	if req.Weight != nil {
		sets = append(sets, fmt.Sprintf("weight = @p%d", idx))
		args = append(args, *req.Weight)
		idx++
	}
	if req.IsActive != nil {
		sets = append(sets, fmt.Sprintf("is_active = @p%d", idx))
		args = append(args, *req.IsActive)
		idx++
	}
	if req.Notes != nil {
		sets = append(sets, fmt.Sprintf("notes = @p%d", idx))
		args = append(args, *req.Notes)
		idx++
	}

	args = append(args, id)
	sql := fmt.Sprintf("UPDATE monitoring.threat_keywords SET %s WHERE id = @p%d AND soft_delete = 0",
		strings.Join(sets, ", "), idx)
	_, err := r.db.Exec(sql, args...)
	return err
}

func (r *repository) SoftDelete(id int, updaterID string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.threat_keywords
		SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id = @p3 AND soft_delete = 0`,
		time.Now(), updaterID, id)
	return err
}

func (r *repository) ListActive() ([]*ThreatKeyword, error) {
	rows, err := r.db.Queryx(`
		SELECT id, keyword, category, weight, is_active, notes,
		       create_date, id_creator, last_update, id_updater, soft_delete
		FROM monitoring.threat_keywords
		WHERE is_active = 1 AND soft_delete = 0
		ORDER BY weight DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []*ThreatKeyword
	for rows.Next() {
		kw := &ThreatKeyword{}
		if err := rows.StructScan(kw); err != nil {
			return nil, err
		}
		list = append(list, kw)
	}
	return list, nil
}
