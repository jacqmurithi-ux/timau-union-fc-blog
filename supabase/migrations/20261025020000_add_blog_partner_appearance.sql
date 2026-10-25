-- Blog Appearance dashboard: allow a dedicated homepage partner image setting.
-- Storage uses the existing public blog-article-images bucket and existing blog-editor RLS policies.
alter table public.blog_site_content
  drop constraint if exists blog_site_content_content_type_check;
alter table public.blog_site_content
  add constraint blog_site_content_content_type_check
  check (content_type in ('sponsor','announcement','branding','hero','partner_image'));

insert into public.blog_site_content(content_type,title,body,image_url,active,sort_order)
select 'partner_image','Homepage partner image',
       'Optional image beside the Support Timau Union FC callout.',null,false,0
where not exists (
  select 1 from public.blog_site_content where content_type='partner_image'
);

-- Replace the stale SVG branding URL with the crest file confirmed in the main club repository.
update public.blog_site_content
set image_url='https://timauunionfc.co.ke/assets/club-crest.jpg',
    updated_at=now()
where content_type='branding'
  and image_url='https://timauunionfc.co.ke/assets/club-crest.svg';
