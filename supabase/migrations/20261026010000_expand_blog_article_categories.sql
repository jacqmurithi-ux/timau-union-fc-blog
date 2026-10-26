-- Expand the editorial categories supported by the Timau Union FC blog.
-- Existing categories and articles remain unchanged.
alter table public.blog_articles
  drop constraint if exists blog_articles_category_check;

alter table public.blog_articles
  add constraint blog_articles_category_check
  check (category in (
    'match-reports',
    'club-news',
    'community',
    'the-journey',
    'partners-community'
  ));
