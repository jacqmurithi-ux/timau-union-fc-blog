# Timau Union FC Blog

Official public blog for Timau Union FC, the community-owned football club in Timau, Meru County, Kenya.

- **Live site:** https://blog.timauunionfc.co.ke/
- **Main club website:** https://timauunionfc.co.ke/
- **Hosting:** GitHub Pages (static HTML/CSS/JavaScript)
- **Custom domain:** `blog.timauunionfc.co.ke`

## Publishing

This repository is intentionally separate from the club's private management application. It does not contain Supabase credentials, private member data, or management-app code.

1. Create a new story as a standalone HTML file under `stories/`.
2. Include a unique title and description, canonical URL, Open Graph metadata, Twitter card metadata, publication date, and a link back to the main club website.
3. Add the story to `index.html` and `sitemap.xml`.
4. Check facts, names, dates, scores, image rights and links before publishing.
5. Commit the changes to `main`. GitHub Pages serves the static files from the repository root.

Use only confirmed club information. Do not invent upcoming fixtures, scorers, results, quotes, or announcements. Until an upcoming fixture is officially confirmed, direct readers to the club's season page.

## GitHub Pages setup

In **Settings → Pages**, select **Deploy from a branch**, choose `main` and the `/(root)` folder, then save. The `CNAME` file configures the custom domain `blog.timauunionfc.co.ke`. GitHub Pages may take a few minutes to deploy and issue HTTPS after DNS is correct.

## Local preview

Open `index.html` in a browser. For best results, use a simple local static server so root-relative paths such as `/assets/styles.css` behave as they do on the published domain.
