import fs from "node:fs/promises";

const supabaseUrl = "https://owvvimydkjsjlrmnzvdi.supabase.co";
const publishableKey = "sb_publishable_fLCaYsS1Pbp1Kd9blLXHSA_s-_9NNtF";
const baseUrl = "https://blog.timauunionfc.co.ke";
const template = await fs.readFile("story.html", "utf8");
const response = await fetch(
  `${supabaseUrl}/rest/v1/blog_articles?select=slug,title,excerpt,image_url,status&status=eq.published`,
  { headers: { apikey: publishableKey, Authorization: `Bearer ${publishableKey}` } }
);
if (!response.ok) throw new Error(`Supabase story query failed: ${response.status} ${await response.text()}`);
const stories = await response.json();
const esc = (value = "") => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const absolute = (value) => { try { const u = new URL(value); return ["https:", "http:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
const replaceMeta = (html, selector, tag) => {
  const re = new RegExp(`<meta\\s+[^>]*?(?:property|name)=["']${selector}["'][^>]*>`, "i");
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `${tag}</head>`);
};
const meta = (attr, name, content) => `<meta ${attr}="${name}" content="${esc(content)}">`;
let changed = [];
for (const story of stories) {
  if (!story.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(story.slug)) continue;
  const title = story.title || "Timau Union FC Story";
  const description = (story.excerpt || title).slice(0, 200);
  const url = `${baseUrl}/stories/${encodeURIComponent(story.slug)}/`;
  const image = absolute(story.image_url) || "https://timauunionfc.co.ke/assets/club-crest.jpg";
  let html = template;
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${esc(title)} | Timau Union FC Blog</title>`);
  for (const [name, content] of [["description", description]]) html = replaceMeta(html, name, meta("name", name, content));
  for (const [name, content] of [["og:type","article"],["og:site_name","Timau Union FC Blog"],["og:title",title],["og:description",description],["og:url",url],["og:image",image],["og:image:secure_url",image],["og:image:type",image.toLowerCase().endsWith(".png")?"image/png":image.toLowerCase().endsWith(".webp")?"image/webp":"image/jpeg"],["og:image:alt",title]]) html = replaceMeta(html, name, meta("property", name, content));
  for (const [name, content] of [["twitter:card",story.image_url?"summary_large_image":"summary"],["twitter:title",title],["twitter:description",description],...(story.image_url?[["twitter:image",image]]:[])]) html = replaceMeta(html, name, meta("name", name, content));
  const canonical = `<link rel="canonical" href="${esc(url)}">`;
  html = /<link\s+rel=["']canonical["'][^>]*>/i.test(html) ? html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, canonical) : html.replace("</head>", `${canonical}</head>`);
  const path = `stories/${story.slug}/index.html`;
  await fs.mkdir(`stories/${story.slug}`, { recursive: true });
  let old = "";
  try { old = await fs.readFile(path, "utf8"); } catch {}
  if (old !== html) { await fs.writeFile(path, html); changed.push(path); }
}
if (changed.length) {
  console.log(`Updated ${changed.length} story page(s):\\n${changed.join("\\n")}`);
} else console.log("All published story metadata pages are already up to date.");
