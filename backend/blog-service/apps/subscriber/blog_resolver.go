package subscriber

import (
	"context"

	"github.com/google/uuid"

	blogpkg "github.com/myunila/blog-service/apps/blog"
)

// BlogResolverAdapter — wraps blog.Repository supaya subscriber package gak
// import blog directly di handler signature (keep interface narrow).
type BlogResolverAdapter struct{ repo *blogpkg.Repository }

func NewBlogResolverAdapter(repo *blogpkg.Repository) *BlogResolverAdapter {
	return &BlogResolverAdapter{repo: repo}
}

func (a *BlogResolverAdapter) ResolveIDFromSubdomain(ctx context.Context, subdomain string) (uuid.UUID, error) {
	b, err := a.repo.GetBySubdomain(ctx, subdomain)
	if err != nil {
		return uuid.Nil, err
	}
	return b.IDBlog, nil
}
