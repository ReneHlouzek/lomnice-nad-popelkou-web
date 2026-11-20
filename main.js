const toggle=document.querySelector(".menu-toggle");const nav=document.querySelector(".main-nav");if(toggle&&nav){toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));nav.classList.toggle("is-open",!open)});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{toggle.setAttribute("aria-expanded","false");nav.classList.remove("is-open")}));}document.querySelectorAll("img[data-fallback]").forEach(img=>img.addEventListener("error",()=>img.style.display="none"));const y=document.querySelector("#year");if(y)y.textContent=new Date().getFullYear();
const hero=document.querySelector(".hero-home");const crestTrigger=document.querySelector(".crest-trigger");if(hero&&crestTrigger){crestTrigger.addEventListener("click",()=>{hero.classList.add("is-open");crestTrigger.setAttribute("aria-pressed","true");});}
const homeHero=document.querySelector(".hero-home");
const hotspotMap=[[".hotspot-town","has-town"],[".hotspot-citizen","has-citizen"],[".hotspot-tourist","has-tourist"]];
if(homeHero){
 const hotspotArea=homeHero.querySelector(".quadrant-hotspots");
 const clearHighlights=()=>hotspotMap.forEach(([,name])=>homeHero.classList.remove(name));
 if(hotspotArea){
  hotspotArea.addEventListener("pointermove",event=>{
   if(!homeHero.classList.contains("is-open"))return;
   const rect=hotspotArea.getBoundingClientRect();
   const x=(event.clientX-rect.left)/rect.width*100;
   const y=(event.clientY-rect.top)/rect.height*100;
   const dx=x-50,dy=y-50;
   if(dx*dx+dy*dy>2500){clearHighlights();return;}
   const boundary=50+17*(1-Math.abs(dx)/50);
   clearHighlights();
   if(y<boundary)homeHero.classList.add("has-town");
   else if(x<50)homeHero.classList.add("has-citizen");
   else homeHero.classList.add("has-tourist");
  });
  hotspotArea.addEventListener("pointerleave",clearHighlights);
 }
 hotspotMap.forEach(([selector,className])=>{
  const hotspot=homeHero.querySelector(selector);
  if(hotspot){hotspot.addEventListener("focus",()=>{if(homeHero.classList.contains("is-open")){clearHighlights();homeHero.classList.add(className);}});hotspot.addEventListener("blur",clearHighlights);}
 });
}
