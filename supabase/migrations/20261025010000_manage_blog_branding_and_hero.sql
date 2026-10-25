-- Extend dashboard-managed public blog content with brand/favicon and hero image settings.
alter table public.blog_site_content drop constraint if exists blog_site_content_content_type_check;
alter table public.blog_site_content add constraint blog_site_content_content_type_check
  check (content_type in ('sponsor','announcement','branding','hero','partner_image'));
alter table public.blog_site_content add column if not exists image_path text;
insert into public.blog_site_content(content_type,title,body,image_url,active,sort_order)
select 'branding','Blog icon and logo','Upload the approved Timau Union FC blog icon or crest. This image is used for the blog favicon and header/footer marks.','https://timauunionfc.co.ke/assets/club-crest.svg',true,-100
where not exists (select 1 from public.blog_site_content where content_type='branding');

-- Seed a disabled partner image slot; the dashboard enables it when an image is saved.
insert into public.blog_site_content(content_type,title,body,image_url,active,sort_order)
select 'partner_image','Homepage partner image','Optional image beside the Support Timau Union FC callout.',null,false,0
where not exists (select 1 from public.blog_site_content where content_type='partner_image');
