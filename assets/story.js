document.addEventListener("DOMContentLoaded",async function(){
  var title=document.getElementById("story-title"),excerpt=document.getElementById("story-excerpt"),body=document.getElementById("story-body");
  var pathMatch=location.pathname.match(/^\/stories\/([^/]+)\/?$/);
  var slug=(pathMatch?decodeURIComponent(pathMatch[1]):new URLSearchParams(location.search).get("slug"));
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function setMeta(key,value,attribute){
    var selector='meta['+(attribute||"property")+'="'+key+'"]',m=document.querySelector(selector);
    if(!m){m=document.createElement("meta");m.setAttribute(attribute||"property",key);document.head.append(m);}
    m.content=value||"";
  }
  if(!slug){title.textContent="Story not found";body.replaceChildren(el("p","","Choose a story from the blog homepage."));return;}
  try{
    var client=window.supabase.createClient(window.BLOG_SUPABASE_URL,window.BLOG_SUPABASE_KEY);
    var r=await client.from("blog_articles").select("title,excerpt,body,category,image_url,author_name,published_at,slug").eq("slug",slug).eq("status","published").maybeSingle();
    if(r.error||!r.data)throw new Error("Story unavailable");
    var a=r.data;document.title=a.title+" | Timau Union FC Blog";title.textContent=a.title;excerpt.textContent=a.excerpt||"";
    var date=a.published_at?new Date(a.published_at):null;
    document.getElementById("story-byline").textContent=(a.author_name||"Timau Union FC")+" · "+(date&&!isNaN(date)?date.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"");
    var image=document.getElementById("story-image"),imageWrap=document.getElementById("story-image-wrap");
    if(a.image_url){image.src=a.image_url;image.alt=a.title;imageWrap.hidden=false;}else{image.removeAttribute("src");image.alt="";imageWrap.hidden=true;}
    body.replaceChildren();
    (a.body||"").split(/\n\s*\n/).map(function(p){return p.trim();}).filter(Boolean).forEach(function(p){body.append(el("p","",p));});
    if(!body.children.length)body.append(el("p","","This story has no article text yet."));
    var description=(a.excerpt||a.title).slice(0,155),canonicalUrl=location.origin+"/stories/"+encodeURIComponent(a.slug)+"/";
    setMeta("description",description,"name");
    var canonical=document.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.append(canonical);}
    canonical.href=canonicalUrl;
    setMeta("og:title",a.title);setMeta("og:description",description);setMeta("og:url",canonicalUrl);setMeta("og:type","article");setMeta("og:site_name","Timau Union FC Blog");
    if(a.image_url)setMeta("og:image",a.image_url);else setMeta("og:image","https://timauunionfc.co.ke/assets/club-crest.jpg");
    setMeta("twitter:card",a.image_url?"summary_large_image":"summary","name");setMeta("twitter:title",a.title,"name");setMeta("twitter:description",description,"name");
    if(a.image_url)setMeta("twitter:image",a.image_url,"name");
  }catch(_){title.textContent="Story not found";excerpt.textContent="This article may have been unpublished or the link may be incorrect.";body.replaceChildren(el("p","","Return to the blog homepage to read the latest published stories."));}
});