const toggle=document.querySelector(".menu-toggle");
const nav=document.querySelector(".main-nav");
if(toggle&&nav){
  toggle.addEventListener("click",()=>{
    const open=toggle.getAttribute("aria-expanded")==="true";
    toggle.setAttribute("aria-expanded",String(!open));
    nav.classList.toggle("is-open",!open);
  });
  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    toggle.setAttribute("aria-expanded","false");
    nav.classList.remove("is-open");
  }));
}
document.querySelectorAll("img[data-fallback]").forEach(img=>img.addEventListener("error",()=>img.style.display="none"));
const y=document.querySelector("#year");
if(y)y.textContent=new Date().getFullYear();

const hero=document.querySelector(".hero-home");
const crestTrigger=document.querySelector(".crest-trigger");
const crestCrossTrigger=document.querySelector(".crest-cross-trigger");
const crestMotion=document.querySelector(".hero-crest-motion");
let crestMotionTimer=null;
// GIF se přehraje přibližně 3,5 s a jeho poslední snímek zůstane ještě 2 s viditelný.
const crestMotionDuration=5500;

if(hero&&crestTrigger){
  crestTrigger.addEventListener("click",()=>{
    if(hero.classList.contains("is-crest-motion"))return;
    hero.classList.add("is-open");
    crestTrigger.setAttribute("aria-pressed","true");
    crestTrigger.disabled=true;
    if(crestCrossTrigger)crestCrossTrigger.disabled=true;
    window.setTimeout(()=>hero.classList.add("is-sharp"),4200);
  });
}

if(hero&&crestCrossTrigger&&crestMotion){
  crestCrossTrigger.addEventListener("click",event=>{
    event.preventDefault();
    event.stopPropagation();
    if(hero.classList.contains("is-open")||hero.classList.contains("is-crest-motion"))return;

    // Změna URL zajistí nové spuštění GIFu od prvního snímku při každém kliknutí.
    crestMotion.src="assets/images/erb_pohyb.gif?play="+Date.now();
    hero.classList.add("is-crest-motion");

    // Během přehrávání je statický erb skrytý; po dokončení se znovu zobrazí.
    window.clearTimeout(crestMotionTimer);
    crestMotionTimer=window.setTimeout(()=>{
      hero.classList.remove("is-crest-motion");
      crestCrossTrigger.disabled=false;
      crestMotion.src="assets/images/erb_pohyb.gif";
    },crestMotionDuration);
  });
}

const homeHero=document.querySelector(".hero-home");
const hotspotMap=[[".hotspot-town","has-town"],[".hotspot-citizen","has-citizen"],[".hotspot-tourist","has-tourist"]];
if(homeHero){
  const clearHighlights=()=>hotspotMap.forEach(([,name])=>homeHero.classList.remove(name));
  hotspotMap.forEach(([selector,className])=>{
    const hotspot=homeHero.querySelector(selector);
    if(!hotspot)return;
    hotspot.addEventListener("pointerenter",()=>{
      if(homeHero.classList.contains("is-open")){
        clearHighlights();
        homeHero.classList.add(className);
      }
    });
    hotspot.addEventListener("pointerleave",clearHighlights);
    hotspot.addEventListener("focus",()=>{
      if(homeHero.classList.contains("is-open")){
        clearHighlights();
        homeHero.classList.add(className);
      }
    });
    hotspot.addEventListener("blur",clearHighlights);
  });
}