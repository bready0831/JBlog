create table if not exists post_views (
  id         bigint generated always as identity primary key,
  slug       text        not null,
  viewed_at  timestamptz not null default now(),
  user_agent text,
  ip         text
);

create index if not exists post_views_slug_idx on post_views (slug);

alter table post_views enable row level security;

-- 누구나 insert 가능 (익명 뷰 포함), select는 service role만
create policy "anyone can record view"
  on post_views for insert
  with check (true);
