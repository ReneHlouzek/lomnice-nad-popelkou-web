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
let crestHoldTimer=null;
const crestFinalFrameHold=2000;

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

    // Animovaný WebP přehrává přímo prohlížeč; rozměry i pozici dědí
    // z .crest-stage, tedy přesně z původního kruhu erbu.
    crestMotion.src="assets/images/easter_egg.webp";
    hero.classList.add("is-crest-motion");
    crestCrossTrigger.disabled=true;

    crestMotion.addEventListener("error",()=>{
      console.error("Animaci easter_egg.webp se nepodařilo načíst.");
      hero.classList.remove("is-crest-motion");
      crestCrossTrigger.disabled=false;
      crestMotion.removeAttribute("src");
    },{once:true});
  });
}

const homeHero=document.querySelector(".hero-home");
const hotspotMap=[[".hotspot-town","has-town"],[".hotspot-citizen","has-citizen"],[".hotspot-tourist","has-tourist"]];
if(homeHero){
  const clearHighlights=()=>hotspotMap.forEach(([,name])=>homeHero.classList.remove(name));
  const activateForTarget=target=>{
    if(!homeHero.classList.contains("is-open")||!homeHero.classList.contains("is-sharp"))return;
    const match=hotspotMap.find(([selector])=>target instanceof Element&&target.closest(selector));
    if(!match){clearHighlights();return;}
    clearHighlights();
    homeHero.classList.add(match[1]);
  };

  // Delegované události na hlavním obrazu jsou odolnější vůči změnám vrstev
  // a pořadí vykreslování jednotlivých tlačítek.
  homeHero.addEventListener("pointermove",event=>activateForTarget(event.target));
  homeHero.addEventListener("pointerleave",clearHighlights);
  homeHero.addEventListener("focusin",event=>activateForTarget(event.target));
  homeHero.addEventListener("focusout",event=>{
    if(!homeHero.contains(event.relatedTarget))clearHighlights();
  });
}