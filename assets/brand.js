document.addEventListener("DOMContentLoaded",async function(){
  if(!window.supabase||!window.BLOG_SUPABASE_URL||!window.BLOG_SUPABASE_KEY)return;
  function safeUrl(value){try{var u=new URL(value,location.origin);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch(_){return "";}}
  try{
    var client=window.supabase.createClient(window.BLOG_SUPABASE_URL,window.BLOG_SUPABASE_KEY);
    var result=await client.from("blog_site_content").select("content_type,title,image_url,active").eq("active",true).in("content_type",["branding","hero"]);
    if(result.error||!result.data)return;
    var brand=result.data.find(function(x){return x.content_type==="branding"&&safeUrl(x.image_url);});
    if(brand){
      var icon=safeUrl(brand.image_url);
      document.querySelectorAll('link[rel~="icon"]').forEach(function(link){link.href=icon;});
      document.querySelectorAll(".brand img,.support-crest img,.footer-crest").forEach(function(img){img.src=icon;});
    }
    var hero=result.data.find(function(x){return x.content_type==="hero"&&safeUrl(x.image_url);});
    var slot=document.getElementById("hero-photo-slot"),photo=document.getElementById("hero-photo-image");
    if(slot&&photo&&hero){
      photo.src=safeUrl(hero.image_url);photo.alt=hero.title||"Timau Union FC";photo.hidden=false;slot.classList.add("has-photo");
      slot.setAttribute("role","img");slot.setAttribute("aria-label",photo.alt);
    }
  }catch(_){/* Static crest and hero fallback remain available if the content API is unavailable. */}
});
