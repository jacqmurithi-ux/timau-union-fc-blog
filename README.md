# Timau Union FC Blog

Official public blog for Timau Union FC, the community-owned football club in Timau, Meru County, Kenya.

- **Live site:** https://blog.timauunionfc.co.ke/
- **Main club website:** https://timauunionfc.co.ke/
- **Hosting:** GitHub Pages (static HTML/CSS/JavaScript)
- **Custom domain:** `blog.timauunionfc.co.ke`

## Publishing and administration

The private dashboard is available at **https://blog.timauunionfc.co.ke/admin.html**. Sign in with an existing approved Timau Union FC account assigned to Platform Admin, Chairman, Secretary or Media Team. The page itself is static, but dashboard access is checked by a database authorization function and all reads/writes are protected by Supabase Row Level Security; a hidden URL is not the security boundary.

Editors can create, preview, publish and unpublish articles; edit the existing posts; upload or replace article images; and manage sponsor content, announcements, the homepage hero photo, and the blog favicon/logo. Image uploads accept JPG, PNG, WebP and AVIF up to 10 MB. Legacy article links now open the editable database-backed article. Public visitors can read only published stories and active homepage content.

The blog uses the existing Timau Union FC Supabase project (`owvvimydkjsjlrmnzvdi`) and a browser-safe publishable key. The reproducible database setup is recorded in `supabase/migrations/20261025000000_create_private_blog_admin.sql` and `supabase/migrations/20261025010000_manage_blog_branding_and_hero.sql`. Never put a Supabase service-role/secret key in this repository. Article text is plain text with blank lines between paragraphs; HTML entered by editors is not executed.

Use only confirmed club information. Do not invent upcoming fixtures, scorers, results, quotes, or announcements. Until an upcoming fixture is officially confirmed, direct readers to the club's season page.

## GitHub Pages setup

In **Settings → Pages**, select **Deploy from a branch**, choose `main` and the `/(root)` folder, then save. The `CNAME` file configures the custom domain `blog.timauunionfc.co.ke`. GitHub Pages may take a few minutes to deploy and issue HTTPS after DNS is correct.

## Local preview

Open `index.html` in a browser. For best results, use a simple local static server so root-relative paths such as `/assets/styles.css` behave as they do on the published domain.
