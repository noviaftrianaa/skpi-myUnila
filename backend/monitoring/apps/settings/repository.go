package settings

import (
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	ListAll() ([]*Setting, error)
	ListByGroup(group string) ([]*Setting, error)
	GetByID(id int) (*Setting, error)
	Update(id int, value *string, updaterID string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

const settingCols = `id, key_group, setting_key, setting_value, description, is_sensitive,
	create_date, CONVERT(nvarchar(36), id_creator) AS id_creator,
	last_update, CONVERT(nvarchar(36), id_updater) AS id_updater, soft_delete`

func (r *repository) ListAll() ([]*Setting, error) {
	var list []*Setting
	err := r.db.Select(&list,
		`SELECT `+settingCols+` FROM monitoring.settings WHERE soft_delete = 0 ORDER BY key_group, setting_key`)
	return list, err
}

func (r *repository) ListByGroup(group string) ([]*Setting, error) {
	var list []*Setting
	err := r.db.Select(&list,
		`SELECT `+settingCols+` FROM monitoring.settings WHERE key_group = @p1 AND soft_delete = 0 ORDER BY setting_key`, group)
	return list, err
}

func (r *repository) GetByID(id int) (*Setting, error) {
	s := &Setting{}
	err := r.db.QueryRowx(
		`SELECT `+settingCols+` FROM monitoring.settings WHERE id = @p1 AND soft_delete = 0`, id).StructScan(s)
	if err != nil {
		return nil, err
	}
	return s, nil
}

func (r *repository) Update(id int, value *string, updaterID string) error {
	_, err := r.db.Exec(`
		UPDATE monitoring.settings
		SET setting_value = @p1, last_update = @p2, id_updater = @p3
		WHERE id = @p4 AND soft_delete = 0`,
		value, time.Now(), updaterID, id)
	return err
}
