package helper

import "fmt"

type CondBuilder struct {
	conds []string
	args  []any
	p     int
}

func NewCondBuilder() *CondBuilder {
	return &CondBuilder{
		p: 1,
	}
}

func (b *CondBuilder) AppendInt(column string, value *int) {
	if value == nil {
		return
	}
	b.conds = append(b.conds, fmt.Sprintf("%s = @p%d", column, b.p))
	b.args = append(b.args, *value)
	b.p++
}

func (b *CondBuilder) AppendString(column string, value *string) {
	if value == nil {
		return
	}
	b.conds = append(b.conds, fmt.Sprintf("%s = @p%d", column, b.p))
	b.args = append(b.args, *value)
	b.p++
}

func (b *CondBuilder) AppendFloat(column string, value *float64) {
	if value == nil {
		return
	}
	b.conds = append(b.conds, fmt.Sprintf("%s = @p%d", column, b.p))
	b.args = append(b.args, *value)
	b.p++
}

func (b *CondBuilder) Like(column string, value string) {
	if value == "" {
		return
	}
	b.conds = append(b.conds, fmt.Sprintf("%s LIKE @p%d", column, b.p))
	b.args = append(b.args, "%"+value+"%")
	b.p++
}

func (b *CondBuilder) Build() ([]string, []any) {
	return b.conds, b.args
}
