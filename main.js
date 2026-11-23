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
  crestCrossTrigger.addEventListener("click",async event=>{
    event.preventDefault();
    event.stopPropagation();
    if(hero.classList.contains("is-open")||hero.classList.contains("is-crest-motion"))return;

    hero.classList.add("is-crest-motion");
    crestCrossTrigger.disabled=true;
    window.clearTimeout(crestHoldTimer);

    try{
      // GIF dekódujeme na jednotlivé snímky, aby se přehrál přesně jednou.
      const {parseGIF,decompressFrames}=await import("https://code4fukui.github.io/gifuct-js/src/index.js");
      const response=await fetch("assets/images/erb_pohyb.gif",{cache:"no-store"});
      if(!response.ok)throw new Error("GIF se nepodařilo načíst.");
      const parsed=parseGIF(await response.arrayBuffer());
      const frames=decompressFrames(parsed,true);
      if(!frames.length)throw new Error("GIF neobsahuje žádné snímky.");

      const canvas=document.createElement("canvas");
      canvas.width=parsed.lsd.width;
      canvas.height=parsed.lsd.height;
      const context=canvas.getContext("2d");
      let index=0;
      let previousFrame=null;
      let restoreCanvas=null;

      const showNextFrame=()=>{
        if(previousFrame){
          if(previousFrame.disposalType===2){
            const d=previousFrame.dims;
            context.clearRect(d.left,d.top,d.width,d.height);
          }else if(previousFrame.disposalType===3&&restoreCanvas){
            context.putImageData(restoreCanvas,0,0);
          }
        }

        const frame=frames[index];
        if(frame.disposalType===3)restoreCanvas=context.getImageData(0,0,canvas.width,canvas.height);
        context.putImageData(new ImageData(new Uint8ClampedArray(frame.patch),frame.dims.width,frame.dims.height),frame.dims.left,frame.dims.top);
        crestMotion.src=canvas.toDataURL("image/png");
        previousFrame=frame;
        index++;

        if(index<frames.length){
          window.setTimeout(showNextFrame,Math.max(20,frame.delay||100));
        }else{
          // Poslední snímek zůstane nehybný celé dvě sekundy.
          crestHoldTimer=window.setTimeout(()=>{
            hero.classList.remove("is-crest-motion");
            crestCrossTrigger.disabled=false;
            crestMotion.src="assets/images/erb_pohyb.gif";
          },crestFinalFrameHold);
        }
      };
      showNextFrame();
    }catch(error){
      console.error("Animaci erbu se nepodařilo přehrát:",error);
      hero.classList.remove("is-crest-motion");
      crestCrossTrigger.disabled=false;
      crestMotion.src="assets/images/erb_pohyb.gif";
    }
  });
}

const homeHero=document.querySelector(".hero-home");
const hotspotMap=[[".hotspot-town","has-town"],[".hotspot-citizen","has-citizen"],[".hotspot-tourist","has-tourist"]];
if(homeHero){
  const clearHighlights=()=>hotspotMap.forEach(([,name])=>homeHero.classList.remove(name));
  hotspotMap.forEach(([selector,className])=>{
    const hotspot=homeHero.querySelector(selector);
    if(!hotspot)return;
    const activateHighlight=()=>{
      if(homeHero.classList.contains("is-open")){
        clearHighlights();
        homeHero.classList.add(className);
      }
    };
    // pointermove doplňuje pointerenter: po skončení rozostření se oblasti
    // zpřístupní kurzoru, který už může být nad jednou z nich.
    hotspot.addEventListener("pointerenter",activateHighlight);
    hotspot.addEventListener("pointermove",activateHighlight);
    hotspot.addEventListener("pointerleave",clearHighlights);
    hotspot.addEventListener("focus",activateHighlight);
    hotspot.addEventListener("blur",clearHighlights);
  });
}