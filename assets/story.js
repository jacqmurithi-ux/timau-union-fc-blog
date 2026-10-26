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

    /* Suggest related stories after the full article body. */
    var relatedSection=el("section","related-stories");
    relatedSection.setAttribute("aria-labelledby","related-stories-title");
    relatedSection.append(el("h2","","More stories"));
    relatedSection.querySelector("h2").id="related-stories-title";
    relatedSection.append(el("p","related-stories-intro","More from the club, in date order."));
    var relatedGrid=el("div","related-stories-grid");
    relatedSection.append(relatedGrid);
    var shareSection=document.querySelector(".story-share");
    if(shareSection)shareSection.insertAdjacentElement("afterend",relatedSection);else body.insertAdjacentElement("afterend",relatedSection);
    client.from("blog_articles").select("title,excerpt,category,image_url,published_at,slug").eq("status","published").neq("slug",a.slug).order("published_at",{ascending:false}).limit(3).then(function(result){
      if(result.error||!result.data||!result.data.length){relatedSection.remove();return;}
      var articles=result.data.slice(0,3);
      articles.forEach(function(item){
        var card=el("article","related-story-card");
        var link=el("a","related-story-title",item.title);link.href="/stories/"+encodeURIComponent(item.slug)+"/";
        var meta=el("div","related-story-meta");
        if(item.category)meta.append(el("span","related-story-category",item.category));
        if(item.published_at){var published=new Date(item.published_at);if(!isNaN(published))meta.append(el("time","related-story-date",published.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})));}
        card.append(meta,link);
        if(item.excerpt)card.append(el("p","related-story-excerpt",item.excerpt));
        var read=el("a","related-story-read","Read story →");read.href=link.href;card.append(read);
        relatedGrid.append(card);
      });
      if(!articles.length)relatedSection.remove();
      var more=el("a","related-stories-all","Explore all stories →");more.href="/";relatedSection.append(more);
    }).catch(function(){relatedSection.remove();});

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