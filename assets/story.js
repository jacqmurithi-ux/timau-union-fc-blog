document.addEventListener("DOMContentLoaded",async function(){
  var title=document.getElementById("story-title"),excerpt=document.getElementById("story-excerpt"),body=document.getElementById("story-body");
  var slug=new URLSearchParams(location.search).get("slug");
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  if(!slug){title.textContent="Story not found";body.replaceChildren(el("p","","Choose a story from the blog homepage."));return;}
  try{
    var client=window.supabase.createClient(window.BLOG_SUPABASE_URL,window.BLOG_SUPABASE_KEY);
    var r=await client.from("blog_articles").select("title,excerpt,body,category,image_url,author_name,published_at,slug").eq("slug",slug).eq("status","published").maybeSingle();
    if(r.error||!r.data)throw new Error("Story unavailable");
    var a=r.data;document.title=a.title+" | Timau Union FC Blog";title.textContent=a.title;excerpt.textContent=a.excerpt||"";
    var date=a.published_at?new Date(a.published_at):null;
    document.getElementById("story-byline").textContent=(a.author_name||"Timau Union FC")+" · "+(date&&!isNaN(date)?date.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"");
    if(a.image_url){var image=document.getElementById("story-image");image.src=a.image_url;image.alt=a.title;document.getElementById("story-image-wrap").hidden=false;}
    body.replaceChildren();
    (a.body||"").split(/\n\s*\n/).map(function(p){return p.trim();}).filter(Boolean).forEach(function(p){body.append(el("p","",p));});
    if(!body.children.length)body.append(el("p","","This story has no article text yet."));
    document.querySelector('meta[name="description"]').content=(a.excerpt||a.title).slice(0,155);
    var canonical=document.createElement("link");canonical.rel="canonical";canonical.href=location.origin+"/story.html?slug="+encodeURIComponent(a.slug);document.head.append(canonical);
    [["og:title",a.title],["og:description",a.excerpt||a.title],["og:url",canonical.href],["og:type","article"]].forEach(function(pair){var m=document.createElement("meta");m.setAttribute("property",pair[0]);m.content=pair[1];document.head.append(m);});
    if(a.image_url){var m=document.createElement("meta");m.setAttribute("property","og:image");m.content=a.image_url;document.head.append(m);}
  }catch(_){title.textContent="Story not found";excerpt.textContent="This article may have been unpublished or the link may be incorrect.";body.replaceChildren(el("p","","Return to the blog homepage to read the latest published stories."));}
});