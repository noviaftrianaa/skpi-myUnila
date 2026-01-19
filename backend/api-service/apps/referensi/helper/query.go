package helper

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/myunila/api-service/apps/referensi/types"
)

type BaseQueryConfig struct {
	Table       string
	Select      string
	DefaultSort string
}

type rowScanner[T any] func(*sql.Rows) (T, error)

func QueryPaged[T any](
	ctx context.Context,
	db *sqlx.DB,
	cfg BaseQueryConfig,
	params types.PaginationParams,
	extraConditions []string,
	extraArgs []interface{},
	scan rowScanner[T],
) ([]T, int64, error) {

	params.NormalizePagination()

	conditions := append([]string{"expired_date IS NULL"}, extraConditions...)
	whereClause := strings.Join(conditions, " AND ")

	// count
	countQuery := fmt.Sprintf(
		"SELECT COUNT(*) FROM %s WHERE %s",
		cfg.Table, whereClause,
	)

	var total int64
	if err := db.QueryRowContext(ctx, countQuery, extraArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	sortBy := cfg.DefaultSort
	if params.SortBy != "" {
		sortBy = params.SortBy
	}

	query := fmt.Sprintf(`
		SELECT %s
		FROM %s
		WHERE %s
		ORDER BY %s %s
		OFFSET @p%d ROWS FETCH NEXT @p%d ROWS ONLY`,
		cfg.Select,
		cfg.Table,
		whereClause,
		sortBy,
		params.Order,
		len(extraArgs)+1,
		len(extraArgs)+2,
	)

	args := append(extraArgs, params.Offset(), params.Limit)

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var result []T
	for rows.Next() {
		item, err := scan(rows)
		if err != nil {
			return nil, 0, err
		}
		result = append(result, item)
	}

	return result, total, nil
}
