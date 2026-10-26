document.addEventListener("DOMContentLoaded",async function(){
  if(!window.supabase||!window.BLOG_SUPABASE_URL||!window.BLOG_SUPABASE_KEY)return;
  var client=window.supabase.createClient(window.BLOG_SUPABASE_URL,window.BLOG_SUPABASE_KEY);
  function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
  function dateLabel(value){var d=value?new Date(value):null;return d&&!isNaN(d)?d.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}):"";}
  function categoryLabel(value){return {"match-reports":"Match report","club-news":"Club news","the-journey":"The journey","community":"Our people","partners-community":"Partners & community"}[value]||"Club news";}
  function validUrl(value){try{var u=new URL(value,location.origin);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch(_){return "";}}
  var grid=document.getElementById("story-list");
  try{
    var result=await client.from("blog_articles").select("slug,title,excerpt,category,image_url,published_at,author_name").eq("status","published").order("published_at",{ascending:false});
    if(!result.error&&result.data){
      var latestSlug="betika-meru-football-challenge-2026";
      if(!result.data.some(function(a){return a.slug===latestSlug;})){
        result.data.unshift({slug:latestSlug,title:"Timau Union Returns to Betika Meru Football Challenge: Can the Boys Go Further?",excerpt:"Timau Union returns to the Betika Meru Football Challenge after reaching the knockouts last time. Can the club build on its Zone A second-place finish and go further?",category:"club-news",image_url:"",published_at:"2026-10-26T07:00:00Z",author_name:"Timau Union FC"});
      }
      grid.replaceChildren();
      result.data.forEach(function(a,index){
        var card=el("article","story-card"+(index===0?" featured":""));card.dataset.category=a.category;
        var link=el("a","story-image "+(index%2?"image-dark":"image-red"));link.href="/stories/"+encodeURIComponent(a.slug)+"/";link.setAttribute("aria-label","Read "+a.title);
        if(a.image_url&&validUrl(a.image_url)){var image=el("img","story-card-photo");image.src=validUrl(a.image_url);image.alt=a.title+" — Timau Union FC";image.loading="lazy";link.append(image);}
        link.append(el("span","image-kicker",categoryLabel(a.category).toUpperCase()),el("span","image-title",a.title));
        var body=el("div","story-body"),meta=el("p","story-meta");meta.append(el("time","",dateLabel(a.published_at)),el("span","","·"),el("span","",categoryLabel(a.category)));
        var heading=el("h3",""),headingLink=el("a","",a.title);headingLink.href=link.href;heading.append(headingLink);
        body.append(meta,heading,el("p","",a.excerpt||""),Object.assign(el("a","read-link","Read story →"),{href:link.href}));
        card.append(link,body);grid.append(card);
      });
      grid.querySelectorAll(".story-card").forEach(function(card){card.hidden=false;});
      if(window.applyBlogStoryFilters)window.applyBlogStoryFilters();
    }
  }catch(_){/* Static fallback content remains usable when the data API is unavailable. */}
  try{
    var c=await client.from("blog_site_content").select("content_type,title,body,link_url,image_url,sort_order").eq("active",true).order("sort_order");
    if(c.error||!c.data)return;
    var announcements=c.data.filter(function(x){return x.content_type==="announcement";});
    var sponsors=c.data.filter(function(x){return x.content_type==="sponsor";});
    var updates=document.querySelector(".updates-strip");
    if(updates&&announcements.length){
      var holder=el("div","homepage-announcements");
      announcements.forEach(function(a){var item=el("article","homepage-announcement");item.append(el("h3","",a.title),el("p","",a.body||""));var href=validUrl(a.link_url);if(href){var link=el("a","read-link","More information →");link.href=href;link.rel="noopener noreferrer";item.append(link);}holder.append(item);});
      updates.append(holder);
    }
    var support=document.querySelector(".support-section");
    if(support&&sponsors.length){
      var container=el("div","active-sponsors");container.append(el("p","eyebrow red","BLOG PARTNERS"));
      sponsors.forEach(function(s){var item=el("article","active-sponsor");if(s.image_url&&validUrl(s.image_url)){var im=el("img","sponsor-content-image");im.src=validUrl(s.image_url);im.alt="";im.loading="lazy";item.append(im);}item.append(el("h3","",s.title),el("p","",s.body||""));var href=validUrl(s.link_url);if(href){var a=el("a","read-link","Visit partner →");a.href=href;a.rel="noopener noreferrer";a.target="_blank";item.append(a);}container.append(item);});
      support.append(container);
    }
  }catch(_){/* Public page still works with the static sponsor CTA. */}
});