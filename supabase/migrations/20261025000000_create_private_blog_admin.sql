-- Private Timau Union FC blog dashboard schema.
-- Apply only to the Timau Union FC Supabase project (owvvimydkjsjlrmnzvdi).

create table if not exists public.blog_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  title text not null check (length(btrim(title)) between 3 and 180),
  excerpt text not null default '' check (length(excerpt) <= 500),
  body text not null default '' check (length(body) <= 100000),
  category text not null check (category in ('match-reports','club-news','community')),
  image_url text,
  image_path text,
  author_name text not null default 'Timau Union FC' check (length(author_name) <= 120),
  status text not null default 'draft' check (status in ('draft','published','unpublished')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_articles_publication_idx on public.blog_articles(status,published_at desc);
create index if not exists blog_articles_category_idx on public.blog_articles(category,published_at desc);
create index if not exists blog_articles_created_by_idx on public.blog_articles(created_by);
create index if not exists blog_articles_updated_by_idx on public.blog_articles(updated_by);

create table if not exists public.blog_site_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('sponsor','announcement')),
  title text not null check (length(btrim(title)) between 2 and 180),
  body text not null default '' check (length(body) <= 5000),
  link_url text,
  image_url text,
  active boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_site_content_public_idx on public.blog_site_content(content_type,active,sort_order);
create index if not exists blog_site_content_created_by_idx on public.blog_site_content(created_by);
create index if not exists blog_site_content_updated_by_idx on public.blog_site_content(updated_by);

create or replace function private.blog_can_manage()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and (
    private.is_active_platform_admin(auth.uid())
    or private.current_club_roles() && array['chairman','secretary','media_team']::text[]
  );
$$;
revoke all on function private.blog_can_manage() from public,anon;
grant execute on function private.blog_can_manage() to authenticated;

create or replace function public.blog_can_manage_current_user()
returns boolean language sql stable security invoker set search_path = ''
as $$ select auth.uid() is not null and private.blog_can_manage(); $$;
revoke all on function public.blog_can_manage_current_user() from public,anon;
grant execute on function public.blog_can_manage_current_user() to authenticated;

create or replace function private.blog_set_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := pg_catalog.now(); return new; end; $$;
revoke all on function private.blog_set_updated_at() from public,anon,authenticated;
drop trigger if exists blog_articles_set_updated_at on public.blog_articles;
create trigger blog_articles_set_updated_at before update on public.blog_articles for each row execute function private.blog_set_updated_at();
drop trigger if exists blog_site_content_set_updated_at on public.blog_site_content;
create trigger blog_site_content_set_updated_at before update on public.blog_site_content for each row execute function private.blog_set_updated_at();

alter table public.blog_articles enable row level security;
alter table public.blog_site_content enable row level security;
drop policy if exists "Published blog articles are public" on public.blog_articles;
drop policy if exists "Authenticated readers and blog editors" on public.blog_articles;
drop policy if exists "Blog editors can read all articles" on public.blog_articles;
create policy "Published blog articles are public" on public.blog_articles for select to anon using(status='published');
create policy "Authenticated readers and blog editors" on public.blog_articles for select to authenticated using(status='published' or (select private.blog_can_manage()));
drop policy if exists "Blog editors can create articles" on public.blog_articles;
create policy "Blog editors can create articles" on public.blog_articles for insert to authenticated
with check ((select private.blog_can_manage()) and (created_by is null or created_by=(select auth.uid())) and (updated_by is null or updated_by=(select auth.uid())));
drop policy if exists "Blog editors can update articles" on public.blog_articles;
create policy "Blog editors can update articles" on public.blog_articles for update to authenticated
using ((select private.blog_can_manage()))
with check ((select private.blog_can_manage()) and (updated_by is null or updated_by=(select auth.uid())));
drop policy if exists "Blog editors can delete articles" on public.blog_articles;
create policy "Blog editors can delete articles" on public.blog_articles for delete to authenticated using((select private.blog_can_manage()));

drop policy if exists "Active blog site content is public" on public.blog_site_content;
drop policy if exists "Authenticated readers and blog editors" on public.blog_site_content;
drop policy if exists "Blog editors can read all site content" on public.blog_site_content;
create policy "Active blog site content is public" on public.blog_site_content for select to anon using(active=true);
create policy "Authenticated readers and blog editors" on public.blog_site_content for select to authenticated using(active=true or (select private.blog_can_manage()));
drop policy if exists "Blog editors can create site content" on public.blog_site_content;
create policy "Blog editors can create site content" on public.blog_site_content for insert to authenticated
with check ((select private.blog_can_manage()) and (created_by is null or created_by=(select auth.uid())) and (updated_by is null or updated_by=(select auth.uid())));
drop policy if exists "Blog editors can update site content" on public.blog_site_content;
create policy "Blog editors can update site content" on public.blog_site_content for update to authenticated
using ((select private.blog_can_manage()))
with check ((select private.blog_can_manage()) and (updated_by is null or updated_by=(select auth.uid())));
drop policy if exists "Blog editors can delete site content" on public.blog_site_content;
create policy "Blog editors can delete site content" on public.blog_site_content for delete to authenticated using((select private.blog_can_manage()));

grant select on public.blog_articles,public.blog_site_content to anon,authenticated;
grant insert,update,delete on public.blog_articles,public.blog_site_content to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('blog-article-images','blog-article-images',true,10485760,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'];
drop policy if exists "Public can view blog article images" on storage.objects;
create policy "Public can view blog article images" on storage.objects for select to anon,authenticated using(bucket_id='blog-article-images');
drop policy if exists "Blog editors can upload images" on storage.objects;
create policy "Blog editors can upload images" on storage.objects for insert to authenticated with check(bucket_id='blog-article-images' and (select private.blog_can_manage()));
drop policy if exists "Blog editors can update images" on storage.objects;
create policy "Blog editors can update images" on storage.objects for update to authenticated using(bucket_id='blog-article-images' and (select private.blog_can_manage())) with check(bucket_id='blog-article-images' and (select private.blog_can_manage()));
drop policy if exists "Blog editors can delete images" on storage.objects;
create policy "Blog editors can delete images" on storage.objects for delete to authenticated using(bucket_id='blog-article-images' and (select private.blog_can_manage()));

insert into public.blog_articles(slug,title,excerpt,body,category,image_url,author_name,status,published_at)
values
('season-2026-review','Timau Union reflects on a season of progress','Timau Union FC finished second in Zone A and qualified for the Meru County League playoffs for a second consecutive season.','The 2026 season brought another important milestone for Timau Union FC: the team finished second in Zone A and qualified for the Meru County League playoffs for the second consecutive year.

For a community-owned club, a season is measured by more than a final position. It is also a story of players, volunteers, supporters and local partners sharing responsibility for the future of football in Timau, Meru County.

Timau Union ended the Zone A league phase on 32 points, finishing behind Imenti. The team’s second-place finish secured a place in the county league playoffs, repeating the club’s playoff qualification from 2025.

The league phase included a 2–0 win over Githongo Scorpion at Timau Stadium on 4 October 2026. The result was the club’s final recorded league fixture of the season.

The playoff campaign concluded with a quarter-final against Mwanga Millers at Kaaga Girls on 17 October. Timau Union did not progress from the tie, bringing the competitive season to a close.

To the players, technical team, club officials, supporters, volunteers and community members who stood with the team throughout the season: thank you. Community football grows when people contribute, encourage one another and keep building together.

With the season concluded, supporters should follow the club’s main website and official social channels for verified updates about upcoming tournaments and fixtures.','club-news','https://timauunionfc.co.ke/assets/club-crest.svg','Timau Union FC','published','2026-10-21T09:00:00Z'),
('playoff-quarter-final','A difficult end to the playoff campaign','Timau Union’s 2026 campaign came to a close after the quarter-final against Mwanga Millers.','Timau Union FC’s 2026 competitive season came to a close following the Meru County League playoff quarter-final against Mwanga Millers on 17 October 2026 at Kaaga Girls.

The team had reached the playoffs after finishing second in Zone A for the second consecutive season. The quarter-final result meant Timau Union did not progress to the next round.

The club thanks its players, technical team, volunteers, supporters and community for their commitment throughout the campaign.

Supporters should follow the club’s official channels for confirmed announcements about upcoming tournaments and future fixtures.','match-reports','https://timauunionfc.co.ke/assets/club-crest.svg','Timau Union FC','published','2026-10-18T09:00:00Z')
on conflict(slug) do nothing;
