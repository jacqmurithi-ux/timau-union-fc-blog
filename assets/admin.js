document.addEventListener("DOMContentLoaded",function(){
  var client=window.supabase.createClient(window.BLOG_SUPABASE_URL,window.BLOG_SUPABASE_KEY);
  var loginPanel=document.getElementById("login-panel"),workspace=document.getElementById("workspace");
  var loginForm=document.getElementById("login-form"),loginMessage=document.getElementById("login-message");
  var articleForm=document.getElementById("article-form"),articleList=document.getElementById("article-list");
  var articleMessage=document.getElementById("article-message"),imageFile=document.getElementById("article-image-file");
  var imagePreview=document.getElementById("image-preview"),previewImage=document.getElementById("preview-image");
  var contentForm=document.getElementById("site-content-form"),contentList=document.getElementById("site-content-list");
  var contentMessage=document.getElementById("content-message"),currentUser=null,articles=[],siteItems=[],uploadedPath=null;
  var categoryLabels={"match-reports":"Match reports","club-news":"Club news","community":"Community stories"};
  function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
  function message(node,txt,isError){node.textContent=txt||"";node.classList.toggle("is-error",!!isError);}
  function val(name){return articleForm.elements[name].value.trim();}
  function siteVal(name){return contentForm.elements[name].value.trim();}
  function slugify(value){return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,120);}
  function dateLabel(value){if(!value)return "Not published";var d=new Date(value);return isNaN(d)?"":d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});}
  function safeUrl(value){try{var u=new URL(value,window.location.origin);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch(_){return "";}}
  async function checkAccess(){
    var access=await client.rpc("blog_can_manage_current_user");
    if(access.error||access.data!==true)throw new Error("This account does not have blog editor access. Ask the Platform Admin to confirm your approved club role.");
    var result=await client.from("blog_articles").select("id").limit(1);
    if(result.error)throw new Error("Blog editor access could not be verified. Please try again.");
  }
  async function openWorkspace(user){
    currentUser=user;await checkAccess();loginPanel.hidden=true;workspace.hidden=false;
    document.getElementById("signed-in-email").textContent=user.email||"Signed in";
    await Promise.all([loadArticles(),loadSiteItems()]);
  }
  loginForm.addEventListener("submit",async function(e){e.preventDefault();message(loginMessage,"Signing in…",false);
    var f=new FormData(loginForm);
    var result=await client.auth.signInWithPassword({email:String(f.get("email")).trim(),password:String(f.get("password"))});
    if(result.error){message(loginMessage,result.error.message,true);return;}
    try{await openWorkspace(result.data.user);}catch(err){await client.auth.signOut();message(loginMessage,err.message,true);}
  });
  document.getElementById("sign-out").addEventListener("click",async function(){await client.auth.signOut();location.reload();});
  client.auth.getSession().then(async function(r){if(r.data.session){try{await openWorkspace(r.data.session.user);}catch(err){await client.auth.signOut();message(loginMessage,err.message,true);}}});
  document.querySelectorAll("[data-tab]").forEach(function(button){button.addEventListener("click",function(){
    document.querySelectorAll("[data-tab]").forEach(function(b){var active=b===button;b.classList.toggle("is-active",active);b.setAttribute("aria-selected",String(active));});
    document.getElementById("articles-tab").hidden=button.dataset.tab!=="articles";document.getElementById("site-content-tab").hidden=button.dataset.tab!=="site-content";
  });});
  async function loadArticles(){
    articleList.replaceChildren(el("p","","Loading…"));
    var r=await client.from("blog_articles").select("*").order("created_at",{ascending:false});
    if(r.error){articleList.replaceChildren(el("p","is-error",r.error.message));return;}
    articles=r.data||[];renderArticles();
  }
  function renderArticles(){
    articleList.replaceChildren();
    if(!articles.length){articleList.append(el("p","muted","No articles yet. Create the first story."));return;}
    articles.forEach(function(a){
      var card=el("article","library-item"),info=el("div","library-info"),title=el("h3","",a.title);
      var meta=el("p","library-meta",(categoryLabels[a.category]||a.category)+" · "+(a.status==="published"?"Published":a.status==="unpublished"?"Unpublished":"Draft")+" · "+dateLabel(a.published_at));
      info.append(title,meta);var actions=el("div","library-actions");
      var edit=el("button","button button-outline","Edit");edit.type="button";edit.addEventListener("click",function(){fillArticle(a);});
      var state=el("button",a.status==="published"?"button button-outline":"button button-red",a.status==="published"?"Unpublish":"Publish");state.type="button";
      state.addEventListener("click",function(){changeStatus(a,a.status==="published"?"unpublished":"published");});
      var preview=el("a","text-link","Preview ↗");preview.href="/story.html?slug="+encodeURIComponent(a.slug);preview.target="_blank";preview.rel="noopener noreferrer";
      actions.append(edit,state);if(a.status==="published")actions.append(preview);card.append(info,actions);articleList.append(card);
    });
  }
  function resetArticle(){
    articleForm.reset();articleForm.elements.id.value="";articleForm.elements.author_name.value="Timau Union FC";
    document.getElementById("editor-heading").textContent="Create an article";uploadedPath=null;
    imagePreview.hidden=true;previewImage.removeAttribute("src");message(articleMessage,"",false);
  }
  document.getElementById("new-article").addEventListener("click",resetArticle);
  document.querySelectorAll("#article-form [name=title]").forEach(function(input){input.addEventListener("input",function(){if(!articleForm.elements.id.value)articleForm.elements.slug.value=slugify(input.value);});});
  function fillArticle(a){
    ["id","title","slug","category","excerpt","body","image_url","author_name"].forEach(function(k){articleForm.elements[k].value=a[k]||"";});
    uploadedPath=a.image_path||null;document.getElementById("editor-heading").textContent="Edit article";
    imagePreview.hidden=!a.image_url;if(a.image_url)previewImage.src=a.image_url;message(articleMessage,"",false);
    document.querySelector(".editor-panel").scrollIntoView({behavior:"smooth",block:"start"});
  }
  imageFile.addEventListener("change",function(){
    var file=imageFile.files&&imageFile.files[0];if(!file)return;
    if(!/^image\/(jpeg|png|webp|avif)$/.test(file.type)||file.size>10485760){imageFile.value="";message(articleMessage,"Choose a JPG, PNG, WebP or AVIF image under 10 MB.",true);return;}
    previewImage.src=URL.createObjectURL(file);imagePreview.hidden=false;message(articleMessage,"Image selected. It will upload when you save the article.",false);
  });
  document.getElementById("remove-image").addEventListener("click",function(){articleForm.elements.image_url.value="";uploadedPath=null;imageFile.value="";imagePreview.hidden=true;previewImage.removeAttribute("src");});
  async function uploadSelectedImage(){
    var file=imageFile.files&&imageFile.files[0];if(!file)return {url:articleForm.elements.image_url.value.trim()||null,path:uploadedPath};
    var ext=file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg";
    var path=Date.now()+"-"+crypto.randomUUID()+"."+ext;
    var result=await client.storage.from("blog-article-images").upload(path,file,{contentType:file.type,upsert:false});
    if(result.error)throw result.error;
    var pub=client.storage.from("blog-article-images").getPublicUrl(path);
    return {url:pub.data.publicUrl,path:path};
  }
  articleForm.addEventListener("submit",async function(e){
    e.preventDefault();var action=e.submitter&&e.submitter.value==="published"?"published":"draft";
    message(articleMessage,"Saving article…",false);
    try{
      var image=await uploadSelectedImage();
      var existing=articles.find(function(a){return a.id===articleForm.elements.id.value;});
      var payload={slug:val("slug"),title:val("title"),excerpt:val("excerpt"),body:val("body"),category:val("category"),image_url:image.url,image_path:image.path,author_name:val("author_name")||"Timau Union FC",status:action,updated_by:currentUser.id};
      if(action==="published")payload.published_at=(existing&&existing.published_at)||new Date().toISOString();
      if(!existing)payload.created_by=currentUser.id;
      var q=existing?client.from("blog_articles").update(payload).eq("id",existing.id):client.from("blog_articles").insert(payload);
      var r=await q.select().single();if(r.error)throw r.error;
      message(articleMessage,action==="published"?"Article published.":"Draft saved.",false);imageFile.value="";uploadedPath=image.path;
      await loadArticles();
    }catch(err){message(articleMessage,err.message||"Could not save article.",true);}
  });
  async function changeStatus(a,status){
    var payload={status:status,updated_by:currentUser.id};
    if(status==="published")payload.published_at=a.published_at||new Date().toISOString();
    var r=await client.from("blog_articles").update(payload).eq("id",a.id);
    if(r.error){message(articleMessage,r.error.message,true);return;}
    await loadArticles();message(articleMessage,status==="published"?"Article published.":"Article unpublished.",false);
  }
  document.getElementById("preview-article").addEventListener("click",function(){
    var title=val("title")||"Untitled story",excerpt=val("excerpt"),body=val("body"),image=articleForm.elements.image_url.value.trim();
    var file=imageFile.files&&imageFile.files[0];if(file)image=URL.createObjectURL(file);
    var wrap=document.getElementById("preview-content");wrap.replaceChildren();
    if(image&&safeUrl(image)){var img=el("img","dynamic-story-image");img.src=safeUrl(image);img.alt=title;wrap.append(img);}
    wrap.append(el("p","lead",excerpt));
    body.split(/\n\s*\n/).map(function(p){return p.trim();}).filter(Boolean).forEach(function(p){wrap.append(el("p","",p));});
    document.getElementById("preview-title").textContent=title+" — preview";document.getElementById("preview-modal").hidden=false;
  });
  document.getElementById("close-preview").addEventListener("click",function(){document.getElementById("preview-modal").hidden=true;});
  document.getElementById("preview-modal").addEventListener("click",function(e){if(e.target.id==="preview-modal")e.currentTarget.hidden=true;});
  async function loadSiteItems(){
    contentList.replaceChildren(el("p","","Loading…"));
    var r=await client.from("blog_site_content").select("*").order("sort_order").order("created_at",{ascending:false});
    if(r.error){contentList.replaceChildren(el("p","is-error",r.error.message));return;}
    siteItems=r.data||[];renderSiteItems();
  }
  function renderSiteItems(){
    contentList.replaceChildren();
    if(!siteItems.length){contentList.append(el("p","muted","No sponsor content or announcements yet."));return;}
    siteItems.forEach(function(item){
      var row=el("article","library-item"),info=el("div","library-info"),title=el("h3","",item.title);
      var meta=el("p","library-meta",(item.content_type==="sponsor"?"Sponsor content":"Announcement")+" · "+(item.active?"Visible":"Hidden"));
      info.append(title,meta);var actions=el("div","library-actions");
      var edit=el("button","button button-outline","Edit");edit.type="button";edit.addEventListener("click",function(){fillSiteItem(item);});
      var toggle=el("button",item.active?"button button-outline":"button button-red",item.active?"Hide":"Show");toggle.type="button";
      toggle.addEventListener("click",async function(){var u=await client.from("blog_site_content").update({active:!item.active,updated_by:currentUser.id}).eq("id",item.id);if(u.error){message(contentMessage,u.error.message,true);return;}await loadSiteItems();});
      var del=el("button","text-button","Delete");del.type="button";del.addEventListener("click",async function(){if(!window.confirm("Delete this content?"))return;var d=await client.from("blog_site_content").delete().eq("id",item.id);if(d.error){message(contentMessage,d.error.message,true);return;}await loadSiteItems();});
      actions.append(edit,toggle,del);row.append(info,actions);contentList.append(row);
    });
  }
  function fillSiteItem(item){
    contentForm.hidden=false;["id","content_type","title","body","link_url","image_url","sort_order"].forEach(function(k){contentForm.elements[k].value=item[k]===null||item[k]===undefined?"":item[k];});
    contentForm.elements.active.checked=!!item.active;message(contentMessage,"",false);contentForm.scrollIntoView({behavior:"smooth",block:"center"});
  }
  document.getElementById("new-site-content").addEventListener("click",function(){contentForm.reset();contentForm.elements.id.value="";contentForm.elements.sort_order.value="0";contentForm.hidden=false;message(contentMessage,"",false);});
  document.getElementById("cancel-content-edit").addEventListener("click",function(){contentForm.hidden=true;});
  contentForm.addEventListener("submit",async function(e){
    e.preventDefault();message(contentMessage,"Saving content…",false);
    var existing=siteItems.find(function(x){return x.id===contentForm.elements.id.value;});
    var payload={content_type:siteVal("content_type"),title:siteVal("title"),body:siteVal("body"),link_url:siteVal("link_url")||null,image_url:siteVal("image_url")||null,active:contentForm.elements.active.checked,sort_order:Number(siteVal("sort_order"))||0,updated_by:currentUser.id};
    if(!existing)payload.created_by=currentUser.id;
    var q=existing?client.from("blog_site_content").update(payload).eq("id",existing.id):client.from("blog_site_content").insert(payload);
    var r=await q;if(r.error){message(contentMessage,r.error.message,true);return;}
    contentForm.hidden=true;message(contentMessage,"Content saved.",false);await loadSiteItems();
  });
});