-- ============================================================
-- monitoring_04_blog_posts_cache_create.sql
-- Cache konten dari Blogger API per situs
-- ============================================================

create table monitoring.blog_posts_cache (
    id                  uniqueidentifier    not null,
    site_id             uniqueidentifier    not null,
    blogger_post_id     nvarchar(100)       not null,
    title               nvarchar(500)       not null,
    content             nvarchar(max)       not null,
    excerpt             nvarchar(1000)      null,
    slug                nvarchar(500)       not null,
    author_name         nvarchar(200)       null,
    author_avatar_url   nvarchar(500)       null,
    labels              nvarchar(max)       null,   -- JSON array: ["berita","akademik"]
    thumbnail_url       nvarchar(500)       null,
    published_at        datetime            not null,
    updated_at_source   datetime            not null,
    synced_at           datetime            not null,
    is_visible          numeric(1)          not null default 1
        constraint ckc_is_visible_blog_posts check (is_visible in (0,1)),
    -- audit
    create_date         datetime            not null,
    id_creator          uniqueidentifier    not null,
    last_update         datetime            not null,
    id_updater          uniqueidentifier    null,
    soft_delete         numeric(1)          not null default 0
        constraint ckc_soft_delete_blog_posts check (soft_delete in (0,1)),

    constraint pk_blog_posts_cache primary key (id),
    constraint fk_blog_posts_site foreign key (site_id)
        references monitoring.sites (id),
    constraint uq_blog_posts_external unique (site_id, blogger_post_id)
)
go

create index idx_blog_posts_1 on monitoring.blog_posts_cache (published_at desc) where soft_delete = 0
go
create index idx_blog_posts_2 on monitoring.blog_posts_cache (site_id, published_at desc) where soft_delete = 0
go
create index idx_blog_posts_3 on monitoring.blog_posts_cache (slug) where soft_delete = 0
go

print 'Table monitoring.blog_posts_cache created.'
go
