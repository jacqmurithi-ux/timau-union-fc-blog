document.addEventListener("DOMContentLoaded",function(){
  var year=document.getElementById("year");
  if(year)year.textContent=String(new Date().getFullYear());

  var menuButton=document.querySelector(".menu-toggle");
  var nav=document.getElementById("primary-nav");
  if(menuButton&&nav){
    menuButton.addEventListener("click",function(){
      var expanded=menuButton.getAttribute("aria-expanded")==="true";
      menuButton.setAttribute("aria-expanded",String(!expanded));
      nav.classList.toggle("is-open",!expanded);
    });
  }

  var searchInput=document.querySelector("[data-story-search]");
  var cards=Array.prototype.slice.call(document.querySelectorAll(".story-card"));
  var filterButtons=Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var emptyMessage=document.querySelector(".filter-empty");
  var loadMore=document.getElementById("load-more");
  var activeFilter="all";
  var visibleLimit=6;
  function applyStoryView(){
    cards=Array.prototype.slice.call(document.querySelectorAll(".story-card"));
    var query=searchInput?searchInput.value.trim().toLowerCase():"";
    var matches=cards.filter(function(card){
      var categoryMatches=activeFilter==="all"||card.getAttribute("data-category")===activeFilter;
      var textMatches=!query||card.textContent.toLowerCase().indexOf(query)!==-1;
      return categoryMatches&&textMatches;
    });
    cards.forEach(function(card){card.hidden=matches.indexOf(card)===-1||matches.indexOf(card)>=visibleLimit;});
    if(emptyMessage)emptyMessage.hidden=matches.length!==0;
    if(loadMore){loadMore.hidden=matches.length<=visibleLimit;loadMore.textContent="Load more stories";}
  }
  filterButtons.forEach(function(button){
    button.addEventListener("click",function(){
      activeFilter=button.getAttribute("data-filter")||"all";
      visibleLimit=6;
      filterButtons.forEach(function(other){
        var active=other===button;
        other.classList.toggle("is-active",active);
        other.setAttribute("aria-pressed",String(active));
      });
      applyStoryView();
    });
  });
  if(searchInput)searchInput.addEventListener("input",function(){visibleLimit=6;applyStoryView();});
  if(loadMore)loadMore.addEventListener("click",function(){visibleLimit+=6;applyStoryView();});
  window.applyBlogStoryFilters=applyStoryView;
  applyStoryView();

  var fixtureBox=document.getElementById("next-fixture");
  if(fixtureBox){
    fetch("/data/next-fixture.json").then(function(response){
      if(!response.ok)throw new Error("Fixture data unavailable");
      return response.json();
    }).then(function(data){
      var title=typeof data.title==="string"&&data.title.trim()?data.title:"Next fixture: to be confirmed";
      var note=typeof data.note==="string"&&data.note.trim()?data.note:"Check the main club website for the latest fixtures.";
      fixtureBox.replaceChildren();
      var heading=document.createElement("strong");heading.textContent=title;
      var paragraph=document.createElement("p");paragraph.textContent=note;
      fixtureBox.append(heading,paragraph);
    }).catch(function(){/* Keep the safe HTML placeholder when data cannot be loaded. */});
  }

  document.querySelectorAll("[data-share-page]").forEach(function(el){
    var url=encodeURIComponent(window.location.href);
    var title=encodeURIComponent(document.title);
    if(el.matches("[data-share='facebook']"))el.href="https://www.facebook.com/sharer/sharer.php?u="+url;
    if(el.matches("[data-share='whatsapp']"))el.href="https://wa.me/?text="+title+"%20"+url;
    if(el.matches("[data-share='x']"))el.href="https://twitter.com/intent/tweet?text="+title+"&url="+url;
  });
  document.querySelectorAll("[data-share-copy]").forEach(function(button){
    button.addEventListener("click",async function(){
      var status=button.parentElement.querySelector(".share-copy-status");
      try{
        await navigator.clipboard.writeText(window.location.href);
        if(status)status.textContent="Link copied!";
      }catch(_){
        var field=document.createElement("textarea");
        field.value=window.location.href;
        field.setAttribute("readonly","");
        field.style.position="fixed";
        field.style.opacity="0";
        document.body.append(field);
        field.select();
        var copied=false;
        try{copied=document.execCommand("copy");}catch(__){}
        field.remove();
        if(status)status.textContent=copied?"Link copied!":"Copy failed. Please copy the page URL from your browser.";
      }
    });
  });
});